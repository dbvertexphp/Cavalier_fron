import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import Swal from "sweetalert2";

import {
  TaxCategoryOption,
  TaxRateService,
} from "../../services/tax-rate.service";
import {
  CompanyServiceApiService,
  CompanyServiceOption,
} from "../../services/company-service.service";
import {
  ChargeService,
  ChargeDto,
  ChargeUpsertDto,
  ChargeFilter,
} from "../../services/Charge.service";

type TaxableMode =
  | "Pure Agent Always"
  | "Pure Agent Optional"
  | "Taxable"
  | "Exempt";

interface ApplicableTaxRow {
  key: "ServiceTax" | "VAT" | "GST";
  label: string;
  checked: boolean;
  categoryCode: string | null;
  taxable: TaxableMode;
  percentage: number;
  override: boolean;
}

// Local form/view shape — mirrors ChargeDto but keeps a fixed 3-row taxRows
// array (ServiceTax/VAT/GST) so the UI logic (onTaxRowToggle, etc.) stays simple.
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
    {
      key: "ServiceTax",
      label: "Service Tax",
      checked: false,
      categoryCode: null,
      taxable: "Taxable",
      percentage: 0,
      override: false,
    },
    {
      key: "VAT",
      label: "Value Added Tax",
      checked: false,
      categoryCode: null,
      taxable: "Taxable",
      percentage: 0,
      override: false,
    },
    {
      key: "GST",
      label: "GST",
      checked: false,
      categoryCode: null,
      taxable: "Taxable",
      percentage: 0,
      override: false,
    },
  ];
}

function emptyCharge(): ChargeMaster {
  return {
    id: 0,
    code: "",
    globalChargeCode: "",
    name: "",
    globalChargeName: "",
    applicableFor: [],
    chargeCategory: "",
    chargeType: "Others",
    iataCode: "",
    taxRows: freshTaxRows(),
  };
}

// ---- mapping helpers between backend ChargeDto and local ChargeMaster ----

function dtoToChargeMaster(dto: ChargeDto): ChargeMaster {
  const rows = freshTaxRows();
  dto.taxRows.forEach((t) => {
    const row = rows.find((r) => r.key === t.key);
    if (row) {
      row.checked = t.checked;
      row.categoryCode = t.categoryCode;
      row.taxable = (t.taxable as TaxableMode) || "Taxable";
      row.percentage = t.percentage;
      row.override = t.override;
    }
  });

  return {
    id: dto.id,
    code: dto.code,
    globalChargeCode: dto.globalChargeCode || "",
    name: dto.name,
    globalChargeName: dto.globalChargeName || "",
    applicableFor: dto.applicableFor || [],
    chargeCategory: dto.chargeCategory,
    chargeType: dto.chargeType,
    iataCode: dto.iataCode || "",
    taxRows: rows,
  };
}

function chargeMasterToUpsertDto(form: ChargeMaster): ChargeUpsertDto {
  return {
    code: form.code.trim(),
    globalChargeCode: form.globalChargeCode || null,
    name: form.name.trim(),
    globalChargeName: form.globalChargeName || null,
    applicableFor: form.applicableFor,
    chargeCategory: form.chargeCategory,
    chargeType: form.chargeType,
    iataCode: form.iataCode || null,
    taxRows: form.taxRows.map((t) => ({
      key: t.key,
      checked: t.checked,
      categoryCode: t.checked ? t.categoryCode : null,
      taxable: t.taxable,
      percentage: t.checked ? t.percentage : 0,
      override: t.checked && t.override,
    })),
  };
}

@Component({
  selector: "app-charge-master",
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: "./charge-master.component.html",
  styleUrls: ["./charge-master.component.css"],
})
export class ChargeMasterComponent implements OnInit {
  // ---- tax categories (for the searchable category picker) ----
  taxCategoryOptions: TaxCategoryOption[] = [];
  taxCategoriesLoading = false;

  // ---- Line of Business ("Applicable For") — live from CompanyService API ----
  applicableForOptions: CompanyServiceOption[] = [];
  applicableForLoading = false;
  applicableForSearch = "";

  chargeCategoryOptions = [
    "Margin",
    "Freight",
    "Handling",
    "Documentation",
    "Commission",
  ];
  chargeTypeOptions = ["Others", "Freight Identification Charge", "Commission"];
  taxableModes: TaxableMode[] = [
    "Pure Agent Always",
    "Pure Agent Optional",
    "Taxable",
    "Exempt",
  ];

