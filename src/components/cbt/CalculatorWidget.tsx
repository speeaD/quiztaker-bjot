'use client';

import { Delete, X } from 'lucide-react';
import { useState } from 'react';

export default function CalculatorWidget({ onClose }: { onClose: () => void }) {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
      return;
    }
    setDisplay(display === '0' ? digit : display + digit);
  };

  const calculate = (nextOperation: string) => {
    const inputValue = Number.parseFloat(display);
    if (previousValue !== null && operation) {
      const result = operation === '+' ? previousValue + inputValue
        : operation === '-' ? previousValue - inputValue
          : operation === '*' ? previousValue * inputValue
            : operation === '/' ? previousValue / inputValue : inputValue;
      setDisplay(String(result));
      setPreviousValue(result);
    } else {
      setPreviousValue(inputValue);
    }
    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const press = (key: string) => {
    if (key === 'C') {
      setDisplay('0'); setPreviousValue(null); setOperation(null); setWaitingForOperand(false);
    } else if (key === '.') {
      if (!display.includes('.')) setDisplay(`${display}.`);
    } else if (['+', '-', '*', '/', '='].includes(key)) {
      calculate(key);
    } else {
      inputDigit(key);
    }
  };

  return (
    <aside className="fixed bottom-4 right-4 z-50 w-64 rounded-xl border border-[#c9d8cf] bg-white p-4 shadow-[0_16px_40px_rgba(13,59,46,0.18)]">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-black text-[#17231e]"><Delete size={16} className="text-[#15513e]" />Calculator</div>
        <button onClick={onClose} className="rounded-md p-1 text-[#637169] hover:bg-[#edf3ef]" aria-label="Close calculator"><X size={17} /></button>
      </div>
      <output className="mb-3 block overflow-x-auto rounded-lg bg-[#edf3ef] px-3 py-3 text-right font-mono text-2xl font-bold text-[#0d3b2e]">{display}</output>
      <div className="grid grid-cols-4 gap-2">
        {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+'].map((key) => (
          <button key={key} onClick={() => press(key)} className={`rounded-md py-2 text-sm font-bold transition ${key === '=' ? 'bg-[#0d3b2e] text-white hover:bg-[#14513c]' : 'bg-[#edf3ef] text-[#17231e] hover:bg-[#dcebe1]'}`}>{key}</button>
        ))}
        <button onClick={() => press('C')} className="col-span-4 rounded-md bg-[#fff0ec] py-2 text-xs font-bold text-[#b85b26] hover:bg-[#ffe1d7]">Clear</button>
      </div>
    </aside>
  );
}
