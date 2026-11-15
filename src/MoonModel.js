import React, { useState } from 'react';
import { useGLTF, Html } from '@react-three/drei';

function latLongToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 90) * (Math.PI / 180); 
  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return [x, y, z];
}

const LUNAR_ARTIFACTS = [
  { 
    id: "apollo11", 
    imageId: "apollo11module", 
    name: "Apollo 11 Lunar Module (Eagle)", 
    lat: 0.674, lon: 23.472,
    infoSlider: [
      { 
        title: "LAUNCH SPECS", 
        content: (
          <>
            <strong>Launch Date:</strong> 1969-07-16<br/>
            <strong>Launch Vehicle:</strong> Saturn V<br/>
            <strong>Launch Site:</strong> Cape Canaveral, United States<br/>
            <strong>Mass:</strong> 15,103 kg
          </>
        )
      },
      { title: "LANDING LOGISTICS", content: "Landed on July 20, 1969, in the vast basaltic plain known as the Sea of Tranquility. The Eagle delivered astronauts Neil Armstrong and Buzz Aldrin to the surface." },
      { title: "MISSION OVERVIEW", content: "Fulfilling a decade-long national promise, this mission successfully landed the first humans on the moon and returned them safely to Earth." },
      { title: "TECHNICAL SPECS", content: "You are looking at the 'Descent Stage'. It weighed over 10,000 kg at launch and contained the engine that cushioned the fall. When the astronauts left, this stage served as their literal launch pad and was left behind permanently." },
      { title: "LEGACY & ARTIFACTS", content: "Surrounding this module is a museum of discarded history: Neil and Buzz's heavy space boots, empty food bags, a silicon disk carrying messages from 73 countries, and a plaque reading 'We came in peace for all mankind'." }
    ]
  },
  { 
    id: "surveyor3", 
    imageId: "surveyor3", 
    name: "Surveyor 3", 
    lat: -3.015, lon: -23.418,
    infoSlider: [
      { 
        title: "LAUNCH SPECS", 
        content: (
          <>
            <strong>Launch Date:</strong> 1967-04-17<br/>
            <strong>Launch Vehicle:</strong> Atlas-Centaur<br/>
            <strong>Launch Site:</strong> Cape Canaveral, United States<br/>
            <strong>Mass:</strong> 1,026 kg
          </>
        )
      },
      { title: "LANDING LOGISTICS", content: "Landed on April 20, 1967, in the Ocean of Storms (Mare Cognitum)." },
      { title: "MISSION OVERVIEW", content: "This robotic probe was sent to study the lunar surface and prove that the dust was solid enough for the massive Apollo landers to land on without sinking." },
      { title: "TECHNICAL SPECS", content: "Equipped with a television camera and a robotic 'surface sampler' scoop. It dug trenches up to 7 inches deep and took over 6,300 photos of the area." },
      { title: "LEGACY & ARTIFACTS", content: "It is the only probe ever visited by humans on another world! Apollo 12 astronauts landed nearby 2.5 years later and physically cut off its camera and scoop to bring back to Earth to study space weathering." }
    ]
  },
  { 
    id: "apollo12", 
    imageId: "apollo12module", 
    name: "Apollo 12 Lunar Module (Intrepid)", 
    lat: -3.012, lon: -26,
    infoSlider: [
      { 
        title: "LAUNCH SPECS", 
        content: (
          <>
            <strong>Launch Date:</strong> 1969-11-14<br/>
            <strong>Launch Vehicle:</strong> Saturn V<br/>
            <strong>Launch Site:</strong> Kennedy Space Center, United States<br/>
            <strong>Mass:</strong> 15,235 kg
          </>
        )
      },
      { title: "LANDING LOGISTICS", content: "Landed on November 19, 1969, in the Ocean of Storms. The crew navigated the descent manually to land within walking distance of the Surveyor 3 probe." },
      { title: "MISSION OVERVIEW", content: "The primary goal of this mission was to prove that 'pinpoint landing' was possible, allowing future missions to target rugged, scientifically interesting areas." },
      { title: "TECHNICAL SPECS", content: "This mission deployed the first ALSEP (Apollo Lunar Surface Experiments Package), a nuclear-powered suite of scientific instruments designed to transmit seismic and environmental data back to Earth for years." },
      { title: "LEGACY & ARTIFACTS", content: "The mission almost ended in disaster before leaving Earth—the Saturn V rocket was struck by lightning twice during launch, knocking out the navigation systems! They reset the computers and continued to the moon." }
    ]
  },
  { 
    id: "apollo15", 
    imageId: "apollo15module", 
    name: "Apollo 15 Lunar Module (Falcon)", 
    lat: 26.132, lon: 3.653,
    infoSlider: [
      { 
        title: "LAUNCH SPECS", 
        content: (
          <>
            <strong>Launch Date:</strong> 1971-07-26<br/>
            <strong>Launch Vehicle:</strong> Saturn V<br/>
            <strong>Launch Site:</strong> Kennedy Space Center, United States<br/>
            <strong>Mass:</strong> 16,430 kg
          </>
        )
      },
      { title: "LANDING LOGISTICS", content: "Landed on July 30, 1971, in the dramatic Hadley-Apennine region, nestled between a massive mountain range and a deep lunar gorge." },
      { title: "MISSION OVERVIEW", content: "This was the first 'J-mission', designed for a much longer 3-day stay on the surface, focusing heavily on geology and extensive scientific exploration." },
      { title: "TECHNICAL SPECS", content: "This module carried the very first Lunar Roving Vehicle (LRV). The rover was folded up like a transformer on the outside of this descent stage. It had a top speed of about 8 mph!" },
      { title: "LEGACY & ARTIFACTS", content: "When the astronauts left, they parked the LRV away from the module and aimed its TV camera at the Falcon. It successfully broadcast the first live TV footage of a Lunar Module launching back into space!" }
    ]
  }
];

