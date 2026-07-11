import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import {
  TaxRateService,
  TaxRate,
  TaxRateRequest,
  TaxRateFilter,
} from "../../services/tax-rate.service";

const EMPTY_TAX: TaxRate = {
  id: 0,
  categoryCode: "",
  categoryName: "",
  applicableDate: "",
  cgst: 0,
  sgst: 0,
  igst: 0,
  cess: 0,
  otherTax: 0,
  abatement: 0,
  liabilitySupplier: 100,
  liabilityRecipient: 0,
  diffPostingPercent: 0,
  billPrintingRemark: "",
  group: "",
  gstType: "",
  status: "Applicable",
  selected: true,
};

@Component({
  selector: "app-tax-rates",
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: "./tax-rates.component.html",
  styleUrls: ["./tax-rates.component.css"],
})
export class TaxRatesComponent implements OnInit {
  // ---- filter state ----
  searchTerm = "";
  groupFilter = "";
  gstTypeFilter = "";
  statusFilter = "";

  groups: string[] = [];
  gstTypes: string[] = [];
  statuses: string[] = ["Applicable", "Not Applicable"];

  // ---- Add / Edit Tax form state ----
  isFormOpen = false;
  isEditMode = false;
  taxForm: TaxRate = { ...EMPTY_TAX };
  formError = "";

  // ---- Export dropdown state ----
  isExportOpen = false;

  // ---- Data state ----
  allRows: TaxRate[] = [];
  isLoading = false;
  totalCount = 0;
  currentPage = 1;
  pageSize = 20;
  totalPages = 0;

  // ---- Validation errors ----
  validationErrors: { [key: string]: string } = {};

  constructor(private taxRateService: TaxRateService) {}

  ngOnInit(): void {
    this.loadData();
    this.loadDropdownData();
  }

  // ============================================
  // DATE PICKER - OPEN CALENDAR
  // ============================================

  openDatePicker(): void {
    const dateInput = document.getElementById(
      "applicableDateInput",
    ) as HTMLInputElement;
    if (dateInput) {
      try {
        // Modern browsers support showPicker()
        if (dateInput.showPicker) {
          dateInput.showPicker();
        } else {
          // Fallback for older browsers
          dateInput.click();
          dateInput.focus();
        }
      } catch (error) {
        // If showPicker fails, try click
        dateInput.click();
        dateInput.focus();
      }
    } else {
      // If element not found, try alternative
      const inputs = document.querySelectorAll('input[type="date"]');
      if (inputs.length > 0) {
        const input = inputs[0] as HTMLInputElement;
        try {
          if (input.showPicker) {
            input.showPicker();
          } else {
            input.click();
            input.focus();
          }
        } catch (error) {
          input.click();
          input.focus();
        }
      }
    }
  }

  // ============================================
  // LOAD DATA FROM API
  // ============================================

  loadData(): void {
    this.isLoading = true;

    const filter: TaxRateFilter = {
      searchTerm: this.searchTerm || undefined,
      group: this.groupFilter || undefined,
      gstType: this.gstTypeFilter || undefined,
      status: this.statusFilter || undefined,
      page: this.currentPage,
      pageSize: this.pageSize,
    };

    this.taxRateService.getFiltered(filter).subscribe({
      next: (response) => {
        this.allRows = response.data;
        this.totalCount = response.totalCount;
        this.currentPage = response.page;
        this.pageSize = response.pageSize;
        this.totalPages = response.totalPages;
        this.isLoading = false;
      },
      error: (error) => {
        console.error("Error loading tax rates:", error);
        this.isLoading = false;
        this.loadAllData();
      },
    });
  }

  loadAllData(): void {
    this.taxRateService.getAll().subscribe({
      next: (data) => {
        this.allRows = data;
        this.totalCount = data.length;
        this.isLoading = false;
      },
      error: (error) => {
        console.error("Error loading all tax rates:", error);
        this.isLoading = false;
        this.showErrorAlert("Failed to load tax rates");
      },
    });
  }

  loadDropdownData(): void {
    // Load groups
    this.taxRateService.getGroups().subscribe({
      next: (data) => {
        this.groups = data;
        if (this.groups.length === 0) {
          this.groups = ["GST", "VAT", "Service Tax"];
        }
      },
      error: (error) => {
        console.error("Error loading groups:", error);
        this.groups = ["GST", "VAT", "Service Tax"];
      },
    });

    // Load GST types
    this.taxRateService.getGstTypes().subscribe({
      next: (data) => {
        this.gstTypes = data;
        if (this.gstTypes.length === 0) {
          this.gstTypes = ["SAC", "HSN"];
        }
      },
      error: (error) => {
        console.error("Error loading GST types:", error);
        this.gstTypes = ["SAC", "HSN"];
      },
    });
  }

