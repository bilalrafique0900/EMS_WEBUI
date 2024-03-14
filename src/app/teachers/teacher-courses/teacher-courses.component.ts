import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BranchService } from 'src/app/domain/services/branch.service';
import { CourseService } from 'src/app/domain/services/course.service';
import { TeacherService } from 'src/app/domain/services/teacher.service';
import { TeacherCourseService } from 'src/app/domain/services/teachercourse.service';
import { paginationEnum } from 'src/app/shared/Enum/paginationEnum';
import { SimpleDataTable } from 'src/app/shared/data/tables_data/data_table';
import { CommonService } from 'src/app/shared/services/common.service';
import { HttpRequestService } from 'src/app/shared/services/http-request.service';
declare var require: any;
import { v4 as uuidv4 } from 'uuid';
const Swal = require('sweetalert2');
@Component({
  selector: 'app-teacher-courses',
  templateUrl: './teacher-courses.component.html',
  styleUrls: ['./teacher-courses.component.scss']
})
export class TeacherCoursesComponent {
  dataTable = SimpleDataTable;
  public teachercoursesForm!: FormGroup;
  submitted = false;
  curdBtnIsList:boolean = true;
  gridList:any[]=[];
  selectedBranch:any={};
  pagination:any = paginationEnum;
  branchList: any[]=[];
  classList: any[]=[];
  courseList: any[]=[];
  FilterBranchId:any;
  isEdit:boolean=false;
  searchText:string='';
  constructor(private readonly fb: FormBuilder,
     private readonly toast: ToastrService,
     private readonly teachercourseSrv: TeacherCourseService, 
     private readonly branchSrv: BranchService,
     private readonly teacherSrv: TeacherService, 
     private readonly cousrseSrv:CourseService,
     private readonly route: ActivatedRoute,
     private readonly common:CommonService,    
       private readonly http: HttpRequestService
       
       
       ) {
    this.teachercoursesForm = this.fb.group({
      teacherCourseId:uuidv4(),
      branchId: ["", Validators.required],
      teacherId: [this.route.snapshot.queryParams["tid"],Validators.required],
      courseId: ["", Validators.required]
    });
    this.getTeacherById();
    this.getCourses();
    this.getTeacherCourses();
  }

  ngOnInit(): void {
  }
  onPageChange(event: any) {
    
    this.pagination.pageNo = event;
    this.getTeacherCourses();
    // You can perform any necessary actions with the selected page number here
  }
  onSearchText(){
    this.pagination.pageNo=1;
    this.pagination.pageSize=10;
    this.getTeacherCourses();
  }

  get basicFormControl() {
    return this.teachercoursesForm.controls;
  }
  getTeacherCourses() {
    if(this.pagination.pageSize==null)
    this.pagination.pageSize=10;
    this.teachercourseSrv.teacherCoursesList(this.pagination.pageNo,this.pagination.pageSize,this.route.snapshot.queryParams["tid"],this.searchText).subscribe({
      next: result => {
        
        this.gridList=[];
        this.gridList = result.data;

        this.pagination.totalCount=result.data[0]?.totalRecords || 0;
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  getTeacherById() {
    this.teacherSrv.getTeacherById(this.route.snapshot.queryParams["tid"]).subscribe({
      next: result => {
        
        this.teachercoursesForm.controls['branchId'].setValue(result.data.branchId);
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  getCourses() {
    this.cousrseSrv.getcourses().subscribe({
      next: result => {
        
        this.courseList=[];
        this.courseList = this.common.sortByProperty(result.data,'courseName');

      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  changeCurdView(bitVal: boolean) {
    this.curdBtnIsList = bitVal;
    this.isEdit=false;
  }
  setValueToForm(row: any) {
    
    this.teachercoursesForm.controls['teacherCourseId'].setValue(row.teacherCourseId);
    this.teachercoursesForm.controls['branchId'].setValue(row.branchId);
    this.teachercoursesForm.controls['courseId'].setValue(row.courseId);
    this.teachercoursesForm.controls['teacherId'].setValue(row.teacherId);
    this.isEdit=true;
    this.curdBtnIsList = false;
  }
  isRecordExist(){
    const existing = this.gridList.find(obj => obj.branchId === this.teachercoursesForm.value.branchId && obj.teacherId===this.teachercoursesForm.value.teacherId && obj.courseId===this.teachercoursesForm.value.courseId && obj.teacherCourseId!=this.teachercoursesForm.value.teacherCourseId);

    if (existing) {
      this.toast.error("Teacher Course already exists")
      return true;
    }
    return false;
  }
  formSubmit() {
    
    this.submitted = true;
    if (!this.teachercoursesForm.valid)
      return;
      if(this.isRecordExist())
return;
    this.teachercourseSrv.saveteachercourse(this.teachercoursesForm.value).subscribe({
      next: (data: any) => {
        this.teachercoursesForm.reset();

        this.teachercoursesForm.controls['teacherCourseId'].setValue(uuidv4());
        this.teachercoursesForm.controls['teacherId'].setValue(this.route.snapshot.queryParams["tid"]);
        this.getTeacherById();
        this.toast.success("Teacher Course  has been Saved.");
        this.isEdit=false;
        this.curdBtnIsList = true;
        this.getTeacherCourses();
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
        this.teachercourseSrv.deleteteachercourse(row.teacherCourseId).subscribe({
          next: result => {
            if (result.status) {
              this.getTeacherCourses();
              this.toast.success(result.message)
            }
          },
          error: (err: any) => { this.toast.error(err.message) },
        });
        Swal.fire({
          title: 'Deleted!',
          text: 'Your Teacher Course has been deleted.',
          icon: 'success',
          confirmButtonColor: '#6259ca',
        });
      }
    });
  }
  IsActive(row: any) {
    
    this.teachercourseSrv.activeteachercourse(row.teacherCourseId).subscribe({
      next: result => {
        if (result.status) {
          this.getTeacherCourses();
          this.toast.success(result.message)
        }
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
}
