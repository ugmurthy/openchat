import React, { useState, useRef } from 'react';
import { Paperclip, Search, Pencil, ArrowUp, ChevronsUp, X } from 'lucide-react';

const Prompt = ({url}) => {
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitted:', text);
    console.log('Attached Files:', files);
    setText('');
    setFiles([]);
  };
  
  const handleFileInputChange = (e) => {
    if (e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current.click();
  };

  const removeFile = (indexToRemove) => {
    setFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
  };
  
  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
      <form method="post" action={url} encType="multipart/form-data">
        <div className="relative">
          <textarea
            name="inputText"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ask anything"
            className="w-full min-h-24 p-4 text-gray-700 placeholder-gray-500 bg-transparent border-none resize-none focus:outline-none focus:ring-0"
          />
          
          {/* Display attached files */}
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 px-4 pb-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center bg-gray-100 rounded-lg px-3 py-1">
                  <span className="text-sm text-gray-700 truncate max-w-xs">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between pt-2 border-gray-100">
            <div className="flex items-center space-x-2">
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                className="hidden"
                multiple
                name="attachments"
              />
              
              {/* Clip button to trigger file selection */}
              <button
                type="button"
                onClick={handleFileButtonClick}
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
              <button
                type="submit"
                className="p-3 rounded-full bg-gray-500 hover:bg-gray-600 transition-colors"
                disabled={!text.trim() && files.length === 0}
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

export default Prompt;
