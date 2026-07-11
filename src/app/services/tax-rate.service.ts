import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TaxRate {
  id: number;
  categoryCode: string;
  categoryName: string;
  applicableDate: string;
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
  otherTax: number;
  abatement: number;
  liabilitySupplier: number;
  liabilityRecipient: number;
  diffPostingPercent: number;
  billPrintingRemark: string;
  group: string;
  gstType: string;
  status: 'Applicable' | 'Not Applicable';
  selected: boolean;
  createdBy?: string;
  createdAt?: string;
  modifiedBy?: string;
  modifiedAt?: string;
}

export interface TaxRateRequest {
  categoryCode: string;
  categoryName: string;
  applicableDate: string;
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
  otherTax: number;
  abatement: number;
  liabilitySupplier: number;
  liabilityRecipient: number;
  diffPostingPercent: number;
  billPrintingRemark: string;
  group: string;
  gstType: string;
  status: string;
  selected: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TaxRateFilter {
  searchTerm?: string;
  group?: string;
  gstType?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

@Injectable({
  providedIn: 'root'
})
export class TaxRateService {
  private apiUrl = `${environment.apiUrl}/TaxRates`;

  constructor(private http: HttpClient) {}

  // Get all tax rates
  getAll(): Observable<TaxRate[]> {
    return this.http.get<TaxRate[]>(this.apiUrl);
  }

  // Get filtered tax rates with pagination
  getFiltered(filter: TaxRateFilter): Observable<PaginatedResponse<TaxRate>> {
    let params = new HttpParams();
    
    if (filter.searchTerm) params = params.set('searchTerm', filter.searchTerm);
    if (filter.group) params = params.set('group', filter.group);
    if (filter.gstType) params = params.set('gstType', filter.gstType);
    if (filter.status) params = params.set('status', filter.status);
    if (filter.page) params = params.set('page', filter.page.toString());
    if (filter.pageSize) params = params.set('pageSize', filter.pageSize.toString());

    return this.http.get<PaginatedResponse<TaxRate>>(`${this.apiUrl}/filter`, { params });
  }

  // Get single tax rate by ID
  getById(id: number): Observable<TaxRate> {
    return this.http.get<TaxRate>(`${this.apiUrl}/${id}`);
  }

  // Create new tax rate
  create(data: TaxRateRequest): Observable<TaxRate> {
    return this.http.post<TaxRate>(this.apiUrl, data);
  }

  // Update tax rate
  update(id: number, data: TaxRateRequest): Observable<TaxRate> {
    return this.http.put<TaxRate>(`${this.apiUrl}/${id}`, data);
  }

  // Delete tax rate
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Get all groups for dropdown
  getGroups(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/groups`);
  }

  // Get all GST types for dropdown
  getGstTypes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/gsttypes`);
  }

  // Get all statuses for dropdown
  getStatuses(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/statuses`);
  }
}