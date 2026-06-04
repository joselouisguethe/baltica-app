import { PoolClient } from 'pg';
import { pool } from '../config/db';

// Linear journey state machine. A user only ever moves forward.
export type JourneyState =
  | 'registered'
  | 'active'
  | 'in_progress'
  | 'completed'
  | 'surveyed'
  | 'certified';

const ORDER: JourneyState[] = [
  'registered',
  'active',
  'in_progress',
  'completed',
  'surveyed',
  'certified',
];

export function rank(state: JourneyState): number {
  const i = ORDER.indexOf(state);
  return i === -1 ? 0 : i;
}

// A queryable: the shared pool or a transaction client.
type Queryable = Pick<PoolClient, 'query'>;

/**
 * Advance a user's journey_state to `target` only if it is strictly ahead of the
 * current state. Never moves a user backward. Returns the resulting state.
 * Pass a transaction client to keep the transition atomic with its trigger.
 */
export async function advanceState(
  userId: string,
  target: JourneyState,
  client: Queryable = pool,
): Promise<JourneyState> {
  const res = await client.query('SELECT journey_state FROM users WHERE id = $1', [userId]);
  const current = (res.rows[0]?.journey_state ?? 'registered') as JourneyState;
  if (rank(target) <= rank(current)) return current;
  await client.query('UPDATE users SET journey_state = $1 WHERE id = $2', [target, userId]);
  return target;
}
