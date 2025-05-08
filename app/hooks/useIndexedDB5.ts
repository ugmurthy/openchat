// useIndexedDB.ts
import { useState, useEffect, useCallback } from 'react';
import indexedDBService, { IndexedDBService } from '../db/indexedDBService3.client';

/**
 * Custom hook for working with entity data in IndexedDB
 * @param {string} entityType - The type of entity (conversations, memory, settings)
 * @param {IndexedDBService} dbService - Optional custom IndexedDBService instance 
 * @returns {Object} - Methods and state for working with the entity
 */
const useIndexedDB = (entityType: string, dbService = indexedDBService) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load items on mount and when entityType changes
  const loadItems = useCallback(async () => {
    console.log("Loading items for entity type:", entityType);
    setLoading(true);
    setError(null);
    
    try {
      const data = await dbService.getAll(entityType);
      setItems(data);
    } catch (err) {
      console.error(`Error loading ${entityType}:`, err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [entityType, dbService]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Get an item by ID
  const getById = useCallback(async (id) => {
    try {
      return await dbService.getById(entityType, id);
    } catch (err) {
      console.error(`Error getting ${entityType} by ID:`, err);
      setError(err);
      return null;
    }
  }, [entityType, dbService]);

  // Find items by criteria
  const find = useCallback(async (criteria) => {
    try {
      return await dbService.find(entityType, criteria);
    } catch (err) {
      console.error(`Error finding ${entityType}:`, err);
      setError(err);
      return [];
    }
  }, [entityType, dbService]);
  
  // Find items by index range
  const findByRange = useCallback(async (indexName, range) => {
    try {
      return await dbService.findByRange(entityType, indexName, range);
    } catch (err) {
      console.error(`Error finding ${entityType} by range:`, err);
      setError(err);
      return [];
    }
  }, [entityType, dbService]);
  
  // Find recent items using the createdAt or updatedAt index
  const findRecent = useCallback(async (limit = 10, useUpdatedAt = false) => {
    try {
      const indexName = useUpdatedAt ? 'updatedAt' : 'createdAt';
      const results = await dbService.findWithCursor(
        entityType,
        indexName,
        null, // No range, get all
        () => true // No filtering
      );
      if (limit===1) return results[0];
      // Sort by date descending (newest first)
      results.sort((a, b) => {
        const dateA = new Date(a[indexName]).getTime();
        const dateB = new Date(b[indexName]).getTime();
        return dateB - dateA;
      });
      
      // Return only the requested number of items
      return results.slice(0, limit);
    } catch (err) {
      console.error(`Error finding recent ${entityType}:`, err);
      setError(err);
      return [];
    }
  }, [entityType, dbService]);
  
  // Find items with advanced filtering using a cursor
  const findWithFilter = useCallback(async (indexName, range, filterFn) => {
    try {
      return await dbService.findWithCursor(entityType, indexName, range, filterFn);
    } catch (err) {
      console.error(`Error finding ${entityType} with filter:`, err);
      setError(err);
      return [];
    }
  }, [entityType, dbService]);

  // Save an item
  const save = useCallback(async (item) => {
    try {
      const savedItem = await dbService.save(entityType, item);
      
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
  }, [entityType, dbService]);

  // Update an item
  const update = useCallback(async (id, updates) => {
    try {
      const updatedItem = await dbService.update(entityType, id, updates);
      
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
  }, [entityType, dbService]);

  // Delete an item
  const remove = useCallback(async (id) => {
    try {
      const deleted = await dbService.delete(entityType, id);
      
      if (deleted) {
        setItems(prevItems => prevItems.filter(item => item.id !== id));
      }
      
      return deleted;
    } catch (err) {
      console.error(`Error deleting ${entityType}:`, err);
      setError(err);
      throw err;
    }
  }, [entityType, dbService]);

  // Clear all items for this entity type
  const clear = useCallback(async () => {
    try {
      console.log("Clearing ",entityType)
      await dbService.clear(entityType);
      setItems([]);
    } catch (err) {
      console.error(`Error clearing ${entityType}:`, err);
      setError(err);
      throw err;
    }
  }, [entityType, dbService]);

  // Refresh data from the database
  const refresh = useCallback(() => {
    return loadItems();
  }, [loadItems]);

  return {
    items, //all items of the entity type
    loading, // loading state
    error, // 
    getById, // get item by ID
    find, // find items by criteria
    findByRange, // find items by index range
    findRecent, // find recent items
    findWithFilter, // find items with advanced filtering
    save, // save an item
    update, // update an item
    remove, // delete an item
    clear,  // clear all items
    refresh // refresh data from the database
  };
};

export default useIndexedDB;

