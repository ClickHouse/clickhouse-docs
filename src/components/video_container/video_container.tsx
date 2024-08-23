import React from 'react'

type VideoProps = {
	path: string
}

export function VideoContainer(props: VideoProps) {
	return (
		<div className="video_container">
			<iframe
				className="video"
				src={props.path}
				width="100%"
				height="551"
				frameBorder="0"
				allow="autoplay; fullscreen; picture-in-picture"
			></iframe>
		</div>
	)
}
