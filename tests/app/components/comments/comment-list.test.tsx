import { User } from '@linear/sdk'
import { render, screen } from '@testing-library/react'
import React from 'react'

import { CommentList } from '@aces/components/comments/comment-list'
import { Comment } from '@aces/interfaces/comment'
import { Issue } from '@aces/interfaces/issue'
import getHumanComments from '@aces/lib/utils/comments/get-human-comments'
import renderComment from '@aces/lib/utils/comments/render-comment'
import sortComments from '@aces/lib/utils/comments/sort-comments'



jest.mock('dayjs', () => {
  const original = jest.requireActual('dayjs')
  return Object.assign(
    (date: Date) => original(date),
    original,
    { extend: jest.fn() }
  )
})

jest.mock('@aces/lib/utils/comments/get-human-comments')
jest.mock('@aces/lib/utils/comments/sort-comments')
jest.mock('@aces/lib/utils/comments/render-comment')

describe('CommentList', () => {
  const mockGetHumanComments = getHumanComments as jest.MockedFunction<typeof getHumanComments>
  const mockSortComments = sortComments as jest.MockedFunction<typeof sortComments>
  const mockRenderComment = renderComment as jest.MockedFunction<typeof renderComment>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render nothing when issue is undefined', () => {
    const { container } = render(<CommentList />)
    expect(container.firstChild).toBeNull()
  })

  it('should render "No comments yet" when there are no comments', () => {
    const issue: Issue = {
      comments: { nodes: [] },
    } as unknown as Issue

    mockGetHumanComments.mockReturnValue([])
    mockSortComments.mockReturnValue([])

    render(<CommentList issue={issue} />)

    expect(screen.getByText('Comments')).toBeInTheDocument()
    expect(screen.getByText('No comments yet')).toBeInTheDocument()
  })

  it('should render comments when they exist', () => {
    const comments = [
      {
        id: '1',
        body: 'Comment 1',
        createdAt: new Date('2023-09-25T12:00:00Z'),
        user: {
          name: 'John Doe',
          avatarUrl: 'https://example.com/avatar1.jpg'
        } as unknown as User,
        botActor: undefined
      } as Comment,
      {
        id: '2',
        body: 'Comment 2',
        createdAt: new Date('2023-09-25T13:00:00Z'),
        user: {
          name: 'Jane Smith',
          avatarUrl: 'https://example.com/avatar2.jpg'
        } as unknown as User,
        botActor: undefined
      } as Comment
    ]

    const issue: Issue = {
      comments: { nodes: comments },
    } as Issue

    mockGetHumanComments.mockReturnValue(comments)
    mockSortComments.mockReturnValue(comments)
    mockRenderComment.mockImplementation(comment => <div key={comment.id}>{comment.body}</div>)

    render(<CommentList issue={issue} />)

    expect(screen.getByText('Comments')).toBeInTheDocument()
    expect(screen.getByText('Comment 1')).toBeInTheDocument()
    expect(screen.getByText('Comment 2')).toBeInTheDocument()
  })

  it('should call utility functions with correct arguments', () => {
    const comments: Comment[] = [
      {
        id: '1',
        body: 'Comment 1',
        createdAt: new Date('2023-09-25T12:00:00Z'),
        user: {
          name: 'John Doe',
          avatarUrl: 'https://example.com/avatar1.jpg'
        } as unknown as User,
        botActor: undefined
      } as Comment,
      {
        id: '2',
        body: 'Comment 2',
        createdAt: new Date('2023-09-25T13:00:00Z'),
        user: {
          name: 'Jane Smith',
          avatarUrl: 'https://example.com/avatar2.jpg'
        } as unknown as User,
        botActor: undefined
      } as Comment
    ]

    const issue: Issue = {
      comments: { nodes: comments },
    } as Issue

    mockGetHumanComments.mockReturnValue(comments)
    mockSortComments.mockReturnValue(comments)
    mockRenderComment.mockImplementation(comment => <div key={comment.id}>{comment.body}</div>)

    render(<CommentList issue={issue} />)

    expect(mockGetHumanComments).toHaveBeenCalledWith(issue.comments.nodes)
    expect(mockSortComments).toHaveBeenCalledWith(comments)
    expect(mockRenderComment).toHaveBeenCalledTimes(2)
  })
})
