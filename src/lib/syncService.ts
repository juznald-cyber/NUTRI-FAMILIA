import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch
} from 'firebase/firestore';
import { auth, dbFirestore } from './firebase';
import { db, type PantryItem, type MealPlanEntry, type FamilyMember, type WaterLog } from '../db';

export function generateSyncId(prefix = 'syn'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
}

let unsubscribeListeners: (() => void)[] = [];
let isApplyingCloudUpdate = false;

/**
 * Initializes real-time bidirectional synchronization for the active user.
 */
export function initCloudSync(userId: string) {
  // Clear any existing listeners
  stopCloudSync();

  if (!userId || userId === 'guest_user') return;

  console.log('🔄 Initializing Cloud Sync for user:', userId);

  // 1. Sync Family Members
  const familyCol = collection(dbFirestore, `users/${userId}/familyMembers`);
  const unsubFamily = onSnapshot(familyCol, async (snapshot) => {
    isApplyingCloudUpdate = true;
    try {
      if (snapshot.empty) {
        const local = await db.familyMembers.toArray();
        if (local.length > 0) {
          const batch = writeBatch(dbFirestore);
          for (const item of local) {
            const syncId = item.syncId || generateSyncId('fam');
            if (!item.syncId) await db.familyMembers.update(item.id!, { syncId });
            const itemRef = doc(familyCol, syncId);
            const { id, ...dataToUpload } = item;
            batch.set(itemRef, { ...dataToUpload, syncId });
          }
          await batch.commit();
        }
      } else {
        const cloudItems: (FamilyMember & { syncId: string })[] = [];
        snapshot.forEach(docSnap => {
          cloudItems.push({ ...(docSnap.data() as FamilyMember), syncId: docSnap.id });
        });

        for (const cloudItem of cloudItems) {
          const existing = await db.familyMembers.where('syncId').equals(cloudItem.syncId).first();
          if (existing && existing.id) {
            await db.familyMembers.put({ ...cloudItem, id: existing.id });
          } else {
            const byName = await db.familyMembers.where('name').equals(cloudItem.name).first();
            if (byName && byName.id) {
              await db.familyMembers.put({ ...cloudItem, id: byName.id, syncId: cloudItem.syncId });
            } else {
              await db.familyMembers.add(cloudItem);
            }
          }
        }

        const localItems = await db.familyMembers.toArray();
        const cloudIds = new Set(cloudItems.map(c => c.syncId));
        for (const loc of localItems) {
          if (loc.syncId && !cloudIds.has(loc.syncId)) {
            await db.familyMembers.delete(loc.id!);
          }
        }
      }
    } catch (err) {
      console.error('Error syncing familyMembers:', err);
    } finally {
      isApplyingCloudUpdate = false;
    }
  });
  unsubscribeListeners.push(unsubFamily);

  // 2. Sync Pantry Items
  const pantryCol = collection(dbFirestore, `users/${userId}/pantryItems`);
  const unsubPantry = onSnapshot(pantryCol, async (snapshot) => {
    isApplyingCloudUpdate = true;
    try {
      if (snapshot.empty) {
        const local = await db.pantryItems.toArray();
        if (local.length > 0) {
          const batch = writeBatch(dbFirestore);
          for (const item of local) {
            const syncId = item.syncId || generateSyncId('pnt');
            if (!item.syncId) await db.pantryItems.update(item.id!, { syncId });
            const itemRef = doc(pantryCol, syncId);
            const { id, ...dataToUpload } = item;
            batch.set(itemRef, { ...dataToUpload, syncId });
          }
          await batch.commit();
        }
      } else {
        const cloudItems: (PantryItem & { syncId: string })[] = [];
        snapshot.forEach(docSnap => {
          cloudItems.push({ ...(docSnap.data() as PantryItem), syncId: docSnap.id });
        });

        for (const cloudItem of cloudItems) {
          const existing = await db.pantryItems.where('syncId').equals(cloudItem.syncId).first();
          if (existing && existing.id) {
            await db.pantryItems.put({ ...cloudItem, id: existing.id });
          } else {
            await db.pantryItems.add(cloudItem);
          }
        }

        const localItems = await db.pantryItems.toArray();
        const cloudIds = new Set(cloudItems.map(c => c.syncId));
        for (const loc of localItems) {
          if (loc.syncId && !cloudIds.has(loc.syncId)) {
            await db.pantryItems.delete(loc.id!);
          }
        }
      }
    } catch (err) {
      console.error('Error syncing pantryItems:', err);
    } finally {
      isApplyingCloudUpdate = false;
    }
  });
  unsubscribeListeners.push(unsubPantry);

  // 3. Sync Meal Plans
  const mealPlanCol = collection(dbFirestore, `users/${userId}/mealPlans`);
  const unsubMealPlan = onSnapshot(mealPlanCol, async (snapshot) => {
    isApplyingCloudUpdate = true;
    try {
      if (snapshot.empty) {
        const local = await db.mealPlans.toArray();
        if (local.length > 0) {
          const batch = writeBatch(dbFirestore);
          for (const item of local) {
            const syncId = item.syncId || `${item.date}_${item.mealType}`;
            if (!item.syncId) await db.mealPlans.update(item.id!, { syncId });
            const itemRef = doc(mealPlanCol, syncId);
            const { id, ...dataToUpload } = item;
            batch.set(itemRef, { ...dataToUpload, syncId });
          }
          await batch.commit();
        }
      } else {
        const cloudItems: (MealPlanEntry & { syncId: string })[] = [];
        snapshot.forEach(docSnap => {
          cloudItems.push({ ...(docSnap.data() as MealPlanEntry), syncId: docSnap.id });
        });

        for (const cloudItem of cloudItems) {
          const existing = await db.mealPlans.where('syncId').equals(cloudItem.syncId).first();
          if (existing && existing.id) {
            await db.mealPlans.put({ ...cloudItem, id: existing.id });
          } else {
            const byDateMeal = await db.mealPlans.where({ date: cloudItem.date, mealType: cloudItem.mealType }).first();
            if (byDateMeal && byDateMeal.id) {
              await db.mealPlans.put({ ...cloudItem, id: byDateMeal.id, syncId: cloudItem.syncId });
            } else {
              await db.mealPlans.add(cloudItem);
            }
          }
        }

        const localItems = await db.mealPlans.toArray();
        const cloudIds = new Set(cloudItems.map(c => c.syncId));
        for (const loc of localItems) {
          if (loc.syncId && !cloudIds.has(loc.syncId)) {
            await db.mealPlans.delete(loc.id!);
          }
        }
      }
    } catch (err) {
      console.error('Error syncing mealPlans:', err);
    } finally {
      isApplyingCloudUpdate = false;
    }
  });
  unsubscribeListeners.push(unsubMealPlan);

  // 4. Sync Water Logs
  const waterCol = collection(dbFirestore, `users/${userId}/waterLogs`);
  const unsubWater = onSnapshot(waterCol, async (snapshot) => {
    isApplyingCloudUpdate = true;
    try {
      if (snapshot.empty) {
        const local = await db.waterLogs.toArray();
        if (local.length > 0) {
          const batch = writeBatch(dbFirestore);
          for (const item of local) {
            const itemRef = doc(waterCol, item.date);
            const { id, ...dataToUpload } = item;
            batch.set(itemRef, dataToUpload);
          }
          await batch.commit();
        }
      } else {
        snapshot.forEach(async (docSnap) => {
          const cloudItem = docSnap.data() as WaterLog;
          const existing = await db.waterLogs.where('date').equals(cloudItem.date).first();
          if (existing && existing.id) {
            await db.waterLogs.put({ ...cloudItem, id: existing.id });
          } else {
            await db.waterLogs.add(cloudItem);
          }
        });
      }
    } catch (err) {
      console.error('Error syncing waterLogs:', err);
    } finally {
      isApplyingCloudUpdate = false;
    }
  });
  unsubscribeListeners.push(unsubWater);

  // 5. Sync User Settings & Gemini API Key
  const settingsDocRef = doc(dbFirestore, `users/${userId}/settings/config`);
  const unsubSettings = onSnapshot(settingsDocRef, async (docSnap) => {
    try {
      const localKey = localStorage.getItem('nutrifamilia_gemini_api_key');
      if (docSnap.exists()) {
        const cloudData = docSnap.data();
        if (cloudData.geminiApiKey) {
          localStorage.setItem('nutrifamilia_gemini_api_key', cloudData.geminiApiKey);
        }
      } else if (localKey && localKey.trim()) {
        await setDoc(settingsDocRef, { geminiApiKey: localKey.trim() }, { merge: true });
      }
    } catch (err) {
      console.error('Error syncing settings:', err);
    }
  });
  unsubscribeListeners.push(unsubSettings);
}

