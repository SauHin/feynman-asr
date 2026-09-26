# BINUS UNIVERSITY

| Metadata Ujian | Detail |
| :--- | :--- |
| **Academic Career** | Undergraduate / Master / Doctoral / Professional\*) |
| **Term / Period** | Odd / Even / Compact\*) \| Period (Only for Master): 1 / 2\*) |
| **Type of Assessment** | [ ] Mid Project &emsp; [x] Final Project |
| **Academic Year** | 2026/2027 |
| **Code – Course** | COMP6822001 / Speech Recognition |
| **Faculty / Dept.** | School of Computer Science / Computer Science |
| **AI Use Type\*** | Integrated / Partial / Flexible / Limited / Independent\*\* |

\*) *Strikethrough the unnecessary items*  
\*\*) *Onsite Exam Type should be Independent*

---

### AI Use Type Table

| AI Use Type | Descriptions | Sample Use |
| :--- | :--- | :--- |
| **Integrated** | AI use is part of the grading rubric and must be used according to the lecturer’s instructions. The type of AI, usage stages, and assessed aspects must be explicitly stated in the task description. Students may not use AI applications other than those required and must submit a declaration form. | AI-based final project, e.g., creating prompts, AI ethics evaluation, recommendation systems. |
| **Partial** | Students may use AI for up to 50% of the work process, including structure, idea development, or visualization. Usage must follow the course guidelines. Students must submit an AI use declaration form. | Video production, reflective vlog, exploratory essay, design work, final project. |
| **Flexible** | AI use in task creation is not regulated because it does not affect the assessed aspects of the task. If AI is used, students must submit a declaration. | Oral exams, venture pitching, class discussions, debates. |
| **Limited** | AI may only be used in the early stages (e.g., brainstorming or outlining) but not in final content writing or conclusions. Example: brainstorming topic ideas but not writing the final version. Students must submit an AI use declaration form. | Proposal writing, prototype-generating projects. |
| **Independent** | Students must complete the task without any AI assistance. All work must be entirely original. No declaration is required because AI use is strictly prohibited. Violations will be treated as academic integrity breaches. | Written exams. |

> **Important Notes:**  
> - Please submit the project on time through Exam Apps according to exam schedule.  
> - **The penalty for CHEATING is DROP OUT!**

---

## Learning Outcomes

- **LO-1:** Explain the fundamental of speech recognition.
- **LO-2:** Execute proper speech recognition experiments workflow.
- **LO-3:** Analyze the strengths and weaknesses of a system that utilizes speech technology.
- **LO-4:** Construct speech recognition system to solve real problems.

---

# COMP6822001 — Speech Recognition
## FINAL PROJECT: Building a Real-Time Speech Recognition Application

### Deliverables:
1. **Working Real-Time Application**
2. **Technical Report**

---

## 1. Project Description

Pada final project ini, mahasiswa diminta untuk merancang, membangun, menguji, dan mengevaluasi aplikasi Speech Recognition secara *real-time* untuk menyelesaikan suatu permasalahan nyata bagi target pengguna yang jelas.

Aplikasi harus menggunakan Speech Recognition model yang dijalankan secara lokal, tanpa menggunakan external Speech Recognition API.

Project harus menghasilkan sebuah aplikasi yang:
- Menerima input suara secara real-time;
- Memproses suara menggunakan local Speech Recognition model;
- Menghasilkan transkripsi secara real-time;
- Ditujukan kepada target user yang nyata dan teridentifikasi;
- Telah diuji oleh target user;
- Mendapatkan feedback dari target user; dan
- Menggunakan hasil user testing dan feedback tersebut sebagai bagian dari evaluasi dalam Technical Report.

---

## 2. Learning Outcomes

Final project ini mengukur:
- **LO-1:** Explain the fundamental of speech recognition.
- **LO-2:** Execute proper speech recognition experiments workflow.
- **LO-3:** Analyze the strengths and weaknesses of a system that utilizes speech technology.
- **LO-4:** Construct speech recognition system to solve real problems.

---

## 3. Definition of Real-Time Speech Recognition

