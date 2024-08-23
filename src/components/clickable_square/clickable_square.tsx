import React from 'react'
import Link from '@docusaurus/Link'

type ButtonProps = {
	title: string
	url: string
}

export function ClickableSquare(props: ButtonProps) {
	const { title, url } = props
	return (
		<>
			<Link href={url} target="_self" className="clickable_square">
				<img src={`/docs/img/integrations/logo_${title}.svg`} alt={title} />
			</Link>
		</>
	)
}
