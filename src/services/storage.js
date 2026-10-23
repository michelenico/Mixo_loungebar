const NS = 'mixo:';

export async function loadKey(key, fallback) {
  try {
    const fullKey = NS + key;

    if (typeof window !== 'undefined' && window.storage?.get) {
      const res = await window.storage.get(fullKey, true);
      return res?.value ? JSON.parse(res.value) : fallback;
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      const value = window.localStorage.getItem(fullKey);
      return value ? JSON.parse(value) : fallback;
    }

    return fallback;
  } catch (e) {
    return fallback;
  }
}

export async function saveKey(key, value) {
  try {
    const fullKey = NS + key;
    const serialized = JSON.stringify(value);

    if (typeof window !== 'undefined' && window.storage?.set) {
      await window.storage.set(fullKey, serialized, true);
      return true;
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(fullKey, serialized);
      return true;
    }

    return false;
  } catch (e) {
    console.error('storage error', e);
    return false;
  }
}

export async function removeKey(key) {
  const fullKey = NS + key;

  if (typeof window !== 'undefined' && window.storage?.delete) {
    await window.storage.delete(fullKey, true);
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem(fullKey);
  }
}
