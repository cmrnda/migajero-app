import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import * as htmlToImage from 'html-to-image';
import { getMyLastResult } from '../../core/api/migajero-api';

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

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './solo-result.page.html'
})
export class SoloResultPage {
  private readonly router = inject(Router);

  result: any = (history.state as any)?.result ?? null;
  loading = false;
  errorMsg: string | null = null;

  async ngOnInit() {
    if (this.result) {
      writeCache(this.result);
      return;
    }

    const cached = readCache();
    if (cached) {
      this.result = cached;
      return;
    }

    this.loading = true;
    try {
      const last = await getMyLastResult();
      if (last) {
        this.result = last;
        writeCache(last);
      } else {
        this.router.navigateByUrl('/solo/quiz?force=1');
      }
    } catch (e: any) {
      this.errorMsg = e?.message ?? 'Error cargando tu último resultado';
    } finally {
      this.loading = false;
    }
  }

  private async makeBlob(): Promise<Blob> {
    const node = document.getElementById('resultCard');
    if (!node) throw new Error('No resultCard');
    const blob = await htmlToImage.toBlob(node, { pixelRatio: 2 });
    if (!blob) throw new Error('No se pudo generar imagen');
    return blob;
  }

  async shareImage() {
    const blob = await this.makeBlob();
    const file = new File([blob], 'migajero.png', { type: 'image/png' });

    const nav: any = navigator;
    if (nav.canShare?.({ files: [file] }) && nav.share) {
      await nav.share({ files: [file], title: 'Mi resultado', text: 'Solo entretenimiento 😌' });
      return;
    }
    await this.downloadImage();
  }

  async downloadImage() {
    const blob = await this.makeBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'migajero.png';
    a.click();
    URL.revokeObjectURL(url);
  }

  redoTest() {
    this.router.navigateByUrl('/solo/quiz?force=1');
  }
}
