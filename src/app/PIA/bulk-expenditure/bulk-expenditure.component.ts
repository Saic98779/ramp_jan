import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonServiceService } from '@app/_services/common-service.service';
import { API_BASE_URL, APIS } from '@app/constants/constants';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import DataTable from 'datatables.net-dt';
import 'datatables.net-buttons-dt';
import 'datatables.net-responsive-dt';
import moment from 'moment';
declare var bootstrap: any;

@Component({
  selector: 'app-bulk-expenditure',
  templateUrl: './bulk-expenditure.component.html',
  styleUrls: ['./bulk-expenditure.component.css']
})
export class BulkExpenditureComponent implements OnInit {

    agencyId: any
    loginsessionDetails:any
    expenditureType:any='PRE'
    constructor(
      private _commonService: CommonServiceService,
      private toastrService: ToastrService,
    ) {
      this.loginsessionDetails = JSON.parse(sessionStorage.getItem('user') || '{}');    
      this.agencyId = JSON.parse(sessionStorage.getItem('user') || '{}').agencyId;
    }
  
    ngOnInit(): void {
      this.getHeadOfExpenditure()
      this.formDetailsBulk()
      this.getBulkExpenditure()
     
    }
  
    get fBulk() {
      return this.BulkExpenditureForm.controls;
    }
    @ViewChild('preEventModal') preEventModal!: ElementRef;
    activityList: any
    subActivitiesList: any
    programCreationMain!: FormGroup;
    BulkExpenditureForm!: FormGroup;
    ExpenditureData:any=[]
    getHeadOfExpenditure() {
      this._commonService.getDataByUrl(APIS.programExpenditure.getHeadOfExpenditure).subscribe({
        next: (data: any) => {
          this.ExpenditureData = data;
        },
        error: (err: any) => {
          this.ExpenditureData = [];
        }
      })
    }
   