export function stopCloudSync() {
  unsubscribeListeners.forEach(unsub => unsub());
  unsubscribeListeners = [];
}

// --------------------------------------------
// Cloud Push Operations
// --------------------------------------------

export async function pushFamilyMemberToCloud(item: FamilyMember) {
  if (isApplyingCloudUpdate) return;
  const user = auth.currentUser;
  if (!user) return;
  try {
    const syncId = item.syncId || generateSyncId('fam');
    const { id, ...cleanData } = item;
    await setDoc(doc(dbFirestore, `users/${user.uid}/familyMembers`, syncId), { ...cleanData, syncId });
  } catch (e) {
    console.error('Failed to push family member to cloud:', e);
  }
}

export async function removeFamilyMemberFromCloud(syncId?: string) {
  if (isApplyingCloudUpdate || !syncId) return;
  const user = auth.currentUser;
  if (!user) return;
  try {
    await deleteDoc(doc(dbFirestore, `users/${user.uid}/familyMembers`, syncId));
  } catch (e) {
    console.error('Failed to delete family member from cloud:', e);
  }
}

export async function pushPantryItemToCloud(item: PantryItem) {
  if (isApplyingCloudUpdate) return;
  const user = auth.currentUser;
  if (!user) return;
  try {
    const syncId = item.syncId || generateSyncId('pnt');
    const { id, ...cleanData } = item;
    await setDoc(doc(dbFirestore, `users/${user.uid}/pantryItems`, syncId), { ...cleanData, syncId });
  } catch (e) {
    console.error('Failed to push pantry item to cloud:', e);
  }
}

