import { useState, useCallback, useEffect, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate, useParams } from 'react-router-dom';
// --- Remove Canvas import if not used directly here ---
// import { Canvas } from '@react-three/fiber';
import { SolarSystemScene } from './components/SolarSystemScene';
import { PlanetDetailView } from './components/PlanetDetailView';
// --- Uncomment AuthProvider and useAuth ---
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';
import './App.css';
import './ApodModal.css'; // Create this CSS file later

// --- Add APOD Data Interface ---
interface ApodData {
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: 'image' | 'video';
  date: string;
  copyright?: string;
}
// --- End APOD Data Interface ---

// --- Uncomment fetch functions ---
const fetchPlanetInfo = async (planet: string, setPlanetInfo: Function, setIsLoading: Function, setError: Function) => {
    setIsLoading(true);
    setError(null);
    try {
        const response = await fetch(`/api/getPlanetInfo?planet=${planet}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setPlanetInfo(data);
    } catch (e: any) {
        setError(e.message || 'Failed to fetch planet info');
        setPlanetInfo(null);
    } finally {
        setIsLoading(false);
    }
};
const fetchPlanetDescription = async (planet: string, setPlanetDescription: Function, setIsDescriptionLoading: Function, setDescriptionError: Function) => {
    setIsDescriptionLoading(true);
    setDescriptionError(null);
     try {
        const response = await fetch(`/api/getPlanetDescription?planet=${planet}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setPlanetDescription(data.description);
    } catch (e: any) {
        setDescriptionError(e.message || 'Failed to fetch planet description');
        setPlanetDescription('');
    } finally {
        setIsDescriptionLoading(false);
    }
};
const fetchNasaImages = async (planet: string, setNasaImages: Function, setIsImagesLoading: Function, setImagesError: Function) => {
    setIsImagesLoading(true);
    setImagesError(null);
     try {
        const response = await fetch(`/api/getNasaImages?planet=${planet}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setNasaImages(data.images || []);
    } catch (e: any) {
        setImagesError(e.message || 'Failed to fetch NASA images');
        setNasaImages([]);
    } finally {
        setIsImagesLoading(false);
    }
};
// --- End fetch functions ---


// --- Uncomment PlanetDetailWrapper ---
function PlanetDetailWrapper() {
    const { planetName } = useParams<{ planetName: string }>();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [planetInfo, setPlanetInfo] = useState<any>(null);
    const [nasaImages, setNasaImages] = useState<any[]>([]);
    const [isImagesLoading, setIsImagesLoading] = useState<boolean>(true);
    const [imagesError, setImagesError] = useState<string | null>(null);
    const [planetDescription, setPlanetDescription] = useState<string>('');
    const [isDescriptionLoading, setIsDescriptionLoading] = useState<boolean>(true);
    const [descriptionError, setDescriptionError] = useState<string | null>(null);

    useEffect(() => {
        if (planetName) {
            console.log(`Wrapper: Fetching all data for ${planetName}`);
            fetchPlanetInfo(planetName, setPlanetInfo, setIsLoading, setError);
            fetchPlanetDescription(planetName, setPlanetDescription, setIsDescriptionLoading, setDescriptionError);
            fetchNasaImages(planetName, setNasaImages, setIsImagesLoading, setImagesError);
        }
    }, [planetName]);


    const handleBackToSolarSystem = useCallback(() => {
        navigate('/');
    }, [navigate]);

    if (!planetName) {
        return <Navigate to="/" />;
    }

    return (
        <PlanetDetailView
            selectedPlanet={planetName}
            onBack={handleBackToSolarSystem}
            planetInfo={planetInfo}
            isLoading={isLoading}
            error={error}
            nasaImages={nasaImages}
            isImagesLoading={isImagesLoading}
            imagesError={imagesError}
            planetDescription={planetDescription}
            isDescriptionLoading={isDescriptionLoading}
            descriptionError={descriptionError}
        />
    );
}
// --- End Wrapper ---


// --- Uncomment Protected Route component ---
interface ProtectedRouteProps {
  children: ReactNode;
}

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { currentUser, loading } = useAuth();

  // --- Add Logging ---
  console.log('ProtectedRoute: Checking auth state. Loading:', loading, 'CurrentUser:', !!currentUser);
  // --- End Logging ---

  if (loading) {
    console.log('ProtectedRoute: Still loading auth state...');
    return <div>Loading...</div>; // Show a loading indicator while checking auth state
  }

  if (!currentUser) {
    console.log('ProtectedRoute: No user found. Redirecting to /login.');
    return <Navigate to="/login" />;
  }

  // --- Add Logging ---
  console.log('ProtectedRoute: User found. Rendering children.');
  // --- End Logging ---
  return children;
}
// --- End Protected Route ---


// --- Restore AppContent ---
function AppContent() {
  // --- Uncomment useAuth ---
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // --- Add APOD State ---
  const [apodData, setApodData] = useState<ApodData | null>(null);
  const [isApodLoading, setIsApodLoading] = useState<boolean>(false);
  const [apodError, setApodError] = useState<string | null>(null);
  const [showApodModal, setShowApodModal] = useState<boolean>(false);
  // --- End APOD State ---

  const handlePlanetSelect = useCallback((planetName: string) => {
    // --- Restore navigation ---
    navigate(`/planet/${planetName}`);
    // console.log("Planet selected (navigation disabled):", planetName); // Remove test log
  }, [navigate]);

  // --- Add useEffect to fetch APOD ---
  useEffect(() => {
    const fetchApod = async () => {
      setIsApodLoading(true);
      setApodError(null);
      try {
        const response = await fetch('/api/getApod');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data: ApodData = await response.json();
        setApodData(data);
      } catch (e: any) {
        console.error("Failed to fetch APOD:", e);
        setApodError(e.message || 'Failed to fetch Picture of the Day');
      } finally {
        setIsApodLoading(false);
      }
    };

    fetchApod();
  }, []); // Fetch only once on mount
  // --- End useEffect ---

  return (
    <div className="App">
      {/* Restore original routing */}
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              {/* Restore original structure */}
              <> {/* Use Fragment to wrap multiple elements */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0 }}>
                  <SolarSystemScene onPlanetSelect={handlePlanetSelect} />
                </div>
                {/* --- Add APOD Button --- */}
                <button
                  className="apod-button"
                  onClick={() => setShowApodModal(true)}
                  disabled={isApodLoading || !!apodError || !apodData}
                  title={apodError ? apodError : (apodData ? `Astronomy Picture of the Day: ${apodData.title}` : 'Loading APOD...')}
                >
                  {isApodLoading ? 'Loading APOD...' : (apodError ? 'APOD Error' : 'APOD')}
                </button>
                {/* --- End APOD Button --- */}
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/planet/:planetName"
          element={
            <ProtectedRoute>
              <PlanetDetailWrapper />
            </ProtectedRoute>
          }
        />
        {/* Add other protected routes like /journal if needed */}

         {/* Restore catch-all */}
         <Route path="*" element={<Navigate to={currentUser ? "/" : "/login"} replace />} />

      </Routes>
      {/* Remove the test element */}
      {/* <h1 style={{ position: 'absolute', top: '10px', left: '10px', color: 'white', zIndex: 1 }}>TESTING</h1> */}

      {/* --- Add APOD Modal --- */}
      {showApodModal && apodData && (
        <div className="apod-modal-overlay" onClick={() => setShowApodModal(false)}>
          <div className="apod-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="apod-modal-close" onClick={() => setShowApodModal(false)}>×</button>
            <h2>{apodData.title}</h2>
            <p className="apod-modal-date">{apodData.date}{apodData.copyright ? ` - © ${apodData.copyright}` : ''}</p>
            {apodData.media_type === 'image' ? (
              <a href={apodData.hdurl || apodData.url} target="_blank" rel="noopener noreferrer">
                <img src={apodData.url} alt={apodData.title} className="apod-modal-image" />
              </a>
            ) : (
              <iframe
                src={apodData.url}
                title={apodData.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="apod-modal-video"
              ></iframe>
            )}
            <p className="apod-modal-explanation">{apodData.explanation}</p>
          </div>
        </div>
      )}
      {/* --- End APOD Modal --- */}
    </div>
  );
}

function App() {
  return (
    <Router>
      {/* --- Uncomment AuthProvider --- */}
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;