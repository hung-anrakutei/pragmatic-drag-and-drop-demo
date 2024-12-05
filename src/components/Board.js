import { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index' //NEW
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder'
import { useCallback, useEffect, useState } from 'react'
import { BOARD_COLUMNS } from '../constant'
import Column from './Column'

const Board = () => {
	const [columnsData, setColumnsData] = useState(BOARD_COLUMNS)

	const reorderCard = useCallback(
		({ columnId, startIndex, finishIndex }) => {
			// Get the source column data
			const sourceColumnData = columnsData[columnId]

			// Call the reorder function to get a new array
			// of cards with the moved card's new position
			const updatedItems = reorder({
				list: sourceColumnData.cards,
				startIndex,
				finishIndex,
			})

			// Create a new object for the source column
			// with the updated list of cards
			const updatedSourceColumn = {
				...sourceColumnData,
				cards: updatedItems,
			}

			// Update columns state
			setColumnsData({
				...columnsData,
				[columnId]: updatedSourceColumn,
			})
		},
		[columnsData]
	)

	const moveCard = useCallback(
		({
			movedCardIndexInSourceColumn,
			sourceColumnId,
			destinationColumnId,
			movedCardIndexInDestinationColumn,
		}) => {
			// Get data of the source column
			const sourceColumnData = columnsData[sourceColumnId]

			// Get data of the destination column
			const destinationColumnData = columnsData[destinationColumnId]

			// Identify the card to move
			const cardToMove =
				sourceColumnData.cards[movedCardIndexInSourceColumn]

			// Remove the moved card from the source column
			const newSourceColumnData = {
				...sourceColumnData,
				cards: sourceColumnData.cards.filter(
					(card) => card.id !== cardToMove.id
				),
			}

			// Create a copy of the destination column's cards array
			const newDestinationCards = Array.from(destinationColumnData.cards)

			// Determine the new index in the destination column
			const newIndexInDestination = movedCardIndexInDestinationColumn ?? 0

			// Insert the moved card into the new index in the destination column
			newDestinationCards.splice(newIndexInDestination, 0, cardToMove)

			// Create new destination column data with the moved card
			const newFinishColumnData = {
				...destinationColumnData,
				cards: newDestinationCards,
			}

			// Update the state with the new columns data
			setColumnsData({
				...columnsData,
				[sourceColumnId]: newSourceColumnData,
				[destinationColumnId]: newFinishColumnData,
			})
		},
		[columnsData]
	)

	const handleDrop = useCallback(
		({ source, location }) => {
			// Logic to handle the drop event will be added here
			// console.log('handleDrop', source, location, columnsData)

			const destination = location.current.dropTargets.length

			if (!destination) {
				return
			}

			if (source.data.type === 'card') {
				// Retrieve the ID of the card being dragged
				const draggedCardId = source.data.cardId
				console.log('draggedCardId', draggedCardId)
				// Get the source column from the initial drop targets
				const [, sourceColumnRecord] = location.initial.dropTargets

				// Retrieve the ID of the source column
				const sourceColumnId = sourceColumnRecord.data.columnId
				console.log('sourceColumnId', sourceColumnId)

				// Get the data of the source column
				const sourceColumnData = columnsData[sourceColumnId]
				console.log('sourceColumnData', sourceColumnData)
				// Get the index of the card being dragged in the source column
				const draggedCardIndex = sourceColumnData.cards.findIndex(
					(card) => card.id === draggedCardId
				)
				console.log('draggedCardIndex', draggedCardIndex)

				if (location.current.dropTargets.length === 1) {
					console.log(
						'dropTargets1',
						location.current.dropTargets,
						location.current.dropTargets.length
					)

					const [destinationColumnRecord] =
						location.current.dropTargets

					const destinationColumnId =
						destinationColumnRecord.data.columnId
					console.log('destinationColumnId', destinationColumnId)

					if (sourceColumnId === destinationColumnId) {
						const destinationIndex = getReorderDestinationIndex({
							startIndex: draggedCardIndex,
							indexOfTarget: sourceColumnData.cards.length - 1,
							closestEdgeOfTarget: null,
							axis: 'vertical',
						})

						reorderCard({
							columnId: sourceColumnData.columnId,
							startIndex: draggedCardIndex,
							finishIndex: destinationIndex,
						})
						return
					}

					moveCard({
						movedCardIndexInSourceColumn: draggedCardIndex,
						sourceColumnId,
						destinationColumnId,
					})
					return
				}

				if (location.current.dropTargets.length === 2) {
					console.log(
						'dropTargets2',
						location.current.dropTargets,
						location.current.dropTargets.length
					)
				}
			}
		},
		[columnsData, reorderCard, moveCard]
	)

	useEffect(() => {
		return monitorForElements({
			onDrop: handleDrop,
		})
	}, [handleDrop])

	return (
		<div className='board'>
			{Object.keys(columnsData).map((columnId) => (
				<Column key={columnId} {...columnsData[columnId]} />
			))}
		</div>
	)
}

export default Board
