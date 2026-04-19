import { Socket } from "socket.io-client";
import { Room, Player } from "../types";
import { motion } from "motion/react";
import { User, PlayCircle, Crown } from "lucide-react";

interface Props {
  room: Room;
  player: Player;
  socket: Socket;
  key?: string;
}

export default function Lobby({ room, player, socket }: Props) {
  const startGame = () => {
    socket.emit("start_game", { code: room.code });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full space-y-8"
    >
      <div className="bg-white p-8 border-4 border-black shadow-bold">
        <h3 className="text-3xl font-black italic uppercase mb-6 flex items-center gap-3">
          <Crown className="text-[#FF6321]" fill="black" />
          The Lobby
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {room.players.map((p) => (
            <motion.div
              layout
              key={p.id}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className={`p-4 border-4 border-black flex flex-col items-center gap-2 relative transition-colors ${
                p.id === player.id ? "bg-black text-white" : "bg-white"
              }`}
            >
              {p.isHost && (
                <div className="absolute -top-3 -right-3 bg-yellow-400 border-2 border-black p-1">
                  <Crown size={12} fill="black" />
                </div>
              )}
              <div className={`w-12 h-12 rounded-full border-2 border-black flex items-center justify-center ${p.id === player.id ? "bg-white text-black" : "bg-black text-white"}`}>
                <User size={24} />
              </div>
              <span className="font-black uppercase text-xs truncate w-full text-center">
                {p.nickname}
                {p.id === player.id && " (YOU)"}
              </span>
              <div className="text-[10px] font-bold opacity-50">SCORE: {p.score}</div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        {player.isHost ? (
          <button
            onClick={startGame}
            disabled={room.players.length < 3}
            className={`w-full max-w-sm p-6 text-xl font-black uppercase shadow-bold transition-all ${
              room.players.length >= 3 
                ? "bg-black text-white shadow-bold-hover shadow-bold-active" 
                : "bg-gray-400 text-gray-800 cursor-not-allowed"
            }`}
          >
            {room.players.length < 3 
              ? `Waiting for players (${room.players.length}/3)` 
              : "Let's Play!"}
          </button>
        ) : (
          <div className="text-center bg-black text-white p-6 w-full max-w-sm shadow-bold font-black uppercase text-xl animate-pulse">
            Waiting for Host...
          </div>
        )}
      </div>

      <div className="bg-white/20 p-6 border-4 border-black border-dashed">
        <h4 className="font-black text-center uppercase mb-4">HOW TO PLAY</h4>
        <ul className="text-xs font-bold space-y-4">
          <li className="flex gap-3">
            <span className="bg-black text-white w-5 h-5 flex items-center justify-center rounded-full shrink-0">1</span>
            EVERYONE GETS A SECRET WORD, EXCEPT THE IMPOSTER.
          </li>
          <li className="flex gap-3">
            <span className="bg-black text-white w-5 h-5 flex items-center justify-center rounded-full shrink-0">2</span>
            TAKE TURNS GIVING A ONE-WORD CLUE ABOUT THE WORD.
          </li>
          <li className="flex gap-3">
            <span className="bg-black text-white w-5 h-5 flex items-center justify-center rounded-full shrink-0">3</span>
            VOTE FOR THE IMPOSTER. IF CAUGHT, THEY GET ONE GUESS TO SURVIVE!
          </li>
        </ul>
      </div>
    </motion.div>
  );
}
