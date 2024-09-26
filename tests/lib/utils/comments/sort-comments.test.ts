import { User } from '@linear/sdk'
import dayjs from 'dayjs'

import { Comment } from '@aces/interfaces/comment'
import sortComments from '@aces/lib/utils/comments/sort-comments'


describe('sortComments function', () => {
  it('should sort comments correctly', () => {
    const comments: Comment[] = [
      { createdAt: dayjs().add(1, 'day').toDate(), user: { id: '1', name: 'User 1' } as User } as Comment,
      { createdAt: dayjs().add(2, 'day').toDate(), user: { id: '2', name: 'User 2' } } as Comment,
      { createdAt: dayjs().add(-1, 'day').toDate(), user: { id: '3', name: 'User 3' } } as Comment,
    ]

    const sortedComments = sortComments(comments)

    expect(sortedComments[0].user?.name).toContain('User 3')
    expect(sortedComments[1].user?.name).toContain('User 1')
    expect(sortedComments[2].user?.name).toContain('User 2')
  })
})
