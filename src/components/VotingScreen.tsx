import { useState } from "react";
import { Socket } from "socket.io-client";
import { Room, Player } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Target, AlertTriangle, Send } from "lucide-react";

interface Props {
  room: Room;
  player: Player;
  socket: Socket;
  key?: string;
}

export default function VotingScreen({ room, player, socket }: Props) {
  const [targetId, setTargetId] = useState<string | null>(null);
  const [guess, setGuess] = useState("");
  const hasVoted = player.votedFor !== undefined;
  const isImposter = player.role === "IMPOSTER";

  const submitVote = () => {
    if (targetId) {
      socket.emit("submit_vote", { code: room.code, targetId });
    }
  };

  const submitGuess = () => {
    if (guess.trim()) {
      socket.emit("imposter_guess", { code: room.code, guess: guess.trim() });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full space-y-8"
    >
      <div className="text-center space-y-2">
        <h3 className="text-6xl font-black italic uppercase tracking-tighter">
          VOTE NOW
        </h3>
        <p className="font-bold uppercase text-sm opacity-70">
          WHO IS ACTING SUSPICIOUS?
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {room.players.map((p) => {
          const votesForP = room.players.filter((v) => v.votedFor === p.id).length;
          const isMe = p.id === player.id;

          return (
            <motion.button
              disabled={hasVoted || isMe || room.caught}
              key={p.id}
              onClick={() => setTargetId(p.id)}
              className={`p-6 border-4 border-black relative transition-all flex flex-col items-center gap-3 ${
                targetId === p.id 
                  ? "bg-black text-white scale-105 shadow-bold z-10" 
                  : isMe
                  ? "bg-gray-200 opacity-60 cursor-not-allowed"
                  : "bg-white hover:bg-gray-100"
              } ${hasVoted && player.votedFor === p.id ? "bg-black text-white" : ""}`}
            >
              <div className="flex justify-between w-full items-start">
                <span className="font-black uppercase text-lg">{p.nickname}</span>
                <div className="flex -space-x-2">
                  {room.players.filter(v => v.votedFor === p.id).map((_, i) => (
                    <div key={i} className="w-6 h-6 bg-red-600 rounded-full border-2 border-black flex items-center justify-center">
                      <Target size={12} color="white" />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="w-full text-left bg-black/10 p-2 border-2 border-black border-dashed">
                <span className="text-[10px] font-black uppercase block opacity-50">Clue given:</span>
                <span className="font-black italic uppercase text-sm overflow-hidden text-ellipsis block font-mono">
                  "{p.clue || "???"}"
                </span>
              </div>

              {!hasVoted && !isMe && !room.caught && (
                <div className={`mt-2 font-black text-xs uppercase ${targetId === p.id ? "text-[#FF6321]" : "text-black opacity-30"}`}>
                  {targetId === p.id ? "SELECTED" : "CLICK TO VOTE"}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {!hasVoted && !room.caught && (
        <div className="flex flex-col items-center">
          <button
            onClick={submitVote}
            disabled={!targetId}
            className={`w-full max-w-sm p-6 text-xl font-black uppercase shadow-bold transition-all ${
              targetId 
                ? "bg-black text-white shadow-bold-hover shadow-bold-active" 
                : "bg-gray-400 text-gray-800 cursor-not-allowed"
            }`}
          >
            CONFIRM VOTE
          </button>
        </div>
      )}

      {hasVoted && !room.caught && (
        <div className="text-center font-black uppercase italic animate-pulse py-8 text-2xl">
          Waiting for others to vote...
        </div>
      )}

      <AnimatePresence>
        {room.caught && isImposter && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <div className="bg-white p-8 border-4 border-black shadow-bold w-full max-w-md space-y-6">
              <div className="flex items-center gap-3 text-red-600 uppercase font-black">
                <AlertTriangle />
                YOU'VE BEEN CAUGHT!
              </div>
              <h4 className="text-4xl font-black italic uppercase">ONE LAST CHANCE</h4>
              <p className="font-bold text-sm uppercase opacity-70">
                GUESS THE WORD TO WIN THE ROUND ANYWAY!
              </p>
              
              <div className="space-y-4">
                <input
                  autoFocus
                  type="text"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value.slice(0, 20))}
                  placeholder="GUESS THE WORD..."
                  className="w-full bg-[#f0f0f0] border-4 border-black p-4 font-black text-2xl uppercase placeholder:opacity-30 focus:outline-none"
                />
                <button
                  onClick={submitGuess}
                  disabled={!guess.trim()}
                  className="w-full bg-black text-white p-6 font-black uppercase text-xl shadow-bold shadow-bold-hover shadow-bold-active flex items-center justify-center gap-2"
                >
                  <Send fill="white" />
                  SUBMIT GUESS
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {room.caught && !isImposter && (
        <div className="text-center space-y-4 py-8">
           <div className="inline-block bg-green-600 text-white px-8 py-4 font-black text-2xl uppercase shadow-bold transform -rotate-2">
             THE IMPOSTER WAS CAUGHT!
           </div>
           <p className="font-black uppercase animate-pulse">Waiting for their guess...</p>
        </div>
      )}
    </motion.div>
  );
}
