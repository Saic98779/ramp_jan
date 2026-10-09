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
  selector: 'app-non-training-nimsme',
  templateUrl: './non-training-nimsme.component.html',
  styleUrls: ['./non-training-nimsme.component.css']
})
export class NonTrainingNimsmeComponent implements OnInit {
  mediaDeatilsForm!: FormGroup;
  financialForm!: FormGroup;
  travelForm!: FormGroup;
  paymentForm!: FormGroup;
  vendorForm!: FormGroup;
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
        this.contingencyForm = this.createFormContingency();
        this.paymentForm = this.createFormPayment();

  }  ngOnInit(): void {
    this.initializemediaDeatilsForm();
    this.initializeVendorForm();
     this.getBudgetHeadList()
    
  }

designations = [
      { value: 'CEO', label: 'CEO' },
      { value: 'Project Manager', label: 'Project Manager' },
      { value: 'Designer', label: 'Designer' },
      { value: 'Developer', label: 'Developer' },
      { value: 'Analyst', label: 'Analyst' }
    ];
    // addd by upendranath reddy for common file preview
  showFileViewer(filePath: string) {
    console.log('File path to open:', filePath);

    this._commonService.openFile(filePath);

  }
  getSubactivities(event:any){
        return this.SubActivityList?.find((item:any)=>item?.subActivityId==event)?.subActivityName || ''
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
        
        }, (error) => {
          // this.toastrService.error(error.message);
        });
      }
  selectedBudgetHead: string = '26';
  physicalTargetAchievement: any = '';
  physicalTarget: any = 0;
  financialTarget: any = 0;
  financialTargetAchievement: any = 0;
  onBudgetHeadChange(event: any) {
    this.selectedBudgetHead = event;
    console.log('Selected Budget Head:', this.selectedBudgetHead);
    this.applyPhysicalReportValidators();
    if( this.selectedBudgetHead=='82'){
      this.designations=[{value :'EDC Manager' ,label :'EDC Manager'}]
    }
    else if(this.selectedBudgetHead=='84'){
        this.designations=[{value :'EDC Asst Manager' ,label :'EDC Asst Manager'}]
    }
    else {
        this.designations = [
      { value: 'CEO', label: 'CEO' },
      { value: 'Project Manager', label: 'Project Manager' },
      { value: 'Designer', label: 'Designer' },
      { value: 'Developer', label: 'Developer' },
      { value: 'Analyst', label: 'Analyst' }
    ];
    }
    
    this.getDeatilOfTargets()
    
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
          // Load expenditure data for selectedBudgetHead==89
            if (
            this.selectedBudgetHead == '77' ||
            this.selectedBudgetHead == '78' ||
            this.selectedBudgetHead == '79'  || this.selectedBudgetHead=='142' || this.selectedBudgetHead=='143' || this.selectedBudgetHead=='144' || this.selectedBudgetHead=='83' || this.selectedBudgetHead=='132' ||

            this.selectedBudgetHead == '80' ||
            this.selectedBudgetHead=='142' || this.selectedBudgetHead=='143' ||
            this.selectedBudgetHead == '81'
            ) {
               this.loadVendorData()
               this.loadMediaDeatilsData()
            this.getPreliminaryDataById();
            }else{
               this.getContingencyDataById()
            this.getPaymentsDataById()
              this.getResourceList()
            }
          // console.log('TargetDetails:', this.TargetDetails);
          // if( this.selectedBudgetHead=='27' || this.selectedBudgetHead=='28'){
          //   this.getPreliminaryDataById()

          // }
          // else if(this.selectedBudgetHead=='19'){
          //   this.getTravelDataBySubActive()
          // }
          // else if(this.selectedBudgetHead=='26'){
          //   this.getResourceList()
          //   this.getContingencyDataById()
          //   this.getPaymentsDataById()
          // }

          
        }, (error) => {
              if (
            this.selectedBudgetHead == '77' ||
            this.selectedBudgetHead == '78' ||
            this.selectedBudgetHead == '79' ||
            this.selectedBudgetHead=='142' || this.selectedBudgetHead=='143' || this.selectedBudgetHead=='144' || this.selectedBudgetHead=='132' ||
            this.selectedBudgetHead == '80' || this.selectedBudgetHead == '83' ||
            this.selectedBudgetHead=='142' || this.selectedBudgetHead=='143' ||
            this.selectedBudgetHead == '81'
            ) {
               this.loadVendorData()
               this.loadMediaDeatilsData()
            this.getPreliminaryDataById();
            }else{
               this.getContingencyDataById()
            this.getPaymentsDataById()
              this.getResourceList()
            }
          //           if(this.selectedBudgetHead=='26' || this.selectedBudgetHead=='27' || this.selectedBudgetHead=='28'){
          //        this.getPreliminaryDataById()

          // }

          //  else if(this.selectedBudgetHead=='19'){
          //   this.getTravelDataBySubActive()
          // }
          // else if(this.selectedBudgetHead=='26'){
          //   this.getResourceList()
          //   this.getContingencyDataById()
          //   this.getPaymentsDataById()
          // }
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
// final submit
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

// Expenditure CRUD operations
createForm(): FormGroup {
    return this.fb.group({
      agencyId: [0, ],
      nonTrainingSubActivityId: [0, ],
       nonTrainingActivityId: [0, ],
      paymentDate: [''],
      expenditureAmount: [0, [Validators.required, Validators.min(0),Validators.max(5000000)]],
      billNo: ['', Validators.required],
      billDate: ['', Validators.required],
      payeeName: ['', Validators.required],
      accountNumber: ['', Validators.required],
      bankName: ['', Validators.required],
      ifscCode: ['', [Validators.required, Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]],
      modeOfPayment: ['', Validators.required],
      transactionId: [''],
      purpose: ['',],
      uploadBillUrl: [''],
       DummyuploadBillUrl: [''],
       category:[''],
       checkNo: [''],
      checkDate: [''],
      achievementDetails: [''],
    });
  }
  get isPhysicalReportBudget(): boolean {
    const s = String(this.selectedBudgetHead);
    return s === '83' || s === '144' || s === '132';
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
    const ctrl = this.financialForm?.get('achievementDetails');
    if (!ctrl) return;
    if (this.isPhysicalReportBudget) {
      ctrl.setValidators([Validators.required]);
    } else {
      ctrl.clearValidators();
    }
    ctrl.updateValueAndValidity();
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

  get f() {
    return this.financialForm.controls;
  }
 
  iseditMode = false;
  preliminaryID:any
 openModel(mode: string,item?: any): void {
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
        // category: item?.category ? item?.category : '',
        expenditureAmount: item?.expenditureAmount || 0,
        billNo: item?.billNo || '',
        billDate: item?.billDate ? this.convertToISOFormat(item?.billDate) : '',
        payeeName: item?.payeeName || '',
        accountNumber: item?.accountNumber || '',
        bankName: item?.bankName || '',
        ifscCode: item?.ifscCode || '',
        modeOfPayment: item?.modeOfPayment || '',
        transactionId: item?.transactionId || '',
        checkNo: item?.checkNo || '',
        checkDate: item?.checkDate ? this.convertToISOFormat(item?.checkDate) : '',
        purpose: item?.purpose || '',
        achievementDetails: item?.achievementDetails || '',
        uploadBillUrl: ''
      });
      
    }
     setTimeout(() => {
       const fileInput = document.getElementById('files') as HTMLInputElement;
       if (fileInput) {
         fileInput.value = '';
       }
     }, 100);
    const modal1 = new bootstrap.Modal(document.getElementById('addSurvey'));
    modal1.show();
  }

  modeOfPaymentIt(val:any){
      const clearOne = (name: string) => {
        this.financialForm.get(name)?.clearValidators();
        this.financialForm.get(name)?.patchValue('');
        this.financialForm.get(name)?.updateValueAndValidity();
      };
      const requireOne = (name: string, extra: any[] = []) => {
        this.financialForm.get(name)?.setValidators([Validators.required, ...extra]);
        this.financialForm.get(name)?.updateValueAndValidity();
      };
      if(val=='CASH'){
        ['accountNumber','bankName','ifscCode','transactionId','checkNo','checkDate'].forEach(clearOne);
      }
      else if(val=='BANK_TRANSFER'){
        ['checkNo','checkDate','transactionId'].forEach(clearOne);
        requireOne('accountNumber');
        requireOne('bankName');
        requireOne('ifscCode', [Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]);
      }
      else if(val=='UPI'){
        ['accountNumber','bankName','ifscCode','checkNo','checkDate'].forEach(clearOne);
        requireOne('transactionId');
      }
      else if(val=='CHEQUE'){
        ['transactionId'].forEach(clearOne);
        requireOne('accountNumber');
        requireOne('bankName');
        requireOne('ifscCode', [Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]);
        requireOne('checkNo');
        requireOne('checkDate');
      }
    }

  getPreliminaryData:any=[]
 
    onSubmit(): void {
      this.isSubmitted = true;
       if (this.financialForm.valid) {
      if(this.iseditMode){
         this.f['agencyId'].setValue(Number(this.selectedAgencyId));
          this.f['nonTrainingSubActivityId'].setValue(Number(this.selectedBudgetHead));
  +        this.f['nonTrainingActivityId'].setValue(Number(this.selectedActivity));
            // this.f['uploadBillUrl'].patchValue(this.f['DummyuploadBillUrl'].value);
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
          this.getDeatilOfTargets()
      }
      else{
        console.log('Form Submitted:', this.financialForm.value);
        this.f['agencyId'].setValue(Number(this.selectedAgencyId));
          this.f['nonTrainingSubActivityId'].setValue(Number(this.selectedBudgetHead));
  +        this.f['nonTrainingActivityId'].setValue(Number(this.selectedActivity));
            this.financialForm.removeControl('DummyuploadBillUrl');
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

            // this.getPreliminaryData.push(res.data)
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

  getPreliminaryDataById(){
    this._commonService.getDataByUrl(APIS.nontrainingtargets.getNonTrainingtargetsAleapPriliminaryById+this.selectedBudgetHead).subscribe((res: any) => {
      this.getPreliminaryData = res.data || [];
       this.getPreliminaryData?.map((item:any)=>{
              this.financialTargetAchievement+=Number(item?.expenditureAmount)
            })
    }, (error) => {
      console.error('Error fetching preliminary data:', error);
    });
  }

  deletePreliminaryID:any
  deletePreliminary(id:any):void{
    console.log('Delete Preliminary ID:', id);
    this.deletePreliminaryID=id
     const previewModal = document.getElementById('exampleModalDeletepreliminary');
    if (previewModal) {
      const modal = new bootstrap.Modal(previewModal);
      modal.show();
    }
  }

  ConfirmdeleteExpenditure(item:any){
    console.log('Delete Preliminary ID:', item);
      this._commonService
      .deleteId(APIS.nontrainingtargets.deleteNonTrainingtargetsAleapPriliminary,item).subscribe({
        next: (data: any) => {
          this.toastrService.success('Expenditure deleted successfully', 'Success!');
          const editSessionModal = document.getElementById('exampleModalDeletepreliminary');
          if (editSessionModal) {
            const modal = bootstrap.Modal.getInstance(editSessionModal);
            if (modal) modal.hide();
          }
          this.getDeatilOfTargets();
          this.getPreliminaryDataById();
        },
        error: (err) => {
          this.toastrService.error(err.message || 'Failed to delete expenditure', 'Error!');
        },
      });
    }
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


// media upload code
isEditModeUpload = false;
selectedUploadFile: File | null = null;
getUploadData: any[] = [];
deleteUploadID: any = null;

// vendor management code
isEditModeVendor = false;
getVendorData: any[] = [];
deleteVendorID: any = null;
 initializemediaDeatilsForm() {
    this.mediaDeatilsForm = this.fb.group({
      id: [''],
      contentType: ['', Validators.required],
      contentName: ['', [Validators.required, Validators.minLength(2)]],
      durationOrPages: [0, [Validators.required, Validators.min(1)]],
      topic: ['', Validators.required],
      status: ['', Validators.required],
      dateOfUpload: ['', Validators.required],
      url: [''],
      subActivityId: [0],
      // uploadFile: ['', Validators.required]
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

  // Create Vendor Form (used in constructor)
  createVendorForm(): FormGroup {
    return this.fb.group({
      vendorId: [0],
      vendorCompanyName: ['', [Validators.required, Validators.minLength(2)]],
      dateOfOrder: ['', Validators.required],
      orderDetails: ['', [Validators.required, Validators.minLength(10)]],
      orderUpload: [''],
       DummyorderUpload: [''],
      subActivityId: [0]
    });
  }

  // Getter for upload form controls
  get fMedia() {
    return this.mediaDeatilsForm.controls;
  }

  // Getter for vendor form controls
  get fVendor() {
    return this.vendorForm.controls;
  }
 // Open Upload Modal
  openUploadModal(mode: string, data?: any) {
    this.isEditModeUpload = mode === 'edit';
    this.isSubmitted = false;
    
    if (mode === 'edit' && data) {
      this.mediaDeatilsForm.patchValue({
        id: data.id,
        contentType: data.contentType,
        contentName: data.contentName,
        durationOrPages: data.durationOrPages,
        topic: data.topic,
        status: data.status,
        dateOfUpload: data.dateOfUpload ? new Date(data.dateOfUpload).toISOString().split('T')[0] : '',
        url: data.url,
        subActivityId: data.subActivityId
      });
      // Remove required validation for file in edit mode
      // this.fMedia['uploadFile'].clearValidators();
      // this.fMedia['uploadFile'].updateValueAndValidity();
    } else {
      this.resetmediaDeatilsForm();
      // Add required validation for file in add mode
      // this.fMedia['uploadFile'].setValidators([Validators.required]);
      // this.fMedia['uploadFile'].updateValueAndValidity();
    }

    // Open modal using Bootstrap
    const modalElement = document.getElementById('addUpload');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  // Submit Upload Form
  onSubmitUpload() {
    this.isSubmitted = true;
    
    if (this.mediaDeatilsForm.invalid) {
      console.log('Form is invalid');
      return;
    }

    const uploadData = { ...this.mediaDeatilsForm.value };
    
    // Set subActivityId to current selected budget head
    uploadData.subActivityId = parseInt(this.selectedBudgetHead);
    
    // Convert date to ISO string
    if (uploadData.dateOfUpload) {
      uploadData.dateOfUpload = new Date(uploadData.dateOfUpload).toISOString();
    }

    // Remove uploadFile from data as it's not part of the API structure
    // delete uploadData.uploadFile;

    if (this.isEditModeUpload) {
      this.updateUpload(uploadData);
    } else {
      this.createUpload(uploadData);
    }
  }

  // Create Upload
  createUpload(uploadData: any) {
    // Replace with your actual API service call
    this._commonService.add(APIS.nontrainingtargets.nimsme.savedataMedia_doc,uploadData).subscribe({
      next: (response) => {
        // this.showSuccess('Media details created successfully');
        this.loadMediaDeatilsData();
        this.closeUploadModal();
      },
      error: (error) => {
        // this.showError('Failed to create media details');
        console.error('Create upload error:', error);
      }
    });
    this.closeUploadModal();
    console.log('Media details created successfully');
  }

  // Update Upload
  updateUpload(uploadData: any) {
 
      this._commonService.update(APIS.nontrainingtargets.nimsme.updatedataMedia_doc,uploadData,uploadData.id,).subscribe({
      next: (response) => {
        // this.showSuccess('Media details created successfully');
        this.loadMediaDeatilsData();
      },
      error: (error) => {
        // this.showError('Failed to create media details');
        console.error('Create upload error:', error);
      }
    });
    this.closeUploadModal();
    console.log('Media details updated successfully');
  }

  // Load Upload Data
  loadMediaDeatilsData() {
    if (!this.selectedBudgetHead) {
      this.getUploadData = [];
      return;
    }
 this._commonService.getDataByUrl(APIS.nontrainingtargets.nimsme.getdataMedia_doc+this.selectedBudgetHead).subscribe({
     next: (response) => {
        this.getUploadData = response.data || [];
        this.physicalTargetAchievement=response.data.length
      },
      error: (error) => {
        // this.showError('Failed to load media details');
        console.error('Load upload data error:', error);
      }
 })
  

  }

  // Delete Upload
  deleteUpload(id: any) {
    this.deleteUploadID = id;
    const modalElement = document.getElementById('exampleModalDeleteUpload');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  // Confirm Delete Upload
  confirmDeleteUpload(id: any) {
     this._commonService.deleteId(APIS.nontrainingtargets.nimsme.deletedataMedia_doc,id).subscribe({
     next: (response) => {
        this.loadMediaDeatilsData();
        this.closeModalDelete();
      },
      error: (error) => {
        this.loadMediaDeatilsData();
        this.closeModalDelete();
        // this.showError('Failed to load media details');
        console.error('Load upload data error:', error);
      }
 })

    // Mock implementation for demonstration
    this.getUploadData = this.getUploadData.filter(upload => upload.id !== id);
    
    const modalElement = document.getElementById('exampleModalDeleteUpload');
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
      modal?.hide();
    }
    
    console.log('Media details deleted successfully');
  }
closeModalDelete(): void {
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    const editSessionModal = document.getElementById('exampleModalDeleteUpload');
  if (editSessionModal) {
    const modalInstance = bootstrap.Modal.getInstance(editSessionModal);
    modalInstance.hide();
  }
  // this.GetProgramsByAgency(this.selectedAgencyId);
   }

  // Handle File Input Change
  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedUploadFile = file;
      // You can implement file upload logic here if needed
    }
  }
  // Reset Upload Form
  resetmediaDeatilsForm() {
    this.mediaDeatilsForm.reset();
    this.isSubmitted = false;
    this.selectedUploadFile = null;
    this.isEditModeUpload = false;
    
    // Reset form with default values
    this.mediaDeatilsForm.patchValue({
      id: '',
      contentType: this.selectedBudgetHead=='77'?'Video':'Document',
      contentName: '',
      durationOrPages: 0,
      topic: '',
      status: '',
      dateOfUpload: '',
      url: '',
      subActivityId: parseInt(this.selectedBudgetHead || '0'),
      // uploadFile: ''
    });
    
    // Reset form validation
    Object.keys(this.fMedia).forEach(key => {
      this.fMedia[key].markAsUntouched();
      this.fMedia[key].markAsPristine();
    });
  }

  // Close Upload Modal
  closeUploadModal() {
    const modalElement = document.getElementById('addUpload');
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
      modal?.hide();
    }
    this.resetmediaDeatilsForm();
  }

  // ================= VENDOR MANAGEMENT METHODS =================

  // Open Vendor Modal
  openVendorModal(mode: string, data?: any) {
    this.uploadedFilesVendor=''
    this.isEditModeVendor = mode === 'edit';
    this.isSubmitted = false;
    
    if (mode === 'edit' && data) {
      this.vendorForm.patchValue({
        vendorId: data.vendorId,
        vendorCompanyName: data.vendorCompanyName,
        dateOfOrder: data.dateOfOrder ? new Date(data.dateOfOrder).toISOString().split('T')[0] : '',
        orderDetails: data.orderDetails,
        subActivityId: data.subActivityId,
        orderUpload:data.orderUpload,
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
      console.log('Vendor form is invalid');
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
      uploadedFilesVendor: any ;
  onOrderUploadSelected(event: any): void {
    this.uploadedFilesVendor=''
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
    let formdata=new FormData()
     formdata.append("file",this.uploadedFilesVendor)
     delete vendorData.DummyorderUpload
    formdata.append("vendorDetailsDto",JSON.stringify(vendorData))
   
    
    this._commonService.add(APIS.nontrainingtargets.nimsme.savedataVendor_doc, formdata).subscribe({
      next: (response) => {
        this.uploadedFilesVendor=''
        this.toastrService.success('Vendor details created successfully', 'Non Training Progress Data Success!');
        this.loadVendorData();

        this.closeVendorModal();
      },
      error: (error) => {
        this.uploadedFilesVendor=''
        this.toastrService.error('Failed to create vendor details', 'Non Training Progress Data Error!');
        console.error('Create vendor error:', error);
        this.closeVendorModal();
      }
    });
    this.getDeatilOfTargets()
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
    this.getDeatilOfTargets()
  }


  // Load Vendor Data
  loadVendorData() {
    // Only load vendor data for selectedBudgetHead 79, 80, 81
    if (!this.selectedBudgetHead || !['79', '80', '81','142','143','144'].includes(this.selectedBudgetHead)) {
      this.getVendorData = [];
      return;
    }

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
    this.getDeatilOfTargets()
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

  // Reset Vendor Form
  resetVendorForm() {
    this.uploadedFilesVendor=''
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

  // Check if current budget head supports vendor management
  isVendorBudgetHead(): boolean {
    return ['79', '80', '81','142','143','144'].includes(this.selectedBudgetHead);
  }




   // contingency fund || staff
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
            resourceList:any=[]
   getResourceList(){
        this.resourceList=[]
          this._commonService.getDataByUrl(APIS.nontrainingtargets.getResourceList+this.selectedBudgetHead).subscribe((res: any) => {
              this.resourceList=res.data;
             
          
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
        accountNo: ['', [Validators.required]]
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
        
    //     this.paymentForm.patchValue({
    //       amount: item?.amount || 0,
    //       paymentForMonth: item?.paymentForMonth || '',
    //       dateOfPayment: item?.dateOfPayment ? this.convertToISOFormat(item?.dateOfPayment) : '',
    //       resourceId: item?.resourceId || 0,
    //       bankName: item?.bankName || '',
    //       ifscCode: item?.ifscCode || '',
    //       accountNo: item?.accountNo || '',
    //       uploadBillUrl:''
         
    //     });
    //   }
    //   this.onResourceChange(item?.resourceId,this.resourceList)
    //   const modal1 = new bootstrap.Modal(document.getElementById('addPayment'));
    //   modal1.show();
    // }
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
        removeFilePayment(): void {
    this.uploadedFilesPayment = null;
    const fileInput = document.getElementById('paymentFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
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
    //       uploadBillUrl: this.paymentForm.value?.uploadBillUrl,
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
  
    //         if (this.paymentForm.value?.billInvoicePath) {
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
     
    //     this.getDeatilOfTargets()
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
       uploadedFiles: any ;

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
  //        onFileSelectedPayment(event: any): void {
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
 
}



