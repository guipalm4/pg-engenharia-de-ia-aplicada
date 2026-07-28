import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { EventDTO } from '@cfp-platform/shared-types';

export type RegistrationStatus = 'idle' | 'loading' | 'success' | 'error';

@Component({
  selector: 'app-event-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './event-registration.component.html',
  styleUrl: './event-registration.component.css',
})
export class EventRegistrationComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

  registrationStatus = signal<RegistrationStatus>('idle');
  errorMessage = signal<string | null>(null);

  eventForm = this.fb.nonNullable.group({
    nome: ['', [Validators.required]],
    endereco: ['', [Validators.required]],
    capacidade: [0, [Validators.required, Validators.min(1)]],
    data: ['', [Validators.required]],
  });

  async onSubmit() {
    if (this.eventForm.invalid || this.registrationStatus() === 'loading') {
      this.eventForm.markAllAsTouched();
      return;
    }

    this.registrationStatus.set('loading');
    this.errorMessage.set(null);

    const payload = this.eventForm.getRawValue();

    this.http.post<EventDTO>('/api/events', payload).subscribe({
      next: () => {
        this.registrationStatus.set('success');
        this.eventForm.reset();
      },
      error: (err) => {
        this.registrationStatus.set('error');
        this.errorMessage.set(
          err.error?.message || 'Ocorreu um erro inesperado ao cadastrar o evento.'
        );
      },
    });
  }
}
