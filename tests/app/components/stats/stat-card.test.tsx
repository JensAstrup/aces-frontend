import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

import StatCard from '@aces/components/stats/stat-card'


describe('StatCard Component', () => {
  const defaultProps = {
    title: 'Test Title',
    value: 100,
    onClick: jest.fn(),
    disabled: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the title and value correctly', () => {
    render(<StatCard {...defaultProps} />)

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
  })

  it('should display hoverValue on mouse enter when hoverValue is provided', () => {
    render(<StatCard {...defaultProps} hoverValue={200} />)

    const card = screen.getByRole('button')
    fireEvent.mouseEnter(card)

    expect(screen.getByText('200')).toBeInTheDocument()
  })

  it('should not change displayValue on mouse enter when hoverValue is not provided', () => {
    render(<StatCard {...defaultProps} />)

    const card = screen.getByRole('button')
    fireEvent.mouseEnter(card)

    expect(screen.getByText('100')).toBeInTheDocument()
  })

  it('should revert displayValue on mouse leave after hover', () => {
    render(<StatCard {...defaultProps} hoverValue={200} />)

    const card = screen.getByRole('button')
    fireEvent.mouseEnter(card)
    expect(screen.getByText('200')).toBeInTheDocument()

    fireEvent.mouseLeave(card)
    expect(screen.getByText('100')).toBeInTheDocument()
  })

  it('should call onClick when clicked and not disabled', () => {
    render(<StatCard {...defaultProps} />)

    const card = screen.getByRole('button')
    fireEvent.click(card)

    expect(defaultProps.onClick).toHaveBeenCalledTimes(1)
    expect(defaultProps.onClick).toHaveBeenCalledWith(100)
  })

  it('should not call onClick when clicked and disabled', () => {
    render(<StatCard {...defaultProps} disabled={true} />)

    const card = screen.getByRole('button')
    fireEvent.click(card)

    expect(defaultProps.onClick).not.toHaveBeenCalled()
  })

  it('should call onClick when "Enter" key is pressed and not disabled', () => {
    render(<StatCard {...defaultProps} />)

    const card = screen.getByRole('button')
    fireEvent.keyDown(card, { key: 'Enter', code: 'Enter', charCode: 13 })

    expect(defaultProps.onClick).toHaveBeenCalledTimes(1)
    expect(defaultProps.onClick).toHaveBeenCalledWith(100)
  })

  it('should call onClick when "Space" key is pressed and not disabled', () => {
    render(<StatCard {...defaultProps} />)

    const card = screen.getByRole('button')
    fireEvent.keyDown(card, { key: ' ', code: 'Space', charCode: 32 })

    expect(defaultProps.onClick).toHaveBeenCalledTimes(1)
    expect(defaultProps.onClick).toHaveBeenCalledWith(100)
  })

  it('should not call onClick when "Enter" key is pressed and disabled', () => {
    render(<StatCard {...defaultProps} disabled={true} />)

    const card = screen.getByRole('button')
    fireEvent.keyDown(card, { key: 'Enter', code: 'Enter', charCode: 13 })

    expect(defaultProps.onClick).not.toHaveBeenCalled()
  })

  it('should not call onClick when "Space" key is pressed and disabled', () => {
    render(<StatCard {...defaultProps} disabled={true} />)

    const card = screen.getByRole('button')
    fireEvent.keyDown(card, { key: ' ', code: 'Space', charCode: 32 })

    expect(defaultProps.onClick).not.toHaveBeenCalled()
  })

  it('should have the correct class when not disabled', () => {
    render(<StatCard {...defaultProps} />)

    const card = screen.getByRole('button')
    expect(card).toHaveClass('cursor-pointer')
    expect(card).not.toHaveClass('opacity-50', 'cursor-not-allowed')
  })

  it('should have the correct class when disabled', () => {
    render(<StatCard {...defaultProps} disabled={true} />)

    const card = screen.getByRole('button')
    expect(card).toHaveClass('cursor-not-allowed', 'opacity-50')
    expect(card).not.toHaveClass('cursor-pointer')
  })

  it('should set aria-disabled attribute correctly when not disabled', () => {
    render(<StatCard {...defaultProps} />)

    const card = screen.getByRole('button')
    expect(card).toHaveAttribute('aria-disabled', 'false')
  })

  it('should set aria-disabled attribute correctly when disabled', () => {
    render(<StatCard {...defaultProps} disabled={true} />)

    const card = screen.getByRole('button')
    expect(card).toHaveAttribute('aria-disabled', 'true')
  })

  it('should display "?" when displayValue is falsy (e.g., 0)', () => {
    render(<StatCard {...defaultProps} value={0} />)

    expect(screen.getByText('?')).toBeInTheDocument()
  })

  it('should display the correct value when displayValue is 0 and hoverValue is provided', () => {
    render(<StatCard {...defaultProps} value={0} hoverValue={50} />)

    const card = screen.getByRole('button')
    // Initially, displayValue is 0 which is falsy, so '?'
    expect(screen.getByText('?')).toBeInTheDocument()

    // On hover, displayValue should change to 50
    fireEvent.mouseEnter(card)
    expect(screen.getByText('50')).toBeInTheDocument()

    // On mouse leave, displayValue should revert to 0, which shows '?'
    fireEvent.mouseLeave(card)
    expect(screen.getByText('?')).toBeInTheDocument()
  })
})
