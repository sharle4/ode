'use client'

import { useId, useState, useEffect } from 'react';

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { CSS } from '@dnd-kit/utilities'
import { DotsSixVertical, Trash } from '@phosphor-icons/react'

export interface SortableItem {
    id: string
    label: string
    sublabel?: string
}

interface SortableListProps {
    items: SortableItem[]
    onReorder: (items: SortableItem[]) => void
    onRemove: (id: string) => void
    emptyMessage?: string
}

function SortableRow({ item, onRemove }: { item: SortableItem; onRemove: (id: string) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
    }

    return (
        <li
            ref={setNodeRef}
            style={style}
            className={`flex items-center gap-3 rounded-lg border px-4 py-3 transition-all ${
                isDragging
                    ? 'border-accent/60 bg-cream shadow-lg shadow-accent/10'
                    : 'border-soft-border bg-paper hover:border-charcoal/20'
            }`}
        >
            <button
                className="cursor-grab touch-none text-warm-gray/70 hover:text-charcoal active:cursor-grabbing"
                {...attributes}
                {...listeners}
            >
                <DotsSixVertical weight="bold" size={20} />
            </button>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-charcoal truncate">{item.label}</p>
                {item.sublabel && (
                    <p className="text-xs text-warm-gray truncate">{item.sublabel}</p>
                )}
            </div>

            <button
                onClick={() => onRemove(item.id)}
                className="rounded-md p-1.5 text-warm-gray/70 transition-colors hover:bg-red-500/10 hover:text-red-500"
                title="Retirer"
            >
                <Trash size={16} weight="bold" />
            </button>
        </li>
    )
}

export default function SortableList({ items, onReorder, onRemove, emptyMessage = 'Aucun élément sélectionné' }: SortableListProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    const dndId = useId();

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (over && active.id !== over.id) {
            const oldIndex = items.findIndex(i => i.id === active.id)
            const newIndex = items.findIndex(i => i.id === over.id)
            onReorder(arrayMove(items, oldIndex, newIndex))
        }
    }

    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (items.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-soft-border px-6 py-12 text-center">
                <p className="text-sm text-warm-gray/70">{emptyMessage}</p>
            </div>
        )
    }

    if (!isMounted) return null;

    return (
        <DndContext
            id={dndId}
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
        >
            <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                <ul className="flex flex-col gap-2">
                    {items.map((item, idx) => (
                        <div key={item.id} className="flex items-center gap-2">
                            <span className="w-6 text-center text-xs font-mono text-warm-gray/70">
                                {idx + 1}
                            </span>
                            <div className="flex-1">
                                <SortableRow item={item} onRemove={onRemove} />
                            </div>
                        </div>
                    ))}
                </ul>
            </SortableContext>
        </DndContext>
    )
}
