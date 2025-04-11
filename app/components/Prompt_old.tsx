import React, { useState } from 'react';
import { Paperclip, Search, BrainCircuit, Pencil, SendHorizontal, ArrowUp, ChevronsUp } from 'lucide-react';

const Prompt = ({url}) => {
    //console.log("Prompt url",url);
  const [text, setText] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitted:', text);
    setText('');
  };
  
  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
      <form  method="post" action={url}>
        <div className="relative">
          <textarea
            name="inputText"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ask anything"
            className="w-full min-h-24 p-4 text-gray-700 placeholder-gray-500 bg-transparent border-none resize-none focus:outline-none focus:ring-0"
          />
          
          <div className="flex items-center justify-between pt-2  border-gray-100">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Paperclip size={20} className="text-gray-400" />
              </button>
              
              <div className="relative flex items-center">
                <button
                  type="button"
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <Search size={20} className="text-gray-500" />
                  <span className="text-gray-700 md:visible lg:visible hidden">DeepSearch</span>
                </button>
              </div>
              
              
              
              <button
                type="button"
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <Pencil size={20} className="text-gray-500" />
                
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              {/*<button
                type="button"
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ChevronsUp size={20} className="text-gray-400" />
              </button>*/}
              
              <button
                type="submit"
                className="p-3 rounded-full bg-gray-500 hover:bg-gray-600 transition-colors"
                disabled={!text.trim()}
              >
                <ArrowUp size={20} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

const ChevronDown = ({ size, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

export default Prompt;