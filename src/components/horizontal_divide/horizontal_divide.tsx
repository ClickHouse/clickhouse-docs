import React from 'react'

export type HorizontalDivideProps = {
	size?: string
}

export const HorizontalDivide = ({ ...HorizontalDivideProps }) => {
	return (
		<>
			<hr className="divide" />
		</>
	)
}
