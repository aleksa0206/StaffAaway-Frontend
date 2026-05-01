import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LeavesService } from './services/leaves.service';
import { LeaveBalance, LeaveType } from '../../core/models/leaves.models';

@Component({
  selector: 'app-leave-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './leave-request.component.html',
  styleUrls: ['./leave-request.component.scss']
})
export class LeaveRequestComponent implements OnInit {
  
  leaveForm: FormGroup;
  balance: LeaveBalance[] = [];
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  selectedType: LeaveType = 'godisnji_odmor';
  workingDays = 0;

 leaveTypes: { value: LeaveType; label: string; icon: string; color: string }[] = [
  { value: 'godisnji_odmor', label: 'Godišnji odmor', icon: '🌴', color: '#0D4A35' },
  { value: 'bolovanje', label: 'Bolovanje', icon: '🏥', color: '#E8992A' },
  { value: 'slobodan_dan', label: 'Slobodan dan', icon: '☀️', color: '#2563EB' },
  { value: 'sluzbeni_put', label: 'Službeni put', icon: '✈️', color: '#7C3AED' },
];

  // Kalendar
  currentDate = new Date();
  calendarDays: any[] = [];
  monthNames = [
    'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun',
    'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'
  ];

  constructor(
    private fb: FormBuilder,
    private leavesService: LeavesService,
    private router: Router
  ) {
    this.leaveForm = this.fb.group({
      type: ['godisnji_odmor', Validators.required],
      date_from: ['', Validators.required],
      date_to: ['', Validators.required],
      note: ['']
    });
  }

  ngOnInit(): void {
    this.loadBalance();
    this.generateCalendar();

    // Prati promene datuma
    this.leaveForm.get('date_from')?.valueChanges.subscribe(() => {
      this.calculateWorkingDays();
      this.generateCalendar();
    });
    this.leaveForm.get('date_to')?.valueChanges.subscribe(() => {
      this.calculateWorkingDays();
      this.generateCalendar();
    });
  }

  loadBalance(): void {
    this.leavesService.getBalance().subscribe({
      next: (balance) => this.balance = balance,
      error: (err) => console.error(err)
    });
  }

  selectType(type: LeaveType): void {
    this.selectedType = type;
    this.leaveForm.patchValue({ type });
  }

  calculateWorkingDays(): void {
    const from = this.leaveForm.get('date_from')?.value;
    const to = this.leaveForm.get('date_to')?.value;

    if (!from || !to) return;

    const start = new Date(from);
    const end = new Date(to);

    if (end < start) {
      this.workingDays = 0;
      return;
    }

    let days = 0;
    const cur = new Date(start);
    while (cur <= end) {
      const d = cur.getDay();
      if (d !== 0 && d !== 6) days++;
      cur.setDate(cur.getDate() + 1);
    }
    this.workingDays = days;
  }

  generateCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Ponedeljak = 0
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;

    const days: any[] = [];

    // Prethodni mesec
    for (let i = startDay - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push({ date: d, other: true });
    }

    // Trenutni mesec
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i);
      days.push({ date: d, other: false });
    }

    // Sledeći mesec
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ date: d, other: true });
    }

    this.calendarDays = days;
  }

  prevMonth(): void {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() - 1,
      1
    );
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1,
      1
    );
    this.generateCalendar();
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  isWeekend(date: Date): boolean {
    return date.getDay() === 0 || date.getDay() === 6;
  }

  isInRange(date: Date): boolean {
    const from = this.leaveForm.get('date_from')?.value;
    const to = this.leaveForm.get('date_to')?.value;
    if (!from || !to) return false;
    const d = date.getTime();
    return d >= new Date(from).getTime() && d <= new Date(to).getTime();
  }

  isRangeStart(date: Date): boolean {
    const from = this.leaveForm.get('date_from')?.value;
    if (!from) return false;
    return date.toDateString() === new Date(from).toDateString();
  }

  isRangeEnd(date: Date): boolean {
    const to = this.leaveForm.get('date_to')?.value;
    if (!to) return false;
    return date.toDateString() === new Date(to).toDateString();
  }

  getBalanceForType(type: string): LeaveBalance | undefined {
    return this.balance.find(b => b.type === type);
  }

  getBalancePercent(b: LeaveBalance): number {
    return Math.round((b.used / b.total) * 100);
  }

  getBalanceColor(type: string): string {
    const colors: Record<string, string> = {
      godisnji_odmor: '#0D4A35',
      bolovanje: '#E8992A',
      slobodan_dan: '#2563EB',
      sluzbeni_put: '#7C3AED'
    };
    return colors[type] || '#0D4A35';
  }

  getBalanceLabel(type: string): string {
    const labels: Record<string, string> = {
      godisnji_odmor: 'Godišnji odmor',
      bolovanje: 'Bolovanje',
      slobodan_dan: 'Slobodni dani',
      sluzbeni_put: 'Službeni put'
    };
    return labels[type] || type;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('sr-RS', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  onSubmit(): void {
    if (this.leaveForm.invalid || this.workingDays === 0) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    const data = {
      ...this.leaveForm.value,
      working_days: this.workingDays
    };

    this.leavesService.createLeaveRequest(data).subscribe({
      next: () => {
        this.successMessage = 'Zahtev je uspešno poslat!';
        this.isSubmitting = false;
        setTimeout(() => this.router.navigate(['/dashboard']), 2000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Greška pri slanju zahteva.';
        this.isSubmitting = false;
      }
    });
  }
}