  // ============================================
  // FILTER METHODS
  // ============================================

  get filteredRows(): TaxRate[] {
    return this.allRows;
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadData();
  }

  clearFilters(): void {
    this.searchTerm = "";
    this.groupFilter = "";
    this.gstTypeFilter = "";
    this.statusFilter = "";
    this.currentPage = 1;
    this.loadData();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadData();
  }

  // ============================================
  // SELECT ALL
  // ============================================

  get allVisibleSelected(): boolean {
    return (
      this.filteredRows.length > 0 && this.filteredRows.every((r) => r.selected)
    );
  }

  toggleAll(checked: boolean): void {
    this.filteredRows.forEach((r) => (r.selected = checked));
  }

  trackById(_index: number, row: TaxRate): number {
    return row.id;
  }

  // ============================================
  // ADD / EDIT TAX FORM
  // ============================================

  openAddTaxForm(): void {
    this.isEditMode = false;
    this.taxForm = {
      ...EMPTY_TAX,
      id: 0,
      group: this.groups.length > 0 ? this.groups[0] : "GST",
      gstType: this.gstTypes.length > 0 ? this.gstTypes[0] : "SAC",
      selected: true,
    };
    this.formError = "";
    this.validationErrors = {};
    this.isFormOpen = true;
  }

  openEditTaxForm(row: TaxRate): void {
    this.isEditMode = true;
    this.taxForm = { ...row };
    this.formError = "";
    this.validationErrors = {};
    this.isFormOpen = true;
  }

  closeTaxForm(): void {
    this.isFormOpen = false;
    this.taxForm = { ...EMPTY_TAX, id: 0 };
    this.formError = "";
    this.validationErrors = {};
  }

// ============================================
// CLAMP PERCENTAGE - SHOW ERROR IF >100
// ============================================

clampPercent(field: keyof TaxRate): void {
  let val = Number(this.taxForm[field]);
  
  if (isNaN(val) || val < 0) {
    val = 0;
    (this.taxForm as any)[field] = 0;
    return;
  }
  
  // If value > 100, show error and set to 100
  if (val > 100) {
    (this.taxForm as any)[field] = 100;
    // Show error alert
    this.showErrorAlert(`${field} cannot exceed 100%. Value has been set to 100.`);
    // Set validation error
    this.validationErrors[field] = `${field} cannot exceed 100%`;
    return;
  }
  
  // Clear validation error for this field
  this.validationErrors[field] = '';
}

/**
 * Prevent user from typing > 100
 */
preventInvalidKey(event: KeyboardEvent): void {
  const input = event.target as HTMLInputElement;
  const key = event.key;
  
  // Allow navigation keys
  const allowedKeys = [
    'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
    'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
    'Home', 'End', 'PageUp', 'PageDown'
  ];
  
  if (allowedKeys.includes(key)) {
    return;
  }
  
  // Only allow numbers and decimal
  if (!/^[0-9.]$/.test(key)) {
    event.preventDefault();
    return;
  }
  
  // Check if new value would exceed 100
  const currentValue = input.value;
  const selectionStart = input.selectionStart || 0;
  const selectionEnd = input.selectionEnd || 0;
  const newValue = currentValue.substring(0, selectionStart) + key + currentValue.substring(selectionEnd);
  
  if (newValue !== '' && !isNaN(Number(newValue))) {
    const numValue = Number(newValue);
    if (numValue > 100) {
      event.preventDefault();
      this.showErrorAlert('Value cannot exceed 100');
    }
  }
}

