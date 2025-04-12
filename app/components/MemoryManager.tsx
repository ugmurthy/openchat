
// MemoryManager.jsx
import React, { useState, useCallback , useEffect} from 'react';
import useIndexedDB from '../db/IndexedDBService';
import indexedDBService from '../hooks/useIndexedDB';

const MemoryManager = () => {
  const { ENTITY_TYPES } = indexedDBService;
  const { 
    items: memories, 
    save: saveMemory,
    update: updateMemory,
    remove: deleteMemory,
    find: findMemories,
    loading,
    error 
  } = useIndexedDB(ENTITY_TYPES.MEMORY);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    key: '',
    value: ''
  });

  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) {
      setSearchResults(null);
      return;
    }
    
    // For a simple text search across multiple fields
    // we'll load all items and filter them in memory
    // For a more efficient solution, you could implement
    // a proper text index in IndexedDB
    
    const filteredMemories = memories.filter(memory => 
      memory.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      memory.value.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setSearchResults(filteredMemories);
  }, [searchTerm, memories]);

  useEffect(() => {
    handleSearch();
  }, [searchTerm, handleSearch]);

  const handleSaveMemory = async () => {
    if (!formData.key.trim()) return;
    
    const memoryItem = {
      id: editingId || Date.now().toString(),
      key: formData.key,
      value: formData.value,
      timestamp: new Date().toISOString()
    };
    
    try {
      await saveMemory(memoryItem);
      setFormData({ key: '', value: '' });
      setEditingId(null);
      // Reset search results to show the updated list
      if (searchTerm) {
        handleSearch();
      }
    } catch (err) {
      console.error('Failed to save memory:', err);
      alert('Failed to save memory');
    }
  };

  const handleEdit = (memory) => {
    setEditingId(memory.id);
    setFormData({
      key: memory.key,
      value: memory.value
    });
  };

  const handleDelete = async (id) => {
    try {
      await deleteMemory(id);
      if (searchTerm) {
        handleSearch();
      }
    } catch (err) {
      console.error('Failed to delete memory:', err);
      alert('Failed to delete memory');
    }
  };

  const displayedMemories = searchResults !== null ? searchResults : memories;

  if (error) {
    return <div>Error loading memories: {error.message}</div>;
  }

  if (loading) {
    return <div>Loading memories...</div>;
  }

  return (
    <div>
      <h2>Memory Manager</h2>
      
      <div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search memories"
        />
      </div>
      
      <form onSubmit={(e) => { e.preventDefault(); handleSaveMemory(); }}>
        <div>
          <input
            type="text"
            value={formData.key}
            onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
            placeholder="Memory key"
          />
        </div>
        <div>
          <textarea
            value={formData.value}
            onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
            placeholder="Memory value"
          />
        </div>
        <button type="submit">
          {editingId ? 'Update Memory' : 'Add Memory'}
        </button>
        {editingId && (
          <button type="button" onClick={() => {
            setEditingId(null);
            setFormData({ key: '', value: '' });
          }}>
            Cancel
          </button>
        )}
      </form>
      
      <ul>
        {displayedMemories.map(memory => (
          <li key={memory.id}>
            <strong>{memory.key}:</strong> {memory.value}
            <div>
              <button onClick={() => handleEdit(memory)}>Edit</button>
              <button onClick={() => handleDelete(memory.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
      
      {displayedMemories.length === 0 && !loading && (
        <p>
          {searchTerm 
            ? 'No memories match your search.' 
            : 'No memories yet. Add one to get started.'}
        </p>
      )}
    </div>
  );
};

export default MemoryManager;


