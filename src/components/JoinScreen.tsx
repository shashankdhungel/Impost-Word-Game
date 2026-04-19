import { useState } from "react";
import { motion } from "motion/react";
import { Play, Plus } from "lucide-react";

interface Props {
  onCreate: (nickname: string) => void;
  onJoin: (nickname: string, code: string) => void;
  key?: string;
}

export default function JoinScreen({ onCreate, onJoin }: Props) {
  const [nickname, setNickname] = useState("");
  const [code, setCode] = useState("");

  const handleCreate = () => {
    if (nickname.trim()) onCreate(nickname.trim());
  };

  const handleJoin = () => {
    if (nickname.trim() && code.trim()) {
      onJoin(nickname.trim(), code.trim().toUpperCase());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="w-full space-y-8"
    >
      <div className="text-center space-y-4">
        <h2 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">
          WHO IS THE <br/>
          <span className="text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">IMPOSTER?</span>
        </h2>
        <p className="text-base font-bold uppercase max-w-sm mx-auto opacity-80">
          The ultimate social deduction word game for parties.
        </p>
      </div>

      <div className="bg-white p-8 shadow-bold border-4 border-black space-y-6">
        <div className="space-y-2">
          <label className="block text-xs font-black uppercase tracking-widest">Your Nickname</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value.slice(0, 15))}
            placeholder="NICKNAME"
            className="w-full bg-[#f0f0f0] border-4 border-black p-4 font-black text-xl uppercase placeholder:opacity-30 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <button
              onClick={handleCreate}
              disabled={!nickname.trim()}
              className="w-full bg-black text-white p-5 font-black uppercase text-lg shadow-bold shadow-bold-hover shadow-bold-active flex items-center justify-center gap-2 group transition-all"
            >
              <Plus className="group-hover:rotate-90 transition-transform" />
              Create Room
            </button>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.slice(0, 4).toUpperCase())}
              placeholder="ROOM CODE"
              className="w-full bg-[#f0f0f0] border-4 border-black p-4 font-black text-xl uppercase placeholder:opacity-30 focus:outline-none text-center"
            />
            <button
              onClick={handleJoin}
              disabled={!nickname.trim() || !code.trim()}
              className="w-full bg-white border-4 border-black p-4 font-black uppercase text-lg shadow-bold shadow-bold-hover shadow-bold-active flex items-center justify-center gap-2 transition-all"
            >
              <Play fill="black" />
              Join Room
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="p-4 border-2 border-black border-dashed rounded-xl">
          <h4 className="font-black text-sm uppercase">Quick Rounds</h4>
          <p className="text-[10px] font-bold opacity-60">5-10 MINS</p>
        </div>
        <div className="p-4 border-2 border-black border-dashed rounded-xl">
          <h4 className="font-black text-sm uppercase">Multiplayer</h4>
          <p className="text-[10px] font-bold opacity-60">3-12 PLAYERS</p>
        </div>
      </div>
    </motion.div>
  );
}