  // Validate form
  validateForm(): boolean {
    this.validationErrors = {};
    let isValid = true;

    // Category Code
    if (!this.taxForm.categoryCode || this.taxForm.categoryCode.trim() === "") {
      this.validationErrors["categoryCode"] = "Category Code is required";
      isValid = false;
    }

    // Category Name
    if (!this.taxForm.categoryName || this.taxForm.categoryName.trim() === "") {
      this.validationErrors["categoryName"] = "Category Name is required";
      isValid = false;
    }

    // Applicable Date
    if (
      !this.taxForm.applicableDate ||
      this.taxForm.applicableDate.trim() === ""
    ) {
      this.validationErrors["applicableDate"] = "Applicable Date is required";
      isValid = false;
    }

    // Group
    if (!this.taxForm.group || this.taxForm.group.trim() === "") {
      this.validationErrors["group"] = "Group is required";
      isValid = false;
    }

    // GST Type
    if (!this.taxForm.gstType || this.taxForm.gstType.trim() === "") {
      this.validationErrors["gstType"] = "GST Type is required";
      isValid = false;
    }

    // Percentage validations
    const percentFields: { field: keyof TaxRate; label: string }[] = [
      { field: "cgst", label: "CGST" },
      { field: "sgst", label: "SGST" },
      { field: "igst", label: "IGST" },
      { field: "cess", label: "CESS" },
      { field: "otherTax", label: "Other Tax" },
      { field: "abatement", label: "Abatement" },
      { field: "liabilitySupplier", label: "Liability of Supplier" },
      { field: "liabilityRecipient", label: "Liability of Recipient" },
      { field: "diffPostingPercent", label: "Diff. Posting Percent" },
    ];

    for (const pf of percentFields) {
      const val = Number(this.taxForm[pf.field]);
      if (val < 0 || val > 100) {
        this.validationErrors[pf.field as string] =
          `${pf.label} must be between 0 and 100`;
        isValid = false;
      }
    }

    // Liability total validation
    const liabilityTotal =
      this.taxForm.liabilitySupplier + this.taxForm.liabilityRecipient;
    if (liabilityTotal > 100) {
      this.validationErrors["liabilityTotal"] =
        "Liability of Supplier + Recipient cannot exceed 100%";
      isValid = false;
    }

    return isValid;
  }

  saveTax(): void {
    // Validate
    if (!this.validateForm()) {
      const firstError = Object.values(this.validationErrors)[0];
      if (firstError) {
        this.formError = firstError;
        this.showErrorAlert(firstError);
      }
      return;
    }

    this.formError = "";

    const requestData: TaxRateRequest = {
      categoryCode: this.taxForm.categoryCode.trim(),
      categoryName: this.taxForm.categoryName.trim(),
      applicableDate: this.taxForm.applicableDate.trim(),
      cgst: this.taxForm.cgst || 0,
      sgst: this.taxForm.sgst || 0,
      igst: this.taxForm.igst || 0,
      cess: this.taxForm.cess || 0,
      otherTax: this.taxForm.otherTax || 0,
      abatement: this.taxForm.abatement || 0,
      liabilitySupplier: this.taxForm.liabilitySupplier || 0,
      liabilityRecipient: this.taxForm.liabilityRecipient || 0,
      diffPostingPercent: this.taxForm.diffPostingPercent || 0,
      billPrintingRemark: this.taxForm.billPrintingRemark || "",
      group: this.taxForm.group,
      gstType: this.taxForm.gstType,
      status: this.taxForm.status,
      selected: this.taxForm.selected || true,
    };

    this.isLoading = true;

    if (this.isEditMode) {
      // UPDATE
      this.taxRateService.update(this.taxForm.id, requestData).subscribe({
        next: (updated) => {
          const idx = this.allRows.findIndex((r) => r.id === updated.id);
          if (idx > -1) {
            this.allRows[idx] = updated;
          }
          this.isLoading = false;
          this.closeTaxForm();
          this.loadData();
          this.showSuccessAlert(
            "Updated!",
            `${updated.categoryCode} has been updated.`,
          );
        },
        error: (error) => {
          console.error("Error updating tax rate:", error);
          this.formError = error.error?.error || "Failed to update tax rate.";
          this.isLoading = false;
          this.showErrorAlert(this.formError);
        },
      });
    } else {
      // CREATE
      this.taxRateService.create(requestData).subscribe({
        next: (created) => {
          this.allRows = [created, ...this.allRows];
          this.totalCount++;
          this.isLoading = false;
          this.closeTaxForm();
          this.loadData();
          this.showSuccessAlert(
            "Added!",
            `${created.categoryCode} has been created.`,
          );
        },
        error: (error) => {
          console.error("Error creating tax rate:", error);
          this.formError = error.error?.error || "Failed to create tax rate.";
          this.isLoading = false;
          this.showErrorAlert(this.formError);
        },
      });
    }
  }


