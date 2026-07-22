import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ChargeTaxRowDto {
  key: string;            // "ServiceTax" | "VAT" | "GST"
  label: string;
  checked: boolean;
  categoryCode: string | null;
  taxable: string;        // "Pure Agent Always" | "Pure Agent Optional" | "Taxable" | "Exempt"
  percentage: number;
  override: boolean;
}

export interface ChargeDto {
  id: number;
  code: string;
  globalChargeCode: string | null;
  name: string;
  globalChargeName: string | null;
  applicableFor: string[];
  chargeCategory: string;
  chargeType: string;
  iataCode: string | null;
  taxRows: ChargeTaxRowDto[];
  createdAtUtc: string;
  updatedAtUtc: string | null;
}

export interface ChargeUpsertDto {
  code: string;
  globalChargeCode?: string | null;
  name: string;
  globalChargeName?: string | null;
  applicableFor: string[];
  chargeCategory: string;
  chargeType: string;
  iataCode?: string | null;
  taxRows: {
    key: string;
    checked: boolean;
    categoryCode: string | null;
    taxable: string;
    percentage: number;
    override: boolean;
  }[];
}

export interface ChargeFilter {
  code?: string;
  chargeType?: string;
  applicableFor?: string;
  chargeCategory?: string;
  page?: number;
  pageSize?: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })
export class ChargeService {
  // Controller route [Route("api/[controller]")] on ChargeMasterController resolves to api/ChargeMaster
  private apiUrl = environment.apiUrl + '/ChargeMaster';

  constructor(private http: HttpClient) {}

  getAll(filter: ChargeFilter): Observable<PagedResult<ChargeDto>> {
    let params = new HttpParams();
    if (filter.code) params = params.set('code', filter.code);
    if (filter.chargeType) params = params.set('chargeType', filter.chargeType);
    if (filter.applicableFor) params = params.set('applicableFor', filter.applicableFor);
    if (filter.chargeCategory) params = params.set('chargeCategory', filter.chargeCategory);
    params = params.set('page', String(filter.page ?? 1));
    params = params.set('pageSize', String(filter.pageSize ?? 10));

    return this.http.get<PagedResult<ChargeDto>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<ChargeDto> {
    return this.http.get<ChargeDto>(`${this.apiUrl}/${id}`);
  }

  create(dto: ChargeUpsertDto): Observable<ChargeDto> {
    return this.http.post<ChargeDto>(this.apiUrl, dto);
  }

  update(id: number, dto: ChargeUpsertDto): Observable<ChargeDto> {
    return this.http.put<ChargeDto>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}