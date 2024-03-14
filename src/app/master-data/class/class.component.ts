import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
declare var require: any;
import { v4 as uuidv4 } from 'uuid';
import { PaymentTypeService } from '../../domain/services/payment-type.service';
import { paginationEnum } from 'src/app/shared/Enum/paginationEnum';
import { HttpRequestService } from 'src/app/shared/services/http-request.service';
import { BranchService } from 'src/app/domain/services/branch.service';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/shared/security/auth-service.service';
import { CommonService } from 'src/app/shared/services/common.service';
const Swal = require('sweetalert2');
@Component({
  selector: 'app-class',
  templateUrl: './class.component.html',
  styleUrls: ['./class.component.scss']
})
export class ClassComponent implements OnInit {
  public classForm!: FormGroup;
  submitted = false;
  curdBtnIsList: boolean = true;
  gridList: any[] = [];
  paymentTypes: any[] = [];
  paymentTypesSelected: any[] = [];
  paymentType: any;
  pagination: any = paginationEnum;
  FilterBranchId: any = this.authSrv.getBranchIdFromLoginUser();

  isEdit: boolean = false;
  constructor(private readonly fb: FormBuilder,
    private readonly toast: ToastrService,
    private readonly http: HttpRequestService,
    private readonly common:CommonService,
    private readonly paymentTypeService: PaymentTypeService,
    private authSrv: AuthService
  ) {
    this.classForm = this.fb.group({
      ClassId: uuidv4(),
      BranchId: [this.FilterBranchId, Validators.required],
      Name: ["", Validators.required],
      Description: [""],
    });
  }

  ngOnInit(): void {
    this.getPaymentType();
    this.getClassesList();
  }

  get basicFormControl() {
    return this.classForm.controls;
  }
  onPageChange(event: any) {

    this.pagination.pageNo = event;
    this.getClassesList();
    // You can perform any necessary actions with the selected page number here
  }

  getPaymentType() {

    this.paymentTypeService.getpaymentTypesbyBranch(this.FilterBranchId).subscribe({
      next: result => {

        this.paymentType = [];
        this.paymentTypes = this.common.sortByProperty(result.data,'type');
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  getClassesList() {
    if (this.pagination.pageSize == null)
      this.pagination.pageSize = 10;
    this.http.get('master-data/classes/classes-list?pageNo=' + this.pagination.pageNo + '&pageSize=' + this.pagination.pageSize + '&branchId=' + this.FilterBranchId).subscribe({
      next: result => {
        this.gridList = [];

        this.gridList = result.data.data;
        this.pagination.totalCount = result.data.totalCount;
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  getFeeTypes() {
    this.paymentTypeService.getPaymentTypes().subscribe({
      next: result => {
        this.paymentTypes = result;
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  changeCurdView(bitVal: boolean) {
    this.resetForm();
    this.curdBtnIsList = bitVal;
    this.isEdit = false
  }
  paymentTypeSelection(item: any) {
    if (item === undefined) return;
    if (!this.paymentTypesSelected.some(m => m.paymentTypeId === item.paymentTypeId))
      this.paymentTypesSelected.push({ paymentTypeId: item.paymentTypeId, amount: item.amount, type: item.type });

    this.paymentType = null;
  }
  deleteSelectedPayment(index: any) {
    this.paymentTypesSelected.splice(index, 1);
  }
  update(row: any) {
    this.classForm.controls['ClassId'].setValue(row.classId);
    this.classForm.controls['BranchId'].setValue(row.branchId);
    this.classForm.controls['Name'].setValue(row.name);
    this.classForm.controls['Description'].setValue(row.description);
    this.isEdit = true;
    this.curdBtnIsList = false;
    this.getClassPayments(row.classId)
  }
  getClassPayments(classId: string) {
    this.paymentTypeService.getClassPayments(classId).subscribe({
      next: res => {
        res.data.forEach((item: any) => {
          const paymentType = this.paymentTypes.find(m => m.paymentTypeId === item.paymentTypeId);
          if (paymentType !== undefined) {
            paymentType.amount = item.amount;
            this.paymentTypeSelection(paymentType);
          }

        });


      },
      error: (err: any) => {
        this.toast.error(err.message)
      },
    });
  }
  resetForm() {
    this.classForm.reset();
    this.classForm.controls['ClassId'].setValue(uuidv4());
    this.paymentTypesSelected = [];
  }
  isRecordExist() {
    const existing = this.gridList.find(obj => obj.name.trim().toLowerCase() === this.classForm.value.Name.trim().toLowerCase() && obj.branchId == this.classForm.value.BranchId && obj.classId != this.classForm.value.ClassId);

    if (existing) {
      this.toast.error("Class Name already exists")
      return true;
    }
    return false;
  }
  formSubmit() {

    this.classForm.controls['BranchId'].setValue(this.FilterBranchId);
    this.submitted = true;
    if (!this.classForm.valid) return;
    if (this.isRecordExist())
      return;

    let classObj = this.classForm.value;
    classObj.ClassPayments = this.paymentTypesSelected.map(m => { return { classId: classObj.ClassId, paymentTypeId: m.paymentTypeId, amount: m.amount } })
    this.http.post('master-data/classes/create-update', classObj).subscribe((d: any) => {

      this.toast.success("New Class  has been Created");
      this.isEdit = false;
      this.getClassesList();
      this.resetForm();
    },
      (error) => {
        this.toast.error(error.error);
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
        this.http.get(`master-data/classes/delete?id=${row.classId}`).subscribe({
          next: result => {
            if (result.status) {
              this.getClassesList();
              this.toast.success(result.message)
            }
          },
          error: (err: any) => { this.toast.error(err.message) },
        });
        Swal.fire({
          title: 'Deleted!',
          text: 'Your class has been deleted.',
          icon: 'success',
          confirmButtonColor: '#6259ca',
        });
      }
    });
  }
  IsActive(row: any) {

    this.http.get(`master-data/classes/active?id=${row.classId}`).subscribe({
      next: result => {
        if (result.status) {
          this.getClassesList();
          this.toast.success(result.message)
        }
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  get ClassId() { return this.classForm.get("ClassId"); }
  get Name() { return this.classForm.get("Name"); }
  get Description() { return this.classForm.get("Description"); }
}
