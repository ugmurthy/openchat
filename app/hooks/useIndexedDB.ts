// useIndexedDB.js
import { useState, useEffect, useCallback } from 'react';
import indexedDBService from '../db/IndexedDBService.client';

/**
 * Custom hook for working with entity data in IndexedDB
 * @param {string} entityType - The type of entity (conversations, memory, settings)
 * @returns {Object} - Methods and state for working with the entity
 */
const useIndexedDB = (entityType: string): object => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load items on mount and when entityType changes
  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await indexedDBService.getAll(entityType);
      setItems(data);
    } catch (err) {
      console.error(`Error loading ${entityType}:`, err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [entityType]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Get an item by ID
  const getById = useCallback(async (id) => {
    try {
      return await indexedDBService.getById(entityType, id);
    } catch (err) {
      console.error(`Error getting ${entityType} by ID:`, err);
      setError(err);
      return null;
    }
  }, [entityType]);

  // Find items by criteria
  const find = useCallback(async (criteria) => {
    try {
      return await indexedDBService.find(entityType, criteria);
    } catch (err) {
      console.error(`Error finding ${entityType}:`, err);
      setError(err);
      return [];
    }
  }, [entityType]);

  // Save an item
  const save = useCallback(async (item) => {
    try {
      const savedItem = await indexedDBService.save(entityType, item);
      
      // Update the local state
      setItems(prevItems => {
        const existingIndex = prevItems.findIndex(i => i.id === item.id);
        if (existingIndex >= 0) {
          return prevItems.map(i => i.id === item.id ? savedItem : i);
        } else {
          return [...prevItems, savedItem];
        }
      });
      
      return savedItem;
    } catch (err) {
      console.error(`Error saving ${entityType}:`, err);
      setError(err);
      throw err;
    }
  }, [entityType]);

  // Update an item
  const update = useCallback(async (id, updates) => {
    try {
      const updatedItem = await indexedDBService.update(entityType, id, updates);
      
      if (updatedItem) {
        setItems(prevItems => 
          prevItems.map(item => item.id === id ? updatedItem : item)
        );
      }
      
      return updatedItem;
    } catch (err) {
      console.error(`Error updating ${entityType}:`, err);
      setError(err);
      throw err;
    }
  }, [entityType]);

  // Delete an item
  const remove = useCallback(async (id) => {
    try {
      const deleted = await indexedDBService.delete(entityType, id);
      
      if (deleted) {
        setItems(prevItems => prevItems.filter(item => item.id !== id));
      }
      
      return deleted;
    } catch (err) {
      console.error(`Error deleting ${entityType}:`, err);
      setError(err);
      throw err;
    }
  }, [entityType]);

  // Clear all items for this entity type
  const clear = useCallback(async () => {
    try {
      await indexedDBService.clear(entityType);
      setItems([]);
    } catch (err) {
      console.error(`Error clearing ${entityType}:`, err);
      setError(err);
      throw err;
    }
  }, [entityType]);

  // Refresh data from the database
  const refresh = useCallback(() => {
    return loadItems();
  }, [loadItems]);

  return {
    items,
    loading,
    error,
    getById,
    find,
    save,
    update,
    remove,
    clear,
    refresh
  };
};

export default useIndexedDB;