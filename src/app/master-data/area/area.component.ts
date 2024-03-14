import { Component, OnInit } from '@angular/core';
import { FormBuilder,FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { v4 as uuidv4 } from 'uuid';
import { HttpRequestService } from 'src/app/shared/services/http-request.service';
import { paginationEnum } from 'src/app/shared/Enum/paginationEnum';
import { AuthService } from 'src/app/shared/security/auth-service.service';
import Swal from 'sweetalert2';
import { AreaService } from 'src/app/domain/services/area.service';
import { ZoneService } from 'src/app/domain/services/zone.service';
import { CommonService } from 'src/app/shared/services/common.service';
@Component({
  selector: 'app-area',
  templateUrl: './area.component.html',
  styleUrls: ['./area.component.scss']
})
export class AreaComponent {
  public areaForm!: FormGroup;
  submitted = false;
  curdBtnIsList:boolean = true;
  areas: any[] = [];
  zones: any[] = [];
  pagination:any = paginationEnum;
  isEdit: boolean=false;
  searchText:string='';
  branchId:any;
  constructor(
    private fb: FormBuilder, 
    private toast: ToastrService,
    private areaService: AreaService, 
    private authSrv : AuthService,
    private readonly common:CommonService,
    private zoneService : ZoneService) {
    this.areaForm = this.fb.group({
      areaId: [uuidv4()],
      zoneId: ['',Validators.required],
      branchId:['',Validators.required],
      areaName: ['', Validators.required],
    });
    this.branchId = this.authSrv.getBranchIdFromLoginUser();
    this.areaForm.controls['branchId'].setValue(this.branchId );
  }

  ngOnInit(): void {
    this.getAreas();
    this.getZones();
  }
  get basicFormControl() {
    return this.areaForm.controls;
  }
  onPageChange(event: any) {
    this.pagination.pageNo = event;
    this.getAreas();
  }
  onSearchText(){
    this.pagination.pageNo=1;
    this.pagination.pageSize=10;
    this.getAreas();
  }
  getAreas() {
    if(this.pagination.pageSize==null)
    this.pagination.pageSize=10;
    this.areaService.get(this.pagination.pageNo,this.pagination.pageSize,this.pagination.searchText,this.branchId ).subscribe({
      next: result => {
        this.areas=[];
        this.areas = result.data;
        if(result.data.length > 0)
        this.pagination.totalCount=result.data[0].totalCount;
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  getZones() {
    this.zoneService.getall(this.branchId ).subscribe({
      next: result => {
        this.zones=[];
        this.zones = this.common.sortByProperty(result.data,'zoneName');
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  changeCurdView(bitVal: boolean) {
    this.curdBtnIsList = bitVal;
    this.isEdit=false;
  }
  setValueToForm(row: any) {
    this.areaForm.controls['areaId'].setValue(row.areaId);
    this.areaForm.controls['zoneId'].setValue(row.zoneId);
    this.areaForm.controls['areaName'].setValue(row.areaName);
    this.areaForm.controls['branchId'].setValue(row.branchId);
    this.curdBtnIsList = false;
    this.isEdit=true;
  }
  formSubmit() {
    
    this.submitted = true;
    if (!this.areaForm.valid)
      return;
    this.areaService.saveUpdate(this.areaForm.value).subscribe({
      next: (data: any) => {
        this.areaForm.reset();
        this.areaForm.controls['areaId'].setValue(uuidv4());
        this.areaForm.controls['branchId'].setValue(this.authSrv.getBranchIdFromLoginUser());
        this.toast.success("area has been Saved.");
        this.isEdit=false;
        this.getAreas();
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
        this.areaService.delete(row.areaId).subscribe({
          next: result => {
            if (result.status) {
              this.getAreas();
              this.toast.success("Record Deleted SuccessFully")
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
    this.areaService.active(row.areaId).subscribe({
      next: result => {
        if (result.status) {
          this.getAreas();
          this.toast.success("Record Active OR InActive SuccessFully");
        }
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
}
