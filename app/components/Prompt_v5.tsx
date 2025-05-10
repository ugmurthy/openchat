import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Search, Pencil, ArrowUp, X, Square, ChevronDown, ChevronUp, Check } from 'lucide-react';

const Prompt = ({url}) => {
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [isTaskPickerOpen, setIsTaskPickerOpen] = useState(false);
  const taskButtonRef = useRef(null);
  const taskDropdownRef = useRef(null);
  
  // Define available tasks
  const [availableTasks, setAvailableTasks] = useState([
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

  // Tasks that have been selected
  const [selectedTasks, setSelectedTasks] = useState([]);
  // State to track dropdown position
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0
  });

  useEffect(() => {
    // Function to position the dropdown
    const positionDropdown = () => {
      if (taskButtonRef.current && isTaskPickerOpen) {
        // Get the button's dimensions and position
        const buttonRect = taskButtonRef.current.getBoundingClientRect();
        
        // Calculate the center point of the screen
        const screenCenterX = window.innerWidth / 2;
        
        // Set preferred width (300px or match button width up to a max)
        const dropdownWidth = Math.min(Math.max(buttonRect.width, 300), window.innerWidth - 40);
        
        // Calculate left position to center the dropdown
        const left = screenCenterX - (dropdownWidth / 2);
        
        // Make sure dropdown doesn't go off-screen
        const adjustedLeft = Math.max(20, Math.min(left, window.innerWidth - dropdownWidth - 20));
        
        // Set the position values
        setDropdownPosition({
          top: buttonRect.bottom + window.scrollY + 5, // 5px gap below button
          left: adjustedLeft,
          width: dropdownWidth
        });
      }
    };

    // Position when opened
    if (isTaskPickerOpen) {
      positionDropdown();
    }

    // Reposition on window resize
    window.addEventListener('resize', positionDropdown);
    return () => {
      window.removeEventListener('resize', positionDropdown);
    };
  }, [isTaskPickerOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isTaskPickerOpen && 
          taskDropdownRef.current && 
          !taskDropdownRef.current.contains(event.target) &&
          taskButtonRef.current && 
          !taskButtonRef.current.contains(event.target)) {
        setIsTaskPickerOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTaskPickerOpen]);

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

  // Toggle task selection
  const toggleTask = (task) => {
    if (selectedTasks.some(t => t.id === task.id)) {
      // Remove task if already selected
      setSelectedTasks(prev => prev.filter(t => t.id !== task.id));
      setAvailableTasks(prev => [...prev, task]);
    } else {
      // Add task if not selected
      setSelectedTasks(prev => [...prev, task]);
      setAvailableTasks(prev => prev.filter(t => t.id !== task.id));
    }
  };

  // Remove a task from selected
  const handleRemoveTask = (task) => {
    setSelectedTasks(prev => prev.filter(t => t.id !== task.id));
    setAvailableTasks(prev => [...prev, task]);
  };
  
  // Function to handle form submission
  const handleSubmit = (e) => {
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

  // Function to simulate Ctrl+C keypress for stopping generation
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

  // Toggle task picker dropdown
  const toggleTaskPicker = () => {
    setIsTaskPickerOpen(!isTaskPickerOpen);
  };

  return (
    <div className="w-full mx-auto rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl border border-gray-200 bg-white p-2 sm:p-3 md:p-4 shadow-sm">
      <form method="post" action={url} encType="multipart/form-data" onSubmit={handleSubmit}>
        {/* Hidden inputs for task values */}
        {selectedTasks.map((task, index) => (
          <input 
            key={`task-input-${task.id}`}
            type="hidden" 
            name={`task[${index}]`}
            value={task.value} 
          />
        ))}
        
        <div className="relative flex flex-col w-full">
          {/* Task selector button */}
          <button
            type="button"
            ref={taskButtonRef}
            onClick={toggleTaskPicker}
            className="flex items-center justify-between w-full px-3 py-2 mb-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <span className="text-gray-700">
              {selectedTasks.length > 0 ? `${selectedTasks.length} Task${selectedTasks.length > 1 ? 's' : ''} Selected` : 'Select Tasks'}
            </span>
            {isTaskPickerOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {/* Task picker dropdown - positioned fixed */}
          {isTaskPickerOpen && (
            <div 
              ref={taskDropdownRef}
              style={{
                position: 'fixed',
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                width: `${dropdownPosition.width}px`,
                zIndex: 10
              }}
              className="bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            >
              <div className="p-2 text-xs text-gray-500 border-b">Available Tasks</div>
              {availableTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="flex items-center justify-between p-2 hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleTask(task)}
                >
                  <span className="text-sm text-gray-700">{task.label}</span>
                </div>
              ))}
              
              {availableTasks.length === 0 && (
                <div className="p-2 text-sm text-gray-500 italic">No more tasks available</div>
              )}
            </div>
          )}

          {/* Selected tasks pills */}
          {selectedTasks.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="flex items-center bg-blue-100 rounded-full px-3 py-1"
                >
                  <span className="text-xs text-blue-700">{task.label}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTask(task)}
                    className="ml-1 text-blue-500 hover:text-blue-700"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Text input area */}
          <textarea
            name="inputText"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ask anything"
            className="w-full min-h-20 sm:min-h-24 p-3 text-gray-700 placeholder-gray-500 bg-transparent border-none resize-none focus:outline-none focus:ring-0"
          />
          
          {/* Display attached files */}
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 px-2 pb-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center bg-gray-100 rounded-full px-2 py-1">
                  <span className="text-xs sm:text-sm text-gray-700 truncate max-w-32 sm:max-w-xs">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Actions bar */}
          <div className="flex flex-col border-t border-gray-100 pt-2">
            <div className="flex items-center justify-between">
              {/* Tools */}
              <div className="flex items-center space-x-1 sm:space-x-2">
                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  className="hidden"
                  multiple
                  name="attachments"
                />
                
                {/* Clip button */}
                <button
                  type="button"
                  onClick={handleFileButtonClick}
                  className="p-1 sm:p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <Paperclip size={18} className="text-gray-400" />
                </button>
                
                {/* Search button */}
                <button
                  type="button"
                  className="flex items-center p-1 sm:p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <Search size={18} className="text-gray-500" />
                  <span className="text-xs text-gray-700 ml-1 hidden md:inline">DeepSearch</span>
                </button>
                
                {/* Edit button */}
                <button
                  type="button"
                  className="p-1 sm:p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <Pencil size={18} className="text-gray-500" />
                </button>
              </div>
              
              {/* Action buttons */}
              <div className="flex items-center space-x-1 sm:space-x-2">
                {/* Stop Button */}
                <button
                  type="button"
                  onClick={handleStopClick}
                  className="p-2 sm:p-3 rounded-full bg-gray-500 hover:bg-gray-900 transition-colors"
                >
                  <Square size={16} className="text-white" />
                </button>
                
                {/* Send Button */}
                <button
                  type="submit"
                  className="p-2 sm:p-3 rounded-full bg-gray-500 hover:bg-gray-900 transition-colors"
                  disabled={!text.trim() && files.length === 0}
                >
                  <ArrowUp size={16} className="text-white" />
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
