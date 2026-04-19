import { Room, Player } from "../types";
import { motion } from "motion/react";
import { Eye, EyeOff } from "lucide-react";

interface Props {
  room: Room;
  player: Player;
  key?: string;
}

export default function RolesScreen({ room, player }: Props) {
  const isImposter = player.role === "IMPOSTER";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.2, rotate: 10 }}
      className="w-full text-center space-y-8"
    >
      <div className="bg-black text-white p-12 border-8 border-white shadow-[0_0_40px_rgba(0,0,0,0.3)]">
        <h2 className="text-xl font-bold uppercase tracking-[0.4em] mb-4 opacity-70">Your Role</h2>
        
        {isImposter ? (
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-center">
              <div className="bg-red-600 p-6 rounded-full border-4 border-white shadow-xl animate-pulse">
                <EyeOff size={80} />
              </div>
            </div>
            <h3 className="text-7xl font-black italic uppercase tracking-tighter text-red-600">
              IMPOSTER
            </h3>
            <p className="text-sm font-bold uppercase opacity-80 max-w-xs mx-auto">
              YOU DON'T KNOW THE WORD! BLEND IN BY GIVING A CLUE THAT FEELS RIGHT.
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-center">
              <div className="bg-green-600 p-6 rounded-full border-4 border-white shadow-xl">
                <Eye size={80} />
              </div>
            </div>
            <h3 className="text-7xl font-black italic uppercase tracking-tighter text-green-600">
              SECRET
            </h3>
            <div className="bg-white text-black p-6 inline-block transform rotate-2 shadow-xl">
              <p className="text-xs font-black uppercase tracking-widest mb-1 opacity-50">THE WORD IS</p>
              <h4 className="text-5xl font-black uppercase leading-none">{room.word}</h4>
            </div>
            <p className="text-xs font-black uppercase opacity-60">
              CATEGORY: {room.category}
            </p>
          </motion.div>
        )}
      </div>

      <div className="bg-white p-4 border-4 border-black font-black uppercase italic animate-bounce">
        Game starts in a few seconds...
      </div>
    </motion.div>
  );
}
