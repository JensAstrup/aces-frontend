'use client'

import React from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@aces/components/ui/card'


interface StatCardProps {
  stat: {
    title: string
    value: number
  }
  onClick: (value: number) => void
  disabled: boolean
}

function StatCard({ stat, onClick, disabled }: StatCardProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (!disabled) {
        onClick(stat.value)
      }
    }
  }

  return (
    <Card
      className={`col-span-1 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      role="button"
      tabIndex={0}
      onClick={() => {
        !disabled && onClick(stat.value)
      }}
      onKeyDown={handleKeyPress}
      aria-disabled={disabled}
    >
      <CardHeader className="flex items-center justify-center">
        <CardTitle className="text-lg">{stat.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <div className="text-3xl font-bold">{stat.value || '?'}</div>
      </CardContent>
    </Card>
  )
}

export default StatCard
