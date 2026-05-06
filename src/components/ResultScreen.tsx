import { Socket } from "socket.io-client";
import { Room, Player } from "../types";
import { motion } from "motion/react";
import { Trophy, Frown, RefreshCw } from "lucide-react";

interface Props {
  room: Room;
  player: Player;
  socket: Socket;
  key?: string;
}

export default function ResultScreen({ room, player, socket }: Props) {
  const isWinner = (player.role === "IMPOSTER" && room.winner === "IMPOSTER") || 
                   (player.role === "PLAYER" && room.winner === "PLAYERS");
                   
  const nextRound = () => {
    socket.emit("next_round", { code: room.code });
  };

  const imposter = room.players.find(p => p.id === room.imposterId);

  const losers = room.players.filter(p => 
    !(p.role === "IMPOSTER" && room.winner === "IMPOSTER") && 
    !(p.role === "PLAYER" && room.winner === "PLAYERS")
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full space-y-8"
    >
      <div className={`p-6 sm:p-12 border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-center relative overflow-hidden ${isWinner ? "bg-yellow-400" : "bg-red-500"}`}>
        <div className="absolute top-0 left-0 p-4 opacity-10">
          <Trophy size={80} className="sm:hidden" />
          <Trophy size={150} className="hidden sm:block" />
        </div>
        
        <h2 className="text-5xl sm:text-8xl font-black italic uppercase tracking-tighter mb-4 translate-y-2">
          {room.winner === "IMPOSTER" ? "IMPOSTER" : "PLAYERS"}<br/>
          WINS!
        </h2>
        
        <div className="bg-black text-white p-3 sm:p-6 inline-block transform -rotate-2 mb-8 mt-4">
          {isWinner ? (
            <div className="flex items-center gap-3 text-xl sm:text-3xl font-black">
              <Trophy className="text-yellow-400" fill="currentColor" />
              VICTORY!
            </div>
          ) : (
            <div className="flex items-center gap-3 text-xl sm:text-3xl font-black">
              <Frown className="text-red-400" fill="currentColor" />
              DEFEAT
            </div>
          )}
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 border-4 border-black space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="text-left sm:text-left">
              <span className="text-[10px] font-black uppercase opacity-50 block">THE WORD WAS:</span>
              <span className="text-lg sm:text-2xl font-black uppercase">{room.word}</span>
            </div>
            <div className="text-right sm:text-right">
              <span className="text-[10px] font-black uppercase opacity-50 block">THE IMPOSTER WAS:</span>
              <span className="text-lg sm:text-2xl font-black uppercase">{imposter?.nickname}</span>
            </div>
          </div>
          
          {room.imposterGuess && (
            <div className="border-t-2 border-black/10 pt-4">
              <span className="text-[10px] font-black uppercase opacity-50 block mb-1">IMPOSTER'S FINAL GUESS:</span>
              <span className="text-base sm:text-xl font-bold italic uppercase">"{room.imposterGuess}"</span>
            </div>
          )}
        </div>
      </div>

      {losers.length > 0 && room.punishment && (
        <div className="bg-black border-8 border-[#FF6321] p-6 sm:p-8 text-center space-y-4">
          <h3 className="text-3xl font-black italic uppercase text-red-500">PUNISHMENT FOR LOSERS! 😈</h3>
          <p className="text-white font-black uppercase text-lg">
            {losers.map(l => l.nickname).join(", ")}
          </p>
          <motion.p
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-white font-black italic uppercase text-2xl sm:text-4xl"
          >
            {room.punishment}
          </motion.p>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-center font-black uppercase text-xl">Current Leaderboard</h3>
        <div className="space-y-2">
          {room.players.sort((a,b) => b.score - a.score).map((p, idx) => (
             <div key={p.id} className="bg-white border-4 border-black p-3 sm:p-4 flex justify-between items-center shadow-bold">
               <div className="flex items-center gap-3">
                 <span className="text-xs font-black w-6 text-center">{idx + 1}.</span>
                 <span className="font-black uppercase">{p.nickname}</span>
               </div>
               <span className="font-black text-xl">{p.score}</span>
             </div>
          ))}
        </div>
      </div>

      {player.isHost ? (
        <button
          onClick={nextRound}
          className="w-full p-4 sm:p-6 bg-black text-white font-black uppercase text-base sm:text-xl shadow-bold shadow-bold-hover shadow-bold-active flex items-center justify-center gap-3"
        >
          <RefreshCw />
          Next Round
        </button>
      ) : (
        <div className="text-center bg-black text-white p-6 font-black uppercase italic animate-pulse shadow-bold">
          Waiting for host to start next round...
        </div>
      )}
    </motion.div>
  );
}
