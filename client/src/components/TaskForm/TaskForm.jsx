import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import Input from '../Input/Input';
import AIBreakdownPanel from '../AIBreakdownPanel/AIBreakdownPanel';
import { createTask, updateTask } from '../../features/tasks/tasksSlice';
import { PRIORITIES, STATUSES } from '../../utils/constants';
import styles from './TaskForm.module.css';

const INITIAL_STATE = {
  title: '',
  description: '',
  priority: 'Medium',
  status: 'todo',
  dueDate: '',
};

/**
 * TaskForm — modal form to create or edit a task.
 * When task prop is provided, it's in edit mode. Otherwise create mode.
 */
export default function TaskForm({ boardId, task, isOpen, onClose, defaultStatus }) {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.tasks);

  const [form, setForm] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState({});
  const [showAI, setShowAI] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'Medium',
        status: task.status || 'todo',
        dueDate: task.dueDate ? task.dueDate.substring(0, 10) : '',
      });
    } else {
      setForm({ ...INITIAL_STATE, status: defaultStatus || 'todo' });
    }
    setErrors({});
    setShowAI(false);
  }, [task, isOpen, defaultStatus]);

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (form.title.trim().length > 200) errs.title = 'Title must be under 200 characters';
    if (form.description.length > 1000) errs.description = 'Description must be under 1000 characters';
    return errs;
  };

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }, [errors]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    const payload = {
      ...form,
      dueDate: form.dueDate || null,
      board: boardId,
    };

    try {
      if (task) {
        await dispatch(updateTask({ id: task._id, data: payload })).unwrap();
        toast.success('Task updated!');
      } else {
        await dispatch(createTask({ boardId, data: payload })).unwrap();
        toast.success('Task created!');
      }
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Something went wrong');
    }
  };

  /**
   * Called by AIBreakdownPanel when user clicks "Add selected".
   * Creates each selected subtask on the board.
   */
  const handleAddAITasks = useCallback(async (subtasks) => {
    if (!subtasks.length) return;
    let created = 0;
    for (const st of subtasks) {
      try {
        await dispatch(
          createTask({
            boardId,
            data: {
              title: st.title,
              priority: st.priority || 'Medium',
              status: form.status || 'todo',
              description: '',
              dueDate: null,
              board: boardId,
            },
          })
        ).unwrap();
        created++;
      } catch {
        // continue even if one fails
      }
    }
    toast.success(`${created} task${created !== 1 ? 's' : ''} created from AI suggestions!`);
    onClose();
  }, [dispatch, boardId, form.status, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? 'Edit Task' : 'Add Task'}
      size="md"
    >
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {/* Title */}
        <Input
          label="Title *"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="What needs to be done?"
          error={errors.title}
          autoFocus
        />

        {/* Description */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Optional details..."
            rows={3}
            className={`${styles.textarea} ${errors.description ? styles.textareaError : ''}`}
          />
          {errors.description && <p className={styles.errorMsg}>{errors.description}</p>}
        </div>

        {/* Priority & Status row */}
        <div className={styles.row}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Priority</label>
            <select name="priority" value={form.priority} onChange={handleChange} className={styles.select}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Status</label>
            <select name="status" value={form.status} onChange={handleChange} className={styles.select}>
              {STATUSES.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Due date */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Due Date</label>
          <input
            type="date"
            name="dueDate"
            value={form.dueDate}
            onChange={handleChange}
            className={styles.dateInput}
          />
        </div>

        {/* AI breakdown toggle (only on create) */}
        {!task && (
          <div className={styles.aiSection}>
            <button
              type="button"
              className={styles.aiToggle}
              onClick={() => setShowAI((v) => !v)}
            >
              ✨ {showAI ? 'Hide' : 'Generate subtasks with AI'}
            </button>
            {showAI && (
              <AIBreakdownPanel onAddTasks={handleAddAITasks} />
            )}
          </div>
        )}

        {/* Actions */}
        <div className={styles.actions}>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {task ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
