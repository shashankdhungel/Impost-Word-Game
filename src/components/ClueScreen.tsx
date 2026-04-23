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
      className="w-full space-y-6 pb-64"
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

      {/* SECTION 1 - CLUES SO FAR */}
      <div className="space-y-4 max-h-48 overflow-y-auto">
        <h2 className="text-2xl font-black uppercase text-white px-4">Clues So Far</h2>
        {room.currentTurnIndex === 0 ? (
          <div className="px-4 py-3 text-white opacity-60 font-bold italic uppercase">
            No clues yet...
          </div>
        ) : (
          <div className="space-y-3 px-4">
            {room.players.slice(0, room.currentTurnIndex).map((p, idx) => (
              <motion.div
                layout
                key={p.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 border-4 border-black bg-white flex justify-between items-center gap-4"
              >
                <span className="font-black uppercase text-sm flex-shrink-0">{p.nickname}:</span>
                <span className="font-bold italic uppercase text-right flex-1">{p.clue}</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2 - UP NEXT */}
      <div className="space-y-4 px-4">
        <h2 className="text-2xl font-black uppercase text-white">Up Next</h2>
        
        {/* Current player thinking */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-4 border-4 border-black bg-[#f97316] flex justify-between items-center gap-4 scale-105"
        >
          <span className="font-black uppercase text-sm">⏳</span>
          <span className="font-black uppercase flex-1">{currentPlayer.nickname} is thinking...</span>
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="text-lg"
          >
            ⏱️
          </motion.span>
        </motion.div>

        {/* Remaining players */}
        {room.currentTurnIndex < room.players.length - 1 && (
          <div className="space-y-2">
            {room.players.slice(room.currentTurnIndex + 1).map((p) => (
              <div
                key={p.id}
                className="p-3 border-2 border-gray-400 bg-gray-200 opacity-60 flex items-center gap-3"
              >
                <span className="font-black uppercase text-sm">{p.nickname}</span>
                <span className="font-bold">...</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* INPUT BOX - KEEP EXACTLY AS IS */}
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
