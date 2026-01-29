import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common'; // FIX: Resolves ngClass errors

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule], // FIX: Required for [ngClass] to work
  templateUrl: './stat-card.component.html',
  styleUrls: ['./stat-card.component.css']
})
export class StatCardComponent {
  // FIX: Resolves "Property does not exist" errors (TS2339)
  @Input() title: string = '';
  @Input() value: string = '';
  @Input() trend: string = '';
  @Input() isPositive: boolean = true;
  @Input() isPrimary: boolean = false;
}