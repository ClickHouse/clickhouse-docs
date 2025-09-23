import React, { HTMLAttributes } from 'react'
import styles from './styles.module.scss'

type CardComponent = React.FunctionComponent<HTMLAttributes<HTMLDivElement>> & {
  Header: React.FunctionComponent<HTMLAttributes<HTMLDivElement>>
  Body: React.FunctionComponent<HTMLAttributes<HTMLDivElement>>
  Footer: React.FunctionComponent<HTMLAttributes<HTMLDivElement>>
}

const CUICard: CardComponent = ({
  children,
  className,
  ...props
}): JSX.Element => (
  <div
    className={styles.cuiCard}
    {...props}>
    {children}
  </div>
)

const Header = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={styles.cardHeader} {...props}>
    {children}
  </div>
)

CUICard.Header = Header

const Body = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={styles.cardBody} {...props}>
    {children}
  </div>
)
CUICard.Body = Body

const Footer = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={styles.cardFooter} {...props}>
    {children}
  </div>
)
CUICard.Footer = Footer

export default CUICard