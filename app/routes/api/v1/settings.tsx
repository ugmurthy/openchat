import React, { useState } from 'react';
import SettingsEditor from '~/components/SettingsEditor';


export const loader = async () => {
    return {
        id: 1,
        model: "llama3.2",
        local: true,
        description: "# Markdown Heading\nThis is a sample description that contains **Markdown** formatted text.\n\n- Bullet point 1\n- Bullet point 2",
        task: "summarise"
    };
}

const SettingsPage = () => {
  // Initial settings object matching the required structure
  const initialSettings = {
    id: 1,
    model: "llama3.2",
    local: true,
    description: "# Markdown Heading\nThis is a sample description that contains **Markdown** formatted text.\n\n- Bullet point 1\n- Bullet point 2",
    task: "summarise"
  };

  const [currentSettings, setCurrentSettings] = useState(initialSettings);

  // Handle settings changes
  const handleSettingsChange = (updatedSettings) => {
    console.log('Settings updated:', updatedSettings);
    setCurrentSettings(updatedSettings);
  };

  // Function to save settings (would typically send to an API)
  const handleSaveSettings = () => {
    // In a real application, this would make an API call to save the settings
    console.log('Saving settings:', currentSettings);
    alert('Settings saved successfully!');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Application Settings</h1>
      
      <SettingsEditor 
        initialSettings={currentSettings} 
        onSettingsChange={handleSettingsChange} 
      />
      
      <div className="mt-4">
        <button 
          className="btn btn-primary" 
          onClick={handleSaveSettings}
        >
          Save Settings
        </button>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Current Settings (JSON):</h2>
        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify(currentSettings, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default SettingsPage;