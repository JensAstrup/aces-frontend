'use client'

import React from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@aces/components/ui/card'


interface StatCardProps {
  title: string
  value: number
  hoverValue?: number
  onClick: (value: number) => void
  disabled: boolean
}

function StatCard({ title, value, hoverValue, onClick, disabled }: StatCardProps) {
  const [displayValue, setDisplayValue] = React.useState<number>(value)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (!disabled) {
        onClick(value)
      }
    }
  }

  function onMouseEnter() {
    if (hoverValue) {
      setDisplayValue(hoverValue)
    }
  }

  function onMouseLeave() {
    setDisplayValue(value)
  }

  return (
    <Card
      className={`col-span-1 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      role="button"
      tabIndex={0}
      onClick={() => {
        !disabled && onClick(value)
      }}
      onKeyDown={handleKeyPress}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      aria-disabled={disabled}
    >
      <CardHeader className="flex items-center justify-center">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <div className="text-3xl font-bold">{displayValue || '?'}</div>
      </CardContent>
    </Card>
  )
}

export default StatCard
