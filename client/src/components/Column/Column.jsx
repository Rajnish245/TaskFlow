import React, { memo, useCallback } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import TaskCard from '../TaskCard/TaskCard';
import styles from './Column.module.css';

/** Map column IDs to human-readable labels */
const COLUMN_LABELS = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'done': 'Done',
};

/** Color accent per column */
const COLUMN_COLORS = {
  'todo': '#6366f1',
  'in-progress': '#f59e0b',
  'done': '#22c55e',
};

/**
 * Column — a Droppable Kanban column.
 * Wrapped in React.memo so it only re-renders when its tasks change.
 */
const Column = memo(function Column({ columnId, tasks, onAddTask, onEditTask, onDeleteTask }) {
  const label = COLUMN_LABELS[columnId] || columnId;
  const accentColor = COLUMN_COLORS[columnId] || '#6366f1';

  const handleAddTask = useCallback(() => {
    onAddTask(columnId);
  }, [onAddTask, columnId]);

  return (
    <div className={styles.column}>
      {/* Column header */}
      <div className={styles.header} style={{ borderTopColor: accentColor }}>
        <div className={styles.titleRow}>
          <span className={styles.title}>{label}</span>
          <span className={styles.count} style={{ backgroundColor: accentColor }}>
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Droppable task list */}
      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`${styles.taskList} ${snapshot.isDraggingOver ? styles.draggingOver : ''}`}
          >
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className={styles.emptyState}>
                <span>No tasks yet</span>
              </div>
            )}
            {tasks.map((task, index) => (
              <TaskCard
                key={task._id}
                task={task}
                index={index}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Add task button */}
      <button className={styles.addBtn} onClick={handleAddTask}>
        <span className={styles.addIcon}>+</span>
        Add Task
      </button>
    </div>
  );
});

export default Column;