    formDetailsBulk() {
      this.BulkExpenditureForm = new FormGroup({
        itemName: new FormControl("", [Validators.required]),
        purchaseDate: new FormControl("", [Validators.required]),
        purchasedQuantity: new FormControl("", [Validators.required,Validators.pattern(/^[1-9]\d*$/)]),
        headOfExpenseId: new FormControl("", [Validators.required]),
        unitCost: new FormControl("", [Validators.required,Validators.pattern(/^(0*[1-9]\d*(\.\d+)?|0+\.\d*[1-9]\d*)$/)]),
        billNo: new FormControl("", [Validators.required,Validators.pattern(/^[^\s].*/)]),
        billDate: new FormControl("", [Validators.required]),
        payeeName: new FormControl("", [Validators.required]),
        bankName: new FormControl("", ),
        transactionId: new FormControl("",[Validators.pattern(/^[^\s].*/)] ),
        ifscCode: new FormControl("", [Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]),
        modeOfPayment: new FormControl("", [Validators.required]),
        remarks: new FormControl("", ),
        checkDate:new FormControl("", ),
        checkNo:new FormControl("", [Validators.pattern(/^[0-9]\d*$/)]),
        uploadBillUrl: new FormControl("",),
      })
    }
    // Mode of payment
    modeOfPayment(val:any){
      if(val=='CASH'){
        this.BulkExpenditureForm.get('bankName')?.setValidators(null);
        this.BulkExpenditureForm.get('transactionId')?.setValidators(null);
        this.BulkExpenditureForm.get('ifscCode')?.setValidators(null);
        this.BulkExpenditureForm.get('checkNo')?.setValidators(null);
        this.BulkExpenditureForm.get('checkDate')?.setValidators(null);
        this.BulkExpenditureForm.get('bankName')?.patchValue('');
        this.BulkExpenditureForm.get('transactionId')?.patchValue('');
        this.BulkExpenditureForm.get('ifscCode')?.patchValue('');
        this.BulkExpenditureForm.get('bankName')?.clearValidators();
        this.BulkExpenditureForm.get('transactionId')?.clearValidators();
        this.BulkExpenditureForm.get('ifscCode')?.clearValidators();
        this.BulkExpenditureForm.get('bankName')?.disable();
        this.BulkExpenditureForm.get('transactionId')?.disable();
        this.BulkExpenditureForm.get('ifscCode')?.disable();
         this.BulkExpenditureForm.get('checkNo')?.patchValue('');
        this.BulkExpenditureForm.get('checkDate')?.patchValue('');
        this.BulkExpenditureForm.get('bankName')?.updateValueAndValidity();
        this.BulkExpenditureForm.get('transactionId')?.updateValueAndValidity();
        this.BulkExpenditureForm.get('ifscCode')?.updateValueAndValidity();
         this.BulkExpenditureForm.get('checkNo')?.updateValueAndValidity();
        this.BulkExpenditureForm.get('checkDate')?.updateValueAndValidity();
        this.BulkExpenditureForm.get('unitCost')?.setValidators([Validators.required, Validators.min(0), Validators.max(5000)]);
        this.BulkExpenditureForm.get('unitCost')?.updateValueAndValidity();
      }
      else if(val=='BANK_TRANSFER'){
        this.BulkExpenditureForm.get('bankName')?.setValidators([Validators.required]);
        this.BulkExpenditureForm.get('transactionId')?.setValidators(null);
        this.BulkExpenditureForm.get('ifscCode')?.setValidators([Validators.required,Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]);
        this.BulkExpenditureForm.get('checkNo')?.setValidators(null);
        this.BulkExpenditureForm.get('checkDate')?.setValidators(null);
        this.BulkExpenditureForm.get('bankName')?.enable();
        this.BulkExpenditureForm.get('transactionId')?.disable();
        this.BulkExpenditureForm.get('ifscCode')?.enable();
        this.BulkExpenditureForm.get('bankName')?.patchValue('');
        this.BulkExpenditureForm.get('transactionId')?.patchValue('');
        this.BulkExpenditureForm.get('ifscCode')?.patchValue('');
         this.BulkExpenditureForm.get('checkNo')?.patchValue('');
        this.BulkExpenditureForm.get('checkDate')?.patchValue('');
        this.BulkExpenditureForm.get('bankName')?.updateValueAndValidity();
        this.BulkExpenditureForm.get('transactionId')?.updateValueAndValidity();
        this.BulkExpenditureForm.get('ifscCode')?.updateValueAndValidity();
         this.BulkExpenditureForm.get('checkNo')?.updateValueAndValidity();
        this.BulkExpenditureForm.get('checkDate')?.updateValueAndValidity();
        this.BulkExpenditureForm.get('unitCost')?.setValidators([Validators.required, Validators.min(0)]);
        this.BulkExpenditureForm.get('unitCost')?.updateValueAndValidity();
      }
      else if(val=='UPI'){
        this.BulkExpenditureForm.get('bankName')?.setValidators(null);
        this.BulkExpenditureForm.get('transactionId')?.setValidators([Validators.required,Validators.pattern(/^[^\s].*/)]);
        this.BulkExpenditureForm.get('ifscCode')?.setValidators(null);
        this.BulkExpenditureForm.get('checkNo')?.setValidators(null);
        this.BulkExpenditureForm.get('checkDate')?.setValidators(null);
        this.BulkExpenditureForm.get('bankName')?.disable();
        this.BulkExpenditureForm.get('transactionId')?.enable();
        this.BulkExpenditureForm.get('ifscCode')?.disable();
        this.BulkExpenditureForm.get('bankName')?.patchValue('');
        this.BulkExpenditureForm.get('transactionId')?.patchValue('');
        this.BulkExpenditureForm.get('ifscCode')?.patchValue('');
         this.BulkExpenditureForm.get('checkNo')?.patchValue('');
        this.BulkExpenditureForm.get('checkDate')?.patchValue('');
        this.BulkExpenditureForm.get('bankName')?.updateValueAndValidity();
        this.BulkExpenditureForm.get('transactionId')?.updateValueAndValidity();
        this.BulkExpenditureForm.get('ifscCode')?.updateValueAndValidity();
         this.BulkExpenditureForm.get('checkNo')?.updateValueAndValidity();
        this.BulkExpenditureForm.get('checkDate')?.updateValueAndValidity();
        this.BulkExpenditureForm.get('unitCost')?.setValidators([Validators.required, Validators.min(0)]);
        this.BulkExpenditureForm.get('unitCost')?.updateValueAndValidity();
      }
       else if(val=='CHEQUE'){
        this.BulkExpenditureForm.get('bankName')?.setValidators(null);
        this.BulkExpenditureForm.get('transactionId')?.setValidators(null);
        this.BulkExpenditureForm.get('checkNo')?.setValidators([Validators.required,Validators.pattern(/^[0-9]\d*$/)]);
        this.BulkExpenditureForm.get('checkDate')?.setValidators([Validators.required]);
        this.BulkExpenditureForm.get('ifscCode')?.setValidators(null);
        this.BulkExpenditureForm.get('bankName')?.enable();
        this.BulkExpenditureForm.get('transactionId')?.enable();
        this.BulkExpenditureForm.get('ifscCode')?.enable();
        this.BulkExpenditureForm.get('bankName')?.patchValue('');
        this.BulkExpenditureForm.get('transactionId')?.patchValue('');
        this.BulkExpenditureForm.get('ifscCode')?.patchValue('');
        this.BulkExpenditureForm.get('checkNo')?.patchValue('');
        this.BulkExpenditureForm.get('checkDate')?.patchValue('');
        this.BulkExpenditureForm.get('bankName')?.updateValueAndValidity();
        this.BulkExpenditureForm.get('transactionId')?.updateValueAndValidity();
        this.BulkExpenditureForm.get('checkNo')?.updateValueAndValidity();
        this.BulkExpenditureForm.get('checkDate')?.updateValueAndValidity();
        this.BulkExpenditureForm.get('ifscCode')?.updateValueAndValidity();
        this.BulkExpenditureForm.get('unitCost')?.setValidators([Validators.required, Validators.min(0)]);
        this.BulkExpenditureForm.get('unitCost')?.updateValueAndValidity();
      }
    }
    closeModal(): void {
      const modal = bootstrap.Modal.getInstance(this.preEventModal.nativeElement);
      modal.hide();
  }
  validateFileExtension(file: File): boolean {
    const allowedExtensions = ['jpg', 'jpeg', 'png','pdf'];
    const fileExtension = file?.name?.split('.')?.pop()?.toLowerCase();
    return allowedExtensions.includes(fileExtension || '');
  }
  fileErrors:any=''
  uploadedFiles: any = [];
  onFileChange(event: any) {
    this.fileErrors='';  
    // const file = event.target.files[0];
    // let urlsList: any = [];
    // if (file) {
    //   this.sessionForm.patchValue({ uploaFiles: file });
    // }
    const input = event.target as HTMLInputElement;
    const maxSize = 1 * 1024 * 1024; // 1MB
    let urlsList: any = [];

    if (input.files) {
      const newFiles = Array.from(input.files);
      const fileSize = input.files[0].size;
      const validFiles = newFiles.filter(file => this.validateFileExtension(file));
      if (validFiles.length !== newFiles.length) {
        this.fileErrors = `Invalid file type selected. Only images, and pdf files are allowed.`;
        // this.toastrService.error('Invalid file type selected. Only images, and pdf files are allowed.', 'File Upload Error');
      }
      else if (fileSize > maxSize) {
        this.fileErrors = `File size exceeds the maximum limit of 1MB.`;
        return;
    }
      for (let i = 0; i < validFiles.length; i++) {
        const fileName = validFiles[i].name;
        const fakePath = `${fileName}`;
        urlsList.push(fakePath);
      }
      //this.sessionForm.patchValue({ uploaFiles: validFiles });
      //this.sessionForm.get('uploaFiles')?.setValue(validFiles);
      // Save valid files separately
      this.uploadedFiles = validFiles;
      // this.sessionForm.patchValue({ videoUrls: urlsList });
    }
  }
  //  const modalInstance = new bootstrap.Modal(document.getElementById('sessionFormExectuionModal'));
  //     modalInstance.show();
    // save Bulk expenditure
    BulkExpenditureSubmit(){
       this.BulkExpenditureForm.value.checkDate=this.BulkExpenditureForm.value.checkDate?moment(this.BulkExpenditureForm.value.checkDate).format('DD-MM-YYYY'):null;
      let payload={...this.BulkExpenditureForm.value,purchaseDate:moment(this.BulkExpenditureForm.value.purchaseDate).format('DD-MM-YYYY'), billDate:moment(this.BulkExpenditureForm.value.billDate).format('DD-MM-YYYY'),agencyId:this.agencyId}
      payload['uploadBillUrl']=null;
      const formData = new FormData();
      formData.append("request", JSON.stringify(payload));

      if (this.BulkExpenditureForm.value.uploadBillUrl) {
        formData.append("files", this.uploadedFiles[0]);
        }
      // formData.append("files", this.BulkExpenditureForm.value.uploadBillUrl);
      console.log(formData,this.BulkExpenditureForm.value.uploadBillUrl)
      console.log(payload)
      if(this.isEdit){
        this._commonService
          .add(APIS.programExpenditure.updatebulkExpenditure+this.Expenditureid, formData).subscribe({
            next: (data: any) => {
             this.closeModal()
             this.uploadedFiles=[]
              if(data?.status==400){

                this.toastrService.error(data?.message, "Bulk Expenditure Data Error!");
              }
              else{
                this.BulkExpenditureForm.reset()
                this.getBulkExpenditure()
                // this.advanceSearch(this.getSelDataRange);
            
              // this.formDetails()
              // modal.close()
              this.toastrService.success('Bulk Expenditure Added Successfully', "Bulk Expenditure Data Success!");
              }
              
            },
            error: (error:any) => {
              console.log(error)
              this.toastrService.error('Same Item Name and Head of Expense already exists for your agency. Please change Item Name!',"Bulk Expenditure Data Error!");
              new Error(error);
            },
          });
      }
      else{
        this._commonService
          .add(APIS.programExpenditure.savebulkExpenditure, formData).subscribe({
            next: (data: any) => {
             this.closeModal()
             this.uploadedFiles=[]
              if(data?.status==400){

                this.toastrService.error(data?.message, "Bulk Expenditure Data Error!");
              }
              else{
                this.BulkExpenditureForm.reset()
                this.getBulkExpenditure()
                // this.advanceSearch(this.getSelDataRange);
            
              // this.formDetails()
              // modal.close()
              this.toastrService.success('Bulk Expenditure Added Successfully', "Bulk Expenditure Data Success!");
              }
              
            },
            error: (error:any) => {
              console.log(error)
              this.toastrService.error('Same Item Name and Head of Expense already exists for your agency. Please change Item Name!',"Bulk Expenditure Data Error!");
              new Error(error);
            },
          });
      }
    }
    getBulkExpenditureData:any=[]
    BulkTotalUnitCost:any=0
    BulkTotalCost:any=0
    getBulkExpenditure(){
      this.getBulkExpenditureData=[]
      this.BulkTotalUnitCost=0
      this.BulkTotalCost=0
      this.uploadedFiles=[]
      this.BulkExpenditureForm.reset()
      this._commonService
          .getDataByUrl(APIS.programExpenditure.getBulkExpenditureByAgency+this.agencyId).subscribe({
            next: (data: any) => {
              if(data?.data){
                this.getBulkExpenditureData=data?.data
                this.reinitializeDataTableBulk();
                this.getBulkExpenditureData?.map((item:any)=>{
                  this.BulkTotalUnitCost+=item?.unitCost
                  this.BulkTotalCost+=item?.totalCost
                })
              }
             
              
            },
            error: (err) => {
              
              this.toastrService.error(err.message, "Bulk Expenditure Data Error!");
              new Error(err);
            },
          });
    }
    dataTable: any;
      reinitializeDataTable() {
        if (this.dataTable) {
          this.dataTable.destroy();
        }
        setTimeout(() => {
          this.initializeDataTable();
        }, 0);
      }
    
