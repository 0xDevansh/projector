import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card.js';
import { buttonVariants } from '../components/ui/button.js'

const loginLink = `https://oauthdevclub.vercel.app/signin?client_id=mHuhtM4zb6YlaY9qxEvNpvmEM4w&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Fapi%2Foauth-callback`

export function Login() {
  return <div className='login'>
    <Card className='w-[350px] mx-auto my-40wh'>
      <CardHeader>
        <CardTitle>Log in</CardTitle>
        <CardDescription>Use DevClub OAuth to log into your account</CardDescription>
      </CardHeader>
      <CardContent>
        <a href={loginLink} className={buttonVariants({ variant: 'secondary' })}>Log in</a>
      </CardContent>
    </Card>
  </div>
}