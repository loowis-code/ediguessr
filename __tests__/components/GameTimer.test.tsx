import { render, screen, act } from '@testing-library/react'
import GameTimer from '@/components/GameTimer'

// Mock setTimeout/setInterval
jest.useFakeTimers()

describe('GameTimer Component', () => {
  it('should render initial time correctly', () => {
    const onTimeUpdate = jest.fn()
    const onTimeUp = jest.fn()

    render(
      <GameTimer
        timeLimit={120}
        onTimeUpdate={onTimeUpdate}
        onTimeUp={onTimeUp}
      />
    )

    expect(screen.getByText('2:00')).toBeInTheDocument()
  })

  it('should count down over time', () => {
    const onTimeUpdate = jest.fn()
    const onTimeUp = jest.fn()

    render(
      <GameTimer
        timeLimit={120}
        onTimeUpdate={onTimeUpdate}
        onTimeUp={onTimeUp}
      />
    )

    // Fast forward 1 second
    act(() => {
      jest.advanceTimersByTime(1000)
    })

    expect(onTimeUpdate).toHaveBeenCalledWith(119)
  })

  it('should call onTimeUp when timer reaches 0', () => {
    const onTimeUpdate = jest.fn()
    const onTimeUp = jest.fn()

    render(
      <GameTimer
        timeLimit={3}
        onTimeUpdate={onTimeUpdate}
        onTimeUp={onTimeUp}
      />
    )

    // Fast forward 3 seconds
    act(() => {
      jest.advanceTimersByTime(3000)
    })

    expect(onTimeUp).toHaveBeenCalled()
  })

  it('should format time correctly with minutes and seconds', () => {
    const onTimeUpdate = jest.fn()
    const onTimeUp = jest.fn()

    render(
      <GameTimer
        timeLimit={125}
        onTimeUpdate={onTimeUpdate}
        onTimeUp={onTimeUp}
      />
    )

    expect(screen.getByText('2:05')).toBeInTheDocument()
  })

  it('should reset timer when timeLimit prop changes', () => {
    const onTimeUpdate = jest.fn()
    const onTimeUp = jest.fn()

    const { rerender } = render(
      <GameTimer
        timeLimit={120}
        onTimeUpdate={onTimeUpdate}
        onTimeUp={onTimeUp}
      />
    )

    // Fast forward 5 seconds
    act(() => {
      jest.advanceTimersByTime(5000)
    })

    // Change timeLimit
    rerender(
      <GameTimer
        timeLimit={60}
        onTimeUpdate={onTimeUpdate}
        onTimeUp={onTimeUp}
      />
    )

    expect(screen.getByText('1:00')).toBeInTheDocument()
  })
})