function ArtifactMarker({ artifact, index, radius, setActiveArtifact, isDusted }) {
  const [hovered, setHovered] = useState(false);
  const [x, y, z] = latLongToVector3(artifact.lat, artifact.lon, radius);

  return (
    <group position={[x, y, z]}>
      <mesh 
        onClick={(e) => {
          e.stopPropagation(); 
          setActiveArtifact(artifact);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer'; 
        }}
        onPointerOut={(e) => {
          setHovered(false);
          document.body.style.cursor = 'auto'; 
        }}
      >
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshBasicMaterial color={hovered ? "#ffffff" : "#40E0D0"} /> 
      </mesh>

      {hovered && (
        <Html pointerEvents="none">
          <div style={{ position: 'absolute', bottom: '0px', left: '0px' }}>
            <svg width="40" height="40" style={{ position: 'absolute', bottom: 0, left: 0, overflow: 'visible' }}>
              <line x1="0" y1="40" x2="40" y2="0" stroke="white" strokeWidth="2" />
            </svg>
            <div style={{ 
              position: 'absolute', 
              bottom: '40px', 
              left: '40px', 
              backgroundColor: 'rgba(10, 20, 30, 0.85)', 
              border: '1px solid #40E0D0', 
              padding: '6px 12px', 
              color: 'white', 
              fontFamily: 'monospace',
              fontSize: '14px',
              whiteSpace: 'nowrap', 
              boxShadow: '0 0 12px rgba(64, 224, 208, 0.4)'
            }}>
              {/* DYNAMIC TEXT RENDERING */}
              {isDusted ? artifact.name : `UNKNOWN ARTIFACT ${index}`}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

export default function MoonModel({ setActiveArtifact, dustedArtifacts }) {
  const { scene } = useGLTF('/moon_small.glb'); 
  const moonRadius = 1.28; 
  
  return (
    <group>
      <primitive object={scene} scale={1} position={[0, 0, 0]} />
      {LUNAR_ARTIFACTS.map((artifact, index) => (
        <ArtifactMarker 
          key={artifact.id} 
          artifact={artifact}
          index={index + 1} // +1 so it displays 1, 2, 3, 4 instead of 0, 1, 2, 3
          radius={moonRadius} 
          setActiveArtifact={setActiveArtifact}
          isDusted={dustedArtifacts.includes(artifact.id)}
        />
      ))}
    </group>
  );
}