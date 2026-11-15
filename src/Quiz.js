import React, { useState, useEffect } from 'react';

const MOON_QUESTIONS = [
  { q: "Which Apollo module was famously named 'Eagle'?", options: ["Apollo 11", "Apollo 12", "Apollo 15", "Surveyor 3"], a: "Apollo 11" },
  { q: "What was the primary goal of the Surveyor 3 probe?", options: ["Prove the dust was solid enough for landing", "Take the first color photo", "Test the Lunar Rover", "Deploy a seismometer"], a: "Prove the dust was solid enough for landing" },
  { q: "Which Apollo mission deployed the first Lunar Roving Vehicle (LRV)?", options: ["Apollo 11", "Apollo 12", "Apollo 15", "Apollo 17"], a: "Apollo 15" },
  { q: "Where did Apollo 11 land?", options: ["Ocean of Storms", "Sea of Tranquility", "Hadley-Apennine", "Tycho Crater"], a: "Sea of Tranquility" },
  { q: "The Apollo 12 mission proved what key capability?", options: ["Pinpoint landing", "Driving a rover", "Long-term radiation survival", "Taking color TV footage"], a: "Pinpoint landing" },
  { q: "Which robotic probe is the only one ever visited by humans on another world?", options: ["Surveyor 1", "Surveyor 3", "Ranger 7", "Luna 2"], a: "Surveyor 3" },
  { q: "What was the top speed of the Lunar Roving Vehicle?", options: ["3 mph", "8 mph", "15 mph", "25 mph"], a: "8 mph" },
  { q: "The Saturn V rocket for Apollo 12 was struck by what during launch?", options: ["A bird", "Space debris", "Lightning", "A meteor"], a: "Lightning" },
  { q: "Apollo 11 left behind a silicon disk carrying messages from how many countries?", options: ["12", "50", "73", "104"], a: "73" },
  { q: "Apollo 15 landed in the Hadley-Apennine region, which is nestled near what?", options: ["A massive mountain range and a gorge", "A frozen ice cap", "A field of glass beads", "An active volcano"], a: "A massive mountain range and a gorge" }
];

const MARS_QUESTIONS = [
  { q: "Which was the first wheeled vehicle to ever drive on another planet?", options: ["Curiosity", "Opportunity", "Sojourner", "Spirit"], a: "Sojourner" },
  { q: "What was the Opportunity rover's famous final message translated as?", options: ["Mission complete.", "My battery is low and it's getting dark.", "See you space cowboy.", "Awaiting solar recharge."], a: "My battery is low and it's getting dark." },
  { q: "Ingenuity was designed for 5 flights. How many did it actually complete?", options: ["12", "34", "72", "101"], a: "72" },
  { q: "Which lander was the first to physically touch and analyze water ice on another planet?", options: ["Viking 1", "InSight", "Pathfinder", "Phoenix"], a: "Phoenix" },
  { q: "How did the Mars Pathfinder safely land on the surface?", options: ["Powered jetpack descent", "Bouncing on giant airbags", "Parachute only", "Helicopter sky crane"], a: "Bouncing on giant airbags" },
  { q: "What caused the Spirit rover to eventually end its mission?", options: ["A fried computer", "Got permanently stuck in soft sand", "A damaged wheel", "Fell into a crater"], a: "Got permanently stuck in soft sand" },
  { q: "The InSight lander measured the planet's pulse by detecting what?", options: ["Magnetic shifts", "Marsquakes", "Dust storms", "Radiation spikes"], a: "Marsquakes" },
  { q: "Viking 1 was the first U.S. spacecraft to do what?", options: ["Successfully land on Mars and complete its mission", "Drive a rover", "Fly a helicopter", "Find flowing water"], a: "Successfully land on Mars and complete its mission" },
  { q: "Where was the Ingenuity helicopter stored during its journey to Mars?", options: ["Inside the heat shield", "Strapped to the belly of the Perseverance rover", "On top of the lander deck", "In a dedicated pod"], a: "Strapped to the belly of the Perseverance rover" },
  { q: "Spirit discovered that ancient Mars had hot springs and steam vents. What did this prove?", options: ["Mars is still volcanically active", "The planet once had energy and water to support life", "Mars used to be hotter than Earth", "There are underground lava tubes"], a: "The planet once had energy and water to support life" }
];

