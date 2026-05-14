import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

const GroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [currentUserName, setCurrentUserName] = useState('');
  
  // For join request
  const [joinForm, setJoinForm] = useState({ name: '', email: '' });
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestError, setRequestError] = useState(null);

  // For Admin actions
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [actionError, setActionError] = useState(null);

  const fetchGroup = async () => {
    try {
      const res = await api.get(`/api/groups/${id}`);
      if (res.success) {
        setGroup(res.data);
      } else {
        setError(res.error);
      }
    } catch (err) {
      setError('Failed to load group details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroup();
    // Try to load cached user info
    const cachedName = localStorage.getItem('guestName');
    const cachedEmail = localStorage.getItem('guestEmail');
    if (cachedName && cachedEmail) {
      setCurrentUserName(cachedName);
      setCurrentUserEmail(cachedEmail);
      setJoinForm({ name: cachedName, email: cachedEmail });
    }
  }, [id]);

  const handleJoinRequest = async (e) => {
    e.preventDefault();
    setRequestError(null);
    setIsRequesting(true);
    try {
      const res = await api.post(`/api/groups/${id}/request`, {
        user_name: joinForm.name,
        user_email: joinForm.email
      });
      if (res.success) {
        localStorage.setItem('guestName', joinForm.name);
        localStorage.setItem('guestEmail', joinForm.email);
        setCurrentUserName(joinForm.name);
        setCurrentUserEmail(joinForm.email);
        await fetchGroup(); // Refresh data to show pending status
      } else {
        setRequestError(res.error);
      }
    } catch (err) {
      setRequestError('An error occurred. Please try again.');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleAdminAction = async (requestId, status) => {
    setActionError(null);
    try {
      const res = await api.put(`/api/groups/${id}/requests/${requestId}`, {
        status,
        admin_email: adminEmailInput
      });
      if (res.success) {
        await fetchGroup();
      } else {
        setActionError(res.error);
      }
    } catch (err) {
      setActionError('An error occurred. Ensure you are using the correct admin email.');
    }
  };

  if (loading) return <div className="text-center py-20 text-xl font-bold">Loading details...</div>;
  if (error) return <div className="text-center py-20 text-red-500 text-xl">{error}</div>;
  if (!group) return null;

  const isFull = group.current_players >= group.max_players;
  
  // Find current user's request status
  const userRequest = currentUserEmail ? group.requests.find(r => r.user_email === currentUserEmail) : null;
  const userStatus = userRequest ? userRequest.status : null; // 'pending', 'accepted', 'rejected'

  const dateStr = new Date(group.game_date).toLocaleDateString('en-GB', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const startTimeStr = group.start_time.substring(0, 5);
  const endTimeStr = group.end_time.substring(0, 5);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <button onClick={() => navigate('/groups')} className="text-indigo-600 font-bold mb-6 hover:underline flex items-center gap-1">
        &larr; Back to Groups
      </button>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col">
        {/* Top: Game Info */}
        <div className="bg-gray-900 text-white p-6 sm:p-8">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-4xl font-extrabold">{group.sport_name}</h1>
            <span className={`px-4 py-2 rounded-xl font-bold ${isFull ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
              {group.current_players} / {group.max_players} Players
            </span>
          </div>

          <div className="space-y-6">
            <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-sm border border-white/5">
              <p className="text-sm text-gray-400 mb-1">Group Admin</p>
              <p className="text-xl font-bold text-indigo-300">{group.admin_name}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white/5 p-4 rounded-2xl">
                 <p className="text-sm text-gray-400 mb-1">Location</p>
                 <p className="font-semibold">{group.place}</p>
               </div>
               <div className="bg-white/5 p-4 rounded-2xl">
                 <p className="text-sm text-gray-400 mb-1">Date</p>
                 <p className="font-semibold">{dateStr}</p>
               </div>
               <div className="col-span-2 bg-white/5 p-4 rounded-2xl">
                 <p className="text-sm text-gray-400 mb-1">Time Window</p>
                 <p className="font-semibold text-lg">{startTimeStr} — {endTimeStr}</p>
               </div>
            </div>
          </div>
        </div>

        {/* Bottom: Join / Admin */}
        <div className="p-6 sm:p-8">
          
          {/* Join Section */}
          {!isAdminMode && (
            <div>
               <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-bold text-gray-900">Join the Game</h2>
                 <button onClick={() => setIsAdminMode(true)} className="text-sm text-indigo-600 hover:underline">I am the Admin</button>
               </div>

               {userStatus === 'accepted' ? (
                 <div className="bg-green-50 border-2 border-green-200 text-green-800 p-6 rounded-2xl text-center">
                   <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                     <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                   </div>
                   <h3 className="text-xl font-bold mb-2">You're In!</h3>
                   <p>Your request was accepted. See you at the game!</p>
                 </div>
               ) : userStatus === 'pending' ? (
                 <div className="bg-amber-50 border-2 border-amber-200 text-amber-800 p-6 rounded-2xl text-center">
                   <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                     <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                   </div>
                   <h3 className="text-xl font-bold mb-2">Request Pending</h3>
                   <p>Waiting for the group admin to accept your request.</p>
                 </div>
               ) : userStatus === 'rejected' ? (
                 <div className="bg-red-50 border-2 border-red-200 text-red-800 p-6 rounded-2xl text-center">
                   <h3 className="text-xl font-bold mb-2">Request Rejected</h3>
                   <p>Sorry, the admin rejected your join request.</p>
                 </div>
               ) : isFull ? (
                 <div className="bg-gray-100 border-2 border-gray-200 text-gray-600 p-6 rounded-2xl text-center">
                   <h3 className="text-xl font-bold mb-2">Group is Full</h3>
                   <p>This group has reached its maximum capacity of {group.max_players} players.</p>
                 </div>
               ) : (
                 <form onSubmit={handleJoinRequest} className="space-y-4">
                   <p className="text-gray-600 mb-4">Enter your details to send a join request to the group admin.</p>
                   {requestError && <div className="text-red-500 text-sm">{requestError}</div>}
                   <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-1">Your Name</label>
                     <input required type="text" value={joinForm.name} onChange={e => setJoinForm({...joinForm, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-200" placeholder="John Doe" />
                   </div>
                   <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-1">Your Email</label>
                     <input required type="email" value={joinForm.email} onChange={e => setJoinForm({...joinForm, email: e.target.value})} className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-200" placeholder="john@example.com" />
                   </div>
                   <button type="submit" disabled={isRequesting} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition mt-4 disabled:opacity-50">
                     {isRequesting ? 'Sending Request...' : 'Send Join Request'}
                   </button>
                 </form>
               )}
            </div>
          )}

          {/* Admin Section */}
          {isAdminMode && (
             <div>
               <div className="flex justify-between items-center mb-6 border-b pb-4">
                 <h2 className="text-2xl font-bold text-indigo-900">Admin Dashboard</h2>
                 <button onClick={() => setIsAdminMode(false)} className="text-sm text-gray-500 hover:underline">Exit Admin Mode</button>
               </div>
               
               <div className="mb-6 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                 <label className="block text-sm font-bold text-indigo-800 mb-2">Verify Admin Email to manage requests:</label>
                 <input 
                    type="email" 
                    value={adminEmailInput} 
                    onChange={e => setAdminEmailInput(e.target.value)} 
                    className="w-full px-4 py-2 rounded-lg border border-indigo-200 mb-2" 
                    placeholder="Enter email used to create group"
                 />
               </div>

               {actionError && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{actionError}</div>}

               <h3 className="font-bold text-gray-800 mb-3">Player Requests ({group.requests.length})</h3>
               
               {group.requests.length === 0 ? (
                 <p className="text-gray-500 italic text-sm">No requests yet.</p>
               ) : (
                 <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                   {group.requests.map(req => (
                     <div key={req.request_id} className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                       <div className="flex justify-between items-start mb-2">
                         <div>
                           <p className="font-bold text-gray-900">{req.user_name}</p>
                           <p className="text-xs text-gray-500">{req.user_email}</p>
                         </div>
                         <span className={`text-xs font-bold px-2 py-1 rounded ${req.status === 'accepted' ? 'bg-green-100 text-green-700' : req.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                           {req.status.toUpperCase()}
                         </span>
                       </div>
                       
                       {req.status === 'pending' && (
                         <div className="flex gap-2 mt-3">
                           <button 
                             onClick={() => handleAdminAction(req.request_id, 'accepted')}
                             disabled={isFull}
                             className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm font-bold py-2 rounded-lg disabled:opacity-50"
                           >
                             Accept
                           </button>
                           <button 
                             onClick={() => handleAdminAction(req.request_id, 'rejected')}
                             className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-bold py-2 rounded-lg"
                           >
                             Reject
                           </button>
                         </div>
                       )}
                     </div>
                   ))}
                 </div>
               )}
             </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default GroupDetails;
