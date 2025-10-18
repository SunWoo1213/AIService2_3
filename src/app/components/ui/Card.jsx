export default function Card({ 
  children, 
  title, 
  className = '',
  onClick,
  hover = false 
}) {
  const hoverClass = hover ? 'hover:shadow-xl cursor-pointer transform hover:-translate-y-1' : 'hover:shadow-lg';
  
  return (
    <div 
      className={`card ${hoverClass} ${className}`}
      onClick={onClick}
    >
      {title && (
        <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
      )}
      {children}
    </div>
  );
}

