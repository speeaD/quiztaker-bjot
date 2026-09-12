'use client';

import { useState } from 'react';
import { Loader2, Mail } from 'lucide-react';

export default function Login() {
    const backend_url = process.env.BACKEND_URL || 'https://bjot-backend-nine.vercel.app/api';
    // const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.email) {
            newErrors.email = 'Access code is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setErrors({});
        try {
            const response = await fetch(`${backend_url}/auth/quiztaker/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                }),
            });

            const data = await response.json();
            console.log(data);

            if (!response.ok) {
                setErrors({
                    general: data.message || 'Login failed. Please try again.',
                });
                return;
            }

            if (data.success) {
                // Store token in memory (note: localStorage not supported in artifacts)
                await fetch('/api/auth/set-cookie', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        token: data.token,

                    }),
                });
                localStorage.setItem('quizTaker', data.quizTaker.id);
                localStorage.setItem('quizTakerEmail', data.quizTaker.email);
                // In production, redirect to dashboard
                window.location.href = '/';
            } else {
                setErrors({
                    general: data.message || 'Login failed',
                });
            }
        } catch (error) {
            console.error('Login error:', error);
            setErrors({
                general: 'An error occurred. Please check your connection and try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (errors[e.target.name]) {
            setErrors({
                ...errors,
                [e.target.name]: ''
            });
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isLoading) {
            handleSubmit();
        }
    };

    return (
        <div className="min-h-screen bg-paper flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        BJOT Portal
                    </h1>
                    <p className="text-muted-foreground">
                        Enter your email address to sign in.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-card p-6">
                    {errors.general && (
                        <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                            <p className="text-sm text-destructive">{errors.general}</p>
                        </div>
                    )}

                    <div className="space-y-5">

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                                <input
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    onKeyPress={handleKeyPress}
                                    disabled={isLoading}
                                    className={`w-full pl-10 pr-4 py-3 bg-white text-foreground placeholder:text-muted-foreground border border-input/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${errors.email
                                            ? 'border-destructive/50 focus:ring-destructive/20'
                                            : 'border-border'
                                        }`}
                                    placeholder="email address"
                                />

                            </div>
                            {errors.email && (
                                <p className="mt-1 text-sm text-destructive">{errors.email}</p>
                            )}
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}