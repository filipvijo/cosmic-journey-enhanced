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

  const fetchPlanetInfo = async (planetName: string) => {
    setIsLoading(true);
    setPlanetInfo(null);
    setError(null);
    
    try {
      console.log(`Fetching info for planet: ${planetName}`);
      
      // Try the API endpoint first
      const response = await fetch(`/api/getPlanetInfo?planet=${planetName}`);
      
      // If API fails, use direct external API call as fallback
      if (!response.ok) {
        console.log('API endpoint failed, using direct external API call');
        const planetApiName = planetName.toLowerCase();
        const EXTERNAL_API_URL = `https://api.le-systeme-solaire.net/rest/bodies/${planetApiName}`;
        
        const directResponse = await fetch(EXTERNAL_API_URL);
        if (!directResponse.ok) {
          throw new Error(`Failed to fetch planet data: ${directResponse.status}`);
        }
        
        const data = await directResponse.json();
        setPlanetInfo(data);
      } else {
        const data = await response.json();
        setPlanetInfo(data);
      }
    } catch (error: any) {
      console.error("Error fetching planet info:", error);
      setError(`Failed to load data for ${planetName}. (${error.message})`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNasaImages = async (planetName: string) => {
    setIsImagesLoading(true);
    setNasaImages([]);
    setImagesError(null);
    
    try {
      console.log(`Fetching NASA images for: ${planetName}`);
      
      // Try the API endpoint first
      const response = await fetch(`/api/getNasaImages?planet=${planetName}`);
      
      // If API fails, use direct NASA API call as fallback
      if (!response.ok) {
        console.log('API endpoint failed, using direct NASA API call');
        const NASA_API_KEY = 'DEMO_KEY'; // NASA allows limited requests with DEMO_KEY
        const NASA_IMAGES_URL = `https://images-api.nasa.gov/search?q=${planetName}&media_type=image`;
        
        const directResponse = await fetch(NASA_IMAGES_URL);
        if (!directResponse.ok) {
          throw new Error(`NASA Image Fetch error! Status: ${directResponse.status}`);
        }
        
        const data = await directResponse.json();
        
        // Process the NASA API response
        const images = data.collection?.items?.slice(0, 6).map((item: any) => ({
          url: item.links?.[0]?.href || '',
          title: item.data?.[0]?.title || 'NASA Image',
          description: item.data?.[0]?.description || ''
        })) || [];
        
        setNasaImages(images);
      } else {
        const data = await response.json();
        setNasaImages(data);
      }
    } catch (error: any) {
      console.error("Error fetching NASA images:", error);
      setImagesError(`Failed to load NASA images. (${error.message})`);
    } finally {
      setIsImagesLoading(false);
    }
  };

  const fetchPlanetDescription = async (planetName: string) => {
    setIsDescriptionLoading(true);
    setPlanetDescription('');
    setDescriptionError(null);
    
    try {
      console.log(`Fetching description for: ${planetName}`);
      
      // Try the API endpoint
      const response = await fetch(`/api/getPlanetDescription?planet=${planetName}`);
      
      // If API fails, use a fallback description
      if (!response.ok) {
        console.log('API endpoint failed, using fallback description');
        
        // Fallback descriptions for common planets
        const fallbackDescriptions: {[key: string]: string} = {
          'Mercury': 'Mercury is the smallest and innermost planet in the Solar System. It has no atmosphere to retain heat, causing extreme temperature variations, from scorching 800°F (430°C) during the day to freezing -290°F (-180°C) at night. Its heavily cratered surface resembles our Moon.',
          'Venus': 'Venus is often called Earth\'s sister planet due to similar size and mass. However, it has a toxic atmosphere of carbon dioxide with clouds of sulfuric acid, creating an extreme greenhouse effect. Surface temperatures reach a scorching 900°F (475°C), making it the hottest planet in our solar system.',
          'Earth': 'Earth is the third planet from the Sun and the only astronomical object known to harbor life. About 71% of Earth\'s surface is covered with water, with oceans constituting about 96.5% of all Earth\'s water. The atmosphere consists of 78% nitrogen and 21% oxygen, creating the perfect conditions for life as we know it.',
          'Mars': 'Mars is known as the Red Planet due to iron oxide (rust) on its surface. It has polar ice caps, seasons, canyons, extinct volcanoes, and evidence of ancient rivers. Scientists continue to study Mars for signs of past or present life, with various rovers and missions exploring its surface.',
          'Jupiter': 'Jupiter is the largest planet in our solar system, with a mass more than twice that of all other planets combined. It\'s a gas giant composed mainly of hydrogen and helium, with a distinctive Great Red Spot - a giant storm that has lasted for hundreds of years. Jupiter has at least 79 moons.',
          'Saturn': 'Saturn is famous for its spectacular ring system, composed primarily of ice particles with smaller amounts of rocky debris and dust. It\'s another gas giant with a composition similar to Jupiter. Saturn has at least 82 moons, with Titan being the largest and having its own atmosphere.',
          'Uranus': 'Uranus is an ice giant planet with a unique feature - it rotates on its side, likely due to a massive collision in its past. This gives it extreme seasons, with each pole experiencing 42 years of continuous sunlight followed by 42 years of darkness. It has a blue-green color due to methane in its atmosphere.',
          'Neptune': 'Neptune is the farthest planet from the Sun and another ice giant. It has the strongest winds in the solar system, reaching speeds of 1,200 mph (2,000 km/h). Its blue color comes from methane in the atmosphere. Neptune has 14 known moons, with Triton being the largest.',
          'Pluto': 'Pluto, once considered the ninth planet, is now classified as a dwarf planet. It\'s smaller than Earth\'s moon and has a highly eccentric orbit. Pluto has a heart-shaped glacier, mountains of water ice, and a thin atmosphere that expands and contracts as it moves closer to or farther from the Sun.'
        };
        
        const description = fallbackDescriptions[planetName] || `Description for ${planetName} is currently unavailable.`;
        setPlanetDescription(description);
      } else {
        const data = await response.json();
        setPlanetDescription(data.description || '');
      }
    } catch (error: any) {
      console.error("Error fetching planet description:", error);
      setDescriptionError(`Failed to load description. (${error.message})`);
    } finally {
      setIsDescriptionLoading(false);
    }
  };

  const handlePlanetClick = (planet: string) => {
    setSelectedPlanet(planet);
    console.log(`Selected planet: ${planet}`);
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
          
          <SolarSystemScene onPlanetSelect={handlePlanetClick} />
          <OrbitControls />
        </Canvas>
      </div>

      {selectedPlanet !== null && (
        <div className={`view-container ${selectedPlanet !== null ? 'visible' : 'hidden'}`}>
          <PlanetDetailView 
            selectedPlanet={selectedPlanet} 
            onBack={() => setSelectedPlanet(null)}
            onFetchPlanetInfo={fetchPlanetInfo}
            onFetchPlanetDescription={fetchPlanetDescription}
            onFetchNasaImages={fetchNasaImages}
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