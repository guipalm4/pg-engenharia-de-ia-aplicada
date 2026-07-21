import { Component, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'received' | 'sent';
  date: string;
}

@Component({
  selector: 'app-pix-history',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './pix-history.component.html',
  styleUrl: './pix-history.component.css'
})
export class PixHistoryComponent {
  transactions = signal<Transaction[]>([
    { id: '1', title: 'Transferência Recebida', amount: 150.00, type: 'received', date: '2023-10-27T10:00:00Z' },
    { id: '2', title: 'Transferência Enviada', amount: 50.00, type: 'sent', date: '2023-10-26T15:30:00Z' },
    { id: '3', title: 'Transferência Recebida', amount: 300.50, type: 'received', date: '2023-10-25T09:15:00Z' }
  ]);
}
