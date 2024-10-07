import { Comment as LinearComment, User } from '@linear/sdk'


type Comment = { user?: User } & LinearComment

export type { Comment }
