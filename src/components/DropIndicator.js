import React from 'react'

const DropIndicator = ({ edge, style }) => {
	const edgeClassMap = {
		top: 'edge-top',
		bottom: 'edge-bottom',
	}

	const edgeClass = edgeClassMap[edge]

	return <div className={`drop-indicator ${edgeClass}`} an></div>
}

export default DropIndicator
