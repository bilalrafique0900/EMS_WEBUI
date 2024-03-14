import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
declare var require: any;
import { v4 as uuidv4 } from 'uuid';
import { paginationEnum } from 'src/app/shared/Enum/paginationEnum';
import { environment } from 'src/environments/environment';
import { DiscountService } from 'src/app/domain/services/discount.service';
import { LovCode } from 'src/app/shared/Enum/lov-enum';
import { LovService } from 'src/app/domain/services/Lov.service';
import { AuthService } from 'src/app/shared/security/auth-service.service';
const Swal = require('sweetalert2');
@Component({
  selector: 'app-discount',
  templateUrl: './discount.component.html',
  styleUrls: ['./discount.component.scss']
})
export class DiscountComponent implements OnInit {
  public discountForm!: FormGroup;
  submitted = false;
  curdBtnIsList: boolean = true;
  gridList: any[] = [];
  pagination: any = paginationEnum;
  branchList: any[] = [];
  isEdit: boolean = false;
  searchText: string = '';
  LoginBranchId: any = this.authSrv.getBranchIdFromLoginUser();
  discountTypeList: any[] = [];
  constructor(private readonly fb: FormBuilder,
    private readonly toast: ToastrService,
    private readonly discountService: DiscountService,
    private authSrv: AuthService,
    private LovServ: LovService) {
    this.discountForm = this.fb.group({
      discountId: uuidv4(),
      branchId: [this.LoginBranchId, Validators.required],
      discountTypeId: ["", Validators.required],
      discountName: ["", Validators.required],
      description: ["", Validators.required],
      discountPercentage: [''],
      discountAmount: [''],
      siblingCount: [""],
      allowMultiple: [false],
    }, { validator: exclusiveFieldValidator });

  }
  ngOnInit(): void {
    this.getDiscountTypeByLovCode();
    this.getDiscounts();
  }

  get basicFormControl() {
    return this.discountForm.controls;
  }
  onPageChange(event: any) {

    this.pagination.pageNo = event;
    this.getDiscounts();
  }
  onSearchText() {
    this.pagination.pageNo = 1;
    this.pagination.pageSize = 10;
    this.getDiscounts();
  }
  getDiscountTypeByLovCode(): void {
    this.LovServ.getLevelByCode(LovCode.DISCOUNT_TYPES).subscribe({
      next: (result) => {
        this.discountTypeList = result.data;
      },
      error: (err: any) => {
        this.toast.error(err.message);
      },
    });
  }
  getDiscounts() {
    if (this.pagination.pageSize == null)
      this.pagination.pageSize = 10;
    this.discountService.discountList(this.pagination.pageNo, this.pagination.pageSize, this.LoginBranchId, this.searchText).subscribe({
      next: result => {
        this.gridList = [];
        this.gridList = result.data;
        this.pagination.totalCount = result.data[0]?.totalRecords || 0;
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  changeCurdView(bitVal: boolean) {
    this.curdBtnIsList = bitVal;
    this.isEdit = false;
  }
  setValueToForm(row: any) {
    this.discountForm.controls['discountId'].setValue(row.discountId);
    this.discountForm.controls['branchId'].setValue(row.branchId);
    this.discountForm.controls['discountName'].setValue(row.discountName);
    this.discountForm.controls['discountTypeId'].setValue(row.discountTypeId);
    this.discountForm.controls['discountPercentage'].setValue(row.discountPercentage);
    this.discountForm.controls['discountAmount'].setValue(row.discountAmount);
    this.discountForm.controls['description'].setValue(row.description);
    this.discountForm.controls['allowMultiple'].setValue(row.allowMultiple);
    this.discountForm.controls['siblingCount'].setValue(row.siblingCount);
    
    this.curdBtnIsList = false;
    this.isEdit = true;
  }
  isRecordExist() {
    const existing = this.gridList.find(obj => obj.discountName.trim().toLowerCase() === this.discountForm.value.discountName.trim().toLowerCase() && obj.branchId == this.discountForm.value.branchId && obj.discountTypeId == this.discountForm.value.discountTypeId && obj.discountId != this.discountForm.value.discountId);

    if (existing) {
      this.toast.error("Discount Name already exists")
      return true;
    }
    return false;
  }
  discountPercentageChange(discountPercentage: any) {

    if (discountPercentage > 0)
      this.discountForm.controls['discountAmount'].setValue('');
  }
  discountAmountChange(discountAmount: any) {
    if (discountAmount > 0)
      this.discountForm.controls['discountPercentage'].setValue('');
  }
  formSubmit() {

    this.submitted = true;
    if (!this.discountForm.valid)
      return;
    if (this.isRecordExist())
      return;
    if (this.discountForm.value.discountPercentage > 0)
      this.discountForm.controls['discountAmount'].setValue(0);
    else
      this.discountForm.controls['discountPercentage'].setValue(0);
    this.discountService.savediscount(this.discountForm.value).subscribe({
      next: (data: any) => {
        this.discountForm.reset();

        this.discountForm.controls['discountId'].setValue(uuidv4());
        this.discountForm.controls['branchId'].setValue(this.LoginBranchId);
        this.discountForm.controls['allowMultiple'].setValue(false);
        this.toast.success("Discount  has been Saved.");
        this.isEdit = false;
        this.getDiscounts();
      },
      error: (err: any) => {
        this.toast.error(err.error);
      },
    });
  }
  deleteRow(row: any) {
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure ?',
      text: 'You will not be able to recover this imaginary file!',
      showCancelButton: true,
      confirmButtonColor: '#6259ca',
      cancelButtonColor: '#6259ca',
      confirmButtonText: 'Yes, delete it!',
      reverseButtons: true,
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.discountService.delete(row.discountId).subscribe({
          next: result => {
            if (result.status) {
              this.getDiscounts();
              this.toast.success(result.message)
            }
          },
          error: (err: any) => { this.toast.error(err.message) },
        });
        Swal.fire({
          title: 'Deleted!',
          text: 'Your Discount has been deleted.',
          icon: 'success',
          confirmButtonColor: '#6259ca',
        });
      }
    });
  }
  IsActive(row: any) {

    this.discountService.active(row.discountId).subscribe({
      next: result => {
        if (result.status) {
          this.getDiscounts();
          this.toast.success(result.message)
        }
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
}
function exclusiveFieldValidator(control: AbstractControl): ValidationErrors | null {
  const discountPercentage = control.get('discountPercentage')?.value;
  const discountAmount = control.get('discountAmount')?.value;

  if ((discountPercentage && discountAmount) || (!discountPercentage && !discountAmount)) {
    return { exclusiveFields: true };
  }

  return null;
}
