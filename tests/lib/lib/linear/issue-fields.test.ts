import { issueFields } from '@aces/lib/linear/issue-fields'


describe('issueFields', () => {
  const expectedFields = `id
          title
          description
          url
          createdAt
          creator {
            id
            name
            displayName
          }
          team {
            id
            name
          }
          state {
            name
            type
            }
            comments {
                nodes {
                    id
                    body
                    createdAt
                    user {
                      id
                      name
                      avatarUrl
                    }
                    botActor {
                        id
                    }
                }
            }`
  it('should match the snapshot', () => {
    expect(issueFields).toEqual(expectedFields)
  })
})
