// src/components/Shared/LoadingSpinner.jsx

/**
 * @param {{ size?: 'sm'|'md'|'lg', fullscreen?: boolean }} props
 */
const LoadingSpinner = ({ size = 'md', fullscreen = false }) => {
  const sizeClass = size === 'sm' ? 'spinner-sm' : size === 'lg' ? 'spinner-lg' : '';
  if (fullscreen) {
    return (
      <div className="loading-screen">
        <div className={`spinner ${sizeClass}`} />
        <span className="text-secondary text-sm">Loading…</span>
      </div>
    );
  }
  return <div className={`spinner ${sizeClass}`} />;
};

export default LoadingSpinner;
