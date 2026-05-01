import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { LeaveRequest, CreateLeaveRequest, LeaveBalance } from '../../../core/models/leaves.models';

@Injectable({
  providedIn: 'root'
})
export class LeavesService {
  private readonly API_URL = `${environment.apiUrl}/leaves`;

  constructor(private http: HttpClient) {}

  createLeaveRequest(data: CreateLeaveRequest): Observable<LeaveRequest> {
    return this.http.post<LeaveRequest>(this.API_URL, data);
  }

  getMyRequests(): Observable<LeaveRequest[]> {
    return this.http.get<LeaveRequest[]>(this.API_URL);
  }

  getBalance(): Observable<LeaveBalance[]> {
    return this.http.get<LeaveBalance[]>(`${this.API_URL}/balance`);
  }
}