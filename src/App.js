import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import MoonModel from './MoonModel';
import MarsModel from './MarsModel';
import ArtifactCard from './ArtifactCard';
import Quiz from './Quiz'; 
import './App.css'; 

const MOON_CHAN_DIALOGUES = [
  { sprite: "moonchandefault.png", speaker: "Moon-chan", text: "Greetings, explorer! My name's moon-chan, and I'm quite literally the living personification of the moon!" },
  { sprite: "moonchanhappy.png", speaker: "Moon-chan", text: "I'll say, it's been a hot minute since I've had visitors from Earth! Say hi to Earth-chan for me!" },
  { sprite: "moonchanthink.png", speaker: "Moon-chan", text: "Hmm... You know, over the decades, your space agencies have left a lot of fascinating equipment scattered across my surface. They've been sitting out here in the dark for a long time." },
  { sprite: "moonchanhappy.png", speaker: "Moon-chan", text: "But fear not, I've been keeping them, hoping that someone like you would show up to rediscover them!" },
  { sprite: "moonchandefault.png", speaker: "Moon-chan", text: "You can click and drag to spin me around, and scroll to zoom in and out." },
  { sprite: "moonchanhappy.png", speaker: "Moon-chan", text: "See those turquoise-coloured points on my surface? That's where you humans left your equipment...so what are you waiting for! Click on them to investigate!" }
];

const COMPLETION_DIALOGUES = [
  { sprite: "moonchanhappy.png", speaker: "Moon-chan", text: "Oh, it seems that you've explored all the discarded equipment sites on my surface!" },
  { sprite: "moonchanremember.png", speaker: "Moon-chan", text: "Oh yeah, that reminds me! Mars-chan said that there was some abandoned equipment left on her as well! Maybe you should pay her a visit as well..." },
  { sprite: "moonchanhappy.png", speaker: "Moon-chan", text: "Or, you could take a quiz to test your understanding about the artifacts you've discovered by clicking the \"Take Quiz\" button!" }
];

const MARS_CHAN_DIALOGUES = [
  { sprite: "marschanconfused.png", speaker: "Mars-chan", text: "Uhh..." },
  { sprite: "marschanconfused.png", speaker: "Mars-chan", text: "I've never seen a machine that looks like you...." },
  { sprite: "marschansurprised.png", speaker: "Mars-chan", text: "OHH!!" },
  { sprite: "marschanhappy.png", speaker: "Mars-chan", text: "You're that earthling that moon-chan said was coming here! Welcome!" },
  { sprite: "marschanthink.png", speaker: "Mars-chan", text: "Now that I think about it, you're the first earthling that's ever visited me...ain't that something!" },
  { sprite: "marschandefault.png", speaker: "Mars-chan", text: "But anyway, I know what you're here for! And don't worry, those funny machines you're looking for haven't gone anywhere!" },
  { sprite: "marschanhappy.png", speaker: "Mars-chan", text: "Stay safe exploring!" }
];

const MARS_COMPLETION_DIALOGUES = [
  { sprite: "marschanhappy.png", speaker: "Mars-chan", text: "Woah! Seems like you've found them all! Great Job!" },
  { sprite: "marschandefault.png", speaker: "Mars-chan", text: "While you're here, why not test your understanding about the artifacts you've discovered on my surface?" }
];

const MOON_ARTIFACT_IDS = ["apollo11", "surveyor3", "apollo12", "apollo15"];
const MARS_ARTIFACT_IDS = ["viking1", "pathfinder", "opportunity", "ingenuity", "spirit", "phoenix", "insight"];

