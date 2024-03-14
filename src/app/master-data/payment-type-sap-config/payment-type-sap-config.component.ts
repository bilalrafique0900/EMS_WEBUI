import { Component, OnInit } from '@angular/core';
import { FormBuilder,FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { v4 as uuidv4 } from 'uuid';
import { HttpRequestService } from 'src/app/shared/services/http-request.service';
import { paginationEnum } from 'src/app/shared/Enum/paginationEnum';
import { AuthService } from 'src/app/shared/security/auth-service.service';
import Swal from 'sweetalert2';
import { ZoneService } from 'src/app/domain/services/zone.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { PaymentTypeSapConfigService } from 'src/app/domain/services/PaymentTypeSapConfig.service';
import { ActivatedRoute } from '@angular/router';
import { PaymentTypeService } from 'src/app/domain/services/payment-type.service';
@Component({
  selector: 'app-payment-type-sap-config',
  templateUrl: './payment-type-sap-config.component.html',
  styleUrls: ['./payment-type-sap-config.component.scss']
})
export class PaymentTypeSapConfigComponent {
  public PaymentTypeSapConfigForm!: FormGroup;
  submitted = false;
  curdBtnIsList:boolean = true;
  PaymentTypeSapConfigs: any[] = [];
  pagination:any = paginationEnum;
  isEdit: boolean=false;
  searchText:string='';
  paymentTypeId:any;
  FilterBranchId: any = this.authSrv.getBranchIdFromLoginUser();
  paymentTypes: any[]=[];
  constructor(
    private fb: FormBuilder, 
    private toast: ToastrService,
    private paymentTypeSapConfigService: PaymentTypeSapConfigService,
    private readonly paymentTypeService: PaymentTypeService,
    private authSrv: AuthService,
    private readonly common:CommonService,
    private readonly route: ActivatedRoute) {
    this.PaymentTypeSapConfigForm = this.fb.group({
      PaymentTypeSapConfigId: [uuidv4()],
      paymentTypeId: ['',Validators.required],
      SapCode:['',Validators.required],
      CostCenter1:[''],
      CostCenter2:[''],
      CostCenter3:[''],
      CostCenter4:[''],
      CostCenter5:[''],
    });
    // this.paymentTypeId = this.route.snapshot.queryParams["id"];
    // this.PaymentTypeSapConfigForm.controls['paymentTypeId'].setValue(this.paymentTypeId );
  }
  ngOnInit(): void {
    this.getPaymentTypeSapConfigs();
    this.getPaymentType();
  }
  get basicFormControl() {
    return this.PaymentTypeSapConfigForm.controls;
  }
  onPageChange(event: any) {
    this.pagination.pageNo = event;
    this.getPaymentTypeSapConfigs();
  }
  onSearchText(){
    this.pagination.pageNo=1;
    this.pagination.pageSize=10;
    this.getPaymentTypeSapConfigs();
  }
  getPaymentType() {

    this.paymentTypeService.getpaymentTypesbyBranch(this.FilterBranchId).subscribe({
      next: result => {

        this.paymentTypes = [];
        this.paymentTypes = this.common.sortByProperty(result.data,'type');
      },
      error: (err: any) => { this.toast.error(err.message) },
    });
  }
  getPaymentTypeSapConfigs() {
    if(this.pagination.pageSize==null)
    this.pagination.pageSize=10;
    this.paymentTypeSapConfigService.get(this.pagination.pageNo,this.pagination.pageSize,this.pagination.searchText).subscribe({
      next: result => {
        
        this.PaymentTypeSapConfigs=[];
        this.PaymentTypeSapConfigs = result.data;
        if(result.data.length > 0)
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
    this.PaymentTypeSapConfigForm.controls['PaymentTypeSapConfigId'].setValue(row.paymentTypeSapConfigId);
    this.PaymentTypeSapConfigForm.controls['paymentTypeId'].setValue(row.paymentTypeId);
    this.PaymentTypeSapConfigForm.controls['SapCode'].setValue(row.sapCode);
    this.PaymentTypeSapConfigForm.controls['CostCenter1'].setValue(row.costCenter1);
    this.PaymentTypeSapConfigForm.controls['CostCenter2'].setValue(row.costCenter2);
    this.PaymentTypeSapConfigForm.controls['CostCenter3'].setValue(row.costCenter3);
    this.PaymentTypeSapConfigForm.controls['CostCenter4'].setValue(row.costCenter4);
    this.PaymentTypeSapConfigForm.controls['CostCenter5'].setValue(row.costCenter5);
    this.curdBtnIsList = false;
    this.isEdit=true;
  }
  formSubmit() {
    this.submitted = true;
    if (!this.PaymentTypeSapConfigForm.valid)
      return;
    this.paymentTypeSapConfigService.saveUpdate(this.PaymentTypeSapConfigForm.value).subscribe({
      next: (data: any) => {
        if(data.status){
          this.PaymentTypeSapConfigForm.reset();
          this.PaymentTypeSapConfigForm.controls['PaymentTypeSapConfigId'].setValue(uuidv4());
          this.toast.success("PaymentTypeSapConfig has been Saved.");
          this.isEdit=false;
          this.getPaymentTypeSapConfigs();
        }else{
          this.toast.error(data.message);
        }
        
      },
      error: (err: any) => {
        this.toast.error(err.error);
      },
    });
  }
}
