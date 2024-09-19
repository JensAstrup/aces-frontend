import { User as PrismaUser } from '@prisma/client'


type User = Omit<PrismaUser, 'token'>
export default User
