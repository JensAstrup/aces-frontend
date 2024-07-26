interface Issue {
  id: string
  title: string
  description: string
  createdAt: string
  creator: {
    id: number
    name: string
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
    nodes: {
      id: number
      body: string
      user: {
        id: number
        name: string
        avatarUrl: string
      }
    }[]
  }
  url: string
}

export type { Issue }
