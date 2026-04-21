// src/hooks/useTasks.js
import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { fetchTasks, createTask, updateTask, deleteTask } from '../api/tasks.js';

const MOCK_TASKS = [
  { id: '1', title: 'Design Landing Page', description: 'Create a high-fidelity mockup for the new homepage.', status: 'in_progress', priority: 'high', deadline: new Date(Date.now() + 86400000).toISOString(), created_at: new Date().toISOString(), assignee: { full_name: 'Dev User' } },
  { id: '2', title: 'Setup Supabase Schema', description: 'Initialize the database tables and RLS policies.', status: 'todo', priority: 'critical', deadline: new Date(Date.now() + 172800000).toISOString(), created_at: new Date().toISOString() },
  { id: '3', title: 'Implement JWT Auth', description: 'Add express middleware and JWT helpers.', status: 'done', priority: 'medium', created_at: new Date().toISOString(), assignee: { full_name: 'Dev User' } },
];

/**
 * Hook for managing task list state with CRUD operations.
 * @param {object} initialFilters - { teamId, status, priority, assignee }
 */
export const useTasks = (initialFilters = {}) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState(initialFilters);

  const load = useCallback(async (overrideFilters) => {
    if (import.meta.env.VITE_DEV_BYPASS === 'true') {
      setTasks(MOCK_TASKS);
      return;
    }
    setLoading(true);
    try {
      const { data } = await fetchTasks(overrideFilters ?? filters);
      setTasks(data.tasks);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const create = useCallback(async (taskData) => {
    try {
      const { data } = await createTask(taskData);
      setTasks((prev) => [data.task, ...prev]);
      toast.success('Task created!');
      return data.task;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create task.');
    }
  }, []);

  const update = useCallback(async (id, updates) => {
    try {
      const { data } = await updateTask(id, updates);
      setTasks((prev) => prev.map((t) => t.id === id ? data.task : t));
      toast.success('Task updated!');
      return data.task;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update task.');
    }
  }, []);

  const remove = useCallback(async (id) => {
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      toast.success('Task deleted.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete task.');
    }
  }, []);

  return { tasks, loading, filters, setFilters, load, create, update, remove };
};
