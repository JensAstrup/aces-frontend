import { Comment } from '@aces/interfaces/comment'
import getHumanComments from '@aces/lib/utils/comments/get-human-comments'


describe('getHumanComments', () => {
  it('should return an empty array when given an empty array', () => {
    const result = getHumanComments([])
    expect(result).toEqual([])
  })

  it('should return only comments without botActor', () => {
    const comments: Comment[] = [
      { id: '1', body: 'Human comment 1', botActor: undefined } as Comment,
      { id: '2', body: 'Bot comment', botActor: {} } as Comment,
      { id: '3', body: 'Human comment 2', botActor: undefined } as Comment,
      { id: '4', body: 'Another bot comment', botActor: {} } as Comment,
    ]

    const result = getHumanComments(comments)

    expect(result).toEqual([
      { id: '1', body: 'Human comment 1', botActor: undefined },
      { id: '3', body: 'Human comment 2', botActor: undefined },
    ])
  })

  it('should return all comments if none have botActor', () => {
    const comments: Comment[] = [
      { id: '1', body: 'Human comment 1', botActor: undefined } as Comment,
      { id: '2', body: 'Human comment 2', botActor: undefined } as Comment,
      { id: '3', body: 'Human comment 3', botActor: undefined } as Comment,
    ]

    const result = getHumanComments(comments)

    expect(result).toEqual(comments)
  })
})
