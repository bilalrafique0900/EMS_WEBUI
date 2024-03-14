import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
declare var require: any;
import { v4 as uuidv4 } from 'uuid';
import { HttpRequestService } from 'src/app/shared/services/http-request.service';
import { paginationEnum } from 'src/app/shared/Enum/paginationEnum';
import { RoomService } from 'src/app/domain/services/room.service';
import { BranchService } from 'src/app/domain/services/branch.service';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/shared/security/auth-service.service';
const Swal = require('sweetalert2');
@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit {
  public roomForm!: FormGroup;
  submitted = false;
  curdBtnIsList: boolean = true;
  gridList: any[] = [];
  pagination: any = paginationEnum;
  branchList: any[] = [];
  FilterBranchId: any = this.authSrv.getBranchIdFromLoginUser();
  searchText: string = '';
  isEdit: boolean = false;
  constructor(private readonly fb: FormBuilder,
    private readonly toast: ToastrService,
    private readonly roomService: RoomService,
    private readonly branchSrv: BranchService,
    private readonly http: HttpRequestService,
    private readonly authSrv: AuthService) {
    this.roomForm = this.fb.group({
      romeId: uuidv4(),
      branchId: [this.FilterBranchId, Validators.required],
      roomName: ["", Validators.required],
    });
  }

  ngOnInit(): void {
    this.getBranches();
    //this.getRooms();

  }

  get basicFormControl() {
    return this.roomForm.controls;
  }
  onPageChange(event: any) {

    this.pagination.pageNo = event;
    this.getRooms();
    // You can perform any necessary actions with the selected page number here
  }
  onSearchText() {
    this.pagination.pageNo = 1;
    this.pagination.pageSize = 10;
    this.getRooms();
  }
  getRooms() {
    if (this.pagination.pageSize == null)
      this.pagination.pageSize = 10;

    this.roomService.roomsList(this.pagination.pageNo, this.pagination.pageSize, this.FilterBranchId, this.searchText).subscribe({
      next: result => {

        this.gridList = [];
        this.gridList = result.data;
        this.pagination.totalCount = result.data[0]?.totalRecords || 0;
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  getBranches() {
    this.branchSrv.getbranches().subscribe({
      next: result => {

        this.branchList = [];
        this.branchList = result.data;
        if (result.data.length > 0) {
          //this.FilterBranchId=this.branchList[0].branchId;
          this.getRooms();
        }
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  changeCurdView(bitVal: boolean) {
    this.curdBtnIsList = bitVal;
    this.isEdit = false;
  }
  setValueToForm(row: any) {
    this.roomForm.controls['romeId'].setValue(row.romeId);
    this.roomForm.controls['branchId'].setValue(row.branchId);
    this.roomForm.controls['roomName'].setValue(row.roomName);
    this.isEdit = true;
    this.curdBtnIsList = false;
  }
  isRecordExist() {
    const existing = this.gridList.find(obj => obj.roomName.trim().toLowerCase() === this.roomForm.value.roomName.trim().toLowerCase() && obj.branchId != this.roomForm.value.branchId && obj.romeId != this.roomForm.value.romeId);

    if (existing) {
      this.toast.error("Room Name already exists")
      return true;
    }
    return false;
  }
  formSubmit() {

    this.submitted = true;
    if (!this.roomForm.valid)
      return;
    if (this.isRecordExist())
      return;
    this.roomService.saveroom(this.roomForm.value).subscribe({
      next: (data: any) => {
        this.roomForm.reset();

        this.roomForm.controls['romeId'].setValue(uuidv4());
        this.roomForm.controls['branchId'].setValue(this.FilterBranchId);
        this.toast.success("Room  has been Saved.");
        this.isEdit = false;
        this.getRooms();
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
        this.http.get(`master/room/delete?id=${row.romeId}`).subscribe({
          next: result => {
            if (result.status) {
              this.getRooms();
              this.toast.success(result.message)
            }
          },
          error: (err: any) => { this.toast.error(err.message) },
        });
        Swal.fire({
          title: 'Deleted!',
          text: 'Your Room has been deleted.',
          icon: 'success',
          confirmButtonColor: '#6259ca',
        });
      }
    });
  }
  IsActive(row: any) {

    this.http.get(`master/room/active?id=${row.romeId}`).subscribe({
      next: result => {
        if (result.status) {
          this.getRooms();
          this.toast.success(result.message)
        }
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
}
