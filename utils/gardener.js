// utils/gardener.js
const { logger } = require('~/config');

/**
 * Logs conversation turns to the Gardener service
 * @param {Object} ev - The event object containing conversation data
 */
export async function mirrorTurn(ev) {
  const debugId = Math.random().toString(36).substring(2, 8);
  
  if (!process.env.GARDENER_URL) {
    logger.debug(`[${debugId}] GARDENER_URL not set, skipping mirrorTurn`);
    return;
  }
  if (!process.env.GARDENER_TOKEN) {
    logger.debug(`[${debugId}] GARDENER_TOKEN not set, skipping mirrorTurn`);
    return;
  }

  const payload = { 
    ...ev, 
    ts: ev.ts ?? new Date().toISOString(),
    debug_id: debugId
  };

  logger.debug(`[${debugId}] Sending to Gardener:`, {
    chat_id: ev.chat_id,
    turn_id: ev.turn_id,
    user_text_length: ev.user_text?.length,
    model_text_length: ev.model_text?.length,
    model: ev.model,
    url: process.env.GARDENER_URL
  });

  try {
    const startTime = Date.now();
    const response = await fetch(`${process.env.GARDENER_URL}/turn`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GARDENER_TOKEN}`,
        'X-Debug-Id': debugId,
      },
      body: JSON.stringify(payload),
    });

    const duration = Date.now() - startTime;
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Failed to read error response');
      logger.error(`[${debugId}] Gardener request failed:`, {
        status: response.status,
        statusText: response.statusText,
        duration: `${duration}ms`,
        response: errorText,
      });
      return;
    }

    logger.debug(`[${debugId}] Successfully sent to Gardener`, {
      status: response.status,
      duration: `${duration}ms`,
    });

  } catch (e) {
    logger.error(`[${debugId}] Error in mirrorTurn:`, {
      error: e.message,
      stack: e.stack,
      payload: {
        chat_id: ev.chat_id,
        turn_id: ev.turn_id,
        model: ev.model,
      }
    });
  }
}
