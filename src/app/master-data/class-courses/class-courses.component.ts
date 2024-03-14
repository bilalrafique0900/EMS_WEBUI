import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BranchService } from 'src/app/domain/services/branch.service';
import { ClassService } from 'src/app/domain/services/class.service';
import { ClassCoursesService } from 'src/app/domain/services/classcourses.service';
import { CourseService } from 'src/app/domain/services/course.service';
import { paginationEnum } from 'src/app/shared/Enum/paginationEnum';
import { SimpleDataTable } from 'src/app/shared/data/tables_data/data_table';
import { AuthService } from 'src/app/shared/security/auth-service.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { HttpRequestService } from 'src/app/shared/services/http-request.service';
import { environment } from 'src/environments/environment';
declare var require: any;
import { v4 as uuidv4 } from 'uuid';
const Swal = require('sweetalert2');
@Component({
  selector: 'app-class-courses',
  templateUrl: './class-courses.component.html',
  styleUrls: ['./class-courses.component.scss']
})
export class ClassCoursesComponent {
  dataTable = SimpleDataTable;
  public classcoursesForm!: FormGroup;
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
     private readonly srv: ClassCoursesService,
     private readonly branchSrv: BranchService,
     private readonly classSrv: ClassService, 
     private readonly cousrseSrv:CourseService,
     private readonly route: ActivatedRoute,  
     private readonly common:CommonService,  
       private readonly http: HttpRequestService,
       private authSrv : AuthService
       ) {
    this.classcoursesForm = this.fb.group({
      classCourseId:uuidv4(),
      branchId: ["", Validators.required],
      classId: [this.route.snapshot.queryParams["cid"],Validators.required],
      courseId: ["", Validators.required],
      description: [""]
    });
    this.FilterBranchId = this.authSrv.getBranchIdFromLoginUser();
  }

  ngOnInit(): void {
    this.getClassbyId();
    this.getCourses();
    this.getClassCourses();
  }
  onPageChange(event: any) {
    
    this.pagination.pageNo = event;
    this.getClassCourses();
    // You can perform any necessary actions with the selected page number here
  }
  onSearchText(){
    this.pagination.pageNo=1;
    this.pagination.pageSize=10;
    this.getClassCourses();
  }

  get basicFormControl() {
    return this.classcoursesForm.controls;
  }
  getClassCourses() {
    if(this.pagination.pageSize==null)
    this.pagination.pageSize=10;
    this.srv.classcoursesList(this.pagination.pageNo,this.pagination.pageSize,this.route.snapshot.queryParams["cid"],this.searchText).subscribe({
      next: result => {
        
        this.gridList=[];
        this.gridList = result.data;

        this.pagination.totalCount=result.data[0]?.totalRecords || 0;
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  getBranches() {
    this.branchSrv.getbranches().subscribe({
      next: result => {
        
        this.branchList=[];
        this.branchList = result.data;
        // if(result.data.length>0){
        //   this.FilterBranchId=this.branchList[0].branchId;
        //   this.getClassCourses();
        //   }
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  getClassbyId() {
    this.classSrv.getclassbyId(this.route.snapshot.queryParams["cid"]).subscribe({
      next: result => {
        
        this.classcoursesForm.controls['branchId'].setValue(result.data.branchId);
        // if(result.data.length>0){
        //   this.FilterBranchId=this.branchList[0].branchId;
        //   this.getClassCourses();
        //   }
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  getBranchClasses() {
    this.classSrv.getbranchclass(this.classcoursesForm.value.branchId).subscribe({
      next: result => {
        
        this.classList=[];
        this.classList = result.data;

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
    
    this.classcoursesForm.controls['classCourseId'].setValue(row.classCourseId);
    this.classcoursesForm.controls['branchId'].setValue(row.branchId);
    this.classcoursesForm.controls['courseId'].setValue(row.courseId);
    this.classcoursesForm.controls['classId'].setValue(row.classId);
    this.classcoursesForm.controls['description'].setValue(row.description);
    this.isEdit=true;
    this.curdBtnIsList = false;
  }
  isRecordExist(){
    const existing = this.gridList.find(obj => obj.branchId === this.classcoursesForm.value.branchId && obj.classId===this.classcoursesForm.value.classId && obj.courseId===this.classcoursesForm.value.courseId && obj.classCourseId!=this.classcoursesForm.value.classCourseId);

    if (existing) {
      this.toast.error("Class Course already exists")
      return true;
    }
    return false;
  }
  formSubmit() {
    this.classcoursesForm.controls['branchId'].setValue(this.FilterBranchId);
    this.submitted = true;
    if (!this.classcoursesForm.valid)
      return;
      if(this.isRecordExist())
      return;
    this.srv.saveclasscourses(this.classcoursesForm.value).subscribe({
      next: (data: any) => {
        this.classcoursesForm.reset();
        this.classcoursesForm.controls['classCourseId'].setValue(uuidv4());
        this.classcoursesForm.controls['branchId'].setValue(this.FilterBranchId);
        this.classcoursesForm.controls['classId'].setValue(this.route.snapshot.queryParams["cid"]);
        this.toast.success("Class Course  has been Saved.");
        this.isEdit=false;
        this.getClassCourses();
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
        this.srv.deleteclasscourses(row.classCourseId).subscribe({
          next: result => {
            if (result.status) {
              this.getClassCourses();
              this.toast.success(result.message)
            }
          },
          error: (err: any) => { this.toast.error(err.message) },
        });
        Swal.fire({
          title: 'Deleted!',
          text: 'Your Class Course has been deleted.',
          icon: 'success',
          confirmButtonColor: '#6259ca',
        });
      }
    });
  }
  IsActive(row: any) {
    
    this.srv.activeclasscourses(row.classCourseId).subscribe({
      next: result => {
        if (result.status) {
          this.getClassCourses();
          this.toast.success(result.message)
        }
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  get classCourseId() { return this.classcoursesForm.get("classCourseId"); }
  get branchId() { return this.classcoursesForm.get("branchId"); }
  get classId() { return this.classcoursesForm.get("classId"); }
  get courseId() { return this.classcoursesForm.get("courseId"); }
  get description() { return this.classcoursesForm.get("description"); }
}
