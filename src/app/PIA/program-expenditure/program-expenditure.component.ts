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
declare var window: any;
@Component({
  selector: 'app-program-expenditure',
  templateUrl: './program-expenditure.component.html',
  styleUrls: ['./program-expenditure.component.css']
})
export class ProgramExpenditureComponent implements OnInit {
  formModel:any
  agencyId: any
  expenditureType:any='PRE'
  Role :any='';
  constructor(
    private _commonService: CommonServiceService,
    private toastrService: ToastrService,
  ) {
    
	    this.Role=JSON.parse(sessionStorage.getItem('user') || '{}').userRole;
    this.agencyId = JSON.parse(sessionStorage.getItem('user') || '{}').agencyId;
    // this.formModel = new window.bootstrap.Modal(document.getElementById("addPreEventModal"));
  }

  ngOnInit(): void {
    this.getHeadOfExpenditure()
    this.getAllActivityList()
    this.getProgramTypeData();
    this.onAgencyChange()
    this.formDetails()
    this.formDetailsPre()
    this.formDetailsBulk()
    
   
    this.programCreationMain.controls['activityId'].valueChanges.subscribe((activityId: any) => {
      if (activityId) this.getSubActivitiesList(activityId);
    });

    this.programCreationMain.controls['expenditureType'].valueChanges.subscribe((val: any) => {
      if (val) this.ChangeexpenditureType(true, val);
    });
  }

  get f2() {
    return this.programCreationMain.controls;
  }
  get fPre() {
    return this.PrePostExpenditureForm.controls;
  }
  get fBulk() {
    return this.BulkExpenditureForm.controls;
  }
  @ViewChild('addPreEventModal') PreEventModal!: ElementRef;
  @ViewChild('BulkEvenModal') BulkEvenModal!: ElementRef;
  activityList: any
  subActivitiesList: any
  programCreationMain!: FormGroup;
  
  BulkExpenditureForm!: FormGroup;
  PrePostExpenditureForm!: FormGroup;
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
  programData:any={}
  getProgramDetailsById(ProgrmId:any){
    this.programData=[]
    if(this.expenditureType=='Bulk'){
      this.TotalAmount=0
      // this.getBulkExpenditure()
      this.getExpenditure()
    }
    else{
      this.TotalAmount=0
      this.getExpenditure()
      // this.getBulkExpenditure()
    }
    
    
    if(ProgrmId){
      this._commonService.getById(APIS.programCreation.getSingleProgramsList, ProgrmId)?.subscribe({
        next: (data: any) => {
         if(data?.data){
           this.programData = data?.data;
          //  this.getSubActivitiesList(this.programData.activityId)
           this.programCreationMain.get('activityId')?.setValue(Number(this.programData?.activityId))
           this.programCreationMain.get('subActivityId')?.setValue(Number(this.programData?.subActivityId))
           
         
         }
         
          
        },
        error: (err: any) => {
          this.toastrService.error(err.message, "Error fetching program details!");
        }
      });
    }
   
  }

  getAllActivityList() {
    this.subActivitiesList = []
    this._commonService.getById(APIS.programCreation.getActivityListbyId, this.agencyId).subscribe({
      next: (data: any) => {
        this.activityList = data.data;
      },
      error: (err: any) => {
        this.activityList = [];
      }
    })
  }

  getSubActivitiesList(activityId: any) {
    this._commonService.getDataByUrl(`${APIS.programCreation.getSubActivityListByActivity + '/' + activityId}`).subscribe({
      next: (data: any) => {
        this.subActivitiesList = data.data.subActivities;
        if(this.programData?.subActivityId){
          this.programCreationMain.get('subActivityId')?.setValue(Number(this.programData?.subActivityId))
        }
      },
      error: (err: any) => {
        this.subActivitiesList = [];
      }
    })
  }
 // Load Programs
 programs:any
 programsFiltered:any
 onAgencyChange(): void {
  this.programs = [];
  this.programsFiltered = [];
  if (this.agencyId) {
    this._commonService.getDataByUrl(`${APIS.programCreation.getProgramsListByAgencyStatus}/${this.agencyId}?status=Collage Added`).subscribe({
      next: (data: any) => {
        this.programs = data.data;
        this.programsFiltered = data.data;
      },
      error: (err) => {
        console.error('Error loading programs:', err);
      }
    });
  }
}
  formDetails() {
    this.programCreationMain = new FormGroup({
      activityId: new FormControl("", [Validators.required]),
      subActivityId: new FormControl("", [Validators.required]),
      programId: new FormControl("", [Validators.required]),
      expenditureType: new FormControl("PRE", [Validators.required]),
    })
  }
  
