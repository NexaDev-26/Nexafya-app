/**
 * Safe Access Utilities
 * Prevents crashes from undefined/null access
 */

/**
 * Safely get a value from an object with fallback
 */
export function safeGet<T>(obj: any, path: string, defaultValue: T): T {
  try {
    const keys = path.split('.');
    let result = obj;
    for (const key of keys) {
      if (result == null) return defaultValue;
      result = result[key];
    }
    return result != null ? result : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Safely call toString on a value
 */
export function safeToString(value: any, defaultValue: string = '0'): string {
  try {
    if (value == null) return defaultValue;
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    return String(value);
  } catch {
    return defaultValue;
  }
}

/**
 * Safely format a number with toLocaleString
 */
export function safeToLocaleString(value: any, defaultValue: string = '0'): string {
  try {
    if (value == null) return defaultValue;
    const num = typeof value === 'number' ? value : Number(value);
    if (isNaN(num)) return defaultValue;
    return num.toLocaleString();
  } catch {
    return defaultValue;
  }
}

/**
 * Safely map over an array
 */
export function safeMap<T, R>(arr: T[] | null | undefined, fn: (item: T, index: number) => R, defaultValue: R[] = []): R[] {
  try {
    if (!Array.isArray(arr)) return defaultValue;
    return arr.map(fn);
  } catch {
    return defaultValue;
  }
}

/**
 * Safely filter an array
 */
export function safeFilter<T>(arr: T[] | null | undefined, fn: (item: T, index: number) => boolean, defaultValue: T[] = []): T[] {
  try {
    if (!Array.isArray(arr)) return defaultValue;
    return arr.filter(fn);
  } catch {
    return defaultValue;
  }
}

/**
 * Safely reduce an array
 */
export function safeReduce<T, R>(
  arr: T[] | null | undefined,
  fn: (acc: R, item: T, index: number) => R,
  initialValue: R
): R {
  try {
    if (!Array.isArray(arr)) return initialValue;
    return arr.reduce(fn, initialValue);
  } catch {
    return initialValue;
  }
}

/**
 * Safely access array index
 */
export function safeArrayAccess<T>(arr: T[] | null | undefined, index: number, defaultValue: T | null = null): T | null {
  try {
    if (!Array.isArray(arr)) return defaultValue;
    if (index < 0 || index >= arr.length) return defaultValue;
    return arr[index];
  } catch {
    return defaultValue;
  }
}

/**
 * Safely get number value
 */
export function safeNumber(value: any, defaultValue: number = 0): number {
  try {
    if (value == null) return defaultValue;
    const num = typeof value === 'number' ? value : Number(value);
    return isNaN(num) ? defaultValue : num;
  } catch {
    return defaultValue;
  }
}

/**
 * Safely get string value
 */
export function safeString(value: any, defaultValue: string = ''): string {
  try {
    if (value == null) return defaultValue;
    return String(value);
  } catch {
    return defaultValue;
  }
}

/**
 * Safely get boolean value
 */
export function safeBoolean(value: any, defaultValue: boolean = false): boolean {
  try {
    if (value == null) return defaultValue;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const lower = value.toLowerCase();
      if (lower === 'true' || lower === 'yes' || lower === '1') return true;
      if (lower === 'false' || lower === 'no' || lower === '0') return false;
    }
    return !!value;
  } catch {
    return defaultValue;
  }
}

/**
 * Safely get array
 */
export function safeArray<T>(value: any, defaultValue: T[] = []): T[] {
  try {
    if (Array.isArray(value)) return value;
    return defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Safely get object
 */
export function safeObject<T extends object>(value: any, defaultValue: T): T {
  try {
    if (value != null && typeof value === 'object' && !Array.isArray(value)) {
      return value as T;
    }
    return defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Safely convert Firebase Timestamp to Date
 */
export function safeTimestamp(value: any, defaultValue: Date = new Date()): Date {
  try {
    if (value == null) return defaultValue;
    if (value.toDate && typeof value.toDate === 'function') {
      const date = value.toDate();
      return isNaN(date.getTime()) ? defaultValue : date;
    }
    if (value instanceof Date) {
      return isNaN(value.getTime()) ? defaultValue : value;
    }
    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? defaultValue : date;
    }
    return defaultValue;
  } catch {
    return defaultValue;
  }
}

