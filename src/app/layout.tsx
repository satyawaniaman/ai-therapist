import { type Metadata } from 'next'
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import '../styles/globals.css'
import { Toaster } from '@/components/ui/sonner'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Next.js + Clerk Auth Starter',
  description: 'A modern authentication starter with Next.js, Clerk, and Prisma',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <header className="sticky top-0 inset-x-0 bg-white/50 backdrop-blur-md h-14 w-full border-b border-border px-4 md:px-10">
            <div className="flex items-center justify-between mx-auto max-w-screen-xl h-full">
              <Link href="/" className="font-semibold">
                Next.js + Clerk
              </Link>
              <div className="flex items-center gap-4">
                <SignedOut>
                  <SignInButton>
                    <Button variant="ghost" size="sm">
                      Login
                    </Button>
                  </SignInButton>
                  <SignUpButton>
                    <Button size="sm">
                      Sign Up
                    </Button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <Button size="sm" asChild variant="ghost">
                    <Link href="/dashboard">
                      Dashboard
                    </Link>
                  </Button>
                  <UserButton />
                </SignedIn>
              </div>
            </div>
          </header>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}