  formDetailsPre() {
    // {

    //   "activityId": 1,
    //   "subActivityId": 2,
    //   "programId": 1,
    //   "agencyId": 1,
    //   "expenditureType": "POST",
    //   "headOfExpenseId": 3,
    //   "cost": 15000.75,
    //   "billNo": 12345,
    //   "billDate": "2025-04-15",
    //   "payeeName": "ABC Constructions",
    //   "bankName": "State Bank of India",
    //   "ifscCode": "SBIN0001234",
    //   "modeOfPayment": "BANK_TRANSFER",
    //   "purpose": "Infrastructure Development",
    //   "uploadBillUrl": "https://example.com/uploads/bill12345.pdf"
    // }
    this.PrePostExpenditureForm = new FormGroup({
      headOfExpenseId: new FormControl("", [Validators.required]),
      billNo: new FormControl("", [Validators.required,Validators.pattern(/^[^\s].*/)]),
      cost: new FormControl("", [Validators.required,Validators.pattern(/^(0*[1-9]\d*(\.\d+)?|0+\.\d*[1-9]\d*)$/)]),
      billDate: new FormControl("", [Validators.required]),
      payeeName: new FormControl("", [Validators.required]),
      bankName: new FormControl("", ),
      transactionId: new FormControl("", [Validators.pattern(/^[^\s].*/)]),
      ifscCode: new FormControl("", [Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]),
      modeOfPayment: new FormControl("", [Validators.required]),
      purpose: new FormControl("", ),
      checkDate:new FormControl("", [Validators.required]),
      checkNo:new FormControl("", [Validators.pattern(/^[0-9]\d*$/)]),
      uploadBillUrl: new FormControl("", ),
    })
  }
  // Mode of payment
  modeOfPayment(val:any){
    if(val=='CASH'){
      this.PrePostExpenditureForm.get('bankName')?.setValidators(null);
      this.PrePostExpenditureForm.get('transactionId')?.setValidators(null);
      this.PrePostExpenditureForm.get('ifscCode')?.setValidators(null);
      this.PrePostExpenditureForm.get('bankName')?.patchValue('');
      this.PrePostExpenditureForm.get('checkNo')?.setValidators(null);
      this.PrePostExpenditureForm.get('checkDate')?.setValidators(null);
      this.PrePostExpenditureForm.get('transactionId')?.patchValue('');
      this.PrePostExpenditureForm.get('ifscCode')?.patchValue('');
      this.PrePostExpenditureForm.get('bankName')?.clearValidators();
      this.PrePostExpenditureForm.get('transactionId')?.clearValidators();
      this.PrePostExpenditureForm.get('ifscCode')?.clearValidators();
      this.PrePostExpenditureForm.get('bankName')?.disable();
      this.PrePostExpenditureForm.get('transactionId')?.disable();
      this.PrePostExpenditureForm.get('ifscCode')?.disable();
      this.PrePostExpenditureForm.get('checkNo')?.patchValue('');
      this.PrePostExpenditureForm.get('checkDate')?.patchValue('');
      this.PrePostExpenditureForm.get('bankName')?.updateValueAndValidity();
      this.PrePostExpenditureForm.get('transactionId')?.updateValueAndValidity();
      this.PrePostExpenditureForm.get('ifscCode')?.updateValueAndValidity();
       this.PrePostExpenditureForm.get('checkNo')?.updateValueAndValidity();
      this.PrePostExpenditureForm.get('checkDate')?.updateValueAndValidity();
      this.PrePostExpenditureForm.get('cost')?.setValidators([Validators.required, Validators.min(0), Validators.max(5000)]);
      this.PrePostExpenditureForm.get('cost')?.updateValueAndValidity();

    }
    else if(val=='BANK_TRANSFER'){
      this.PrePostExpenditureForm.get('bankName')?.setValidators([Validators.required]);
      this.PrePostExpenditureForm.get('transactionId')?.setValidators(null);
      this.PrePostExpenditureForm.get('ifscCode')?.setValidators([Validators.required,Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]);
      this.PrePostExpenditureForm.get('checkNo')?.setValidators(null);
        this.PrePostExpenditureForm.get('checkDate')?.setValidators(null);
      this.PrePostExpenditureForm.get('bankName')?.enable();
      this.PrePostExpenditureForm.get('transactionId')?.disable();
      this.PrePostExpenditureForm.get('ifscCode')?.enable();
      this.PrePostExpenditureForm.get('bankName')?.patchValue('');
      this.PrePostExpenditureForm.get('transactionId')?.patchValue('');
      this.PrePostExpenditureForm.get('ifscCode')?.patchValue('');
      this.PrePostExpenditureForm.get('checkNo')?.patchValue('');
      this.PrePostExpenditureForm.get('checkDate')?.patchValue('');
      this.PrePostExpenditureForm.get('bankName')?.updateValueAndValidity();
      this.PrePostExpenditureForm.get('transactionId')?.updateValueAndValidity();
      this.PrePostExpenditureForm.get('ifscCode')?.updateValueAndValidity();
       this.PrePostExpenditureForm.get('checkNo')?.updateValueAndValidity();
      this.PrePostExpenditureForm.get('checkDate')?.updateValueAndValidity();
      this.PrePostExpenditureForm.get('cost')?.setValidators([Validators.required, Validators.min(0)]);
      this.PrePostExpenditureForm.get('cost')?.updateValueAndValidity();
    }
    else if(val=='UPI'){
      this.PrePostExpenditureForm.get('bankName')?.setValidators(null);
      this.PrePostExpenditureForm.get('transactionId')?.setValidators([Validators.required]);
      this.PrePostExpenditureForm.get('ifscCode')?.setValidators(null);
      this.PrePostExpenditureForm.get('checkNo')?.setValidators(null);
        this.PrePostExpenditureForm.get('checkDate')?.setValidators(null);
      this.PrePostExpenditureForm.get('bankName')?.disable();
      this.PrePostExpenditureForm.get('transactionId')?.enable();
      this.PrePostExpenditureForm.get('ifscCode')?.disable();
      this.PrePostExpenditureForm.get('bankName')?.patchValue('');
      this.PrePostExpenditureForm.get('transactionId')?.patchValue('');
      this.PrePostExpenditureForm.get('ifscCode')?.patchValue('');
      this.PrePostExpenditureForm.get('checkNo')?.patchValue('');
      this.PrePostExpenditureForm.get('checkDate')?.patchValue('');
      this.PrePostExpenditureForm.get('bankName')?.updateValueAndValidity();
      this.PrePostExpenditureForm.get('transactionId')?.updateValueAndValidity();
      this.PrePostExpenditureForm.get('ifscCode')?.updateValueAndValidity();
       this.PrePostExpenditureForm.get('checkNo')?.updateValueAndValidity();
      this.PrePostExpenditureForm.get('checkDate')?.updateValueAndValidity();
      this.PrePostExpenditureForm.get('cost')?.setValidators([Validators.required, Validators.min(0)]);
      this.PrePostExpenditureForm.get('cost')?.updateValueAndValidity();
    }
      else if(val=='CHEQUE'){
      this.PrePostExpenditureForm.get('bankName')?.setValidators(null);
      this.PrePostExpenditureForm.get('transactionId')?.setValidators(null);
      this.PrePostExpenditureForm.get('ifscCode')?.setValidators(null);
        this.PrePostExpenditureForm.get('checkNo')?.setValidators([Validators.required,Validators.pattern(/^[0-9]\d*$/)]);
        this.PrePostExpenditureForm.get('checkDate')?.setValidators([Validators.required]);
      this.PrePostExpenditureForm.get('bankName')?.enable();
      this.PrePostExpenditureForm.get('transactionId')?.enable();
      this.PrePostExpenditureForm.get('ifscCode')?.enable();
      this.PrePostExpenditureForm.get('bankName')?.patchValue('');
      this.PrePostExpenditureForm.get('transactionId')?.patchValue('');
      this.PrePostExpenditureForm.get('ifscCode')?.patchValue('');
       this.PrePostExpenditureForm.get('checkNo')?.patchValue('');
      this.PrePostExpenditureForm.get('checkDate')?.patchValue('');
      this.PrePostExpenditureForm.get('bankName')?.updateValueAndValidity();
      this.PrePostExpenditureForm.get('transactionId')?.updateValueAndValidity();
      this.PrePostExpenditureForm.get('ifscCode')?.updateValueAndValidity();
      this.PrePostExpenditureForm.get('checkNo')?.updateValueAndValidity();
      this.PrePostExpenditureForm.get('checkDate')?.updateValueAndValidity();
      this.PrePostExpenditureForm.get('cost')?.setValidators([Validators.required, Validators.min(0)]);
      this.PrePostExpenditureForm.get('cost')?.updateValueAndValidity();
    }
  }
  formDetailsBulk() {
    this.BulkExpenditureForm = new FormGroup({
      itemName: new FormControl("", [Validators.required]),
      purchaseDate: new FormControl("",),
      purchasedQuantity: new FormControl("",),
      headOfExpenseId: new FormControl("",[Validators.required]),
      unitCost: new FormControl("",[Validators.pattern(/^(0*[1-9]\d*(\.\d+)?|0+\.\d*[1-9]\d*)$/)]),
      bulkExpenditureId: new FormControl("",),
      availableQuantity: new FormControl("", ),
      consumedQuantityFromBulk: new FormControl("", ),
      consumedQuantity: new FormControl("", [Validators.required,Validators.pattern(/^[1-9]\d*$/)]),
      allocatedCost: new FormControl("", ),
    })
  }
  ChangeexpenditureType(event:any,val:any){
    this.expenditureType=val
    if(val=='Bulk'){
      this.TotalAmount=0
      // this.getBulkExpenditure()
      this.getExpenditure()
    }
    else{
      this.TotalAmount=0
      // this.getBulkExpenditure()
      this.getExpenditure()
    }
  }
  getProgramType: any = [];
  getProgramTypeData() {
    this._commonService.getById(APIS.programCreation.getProgramType, this.agencyId)
      .subscribe({
        next: (data: any) => {
          this.getProgramType = data.data;
        },
        error: (err: any) => {
          new Error(err);
        },
      });
  }
  GetItemsData:any
  getHeadOfExpenseId(val:any){
    this.GetItemsData=[]
    if(val){
      this._commonService.getDataByUrl(APIS.programExpenditure.getItemByExpenses+'='+val+'&agencyId='+this.agencyId,)?.subscribe({
        next: (data: any) => {
         if(data){
           this.GetItemsData = data;
         }
        },
        error: (err: any) => {
          this.toastrService.error(err.message, "Error fetching program details!");
        }
      });
    }
  }
  getBulkByItem:any
  getBulkDataByItem(val:any,expenseId:any){
    this.getBulkByItem=[]
    if(val && expenseId){
      this._commonService.add(APIS.programExpenditure.getBulkDataByExpensesItem,{"expenseId": expenseId,"itemName": val})?.subscribe({
        next: (data: any) => {
         if(data){
           this.getBulkByItem = data;
           this.BulkExpenditureForm.patchValue({"purchasedQuantity": this.getBulkByItem?.purchasedQuantity,"unitCost": this.getBulkByItem?.unitCost,"purchaseDate":this.convertToISOFormat(this.getBulkByItem?.purchaseDate),"consumedQuantityFromBulk": this.getBulkByItem?.consumedQuantity,"bulkExpenditureId": this.getBulkByItem?.bulkExpenditureId,"availableQuantity": this.getBulkByItem?.availableQuantity})
           // unit cost just changed with the item - the old allocated cost is stale
           this.calcCostAllocated(this.fBulk['consumedQuantity'].value)
         }
        },
        error: (err: any) => {
          this.toastrService.error(err.message, "Error fetching program details!");
        }
      });
    }
  }
  calcCostAllocated(Val:any){
    const qty = Number(Val);
    const unitCost = Number(this.fBulk['unitCost'].value);
    if (!qty || !unitCost || isNaN(qty) || isNaN(unitCost)) {
      this.fBulk['allocatedCost'].setValue('');
      return;
    }
    // round to paise, the raw product carries float noise (e.g. 338.4912959 * 3)
    this.fBulk['allocatedCost'].setValue(Number((qty * unitCost).toFixed(2)));
  }
  
