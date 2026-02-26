import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { getMyLastResult } from '../api/migajero-api';

const CACHE_KEY = 'migajero:lastResult';

function readCache(): any | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (!obj || typeof obj.score !== 'number') return null;
    return obj;
  } catch {
    return null;
  }
}

function writeCache(result: any) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(result));
  } catch {}
}

export const soloGateGuard: CanActivateFn = async (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router = inject(Router);

  const force = route.queryParamMap.get('force');
  if (force === '1') return true;

  const cached = readCache();
  if (cached) {
    return router.createUrlTree(['/solo/result']);
  }

  try {
    const last = await getMyLastResult();
    if (last) {
      writeCache(last);
      return router.createUrlTree(['/solo/result']);
    }
  } catch {

    return true;
  }
  return true;
};
