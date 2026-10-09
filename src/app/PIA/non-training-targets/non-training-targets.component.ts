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
  selector: 'app-non-training-targets',
  templateUrl: './non-training-targets.component.html',
  styleUrls: ['./non-training-targets.component.css']
})
export class NonTrainingTargetsComponent implements OnInit {
  financialForm!: FormGroup;
  vendorForm!: FormGroup;
  paymentForm!: FormGroup;
   isSubmitted = false;
  loginsessionDetails: any;
  selectedAgencyId: any;
  typeOfHand: any='counselling';
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
        this.initializeVendorForm();

  }

  ngOnInit(): void {
     this.getBudgetHeadList()
     if (this.isRestrictedAgency) {
       this.getRichMilestonesList();
     }
  }
  get isRestrictedAgency(): boolean {
    const name = this.loginsessionDetails?.agencyName;
    return name === 'RICH_6A' || name === 'RICH_6B';
  }
  get isRich6A(): boolean {
    return this.loginsessionDetails?.agencyName === 'RICH_6A';
  }
  get isRich6B(): boolean {
    return this.loginsessionDetails?.agencyName === 'RICH_6B';
  }
  get isPhysicalReportBudget(): boolean {
    const s = String(this.selectedBudgetHead);
    return s === '71' || s === '68'
        || s === '157' || s === '158' || s === '151' || s === '152' || s === '153' || s === '156' || s === '162';
  }
  richMilestonesList: any[] = [];
  selectedRichMilestone: any = null;
  editingRowOriginalMilestoneId: any = null;
  editingRowOriginalAmount: number = 0;
  milestoneAmountCap: number | null = null;
  getRichMilestonesList() {
    this._commonService.getDataByUrl(APIS.nontrainingtargets.getRichMilestones).subscribe(
      (res: any) => {
        this.richMilestonesList = Array.isArray(res) ? res : (res?.data || []);
      },
      () => { this.richMilestonesList = []; }
    );
  }
  onRichMilestoneChange(id: any) {
    const numericId = Number(id);
    this.selectedRichMilestone = this.richMilestonesList.find(
      (m: any) => Number(m?.richMilestoneId) === numericId
    ) || null;
    if (this.financialForm.get('richMilestoneId')) {
      this.financialForm.get('richMilestoneId')?.setValue(numericId || null);
    }
    if (this.selectedRichMilestone) {
      const m = this.selectedRichMilestone;
      // Prefer explicit availableAmount; fall back to amount - consumedAmount.
      const base =
        m?.availableAmount != null
          ? Number(m.availableAmount) || 0
          : Math.max(0, (Number(m?.amount) || 0) - (Number(m?.consumedAmount) || 0));
      // On edit, if the row is still attached to the same milestone, credit back
      // this row's original amount so the user can update it up to the milestone's
      // true free balance.
      const creditBack =
        this.iseditMode &&
        this.editingRowOriginalMilestoneId != null &&
        Number(this.editingRowOriginalMilestoneId) === numericId
          ? Number(this.editingRowOriginalAmount) || 0
          : 0;
      this.milestoneAmountCap = base + creditBack;
    } else {
      this.milestoneAmountCap = null;
    }
    this.applyExpenditureAmountValidators();
  }
  private applyExpenditureAmountValidators() {
    const mode = this.financialForm?.get('modeOfPayment')?.value;
    const validators: any[] = [Validators.required, Validators.min(0)];
    let max: number | undefined;
    if (mode === 'CASH') max = 5000;
    if (this.milestoneAmountCap !== null && this.milestoneAmountCap !== undefined) {
      max = max !== undefined ? Math.min(max, this.milestoneAmountCap) : this.milestoneAmountCap;
    }
    if (max !== undefined) validators.push(Validators.max(max));
    const ctrl = this.financialForm?.get('expenditureAmount');
    if (ctrl) {
      ctrl.setValidators(validators);
      ctrl.updateValueAndValidity();
    }
  }
  private buildFinancialDto(): any {
    const { richMilestoneId, achievementDetails, ...rest } = this.financialForm.value;
    const dto: any = { ...rest };
    if (richMilestoneId) {
      dto.richMilestoneId = Number(richMilestoneId);
    }
    if (this.isPhysicalReportBudget) {
      dto.achievementDetails = achievementDetails || '';
    }
    return dto;
  }
  get selectedSubActivityName(): string {
    return this.SubActivityList?.find(
      (item: any) => String(item?.subActivityId) === String(this.selectedBudgetHead)
    )?.subActivityName || '';
  }
  private readonly rich6BAllowedSubActivities: string[] = [
    'Develop and Enhance MSME Green Dashboard and intergrate with Cluster level information',
    'Onboard and Conduct RECP Assessments across 2000 MSMEs',
    'Provide RECP studies-based implementation support to MSMEs and establish State-Level MSME Ecosystem for Clean Technology Adoption',
    'Preparation of Success Stories and project report'
  ];
  get showRestrictedTabCard(): boolean {
    const name = this.loginsessionDetails?.agencyName;
    if (name === 'RICH_6A') {
      // Show the expenditure card for every RICH_6A sub-activity except
      // the Submission of Inception Report (which has no expenditure flow).
      return (this.selectedSubActivityName || '').trim() !== 'Submission of Inception Report';
    }
    if (name === 'RICH_6B') {
      // Physical-report sub-activities render via the ALEAP-style card gated on
      // isPhysicalReportBudget — don't also show the restricted tab card for them.
      if (this.isPhysicalReportBudget) return false;
      const current = (this.selectedSubActivityName || '').trim();
      return this.rich6BAllowedSubActivities.some(allowed => allowed.trim() === current);
    }
    return false;
  }
  get showMilestoneSelector(): boolean {
    const name = this.loginsessionDetails?.agencyName;
    if (name === 'RICH_6B') {
      // On the physical-report sub-activities (157, 158, 151, 152, 153, 156) we only
      // want the plain expenditure flow — no milestone dropdown.
      if (this.isPhysicalReportBudget) return false;
      return true;
    }
    if (name === 'RICH_6A') {
      return (this.selectedSubActivityName || '').trim() !== 'Submission of Inception Report';
    }
    return false;
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
          if(this._commonService.getOption('subActivityId')){
          this.selectedActivity=this._commonService.getOption('subActivityId')?.split('-')[0]
        }
         this._commonService.getDataByUrl(APIS.nontrainingtargets.getSubActivityList+this.selectedActivity).subscribe((res: any) => {
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
    if(this._commonService.getOption('subActivityId')){
       this.selectedBudgetHead=this._commonService.getOption('subActivityId')?.split('-')[1]
       this._commonService.setOption('subActivityId',null)
    }
    this.applyRawMaterialValidators();

    if(this.selectedBudgetHead!='70'){
        if(this.selectedBudgetHead=='134'){
          this.typeOfHand='formalisationcompliance'
         }
          if(this.selectedBudgetHead=='135'){
          this.typeOfHand='govtschemeapplication'
         }
         if(this.selectedBudgetHead=='136'){
          this.typeOfHand='AccessToFinance'
         }
         if(this.selectedBudgetHead=='137'){
          this.typeOfHand='AccessToTechnologyAndInfrastructure'
         }
         if(this.selectedBudgetHead=='139'){
          this.typeOfHand='aleapdesignstudio'
         }
       this.getDeatilOfTargets()
    }
    else{
      this.typeOfHand='counselling'
        this.OnChangeTypeOfHand(this.typeOfHand)
    }
   
  }
  OnChangeTypeOfHand(event: any) {
    this.typeOfHand = event;
    this.getDeatilOfTargets()
  }
 TargetDetails: any;
    getDeatilOfTargets() {
        this.TargetDetails=[]
        this._commonService.getDataByUrl(APIS.nontrainingtargets.getNonTrainingtargets+this.selectedBudgetHead).subscribe((res: any) => {
          this.TargetDetails = res.data;
          this.physicalTarget = this.TargetDetails?.physicalTarget || 0;
          this.financialTarget = this.TargetDetails?.financialTarget || 0;
          this.physicalTargetAchievement = this.TargetDetails?.physicalTargetAchievement || 0;
          this.financialTargetAchievement = this.TargetDetails?.financialTargetAchievement || 0;
          if(this.selectedBudgetHead=='68' || this.selectedBudgetHead=='69' || this.selectedBudgetHead=='71' || this.selectedBudgetHead=='128'){
            this.getPreliminaryDataById()
            if(this.selectedBudgetHead=='69'){
               this.loadVendorData()
            }
          
          }
          else if(this.selectedBudgetHead=='72'){
            this.getResourceList()
            this.getContingencyDataById()
            this.getPaymentsDataById()
          }
          else{
            this.getResourceList()
            this.getContingencyDataById()
            this.getPaymentsDataById()
            this.getPreliminaryDataById()
            this.getTravelDataBySubActive()
          }

          
        }, (error) => {
            if(this.selectedBudgetHead=='68' || this.selectedBudgetHead=='69' || this.selectedBudgetHead=='71' || this.selectedBudgetHead=='128'){
            this.getPreliminaryDataById()
            if(this.selectedBudgetHead=='69'){
               this.loadVendorData()
            }

          }
          else if(this.selectedBudgetHead=='72'){
            this.getResourceList()
            this.getContingencyDataById()
            this.getPaymentsDataById()
          }
          else{
            this.getResourceList()
            this.getContingencyDataById()
            this.getPaymentsDataById()
            this.getPreliminaryDataById()
            this.getTravelDataBySubActive()
          }
          // this.toastrService.error(error.message);
        });
      }
      getPreliminaryDataById(){
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
       createForm(): FormGroup {
    return this.fb.group({
      agencyId: [0, ],
      nonTrainingSubActivityId: [0, ],
      nonTrainingActivityId: [0, ],
      category: ['',],
      paymentDate: ['', Validators.required],
      expenditureAmount: [0, [Validators.required, Validators.min(0) ,Validators.max(5000)]],
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
      richMilestoneId: [null],
      achievementDetails: [''],
    });
  }
  private applyRawMaterialValidators() {
    const ctrl = this.financialForm?.get('achievementDetails');
    if (!ctrl) return;
    if (this.isPhysicalReportBudget) {
      ctrl.setValidators([Validators.required]);
    } else {
      ctrl.clearValidators();
    }
    ctrl.updateValueAndValidity();
  }

  // addd by upendranath reddy for common file preview
  showFileViewer(filePath: string) {

    this._commonService.openFile(filePath);

  }
  downloadSupportDocument(filePath: string): void {
    if (!filePath) return;
    const trimmed = filePath.split('public_html/')[1];
    if (!trimmed) return;
    const encoded = trimmed.split('/').map(seg => encodeURIComponent(seg)).join('/');
    const fullUrl = `https://metaverseedu.in/${encoded}`;
    const fileName = trimmed.split('/').pop() || 'supporting-document';
    fetch(fullUrl)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.blob();
      })
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

   modeOfPaymentTravel(val:any){
      if(val=='CASH'){
        this.financialForm.get('bank')?.setValidators(null);
        this.financialForm.get('transactionId')?.setValidators(null);
        this.financialForm.get('ifscCode')?.setValidators(null);
        this.financialForm.get('bank')?.patchValue('');
        this.financialForm.get('transactionId')?.patchValue('');
        this.financialForm.get('ifscCode')?.patchValue('');
        this.financialForm.get('bank')?.clearValidators();
        this.financialForm.get('transactionId')?.clearValidators();
        this.financialForm.get('ifscCode')?.clearValidators();
        this.financialForm.get('bank')?.disable();
        this.financialForm.get('transactionId')?.disable();
        this.financialForm.get('ifscCode')?.disable();
      
        this.financialForm.get('bank')?.updateValueAndValidity();
        this.financialForm.get('transactionId')?.updateValueAndValidity();
        this.financialForm.get('ifscCode')?.updateValueAndValidity();
        this.travelForm.get('amount')?.setValidators([Validators.required, Validators.min(0), Validators.max(5000)]);
        this.travelForm.get('amount')?.updateValueAndValidity();
        this.travelForm.get('checkNo')?.clearValidators();
        this.travelForm.get('checkDate')?.clearValidators();
        this.travelForm.get('checkNo')?.disable();
        this.travelForm.get('checkDate')?.disable();
        this.travelForm.get('checkNo')?.patchValue('');
        this.travelForm.get('checkDate')?.patchValue('');
        this.travelForm.get('checkNo')?.updateValueAndValidity();
        this.travelForm.get('checkDate')?.updateValueAndValidity();

      }
      else if(val=='BANK_TRANSFER'){
        this.financialForm.get('bank')?.setValidators([Validators.required]);
        this.financialForm.get('transactionId')?.setValidators(null);
        this.financialForm.get('ifscCode')?.setValidators([Validators.required,Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]);
        this.financialForm.get('bank')?.enable();
        this.financialForm.get('transactionId')?.disable();
        this.financialForm.get('ifscCode')?.enable();
        this.financialForm.get('bank')?.patchValue('');
        this.financialForm.get('transactionId')?.patchValue('');
        this.financialForm.get('ifscCode')?.patchValue('');
        this.financialForm.get('bank')?.updateValueAndValidity();
        this.financialForm.get('transactionId')?.updateValueAndValidity();
        this.financialForm.get('ifscCode')?.updateValueAndValidity();
        this.travelForm.get('amount')?.setValidators([Validators.required, Validators.min(0)]);
        this.travelForm.get('amount')?.updateValueAndValidity();
        this.travelForm.get('checkNo')?.clearValidators();
        this.travelForm.get('checkDate')?.clearValidators();
        this.travelForm.get('checkNo')?.disable();
        this.travelForm.get('checkDate')?.disable();
        this.travelForm.get('checkNo')?.patchValue('');
        this.travelForm.get('checkDate')?.patchValue('');
        this.travelForm.get('checkNo')?.updateValueAndValidity();
        this.travelForm.get('checkDate')?.updateValueAndValidity();

      }
      else if(val=='UPI'){
        this.financialForm.get('bank')?.setValidators(null);
        this.financialForm.get('transactionId')?.setValidators([Validators.required,Validators.pattern(/^[^\s].*/)]);
        this.financialForm.get('ifscCode')?.setValidators(null);
        this.financialForm.get('bank')?.disable();
        this.financialForm.get('transactionId')?.enable();
        this.financialForm.get('ifscCode')?.disable();
        this.financialForm.get('bank')?.patchValue('');
        this.financialForm.get('transactionId')?.patchValue('');
        this.financialForm.get('ifscCode')?.patchValue('');
         
        this.financialForm.get('bank')?.updateValueAndValidity();
        this.financialForm.get('transactionId')?.updateValueAndValidity();
        this.financialForm.get('ifscCode')?.updateValueAndValidity();
        this.travelForm.get('amount')?.setValidators([Validators.required, Validators.min(0)]);
        this.travelForm.get('amount')?.updateValueAndValidity();
        this.travelForm.get('checkNo')?.clearValidators();
        this.travelForm.get('checkDate')?.clearValidators();
        this.travelForm.get('checkNo')?.disable();
        this.travelForm.get('checkDate')?.disable();
        this.travelForm.get('checkNo')?.patchValue('');
        this.travelForm.get('checkDate')?.patchValue('');
        this.travelForm.get('checkNo')?.updateValueAndValidity();
        this.travelForm.get('checkDate')?.updateValueAndValidity();

      }
       else if(val=='CHEQUE'){
        this.financialForm.get('bank')?.setValidators(null);
        this.financialForm.get('transactionId')?.setValidators(null);
        this.financialForm.get('ifscCode')?.setValidators(null);
        this.financialForm.get('bank')?.enable();
        this.financialForm.get('transactionId')?.enable();
        this.financialForm.get('ifscCode')?.enable();
        this.financialForm.get('bank')?.patchValue('');
        this.financialForm.get('transactionId')?.patchValue('');
        this.financialForm.get('ifscCode')?.patchValue('');
        
        this.financialForm.get('bank')?.updateValueAndValidity();
        this.financialForm.get('transactionId')?.updateValueAndValidity();

        this.financialForm.get('ifscCode')?.updateValueAndValidity();
        this.travelForm.get('amount')?.setValidators([Validators.required, Validators.min(0)]);
        this.travelForm.get('amount')?.updateValueAndValidity();
        this.travelForm.get('checkNo')?.setValidators([Validators.required]);
        this.travelForm.get('checkDate')?.setValidators([Validators.required]);
        this.travelForm.get('checkNo')?.enable();
        this.travelForm.get('checkDate')?.enable();
        this.travelForm.get('checkNo')?.patchValue('');
        this.travelForm.get('checkDate')?.patchValue('');
        this.travelForm.get('checkNo')?.updateValueAndValidity();
        this.travelForm.get('checkDate')?.updateValueAndValidity();
      }
    }

  

  get f() {
    return this.financialForm.controls;
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
  iseditMode = false;
  preliminaryID:any
    // Add this property to track existing files
  existingFileName: string = '';

openModel(mode: string, item?: any): void {
   setTimeout(() => {
       const fileInput = document.getElementById('files') as HTMLInputElement;
       if (fileInput) {
         fileInput.value = '';
       }
     }, 10);
   if (mode === 'add') {
        this.uploadedFilesFinance=null
      this.financialForm.reset();
      this.iseditMode = false;
      this.editingRowOriginalMilestoneId = null;
      this.editingRowOriginalAmount = 0;
      this.selectedRichMilestone = null;
      this.milestoneAmountCap = null;
      this.resetForm();
      this.applyExpenditureAmountValidators();
    }
    if (mode === 'edit') {
      this.preliminaryID=item?.id
      this.iseditMode = true;
      this.editingRowOriginalMilestoneId = item?.richMilestoneId ?? null;
      this.editingRowOriginalAmount = Number(item?.expenditureAmount) || 0;
      this.modeOfPaymentIt(item?.modeOfPayment);
      this.uploadedFilesFinance=item?.uploadBillUrl
      this.uploadedSupportingDoc = item?.supportDocumentUrl || null;

    // Create a copy of the form values WITHOUT the file input
    const formValues = {...item};

    // Convert dates to ISO format for the date inputs
    if (formValues.paymentDate) formValues.paymentDate = this.convertToISOFormat(formValues.paymentDate);
    if (formValues.billDate) formValues.billDate = this.convertToISOFormat(formValues.billDate);

    // Remove the file property to avoid the error
    delete formValues.uploadBillUrl;

    // Set form values without the file
    this.financialForm.patchValue(formValues);

    // Store the filename separately
    this.existingFileName = item?.uploadBillUrl || '';

    // Re-apply milestone cap now that richMilestoneId is patched in.
    if (item?.richMilestoneId) {
      this.onRichMilestoneChange(item.richMilestoneId);
    }
  }
  
  const modal1 = new bootstrap.Modal(document.getElementById('addSurvey'));
  modal1.show();
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
  
         this._commonService.update(
        APIS.nontrainingtargets.updateNonTrainingtargetsAleapPriliminary,
        formData,
        this.preliminaryID
      ).subscribe({
        next: (res: any) => {
          this.toastrService.success('Data Updated successfully', 'Non Training Progress Data Success!');
          this.getPreliminaryDataById();
          this.resetForm();
          this.isSubmitted = false;
          const modalElement = document.getElementById('addSurvey');
          const modal1 = modalElement ? bootstrap.Modal.getInstance(modalElement) : null;
          if (modal1) {
            modal1.hide();
          }
          this.existingFileName = ''; // Reset the filename after successful update
        },
        error: (error) => {
          this.resetForm();
          this.isSubmitted = false;
          const modal1 = bootstrap.Modal.getInstance(document.getElementById('addSurvey'));
          modal1.hide();
          this.toastrService.error(error.message, "Non Training Progress Data Error!");
        }
      });
      
      this.getDeatilOfTargets()
     }
     else{
       this.f['agencyId'].setValue(Number(this.selectedAgencyId));
         this.f['nonTrainingSubActivityId'].setValue(Number(this.selectedBudgetHead));
         this.f['nonTrainingActivityId'].setValue(Number(this.selectedActivity));
          const formData = new FormData();
           formData.append("dto", JSON.stringify(this.buildFinancialDto()));

           if (this.uploadedFilesFinance) {
             formData.append("file", this.uploadedFilesFinance);
             }
           if (this.uploadedSupportingDoc) {
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
         this.getDeatilOfTargets()
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
            this.deletePreliminaryID =''
           this.getPreliminaryDataById()

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
      this.getDeatilOfTargets()
    } 
    uploadedFiles:any
  uploadedFilesFinance: any ;
  onFileSelected(event: any): void {
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
  uploadedSupportingDoc: any;
  onSupportingDocSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.uploadedSupportingDoc = file;
    }
  }
  removeSupportingDoc(): void {
    this.uploadedSupportingDoc = null;
  }
   removeFilePayment(): void {
    this.uploadedFilesPayment = null;
    const fileInput = document.getElementById('paymentFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
//  onFileSelectedPayment(event: any): void {
//     this.uploadedFiles = null;
//     const file = event.target.files[0];
//     if (file) {
//        this.uploadedFiles = file;
//       // Handle file upload logic here
//       // You might want to upload the file and then set the URL
//       this.paymentForm.patchValue({
//         uploadBillUrl: file.name // This would be the uploaded file URL
//       });
//     }
//   }
  resetForm(): void {
     const modalElement = document.getElementById('addSurvey');
          const modal1 = modalElement ? bootstrap.Modal.getInstance(modalElement) : null;
          if (modal1) {
            modal1.hide();
          }
    this.isSubmitted = false;
  }

  // Contingency fund
   designations = [
    { value: 'CEO', label: 'CEO' },
    { value: 'Project Manager', label: 'Project Manager' },
    { value: 'Designer', label: 'Designer' },
    { value: 'Developer', label: 'Developer' },
    { value: 'Analyst', label: 'Analyst' }
  ];
   contingencyForm!: FormGroup;
     createFormContingency(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      designation: ['', Validators.required],
      relevantExperience: [0, [Validators.required, Validators.min(0), Validators.max(50)]],
      educationalQualification: ['', Validators.required],
      dateOfJoining: ['', Validators.required],
      monthlySal: [0, [Validators.required, Validators.min(0), Validators.max(5000)]],
      bankName: ['', Validators.required],
      ifscCode: ['', [Validators.required, Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]],
      accountNo: ['', [Validators.required]]
    });
  }

   modeOfPaymentIt(val:any){
        if(val=='CASH'){
          this.financialForm.get('bankName')?.setValidators(null);
          this.financialForm.get('accountNumber')?.setValidators(null);
          this.financialForm.get('transactionId')?.setValidators(null);
          this.financialForm.get('ifscCode')?.setValidators(null);
          this.financialForm.get('bankName')?.patchValue('');
          this.financialForm.get('accountNumber')?.patchValue('');
          this.financialForm.get('transactionId')?.patchValue('');
          this.financialForm.get('ifscCode')?.patchValue('');
          this.financialForm.get('bankName')?.clearValidators();
          this.financialForm.get('accountNumber')?.clearValidators();
          this.financialForm.get('transactionId')?.clearValidators();
          this.financialForm.get('ifscCode')?.clearValidators();
          this.financialForm.get('bankName')?.disable();
          this.financialForm.get('accountNumber')?.disable();
          this.financialForm.get('transactionId')?.disable();
          this.financialForm.get('ifscCode')?.disable();
        
          this.financialForm.get('bankName')?.updateValueAndValidity();
          this.financialForm.get('accountNumber')?.updateValueAndValidity();
          this.financialForm.get('transactionId')?.updateValueAndValidity();
          this.financialForm.get('ifscCode')?.updateValueAndValidity();
          this.financialForm.get('expenditureAmount')?.setValidators([Validators.required, Validators.min(0), Validators.max(5000)]);
          this.financialForm.get('expenditureAmount')?.updateValueAndValidity();
          this.financialForm.get('checkNo')?.clearValidators();
          this.financialForm.get('checkDate')?.clearValidators();
          this.financialForm.get('checkNo')?.patchValue('');
          this.financialForm.get('checkDate')?.patchValue('');
          this.financialForm.get('checkNo')?.disable();
          this.financialForm.get('checkDate')?.disable();
          this.financialForm.get('checkNo')?.updateValueAndValidity();
          this.financialForm.get('checkDate')?.updateValueAndValidity();

        }
        else if(val=='BANK_TRANSFER'){
          this.financialForm.get('bankName')?.setValidators([Validators.required]);
          this.financialForm.get('accountNumber')?.setValidators([Validators.required]);
          this.financialForm.get('transactionId')?.setValidators(null);
          this.financialForm.get('ifscCode')?.setValidators([Validators.required,Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]);
          this.financialForm.get('bankName')?.enable();
          this.financialForm.get('accountNumber')?.enable();
          this.financialForm.get('transactionId')?.disable();
          this.financialForm.get('ifscCode')?.enable();
          this.financialForm.get('bankName')?.patchValue('');
          this.financialForm.get('accountNumber')?.patchValue('');
          this.financialForm.get('transactionId')?.patchValue('');
          this.financialForm.get('ifscCode')?.patchValue('');
          this.financialForm.get('bankName')?.updateValueAndValidity();
          this.financialForm.get('accountNumber')?.updateValueAndValidity();
          this.financialForm.get('transactionId')?.updateValueAndValidity();
          this.financialForm.get('ifscCode')?.updateValueAndValidity();
          this.financialForm.get('expenditureAmount')?.setValidators([Validators.required, Validators.min(0)]);
          this.financialForm.get('expenditureAmount')?.updateValueAndValidity();
          this.financialForm.get('checkNo')?.clearValidators();
          this.financialForm.get('checkDate')?.clearValidators();
          this.financialForm.get('checkNo')?.patchValue('');
          this.financialForm.get('checkDate')?.patchValue('');
          this.financialForm.get('checkNo')?.disable();
          this.financialForm.get('checkDate')?.disable();
          this.financialForm.get('checkNo')?.updateValueAndValidity();
          this.financialForm.get('checkDate')?.updateValueAndValidity();

        }
        else if(val=='UPI'){
          this.financialForm.get('bankName')?.setValidators(null);
          this.financialForm.get('accountNumber')?.setValidators(null);
          this.financialForm.get('transactionId')?.setValidators([Validators.required,Validators.pattern(/^[^\s].*/)]);
          this.financialForm.get('ifscCode')?.setValidators(null);
          this.financialForm.get('bankName')?.disable();
          this.financialForm.get('accountNumber')?.disable();
          this.financialForm.get('transactionId')?.enable();
          this.financialForm.get('ifscCode')?.disable();
          this.financialForm.get('bankName')?.patchValue('');
          this.financialForm.get('accountNumber')?.patchValue('');
          this.financialForm.get('transactionId')?.patchValue('');
          this.financialForm.get('ifscCode')?.patchValue('');
           
          this.financialForm.get('bankName')?.updateValueAndValidity();
          this.financialForm.get('accountNumber')?.updateValueAndValidity();
          this.financialForm.get('transactionId')?.updateValueAndValidity();
          this.financialForm.get('ifscCode')?.updateValueAndValidity();
          this.financialForm.get('expenditureAmount')?.setValidators([Validators.required, Validators.min(0)]);
          this.financialForm.get('expenditureAmount')?.updateValueAndValidity();
          this.financialForm.get('checkNo')?.clearValidators();
          this.financialForm.get('checkDate')?.clearValidators();
          this.financialForm.get('checkNo')?.patchValue('');
          this.financialForm.get('checkDate')?.patchValue('');
          this.financialForm.get('checkNo')?.disable();
          this.financialForm.get('checkDate')?.disable();
          this.financialForm.get('checkNo')?.updateValueAndValidity();
          this.financialForm.get('checkDate')?.updateValueAndValidity();

        }
         else if(val=='CHEQUE'){
          this.financialForm.get('bankName')?.setValidators(null);
          this.financialForm.get('accountNumber')?.setValidators(null);
          this.financialForm.get('transactionId')?.setValidators(null);
          this.financialForm.get('ifscCode')?.setValidators(Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/));
          this.financialForm.get('bankName')?.enable();
          this.financialForm.get('accountNumber')?.enable();
          this.financialForm.get('transactionId')?.enable();
          this.financialForm.get('ifscCode')?.enable();
          this.financialForm.get('bankName')?.patchValue('');
          this.financialForm.get('accountNumber')?.patchValue('');
          this.financialForm.get('transactionId')?.patchValue('');
          this.financialForm.get('ifscCode')?.patchValue('');

          this.financialForm.get('bankName')?.updateValueAndValidity();
          this.financialForm.get('accountNumber')?.updateValueAndValidity();
          this.financialForm.get('transactionId')?.updateValueAndValidity();
          this.financialForm.get('ifscCode')?.updateValueAndValidity();
          this.financialForm.get('expenditureAmount')?.setValidators([Validators.required, Validators.min(0)]);
          this.financialForm.get('expenditureAmount')?.updateValueAndValidity();
          this.financialForm.get('checkNo')?.setValidators([Validators.required]);
          this.financialForm.get('checkDate')?.setValidators([Validators.required]);
          this.financialForm.get('checkNo')?.enable();
          this.financialForm.get('checkDate')?.enable();
          this.financialForm.get('checkNo')?.patchValue('');
          this.financialForm.get('checkDate')?.patchValue('');
          this.financialForm.get('checkNo')?.updateValueAndValidity();
          this.financialForm.get('checkDate')?.updateValueAndValidity();
        }
        // Re-apply amount validators so milestone cap (if any) survives mode-switch.
        this.applyExpenditureAmountValidators();
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
    }
    if (mode === 'edit') {
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
     this.getDeatilOfTargets()
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
      this.getDeatilOfTargets()

    }
  closeModalDeleteContinuty(): void {
      const editSessionModal = document.getElementById('exampleModalDeleteContinuty');
      if (editSessionModal) {
        const modalInstance = bootstrap.Modal.getInstance(editSessionModal);
        modalInstance.hide();
      }
    }

// paymenr 
  iseditModePayment = false;
  paymentID:any
 uploadedFilesPayment: any;
  
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
  // Update onSubmitPayment method
  onSubmitPayment(): void {
      this.isSubmitted = true;
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
  onResourceChange(event:any,list:any){
    const selectedResource = list.find((item: any) => item.resourceId == event);
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
      amount: [0, [Validators.required, Validators.min(0), Validators.max(5000)]],
      paymentForMonth: ['',],
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
  paymentForMonth: any = "";
  onChangeDate(event:any){
    this.paymentForm.patchValue({paymentForMonth: moment(event.value).format('MM-YYYY')
    });
   this.paymentForMonth= event.value ? moment(event.value).format('MM-YYYY') : '';
    setTimeout(() => {
        this.monthlyRange.setValue( this.paymentForMonth);
      }, 0);
  }
  // onSubmitPayment(): void {
  //     this.isSubmitted = true;
  //     if (this.paymentForm.valid) {
        
  //        if(this.iseditModePayment){
  //         const formData: any = {
  //         nonTrainingResourceExpenditureId: 0, // Generated by backend
  //         amount: this.paymentForm.value.amount,
  //         paymentForMonth: this.paymentForm.value.paymentForMonth,
  //         dateOfPayment: this.paymentForm.value.dateOfPayment,
  //         uploadBillUrl: this.paymentForm.value.uploadBillUrl,
  //         resourceId: Number(this.paymentForm.value.resourceId)
  //       };
  //         this._commonService.update(APIS.nontrainingtargets.updateNonTrainingtargetsAleapContingencyPayment,{...formData},this.paymentID).subscribe((res: any) => {
  //           this.toastrService.success('payments Updated successfully','Non Training Progress Data Success!');
            
            
  //           this.isSubmitted = false;
  //           const modal1 = bootstrap.Modal.getInstance(document.getElementById('addPayment'));
  //           modal1.hide();
  //            document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
          
  //         }, (error) => {
  //           //  this.resetForm();
  //           this.isSubmitted = false;
  //           const modal1 = bootstrap.Modal.getInstance(document.getElementById('addPayment'));
  //           modal1.hide();
  //            document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
  //           this.toastrService.error(error.message,"Non Training Progress Data Error!");
  //         });
  //     }
  //     else{
  //       const formData = new FormData();
  //           formData.append("expenditureDto", JSON.stringify({
  //           nonTrainingResourceExpenditureId: 0, // Generated by backend
  //         amount: this.paymentForm.value.amount,
  //         paymentForMonth: this.paymentForm.value.paymentForMonth,
  //         dateOfPayment: this.paymentForm.value.dateOfPayment,
  //         resourceId: Number(this.paymentForm.value.resourceId)}));
  
  //           if (this.paymentForm.value.uploadBillUrl) {
  //             formData.append("file", this.uploadedFiles);
  //             }
  //         this._commonService.add(APIS.nontrainingtargets.saveNonTrainingtargetsAleapContingencyPayment,formData).subscribe((res: any) => {
  //           this.toastrService.success('Payments saved successfully','Non Training Progress Data Success!');
  //           this.isSubmitted = false;
  //           const modal1 = bootstrap.Modal.getInstance(document.getElementById('addPayment'));
  //           modal1.hide();
  //            document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
           
          
  //         }, (error) => {
         
  //           this.isSubmitted = false;
  //           const modal1 = bootstrap.Modal.getInstance(document.getElementById('addPayment'));
  //           modal1.hide();
  //            document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
  //           this.toastrService.error(error.message);
  //         });
  //     }
  //    setTimeout(() => {
  //       this.getDeatilOfTargets()
  //    }, 500);
      
  //       // console.log('Form Data:', formData);
  //       // Call your API service here
  //       // this.paymentService.createPayment(formData).subscribe(...);
        
      
  //     }
  //   }
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

   // Initialize Vendor Form
   initializeVendorForm() {
     this.vendorForm = this.fb.group({
       vendorId: [0],
       vendorCompanyName: ['', [Validators.required, Validators.minLength(2)]],
       dateOfOrder: ['', Validators.required],
       orderDetails: ['', [Validators.required, Validators.minLength(10)]],
       orderUpload: [''],
       DummyorderUpload: [''],
       subActivityId: [0]
     });
   }
   isEditModeVendor = false;
   getVendorData: any[] = [];
   deleteVendorID: any = null;
   uploadedFilesVendor: any;
   // Getter for vendor form controls
   get fVendor() {
     return this.vendorForm.controls;
   }
   // Open Vendor Modal
   openVendorModal(mode: string, data?: any) {
     this.uploadedFilesVendor = '';
     this.isEditModeVendor = mode === 'edit';
     this.isSubmitted = false;
     
     if (mode === 'edit' && data) {
       this.vendorForm.patchValue({
         vendorId: data.vendorId,
         vendorCompanyName: data.vendorCompanyName,
         dateOfOrder: data.dateOfOrder ? new Date(data.dateOfOrder).toISOString().split('T')[0] : '',
         orderDetails: data.orderDetails,
         subActivityId: data.subActivityId,
         orderUpload: data.orderUpload,
         DummyorderUpload: '',
       });
     } else {
       this.resetVendorForm();
     }
   
     // Open modal using Bootstrap
     const modalElement = document.getElementById('addVendor');
     if (modalElement) {
       const modal = new (window as any).bootstrap.Modal(modalElement);
       modal.show();
     }
   }
   // Submit Vendor Form
   onSubmitVendor() {
     this.isSubmitted = true;
     
     if (this.vendorForm.invalid) {
       return;
     }
   
     const vendorData = { ...this.vendorForm.value };
     
     // Set subActivityId to current selected budget head
     vendorData.subActivityId = parseInt(this.selectedBudgetHead);
     
     // Convert date to ISO string
     if (vendorData.dateOfOrder) {
       vendorData.dateOfOrder = new Date(vendorData.dateOfOrder).toISOString();
     }
   
     if (this.isEditModeVendor) {
       this.updateVendor(vendorData);
     } else {
       this.createVendor(vendorData);
     }
   }
   onOrderUploadSelected(event: any): void {
     this.uploadedFilesVendor = '';
     const file = event.target.files[0];
     if (file) {
       this.uploadedFilesVendor = file;
       // Handle file upload logic here
       // You might want to upload the file and then set the URL
       this.vendorForm.patchValue({
         DummyorderUpload: file.name // This would be the uploaded file URL
       });
     }
   }
   // Create Vendor
   createVendor(vendorData: any) {
     let formdata = new FormData();
     formdata.append("file", this.uploadedFilesVendor);
     delete vendorData.DummyorderUpload;
     formdata.append("vendorDetailsDto", JSON.stringify(vendorData));
     
     this._commonService.add(APIS.nontrainingtargets.nimsme.savedataVendor_doc, formdata).subscribe({
       next: (response) => {
         this.uploadedFilesVendor = '';
         this.toastrService.success('Vendor details created successfully', 'Non Training Progress Data Success!');
         this.loadVendorData();
         this.closeVendorModal();
       },
       error: (error) => {
         this.uploadedFilesVendor = '';
         this.toastrService.error('Failed to create vendor details', 'Non Training Progress Data Error!');
         console.error('Create vendor error:', error);
         this.closeVendorModal();
       }
     });
     this.getDeatilOfTargets();
   }
   // Update Vendor
   updateVendor(vendorData: any) {
     this._commonService.update(APIS.nontrainingtargets.nimsme.updatedataVendor_doc, vendorData, vendorData.vendorId).subscribe({
       next: (response) => {
         this.toastrService.success('Vendor details updated successfully', 'Non Training Progress Data Success!');
         this.loadVendorData();
         this.closeVendorModal();
       },
       error: (error) => {
         this.toastrService.error('Failed to update vendor details', 'Non Training Progress Data Error!');
         console.error('Update vendor error:', error);
         this.closeVendorModal();
       }
     });
     this.getDeatilOfTargets();
   }
   // Load Vendor Data
   loadVendorData() {
     // Only load vendor data for selectedBudgetHead 79, 80, 81
   
     this._commonService.getDataByUrl(APIS.nontrainingtargets.nimsme.getdataVendor_doc + this.selectedBudgetHead).subscribe({
       next: (response) => {
         this.getVendorData = response.data || [];
       },
       error: (error) => {
         this.toastrService.error('Failed to load vendor details', 'Non Training Progress Data Error!');
         console.error('Load vendor data error:', error);
       }
     });
   }
   // Delete Vendor
   deleteVendor(id: any) {
     this.deleteVendorID = id;
     const modalElement = document.getElementById('exampleModalDeleteVendor');
     if (modalElement) {
       const modal = new (window as any).bootstrap.Modal(modalElement);
       modal.show();
     }
   }
   
   // Confirm Delete Vendor
   confirmDeleteVendor(id: any) {
     this._commonService.deleteId(APIS.nontrainingtargets.nimsme.deletedataMedia_doc, id).subscribe({
       next: (response) => {
         this.toastrService.success('Vendor details deleted successfully', 'Non Training Progress Data Success!');
         this.loadVendorData();
         this.closeVendorDeleteModal();
       },
       error: (error) => {
         this.toastrService.error('Failed to delete vendor details', 'Non Training Progress Data Error!');
         this.loadVendorData();
         this.closeVendorDeleteModal();
         console.error('Delete vendor data error:', error);
       }
     });
     this.getDeatilOfTargets();
   }
   // Reset Vendor Form
   resetVendorForm() {
     this.uploadedFilesVendor = '';
     this.vendorForm.reset();
     this.isSubmitted = false;
     this.isEditModeVendor = false;
     
     // Reset form with default values
     this.vendorForm.patchValue({
       vendorId: 0,
       vendorCompanyName: '',
       dateOfOrder: '',
       orderDetails: '',
       subActivityId: parseInt(this.selectedBudgetHead || '0')
     });
     
     // Reset form validation
     Object.keys(this.fVendor).forEach(key => {
       this.fVendor[key].markAsUntouched();
       this.fVendor[key].markAsPristine();
     });
   }
   
   // Close Vendor Modal
   closeVendorModal() {
     const modalElement = document.getElementById('addVendor');
     if (modalElement) {
       const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
       modal?.hide();
     }
     this.resetVendorForm();
   }
   
   // Close Vendor Delete Modal
   closeVendorDeleteModal(): void {
     document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
     const deleteVendorModal = document.getElementById('exampleModalDeleteVendor');
     if (deleteVendorModal) {
       const modalInstance = bootstrap.Modal.getInstance(deleteVendorModal);
       modalInstance.hide();
     }
   }
   
   // Check if current budget head supports vendor management
   isVendorBudgetHead(): boolean {
     return ['79', '80', '81'].includes(this.selectedBudgetHead);
   }


    // travel anc TRansport
      travelForm!: FormGroup;
   createFormTravel(): FormGroup {
       return this.fb.group({
         nonTrainingSubActivityId: [0, ],
         dateOfTravel: ['', Validators.required],
         purposeOfTravel: ['', Validators.required],
         modeOfTravel: ['', Validators.required],
         destination: ['', Validators.required],
         noOfPersonsTraveled:  [0, [Validators.required, Validators.min(0)]],
         amount: [0, [Validators.required, Validators.min(0), Validators.max(5000)]],
         billNo: ['', Validators.required],
         billDate: ['', Validators.required],
         payeeName: ['', Validators.required],
         // accountNumber: ['', Validators.required],
         bank: ['', ],
         ifscCode: ['', []],
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
     iseditModeTravel = false;
     TravelID:any
     existingBillPath: string = ''
     openModelTravel(mode: string,item?: any): void {
       if (mode === 'add') {
         this.travelForm.reset();
         this.iseditModeTravel = false;
         this.existingBillPath = '';
         this.resetForm();
       }
       else {
         this.TravelID=item?.travelTransportId
         this.iseditModeTravel = true;
         this.existingBillPath = item?.uploadBillUrl || '';
         this.modeOfPaymentTravel(item?.modeOfPayment);
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
           bank: item?.bank || '',
           ifscCode: item?.ifscCode || '',
           modeOfPayment: item?.modeOfPayment || '',
           transactionId: item?.transactionId || '',
           purpose: item?.purpose || '',
           billInvoicePath: ''
         });
       }
       const modal1 = bootstrap.Modal.getOrCreateInstance(document.getElementById('addTravel'));
       modal1.show();
     }
     getTravelData:any=[]
     onSubmitTravel(): void {
       this.isSubmitted = true;
        if (this.travelForm.valid) {
       if(this.iseditModeTravel){
           this.fTravel['nonTrainingSubActivityId'].setValue(Number(this.selectedBudgetHead));
           this._commonService.update(APIS.nontrainingtargets.updateNonTrainingtargetsTravel,{...this.travelForm.value,nonTrainingSubActivityId:Number(this.selectedBudgetHead),travelTransportId:this.TravelID,billInvoicePath:this.travelForm.value.billInvoicePath||this.existingBillPath},this.TravelID).subscribe((res: any) => {
             this.toastrService.success('Data Updated successfully','Non Training Progress Data Success!');
             
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
     RedirectToOutcome(){
        this._commonService.setOption('subActivityId', this.selectedActivity+'-'+ this.selectedBudgetHead+'-NonTraining');
        this.router.navigateByUrl('/capture-outcome');
     }
   }
   
   
   
