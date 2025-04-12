import { useState, useEffect } from 'react'; // Keep useEffect for potential future use, but remove the initial fetch logic
import './PlanetDetailView.css';

// Props interface
interface PlanetDetailViewProps {
  selectedPlanet: string;
  onBack: () => void; // Function to go back
  planetInfo: any;
  isLoading: boolean;
  error: string | null;
  nasaImages: any[];
  isImagesLoading: boolean;
  imagesError: string | null;
  planetDescription: string;
  isDescriptionLoading: boolean;
  descriptionError: string | null;
}

// YouTube video interface
interface YouTubeVideo {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  description: string;
}

export function PlanetDetailView({
  selectedPlanet,
  onBack,
  planetInfo,
  isLoading,
  error,
  nasaImages,
  isImagesLoading,
  imagesError,
  planetDescription,
  isDescriptionLoading,
  descriptionError
}: PlanetDetailViewProps) {
  // State for YouTube videos
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideo[]>([]);
  const [isVideosLoading, setIsVideosLoading] = useState<boolean>(false);
  const [videosError, setVideosError] = useState<string | null>(null);

  // State for landscape image generation
  const [landscapeImageUrl, setLandscapeImageUrl] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);
  
  // State for species generation
  const [speciesData, setSpeciesData] = useState<any[] | null>(null);
  const [isSpeciesLoading, setIsSpeciesLoading] = useState<boolean>(false);
  const [speciesError, setSpeciesError] = useState<string | null>(null);

  // State for modal
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [modalTitle, setModalTitle] = useState<string>('');

  // Add useEffect specifically for YouTube videos if needed, or call it differently
  useEffect(() => {
    if (selectedPlanet) {
      fetchYouTubeVideos(selectedPlanet);
    }
  }, [selectedPlanet]);

  const fetchYouTubeVideos = async (planetName: string) => {
    setIsVideosLoading(true);
    setYoutubeVideos([]);
    setVideosError(null);
    
    try {
      console.log(`Fetching YouTube videos for: ${planetName}`);
      
      // Try the API endpoint first
      const response = await fetch(`/api/getPlanetVideos?planet=${planetName}`);
      
      // If API fails, use fallback videos
      if (!response.ok) {
        console.log('API endpoint failed, using fallback videos');
        
        // Fallback video IDs for common planets
        const fallbackVideoIds: {[key: string]: string[]} = {
          'Mercury': ['0KBjnNuhRHs', 'P3jSsg1BjJE', 'aMgW_Jwg39E'],
          'Venus': ['BvXa1n9fjow', 'NUl7LbPuRkQ', '6Qkurm8mtQA'],
          'Earth': ['AwchsUXtz-Q', 'HCDVN7DCzYE', 'cIgywQ_NVYs'],
          'Mars': ['D8pnmwOXhoY', 'h3nX5u5Vwts', 'ZEyAs3NWH4A'],
          'Jupiter': ['PtkqwslbLY8', 'Xwn8fQSW7-8', 'CyjhfjnO4iE'],
          'Saturn': ['epZdZaEQhS0', '-vHiYA6Dmws', 'nXyglaY-N9w'],
          'Uranus': ['m4NXbFOiOGk', 'yT4fSur-Dbs', 'p6S2_8L_8HM'],
          'Neptune': ['NStn7zZKXfE', 'c9ztMEyFgEo', 'dsXLRf52yh4'],
          'Pluto': ['rIR0EjVfnVI', 'xbsRv9YPuNs', 'Jf_tEcOnsMQ']
        };
        
        const videoIds = fallbackVideoIds[planetName] || [];
        
        const fallbackVideos = videoIds.map(id => ({
          videoId: id,
          title: `${planetName} Video`,
          thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
          description: `A video about ${planetName}`
        }));
        
        setYoutubeVideos(fallbackVideos);
      } else {
        const data = await response.json(); // data is { videos: [...] }
        // --- Correct the state update ---
        if (data && Array.isArray(data.videos)) { // Check if data.videos is an array
          setYoutubeVideos(data.videos); 
        } else {
          console.error("YouTube Videos: Invalid data format received from API", data);
          setYoutubeVideos([]); // Set to empty array if format is wrong
        }
        // --- End correction ---
      }
    } catch (error: any) {
      console.error("Error fetching YouTube videos:", error);
      setVideosError(`Failed to load YouTube videos. (${error.message})`);
    } finally {
      setIsVideosLoading(false);
    }
  };

  // Handler function for the Generate button
  const handleGenerateLandscapeClick = async () => {
    if (!selectedPlanet) return;
    
    console.log(`Frontend: Generating landscape for ${selectedPlanet}`);
    setIsImageLoading(true);
    setImageError(null);
    setLandscapeImageUrl(null);

    try {
      const response = await fetch(`/api/generateLandscape?planet=${selectedPlanet}`);
      
      if (!response.ok) {
        let errorMsg = `Landscape generation failed. Status: ${response.status}`;
        try { 
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch (e) {}
        throw new Error(errorMsg);
      }
      
      const data = await response.json();
      
      if (data.imageUrl) {
        setLandscapeImageUrl(data.imageUrl);
        console.log(`Frontend: Received landscape image for ${selectedPlanet}`);
      } else {
        throw new Error('No image URL returned from the API');
      }
    } catch (e: any) {
      console.error("Frontend: Failed to generate landscape:", e);
      setImageError(`Failed to generate landscape. (${e.message})`);
    } finally {
      setIsImageLoading(false);
    }
  };

  // Handler function for the Generate Species button
  const handleGenerateSpeciesClick = async () => {
    setIsSpeciesLoading(true);
    setSpeciesError(null);
    
    try {
      console.log(`Generating species for ${selectedPlanet}...`);
      const response = await fetch(`/api/generateSpecies?planet=${selectedPlanet}`);
      
      if (!response.ok) {
        throw new Error(`Failed to generate species: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Species data:', data);
      
      if (data.species && Array.isArray(data.species)) {
        setSpeciesData(data.species);
      } else if (data.imageUrl && data.description) {
        // Handle legacy format for backward compatibility
        setSpeciesData([
          {
            category: "Micro-organism",
            name: "Unknown Microorganism",
            description: data.description,
            imageUrl: data.imageUrl
          },
          {
            category: "Animal",
            name: "Unknown Animal",
            description: data.description,
            imageUrl: data.imageUrl
          },
          {
            category: "Humanoid",
            name: "Unknown Humanoid",
            description: data.description,
            imageUrl: data.imageUrl
          }
        ]);
      } else {
        throw new Error('Invalid species data format');
      }
    } catch (error: any) {
      console.error('Error generating species:', error);
      setSpeciesError(`Failed to generate species. ${error.message}`);
    } finally {
      setIsSpeciesLoading(false);
    }
  };

  // Handler for opening the species image modal
  const handleOpenModal = (imageUrl: string, title: string) => {
    setModalImage(imageUrl);
    setModalTitle(title);
    setShowModal(true);
  };

  return (
    <div className="planet-detail-container">
      <button className="back-button" onClick={onBack}>
        ← BACK TO SOLAR SYSTEM
      </button>
      
      <h1 className="planet-name">{selectedPlanet}</h1>
      
      <div className="detail-grid">
        {/* First row - Planet Info and Description */}
        <div className="detail-card info-section">
          <h3 className="card-header">PLANET INFO</h3>
          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading planet information...</p>
            </div>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : planetInfo ? (
            <div className="planet-info">
              {planetInfo.meanRadius && (
                <div className="info-row">
                  <span className="info-label">Diameter:</span>
                  <span className="info-value">{planetInfo.meanRadius * 2} km</span>
                </div>
              )}
              {planetInfo.moons && (
                <div className="info-row">
                  <span className="info-label">Moons:</span>
                  <span className="info-value">{planetInfo.moons.length || 0}</span>
                </div>
              )}
              {planetInfo.sideralOrbit && (
                <div className="info-row">
                  <span className="info-label">Orbit Period:</span>
                  <span className="info-value">{planetInfo.sideralOrbit} days</span>
                </div>
              )}
              {planetInfo.sideralRotation && (
                <div className="info-row">
                  <span className="info-label">Rotation Period:</span>
                  <span className="info-value">{planetInfo.sideralRotation} hours</span>
                </div>
              )}
              {planetInfo.gravity && (
                <div className="info-row">
                  <span className="info-label">Gravity:</span>
                  <span className="info-value">{planetInfo.gravity} m/s²</span>
                </div>
              )}
              {planetInfo.avgTemp && (
                <div className="info-row">
                  <span className="info-label">Avg. Temperature:</span>
                  <span className="info-value">{planetInfo.avgTemp} K</span>
                </div>
              )}
            </div>
          ) : (
            <p>No information available for {selectedPlanet}.</p>
          )}
        </div>
        
        <div className="detail-card description-section">
          <h3 className="card-header">DESCRIPTION</h3>
          {isDescriptionLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading planet description...</p>
            </div>
          ) : descriptionError ? (
            <p className="error-message">{descriptionError}</p>
          ) : planetDescription ? (
            <p className="planet-description">{planetDescription}</p>
          ) : (
            <p>No description available for {selectedPlanet}.</p>
          )}
        </div>
        
        {/* Second row - NASA Images and AI Landscape */}
        <div className="detail-card images-section">
          <h3 className="card-header">NASA IMAGES</h3>
          {isImagesLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading NASA images...</p>
            </div>
          ) : imagesError ? (
            <p className="error-message">{imagesError}</p>
          ) : nasaImages && nasaImages.length > 0 ? (
            <div className="nasa-gallery">
              {nasaImages.slice(0, 10).map((image, index) => (
                <div key={index} className="nasa-gallery-item">
                  <img 
                    src={image.url} 
                    alt={image.title || `${selectedPlanet} image ${index + 1}`} 
                    onClick={() => handleOpenModal(image.url, image.title || `${selectedPlanet} Image`)} 
                  />
                </div>
              ))}
            </div>
          ) : (
            <p>No NASA images available for {selectedPlanet}.</p>
          )}
        </div>
        
        <div className="detail-card landscape-section">
          <h3 className="card-header">AI LANDSCAPE</h3>
          {isImageLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Generating landscape...</p>
            </div>
          ) : imageError ? (
            <div>
              <p className="error-message">{imageError}</p>
              <button 
                className="generate-button" 
                onClick={handleGenerateLandscapeClick}
                disabled={isImageLoading}
              >
                {isImageLoading ? 'Generating...' : 'Generate Landscape'}
              </button>
            </div>
          ) : landscapeImageUrl ? (
            <div className="landscape-container">
              <img 
                src={landscapeImageUrl} 
                alt={`${selectedPlanet} landscape`} 
                onClick={() => handleOpenModal(landscapeImageUrl, `${selectedPlanet} Landscape`)}
              />
            </div>
          ) : (
            <div className="generate-container">
              <button 
                className="generate-button" 
                onClick={handleGenerateLandscapeClick}
                disabled={isImageLoading}
              >
                {isImageLoading ? 'Generating...' : 'Generate Landscape'}
              </button>
              <p>Click the button to generate an AI landscape of {selectedPlanet}.</p>
            </div>
          )}
        </div>
        
        {/* Third row - Hypothetical Species */}
        <div className="detail-card species-section" style={{ gridColumn: 'span 2' }}>
          <h3 className="card-header">HYPOTHETICAL SPECIES</h3>
          {isSpeciesLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Generating species...</p>
            </div>
          ) : speciesError ? (
            <div>
              <p className="error-message">{speciesError}</p>
              <button 
                className="generate-button" 
                onClick={handleGenerateSpeciesClick}
                disabled={isSpeciesLoading}
              >
                {isSpeciesLoading ? 'Generating...' : 'Generate Species'}
              </button>
            </div>
          ) : speciesData ? (
            <div className="species-content">
              <div className="species-images">
                {speciesData.map((species, index) => (
                  <div key={index} className="species-image-card">
                    <img 
                      src={species.imageUrl || `https://source.unsplash.com/random/300x200/?${selectedPlanet},${species.category.toLowerCase()}`} 
                      alt={`${species.name || selectedPlanet + ' ' + species.category}`} 
                      onClick={() => handleOpenModal(
                        species.imageUrl || `https://source.unsplash.com/random/300x200/?${selectedPlanet},${species.category.toLowerCase()}`, 
                        species.name || `${selectedPlanet} ${species.category}`
                      )}
                    />
                    <p>{species.category}</p>
                    <h4 className="species-name">{species.name || `${selectedPlanet} ${species.category}`}</h4>
                    <div className="species-description">
                      <p>{species.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="generate-container">
              <button 
                className="generate-button" 
                onClick={handleGenerateSpeciesClick}
                disabled={isSpeciesLoading}
              >
                {isSpeciesLoading ? 'Generating...' : 'Generate Species'}
              </button>
              <p>Click the button to generate hypothetical alien species for {selectedPlanet}.</p>
            </div>
          )}
        </div>
        
        {/* Fourth row - Astrological Meaning */}
        <div className="detail-card astrological-section" style={{ gridColumn: 'span 2' }}>
          <h3 className="card-header">ASTROLOGICAL MEANING</h3>
          <p>
            {selectedPlanet === "Mars" ? 
              "Mars represents energy, action, and desire in astrology. Known as the 'Red Planet' and named after the Roman god of war, Mars governs our physical energy, assertiveness, and competitive drive. It influences how we pursue our goals, express anger, and experience passion. In natal charts, Mars reveals how we take action, defend ourselves, and express our desires. Its position can indicate areas where we show courage, aggression, or ambition. Mars takes approximately 2 years to orbit the Sun, spending about 6-7 weeks in each zodiac sign, bringing different energetic influences to each." : 
              selectedPlanet === "Jupiter" ?
              "Jupiter, the largest planet in our solar system, represents expansion, growth, and abundance in astrology. Named after the king of Roman gods, Jupiter governs wisdom, philosophy, higher learning, and good fortune. It influences how we grow, develop optimism, and experience prosperity. In natal charts, Jupiter reveals where we find luck, opportunity, and spiritual understanding. Its position can indicate areas where we experience generosity, faith, or excess. Jupiter takes approximately 12 years to orbit the Sun, spending about a year in each zodiac sign, bringing different expansive influences to each." :
              selectedPlanet === "Venus" ?
              "Venus, the second planet from the Sun, represents love, beauty, and harmony in astrology. Named after the Roman goddess of love and beauty, Venus governs relationships, aesthetics, pleasure, and values. It influences how we express affection, appreciate art, and form connections. In natal charts, Venus reveals our approach to love, what we find beautiful, and how we relate to others. Its position can indicate areas where we seek harmony, pleasure, or creative expression. Venus takes approximately 225 days to orbit the Sun, spending about 4-5 weeks in each zodiac sign." :
              `The astrological meaning of ${selectedPlanet} represents its influence on human personality and events according to astrological traditions. In astrology, each planet governs specific aspects of human experience and character traits. ${selectedPlanet}'s position in a birth chart can reveal important insights about personality, strengths, challenges, and life path. Astrologers study the movements and positions of ${selectedPlanet} to understand its influence on different zodiac signs and houses. Through careful interpretation, the astrological significance of ${selectedPlanet} helps individuals gain deeper self-awareness and navigate life's journey with greater understanding of cosmic patterns and personal potential.`
            }
          </p>
        </div>
        
        {/* Fifth row - YouTube Videos Section */}
        <div className="detail-card videos-section" style={{ gridColumn: 'span 2' }}>
          <h3 className="card-header">RELATED VIDEOS</h3>
          {isVideosLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading YouTube videos...</p>
            </div>
          ) : videosError ? (
            <p className="error-message">{videosError}</p>
          ) : youtubeVideos && youtubeVideos.length > 0 ? (
            <div className="video-grid">
              {youtubeVideos.map((video, index) => (
                <div key={index} className="video-card">
                  <a 
                    href={`https://www.youtube.com/watch?v=${video.videoId}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <div className="video-thumbnail">
                      <img src={video.thumbnailUrl} alt={video.title} />
                      <div className="play-button">▶</div>
                    </div>
                    <h4>{video.title}</h4>
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p>No videos available.</p>
          )}
        </div>
      </div>
      
      {/* Image Modal */}
      {showModal && modalImage && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            <h3>{modalTitle}</h3>
            <img src={modalImage} alt={modalTitle} />
          </div>
        </div>
      )}
    </div>
  );
}
