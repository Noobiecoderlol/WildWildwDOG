import { GameCanvas } from "@/components/game/GameCanvas";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-game-background p-4">
      <GameCanvas />
    </div>
  );
};

export default Index;