'use client';

import React, { useState } from 'react';
import { useSignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp"
import { toast } from "sonner";
import { Eye, EyeOff, LoaderIcon } from "lucide-react";
import Link from "next/link";

export default function SignUpPage() {

    const { isLoaded, signUp, setActive } = useSignUp();
    
    const router = useRouter();
    
    const [name, setName] = useState('');
    const [emailAddress, setEmailAddress] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verified, setVerified] = useState(false);
    const [code, setCode] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoaded) return;

        if (!name || !emailAddress || !password) {
            return toast.warning("Please fill in all fields");
        }

        setIsLoading(true);

        try {
            await signUp.create({
                emailAddress,
                password,
            });

            await signUp.prepareEmailAddressVerification({
                strategy: 'email_code',
            });

            setVerified(true);

            await signUp.update({
                firstName: name.split(" ")[0],
                lastName: name.split(" ")[1],
            });
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2));

            switch (err.errors[0]?.code) {
                case "form_identifier_exists":
                    toast.error("This email is already registered. Please sign in.");
                    break;
                case "form_password_pwned":
                    toast.error("The password is too common. Please choose a stronger password.");
                    break;
                case "form_param_format_invalid":
                    toast.error("Invalid email address. Please enter a valid email address.");
                    break;
                case "form_password_length_too_short":
                    toast.error("Password is too short. Please choose a longer password.");
                    break;
                default:
                    toast.error("An error occurred. Please try again");
                    break;
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoaded) return;

        if (!code) {
            return toast.warning("Verification code is required");
        }

        setIsVerifying(true);

        try {
            const completeSignUp = await signUp.attemptEmailAddressVerification({
                code,
            });

            if (completeSignUp.status === 'complete') {
                await setActive({ session: completeSignUp.createdSessionId });
                router.push('/auth-callback');
            } else {
                console.error(JSON.stringify(completeSignUp, null, 2));
                toast.error("Invalid verification code");
            }
        } catch (err: any) {
            console.error('Error:', JSON.stringify(err, null, 2));
            toast.error("An error occurred. Please try again");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleGoogleSignUp = async () => {
        if (!isLoaded) return;
        
        setIsGoogleLoading(true);
        
        try {
            await signUp.authenticateWithRedirect({
                strategy: 'oauth_google',
                redirectUrl: '/auth-callback',
                redirectUrlComplete: '/auth-callback'
            });
        } catch (err: any) {
            console.error('Google sign-up error:', err);
            toast.error('Failed to sign up with Google. Please try again.');
            setIsGoogleLoading(false);
        }
    };

    return verified ? (
        <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center hc gap-y-6">
            <div className="w-full">
                <h1 className="text-2xl font-bold">
                    Please check your email
                </h1>
                <p className="text-sm text-muted-foreground">
                    We&apos;ve sent a verification code to {emailAddress}
                </p>
            </div>
            <form onSubmit={handleVerify} className="w-full max-w-sm text-center">
                <Label htmlFor="code">
                    Verification code
                </Label>
                <InputOTP
                    maxLength={6}
                    value={code}
                    disabled={isVerifying}
                    onChange={(e) => setCode(e)}
                    className="pt-2"
                >
                    <InputOTPGroup className="justify-center w-full">
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                    </InputOTPGroup>
                </InputOTP>
                <Button size="lg" type="submit" disabled={isVerifying} className="w-full mt-4">
                    {isVerifying ? (
                        <LoaderIcon className="w-5 h-5 animate-spin" />
                    ) : "Verify"}
                </Button>
                <p className="text-sm text-muted-foreground mt-4">
                    Back to signup
                    <Button size="sm" variant="link" type="button" disabled={isVerifying} onClick={() => setVerified(false)}>
                        Sign up
                    </Button>
                </p>
            </form>
        </div>
    ) : (
        <div className="flex flex-col items-center justify-center hc gap-y-6">
            <h1 className="text-2xl text-center font-bold">Sign up</h1>
            <form onSubmit={handleSubmit} className="w-full max-w-sm">
                <div className="space-y-2">
                    <Label htmlFor="name">
                        Full name
                    </Label>
                    <Input
                        id="name"
                        type="text"
                        name="name"
                        value={name}
                        disabled={isLoading}
                        placeholder="Enter your name"
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="mt-4 space-y-2">
                    <Label htmlFor="email">
                        Email address
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        disabled={isLoading}
                        value={emailAddress}
                        placeholder="Enter your email address"
                        onChange={(e) => setEmailAddress(e.target.value)}
                    />
                </div>
                <div className="mt-4 space-y-2">
                    <Label htmlFor="password">
                        Password
                    </Label>
                    <div className="relative w-full">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            disabled={isLoading}
                            value={password}
                            placeholder="Enter your password"
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
                            <LoaderIcon className="w-5 h-5 animate-spin" />
                        ) : "Sign Up"}
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
                        onClick={handleGoogleSignUp}
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
                        Already a member? <Link href="/sign-in" className="text-foreground">Sign in</Link>
                    </p>
                </div>
            </form>
        </div>
    );
};