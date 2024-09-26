import { User } from '@linear/sdk'
import dayjs from 'dayjs'

import { Comment } from '@aces/interfaces/comment'
import sortComments from '@aces/lib/utils/comments/sort-comments'


describe('sortComments function', () => {
  it('should sort comments correctly', () => {
    const comments: Comment[] = [
      { createdAt: dayjs().add(1, 'day').toDate(), user: { id: '1', name: 'User 1' } as User } as Comment,
      { createdAt: dayjs().add(2, 'day').toDate(), user: { id: '2', name: 'User 2' } as User } as Comment,
      { createdAt: dayjs().add(-1, 'day').toDate(), user: { id: '3', name: 'User 3' } as User } as Comment,
    ]

    const sortedComments = sortComments(comments)

    expect(sortedComments[0].user?.name).toContain('User 3')
    expect(sortedComments[1].user?.name).toContain('User 1')
    expect(sortedComments[2].user?.name).toContain('User 2')
  })

  it('should return an empty array when input is empty', () => {
    const comments: Comment[] = []

    const sortedComments = sortComments(comments)

    expect(sortedComments).toEqual([])
  })

  it('should handle comments with the same creation date', () => {
    const date = new Date()
    const comments: Comment[] = [
      { createdAt: date, user: { id: '1', name: 'User 1' } as User } as Comment,
      { createdAt: date, user: { id: '2', name: 'User 2' } as User } as Comment,
      { createdAt: date, user: { id: '3', name: 'User 3' } as User } as Comment,
    ]

    const sortedComments = sortComments(comments)

    expect(sortedComments.length).toBe(3)
    // Since all dates are the same, the order should remain as is
    expect(sortedComments[0].user?.name).toContain('User 1')
    expect(sortedComments[1].user?.name).toContain('User 2')
    expect(sortedComments[2].user?.name).toContain('User 3')
  })

  it('should correctly sort a large number of comments', () => {
    const numberOfComments = 1000
    const comments: Comment[] = []

    // This is more clear than a non loop version would be
    // eslint-disable-next-line yenz/no-loops
    for (let i = 0; i < numberOfComments; i++) {
      comments.push({
        createdAt: dayjs().add(i, 'minute').toDate(),
        user: { id: `${i}`, name: `User ${i}` } as User,
      } as Comment)
    }

    const shuffledComments = comments.sort(() => 0.5 - Math.random())
    const sortedComments = sortComments(shuffledComments)

    // eslint-disable-next-line yenz/no-loops
    for (let i = 0; i < numberOfComments - 1; i++) {
      expect(sortedComments[i].createdAt <= sortedComments[i + 1].createdAt).toBe(true)
    }
  })
})
