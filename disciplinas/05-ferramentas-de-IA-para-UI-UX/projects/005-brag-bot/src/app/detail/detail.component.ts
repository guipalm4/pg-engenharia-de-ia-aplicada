import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BragService } from '../services/brag.service';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-3xl mx-auto p-6 md:p-12 min-h-screen flex flex-col">
      <nav class="mb-10">
        <a routerLink="/" class="group inline-flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 transition-transform group-hover:-translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          <span class="font-medium">Voltar ao Dashboard</span>
        </a>
      </nav>

      @if (brag()) {
        <article class="flex-1">
          <header class="mb-10">
            <h1 class="text-3xl md:text-5xl font-extrabold text-slate-100 leading-tight mb-4">{{ brag()?.title }}</h1>
            <div class="flex flex-wrap gap-2">
              @for (tech of brag()?.technologies; track tech) {
                <span class="text-sm font-mono bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
                  {{ tech }}
                </span>
              }
            </div>
          </header>

          <div class="space-y-8">
            <section class="bg-slate-800/40 rounded-2xl p-6 md:p-8 border border-slate-700/50 relative overflow-hidden">
              <div class="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-32 h-32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              </div>
              <h2 class="text-xl font-bold text-slate-300 mb-4 flex items-center gap-2">
                <div class="w-1.5 h-6 bg-blue-500 rounded-sm"></div>
                O Contexto
              </h2>
              <p class="text-slate-300 leading-relaxed text-lg">{{ brag()?.context }}</p>
            </section>

            <section class="bg-slate-800/40 rounded-2xl p-6 md:p-8 border border-slate-700/50 relative overflow-hidden">
               <div class="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-32 h-32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
              </div>
              <h2 class="text-xl font-bold text-slate-300 mb-4 flex items-center gap-2">
                <div class="w-1.5 h-6 bg-purple-500 rounded-sm"></div>
                O Impacto
              </h2>
              <p class="text-slate-300 leading-relaxed text-lg">{{ brag()?.impact }}</p>
            </section>

            <section class="bg-gradient-to-br from-emerald-900/40 to-slate-800/40 rounded-2xl p-6 md:p-8 border border-emerald-800/50 shadow-lg shadow-emerald-900/10">
              <h2 class="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                Métricas e Resultados
              </h2>
              <p class="text-emerald-100/90 leading-relaxed text-lg font-medium">{{ brag()?.metrics }}</p>
            </section>
          </div>
        </article>
      } @else {
        <div class="flex-1 flex flex-col items-center justify-center text-center">
          <div class="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700 mb-6 transform rotate-6">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-slate-500 -rotate-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <h2 class="text-2xl font-bold text-slate-100 mb-2">Conquista não encontrada</h2>
          <p class="text-slate-400 mb-8 max-w-sm">A rota parece ser inválida ou a conquista não existe mais na memória.</p>
          <a routerLink="/" class="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-colors border border-slate-700 hover:border-slate-600">
            Retornar
          </a>
        </div>
      }
    </div>
  `,
  styles: []
})
export class DetailComponent {
  private route = inject(ActivatedRoute);
  private bragService = inject(BragService);
  
  // Gets the ID from the route params when it initializes
  id = this.route.snapshot.paramMap.get('id');

  // Computed signal based on the ID
  brag = computed(() => {
    if (!this.id) return undefined;
    return this.bragService.getBragById(this.id);
  });
}
