import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Search, Pencil, ArrowUp, ChevronsUp, X, GripHorizontal, Square } from 'lucide-react';

const Prompt = ({url}) => {
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);
  
  // Define available badges
  const [availableBadges, setAvailableBadges] = useState([
    { id: 'task-1', label: 'Deep Search', value: 'Deep Search' },
    { id: 'task-2', label: 'Generate tweets', value: 'Generate tweets' },
    { id: 'task-3', label: 'TLDR;', value: 'TLDR' },
    { id: 'task-4', label: 'Summarise', value: 'summarise' },
    { id: 'task-5', label: 'Summarise Paper', value: 'summarise_paper' },
    { id: 'task-6', label: 'Assist a Runner', value: 'assist_distance_runner' },
    { id: 'task-7', label: 'Create S/w Specs', value: 'create_sw_specs' },
    { id: 'task-8', label: 'Generate Python Code', value: 'pyCodeGenerator' },
    { id: 'task-9', label: 'Explain code', value: 'explain_code' },

  ]);

  // Badges that have been dragged to the input area
  const [selectedBadges, setSelectedBadges] = useState([]);

  // State to track which badge is being dragged and its source
  const [draggedBadge, setDraggedBadge] = useState(null);
  const [dragSource, setDragSource] = useState(null);
  
  // State to track drag over areas for visual feedback
  const [isDraggingOverSelected, setIsDraggingOverSelected] = useState(false);
  const [isDraggingOverAvailable, setIsDraggingOverAvailable] = useState(false);

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

  // Drag handlers for available badges
  const handleDragStart = (e, badge, source) => {
    setDraggedBadge(badge);
    setDragSource(source);
    e.dataTransfer.setData('application/json', JSON.stringify(badge));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    // Reset all drag states
    setDraggedBadge(null);
    setDragSource(null);
    setIsDraggingOverSelected(false);
    setIsDraggingOverAvailable(false);
  };

  const handleDragOverSelected = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setIsDraggingOverSelected(true);
  };

  const handleDragLeaveSelected = () => {
    setIsDraggingOverSelected(false);
  };

  const handleDragOverAvailable = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setIsDraggingOverAvailable(true);
  };

  const handleDragLeaveAvailable = () => {
    setIsDraggingOverAvailable(false);
  };

  // Handler for dropping a badge into the selected area
  const handleDropToSelected = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOverSelected(false);
    
    if (!draggedBadge) return;

    if (dragSource === 'available') {
      // Add to selected badges if coming from available badges
      setSelectedBadges(prev => [...prev, draggedBadge]);
      // Remove from available badges
      setAvailableBadges(prev => prev.filter(b => b.id !== draggedBadge.id));
    } else if (dragSource === 'selected') {
      // Reordering within selected badges
      // This is handled by handleDropOnBadge
    }
    
    // Reset drag state
    setDraggedBadge(null);
    setDragSource(null);
  };

  // Handler for dropping a badge back to available area
  const handleDropToAvailable = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOverAvailable(false);
    
    if (!draggedBadge || dragSource !== 'selected') return;

    // Add back to available badges
    setAvailableBadges(prev => [...prev, draggedBadge]);
    // Remove from selected badges
    setSelectedBadges(prev => prev.filter(b => b.id !== draggedBadge.id));
    
    // Reset drag state
    setDraggedBadge(null);
    setDragSource(null);
  };

  // Handle reordering within the selected badges row
  const handleDropOnBadge = (e, targetBadge) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedBadge || draggedBadge.id === targetBadge.id) return;

    // If coming from available badges and dropping onto a selected badge
    if (dragSource === 'available') {
      // Add to selected badges at specific position
      const targetIndex = selectedBadges.findIndex(b => b.id === targetBadge.id);
      const newSelectedBadges = [...selectedBadges];
      newSelectedBadges.splice(targetIndex, 0, draggedBadge);
      setSelectedBadges(newSelectedBadges);
      
      // Remove from available badges
      setAvailableBadges(prev => prev.filter(b => b.id !== draggedBadge.id));
    } else if (dragSource === 'selected') {
      // Reordering within selected badges
      const updatedBadges = [...selectedBadges];
      const draggedIndex = updatedBadges.findIndex(b => b.id === draggedBadge.id);
      const targetIndex = updatedBadges.findIndex(b => b.id === targetBadge.id);
      
      updatedBadges.splice(draggedIndex, 1);
      updatedBadges.splice(targetIndex, 0, draggedBadge);
      
      setSelectedBadges(updatedBadges);
    }
    
    // Reset drag state
    setDraggedBadge(null);
    setDragSource(null);
  };

  // Remove a badge from selected and move it back to available
  const handleRemoveBadge = (badge) => {
    setAvailableBadges(prev => [...prev, badge]);
    setSelectedBadges(prev => prev.filter(b => b.id !== badge.id));
  };
  
  // Function to handle form submission
  const handleSubmit = (e) => {
    // No need to prevent default as we want the form to submit
    
    // For debugging purposes, we can log the form data
    // This would be removed in production
    if (process.env.NODE_ENV === 'development') {
      const formData = new FormData(e.target);
      console.log('Form data before submission:');
      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }
    }
  };

  // Function to simulate Ctrl+C keypress
  const handleStopClick = () => {
    const event = new KeyboardEvent('keydown', {
      key: 'c',
      code: 'KeyC',
      ctrlKey: true,
      bubbles: true,
      cancelable: true
    });
    document.dispatchEvent(event);
  };

  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
      <form method="post" action={url} encType="multipart/form-data" onSubmit={handleSubmit}>
        {/* Hidden inputs for badge values - This ensures all selected badges are included in form submission */}
        {selectedBadges.map((badge, index) => (
          <input 
            key={`badge-input-${badge.id}`}
            type="hidden" 
            name={`task[${index}]`}
            value={badge.value} 
          />
        ))}
        
        <div className="relative">
          {/* Selected badges section - where dragged badges appear */}
          <div 
            className={`flex flex-wrap gap-2 px-4 py-2 mb-2 min-h-10 border border-dashed rounded-xl ${
              selectedBadges.length === 0 && !isDraggingOverSelected 
                ? 'border-gray-200' 
                : 'border-gray-300'
            } ${isDraggingOverSelected ? 'bg-blue-50' : ''} rounded-md transition-colors duration-200`}
            onDragOver={handleDragOverSelected}
            onDragLeave={handleDragLeaveSelected}
            onDrop={handleDropToSelected}
            onDragEnd={handleDragEnd}
          >
            {selectedBadges.length === 0 && !isDraggingOverSelected && (
              <div className="w-full text-center text-gray-400 text-sm">Drag Tasks here</div>
            )}
            {selectedBadges.map((badge) => (
              <div 
                key={badge.id} 
                className="flex items-center bg-blue-100 rounded-xl px-3 py-1 cursor-move"
                draggable
                onDragStart={(e) => handleDragStart(e, badge, 'selected')}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.dataTransfer.dropEffect = 'move';
                }}
                onDrop={(e) => handleDropOnBadge(e, badge)}
              >
                <GripHorizontal size={12} className="mr-1 text-blue-600" />
                <span className="text-sm text-blue-700">{badge.label}</span>
                {/* Removed hidden input from here as we're adding them at the form level */}
                <button
                  type="button"
                  onClick={() => handleRemoveBadge(badge)}
                  className="ml-2 text-blue-500 hover:text-blue-700"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

        {/* Available badges row */}
        <div 
              className={`flex flex-wrap gap-2 px-4 py-2 mb-2 rounded-md transition-colors duration-200 ${
                isDraggingOverAvailable ? 'bg-gray-100' : ''
              }`}
              onDragOver={handleDragOverAvailable}
              onDragLeave={handleDragLeaveAvailable}
              onDrop={handleDropToAvailable}
              onDragEnd={handleDragEnd}
            >
              {availableBadges.map((badge) => (
                <div 
                  key={badge.id} 
                  className="flex items-center bg-gray-100 rounded-xl px-3 py-1 cursor-move hover:bg-gray-200 transition-colors"
                  draggable
                  onDragStart={(e) => handleDragStart(e, badge, 'available')}
                  onDragEnd={handleDragEnd}
                >
                  <GripHorizontal size={12} className="mr-1 text-gray-600" />
                  <span className="text-sm text-gray-700">{badge.label}</span>
                </div>
              ))}
            </div>

          <textarea
            name="inputText"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ask anything"
            className="w-full min-h-24 p-4 text-gray-700 placeholder-gray-500 bg-transparent border-none resize-none focus:outline-dotted focus:rounded-xl focus:ring-0"
          />
          
          {/* Display attached files */}
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 px-4 pb-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center bg-gray-100 rounded-xl px-3 py-1">
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
          
          <div className="flex flex-col border-t border-gray-100 pt-2">
            
            
            {/* Tools row */}
            <div className="flex items-center justify-between">
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
                {/* New Stop Button */}
                <button
                  type="button"
                  onClick={handleStopClick}
                  className="p-3 rounded-full bg-gray-500 hover:bg-gray-900 transition-colors mr-1"
                >
                  <Square size={20} className="text-white" />
                </button>
                {/* Send Button with 4px spacing from Stop Button */}
                <button
                  type="submit"
                  className="p-3 rounded-full bg-gray-500 hover:bg-gray-900 transition-colors"
                  disabled={!text.trim() && files.length === 0}
                >
                  <ArrowUp size={20} className="text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Prompt;