  deleteTax(row: TaxRate): void {
    const message = `Are you sure you want to delete <strong>${row.categoryCode}</strong>?<br><span style="color:#6b7280;font-size:13px;">${row.categoryName}</span>`;

    Swal.fire({
      title: "Delete Tax Rate?",
      html: message,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Delete!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      showLoaderOnConfirm: true,
      position: "center",
      preConfirm: () => {
        return new Promise((resolve, reject) => {
          this.taxRateService.delete(row.id).subscribe({
            next: () => {
              this.allRows = this.allRows.filter((r) => r.id !== row.id);
              this.totalCount--;
              this.loadData();
              resolve(true);
            },
            error: (error) => {
              console.error("Error deleting tax rate:", error);
              reject(error.error?.error || "Failed to delete tax rate.");
            },
          });
        });
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.isConfirmed) {
        this.showSuccessAlert(
          "Deleted!",
          `${row.categoryCode} has been removed.`,
        );
      } else if (result.isDismissed) {
        Swal.fire({
          icon: "info",
          title: "Cancelled",
          text: "Tax rate deletion cancelled.",
          timer: 1500,
          showConfirmButton: false,
          position: "center",
        });
      }
    });
  }

  // ============================================
  // SWEET ALERT HELPERS - SIMPLE & CLEAN
  // ============================================

  showSuccessAlert(title: string, message: string): void {
    Swal.fire({
      icon: "success",
      title: title,
      text: message,
      timer: 2000,
      showConfirmButton: false,
      position: "center",
      timerProgressBar: true,
    });
  }

  showErrorAlert(message: string): void {
    Swal.fire({
      icon: "error",
      title: "Error!",
      text: message,
      confirmButtonColor: "#4a3f3f",
      confirmButtonText: "OK",
      position: "center",
    });
  }

  showInfoAlert(title: string, message: string): void {
    Swal.fire({
      icon: "info",
      title: title,
      text: message,
      confirmButtonColor: "#4a3f3f",
      confirmButtonText: "OK",
      position: "center",
    });
  }

  showWarningAlert(title: string, message: string): void {
    Swal.fire({
      icon: "warning",
      title: title,
      text: message,
      confirmButtonColor: "#f59e0b",
      confirmButtonText: "OK",
      position: "center",
    });
  }

  // ============================================
  // CONFIRM DELETE WITH SWEETALERT (Enhanced)
  // ============================================

  confirmDelete(title: string, message: string): Promise<boolean> {
    return new Promise((resolve) => {
      Swal.fire({
        title: title,
        html: message,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, Delete!",
        cancelButtonText: "Cancel",
        reverseButtons: true,
        showLoaderOnConfirm: true,
        customClass: {
          popup: "custom-swal-popup",
          title: "custom-swal-title",
          confirmButton: "custom-swal-delete-btn",
          cancelButton: "custom-swal-cancel-btn",
        },
      }).then((result) => {
        resolve(result.isConfirmed);
      });
    });
  }
  // ============================================
  // EXPORT FEATURES
  // ============================================

  toggleExportMenu(): void {
    this.isExportOpen = !this.isExportOpen;
  }

  printInquiries(): void {
    this.generatePrintLayout();
  }

