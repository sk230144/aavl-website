import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'

type CommonProps = {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'quiet'
  className?: string
}

type LinkProps = CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: never }

export function NeuButton(props: LinkProps | ButtonProps) {
  const { children, variant = 'secondary', className = '', ...rest } = props
  const classes = `neu-button neu-button--${variant} ${className}`

  if ('href' in rest && rest.href) {
    const { href, ...anchorProps } = rest
    return (
      <a href={href} className={classes} {...anchorProps}>
        {children}
      </a>
    )
  }

  const buttonProps = rest as ButtonHTMLAttributes<HTMLButtonElement>
  return (
    <button {...buttonProps} className={classes}>
      {children}
    </button>
  )
}