export default function Quiz({ planet, onClose, playClick }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const themeColor = planet === 'mars' ? '#E27B58' : '#40E0D0';

  useEffect(() => {
    // Select the correct bank, shuffle it, and pick the first 5
    const bank = planet === 'mars' ? MARS_QUESTIONS : MOON_QUESTIONS;
    const shuffled = [...bank].sort(() => 0.5 - Math.random()).slice(0, 5);
    
    // Shuffle the options within each question so the correct answer isn't always in the same spot
    const fullyShuffled = shuffled.map(q => ({
      ...q,
      options: [...q.options].sort(() => 0.5 - Math.random())
    }));
    
    setQuestions(fullyShuffled);
  }, [planet]);

  const handleAnswer = (option) => {
    if (playClick) playClick();
    setSelectedAnswer(option);
    
    if (option === questions[currentIndex].a) {
      setScore(prev => prev + 1);
    }

    // Wait a brief moment so the user sees their selection, then move on
    setTimeout(() => {
      setSelectedAnswer(null);
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setShowResults(true);
      }
    }, 1000);
  };

  if (questions.length === 0) return null;

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)', display: 'flex',
      justifyContent: 'center', alignItems: 'center', zIndex: 100
    }}>
      <div style={{
        backgroundColor: '#111', border: `2px solid ${themeColor}`,
        borderRadius: '12px', padding: '40px', width: '90%', maxWidth: '600px',
        boxShadow: `0 0 30px ${themeColor}66`, textAlign: 'center', position: 'relative'
      }}>
        
        <button 
          onClick={onClose}
          style={{
            position: 'absolute', top: '15px', right: '20px',
            backgroundColor: 'transparent', color: themeColor, 
            border: 'none', fontSize: '30px', cursor: 'pointer', fontWeight: 'bold'
          }}
        >
          ×
        </button>

        {!showResults ? (
          <>
            <h2 style={{ color: themeColor, marginTop: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>
              {planet} Exploration Quiz
            </h2>
            <p style={{ color: '#aaa', marginBottom: '30px' }}>Question {currentIndex + 1} of 5</p>
            
            <h3 style={{ color: '#fff', fontSize: '22px', lineHeight: '1.5', marginBottom: '30px' }}>
              {questions[currentIndex].q}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {questions[currentIndex].options.map((option, i) => {
                let bgColor = '#222';
                let borderColor = '#444';
                
                // Show visual feedback during the 1-second timeout
                if (selectedAnswer) {
                  if (option === questions[currentIndex].a) {
                    bgColor = '#2e7d32'; // Correct gets green
                    borderColor = '#4caf50';
                  } else if (option === selectedAnswer) {
                    bgColor = '#c62828'; // Incorrect selection gets red
                    borderColor = '#ef5350';
                  }
                }

                return (
                  <button
                    key={i}
                    disabled={!!selectedAnswer}
                    onClick={() => handleAnswer(option)}
                    style={{
                      backgroundColor: bgColor, color: 'white',
                      border: `1px solid ${borderColor}`, borderRadius: '8px',
                      padding: '15px 20px', fontSize: '18px', cursor: selectedAnswer ? 'default' : 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <h2 style={{ color: themeColor, fontSize: '36px', marginTop: 0 }}>Quiz Complete!</h2>
            <p style={{ color: '#fff', fontSize: '24px', margin: '30px 0' }}>
              You scored <strong style={{ color: themeColor, fontSize: '32px' }}>{score}</strong> out of 5!
            </p>
            
            {score === 5 && <p style={{ color: '#e5b13a', fontSize: '20px', fontStyle: 'italic' }}>Flawless run! You are a true historian of the cosmos.</p>}
            {score < 5 && score >= 3 && <p style={{ color: '#aaa', fontSize: '18px' }}>Great job! Seems like someone has done their research!</p>}
            {score < 3 && <p style={{ color: '#aaa', fontSize: '18px' }}>Better luck next time!</p>}

            <button 
              onClick={onClose}
              style={{
                backgroundColor: 'transparent', color: themeColor, border: `2px solid ${themeColor}`,
                padding: '12px 30px', fontSize: '20px', cursor: 'pointer', borderRadius: '8px',
                marginTop: '20px', fontWeight: 'bold', textTransform: 'uppercase'
              }}
            >
              Return to Surface
            </button>
          </>
        )}
      </div>
    </div>
  );
}