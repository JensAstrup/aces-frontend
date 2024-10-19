import { PrismaClient } from '@prisma/client'


const prisma = new PrismaClient()

async function getInactiveRounds() {
  const HOURS_IN_DAY = 24
  const MINUTES_IN_HOUR = 60
  const SECONDS_IN_MINUTE = 60
  const MILLISECONDS_IN_SECOND = 1000

  const MILLISECONDS_IN_DAY = HOURS_IN_DAY * MINUTES_IN_HOUR * SECONDS_IN_MINUTE * MILLISECONDS_IN_SECOND

  const twentyFourHoursAgo = new Date(Date.now() - MILLISECONDS_IN_DAY)

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
