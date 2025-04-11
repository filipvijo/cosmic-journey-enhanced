// Use 'any' for request/response types to avoid Vercel deployment issues
import type { VercelRequest, VercelResponse } from '@vercel/node';

// --- Keep dotenv workaround for local dev ---

// OpenAI response type (optional but helpful)
interface OpenAIChatChoice {
    message?: { content?: string | null };
}
interface OpenAIResponse {
    choices?: OpenAIChatChoice[];
    error?: { message: string };
}

// Define the type for astrological information
interface AstrologyInfo {
  meaning: string;
  traits: string[];
  compatibility: string[];
}

// Handler function for the API endpoint
export default async function handler(request: VercelRequest, response: VercelResponse) {
    const { planet } = request.query;
    const apiKey = process.env.OPENAI_API_KEY;

    console.log("--- Astrology Info Handler ---");
    console.log(`OpenAI Key found: ${!!apiKey}`);
    console.log(`Planet requested: ${planet}`);

    if (!planet || typeof planet !== 'string') {
        console.error("Astrology: Missing planet parameter");
        return response.status(400).json({ error: 'Planet parameter is required' });
    }

    if (!apiKey) {
        console.error("Astrology: API key missing");
        return response.status(500).json({ error: 'OpenAI API key is not configured' });
    }

    try {
        // Enhanced astrological descriptions with more detailed content
        console.log("Astrology: Returning enhanced astrological information");
        const astrologyInfo = {
            mercury: "In astrology, Mercury governs communication, intellect, and rational thought. As the planet closest to the Sun, it symbolizes quick thinking and adaptability. Mercury's retrograde periods—when it appears to move backward—are infamous for causing miscommunications and technological disruptions. This planet rules both Gemini and Virgo, influencing their analytical and communicative traits. In your birth chart, Mercury's position reveals how you process information, communicate ideas, and solve problems. Ancient astrologers associated Mercury with the Greek god Hermes, messenger of the gods, highlighting its connection to travel and commerce. Mercury's swift orbit represents the mind's agility, while its proximity to the Sun symbolizes how our thoughts are illuminated by consciousness and awareness.",
            
            venus: "Venus, the brightest object in our night sky after the Moon, represents love, beauty, pleasure, and values in astrology. As ruler of Taurus and Libra, Venus influences our approach to relationships, aesthetics, and material comforts. In your birth chart, Venus reveals what you find beautiful, how you express affection, and what you value most. The planet's 584-day synodic cycle creates a five-pointed star pattern in the sky, which ancient cultures considered sacred geometry. Venus's retrograde periods often bring past relationships back for resolution or reconsideration. Named after the Roman goddess of love and beauty, Venus energy encourages harmony, artistic expression, and sensual pleasure. Its position by house and sign in your chart indicates where you seek balance and connection.",
            
            earth: "Earth, our home planet, holds a unique position in astrology as the vantage point from which we observe all other celestial bodies. Though not traditionally used as a planetary influence in birth charts, Earth energy represents groundedness, practicality, and our physical existence. In esoteric astrology, Earth is considered the complementary energy to the Sun, representing how we manifest our solar purpose in material reality. Some modern astrologers associate Earth with Taurus, highlighting themes of stability, resources, and connection to nature. Earth's seasons and axial tilt create the foundational cycles upon which much of astrology is based. Understanding Earth's position helps us integrate our spiritual aspirations with practical, everyday concerns—balancing cosmic awareness with earthly responsibilities.",
            
            mars: "Mars, the fiery red planet, represents action, desire, courage, and assertiveness in astrology. As ruler of Aries and traditional ruler of Scorpio, Mars influences how we pursue goals, express anger, and experience passion. In your birth chart, Mars reveals your energy levels, competitive drive, and sexual expression. Mars takes approximately two years to orbit the Sun, spending about six weeks in each zodiac sign. During its retrograde periods, which occur every two years, collective energy turns inward for reassessment. Named after the Roman god of war, Mars energy can manifest as either constructive ambition or destructive aggression. Mars's position by house and sign in your chart indicates where you're most motivated to take action and how you fight for what you want.",
            
            jupiter: "Jupiter, the solar system's largest planet, represents expansion, abundance, wisdom, and good fortune in astrology. As ruler of Sagittarius and traditional ruler of Pisces, Jupiter influences our philosophy, higher education, and spiritual beliefs. In your birth chart, Jupiter reveals where you experience growth, luck, and opportunity. Jupiter takes approximately 12 years to orbit the Sun, spending about one year in each zodiac sign and shaping generational optimism. Known as the 'Great Benefic,' Jupiter's transits often coincide with periods of expansion and prosperity. Named after the king of Roman gods, Jupiter energy encourages exploration, generosity, and faith. Its position by house and sign in your chart indicates where you seek meaning and truth, and how you express your most optimistic nature.",
            
            saturn: "Saturn, with its distinctive rings, represents structure, discipline, responsibility, and life lessons in astrology. As ruler of Capricorn and traditional ruler of Aquarius, Saturn influences our ambitions, boundaries, and relationship with authority. In your birth chart, Saturn reveals where you face challenges that lead to maturity and mastery. Saturn takes approximately 29.5 years to orbit the Sun, creating significant life transitions at ages 29-30, 58-59, and 87-88—the famous 'Saturn Returns.' Known as the 'Great Teacher,' Saturn's transits often coincide with periods of hard work and delayed rewards. Named after the Roman god of time and harvest, Saturn energy demands patience, persistence, and integrity. Its position by house and sign indicates where you must develop discipline to achieve lasting success.",
            
            uranus: "Uranus, the sideways-spinning planet, represents revolution, innovation, sudden change, and individuality in astrology. As ruler of Aquarius, Uranus influences our originality, technological aptitude, and humanitarian impulses. In your birth chart, Uranus reveals where you break from tradition and express your unique genius. Uranus takes 84 years to orbit the Sun, spending approximately 7 years in each zodiac sign and shaping generational rebellions and technological breakthroughs. Discovered in 1781 during the American and French Revolutions, Uranus is associated with liberation and radical progress. Its transits often coincide with unexpected disruptions that ultimately lead to greater freedom. Uranus's position by house and sign indicates where you're most likely to experience sudden insights and where you resist conformity.",
            
            neptune: "Neptune, the misty blue planet, represents dreams, intuition, spirituality, and transcendence in astrology. As ruler of Pisces, Neptune influences our imagination, compassion, and connection to the collective unconscious. In your birth chart, Neptune reveals where boundaries dissolve and where you're most idealistic or prone to illusion. Neptune takes approximately 165 years to orbit the Sun, spending about 14 years in each zodiac sign and shaping generational spiritual movements and artistic trends. Discovered in 1846 during the rise of spiritualism and Romanticism, Neptune is associated with mystical experiences and creative inspiration. Its transits often coincide with periods of heightened sensitivity and spiritual awakening. Neptune's position by house and sign indicates where you seek unity with something greater than yourself.",
            
            pluto: "Pluto, though reclassified astronomically, remains a powerful force in astrology, representing transformation, power, death and rebirth, and the unconscious. As ruler of Scorpio, Pluto influences our relationship with control, intimacy, and psychological depths. In your birth chart, Pluto reveals where you experience profound transformation and where you must confront your shadows to claim your power. Pluto takes approximately 248 years to orbit the Sun, spending between 12 and 31 years in each zodiac sign due to its elliptical orbit. Discovered in 1930 during a period of global economic collapse and the rise of atomic power, Pluto is associated with collective upheaval and regeneration. Its position by house and sign indicates where you experience the most intense psychological dynamics and where you possess untapped resources for personal evolution."
        };
        
        const planetKey = planet.toLowerCase() as keyof typeof astrologyInfo;
        const astrologyText = astrologyInfo[planetKey] || `The astrological significance of ${planet} connects to themes of cosmic awareness and spiritual growth. This celestial body influences human consciousness in profound ways, affecting our perception of reality and connection to universal energies. In astrological traditions across cultures, ${planet} has been associated with specific qualities and archetypal energies that manifest in both personal and collective experiences. Its orbital patterns and relationships with other planets create unique energetic signatures that astrologers interpret to understand cycles of growth, challenge, and transformation. When prominent in a birth chart, ${planet} bestows distinctive qualities that shape personality, life direction, and spiritual development in meaningful ways.`;
        
        return response.status(200).json({ astrologyText });
    } catch (error: any) {
        console.error("Astrology: Error occurred", error);
        return response.status(500).json({ 
            error: error.message || 'Internal server error while fetching astrological information'
        });
    }
}
