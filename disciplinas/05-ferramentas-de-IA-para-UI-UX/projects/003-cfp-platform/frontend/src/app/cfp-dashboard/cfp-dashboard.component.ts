import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { SpeakerDTO } from '@cfp-platform/shared-types';

@Component({
  selector: 'app-cfp-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cfp-dashboard.component.html',
  styleUrl: './cfp-dashboard.component.css'
})
export class CfpDashboardComponent implements OnInit {
  private http = inject(HttpClient);

  submissions = signal<SpeakerDTO[]>([]);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.fetchSpeakers();
  }

  fetchSpeakers() {
    this.isLoading.set(true);
    this.error.set(null);

    this.http.get<SpeakerDTO[]>('/api/speakers').subscribe({
      next: (data) => {
        this.submissions.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching speakers:', err);
        this.error.set('Failed to load submissions. Please try again later.');
        this.isLoading.set(false);
      }
    });
  }
}
