/**
 * Switching pathway (principle 5, docs/architecture.md §4.3). Nothing is ever deleted: every
 * completed output is kept, and tasks in the new pathway that share an equivalence key with
 * finished work count as done straight away.
 */

export type RemapCompletion = { taskId: string; equivalenceKey: string | null };
export type RemapTask = { id: string; equivalenceKey: string | null };

export type RemapPreview = {
  /** Every completed output, all of which stay in the Launch File. */
  kept: number;
  /** Tasks in the new pathway already done, directly or through a shared task. */
  credited: number;
  /** Tasks in the new pathway still to do. */
  remaining: number;
  total: number;
};

export function remap(completions: RemapCompletion[], newTasks: RemapTask[]): RemapPreview {
  const doneIds = new Set(completions.map((c) => c.taskId));
  const doneKeys = new Set(completions.map((c) => c.equivalenceKey).filter(Boolean));
  const credited = newTasks.filter(
    (t) => doneIds.has(t.id) || (t.equivalenceKey !== null && doneKeys.has(t.equivalenceKey)),
  ).length;
  return {
    kept: completions.length,
    credited,
    remaining: newTasks.length - credited,
    total: newTasks.length,
  };
}
