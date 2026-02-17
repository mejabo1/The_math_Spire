
import React from 'react';
import { MapNode } from '../types';
import { Skull, HelpCircle, MapPin, Tent, Crown, Star } from 'lucide-react';

interface MapProps {
  mapNodes: MapNode[];
  currentNodeId: string | null;
  onNodeSelect: (node: MapNode) => void;
  godMode?: boolean;
}

export const GameMap: React.FC<MapProps> = ({ mapNodes, currentNodeId, onNodeSelect, godMode = false }) => {
  
  const getIcon = (type: string) => {
    switch (type) {
        case 'combat': return <Skull size={18} className="md:w-6 md:h-6" />;
        case 'elite': return <Star size={20} className="text-purple-400 md:w-7 md:h-7 fill-purple-400/20" />; 
        case 'event': return <HelpCircle size={18} className="md:w-6 md:h-6" />;
        case 'rest': return <Tent size={18} className="md:w-6 md:h-6" />;
        case 'boss': return <Crown size={24} className="text-yellow-400 md:w-8 md:h-8" />;
        default: return <MapPin size={18} className="md:w-6 md:h-6" />;
    }
  };

  const isNodeSelectable = (node: MapNode) => {
    if (godMode) return true;

    if (!currentNodeId) {
        // Only allow selecting starting nodes (Tier 1)
        return node.id.startsWith('1-');
    }
    // Find current node
    const currentNode = mapNodes.find(n => n.id === currentNodeId);
    if (!currentNode) return false;
    // Check if node is in the current node's 'next' list
    return currentNode.next.includes(node.id);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 relative p-4 md:p-8 overflow-hidden">
        <h2 className="text-xl md:text-4xl font-serif text-amber-100 mb-2 md:mb-8 tracking-widest uppercase border-b border-amber-500/30 pb-2 md:pb-4">The Spire Map</h2>
        
        {godMode && (
            <div className="absolute top-4 right-4 bg-red-900/50 border border-red-500 text-red-200 px-4 py-2 rounded animate-pulse font-bold text-xs md:text-base">
                GOD MODE ACTIVE
            </div>
        )}
        
        {/* Responsive Map Container: Reduced from 85vmin to 75vmin to fit better vertically on wide/short screens */}
        <div 
            className="relative w-[75vmin] h-[75vmin] max-w-[600px] max-h-[600px] bg-slate-800 rounded-full shadow-2xl border-4 border-slate-700 overflow-hidden shrink-0"
            style={{ 
                position: 'relative', 
                borderRadius: '9999px', 
                margin: 'auto',
                width: '75vmin', /* Inline fallback */
                height: '75vmin' /* Inline fallback */
            }}
        >
             {/* Simple Background Pattern */}
             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]"></div>

            {/* Render Connections first */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                {mapNodes.map(node => {
                    return node.next.map(nextId => {
                        const nextNode = mapNodes.find(n => n.id === nextId);
                        if (!nextNode) return null;
                        return (
                            <line 
                                key={`${node.id}-${nextId}`}
                                x1={`${node.x}%`} 
                                y1={`${node.y}%`} 
                                x2={`${nextNode.x}%`} 
                                y2={`${nextNode.y}%`} 
                                stroke={node.completed ? "#10b981" : "#475569"} 
                                strokeWidth="2"
                                strokeDasharray="4,4"
                                className="md:stroke-[3]"
                            />
                        );
                    });
                })}
            </svg>

            {/* Render Nodes */}
            {mapNodes.map(node => {
                const selectable = isNodeSelectable(node);
                const isCurrent = node.id === currentNodeId;
                const isCompleted = node.completed;

                // Responsive node size: Reduced slightly
                let nodeClass = "absolute transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 md:w-16 md:h-16 rounded-full flex items-center justify-center border-2 md:border-4 transition-all duration-300 z-10 ";
                
                if (isCurrent) {
                    nodeClass += "bg-amber-500 border-white shadow-[0_0_20px_rgba(245,158,11,0.6)] scale-125 text-white";
                } else if (isCompleted && !godMode) {
                    nodeClass += "bg-emerald-700 border-emerald-500 opacity-60 grayscale";
                } else if (selectable) {
                    nodeClass += "bg-slate-600 border-white hover:bg-slate-500 hover:scale-110 cursor-pointer animate-pulse-slow shadow-lg text-white";
                } else {
                    nodeClass += "bg-slate-800 border-slate-600 opacity-40 cursor-not-allowed text-slate-500";
                }

                return (
                    <div 
                        key={node.id}
                        className={nodeClass}
                        style={{ 
                            left: `${node.x}%`, 
                            top: `${node.y}%`, 
                            position: 'absolute',
                            transform: 'translate(-50%, -50%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%'
                        }}
                        onClick={() => selectable && onNodeSelect(node)}
                    >
                        {getIcon(node.type)}
                    </div>
                );
            })}
        </div>

        <div className="mt-4 md:mt-8 text-center text-gray-400 text-xs md:text-sm">
            {godMode ? "GOD MODE: Select any node to teleport." : "Select a highlighted node to proceed."}
        </div>
    </div>
  );
};
