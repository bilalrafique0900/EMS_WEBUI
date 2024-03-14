import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { HttpRequestService } from 'src/app/shared/services/http-request.service';
declare var require: any;
import { v4 as uuidv4 } from 'uuid';
import { PaymentTypeService } from '../../domain/services/payment-type.service';
import { paginationEnum } from 'src/app/shared/Enum/paginationEnum';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/shared/security/auth-service.service';
const Swal = require('sweetalert2');

@Component({
  selector: 'app-payment-types',
  templateUrl: './payment-types.component.html',
  styleUrls: ['./payment-types.component.scss']
})
export class PaymentTypesComponent {
  public classForm!: FormGroup;
  pageTitle: string = 'Payment Types'
  submitted = false;
  curdBtnIsList: boolean = true;
  gridList: any[] = [];
  pagination: any = paginationEnum;
  branchList: any[] = [];
  isEdit: boolean = false;
  LoginBranchId: any = this.authSrv.getBranchIdFromLoginUser();
  constructor(private fb: FormBuilder, private toast: ToastrService, private paymentTypeService: PaymentTypeService,
    private http: HttpRequestService,
    private authSrv: AuthService) {
    this.classForm = this.fb.group({
      PaymentTypeId: uuidv4(),
      Type: ['', Validators.required],
      BranchId: [this.LoginBranchId, Validators.required],
      Amount: ['', Validators.required],
      isRefundable: [false],
      allowInstallment: [false],
      allowDiscount: [false],
      sapCode: [''],
      Description: [''],
    });
  }

  ngOnInit(): void {
    this.getFeeTypes();
  }

  get basicFormControl() {
    return this.classForm.controls;
  }
  onPageChange(event: any) {

    this.pagination.pageNo = event;
    this.getFeeTypes();
  }
  getFeeTypes() {
    if (this.pagination.pageSize == null)
      this.pagination.pageSize = 10;
    this.paymentTypeService.paymentList(this.pagination.pageNo, this.pagination.pageSize).subscribe({
      next: result => {
        this.gridList = [];
        this.gridList = result.data;
        this.pagination.totalCount = result.totalCount;
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  changeCurdView(bitVal: boolean) {
    this.curdBtnIsList = bitVal;
    this.isEdit = false;
  }
  setValueToForm(row: any) {
    this.classForm.controls['PaymentTypeId'].setValue(row.paymentTypeId);
    this.classForm.controls['Type'].setValue(row.type);
    this.classForm.controls['BranchId'].setValue(row.branchId);
    this.classForm.controls['Amount'].setValue(row.amount);
    this.classForm.controls['isRefundable'].setValue(row.isRefundable);
    this.classForm.controls['allowInstallment'].setValue(row.allowInstallment);
    this.classForm.controls['allowDiscount'].setValue(row.allowDiscount);
    this.classForm.controls['Description'].setValue(row.description);
    this.isEdit = true;
    this.curdBtnIsList = false;
  }
  public isRecordExist() {
    const existing = this.gridList.find(obj => obj.type.trim().toLowerCase() === this.classForm.value.Type.trim().toLowerCase() && obj.branchId == this.classForm.value.BranchId && obj.paymentTypeId != this.classForm.value.PaymentTypeId);

    if (existing) {
      this.toast.error("Payment Type already exists")
      return true;
    }
    return false;
  }
  formSubmit() {

    this.submitted = true;
    if (!this.classForm.valid)
      return;
    if (this.isRecordExist())
      return;
    this.paymentTypeService.savepaymentTypes(this.classForm.value).subscribe({
      next: (data: any) => {
        this.classForm.reset();
        this.classForm.controls['PaymentTypeId'].setValue(uuidv4());
        this.classForm.controls['BranchId'].setValue(this.LoginBranchId);
        this.classForm.controls['isRefundable'].setValue(false);
        this.classForm.controls['allowInstallment'].setValue(false);
        this.toast.success("Fee Type  has been Created");
        this.isEdit = false;
        this.getFeeTypes();
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
        this.http.get(`master/payment-type/delete?id=${row.paymentTypeId}`).subscribe({
          next: result => {
            if (result.status) {
              this.getFeeTypes();
              this.toast.success(result.message)
            }
          },
          error: (err: any) => { this.toast.error(err.message) },
        });
        Swal.fire({
          title: 'Deleted!',
          text: 'Your Payment type has been deleted.',
          icon: 'success',
          confirmButtonColor: '#6259ca',
        });
      }
    });
  }
  IsActive(row: any) {
    this.http.get(`master/payment-type/active?id=${row.paymentTypeId}`).subscribe({
      next: result => {
        if (result.status) {
          this.getFeeTypes();
          this.toast.success(result.message)
        }
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
}
