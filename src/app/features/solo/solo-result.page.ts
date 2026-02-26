import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import * as htmlToImage from 'html-to-image';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './solo-result.page.html'
})
export class SoloResultPage {
  result: any = (history.state as any)?.result ?? null;

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
}