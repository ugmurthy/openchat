import React, { useState, useEffect } from 'react';

const SettingsEditor = ({ initialSettings, onSettingsChange }) => {
  const [settings, setSettings] = useState(initialSettings);
  const [openrouterModels, setOpenrouterModels] = useState([]);
  const [ollamaModels, setOllamaModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch models based on local flag
  useEffect(() => {
    const fetchModels = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const endpoint = settings.local 
          ? '/api/v1/localmodels' 
          : '/api/v1/openroutermodels';
        
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch models from ${endpoint}`);
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
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, [settings.local]);

  // Handle changes to settings
  const handleChange = (field, value) => {
    const updatedSettings = { ...settings, [field]: value };
    setSettings(updatedSettings);
    
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
    
    if (onSettingsChange) {
      onSettingsChange(updatedSettings);
    }
  };

  // Get available models based on local flag
  const getAvailableModels = () => {
    return settings.local ? ollamaModels : openrouterModels;
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Settings Editor</h2>
        
        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
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
          />
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Task</span>
          </label>
          <input 
            type="text" 
            className="input input-bordered" 
            value={settings.task} 
            onChange={(e) => handleChange('task', e.target.value)} 
          />
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Description</span>
          </label>
          <textarea 
            className="textarea textarea-bordered" 
            rows="4" 
            value={settings.description} 
            onChange={(e) => handleChange('description', e.target.value)} 
          />
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
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Model</span>
          </label>
          <select 
            className="select select-bordered w-full" 
            value={settings.model} 
            onChange={(e) => handleChange('model', e.target.value)}
            disabled={loading}
          >
            <option value="" disabled>Select a model</option>
            {getAvailableModels().map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
          {loading && <span className="text-sm text-gray-500 mt-1">Loading models...</span>}
        </div>
      </div>
    </div>
  );
};

export default SettingsEditor;