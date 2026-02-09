import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-storage-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './storage-widget.component.html'
})
export class StorageWidgetComponent {
  // Data Properties
  usedStorage: number = 62.52;
  totalAllocation: number = 66.50;
  asOnDate: string = '09-Feb-2026 02:33 PM'; // Updated to latest sync

  /** * Asli percentage calculate karne ke liye 
   */
  get percentage(): number {
    if (this.totalAllocation === 0) return 0;
    return (this.usedStorage / this.totalAllocation) * 100;
  }

  /** * Progress bar ki width hamesha 0-100 ke beech rakhne ke liye 
   * (Taki bar card se bahar na nikal jaye)
   */
  get barWidth(): number {
    return Math.min(this.percentage, 100);
  }

  /** * Storage level ke hisaab se color badalne ke liye
   */
  get statusColor(): string {
    const p = this.percentage;
    if (p >= 100) return 'text-rose-600 bg-rose-500'; // Critical Over-limit
    if (p >= 90) return 'text-orange-600 bg-orange-500'; // Warning
    return 'text-emerald-600 bg-emerald-500'; // Healthy
  }

  get isOverLimit(): boolean {
    return this.percentage > 100;
  }
}