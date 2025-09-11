import { Pipe, PipeTransform } from '@angular/core';

type FilterOptions<T> = {
  /** Campos a filtrar (si no se define, busca en todos los stringificables) */
  keys?: (keyof T | string)[];
  /** Modo de combinación cuando hay múltiples términos (separados por espacios) */
  mode?: 'AND' | 'OR';
};

@Pipe({
  name: 'filterBy',
  standalone: true,
  pure: true, // performance: solo se recalcula si cambian inputs
})
export class FilterByPipe implements PipeTransform {
  transform<T>(
    items: T[] | null | undefined,
    search: string | null | undefined,
    options?: FilterOptions<T>
  ): T[] {
    if (!Array.isArray(items)) return [];
    const q = this.normalize(search ?? '');
    if (!q) return items;

    const keys = options?.keys;
    const mode = options?.mode ?? 'AND';
    // Soporte multi-término: "juan pediatria"
    const terms = q.split(/\s+/).filter(Boolean);

    return items.filter((item) => {
      const haystack = this.buildHaystack(item, keys);
      if (!terms.length) return true;

      if (mode === 'AND') {
        return terms.every((t) => haystack.some((h) => h.includes(t)));
      } else {
        return terms.some((t) => haystack.some((h) => h.includes(t)));
      }
    });
  }

  private buildHaystack<T>(item: T, keys?: (keyof T | string)[]): string[] {
    // Primitivos
    if (item == null || typeof item !== 'object') {
      return [this.normalize(String(item ?? ''))];
    }

    // Objetos: limitar a keys o recorrer todo
    if (Array.isArray(keys) && keys.length) {
      return keys.map((k) => this.normalize(this.safeGet(item, k)));
    }

    // Sin keys: toma todos los valores stringificables de 1er nivel
    return Object.values(item as any)
      .flatMap((v) => this.flattenValue(v))
      .map((v) => this.normalize(v));
  }

  private flattenValue(v: any): string[] {
    if (v == null) return [];
    if (typeof v === 'object') {
      // Evita recorrer profundo para rendimiento; ajusta si necesitas deep search
      return [];
    }
    return [String(v)];
  }

  private safeGet<T>(obj: T, key: keyof T | string): string {
    // Soporta "anidado.prop" si quieres extenderlo; por ahora plano
    const val = (obj as any)?.[key as any];
    return val == null ? '' : String(val);
  }

  private normalize(s: string): string {
    return s
      .toLowerCase()
      .normalize('NFD')
      // elimina diacríticos/acentos
      .replace(/\p{Diacritic}/gu, '')
      .trim();
  }
}
