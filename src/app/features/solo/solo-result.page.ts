import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import * as htmlToImage from 'html-to-image';
import { APP_VERSION } from '../../core/config/app-info';
import { QuizResult, getMyLastResult } from '../../core/api/migajero-api';

const cacheKey = 'migajero:lastResult';

function readResultCache(): QuizResult | null {
  try {
    const raw = localStorage.getItem(cacheKey);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.score !== 'number') return null;

    return parsed;
  } catch {
    return null;
  }
}

function writeResultCache(result: QuizResult) {
  try {
    localStorage.setItem(cacheKey, JSON.stringify(result));
  } catch {}
}

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './solo-result.page.html'
})
export class SoloResultPage implements OnInit {
  private readonly router = inject(Router);

  protected readonly appVersion = APP_VERSION;

  protected result: QuizResult | null = (history.state as any)?.result ?? null;
  protected isLoading = false;
  protected errorMessage: string | null = null;

  async ngOnInit() {
    if (this.result) {
      writeResultCache(this.result);
      return;
    }

    const cached = readResultCache();
    if (cached) {
      this.result = cached;
      return;
    }

    this.isLoading = true;

    try {
      const lastResult = await getMyLastResult();

      if (!lastResult) {
        this.router.navigateByUrl('/solo/quiz?force=1');
        return;
      }

      this.result = lastResult;
      writeResultCache(lastResult);
    } catch (error: any) {
      this.errorMessage = error?.message ?? 'No se pudo cargar tu resultado.';
    } finally {
      this.isLoading = false;
    }
  }

  private async makeBlob() {
    const node = document.getElementById('resultCard');
    if (!node) {
      throw new Error('No se encontró la tarjeta del resultado.');
    }

    await this.ensureCardReady(node);

    const blob = await htmlToImage.toBlob(node, {
      pixelRatio: 2.5,
      backgroundColor: '#ffffff',
      cacheBust: true,
      skipFonts: true
    });

    if (!blob) {
      throw new Error('No se pudo generar la imagen.');
    }

    return blob;
  }

  protected async shareImage() {
    try {
      this.errorMessage = null;

      const blob = await this.makeBlob();
      const file = new File([blob], 'migajero.png', { type: 'image/png' });
      const browser = navigator as Navigator & {
        canShare?: (data?: ShareData) => boolean;
      };

      if (browser.canShare?.({ files: [file] }) && browser.share) {
        await browser.share({
          files: [file],
          title: 'Mi resultado',
          text: 'Es solo entretenimiento 😌'
        });
        return;
      }

      await this.downloadImage();
    } catch (error: any) {
      this.errorMessage = error?.message ?? 'No se pudo compartir la imagen.';
    }
  }

  protected async downloadImage() {
    try {
      this.errorMessage = null;

      const blob = await this.makeBlob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');

      anchor.href = url;
      anchor.download = 'migajero.png';
      anchor.click();

      URL.revokeObjectURL(url);
    } catch (error: any) {
      this.errorMessage = error?.message ?? 'No se pudo descargar la imagen.';
    }
  }

  protected redoTest() {
    this.router.navigateByUrl('/solo/quiz?force=1');
  }

  protected get visibleTags() {
    return Array.isArray(this.result?.tags)
      ? this.result!.tags.filter((tag) => !!String(tag).trim())
      : [];
  }

  protected get watermarkSrc() {
    return 'assets/images/migajera_09_grupo.png';
  }

  protected get stickerSrc() {
    const score = Number(this.result?.score ?? 0);

    if (score >= 90) return 'assets/images/migajera_08_pulgar_arriba.png';
    if (score >= 75) return 'assets/images/migajera_06_feliz_con_pan.png';
    if (score >= 55) return 'assets/images/migajera_03_serio_con_pan.png';
    if (score >= 35) return 'assets/images/migajera_01_lupa.png';
    if (score >= 20) return 'assets/images/migajera_04_lupa_triste.png';
    return 'assets/images/migajera_05_enojado.png';
  }

  private async ensureCardReady(node: HTMLElement) {
    const images = Array.from(node.querySelectorAll('img')) as HTMLImageElement[];

    await Promise.all(
      images.map((image) => {
        if (image.complete && image.naturalWidth > 0) {
          return Promise.resolve();
        }

        return new Promise<void>((resolve) => {
          image.onload = () => resolve();
          image.onerror = () => resolve();
        });
      })
    );

    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  }
}