Dalam project ini, real-time speech recognition didefinisikan sebagai:

> *A speech recognition system that processes incoming speech continuously while the user is speaking and produces partial or updated transcription with low latency, without requiring the user to finish recording and upload the complete audio before transcription begins.*

Dengan demikian, aplikasi **tidak dianggap real-time** apabila workflow-nya:

```
Speak
  ↓
Stop Recording
  ↓
Upload/Process Complete Audio
  ↓
Wait
  ↓
Transcript
```

Sebaliknya, aplikasi yang memenuhi requirement real-time harus memiliki workflow seperti:

```
User starts speaking
        ↓
Audio stream captured
        ↓
Continuous processing
        ↓
Partial transcription
        ↓
Updated transcription
        ↓
User continues speaking
```

### Contoh Skenario:
- **User:** `"Good morning everyone, today we..."`  
  **Application:** `"Good morning..."`
- **User:** `"...will discuss speech recognition."`  
  **Application:** `"Good morning everyone, today we will discuss speech recognition."`

*Transcription harus mulai muncul ketika speech sedang berlangsung, bukan hanya setelah seluruh rekaman selesai.*

### Operational Requirement
Untuk keperluan project ini, sistem minimal harus:
- Menerima audio secara *continuous/streaming*;
- Melakukan *inference* selama speech berlangsung;
- Menghasilkan *partial/intermediate transcription*;
- Memperbarui transcription ketika speech berikutnya diterima;
- Tidak membutuhkan complete audio recording sebelum proses transcription dimulai.

Mahasiswa juga harus menjelaskan *latency* atau *responsiveness* sistem dalam laporan.

---

## 4. Real-World Problem Requirement

Project harus menyelesaikan permasalahan nyata, bukan sekadar membuat demo Speech-to-Text.

Mahasiswa harus dapat menjawab:
> *Who will use this application, what problem do they have, and how does the application help them?*

Project proposal harus menjelaskan:
- **Target User:** Siapa pengguna aplikasi?  
  *Contoh:* university lecturers, students, journalists, customer service agents, meeting participants, content creators, people who need accessibility support, field workers, administrative staff.
- **User Problem:** Apa masalah yang dialami target user?
- **Proposed Solution:** Bagaimana aplikasi Speech Recognition membantu menyelesaikan masalah tersebut?
- **Usage Scenario:** Dalam kondisi apa aplikasi akan digunakan?

---

## 5. Target User Must Be Real

Target user tidak boleh hanya berupa asumsi.

- **Contoh yang tidak cukup:**  
  *“Our target users are students.”*
- **Contoh yang lebih konkret:**  
  *“The target users are university students who need real-time lecture transcription to help them review spoken explanations during class.”*

Lebih baik lagi apabila mahasiswa dapat mengidentifikasi kelompok pengguna yang benar-benar dapat ditemui dan diuji. Target user harus relevan dengan problem yang dipilih.

---

## 6. User Testing Requirement

Setiap project wajib melakukan user testing terhadap target user yang telah ditentukan. User testing dilakukan setelah aplikasi mencapai kondisi yang dapat digunakan.

Tujuan user testing adalah untuk mengetahui:
- Apakah aplikasi benar-benar membantu user;
- Apakah aplikasi mudah digunakan;
- Apakah transcription cukup responsive;
- Apakah output dapat dipahami;
- Apa masalah yang dialami user; dan
- Apa improvement yang dibutuhkan.

### Minimum User Testing
Mahasiswa harus melakukan testing terhadap **minimal 5 target users**.  
Apabila project memiliki target user yang sangat spesifik dan sulit direkrut, jumlah tersebut dapat disesuaikan berdasarkan persetujuan dosen. User yang diuji harus sesuai dengan target user yang ditentukan dalam project.

---

## 7. User Testing Procedure

User testing minimal harus mencakup:

1. **Task:** Berikan user beberapa task yang realistis.  
   *Contoh:*  
   - “Use the application to transcribe a short lecture explanation.”  
   - “Use the application during a simulated meeting and review the resulting transcription.”
