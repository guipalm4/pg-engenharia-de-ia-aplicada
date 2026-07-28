import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BragService } from '../services/brag.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-4xl mx-auto p-6 md:p-12">
      <!-- Header -->
      <header class="mb-12 text-center md:text-left">
        <h1 class="text-4xl font-extrabold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300">
          Brag-Bot | Pós IA UNIPDS
        </h1>
        <p class="text-slate-400 text-lg">Crie seus \"Brag Documents\" com o poder da Inteligência Artificial.</p>
      </header>

      <!-- Form Section -->
      <section class="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 mb-12 shadow-2xl shadow-emerald-900/10 transition hover:shadow-emerald-900/20">
        <form (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
          <label for="achievement" class="text-sm font-semibold text-slate-300 uppercase tracking-wide">Descreva sua conquista de forma informal</label>
          <textarea
            id="achievement"
            name="achievement"
            [(ngModel)]="prompt"
            rows="5"
            placeholder="Ex: Eu otimizei a API ontem e ficou 10x mais rápida porque coloquei redis, a diretoria gostou..."
            class="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
          ></textarea>
          
          <button
            type="submit"
            [disabled]="!prompt.trim() || bragService.loading()"
            class="group relative self-end inline-flex items-center justify-center gap-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
          >
            @if(bragService.loading()) {
              <div class="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
              <span>Destilando...</span>
            } @else {
              <span>Destilar Conquista</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            }
          </button>
        </form>
      </section>

      <!-- Brags List Section -->
      <section>
        <h2 class="text-2xl font-bold mb-6 flex items-center gap-3">
          <span class="w-8 h-[2px] bg-emerald-500 rounded-full"></span>
          Últimas Conquistas
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          @for (brag of bragService.brags(); track brag.id) {
            <a [routerLink]="['/detail', brag.id]" class="group block bg-slate-800/40 border border-slate-700/50 border-l-4 border-l-emerald-500 rounded-2xl p-6 transition-all hover:bg-slate-800 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-900/20 cursor-pointer">
              <h3 class="text-lg font-bold text-slate-100 mb-2 truncate group-hover:text-emerald-400 transition-colors">{{ brag.title }}</h3>
              <p class="text-slate-400 text-sm line-clamp-3 mb-4">{{ brag.context }}</p>
              
              <div class="flex flex-wrap gap-2 mt-auto">
                @for (tech of brag.technologies; track tech) {
                  <span class="text-xs font-mono bg-slate-900 text-emerald-400 px-2 py-1 rounded-md border border-slate-700">
                    {{ tech }}
                  </span>
                }
              </div>
            </a>
          } @empty {
            <div class="col-span-full py-12 text-center border-2 border-dashed border-slate-700/50 rounded-2xl">
              <div class="w-16 h-16 mx-auto mb-4 bg-slate-800 rounded-full flex items-center justify-center text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </div>
              <p class="text-slate-400">Nenhum Brag Document gerado ainda.<br/>Descreva seu primeiro sucesso acima!</p>
            </div>
          }
        </div>
      </section>
    </div>
  `,
  styles: []
})
export class DashboardComponent {
  bragService = inject(BragService);
  prompt = '';

  onSubmit() {
    if (this.prompt.trim()) {
      this.bragService.generateBrag(this.prompt);
      this.prompt = '';
    }
  }
}
