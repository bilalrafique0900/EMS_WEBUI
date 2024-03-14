import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LovService } from 'src/app/domain/services/Lov.service';
import { BranchService } from 'src/app/domain/services/branch.service';
import { StudentService } from 'src/app/domain/services/student.service';
import { TeacherService } from 'src/app/domain/services/teacher.service';
import { LovCode } from 'src/app/shared/Enum/lov-enum';
import { paginationEnum } from 'src/app/shared/Enum/paginationEnum';
import { AuthService } from 'src/app/shared/security/auth-service.service';
import { HttpRequestService } from 'src/app/shared/services/http-request.service';
import { environment } from 'src/environments/environment';
import { v4 as uuidv4 } from 'uuid';
declare var require: any;
const Swal = require('sweetalert2');
@Component({
  selector: 'app-teacher-list',
  templateUrl: './teacher-list.component.html',
  styleUrls: ['./teacher-list.component.scss'],
  providers: [DatePipe]
})
export class TeacherListComponent {
  public teacherForm!: FormGroup;
  submitted = false;
  curdBtnIsList:boolean = true;
  gridList: any[] = [];
  pagination:any = paginationEnum;
  genderList: any[] = [];
  dateofJoiningDatePicker: { day?: number; month: number; year: number };
  dateofBirthDatePicker: { day?: number; month: number; year: number };
  FilterBranchId: any=this.authSrv.getBranchIdFromLoginUser();
  isEdit:boolean=false;
  searchText:string='';
  constructor(
    private readonly fb: FormBuilder,
    private readonly toast: ToastrService,
    private LovServ: LovService,
    private readonly teacherSrv:TeacherService,
    private authSrv: AuthService
  ) {
    this.teacherForm = this.fb.group({
      teacherId: uuidv4(),
      branchId: [this.FilterBranchId, Validators.required],
      firstName: ["", Validators.required],
      middleName: [""],
      lastName: ["", Validators.required],
      teacherEmail: ["", Validators.required],
      // nationality: ["", Validators.required],
      // dateOfBirth: ["", Validators.required],
      // dateOfJoining: ["", Validators.required],
      teacherPhoneNo: ["", Validators.required],
      // religion: ["", Validators.required],
      // genderId: ["", Validators.required],
      // streetName: ["", Validators.required],
      // houseNo: ["", Validators.required],
      // area: [""],
      // zone: [""],
      // address: ["", Validators.required],

    });
    this.dateofBirthDatePicker = {
      day: 1,
      month: 1,
      year: new Date().getFullYear(),
    };
    this.dateofJoiningDatePicker = {
      day: 1,
      month: 1,
      year: new Date().getFullYear(),
    };
  }
  ngOnInit(): void {
    this.getTeachers();
    this.getGenderByLovCode();
    //this.getTeachers();
    //this.getRooms();

  }
  setDefaultTime(){
    this.dateofBirthDatePicker = {
      day: 1,
      month: 1,
      year: new Date().getFullYear(),
    };
    this.dateofJoiningDatePicker = {
      day: 1,
      month: 1,
      year: new Date().getFullYear(),
    };
  }
  get basicFormControl() {
    return this.teacherForm.controls;
  }
  onPageChange(event: any) {
    
    this.pagination.pageNo = event;
    this.getTeachers();
    // You can perform any necessary actions with the selected page number here
  }
  onSearchText(){
    this.pagination.pageNo=1;
    this.pagination.pageSize=10;
    this.getTeachers();
  }
getTeachers() {
    if(this.pagination.pageSize==null)
    this.pagination.pageSize=10;
    this.teacherSrv.teachersList(this.pagination.pageNo,this.pagination.pageSize,this.FilterBranchId,this.searchText).subscribe({
      next: result => {
        
        this.gridList=[];
        this.gridList = result.data;
        this.pagination.totalCount=result.data[0]?.totalRecords || 0;
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  getGenderByLovCode(): void {
    this.LovServ.getLevelByCode(LovCode.GENDER).subscribe({
      next: (result) => {
        this.genderList = result.data;
      },
      error: (err: any) => {
        this.toast.error(err.message);
      },
    });
  }
  
  changeCurdView(bitVal: boolean) {
    this.curdBtnIsList = bitVal;
    this.isEdit=false;
  }
  setValueToForm(row: any) {
    this.teacherForm.controls['teacherId'].setValue(row.teacherId);
    this.teacherForm.controls['branchId'].setValue(row.branchId);
    this.teacherForm.controls['firstName'].setValue(row.firstName);
    this.teacherForm.controls['middleName'].setValue(row.middleName);
    this.teacherForm.controls['lastName'].setValue(row.lastName);
    this.teacherForm.controls['teacherEmail'].setValue(row.teacherEmail);
    // this.teacherForm.controls['nationality'].setValue(row.nationality);
    // let FormatedateOfBirth = this.datePipe.transform(row?.dateOfBirth,"yyyy-MM-dd");
    // let splitdateOfBirth:any = FormatedateOfBirth?.split('-');
    // this.dateofBirthDatePicker.year = Number(splitdateOfBirth[0]);
    // this.dateofBirthDatePicker.month = Number(splitdateOfBirth[1]);
    // this.dateofBirthDatePicker.day = Number(splitdateOfBirth[2]);
    // let FormatedateOfJoining = this.datePipe.transform(row?.dateOfJoining,"yyyy-MM-dd");
    // let splitdateOfJoining:any = FormatedateOfJoining?.split('-');
    // this.dateofJoiningDatePicker.year = Number(splitdateOfJoining[0]);
    // this.dateofJoiningDatePicker.month = Number(splitdateOfJoining[1]);
    // this.dateofJoiningDatePicker.day = Number(splitdateOfJoining[2]);
    this.teacherForm.controls['teacherPhoneNo'].setValue(row.teacherPhoneNo);
    // this.teacherForm.controls['religion'].setValue(row.religion);
    // this.teacherForm.controls['genderId'].setValue(row.genderId);
    // this.teacherForm.controls['streetName'].setValue(row.streetName);
    // this.teacherForm.controls['houseNo'].setValue(row.houseNo);
    // this.teacherForm.controls['area'].setValue(row.area);
    // this.teacherForm.controls['zone'].setValue(row.zone);
    // this.teacherForm.controls['address'].setValue(row.address);
    this.isEdit=true;
    this.curdBtnIsList = false;
  }
  formSubmit() {
    
    this.submitted = true;
    if (!this.teacherForm.valid)
      return;
      // let joiningDate = this.dateofJoiningDatePicker.year +'-'+ this.dateofJoiningDatePicker.month +'-'+ this.dateofJoiningDatePicker.day;
      // let dateofBirth = this.dateofBirthDatePicker.year +'-'+ this.dateofBirthDatePicker.month +'-'+ this.dateofBirthDatePicker.day;
      // this.teacherForm.value['dateOfJoining'] = joiningDate;
      // this.teacherForm.value['dateOfBirth'] = dateofBirth;
    this.teacherSrv.saveteacher(this.teacherForm.value).subscribe({
      next: (data: any) => {
        this.teacherForm.reset();

        this.teacherForm.controls['teacherId'].setValue(uuidv4());
        this.toast.success("Teacher  has been Saved.");
        this.isEdit=false;
        this.curdBtnIsList = true;
        this.getTeachers();
        this.setDefaultTime();
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
        this.teacherSrv.deleteteacher(row.teacherId).subscribe({
          next: result => {
            if (result.status) {
              this.getTeachers();
              this.toast.success(result.message)
            }
          },
          error: (err: any) => { this.toast.error(err.message) },
        });
        Swal.fire({
          title: 'Deleted!',
          text: 'Your Teacher has been deleted.',
          icon: 'success',
          confirmButtonColor: '#6259ca',
        });
      }
    });
  }
  IsActive(row: any) {
    
    this.teacherSrv.activeteacher(row.teacherId).subscribe({
      next: result => {
        if (result.status) {
          this.getTeachers();
          this.toast.success(result.message)
        }
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
}