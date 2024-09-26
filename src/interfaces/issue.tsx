import { Comment } from '@aces/interfaces/comment'


interface Issue {
  id: string
  title: string
  description: string
  createdAt: string
  creator: {
    id: number
    name: string
    displayName: string
  }
  state: {
    name: string
    type: string
  }
  team: {
    id: number
    name: string
  }
  comments: {
    nodes: Comment[]
  }
  url: string
}

export type { Issue }
