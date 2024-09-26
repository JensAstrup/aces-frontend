import { User } from '@linear/sdk'
import { render, screen } from '@testing-library/react'
import React from 'react'

import { Comment as CommentInterface } from '@aces/interfaces/comment'
import renderComment from '@aces/lib/utils/comments/render-comment'


// Mock the dayjs function
jest.mock('dayjs', () => {
  const originalDayjs = jest.requireActual('dayjs')
  return Object.assign(
    () => ({
      fromNow: () => '2 hours ago'
    }),
    originalDayjs
  )
})

// Mock the Comment component
jest.mock('@aces/components/comments/comment', () => ({
  Comment: ({ avatarSrc, comment, fallback, name, time }: {
    avatarSrc: string
    comment: string
    fallback: string
    name: string
    time: string
  }) => (
    <div data-testid="comment">
      <span data-testid="avatar-src">{avatarSrc}</span>
      <span data-testid="comment-body">{comment}</span>
      <span data-testid="fallback">{fallback}</span>
      <span data-testid="name">{name}</span>
      <span data-testid="time">{time}</span>
    </div>
  ),
}))

describe('renderComment', () => {
  it('should render a comment with all user information', () => {
    const comment = {
      id: '1',
      body: 'Test comment',
      createdAt: new Date('2023-09-25T12:00:00Z'),
      user: {
        name: 'John Doe',
        avatarUrl: 'https://example.com/avatar.jpg',
      } as User,
    } as CommentInterface

    render(renderComment(comment))

    expect(screen.getByTestId('avatar-src')).toHaveTextContent('https://example.com/avatar.jpg')
    expect(screen.getByTestId('comment-body')).toHaveTextContent('Test comment')
    expect(screen.getByTestId('fallback')).toHaveTextContent('JD')
    expect(screen.getByTestId('name')).toHaveTextContent('John Doe')
    expect(screen.getByTestId('time')).toHaveTextContent('2 hours ago')
  })

  it('should render a comment with missing user information', () => {
    const comment = {
      id: '2',
      body: 'Another test comment',
      createdAt: new Date('2023-09-25T12:00:00Z'),
    } as CommentInterface

    render(renderComment(comment))

    expect(screen.getByTestId('avatar-src')).toHaveTextContent('')
    expect(screen.getByTestId('comment-body')).toHaveTextContent('Another test comment')
    expect(screen.getByTestId('fallback')).toHaveTextContent('U')
    expect(screen.getByTestId('name')).toHaveTextContent('Unknown')
    expect(screen.getByTestId('time')).toHaveTextContent('2 hours ago')
  })

  it('should render a comment with single-word user name', () => {
    const comment = {
      id: '3',
      body: 'Single name comment',
      createdAt: new Date('2023-09-25T12:00:00Z'),
      user: {
        name: 'Mononym',
      } as User,
    } as CommentInterface

    render(renderComment(comment))

    expect(screen.getByTestId('fallback')).toHaveTextContent('M')
    expect(screen.getByTestId('name')).toHaveTextContent('Mononym')
  })
})
