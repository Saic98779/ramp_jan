import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonServiceService } from '@app/_services/common-service.service';
import { APIS } from '@app/constants/constants';
import { ToastrService } from 'ngx-toastr';
import moment from 'moment';
declare var bootstrap: any;
import DataTable from 'datatables.net-dt';
import 'datatables.net-buttons-dt';
import 'datatables.net-responsive-dt';
import { MonthlyRangeComponent } from '../monthly-range/monthly-range.component';

@Component({
  selector: 'app-non-training-target-code',
  templateUrl: './non-training-target-code.component.html',
  styleUrls: ['./non-training-target-code.component.css']
})
export class NonTrainingTargetCodeComponent implements OnInit {

  financialForm!: FormGroup;
  travelForm!: FormGroup;
  paymentForm!: FormGroup;
   isSubmitted = false;
  loginsessionDetails: any;
  selectedAgencyId: any;
  @ViewChild(MonthlyRangeComponent) monthlyRange!: MonthlyRangeComponent;
 constructor(private fb: FormBuilder, private toastrService: ToastrService,
      private _commonService: CommonServiceService,
      private router: Router,) {
   this.loginsessionDetails = JSON.parse(sessionStorage.getItem('user') || '{}');    
     this.selectedAgencyId = this.loginsessionDetails.agencyId;
    this.financialForm = this.createForm();
     this.travelForm = this.createFormTravel();
        this.contingencyForm = this.createFormContingency();
        this.paymentForm = this.createFormPayment();
        this.consumablesForm = this.createConsumablesForm();
        this.transactionForm = this.createTransactionForm();

  }
  

  ngOnInit(): void {
     this.getBudgetHeadList()
    
  }
    budgetHeadList: any;
    getBudgetHeadList() {
        this._commonService.getDataByUrl(APIS.nontrainingtargets.getBudgetHeadList+this.selectedAgencyId).subscribe((res: any) => {
          this.budgetHeadList = res;
          this.onActivityChange(this.budgetHeadList[0]?.activityId)
        
        }, (error) => {
          // this.toastrService.error(error.message);
        });
      }
      selectedActivity:any
      SubActivityList:any=[]
      onActivityChange(event: any) {
        this.selectedActivity=event
         this._commonService.getDataByUrl(APIS.nontrainingtargets.getSubActivityList+event).subscribe((res: any) => {
          this.SubActivityList = res;
          this.selectedBudgetHead= this.SubActivityList[0]?.subActivityId
          this.onBudgetHeadChange(this.SubActivityList[0]?.subActivityId)
            this.getPreliminaryDataById()
        
        }, (error) => {
          // this.toastrService.error(error.message);
        });
      }
  selectedBudgetHead: string = '1';
  physicalTargetAchievement: any = '';
  physicalTarget: any = 0;
  financialTarget: any = 0;
  financialTargetAchievement: any = 0;
  onBudgetHeadChange(event: any) {
    this.selectedBudgetHead = event;
    console.log('Selected Budget Head:', this.selectedBudgetHead);
    this.applyPhysicalReportValidators();
    this.getDeatilOfTargets()
  }
  get isPhysicalReportBudget(): boolean {
    const s = String(this.selectedBudgetHead);
    return s === '163';
  }
  uploadedSupportingDoc: any;
  onSupportingDocSelected(event: any): void {
    const file = event.target.files[0];
    if (file) this.uploadedSupportingDoc = file;
  }
  removeSupportingDoc(): void {
    this.uploadedSupportingDoc = null;
  }
  private applyPhysicalReportValidators() {
    const ach = this.financialForm?.get('achievementDetails');
    const cat = this.financialForm?.get('category');
    if (this.isPhysicalReportBudget) {
      ach?.setValidators([Validators.required]);
      // Category dropdown is hidden for physical-report sub-activities — drop
      // its required validator so the form can actually submit.
      cat?.clearValidators();
      cat?.setValue(cat?.value || null);
    } else {
      ach?.clearValidators();
      cat?.setValidators([Validators.required]);
    }
    ach?.updateValueAndValidity();
    cat?.updateValueAndValidity();
  }
  private buildFinancialDto(): any {
    const { achievementDetails, ...rest } = this.financialForm.value;
    const dto: any = { ...rest };
    if (this.isPhysicalReportBudget) {
      dto.achievementDetails = achievementDetails || '';
    }
    return dto;
  }
  downloadSupportDocument(filePath: string): void {
    if (!filePath) return;
    const trimmed = filePath.split('public_html/')[1];
    if (!trimmed) return;
    const encoded = trimmed.split('/').map(seg => encodeURIComponent(seg)).join('/');
    const fullUrl = `https://metaverseedu.in/${encoded}`;
    const fileName = trimmed.split('/').pop() || 'supporting-document';
    fetch(fullUrl)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.blob(); })
      .then(blob => {
        const objectUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1000);
      })
      .catch(() => {
        const link = document.createElement('a');
        link.href = fullUrl;
        link.target = '_blank';
        link.rel = 'noopener';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.toastrService.warning('Direct download blocked. File opened in a new tab — right-click and Save.');
      });
  }
 TargetDetails: any;
    getDeatilOfTargets() {
        this.TargetDetails=[]
        this.getPreliminaryData = [];
        this._commonService.getDataByUrl(APIS.nontrainingtargets.getNonTrainingtargets+this.selectedBudgetHead).subscribe((res: any) => {
          this.TargetDetails = res.data;
          this.physicalTarget = this.TargetDetails?.physicalTarget || 0;
          this.financialTarget = this.TargetDetails?.financialTarget || 0;
          this.physicalTargetAchievement = this.TargetDetails?.physicalTargetAchievement || 0;
          this.financialTargetAchievement = this.TargetDetails?.financialTargetAchievement || 0;
          console.log('TargetDetails:', this.TargetDetails);
       if(this.selectedBudgetHead=='1' || this.selectedBudgetHead=='73' || this.selectedBudgetHead=='11' || this.selectedBudgetHead=='20' || this.selectedBudgetHead=='21' || this.selectedBudgetHead=='22' || this.selectedBudgetHead=='23' || this.selectedBudgetHead=='24' || this.selectedBudgetHead=='25' || this.selectedBudgetHead=='66' || this.selectedBudgetHead=='163'){
            this.getPreliminaryDataById()

          }
           else if (this.selectedBudgetHead == '18') { // Assuming budget head 12 is for consumables
             this.getConsumablesData();
              this.getTransactionData();
    }
          else if(this.selectedBudgetHead=='19'){
            this.getTravelDataBySubActive()
          }
          else if(this.selectedBudgetHead=='12' || this.selectedBudgetHead=='13' || this.selectedBudgetHead=='14' || this.selectedBudgetHead=='15' || this.selectedBudgetHead=='16' || this.selectedBudgetHead=='17' || this.selectedBudgetHead=='74' || this.selectedBudgetHead=='75'){
            this.getResourceList()
            this.getContingencyDataById()
            this.getPaymentsDataById()
          }

          
        }, (error) => {

           if(this.selectedBudgetHead=='1'  || this.selectedBudgetHead=='73'  || this.selectedBudgetHead=='11' || this.selectedBudgetHead=='20' || this.selectedBudgetHead=='21' || this.selectedBudgetHead=='22' || this.selectedBudgetHead=='23' || this.selectedBudgetHead=='24' || this.selectedBudgetHead=='25' || this.selectedBudgetHead=='66' || this.selectedBudgetHead=='163'){
            this.getPreliminaryDataById()

          }
            else if (this.selectedBudgetHead == '18') { // Assuming budget head 12 is for consumables
             this.getConsumablesData();
              this.getTransactionData();
           }
           else if(this.selectedBudgetHead=='19'){
            this.getTravelDataBySubActive()
          }
          else if(this.selectedBudgetHead=='11' || this.selectedBudgetHead=='12' || this.selectedBudgetHead=='13' || this.selectedBudgetHead=='14' || this.selectedBudgetHead=='15' || this.selectedBudgetHead=='16' || this.selectedBudgetHead=='17' || this.selectedBudgetHead=='74' || this.selectedBudgetHead=='75'){
            this.getResourceList()
            this.getContingencyDataById()
            this.getPaymentsDataById()
          }
          // this.toastrService.error(error.message);
        });
      }


 convertToISOFormat(date: string): string {   
  if(date) {
    const [day, month, year] = date.split('-');
    return `${year}-${month}-${day}`; // Convert to yyyy-MM-dd format
  }
  else{
    return '';
  }
 
}

 // addd by upendranath reddy for common file preview
  showFileViewer(filePath: string) {
    console.log(filePath,"in file")
    this._commonService.openFile(filePath);

  }

 getPreliminaryDataById(){
        https://metaverseedu.in/workflow/non-training/all/expenditures?nonTrainingActivityId=1
         this._commonService.getDataByUrl(APIS.nontrainingtargets.getNonTrainingtargetsAleapPriliminaryById+this.selectedBudgetHead).subscribe((res: any) => {
            this.getPreliminaryData=res.data;
            this.financialTargetAchievement=0
            this.getPreliminaryData?.map((item:any)=>{
              this.financialTargetAchievement+=Number(item?.expenditureAmount)
            })
        
        }, (error) => {
          // this.toastrService.error(error.message);
        });
      }
        resourceList:any=[]
   getResourceList(){
        this.resourceList=[]
          this._commonService.getDataByUrl(APIS.nontrainingtargets.getResourceList+this.selectedBudgetHead).subscribe((res: any) => {
              this.resourceList=res.data;
             
          
          }, (error) => {
            // this.toastrService.error(error.message);
          });
      }
      travelList:any=[]
      getTravelDataBySubActive(){
           this.travelList=[]
          this._commonService.getDataByUrl(APIS.nontrainingtargets.getTravelList+this.selectedBudgetHead).subscribe((res: any) => {
              this.travelList=res.data;
              this.financialTargetAchievement=0
            this.travelList?.map((item:any)=>{
              this.financialTargetAchievement+=Number(item?.amount)
            })
             
          
          }, (error) => {
            // this.toastrService.error(error.message);
          });
      }
       getContingencyDataById(){
         this._commonService.getDataByUrl(APIS.nontrainingtargets.getNonTrainingtargetsAleapContingencyId+this.selectedBudgetHead).subscribe((res: any) => {
            this.getContingencyData=res.data;
        
        }, (error) => {
          // this.toastrService.error(error.message);
        });
      }
      getPaymentsData:any=[]
       getPaymentsDataById(){
        this.getPaymentsData=[]
         this._commonService.getDataByUrl(APIS.nontrainingtargets.getNonTrainingtargetsAleapPaymentsId+this.selectedBudgetHead).subscribe((res: any) => {
            this.getPaymentsData=res.data;
            this.financialTargetAchievement=0
              this.getPaymentsData?.map((item:any)=>{
              this.financialTargetAchievement+=Number(item?.amount)
            })
        }, (error) => {
          // this.toastrService.error(error.message);
        });
      }
      viewPaymentData:any=[]
      getViewData(data:any){
        
        this.viewPaymentData=data
        //  this._commonService.getDataByUrl(APIS.nontrainingtargets.getNonTrainingtargetsAleapPaymentsId+id).subscribe((res: any) => {
        //     this.viewPaymentData=res.data;
        
        // }, (error) => {
        //   // this.toastrService.error(error.message);
        // });
      }
      // final submission
      onFinalSubmit(){
        let payload={
          "nonTrainingAchievementId": this.TargetDetails?.nonTrainingAchievementId,
          "nonTrainingSubActivityId": Number(this.selectedBudgetHead),
          "physicalTarget": Number(this.physicalTarget),
          "physicalTargetAchievement": this.physicalTargetAchievement,
          "financialTarget": Number(this.financialTarget),
          "financialTargetAchievement": Number(this.financialTargetAchievement)
          }
        this._commonService.update(APIS.nontrainingtargets.updateTarets,payload,this.TargetDetails?.nonTrainingAchievementId).subscribe((res: any) => {
            this.toastrService.success('Final Submission Done Successfully','Non Training Progress Data Success!');
            this.getDeatilOfTargets()
        
        }, (error) => {
          this.toastrService.error(error.message,"Non Training Progress Data Error!");
        });
      }
