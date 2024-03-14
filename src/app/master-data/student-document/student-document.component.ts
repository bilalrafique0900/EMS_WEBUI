import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
declare var require: any;
import { v4 as uuidv4 } from 'uuid';
import { HttpRequestService } from 'src/app/shared/services/http-request.service';
import { paginationEnum } from 'src/app/shared/Enum/paginationEnum';
import { BranchService } from 'src/app/domain/services/branch.service';
import { environment } from 'src/environments/environment';
import { StudentDocumentService } from 'src/app/domain/services/student-document.service';
const Swal = require('sweetalert2');
@Component({
  selector: 'app-student-document',
  templateUrl: './student-document.component.html',
  styleUrls: ['./student-document.component.scss']
})
export class StudentDocumentComponent implements OnInit {
  public documentForm!: FormGroup;
  submitted = false;
  curdBtnIsList:boolean = true;
  gridList: any[] = [];
  pagination:any = paginationEnum;
  branchList: any[]=[];
  searchText:string='';
isEdit:boolean=false;
  constructor(private readonly fb: FormBuilder,
     private readonly toast: ToastrService,
     private readonly documentService:StudentDocumentService,
      private readonly http: HttpRequestService) {
    this.documentForm = this.fb.group({
      studentDocumentId: uuidv4(),
      lovId:uuidv4(),
      isRequired:[false],
      documentName:["",Validators.required],
    });
  }

  ngOnInit(): void {
    this.getStudentDocuments();

  }

  get basicFormControl() {
    return this.documentForm.controls;
  }
  onPageChange(event: any) {
    
    this.pagination.pageNo = event;
    this.getStudentDocuments();
  }
  onSearchText(){
    this.pagination.pageNo=1;
    this.pagination.pageSize=10;
    this.getStudentDocuments();
  }
  getStudentDocuments() {
    if(this.pagination.pageSize==null)
    this.pagination.pageSize=10;
    
    this.documentService.studentDocumentsList(this.pagination.pageNo,this.pagination.pageSize,this.searchText).subscribe({
      next: result => {
        
        this.gridList=[];
        this.gridList = result.data.data;
        this.pagination.totalCount=result.data?.totalCount;
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  changeCurdView(bitVal: boolean) {
    this.curdBtnIsList = bitVal;
    this.isEdit=false;
  }
  setValueToForm(row: any) {
    this.documentForm.controls['studentDocumentId'].setValue(row.studentDocumentId);
    this.documentForm.controls['lovId'].setValue(row.lovId);
    this.documentForm.controls['documentName'].setValue(row.documentName);
    this.documentForm.controls['isRequired'].setValue(row.isRequired);
    this.isEdit=true;
    this.curdBtnIsList = false;
  }
  isRecordExist(){
    const existing = this.gridList.find(obj => obj.documentName.trim().toLowerCase() === this.documentForm.value.documentName.trim().toLowerCase()  && obj.studentDocumentId!=this.documentForm.value.studentDocumentId);

    if (existing) {
      this.toast.error("Document Name already exists")
      return true;
    }
    return false;
  }
  formSubmit() {
    
    this.submitted = true;
    if (!this.documentForm.valid)
      return;
      if(this.isRecordExist())
return;
    this.documentService.saveStudentDocument(this.documentForm.value).subscribe({
      next: (data: any) => {
        this.documentForm.reset();

        this.documentForm.controls['studentDocumentId'].setValue(uuidv4());
        this.documentForm.controls['lovId'].setValue(uuidv4());
        this.toast.success("Document  has been Saved.");
        this.isEdit=false;
        this.getStudentDocuments();
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
        this.documentService.deleteStudentDocument(row.studentDocumentId).subscribe({
          next: result => {
            if (result.status) {
              this.getStudentDocuments();
              this.toast.success(result.message)
            }
          },
          error: (err: any) => { this.toast.error(err.message) },
        });
        Swal.fire({
          title: 'Deleted!',
          text: 'Your Document Name has been deleted.',
          icon: 'success',
          confirmButtonColor: '#6259ca',
        });
      }
    });
  }
  IsActive(row: any) {
    
    this.documentService.activeStudentDocument(row.studentDocumentId).subscribe({
      next: result => {
        if (result.status) {
          this.getStudentDocuments();
          this.toast.success(result.message)
        }
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  isRequired(row: any) {
    
    this.documentService.isRequiredStudentDocument(row.studentDocumentId).subscribe({
      next: result => {
        if (result.status) {
          this.getStudentDocuments();
          this.toast.success(result.message)
        }
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
}
