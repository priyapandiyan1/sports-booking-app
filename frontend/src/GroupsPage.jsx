import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from './api';

const GroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Create Group Form
  const [formData, setFormData] = useState({
    admin_name: '',
    admin_email: '',
    sport_id: '',
    place: '',
    game_date: '',
    start_time: '18:00',
    end_time: '19:00',
    max_players: 10
  });

  const navigate = useNavigate();

  const fetchGroupsAndSports = async () => {
    try {
      const [groupsRes, sportsRes] = await Promise.all([
        api.get('/api/groups'),
        api.get('/api/sports')
      ]);

      if (groupsRes.success) setGroups(groupsRes.data);
      if (sportsRes.success) {
         setSports(sportsRes.data);
         if (sportsRes.data.length > 0) {
             setFormData(prev => ({...prev, sport_id: sportsRes.data[0].id}));
         }
      }
    } catch (err) {
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupsAndSports();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/groups', {
        ...formData,
        start_time: formData.start_time + ":00",
        end_time: formData.end_time + ":00"
      });
      if (res.success) {
        setShowModal(false);
        navigate(`/groups/${res.groupId}`);
      } else {
        alert(res.error || 'Failed to create group');
      }
    } catch (err) {
      alert('An error occurred. Please try again.');
    }
  };

  if (loading) return <div className="text-center py-20 text-xl font-bold">Loading groups...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Play with Others</h1>
          <p className="text-gray-600 text-lg">Join an existing game or create your own group!</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition shadow-lg"
        >
          + Create Game Group
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">{error}</div>
      )}

      {groups.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500 text-lg mb-4">No active game groups found right now.</p>
          <button 
            onClick={() => setShowModal(true)}
            className="text-indigo-600 font-bold hover:underline"
          >
            Be the first to create one!
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(group => {
            const isFull = group.current_players >= group.max_players;
            const dateStr = new Date(group.game_date).toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' });
            const startTimeStr = group.start_time.substring(0, 5);
            const endTimeStr = group.end_time.substring(0, 5);

            return (
              <Link 
                to={`/groups/${group.id}`} 
                key={group.id}
                className="block bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100 overflow-hidden transform hover:-translate-y-1"
              >
                <div className="bg-gray-900 p-5 text-white">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold">{group.sport_name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${isFull ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                      {group.current_players} / {group.max_players} Players
                    </span>
                  </div>
                  <p className="text-gray-400 mt-1 text-sm flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    {group.place}
                  </p>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                    <div>
                      <p className="font-semibold text-gray-900">Date</p>
                      <p>{dateStr}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Time</p>
                      <p>{startTimeStr} - {endTimeStr}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="font-semibold text-gray-900">Admin</p>
                      <p>{group.admin_name}</p>
                    </div>
                  </div>
                  <div className={`text-center py-2 rounded-lg font-bold ${isFull ? 'bg-gray-100 text-gray-500' : 'bg-indigo-50 text-indigo-600'}`}>
                    {isFull ? 'Group Full' : 'View & Join'}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 my-8 relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Game Group</h2>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Your Name</label>
                  <input required type="text" name="admin_name" value={formData.admin_name} onChange={handleInputChange} className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-indigo-200" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Your Email</label>
                  <input required type="email" name="admin_email" value={formData.admin_email} onChange={handleInputChange} className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-indigo-200" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Sport</label>
                <select required name="sport_id" value={formData.sport_id} onChange={handleInputChange} className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-indigo-200 bg-white">
                  {sports.map(s => <option key={s.id} value={s.id}>{s.sport_name} (₹{s.price}/hr)</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Location / Ground</label>
                <input required type="text" name="place" value={formData.place} onChange={handleInputChange} className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-indigo-200" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
                  <input required type="date" min={new Date().toISOString().split('T')[0]} name="game_date" value={formData.game_date} onChange={handleInputChange} className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-indigo-200" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Max Players</label>
                  <input required type="number" min="2" max="50" name="max_players" value={formData.max_players} onChange={handleInputChange} className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-indigo-200" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Start Time</label>
                  <input required type="time" name="start_time" value={formData.start_time} onChange={handleInputChange} className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-indigo-200" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">End Time</label>
                  <input required type="time" name="end_time" value={formData.end_time} onChange={handleInputChange} className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-indigo-200" />
                </div>
              </div>
              <p className="text-xs text-gray-500 py-2">Note: Creating a group does not automatically book the venue slot. You must still book the ground separately if it's a paid venue.</p>
              <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition">
                Create Group
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupsPage;
