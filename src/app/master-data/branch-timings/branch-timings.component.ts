import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { paginationEnum } from 'src/app/shared/Enum/paginationEnum';
import { CommonService } from 'src/app/shared/services/common.service';
import { HttpRequestService } from 'src/app/shared/services/http-request.service';
declare var require: any;
import { v4 as uuidv4 } from 'uuid';
const Swal = require('sweetalert2');
@Component({
  selector: 'app-branch-timings',
  templateUrl: './branch-timings.component.html',
  styleUrls: ['./branch-timings.component.scss'],
  providers: [DatePipe]
})
export class BranchTimingsComponent {
  public branchtimingsForm!: FormGroup;
  submitted = false;
  curdBtnIsList:boolean = true;
  branchStartsTimePicker: { hour:number,minute:number };
  branchEndTimePicker: { hour:number,minute:number };
  breakTimePicker: { hour:number,minute:number };
  gridList: any[]=[];
  pagination:any = paginationEnum;
  branchList: any[]=[];
  isEdit: boolean=false;
  searchText:string='';
  setDefaultTime(){
    this.branchStartsTimePicker = {
      // day: 1,
      // month: 1,
      // year: new Date().getFullYear(),
      hour: new Date().getHours(),
      minute: new Date().getMinutes()
    };
    this.branchEndTimePicker = {
      // day: 1,
      // month: 1,
      // year: new Date().getFullYear(),
      hour: new Date().getHours(),
      minute: new Date().getMinutes()
    };
    this.breakTimePicker={
      // day: 1,
      // month: 1,
      // year: new Date().getFullYear(),
      hour: new Date().getHours(),
  minute: new Date().getMinutes()
    };
  }
  constructor(private fb: FormBuilder, private toast: ToastrService, 
    private readonly common:CommonService,
    private http: HttpRequestService,private datePipe:DatePipe) {
    this.branchtimingsForm = this.fb.group({
      branchTimingsId:  uuidv4(),
      branchId: ["", Validators.required],
      breakTime: ["", Validators.required],
      branchStartsTime: ["", Validators.required],
      branchEndTime: ["", Validators.required],
    });
    this.branchStartsTimePicker = {
      // day: 1,
      // month: 1,
      // year: new Date().getFullYear(),
      hour: new Date().getHours(),
      minute: new Date().getMinutes()
    };
    this.branchEndTimePicker = {
      // day: 1,
      // month: 1,
      // year: new Date().getFullYear(),
      hour: new Date().getHours(),
      minute: new Date().getMinutes()
    };
    this.breakTimePicker={
      // day: 1,
      // month: 1,
      // year: new Date().getFullYear(),
      hour: new Date().getHours(),
  minute: new Date().getMinutes()
    };
  }

