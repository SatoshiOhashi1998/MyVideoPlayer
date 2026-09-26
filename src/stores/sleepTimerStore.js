import { create } from 'zustand'

export const useSleepTimerStore = create((set, get) => ({
  timerSeconds: null,
  timerStartTime: null,
  timerEndTime: null,
  timerId: null,

  startTimer: (seconds) => {
    get().clearTimer()

    const startTime = Date.now()
    const endTime = startTime + seconds * 1000

    set({
      timerSeconds: seconds,
      timerStartTime: startTime,
      timerEndTime: endTime,
    })

    const timerId = window.setInterval(() => {
      const currentEndTime = get().timerEndTime
      if (!currentEndTime) return

      const remainingSeconds = Math.ceil(
        (currentEndTime - Date.now()) / 1000,
      )

      if (remainingSeconds <= 0) {
        const currentTimerId = get().timerId
        if (currentTimerId) window.clearInterval(currentTimerId)

        set({
          timerId: null,
          timerSeconds: 0,
        })
        return
      }

      set({ timerSeconds: remainingSeconds })
    }, 1000)

    set({ timerId })
  },

  clearTimer: () => {
    const { timerId } = get()
    if (timerId) window.clearInterval(timerId)

    set({
      timerId: null,
      timerSeconds: null,
      timerStartTime: null,
      timerEndTime: null,
    })
  },
}))
