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
  } catch {
    // ignore
  }
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

    await this.ensureCardReady(node);

    const blob = await htmlToImage.toBlob(node, {
      pixelRatio: 2.5,
      backgroundColor: '#ffffff',
      cacheBust: true,
      skipFonts: true
    });

    if (!blob) throw new Error('No se pudo generar imagen');
    return blob;
  }

  async shareImage() {
    try {
      this.errorMsg = null;
      const blob = await this.makeBlob();
      const file = new File([blob], 'migajero.png', { type: 'image/png' });

      const nav: any = navigator;
      if (nav.canShare?.({ files: [file] }) && nav.share) {
        await nav.share({ files: [file], title: 'Mi resultado', text: 'Solo entretenimiento 😌' });
        return;
      }
      await this.downloadImage();
    } catch (e: any) {
      this.errorMsg = e?.message ?? 'No se pudo compartir la imagen';
    }
  }

  async downloadImage() {
    try {
      this.errorMsg = null;
      const blob = await this.makeBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'migajero.png';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      this.errorMsg = e?.message ?? 'No se pudo descargar la imagen';
    }
  }

  redoTest() {
    this.router.navigateByUrl('/solo/quiz?force=1');
  }

  get safeTags(): string[] {
    const tags = (this.result?.tags ?? []) as string[];
    return tags
      .map(t => (t ?? '').trim())
      .filter(t => !!t && t !== 'Relación Schrödinger');
  }

  get watermarkSrc(): string {
    return 'assets/images/migajera_09_grupo.png';
  }

  get stickerSrc(): string {
    const r = this.result ?? {};
    const score = Number(r.score ?? 0);

    const level = String(r.level ?? '').toLowerCase();
    const tags = this.safeTags.join(' ').toLowerCase();

    if (level.includes('enamor') || tags.includes('enamor')) {
      return 'assets/images/migajera_07_abrazo_enamorados.png';
    }

    if (score >= 90) return 'assets/images/migajera_08_pulgar_arriba.png';
    if (score >= 75) return 'assets/images/migajera_06_feliz_con_pan.png';
    if (score >= 55) return 'assets/images/migajera_03_serio_con_pan.png';
    if (score >= 35) return 'assets/images/migajera_01_lupa.png';
    if (score >= 20) return 'assets/images/migajera_04_lupa_triste.png';
    return 'assets/images/migajera_05_enojado.png';
  }

  private async ensureCardReady(node: HTMLElement) {
    const imgs = Array.from(node.querySelectorAll('img')) as HTMLImageElement[];

    await Promise.all(
      imgs.map(img => {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
        return new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        });
      })
    );

    await new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())));
  }
}