export default function App() {
  const [hasStarted, setHasStarted] = useState(false);
  
  const [activeArtifact, setActiveArtifact] = useState(null);
  const [currentPlanet, setCurrentPlanet] = useState('moon'); 
  
  const [showIntro, setShowIntro] = useState(true); 
  const [showQuiz, setShowQuiz] = useState(false); 
  
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [marsDialogueIndex, setMarsDialogueIndex] = useState(0);
  
  const [visitedArtifacts, setVisitedArtifacts] = useState([]);
  const [dustedArtifacts, setDustedArtifacts] = useState([]); 
  
  const [showCompletionDialogue, setShowCompletionDialogue] = useState(false);
  const [completionIndex, setCompletionIndex] = useState(0);
  const [hasShownCompletion, setHasShownCompletion] = useState(false);

  const [showMarsCompletionDialogue, setShowMarsCompletionDialogue] = useState(false);
  const [marsCompletionIndex, setMarsCompletionIndex] = useState(0);
  const [hasShownMarsCompletion, setHasShownMarsCompletion] = useState(false);

  // --- AUDIO SETUP ---
  const introBgmRef = useRef(null);
  const spaceBgmRef = useRef(null);

  useEffect(() => {
    introBgmRef.current = new Audio('/starwarstheme.mp3');
    spaceBgmRef.current = new Audio('/spacebgm.mp3');
    spaceBgmRef.current.loop = true; 
    
    return () => {
      if (introBgmRef.current) introBgmRef.current.pause();
      if (spaceBgmRef.current) spaceBgmRef.current.pause();
    };
  }, []);

  // Handle BGM switching
  useEffect(() => {
    if (hasStarted) {
      if (showIntro) {
        introBgmRef.current.play().catch(e => console.log("Audio blocked:", e));
      } else {
        introBgmRef.current.pause();
        introBgmRef.current.currentTime = 0; 
        spaceBgmRef.current.play().catch(e => console.log("Audio blocked:", e));
      }
    }
  }, [hasStarted, showIntro]);

  const playClick = () => {
    if (!hasStarted) return;
    const clickSound = new Audio('/click.mp3');
    clickSound.play().catch(e => console.log("Click sound blocked:", e));
  };

  const playUnlock = () => {
    if (!hasStarted) return;
    const unlockSound = new Audio('/unlock.mp3');
    unlockSound.play().catch(e => console.log("Unlock sound blocked:", e));
  };
  // -------------------

  const isMoonComplete = MOON_ARTIFACT_IDS.every(id => visitedArtifacts.includes(id));
  const isMarsComplete = MARS_ARTIFACT_IDS.every(id => visitedArtifacts.includes(id));

  const canTakeQuiz = (currentPlanet === 'moon' && isMoonComplete) || (currentPlanet === 'mars' && isMarsComplete);
  const isGameplayActive = !showIntro && !activeArtifact && !showCompletionDialogue && !showMarsCompletionDialogue && !showQuiz;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        const isDialogueActive = 
          (currentPlanet === 'moon' && (!showIntro && dialogueIndex < MOON_CHAN_DIALOGUES.length)) ||
          (currentPlanet === 'moon' && showCompletionDialogue) ||
          (currentPlanet === 'mars' && marsDialogueIndex < MARS_CHAN_DIALOGUES.length) ||
          (currentPlanet === 'mars' && showMarsCompletionDialogue);

        if (isDialogueActive) {
          playClick(); 
        }

        if (currentPlanet === 'moon') {
          if (!showIntro && dialogueIndex < MOON_CHAN_DIALOGUES.length) {
            setDialogueIndex((prev) => prev + 1);
          } else if (showCompletionDialogue && completionIndex < COMPLETION_DIALOGUES.length) {
            const nextIndex = completionIndex + 1;
            setCompletionIndex(nextIndex);
            if (nextIndex >= COMPLETION_DIALOGUES.length) {
              setShowCompletionDialogue(false);
              setHasShownCompletion(true);
            }
          }
        } else if (currentPlanet === 'mars') {
          if (marsDialogueIndex < MARS_CHAN_DIALOGUES.length) {
            setMarsDialogueIndex((prev) => prev + 1);
          } else if (showMarsCompletionDialogue && marsCompletionIndex < MARS_COMPLETION_DIALOGUES.length) {
            const nextIndex = marsCompletionIndex + 1;
            setMarsCompletionIndex(nextIndex);
            if (nextIndex >= MARS_COMPLETION_DIALOGUES.length) {
              setShowMarsCompletionDialogue(false);
              setHasShownMarsCompletion(true);
            }
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showIntro, dialogueIndex, showCompletionDialogue, completionIndex, currentPlanet, marsDialogueIndex, showMarsCompletionDialogue, marsCompletionIndex]);

  const isGameLocked = !hasStarted || showIntro || showQuiz ||
    (currentPlanet === 'moon' && dialogueIndex < MOON_CHAN_DIALOGUES.length) || 
    (currentPlanet === 'moon' && showCompletionDialogue) ||
    (currentPlanet === 'mars' && marsDialogueIndex < MARS_CHAN_DIALOGUES.length) ||
    (currentPlanet === 'mars' && showMarsCompletionDialogue);

  let activeDialogueObj = null;
  if (currentPlanet === 'moon') {
    if (!showIntro && dialogueIndex < MOON_CHAN_DIALOGUES.length) {
      activeDialogueObj = MOON_CHAN_DIALOGUES[dialogueIndex];
    } else if (showCompletionDialogue && completionIndex < COMPLETION_DIALOGUES.length) {
      activeDialogueObj = COMPLETION_DIALOGUES[completionIndex];
    }
  } else if (currentPlanet === 'mars') {
    if (marsDialogueIndex < MARS_CHAN_DIALOGUES.length) {
      activeDialogueObj = MARS_CHAN_DIALOGUES[marsDialogueIndex];
    } else if (showMarsCompletionDialogue && marsCompletionIndex < MARS_COMPLETION_DIALOGUES.length) {
      activeDialogueObj = MARS_COMPLETION_DIALOGUES[marsCompletionIndex];
    }
  }

  const handleCloseArtifact = () => {
    playClick();
    setActiveArtifact(null);

    if (currentPlanet === 'moon') {
      const visitedMoonCount = visitedArtifacts.filter(id => MOON_ARTIFACT_IDS.includes(id)).length;
      if (visitedMoonCount === MOON_ARTIFACT_IDS.length && !hasShownCompletion) {
        setShowCompletionDialogue(true);
      }
    } else if (currentPlanet === 'mars') {
      const visitedMarsCount = visitedArtifacts.filter(id => MARS_ARTIFACT_IDS.includes(id)).length;
      if (visitedMarsCount === MARS_ARTIFACT_IDS.length && !hasShownMarsCompletion) {
        setShowMarsCompletionDialogue(true);
      }
    }
  };

  const speakerColor = activeDialogueObj?.speaker === 'Mars-chan' ? '#E27B58' : '#40E0D0';

  if (!hasStarted) {
    return (
      <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <button 
          onClick={() => {
            playClick();
            setHasStarted(true);
          }}
          style={{
            backgroundColor: 'transparent', color: '#40E0D0', border: '2px solid #40E0D0',
            padding: '20px 40px', fontSize: '24px', cursor: 'pointer', borderRadius: '8px',
            textTransform: 'uppercase', letterSpacing: '4px', boxShadow: '0 0 20px rgba(64, 224, 208, 0.4)'
          }}
        >
          Begin Exploration
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000', position: 'relative', overflow: 'hidden' }}>
      
      {showIntro && (
        <div className="intro-overlay">
          <button 
            onClick={() => { playClick(); setShowIntro(false); }}
            style={{
              position: 'absolute', top: '20px', right: '20px', zIndex: 110,
              backgroundColor: 'white', color: 'black', border: 'none',
              padding: '10px 20px', fontWeight: 'bold', cursor: 'pointer',
              borderRadius: '4px', textTransform: 'uppercase'
            }}
          >
            Skip Intro
          </button>

          <div className="crawl-container">
            <div className="crawl-text" onAnimationEnd={() => setShowIntro(false)}>
              <p style={{ textAlign: 'center' }}>
                A not so long time ago, in a galaxy not so far, far away...
              </p>
              <p>
                Since the 1960s, NASA has left hardware across the solar system–on the Moon, on Mars, and in deep space.
              </p>
              <p>
                It is up to you, fellow explorer, to navigate the cosmos and rediscover the abandoned equipment!
              </p>
              <p style={{ textAlign: 'center', fontSize: '3.5rem', marginTop: '80px' }}>
                Are you up for it?
              </p>
            </div>
          </div>
        </div>
      )}

      {isGameplayActive && isMoonComplete && (
        <button 
          onClick={() => { playClick(); setCurrentPlanet(currentPlanet === 'moon' ? 'mars' : 'moon'); }}
          style={{
            position: 'absolute', top: '20px', right: '30px', zIndex: 110,
            backgroundColor: currentPlanet === 'moon' ? '#E27B58' : '#40E0D0', 
            color: 'black', border: 'none', padding: '12px 24px', 
            fontWeight: 'bold', cursor: 'pointer', borderRadius: '8px', 
            textTransform: 'uppercase', fontSize: '16px',
            boxShadow: `0 0 15px ${currentPlanet === 'moon' ? '#E27B58' : '#40E0D0'}`,
            transition: 'all 0.3s'
          }}
        >
          {currentPlanet === 'moon' ? 'GO TO MARS ▶' : '◀ RETURN TO MOON'}
        </button>
      )}

      {isGameplayActive && canTakeQuiz && (
        <button 
          onClick={() => { playClick(); setShowQuiz(true); }}
          style={{
            position: 'absolute', top: '80px', right: '30px', zIndex: 110,
            backgroundColor: 'transparent', 
            color: currentPlanet === 'moon' ? '#40E0D0' : '#E27B58', 
            border: `2px solid ${currentPlanet === 'moon' ? '#40E0D0' : '#E27B58'}`, 
            padding: '10px 24px', fontWeight: 'bold', cursor: 'pointer', borderRadius: '8px', 
            textTransform: 'uppercase', fontSize: '16px',
            transition: 'all 0.3s',
            backdropFilter: 'blur(5px)'
          }}
        >
          TAKE QUIZ
        </button>
      )}

      {!showIntro && (
        <div style={{
          position: 'absolute', top: '25px', left: '30px', 
          color: currentPlanet === 'moon' ? '#40E0D0' : '#E27B58',
          fontSize: '48px', fontFamily: 'sans-serif', fontWeight: 'bold',
          letterSpacing: '6px', textTransform: 'uppercase', zIndex: 5,
          textShadow: `0 0 15px ${currentPlanet === 'moon' ? 'rgba(64, 224, 208, 0.6)' : 'rgba(226, 123, 88, 0.6)'}`
        }}>
          {currentPlanet === 'moon' ? 'The Moon' : 'Mars'}
        </div>
      )}

      {activeDialogueObj && !showQuiz && (
        <div style={{
          position: 'absolute', bottom: '0', left: '10%', right: '10%',
          display: 'flex', alignItems: 'flex-end', zIndex: 20, pointerEvents: 'none'
        }}>
          <img 
            src={`/${activeDialogueObj.sprite}`} 
            alt={activeDialogueObj.speaker}
            style={{ height: '400px', objectFit: 'contain', marginRight: '20px', pointerEvents: 'auto' }} 
          />
          <div style={{
            flex: 1, backgroundColor: 'rgba(10, 20, 30, 0.9)',
            border: `2px solid ${speakerColor}`, borderRadius: '12px',
            padding: '25px', color: 'white', fontFamily: 'sans-serif',
            fontSize: '22px', lineHeight: '1.6',
            boxShadow: `0 0 20px ${speakerColor}66`,
            marginBottom: '40px', pointerEvents: 'auto'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: speakerColor, fontSize: '24px' }}>{activeDialogueObj.speaker}</h3>
            <p style={{ margin: 0 }}>{activeDialogueObj.text}</p>
            <p style={{ margin: '15px 0 0 0', fontSize: '14px', color: '#888', textAlign: 'right', fontStyle: 'italic' }}>
              Press [ENTER] to continue...
            </p>
          </div>
        </div>
      )}

      <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <ambientLight intensity={1.5} color="#ffffff" /> 

        {!showIntro && (
          <Suspense fallback={null}>
            {currentPlanet === 'moon' ? (
              <MoonModel 
                setActiveArtifact={(artifact) => {
                  playClick(); 
                  setActiveArtifact(artifact);
                  setVisitedArtifacts((prev) => prev.includes(artifact.id) ? prev : [...prev, artifact.id]);
                }} 
                dustedArtifacts={dustedArtifacts} 
              />
            ) : (
              <MarsModel 
                setActiveArtifact={(artifact) => {
                  playClick(); 
                  setActiveArtifact(artifact);
                  setVisitedArtifacts((prev) => prev.includes(artifact.id) ? prev : [...prev, artifact.id]);
                }} 
                dustedArtifacts={dustedArtifacts} 
              />
            )}
          </Suspense>
        )}

        <OrbitControls 
          enableZoom={!isGameLocked} 
          enablePan={false} 
          enableRotate={!isGameLocked} 
          minDistance={1.4} 
          maxDistance={8} 
        />
      </Canvas>

      {showQuiz && (
        <Quiz 
          planet={currentPlanet} 
          playClick={playClick}
          onClose={() => { playClick(); setShowQuiz(false); }} 
        />
      )}

      {activeArtifact && !showQuiz && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 30
        }}>
          
          <button 
            onClick={handleCloseArtifact}
            style={{
              position: 'absolute', top: '30px', right: '40px',
              backgroundColor: 'transparent', color: currentPlanet === 'moon' ? '#40E0D0' : '#E27B58', 
              border: 'none', fontSize: '40px', cursor: 'pointer', zIndex: 40, fontWeight: 'bold'
            }}
          >
            ×
          </button>

          <ArtifactCard 
            artifact={activeArtifact} 
            planet={currentPlanet}
            playClick={playClick}
            playUnlock={playUnlock}
            isAlreadyDusted={dustedArtifacts.includes(activeArtifact.id)}
            onMarkDusted={() => setDustedArtifacts(prev => [...prev, activeArtifact.id])}
          />
        </div>
      )}
      
    </div>
  );
}