2. **Observation:** Catat bagaimana user menggunakan aplikasi.
3. **User Feedback:** Kumpulkan feedback dari user melalui:
   - Questionnaire
   - Interview
   - Rating scale
   - Short survey
   - Structured feedback form
4. **Analysis:** Analisis feedback dan identifikasi:
   - Usability problems
   - Recognition problems
   - Latency problems
   - Confusing interaction
   - Useful features
   - Missing features
   - Overall user satisfaction

---

## 8. User Testing Data

Laporan harus menyertakan hasil user testing.

**Contoh Tabel Hasil Testing:**

| User | Ease of Use | Responsiveness | Transcription Quality | Overall Satisfaction |
| :---: | :---: | :---: | :---: | :---: |
| U1 | 4/5 | 4/5 | 4/5 | 4/5 |
| U2 | 5/5 | 4/5 | 4/5 | 5/5 |
| U3 | 4/5 | 3/5 | 4/5 | 4/5 |
| U4 | 4/5 | 4/5 | 3/5 | 4/5 |
| U5 | 5/5 | 5/5 | 4/5 | 5/5 |

Kemudian berikan analisis.  
*Contoh:*  
> *Most users considered the application easy to use. However, three users reported that transcription updates became noticeably slower when speaking continuously for a long period.*

---

## 9. User Review Must Be Included in the Report

User feedback tidak boleh hanya dikumpulkan tetapi tidak digunakan. Mahasiswa harus menghubungkan feedback dengan evaluasi sistem.

### Contoh Keterkaitan:
- **User feedback:** Users reported that technical terms were frequently transcribed incorrectly.
- **System evaluation:** WER analysis also shows a higher error rate for domain-specific terminology.
- **Interpretation:** The quantitative evaluation and user feedback indicate that domain-specific vocabulary is one of the major weaknesses of the current system.

### Alur Evaluasi:
```
System Testing + User Testing
              ↓
      Combined Evaluation
              ↓
    Strengths & Weaknesses
              ↓
  Improvement Recommendations
```

---

## 10. Application Requirements

Aplikasi minimal harus memiliki:
- **Input:** Continuous microphone / audio stream.
- **Processing:**
  - Audio streaming
  - Preprocessing
  - Local Speech Recognition inference
  - Partial transcription
- **Output:** Real-time transcription displayed to the user.

### Contoh Interface:
```text
┌──────────────────────────────────────────┐
│       REAL-TIME SPEECH RECOGNITION       │
├──────────────────────────────────────────┤
│                                          │
│             ● Recording                  │
│                                          │
│  "Good morning everyone, today we will   │
│   discuss speech recognition..."         │
│                                          │
│                                          │
│  Latency: 0.8 s                          │
│  Status: Listening                       │
│                                          │
│           [ Stop ]                       │
└──────────────────────────────────────────┘
```

---

## 11. External API Restriction

**External Speech Recognition API is NOT allowed.**  
Tidak diperbolehkan menggunakan external service untuk melakukan Speech Recognition inference.

- **Contoh yang TIDAK diperbolehkan:**
  - Google Speech-to-Text API
  - Microsoft Azure Speech
  - Amazon Transcribe
  - OpenAI Speech API
  - AssemblyAI
  - Layanan Speech Recognition external lainnya.
  
  *Speech Recognition harus dijalankan secara lokal.*

- **Allowed (Diperbolehkan):**
  - Pretrained ASR models
  - Open-source ASR models
  - Hugging Face models
  - PyTorch
  - TensorFlow
  - ONNX
  - torchaudio
  - librosa
  - FFmpeg
  - Framework / library pendukung lainnya.

---

## 12. Experimental Evaluation

Selain user testing, mahasiswa wajib melakukan *technical evaluation* terhadap sistem.

Minimal terdapat:
- **Baseline:** Kondisi normal sistem.
- **Experimental Condition:** Minimal satu kondisi yang memengaruhi Speech Recognition.

**Contoh Eksperimen:**

