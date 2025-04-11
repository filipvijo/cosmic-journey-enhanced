import { useState, useEffect } from 'react';
import './PlanetDetailView.css';

// Props interface
interface PlanetDetailViewProps {
  selectedPlanet: string;
  onBack: () => void; // Function to go back
  onFetchPlanetInfo: (planet: string) => void;
  onFetchPlanetDescription: (planet: string) => void;
  onFetchNasaImages: (planet: string) => void;
}

// YouTube video interface
interface YouTubeVideo {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  description: string;
}

export function PlanetDetailView({ selectedPlanet, onBack, onFetchPlanetInfo, onFetchPlanetDescription, onFetchNasaImages }: PlanetDetailViewProps) {
  // State for YouTube videos
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideo[]>([]);
  const [isVideosLoading, setIsVideosLoading] = useState<boolean>(false);
  const [videosError, setVideosError] = useState<string | null>(null);

  // State for landscape image generation
  const [landscapeImageUrl, setLandscapeImageUrl] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);
  
  // State for species generation
  const [speciesImageUrl, setSpeciesImageUrl] = useState<string | null>(null);
  const [speciesDescription, setSpeciesDescription] = useState<string | null>(null);
  const [isSpeciesLoading, setIsSpeciesLoading] = useState<boolean>(false);
  const [speciesError, setSpeciesError] = useState<string | null>(null);

  // State for modal
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [modalTitle, setModalTitle] = useState<string>('');

  // useEffect for all fetches
  useEffect(() => {
    if (selectedPlanet) {
      // Call the parent component's fetch functions
      onFetchPlanetInfo(selectedPlanet);
      onFetchPlanetDescription(selectedPlanet);
      onFetchNasaImages(selectedPlanet);
      
      // Fetch YouTube videos
      fetchYouTubeVideos(selectedPlanet);
    }
  }, [selectedPlanet, onFetchPlanetInfo, onFetchPlanetDescription, onFetchNasaImages]);

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
        const data = await response.json();
        setYoutubeVideos(data);
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
    if (!selectedPlanet) return;
    
    console.log(`Frontend: Requesting species for ${selectedPlanet}`);
    setIsSpeciesLoading(true);
    setSpeciesError(null);
    setSpeciesImageUrl(null); // Clear previous species
    setSpeciesDescription(null);

    try {
      const response = await fetch(`/api/generateSpecies?planet=${selectedPlanet}`);
  
      if (!response.ok) {
          let errorMsg = `Species generation failed. Status: ${response.status}`;
          try { const errorData = await response.json(); errorMsg = errorData.error || errorMsg; } catch (e) {}
          throw new Error(errorMsg);
      }
      
      const data = await response.json();
      
      if (!data.species || data.species.length === 0) {
          throw new Error('Backend did not return valid species data.');
      }
  
      setSpeciesImageUrl(data.species[0].imageUrl);
      setSpeciesDescription(data.species[0].description);
      console.log(`Frontend: Received species data for ${selectedPlanet}`);
      
      if(data.image_error) { // Check if backend reported image errors
           setSpeciesError(`Descriptions loaded, but image generation failed: ${data.image_error}`);
      }
    } catch (e: any) {
      console.error("Frontend: Failed to generate species:", e);
      setSpeciesError(`Failed to generate species. (${e.message})`);
    } finally {
      setIsSpeciesLoading(false);
    }
  };

  // Handler for opening the species image modal
  const handleOpenModal = (imageUrl: string, title: string) => {
    setModalImage(imageUrl);
    setModalTitle(title);
    setShowModal(true);
    // Prevent scrolling when modal is open
    document.body.style.overflow = 'hidden';
  };
  
  // Handler for closing the species image modal
  const handleCloseModal = () => {
    setShowModal(false);
    // Re-enable scrolling
    document.body.style.overflow = 'auto';
  };

  return (
    <div className="planet-detail-view">
      <div className="detail-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Solar System
        </button>
        <h2>{selectedPlanet}</h2>
      </div>
        
      <div className="detail-content">
        <div className="planet-details-grid">
          {/* Videos Section */}
          <div className="detail-card videos-section">
            <h3 className="card-header">Related Videos</h3>
            {isVideosLoading ? (
              <div className="video-grid">
                {[1, 2, 3].map(i => (
                  <div key={i} className="loading-skeleton" style={{ aspectRatio: '16/9', borderRadius: '4px' }}></div>
                ))}
              </div>
            ) : videosError ? (
              <p className="error-message">{videosError}</p>
            ) : youtubeVideos.length > 0 ? (
              <div className="video-grid">
                {youtubeVideos.map((video, index) => (
                  <div key={index} className="video-card">
                    <a 
                      href={`https://www.youtube.com/watch?v=${video.videoId}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <div className="video-thumbnail">
                        <img 
                          src={video.thumbnailUrl} 
                          alt={video.title} 
                        />
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
          
          {/* Landscape Generation Section */}
          <div className="detail-card landscape-section">
            <h3 className="card-header">Generate Landscape</h3>
            <button 
              className="generate-button" 
              onClick={handleGenerateLandscapeClick}
              disabled={isImageLoading}
            >
              {isImageLoading ? 'Generating...' : 'Generate Landscape'}
            </button>
            
            {isImageLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Generating landscape image... This may take a moment.</p>
              </div>
            ) : imageError ? (
              <p className="error-message">{imageError}</p>
            ) : landscapeImageUrl ? (
              <div className="landscape-container">
                <img 
                  src={landscapeImageUrl} 
                  alt={`Generated landscape of ${selectedPlanet}`} 
                  onClick={() => handleOpenModal(landscapeImageUrl, `Landscape of ${selectedPlanet}`)}
                />
              </div>
            ) : (
              <p>Click the button to generate a landscape image of {selectedPlanet}.</p>
            )}
          </div>
          
          {/* Species Generation Section */}
          <div className="detail-card species-section">
            <h3 className="card-header">Generate Alien Species</h3>
            <button 
              className="generate-button" 
              onClick={handleGenerateSpeciesClick}
              disabled={isSpeciesLoading}
            >
              {isSpeciesLoading ? 'Generating...' : 'Generate Species'}
            </button>
            
            {isSpeciesLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Generating alien species... This may take a moment.</p>
              </div>
            ) : speciesError ? (
              <p className="error-message">{speciesError}</p>
            ) : speciesImageUrl ? (
              <div className="species-grid">
                <div className="species-card">
                  <h4>Species</h4>
                  {speciesImageUrl ? (
                    <img 
                      src={speciesImageUrl} 
                      alt="Species" 
                      onClick={() => handleOpenModal(speciesImageUrl, `Alien Species from ${selectedPlanet}`)}
                    />
                  ) : (
                    <div className="image-placeholder">Image not available</div>
                  )}
                  <p>{speciesDescription}</p>
                </div>
              </div>
            ) : (
              <div>
                <p>
                  Click the button to generate a hypothetical alien species that might 
                  evolve on {selectedPlanet} based on its environmental conditions.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Species/Landscape Modal */}
      <div className={`species-modal-overlay ${showModal ? 'active' : ''}`} onClick={handleCloseModal}>
        <div className="species-modal-content" onClick={(e) => e.stopPropagation()}>
          {modalImage && (
            <>
              <button className="species-modal-close" onClick={handleCloseModal}>×</button>
              <img 
                src={modalImage} 
                alt="Image" 
                className="species-modal-image"
              />
              <div className="species-modal-title">
                {modalTitle}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