// it infrastructure
createForm(): FormGroup {
    return this.fb.group({
      agencyId: [0, ],
      nonTrainingSubActivityId: [0, ],
       nonTrainingActivityId: [0, ],
      paymentDate: ['', Validators.required],
      category: ['', Validators.required],
      expenditureAmount: [0, [Validators.required, Validators.min(0),Validators.max(5000000)]],
      billNo: ['', Validators.required],
      billDate: ['', Validators.required],
      payeeName: ['', Validators.required],
      accountNumber: ['', Validators.required],
      bankName: ['', Validators.required],
      ifscCode: ['', [Validators.required, Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]],
      modeOfPayment: ['', Validators.required],
      transactionId: [''],
      purpose: ['', Validators.required],
      uploadBillUrl: [''],
      checkNo: [''],
      checkDate: [''],
      achievementDetails: [''],
    });
  }

  get f() {
    return this.financialForm.controls;
  }
 
  iseditMode = false;
  preliminaryID:any
  categroryList:any=['Course Content Development','Processing Fee', 'Admin Charges', 'Others']
  openModel(mode: string,item?: any): void {
      if(this.selectedBudgetHead=='20' || this.selectedBudgetHead=='21' || this.selectedBudgetHead=='22' || this.selectedBudgetHead=='23' ){
        this.categroryList=['Course Content Development','Processing Fee', 'Admin Charges', 'Others']
      }
      else if(this.selectedBudgetHead=='24' ){
          this.categroryList = ['Man Power Support', 'Prototype / Fabrication', 'IPR Support', 'Others'];
      }
       else if(this.selectedBudgetHead=='25' ){
            this.categroryList = ['Honororium', 'Travel', 'Others'];
      }
     if (mode === 'add') {
        this.uploadedFilesFinance=null
      this.financialForm.reset();
      this.iseditMode = false;
      this.resetForm();
    }
    if (mode === 'edit') {
      this.preliminaryID=item?.id
      this.iseditMode = true;
      this.modeOfPaymentIt(item?.modeOfPayment);
      this.uploadedFilesFinance=item?.uploadBillUrl
      this.uploadedSupportingDoc = item?.supportDocumentUrl || null;
      this.financialForm.patchValue({
        agencyId: item?.agencyId || 0,
        nonTrainingSubActivityId: item?.nonTrainingSubActivityId || 0,
        paymentDate: item?.paymentDate ? this.convertToISOFormat(item?.paymentDate) : '',
        category: item?.category ? item?.category : '',
        expenditureAmount: item?.expenditureAmount || 0,
        billNo: item?.billNo || '',
        billDate: item?.billDate ? this.convertToISOFormat(item?.billDate) : '',
        payeeName: item?.payeeName || '',
        accountNumber: item?.accountNumber || '',
        bankName: item?.bankName || '',
        ifscCode: item?.ifscCode || '',
        modeOfPayment: item?.modeOfPayment || '',
        transactionId: item?.transactionId || '',
        purpose: item?.purpose || '',
        uploadBillUrl: '',
        checkNo: item?.checkNo || '',
        checkDate: item?.checkDate ? this.convertToISOFormat(item?.checkDate) : '',
        achievementDetails: item?.achievementDetails || '',
      });

    }
    const modal1 = new bootstrap.Modal(document.getElementById('addSurvey'));
    modal1.show();
  }
  modeOfPaymentIt(val:any){
      if(val=='CASH'){
        this.financialForm.get('bankName')?.setValidators(null);
        this.financialForm.get('accountNumber')?.setValidators(null);
        this.financialForm.get('transactionId')?.setValidators(null);
        this.financialForm.get('ifscCode')?.setValidators(null);
                  this.financialForm.get('checkNo')?.setValidators(null);
        this.financialForm.get('checkDate')?.setValidators(null);

        this.financialForm.get('bankName')?.patchValue('');
        this.financialForm.get('accountNumber')?.patchValue('');
        this.financialForm.get('transactionId')?.patchValue('');
        this.financialForm.get('ifscCode')?.patchValue('');
          this.financialForm.get('checkNo')?.patchValue('');
        this.financialForm.get('checkDate')?.patchValue('');

        this.financialForm.get('bankName')?.clearValidators();
        this.financialForm.get('accountNumber')?.clearValidators();
        this.financialForm.get('transactionId')?.clearValidators();
        this.financialForm.get('ifscCode')?.clearValidators();
        this.financialForm.get('checkNo')?.clearValidators();
        this.financialForm.get('checkDate')?.clearValidators();

        this.financialForm.get('bankName')?.disable();
        this.financialForm.get('accountNumber')?.disable();
        this.financialForm.get('transactionId')?.disable();
        this.financialForm.get('ifscCode')?.disable();
         this.financialForm.get('checkNo')?.disable();
        this.financialForm.get('checkDate')?.disable();

      
        this.financialForm.get('bankName')?.updateValueAndValidity();
        this.financialForm.get('accountNumber')?.updateValueAndValidity();
        this.financialForm.get('transactionId')?.updateValueAndValidity();
        this.financialForm.get('ifscCode')?.updateValueAndValidity();
                this.financialForm.get('checkNo')?.updateValueAndValidity();
        this.financialForm.get('checkDate')?.updateValueAndValidity();
        this.financialForm.get('expenditureAmount')?.setValidators([Validators.required, Validators.min(0), Validators.max(5000)]);
        this.financialForm.get('expenditureAmount')?.updateValueAndValidity();

      }
      else if(val=='BANK_TRANSFER'){
        this.financialForm.get('bankName')?.setValidators([Validators.required]);
        this.financialForm.get('accountNumber')?.setValidators([Validators.required]);
        this.financialForm.get('transactionId')?.setValidators(null);
        this.financialForm.get('ifscCode')?.setValidators([Validators.required,Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]);
       this.financialForm.get('checkNo')?.setValidators(null);
        this.financialForm.get('checkDate')?.setValidators(null);

        this.financialForm.get('bankName')?.enable();
        this.financialForm.get('accountNumber')?.enable();
        this.financialForm.get('transactionId')?.disable();
        this.financialForm.get('ifscCode')?.enable();
          this.financialForm.get('checkNo')?.disable();
        this.financialForm.get('checkDate')?.disable();

        this.financialForm.get('bankName')?.patchValue('');
        this.financialForm.get('accountNumber')?.patchValue('');
        this.financialForm.get('transactionId')?.patchValue('');
        this.financialForm.get('ifscCode')?.patchValue('');
       this.financialForm.get('checkNo')?.patchValue('');
        this.financialForm.get('checkDate')?.patchValue('');

        this.financialForm.get('bankName')?.updateValueAndValidity();
        this.financialForm.get('accountNumber')?.updateValueAndValidity();
        this.financialForm.get('transactionId')?.updateValueAndValidity();
        this.financialForm.get('ifscCode')?.updateValueAndValidity();
        this.financialForm.get('checkNo')?.updateValueAndValidity();
        this.financialForm.get('checkDate')?.updateValueAndValidity();
        this.financialForm.get('expenditureAmount')?.setValidators([Validators.required, Validators.min(0)]);
        this.financialForm.get('expenditureAmount')?.updateValueAndValidity();

      }
      else if(val=='UPI'){
        this.financialForm.get('bankName')?.setValidators(null);
        this.financialForm.get('accountNumber')?.setValidators(null);
        this.financialForm.get('transactionId')?.setValidators([Validators.required,Validators.pattern(/^[^\s].*/)]);
        this.financialForm.get('ifscCode')?.setValidators(null);
       this.financialForm.get('checkNo')?.setValidators(null);
        this.financialForm.get('checkDate')?.setValidators(null);

        this.financialForm.get('bankName')?.disable();
        this.financialForm.get('accountNumber')?.disable();
        this.financialForm.get('transactionId')?.enable();
        this.financialForm.get('ifscCode')?.disable();
          this.financialForm.get('checkNo')?.disable();
        this.financialForm.get('checkDate')?.disable();

        this.financialForm.get('bankName')?.patchValue('');
        this.financialForm.get('accountNumber')?.patchValue('');
        this.financialForm.get('transactionId')?.patchValue('');
        this.financialForm.get('ifscCode')?.patchValue('');
        this.financialForm.get('checkNo')?.patchValue('');
        this.financialForm.get('checkDate')?.patchValue('');

        this.financialForm.get('bankName')?.updateValueAndValidity();
        this.financialForm.get('accountNumber')?.updateValueAndValidity();
        this.financialForm.get('transactionId')?.updateValueAndValidity();
        this.financialForm.get('ifscCode')?.updateValueAndValidity();
        this.financialForm.get('checkNo')?.updateValueAndValidity();
        this.financialForm.get('checkDate')?.updateValueAndValidity();
        this.financialForm.get('expenditureAmount')?.setValidators([Validators.required, Validators.min(0)]);
        this.financialForm.get('expenditureAmount')?.updateValueAndValidity();

      }
       else if(val=='CHEQUE'){
                this.financialForm.get('bankName')?.setValidators([Validators.required]);

        this.financialForm.get('accountNumber')?.setValidators(null);
        this.financialForm.get('transactionId')?.setValidators(null);
         this.financialForm.get('ifscCode')?.setValidators(null);
        this.financialForm.get('checkNo')?.setValidators([Validators.required]);
        this.financialForm.get('checkDate')?.setValidators([Validators.required]);

        this.financialForm.get('bankName')?.enable();

       this.financialForm.get('accountNumber')?.disable();
        this.financialForm.get('transactionId')?.disable();
        this.financialForm.get('ifscCode')?.disable();
        this.financialForm.get('checkNo')?.enable();
        this.financialForm.get('checkDate')?.enable();

        this.financialForm.get('bankName')?.patchValue('');
        this.financialForm.get('accountNumber')?.patchValue('');
        this.financialForm.get('transactionId')?.patchValue('');
        this.financialForm.get('ifscCode')?.patchValue('');
         this.financialForm.get('checkNo')?.patchValue('');
        this.financialForm.get('checkDate')?.patchValue('');

        this.financialForm.get('bankName')?.updateValueAndValidity();
        this.financialForm.get('accountNumber')?.updateValueAndValidity();
        this.financialForm.get('transactionId')?.updateValueAndValidity();

        this.financialForm.get('ifscCode')?.updateValueAndValidity();
         this.financialForm.get('checkNo')?.updateValueAndValidity();
        this.financialForm.get('checkDate')?.updateValueAndValidity();
        this.financialForm.get('expenditureAmount')?.setValidators([Validators.required, Validators.min(0)]);
        this.financialForm.get('expenditureAmount')?.updateValueAndValidity();

      }
    }
    getSubactivities(event:any){
        return this.SubActivityList?.find((item:any)=>item?.subActivityId==event)?.subActivityName || ''
      }
  getPreliminaryData:any=[]
  onSubmit(): void {
    this.isSubmitted = true;
     if (this.financialForm.valid) {
    if(this.iseditMode){
       this.f['agencyId'].setValue(Number(this.selectedAgencyId));
        this.f['nonTrainingSubActivityId'].setValue(Number(this.selectedBudgetHead));
        this.f['nonTrainingActivityId'].setValue(Number(this.selectedActivity));
        const formData = new FormData();
            console.log('this.uploadedFilesFinance:', this.uploadedFilesFinance,Object(this.uploadedFilesFinance).length>0,typeof this.uploadedFilesFinance);
             if (this.uploadedFilesFinance && this.uploadedFilesFinance.name && typeof this.uploadedFilesFinance !== 'string') {
              formData.append("files", this.uploadedFilesFinance);
              }
              else{
                this.financialForm.patchValue({uploadBillUrl:this.uploadedFilesFinance})
              }
              if (this.uploadedSupportingDoc && this.uploadedSupportingDoc.name && typeof this.uploadedSupportingDoc !== 'string') {
                formData.append("supportDocument", this.uploadedSupportingDoc);
              }

              formData.append("dto", JSON.stringify({...this.buildFinancialDto(),nonTrainingSubActivityId:Number(this.selectedBudgetHead),id:this.preliminaryID}));

         
        this._commonService.update(APIS.nontrainingtargets.updateNonTrainingtargetsAleapPriliminary,formData,this.preliminaryID).subscribe((res: any) => {
         this.toastrService.success('Data Updated successfully','Non Training Progress Data Success!');
          
          console.log('Preliminary Data:', this.getPreliminaryData);
          this.resetForm();
            this.getPreliminaryDataById()

          this.isSubmitted = false;
          const modalElement = document.getElementById('addSurvey');
          const modal1 = modalElement ? bootstrap.Modal.getInstance(modalElement) : null;
          if (modal1) {
            modal1.hide();
          }
        
        }, (error) => {
           this.resetForm();
          this.isSubmitted = false;
          const modal1 = bootstrap.Modal.getInstance(document.getElementById('addSurvey'));
          modal1.hide();
          this.toastrService.error(error.message,"Non Training Progress Data Error!");
        });
        setTimeout(() => {
           this.getDeatilOfTargets()
        }, 200);
    }
    else{
      console.log('Form Submitted:', this.financialForm.value);
      this.f['agencyId'].setValue(Number(this.selectedAgencyId));
        this.f['nonTrainingSubActivityId'].setValue(Number(this.selectedBudgetHead));
        this.f['nonTrainingActivityId'].setValue(Number(this.selectedActivity));
         const formData = new FormData();
          formData.append("dto", JSON.stringify(this.buildFinancialDto()));

           if (this.uploadedFilesFinance) {
             formData.append("file", this.uploadedFilesFinance);
             }
          if (this.uploadedSupportingDoc && this.uploadedSupportingDoc.name && typeof this.uploadedSupportingDoc !== 'string') {
            formData.append("supportDocument", this.uploadedSupportingDoc);
          }
        this._commonService.add(APIS.nontrainingtargets.saveNonTrainingtargetsCodeIT,formData).subscribe((res: any) => {
          this.toastrService.success('Data saved successfully','Non Training Progress Data Success!');
          this.getPreliminaryData.push(res.data)
            this.getPreliminaryDataById()

          this.resetForm();
          this.isSubmitted = false;
          const modal1 = bootstrap.Modal.getInstance(document.getElementById('addSurvey'));
          modal1.hide();
         
        
        }, (error) => {
          this.resetForm();
          this.isSubmitted = false;
          const modal1 = bootstrap.Modal.getInstance(document.getElementById('addSurvey'));
          modal1.hide();
          this.toastrService.error(error.message);
        });
        setTimeout(() => {
           this.getDeatilOfTargets()
        }, 200);
    }
   
    }

  }
  deletePreliminaryID:any
  deletePreliminary(id:any):void{
    this.deletePreliminaryID=id
     const previewModal = document.getElementById('exampleModalDelete');
    if (previewModal) {
      const modalInstance = new bootstrap.Modal(previewModal);
      modalInstance.show();
    }
  }
  ConfirmdeleteExpenditure(item:any){
      this._commonService
      .deleteId(APIS.nontrainingtargets.deleteNonTrainingtargetsAleapPriliminary,item).subscribe({
        next: (data: any) => {
          if(data?.status==400){
            this.toastrService.error(data?.message, "Non Training Progress Data Error!");
            this.closeModalDelete();

            this.deletePreliminaryID =''
          }
          else{
            // this.getBulkExpenditure()
            this.closeModalDelete();
            this.getPreliminaryDataById()

            this.deletePreliminaryID =''
          this.toastrService.success( 'Record Deleted Successfully', "Non Training Progress Data Success!");
          }
          
        },
        error: (err) => {
          this.closeModalDelete();
          this.deletePreliminaryID =''
          this.toastrService.error(err.message, "Non Training Progress Error!");
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
       setTimeout(() => {
           this.getDeatilOfTargets()
        }, 200);
    } 
    uploadedFiles: any ;
  uploadedFilesFinance: any ;
  onFileSelected(event: any): void {
    console.log('File selected event:', event);
    const file = event.target.files[0];
    if (file) {
      this.uploadedFilesFinance = file;
      // Handle file upload logic here
      // You might want to upload the file and then set the URL
      // this.financialForm.patchValue({
      //   uploadBillUrl: file.name // This would be the uploaded file URL
      // });
    }
  }
removeFile(): void {
     this.uploadedFilesFinance=null   
   }

  // end infracture

  // contingency fund || staff


   designations = [
    { value: 'CEO', label: 'CEO' },
    { value: 'Project Manager', label: 'Project Manager' },
    { value: 'Designer', label: 'Designer' },
    { value: 'R&D', label: 'R&D' },
    { value: 'Interns for certifications', label: 'Interns for certifications' }
  ];
   contingencyForm!: FormGroup;
     createFormContingency(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      designation: ['', Validators.required],
      relevantExperience: [0, [Validators.required, Validators.min(0), Validators.max(50)]],
      educationalQualification: ['', Validators.required],
      dateOfJoining: ['', Validators.required],
      monthlySal: [0, [Validators.required, Validators.min(0), Validators.max(5000000)]],
      bankName: ['', Validators.required],
      ifscCode: ['', [Validators.required, Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]],
      accountNo: ['', [Validators.required]],
      uploadBillUrl: ['']
    });
  }

  get fContingency() {
    return this.contingencyForm.controls;
  }


  resetFormContingency(): void {
     const modalElement = document.getElementById('addContingency');
          const modal1 = modalElement ? bootstrap.Modal.getInstance(modalElement) : null;
          if (modal1) {
            modal1.hide();
          }
    this.isSubmitted = false;
  }

  // Helper method to format currency input
  formatCurrency(event: any, field: string): void {
    const value = event.target.value.replace(/[^\d]/g, '');
    this.contingencyForm.patchValue({
      [field]: value ? parseInt(value) : 0
    });
  }
   iseditModeContingency = false;
  ContingencyID:any
  openModelContingency(mode: string,item?: any): void {
    if (mode === 'add') {
      this.iseditModeContingency = false;
      this.resetFormContingency();
      this.contingencyForm.reset();
      if(this.selectedBudgetHead=='14'){
        this.contingencyForm.patchValue({designation:'CEO'})
      }
      else if(this.selectedBudgetHead=='17'){
        this.contingencyForm.patchValue({designation:'Project Manager'})

      }
      else if(this.selectedBudgetHead=='16' || this.selectedBudgetHead=='15'){
        this.contingencyForm.patchValue({designation:'Designer'})

      }
      else if(this.selectedBudgetHead=='74'){
        this.contingencyForm.patchValue({designation:'Interns for certifications'})

      }
      else if(this.selectedBudgetHead=='75'){
        this.contingencyForm.patchValue({designation:'R&D'})

      }
      
    }
    if (mode === 'edit') {
      item['uploadBillUrl']=''
      this.ContingencyID=item?.resourceId
      this.iseditModeContingency = true;

      this.contingencyForm.patchValue({
        name: item?.name || '',
        designation: item?.designation || '',
        relevantExperience: item?.relevantExperience || 0,
        educationalQualification: item?.educationalQualification || '',
        dateOfJoining: item?.dateOfJoining ? this.convertToISOFormat(item.dateOfJoining) : '',
        monthlySal: item?.monthlySal || 0,
        bankName: item?.bankName || '',
        ifscCode: item?.ifscCode || '',
        accountNo: item?.accountNo || ''
      });
    }
    const modal1 = new bootstrap.Modal(document.getElementById('addContingency'));
    modal1.show();
  }
  getContingencyData:any=[]
  onSubmitContingency(): void {
    this.isSubmitted = true;
     if (this.contingencyForm.valid) {
    if(this.iseditModeContingency){
       
        this._commonService.update(APIS.nontrainingtargets.updateNonTrainingtargetsAleapContingency,{...this.contingencyForm.value,"expenditures":[],nonTrainingActivityId:Number(this.selectedActivity),nonTrainingSubActivityId:Number(this.selectedBudgetHead),dateOfJoining:this.contingencyForm?.value?.dateOfJoining?moment(this.contingencyForm?.value?.dateOfJoining).format('DD-MM-YYYY'):null},this.ContingencyID).subscribe((res: any) => {
          this.toastrService.success('Data Updated successfully','Non Training Progress Data Success!');
          
          console.log('Preliminary Data:', this.getContingencyData);
          this.resetFormContingency();
          this.isSubmitted = false;
          const modal1 = bootstrap.Modal.getInstance(document.getElementById('addContingency'));
          modal1.hide();
        
        }, (error) => {
           this.resetFormContingency();
          this.isSubmitted = false;
          const modal1 = bootstrap.Modal.getInstance(document.getElementById('addContingency'));
          modal1.hide();
          this.toastrService.error(error.message,"Non Training Progress Data Error!");
        });
    }
    else{
      console.log('Form Submitted:', this.contingencyForm.value);
        this._commonService.add(APIS.nontrainingtargets.saveNonTrainingtargetsAleapContingency,{...this.contingencyForm.value,"expenditures":[],nonTrainingActivityId:Number(this.selectedActivity),nonTrainingSubActivityId:Number(this.selectedBudgetHead),dateOfJoining:this.contingencyForm?.value?.dateOfJoining?moment(this.contingencyForm?.value?.dateOfJoining).format('DD-MM-YYYY'):null}).subscribe((res: any) => {
          this.toastrService.success('Data saved successfully','Non Training Progress Data Success!');
          this.resetFormContingency();
          this.isSubmitted = false;
          const modal1 = bootstrap.Modal.getInstance(document.getElementById('addContingency'));
          modal1.hide();
         
        
        }, (error) => {
          this.resetFormContingency();
          this.isSubmitted = false;
          const modal1 = bootstrap.Modal.getInstance(document.getElementById('addContingency'));
          modal1.hide();
          this.toastrService.error(error.message);
        });
    }
    setTimeout(() => {
           this.getDeatilOfTargets()
        }, 200);
      }

  }
  deleteContingencyID:any
  deleteContingency(id:any):void{
    this.deleteContingencyID=id
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
     const previewModal = document.getElementById('exampleModalDeleteContinuty');
     const modalInstance = new bootstrap.Modal(previewModal);
      modalInstance.show();
  }
  ConfirmdeleteContingency(item:any){
      this._commonService
      .deleteId(APIS.nontrainingtargets.deleteNonTrainingtargetsAleapContingency,item).subscribe({
        next: (data: any) => {
          if(data?.status==400){
            this.toastrService.error(data?.message, "Non Training Progress Data Error!");
            this.closeModalDeleteContinuty();
            this.deleteContingencyID =''
          }
          else{
            // this.getBulkExpenditure()
            
          this.toastrService.success( 'Record Deleted Successfully', "Non Training Progress Data Success!");
          this.closeModalDeleteContinuty();
            this.deleteContingencyID =''
          }
          
        },
        error: (err) => {
          this.toastrService.error(err.message, "Non Training Progress Error!");
          this.closeModalDeleteContinuty();
          this.deleteContingencyID =''
          
          new Error(err);
        },
      });
      setTimeout(() => {
           this.getDeatilOfTargets()
        }, 200);

    }
  closeModalDeleteContinuty(): void {
      const editSessionModal = document.getElementById('exampleModalDeleteContinuty');
      if (editSessionModal) {
        const modalInstance = bootstrap.Modal.getInstance(editSessionModal);
        modalInstance.hide();
      }
    }
resetForm(): void {
     const modalElement = document.getElementById('addSurvey');
          const modal1 = modalElement ? bootstrap.Modal.getInstance(modalElement) : null;
          if (modal1) {
            modal1.hide();
          }
    this.isSubmitted = false;
  }
// paymenr 
  iseditModePayment = false;
  paymentID:any
  // openModelPayment(mode: string,item?: any): void {
  //   this.paymentID=''
  //   if (mode === 'add') {
  //     this.iseditModePayment = false;
  //     this.paymentForm.reset();
  //     this.isSubmitted = false;
  //     this.paymentForMonth = ''; // Clear the payment month for add mode
  //      setTimeout(() => {
  //      this.monthlyRange.setValue('08-2025');
  //     }, 0);
  //   }
  //   if (mode === 'edit') {

  //     this.paymentID=item?.nonTrainingResourceExpenditureId
  //     this.iseditModePayment = true;
  //     // Set the paymentForMonth value from response - this will trigger the monthly-range component update
  //     this.paymentForMonth = item?.paymentForMonth || '';
      
  //     // Use setTimeout to ensure the monthly-range component is available
  //     setTimeout(() => {
  //       if (this.monthlyRange && item?.paymentForMonth) {
  //         this.monthlyRange.setValue(item.paymentForMonth);
  //       }
  //     }, 0);
  //      item['uploadBillUrl']=''
  //     this.paymentForm.patchValue({
  //       amount: item?.amount || 0,
  //       paymentForMonth: item?.paymentForMonth || '',
  //       dateOfPayment: item?.dateOfPayment ? this.convertToISOFormat(item?.dateOfPayment) : '',
  //       resourceId: item?.resourceId || 0,
  //       bankName: item?.bankName || '',
  //       ifscCode: item?.ifscCode || '',
  //       accountNo: item?.accountNo || '',
  //       uploadBillUrl: item?.uploadBillUrl || ''
       
  //     });
  //   }
  //   this.onResourceChange(item?.resourceId,this.resourceList)
  //   const modal1 = new bootstrap.Modal(document.getElementById('addPayment'));
  //   modal1.show();
  // }
  // ...existing code...

// Update the uploadedFilesPayment property (add this near uploadedFilesFinance around line 668)
uploadedFilesPayment: any;

// ...existing code...

// Update openModelPayment method
openModelPayment(mode: string,item?: any): void {
    this.paymentID=''
    if (mode === 'add') {
      this.iseditModePayment = false;
      this.paymentForm.reset();
      this.isSubmitted = false;
      this.uploadedFilesPayment = null; // Add this line
      this.paymentForMonth = ''; 
       setTimeout(() => {
       this.monthlyRange.setValue('08-2025');
      }, 0);
    }
    if (mode === 'edit') {
      this.paymentID=item?.nonTrainingResourceExpenditureId
      this.iseditModePayment = true;
      this.uploadedFilesPayment = item?.uploadBillUrl; // Add this line
      this.paymentForMonth = item?.paymentForMonth || '';
      
      setTimeout(() => {
        if (this.monthlyRange && item?.paymentForMonth) {
          this.monthlyRange.setValue(item.paymentForMonth);
        }
      }, 0);
       
      this.paymentForm.patchValue({
        amount: item?.amount || 0,
        paymentForMonth: item?.paymentForMonth || '',
        dateOfPayment: item?.dateOfPayment ? this.convertToISOFormat(item?.dateOfPayment) : '',
        resourceId: item?.resourceId || 0,
        bankName: item?.bankName || '',
        ifscCode: item?.ifscCode || '',
        accountNo: item?.accountNo || '',
        uploadBillUrl: '' // Change this line
      });
    }
      setTimeout(() => {
       const fileInput = document.getElementById('paymentFile') as HTMLInputElement;
         if (fileInput) {
          fileInput.value = '';
          } 
     }, 100);
    this.onResourceChange(item?.resourceId,this.resourceList)
    const modal1 = new bootstrap.Modal(document.getElementById('addPayment'));
    modal1.show();
  }

  
onSubmitPayment(): void {
    this.isSubmitted = true;
    console.log(this.paymentForm.value);
    if (this.paymentForm.valid) {
      
       if(this.iseditModePayment){
        const formData = new FormData();
        
        if (this.uploadedFilesPayment?.name && typeof this.uploadedFilesPayment !== 'string') {
          formData.append("files", this.uploadedFilesPayment);
        } else {
          this.paymentForm.patchValue({uploadBillUrl: this.uploadedFilesPayment});
        }

        formData.append("expenditureDto", JSON.stringify({
          nonTrainingResourceExpenditureId: this.paymentID,
          amount: this.paymentForm.value.amount,
          paymentForMonth: this.paymentForm.value.paymentForMonth,
          dateOfPayment: this.paymentForm.value.dateOfPayment,
          uploadBillUrl: this.paymentForm.value.uploadBillUrl,
          resourceId: Number(this.paymentForm.value.resourceId)
        }));

        this._commonService.update(APIS.nontrainingtargets.updateNonTrainingtargetsAleapContingencyPayment, formData, this.paymentID).subscribe((res: any) => {
          this.toastrService.success('payments Updated successfully','Non Training Progress Data Success!');
          this.isSubmitted = false;
          const modal1 = bootstrap.Modal.getInstance(document.getElementById('addPayment'));
          modal1.hide();
          document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
        }, (error) => {
          this.isSubmitted = false;
          const modal1 = bootstrap.Modal.getInstance(document.getElementById('addPayment'));
          modal1.hide();
          document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
          this.toastrService.error(error.message,"Non Training Progress Data Error!");
        });
    }
    else{
      const formData = new FormData();
      formData.append("expenditureDto", JSON.stringify({
        nonTrainingResourceExpenditureId: 0,
        amount: this.paymentForm.value.amount,
        paymentForMonth: this.paymentForm.value.paymentForMonth,
        dateOfPayment: this.paymentForm.value.dateOfPayment,
        resourceId: Number(this.paymentForm.value.resourceId)
      }));

      if (this.uploadedFilesPayment) {
        formData.append("file", this.uploadedFilesPayment);
      }
      
      this._commonService.add(APIS.nontrainingtargets.saveNonTrainingtargetsAleapContingencyPayment, formData).subscribe((res: any) => {
        this.toastrService.success('Payments saved successfully','Non Training Progress Data Success!');
        this.isSubmitted = false;
        const modal1 = bootstrap.Modal.getInstance(document.getElementById('addPayment'));
        modal1.hide();
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
      }, (error) => {
        this.isSubmitted = false;
        const modal1 = bootstrap.Modal.getInstance(document.getElementById('addPayment'));
        modal1.hide();
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
        this.toastrService.error(error.message);
      });
    }
   
      setTimeout(() => {
           this.getDeatilOfTargets()
        }, 200);
    }
  }

// Update onFileSelectedPayment method
onFileSelectedPayment(event: any): void {
    const file = event.target.files[0];
    if (file) {
       this.uploadedFilesPayment = file;
    }
  }
  

// Add removeFilePayment method (add after onFileSelectedPayment)
removeFilePayment(): void {
    this.uploadedFilesPayment = null;
    const fileInput = document.getElementById('paymentFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

// ...existing code...
  onResourceChange(event:any,list:any){
    console.log('Selected Resource ID:', list);
    const selectedResource = list.find((item: any) => item.resourceId == event);
    console.log('Selected Resource:', selectedResource);
    if(selectedResource){
      this.paymentForm.patchValue({
        bankName: selectedResource?.bankName || '',
        ifscCode: selectedResource?.ifscCode || '',
        accountNo: selectedResource?.accountNo || ''
      });
    }
  }
    createFormPayment(): FormGroup {
    return this.fb.group({
      amount: [0, [Validators.required, Validators.min(0), Validators.max(5000000)]],
      paymentForMonth: ['08-2025',],
      dateOfPayment: ['', Validators.required],
      resourceId: [0, [Validators.required,]],
      bankName: ['',],
      ifscCode: ['', ],
      accountNo: ['', ],
      uploadBillUrl: ['', ]
    });
  }

  get fPayment() {
    return this.paymentForm.controls;
  }
  paymentForMonth: any = "08-2025";
  onChangeDate(event:any){
    console.log(event,event.value,moment(event.value).format('MM-YYYY'));
    this.paymentForm.patchValue({paymentForMonth: moment(event.value).format('MM-YYYY')
    });
   this.paymentForMonth= event.value ? moment(event.value).format('MM-YYYY') : '';
  }
  //  onSubmitPayment(): void {
  //   this.isSubmitted = true;
  //   console.log(this.paymentForm.value);
  //   if (this.paymentForm.valid) {
      
  //      if(this.iseditModePayment){
  //       const formData: any = {
  //       nonTrainingResourceExpenditureId: 0, // Generated by backend
  //       amount: this.paymentForm.value.amount,
  //       paymentForMonth: this.paymentForm.value.paymentForMonth,
  //       dateOfPayment: this.paymentForm.value.dateOfPayment,
  //       uploadBillUrl: this.paymentForm.value.uploadBillUrl,
  //       resourceId: Number(this.paymentForm.value.resourceId)
  //     };
  //       this._commonService.update(APIS.nontrainingtargets.updateNonTrainingtargetsAleapContingencyPayment,{...formData},this.paymentID).subscribe((res: any) => {
  //         this.toastrService.success('payments Updated successfully','Non Training Progress Data Success!');
          
  //         console.log('Preliminary Data:', this.getContingencyData);
          
  //         this.isSubmitted = false;
  //         const modal1 = bootstrap.Modal.getInstance(document.getElementById('addPayment'));
  //         modal1.hide();
  //          document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
        
  //       }, (error) => {
  //         //  this.resetForm();
  //         this.isSubmitted = false;
  //         const modal1 = bootstrap.Modal.getInstance(document.getElementById('addPayment'));
  //         modal1.hide();
  //          document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
  //         this.toastrService.error(error.message,"Non Training Progress Data Error!");
  //       });
  //   }
  //   else{
  //     console.log('Form Submitted:', this.contingencyForm.value);
  //     const formData = new FormData();
  //         formData.append("expenditureDto", JSON.stringify({
  //         nonTrainingResourceExpenditureId: 0, // Generated by backend
  //       amount: this.paymentForm.value.amount,
  //       paymentForMonth: this.paymentForm.value.paymentForMonth,
  //       dateOfPayment: this.paymentForm.value.dateOfPayment,
  //       resourceId: Number(this.paymentForm.value.resourceId)}));

  //         if (this.paymentForm.value.uploadBillUrl) {
  //           formData.append("file", this.uploadedFiles);
  //           }
  //       this._commonService.add(APIS.nontrainingtargets.saveNonTrainingtargetsAleapContingencyPayment,formData).subscribe((res: any) => {
  //         this.toastrService.success('Payments saved successfully','Non Training Progress Data Success!');
  //         this.isSubmitted = false;
  //         const modal1 = bootstrap.Modal.getInstance(document.getElementById('addPayment'));
  //         modal1.hide();
  //          document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
         
        
  //       }, (error) => {
       
  //         this.isSubmitted = false;
  //         const modal1 = bootstrap.Modal.getInstance(document.getElementById('addPayment'));
  //         modal1.hide();
  //          document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
  //         this.toastrService.error(error.message);
  //       });
  //   }
   
  //     setTimeout(() => {
  //          this.getDeatilOfTargets()
  //       }, 200);
  //     // console.log('Form Data:', formData);
  //     // Call your API service here
  //     // this.paymentService.createPayment(formData).subscribe(...);
      
    
  //   }
  // }
  deletePayment(id:any):void{
    this.deleteContingencyID=id
     document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
     const previewModal = document.getElementById('exampleModalDeletePayment');
    if (previewModal) {
      const modalInstance = new bootstrap.Modal(previewModal);
      modalInstance.show();

    }
  }
  ConfirmdeletePayment(item:any){
      this._commonService
      .deleteId(APIS.nontrainingtargets.deleteNonTrainingtargetsAleapContingencyPayment,item).subscribe({
        next: (data: any) => {
          if(data?.status==400){
            this.toastrService.error(data?.message, "Non Training Progress Data Error!");
            this.closeModalDeletePayment();
            this.deleteContingencyID =''
          }
          else{
            // this.getBulkExpenditure()
            this.closeModalDeletePayment();
            this.deleteContingencyID =''
          this.toastrService.success( 'Record Deleted Successfully', "Non Training Progress Data Success!");
          }
          
        },
        error: (err) => {
          this.closeModalDeletePayment();
          this.deleteContingencyID =''
          this.toastrService.error(err.message, "Non Training Progress Error!");
          new Error(err);
        },
      });
      this.getDeatilOfTargets()

    }
    closeModalDeletePayment(): void {  
      const editSessionModal = document.getElementById('exampleModalDeletePayment');
      if (editSessionModal) {
        const modalInstance = bootstrap.Modal.getInstance(editSessionModal);
        modalInstance.hide();   
       }
      }
       dataTable: any;
        reinitializeDataTableBulk() {
        if (this.dataTable) {
          this.dataTable.destroy();
        }
        setTimeout(() => {
          this.initializeDataTableBulk();
        }, 0);
      }
    
      initializeDataTableBulk() {
        this.dataTable = new DataTable('#view-Priliminary', {
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



      // travel anc TRansport
createFormTravel(): FormGroup {
    return this.fb.group({
      nonTrainingSubActivityId: [0, ],
      dateOfTravel: ['', Validators.required],
      purposeOfTravel: ['', Validators.required],
      modeOfTravel: ['', Validators.required],
      destination: ['', Validators.required],
      noOfPersonsTraveled:  [0, [Validators.required, Validators.min(0)]],
      amount: [0, [Validators.required, Validators.min(0), Validators.max(5000000)]],
      billNo: ['', Validators.required],
      billDate: ['', Validators.required],
      payeeName: ['', Validators.required],
      // accountNumber: ['', Validators.required],
      bank: ['', Validators.required],
      ifscCode: ['', [Validators.required, Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]],
      modeOfPayment: ['', Validators.required],
      transactionId: [''],
      purpose: ['', Validators.required],
      billInvoicePath: [''],
      checkNo: [''],
      checkDate: ['']
    });
  }

  get fTravel() {
    return this.travelForm.controls;
  }
 
  iseditModeTravel = false;
  TravelID:any
  openModelTravel(mode: string,item?: any): void {
    if (mode === 'add') {
      this.travelForm.reset();
      this.iseditModeTravel = false;
      this.resetForm();
    }
    if (mode === 'edit') {
      this.TravelID=item?.travelTransportId
      this.iseditModeTravel = true;
      this.modeOfPayment(item?.modeOfPayment);
      this.travelForm.patchValue({
        nonTrainingSubActivityId: item?.nonTrainingSubActivityId || 0,
        dateOfTravel: item?.dateOfTravel ? this.convertToISOFormat(item?.dateOfTravel) : '',
        purposeOfTravel: item?.purposeOfTravel || '',
        modeOfTravel: item?.modeOfTravel || '',
        destination: item?.destination || '',
        noOfPersonsTraveled: item?.noOfPersonsTraveled || 0,
        amount: item?.amount || 0,
        billNo: item?.billNo || '',
        billDate: item?.billDate ? this.convertToISOFormat(item?.billDate) : '',
        payeeName: item?.payeeName || '',
        // accountNumber: item?.accountNumber || '',
        bank: item?.bank || '',
        ifscCode: item?.ifscCode || '',
        modeOfPayment: item?.modeOfPayment || '',
        transactionId: item?.transactionId || '',
        purpose: item?.purpose || '',
        billInvoicePath: '',
        checkNo: item?.checkNo || '',
        checkDate: item?.checkDate ? this.convertToISOFormat(item.checkDate) : ''
      });
    }
    const modal1 = new bootstrap.Modal(document.getElementById('addTravel'));
    modal1.show();
  }
  getTravelData:any=[]
  onSubmitTravel(): void {
    this.isSubmitted = true;
     if (this.travelForm.valid) {
    if(this.iseditModeTravel){
        this.fTravel['nonTrainingSubActivityId'].setValue(Number(this.selectedBudgetHead));
        this._commonService.update(APIS.nontrainingtargets.updateNonTrainingtargetsTravel,{...this.travelForm.value,nonTrainingSubActivityId:Number(this.selectedBudgetHead),travelTransportId:this.TravelID},this.TravelID).subscribe((res: any) => {
          this.toastrService.success('Data Updated successfully','Non Training Progress Data Success!');
          
          console.log('Preliminary Data:', this.getTravelData);
          this.resetForm();
          this.isSubmitted = false;
          const modalElement = document.getElementById('addTravel');
          const modal1 = modalElement ? bootstrap.Modal.getInstance(modalElement) : null;
          if (modal1) {
            modal1.hide();
          }
           this.getDeatilOfTargets()
        
        }, (error) => {
           this.resetForm();
          this.isSubmitted = false;
          const modal1 = bootstrap.Modal.getInstance(document.getElementById('addTravel'));
          modal1.hide();
           this.getDeatilOfTargets()
          this.toastrService.error(error.message,"Non Training Progress Data Error!");
        });
       
    }
    else{
      console.log('Form Submitted:', this.travelForm.value);
        this.fTravel['nonTrainingSubActivityId'].setValue(Number(this.selectedBudgetHead));
         const formData = new FormData();
          formData.append("dto", JSON.stringify({...this.travelForm.value}));

          if (this.travelForm.value.billInvoicePath) {
            formData.append("file", this.uploadedFiles);
            }
        this._commonService.add(APIS.nontrainingtargets.saveNonTrainingtargetsTravel,formData).subscribe((res: any) => {
          this.toastrService.success('Data saved successfully','Non Training Progress Data Success!');
          this.getTravelData.push(res.data)
          this.resetForm();
          this.isSubmitted = false;
          const modal1 = bootstrap.Modal.getInstance(document.getElementById('addTravel'));
          modal1.hide();
           this.getDeatilOfTargets()
         
        
        }, (error) => {
          this.resetForm();
          this.isSubmitted = false;
           this.getDeatilOfTargets()
          const modal1 = bootstrap.Modal.getInstance(document.getElementById('addTravel'));
          modal1.hide();
          this.toastrService.error(error.message);
        });
       
    }
   
    }

  }
  deleteTravelID:any
  deleteTravel(id:any):void{
    this.deleteTravelID=id
     const previewModal = document.getElementById('exampleModalDeleteTravell');
    if (previewModal) {
      const modalInstance = new bootstrap.Modal(previewModal);
      modalInstance.show();
    }
  }
  ConfirmdeleteExpenditureTravel(item:any){
      this._commonService
      .deleteId(APIS.nontrainingtargets.deleteNonTrainingtargetsTravel,item).subscribe({
        next: (data: any) => {
          if(data?.status==400){
            this.toastrService.error(data?.message, "Non Training Progress Data Error!");
            this.closeModalDeleteTravel();

            this.deletePreliminaryID =''
          }
          else{
            // this.getBulkExpenditure()
            this.closeModalDeleteTravel();
            this.deletePreliminaryID =''
          this.toastrService.success( 'Record Deleted Successfully', "Non Training Progress Data Success!");
          }
          
        },
        error: (err) => {
          this.closeModalDeleteTravel();
          this.deletePreliminaryID =''
          this.toastrService.error(err.message, "Non Training Progress Error!");
          new Error(err);
        },
      });

    }
     closeModalDeleteTravel(): void {
      const editSessionModal = document.getElementById('exampleModalDeleteTravell');
      if (editSessionModal) {
        const modalInstance = bootstrap.Modal.getInstance(editSessionModal);
        modalInstance.hide();
      }
      this.getDeatilOfTargets()
    } 
  onFileSelectedTravel(event: any): void {
    this.uploadedFiles = null;
    const file = event.target.files[0];
    if (file) {
       this.uploadedFiles = file;
      // Handle file upload logic here
      // You might want to upload the file and then set the URL
      this.travelForm.patchValue({
        billInvoicePath: file.name // This would be the uploaded file URL
      });
    }
  }
  // onFileSelectedPayment(event: any): void {
  //   this.uploadedFiles = null;
  //   const file = event.target.files[0];
  //   if (file) {
  //      this.uploadedFiles = file;
  //     // Handle file upload logic here
  //     // You might want to upload the file and then set the URL
  //     this.paymentForm.patchValue({
  //       uploadBillUrl: file.name // This would be the uploaded file URL
  //     });
  //   }
  // }
   modeOfPayment(val:any){
      if(val=='CASH'){
        this.travelForm.get('bank')?.setValidators(null);
        this.travelForm.get('transactionId')?.setValidators(null);
        this.travelForm.get('ifscCode')?.setValidators(null);
        this.travelForm.get('checkNo')?.setValidators(null);
        this.travelForm.get('checkDate')?.setValidators(null);
        this.travelForm.get('bank')?.patchValue('');
        this.travelForm.get('transactionId')?.patchValue('');
        this.travelForm.get('ifscCode')?.patchValue('');
        this.travelForm.get('checkNo')?.patchValue('');
        this.travelForm.get('checkDate')?.patchValue('');
        this.travelForm.get('bank')?.clearValidators();
        this.travelForm.get('transactionId')?.clearValidators();
        this.travelForm.get('ifscCode')?.clearValidators();
        this.travelForm.get('checkNo')?.clearValidators();
        this.travelForm.get('checkDate')?.clearValidators();
        this.travelForm.get('bank')?.disable();
        this.travelForm.get('transactionId')?.disable();
        this.travelForm.get('ifscCode')?.disable();
        this.travelForm.get('checkNo')?.disable();
        this.travelForm.get('checkDate')?.disable();
      
        this.travelForm.get('bank')?.updateValueAndValidity();
        this.travelForm.get('transactionId')?.updateValueAndValidity();
        this.travelForm.get('ifscCode')?.updateValueAndValidity();
        this.travelForm.get('checkNo')?.updateValueAndValidity();
        this.travelForm.get('checkDate')?.updateValueAndValidity();
        this.travelForm.get('amount')?.setValidators([Validators.required, Validators.min(0), Validators.max(5000)]);
        this.travelForm.get('amount')?.updateValueAndValidity();

      }
      else if(val=='BANK_TRANSFER'){
        this.travelForm.get('bank')?.setValidators([Validators.required]);
        this.travelForm.get('transactionId')?.setValidators(null);
        this.travelForm.get('ifscCode')?.setValidators([Validators.required,Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]);
        this.travelForm.get('checkNo')?.setValidators(null);
        this.travelForm.get('checkDate')?.setValidators(null);
        this.travelForm.get('bank')?.enable();
        this.travelForm.get('transactionId')?.disable();
        this.travelForm.get('ifscCode')?.enable();
        this.travelForm.get('checkNo')?.disable();
        this.travelForm.get('checkDate')?.disable();
        this.travelForm.get('bank')?.patchValue('');
        this.travelForm.get('transactionId')?.patchValue('');
        this.travelForm.get('ifscCode')?.patchValue('');
        this.travelForm.get('checkNo')?.patchValue('');
        this.travelForm.get('checkDate')?.patchValue('');
        this.travelForm.get('bank')?.updateValueAndValidity();
        this.travelForm.get('transactionId')?.updateValueAndValidity();
        this.travelForm.get('ifscCode')?.updateValueAndValidity();
        this.travelForm.get('checkNo')?.updateValueAndValidity();
        this.travelForm.get('checkDate')?.updateValueAndValidity();
        this.travelForm.get('amount')?.setValidators([Validators.required, Validators.min(0)]);
        this.travelForm.get('amount')?.updateValueAndValidity();

      }
      else if(val=='UPI'){
        this.travelForm.get('bank')?.setValidators(null);
        this.travelForm.get('transactionId')?.setValidators([Validators.required,Validators.pattern(/^[^\s].*/)]);
        this.travelForm.get('ifscCode')?.setValidators(null);
        this.travelForm.get('checkNo')?.setValidators(null);
        this.travelForm.get('checkDate')?.setValidators(null);
        this.travelForm.get('bank')?.disable();
        this.travelForm.get('transactionId')?.enable();
        this.travelForm.get('ifscCode')?.disable();
        this.travelForm.get('checkNo')?.disable();
        this.travelForm.get('checkDate')?.disable();
        this.travelForm.get('bank')?.patchValue('');
        this.travelForm.get('transactionId')?.patchValue('');
        this.travelForm.get('ifscCode')?.patchValue('');
        this.travelForm.get('checkNo')?.patchValue('');
        this.travelForm.get('checkDate')?.patchValue('');

        this.travelForm.get('bank')?.updateValueAndValidity();
        this.travelForm.get('transactionId')?.updateValueAndValidity();
        this.travelForm.get('ifscCode')?.updateValueAndValidity();
        this.travelForm.get('checkNo')?.updateValueAndValidity();
        this.travelForm.get('checkDate')?.updateValueAndValidity();
        this.travelForm.get('amount')?.setValidators([Validators.required, Validators.min(0)]);
        this.travelForm.get('amount')?.updateValueAndValidity();

      }
       else if(val=='CHEQUE'){
        this.travelForm.get('bank')?.setValidators([Validators.required]);
        // this.travelForm.get('accountNumber')?.setValidators(null);
        this.travelForm.get('transactionId')?.setValidators(null);
        this.travelForm.get('ifscCode')?.setValidators(null);
        this.travelForm.get('checkNo')?.setValidators([Validators.required]);
        this.travelForm.get('checkDate')?.setValidators([Validators.required]);
        this.travelForm.get('bank')?.enable();
        // this.travelForm.get('accountNumber')?.disable();
        this.travelForm.get('transactionId')?.disable();
        this.travelForm.get('ifscCode')?.disable();
        this.travelForm.get('checkNo')?.enable();
        this.travelForm.get('checkDate')?.enable();
        this.travelForm.get('bank')?.patchValue('');
        this.travelForm.get('transactionId')?.patchValue('');
        this.travelForm.get('ifscCode')?.patchValue('');
        this.travelForm.get('checkNo')?.patchValue('');
        this.travelForm.get('checkDate')?.patchValue('');

        this.travelForm.get('bank')?.updateValueAndValidity();
        this.travelForm.get('transactionId')?.updateValueAndValidity();

        this.travelForm.get('ifscCode')?.updateValueAndValidity();
        this.travelForm.get('checkNo')?.updateValueAndValidity();
        this.travelForm.get('checkDate')?.updateValueAndValidity();
        this.travelForm.get('amount')?.setValidators([Validators.required, Validators.min(0)]);
        this.travelForm.get('amount')?.updateValueAndValidity();
      }
    }
      // Add consumables properties
  consumablesForm!: FormGroup;
  isEditModeConsumables = false;
  consumablesID: any;
  consumablesData: any[] = [];
  uploadedFileConsumables: any;

       // Add consumables form creation
  createConsumablesForm(): FormGroup {
    return this.fb.group({
      agencyId: [0],
      subActivityId: [0], 
      itemName: ['', Validators.required],
      purchaseDate: ['', Validators.required],
      purchasedQuantity: [0, [Validators.required, Validators.min(1)]],
      unitCost: [0, [Validators.required, Validators.min(0.01)]],
      consumedQuantity: [0, [Validators.required, Validators.min(0)]],
      availableQuantity: [0, [Validators.required, Validators.min(0)]],
      totalCost: [0, [Validators.required, Validators.min(0)]],
      billNo: ['', Validators.required],
      billDate: ['', Validators.required],
      modeOfPayment: ['BANK_TRANSFER', Validators.required],
      payeeName: ['', Validators.required],
      bankName: ['', Validators.required],
      ifscCode: ['', [Validators.required, Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]],
      transactionId: [''],
      checkNo: [''],
      checkDate: ['']
    });
  }

  get fConsumables() {
    return this.consumablesForm.controls;
  }

  // Calculate total cost and available quantity
  onQuantityChange(): void {
    const purchased = this.consumablesForm.get('purchasedQuantity')?.value || 0;
    const consumed = this.consumablesForm.get('consumedQuantity')?.value || 0;
    const unitCost = this.consumablesForm.get('unitCost')?.value || 0;

    const totalCost = purchased * unitCost;
    const availableQuantity = purchased - consumed;

    this.consumablesForm.patchValue({
      totalCost: totalCost,
      availableQuantity: availableQuantity >= 0 ? availableQuantity : 0
    });
  }

  // Update the openConsumablesModal method to include modeOfPayment handling
  openConsumablesModal(mode: string, item?: any): void {
    if (mode === 'add') {
      this.isEditModeConsumables = false;
      this.consumablesForm.reset();
      this.consumablesForm.patchValue({
        agencyId: Number(this.selectedAgencyId),
        subActivityId: Number(this.selectedBudgetHead),
        modeOfPayment: 'BANK_TRANSFER'
      });
      this.uploadedFileConsumables = null;
    }
    
    if (mode === 'edit') {
      this.isEditModeConsumables = true;
      this.consumablesID = item?.id;
      this.uploadedFileConsumables = item?.uploadedFilePath;
      this.modeOfPaymentConsumables(item?.modeOfPayment);
      
      this.consumablesForm.patchValue({
        agencyId: item?.agencyId || Number(this.selectedAgencyId),
        subActivityId: item?.subActivityId || Number(this.selectedBudgetHead),
        itemName: item?.itemName || '',
        purchaseDate: item?.purchaseDate ? this.convertToISOFormat(item?.purchaseDate) : '',
        purchasedQuantity: item?.purchasedQuantity || 0,
        unitCost: item?.unitCost || 0,
        consumedQuantity: item?.consumedQuantity || 0,
        availableQuantity: item?.availableQuantity || 0,
        totalCost: item?.totalCost || 0,
        billNo: item?.billNo || '',
        billDate: item?.billDate ? this.convertToISOFormat(item?.billDate) : '',
        modeOfPayment: item?.modeOfPayment || 'BANK_TRANSFER',
        payeeName: item?.payeeName || '',
        bankName: item?.bankName || '',
        ifscCode: item?.ifscCode || '',
        transactionId: item?.transactionId || '',
        checkNo: item?.checkNo || '',
        checkDate: item?.checkDate ? this.convertToISOFormat(item?.checkDate) : ''
      });
    }
    
    const modal = new bootstrap.Modal(document.getElementById('addConsumables'));
    modal.show();
  }

 

  // Submit consumables form
  onSubmitConsumables(): void {
    this.isSubmitted = true;
    
    if (this.consumablesForm.valid) {
      this.consumablesForm.patchValue({
        agencyId: Number(this.selectedAgencyId),
        subActivityId: Number(this.selectedBudgetHead)
      });

      const formData = new FormData();
      const dto = {
        ...this.consumablesForm.value
      };

      if (this.isEditModeConsumables) {
        dto.id = this.consumablesID;
      }

      formData.append('NonTrainingConsumablesBulkDto', JSON.stringify(dto));

      if (this.uploadedFileConsumables && typeof this.uploadedFileConsumables !== 'string') {
        formData.append('file', this.uploadedFileConsumables);
      }

      const apiCall = this.isEditModeConsumables 
        ? this._commonService.update(APIS.nontrainingtargets.code.updateCodeITData, formData, this.consumablesID)
        : this._commonService.add(APIS.nontrainingtargets.code.saveCodeITData, formData);

      apiCall.subscribe({
        next: (res: any) => {
          this.toastrService.success(
            `Consumable ${this.isEditModeConsumables ? 'updated' : 'saved'} successfully`,
            'Success!'
          );
          this.resetConsumablesForm();
          this.getConsumablesData();
          this.getDeatilOfTargets();
        },
        error: (error) => {
          this.toastrService.error(error.message || 'An error occurred', 'Error!');
          this.resetConsumablesForm();
        }
      });
    }
  }

  // Get consumables data
  getConsumablesData(): void {
    // Update this URL according to your API endpoint for fetching consumables
    this._commonService.getDataByUrl(APIS.nontrainingtargets.code.getCodeITData+this.selectedBudgetHead)
      .subscribe({
        next: (res: any) => {
          this.consumablesData = res.data || res;
           this.financialTargetAchievement=0
            this.consumablesData?.map((item:any)=>{
              this.financialTargetAchievement+=Number(item?.totalCost)
            })
        },
        error: (error) => {
          console.error('Error fetching consumables data:', error);
        }
      });
  }

  // Delete consumables
  deleteConsumables(id: any): void {
    this.consumablesID = id;
    const modal = new bootstrap.Modal(document.getElementById('deleteConsumablesModal'));
    modal.show();
  }

  confirmDeleteConsumables(): void {
    this._commonService.deleteId(APIS.nontrainingtargets.code.deleteCodeITData, this.consumablesID)
      .subscribe({
        next: (data: any) => {
          if (data?.status === 400) {
            this.toastrService.error(data?.message, 'Error!');
          } else {
            this.toastrService.success('Consumable deleted successfully', 'Success!');
            this.getConsumablesData();
            this.getDeatilOfTargets();
          }
          this.closeDeleteConsumablesModal();
        },
        error: (err) => {
          this.toastrService.error(err.message, 'Error!');
          this.closeDeleteConsumablesModal();
        }
      });
  }

  closeDeleteConsumablesModal(): void {
    const modal = document.getElementById('deleteConsumablesModal');
    if (modal) {
      const modalInstance = bootstrap.Modal.getInstance(modal);
      modalInstance?.hide();
    }
    this.consumablesID = '';
  }

  // Reset consumables form
  resetConsumablesForm(): void {
    this.consumablesForm.reset();
    this.isSubmitted = false;
    this.uploadedFileConsumables = null;
    
    const modal = document.getElementById('addConsumables');
    if (modal) {
      const modalInstance = bootstrap.Modal.getInstance(modal);
      modalInstance?.hide();
    }
  }

  // File selection for consumables
  onConsumablesFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.uploadedFileConsumables = file;
    }
  }

  // Remove consumables file
  removeConsumablesFile(): void {
    this.uploadedFileConsumables = null;
    const fileInput = document.getElementById('consumablesFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
  // Add this method for consumables mode of payment handling

  // Mode of payment handler for consumables
  modeOfPaymentConsumables(val: any): void {
    if (val == 'CASH') {
      this.consumablesForm.get('bankName')?.setValidators(null);
      this.consumablesForm.get('transactionId')?.setValidators(null);
      this.consumablesForm.get('ifscCode')?.setValidators(null);
      this.consumablesForm.get('checkNo')?.setValidators(null);
      this.consumablesForm.get('checkDate')?.setValidators(null);

      this.consumablesForm.get('bankName')?.patchValue('');
      this.consumablesForm.get('transactionId')?.patchValue('');
      this.consumablesForm.get('ifscCode')?.patchValue('');
      this.consumablesForm.get('checkNo')?.patchValue('');
      this.consumablesForm.get('checkDate')?.patchValue('');

      this.consumablesForm.get('bankName')?.clearValidators();
      this.consumablesForm.get('transactionId')?.clearValidators();
      this.consumablesForm.get('ifscCode')?.clearValidators();
      this.consumablesForm.get('checkNo')?.clearValidators();
      this.consumablesForm.get('checkDate')?.clearValidators();

      this.consumablesForm.get('bankName')?.disable();
      this.consumablesForm.get('transactionId')?.disable();
      this.consumablesForm.get('ifscCode')?.disable();
      this.consumablesForm.get('checkNo')?.disable();
      this.consumablesForm.get('checkDate')?.disable();

      this.consumablesForm.get('bankName')?.updateValueAndValidity();
      this.consumablesForm.get('transactionId')?.updateValueAndValidity();
      this.consumablesForm.get('ifscCode')?.updateValueAndValidity();
      this.consumablesForm.get('checkNo')?.updateValueAndValidity();
      this.consumablesForm.get('checkDate')?.updateValueAndValidity();
      this.consumablesForm.get('unitCost')?.setValidators([Validators.required, Validators.min(0), Validators.max(5000)]);
      this.consumablesForm.get('unitCost')?.updateValueAndValidity();
    }
    else if (val == 'BANK_TRANSFER') {
      this.consumablesForm.get('bankName')?.setValidators([Validators.required]);
      this.consumablesForm.get('transactionId')?.setValidators(null);
      this.consumablesForm.get('ifscCode')?.setValidators([Validators.required, Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]);
      this.consumablesForm.get('checkNo')?.setValidators(null);
      this.consumablesForm.get('checkDate')?.setValidators(null);

      this.consumablesForm.get('bankName')?.enable();
      this.consumablesForm.get('transactionId')?.disable();
      this.consumablesForm.get('ifscCode')?.enable();
      this.consumablesForm.get('checkNo')?.disable();
      this.consumablesForm.get('checkDate')?.disable();

      this.consumablesForm.get('bankName')?.patchValue('');
      this.consumablesForm.get('transactionId')?.patchValue('');
      this.consumablesForm.get('ifscCode')?.patchValue('');
      this.consumablesForm.get('checkNo')?.patchValue('');
      this.consumablesForm.get('checkDate')?.patchValue('');

      this.consumablesForm.get('bankName')?.updateValueAndValidity();
      this.consumablesForm.get('transactionId')?.updateValueAndValidity();
      this.consumablesForm.get('ifscCode')?.updateValueAndValidity();
      this.consumablesForm.get('checkNo')?.updateValueAndValidity();
      this.consumablesForm.get('checkDate')?.updateValueAndValidity();
      this.consumablesForm.get('unitCost')?.setValidators([Validators.required, Validators.min(0)]);
      this.consumablesForm.get('unitCost')?.updateValueAndValidity();
    }
    else if (val == 'UPI') {
      this.consumablesForm.get('bankName')?.setValidators(null);
      this.consumablesForm.get('transactionId')?.setValidators([Validators.required, Validators.pattern(/^[^\s].*/)]);
      this.consumablesForm.get('ifscCode')?.setValidators(null);
      this.consumablesForm.get('checkNo')?.setValidators(null);
      this.consumablesForm.get('checkDate')?.setValidators(null);

      this.consumablesForm.get('bankName')?.disable();
      this.consumablesForm.get('transactionId')?.enable();
      this.consumablesForm.get('ifscCode')?.disable();
      this.consumablesForm.get('checkNo')?.disable();
      this.consumablesForm.get('checkDate')?.disable();

      this.consumablesForm.get('bankName')?.patchValue('');
      this.consumablesForm.get('transactionId')?.patchValue('');
      this.consumablesForm.get('ifscCode')?.patchValue('');
      this.consumablesForm.get('checkNo')?.patchValue('');
      this.consumablesForm.get('checkDate')?.patchValue('');

      this.consumablesForm.get('bankName')?.updateValueAndValidity();
      this.consumablesForm.get('transactionId')?.updateValueAndValidity();
      this.consumablesForm.get('ifscCode')?.updateValueAndValidity();
      this.consumablesForm.get('checkNo')?.updateValueAndValidity();
      this.consumablesForm.get('checkDate')?.updateValueAndValidity();
      this.consumablesForm.get('unitCost')?.setValidators([Validators.required, Validators.min(0)]);
      this.consumablesForm.get('unitCost')?.updateValueAndValidity();
    }
    else if (val == 'CHEQUE') {
      this.consumablesForm.get('bankName')?.setValidators([Validators.required]);
      this.consumablesForm.get('transactionId')?.setValidators(null);
      this.consumablesForm.get('ifscCode')?.setValidators(null);
      this.consumablesForm.get('checkNo')?.setValidators([Validators.required]);
      this.consumablesForm.get('checkDate')?.setValidators([Validators.required]);

      this.consumablesForm.get('bankName')?.enable();
      this.consumablesForm.get('transactionId')?.disable();
      this.consumablesForm.get('ifscCode')?.disable();
      this.consumablesForm.get('checkNo')?.enable();
      this.consumablesForm.get('checkDate')?.enable();

      this.consumablesForm.get('bankName')?.patchValue('');
      this.consumablesForm.get('transactionId')?.patchValue('');
      this.consumablesForm.get('ifscCode')?.patchValue('');
      this.consumablesForm.get('checkNo')?.patchValue('');
      this.consumablesForm.get('checkDate')?.patchValue('');

      this.consumablesForm.get('bankName')?.updateValueAndValidity();
      this.consumablesForm.get('transactionId')?.updateValueAndValidity();
      this.consumablesForm.get('ifscCode')?.updateValueAndValidity();
      this.consumablesForm.get('checkNo')?.updateValueAndValidity();
      this.consumablesForm.get('checkDate')?.updateValueAndValidity();
      this.consumablesForm.get('unitCost')?.setValidators([Validators.required, Validators.min(0)]);
      this.consumablesForm.get('unitCost')?.updateValueAndValidity();
    }
  }


// Add transaction-related properties after consumables properties (around line 1327)
transactionForm!: FormGroup;
isEditModeTransaction = false;
// transactionID: any;
transactionData: any[] = [];
selectedBulkItem: any;

// Add transaction form creation method after createConsumablesForm (around line 1351)
createTransactionForm(): FormGroup {
  return this.fb.group({
    dateOfUtilisation: ['', Validators.required],
    quantityOfUtilisation: [0, [Validators.required, Validators.min(1)]],
    noOfTraineesUtilised: [0, [Validators.required, Validators.min(1)]],
    bulkId: [0, [Validators.required]]
  });
}

get fTransaction() {
  return this.transactionForm.controls;
}
transactionOfID:any
// Add transaction modal methods
openTransactionModal(mode: string, item?: any): void {
  if (mode === 'add') {
    this.isEditModeTransaction = false;
    this.transactionOfID = '';
    this.transactionForm.reset();
    this.transactionForm.patchValue({
      dateOfUtilisation: '',
      quantityOfUtilisation: 0,
      noOfTraineesUtilised: 0,
      bulkId: 0
    });
  }
  
  if (mode === 'edit') {
    this.isEditModeTransaction = true;
    this.transactionOfID = item?.id;
    this.transactionForm.patchValue({
       dateOfUtilisation: item?.dateOfUtilisation ? this.convertToISOFormat(moment(item?.dateOfUtilisation).format('DD-MM-YYYY') ) : '',
      quantityOfUtilisation: item?.quantityOfUtilisation,
      noOfTraineesUtilised: item?.noOfTraineesUtilised,
      bulkId: item?.bulkId
    });
    this.selectedBulkItem = this.consumablesData?.find(c => c.id == item?.bulkId);
  }
  
  const modal = new bootstrap.Modal(document.getElementById('addTransaction'));
  modal.show();
}

// Get selected consumable item name
getConsumableItemName(bulkId: any): string {
  const item = this.consumablesData?.find(c => c.id == bulkId);
  return item?.itemName || '';
}
getConsumableData(bulkId: any): string {
  const item = this.consumablesData?.find(c => c.id == bulkId);
  return item || '';
}

// Submit transaction form
onSubmitTransaction(): void {
  this.isSubmitted = true;
  
  if (this.transactionForm.valid) {
    const formData = {
      ...this.transactionForm.value,
      dateOfUtilisation: this.transactionForm.value.dateOfUtilisation 
        ? moment(this.transactionForm.value.dateOfUtilisation).format('DD-MM-YYYY') 
        : null
    };
    console.log('Submitting Transaction Form Data:', formData,this.transactionOfID);
    const apiCall = this.isEditModeTransaction
      ? this._commonService.update(`${APIS.nontrainingtargets.consumablesTransactions.update}`, formData, this.transactionOfID)
      : this._commonService.add(APIS.nontrainingtargets.consumablesTransactions.save, formData);

    apiCall.subscribe({
      next: (res: any) => {
        this.toastrService.success(
          this.isEditModeTransaction ? 'Transaction updated successfully!' : 'Transaction added successfully!'
        );
        this.getTransactionData();
        this.resetTransactionForm();
      },
      error: (err) => {
        this.toastrService.error('Error occurred while saving transaction');
      }
    });
  }
}

// Get transaction data
getTransactionData(): void {
  this._commonService.getDataByUrl(`${APIS.nontrainingtargets.consumablesTransactions.getBySubActivity}${this.selectedBudgetHead}`)
    .subscribe({
      next: (res: any) => {
        this.transactionData = res?.data || res || [];
      },
      error: (error) => {
        console.error('Error fetching transaction data:', error);
      }
    });
}

// Delete transaction
deleteTransaction(id: any): void {
  this.transactionOfID = id;
  const modal = new bootstrap.Modal(document.getElementById('deleteTransactionModal'));
  modal.show();
}

confirmDeleteTransaction(): void {
  this._commonService.deleteId(APIS.nontrainingtargets.consumablesTransactions.delete, this.transactionOfID)
    .subscribe({
      next: (data: any) => {
        this.toastrService.success('Transaction deleted successfully!');
        this.getTransactionData();
        this.closeDeleteTransactionModal();
      },
      error: (err) => {
        this.toastrService.error('Error occurred while deleting transaction');
      }
    });
}

closeDeleteTransactionModal(): void {
  const modal = document.getElementById('deleteTransactionModal');
  if (modal) {
    const bootstrapModal = bootstrap.Modal.getInstance(modal);
    if (bootstrapModal) bootstrapModal.hide();
  }
  this.transactionOfID = '';
}

// Reset transaction form
resetTransactionForm(): void {
  this.transactionForm.reset();
  this.isSubmitted = false;
  this.selectedBulkItem = null;
  
  const modal = document.getElementById('addTransaction');
  if (modal) {
    const bootstrapModal = bootstrap.Modal.getInstance(modal);
    if (bootstrapModal) bootstrapModal.hide();
  }
}


}
