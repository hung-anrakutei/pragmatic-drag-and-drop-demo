import {
	attachClosestEdge,
	extractClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge' // NEW
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine' // NEW
import {
	draggable,
	dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { useEffect, useRef, useState } from 'react'
import invariant from 'tiny-invariant'
import DropIndicator from './DropIndicator'

const Card = ({ children, ...card }) => {
	const cardRef = useRef(null)
	const [isDragging, setIsDragging] = useState(false)
	// State to track the closest edge during drag over
	const [closestEdge, setClosestEdge] = useState(null)

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
						setClosestEdge(extractClosestEdge(args.self.data))
					}
				},
				onDrag: (args) => {
					// Continuously update the closest edge while dragging over the drop zone
					if (args.source.data.cardId !== card.id) {
						setClosestEdge(extractClosestEdge(args.self.data))
					}
				},
				onDragLeave: () => {
					// Reset the closest edge when the draggable item leaves the drop zone
					setClosestEdge(null)
				},
				onDrop: () => {
					// Reset the closest edge when the draggable item is dropped
					setClosestEdge(null)
				},
			})
		)
	}, [card.id])

	return (
		<div className={`card ${isDragging ? 'dragging' : ''}`} ref={cardRef}>
			{children}
			{closestEdge && (
				<DropIndicator edge={closestEdge} style={{ gap: '8px' }} />
			)}
		</div>
	)
}

export default Card
