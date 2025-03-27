import { pool } from "../database/db";
import { Step } from "../interface/step";

async function getSession(phoneNumber: string) {
  const { rows } = await pool.query("SELECT * FROM sessions WHERE phone = $1", [
    phoneNumber,
  ]);
  return rows[0] || null;
}

async function saveSession(
  phoneNumber: string,
  step: Step,
  cpf: string | null = null,
  name: string | null = null,
  userId?: number
) {
  await pool.query(
    `INSERT INTO sessions (phone, step, cpf, name, user_id, last_interaction)
     VALUES ($1, $2, $3, $4, $5, NOW())
     ON CONFLICT (phone)
     DO UPDATE SET step = $2, cpf = $3, name = $4, last_interaction = NOW()`,
    [phoneNumber, step, cpf, name, userId]
  );
}

async function updateUserId(phoneNumber: string, userId: number) {
  await pool.query(
    `UPDATE sessions SET user_id = $1 WHERE phone = $2 AND user_id IS NULL`,
    [userId, phoneNumber]
  );
}
async function deleteExpiredSessions() {
  await pool.query(
    "DELETE FROM sessions WHERE last_interaction < NOW() - INTERVAL '30 minutes'"
  );
}

export { getSession, saveSession, deleteExpiredSessions, updateUserId };
