import React from 'react'
import { ClickableTile } from '../clickable_tile'

type ListProps = {
	items: [title: any, description: string, url: string]
}

export function TwoColumnList(props: ListProps) {
	return (
		<div className="two_column_home_list">
			{props.items.map((item, index) => (
				<ClickableTile
					key={index}
					title={item.title}
					description={item.description}
					url={item.url}
					background={item.background}
				/>
			))}
		</div>
	)
}
