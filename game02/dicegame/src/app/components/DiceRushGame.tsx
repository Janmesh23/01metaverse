'use client';
import '../globals.css'; // Ensure global styles are imported

import React, { useState, useEffect } from 'react';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Flame, Zap, TrendingUp, Coins, Target, Timer } from 'lucide-react';

const DiceRushGame: React.FC = () => {
  const [userGuess, setUserGuess] = useState<number | null>(null);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [balance, setBalance] = useState<number>(1000); // Mock balance
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [gameResult, setGameResult] = useState<'win' | 'lose' | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [hotStreak, setHotStreak] = useState<boolean>(false);
  const [payout, setPayout] = useState<number>(0);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, delay: number}>>([]);

  // Dice components mapping
  const DiceComponents = {
    1: Dice1, 2: Dice2, 3: Dice3, 
    4: Dice4, 5: Dice5, 6: Dice6
  };

  // Generate particles for win animation
  const generateParticles = () => {
    const newParticles = [];
    for (let i = 0; i < 20; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 0.5
      });
    }
    setParticles(newParticles);
  };

  // Calculate payout based on guess accuracy
  const calculatePayout = (guess: number, result: number): number => {
    if (guess === result) {
      return betAmount * (hotStreak ? 6 : 5); // Exact match: 5x (6x during hot streak)
    } else if (Math.abs(guess - result) === 1) {
      return betAmount * (hotStreak ? 2.5 : 2); // Close guess: 2x (2.5x during hot streak)
    }
    return 0; // No payout
  };

  // Roll dice animation and logic
  const rollDice = async () => {
    if (!userGuess || betAmount > balance) return;
    
    setIsRolling(true);
    setShowResult(false);
    setGameResult(null);
    setPayout(0);
    
    // Deduct bet amount
    setBalance(prev => prev - betAmount);
    
    // Simulate rolling animation
    let rollCount = 0;
    const rollInterval = setInterval(() => {
      setDiceResult(Math.floor(Math.random() * 6) + 1);
      rollCount++;
      
      if (rollCount >= 15) { // Roll for ~1.5 seconds
        clearInterval(rollInterval);
        
        // Final result
        const finalResult = Math.floor(Math.random() * 6) + 1;
        setDiceResult(finalResult);
        
        // Calculate results
        const calculatedPayout = calculatePayout(userGuess, finalResult);
        const won = calculatedPayout > 0;
        
        setPayout(calculatedPayout);
        setGameResult(won ? 'win' : 'lose');
        
        // Update balance if won
        if (won) {
          setBalance(prev => prev + calculatedPayout);
          generateParticles();
        }
        
        // Update streak
        if (won) {
          const newStreak = streak + 1;
          setStreak(newStreak);
          setHotStreak(newStreak >= 3);
        } else {
          setStreak(0);
          setHotStreak(false);
        }
        
        setIsRolling(false);
        setShowResult(true);
        
        // Clear result after 3 seconds
        setTimeout(() => {
          setShowResult(false);
          setGameResult(null);
          setUserGuess(null);
        }, 3000);
      }
    }, 100);
  };

  // Dice selection component
  const DiceButton: React.FC<{ number: number }> = ({ number }) => {
    const DiceIcon = DiceComponents[number as keyof typeof DiceComponents];
    const isSelected = userGuess === number;
    
    return (
      <button
        onClick={() => setUserGuess(number)}
        className={`
          relative p-4 rounded-2xl transition-all duration-300 transform hover:scale-110
          ${isSelected 
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-2xl shadow-purple-500/50 scale-110' 
            : 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700'
          }
          border-2 ${isSelected ? 'border-purple-300' : 'border-gray-600'}
          backdrop-blur-sm
        `}
        disabled={isRolling}
      >
        <DiceIcon className={`w-8 h-8 ${isSelected ? 'text-white' : 'text-gray-300'}`} />
        {isSelected && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <Target className="w-3 h-3 text-white" />
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-40 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Win Particles */}
      {gameResult === 'win' && (
        <div className="absolute inset-0 pointer-events-none">
          {particles.map(particle => (
            <div
              key={particle.id}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                animationDelay: `${particle.delay}s`
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
            🎲 DICE RUSH
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Guess the dice, win the prize! Hot streaks multiply your rewards! 🔥
          </p>
          
          {/* Stats Bar */}
          <div className="flex justify-center space-x-8 mb-8">
            <div className="bg-black/30 backdrop-blur-sm rounded-2xl px-6 py-3 border border-gray-700">
              <div className="flex items-center space-x-2">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="text-gray-300">Balance:</span>
                <span className="text-yellow-400 font-bold">{balance}</span>
              </div>
            </div>
            
            <div className={`bg-black/30 backdrop-blur-sm rounded-2xl px-6 py-3 border ${hotStreak ? 'border-orange-500 shadow-orange-500/50' : 'border-gray-700'}`}>
              <div className="flex items-center space-x-2">
                {hotStreak ? <Flame className="w-5 h-5 text-orange-400" /> : <TrendingUp className="w-5 h-5 text-blue-400" />}
                <span className="text-gray-300">Streak:</span>
                <span className={`font-bold ${hotStreak ? 'text-orange-400' : 'text-blue-400'}`}>{streak}</span>
                {hotStreak && <span className="text-orange-400 text-sm">🔥 HOT!</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Game Area */}
        <div className="max-w-4xl mx-auto">
          {/* Dice Display */}
          <div className="text-center mb-12">
            <div className="relative inline-block">
              <div className={`
                w-32 h-32 rounded-3xl bg-gradient-to-br from-white to-gray-100 
                flex items-center justify-center shadow-2xl transition-all duration-300
                ${isRolling ? 'animate-spin' : ''}
                ${gameResult === 'win' ? 'shadow-green-500/50 ring-4 ring-green-400' : ''}
                ${gameResult === 'lose' ? 'shadow-red-500/50 ring-4 ring-red-400' : ''}
              `}>
                {diceResult && !isRolling ? (
                  React.createElement(DiceComponents[diceResult as keyof typeof DiceComponents], { 
                    className: `w-16 h-16 ${gameResult === 'win' ? 'text-green-600' : gameResult === 'lose' ? 'text-red-600' : 'text-gray-800'}` 
                  })
                ) : (
                  <div className="w-16 h-16 bg-gray-400 rounded-lg animate-pulse"></div>
                )}
              </div>
              
              {/* Rolling indicator */}
              {isRolling && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                  <div className="flex items-center space-x-2 text-purple-400">
                    <Timer className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-medium">Rolling...</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Result Display */}
          {showResult && (
            <div className="text-center mb-8">
              <div className={`
                inline-block px-8 py-4 rounded-2xl font-bold text-2xl
                ${gameResult === 'win' 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-2xl shadow-green-500/50' 
                  : 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-2xl shadow-red-500/50'
                }
                animate-bounce
              `}>
                {gameResult === 'win' ? (
                  <div className="flex items-center space-x-2">
                    <Zap className="w-6 h-6" />
                    <span>YOU WON! +{payout} tokens!</span>
                    <Zap className="w-6 h-6" />
                  </div>
                ) : (
                  <span>Better luck next time! 💪</span>
                )}
              </div>
            </div>
          )}

          {/* Guess Selection */}
          <div className="bg-black/20 backdrop-blur-sm rounded-3xl p-8 border border-gray-700 mb-8">
            <h3 className="text-2xl font-bold text-center text-white mb-6">
              🎯 Pick Your Lucky Number
            </h3>
            <div className="grid grid-cols-6 gap-4 max-w-2xl mx-auto mb-8">
              {[1, 2, 3, 4, 5, 6].map(number => (
                <DiceButton key={number} number={number} />
              ))}
            </div>
            
            {/* Bet Amount */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <span className="text-gray-300 font-medium">Bet Amount:</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setBetAmount(Math.max(5, betAmount - 5))}
                  className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 text-white font-bold transition-colors"
                  disabled={isRolling}
                >
                  -
                </button>
                <div className="bg-gray-800 px-6 py-2 rounded-xl border border-gray-600">
                  <span className="text-yellow-400 font-bold text-xl">{betAmount}</span>
                </div>
                <button
                  onClick={() => setBetAmount(Math.min(balance, betAmount + 5))}
                  className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 text-white font-bold transition-colors"
                  disabled={isRolling}
                >
                  +
                </button>
              </div>
            </div>

            {/* Quick Bet Buttons */}
            <div className="flex justify-center space-x-2 mb-8">
              {[10, 25, 50, 100].map(amount => (
                <button
                  key={amount}
                  onClick={() => setBetAmount(amount)}
                  className={`px-4 py-2 rounded-xl transition-all ${
                    betAmount === amount
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  disabled={isRolling || amount > balance}
                >
                  {amount}
                </button>
              ))}
            </div>

            {/* Roll Button */}
            <div className="text-center">
              <button
                onClick={rollDice}
                disabled={!userGuess || betAmount > balance || isRolling}
                className={`
                  px-12 py-4 rounded-2xl font-bold text-xl transition-all duration-300 transform
                  ${!userGuess || betAmount > balance || isRolling
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-2xl shadow-purple-500/50 hover:scale-105'
                  }
                `}
              >
                {isRolling ? '🎲 Rolling...' : '🚀 ROLL THE DICE!'}
              </button>
            </div>
          </div>

          {/* Game Rules */}
          <div className="bg-black/20 backdrop-blur-sm rounded-3xl p-6 border border-gray-700">
            <h4 className="text-xl font-bold text-white mb-4">🏆 How to Win:</h4>
            <div className="grid md:grid-cols-3 gap-4 text-gray-300">
              <div className="text-center">
                <div className="text-2xl mb-2">🎯</div>
                <div className="font-semibold text-green-400">Exact Match</div>
                <div className="text-sm">5x payout {hotStreak && '(6x during hot streak!)'}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">📍</div>
                <div className="font-semibold text-blue-400">Close Guess (±1)</div>
                <div className="text-sm">2x payout {hotStreak && '(2.5x during hot streak!)'}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🔥</div>
                <div className="font-semibold text-orange-400">Hot Streak</div>
                <div className="text-sm">3+ wins in a row = bonus multipliers!</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiceRushGame;