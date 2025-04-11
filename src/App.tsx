import { useState } from 'react'; 
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars /*, HemisphereLight*/ } from '@react-three/drei'; // Remove HemisphereLight
import * as THREE from 'three'; // Ensure three.js is imported
import { SolarSystemScene } from './components/SolarSystemScene.js';
import { PlanetDetailView } from './components/PlanetDetailView.js';
import { ApodModal } from './components/ApodModal';
import './App.css';

function App() {
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [apodData, setApodData] = useState<any>(null); // Use the ApodData interface here too
  const [isApodLoading, setIsApodLoading] = useState<boolean>(false);
  const [apodError, setApodError] = useState<string | null>(null);
  const [showApodModal, setShowApodModal] = useState<boolean>(false);

  const fetchApodData = async () => {
    console.log("Fetching APOD data...");
    setIsApodLoading(true);
    setApodError(null);
    try {
        // Get NASA API key from .env file or use a demo key
        // Try direct NASA API call to bypass backend issues
        const NASA_API_KEY = 'DEMO_KEY'; // NASA allows limited requests with DEMO_KEY
        const NASA_APOD_URL = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`;
        
        console.log("Fetching APOD directly from NASA API:", NASA_APOD_URL);
        const response = await fetch(NASA_APOD_URL);
        console.log("APOD response status:", response.status);
        
        if (!response.ok) {
            let errorMsg = `APOD Fetch error! Status: ${response.status}`;
            try { 
                const errorText = await response.text();
                console.log("APOD error response:", errorText);
                try {
                    const errorData = JSON.parse(errorText);
                    errorMsg = errorData.error || errorData.msg || errorMsg;
                } catch (parseError) {
                    errorMsg = `${errorMsg} - ${errorText}`;
                }
            } catch (e) {
                console.error("Could not parse error response:", e);
            }
            throw new Error(errorMsg);
        }
        
        const data = await response.json();
        console.log("APOD data received:", data);
        setApodData(data); // Store the fetched data
        return data; // Return data for handler
    } catch (e: any) {
        console.error("Failed to fetch APOD data:", e);
        setApodError(`Failed to load Picture of the Day. (${e.message})`);
        return null; // Indicate failure
    } finally {
        setIsApodLoading(false);
    }
  };

  const handleBackToSystem = () => {
    setSelectedPlanet(null);
  };

  const handleApodButtonClick = async () => {
    let currentApodData = apodData;
    if (!currentApodData) {
        currentApodData = await fetchApodData();
    }
    if (currentApodData) {
        setShowApodModal(true);
    } else {
        if (!isApodLoading) {
            alert(`Could not load Picture of the Day. ${apodError || 'Please try again.'}`);
        }
    }
  };

  return (
    <div className="App">
      {selectedPlanet === null && (
        <button
          onClick={handleApodButtonClick}
          disabled={isApodLoading}
          className="generate-button"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 10,
          }}
          title="Astronomy Picture of the Day"
        >
          {isApodLoading ? 'Loading...' : 'APOD'}
        </button>
      )}

      <div className={`view-container ${selectedPlanet === null ? 'visible' : 'hidden'}`}>
        <Canvas camera={{ position: [0, 10, 20], fov: 75 }}>
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

          <ambientLight intensity={0.4} />
          <directionalLight position={[15, 15, 8]} intensity={2.2} color="#FFF8E7" target-position={[0, 0, 0]} />
          
          <primitive
              object={new THREE.HemisphereLight(
                  0x87CEEB, // Sky Color (hex code for the blueish color we used)
                  0x101020, // Ground Color (hex code for dark ground we used)
                  0.3       // Intensity (same as before)
              )}
          />
          
          <SolarSystemScene onPlanetSelect={setSelectedPlanet} />
          <OrbitControls />
        </Canvas>
      </div>

      {selectedPlanet !== null && (
        <div className={`view-container ${selectedPlanet !== null ? 'visible' : 'hidden'}`}>
          <PlanetDetailView
            selectedPlanet={selectedPlanet}
            onBack={handleBackToSystem}
          />
        </div>
      )}

      {showApodModal && apodData && (
        <ApodModal data={apodData} onClose={() => setShowApodModal(false)} />
      )}
    </div>
  );
}

export default App;