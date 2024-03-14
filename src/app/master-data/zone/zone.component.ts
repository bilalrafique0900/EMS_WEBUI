import { Component, OnInit } from '@angular/core';
import { FormBuilder,FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { v4 as uuidv4 } from 'uuid';
import { HttpRequestService } from 'src/app/shared/services/http-request.service';
import { paginationEnum } from 'src/app/shared/Enum/paginationEnum';
import { ZoneService } from 'src/app/domain/services/zone.service';
import { AuthService } from 'src/app/shared/security/auth-service.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-zone',
  templateUrl: './zone.component.html',
  styleUrls: ['./zone.component.scss']
})
export class ZoneComponent {
  public zoneForm!: FormGroup;
  submitted = false;
  curdBtnIsList:boolean = true;
  zones: any[] = [];
  pagination:any = paginationEnum;
  isEdit: boolean=false;
  searchText:string='';
  branchId:any;
  constructor(
    private fb: FormBuilder, 
    private toast: ToastrService,
    private zoneService: ZoneService, 
    private http: HttpRequestService,
    private authSrv : AuthService) {
    this.zoneForm = this.fb.group({
      zoneId: [uuidv4()],
      branchId:['',Validators.required],
      zoneName: ['', Validators.required],
    });
    this.branchId = this.authSrv.getBranchIdFromLoginUser();
    this.zoneForm.controls['branchId'].setValue(this.branchId );
  }

  ngOnInit(): void {
    this.getzones();
  }
  get basicFormControl() {
    return this.zoneForm.controls;
  }
  onPageChange(event: any) {
    this.pagination.pageNo = event;
    this.getzones();
  }
  onSearchText(){
    this.pagination.pageNo=1;
    this.pagination.pageSize=10;
    this.getzones();
  }
  getzones() {
    if(this.pagination.pageSize==null)
    this.pagination.pageSize=10;
    if(this.pagination.searchText=='')
    this.pagination.searchText = "";
    this.zoneService.get(this.pagination.pageNo,this.pagination.pageSize,this.pagination.searchText,this.branchId ).subscribe({
      next: result => {
        this.zones=[];
        this.zones = result.data;
        if(result.data.length > 0)
        this.pagination.totalCount=result.data[0].totalCount;
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  changeCurdView(bitVal: boolean) {
    this.curdBtnIsList = bitVal;
    this.isEdit=false;
  }
  setValueToForm(row: any) {
    this.zoneForm.controls['zoneId'].setValue(row.zoneId);
    this.zoneForm.controls['zoneName'].setValue(row.zoneName);
    this.zoneForm.controls['branchId'].setValue(row.branchId);
    this.curdBtnIsList = false;
    this.isEdit=true;
  }
  formSubmit() {
    
    this.submitted = true;
    if (!this.zoneForm.valid)
      return;
    this.zoneService.saveUpdate(this.zoneForm.value).subscribe({
      next: (data: any) => {
        this.zoneForm.reset();
        this.zoneForm.controls['zoneId'].setValue(uuidv4());
        this.zoneForm.controls['branchId'].setValue(this.authSrv.getBranchIdFromLoginUser());
        this.toast.success("zone has been Saved.");
        this.isEdit=false;
        this.getzones();
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
        this.zoneService.delete(row.zoneId).subscribe({
          next: result => {
            if (result.status) {
              this.getzones();
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
    this.zoneService.active(row.zoneId).subscribe({
      next: result => {
        if (result.status) {
          this.getzones();
          this.toast.success("Record Active OR InActive SuccessFully");
        }
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
}
