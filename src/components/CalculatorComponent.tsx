'use client';

import { XCircle } from "lucide-react";
import { useState } from "react";

const CalculatorWidget: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPrevValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(inputValue);
    } else if (operation) {
      const currentValue = prevValue || 0;
      let newValue = currentValue;

      switch (operation) {
        case '+':
          newValue = currentValue + inputValue;
          break;
        case '-':
          newValue = currentValue - inputValue;
          break;
        case '*':
          newValue = currentValue * inputValue;
          break;
        case '/':
          newValue = currentValue / inputValue;
          break;
        case '=':
          newValue = inputValue;
          break;
      }

      setDisplay(String(newValue));
      setPrevValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-2xl border border-gray-300 p-4 w-64 z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-800">Calculator</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <XCircle size={20} />
        </button>
      </div>
      <div className="bg-gray-100 p-3 rounded mb-3 text-right text-2xl font-mono">
        {display}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {['7', '8', '9', '/'].map(btn => (
          <button
            key={btn}
            onClick={() => ['/', '*', '-', '+'].includes(btn) ? performOperation(btn) : inputDigit(btn)}
            className="bg-gray-200 hover:bg-gray-300 p-3 rounded font-semibold"
          >
            {btn}
          </button>
        ))}
        {['4', '5', '6', '*'].map(btn => (
          <button
            key={btn}
            onClick={() => ['/', '*', '-', '+'].includes(btn) ? performOperation(btn) : inputDigit(btn)}
            className="bg-gray-200 hover:bg-gray-300 p-3 rounded font-semibold"
          >
            {btn}
          </button>
        ))}
        {['1', '2', '3', '-'].map(btn => (
          <button
            key={btn}
            onClick={() => ['/', '*', '-', '+'].includes(btn) ? performOperation(btn) : inputDigit(btn)}
            className="bg-gray-200 hover:bg-gray-300 p-3 rounded font-semibold"
          >
            {btn}
          </button>
        ))}
        {['0', '.', '=', '+'].map(btn => (
          <button
            key={btn}
            onClick={() => {
              if (btn === '.') inputDecimal();
              else if (btn === '=') performOperation('=');
              else if (['+', '-', '*', '/'].includes(btn)) performOperation(btn);
              else inputDigit(btn);
            }}
            className={`${btn === '=' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-200 hover:bg-gray-300'} p-3 rounded font-semibold`}
          >
            {btn}
          </button>
        ))}
        <button
          onClick={clear}
          className="col-span-4 bg-red-500 text-white hover:bg-red-600 p-3 rounded font-semibold"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default CalculatorWidget;