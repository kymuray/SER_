export type Appointment = {
  date: string
  time: string
  status: string
  title: string
  location: string
  durationMinutes: number
}

const STORAGE_KEY = 'ser_demo_appointment'

export function saveAppointment(appointment: Appointment): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appointment))
}

export function getAppointment(): Appointment | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)

    if (!stored) return null

    return JSON.parse(stored) as Appointment
  } catch {
    return null
  }
}

export function removeAppointment(): void {
  localStorage.removeItem(STORAGE_KEY)
}
