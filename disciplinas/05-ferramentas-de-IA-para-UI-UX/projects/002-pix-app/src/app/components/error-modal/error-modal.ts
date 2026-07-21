import { Component, input, output, HostListener, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-error-modal',
  standalone: true,
  imports: [],
  templateUrl: './error-modal.html',
  styleUrl: './error-modal.css',
})
export class ErrorModal implements AfterViewInit {
  // Estado recebido via Signals
  title = input.required<string>();
  message = input.required<string>();

  // Ação de fechamento
  close = output<void>();

  @ViewChild('closeBtn') closeBtn?: ElementRef<HTMLButtonElement>;

  // A11y: Fechamento com tecla ESC
  @HostListener('document:keydown.escape')
  onEscape() {
    this.close.emit();
  }

  // A11y: Trap e gerenciamento de foco inicial
  ngAfterViewInit() {
    this.closeBtn?.nativeElement.focus();
  }
}
