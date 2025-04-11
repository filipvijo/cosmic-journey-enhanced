import { useState, useEffect } from 'react';
import { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'; // Import default CSS
import './PlanetDetailView.css'; // Import the new CSS file

interface PlanetDetailViewProps {
  selectedPlanet: string;
  onBack: () => void; // Function to go back
}

// Define an interface for the expected data structure (based on the API response)
interface PlanetData {
  englishName: string;
  mass: { massValue: number; massExponent: number } | null;
  meanRadius: number;
  gravity: number;
  discoveredBy: string;
  discoveryDate: string;
  moons: { moon: string; rel: string }[] | null;
}

interface NASAImage {
  url: string;
  title: string;
}

interface YouTubeVideo {
  videoId: string;
  title: string;
  thumbnailUrl: string;
}

// NEW: Interface for Species data
interface SpeciesInfo {
  category: 'Micro-organism' | 'Animal' | 'Humanoid';
  name: string;
  description: string;
  imageUrl?: string | null;
}

export function PlanetDetailView({ selectedPlanet, onBack }: PlanetDetailViewProps) {
  // State variables for NASA data
  const [planetData, setPlanetData] = useState<PlanetData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // State variables for description
  const [description, setDescription] = useState<string | null>(null);
  const [isDescriptionLoading, setIsDescriptionLoading] = useState<boolean>(false);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);

  // State variables for NASA images
  const [nasaImages, setNasaImages] = useState<NASAImage[]>([]);
  const [isNasaImagesLoading, setIsNasaImagesLoading] = useState<boolean>(false);
  const [nasaImagesError, setNasaImagesError] = useState<string | null>(null);
  
  // Modal state for NASA images
  const [nasaModalOpen, setNasaModalOpen] = useState<boolean>(false);
  const [selectedNasaImage, setSelectedNasaImage] = useState<NASAImage | null>(null);
  const [selectedNasaImageIndex, setSelectedNasaImageIndex] = useState<number>(0);

  // State variables for YouTube Videos
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideo[]>([]);
  const [isVideosLoading, setIsVideosLoading] = useState<boolean>(false);
  const [videosError, setVideosError] = useState<string | null>(null);

  // State variables for Astrology Info
  const [astrologyText, setAstrologyText] = useState<string | null>(null);
  const [isAstrologyLoading, setIsAstrologyLoading] = useState<boolean>(false);
  const [astrologyError, setAstrologyError] = useState<string | null>(null);

  // State variables for landscape image
  const [landscapeImageUrl, setLandscapeImageUrl] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // State variables for Species
  const [speciesData, setSpeciesData] = useState<SpeciesInfo[]>([]);
  const [isSpeciesLoading, setIsSpeciesLoading] = useState<boolean>(false);
  const [speciesError, setSpeciesError] = useState<string | null>(null);
  
  // Modal state for species images
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedSpecies, setSelectedSpecies] = useState<SpeciesInfo | null>(null);

  // useEffect for all fetches
  useEffect(() => {
    if (!selectedPlanet) return;

    // Fetch NASA Data
    const fetchPlanetData = async () => {
      console.log(`Frontend: Fetching data for ${selectedPlanet}`);
      setIsLoading(true);
      setError(null);
      setPlanetData(null);

      try {
        const response = await fetch(`/api/getPlanetInfo?planet=${selectedPlanet}`);
        if (!response.ok) {
          let errorMsg = `HTTP error! status: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMsg = errorData.error || errorMsg;
          } catch (e) {}
          throw new Error(errorMsg);
        }
        const data: PlanetData = await response.json();
        setPlanetData(data);
        console.log(`Frontend: Received data for ${selectedPlanet}:`, data);
      } catch (e: any) {
        console.error("Frontend: Failed to fetch planet data:", e);
        setError(`Failed to load data for ${selectedPlanet}. (${e.message})`);
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch OpenAI Description
    const fetchDescription = async () => {
      console.log(`Frontend: Fetching description for ${selectedPlanet}`);
      setIsDescriptionLoading(true);
      setDescriptionError(null);
      setDescription(null);

      try {
        const response = await fetch(`/api/getPlanetDescription?planet=${selectedPlanet}`);
        if (!response.ok) {
          let errorMsg = `HTTP error! status: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMsg = errorData.error || errorMsg;
          } catch (e) {}
          throw new Error(errorMsg);
        }
        const data = await response.json();
        setDescription(data.description);
        console.log(`Frontend: Received description for ${selectedPlanet}`);
      } catch (e: any) {
        console.error("Frontend: Failed to fetch description:", e);
        setDescriptionError(`Failed to load description. (${e.message})`);
      } finally {
        setIsDescriptionLoading(false);
      }
    };

    // Fetch NASA Images
    const fetchNasaImages = async () => {
      if (!selectedPlanet) return; // Should not happen if called from useEffect, but safe check
      console.log(`Frontend: Fetching NASA images for ${selectedPlanet}`);
      setIsNasaImagesLoading(true);
      setNasaImagesError(null);
      setNasaImages([]); // Clear previous images

      try {
          const response = await fetch(`/api/getNasaImages?planet=${selectedPlanet}`);
          if (!response.ok) {
              let errorMsg = `NASA Image Fetch error! Status: ${response.status}`;
              try { const errorData = await response.json(); errorMsg = errorData.error || errorMsg; } catch (e) {}
              throw new Error(errorMsg);
          }
          const data = await response.json();
          setNasaImages(data.images || []); // Set images, default to empty array if missing
          console.log(`Frontend: Received ${data.images?.length || 0} NASA images for ${selectedPlanet}`);
      } catch (e: any) {
          console.error("Frontend: Failed to fetch NASA images:", e);
          setNasaImagesError(`Failed to load NASA images. (${e.message})`);
      } finally {
          setIsNasaImagesLoading(false);
      }
    };

    // Fetch YouTube Videos
    const fetchYouTubeVideos = async () => {
        if (!selectedPlanet) return;
        console.log(`Frontend: Fetching YouTube videos for ${selectedPlanet}`);
        setIsVideosLoading(true);
        setVideosError(null);
        setYoutubeVideos([]);

        try {
            const response = await fetch(`/api/getPlanetVideos?planet=${selectedPlanet}`);
            if (!response.ok) {
                let errorMsg = `YouTube Video Fetch error! Status: ${response.status}`;
                try { const errorData = await response.json(); errorMsg = errorData.error || errorMsg; } catch (e) {}
                throw new Error(errorMsg);
            }
            const data = await response.json();
            setYoutubeVideos(data.videos || []);
            console.log(`Frontend: Received ${data.videos?.length || 0} YouTube videos`);
        } catch (e: any) {
            console.error("Frontend: Failed to fetch YouTube videos:", e);
            setVideosError(`Failed to load YouTube videos. (${e.message})`);
        } finally {
            setIsVideosLoading(false);
        }
    };

    // Fetch Astrology Info
    const fetchAstrologyInfo = async () => {
      if (!selectedPlanet) return;
      console.log(`Frontend: Fetching astrology info for ${selectedPlanet}`);
      setIsAstrologyLoading(true);
      setAstrologyError(null);
      setAstrologyText(null);
  
      try {
          const response = await fetch(`/api/getAstrologyInfo?planet=${selectedPlanet}`);
          if (!response.ok) {
              let errorMsg = `Astrology Fetch error! Status: ${response.status}`;
              try { const errorData = await response.json(); errorMsg = errorData.error || errorMsg; } catch (e) {}
              throw new Error(errorMsg);
          }
          const data = await response.json();
          setAstrologyText(data.astrologyText || 'No astrology info returned.');
          console.log(`Frontend: Received astrology info for ${selectedPlanet}`);
      } catch (e: any) {
          console.error("Frontend: Failed to fetch astrology info:", e);
          setAstrologyError(`Failed to load astrology info. (${e.message})`);
      } finally {
          setIsAstrologyLoading(false);
      }
    };

    fetchPlanetData();
    fetchDescription();
    fetchNasaImages(); // Call the new function
    fetchYouTubeVideos(); // <-- Call the new function
    fetchAstrologyInfo(); // <-- Call the new function

    // Clear previous image state when planet changes
    setLandscapeImageUrl(null);
    setIsImageLoading(false);
    setImageError(null);

  }, [selectedPlanet]);

  // Handler function for the Generate button
  const handleGenerateLandscapeClick = async () => {
    if (!selectedPlanet) return;

    try {
      console.log(`Frontend: Requesting landscape for ${selectedPlanet}`);
      setIsImageLoading(true);
      setImageError(null);
      setLandscapeImageUrl(null);

      const response = await fetch(`/api/generateLandscape?planet=${selectedPlanet}`);

      if (!response.ok) {
        let errorMsg = `Backend error! Status: ${response.status}`;
        try { const errorData = await response.json(); errorMsg = errorData.error || errorMsg; } catch(e){}
        throw new Error(errorMsg);
      }

      const data = await response.json();
      const finalImageUrl = data?.imageUrl;

      if (data.message && !finalImageUrl) {
        console.log(`Frontend: Image generation skipped by backend: ${data.message}`);
        setImageError(data.message);
      } else if (!finalImageUrl) {
        throw new Error('Backend did not return an image URL.');
      } else {
        setLandscapeImageUrl(finalImageUrl);
        console.log(`Frontend: Received landscape URL for ${selectedPlanet}`);
      }

    } catch (e: any) {
      console.error("Frontend: Failed to generate landscape:", e);
      setImageError(`Failed to load landscape. (${e.message})`);
    } finally {
      setIsImageLoading(false);
    }
  };

  // NEW: Handler function for the Generate Species button
  const handleGenerateSpeciesClick = async () => {
    if (!selectedPlanet) return;
  
    try {
      console.log(`Frontend: Requesting species for ${selectedPlanet}`);
      setIsSpeciesLoading(true);
      setSpeciesError(null);
      setSpeciesData([]); // Clear previous species
  
      const response = await fetch(`/api/generateSpecies?planet=${selectedPlanet}`);
  
      if (!response.ok) {
           let errorMsg = `Species Gen error! Status: ${response.status}`;
           try { const errorData = await response.json(); errorMsg = errorData.error || errorMsg; } catch(e){}
           throw new Error(errorMsg);
      }
  
      const data = await response.json();
  
      if (!data.species || !Array.isArray(data.species) || data.species.length === 0) {
          throw new Error('Backend did not return valid species data.');
      }
  
      setSpeciesData(data.species); // Set the array of species objects
      console.log(`Frontend: Received species data for ${selectedPlanet}`);
      if(data.image_error) { // Check if backend reported image errors
           setSpeciesError(`Descriptions loaded, but image generation failed: ${data.image_error}`);
      }
  
    } catch (e: any) {
        console.error("Frontend: Failed to generate species:", e);
        setSpeciesError(`Failed to load species. (${e.message})`);
    } finally {
        setIsSpeciesLoading(false);
    }
  };

  // Handler for opening the species image modal
  const handleOpenModal = (species: SpeciesInfo) => {
    setSelectedSpecies(species);
    setModalOpen(true);
    // Prevent scrolling when modal is open
    document.body.style.overflow = 'hidden';
  };

  // Handler for closing the species image modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedSpecies(null);
    // Re-enable scrolling
    document.body.style.overflow = 'auto';
  };

  // Modal handlers for NASA images
  const handleOpenNasaModal = (image: NASAImage, index: number) => {
    setSelectedNasaImage(image);
    setSelectedNasaImageIndex(index);
    setNasaModalOpen(true);
    // Prevent scrolling when modal is open
    document.body.style.overflow = 'hidden';
  };

  const handleCloseNasaModal = () => {
    setNasaModalOpen(false);
    setSelectedNasaImage(null);
    // Re-enable scrolling
    document.body.style.overflow = 'auto';
  };

  const handlePrevNasaImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (nasaImages.length > 0) {
      const newIndex = (selectedNasaImageIndex - 1 + nasaImages.length) % nasaImages.length;
      setSelectedNasaImageIndex(newIndex);
      setSelectedNasaImage(nasaImages[newIndex]);
    }
  };

  const handleNextNasaImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (nasaImages.length > 0) {
      const newIndex = (selectedNasaImageIndex + 1) % nasaImages.length;
      setSelectedNasaImageIndex(newIndex);
      setSelectedNasaImage(nasaImages[newIndex]);
    }
  };

  return (
    <SkeletonTheme baseColor="var(--skeleton-base)" highlightColor="var(--skeleton-highlight)">
      <div className="planet-detail-container">
        <button className="back-button" onClick={onBack}>
          Back
        </button>
        
        <h1 className="planet-title">{selectedPlanet}</h1>
        
        <div className="detail-content">
          <div className="planet-details-grid">
            {/* Planet Info Card */}
            <div className="detail-card">
              <h3 className="card-header">Planet Info</h3>
              {isLoading ? (
                <>
                  <div className="loading-skeleton"></div>
                  <div className="loading-skeleton"></div>
                  <div className="loading-skeleton"></div>
                </>
              ) : error ? (
                <p className="error-message">{error}</p>
              ) : planetData && (
                <div className="planet-info">
                  <div className="info-item">
                    <span className="info-label">Diameter:</span>
                    <span className="info-value">{planetData.meanRadius * 2} km</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Moons:</span>
                    <span className="info-value">{planetData.moons ? planetData.moons.length : 0}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Gravity:</span>
                    <span className="info-value">{planetData.gravity} m/s²</span>
                  </div>
                  {planetData.mass && (
                    <div className="info-item">
                      <span className="info-label">Mass:</span>
                      <span className="info-value">{planetData.mass.massValue} × 10^{planetData.mass.massExponent} kg</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Description Card */}
            <div className="detail-card">
              <h3 className="card-header">Description</h3>
              {isDescriptionLoading ? (
                <>
                  <div className="loading-skeleton"></div>
                  <div className="loading-skeleton"></div>
                  <div className="loading-skeleton"></div>
                </>
              ) : descriptionError ? (
                <p className="error-message">{descriptionError}</p>
              ) : description ? (
                <p>{description}</p>
              ) : (
                <p>No description available.</p>
              )}
            </div>
            
            {/* NASA Image Card */}
            <div className="detail-card nasa-image-card">
              <h3 className="card-header">NASA Images</h3>
              {isNasaImagesLoading ? (
                <div className="nasa-gallery">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <div key={i} className="loading-skeleton" style={{ aspectRatio: '1', borderRadius: '4px' }}></div>
                  ))}
                </div>
              ) : nasaImagesError ? (
                <p className="error-message">{nasaImagesError}</p>
              ) : nasaImages.length > 0 ? (
                <div className="nasa-gallery">
                  {nasaImages.map((image, index) => (
                    <div 
                      key={index} 
                      className="nasa-gallery-item"
                      onClick={() => handleOpenNasaModal(image, index)}
                      title={image.title}
                    >
                      <img 
                        src={image.url} 
                        alt={image.title || `NASA image of ${selectedPlanet}`} 
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p>No NASA images available.</p>
              )}
            </div>
            
            {/* Videos Section */}
            <div className="detail-card videos-section">
              <h3 className="card-header">Related Videos</h3>
              {isVideosLoading ? (
                <div className="video-grid">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="loading-skeleton" style={{ height: '120px' }}></div>
                  ))}
                </div>
              ) : videosError ? (
                <p className="error-message">{videosError}</p>
              ) : youtubeVideos.length > 0 ? (
                <div className="video-grid">
                  {youtubeVideos.map((video) => (
                    <div key={video.videoId} className="video-item">
                      <a 
                        href={`https://www.youtube.com/watch?v=${video.videoId}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        title={video.title}
                      >
                        <img src={video.thumbnailUrl} alt={video.title} />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No videos available.</p>
              )}
            </div>
            
            {/* AI Landscape Card */}
            <div className="detail-card ai-landscape-card">
              <h3 className="card-header">AI Landscape</h3>
              {isImageLoading ? (
                <div className="loading-skeleton" style={{ height: '200px' }}></div>
              ) : imageError ? (
                <p className="error-message">{imageError}</p>
              ) : landscapeImageUrl ? (
                <img 
                  src={landscapeImageUrl} 
                  alt={`AI-generated landscape of ${selectedPlanet}`} 
                />
              ) : (
                <div>
                  <p>No landscape image generated yet.</p>
                  <button 
                    className="generate-button" 
                    onClick={handleGenerateLandscapeClick}
                    disabled={isImageLoading}
                  >
                    {isImageLoading ? 'Generating...' : 'Generate Landscape'}
                  </button>
                </div>
              )}
            </div>
            
            {/* Hypothetical Species Section */}
            <div className="detail-card species-section">
              <h3 className="card-header">Hypothetical Species</h3>
              {isSpeciesLoading ? (
                <div className="species-grid">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="species-card">
                      <div className="loading-skeleton" style={{ height: '20px', width: '80%', margin: '0 auto 10px' }}></div>
                      <div className="loading-skeleton" style={{ height: '150px' }}></div>
                      <div className="loading-skeleton" style={{ height: '60px' }}></div>
                    </div>
                  ))}
                </div>
              ) : speciesError ? (
                <p className="error-message">{speciesError}</p>
              ) : speciesData.length > 0 ? (
                <div className="species-grid">
                  {speciesData.map((species, index) => (
                    <div key={index} className="species-card">
                      <h4>{species.name}</h4>
                      <span className="species-category">{species.category}</span>
                      {species.imageUrl ? (
                        <img 
                          src={species.imageUrl} 
                          alt={species.name} 
                          onClick={() => handleOpenModal(species)}
                        />
                      ) : (
                        <div className="image-placeholder">Image not available</div>
                      )}
                      <p>{species.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <p>No species generated yet.</p>
                  <button 
                    className="generate-button" 
                    onClick={handleGenerateSpeciesClick}
                    disabled={isSpeciesLoading}
                  >
                    {isSpeciesLoading ? 'Generating...' : 'Generate Species'}
                  </button>
                </div>
              )}
            </div>
            
            {/* Astrological Meaning Section */}
            <div className="detail-card astrology-section">
              <h3 className="card-header">Astrological Meaning</h3>
              {isAstrologyLoading ? (
                <>
                  <div className="loading-skeleton"></div>
                  <div className="loading-skeleton"></div>
                  <div className="loading-skeleton"></div>
                </>
              ) : astrologyError ? (
                <p className="error-message">{astrologyError}</p>
              ) : astrologyText ? (
                <p>{astrologyText}</p>
              ) : (
                <p>No astrological information available.</p>
              )}
            </div>
          </div>
        </div>

        {/* NASA Image Modal */}
        <div className={`nasa-modal-overlay ${nasaModalOpen ? 'active' : ''}`} onClick={handleCloseNasaModal}>
          <div className="nasa-modal-content" onClick={(e) => e.stopPropagation()}>
            {selectedNasaImage && (
              <>
                <button className="nasa-modal-close" onClick={handleCloseNasaModal}>×</button>
                <img 
                  src={selectedNasaImage.url} 
                  alt={selectedNasaImage.title || `NASA image of ${selectedPlanet}`} 
                  className="nasa-modal-image"
                />
                {nasaImages.length > 1 && (
                  <>
                    <button className="nasa-modal-nav nasa-modal-prev" onClick={handlePrevNasaImage}>‹</button>
                    <button className="nasa-modal-nav nasa-modal-next" onClick={handleNextNasaImage}>›</button>
                  </>
                )}
                {selectedNasaImage.title && (
                  <div className="nasa-modal-title">
                    {selectedNasaImage.title}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Species Image Modal */}
        <div className={`species-modal-overlay ${modalOpen ? 'active' : ''}`} onClick={handleCloseModal}>
          <div className="species-modal-content" onClick={(e) => e.stopPropagation()}>
            {selectedSpecies && (
              <>
                <button className="species-modal-close" onClick={handleCloseModal}>×</button>
                <img 
                  src={selectedSpecies.imageUrl || ''} 
                  alt={selectedSpecies.name} 
                  className="species-modal-image"
                />
                <div className="species-modal-title">
                  {selectedSpecies.name} <span style={{ color: 'var(--accent-color)' }}>({selectedSpecies.category})</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </SkeletonTheme>
  );
}
