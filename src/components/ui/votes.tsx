import { Button } from '@aces/components/ui/button'

const Votes: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold">Votes</h2>
      <div className="grid grid-cols-3 gap-4">
        {[3, 2, 1, 0, 5, 8].map(vote => (
            <Button size='lg' className='flex items-center justify-center bg-primary rounded-md p-4'>{vote}</Button>
        ))}
      </div>
    </div>
  )
}

export { Votes }
