'use client';

import { useRouter } from 'next/navigation';

export default function GameHub() {
  const router = useRouter();

  const games = [
    {
      id: 'time-attack',
      name: 'Time Attack',
      description: 'Race against the clock',
      icon: '⏱️',
      color: 'from-blue-400 to-blue-600',
      route: '/time-attack',
    },
    {
      id: 'sudden-death',
      name: 'Sudden Death',
      description: 'One wrong move and it\'s over',
      icon: '⚡',
      color: 'from-red-400 to-red-600',
      route: '/sudden-death',
    },
    {
      id: 'scholars-wager',
      name: 'Scholar\'s Wager',
      description: 'Bet points on your confidence',
      icon: '💰',
      color: 'from-yellow-400 to-yellow-600',
      route: '/scholars-wager',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-3xl font-bold text-gray-900 mb-4">
            Game Hub
          </h1>
          <p className="text-md text-gray-600">
            Choose your challenge
          </p>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => router.push(game.route)}
              className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
              
              {/* Content */}
              <div className="relative p-8">
                {/* Icon */}
                <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform">
                  {game.icon}
                </div>
                
                {/* Name */}
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {game.name}
                </h2>
                
                {/* Description */}
                <p className="text-gray-600">
                  {game.description}
                </p>
                
                {/* Play Arrow */}
                <div className="mt-6 flex items-center justify-center">
                  <div className={`bg-gradient-to-r ${game.color} text-white px-6 py-2 rounded-full font-semibold flex items-center space-x-2 group-hover:px-8 transition-all`}>
                    <span>Play</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Additional Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Leaderboard */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900">Leaderboard</h3>
            </div>
            <p className="text-gray-600 mb-4">See who&apos;s on top</p>
            <button 
              onClick={() => router.push('/scholars-wager/leaderboard')}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              View Rankings →
            </button>
          </div>

          {/* History */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900">Game History</h3>
            </div>
            <p className="text-gray-600 mb-4">Review your past games</p>
            <button 
              onClick={() => router.push('/scholars-wager/history')}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              View History →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}