  // ---- list + filters (server-side, mirrors tax-rates.component.ts pattern) ----
  searchCode = "";
  searchChargeType = "";
  searchApplicableFor = "";
  searchChargeCategory = "";

  rows: ChargeMaster[] = [];
  isLoading = false;
  totalCount = 0;
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  // ---- Add / Edit modal ----
  isFormOpen = false;
  isEditMode = false;
  form: ChargeMaster = emptyCharge();
  formError = "";
  isSaving = false;

  // ---- searchable tax-category picker  // ---- tax rows state ----
  categorySearch: { [key: string]: string } = {};
  categoryGstTypeFilter: { [key: string]: string } = {};
  openCategoryDropdownFor: string | null = null;
  activeCategoryRow: ApplicableTaxRow | null = null;
  categoryDropdownPos = { top: 0, left: 0, width: 0 };

  constructor(
    private TaxRateService: TaxRateService,
    private companyServiceApi: CompanyServiceApiService,
    private chargeService: ChargeService,
  ) { }

  ngOnInit(): void {
    // Tax categories — live subscription, same pattern used elsewhere in the app.
    this.TaxRateService.activeCategoryOptions$.subscribe((options) => {
      this.taxCategoryOptions = options;
    });

    this.taxCategoriesLoading = true;
    this.TaxRateService.loadAll().subscribe({
      next: () => (this.taxCategoriesLoading = false),
      error: () => (this.taxCategoriesLoading = false),
    });

    // Line of Business — live subscription from CompanyService.
    this.companyServiceApi.activeServices$.subscribe((options) => {
      this.applicableForOptions = options;
    });

    this.applicableForLoading = true;
    this.companyServiceApi.loadActiveServices().subscribe({
      next: () => (this.applicableForLoading = false),
      error: () => (this.applicableForLoading = false),
    });

    // Charges themselves — actually hit the backend now.
    this.loadData();
  }

  // ============================================
  // LOAD DATA FROM API
  // ============================================

  loadData(): void {
    this.isLoading = true;

    const filter: ChargeFilter = {
      code: this.searchCode || undefined,
      chargeType: this.searchChargeType || undefined,
      applicableFor: this.searchApplicableFor || undefined,
      chargeCategory: this.searchChargeCategory || undefined,
      page: this.currentPage,
      pageSize: this.pageSize,
    };

    this.chargeService.getAll(filter).subscribe({
      next: (response) => {
        this.rows = response.items.map(dtoToChargeMaster);
        this.totalCount = response.totalCount;
        this.currentPage = response.page;
        this.pageSize = response.pageSize;
        this.totalPages = response.totalPages;
        this.isLoading = false;
      },
      error: (error) => {
        console.error("Error loading charges:", error);
        this.isLoading = false;
        this.showErrorAlert("Failed to load charge master records.");
      },
    });
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadData();
  }

  // filteredRows kept for template compatibility — server already filters,
  // this getter just exposes the currently loaded page.
  get filteredRows(): ChargeMaster[] {
    return this.rows;
  }

  get paginatedRows(): ChargeMaster[] {
    return this.rows;
  }

