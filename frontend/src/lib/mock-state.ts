import { useSearchParams } from 'react-router'

// Keadaan mock yang dipilih lewat ?keadaan=..., supaya setiap keadaan bisa ditinjau.
export function useMockState<T extends string>(options: readonly T[]): T {
  const [params] = useSearchParams()
  const value = params.get('keadaan') as T | null
  return value && options.includes(value) ? value : options[0]
}
