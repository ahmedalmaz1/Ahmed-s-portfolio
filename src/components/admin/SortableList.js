"use client";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";

function Row({ id, children }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id });
  const handle = (
    <button
      type="button"
      ref={setActivatorNodeRef}
      aria-label="Drag to reorder"
      // touch-none: the handle must not scroll the page, so touch dragging works on phones
      className="grid size-10 shrink-0 cursor-grab touch-none place-items-center rounded-lg text-mute hover:bg-panel2 hover:text-ink active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
        <circle cx="5" cy="3" r="1.4" /><circle cx="11" cy="3" r="1.4" />
        <circle cx="5" cy="8" r="1.4" /><circle cx="11" cy="8" r="1.4" />
        <circle cx="5" cy="13" r="1.4" /><circle cx="11" cy="13" r="1.4" />
      </svg>
    </button>
  );
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-xl border border-line bg-panel ${isDragging ? "relative z-10 shadow-2xl ring-1 ring-white/20" : ""}`}
    >
      {children(handle)}
    </li>
  );
}

/**
 * Drag-and-drop (mouse, touch, keyboard) vertical list.
 * items need an `id`; renderItem(item, handle) must place `handle` somewhere in the row.
 * onReorder(newItems) is called once, after the drop.
 */
export default function SortableList({ items, onReorder, renderItem }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd({ active, over }) {
    if (!over || active.id === over.id) return;
    const from = items.findIndex((i) => i.id === active.id);
    const to = items.findIndex((i) => i.id === over.id);
    onReorder(arrayMove(items, from, to));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <ul className="space-y-2">
          {items.map((item) => (
            <Row key={item.id} id={item.id}>
              {(handle) => renderItem(item, handle)}
            </Row>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
