
import React, { useEffect, useState, useRef } from 'react';
import PetAvatar, { PetAction } from './PetAvatar';
import { Task, ThemeMode } from '../types';

interface RoamingPetProps {
  tasks: Task[];
  completedCount: number;
  theme: ThemeMode;
  isRoaming: boolean;
  onStartRoaming: () => void;
}

const RoamingPet: React.FC<RoamingPetProps> = ({ 
  tasks, completedCount, theme, isRoaming, onStartRoaming 
}) => {
  const [pos, setPos] = useState({ x: 50, y: 180 }); 
  const [targetPos, setTargetPos] = useState({ x: 50, y: 180 });
  const [action, setAction] = useState<PetAction>('sitting');
  const [flipped, setFlipped] = useState(false);
  
  const behaviorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moveInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const startTimer = setTimeout(() => {
      onStartRoaming();
      setAction('walking');
      setTargetPos({ x: window.innerWidth / 2, y: window.innerHeight - 100 });
    }, 5000);

    return () => clearTimeout(startTimer);
  }, []);

  // AI Brain
  useEffect(() => {
    if (!isRoaming) return;

    const decideNextMove = () => {
      const rand = Math.random();
      
      if (rand < 0.5) {
        // Move
        const padding = 80;
        const newX = padding + Math.random() * (window.innerWidth - padding * 2);
        const newY = padding + Math.random() * (window.innerHeight - padding * 2);

        setTargetPos({ x: newX, y: newY });
        setAction(Math.random() > 0.7 ? 'running' : 'walking');
        
      } else if (rand < 0.8) {
        // Rest (Sit/Hover)
        setAction('sitting');
        behaviorTimer.current = setTimeout(decideNextMove, 4000 + Math.random() * 4000);

      } else {
        // Sleep / Deactivate / Melt
        setAction('sleeping');
        behaviorTimer.current = setTimeout(decideNextMove, 8000 + Math.random() * 5000);
      }
    };

    // If currently idle, start thinking
    if (['sitting', 'sleeping', 'idle'].includes(action)) {
       // Logic handled in movement finish
    }

    return () => {
      if (behaviorTimer.current) clearTimeout(behaviorTimer.current);
    };
  }, [isRoaming]); 

  // Physics
  useEffect(() => {
    if (!isRoaming) return;

    if (action === 'walking' || action === 'running') {
      const baseSpeed = action === 'running' ? 3 : 1.5;
      
      // Slimes move in bursts (simulated by average speed here, animation handles visual bounce)
      // Drones fly smoother
      
      moveInterval.current = setInterval(() => {
        setPos(current => {
          const dx = targetPos.x - current.x;
          const dy = targetPos.y - current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 10) {
            if (moveInterval.current) clearInterval(moveInterval.current);
            
            // Arrived
            setAction('sitting');
            
            // Wait then move again
            behaviorTimer.current = setTimeout(() => {
               const padding = 80;
               const newX = padding + Math.random() * (window.innerWidth - padding * 2);
               const newY = padding + Math.random() * (window.innerHeight - padding * 2);
               setTargetPos({x: newX, y: newY});
               setAction('walking');
            }, 3000);

            return targetPos;
          }

          const dirX = dx / dist;
          const dirY = dy / dist;
          
          setFlipped(dirX < 0);

          return {
            x: current.x + dirX * baseSpeed,
            y: current.y + dirY * baseSpeed
          };
        });
      }, 16);
    }

    return () => {
      if (moveInterval.current) clearInterval(moveInterval.current);
    };
  }, [targetPos, action, isRoaming]);

  const handleInteraction = () => {
    if (action === 'sleeping') {
      setAction('sitting'); 
    } else {
      setAction('pounce'); 
      setTimeout(() => setAction('sitting'), 1000);
    }
  };

  if (!isRoaming) return null;

  return (
    <div 
      className="fixed z-50 transition-none pointer-events-none"
      style={{ 
        left: pos.x, 
        top: pos.y, 
        transform: 'translate(-50%, -50%)' 
      }}
    >
      <div className="relative pointer-events-auto cursor-pointer" onClick={handleInteraction}>
        {/* Shadow moved to inside PetAvatar for customization */}
        <PetAvatar 
          action={action} 
          theme={theme} 
          flipped={flipped}
          className="w-32 h-32" 
        />
      </div>
    </div>
  );
};

export default RoamingPet;
