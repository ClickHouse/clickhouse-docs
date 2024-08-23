import React from 'react'
import Link from '@docusaurus/Link'

type ButtonProps = {
	title: string
	description: string
	url: string
	background: string
}

export function ClickableTile(props: ButtonProps) {
	const { title, description, url, background } = props
	return (
		<>
			<Link href={url} target="_self" className="clickable_tile">
				<h4 className="title">{title}</h4>
				<p className="description">{description}</p>
				{background ? (
					<img
						src={`/docs/img/bg_${background}.svg`}
						alt={title}
						className="clickable_tile_bg"
					></img>
				) : (
					<span></span>
				)}
			</Link>
		</>
	)
}
