import Dexie from 'dexie';
import { createClient } from '@supabase/supabase-js';

// ==========================================
// 1. Dexie IndexedDB Initialization
// ==========================================
export const db = new Dexie('SehatDB');

// Define Schema
// patients table: stores patient profiles with emergency plaintext & private payload
// syncQueue table: stores pending mutations for offline-first background sync
db.version(1).stores({
  patients: 'id, fullName, phone, bloodGroup, syncStatus, createdAt',
  syncQueue: '++queueId, patientId, action, status, createdAt'
});

// ==========================================
// 2. Supabase Backend Sync Stub
// ==========================================
// TODO(rudi): review before pilot - configure Supabase credentials & RLS policies
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://xyzcompany.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'public-anon-key-placeholder';

// In draft stage, client is initialized. TODO(rudi): review auth flow before pilot
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Enqueue a sync job in Dexie for background upload
 */
export async function queuePatientSync(patientRecord) {
  try {
    await db.syncQueue.add({
      patientId: patientRecord.id,
      action: 'UPSERT_PATIENT',
      payload: patientRecord,
      status: 'pending',
      createdAt: new Date().toISOString()
    });

    // Request Service Worker Background Sync if supported
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-sehat-patients');
      } catch (err) {
        console.warn('Background sync registration failed, falling back to online listener:', err);
      }
    }

    // If already online, attempt immediate sync in background
    if (navigator.onLine) {
      processSyncQueue().catch(err => console.error('Sync attempt failed:', err));
    }
  } catch (err) {
    console.error('Failed to queue patient sync:', err);
  }
}

/**
 * Process pending sync queue items when connection is available
 */
export async function processSyncQueue() {
  if (!navigator.onLine) return;

  const pendingItems = await db.syncQueue.where('status').equals('pending').toArray();
  if (pendingItems.length === 0) return;

  for (const item of pendingItems) {
    try {
      // TODO(rudi): review before pilot - encryption validation before network dispatch
      // TODO(rudi): review before pilot - verify Supabase RLS and token headers

      /*
      // Planned Supabase upsert:
      const { error } = await supabase
        .from('patients')
        .upsert({
          id: item.payload.id,
          emergency_data: item.payload.emergency,
          private_data: item.payload.privateData, // will be ciphertext
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      */

      // Mock successful sync until credentials and table schemas are linked
      console.log(`[Offline Sync] Synchronizing record ${item.patientId} to Supabase...`);

      // Update queue status and patient sync status in Dexie
      await db.syncQueue.update(item.queueId, { status: 'synced', syncedAt: new Date().toISOString() });
      await db.patients.update(item.patientId, { syncStatus: 'synced' });
    } catch (err) {
      console.error(`Sync failed for item ${item.queueId}:`, err);
      await db.syncQueue.update(item.queueId, { status: 'failed', lastError: String(err) });
    }
  }
}

// Listen for network restoration
window.addEventListener('online', () => {
  console.log('[Sehat Network] Connection restored. Processing sync queue...');
  processSyncQueue();
});
