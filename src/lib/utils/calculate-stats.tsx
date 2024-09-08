import getMedian from '@aces/lib/utils/get-median'


export function calculateStats(votes: Array<number | null>): { lowest: number, highest: number, median: number, average: number } {
  const filteredVotes = votes.filter((vote): vote is number => vote !== null)

  if (filteredVotes.length === 0) {
    return { lowest: 0, highest: 0, median: 0, average: 0 }
  }

  let lowest = filteredVotes[0]
  let highest = filteredVotes[0]
  let sum = 0

  for (const vote of filteredVotes) {
    if (vote < lowest) lowest = vote
    if (vote > highest) highest = vote
    sum += vote
  }

  const average = sum / filteredVotes.length
  const median = getMedian(filteredVotes)

  return { lowest, highest, median, average }
}
