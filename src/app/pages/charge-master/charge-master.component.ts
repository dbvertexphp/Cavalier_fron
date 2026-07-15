import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaxCategoryOption, TaxRateService } from '../../services/tax-rate.service';

type TaxableMode = 'Pure Agent Always' | 'Pure Agent Optional' | 'Taxable' | 'Exempt';

interface ApplicableTaxRow {
  key: 'ServiceTax' | 'VAT' | 'GST';
  label: string;
  checked: boolean;
  categoryCode: string | null;   // links to TaxCategoryOption.code, sourced from TaxRateService
  taxable: TaxableMode;
  percentage: number;
  override: boolean;
}

interface ChargeMaster {
  id: number;
  code: string;
  globalChargeCode: string;
  name: string;
  globalChargeName: string;
  applicableFor: string[];
  chargeCategory: string;
  chargeType: string;
  iataCode: string;
  taxRows: ApplicableTaxRow[];
}

function freshTaxRows(): ApplicableTaxRow[] {
  return [
    { key: 'ServiceTax', label: 'Service Tax', checked: false, categoryCode: null, taxable: 'Taxable', percentage: 0, override: false },
    { key: 'VAT', label: 'Value Added Tax', checked: false, categoryCode: null, taxable: 'Taxable', percentage: 0, override: false },
    { key: 'GST', label: 'GST', checked: false, categoryCode: null, taxable: 'Taxable', percentage: 0, override: false },
  ];
}

function emptyCharge(): ChargeMaster {
  return {
    id: 0,
    code: '',
    globalChargeCode: '',
    name: '',
    globalChargeName: '',
    applicableFor: [],
    chargeCategory: '',
    chargeType: 'Others',
    iataCode: '',
    taxRows: freshTaxRows(),
  };
}

@Component({
  selector: 'app-charge-master',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './charge-master.component.html',
  styleUrls: ['./charge-master.component.css']
})
export class ChargeMasterComponent implements OnInit {
  // ---- tax categories now come live from the shared service, not a local copy ----
  taxCategoryOptions: TaxCategoryOption[] = [];
  taxCategoriesLoading = false;

  applicableForOptions = ['AIR EXPORT', 'AIR IMPORT', 'SEA EXPORT', 'SEA IMPORT', 'CUSTOM CLEARING', 'DOMESTIC'];
  chargeCategoryOptions = ['Margin', 'Freight', 'Handling', 'Documentation', 'Commission'];
  chargeTypeOptions = ['Others', 'Freight Identification Charge', 'Commission'];
  taxableModes: TaxableMode[] = ['Pure Agent Always', 'Pure Agent Optional', 'Taxable', 'Exempt'];

  // ---- list + filters ----
  searchCode = '';
  searchChargeType = '';
  searchApplicableFor = '';
  searchChargeCategory = '';

  rows: ChargeMaster[] = [
    {
      id: 1, code: 'AAT', globalChargeCode: '', name: 'AAI CHARGES', globalChargeName: '',
      applicableFor: ['AIR EXPORT', 'AIR IMPORT', 'CUSTOM CLEARING'],
      chargeCategory: 'Margin', chargeType: 'Others', iataCode: '',
      taxRows: [
        { key: 'ServiceTax', label: 'Service Tax', checked: false, categoryCode: null, taxable: 'Taxable', percentage: 0, override: false },
        { key: 'VAT', label: 'Value Added Tax', checked: false, categoryCode: null, taxable: 'Taxable', percentage: 0, override: false },
        { key: 'GST', label: 'GST', checked: true, categoryCode: 'FF012179', taxable: 'Taxable', percentage: 100, override: false },
      ],
    },
    {
      id: 2, code: 'AFCE', globalChargeCode: '', name: 'AIR FREIGHT COLLECT', globalChargeName: '',
      applicableFor: ['AIR EXPORT'],
      chargeCategory: 'Freight', chargeType: 'Others', iataCode: 'AIRFREIGHT',
      taxRows: freshTaxRows(),
    },
    {
      id: 3, code: 'AFPE', globalChargeCode: '', name: 'AIR FREIGHT PREPAID', globalChargeName: '',
      applicableFor: ['AIR EXPORT'],
      chargeCategory: 'Freight', chargeType: 'Others', iataCode: 'AIRFREIGHT',
      taxRows: freshTaxRows(),
    },
  ];

  // ---- pagination ----
  currentPage = 1;
  pageSize = 10;

  // ---- Add / Edit modal ----
  isFormOpen = false;
  isEditMode = false;
  form: ChargeMaster = emptyCharge();
  formError = '';

  constructor(private TaxRateService: TaxRateService) {}

  ngOnInit(): void {
    // Stay subscribed so that if a tax rate is added/edited/retired on the Tax Rates page
    // (or by anyone else using the service) while this screen is open, the Category
    // dropdown here updates itself — no manual refresh, no stale/duplicated list.
    this.TaxRateService.activeCategoryOptions$.subscribe(options => {
      this.taxCategoryOptions = options;
    });

    this.taxCategoriesLoading = true;
    this.TaxRateService.loadAll().subscribe({
      next: () => (this.taxCategoriesLoading = false),
      error: () => (this.taxCategoriesLoading = false),
    });
  }

