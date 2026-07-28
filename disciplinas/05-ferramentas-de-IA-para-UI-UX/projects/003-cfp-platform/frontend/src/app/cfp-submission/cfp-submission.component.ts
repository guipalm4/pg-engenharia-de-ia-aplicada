import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { SpeakerDTO } from '@cfp-platform/shared-types';

export type SubmissionStatus = 'idle' | 'loading' | 'success' | 'error';

@Component({
  selector: 'app-cfp-submission',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cfp-submission.component.html',
  styleUrl: './cfp-submission.component.css',
})
export class CfpSubmissionComponent {
  private http = inject(HttpClient);

  // Form Signals (Task 2.2)
  name = signal('');
  email = signal('');
  talkTitle = signal('');
  isGDE = signal(false);
  submissionStatus = signal<SubmissionStatus>('idle');
  errorMessage = signal<string | null>(null);

  // Submission Logic (Task 2.4)
  async submit() {
    if (this.submissionStatus() === 'loading') return;

    this.submissionStatus.set('loading');
    this.errorMessage.set(null);

    const payload: Partial<SpeakerDTO> = {
      name: this.name(),
      email: this.email(),
      talkTitle: this.talkTitle(),
      isGDE: this.isGDE(),
    };

    this.http.post<SpeakerDTO>('/api/speakers', payload).subscribe({
      next: () => {
        this.submissionStatus.set('success');
        this.resetForm();
      },
      error: (err) => {
        this.submissionStatus.set('error');
        this.errorMessage.set(err.error?.message || 'An unexpected error occurred.');
      }
    });
  }

  private resetForm() {
    this.name.set('');
    this.email.set('');
    this.talkTitle.set('');
    this.isGDE.set(false);
  }
}
