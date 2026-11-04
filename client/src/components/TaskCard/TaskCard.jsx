import React, { memo } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import styles from './TaskCard.module.css';
import { PRIORITY_COLORS } from '../../utils/constants';

/**
 * Formats a date string to a readable locale format.
 */
function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Returns true if the given date string is in the past.
 */
function isOverdue(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date(new Date().toDateString());
}

/**
 * TaskCard — a draggable task card for the Kanban board.
 *
 * @param {Object}   task     - Task data object
 * @param {number}   index    - Draggable index within its column
 * @param {Function} onEdit   - Called with the task when edit is triggered
 * @param {Function} onDelete - Called with the task _id when delete is triggered
 */
const TaskCard = memo(function TaskCard({ task, index, onEdit, onDelete }) {
  const priorityColor = PRIORITY_COLORS[task.priority] || '#94a3b8';
  const dueDate = formatDate(task.dueDate);
  const overdue = isOverdue(task.dueDate);

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <article
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={[
            styles.card,
            snapshot.isDragging ? styles.dragging : '',
          ].join(' ')}
          aria-label={`Task: ${task.title}`}
        >
          {/* Priority indicator bar */}
          <div
            className={styles.priorityBar}
            style={{ background: priorityColor }}
            aria-hidden="true"
          />

          <div className={styles.content}>
            {/* Header: title + actions */}
            <div className={styles.header}>
              <h3 className={styles.title}>{task.title}</h3>
              <div className={styles.actions}>
                <button
                  className={styles.iconBtn}
                  onClick={() => onEdit(task)}
                  aria-label={`Edit task: ${task.title}`}
                  title="Edit task"
                >
                  ✏️
                </button>
                <button
                  className={[styles.iconBtn, styles.deleteBtn].join(' ')}
                  onClick={() => onDelete(task._id)}
                  aria-label={`Delete task: ${task.title}`}
                  title="Delete task"
                >
                  🗑️
                </button>
              </div>
            </div>

            {/* Description preview */}
            {task.description && (
              <p className={styles.description}>{task.description}</p>
            )}

            {/* Footer: badges */}
            <div className={styles.footer}>
              {/* Priority badge */}
              {task.priority && (
                <span
                  className={styles.badge}
                  style={{
                    background: `${priorityColor}20`,
                    color: priorityColor,
                    border: `1px solid ${priorityColor}40`,
                  }}
                >
                  {task.priority}
                </span>
              )}

              {/* Status badge */}
              {task.status && (
                <span className={[styles.badge, styles.statusBadge].join(' ')}>
                  {task.status === 'in-progress'
                    ? 'In Progress'
                    : task.status === 'done'
                    ? '✓ Done'
                    : 'To Do'}
                </span>
              )}

              {/* Due date */}
              {dueDate && (
                <span
                  className={[
                    styles.dueDate,
                    overdue ? styles.overdue : '',
                  ].join(' ')}
                  title={overdue ? 'Overdue!' : `Due: ${dueDate}`}
                >
                  📅 {dueDate}
                  {overdue && ' ⚠'}
                </span>
              )}
            </div>
          </div>
        </article>
      )}
    </Draggable>
  );
});

export default TaskCard;
