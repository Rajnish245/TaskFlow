import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { generateSubtasks, clearAI, selectAISubtasks, selectAILoading, selectAIError } from '../../features/ai/aiSlice';
import Spinner from '../Spinner/Spinner';
import { PRIORITIES } from '../../utils/constants';
import styles from './AIBreakdownPanel.module.css';

/**
 * AIBreakdownPanel — lets users type a goal and get AI-generated subtask suggestions.
 * The parent (TaskForm) passes `onAddTasks` callback to create the selected tasks.
 */
export default function AIBreakdownPanel({ onAddTasks }) {
  const dispatch = useDispatch();
  const subtasks = useSelector(selectAISubtasks);
  const loading = useSelector(selectAILoading);
  const error = useSelector(selectAIError);

  const [goal, setGoal] = useState('');
  // Local state for the editable checklist
  const [checklist, setChecklist] = useState([]);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!goal.trim()) return;
    try {
      const result = await dispatch(generateSubtasks(goal.trim())).unwrap();
      // Build an editable checklist with checked=true by default
      setChecklist(
        result.subtasks.map((st, i) => ({
          id: i,
          title: st.title,
          priority: st.priority || 'Medium',
          checked: true,
        }))
      );
      setGenerated(true);
    } catch {
      setGenerated(false);
    }
  }, [dispatch, goal]);

  const handleCheck = (id) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleEditTitle = (id, value) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, title: value } : item))
    );
  };

  const handleEditPriority = (id, value) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, priority: value } : item))
    );
  };

  const handleAddSelected = () => {
    const selected = checklist.filter((item) => item.checked && item.title.trim());
    onAddTasks(selected.map(({ title, priority }) => ({ title, priority })));
  };

  const handleClear = () => {
    dispatch(clearAI());
    setGoal('');
    setChecklist([]);
    setGenerated(false);
  };

  return (
    <div className={styles.panel}>
      <p className={styles.hint}>
        Type a goal and let AI suggest subtasks for you.
      </p>

      {/* Goal input */}
      <div className={styles.inputRow}>
        <input
          type="text"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          placeholder="e.g. Launch company website"
          className={styles.goalInput}
          disabled={loading}
          maxLength={500}
        />
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading || !goal.trim()}
          className={styles.generateBtn}
        >
          {loading ? <Spinner size="sm" color="#fff" /> : 'Generate'}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className={styles.error}>
          {error.includes('429') || error.toLowerCase().includes('busy')
            ? '⏳ AI is busy, please try again in a minute.'
            : `⚠️ ${error}`}
        </div>
      )}

      {/* Subtask checklist */}
      {generated && checklist.length > 0 && (
        <div className={styles.checklist}>
          <p className={styles.checklistTitle}>Suggested subtasks — edit or uncheck as needed:</p>
          {checklist.map((item) => (
            <div key={item.id} className={`${styles.checkItem} ${!item.checked ? styles.unchecked : ''}`}>
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => handleCheck(item.id)}
                className={styles.checkbox}
              />
              <input
                type="text"
                value={item.title}
                onChange={(e) => handleEditTitle(item.id, e.target.value)}
                className={styles.titleInput}
                disabled={!item.checked}
              />
              <select
                value={item.priority}
                onChange={(e) => handleEditPriority(item.id, e.target.value)}
                className={styles.prioritySelect}
                disabled={!item.checked}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          ))}

          {/* Actions */}
          <div className={styles.checklistActions}>
            <button type="button" onClick={handleClear} className={styles.clearBtn}>
              Clear
            </button>
            <button
              type="button"
              onClick={handleAddSelected}
              disabled={!checklist.some((i) => i.checked && i.title.trim())}
              className={styles.addSelectedBtn}
            >
              ✅ Add selected ({checklist.filter((i) => i.checked).length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
