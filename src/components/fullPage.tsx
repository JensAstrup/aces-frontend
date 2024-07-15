/**
 * v0 by Vercel.
 * @see https://v0.dev/t/yyAoHD9SY5g
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { Avatar, AvatarFallback, AvatarImage } from '@aces/components/ui/avatar'
import { Button } from '@aces/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@aces/components/ui/card'
import { Textarea } from '@aces/components/ui/textarea'


export default function Component() {
  return (
    <div className="grid md:grid-cols-2 gap-6 lg:gap-12 items-start max-w-6xl px-4 mx-auto py-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Issue Description</h2>
          <div className="mt-2 prose text-muted-foreground">
            <p className="border rounded-md p-4 bg-muted/50 hover:bg-muted cursor-pointer">
              Implement a new feature that allows users to track their daily water intake. The feature should include
              the ability to log water consumption, set daily goals, and view historical data.
            </p>
          </div>
          <div className="flex items-center gap-2 mt-4" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Comments</h2>
          <div className="mt-2 space-y-4">
            <div className="flex items-start gap-4">
              <Avatar className="w-10 h-10">
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">John Doe</div>
                  <div className="text-xs text-muted-foreground">2 days ago</div>
                </div>
                <div className="prose text-muted-foreground">
                  <p>
                    Sounds like a great feature! I think it would be really helpful for users to be able to track their
                    water intake and set daily goals.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Avatar className="w-10 h-10">
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback>JA</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Jane Appleseed</div>
                  <div className="text-xs text-muted-foreground">3 days ago</div>
                </div>
                <div className="prose text-muted-foreground">
                  <p>
                    I agree, this would be a really useful feature. I'm especially excited about the historical data
                    tracking aspect.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Avatar className="w-10 h-10">
                <AvatarFallback>YS</AvatarFallback>
              </Avatar>
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">Just now</div>
                </div>
                <div className="prose text-muted-foreground">
                  <Textarea className="min-h-[100px] w-full" placeholder="Add a new comment..." />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost">Cancel</Button>
                  <Button>Submit</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold">Pointing Poker</h2>
          <div className="grid grid-cols-3 gap-4">
            <Button size="lg">0</Button>
            <Button size="lg">1</Button>
            <Button size="lg">2</Button>
            <Button size="lg">3</Button>
            <Button size="lg">5</Button>
            <Button size="lg">8</Button>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold">Votes</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center justify-center bg-muted rounded-md p-4">
              <div className="text-2xl font-bold">3</div>
            </div>
            <div className="flex items-center justify-center bg-muted rounded-md p-4">
              <div className="text-2xl font-bold">2</div>
            </div>
            <div className="flex items-center justify-center bg-muted rounded-md p-4">
              <div className="text-2xl font-bold">1</div>
            </div>
            <div className="flex items-center justify-center bg-muted rounded-md p-4">
              <div className="text-2xl font-bold">0</div>
            </div>
            <div className="flex items-center justify-center bg-muted rounded-md p-4">
              <div className="text-2xl font-bold">5</div>
            </div>
            <div className="flex items-center justify-center bg-muted rounded-md p-4">
              <div className="text-2xl font-bold">8</div>
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold">Stats</h2>
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Lowest</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <div className="text-4xl font-bold">0</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Highest</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <div className="text-4xl font-bold">8</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Average</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <div className="text-4xl font-bold">3.5</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
