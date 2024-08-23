import React from 'react'
import Link from '@docusaurus/Link'

type TitleProps = {
	title: string
	link_text: string
	link_url: string
}

export function ViewAllLink(props: TitleProps) {
	return (
		<Link href={props.link_url} target="_self" className="view_all_link">
			{props.link_text}
		</Link>
	)
}
