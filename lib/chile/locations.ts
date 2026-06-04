import {
  getComunaByCode,
  getComunaOptions,
  getRegionByName,
  getRegionByNumber,
  getRegionOptions,
  searchComunas,
  type SelectOption,
} from "chilean-territorial-divisions";

export type ChileSelectOption = SelectOption;

/** Opciones de región (value = número romano, label = nombre oficial). */
export function getChileRegionOptions(): ChileSelectOption[] {
  return getRegionOptions();
}

export function resolveChileRegionNumber(regionName: string): string | null {
  const trimmed = regionName.trim();
  if (!trimmed) return null;

  const byName = getRegionByName(trimmed);
  if (byName) return byName.region_number;

  const byNumber = getRegionByNumber(trimmed);
  return byNumber?.region_number ?? null;
}

export function resolveChileRegionName(regionNumber: string): string {
  return getRegionByNumber(regionNumber)?.region ?? regionNumber;
}

export function getChileCommuneOptions(
  regionNumber: string,
): ChileSelectOption[] {
  return getComunaOptions(regionNumber);
}

export function resolveChileCommuneCode(
  regionNumber: string | null,
  communeName: string,
): string | null {
  if (!regionNumber || !communeName.trim()) return null;

  const options = getComunaOptions(regionNumber);
  const exact = options.find((option) => option.label === communeName.trim());
  if (exact) return exact.value;

  const matches = searchComunas(communeName.trim());
  const inRegion = matches.find(
    (match) => match.region_number === regionNumber,
  );
  return inRegion?.comuna.code ?? null;
}

/** Ciudades = comunas de la provincia de la comuna seleccionada (agrupación habitual en Chile). */
export function getChileCityOptions(
  regionNumber: string,
  communeCode: string | null,
): ChileSelectOption[] {
  if (!communeCode) return [];

  const context = getComunaByCode(communeCode);
  if (!context) return [];

  return getComunaOptions(regionNumber, context.provincia);
}