  get pageNumbers(): number[] {
    const total = this.totalPages;
    const visible = Math.min(5, total);
    let start = Math.max(1, this.currentPage - Math.floor(visible / 2));
    const end = Math.min(total, start + visible - 1);
    start = Math.max(1, end - visible + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  // Search box inside the Add/Edit modal that filters the Line of Business checklist.
  get filteredApplicableForOptions(): CompanyServiceOption[] {
    const term = this.applicableForSearch.trim().toLowerCase();
    if (!term) return this.applicableForOptions;
    return this.applicableForOptions.filter((o) =>
      o.serviceName.toLowerCase().includes(term),
    );
  }

  setPage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
    this.loadData();
  }

  clearFilters() {
    this.searchCode = "";
    this.searchChargeType = "";
    this.searchApplicableFor = "";
    this.searchChargeCategory = "";
    this.currentPage = 1;
    this.loadData();
  }

  trackById(_i: number, row: ChargeMaster) {
    return row.id;
  }

  activeTaxSummary(row: ChargeMaster): string {
    const active = row.taxRows.filter((t) => t.checked);
    if (!active.length) return "—";
    return active.map((t) => t.label).join(", ");
  }

  // A charge may have been saved against a tax category that has since been
  // edited or retired ("Not Applicable") on the Tax Rates page.
  isCategoryStillValid(code: string | null): boolean {
    if (!code) return true;
    return this.taxCategoryOptions.some((o) => o.code === code);
  }

  // ============================================
  // ADD / EDIT
  // ============================================

  openAddForm() {
    this.isEditMode = false;
    this.form = emptyCharge();
    this.formError = "";
    this.applicableForSearch = "";
    this.categorySearch = { ServiceTax: "", VAT: "", GST: "" };
    this.categoryGstTypeFilter = { ServiceTax: "", VAT: "", GST: "" };
    this.isFormOpen = true;
  }

  openEditForm(row: ChargeMaster) {
    this.isEditMode = true;
    this.form = JSON.parse(JSON.stringify(row));
    this.formError = "";
    this.applicableForSearch = "";

    this.categorySearch = { ServiceTax: "", VAT: "", GST: "" };
    this.categoryGstTypeFilter = { ServiceTax: "", VAT: "", GST: "" };

    this.form.taxRows.forEach((t) => {
      if (t.categoryCode) {
        this.categorySearch[t.key] = this.categoryLabel(t.categoryCode);
        const opt = this.taxCategoryOptions.find((o) => o.code === t.categoryCode);
        if (opt) {
          // Normalize to upper case and trim so it matches the <option> value exactly
          this.categoryGstTypeFilter[t.key] = (opt.gstType || "").trim().toUpperCase();
        }
      }
    });

    this.isFormOpen = true;
  }

  closeForm() {
    this.isFormOpen = false;
    this.form = emptyCharge();
    this.formError = "";
    this.applicableForSearch = "";
    this.categorySearch = { ServiceTax: "", VAT: "", GST: "" };
    this.openCategoryDropdownFor = null;
    this.activeCategoryRow = null;
  }

  toggleApplicableFor(serviceName: string, checked: boolean) {
    if (checked) {
      if (!this.form.applicableFor.includes(serviceName))
        this.form.applicableFor.push(serviceName);
    } else {
      this.form.applicableFor = this.form.applicableFor.filter(
        (o) => o !== serviceName,
      );
    }
  }

  onTaxRowToggle(row: ApplicableTaxRow) {
    if (!row.checked) {
      row.categoryCode = null;
      row.percentage = 0;
      row.override = false;
      this.categorySearch[row.key] = "";
      this.categoryGstTypeFilter[row.key] = "";
    }
  }

  categoryLabel(code: string | null): string {
    if (!code) return "";
    const opt = this.taxCategoryOptions.find((o) => o.code === code);
    return opt ? opt.name : code;
  }

  // ---- searchable tax-category dropdown ----

  filteredCategoryOptions(rowKey: string): TaxCategoryOption[] {
    const term = (this.categorySearch[rowKey] || "").trim().toLowerCase();
    const gstTypeFilter = this.categoryGstTypeFilter[rowKey] || "";

    let filtered = this.taxCategoryOptions;
    if (gstTypeFilter) {
      const normalizedFilter = gstTypeFilter.trim().toUpperCase();
      filtered = filtered.filter((o) => (o.gstType || "").trim().toUpperCase() === normalizedFilter);
    }

    if (!term) return filtered;
    return filtered.filter(
      (o) =>
        o.name.toLowerCase().includes(term) ||
        o.code.toLowerCase().includes(term) ||
        (o.gstType || "").toLowerCase().includes(term),
    );
  }

  openCategoryDropdown(
    rowKey: string,
    row: ApplicableTaxRow,
    event: FocusEvent,
  ) {
    this.openCategoryDropdownFor = rowKey;
    this.activeCategoryRow = row;

    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    this.categoryDropdownPos = {
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    };
  }

  closeCategoryDropdown() {
    setTimeout(() => {
      this.openCategoryDropdownFor = null;
      this.activeCategoryRow = null;
    }, 150);
  }

  // Category select hote hi % hamesha 100 se start ho aur field disabled rahe
  // (Override false hone ki wajah se). Admin Override tick karega tabhi edit ho payega.
  selectCategory(row: ApplicableTaxRow, opt: TaxCategoryOption) {
    row.categoryCode = opt.code;
    this.categorySearch[row.key] = `${opt.name}`;
    this.openCategoryDropdownFor = null;
    this.activeCategoryRow = null;

    if (row.taxable === "Taxable") {
      row.percentage = 100;
      row.override = false;
    }
  }

  onGstTypeFilterChange(row: ApplicableTaxRow) {
    row.categoryCode = null;
    this.categorySearch[row.key] = "";
    row.percentage = 0;
    row.override = false;
  }

  onTaxableChange(row: ApplicableTaxRow) {
    if (row.taxable === "Taxable") {
      row.percentage = 100;
      row.override = false;
    }
  }

  onOverrideToggle(row: ApplicableTaxRow) {
    if (!row.override && row.taxable === "Taxable") {
      row.percentage = 100;
    }
  }

  get dynamicPercentHeader(): string {
    const gstRow = this.form.taxRows.find((r) => r.key === "GST");
    const activeRow = (gstRow && gstRow.checked) ? gstRow : this.form.taxRows.find((r) => r.checked);
    if (activeRow) {
      return activeRow.taxable === "Taxable" ? "Taxable %" : `${activeRow.taxable} %`;
    }
    return "%";
  }



  // ============================================
  // SAVE / DELETE — now hitting the real backend
  // ============================================

  saveCharge() {
    this.formError = "";

    if (!this.form.code.trim() || !this.form.name.trim()) {
      this.formError = "Charge Code and Name are required.";
      this.showErrorAlert(this.formError);
      return;
    }
    if (!this.form.applicableFor.length) {
      this.formError = 'Select at least one "Applicable For" option.';
      this.showErrorAlert(this.formError);
      return;
    }
    if (!this.form.chargeCategory) {
      this.formError = "Charge Category is required.";
      this.showErrorAlert(this.formError);
      return;
    }

    const incompleteTax = this.form.taxRows.find(
      (t) => t.checked && !t.categoryCode,
    );
    if (incompleteTax) {
      this.formError = `"${incompleteTax.label}" is checked but no tax Category is selected. Pick a category or uncheck it.`;
      this.showErrorAlert(this.formError);
      return;
    }

    const staleTax = this.form.taxRows.find(
      (t) => t.checked && !this.isCategoryStillValid(t.categoryCode),
    );
    if (staleTax) {
      this.formError = `"${staleTax.label}" is mapped to a tax category that is no longer Applicable. Please re-select it.`;
      this.showErrorAlert(this.formError);
      return;
    }

    const dto = chargeMasterToUpsertDto(this.form);
    this.isSaving = true;

    if (this.isEditMode) {
      this.chargeService.update(this.form.id, dto).subscribe({
        next: () => {
          this.isSaving = false;
          this.closeForm();
          this.loadData();
          this.showSuccessAlert("Updated!", `${dto.code} has been updated.`);
        },
        error: (error) => {
          console.error("Error updating charge:", error);
          this.isSaving = false;
          this.formError = error.error?.message || "Failed to update charge.";
          this.showErrorAlert(this.formError);
        },
      });
    } else {
      this.chargeService.create(dto).subscribe({
        next: () => {
          this.isSaving = false;
          this.currentPage = 1;
          this.closeForm();
          this.loadData();
          this.showSuccessAlert("Added!", `${dto.code} has been created.`);
        },
        error: (error) => {
          console.error("Error creating charge:", error);
          this.isSaving = false;
          this.formError = error.error?.message || "Failed to create charge.";
          this.showErrorAlert(this.formError);
        },
      });
    }
  }

  deleteCharge(row: ChargeMaster) {
    Swal.fire({
      title: "Delete Charge?",
      html: `Are you sure you want to delete <strong>${row.code}</strong>?<br><span style="color:#6b7280;font-size:13px;">${row.name}</span>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Delete!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.chargeService.delete(row.id).subscribe({
        next: () => {
          if (this.rows.length === 1 && this.currentPage > 1) {
            this.currentPage -= 1;
          }
          this.loadData();
          this.showSuccessAlert("Deleted!", `${row.code} has been removed.`);
        },
        error: (error) => {
          console.error("Error deleting charge:", error);
          this.showErrorAlert(
            error.error?.message || "Failed to delete charge.",
          );
        },
      });
    });
  }

  // ============================================
  // ALERT HELPERS
  // ============================================

  showSuccessAlert(title: string, message: string): void {
    Swal.fire({
      icon: "success",
      title,
      text: message,
      timer: 2000,
      showConfirmButton: false,
    });
  }

  showErrorAlert(message: string): void {
    Swal.fire({
      icon: "error",
      title: "Error!",
      text: message,
      confirmButtonColor: "#4a3f3f",
    });
  }
}
