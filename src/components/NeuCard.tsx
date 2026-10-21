import type { HTMLAttributes, ReactNode } from 'react'

type NeuCardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  inset?: boolean
  interactive?: boolean
}

export function NeuCard({ children, className = '', inset = false, interactive = false, ...props }: NeuCardProps) {
  return (
    <div
      className={`neu-card ${inset ? 'neu-inset' : ''} ${interactive ? 'neu-interactive' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
