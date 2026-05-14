import React, { useState, useEffect } from 'react';
import SportCard from '../components/SportCard';
import api from '../api';

const Sports = () => {
  const [sportsData, setSportsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper functions to map DB results to UI-friendly data
  const getCategory = (sportName) => {
    const indoorList = ['carrom', 'chess', 'table tennis', 'badminton'];
    return indoorList.includes(sportName.toLowerCase()) ? 'Indoor' : 'Outdoor';
  };

  const getImage = (sportName) => {
    const name = sportName.toLowerCase();
    if (name.includes('carrom')) return '/carrom_board.png';
    if (name.includes('chess')) return 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&q=80&w=600&h=400';
    if (name.includes('table tennis') || name.includes('ping pong')) return 'https://images.unsplash.com/photo-1534158914592-062992fbe900?auto=format&fit=crop&q=80&w=600&h=400';
    if (name.includes('cricket')) return 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=600&h=400';
    if (name.includes('football')) return 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&q=80&w=600&h=400';
    if (name.includes('volleyball')) return 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&q=80&w=600&h=400';
    if (name.includes('badminton')) return 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=600&h=400';
    if (name.includes('tennis')) return 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&q=80&w=600&h=400';
    if (name.includes('basketball')) return 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=600&h=400';
    
    // Default fallback image
    return 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=600&h=400';
  };

  const getDescription = (sportName) => {
    return `Book our premium ${sportName.toLowerCase()} courts and enjoy the game!`;
  };

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const result = await api.get('/api/sports');
        
        if (result.success) {
          // Map DB keys to SportCard expected props
          const formattedSports = result.data.map(sport => ({
            id: sport.id,
            title: sport.sport_name,
            price: sport.price,
            category: getCategory(sport.sport_name),
            image: getImage(sport.sport_name),
            description: getDescription(sport.sport_name)
          }));
          
          setSportsData(formattedSports);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch sports data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSports();
  }, []);

  // Filter groups
  const indoorGames = sportsData.filter(sport => sport.category === 'Indoor');
  const outdoorGames = sportsData.filter(sport => sport.category === 'Outdoor');

  return (
    <div className="min-h-[80vh] py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-20 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            Our Sports
          </h1>
          <p className="text-xl md:text-2xl text-blue-600 font-semibold tracking-wide">
            Choose Your Favorite Game
          </p>
          <div className="w-24 h-1.5 bg-blue-600 rounded-full mx-auto mt-6"></div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        ) : (
          <>
            {/* Indoor Games Section */}
            {indoorGames.length > 0 && (
              <div id="indoor" className="mb-24">
                <div className="mb-10 flex items-center justify-between border-b-2 border-gray-200 pb-4">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                     <span className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-sm">1</span> 
                     Indoor Games
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {indoorGames.map((game, index) => (
                    <div key={game.id} className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${index * 100}ms` }}>
                        <SportCard {...game} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Outdoor Games Section */}
            {outdoorGames.length > 0 && (
              <div id="outdoor" className="pt-8 mb-24">
                <div className="mb-10 flex items-center justify-between border-b-2 border-gray-200 pb-4">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                     <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm">2</span> 
                     Outdoor Games
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {outdoorGames.map((game, index) => (
                    <div key={game.id} className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${index * 100}ms` }}>
                        <SportCard {...game} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {sportsData.length === 0 && (
              <div className="text-center py-12">
                <p className="text-xl text-gray-500">No sports currently available to book.</p>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default Sports;
