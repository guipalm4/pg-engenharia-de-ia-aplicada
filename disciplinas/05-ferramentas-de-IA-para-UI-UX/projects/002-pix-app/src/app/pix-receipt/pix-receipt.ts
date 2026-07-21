import { Component, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-pix-receipt',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './pix-receipt.html',
  styleUrl: './pix-receipt.css'
})
export class PixReceiptComponent {
  nome = input.required<string>();
  valor = input.required<number>();
}
