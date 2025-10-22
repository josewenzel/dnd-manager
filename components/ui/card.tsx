import { cn } from "@/lib/utils"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = ({ className, ...props }: CardProps) => (
  <div
    className={cn("rounded-lg border border-gray-300 bg-white shadow-sm", className)}
    {...props}
  />
)
Card.displayName = "Card"

const CardHeader = ({ className, ...props }: CardProps) => (
  <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
)
CardHeader.displayName = "CardHeader"

const CardTitle = ({ className, ...props }: CardProps) => (
  <h2 className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
)
CardTitle.displayName = "CardTitle"

const CardDescription = ({ className, ...props }: CardProps) => (
  <p className={cn("text-sm text-muted-foreground", className)} {...props} />
)
CardDescription.displayName = "CardDescription"

const CardContent = ({ className, ...props }: CardProps) => (
  <div className={cn("p-6 pt-0", className)} {...props} />
)
CardContent.displayName = "CardContent"

const CardFooter = ({ className, ...props }: CardProps) => (
  <div
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
