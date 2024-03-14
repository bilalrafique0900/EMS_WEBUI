import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
declare var require: any;
import { v4 as uuidv4 } from 'uuid';
import { HttpRequestService } from 'src/app/shared/services/http-request.service';
import { paginationEnum } from 'src/app/shared/Enum/paginationEnum';
import { SectionService } from 'src/app/domain/services/section.service';
import { AuthService } from 'src/app/shared/security/auth-service.service';
const Swal = require('sweetalert2');
@Component({
  selector: 'app-section',
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.scss']
})
export class SectionComponent implements OnInit {
  public sectionForm!: FormGroup;
  submitted = false;
  curdBtnIsList: boolean = true;
  gridList: any[] = [];
  pagination: any = paginationEnum;
  branchList: any[] = [];
  isEdit: boolean = false;
  searchText: string = '';
  LoginBranchId: any = this.authSrv.getBranchIdFromLoginUser();
  constructor(private fb: FormBuilder,
    private toast: ToastrService,
    private sectionService: SectionService,
    private http: HttpRequestService,
    private readonly authSrv: AuthService) {
    this.sectionForm = this.fb.group({
      sectionId: uuidv4(),
      branchId: [this.LoginBranchId, Validators.required],
      sectionName: ["", Validators.required],
      description: [""],
    });
  }

  ngOnInit(): void {
    this.getSections();
    this.getBranches();
  }

  get basicFormControl() {
    return this.sectionForm.controls;
  }
  onPageChange(event: any) {

    this.pagination.pageNo = event;
    this.getSections();
    // You can perform any necessary actions with the selected page number here
  }
  onSearchText() {
    this.pagination.pageNo = 1;
    this.pagination.pageSize = 10;
    this.getSections();
  }
  getSections() {
    if (this.pagination.pageSize == null)
      this.pagination.pageSize = 10;
    this.sectionService.sectonsList(this.pagination.pageNo, this.pagination.pageSize, this.searchText).subscribe({
      next: result => {
        this.gridList = [];
        this.gridList = result.data.data;
        this.pagination.totalCount = result.data.totalCount;
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  getBranches() {
    this.http.get('master/branch').subscribe({
      next: result => {

        this.branchList = [];
        this.branchList = result.data;

      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  changeCurdView(bitVal: boolean) {
    this.curdBtnIsList = bitVal;
    this.isEdit = false;
  }
  setValueToForm(row: any) {
    this.sectionForm.controls['sectionId'].setValue(row.sectionId);
    this.sectionForm.controls['branchId'].setValue(row.branchId);
    this.sectionForm.controls['sectionName'].setValue(row.sectionName);
    this.sectionForm.controls['description'].setValue(row.description);
    this.curdBtnIsList = false;
    this.isEdit = true;
  }
  isRecordExist() {
    const existing = this.gridList.find(obj => obj.sectionName.trim().toLowerCase() === this.sectionForm.value.sectionName.trim().toLowerCase() && obj.branchId == this.sectionForm.value.branchId && obj.sectionId != this.sectionForm.value.sectionId);

    if (existing) {
      this.toast.error("Section Name already exists")
      return true;
    }
    return false;
  }
  formSubmit() {

    this.submitted = true;
    if (!this.sectionForm.valid)
      return;
    if (this.isRecordExist())
      return;
    this.sectionService.savesections(this.sectionForm.value).subscribe({
      next: (data: any) => {
        this.sectionForm.reset();

        this.sectionForm.controls['sectionId'].setValue(uuidv4());
        this.sectionForm.controls['branchId'].setValue(this.LoginBranchId);
        this.toast.success("Section  has been Saved.");
        this.isEdit = false;
        this.getSections();
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
        this.sectionService.delete(row.sectionId).subscribe({
          next: result => {
            if (result.status) {
              this.getSections();
              this.toast.success(result.message)
            }
          },
          error: (err: any) => { this.toast.error(err.message) },
        });
        Swal.fire({
          title: 'Deleted!',
          text: 'Your section has been deleted.',
          icon: 'success',
          confirmButtonColor: '#6259ca',
        });
      }
    });
  }
  IsActive(row: any) {

    this.sectionService.active(row.sectionId).subscribe({
      next: result => {
        if (result.status) {
          this.getSections();
          this.toast.success(result.message)
        }
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
}
