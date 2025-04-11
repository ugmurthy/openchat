import React, { useState } from 'react';

interface TabProps {
  name: string;
  content: React.ReactNode;
}

interface TabsComponentProps {
  tabs?: TabProps[];
  backgroundColor?: string;
  borderColor?: string;
  borderThickness?: number;
}

const TabsComponent: React.FC<TabsComponentProps> = ({
  tabs = [
    { name: "tab1", content: "Tab1 content" },
    { name: "tab2", content: "Tab2 content" }
  ],
  backgroundColor = 'bg-white',
  borderColor = 'border-gray-500',
  borderThickness = 2
}) => {
  const [activeTab, setActiveTab] = useState(tabs[0]?.name || '');

  // Convert borderThickness to Tailwind classes (px, py, etc.)
  const borderThicknessClass = `border-${borderThickness}`;
  
  return (
    <div className="w-full mx-auto p-4">
      <div className="flex flex-col">
        {/* Tabs Navigation */}
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              className={`px-4 py-2 ${borderThicknessClass} ${
                activeTab === tab.name
                ? `${borderColor} ${backgroundColor} border-b-0 rounded-t-xl font-medium`
                : 'border-b border-transparent'
              }`}
              onClick={() => setActiveTab(tab.name)}
            >
              {tab.name}
            </button>
          ))}
        </div>
        
        {/* Tab Content */}
        <div className={`${backgroundColor} ${borderColor} ${borderThicknessClass} rounded-b-lg rounded-tr-lg p-6`}>
          {tabs.map((tab) => (
            <div
              key={`content-${tab.name}`}
              className={activeTab === tab.name ? 'block' : 'hidden'}
            >
              <div className="prose">{tab.content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TabsComponent;