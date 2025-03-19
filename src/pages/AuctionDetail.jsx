import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

const AuctionDetail = () => {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [bidAmount, setBidAmount] = useState("");
  const [socket, setSocket] = useState(null);
  const lastValidStatusRef = useRef(null);
  const lastValidBidderRef = useRef(null);
  const lastWinnerRef = useRef(null);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_SERVER}/api/v1/auctions/${id}`)
      .then((res) => {
        setAuction(res.data.data);

        if (res.data.data?.bids?.length > 0) {
          lastValidBidderRef.current = res.data.data.bids[res.data.data.bids.length - 1].user.username;
        }
        if (res.data.data.status === "completed" && res.data.data.winner) {
          lastWinnerRef.current = res.data.data.winner.username;
        }
      })
      .catch((err) => console.error(err));

    const newSocket = io(`${import.meta.env.VITE_SERVER}`, { transports: ["websocket"] });
    
    newSocket.on("connect", () => {
      console.log("Connected to WebSocket");
      newSocket.emit("joinAuction", id);
    });

    newSocket.on("bidUpdate", (data) => {
      if (data.auctionId === id) {
        setAuction((prev) => prev ? {
          ...prev,
          currentBid: data.currentBid,
          status: data.status,
          bids: [...prev.bids, { user: { username: data.username }, amount: data.currentBid }],
        } : prev);
        lastValidBidderRef.current = data.username;
      }
    });

    newSocket.on("auctionStatusUpdate", ({ auctionId, status, winner }) => {
      if (auctionId === id) {
        setAuction((prev) => prev ? { ...prev, status } : prev);
        if (status === "completed" && winner) {
          lastWinnerRef.current = winner.username;
        }
      }
    });

    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, [id]);

  useEffect(() => {
    if (auction?.status) {
      lastValidStatusRef.current = auction.status;
    }
  }, [auction?.status]);

  const handlePlaceBid = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      await axios.post(`${import.meta.env.VITE_SERVER}/api/v1/auctions/bid`,
        { auctionId: id, bidAmount },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      alert("Bid placed successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to place bid");
    }
  };

  if (!auction) return <div className="container mx-auto p-4">Loading...</div>;

  return (
    <div className="bg-green-600/50 rounded-2xl mt-10 m-5 p-4 w-800px">
      <h1 className="text-2xl font-bold text-amber-50">{auction.title}</h1>
      <img src={auction.image} alt={auction.title} className="w-fit h-64 object-cover mt-4 border-2 border-amber-50" />
      <p className="mt-4 text-white">{auction.description}</p>
      <p className="mt-2 text-amber-300">Starting Bid: ${auction.startingBid}</p>
      <p className="mt-2 text-amber-300">Current Bid: ${auction.currentBid}</p>
      
      {lastValidBidderRef.current && <p className="mt-2 text-sm text-amber-300">Last bid by: {lastValidBidderRef.current}</p>}
      
      {lastValidStatusRef.current === "ongoing" && (
        <div className="w-full overflow-hidden bg-gray-800 text-white py-2 mt-4">
          <div key={auction.currentBid} className="flex space-x-8 animate-marquee">
            <span className="mx-4 text-yellow-400 font-bold">Live Auction!</span>
            <span className="mx-4 text-yellow-400 font-bold">Bid Now!</span>
            <span className="mx-4 text-yellow-400 font-bold">Highest Bid: ${auction.currentBid}</span>
          </div>
        </div>
      )}
      
      {lastWinnerRef.current ? (
        <p className="mt-2 text-2xl text-amber-50">Winner: {lastWinnerRef.current}</p>
      ) : (
        <p className="mt-2 text-2xl text-amber-50 invisible">Winner: Placeholder</p>
      )}
      
      <div className="mt-4">
        <input
          type="number"
          placeholder="Your bid"
          value={bidAmount}
          onChange={(e) => setBidAmount(Number(e.target.value))}
          className="border p-2 text-white"
        />
        <button
          onClick={handlePlaceBid}
          className="bg-green-500 text-white p-2 ml-2 rounded-2xl hover:bg-green-700"
        >
          Place Bid
        </button>
      </div>
    </div>
  );
};

export default AuctionDetail;