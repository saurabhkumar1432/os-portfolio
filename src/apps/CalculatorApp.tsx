import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Delete, DivideIcon, Settings2 } from 'lucide-react';

type CalculatorMode = 'standard' | 'scientific';
type Operation = '+' | '-' | '*' | '/' | null;

export const CalculatorApp: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<Operation>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [mode, setMode] = useState<CalculatorMode>('standard');
  const [history, setHistory] = useState<string[]>([]);

  // Handle number input
  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  // Handle decimal point
  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  // Clear display
  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  // Clear entry (last input)
  const clearEntry = () => {
    setDisplay('0');
    setWaitingForOperand(false);
  };

  // Backspace
  const backspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  // Perform operation
  const performOperation = (nextOperation: Operation) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const result = calculate(currentValue, inputValue, operation);
      
      setDisplay(String(result));
      setPreviousValue(result);
      
      // Add to history
      const historyEntry = `${currentValue} ${operation} ${inputValue} = ${result}`;
      setHistory([historyEntry, ...history.slice(0, 9)]); // Keep last 10
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  // Calculate result
  const calculate = (a: number, b: number, op: Operation): number => {
    switch (op) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '*':
        return a * b;
      case '/':
        return b !== 0 ? a / b : 0;
      default:
        return b;
    }
  };

  // Toggle sign
  const toggleSign = () => {
    const value = parseFloat(display);
    setDisplay(String(value * -1));
  };

  // Percentage
  const percentage = () => {
    const value = parseFloat(display);
    setDisplay(String(value / 100));
  };

  // Scientific functions
  const scientificOperation = (func: string) => {
    const value = parseFloat(display);
    let result: number;

    switch (func) {
      case 'sin':
        result = Math.sin(value * (Math.PI / 180));
        break;
      case 'cos':
        result = Math.cos(value * (Math.PI / 180));
        break;
      case 'tan':
        result = Math.tan(value * (Math.PI / 180));
        break;
      case 'sqrt':
        result = Math.sqrt(value);
        break;
      case 'square':
        result = value * value;
        break;
      case 'cube':
        result = value * value * value;
        break;
      case 'ln':
        result = Math.log(value);
        break;
      case 'log':
        result = Math.log10(value);
        break;
      case 'exp':
        result = Math.exp(value);
        break;
      case 'factorial':
        result = factorial(value);
        break;
      case 'pi':
        result = Math.PI;
        break;
      case 'e':
        result = Math.E;
        break;
      default:
        result = value;
    }

    setDisplay(String(result));
    setWaitingForOperand(true);
  };

  // Factorial helper
  const factorial = (n: number): number => {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    return n * factorial(n - 1);
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      e.preventDefault();
      
      if (e.key >= '0' && e.key <= '9') {
        inputDigit(e.key);
      } else if (e.key === '.') {
        inputDecimal();
      } else if (e.key === '+') {
        performOperation('+');
      } else if (e.key === '-') {
        performOperation('-');
      } else if (e.key === '*') {
        performOperation('*');
      } else if (e.key === '/') {
        performOperation('/');
      } else if (e.key === 'Enter' || e.key === '=') {
        performOperation(null);
      } else if (e.key === 'Escape') {
        clear();
      } else if (e.key === 'Backspace') {
        backspace();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [display, previousValue, operation, waitingForOperand]);

  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900 min-w-[280px]">
      {/* Mode Toggle */}
      <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex gap-2">
          <button
            onClick={() => setMode('standard')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              mode === 'standard'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Standard
          </button>
          <button
            onClick={() => setMode('scientific')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              mode === 'scientific'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Scientific
          </button>
        </div>
        <Settings2 className="w-4 h-4 text-gray-400" />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Calculator */}
        <div className={`flex flex-col ${mode === 'scientific' ? 'md:w-2/3 w-full' : 'w-full'}`}>
          {/* Display */}
          <div className="p-4 md:p-6 bg-gray-900 dark:bg-black text-right flex-shrink-0">
            <div className="text-xs md:text-sm text-gray-500 h-5 md:h-6 truncate">
              {previousValue !== null && operation && `${previousValue} ${operation}`}
            </div>
            <div className="text-2xl md:text-4xl font-light text-white mt-1 md:mt-2 truncate">
              {display}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex-1 grid grid-cols-4 gap-0.5 md:gap-1 p-0.5 md:p-1 min-h-[300px]">
            {/* Row 1 */}
            <CalcButton label="C" onClick={clear} variant="function" />
            <CalcButton label="CE" onClick={clearEntry} variant="function" />
            <CalcButton icon={<Delete className="w-5 h-5" />} onClick={backspace} variant="function" />
            <CalcButton icon={<DivideIcon className="w-5 h-5" />} onClick={() => performOperation('/')} variant="operator" />

            {/* Row 2 */}
            <CalcButton label="7" onClick={() => inputDigit('7')} />
            <CalcButton label="8" onClick={() => inputDigit('8')} />
            <CalcButton label="9" onClick={() => inputDigit('9')} />
            <CalcButton label="×" onClick={() => performOperation('*')} variant="operator" />

            {/* Row 3 */}
            <CalcButton label="4" onClick={() => inputDigit('4')} />
            <CalcButton label="5" onClick={() => inputDigit('5')} />
            <CalcButton label="6" onClick={() => inputDigit('6')} />
            <CalcButton label="−" onClick={() => performOperation('-')} variant="operator" />

            {/* Row 4 */}
            <CalcButton label="1" onClick={() => inputDigit('1')} />
            <CalcButton label="2" onClick={() => inputDigit('2')} />
            <CalcButton label="3" onClick={() => inputDigit('3')} />
            <CalcButton label="+" onClick={() => performOperation('+')} variant="operator" />

            {/* Row 5 */}
            <CalcButton label="±" onClick={toggleSign} />
            <CalcButton label="0" onClick={() => inputDigit('0')} />
            <CalcButton label="." onClick={inputDecimal} />
            <CalcButton label="=" onClick={() => performOperation(null)} variant="equals" />
          </div>
        </div>

        {/* Scientific Panel */}
        {mode === 'scientific' && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '33.333%', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="hidden md:block border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
          >
            <div className="p-0.5 md:p-1 grid grid-cols-2 gap-0.5 md:gap-1 h-full overflow-y-auto">
              <CalcButton label="sin" onClick={() => scientificOperation('sin')} variant="scientific" />
              <CalcButton label="cos" onClick={() => scientificOperation('cos')} variant="scientific" />
              <CalcButton label="tan" onClick={() => scientificOperation('tan')} variant="scientific" />
              <CalcButton label="√" onClick={() => scientificOperation('sqrt')} variant="scientific" />
              <CalcButton label="x²" onClick={() => scientificOperation('square')} variant="scientific" />
              <CalcButton label="x³" onClick={() => scientificOperation('cube')} variant="scientific" />
              <CalcButton label="ln" onClick={() => scientificOperation('ln')} variant="scientific" />
              <CalcButton label="log" onClick={() => scientificOperation('log')} variant="scientific" />
              <CalcButton label="eˣ" onClick={() => scientificOperation('exp')} variant="scientific" />
              <CalcButton label="n!" onClick={() => scientificOperation('factorial')} variant="scientific" />
              <CalcButton label="π" onClick={() => scientificOperation('pi')} variant="scientific" />
              <CalcButton label="e" onClick={() => scientificOperation('e')} variant="scientific" />
              <CalcButton label="%" onClick={percentage} variant="scientific" />
              <CalcButton label="1/x" onClick={() => setDisplay(String(1 / parseFloat(display)))} variant="scientific" />
            </div>
          </motion.div>
        )}
      </div>

      {/* History Panel */}
      {history.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 max-h-24 md:max-h-32 overflow-y-auto flex-shrink-0">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">History</div>
          {history.map((entry, i) => (
            <div
              key={i}
              className="text-xs text-gray-600 dark:text-gray-300 py-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 rounded"
              onClick={() => {
                const result = entry.split('=')[1].trim();
                setDisplay(result);
              }}
            >
              {entry}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Calculator Button Component
interface CalcButtonProps {
  label?: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'operator' | 'equals' | 'function' | 'scientific';
}

const CalcButton: React.FC<CalcButtonProps> = ({ label, icon, onClick, variant = 'default' }) => {
  const getButtonStyles = () => {
    switch (variant) {
      case 'operator':
        return 'bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-medium';
      case 'equals':
        return 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold';
      case 'function':
        return 'bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 active:bg-gray-500 dark:active:bg-gray-500 text-gray-700 dark:text-gray-200';
      case 'scientific':
        return 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 active:bg-gray-400 dark:active:bg-gray-500 text-gray-700 dark:text-gray-200 text-xs md:text-sm';
      default:
        return 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 text-gray-900 dark:text-white text-base md:text-lg';
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`aspect-square rounded flex items-center justify-center transition-colors select-none touch-manipulation ${getButtonStyles()}`}
    >
      {icon || label}
    </motion.button>
  );
};

export default CalculatorApp;