| Experiment | Condition |
| :--- | :--- |
| **Baseline** | Clean speech |
| **E1** | Background noise |
| **E2** | Different speakers |
| **E3** | Different speaking speed |
| **E4** | Different microphone |
| **E5** | Different accent |
| **E6** | Different audio quality |

*Pilih eksperimen yang paling relevan dengan masalah aplikasi.*

---

## 13. Quantitative Evaluation

Minimal gunakan **Word Error Rate (WER)**:

$$WER = \frac{S + D + I}{N}$$

Dimana:
- $S$ = Substitutions
- $D$ = Deletions
- $I$ = Insertions
- $N$ = Number of words in the reference

Mahasiswa juga harus mengukur aspek real-time yang relevan, misalnya:
- Transcription latency
- Response time
- Processing delay
- Real-time factor
- Throughput

*Tidak semua metric harus digunakan. Pilih metric yang sesuai dengan sistem.*  
Yang terpenting, mahasiswa dapat menjawab:
1. **How accurate is the system?**
2. **How responsive is the system?**

---

## 14. Error Analysis

Analisis minimal harus mencakup beberapa contoh kesalahan transcription.

| Reference | System Output | Error Type |
| :--- | :--- | :--- |
| speech recognition | speech recognition | Correct |
| machine learning | machine learning | Correct |
| artificial intelligence | artificial intelligent | Substitution |
| natural language processing | natural processing | Deletion |

Identifikasi pola error, misalnya:
- Technical terms
- Proper nouns
- Accents
- Noisy speech
- Fast speech
- Overlapping speech
- Pronunciation
- Low-quality audio

---

## 15. Technical Report Structure

Gunakan struktur berikut:

1. **Introduction**
   - Background
   - Real-world problem
   - Target user
   - User problem
   - Problem statement
   - Project objectives
   - Project scope
2. **Speech Recognition Fundamentals**
   - Speech Recognition concepts
   - Speech processing
   - Speech Recognition pipeline
   - Selected model
   - Model architecture
   - Local inference
   - Relevant algorithms
   - Model limitations
3. **System Design**
   - System architecture
   - Data flow
   - Audio streaming
   - Preprocessing
   - Local ASR model
   - Inference pipeline
   - Real-time transcription
   - Application interface
4. **Implementation**
   - Development environment
   - Hardware
   - Software
   - Frameworks/libraries
   - Model
   - Application implementation
   - Technical decisions
5. **Technical Experiment**
   - Dataset/audio samples
   - Experimental design
   - Baseline
   - Experimental conditions
   - Evaluation metrics
   - Results
   - WER/CER
   - Latency/responsiveness
   - Error analysis
6. **User Testing**
   - Target users
   - Number of users
   - User characteristics relevant to the application
   - Testing scenario
   - Tasks
   - Testing procedure
   - Questionnaire/interview method
   - User feedback
   - User evaluation results
7. **Discussion**
   - Gabungkan hasil technical evaluation dan user testing
   - Bahas:
     - System strengths
     - System weaknesses
     - Recognition errors
     - Latency
     - Usability
     - User satisfaction
     - Problems identified by users
     - Limitations
     - Potential improvements
8. **Conclusion**
   - Main findings
   - Achievement of project objectives
   - System performance
   - User testing findings
   - Main limitations
   - Future improvements

---

## 16. Required Evidence

Technical Report harus memberikan bukti bahwa project benar-benar dilakukan. Minimal sertakan:
- Screenshot aplikasi;
- System architecture diagram;
- Experimental results;
- Transcription examples;
- WER/evaluation results;
- Latency measurement;
- User testing results;
- User feedback;
- Analysis of feedback.

---

## 17. Deliverables

Hanya terdapat dua deliverables utama:
1. **Working Real-Time Application**  
   Aplikasi harus:
   - Dapat dijalankan;
   - Menerima speech secara real-time;
   - Melakukan local inference;
   - Menghasilkan partial/updated transcription;
   - Memiliki target user yang jelas;
   - Menyelesaikan real-world problem.
