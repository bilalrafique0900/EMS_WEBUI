import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ClassService } from 'src/app/domain/services/class.service';
import { ClassSectionService } from 'src/app/domain/services/classsection.service';
import { TeacherService } from 'src/app/domain/services/teacher.service';
import { TeacherClassService } from 'src/app/domain/services/teacherclass.service';
import { paginationEnum } from 'src/app/shared/Enum/paginationEnum';
import { SimpleDataTable } from 'src/app/shared/data/tables_data/data_table';
import { CommonService } from 'src/app/shared/services/common.service';
import { HttpRequestService } from 'src/app/shared/services/http-request.service';
declare var require: any;
import { v4 as uuidv4 } from 'uuid';
const Swal = require('sweetalert2');
@Component({
  selector: 'app-teacher-classes',
  templateUrl: './teacher-classes.component.html',
  styleUrls: ['./teacher-classes.component.scss']
})
export class TeacherClassesComponent {
  dataTable = SimpleDataTable;
  public teacherclassForm!: FormGroup;
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
  classSectionList: any[]=[];
  constructor(private readonly fb: FormBuilder,
     private readonly toast: ToastrService,
     private readonly teacherclassSrv: TeacherClassService, 
     private readonly teacherSrv: TeacherService, 
     private readonly classSrv:ClassService,
     private readonly route: ActivatedRoute, 
     private readonly common:CommonService,
     private readonly classSectionService:ClassSectionService,   
       private readonly http: HttpRequestService
       
       
       ) {
    this.teacherclassForm = this.fb.group({
      teacherClassId:uuidv4(),
      branchId: ["", Validators.required],
      teacherId: [this.route.snapshot.queryParams["tid"],Validators.required],
      classId: ["", Validators.required],
      sectionId:["",Validators.required]
    });
    this.getTeacherById();
    this.getTeacherClasses();
  }

  ngOnInit(): void {
  }
  onPageChange(event: any) {
    
    this.pagination.pageNo = event;
    this.getTeacherClasses();
    // You can perform any necessary actions with the selected page number here
  }
  onSearchText(){
    this.pagination.pageNo=1;
    this.pagination.pageSize=10;
    this.getTeacherClasses();
  }

  get basicFormControl() {
    return this.teacherclassForm.controls;
  }
  getTeacherClasses() {
    if(this.pagination.pageSize==null)
    this.pagination.pageSize=10;
    this.teacherclassSrv.teacherClassesList(this.pagination.pageNo,this.pagination.pageSize,this.route.snapshot.queryParams["tid"],this.searchText).subscribe({
      next: result => {
        
        this.gridList=[];
        this.gridList = result.data;

        this.pagination.totalCount=result.data.length>0?result.data[0].totalRecords:0;
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  getTeacherById() {
    this.teacherSrv.getTeacherById(this.route.snapshot.queryParams["tid"]).subscribe({
      next: result => {
        
        this.teacherclassForm.controls['branchId'].setValue(result.data.branchId);
        this.getClasses(result.data.branchId);
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  getClasses(branchId:any) {
    this.classSrv.getbranchclass(branchId).subscribe({
      next: result => {
        
        this.classList=[];
        this.classList = this.common.sortByProperty(result.data,'name');
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  getSectionByClassId() {
    this.classSectionList=[];
    let classId = this.teacherclassForm.controls['classId'].value;
    this.classSectionService.classsectionByClass(classId).subscribe({
      next: result => {

        this.classSectionList = this.common.sortByProperty(result.data,'sectionName');
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  changeCurdView(bitVal: boolean) {
    this.curdBtnIsList = bitVal;
    this.isEdit=false;
  }
  setValueToForm(row: any) {
    this.teacherclassForm.controls['teacherClassId'].setValue(row.teacherClassId);
    this.teacherclassForm.controls['branchId'].setValue(row.branchId);
    this.teacherclassForm.controls['classId'].setValue(row.classId);
    this.getSectionByClassId();
    this.teacherclassForm.controls['teacherId'].setValue(row.teacherId);
    this.teacherclassForm.controls['sectionId'].setValue(row.sectionId);
    this.isEdit=true;
    this.curdBtnIsList = false;
  }
  isRecordExist(){
    const existing = this.gridList.find(obj => obj.branchId === this.teacherclassForm.value.branchId && obj.teacherId===this.teacherclassForm.value.teacherId && obj.classId===this.teacherclassForm.value.classId && obj.sectionId===this.teacherclassForm.value.sectionId && obj.teacherClassId!=this.teacherclassForm.value.teacherClassId);

    if (existing) {
      this.toast.error("Teacher Class already exists")
      return true;
    }
    return false;
  }
  formSubmit() {
    
    this.submitted = true;
    if (!this.teacherclassForm.valid)
      return;
      if(this.isRecordExist())
return;
    this.teacherclassSrv.saveteacherclass(this.teacherclassForm.value).subscribe({
      next: (data: any) => {
        this.teacherclassForm.reset();

        this.teacherclassForm.controls['teacherClassId'].setValue(uuidv4());
        this.teacherclassForm.controls['teacherId'].setValue(this.route.snapshot.queryParams["tid"]);
        this.getTeacherById();
        this.toast.success("Teacher Class  has been Saved.");
        this.isEdit=false;
        this.curdBtnIsList = false;
        this.getTeacherClasses();
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
        this.teacherclassSrv.deleteteacherclass(row.teacherClassId).subscribe({
          next: result => {
            if (result.status) {
              this.getTeacherClasses();
              this.toast.success(result.message)
            }
          },
          error: (err: any) => { this.toast.error(err.message) },
        });
        Swal.fire({
          title: 'Deleted!',
          text: 'Your Teacher Class has been deleted.',
          icon: 'success',
          confirmButtonColor: '#6259ca',
        });
      }
    });
  }
  IsActive(row: any) {
    
    this.teacherclassSrv.activeteacherclass(row.teacherClassId).subscribe({
      next: result => {
        if (result.status) {
          this.getTeacherClasses();
          this.toast.success(result.message)
        }
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
}
