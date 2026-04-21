// src/components/Shared/PriorityBadge.jsx
import { priorityColors } from '../../utils/priorityColor.js';

/**
 * Colored badge showing task priority level.
 * @param {{ priority: 'low'|'medium'|'high'|'critical' }} props
 */
const PriorityBadge = ({ priority }) => {
  const { bg, label } = priorityColors(priority);
  return (
    <span className={`priority-badge ${bg}`}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
      {label}
    </span>
  );
};

export default PriorityBadge;