  get filteredRows(): ChargeMaster[] {
    const code = this.searchCode.trim().toLowerCase();
    return this.rows.filter(r => {
      const matchesCode = !code || r.code.toLowerCase().includes(code) || r.name.toLowerCase().includes(code);
      const matchesType = !this.searchChargeType || r.chargeType === this.searchChargeType;
      const matchesApplicable = !this.searchApplicableFor || r.applicableFor.includes(this.searchApplicableFor);
      const matchesCategory = !this.searchChargeCategory || r.chargeCategory === this.searchChargeCategory;
      return matchesCode && matchesType && matchesApplicable && matchesCategory;
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredRows.length / this.pageSize));
  }

  get paginatedRows(): ChargeMaster[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredRows.slice(start, start + this.pageSize);
  }

  get pageNumbers(): number[] {
    const total = this.totalPages;
    const visible = Math.min(5, total);
    let start = Math.max(1, this.currentPage - Math.floor(visible / 2));
    const end = Math.min(total, start + visible - 1);
    start = Math.max(1, end - visible + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  setPage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
  }

  clearFilters() {
    this.searchCode = '';
    this.searchChargeType = '';
    this.searchApplicableFor = '';
    this.searchChargeCategory = '';
    this.currentPage = 1;
  }

  trackById(_i: number, row: ChargeMaster) {
    return row.id;
  }

  activeTaxSummary(row: ChargeMaster): string {
    const active = row.taxRows.filter(t => t.checked);
    if (!active.length) return '—';
    return active.map(t => t.label).join(', ');
  }

  // A charge may have been saved against a tax category that has since been edited or
  // retired ("Not Applicable") on the Tax Rates page. Flag that in the UI rather than
  // silently showing nothing, since that's exactly the kind of drift a shared service
  // is meant to catch instead of hide.
  isCategoryStillValid(code: string | null): boolean {
    if (!code) return true;
    return this.taxCategoryOptions.some(o => o.code === code);
  }

  // ---- Add / Edit ----

  openAddForm() {
    this.isEditMode = false;
    this.form = emptyCharge();
    this.formError = '';
    this.isFormOpen = true;
  }

  openEditForm(row: ChargeMaster) {
    this.isEditMode = true;
    this.form = JSON.parse(JSON.stringify(row));
    this.formError = '';
    this.isFormOpen = true;
  }

  closeForm() {
    this.isFormOpen = false;
    this.form = emptyCharge();
    this.formError = '';
  }

  toggleApplicableFor(option: string, checked: boolean) {
    if (checked) {
      if (!this.form.applicableFor.includes(option)) this.form.applicableFor.push(option);
    } else {
      this.form.applicableFor = this.form.applicableFor.filter(o => o !== option);
    }
  }

  onTaxRowToggle(row: ApplicableTaxRow) {
    if (!row.checked) {
      row.categoryCode = null;
      row.percentage = 0;
      row.override = false;
    }
  }

  categoryLabel(code: string | null): string {
    if (!code) return '';
    const opt = this.taxCategoryOptions.find(o => o.code === code);
    return opt ? `${opt.gstType} — ${opt.name}` : code;
  }

  saveCharge() {
    this.formError = '';

    if (!this.form.code.trim() || !this.form.name.trim()) {
      this.formError = 'Charge Code and Name are required.';
      return;
    }
    if (!this.form.applicableFor.length) {
      this.formError = 'Select at least one "Applicable For" option.';
      return;
    }
    if (!this.form.chargeCategory) {
      this.formError = 'Charge Category is required.';
      return;
    }

    const incompleteTax = this.form.taxRows.find(t => t.checked && !t.categoryCode);
    if (incompleteTax) {
      this.formError = `"${incompleteTax.label}" is checked but no tax Category is selected. Pick a category or uncheck it.`;
      return;
    }

    // Guard against saving a charge against a tax category that's no longer Applicable —
    // this can happen if the Tax Rates page retired that category while this form was open.
    const staleTax = this.form.taxRows.find(t => t.checked && !this.isCategoryStillValid(t.categoryCode));
    if (staleTax) {
      this.formError = `"${staleTax.label}" is mapped to a tax category that is no longer Applicable. Please re-select it.`;
      return;
    }

    if (this.isEditMode) {
      const idx = this.rows.findIndex(r => r.id === this.form.id);
      if (idx > -1) this.rows[idx] = JSON.parse(JSON.stringify(this.form));
    } else {
      const nextId = this.rows.length ? Math.max(...this.rows.map(r => r.id)) + 1 : 1;
      this.rows = [{ ...JSON.parse(JSON.stringify(this.form)), id: nextId }, ...this.rows];
      this.currentPage = 1;
    }

    this.closeForm();
  }

  deleteCharge(row: ChargeMaster) {
    this.rows = this.rows.filter(r => r.id !== row.id);
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
  }
}