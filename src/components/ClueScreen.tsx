import { useState } from "react";
import { Socket } from "socket.io-client";
import { Room, Player } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Send, Clock } from "lucide-react";

interface Props {
  room: Room;
  player: Player;
  socket: Socket;
  key?: string;
}

export default function ClueScreen({ room, player, socket }: Props) {
  const [clue, setClue] = useState("");
  const currentPlayer = room.players[room.currentTurnIndex];
  const isMyTurn = currentPlayer.id === player.id;

  const submitClue = () => {
    if (clue.trim()) {
      socket.emit("submit_clue", { code: room.code, clue: clue.trim() });
      setClue("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full space-y-6"
    >
      <div className="bg-black text-white p-6 shadow-bold relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <Clock size={120} />
        </div>
        <h3 className="text-4xl font-black italic uppercase relative z-10">Clue Time</h3>
        <p className="font-bold uppercase text-xs opacity-70 relative z-10">
          {player.role === "PLAYER" ? `WORD: ${room.word}` : "YOU ARE THE IMPOSTER"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence>
          {room.players.map((p, idx) => (
            <motion.div
              layout
              key={p.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-4 border-4 border-black flex justify-between items-center transition-all ${
                idx === room.currentTurnIndex 
                  ? "bg-white scale-105 shadow-bold z-20" 
                  : idx < room.currentTurnIndex 
                  ? "bg-gray-100 opacity-60" 
                  : "bg-[#eee] opacity-40"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full border-2 border-black flex items-center justify-center font-black text-xs ${idx === room.currentTurnIndex ? "bg-black text-white" : "bg-white"}`}>
                  {idx + 1}
                </div>
                <span className="font-black uppercase text-sm">{p.nickname}</span>
              </div>
              
              <div className="font-bold italic uppercase">
                {p.clue ? (
                  <motion.span initial={{ scale: 1.5 }} animate={{ scale: 1 }}>
                    {p.clue}
                  </motion.span>
                ) : idx === room.currentTurnIndex ? (
                  <span className="animate-pulse">Thinking...</span>
                ) : (
                  <span>...</span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isMyTurn && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-12 left-6 right-6 max-w-2xl mx-auto z-50"
          >
            <div className="bg-white p-6 shadow-bold border-4 border-black space-y-4">
              <label className="block text-xs font-black uppercase tracking-widest">Your One-Word Clue</label>
              <div className="flex gap-4">
                <input
                  autoFocus
                  type="text"
                  value={clue}
                  onChange={(e) => setClue(e.target.value.slice(0, 20))}
                  onKeyDown={(e) => e.key === "Enter" && submitClue()}
                  placeholder="TYPE CLUE..."
                  className="flex-1 bg-[#f0f0f0] border-4 border-black p-4 font-black text-xl uppercase placeholder:opacity-30 focus:outline-none"
                />
                <button
                  onClick={submitClue}
                  disabled={!clue.trim()}
                  className="bg-black text-white px-8 font-black uppercase shadow-bold shadow-bold-hover shadow-bold-active flex items-center gap-2 transform active:scale-95 transition-all"
                >
                  <Send fill="white" size={20} />
                </button>
              </div>
              <p className="text-[10px] font-bold opacity-50 uppercase">KEEP IT BRIEF. DON'T GIVE IT AWAY!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
