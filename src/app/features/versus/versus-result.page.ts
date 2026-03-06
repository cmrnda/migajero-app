import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import * as htmlToImage from 'html-to-image';
import { DuoResult } from '../../core/api/migajero-api';

const CACHE_KEY = 'migajero:lastDuoResult';

function readCache(): DuoResult | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || parsed.mode !== 'DUO') return null;

    return parsed as DuoResult;
  } catch {
    return null;
  }
}

function writeCache(result: DuoResult): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(result));
  } catch {}
}

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './versus-result.page.html'
})
export class VersusResultPage implements OnInit {
  private readonly router = inject(Router);

  private readonly stickerPool: string[] = [
    'assets/images/migajera_01_lupa.png',
    'assets/images/migajera_03_serio_con_pan.png',
    'assets/images/migajera_04_lupa_triste.png',
    'assets/images/migajera_05_enojado.png',
    'assets/images/migajera_06_feliz_con_pan.png',
    'assets/images/migajera_08_pulgar_arriba.png'
  ];

  result: DuoResult | null = (history.state as { result?: DuoResult } | null)?.result ?? null;
  errorMsg: string | null = null;

  leftStickerSrc = this.stickerPool[0];
  centerStickerSrc = this.stickerPool[1];
  rightStickerSrc = this.stickerPool[2];

  ngOnInit(): void {
    this.assignRandomStickers();

    if (this.result) {
      writeCache(this.result);
      return;
    }

    const cached = readCache();
    if (cached) {
      this.result = cached;
      return;
    }

    this.router.navigateByUrl('/versus');
  }

  async shareImage(): Promise<void> {
    try {
      this.errorMsg = null;

      const blob = await this.makeBlob();
      const file = new File([blob], 'migajero-versus.png', { type: 'image/png' });
      const nav = navigator as Navigator & {
        canShare?: (data?: ShareData) => boolean;
      };

      if (nav.canShare?.({ files: [file] }) && nav.share) {
        await nav.share({
          files: [file],
          title: 'Resultado 1 vs 1',
          text: 'Comparación directa 😌'
        });
        return;
      }

      await this.downloadImage();
    } catch (error: unknown) {
      this.errorMsg = error instanceof Error ? error.message : 'No se pudo compartir la imagen';
    }
  }

  async downloadImage(): Promise<void> {
    try {
      this.errorMsg = null;

      const blob = await this.makeBlob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');

      anchor.href = url;
      anchor.download = 'migajero-versus.png';
      anchor.click();

      URL.revokeObjectURL(url);
    } catch (error: unknown) {
      this.errorMsg = error instanceof Error ? error.message : 'No se pudo descargar la imagen';
    }
  }

  goAgain(): void {
    this.router.navigateByUrl('/versus');
  }

  get isTie(): boolean {
    return this.result?.winner === 'TIE';
  }

  get leftWins(): boolean {
    return this.result?.winner === 'LEFT';
  }

  get rightWins(): boolean {
    return this.result?.winner === 'RIGHT';
  }

  get titleText(): string {
    if (!this.result) return '';
    if (this.isTie) return 'Empate técnico';
    return `${this.result.winnerName ?? 'Alguien'} cayó más fuerte`;
  }

  get subtitleText(): string {
    if (!this.result) return '';
    if (this.isTie) return 'Los dos quedaron igual';
    return `Diferencia de ${this.result.scoreGap} puntos`;
  }

  get leftScore(): number {
    return Number(this.result?.leftResult?.score ?? 0);
  }

  get rightScore(): number {
    return Number(this.result?.rightResult?.score ?? 0);
  }

  get leftFillClass(): string {
    return this.leftWins ? 'opacity-100' : 'opacity-80';
  }

  get rightFillClass(): string {
    return this.rightWins ? 'opacity-100' : 'opacity-80';
  }

  private assignRandomStickers(): void {
    const shuffled = [...this.stickerPool].sort(() => Math.random() - 0.5);
    this.leftStickerSrc = shuffled[0];
    this.centerStickerSrc = shuffled[1];
    this.rightStickerSrc = shuffled[2];
  }

  private async makeBlob(): Promise<Blob> {
    const node = document.getElementById('versusResultCard');
    if (!node) {
      throw new Error('No se encontró la tarjeta del versus');
    }

    await this.ensureCardReady(node);

    const blob = await htmlToImage.toBlob(node, {
      pixelRatio: 2.5,
      backgroundColor: '#ffffff',
      cacheBust: true,
      skipFonts: true
    });

    if (!blob) {
      throw new Error('No se pudo generar la imagen');
    }

    return blob;
  }

  private async ensureCardReady(node: HTMLElement): Promise<void> {
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

    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    );
  }
}
