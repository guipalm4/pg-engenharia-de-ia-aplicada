import { Injectable, signal, WritableSignal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Brag {
  id: string;
  title: string;
  context: string;
  impact: string;
  metrics: string;
  technologies: string[];
}

@Injectable({
  providedIn: 'root'
})
export class BragService {
  private http = inject(HttpClient);
  brags: WritableSignal<Brag[]> = signal([]);
  loading: WritableSignal<boolean> = signal(false);

  generateBrag(definition: string) {
    this.loading.set(true);
    
    this.http.post<any>('/api/brag', { definition }).subscribe({
      next: (res) => {
        const newBrag: Brag = {
          id: res.id || crypto.randomUUID(),
          title: res.title,
          context: res.context,
          impact: res.businessImpact || res.impact,
          metrics: Array.isArray(res.metrics) ? res.metrics.join(', ') : res.metrics,
          technologies: res.technologiesUsed || res.technologies || []
        };
        this.brags.update(current => [newBrag, ...current]);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Falha ao gerar brag:', err);
        this.loading.set(false);
      }
    });
  }

  getBragById(id: string): Brag | undefined {
    return this.brags().find(b => b.id === id);
  }
}