  ngOnInit(): void {
    this.getBranchTimings();
    this.getBranches();
  }
  onPageChange(event: any) {
    
    this.pagination.pageNo = event;
    this.getBranchTimings();
    // You can perform any necessary actions with the selected page number here
  }
  get basicFormControl() {
    return this.branchtimingsForm.controls;
  }
  onSearchText(){
    this.pagination.pageNo=1;
    this.pagination.pageSize=10;
    this.getBranchTimings();
  }
  getBranchTimings() {
    if(this.pagination.pageSize==null)
    this.pagination.pageSize=10;
    this.http.get('master/branch-timings/branch-list?pageNo='+this.pagination.pageNo+'&pageSize='+this.pagination.pageSize+'&searchText='+this.searchText).subscribe({
      next: result => {
        
        this.gridList=[];
        this.gridList = result.data;
        this.pagination.totalCount=result.data[0].totalRecords || 0;
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  changeCurdView(bitVal: boolean) {
    this.curdBtnIsList = bitVal;
    this.isEdit=false;
  }
  setValueToForm(row: any) {
    this.branchtimingsForm.controls['branchTimingsId'].setValue(row.branchTimingsId);
    this.branchtimingsForm.controls['branchId'].setValue(row.branchId);
 
    let FormatebranchStartsTime = this.datePipe.transform(row?.branchStartsTime,"HH:mm");
    let splitbranchStartsTime:any = FormatebranchStartsTime?.split(':');
    this.branchStartsTimePicker.hour = Number(splitbranchStartsTime[0]);
    this.branchStartsTimePicker.minute = Number(splitbranchStartsTime[1]);

    let FormatebranchEndTime = this.datePipe.transform(row?.branchEndTime,"HH:mm");
    let splitbranchEndTime:any = FormatebranchEndTime?.split(':');
    this.branchEndTimePicker.hour = Number(splitbranchEndTime[0]);
    this.branchEndTimePicker.minute = Number(splitbranchEndTime[1]);

    let FormatebreakTime = this.datePipe.transform(row?.breakTime,"HH:mm");
    let splitbreakTime:any = FormatebreakTime?.split(':');
    this.breakTimePicker.hour = Number(splitbreakTime[0]);
    this.breakTimePicker.minute = Number(splitbreakTime[1]);
    this.isEdit=true;
    this.curdBtnIsList = false;
  }
  isRecordExist(){
    const existing = this.gridList.find(obj => obj.branchTimingsId!=this.branchtimingsForm.value.branchTimingsId && obj.branchId==this.branchtimingsForm.value.branchId);

    if (existing) {
      this.toast.error("branch Timings already exists")
      return true;
    }
    return false;
  }
  getBranches() {
    this.http.get('master/branch').subscribe({
      next: result => {
        
        this.branchList=[];
        this.branchList = this.common.sortByProperty(result.data,'branchName');

      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  formSubmit() {
    
    this.submitted = true;
    if (!this.branchtimingsForm.valid)
      return;
      if(this.isRecordExist())
return;
      let startDate = this.branchStartsTimePicker.hour +':'+ this.branchStartsTimePicker.minute;
      let endDate = this.branchEndTimePicker.hour +':'+ this.branchEndTimePicker.minute;
      let breakTimeDate = this.breakTimePicker.hour +':'+ this.breakTimePicker.minute;
      this.branchtimingsForm.value['branchStartsTime'] = startDate;
      this.branchtimingsForm.value['branchEndTime'] = endDate;
      this.branchtimingsForm.value['breakTime'] = breakTimeDate;
    this.http.post('master/branch-timings',this.branchtimingsForm.value).subscribe({
      next: (data: any) => {
        this.branchtimingsForm.reset();

        this.branchtimingsForm.controls['branchTimingsId'].setValue(uuidv4());
        this.toast.success("Branch Timings  has been Saved.");
        this.isEdit=false;
        this.getBranchTimings();
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
        this.http.get(`master/institute/delete?id=${row.branchTimingsId}`).subscribe({
          next: result => {
            if (result.status) {
              this.getBranchTimings();
              this.toast.success(result.message)
            }
          },
          error: (err: any) => { this.toast.error(err.message) },
        });
        Swal.fire({
          title: 'Deleted!',
          text: 'Your branch Timings has been deleted.',
          icon: 'success',
          confirmButtonColor: '#6259ca',
        });
      }
    });
  }
  IsActive(row: any) {
    
    this.http.get(`master/branch-timings/active?id=${row.branchTimingsId}`).subscribe({
      next: result => {
        if (result.status) {
          this.getBranchTimings();
          this.toast.success(result.message)
        }
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  get branchTimingsId() { return this.branchtimingsForm.get("branchTimingsId"); }
  get branchId() { return this.branchtimingsForm.get("branchId"); }
  get breakTime() { return this.branchtimingsForm.get("breakTime"); }
  get branchStartsTime() { return this.branchtimingsForm.get("branchStartsTime"); }
  get branchEndTime() { return this.branchtimingsForm.get("branchEndTime"); }
}