2. **Technical Report**  
   Report harus mencakup:
   - Fundamental;
   - System design;
   - Implementation;
   - Technical experiments;
   - Quantitative evaluation;
   - Error analysis;
   - User testing;
   - User feedback;
   - Strengths and weaknesses;
   - Conclusion.

---

## 18. Assessment Rubric

**Total: 100 points**

| Component | Weight | LO |
| :--- | :---: | :---: |
| Speech Recognition Fundamentals | 15% | LO-1 |
| Experimental Workflow & Technical Evaluation | 20% | LO-2 |
| System Analysis & User Evaluation | 20% | LO-3 |
| Real-Time Speech Recognition Application | 30% | LO-4 |
| Real-World Problem & Target User | 5% | LO-4 |
| AI Usage, Verification & Reflection | 10% | LO-1, LO-2, LO-3, LO-4 |
| **Total** | **100%** | |

### Performance Criteria

| Criterion | Excellent (90–100) | Good (80–89) | Satisfactory (70–79) | Limited (60–69) | Poor (<60) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Fundamentals** | Explains Speech Recognition concepts accurately and connects them deeply to the implemented system | Accurate explanation with minor gaps | Basic understanding with limited depth | Incomplete or several conceptual errors | Unable to explain core concepts |
| **Experimentation** | Rigorous, systematic, reproducible experiments with appropriate metrics | Systematic experiments with minor limitations | Functional but limited experimental design | Incomplete or weakly justified | No meaningful experiment |
| **System Analysis & User Evaluation** | Combines technical results and user feedback to provide rigorous analysis of strengths, weaknesses, and limitations | Strong analysis with minor gaps | Basic analysis with limited interpretation | Mostly descriptive | Little/no meaningful analysis |
| **Real-Time Application** | Fully functional real-time local ASR application with strong responsiveness and reliable transcription | Functional real-time system with minor limitations | Functional but limited in robustness or responsiveness | Partially real-time or unstable | No functional real-time application |
| **Real-World Problem & Target User** | Clearly defined real problem, well-identified target users, and strong evidence of user relevance | Clear problem and target users with reasonable validation | Problem is relevant but user validation is limited | Weak connection between system and user | No clear real-world problem/user |

---

## 19. Project Success Criteria

Sebuah project dianggap memenuhi final project apabila:
- [x] Memiliki real-world problem
- [x] Memiliki target user yang nyata
- [x] Membangun aplikasi Speech Recognition
- [x] Bekerja secara real-time
- [x] Menggunakan local Speech Recognition inference
- [x] Tidak menggunakan external Speech Recognition API
- [x] Melakukan technical evaluation
- [x] Melakukan user testing
- [x] Menggunakan target user yang relevan
- [x] Mengumpulkan user feedback
- [x] Memasukkan hasil user testing ke dalam report
- [x] Menganalisis strengths dan weaknesses sistem

---

## 20. Final Project Philosophy

Final project ini bukan sekadar membuat aplikasi Speech-to-Text. Project yang baik harus menunjukkan:

> *“A real user has a real problem, and you built a real-time speech recognition system to address that problem, tested it technically, tested it with real users, and critically evaluated its strengths and limitations.”*

Dengan demikian, keseluruhan project mengikuti alur:

```
REAL PROBLEM
     ↓
REAL TARGET USER
     ↓
SYSTEM DESIGN
     ↓
REAL-TIME ASR APPLICATION
     ↓
TECHNICAL TESTING
     ↓
USER TESTING
     ↓
USER FEEDBACK
     ↓
SYSTEM ANALYSIS
     ↓
CONCLUSION & IMPROVEMENT
```

> **The goal is not simply to make Speech Recognition work.**  
> **The goal is to understand whether it works, for whom it works, under what conditions it fails, and whether it actually solves a real problem.**

---

## 21. Use of AI in the Project

AI tools are allowed and encouraged in the development of this project.

Mahasiswa diperbolehkan menggunakan berbagai AI tools untuk membantu proses:
- Brainstorming dan ideation;
- Problem definition;
- Literature exploration;
- System design;
- Programming;
- Debugging;
- Documentation;
- Testing;
- Data analysis;
- Writing and editing;
- User interface development;
- Dan aktivitas lain yang relevan.

