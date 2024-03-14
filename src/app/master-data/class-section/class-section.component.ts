import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BranchService } from 'src/app/domain/services/branch.service';
import { ClassService } from 'src/app/domain/services/class.service';
import { ClassSectionService } from 'src/app/domain/services/classsection.service';
import { SectionService } from 'src/app/domain/services/section.service';
import { paginationEnum } from 'src/app/shared/Enum/paginationEnum';
import { AuthService } from 'src/app/shared/security/auth-service.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { environment } from 'src/environments/environment';
declare var require: any;
import { v4 as uuidv4 } from 'uuid';
const Swal = require('sweetalert2');
@Component({
  selector: 'app-class-section',
  templateUrl: './class-section.component.html',
  styleUrls: ['./class-section.component.scss']
})
export class ClassSectionComponent {
  public classsectionForm!: FormGroup;
  submitted = false;
  curdBtnIsList:boolean = true;
  gridList:any[]=[];
  selectedBranch:any={};
  pagination:any = paginationEnum;
  branchList: any[]=[];
  classList: any[]=[];
  sectionList: any[]=[];
  FilterBranchId:any=this.authSrv.getBranchIdFromLoginUser();
  isEdit:boolean=false;
  searchText:string='';
  constructor(private readonly fb: FormBuilder,
     private readonly toast: ToastrService,
     private readonly srv: ClassSectionService,
     private readonly branchSrv: BranchService,
     private readonly classSrv: ClassService, 
     private readonly sectionSrv:SectionService,
     private readonly common:CommonService,
     private readonly route: ActivatedRoute, 
     private readonly authSrv: AuthService   
       ) {
        
    this.classsectionForm = this.fb.group({
      classSectionId:uuidv4(),
      branchId: ["", Validators.required],
      classId: [this.route.snapshot.queryParams["cid"],Validators.required],
      sectionId: ["", Validators.required],
      description: [""]
    });
  }

  ngOnInit(): void {
    this.getClassbyId();
    this.getSections();
    this.getClassSections();
  }
  onPageChange(event: any) {
    
    this.pagination.pageNo = event;
    this.getClassSections();
    // You can perform any necessary actions with the selected page number here
  }
  onSearchText(){
    this.pagination.pageNo=1;
    this.pagination.pageSize=10;
    this.getClassSections();
  }

  get basicFormControl() {
    return this.classsectionForm.controls;
  }
  getClassSections() {
    if(this.pagination.pageSize==null)
    this.pagination.pageSize=10;
    this.srv.classsectionsList(this.pagination.pageNo,this.pagination.pageSize,this.route.snapshot.queryParams["cid"],this.searchText).subscribe({
      next: result => {
        
        this.gridList=[];
        this.gridList = result.data;

        this.pagination.totalCount=result.data[0]?.totalRecords || 0;
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  getClassbyId() {
    this.classSrv.getclassbyId(this.route.snapshot.queryParams["cid"]).subscribe({
      next: result => {
        
        this.classsectionForm.controls['branchId'].setValue(result.data.branchId);
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  getBranchClasses() {
    this.classSrv.getbranchclass(this.classsectionForm.value.branchId).subscribe({
      next: result => {
        
        this.classList=[];
        this.classList = result.data;

      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  getSections() {
    this.sectionSrv.getsections().subscribe({
      next: result => {
        
        this.sectionList=[];
        this.sectionList = this.common.sortByProperty(result.data,'sectionName');

      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  changeCurdView(bitVal: boolean) {
    this.curdBtnIsList = bitVal;
    this.isEdit=false;
  }
  setValueToForm(row: any) {
    
    this.classsectionForm.controls['classSectionId'].setValue(row.classSectionId);
    this.classsectionForm.controls['branchId'].setValue(row.branchId);
    this.classsectionForm.controls['sectionId'].setValue(row.sectionId);
    this.classsectionForm.controls['classId'].setValue(row.classId);
    this.classsectionForm.controls['description'].setValue(row.description);
    this.isEdit=true;
    this.curdBtnIsList = false;
  }
  isRecordExist(){
    const existing = this.gridList.find(obj => obj.branchId === this.classsectionForm.value.branchId && obj.classId===this.classsectionForm.value.classId && obj.sectionId===this.classsectionForm.value.sectionId && obj.classSectionId!=this.classsectionForm.value.classSectionId);

    if (existing) {
      this.toast.error("Class Course already exists")
      return true;
    }
    return false;
  }
  formSubmit() {
    
    this.submitted = true;
    if (!this.classsectionForm.valid)
      return;
      if(this.isRecordExist())
return;
    this.srv.saveclasssections(this.classsectionForm.value).subscribe({
      next: (data: any) => {
        this.classsectionForm.reset();

        this.classsectionForm.controls['classSectionId'].setValue(uuidv4());
        this.classsectionForm.controls['branchId'].setValue(this.FilterBranchId);
        this.classsectionForm.controls['classId'].setValue(this.route.snapshot.queryParams["cid"]);
        this.toast.success("Class Section  has been Saved.");
        this.isEdit=false;
        this.getClassSections();
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
        this.srv.delete(row.classSectionId).subscribe({
          next: result => {
            if (result.status) {
              this.getClassSections();
              this.toast.success(result.message)
            }
          },
          error: (err: any) => { this.toast.error(err.message) },
        });
        Swal.fire({
          title: 'Deleted!',
          text: 'Your Class Section has been deleted.',
          icon: 'success',
          confirmButtonColor: '#6259ca',
        });
      }
    });
  }
  IsActive(row: any) {
    
    this.srv.active(row.classSectionId).subscribe({
      next: result => {
        if (result.status) {
          this.getClassSections();
          this.toast.success(result.message)
        }
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  get classSectionId() { return this.classsectionForm.get("classSectionId"); }
  get branchId() { return this.classsectionForm.get("branchId"); }
  get classId() { return this.classsectionForm.get("classId"); }
  get sectionId() { return this.classsectionForm.get("sectionId"); }
  get description() { return this.classsectionForm.get("description"); }
}
