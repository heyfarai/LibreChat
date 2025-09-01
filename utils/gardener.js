// utils/gardener.js
export async function mirrorTurn(ev) {
  if (!process.env.GARDENER_URL) return;

  try {
    await fetch(`${process.env.GARDENER_URL}/turn`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GARDENER_TOKEN}`,
      },
      body: JSON.stringify({ ...ev, ts: ev.ts ?? new Date().toISOString() }),
    });
  } catch (e) {
    console.error('Gardener mirror failed', e);
  }
}
