import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuctionCard from '../components/AuctionCard';

const Dashboard = () => {
  const [auctions, setAuctions] = useState([]);
  const [activeTab, setActiveTab] = useState('available');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return; // Avoid fetching until currentUser is set

    const fetchAuctions = () => {
      axios
        .get(`${import.meta.env.VITE_SERVER}/api/v1/auctions`)
        .then(res => setAuctions(res.data.data || []))
        .catch(err => {
          console.error('Error fetching auctions:', err);
          setAuctions([]);
        });
    };

    fetchAuctions();
    const intervalId = setInterval(fetchAuctions, 30000);
    return () => clearInterval(intervalId);
  }, [currentUser]);

  const myAuctions = auctions.filter(a => currentUser && a.auctioneer?._id === currentUser._id);
  const availableAuctions = auctions.filter(a =>
    currentUser && a.auctioneer?._id !== currentUser._id &&
    (a.status === 'upcoming' || a.status === 'ongoing')
  );
  const auctionHistory = auctions.filter(a => a.status === 'completed' || a.status === 'cancelled');

  return (
    <div className="container mx-auto p-4">
      {console.log("Backend URL:", import.meta.env.VITE_SERVER)}
      <h1 className="text-2xl text-white font-bold mb-4">Dashboard</h1>
      <div className="mb-4 bg-blue-900 p-3 rounded-2xl">
        <button 
          onClick={() => setActiveTab('available')} 
          className={`mr-2 hover:underline duration-75 p-2 ${activeTab === 'available' ? 'text-amber-300' : 'text-white'}`}
        >
          Available Auctions
        </button>
        <button 
          onClick={() => setActiveTab('my')} 
          className={`mr-2 hover:underline duration-75 p-2 ${activeTab === 'my' ? 'text-amber-300' : 'text-white'}`}
        >
          My Auctions
        </button>
        <button 
          onClick={() => setActiveTab('history')} 
          className={`mr-2 p-2 hover:underline duration-75 ${activeTab === 'history' ? 'text-amber-300' : 'text-white'}`}
        >
          Auction History
        </button>
      </div>

      {activeTab === 'available' && (
        <div className="relative flex overflow-x-hidden bg-green-400/50 rounded-2xl p-3 grid-cols-1 md:grid-cols-3 gap-4">
          {availableAuctions.map(auction => (
            <AuctionCard key={auction._id} auction={auction} />
          ))}
          {availableAuctions.length === 0 && (
            <div className="marquee-container">
              <div className="animate-marquee">
                <span>No available auctions.</span>
                <span>No available auctions.</span>
                <span>No available auctions.</span>
                <span>No available auctions.</span>
                <span>No available auctions.</span>
              </div>
              {/* Duplicate content for smooth transition */}
              <div className="animate-marquee" aria-hidden="true">
                <span className='ml-7'>No available auctions</span>
                <span>No available auctions</span>
                <span>No available auctions</span>
                <span>No available auctions</span>
                <span>No available auctions</span>
              </div>
            </div>
          )}
          {console.log("Backend URL:", import.meta.env.VITE_SERVER)}
        </div>
      )}

      {activeTab === 'my' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {myAuctions.map(auction => (
            <AuctionCard key={auction._id} auction={auction} />
          ))}
          {myAuctions.length === 0 && <p>You have not hosted any auctions.</p>}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {auctionHistory.map(auction => (
            <AuctionCard key={auction._id} auction={auction} />
          ))}
          {auctionHistory.length === 0 && <p>No auction history available.</p>}
        </div>
      )}
    </div>
  );
};

export default Dashboard;