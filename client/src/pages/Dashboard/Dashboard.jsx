import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  fetchBoards,
  createBoard,
  deleteBoard,
  selectBoards,
  selectBoardsLoading,
} from '../../features/boards/boardsSlice';
import Navbar from '../../components/Navbar/Navbar';
import Spinner from '../../components/Spinner/Spinner';
import Button from '../../components/Button/Button';
import styles from './Dashboard.module.css';

/**
 * Dashboard — shows all boards for the logged-in user.
 */
export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const boards = useSelector(selectBoards);
  const loading = useSelector(selectBoardsLoading);

  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    dispatch(fetchBoards());
  }, [dispatch]);

  const handleCreate = useCallback(async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      await dispatch(createBoard(newTitle.trim())).unwrap();
      setNewTitle('');
      setShowForm(false);
      toast.success('Board created!');
    } catch (err) {
      toast.error(err?.message || 'Failed to create board');
    } finally {
      setCreating(false);
    }
  }, [dispatch, newTitle]);

  const handleDelete = useCallback(async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this board and all its tasks? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await dispatch(deleteBoard(id)).unwrap();
      toast.success('Board deleted');
    } catch {
      toast.error('Failed to delete board');
    } finally {
      setDeletingId(null);
    }
  }, [dispatch]);

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        {/* Page header */}
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>My Boards</h1>
            <p className={styles.pageSubtitle}>
              {boards.length} board{boards.length !== 1 ? 's' : ''} total
            </p>
          </div>
          <Button variant="primary" onClick={() => setShowForm((v) => !v)}>
            {showForm ? '✕ Cancel' : '+ New Board'}
          </Button>
        </div>

        {/* Create board form */}
        {showForm && (
          <form onSubmit={handleCreate} className={styles.createForm}>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Board name…"
              className={styles.boardInput}
              autoFocus
              maxLength={100}
            />
            <Button type="submit" variant="primary" loading={creating} size="sm">
              Create
            </Button>
          </form>
        )}

        {/* Loading state */}
        {loading && boards.length === 0 ? (
          <div className={styles.loadingWrapper}>
            <Spinner size="lg" />
          </div>
        ) : boards.length === 0 ? (
          /* Empty state */
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📋</div>
            <h3 className={styles.emptyTitle}>No boards yet</h3>
            <p className={styles.emptyText}>Create your first Kanban board to get started.</p>
            <Button variant="primary" onClick={() => setShowForm(true)}>
              + Create Board
            </Button>
          </div>
        ) : (
          /* Board grid */
          <div className={styles.grid}>
            {boards.map((board) => (
              <div
                key={board._id}
                className={styles.boardCard}
                onClick={() => navigate(`/board/${board._id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/board/${board._id}`)}
              >
                <div className={styles.boardIcon}>📌</div>
                <div className={styles.boardInfo}>
                  <h3 className={styles.boardTitle}>{board.title}</h3>
                  <p className={styles.boardDate}>
                    Created {new Date(board.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  className={styles.deleteBtn}
                  onClick={(e) => handleDelete(e, board._id)}
                  disabled={deletingId === board._id}
                  title="Delete board"
                  aria-label="Delete board"
                >
                  {deletingId === board._id ? '…' : '🗑'}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
