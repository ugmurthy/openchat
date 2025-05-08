import React, { useState, useEffect, useMemo } from 'react';

const SettingsEditor = ({ initialSettings, onSettingsChange }) => {
  const [settings, setSettings] = useState(initialSettings);
  const [openrouterModels, setOpenrouterModels] = useState([]);
  const [ollamaModels, setOllamaModels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false);

  // Validate settings
  const validateSettings = (settingsToValidate) => {
    const newErrors = {};
    
    if (!settingsToValidate.task?.trim()) {
      newErrors.task = 'Task is required';
    }
    
    if (!settingsToValidate.model?.trim()) {
      newErrors.model = 'Model selection is required';
    }
    
    if (settingsToValidate.description?.length > 10000) {
      newErrors.description = 'Description is too long (max 1000 characters)';
    }
    
    return newErrors;
  };

  // Simple markdown renderer (for preview)
  const renderMarkdown = (markdownText) => {
    if (!markdownText) return '';
    
    // Replace headers
    let html = markdownText
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>');
      
    // Replace bold/italic
    html = html
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>');
      
    // Replace lists
    html = html
      .replace(/^\s*- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
      .replace(/^\s*\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>');
      
    // Replace paragraphs
    html = html
      .replace(/\n\n/gim, '</p><p class="my-2">')
      
    return `<div class="prose"><p class="my-2">${html}</p></div>`;
  };

  // Fetch models based on local flag
  useEffect(() => {
    const fetchModels = async () => {
      setIsLoading(true);
      setApiError(null);
      
      try {
        const endpoint = settings.local 
          ? '/api/v1/localmodels' 
          : '/api/v1/openroutermodels';
        
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch models from ${endpoint}. Status: ${response.status}`);
        }
        
        const models = await response.json();
        
        if (settings.local) {
            let modelnames = models.map(model => model.name);
          setOllamaModels(modelnames);
        } else {
            let modelnames = models.map(model => model.id);
          setOpenrouterModels(modelnames);
        }
      } catch (err) {
        setApiError(`Error loading models: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchModels();
  }, [settings.local]);

  // Handle changes to settings
  const handleChange = (field, value) => {
    const updatedSettings = { ...settings, [field]: value };
    setSettings(updatedSettings);
    
    // Update validation errors
    const validationErrors = validateSettings(updatedSettings);
    setErrors(validationErrors);
    
    // Notify parent component of changes
    if (onSettingsChange) {
      onSettingsChange(updatedSettings);
    }
  };

  // Handle local flag toggle
  const handleLocalToggle = (value) => {
    const updatedSettings = { 
      ...settings, 
      local: value,
      // Reset model when switching between local and remote
      model: '' 
    };
    setSettings(updatedSettings);
    
    const validationErrors = validateSettings(updatedSettings);
    setErrors(validationErrors);
    
    if (onSettingsChange) {
      onSettingsChange(updatedSettings);
    }
  };

  // Get available models based on local flag
  const availableModels = useMemo(() => {
    return settings.local ? ollamaModels : openrouterModels;
  }, [settings.local, ollamaModels, openrouterModels]);

  // Form is valid if there are no errors
  const isFormValid = Object.keys(errors).length === 0;

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Settings Editor</h2>
        
        {apiError && (
          <div className="alert alert-error mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{apiError}</span>
          </div>
        )}
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">ID</span>
          </label>
          <input 
            type="text" 
            className="input input-bordered" 
            value={settings.id} 
            readOnly 
            disabled
          />
          <label className="label">
            <span className="label-text-alt text-gray-500">This field is read-only</span>
          </label>
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Task</span>
          </label>
          <input 
            type="text" 
            className={`input input-bordered ${errors.task ? 'input-error' : ''}`}
            value={settings.task || ''} 
            onChange={(e) => handleChange('task', e.target.value)} 
            placeholder="Enter task description"
          />
          {errors.task && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.task}</span>
            </label>
          )}
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Description</span>
            <button 
              className="btn btn-xs btn-outline"
              onClick={() => setShowMarkdownPreview(!showMarkdownPreview)}
            >
              {showMarkdownPreview ? 'Edit' : 'Preview'}
            </button>
          </label>
          
          {showMarkdownPreview ? (
            <div 
              className="bg-base-200 rounded-lg p-4 min-h-[128px] border border-base-300"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(settings.description) }}
            />
          ) : (
            <textarea 
              className={`textarea textarea-bordered ${errors.description ? 'textarea-error' : ''}`}
              rows="4" 
              value={settings.description || ''} 
              onChange={(e) => handleChange('description', e.target.value)} 
              placeholder="Enter markdown description"
            />
          )}
          
          {errors.description && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.description}</span>
            </label>
          )}
          <label className="label">
            <span className="label-text-alt text-gray-500">Supports Markdown formatting</span>
          </label>
        </div>
        
        <div className="form-control">
          <label className="label cursor-pointer">
            <span className="label-text">Use Local Models</span>
            <input 
              type="checkbox" 
              className="toggle toggle-primary" 
              checked={settings.local} 
              onChange={(e) => handleLocalToggle(e.target.checked)} 
            />
          </label>
          <label className="label">
            <span className="label-text-alt text-gray-500">
              Switch between local (Ollama) and remote (OpenRouter) models
            </span>
          </label>
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Model</span>
          </label>
          <select 
            className={`select select-bordered w-full ${errors.model ? 'select-error' : ''}`}
            value={settings.model || ''} 
            onChange={(e) => handleChange('model', e.target.value)}
            disabled={isLoading}
          >
            <option value="" disabled>Select a model</option>
            {availableModels.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
          
          {isLoading && (
            <div className="flex items-center mt-2">
              <span className="loading loading-spinner loading-xs mr-2"></span>
              <span className="text-sm text-gray-500">Loading models...</span>
            </div>
          )}
          
          {errors.model && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.model}</span>
            </label>
          )}
          
          <label className="label">
            <span className="label-text-alt text-gray-500">
              {settings.local ? 'Using Ollama models (local)' : 'Using OpenRouter models (remote)'}
            </span>
          </label>
        </div>
        
        <div className="card-actions justify-end mt-4">
          <div className={!isFormValid ? "tooltip tooltip-open tooltip-error" : ""} data-tip={!isFormValid ? "Please fix errors before saving" : ""}>
            <button 
              className="btn btn-primary" 
              disabled={!isFormValid}
              onClick={() => {
                // This button could trigger a save function provided by parent
                // For now, we'll just notify parent of settings via onSettingsChange
                if (onSettingsChange && isFormValid) {
                  onSettingsChange(settings, true); // second param could indicate "save" vs "change"
                }
              }}
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsEditor;