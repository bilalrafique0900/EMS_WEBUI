import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
declare var require: any;
import { v4 as uuidv4 } from 'uuid';
import { HttpRequestService } from 'src/app/shared/services/http-request.service';
import { paginationEnum } from 'src/app/shared/Enum/paginationEnum';
import { TemplateService } from 'src/app/domain/services/template.service';
import { Editor, Toolbar } from 'ngx-editor';
import { LovService } from 'src/app/domain/services/Lov.service';
import { LovCode } from 'src/app/shared/Enum/lov-enum';
import { AuthService } from 'src/app/shared/security/auth-service.service';
const Swal = require('sweetalert2');
@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.scss']
})
export class TemplateComponent implements OnInit {
  editor: any;
  public templateForm!: FormGroup;
  submitted = false;
  curdBtnIsList: boolean = true;
  gridList: any[] = [];
  pagination: any = paginationEnum;
  branchList: any[] = [];
  FilterBranchId: any = this.authSrv.getBranchIdFromLoginUser();
  searchText: string = '';
  isEdit: boolean = false;
  templateList: any[] = [];
  constructor(private readonly fb: FormBuilder,
    private readonly toast: ToastrService,
    private readonly templateService: TemplateService,
    private readonly http: HttpRequestService,
    private readonly LovServ: LovService,
    private readonly authSrv: AuthService
  ) {
    this.templateForm = this.fb.group({
      templateId: uuidv4(),
      branchId: [this.FilterBranchId, Validators.required],
      templateName: ["", Validators.required],
      templateTypeId: ["", Validators.required],
      templateKeyCode: [""],
      templateContent: ["", Validators.required]
    });
  }

  ngOnInit(): void {
    this.editor = new Editor();
    this.getTemplates();
    this.getTemplateTypeByLovCode();

  }
  // make sure to destory the editor
  ngOnDestroy(): void {
    this.editor.destroy();
  }
  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];
  get basicFormControl() {
    return this.templateForm.controls;
  }
  onPageChange(event: any) {

    this.pagination.pageNo = event;
    this.getTemplates();
    // You can perform any necessary actions with the selected page number here
  }
  onSearchText() {
    this.pagination.pageNo = 1;
    this.pagination.pageSize = 10;
    this.getTemplates();
  }
  getTemplateTypeByLovCode(): void {
    this.LovServ.getLevelByCode(LovCode.TEMPLATE_TYPE).subscribe({
      next: (result) => {
        this.templateList = result.data;
      },
      error: (err: any) => {
        this.toast.error(err.message);
      },
    });
  }
  getTemplates() {
    if (this.pagination.pageSize == null)
      this.pagination.pageSize = 10;

    this.templateService.templatesList(this.pagination.pageNo, this.pagination.pageSize, this.FilterBranchId, this.searchText).subscribe({
      next: result => {

        this.gridList = [];
        this.gridList = result.data.data;
        this.pagination.totalCount = result.data.totalCount;
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  changeCurdView(bitVal: boolean) {
    this.curdBtnIsList = bitVal;
    this.isEdit = false;
  }
  setValueToForm(row: any) {
    this.templateForm.controls['templateId'].setValue(row.templateId);
    this.templateForm.controls['branchId'].setValue(row.branchId);
    this.templateForm.controls['templateName'].setValue(row.templateName);
    this.templateForm.controls['templateTypeId'].setValue(row.templateTypeId);
    this.templateForm.controls['templateKeyCode'].setValue(row.templateKeyCode);
    this.templateForm.controls['templateContent'].setValue(row.templateContent);
    this.isEdit = true;
    this.curdBtnIsList = false;
  }
  isRecordExist() {
    const existing = this.gridList.find(obj => obj.templateName.trim().toLowerCase() === this.templateForm.value.templateName.trim().toLowerCase() && obj.branchId == this.templateForm.value.branchId && obj.templateId != this.templateForm.value.templateId);

    if (existing) {
      this.toast.error("Template Name already exists")
      return true;
    }
    return false;
  }
  formSubmit() {

    this.submitted = true;
    if (!this.templateForm.valid)
      return;
    if (this.isRecordExist())
      return;
    this.templateService.saveTemplate(this.templateForm.value).subscribe({
      next: (data: any) => {
        this.templateForm.reset();

        this.templateForm.controls['templateId'].setValue(uuidv4());
        this.templateForm.controls['branchId'].setValue(this.FilterBranchId);
        this.toast.success("Template  has been Saved.");
        this.isEdit = false;
        this.getTemplates();
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
        this.http.get(`master/template/delete?id=${row.templateId}`).subscribe({
          next: result => {
            if (result.status) {
              this.getTemplates();
              this.toast.success(result.message)
            }
          },
          error: (err: any) => { this.toast.error(err.message) },
        });
        Swal.fire({
          title: 'Deleted!',
          text: 'Your Template has been deleted.',
          icon: 'success',
          confirmButtonColor: '#6259ca',
        });
      }
    });
  }
  IsActive(row: any) {

    this.http.get(`master/template/active?id=${row.templateId}`).subscribe({
      next: result => {
        if (result.status) {
          this.getTemplates();
          this.toast.success(result.message)
        }
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
}
