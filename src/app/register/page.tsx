'use client'

import { QuestionSet } from "@/types/global";
import { Mail, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";



export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [selectedQuestionSets, setSelectedQuestionSets] = useState<string[]>([]);
    const [questionSets, setQuestionSetsData] = useState<QuestionSet[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function fetchQuestionSets() {
        try {
            setIsLoading(true);
            const response = await fetch('/api/question-set', {
                cache: 'no-store',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch question sets');
            }
            const data = await response.json();
            console.log('Fetched question sets:', data);
            setQuestionSetsData(data);
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            console.error('Error fetching question sets:', error);
            setError('Failed to load question sets. Please try again later.');
        }

    }

    useEffect(() => {
        fetchQuestionSets();
    }, []);

    const handleQuestionSetToggle = (questionSetId: string) => {
        setSelectedQuestionSets(prev => {
            if (prev.includes(questionSetId)) {
                return prev.filter(id => id !== questionSetId);
            } else if (prev.length < 4) {
                return [...prev, questionSetId];
            } else {
                alert('You can only select 4 question sets');
                return prev;
            }
        });
    };

    const handleRegister = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    firstname: name.split(' ')[0],
                    lastname: name.split(' ').slice(1).join(' '),
                    selectedQuestionSets,
                    accountType: "premium"
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }
            // Registration successful, redirect to login
            router.push('/login');
        } catch (error) {
            setError(error instanceof Error ? error.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    }
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            {/* Header */}
            {/* <div className="max-w-7xl mx-auto space-y-6 py-5">
                <DashboardHeader />
            </div> */}

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-12">
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                    {/* Welcome Section */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                            <div className="w-15 h-15 bg-blue-bg rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-2xl">B</span>
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">
                            BJOT Portal
                        </h2>
                        <p className="text-md text-gray-600 max-w-2xl mx-auto">
                            Enter your information and select your subject combination to get access to the BJOT Portal.
                        </p>
                    </div>

                    {/* Form */}
                    <div className="space-y-6">
                        {/* Email Input */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Email Address *
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="email"
                                    placeholder="your.email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Name Input */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Full Name (Firstname and Lastname) *
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Question Set Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Select Your Subject Combination * (Choose exactly 4)
                            </label>
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-sm text-gray-600">
                                    Selected: <span className="font-semibold text-indigo-600">{selectedQuestionSets.length}/4</span>
                                </p>
                                {selectedQuestionSets.length === 4 && (
                                    <span className="text-sm text-green-600 font-semibold">✓ Complete</span>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
                                {questionSets.map((qs) => (
                                    <label
                                        key={qs._id}
                                        className={`flex items-center p-4 rounded-lg cursor-pointer transition-all ${selectedQuestionSets.includes(qs._id)
                                            ? 'bg-indigo-600 text-white shadow-md transform scale-105'
                                            : 'bg-white border-2 border-gray-200 hover:border-indigo-300 hover:shadow-sm'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedQuestionSets.includes(qs._id)}
                                            onChange={() => handleQuestionSetToggle(qs._id)}
                                            disabled={isLoading || (!selectedQuestionSets.includes(qs._id) && selectedQuestionSets.length >= 4)}
                                            className="rounded border-gray-300 mr-3"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-medium text-md truncate ${selectedQuestionSets.includes(qs._id) ? 'text-white' : 'text-gray-900'
                                                }`}>
                                                {qs.title}
                                            </p>
                                        </div>
                                        {selectedQuestionSets.includes(qs._id) && (
                                            <span className="ml-2 px-2.5 py-1 bg-white text-indigo-600 text-xs font-bold rounded-full">
                                                #{selectedQuestionSets.indexOf(qs._id) + 1}
                                            </span>
                                        )}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-700 font-medium">{error}</p>
                            </div>
                        )}
                        <button
                            onClick={() => {
                                handleRegister();
                            }}
                            disabled={isLoading || !email || !name || selectedQuestionSets.length !== 4}
                            className="w-full py-4 bg-indigo-600 text-white rounded-lg font-semibold text-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Loading...
                                </>
                            ) : (
                                <>

                                    Resgister
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </main>
        </div>

    );
}