  private generatePrintLayout(): void {
    this.isExportOpen = false;
    const printData = this.filteredRows.slice(0, 20);

    let rows = "";
    printData.forEach((r) => {
      rows += `
        <tr>
          <td>${r.categoryCode}</td>
          <td>${r.categoryName}</td>
          <td>${r.group}</td>
          <td>${r.gstType}</td>
          <td>${r.applicableDate}</td>
          <td style="text-align:right;">${r.cgst.toFixed(2)}</td>
          <td style="text-align:right;">${r.sgst.toFixed(2)}</td>
          <td style="text-align:right;">${r.igst.toFixed(2)}</td>
          <td style="text-align:right;">${r.cess.toFixed(2)}</td>
          <td style="text-align:right;">${r.otherTax.toFixed(2)}</td>
          <td style="text-align:right;">${r.abatement.toFixed(2)}</td>
          <td style="text-align:right;">${r.liabilitySupplier.toFixed(2)}</td>
          <td style="text-align:right;">${r.liabilityRecipient.toFixed(2)}</td>
          <td style="text-align:right;">${r.diffPostingPercent.toFixed(2)}</td>
          <td>${r.billPrintingRemark || "-"}</td>
          <td>${r.status}</td>
        </tr>`;
    });

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Tax_Rate_Records_${new Date().getTime()}</title>
            <style>
              @page { size: A4 landscape; margin: 10mm; }
              body { font-family: 'Segoe UI', sans-serif; margin: 20px; color: #333; }
              h2 { text-align: center; text-transform: uppercase; color: #4a3f3f; border-bottom: 2px solid #4a3f3f; padding-bottom: 10px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ccc; padding: 7px 5px; text-align: left; font-size: 9px; }
              th { background-color: #f4f4f4; font-weight: bold; }
              tr:nth-child(even) { background-color: #fafafa; }
            </style>
          </head>
          <body>
            <h2>Tax Rate Records Summary</h2>
            <table>
              <thead>
                <tr>
                  <th>Category Code</th>
                  <th>Description</th>
                  <th>Group</th>
                  <th>Type</th>
                  <th>Applicable Date</th>
                  <th>CGST (%)</th>
                  <th>SGST (%)</th>
                  <th>IGST (%)</th>
                  <th>CESS (%)</th>
                  <th>Other Tax (%)</th>
                  <th>Abatement (%)</th>
                  <th>Liab. Supplier (%)</th>
                  <th>Liab. Recipient (%)</th>
                  <th>Diff. Posting (%)</th>
                  <th>Bill Printing Remark</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 100);
              };
            <\/script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  }

  downloadInquiriesPDF(): void {
    this.isExportOpen = false;
    const printData = this.filteredRows.slice(0, 20);

    const element = document.createElement("div");
    element.style.padding = "40px";
    element.style.width = "1600px";
    element.style.position = "absolute";
    element.style.left = "-9999px";
    element.style.backgroundColor = "#ffffff";

    let rowsHtml = "";
    printData.forEach((r, index) => {
      const bgColor = index % 2 === 0 ? "#ffffff" : "#f9fafb";
      const statusColor = r.status === "Applicable" ? "#d1fae5" : "#f3f4f6";
      const statusText = r.status === "Applicable" ? "#065f46" : "#4b5563";

      rowsHtml += `
        <tr style="background-color: ${bgColor}; border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 7px; color: #111827; font-weight: 600;">${r.categoryCode}</td>
          <td style="padding: 7px; color: #4b5563;">${r.categoryName}</td>
          <td style="padding: 7px; color: #4b5563;">${r.group}</td>
          <td style="padding: 7px; color: #4b5563;">${r.gstType}</td>
          <td style="padding: 7px; color: #4b5563;">${r.applicableDate}</td>
          <td style="padding: 7px; text-align:right; color: #111827;">${r.cgst.toFixed(2)}</td>
          <td style="padding: 7px; text-align:right; color: #111827;">${r.sgst.toFixed(2)}</td>
          <td style="padding: 7px; text-align:right; color: #1d4ed8; font-weight:600;">${r.igst.toFixed(2)}</td>
          <td style="padding: 7px; text-align:right; color: #111827;">${r.cess.toFixed(2)}</td>
          <td style="padding: 7px; text-align:right; color: #111827;">${r.otherTax.toFixed(2)}</td>
          <td style="padding: 7px; text-align:right; color: #111827;">${r.abatement.toFixed(2)}</td>
          <td style="padding: 7px; text-align:right; color: #111827;">${r.liabilitySupplier.toFixed(2)}</td>
          <td style="padding: 7px; text-align:right; color: #111827;">${r.liabilityRecipient.toFixed(2)}</td>
          <td style="padding: 7px; text-align:right; color: #111827;">${r.diffPostingPercent.toFixed(2)}</td>
          <td style="padding: 7px; color: #4b5563; font-style: italic;">${r.billPrintingRemark || "-"}</td>
          <td style="padding: 7px;">
            <span style="background-color: ${statusColor}; color: ${statusText}; padding: 4px 8px; border-radius: 4px; font-size: 9px; font-weight: bold;">
              ${r.status.toUpperCase()}
            </span>
          </td>
        </tr>`;
    });

    element.innerHTML = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #4a3f3f; padding-bottom: 10px; margin-bottom: 20px;">
          <div>
            <h1 style="margin: 0; color: #4a3f3f; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">Tax Rate Report</h1>
            <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 12px;">Generated on: ${new Date().toLocaleString()}</p>
          </div>
          <div style="text-align: right;">
            <h3 style="margin: 0; color: #111827;">Cavalier Logistics</h3>
            <p style="margin: 0; color: #6b7280; font-size: 10px;">Confidential Document</p>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <thead>
            <tr style="background-color: #4a3f3f; color: #ffffff; text-align: left;">
              <th style="padding: 9px 7px; font-size: 9px; text-transform: uppercase; border-top-left-radius: 4px;">Code</th>
              <th style="padding: 9px 7px; font-size: 9px; text-transform: uppercase;">Description</th>
              <th style="padding: 9px 7px; font-size: 9px; text-transform: uppercase;">Group</th>
              <th style="padding: 9px 7px; font-size: 9px; text-transform: uppercase;">Type</th>
              <th style="padding: 9px 7px; font-size: 9px; text-transform: uppercase;">Date</th>
              <th style="padding: 9px 7px; font-size: 9px; text-transform: uppercase;">CGST</th>
              <th style="padding: 9px 7px; font-size: 9px; text-transform: uppercase;">SGST</th>
              <th style="padding: 9px 7px; font-size: 9px; text-transform: uppercase;">IGST</th>
              <th style="padding: 9px 7px; font-size: 9px; text-transform: uppercase;">CESS</th>
              <th style="padding: 9px 7px; font-size: 9px; text-transform: uppercase;">Other Tax</th>
              <th style="padding: 9px 7px; font-size: 9px; text-transform: uppercase;">Abatement</th>
              <th style="padding: 9px 7px; font-size: 9px; text-transform: uppercase;">Liab. Supplier</th>
              <th style="padding: 9px 7px; font-size: 9px; text-transform: uppercase;">Liab. Recipient</th>
              <th style="padding: 9px 7px; font-size: 9px; text-transform: uppercase;">Diff. Posting</th>
              <th style="padding: 9px 7px; font-size: 9px; text-transform: uppercase;">Bill Printing Remark</th>
              <th style="padding: 9px 7px; font-size: 9px; text-transform: uppercase; border-top-right-radius: 4px;">Status</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>

        <div style="margin-top: 30px; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 10px;">
          <p style="color: #9ca3af; font-size: 10px;">This is a system generated report and does not require a physical signature.</p>
        </div>
      </div>
    `;

    document.body.appendChild(element);

    html2canvas(element, {
      scale: 3,
      useCORS: true,
      backgroundColor: "#ffffff",
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(
        imgData,
        "PNG",
        0,
        0,
        pdfWidth,
        pdfHeight,
        undefined,
        "FAST",
      );
      pdf.save(`Tax_Rate_Report_${new Date().getTime()}.pdf`);

      document.body.removeChild(element);
    });
  }

  downloadLeadsExcel(): void {
    this.isExportOpen = false;

    if (!this.filteredRows || this.filteredRows.length === 0) {
      this.showErrorAlert("No data found for Excel export!");
      return;
    }

    const excelData = this.filteredRows.map((r) => ({
      "Category Code": r.categoryCode || "-",
      Description: r.categoryName || "-",
      Group: r.group || "-",
      Type: r.gstType || "-",
      "Applicable Date": r.applicableDate || "-",
      "CGST (%)": r.cgst,
      "SGST (%)": r.sgst,
      "IGST (%)": r.igst,
      "CESS (%)": r.cess,
      "Other Tax (%)": r.otherTax,
      "Abatement (%)": r.abatement,
      "Liability of Supplier (%)": r.liabilitySupplier,
      "Liability of Recipient (%)": r.liabilityRecipient,
      "Diff. Posting Percent (%)": r.diffPostingPercent,
      "Bill Printing Remark": r.billPrintingRemark || "-",
      Status: r.status,
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);

    const colWidths = [
      { wch: 16 }, // Category Code
      { wch: 45 }, // Description
      { wch: 12 }, // Group
      { wch: 10 }, // Type
      { wch: 16 }, // Applicable Date
      { wch: 10 }, // CGST
      { wch: 10 }, // SGST
      { wch: 10 }, // IGST
      { wch: 10 }, // CESS
      { wch: 14 }, // Other Tax
      { wch: 14 }, // Abatement
      { wch: 20 }, // Liability Supplier
      { wch: 20 }, // Liability Recipient
      { wch: 20 }, // Diff Posting Percent
      { wch: 30 }, // Bill Printing Remark
      { wch: 15 }, // Status
    ];
    ws["!cols"] = colWidths;

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tax Rate Records");

    XLSX.writeFile(wb, `Tax_Rate_Report_${new Date().getTime()}.xlsx`);

    this.showSuccessAlert(
      "Excel Downloaded!",
      "Tax rate data exported successfully.",
    );
  }
}
