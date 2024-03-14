import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LovService } from 'src/app/domain/services/Lov.service';
import { BranchService } from 'src/app/domain/services/branch.service';
import { StudentService } from 'src/app/domain/services/student.service';
import { TimeTableService } from 'src/app/domain/services/timetable.service';
import { LovCode } from 'src/app/shared/Enum/lov-enum';
import { paginationEnum } from 'src/app/shared/Enum/paginationEnum';
import { HttpRequestService } from 'src/app/shared/services/http-request.service';
import { v4 as uuidv4 } from 'uuid';
import { ClassSectionService } from 'src/app/domain/services/classsection.service';
declare var require: any;
const Swal = require('sweetalert2');
@Component({
  selector: 'app-timetable-list',
  templateUrl: './timetable-list.component.html',
  styleUrls: ['./timetable-list.component.scss']
})
export class TimetableListComponent {
  public timetableForm!: FormGroup;
  submitted = false;
  curdBtnIsList:boolean = true;
  gridList: any[] = [];
  pagination:any = paginationEnum;
  branchList: any[]=[];
  sectionList: any[]=[];
  genderList: any[] = [];
  FilterBranchId:any;
  FilterSectionId:any;
  isEdit:boolean=false;
  searchText:string='';
  branchId:any;
  sectionId:any;
  classid:any;
  classname:any;
  days: string[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  constructor(
    private readonly fb: FormBuilder,
    private readonly toast: ToastrService,
    private LovServ: LovService,
    private readonly branchSrv: BranchService,
    private readonly timetableSrv:TimeTableService,
    private readonly http: HttpRequestService,
    private readonly route: ActivatedRoute,
    private readonly classsectionSrv: ClassSectionService,
  
  ) {  

    this.route.paramMap.subscribe(paramMap => {
      // 
      var cid = paramMap.get('cid');
      this.classid = cid;
      var cname = paramMap.get('cname');
      this.classname = cname;
      });
    this.timetableForm = this.fb.group({
    classId: this.classid
    
    });
  }
  ngOnInit(): void {
    //this.getBranches();
    this.getClassSections();
    this.getGenderByLovCode();
    // this.route.paramMap.subscribe(paramMap => {
    //  // 
    //   var a = paramMap.get('cid');
    //   this.classid = a;
    // });

  
   
  }
 
  
  get basicFormControl() {
    return this.timetableForm.controls;
  }
  onPageChange(event: any) {
    
    this.pagination.pageNo = event;
    this.getTimeTables( this.sectionId);
    // You can perform any necessary actions with the selected page number here
  }
  onSearchText(){
    this.pagination.pageNo=1;
    this.pagination.pageSize=10;
    this.getTimeTables(this.sectionId);
  }
getTimeTables(sectionid:any) {
  
    if(this.pagination.pageSize==null)
    this.pagination.pageSize=10;
    this.gridList=[];
    this.timetableSrv.getTimetableBySectionId(this.classid, sectionid).subscribe({
      next: result => {
        
      
        this.gridList = result.data;
        this.pagination.totalCount=result.data[0]?.totalRecords || 0;
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  generateTimeTable() {
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure ?',
      text: 'Timetable will be refreshed for whole branch!',
      showCancelButton: true,
      confirmButtonColor: '#6259ca',
      cancelButtonColor: '#6259ca',
      confirmButtonText: 'Yes, Generate it!',
      reverseButtons: true,
    }).then((result: any) => {
      if (result.isConfirmed) {
        
     this.timetableSrv.generatetimetablebyclass(this.classid).subscribe({
      next: result => {
        
        this.gridList=[];
        this.gridList = result.data;
        console.log(result.data);
        this.pagination.totalCount=result.data[0]?.totalRecords || 0;
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
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
  getBranches() {
    this.branchSrv.getbranches().subscribe({
      next: result => {
        
        this.branchList=[];
        this.branchList = result.data;
        if(result.data.length>0){
          this.FilterBranchId=this.branchList[0].branchId;
          this.getTimeTables( this.sectionId);
          }
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  changeCurdView(bitVal: boolean) {
    this.curdBtnIsList = bitVal;
    this.isEdit=false;
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
        this.timetableSrv.deletetimetable(row.teacherId).subscribe({
          next: result => {
            if (result.status) {
              this.getTimeTables( this.sectionId);
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
    
    this.timetableSrv.activetimetable(row.teacherId).subscribe({
      next: result => {
        if (result.status) {
          this.getTimeTables( this.sectionId);
          this.toast.success(result.message)
        }
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }

  sectionChange(val:any){
    ;
  this.sectionId=val.sectionId;
  this.getTimeTables(this.sectionId);
  }

  getClassSections() {
    if(this.pagination.pageSize==null)
    this.pagination.pageSize=10;
    this.classsectionSrv.classsectionsList(this.pagination.pageNo,this.pagination.pageSize,this.classid,this.searchText).subscribe({
      next: result => {
        
        this.sectionList=[];
        this.sectionList = result.data;
        if(result.data.length>0){
          this.FilterSectionId=this.sectionList[0].sectionId;
          this.sectionId=this.sectionList[0].sectionId;
          this.getTimeTables(this.sectionId);
          console.log(result.data);
          }

        this.pagination.totalCount=result.data[0]?.totalRecords || 0;
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }

}