  isEdit:any=false
  Expenditureid:any=''
  editUploadUrl:any
  OpenModal(type:any,item?:any):any{
    this.Expenditureid=''
    this.fileErrors='';  
    this.editUploadUrl=''
   if(type=='add'){
    this.isEdit=false
    if(this.programCreationMain.value.activityId && this.programCreationMain.value.subActivityId && this.programCreationMain.value.programId){
      this.PrePostExpenditureForm.reset()
      if(this.expenditureType=='Bulk'){
        const modal = new bootstrap.Modal(this.BulkEvenModal.nativeElement);
        modal.show();
        
      }
      else{
        const modal1 = new bootstrap.Modal(this.PreEventModal.nativeElement);
        modal1.show();
      }
      
        // this.formModel = new window.bootstrap.Modal(document.getElementById("addInventory")    );
      // return true;;
    }
    else{
      this.toastrService.warning('Please select Program then only you have to Add '+this.expenditureType+' Expenditure')
      // return false;
     
    }
   }
   else{
    if(item?.expenditureType=='PRE' || item?.expenditureType=='POST'){
      this.editUploadUrl=item?.uploadBillUrl;
      this.Expenditureid=item?.programExpenditureId
      this.isEdit=true
      console.log(item)
      this.PrePostExpenditureForm.reset()
      item['uploadBillUrl']=''
      this.modeOfPayment(item?.modeOfPayment)
      this.PrePostExpenditureForm.patchValue({...item,headOfExpenseId:this.getExpenseIdByName(item?.headOfExpense),billDate:this.convertToISOFormat(item?.billDate),checkDate:this.convertToISOFormat(item?.checkDate)})
      // this.PrePostExpenditureForm.get('uploadBillUrl')?.setValue(item?.uploadBillUrl)
      item['uploadBillUrl']=this.editUploadUrl
      console.log(item)
      
      
     this.expenditureType=item?.expenditureType
      const modal1 = new bootstrap.Modal(this.PreEventModal.nativeElement);
      modal1.show();
    }
    else{
       this.editUploadUrl=item?.uploadBillUrl;
      this.Expenditureid=item?.bulkExpenditureTransactionId
      this.isEdit=true
      console.log(item)
     
      this.BulkExpenditureForm.reset()
      this.BulkExpenditureForm.patchValue({...item,headOfExpenseId:this.getExpenseIdByName(item?.headOfExpense),billDate:this.convertToISOFormat(item?.billDate),checkDate:this.convertToISOFormat(item?.checkDate)})
      this.getHeadOfExpenseId(this.getExpenseIdByName(item?.headOfExpense))
      console.log(item?.itemName,this.getExpenseIdByName(item?.headOfExpense))
      this.getBulkDataByItem(item?.itemName,this.getExpenseIdByName(item?.headOfExpense))
      // this.PrePostExpenditureForm.get('uploadBillUrl')?.setValue(item?.uploadBillUrl)
      
      console.log(item)
      
      
     
      const modal1 = new bootstrap.Modal(this.BulkEvenModal.nativeElement);
      modal1.show();
    }
    
   
   }
    
  }

