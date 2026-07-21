import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ErrorModal } from '../components/error-modal/error-modal';
import { PixReceiptComponent } from '../pix-receipt/pix-receipt';

@Component({
  selector: 'app-pix-transfer',
  standalone: true,
  imports: [FormsModule, ErrorModal, PixReceiptComponent],
  templateUrl: './pix-transfer.html',
  styleUrl: './pix-transfer.css'
})
export class PixTransfer {
  pixKey = signal('');
  transferAmount = signal<number | null>(null);
  schedulingDate = signal('');

  showErrorModal = signal(false);
  transferReceiptData = signal<{ nome: string, valor: number } | null>(null);

  onSubmit() {
    const amount = this.transferAmount() || 0;

    if (amount > 5000) {
      this.showErrorModal.set(true);
      return;
    }

    this.transferReceiptData.set({
      nome: this.pixKey(),
      valor: amount
    });
  }
}
