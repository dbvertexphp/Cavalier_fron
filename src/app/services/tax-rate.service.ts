import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, of, map, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TaxRate {
  id: number;
  categoryCode: string;
  categoryName: string;
  applicableDate: string;
  cgst: number;
  sgst: number;
  utgst: number;
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
  utgst: number;
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

export interface TaxCategoryOption {
  code: string;
  name: string;
  gstType: string;
  status: 'Applicable' | 'Not Applicable';
}

@Injectable({
  providedIn: 'root'
})
export class TaxRateService {
  // 👇 EK HI source of truth for the URL — environment.apiUrl + '/TaxRates'
  // Backend controller route yehi hai (model TaxRates table se match).
  private apiUrl = `${environment.apiUrl}/TaxRates`;

  constructor(private http: HttpClient) { }

  private readonly _taxRates$ = new BehaviorSubject<TaxRate[]>([]);
  private loaded = false;

  readonly taxRates$: Observable<TaxRate[]> = this._taxRates$.asObservable();

  readonly activeCategoryOptions$: Observable<TaxCategoryOption[]> = this.taxRates$.pipe(
    map(rows => rows
      .filter(r => r.status === 'Applicable')
      .map(r => ({ code: r.categoryCode, name: r.categoryName, gstType: r.gstType, status: r.status }))
    ),
    shareReplay(1)
  );

  /** Loads tax rates from the API once; subsequent calls are no-ops unless force=true. */
  loadAll(force = false): Observable<TaxRate[]> {
    if (this.loaded && !force) {
      return this.taxRates$;
    }
    return this.http.get<TaxRate[]>(this.apiUrl).pipe(   // ✅ FIX: this.apiUrl (not API_BASE)
      tap(rows => {
        this._taxRates$.next(rows);
        this.loaded = true;
      }),
      catchError(err => {
        console.error('Failed to load tax rates from API:', err);
        return of(this._taxRates$.value);
      })
    );
  }

  refresh(): Observable<TaxRate[]> {
    return this.loadAll(true);
  }

  getSnapshot(): TaxRate[] {
    return this._taxRates$.value;
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(   // ✅ FIX: this.apiUrl
      tap(() => {
        this._taxRates$.next(this._taxRates$.value.filter(r => r.id !== id));
      })
    );
  }

  getAll(): Observable<TaxRate[]> {
    return this.http.get<TaxRate[]>(this.apiUrl);
  }

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

  getById(id: number): Observable<TaxRate> {
    return this.http.get<TaxRate>(`${this.apiUrl}/${id}`);
  }

  create(data: TaxRateRequest): Observable<TaxRate> {
    return this.http.post<TaxRate>(this.apiUrl, data).pipe(
      tap(created => this._taxRates$.next([created, ...this._taxRates$.value]))
    );
  }

  update(id: number, data: TaxRateRequest): Observable<TaxRate> {
    return this.http.put<TaxRate>(`${this.apiUrl}/${id}`, data).pipe(
      tap(updated => {
        const rows = this._taxRates$.value.map(r => (r.id === updated.id ? updated : r));
        this._taxRates$.next(rows);
      })
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this._taxRates$.next(this._taxRates$.value.filter(r => r.id !== id));
      })
    );
  }

  getGroups(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/groups`);
  }

  getGstTypes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/gsttypes`);
  }

  getStatuses(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/statuses`);
  }
}