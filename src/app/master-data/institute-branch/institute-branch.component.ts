import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { paginationEnum } from 'src/app/shared/Enum/paginationEnum';
import { SimpleDataTable } from 'src/app/shared/data/tables_data/data_table';
import { CommonService } from 'src/app/shared/services/common.service';
import { HttpRequestService } from 'src/app/shared/services/http-request.service';
declare var require: any;
import { v4 as uuidv4 } from 'uuid';
const Swal = require('sweetalert2');
@Component({
  selector: 'app-institute-branch',
  templateUrl: './institute-branch.component.html',
  styleUrls: ['./institute-branch.component.scss']
})
export class InstituteBranchComponent {
  dataTable = SimpleDataTable;
  public instituteBranchForm!: FormGroup;
  submitted = false;
  curdBtnIsList:boolean = true;
  gridInstituteList:any={};
  gridList:any[]=[];
  selectedBranch:any={};
  pagination:any = paginationEnum;
isEdit:boolean=false;
  constructor(private fb: FormBuilder, private toast: ToastrService, 
    private readonly common:CommonService,
    private http: HttpRequestService) {
    this.instituteBranchForm = this.fb.group({
      BranchId: uuidv4(),
      BranchName: ["", Validators.required],
      InstituteId: ["", Validators.required],
      Address: [""],
      Description: [""]
    });
  }

  ngOnInit(): void {
    
    this.getInstitutes();
    this.getBranches();
  }
  onPageChange(event: any) {
    
    this.pagination.pageNo = event;
    this.getBranches();
    // You can perform any necessary actions with the selected page number here
  }
  onSearchText(){
    this.pagination.pageNo=1;
    this.pagination.pageSize=10;
    this.getBranches();
  }

  get basicFormControl() {
    return this.instituteBranchForm.controls;
  }
  getInstitutes() {
    this.http.get('master/institute/get').subscribe({
      next: result => {
        this.gridInstituteList = this.common.sortByProperty(result.data,'instituteName');
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  getBranches() {
    if(this.pagination.pageSize==null)
    this.pagination.pageSize=10;
    this.http.get('master/branch/branches-list?pageNo='+this.pagination.pageNo+'&pageSize='+this.pagination.pageSize+'&searchText='+this.pagination.searchText).subscribe({
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
    
    this.instituteBranchForm.controls['InstituteId'].setValue(row.instituteId);
    this.instituteBranchForm.controls['BranchId'].setValue(row.branchId);
    this.instituteBranchForm.controls['BranchName'].setValue(row.branchName);
    this.instituteBranchForm.controls['Description'].setValue(row.description);
    this.instituteBranchForm.controls['Address'].setValue(row.address);
    this.isEdit=true;
    this.curdBtnIsList = false;
  }
  isRecordExist(){
    const existing = this.gridList.find(obj => obj.branchName.trim().toLowerCase() === this.instituteBranchForm.value.BranchName.trim().toLowerCase() && obj.instituteId===this.instituteBranchForm.value.InstituteId && obj.branchId!=this.instituteBranchForm.value.BranchId);

    if (existing) {
      this.toast.error("Branch Name already exists")
      return true;
    }
    return false;
  }
  formSubmit() {
    
    this.submitted = true;
    if (!this.instituteBranchForm.valid)
      return;
      if(this.isRecordExist())
return;
    this.http.post('master/branch/create-update',this.instituteBranchForm.value).subscribe({
      next: (data: any) => {
        this.instituteBranchForm.reset();
        this.instituteBranchForm.controls['BranchId'].setValue(uuidv4());
        this.toast.success("Branch  has been Saved.");
        this.isEdit=false;
        this.getBranches();
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
        this.http.get(`master/branch/delete?id=${row.branchId}`).subscribe({
          next: result => {
            if (result.status) {
              this.getBranches();
              this.toast.success(result.message)
            }
          },
          error: (err: any) => { this.toast.error(err.message) },
        });
        Swal.fire({
          title: 'Deleted!',
          text: 'Your branch has been deleted.',
          icon: 'success',
          confirmButtonColor: '#6259ca',
        });
      }
    });
  }
  IsActive(row: any) {
    
    this.http.get(`master/branch/active?id=${row.branchId}`).subscribe({
      next: result => {
        if (result.status) {
          this.getBranches();
          this.toast.success(result.message)
        }
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  get BranchId() { return this.instituteBranchForm.get("BranchId"); }
  get BranchName() { return this.instituteBranchForm.get("BranchName"); }
  get InstituteId() { return this.instituteBranchForm.get("InstituteId"); }
  get Address() { return this.instituteBranchForm.get("Address"); }
  get Description() { return this.instituteBranchForm.get("Description"); }
}
