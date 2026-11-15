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

const MARS_ARTIFACTS = [
  { 
    id: "viking1", 
    imageId: "viking1", 
    name: "Viking 1 Lander", 
    lat: 22.48, lon: -47.97,
    infoSlider: [
      { 
        title: "LAUNCH SPECS", 
        content: (
          <>
            <strong>Launch Date:</strong> 1975-08-20<br/>
            <strong>Launch Vehicle:</strong> Titan IIIE<br/>
            <strong>Launch Site:</strong> Cape Canaveral, United States<br/>
            <strong>Mass:</strong> 572 kg (Lander)
          </>
        )
      },
      { title: "LANDING LOGISTICS", content: "Landed on July 20, 1976, in Chryse Planitia (The Golden Plain)." },
      { title: "MISSION OVERVIEW", content: "Viking 1 was the first U.S. spacecraft to successfully land on Mars and complete its mission, sending back the first clear, close-up images of the Martian surface." },
      { title: "TECHNICAL SPECS", content: "Equipped with biology experiments to search for Martian life, a robotic arm, and twin cameras. It operated on the surface for over six years before a faulty software update severed communications." },
      { title: "LEGACY & ARTIFACTS", content: "The lander remains exactly where it touched down, standing as a silent monument to humanity's first successful long-term outpost on the Red Planet." }
    ]
  },
  { 
    id: "pathfinder", 
    imageId: "pathfinder", 
    name: "Mars Pathfinder & Sojourner", 
    lat: 19.13, lon: -33.22,
    infoSlider: [
      { 
        title: "LAUNCH SPECS", 
        content: (
          <>
            <strong>Launch Date:</strong> 1996-12-04<br/>
            <strong>Launch Vehicle:</strong> Delta II<br/>
            <strong>Launch Site:</strong> Cape Canaveral, United States<br/>
            <strong>Mass:</strong> 360 kg
          </>
        )
      },
      { title: "LANDING LOGISTICS", content: "Landed on July 4, 1997, in Ares Vallis, an ancient flood plain." },
      { title: "MISSION OVERVIEW", content: "Designed as a technology demonstration to deliver a lander and a free-ranging robotic rover to the surface of Mars in a cost-effective way." },
      { title: "TECHNICAL SPECS", content: "Instead of conventional rockets, Pathfinder famously bounced to a stop on the Martian surface using giant airbags! It then deployed Sojourner, a microwave-oven-sized rover." },
      { title: "LEGACY & ARTIFACTS", content: "Sojourner was the first wheeled vehicle to ever drive on another planet. The rover and lander operated for nearly 3 months before their batteries finally succumbed to the cold." }
    ]
  },
  { 
    id: "opportunity", 
    imageId: "opportunity", 
    name: "Opportunity Rover", 
    lat: -1.94, lon: 354.47,
    infoSlider: [
      { 
        title: "LAUNCH SPECS", 
        content: (
          <>
            <strong>Launch Date:</strong> 2003-07-07<br/>
            <strong>Launch Vehicle:</strong> Delta II<br/>
            <strong>Launch Site:</strong> Cape Canaveral, United States<br/>
            <strong>Mass:</strong> 185 kg
          </>
        )
      },
      { title: "LANDING LOGISTICS", content: "Landed on January 25, 2004, in Meridiani Planum, scoring a 'hole in one' by bouncing directly into a small impact crater." },
      { title: "MISSION OVERVIEW", content: "Designed for a 90-day mission to search for clues of past water activity. It vastly exceeded expectations, operating for over 14 years!" },
      { title: "TECHNICAL SPECS", content: "Powered by solar panels and equipped with a rock abrasion tool, microscopic imager, and panoramic cameras, Oppy drove a marathon-distance 28 miles across the surface." },
      { title: "LEGACY & ARTIFACTS", content: "Its final message to Earth in 2018 as a massive dust storm blocked out the sun was famously translated as: 'My battery is low and it's getting dark.'" }
    ]
  },
  { 
    id: "ingenuity", 
    imageId: "ingenuity", 
    name: "Ingenuity Helicopter", 
    lat: 18.44, lon: 77.45,
    infoSlider: [
      { 
        title: "LAUNCH SPECS", 
        content: (
          <>
            <strong>Launch Date:</strong> 2020-07-30<br/>
            <strong>Launch Vehicle:</strong> Atlas V<br/>
            <strong>Launch Site:</strong> Cape Canaveral, United States<br/>
            <strong>Mass:</strong> 1.8 kg
          </>
        )
      },
      { title: "LANDING LOGISTICS", content: "Landed on February 18, 2021, inside Jezero Crater, strapped to the belly of the Perseverance rover." },
      { title: "MISSION OVERVIEW", content: "A technology demonstration meant to prove that powered, controlled flight was possible in Mars' incredibly thin atmosphere." },
      { title: "TECHNICAL SPECS", content: "Its carbon-fiber blades had to spin at 2,400 RPM to generate lift in an atmosphere 100 times thinner than Earth's. It was designed for 5 flights but completed 72!" },
      { title: "LEGACY & ARTIFACTS", content: "After suffering rotor blade damage on its final landing in early 2024, it was permanently grounded. It now sits in the Martian dunes as humanity's first off-world aircraft." }
    ]
  },
  { 
    id: "spirit", 
    imageId: "spirit", 
    name: "Spirit Rover", 
    lat: -14.57, lon: 175.47,
    infoSlider: [
      { 
        title: "LAUNCH SPECS", 
        content: (
          <>
            <strong>Launch Date:</strong> 2003-06-10<br/>
            <strong>Launch Vehicle:</strong> Delta II<br/>
            <strong>Launch Site:</strong> Cape Canaveral, United States<br/>
            <strong>Mass:</strong> 185 kg
          </>
        )
      },
      { title: "LANDING LOGISTICS", content: "Landed on January 4, 2004, in Gusev Crater, a massive basin believed to be an ancient dry lakebed." },
      { title: "MISSION OVERVIEW", content: "Opportunity's twin rover, designed to find geological evidence of past water activity on the opposite side of the planet." },
      { title: "TECHNICAL SPECS", content: "In 2009, Spirit got permanently stuck in a patch of soft sand. It continued to do science as a stationary platform until it finally lost power in the harsh Martian winter of 2010." },
      { title: "LEGACY & ARTIFACTS", content: "It drove 4.8 miles and discovered that ancient Mars had hot springs and steam vents, proving the planet once had both the energy and water to support life." }
    ]
  },
  { 
    id: "phoenix", 
    imageId: "phoenix", 
    name: "Phoenix Lander", 
    lat: 68.22, lon: -125.7,
    infoSlider: [
      { 
        title: "LAUNCH SPECS", 
        content: (
          <>
            <strong>Launch Date:</strong> 2007-08-04<br/>
            <strong>Launch Vehicle:</strong> Delta II<br/>
            <strong>Launch Site:</strong> Cape Canaveral, United States<br/>
            <strong>Mass:</strong> 350 kg
          </>
        )
      },
      { title: "LANDING LOGISTICS", content: "Landed on May 25, 2008, in the frigid northern polar region known as Vastitas Borealis." },
      { title: "MISSION OVERVIEW", content: "The first mission to physically touch and analyze water ice on another planet, searching for environments suitable for microbial life." },
      { title: "TECHNICAL SPECS", content: "Equipped with a 7.7-foot robotic scoop that dug trenches into the permafrost. It was not designed to survive the harsh Martian winter and froze over after 5 months of operation." },
      { title: "LEGACY & ARTIFACTS", content: "It definitively proved that water ice exists just centimeters below the Martian surface, paving the way for future human colonization plans." }
    ]
  },
  { 
    id: "insight", 
    imageId: "insight", 
    name: "InSight Lander", 
    lat: 4.50, lon: 135.62,
    infoSlider: [
      { 
        title: "LAUNCH SPECS", 
        content: (
          <>
            <strong>Launch Date:</strong> 2018-05-05<br/>
            <strong>Launch Vehicle:</strong> Atlas V<br/>
            <strong>Launch Site:</strong> Vandenberg AFB, United States<br/>
            <strong>Mass:</strong> 358 kg
          </>
        )
      },
      { title: "LANDING LOGISTICS", content: "Landed on November 26, 2018, in the flat, smooth plains of Elysium Planitia." },
      { title: "MISSION OVERVIEW", content: "Designed to give Mars its first thorough 'checkup' since it formed 4.5 billion years ago, measuring its pulse (seismology) and temperature (heat flow)." },
      { title: "TECHNICAL SPECS", content: "Deployed a highly sensitive dome seismometer that detected over 1,300 'marsquakes'. The stationary lander's solar panels eventually became too covered in dust to generate power." },
      { title: "LEGACY & ARTIFACTS", content: "It peered deep into the interior of the Red Planet and successfully discovered that Mars has a liquid core and is still seismically active today." }
    ]
  }
];

function MarsArtifactMarker({ artifact, index, radius, setActiveArtifact, isDusted }) {
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
              {isDusted ? artifact.name : `UNKNOWN ARTIFACT ${index}`}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

export default function MarsModel({ setActiveArtifact, dustedArtifacts }) {
  const { scene } = useGLTF('/marsmodel.glb'); 
  const marsRadius = 2.5; 
  
  return (
    <group>
      <primitive object={scene} scale={0.005} position={[0, 0, 0]} />
      {MARS_ARTIFACTS.map((artifact, index) => (
        <MarsArtifactMarker 
          key={artifact.id} 
          artifact={artifact}
          index={index + 1} 
          radius={marsRadius} 
          setActiveArtifact={setActiveArtifact}
          isDusted={dustedArtifacts.includes(artifact.id)}
        />
      ))}
    </group>
  );
}