import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { DragDropContext } from '@hello-pangea/dnd';
import toast from 'react-hot-toast';
import {
  fetchTasks,
  updateTask,
  deleteTask,
  optimisticUpdateTask,
  rollbackTask,
  setFilter,
  selectTasks,
  selectTasksLoading,
  selectFilters,
} from '../../features/tasks/tasksSlice';
import { selectBoards } from '../../features/boards/boardsSlice';
import { fetchBoards } from '../../features/boards/boardsSlice';
import Navbar from '../../components/Navbar/Navbar';
import Column from '../../components/Column/Column';
import TaskForm from '../../components/TaskForm/TaskForm';
import Spinner from '../../components/Spinner/Spinner';
import useDebounce from '../../hooks/useDebounce';
import { STATUSES, PRIORITIES } from '../../utils/constants';
import styles from './BoardView.module.css';

/**
 * BoardView — the Kanban board page with drag-and-drop columns.
 */
export default function BoardView() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const tasks = useSelector(selectTasks);
  const loading = useSelector(selectTasksLoading);
  const filters = useSelector(selectFilters);
  const boards = useSelector(selectBoards);

  // Find the board title
  const board = boards.find((b) => b._id === boardId);

  // Local UI state
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [defaultStatus, setDefaultStatus] = useState('todo');
  const [searchInput, setSearchInput] = useState('');

  // Debounce search so we don't filter on every keystroke
  const debouncedSearch = useDebounce(searchInput, 400);

  // Sync debounced search to Redux filter
  useEffect(() => {
    dispatch(setFilter({ search: debouncedSearch }));
  }, [debouncedSearch, dispatch]);

  // Fetch tasks and boards on mount
  useEffect(() => {
    dispatch(fetchTasks(boardId));
    if (!boards.length) dispatch(fetchBoards());
  }, [boardId, dispatch, boards.length]);

  // Filter & sort tasks client-side using memoization
  const filteredTasks = useMemo(() => {
    let result = [...tasks];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((t) => t.title.toLowerCase().includes(q));
    }
    if (filters.priority) {
      result = result.filter((t) => t.priority === filters.priority);
    }
    if (filters.sort === 'dueDate_asc') {
      result.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
    } else if (filters.sort === 'dueDate_desc') {
      result.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(b.dueDate) - new Date(a.dueDate);
      });
    } else {
      // Default: sort by order then createdAt
      result.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || new Date(a.createdAt) - new Date(b.createdAt));
    }
    return result;
  }, [tasks, filters]);

  // Group tasks by status for each column
  const tasksByStatus = useMemo(() => {
    const grouped = {};
    STATUSES.forEach(({ key }) => {
      grouped[key] = filteredTasks.filter((t) => t.status === key);
    });
    return grouped;
  }, [filteredTasks]);

  /* ---- Drag and Drop ---- */
  const handleDragEnd = useCallback(async (result) => {
    const { destination, source, draggableId } = result;

    // No destination or dropped back in same spot
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    const task = tasks.find((t) => t._id === draggableId);
    if (!task) return;

    // Save previous state for rollback
    const previousTask = { ...task };

    // Optimistic update
    dispatch(optimisticUpdateTask({ id: draggableId, changes: { status: newStatus, order: destination.index } }));

    try {
      await dispatch(updateTask({ id: draggableId, data: { status: newStatus, order: destination.index } })).unwrap();
    } catch {
      // Rollback on failure
      dispatch(rollbackTask({ id: draggableId, task: previousTask }));
      toast.error('Failed to move task. Please try again.');
    }
  }, [dispatch, tasks]);

  /* ---- Task modal handlers ---- */
  const handleAddTask = useCallback((status) => {
    setEditingTask(null);
    setDefaultStatus(status);
    setTaskModalOpen(true);
  }, []);

  const handleEditTask = useCallback((task) => {
    setEditingTask(task);
    setTaskModalOpen(true);
  }, []);

  const handleDeleteTask = useCallback(async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await dispatch(deleteTask(taskId)).unwrap();
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  }, [dispatch]);

  const closeModal = useCallback(() => {
    setTaskModalOpen(false);
    setEditingTask(null);
  }, []);

  /* ---- Filter handlers ---- */
  const handlePriorityFilter = (e) => dispatch(setFilter({ priority: e.target.value }));
  const handleSortChange = (e) => dispatch(setFilter({ sort: e.target.value }));

  return (
    <div className={styles.page}>
      <Navbar />

      {/* Board toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <button className={styles.backBtn} onClick={() => navigate('/')} title="Back to boards">
            ← Back
          </button>
          <h1 className={styles.boardTitle}>{board?.title || 'Board'}</h1>
        </div>
        <div className={styles.toolbarRight}>
          {/* Search */}
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="🔍 Search tasks…"
            className={styles.searchInput}
          />
          {/* Priority filter */}
          <select
            value={filters.priority}
            onChange={handlePriorityFilter}
            className={styles.filterSelect}
          >
            <option value="">All priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          {/* Sort */}
          <select
            value={filters.sort}
            onChange={handleSortChange}
            className={styles.filterSelect}
          >
            <option value="">Default order</option>
            <option value="dueDate_asc">Due date ↑</option>
            <option value="dueDate_desc">Due date ↓</option>
          </select>
          <button className={styles.addTaskBtn} onClick={() => handleAddTask('todo')}>
            + Add Task
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && tasks.length === 0 ? (
        <div className={styles.loadingWrapper}>
          <Spinner size="lg" />
        </div>
      ) : (
        /* Kanban board */
        <div className={styles.board}>
          <DragDropContext onDragEnd={handleDragEnd}>
            {STATUSES.map(({ key, label }) => (
              <Column
                key={key}
                columnId={key}
                tasks={tasksByStatus[key] || []}
                onAddTask={handleAddTask}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
              />
            ))}
          </DragDropContext>
        </div>
      )}

      {/* Task create/edit modal */}
      <TaskForm
        boardId={boardId}
        task={editingTask}
        isOpen={taskModalOpen}
        onClose={closeModal}
        defaultStatus={defaultStatus}
      />
    </div>
  );
}
