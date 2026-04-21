// src/hooks/useRealtime.js
import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

/**
 * Subscribes to Supabase Realtime postgres_changes for a given table/filter.
 *
 * @param {object} opts
 * @param {string}   opts.channelName  - Unique channel identifier
 * @param {string}   opts.table        - Table to watch
 * @param {string}   [opts.filter]     - Optional filter e.g. "task_id=eq.abc"
 * @param {Function} opts.onInsert     - Callback for INSERT events
 * @param {Function} [opts.onUpdate]   - Callback for UPDATE events
 * @param {Function} [opts.onDelete]   - Callback for DELETE events
 * @param {boolean}  [opts.enabled]    - Whether to subscribe (default true)
 */
export const useRealtime = ({
  channelName,
  table,
  filter,
  onInsert,
  onUpdate,
  onDelete,
  enabled = true,
}) => {
  useEffect(() => {
    if (!enabled) return;

    const config = { event: '*', schema: 'public', table };
    if (filter) config.filter = filter;

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { ...config, event: 'INSERT' }, (p) => onInsert?.(p.new))
      .on('postgres_changes', { ...config, event: 'UPDATE' }, (p) => onUpdate?.(p.new))
      .on('postgres_changes', { ...config, event: 'DELETE' }, (p) => onDelete?.(p.old))
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [channelName, table, filter, enabled]);
};