**Contoh AI tools yang dapat digunakan:**
- AI coding assistants;
- Large Language Models (LLMs);
- Generative AI tools;
- AI-based development assistants;
- AI tools untuk analisis data dan dokumentasi.

Namun, penggunaan AI tidak berarti mahasiswa menyerahkan proses berpikir dan pengambilan keputusan kepada AI. Mahasiswa tetap bertanggung jawab penuh terhadap:
- Correctness aplikasi;
- Architecture dan implementation;
- Experimental design;
- Evaluation;
- Analysis;
- Interpretation;
- Dan seluruh isi laporan.

### 21.1 AI Use Must Be Transparent
Setiap penggunaan AI yang material terhadap project harus didokumentasikan. Mahasiswa harus menjelaskan:
- AI tool yang digunakan;
- Tujuan penggunaan;
- Bagian project yang dibantu AI;
- Bagaimana output AI digunakan;
- Bagaimana output AI diverifikasi;
- Perubahan atau keputusan yang dibuat oleh mahasiswa setelah menggunakan AI.

**Contoh Dokumentasi:**

| AI Tool | Purpose | Used For | Verification |
| :--- | :--- | :--- | :--- |
| LLM | Coding assistance | Audio streaming module | Tested using multiple audio inputs |
| AI coding assistant | Debugging | Real-time inference issue | Verified through latency testing |
| LLM | Documentation | Initial report draft | Rewritten and verified by student |
| LLM | Data analysis assistance | WER interpretation | Cross-checked with experimental results |

### 21.2 AI Usage Log
Setiap project wajib menyertakan AI Usage Log di dalam Technical Report.

**Format Minimal:**

| No. | AI Tool | Purpose | Prompt/Instruction Summary | Output Used | Student Verification |
| :---: | :--- | :--- | :--- | :--- | :--- |
| 1 | LLM | Generate initial architecture | Asked for possible ASR architecture | Partially used | Architecture tested and modified |
| 2 | Coding AI | Debug streaming code | Asked to identify audio buffer issue | Used | Tested with live microphone |
| 3 | LLM | Analyze errors | Asked to categorize transcription errors | Used as initial analysis | Compared with actual results |

*Tidak perlu memasukkan seluruh percakapan dengan AI. Namun, mahasiswa harus memberikan informasi yang cukup untuk menunjukkan bagaimana AI digunakan dalam proses pengerjaan.*

### 21.3 AI Does Not Replace Understanding
Mahasiswa harus mampu menjelaskan bagian penting dari project yang dibangun dengan bantuan AI.

Pada saat evaluation/demo, mahasiswa dapat diminta untuk menjelaskan:
- Bagaimana Speech Recognition model bekerja;
- Mengapa model tersebut dipilih;
- Bagaimana audio streaming dilakukan;
- Bagaimana real-time inference dilakukan;
- Bagaimana latency diukur;
- Bagaimana WER dihitung;
- Mengapa hasil eksperimen seperti itu;
- Mengapa architectural decisions tertentu dibuat;
- Dan bagaimana kode yang dihasilkan AI bekerja.

*Kode yang dihasilkan AI tetapi tidak dapat dijelaskan oleh mahasiswa tetap menjadi tanggung jawab mahasiswa.*

### 21.4 AI Verification
Output AI tidak boleh langsung dianggap benar. Mahasiswa harus menunjukkan bahwa output AI telah diverifikasi secara empiris atau teknis.

**Contoh:**
> *AI suggested using a particular audio buffering strategy. The student implemented the approach, tested it under different speech conditions, measured latency, and modified the implementation based on the results.*

Dengan demikian, penggunaan AI harus mengikuti prinsip:

```
AI Suggestion
      ↓
Student Evaluation
      ↓
Implementation
      ↓
Testing
      ↓
Verification
      ↓
Final Decision
```

*Bukan:*
```
AI Output ──► Copy ──► Submit
```

### 21.5 AI Assessment
Penggunaan AI akan menjadi bagian dari penilaian final project.