export async function removePantryItemFromCloud(syncId?: string) {
  if (isApplyingCloudUpdate || !syncId) return;
  const user = auth.currentUser;
  if (!user) return;
  try {
    await deleteDoc(doc(dbFirestore, `users/${user.uid}/pantryItems`, syncId));
  } catch (e) {
    console.error('Failed to delete pantry item from cloud:', e);
  }
}

export async function pushMealPlanToCloud(item: MealPlanEntry) {
  if (isApplyingCloudUpdate) return;
  const user = auth.currentUser;
  if (!user) return;
  try {
    const syncId = item.syncId || `${item.date}_${item.mealType}`;
    const { id, ...cleanData } = item;
    await setDoc(doc(dbFirestore, `users/${user.uid}/mealPlans`, syncId), { ...cleanData, syncId });
  } catch (e) {
    console.error('Failed to push meal plan to cloud:', e);
  }
}

export async function removeMealPlanFromCloud(syncId?: string) {
  if (isApplyingCloudUpdate || !syncId) return;
  const user = auth.currentUser;
  if (!user) return;
  try {
    await deleteDoc(doc(dbFirestore, `users/${user.uid}/mealPlans`, syncId));
  } catch (e) {
    console.error('Failed to delete meal plan from cloud:', e);
  }
}

export async function pushWaterLogToCloud(item: WaterLog) {
  if (isApplyingCloudUpdate) return;
  const user = auth.currentUser;
  if (!user) return;
  try {
    const { id, ...cleanData } = item;
    await setDoc(doc(dbFirestore, `users/${user.uid}/waterLogs`, item.date), cleanData);
  } catch (e) {
    console.error('Failed to push water log to cloud:', e);
  }
}
