import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, Lock, Star, Heart, Clock, Zap } from "lucide-react";

interface HintBubbleProps {
  isVisible: boolean;
  type: "locked" | "progress" | "tip" | "unlock" | "warning";
  title: string;
  description: string;
  requirement?: string;
  progress?: number;
  maxProgress?: number;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
  onClose?: () => void;
  autoHide?: boolean;
  delay?: number;
}

export default function HintBubble({
  isVisible,
  type,
  title,
  description,
  requirement,
  progress,
  maxProgress,
  position = "top",
  className = "",
  onClose,
  autoHide = false,
  delay = 0
}: HintBubbleProps) {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setShow(true), delay);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [isVisible, delay]);

  React.useEffect(() => {
    if (autoHide && show) {
      const timer = setTimeout(() => {
        setShow(false);
        onClose?.();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, autoHide, onClose]);

  const getIcon = () => {
    switch (type) {
      case "locked":
        return <Lock className="w-4 h-4 text-yellow-400" />;
      case "progress":
        return <Star className="w-4 h-4 text-blue-400" />;
      case "tip":
        return <Info className="w-4 h-4 text-cyan-400" />;
      case "unlock":
        return <Zap className="w-4 h-4 text-green-400" />;
      case "warning":
        return <Clock className="w-4 h-4 text-orange-400" />;
      default:
        return <Info className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case "locked":
        return "border-yellow-400/30 bg-yellow-900/20 text-yellow-100";
      case "progress":
        return "border-blue-400/30 bg-blue-900/20 text-blue-100";
      case "tip":
        return "border-cyan-400/30 bg-cyan-900/20 text-cyan-100";
      case "unlock":
        return "border-green-400/30 bg-green-900/20 text-green-100";
      case "warning":
        return "border-orange-400/30 bg-orange-900/20 text-orange-100";
      default:
        return "border-cyan-400/30 bg-cyan-900/20 text-cyan-100";
    }
  };

  const positionClasses = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2"
  };

  const arrowClasses = {
    top: "absolute top-full left-1/2 transform -translate-x-1/2 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-slate-700",
    bottom: "absolute bottom-full left-1/2 transform -translate-x-1/2 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-slate-700",
    left: "absolute left-full top-1/2 transform -translate-y-1/2 border-t-8 border-b-8 border-l-8 border-t-transparent border-b-transparent border-l-slate-700",
    right: "absolute right-full top-1/2 transform -translate-y-1/2 border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-slate-700"
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: position === "top" ? 10 : -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: position === "top" ? 10 : -10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={`absolute z-50 ${positionClasses[position]} ${className}`}
        >
          <div className={`relative px-4 py-3 rounded-lg border backdrop-blur-sm shadow-lg max-w-xs ${getColors()}`}>
            {/* Arrow */}
            <div className={arrowClasses[position]} />
            
            {/* Content */}
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0 mt-0.5">
                {getIcon()}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm mb-1">{title}</h4>
                <p className="text-xs opacity-90 leading-relaxed">{description}</p>
                
                {requirement && (
                  <div className="mt-2 text-xs opacity-75 font-medium">
                    {requirement}
                  </div>
                )}
                
                {progress !== undefined && maxProgress !== undefined && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs opacity-75 mb-1">
                      <span>Progress</span>
                      <span>{progress}/{maxProgress}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                      <div 
                        className="bg-gradient-to-r from-cyan-400 to-teal-400 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (progress / maxProgress) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {onClose && (
                <button
                  onClick={() => {
                    setShow(false);
                    onClose();
                  }}
                  className="flex-shrink-0 text-current opacity-50 hover:opacity-100 transition-opacity"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}