  //date converter
  convertToISOFormat(date: string): string {    
    if(date){
      const [day, month, year] = date.split('-');
      return `${year}-${month}-${day}`; // Convert to yyyy-MM-dd format
    }
    else{
      return ''
    }
  
  }
  getExpenseIdByName(expenseName: string): number | undefined {
    const expense = this.ExpenditureData.find((item:any) => item.expenseName === expenseName);
    return expense?.expenseId;
  }
  validateFileExtension(file: File): boolean {

    const allowedExtensions = [ 'jpg','png','pdf','jpeg'];
    const fileExtension = file?.name?.split('.')?.pop()?.toLowerCase();
    console.log(fileExtension)
    return allowedExtensions.includes(fileExtension || '');
  }
  fileErrors:any=''
  uploadedFiles: any = [];
  onFileChange(event: any) {
    this.fileErrors=''
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
      // if (validFiles.length !== newFiles.length) {
      //   this.toastrService.error('Invalid file type selected. Only pdf and images files are allowed.', 'File Upload Error');
      // }
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
  //save pre and post expenditure 
  ExpenditureSubmit(){
   this.PrePostExpenditureForm.value.checkDate=this.PrePostExpenditureForm.value.checkDate?moment(this.PrePostExpenditureForm.value.checkDate).format('DD-MM-YYYY'):null;
    let payload={...this.programCreationMain.value ,activityId:Number(this.programCreationMain.value.activityId),
      subActivityId:Number(this.programCreationMain.value.subActivityId),programId:Number(this.programCreationMain.value.programId),...this.PrePostExpenditureForm.value,
      headOfExpenseId:Number(this.PrePostExpenditureForm.value.headOfExpenseId),
      billDate:moment(this.PrePostExpenditureForm.value.billDate).format('DD-MM-YYYY'),
      agencyId:this.agencyId,uploadBillUrl:this.editUploadUrl?this.editUploadUrl:null}
      // payload['uploadBillUrl']=null
    console.log(payload)
    const formData = new FormData();
     
       formData.append("request", JSON.stringify(payload));
      if (this.PrePostExpenditureForm.value.uploadBillUrl) {
        formData.append("files", this.uploadedFiles[0]);
        }
        if(this.isEdit){
          this._commonService
          .add(APIS.programExpenditure.UpdateExpenditure+this.Expenditureid, formData).subscribe({
            next: (data: any) => {
              
              if(data?.status==400){
                this.toastrService.error(data?.message, this.expenditureType +" Expenditure Data Error!");
              }
              else{
                this.uploadedFiles=[]
                this.PrePostExpenditureForm.reset();
                this.TotalAmount=0
                this.getExpenditure()
                // this.getBulkExpenditure()
                
               
              this.toastrService.success( this.expenditureType +' Expenditure Updated Successfully', this.expenditureType +" Expenditure Data Success!");
              }
              
            },
            error: (err) => {
              
              this.toastrService.error(err.message, this.expenditureType +" Expenditure Data Error!");
              new Error(err);
            },
          });
        }
        else{
          this._commonService
          .add(APIS.programExpenditure.saveExpenditure, formData).subscribe({
            next: (data: any) => {
              
              if(data?.status==400){
                this.toastrService.error(data?.message, this.expenditureType +" Expenditure Data Error!");
              }
              else{
                this.uploadedFiles=[]
                this.PrePostExpenditureForm.reset();
                this.TotalAmount=0
                this.getExpenditure()
                // this.getBulkExpenditure()
                
               
              this.toastrService.success( this.expenditureType +' Expenditure Added Successfully', this.expenditureType +" Expenditure Data Success!");
              }
              
            },
            error: (err) => {
              
              this.toastrService.error(err.message, this.expenditureType +" Expenditure Data Error!");
              new Error(err);
            },
          });
        }
   
  }
  getExpenditureData:any=[]
  getExpenditureDataBoth:any=[]
  TotalAmount:any=0
  getExpenditure(){
    this.uploadedFiles=[]
    this.getExpenditureData=[]
    this.getExpenditureDataBoth=[]
    if(this.f2['programId'].value){ 
      this._commonService
        .getDataByUrl(APIS.programExpenditure.getExpenditure+'?programId='+this.f2['programId'].value+'&expenditureType='+'PRE&agencyId='+this.agencyId).subscribe({
          next: (data: any) => {
           if(data?.data){
            this.getExpenditureData=data?.data
            this.getExpenditureDataBoth=[...this.getExpenditureDataBoth,...data?.data]
            // this.getExpenditure()
            this.getPost()
            this.reinitializeDataTable();
            this.getExpenditureData?.map((item:any)=>{
              this.TotalAmount+=item?.cost
            })
           }
           else{
            this.getPost()
           }
            
          },
          error: (err) => {
            this.getPost()
            this.toastrService.error(err.message, this.expenditureType +" Expenditure Data Error!");
            new Error(err);
          },
        });
        
    }
    
  }
  getPost(){
    this._commonService
        .getDataByUrl(APIS.programExpenditure.getExpenditure+'?programId='+this.f2['programId'].value+'&expenditureType='+'POST'+'&agencyId='+this.agencyId).subscribe({
          next: (data: any) => {
           if(data?.data){
            this.getExpenditureData=data?.data
            this.getExpenditureDataBoth=[...this.getExpenditureDataBoth,...data?.data]
            this.getBulkExpenditure()
            this.reinitializeDataTable();
            this.getExpenditureData?.map((item:any)=>{
              this.TotalAmount+=item?.cost
            })
           }
           else{
            this.getBulkExpenditure()
           }
            
          },
          error: (err) => {
            this.getBulkExpenditure()
            this.toastrService.error(err.message, this.expenditureType +" Expenditure Data Error!");
            new Error(err);
          },
        });
  }
  // save Bulk expenditure
  BulkExpenditureSubmit(){
    let payload1:any={
      "activityId": Number(this.programCreationMain.value?.activityId),
      "subActivityId": Number(this.programCreationMain.value?.subActivityId),
      "programId": Number(this.programCreationMain.value?.programId),
      "agencyId": Number(this.agencyId),
      // "expenditureType": "PRE",
      "headOfExpenseId": this.BulkExpenditureForm.value?.headOfExpenseId,
      "bulkExpenditureId": this.BulkExpenditureForm.value?.bulkExpenditureId,
      "consumedQuantity": this.BulkExpenditureForm.value?.consumedQuantity,
      "allocatedCost":this.BulkExpenditureForm.value?.allocatedCost
  }
    // let payload={...this.BulkExpenditureForm.value,agencyId:this.agencyId}
    // console.log(payload)
   
        if(this.isEdit){
          this._commonService
          .add(APIS.programExpenditure.UpdatebulkByItemTranstion+this.Expenditureid, payload1).subscribe({
            next: (data: any) => {
              if(data?.status==400){
                this.toastrService.error(data?.message, this.expenditureType +" Expenditure Data Error!");
              }
              else{
                this.BulkExpenditureForm.reset()
                this.TotalAmount=0
                this.getExpenditure()
                // this.advanceSearch(this.getSelDataRange);
            
              // this.formDetails()
              // modal.close()
              this.toastrService.success( this.expenditureType +' Expenditure Added Successfully', this.expenditureType +" Expenditure Data Success!");
              }
              
            },
            error: (err) => {
              
              this.toastrService.error(err.message, this.expenditureType +" Expenditure Data Error!");
              new Error(err);
              this.getExpenditure()
            },
          });
        }
        else{
          this._commonService
          .add(APIS.programExpenditure.savebulkByItemExpenditure, payload1).subscribe({
            next: (data: any) => {
              if(data?.status==400){
                this.toastrService.error(data?.message, this.expenditureType +" Expenditure Data Error!");
              }
              else{
                this.BulkExpenditureForm.reset()
                this.TotalAmount=0
                this.getExpenditure()
                // this.advanceSearch(this.getSelDataRange);
            
              // this.formDetails()
              // modal.close()
              this.toastrService.success( this.expenditureType +' Expenditure Added Successfully', this.expenditureType +" Expenditure Data Success!");
              }
              
            },
            error: (err) => {
              
              this.toastrService.error(err.message, this.expenditureType +" Expenditure Data Error!");
              new Error(err);
              this.getExpenditure()
            },
          });
        }
  }
  getBulkExpenditureData:any=[]
  BulkTotalUnitCost:any=0
  BulkTotalCost:any=0
  getBulkExpenditure(){
    console.log(this.f2['programId'].value,'bulk')
    this.getBulkExpenditureData=[]
    this.BulkTotalUnitCost=0
    this.BulkTotalCost=0
    this.BulkExpenditureForm.reset()
    if(this.f2['programId'].value){
      this._commonService
      .getDataByUrl(APIS.programExpenditure.getBulkExpenditureByProgramId+'?programId='+this.f2['programId'].value).subscribe({
        next: (data: any) => {
          if(data?.data){
            this.getExpenditureDataBoth=[...this.getExpenditureDataBoth,...data?.data]
             console.log( this.getExpenditureData,data?.data,this.getExpenditureDataBoth)
            this.getBulkExpenditureData=data?.data
            this.reinitializeDataTableBulk();
            this.reinitializeDataTable();
            this.getBulkExpenditureData?.map((item:any)=>{
              this.BulkTotalUnitCost+=item?.unitCost
              this.TotalAmount+=item?.allocatedCost
            })
          }
         
          console.log(this.TotalAmount)
        },
        error: (err) => {
          
          this.toastrService.error(err.message, this.expenditureType +" Expenditure Data Error!");
          new Error(err);
        },
      });
    }
   
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
        paging: false,
        info: false,
        searching: false,
        destroy: true, // Ensure reinitialization doesn't cause issues
      });
    }
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
      console.log(item,'ConfirmdeleteExpenditure')
      let id=item?.programExpenditureId?item?.programExpenditureId:item.bulkExpenditureTransactionId
      let URL=item?.programExpenditureId?APIS.programExpenditure.deleteExpenditure:APIS.programExpenditure.deleteTransation
      console.log(id)
      this._commonService
      .add(URL+id, {}).subscribe({
        next: (data: any) => {
          if(data?.status==400){
            this.toastrService.error(data?.message, item.expenditureType +" Expenditure Data Error!");
            this.closeModalDelete();
            this.deleteprogramExpenditureId ={}
          }
          else{
            this.PrePostExpenditureForm.reset()
            this.TotalAmount=0
            this.getExpenditure()
            this.closeModalDelete();
            this.deleteprogramExpenditureId ={}
          this.toastrService.success( item.expenditureType +' Expenditure Deleted Successfully', item.expenditureType +" Expenditure Data Success!");
          }
          
        },
        error: (err) => {
          this.closeModalDelete();
          this.deleteprogramExpenditureId ={}
          this.toastrService.error(err.message, item.expenditureType +" Expenditure Data Error!");
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
    UpdateExpenditure(item:any){

    }

    sessionSubmissionFinal() {
              let data = {}
              this._commonService.add(`${APIS.programCreation.updateSessionByStatus}${this.programCreationMain.value.programId}?status=Program Expenditure Updated`, data).subscribe({
                next: (data: any) => {
                  console.log('Response from API:', data);
                  this.toastrService.success('Program Expenditure Details Submitted Successfully', "");
                  this.closeConfirmSession();
                  this.getExpenditureDataBoth = ''
                  this.programCreationMain.reset()
                  this.onAgencyChange()
                },
                error: (err: any) => {
                  this.closeConfirmSession();        
                  this.toastrService.error("Something unexpected happened!!");
                  new Error(err);
                },
              });    
              }
          
              closeConfirmSession() {
              const editSessionModal = document.getElementById('exampleModalDeleteConfirm');
              if (editSessionModal) {
                const modalInstance = bootstrap.Modal.getInstance(editSessionModal);
                modalInstance.hide();
              }
            }
            downloadProgramExpenditure(){
              let linkUrl = APIS.programExpenditure.downloadExpeditureData+'?programId='+this.programCreationMain.value.programId+'&agencyId='+this.agencyId
              const link = document.createElement("a");
              link.setAttribute("download", linkUrl);
              link.setAttribute("target", "_blank");
              link.setAttribute("href", linkUrl);
              document.body.appendChild(link);
              link.click();
              link.remove();
            }
 imageUrlDownloadPath = `https://metaverseedu.in/`;
  imagePreviewUrl: any
   type:any=''
    showImagePreview(url: any, value: string,type:any) {
    this.type=type
    this.imagePreviewUrl = null; // Reset the image preview URL
    this.imagePreviewUrl = url + value;

    const editSessionModal = document.getElementById('imagePreview');
    if (editSessionModal) {
      const modalInstance = new bootstrap.Modal(editSessionModal);
      modalInstance.show();
    }
  }
          
}
