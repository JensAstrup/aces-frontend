import { PrismaClient } from '@prisma/client'


const prisma = new PrismaClient()

async function getInactiveRounds() {
  // eslint-disable-next-line no-magic-numbers
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const updatedRounds = await prisma.round.updateMany({
    where: {
      status: 'CREATED',
      updatedAt: {
        lt: twentyFourHoursAgo
      },
      issues: {
        none: {
          createdAt: {
            gte: twentyFourHoursAgo
          }
        }
      },
      AND: [
        {
          issues: {
            none: {
              votes: {
                some: {
                  createdAt: {
                    gte: twentyFourHoursAgo
                  }
                }
              }
            }
          }
        }
      ]
    },
    data: {
      status: 'FINISHED'
    }
  })

  return updatedRounds.count
}

export default getInactiveRounds
