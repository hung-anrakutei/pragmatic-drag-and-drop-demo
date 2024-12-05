import { attachClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge' // NEW
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine' // NEW
import {
	draggable,
	dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { useEffect, useRef, useState } from 'react'
import invariant from 'tiny-invariant'
const Card = ({ children, ...card }) => {
	const cardRef = useRef(null)
	const [isDragging, setIsDragging] = useState(false)

	useEffect(() => {
		const cardEl = cardRef.current
		invariant(cardEl, 'Card element is missing.')

		return combine(
			draggable({
				element: cardEl,
				getInitialData: () => ({
					type: 'card',
					cardId: card.id,
				}),
				onDragStart: () => setIsDragging(true),
				onDrop: () => setIsDragging(false),
			}),
			dropTargetForElements({
				element: cardEl,
				getData: ({ input, element }) => {
					// To attach card data to a drop target
					const data = { type: 'card', cardId: card.id }

					// Attaches the closest edge (top or bottom) to the data object
					// This data will be used to determine where to drop card relative
					// to the target card.
					return attachClosestEdge(data, {
						input,
						element,
						allowedEdges: ['top', 'bottom'],
					})
				},
				getIsSticky: () => true, // To make a drop target "sticky"
				onDragEnter: (args) => {
					if (args.source.data.cardId !== card.id) {
						console.log('onDragEnter', args)
					}
				},
			})
		)
	}, [card.id])

	return (
		<div className={`card ${isDragging ? 'dragging' : ''}`} ref={cardRef}>
			{children}
		</div>
	)
}

export default Card
