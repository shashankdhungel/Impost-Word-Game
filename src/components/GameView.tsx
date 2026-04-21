import { Socket } from "socket.io-client";
import { Room, Player } from "../types";
import Lobby from "./Lobby";
import RolesScreen from "./RolesScreen";
import ClueScreen from "./ClueScreen";
import VotingScreen from "./VotingScreen";
import ResultScreen from "./ResultScreen";
import { AnimatePresence } from "motion/react";

interface Props {
  room: Room;
  player: Player;
  socket: Socket;
  key?: string;
}

export default function GameView({ room, player, socket }: Props) {
  const renderScreen = () => {
    switch (room.state) {
      case "LOBBY":
        return <Lobby key="lobby" room={room} player={player} socket={socket} />;
      case "ROLES":
        return <RolesScreen key="roles" room={room} player={player} />;
      case "CLUES":
        return <ClueScreen key="clues" room={room} player={player} socket={socket} />;
      case "VOTE_DECISION":
        const hasDecided = room.voteDecisions && room.voteDecisions[player.id];
        const decidedCount = room.voteDecisions ? Object.keys(room.voteDecisions).length : 0;
        const totalPlayers = room.players.length;
        
        let voteCount = 0;
        let skipCount = 0;
        if (room.voteDecisions) {
          Object.values(room.voteDecisions).forEach(d => {
            if (d === "VOTE") voteCount++;
            else if (d === "SKIP") skipCount++;
          });
        }
        
        return (
          <div key="vote-decision" className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
            <h1 className="text-6xl font-black text-white uppercase italic mb-16 text-center tracking-tighter">All clues have been given!</h1>
            
            {!hasDecided ? (
              <div className="space-y-6 w-full max-w-md">
                <button
                  onClick={() => socket.emit("vote_decision", { code: room.code, decision: "VOTE" })}
                  className="w-full bg-[#f97316] hover:bg-orange-600 text-black font-black uppercase py-4 px-6 border-4 border-black transition duration-200"
                >
                  Vote This Round
                </button>
                <button
                  onClick={() => socket.emit("vote_decision", { code: room.code, decision: "SKIP" })}
                  className="w-full bg-black text-white font-black uppercase py-4 px-6 border-4 border-white transition duration-200"
                >
                  Skip & Give Clues Again
                </button>
              </div>
            ) : (
              <p className="text-white font-black uppercase text-2xl mb-12">Waiting for others to decide... ({decidedCount}/{totalPlayers} voted)</p>
            )}
            
            <div className="mt-16 text-center text-white font-black uppercase text-2xl tracking-wide">
              Vote: {voteCount} | Skip: {skipCount}
            </div>
          </div>
        );
      case "VOTING":
        return <VotingScreen key="voting" room={room} player={player} socket={socket} />;
      case "RESULT":
        return <ResultScreen key="result" room={room} player={player} socket={socket} />;
      default:
        return <div>Unknown State</div>;
    }
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {renderScreen()}
      </AnimatePresence>
    </div>
  );
}
