import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { motion, AnimatePresence } from "motion/react";
import { Player, Room } from "./types";
import JoinScreen from "./components/JoinScreen";
import GameView from "./components/GameView";
import { Users, Info } from "lucide-react";

export default function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on("joined_room", ({ room, player }) => {
      setRoom(room);
      setPlayer(player);
    });

    newSocket.on("room_updated", (updatedRoom: Room) => {
      setRoom(updatedRoom);
      // Update local player state from room
      const me = updatedRoom.players.find(p => p.id === newSocket.id);
      if (me) setPlayer(me);
    });

    newSocket.on("error", ({ message }) => {
      setError(message);
      setTimeout(() => setError(null), 3000);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const createRoom = (nickname: string) => {
    socket?.emit("create_room", { nickname });
  };

  const joinRoom = (nickname: string, code: string) => {
    socket?.emit("join_room", { nickname, code });
  };

  if (!socket) return null;

  return (
    <div className="min-h-screen bg-[#FF6321] font-sans selection:bg-black selection:text-[#FF6321] text-black overflow-x-hidden">
      {/* Background patterns */}
      <div className="fixed inset-0 pointer-events-none opacity-10">
        <div className="absolute top-10 left-10 text-9xl font-black">?</div>
        <div className="absolute bottom-10 right-10 text-9xl font-black italic">WHO?</div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-black opacity-20 transform -rotate-12">IMPOSTER</div>
      </div>

      <header className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-black text-[#FF6321] flex items-center justify-center font-black text-xl transform -rotate-12 shadow-bold">
            I
          </div>
          <h1 className="text-xl font-black uppercase tracking-tighter">Imposter</h1>
        </div>
        
        {room && (
          <div className="flex items-center gap-4">
            <div className="bg-black text-white px-4 py-2 font-mono text-sm shadow-bold flex items-center gap-2">
              <Users size={16} />
              {room.players.length}
            </div>
            <div className="bg-black text-white px-4 py-2 font-mono text-sm shadow-bold">
              ROOM: {room.code}
            </div>
          </div>
        )}
      </header>

      <main className="relative z-10 min-h-screen pt-24 px-6 pb-12 flex flex-col items-center justify-center max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 shadow-bold z-[100] font-bold flex items-center gap-2"
            >
              <Info size={18} className="text-[#FF6321]" />
              {error}
            </motion.div>
          )}

          {!room ? (
            <JoinScreen key="join" onCreate={createRoom} onJoin={joinRoom} />
          ) : (
            <GameView 
              key="game" 
              room={room} 
              player={player!} 
              socket={socket!} 
            />
          )}
        </AnimatePresence>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-6 text-[10px] uppercase font-bold tracking-widest opacity-50 flex justify-between">
        
        <span>STAY ALERT. FIND THEM.</span>
      </footer>
    </div>
  );
}

const shadowStyles = `
  .shadow-bold {
    box-shadow: 6px 6px 0px 0px rgba(0,0,0,1);
  }
  .shadow-bold-hover:hover {
    box-shadow: 2px 2px 0px 0px rgba(0,0,0,1);
    transform: translate(4px, 4px);
  }
  .shadow-bold-active:active {
    box-shadow: 0px 0px 0px 0px rgba(0,0,0,1);
    transform: translate(6px, 6px);
  }
`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = shadowStyles;
  document.head.append(style);
}
