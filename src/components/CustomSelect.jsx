import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

export default function CustomSelect({ options, value, onChange, placeholder = 'Select...', className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || options.find(opt => opt === value);
  const displayLabel = selectedOption?.label || selectedOption || placeholder;

  const handleSelect = (option) => {
    const val = option.value !== undefined ? option.value : option;
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className={`custom-select ${className}`} ref={containerRef}>
      <button
        type="button"
        className={`custom-select-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{displayLabel}</span>
        <ChevronDown size={18} className="custom-select-chevron" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="custom-select-list"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          >
            {options.map((option, i) => {
              const optValue = option.value !== undefined ? option.value : option;
              const optLabel = option.label || option;
              const isSelected = optValue === value;

              return (
                <motion.div
                  key={i}
                  className={`custom-select-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(option)}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>{optLabel}</span>
                  {isSelected && <Check size={14} className="text-accent" />}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
