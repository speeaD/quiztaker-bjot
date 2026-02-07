'use client';

import React, { useState } from 'react';
import {
    PlayCircle,
    FileText,
    Trophy,
    ArrowRight,
    ArrowLeft,
    Star,
    CheckCircle,
    Facebook,
    Twitter,
    Instagram,
    Menu,
    X
} from 'lucide-react';
import Link from 'next/link';

// Types
interface Testimonial {
    id: number;
    name: string;
    role: string;
    rating: number;
    text: string;
    image: string;
}

// interface Category {
//     name: string;
//     icon: React.ReactNode;
//     color: string;
// }

interface Step {
    number: number;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
}

export default function HomePage() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const testimonials: Testimonial[] = [
        {
            id: 1,
            name: 'Sarah Johnson',
            role: 'Passed SAT Math',
            rating: 5,
            text: 'I was struggling with the Calculus portion of my exams. The step-by-step video breakdowns here were a lifesaver. I passed with flying colors!',
            image: 'SJ'
        },
        {
            id: 2,
            name: 'Michael Chen',
            role: 'Certified AWS Architect',
            rating: 5,
            text: 'The practice exams are incredibly realistic. When I walked into the actual testing center, I felt calm and prepared because I had done it so many times before.',
            image: 'MC'
        },
        {
            id: 3,
            name: 'Emily Davis',
            role: 'UX Design Certificate',
            rating: 4.5,
            text: 'Highly recommend for anyone looking to upskill quickly. The dashboard makes tracking progress addictive and fun. I learned Figma in just 2 weeks!',
            image: 'ED'
        }
    ];

    // const categories: Category[] = [
    //     { name: 'Science', icon: <Beaker className="h-10 w-10" />, color: 'text-blue-500' },
    //     { name: 'Math', icon: <Calculator className="h-10 w-10" />, color: 'text-purple-500' },
    //     { name: 'Languages', icon: <Languages className="h-10 w-10" />, color: 'text-orange-500' },
    //     { name: 'Coding', icon: <Code className="h-10 w-10" />, color: 'text-green-500' },
    //     { name: 'Design', icon: <Palette className="h-10 w-10" />, color: 'text-pink-500' },
    //     { name: 'Business', icon: <Briefcase className="h-10 w-10" />, color: 'text-teal-500' }
    // ];

    const steps: Step[] = [
        {
            number: 1,
            title: 'Learn',
            description: 'Access comprehensive video tutorials led by experts. Break down complex topics into bite-sized, digestible lessons.',
            icon: <PlayCircle className="h-8 w-8" />,
            color: 'blue'
        },
        {
            number: 2,
            title: 'Practice',
            description: 'Take simulated exams with real-time feedback. Identify your weak spots and turn them into strengths with targeted drills.',
            icon: <FileText className="h-8 w-8" />,
            color: 'purple'
        },
        {
            number: 3,
            title: 'Excel',
            description: 'Track your progress and achieve top scores and aces all your exams with confidence and ease.',
            icon: <Trophy className="h-8 w-8" />,
            color: 'orange'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-bg rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-lg">B</span>
                        </div>
                        <div>
                            <span className="text-lg font-bold text-gray-900">BJOT</span>
                            {/* <span className="ml-2 text-xs px-2 py-0.5 bg-blue-50 text-blue-bg rounded-full font-medium">
                                Student
                            </span> */}
                        </div>
                    </div>

                    <nav className="hidden md:flex items-center gap-8">
                        <a className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors" href="#courses">
                            Courses
                        </a>
                        <a className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors" href="#success">
                            Success Stories
                        </a>
                        <a className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors" href="#pricing">
                            Pricing
                        </a>
                    </nav>

                    <div className="flex items-center gap-4">

                        <Link className="flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-transform hover:scale-105 active:scale-95" href="/login">
                            Login
                        </Link>
                        <Link className="flex h-9 items-center justify-center rounded-lg bg-green-600 px-4 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-transform hover:scale-105 active:scale-95" href="/register">
                            Register
                        </Link>
                        <button
                            className="md:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t bg-white">
                        <div className="px-4 py-3 space-y-3">
                            <a className="block text-sm font-medium text-slate-600 hover:text-blue-600" href="#courses">Courses</a>
                            <a className="block text-sm font-medium text-slate-600 hover:text-blue-600" href="#success">Success Stories</a>
                            <a className="block text-sm font-medium text-slate-600 hover:text-blue-600" href="#pricing">Pricing</a>
                        </div>
                    </div>
                )}
            </header>

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-40">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-orange-400 opacity-95"></div>

                {/* Decorative Blurs */}
                <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-orange-400 blur-3xl opacity-30"></div>
                <div className="absolute -left-20 bottom-0 h-96 w-96 rounded-full bg-blue-400 blur-3xl opacity-30"></div>

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
                        <div className="flex flex-col justify-center text-center lg:text-left">
                            <div className="inline-flex items-center self-center lg:self-start rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white ring-1 ring-inset ring-white/20 mb-6 backdrop-blur-sm">
                                <span className="mr-2 h-1.5 w-1.5 rounded-full bg-orange-300"></span>
                                New Exam Schedule Available
                            </div>

                            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl mb-6 leading-tight">
                                Master Your Exams.
                                <br className="hidden lg:block" />
                                <span className="text-orange-200">Build Your Future.</span>
                            </h1>

                            <p className="mx-auto lg:mx-0 max-w-lg text-lg text-blue-100 mb-10 leading-relaxed">
                                Join thousands of students achieving their dreams through our expert tutorials, rigorous practice exams, and community support.
                            </p>

                            {/* Search Bar */}

                        </div>

                        {/* Illustration Card */}
                        <div className="hidden lg:flex justify-center relative">
                            <div className="relative w-full max-w-md aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 border-4 border-white/10 bg-gradient-to-br from-purple-400 to-blue-500">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-white/30 text-6xl font-bold">📚</div>
                                </div>

                                {/* Floating Achievement Card */}
                                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/50">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-green-100 p-2 rounded-full text-green-600">
                                            <CheckCircle className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Daily Goal</p>
                                            <p className="text-slate-900 font-bold text-sm">Physics Quiz Completed</p>
                                        </div>
                                        <div className="ml-auto font-bold text-green-600 text-sm">+150 XP</div>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -z-10 top-10 -right-10 w-full h-full rounded-2xl border-2 border-white/20 border-dashed"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Banner */}
            <div className="bg-white border-b border-slate-100">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-100">
                        <div>
                            <div className="text-3xl font-black text-slate-900">1.5k+</div>
                            <div className="text-sm font-medium text-slate-500">Active Students</div>
                        </div>
                        <div>
                            <div className="text-3xl font-black text-slate-900">30+</div>
                            <div className="text-sm font-medium text-slate-500">Expert Tutors</div>
                        </div>
                        <div>
                            <div className="text-3xl font-black text-slate-900">95%</div>
                            <div className="text-sm font-medium text-slate-500">Pass Rate</div>
                        </div>
                        <div>
                            <div className="text-3xl font-black text-slate-900">24/7</div>
                            <div className="text-sm font-medium text-slate-500">Support Access</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* How It Works */}
            <section id="courses" className="py-24 bg-gray-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-blue-600 font-bold tracking-wide uppercase text-sm mb-3">PROCESS</h2>
                        <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Your Path to Success</h3>
                        <p className="text-slate-600 text-lg">
                            We simplify the learning process into three actionable steps designed to help you succeed in any exam.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {steps.map((step) => (
                            <div key={step.number} className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200">
                                <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-9xl text-slate-300 group-hover:text-blue-600 transition-colors select-none pointer-events-none">
                                    {step.number}
                                </div>
                                <div className={`h-14 w-14 rounded-xl bg-${step.color}-50 text-${step.color}-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    {step.icon}
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h4>
                                <p className="text-slate-600 leading-relaxed">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>



            {/* Success Stories */}
            <section id="success" className="py-24 bg-slate-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6">
                        <div className="text-left max-w-xl">
                            <h2 className="text-blue-600 font-bold tracking-wide uppercase text-sm mb-3">SUCCESS STORIES</h2>
                            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                                Don&apos;t just take our word for it.
                            </h3>
                            <p className="text-slate-600 text-lg">
                                See how BJOT Online Center has helped thousands of students achieve their certification goals.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <button className="flex items-center justify-center h-12 w-12 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 transition-colors">
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <button className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 transition-colors">
                                <ArrowRight className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div
                                key={testimonial.id}
                                className={`flex flex-col justify-between rounded-2xl bg-white p-8 shadow-sm border h-full ${index === 1 ? 'border-purple-100 shadow-lg lg:-translate-y-4' : 'border-slate-100'
                                    }`}
                            >
                                {index === 1 && (
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                                )}
                                <div>
                                    <div className="flex gap-1 text-orange-400 mb-6">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-5 w-5 ${i < Math.floor(testimonial.rating) ? 'fill-current' : ''
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <blockquote className="text-lg font-medium text-slate-800 leading-relaxed mb-6">
                                        `{testimonial.text}`
                                    </blockquote>
                                </div>
                                <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
                                    <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                                        {testimonial.image}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900">{testimonial.name}</div>
                                        <div className="text-sm text-slate-500">{testimonial.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section id="pricing" className="py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-90"></div>
                <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-black text-white sm:text-4xl mb-6">
                        Ready to start your learning journey?
                    </h2>
                    <p className="text-lg text-blue-100 mb-10 max-w-2xl mx-auto">
                        Sign up today and attempt your first practice exam.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                       <Link href="/register"> <button className="bg-white text-blue-600 hover:bg-slate-100 px-8 py-4 rounded-xl font-bold text-lg shadow-xl transition-colors">
                            Become a Student
                        </button> </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
                        <div className="col-span-2 lg:col-span-2 pr-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-bg rounded-xl flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">B</span>
                                </div>
                                <div>
                                    <span className="text-lg font-bold text-gray-900">BJOT</span>
                                </div>
                            </div>
                            <p className="text-slate-500 text-sm leading-relaxed mb-6">
                                Empowering students worldwide with accessible, high-quality education resources and examination preparation tools.
                            </p>
                            <div className="flex gap-4">
                                <a className="text-slate-400 hover:text-blue-600 transition-colors" href="#facebook">
                                    <Facebook className="h-6 w-6" />
                                </a>
                                <a className="text-slate-400 hover:text-blue-600 transition-colors" href="#twitter">
                                    <Twitter className="h-6 w-6" />
                                </a>
                                <a className="text-slate-400 hover:text-blue-600 transition-colors" href="#instagram">
                                    <Instagram className="h-6 w-6" />
                                </a>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-900 mb-4">Platform</h4>
                            <ul className="space-y-2 text-sm text-slate-500">
                                <li><a className="hover:text-blue-600 transition-colors" href="#browse">Browse Courses</a></li>
                                <li><a className="hover:text-blue-600 transition-colors" href="#stories">Success Stories</a></li>
                                <li><a className="hover:text-blue-600 transition-colors" href="#pricing">Pricing</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-900 mb-4">Company</h4>
                            <ul className="space-y-2 text-sm text-slate-500">
                                <li><a className="hover:text-blue-600 transition-colors" href="#about">About Us</a></li>
                                <li><a className="hover:text-blue-600 transition-colors" href="#careers">Careers</a></li>
                                <li><a className="hover:text-blue-600 transition-colors" href="#contact">Contact</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-900 mb-4">Support</h4>
                            <ul className="space-y-2 text-sm text-slate-500">
                                <li><a className="hover:text-blue-600 transition-colors" href="#help">Help Center</a></li>
                                <li><a className="hover:text-blue-600 transition-colors" href="#terms">Terms of Service</a></li>
                                <li><a className="hover:text-blue-600 transition-colors" href="#privacy">Privacy Policy</a></li>
                                <li><a className="hover:text-blue-600 transition-colors" href="#cookies">Cookie Settings</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-slate-400">© 2024 BJOT Online. All rights reserved.</p>
                        <div className="flex gap-6 text-sm text-slate-400">
                            <a className="hover:text-slate-600" href="#privacy">Privacy</a>
                            <a className="hover:text-slate-600" href="#terms">Terms</a>
                            <a className="hover:text-slate-600" href="#cookies">Cookies</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}