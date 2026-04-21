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
        return (
          <div key="vote-decision" className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full text-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-8">All clues have been given!</h1>
              
              {player.isHost ? (
                <div className="space-y-4">
                  <button
                    onClick={() => socket.emit("vote_decision", { code: room.code, decision: "VOTE" })}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
                  >
                    Proceed to Vote
                  </button>
                  <button
                    onClick={() => socket.emit("vote_decision", { code: room.code, decision: "SKIP" })}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
                  >
                    Skip & Give Clues Again
                  </button>
                </div>
              ) : (
                <p className="text-lg text-gray-600">Waiting for host to decide...</p>
              )}
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
