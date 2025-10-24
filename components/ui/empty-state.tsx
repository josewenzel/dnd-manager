interface EmptyStateProps {
  message: string
  className?: string
}

export function EmptyState({ message, className = "py-8" }: EmptyStateProps) {
  return (
    <div className={`text-center text-gray-400 ${className}`}>
      <p className="text-sm">{message}</p>
    </div>
  )
}
