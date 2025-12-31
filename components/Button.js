export default function Button({ children, onClick, variant = 'primary', className = '', ...props }) {
  const baseStyles = 'px-4 py-2 rounded font-medium transition-all duration-200 active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2'
  const variants = {
    primary: 'bg-outlook-blue text-white hover:bg-blue-700 hover:shadow-md',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 hover:shadow-sm',
    danger: 'bg-error text-white hover:bg-red-700 hover:shadow-md',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100'
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