      initializeDataTable() {
        this.dataTable = new DataTable('#expenditure-table', {
          // scrollX: true,
          // scrollCollapse: true,    
          // responsive: true,    
          // paging: true,
          // searching: true,
          // ordering: true,
          scrollY: "415px",
          scrollX: true,
          scrollCollapse: true,
          autoWidth: true,
          paging: false,
          info: false,
          searching: false,
          destroy: true, // Ensure reinitialization doesn't cause issues
        });
      }
      dataTableBulk: any;
      reinitializeDataTableBulk() {
        if (this.dataTable) {
          this.dataTable.destroy();
        }
        setTimeout(() => {
          this.initializeDataTableBulk();
        }, 0);
      }
    
      initializeDataTableBulk() {
        this.dataTable = new DataTable('#expenditure-table-bulk', {
          // scrollX: true,
          // scrollCollapse: true,    
          // responsive: true,    
          // paging: true,
          // searching: true,
          // ordering: true,
          scrollY: "415px",
          scrollX: true,
          scrollCollapse: true,
          autoWidth: true,
          paging: true,
          info: false,
          searching: false,
          destroy: true, // Ensure reinitialization doesn't cause issues
        });
      }
      imageUrlDownloadPath = `${API_BASE_URL}/program/file/download/`;
imagePreviewUrl: any
    showImagePreview(url: any, value: string) {
    this.imagePreviewUrl = null; // Reset the image preview URL
    this.imagePreviewUrl = url + value;

    const editSessionModal = document.getElementById('imagePreview');
    if (editSessionModal) {
      const modalInstance = new bootstrap.Modal(editSessionModal);
      modalInstance.show();
    }
  }
//date converter
convertToISOFormat(date: string): string {   
  if(date) {
    const [day, month, year] = date.split('-');
    return `${year}-${month}-${day}`; // Convert to yyyy-MM-dd format
  }
  else{
    return '';
  }
 
}
getExpenseIdByName(expenseName: string): number | undefined {
  const expense = this.ExpenditureData.find((item:any) => item.expenseName === expenseName);
  return expense?.expenseId;
}
      // open mode
      isEdit:any=false
  Expenditureid:any=''
  selectedTxnItem: any = null;
  openTransactionsModal(item: any): void {
    this.selectedTxnItem = item;
    const el = document.getElementById('transactionsModal');
    if (!el) return;
    const modal = new bootstrap.Modal(el);
    modal.show();
  }
  OpenModal(type:any,item?:any):any{
    this.fileErrors='';  
    const modal1 = new bootstrap.Modal(document.getElementById('bulkModal'));
    this.Expenditureid=''
   if(type=='add'){
    this.BulkExpenditureForm.reset()
    this.isEdit=false
    modal1.show();
   
   }
   else{
    this.Expenditureid=item?.bulkExpenditureId
    this.isEdit=true
    this.BulkExpenditureForm.reset()
    console.log(item)
     item['uploadBillUrl']=''
    this.BulkExpenditureForm.patchValue({...item,headOfExpenseId:this.getExpenseIdByName(item?.headOfExpense),billDate:this.convertToISOFormat(item?.billDate),checkDate:this.convertToISOFormat(item?.checkDate),purchaseDate:this.convertToISOFormat(item?.purchaseDate)})
    
    modal1.show();
   }
    
  }
      // delete Expenditure
      deleteprogramExpenditureId:any ={}
    deleteExpenditure(item: any) {
    this.deleteprogramExpenditureId = item
    const previewModal = document.getElementById('exampleModalDelete');
    if (previewModal) {
      const modalInstance = new bootstrap.Modal(previewModal);
      modalInstance.show();
    }
  }
    ConfirmdeleteExpenditure(item:any){
      this._commonService
      .add(APIS.programExpenditure.deleteBulkExpenditure+item?.bulkExpenditureId, {}).subscribe({
        next: (data: any) => {
          if(data?.status==400){
            this.toastrService.error(data?.message, "Bulk Expenditure Data Error!");
            this.closeModalDelete();
            this.deleteprogramExpenditureId ={}
          }
          else{
            this.BulkExpenditureForm.reset()
            this.getBulkExpenditure()
            this.closeModalDelete();
            this.deleteprogramExpenditureId ={}
          this.toastrService.success( 'Bulk Expenditure Deleted Successfully', "Bulk Expenditure Data Success!");
          }
          
        },
        error: (err) => {
          this.closeModalDelete();
          this.deleteprogramExpenditureId ={}
          this.toastrService.error(err.message, "Bulk Expenditure Data Error!");
          new Error(err);
        },
      });

    }
    closeModalDelete(): void {
      const editSessionModal = document.getElementById('exampleModalDelete');
      if (editSessionModal) {
        const modalInstance = bootstrap.Modal.getInstance(editSessionModal);
        modalInstance.hide();
      }
    } 
  }
