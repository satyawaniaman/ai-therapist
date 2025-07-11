'use client';

import React, { useState } from 'react';
import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Eye, EyeOff, LoaderIcon } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
    
    const router = useRouter();

    const { isLoaded, signIn, setActive } = useSignIn();

    const [emailAddress, setEmailAddress] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoaded) return;

        if (!emailAddress || !password) {
            return toast.warning("Please fill in all fields");
        }

        setIsLoading(true);

        try {
            const signInAttempt = await signIn.create({
                identifier: emailAddress,
                password,
                redirectUrl: "/auth-callback"
            });

            if (signInAttempt.status === 'complete') {
                await setActive({ session: signInAttempt.createdSessionId });
                router.push('/auth-callback');
            } else {
                console.error(JSON.stringify(signInAttempt, null, 2));
                toast.error("Invalid email or password");
            }
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2));
            switch (err.errors[0]?.code) {
                case 'form_identifier_not_found':
                    toast.error("This email is not registered. Please sign up first.");
                    break;
                case 'form_password_incorrect':
                    toast.error("Incorrect password. Please try again.");
                    break;
                case 'too_many_attempts':
                    toast.error("Too many attempts. Please try again later.");
                    break;
                default:
                    toast.error("An error occurred. Please try again");
                    break;
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        if (!isLoaded) return;
        
        setIsGoogleLoading(true);
        
        try {
            await signIn.authenticateWithRedirect({
                strategy: 'oauth_google',
                redirectUrl: '/auth-callback',
                redirectUrlComplete: '/auth-callback'
            });
        } catch (err: any) {
            console.error('Google sign-in error:', err);
            toast.error('Failed to sign in with Google. Please try again.');
            setIsGoogleLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center hc gap-y-6">
            <h1 className="text-2xl font-bold">Sign in</h1>
            <form onSubmit={handleSubmit} className="w-full max-w-sm">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="email">
                        Email address
                    </label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        placeholder="Enter email address"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                    />
                </div>
                <div className="mt-4 space-y-2">
                    <label className="block text-sm font-medium text-gray-700" htmlFor="password">
                        Password
                    </label>
                    <div className="relative w-full">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Enter password"
                            value={password}
                            disabled={isLoading}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            disabled={isLoading}
                            className="absolute top-1 right-1"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ?
                                <EyeOff className="w-4 h-4" /> :
                                <Eye className="w-4 h-4" />
                            }
                        </Button>
                    </div>
                </div>
                <div className="mt-4 space-y-3">
                    <Button size="lg" type="submit" disabled={isLoading || isGoogleLoading} className="w-full">
                        {isLoading ? (
                            <LoaderIcon className="w-4 h-4 animate-spin" />
                        ) : "Sign In"}
                    </Button>
                    
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                        </div>
                    </div>
                    
                    <Button 
                        type="button" 
                        variant="outline" 
                        size="lg" 
                        className="w-full" 
                        disabled={isLoading || isGoogleLoading}
                        onClick={handleGoogleSignIn}
                    >
                        {isGoogleLoading ? (
                            <LoaderIcon className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                        )}
                        Continue with Google
                    </Button>
                </div>
                <div className="mt-4 flex">
                    <p className="text-sm text-muted-foreground text-center w-full">
                        Don&apos;t have an account? <Link href="/sign-up" className="text-foreground">Sign up</Link>
                    </p>
                </div>
            </form>
        </div>
    );
}