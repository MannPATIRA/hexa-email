export default function Button({ children, onClick, variant = 'primary', className = '', ...props }) {
  const baseStyles = 'px-3 py-1.5 rounded-sm text-sm font-semibold transition-all duration-150 active:scale-[0.98] focus-visible:ring-1 focus-visible:ring-outlook-blue focus-visible:ring-offset-1'
  const variants = {
    primary: 'bg-outlook-blue text-white hover:bg-outlook-blue-hover shadow-sm',
    secondary: 'bg-outlook-hover text-outlook-text hover:bg-outlook-border',
    danger: 'bg-error text-white hover:bg-red-700 shadow-sm',
    ghost: 'bg-transparent text-outlook-text hover:bg-outlook-hover'
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