**AI Usage & Critical Evaluation: 10%**

| Criterion | Excellent (90–100) | Good (80–89) | Satisfactory (70–79) | Limited (60–69) | Poor (<60) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **AI Usage & Transparency** | AI digunakan secara efektif, transparan, terdokumentasi, dan output diverifikasi secara sistematis | AI usage documented and generally well verified | AI usage documented but verification is limited | Limited documentation or unclear AI contribution | AI usage is hidden, undocumented, or cannot be explained |
| **Critical Use of AI** | Student critically evaluates AI output, identifies errors/limitations, and makes informed decisions | Student evaluates AI output with minor gaps | Student primarily accepts AI suggestions with limited evaluation | Little evidence of critical evaluation | Student cannot explain or evaluate AI-generated work |

*Bobot ini termasuk dalam keseluruhan assessment final project dan tidak menjadi nilai tambahan.*

### 21.6 AI and Academic Integrity
Penggunaan AI bukan merupakan academic misconduct selama digunakan sesuai dengan ketentuan project dan dilaporkan secara transparan.

Namun, hal berikut **TIDAK diperbolehkan**:
- Mengklaim pekerjaan AI sebagai hasil pemikiran sendiri tanpa disclosure;
- Menggunakan AI untuk menghasilkan hasil eksperimen yang tidak pernah dilakukan;
- Membuat atau memalsukan user testing;
- Membuat data pengguna fiktif dan menyatakan bahwa data tersebut berasal dari real users;
- Membuat hasil WER atau evaluation metrics yang tidak benar-benar diperoleh;
- Membuat klaim performa sistem tanpa evidence;
- Menggunakan AI untuk membuat laporan seolah-olah eksperimen telah dilakukan padahal tidak dilakukan.

> **Fabricated experiment results or fabricated user feedback are considered serious academic misconduct.**

### 21.7 AI and User Testing
AI dapat digunakan untuk membantu:
- Membuat questionnaire;
- Menyusun interview questions;
- Mengelompokkan feedback;
- Membantu menganalisis qualitative feedback.

Namun, **AI tidak boleh menggantikan real users.** Jika project membutuhkan lima users, mahasiswa harus benar-benar melakukan testing terhadap lima users yang sesuai dengan target user.

AI-generated:
- User responses;
- User reviews;
- Interview transcripts;
- Questionnaire responses;
- Testing results;
*tidak dapat digunakan sebagai pengganti data user testing yang sebenarnya.*

### 21.8 AI Declaration
Pada bagian akhir Technical Report, mahasiswa wajib memberikan deklarasi:

> #### AI Usage Declaration (Jika Menggunakan AI)
> *"I acknowledge that AI tools were used during the development of this project. I have disclosed the relevant AI tools and their purposes in the AI Usage Log. I remain responsible for the correctness of the application, experimental results, analysis, user testing, and conclusions presented in this report."*

Jika mahasiswa tidak menggunakan AI, mahasiswa tetap harus menyatakan:

> #### AI Usage Declaration (Jika Tidak Menggunakan AI)
> *"No generative AI or AI-assisted development tools were used substantially in the development of this project."*

### 21.9 Principle of AI Use
Prinsip utama penggunaan AI dalam project ini adalah:

> **“AI may assist your work, but AI cannot replace your understanding, experimentation, or responsibility.”**

Penilaian tidak berfokus pada berapa banyak AI yang digunakan, tetapi pada:
> **How effectively, critically, transparently, and responsibly you use AI.**

- Mahasiswa yang menggunakan AI secara ekstensif tetapi mampu memahami hasilnya, memverifikasi output, menemukan kesalahan AI, melakukan eksperimen sendiri, dan mengambil keputusan teknis secara mandiri dapat memperoleh nilai yang tinggi.
- Sebaliknya, mahasiswa yang menghasilkan aplikasi/laporan dengan AI tetapi tidak memahami bagaimana sistem bekerja atau tidak dapat mempertanggungjawabkan hasilnya akan memperoleh nilai rendah.