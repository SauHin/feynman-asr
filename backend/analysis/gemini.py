"""Analisis isi penjelasan dengan Gemini setelah Stop (PLAN 7.3, panggilan 2).

Skema output sama dengan frontend/src/types/feedback.ts. Kalau Gemini tetap gagal setelah percobaan
ulang, pemanggil menampilkan feedback lokal saja (metrik kelancaran dan transkrip).
"""
import os
import time
from pathlib import Path
from typing import Literal

import httpx
from dotenv import load_dotenv
from google import genai
from google.genai import errors, types
from pydantic import BaseModel, Field, ValidationError

import config

load_dotenv(Path(__file__).resolve().parents[2] / ".env")


class Concept(BaseModel):
    id: str
    name: str
    aliases: list[str] = []
    description: str = ""


class Fluency(BaseModel):
    duration: float
    wpm: float
    filler_count: int
    long_pauses: list[dict] = []


class Session(BaseModel):
    """Hasil satu sesi dari layar live. Batas panjang hanya penjaga supaya prompt tidak membengkak."""

    topic: str = Field(max_length=200)
    concepts: list[Concept] = Field(max_length=50)
    transcript: str = Field(max_length=50_000)
    fluency: Fluency


class Coverage(BaseModel):
    concept_id: str
    status: Literal["not_covered", "mentioned", "explained_correct", "explained_incorrect"]
    evidence: list[str]


class FactualError(BaseModel):
    statement: str
    correction: str


class Jargon(BaseModel):
    term: str
    evidence: str


class Feedback(BaseModel):
    concept_coverage: list[Coverage]
    factual_errors: list[FactualError]
    unexplained_jargon: list[Jargon]
    strengths: list[str]
    improvements: list[str]
    simplicity_note: str


class GeminiError(Exception):
    """Gemini gagal setelah semua percobaan. Pesannya ditampilkan apa adanya di log server."""


PROMPT = """Kamu menilai penjelasan lisan seorang mahasiswa Computer Science yang belajar dengan metode Feynman:
ia menjelaskan satu topik dengan kata-katanya sendiri, seolah ke teman.

Topik: {topic}

Daftar konsep (id | nama | alias | deskripsi):
{concepts}

Metrik kelancaran: durasi {duration:.0f} detik, {wpm:.0f} kata per menit, {fillers} filler, {pauses} jeda panjang.

Transkrip:
\"\"\"
{transcript}
\"\"\"

Aturan:
1. Transkrip ini hasil speech recognition otomatis, jadi istilah teknis bisa salah tulis (misalnya "octave layer"
   untuk "output layer", atau "width" untuk "weight"), dan kata yang bunyinya mirip bisa tertukar (misalnya "besar"
   jadi "benar"). Jangan anggap salah tulis seperti itu sebagai salah paham. Kalau satu kata membuat kalimat
   berlawanan dengan konteks di sekitarnya, anggap itu salah dengar, bukan factual error. Jangan sarankan
   memperbaiki pengucapan atau artikulasi.
2. Setiap penilaian harus didukung kutipan persis dari transkrip.
3. concept_coverage berisi tepat satu entri untuk setiap id di daftar konsep, dengan status:
   - not_covered: tidak dibahas sama sekali (evidence kosong),
   - mentioned: disebut tapi tidak dijelaskan,
   - explained_correct: dijelaskan dengan benar,
   - explained_incorrect: dijelaskan, tapi ada yang keliru.
4. factual_errors berisi pernyataan yang keliru secara konsep beserta koreksinya. unexplained_jargon berisi istilah
   teknis yang dipakai tanpa dijelaskan. Kalau tidak ada, kembalikan list kosong.
5. strengths dan improvements masing-masing 2–3 poin yang konkret dan merujuk ke isi penjelasannya.
6. simplicity_note: satu atau dua kalimat tentang seberapa mudah penjelasan ini dipahami orang awam.
7. Tulis dalam bahasa Indonesia yang santai dan singkat, sapa penjelasnya dengan "kamu". Istilah teknis tetap
   dalam bahasa Inggris.
"""


def prompt(s: Session) -> str:
    concepts = "\n".join(f"{c.id} | {c.name} | {', '.join(c.aliases) or '-'} | {c.description}" for c in s.concepts)
    return PROMPT.format(
        topic=s.topic, concepts=concepts, duration=s.fluency.duration, wpm=s.fluency.wpm,
        fillers=s.fluency.filler_count, pauses=len(s.fluency.long_pauses), transcript=s.transcript,
    )


def complete(fb: Feedback, concepts: list[Concept]) -> Feedback:
    """Tepat satu status untuk setiap konsep: id yang tidak dikenal dibuang, konsep yang terlewat jadi not_covered."""
    found = {c.concept_id: c for c in fb.concept_coverage}
    fb.concept_coverage = [found.get(c.id) or Coverage(concept_id=c.id, status="not_covered", evidence=[])
                           for c in concepts]
    return fb


def analyze(s: Session) -> Feedback:
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        raise GeminiError("GEMINI_API_KEY belum diisi di .env")
    client = genai.Client(
        api_key=key,
        http_options=types.HttpOptions(
            timeout=int(config.GEMINI_TIMEOUT_S * 1000),
            retry_options=types.HttpRetryOptions(attempts=1),  # percobaan ulang diatur di bawah, bukan oleh SDK
        ),
    )
    settings = types.GenerateContentConfig(
        response_mime_type="application/json", response_schema=Feedback, temperature=config.GEMINI_TEMPERATURE
    )
    for attempt in range(config.GEMINI_ATTEMPTS):
        try:
            r = client.models.generate_content(model=config.GEMINI_MODEL, contents=prompt(s), config=settings)
            return complete(Feedback.model_validate_json(r.text or ""), s.concepts)
        except (errors.APIError, ValidationError, httpx.TransportError) as e:
            # Kunci API salah atau permintaan ditolak (4xx selain 429) tidak membaik dengan dicoba ulang.
            retry = not isinstance(e, errors.APIError) or e.code == 429 or e.code >= 500
            if not retry or attempt == config.GEMINI_ATTEMPTS - 1:
                raise GeminiError(f"{type(e).__name__}: {e}") from e
            time.sleep(config.GEMINI_BACKOFF_S * 2**attempt)
