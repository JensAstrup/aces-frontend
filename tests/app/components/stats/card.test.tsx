import { fireEvent, render, screen } from '@testing-library/react'
import { act } from 'react'

import StatCard from '@aces/components/stats/card'


describe('StatCard function', () => {
  it('should call onClick when the card is clicked', () => {
    const mockOnClick = jest.fn()
    act(() => {
      render(<StatCard stat={{ title: 'Test', value: 1 }} onClick={mockOnClick} disabled={false} />)
    })

    fireEvent.click(screen.getByRole('button'))
    expect(mockOnClick).toHaveBeenCalledTimes(1)
    expect(mockOnClick).toHaveBeenCalledWith(1)
  })

  it('should not call onClick when disabled', () => {
    const mockOnClick = jest.fn()
    act(() => {
      render(<StatCard stat={{ title: 'Test', value: 1 }} onClick={mockOnClick} disabled={true} />)
    })

    fireEvent.click(screen.getByRole('button'))
    expect(mockOnClick).toHaveBeenCalledTimes(0)
  })

  it('should call onClick when Enter Key is pressed', () => {
    const mockOnClick = jest.fn()
    act(() => {
      render(<StatCard stat={{ title: 'Test', value: 1 }} onClick={mockOnClick} disabled={false} />)
    })

    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter', code: 'Enter' })
    expect(mockOnClick).toHaveBeenCalledTimes(1)
    expect(mockOnClick).toHaveBeenCalledWith(1)
  })

  it('should not call onClick when Enter Key is pressed and disabled', () => {
    const mockOnClick = jest.fn()
    act(() => {
      render(<StatCard stat={{ title: 'Test', value: 1 }} onClick={mockOnClick} disabled={true} />)
    })

    fireEvent.keyPress(screen.getByRole('button'), { key: 'Enter', code: 'Enter' })
    expect(mockOnClick).toHaveBeenCalledTimes(0)
  })

  it('should call onClick when Space Key is pressed', () => {
    const mockOnClick = jest.fn()
    act(() => {
      render(<StatCard stat={{ title: 'Test', value: 1 }} onClick={mockOnClick} disabled={false} />)
    })

    fireEvent.keyDown(screen.getByRole('button'), { key: ' ', code: 'Space' })
    expect(mockOnClick).toHaveBeenCalledTimes(1)
    expect(mockOnClick).toHaveBeenCalledWith(1)
  })

  it('should not call onClick when Space Key is pressed and disabled', () => {
    const mockOnClick = jest.fn()
    act(() => {
      render(<StatCard stat={{ title: 'Test', value: 1 }} onClick={mockOnClick} disabled={true} />)
    })

    fireEvent.keyPress(screen.getByRole('button'), { key: ' ', code: 'Space' })
    expect(mockOnClick).toHaveBeenCalledTimes(0)
  })
})
