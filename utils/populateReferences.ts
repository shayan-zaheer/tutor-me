export async function populateReferences(data: any): Promise<any> {
  if (!data || typeof data !== 'object') return data;

  const result: any = {};

  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value.get === 'function' && value.path && value.firestore) {
      try {
        const snap = await value.get();
        if (snap.exists) {
          result[key] = { id: snap.id, ...snap.data() };
        } else {
          result[key] = null;
        }
      } catch (err) {
        console.error(`Failed to populate reference for key: ${key}`, err);
        result[key] = null;
      }
    } else {
      result[key] = value;
    }
  }

  return result;
}