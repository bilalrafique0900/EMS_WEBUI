import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CourseService } from '../../domain/services/course.service';
declare var require: any;
import { v4 as uuidv4 } from 'uuid';
import { HttpRequestService } from 'src/app/shared/services/http-request.service';
import { paginationEnum } from 'src/app/shared/Enum/paginationEnum';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/shared/security/auth-service.service';
const Swal = require('sweetalert2');
@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.scss']
})
export class CourseComponent implements OnInit {
  public courseForm!: FormGroup;
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
    private courseService: CourseService,
    private http: HttpRequestService,
    private readonly authSrv: AuthService
  ) {
    this.courseForm = this.fb.group({
      CourseId: uuidv4(),
      BranchId: [this.LoginBranchId, Validators.required],
      CourseName: ["", Validators.required],
      Description: [""],
    });
  }

  ngOnInit(): void {
    this.getCourses();
    this.getBranches();
  }

  get basicFormControl() {
    return this.courseForm.controls;
  }
  onPageChange(event: any) {

    this.pagination.pageNo = event;
    this.getCourses();
    // You can perform any necessary actions with the selected page number here
  }
  onSearchText() {
    this.pagination.pageNo = 1;
    this.pagination.pageSize = 10;
    this.getCourses();
  }
  getCourses() {
    if (this.pagination.pageSize == null)
      this.pagination.pageSize = 10;
    this.courseService.coursesList(this.pagination.pageNo, this.pagination.pageSize, this.searchText).subscribe({
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
    this.courseForm.controls['CourseId'].setValue(row.courseId);
    this.courseForm.controls['BranchId'].setValue(row.branchId);
    this.courseForm.controls['CourseName'].setValue(row.courseName);
    this.courseForm.controls['Description'].setValue(row.description);
    this.curdBtnIsList = false;
    this.isEdit = true;
  }
  isRecordExist() {
    const existing = this.gridList.find(obj => obj.courseName.trim().toLowerCase() === this.courseForm.value.CourseName.trim().toLowerCase() && obj.branchId == this.courseForm.value.BranchId && obj.courseId != this.courseForm.value.courseId);

    if (existing) {
      this.toast.error("Course Name already exists")
      return true;
    }
    return false;
  }
  formSubmit() {

    this.submitted = true;
    if (!this.courseForm.valid)
      return;
    if (this.isRecordExist())
      return;
    this.courseService.savecourses(this.courseForm.value).subscribe({
      next: (data: any) => {
        this.courseForm.reset();

        this.courseForm.controls['CourseId'].setValue(uuidv4());
        this.courseForm.controls['BranchId'].setValue(this.LoginBranchId);
        this.toast.success("Course  has been Saved.");
        this.isEdit = false;
        this.getCourses();
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
        this.http.get(`master/course/delete?id=${row.courseId}`).subscribe({
          next: result => {
            if (result.status) {
              this.getCourses();
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

    this.http.get(`master/course/active?id=${row.courseId}`).subscribe({
      next: result => {
        if (result.status) {
          this.getCourses();
          this.toast.success(result.message)
        }
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  get CourseId() { return this.courseForm.get("CourseId"); }
  get BranchId() { return this.courseForm.get("BranchId") }
  get CourseName() { return this.courseForm.get("CourseName"); }
  get Description() { return this.courseForm.get("Description"); }
}
