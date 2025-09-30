import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Grip, Pin, PinOff } from 'lucide-react';
import { ClockWidget } from './ClockWidget';
import { CalendarWidget } from './CalendarWidget';
import { WeatherWidget } from './WeatherWidget';

type WidgetType = 'clock' | 'calendar' | 'weather';

interface Widget {
  id: string;
  type: WidgetType;
  position: { x: number; y: number };
  pinned: boolean;
}

interface WidgetsPanelProps {
  // Future: Add onClose handler for closing widgets panel
}

export const WidgetsPanel: React.FC<WidgetsPanelProps> = () => {
  const [widgets, setWidgets] = useState<Widget[]>([
    { id: 'clock-1', type: 'clock', position: { x: 20, y: 20 }, pinned: false },
    { id: 'calendar-1', type: 'calendar', position: { x: 280, y: 20 }, pinned: false },
    { id: 'weather-1', type: 'weather', position: { x: 20, y: 280 }, pinned: false },
  ]);

  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  const togglePin = (id: string) => {
    setWidgets(widgets.map(w => 
      w.id === id ? { ...w, pinned: !w.pinned } : w
    ));
  };

  const renderWidget = (widget: Widget) => {
    switch (widget.type) {
      case 'clock':
        return <ClockWidget />;
      case 'calendar':
        return <CalendarWidget />;
      case 'weather':
        return <WeatherWidget />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      <div className="relative w-full h-full p-4">
        <AnimatePresence>
          {widgets.map((widget) => (
            <motion.div
              key={widget.id}
              drag
              dragMomentum={false}
              dragElastic={0}
              onDragStart={() => setDraggedWidget(widget.id)}
              onDragEnd={(_e, info) => {
                setDraggedWidget(null);
                setWidgets(widgets.map(w =>
                  w.id === widget.id
                    ? {
                        ...w,
                        position: {
                          x: w.position.x + info.offset.x,
                          y: w.position.y + info.offset.y,
                        },
                      }
                    : w
                ));
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{
                position: 'absolute',
                left: widget.position.x,
                top: widget.position.y,
                cursor: draggedWidget === widget.id ? 'grabbing' : 'grab',
              }}
              className="pointer-events-auto group"
            >
              {/* Widget Controls */}
              <div className="absolute -top-8 left-0 right-0 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-1 bg-gray-900/80 backdrop-blur-sm rounded-lg px-2 py-1">
                  <Grip className="w-3 h-3 text-white cursor-grab" />
                  <button
                    onClick={() => togglePin(widget.id)}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    {widget.pinned ? (
                      <Pin className="w-3 h-3 text-blue-400" />
                    ) : (
                      <PinOff className="w-3 h-3 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => removeWidget(widget.id)}
                    className="p-1 hover:bg-red-500/20 rounded transition-colors"
                  >
                    <X className="w-3 h-3 text-red-400" />
                  </button>
                </div>
              </div>

              {/* Widget Content */}
              <div className={widget.pinned ? 'ring-2 ring-blue-500 rounded-2xl' : ''}>
                {renderWidget(widget)}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
