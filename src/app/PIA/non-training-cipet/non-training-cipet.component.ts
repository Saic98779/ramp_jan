import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { state } from '@angular/animations';
import { distinct } from 'rxjs';
import { ModalService } from '@app/_services/modal.service';

@Component({
  selector: 'app-non-training-cipet',
  templateUrl: './non-training-cipet.component.html',
  styleUrls: ['./non-training-cipet.component.css']
})
export class NonTrainingCipetComponent implements OnInit {
  financialForm!: FormGroup;
  travelForm!: FormGroup;
  paymentForm!: FormGroup;
   isSubmitted = false;
  loginsessionDetails: any;
  selectedAgencyId: any;
  @ViewChild(MonthlyRangeComponent) monthlyRange!: MonthlyRangeComponent;
  @ViewChild('addVisitDetailsModal') addVisitDetailsModal: any;
@ViewChild('deleteVisitModalTemplate') deleteVisitModalTemplate: any;
  constructor(
    private fb: FormBuilder, 
    private toastrService: ToastrService,
    private _commonService: CommonServiceService,
    private router: Router,
     private modalService: ModalService
  ) {
    this.loginsessionDetails = JSON.parse(sessionStorage.getItem('user') || '{}');    
    this.selectedAgencyId = this.loginsessionDetails.agencyId;
    this.financialForm = this.createForm();
    this.travelForm = this.createFormTravel();
    this.contingencyForm = this.createFormContingency();
    this.paymentForm = this.createFormPayment();
    this.OrganisationForm = this.createFormOrganization(); // Initialize organization form
  }

  ngOnInit(): void {
    this.getBudgetHeadList();
    this.loadOrganizations();
    this.getAllDistricts();
    this.getAllSectors();
    this.visitForm = this.createFormVisit(); // Add this line
  this.assignResourceDropdownSettings(); // Add this line
  }


 

 
 
  OragnizationType: any = 'MSME'; 
  OrganisationForm!: FormGroup;
  // Organization related properties
  OrganizationData: any = [];
  allDistricts: any = [];
  allSectors: any = [];
  MandalList: any = [];
  dropdownListOrg: any = [];
  dropdownList1: any = [];
  selectedItems: any[] = [];
  
  // Dropdown settings
  dropdownSettingsOrg: IDropdownSettings = {};
  dropdownSettings: IDropdownSettings = {};

 

  // Organization Form Creation
  createFormOrganization(): FormGroup {
    return this.fb.group({
      "organizationCategory": new FormControl("Micro", [Validators.required]),
      "organizationType": new FormControl("MSME", [Validators.required]),
      "udyamregistrationNo": new FormControl(""),
      "organizationName": new FormControl("", [Validators.required, Validators.pattern(/^[^\s].*/)]),
      "udyamYesOrNo": new FormControl("No", [Validators.required]),
      "dateOfRegistration": new FormControl(""),
      "incorporationDate": new FormControl(""),
      "dateOfIssue": new FormControl(""),
      "validupto": new FormControl(""),
      "stateId": new FormControl("Telangana", [Validators.required]),
      "distId": new FormControl("", [Validators.required]),
      "sectorIds": new FormControl([], [Validators.required]),
      "mandal": new FormControl("", [Validators.required]),
      "town": new FormControl("", [Validators.required]),
      "streetNo": new FormControl(""),
      "houseNo": new FormControl(""),
      "latitude": new FormControl("", [Validators.pattern(/^[0-9.]{1,50}$/)]),
      "longitude": new FormControl("", [Validators.pattern(/^[0-9.]{1,50}$/)]),
      "contactNo": new FormControl("", [Validators.required, Validators.pattern(/^[6789]\d{9}$/)]),
      "email": new FormControl("", [Validators.email]),
      "website": new FormControl(""),
      "ownerName": new FormControl("", [Validators.required, Validators.pattern(/^[^\s].*/)]),
      "ownerContactNo": new FormControl("", [Validators.required, Validators.pattern(/^[6789]\d{9}$/)]),
      "ownerEmail": new FormControl("", [Validators.email]),
      "ownerAddress": new FormControl("")
    });
  }

  get fOrg() {
    return this.OrganisationForm.controls;
  }

  // Get All Districts
  getAllDistricts() {
    this.allDistricts = [];
    this._commonService.getDataByUrl(APIS.masterList.getDistricts).subscribe({
      next: (data: any) => {
        this.allDistricts = data.data;
      },
      error: (err: any) => {
        this.toastrService.error(err.message);
      }
    });
  }

  // Get All Sectors
  getAllSectors() {
    this.allSectors = [];
    this._commonService.getDataByUrl(APIS.masterList.getSectors).subscribe({
      next: (data: any) => {
        this.allSectors = data.data;
        this.assignFluidData1();
      },
      error: (err: any) => {
        this.toastrService.error(err.message);
      }
    });
  }

  // Get Organization Data
  // getOrganizationData() {
  //   this._commonService.getDataByUrl(APIS.participantdata.getOrgnizationDataOnlyId+'?organizationType=MSME').subscribe({
  //     next: (res: any) => {
  //       this.OrganizationData = res.data || [];
  //       this.assignFluidDataOrg();
  //     },
  //     error: (err) => {
  //       this.toastrService.error(err.message);
  //     }
  //   });
  // }
  
  filteredOrganizationData: any = []
  searchValue: boolean = true;
  loadOrganizations(Orgvalue?:any) {
    this._commonService.getDataByUrl(APIS.participantdata.getOrgnizationDataOnlyPagination + '?page=0&size=500').subscribe({
      next: (res: any) => {
        this.OrganizationData = res?.data;
        this.filteredOrganizationData = this.OrganizationData.slice();
        //  this.f2['organizationId'].patchValue(Orgvalue?.organizationId);
      },
      error: (err) => {
        this.toastrService.error(err.message, "Organization Data Error!");
      }
    });
  }

 onSearchChange(event: any) {
    const filterValue = event?.toLowerCase();
    if (filterValue.length >= 2) {
      this.searchValue = false;
      this._commonService.getDataByUrl(APIS.participantdata.getOrgnizationDataOnlyPagination + '?search=' + event + '&page=0&size=500')
        .subscribe({
          next: (res: any) => {
            this.OrganizationData = res?.data;
            this.filteredOrganizationData = this.OrganizationData.slice();
          },
          error: (error: any) => {
            this.filteredOrganizationData = [];
          }
        });
    } else {
      this.searchValue = true;
      this.filteredOrganizationData = this.OrganizationData.slice();
    }
  }

  // Get Mandal by District
  GetMandalByDistrict(event: any) {
    this.MandalList = [];
    this._commonService.getDataByUrl(APIS.masterList.getMandal + event.target.value).subscribe({
      next: (data: any) => {
        this.MandalList = data.data;
      },
      error: (err: any) => {
        this.toastrService.error(err.message);
      }
    });
  }

  // Dropdown Settings for Organization
  assignFluidDataOrg() {
    this.dropdownSettingsOrg = {
      singleSelection: true,
      idField: 'organizationId',
      textField: 'organizationName',
      itemsShowLimit: 1,
      allowSearchFilter: true,
      clearSearchFilter: true,
      maxHeight: 197,
      searchPlaceholderText: "Search Organization",
      noDataAvailablePlaceholderText: "Data Not Available",
      closeDropDownOnSelection: false,
      showSelectedItemsAtTop: false,
      defaultOpen: false,
    };
    this.dropdownListOrg = this.OrganizationData;
  }

  onItemSelectOrg(item: any) {
    console.log('Item selected:', item);
  }

  onItemDeSelectOrg(item: any) {
    console.log('Item deselected:', item);
  }

  // Dropdown Settings for Sectors
  assignFluidData1() {
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'sectorId',
      textField: 'sectorName',
      itemsShowLimit: 1,
      enableCheckAll: true,
      selectAllText: "Select All",
      unSelectAllText: "Clear All",
      allowSearchFilter: true,
      clearSearchFilter: true,
      maxHeight: 197,
      searchPlaceholderText: "Search Sector",
      noDataAvailablePlaceholderText: "Data Not Available",
      closeDropDownOnSelection: false,
      showSelectedItemsAtTop: false,
      defaultOpen: false,
    };
    this.dropdownList1 = this.allSectors;
  }

  onItemSelect(item: any) {
    console.log('Item selected:', item);
  }

  onSelectAll(items: any[]) {
    console.log('All items selected:', items);
  }

  onItemDeSelect(item: any) {
    console.log('Item deselected:', item);
  }

  onDeSelectAll(items: any[]) {
    console.log('All items deselected');
  }

  // Change Udyam Registration
  chnageUdyam(event: any) {
    if (event.target.value == 'Yes') {
      this.fOrg['udyamregistrationNo'].addValidators(Validators.required);
      this.fOrg['dateOfRegistration'].setValidators(null);
    } else {
      this.fOrg['udyamregistrationNo'].setValidators(null);
      this.fOrg['dateOfRegistration'].setValidators(null);
      this.fOrg['udyamregistrationNo'].patchValue('');
      this.fOrg['dateOfRegistration'].patchValue('');
    }
    this.fOrg['udyamregistrationNo'].updateValueAndValidity();
    this.fOrg['dateOfRegistration'].updateValueAndValidity();
  }

  // Submit Organization Form
  SubmitformOrganization() {
    console.log(this.OrganisationForm.value);

    if (!this.OrganisationForm.valid) {
      this.toastrService.warning('Please fill all required fields', "Validation Error!");
      return;
    }

    // Process sector IDs
    if (this.OrganisationForm.value['sectorIds'].length) {
      this.OrganisationForm.value['sectorIds'] = this.OrganisationForm.value['sectorIds'].map((item: any) => {
        return Number(item.sectorId);
      });
    } else {
      this.OrganisationForm.value['sectorIds'] = [];
    }

    // Format dates
    const payload = {
      ...this.OrganisationForm.value,
      dateOfRegistration: this.OrganisationForm.value.dateOfRegistration ? 
        moment(this.OrganisationForm.value.dateOfRegistration).format('DD-MM-YYYY') : null,
      incorporationDate: this.OrganisationForm.value.incorporationDate ? 
        moment(this.OrganisationForm.value.incorporationDate).format('DD-MM-YYYY') : null,
      dateOfIssue: this.OrganisationForm.value.dateOfIssue ? 
        moment(this.OrganisationForm.value.dateOfIssue).format('DD-MM-YYYY') : null,
      validupto: this.OrganisationForm.value.validupto ? 
        moment(this.OrganisationForm.value.validupto).format('DD-MM-YYYY') : null
    };

    this._commonService.add(APIS.participantdata.saveOrgnization, payload).subscribe({
      next: (data: any) => {
        this.toastrService.success('MSME Organization Data Added Successfully', "Success!");
        this.OrganisationForm.reset();
        this.OrganisationForm.patchValue({
          organizationType: 'MSME',
          organizationCategory: 'Micro',
          udyamYesOrNo: 'No',
          stateId: 'Telangana'
        });
        this.loadOrganizations();
        
        // Close the modal
        const modalElement = document.getElementById('addOrganisation');
        if (modalElement) {
          const modal = bootstrap.Modal.getInstance(modalElement);
          if (modal) {
            modal.hide();
          }
        }
      },
      error: (err) => {
        this.toastrService.error(err.message, "Error!");
      }
    });
  }

  // Open Organization Modal
  openOrganizationModal() {
    this.OrganisationForm.reset();
    this.OrganisationForm.patchValue({
      organizationType: 'MSME',
      organizationCategory: 'Micro',
      udyamYesOrNo: 'No',
      stateId: 'Telangana'
    });
    
    const modal = new bootstrap.Modal(document.getElementById('addOrganisation'));
    modal.show();
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
          console.log('TargetDetails:', this.TargetDetails);
          if( this.selectedBudgetHead=='6'  || this.selectedBudgetHead=='13' || this.selectedBudgetHead=='10' || this.selectedBudgetHead=='2' || this.selectedBudgetHead=='8' || this.selectedBudgetHead=='91' ){

            this.getResourceList()
            this.getContingencyDataById()
            this.getPaymentsDataById()
            
             if (this.selectedBudgetHead == '2' || this.selectedBudgetHead == '8' || this.selectedBudgetHead == '91' || this.selectedBudgetHead=='10') {
            this.getVisitDetailsList();
             this.getPreliminaryDataById()
            }

          }
          else if(this.selectedBudgetHead=='19'){
            this.getTravelDataBySubActive()
          }
          else if(this.selectedBudgetHead=='12' || this.selectedBudgetHead=='11' || this.selectedBudgetHead=='92' || this.selectedBudgetHead=='91'  || this.selectedBudgetHead=='90' || this.selectedBudgetHead=='13' || this.selectedBudgetHead=='10' || this.selectedBudgetHead=='2' || this.selectedBudgetHead=='8' || this.selectedBudgetHead=='91' || this.selectedBudgetHead=='93' || this.selectedBudgetHead=='4'){
             this.getPreliminaryDataById()
            
          }

          
        }, (error) => {
           if( this.selectedBudgetHead=='6'  || this.selectedBudgetHead=='13' || this.selectedBudgetHead=='10' || this.selectedBudgetHead=='2' || this.selectedBudgetHead=='8' || this.selectedBudgetHead=='91' ){

            this.getResourceList()
            this.getContingencyDataById()
            this.getPaymentsDataById()
           
             if (this.selectedBudgetHead == '2' || this.selectedBudgetHead == '8' || this.selectedBudgetHead == '91' || this.selectedBudgetHead=='10') {
            
              this.getVisitDetailsList()
             this.getPreliminaryDataById()
            }

          }
          else if(this.selectedBudgetHead=='19'){
            this.getTravelDataBySubActive()
          }
          else if(this.selectedBudgetHead=='12' || this.selectedBudgetHead=='11' || this.selectedBudgetHead=='92' || this.selectedBudgetHead=='91' || this.selectedBudgetHead=='13' || this.selectedBudgetHead=='90' || this.selectedBudgetHead=='10' || this.selectedBudgetHead=='2' || this.selectedBudgetHead=='8' || this.selectedBudgetHead=='91' || this.selectedBudgetHead=='93' || this.selectedBudgetHead=='4'){
             this.getPreliminaryDataById()
            
          }
          // this.toastrService.error(error.message);
        });
      }

getSubactivities(event:any){
        return this.SubActivityList?.find((item:any)=>item?.subActivityId==event)?.subActivityName || ''
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
    console.log('File path to open:', filePath);

    this._commonService.openFile(filePath);

  }



 getPreliminaryDataById(){
        https://ramp-tg.metaversedu.in/workflow/non-training/all/expenditures?nonTrainingActivityId=1
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
        arrayResourceList:any=[]
   getResourceList(){
        this.resourceList=[]
          this._commonService.getDataByUrl(APIS.nontrainingtargets.getResourceList+this.selectedBudgetHead).subscribe((res: any) => {
              this.resourceList=res.data;
              this.arrayResourceList=res.data;
             
          
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
      category: ['', ],
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
      checkDate: ['']
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
        checkNo: item?.checkNo || '',
        checkDate: item?.checkDate ? this.convertToISOFormat(item?.checkDate) : '',
        purpose: item?.purpose || '',
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
    }

  getPreliminaryData:any=[]
  onSubmit(): void {
    this.isSubmitted = true;
     if (this.financialForm.valid) {
    if(this.iseditMode){
       this.f['agencyId'].setValue(Number(this.selectedAgencyId));
        this.f['nonTrainingSubActivityId'].setValue(Number(this.selectedBudgetHead));
+        this.f['nonTrainingActivityId'].setValue(Number(this.selectedActivity));
  const formData = new FormData();
            console.log('this.uploadedFilesFinance:', this.uploadedFilesFinance,Object(this.uploadedFilesFinance).length>0,typeof this.uploadedFilesFinance);
             if (this.uploadedFilesFinance?.name && typeof this.uploadedFilesFinance !== 'string') {
              formData.append("files", this.uploadedFilesFinance);
              }
              else{
                this.financialForm.patchValue({uploadBillUrl:this.uploadedFilesFinance})
              }

              formData.append("dto", JSON.stringify({...this.financialForm.value,nonTrainingSubActivityId:Number(this.selectedBudgetHead),id:this.preliminaryID}));

         
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
         const formData = new FormData();
          formData.append("dto", JSON.stringify({...this.financialForm.value}));

           if (this.uploadedFilesFinance) {
             formData.append("file", this.uploadedFilesFinance);
             }
        this._commonService.add(APIS.nontrainingtargets.saveNonTrainingtargetsCodeIT,formData).subscribe((res: any) => {
          this.toastrService.success('Data saved successfully','Non Training Progress Data Success!');
          this.getPreliminaryData.push(res.data)
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
    { value: 'Developer', label: 'Developer' },
    { value: 'Analyst', label: 'Analyst' }
  ];
   contingencyForm!: FormGroup;
     createFormContingency(): FormGroup {
      if(this.selectedAgencyId=='6' || this.selectedAgencyId==6){
         return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      designation: ['', Validators.required],
      relevantExperience: [0, [Validators.required, Validators.min(0), Validators.max(50)]],
      educationalQualification: ['', Validators.required],
      dateOfJoining: [null, ],
      // [Validators.required, Validators.min(0), Validators.max(5000000)]
      monthlySal: [0, ],
      bankName: ['', Validators.required],
      // [Validators.required, Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]
      ifscCode: ['', ],
      accountNo: ['', ]
    });
      }
      else{
         return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      designation: ['', Validators.required],
      relevantExperience: [0,],
      // educationalQualification: ['', Validators.required],
      dateOfJoining: [null, ],
      // [Validators.required, Validators.min(0), Validators.max(5000000)]
      monthlySal: [0, ],
      bankName: ['', Validators.required],
      // [Validators.required, Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]
      ifscCode: ['', ],
      accountNo: ['', ]
    });
      }
   
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
        billInvoicePath: item?.billInvoicePath || ''
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
        this.travelForm.get('bank')?.patchValue('');
        this.travelForm.get('transactionId')?.patchValue('');
        this.travelForm.get('ifscCode')?.patchValue('');
        this.travelForm.get('bank')?.clearValidators();
        this.travelForm.get('transactionId')?.clearValidators();
        this.travelForm.get('ifscCode')?.clearValidators();
        this.travelForm.get('bank')?.disable();
        this.travelForm.get('transactionId')?.disable();
        this.travelForm.get('ifscCode')?.disable();
      
        this.travelForm.get('bank')?.updateValueAndValidity();
        this.travelForm.get('transactionId')?.updateValueAndValidity();
        this.travelForm.get('ifscCode')?.updateValueAndValidity();
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
        this.travelForm.get('bank')?.setValidators([Validators.required]);
        this.travelForm.get('transactionId')?.setValidators(null);
        this.travelForm.get('ifscCode')?.setValidators([Validators.required,Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]);
        this.travelForm.get('bank')?.enable();
        this.travelForm.get('transactionId')?.disable();
        this.travelForm.get('ifscCode')?.enable();
        this.travelForm.get('bank')?.patchValue('');
        this.travelForm.get('transactionId')?.patchValue('');
        this.travelForm.get('ifscCode')?.patchValue('');
        this.travelForm.get('bank')?.updateValueAndValidity();
        this.travelForm.get('transactionId')?.updateValueAndValidity();
        this.travelForm.get('ifscCode')?.updateValueAndValidity();
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
        this.travelForm.get('bank')?.setValidators(null);
        this.travelForm.get('transactionId')?.setValidators([Validators.required,Validators.pattern(/^[^\s].*/)]);
        this.travelForm.get('ifscCode')?.setValidators(null);
        this.travelForm.get('bank')?.disable();
        this.travelForm.get('transactionId')?.enable();
        this.travelForm.get('ifscCode')?.disable();
        this.travelForm.get('bank')?.patchValue('');
        this.travelForm.get('transactionId')?.patchValue('');
        this.travelForm.get('ifscCode')?.patchValue('');

        this.travelForm.get('bank')?.updateValueAndValidity();
        this.travelForm.get('transactionId')?.updateValueAndValidity();
        this.travelForm.get('ifscCode')?.updateValueAndValidity();
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
        this.travelForm.get('bank')?.setValidators(null);
        this.travelForm.get('transactionId')?.setValidators(null);
        this.travelForm.get('ifscCode')?.setValidators(null);
        this.travelForm.get('bank')?.enable();
        this.travelForm.get('transactionId')?.enable();
        this.travelForm.get('ifscCode')?.enable();
        this.travelForm.get('bank')?.patchValue('');
        this.travelForm.get('transactionId')?.patchValue('');
        this.travelForm.get('ifscCode')?.patchValue('');

        this.travelForm.get('bank')?.updateValueAndValidity();
        this.travelForm.get('transactionId')?.updateValueAndValidity();

        this.travelForm.get('ifscCode')?.updateValueAndValidity();
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
  // end infracture



  // visit details code
  // ...existing code...

// Add Visit Details properties after OrganizationData
visitForm!: FormGroup;
visitDetailsList: any = [];
iseditModeVisit = false;
visitDetailsID: any;
dropdownSettingsResource: IDropdownSettings = {};
dropdownListResource: any = [];
selectedOrganization: any = null;
copyFromOrganization = false;


// Add Visit Form Creation after createFormOrganization
createFormVisit(): FormGroup {
  return this.fb.group({
    organizationId: [0, Validators.required],
    subActivityId: [Number(this.selectedBudgetHead), Validators.required],
    dateOfVisit: ['', Validators.required],
    timeOfVisit: ['', Validators.required],
    nonTrainingResourceIds: [[], Validators.required],
    state: ['Telangana', Validators.required],
    district: ['', Validators.required],
    mandal: ['', Validators.required],
    town: ['', Validators.required],
    streetNo: ['',Validators.required],
    houseNo: ['', Validators.required],
    latitude: ['', [Validators.required,Validators.pattern(/^-?\d+\.?\d*$/)]],
    longitude: ['', [Validators.required,Validators.pattern(/^-?\d+\.?\d*$/)]],
    contactNo: ['', [Validators.required, Validators.pattern(/^[6789]\d{9}$/)]],
    email: ['', [Validators.required, Validators.email]],
    withInHyderabad: [true, Validators.required]
  });
}

get fVisit() {
  return this.visitForm.controls;
}

// Resource Dropdown Settings
assignResourceDropdownSettings() {
  this.dropdownSettingsResource = {
    singleSelection: false,
    idField: 'resourceId',
    textField: 'name',
    itemsShowLimit: 2,
    enableCheckAll: true,
    selectAllText: "Select All Resources",
    unSelectAllText: "Clear All",
    allowSearchFilter: true,
    clearSearchFilter: true,
    maxHeight: 197,
    searchPlaceholderText: "Search Resource",
    noDataAvailablePlaceholderText: "No Resources Available",
    closeDropDownOnSelection: false,
    showSelectedItemsAtTop: false,
    defaultOpen: false,
  };
  this.dropdownListResource = this.resourceList;
}

// Handle resource selection
onItemSelectResource(item: any) {
  console.log('Resource selected:', item);
}

onItemDeSelectResource(item: any) {
  console.log('Resource deselected:', item);
}

// Handle organization selection
onOrganizationSelect(item: any) {
  console.log('Organization selected:', item);
  this.selectedOrganization = item;
  if (this.copyFromOrganization) {
      this.copyOrganizationAddress();
    }
  // if (item && Object.keys(item)?.length > 0) {
  //   this.selectedOrganization = item;
  //   this.fVisit['organizationId'].setValue(this.selectedOrganization.organizationId);
    
    
  // }
}

// Copy address from organization
copyOrganizationAddress() {
  if (this.selectedOrganization) {
    // Fetch organization details
    this._commonService.getDataByUrl(APIS.masterList.getOrganizationByOrgId+`${this.selectedOrganization}`).subscribe({
      next: (res: any) => {
        const orgData = res.data;

        this.visitForm.patchValue({
          state: orgData.stateId || 'Telangana',
          district: orgData.distId || '',
          mandal: orgData.mandal || '',
          town: orgData.town || '',
          streetNo: orgData.streetNo || '',
          houseNo: orgData.houseNo || '',
          latitude: orgData.latitude || '',
          longitude: orgData.longitude || '',
          contactNo: orgData.contactNo || '',
          email: orgData.email || ''
        });
        
        // Load mandals for the district
        if (orgData.distId) {
          this.GetMandalByDistrict({ target: { value: orgData.distId } });
        }
      },
      error: (err) => {
        this.toastrService.error(err);
      }
    });
  }
}

// Handle copy address checkbox
onCopyAddressChange(event: any,organization:any) {
  console.log('Copy address checkbox changed:', event.target.checked, this.selectedOrganization,organization);
  this.copyFromOrganization = event.target.checked;
  if (this.copyFromOrganization && this.selectedOrganization) {
    this.copyOrganizationAddress();
  }
  
}

// Open Visit Modal
openVisitModal(mode: string, item?: any): void {
  this.dropdownListResource = this.resourceList;
  
  if (mode === 'add') {
    this.selectedItems=[]
    this.iseditModeVisit = false;
    this.visitForm.reset();
    this.visitForm.patchValue({
      subActivityId: Number(this.selectedBudgetHead),
      state: 'Telangana',
      withInHyderabad: true
    });
    this.selectedOrganization = null;
    this.copyFromOrganization = false;
  }
  
  if (mode === 'edit') {
    this.visitDetailsID = item?.visitDetailsId;
    this.iseditModeVisit = true;
    
    // Set selected organization
    this.selectedOrganization = item?.organizationId
    // Set selectedItems array for ng-multiselect-dropdown
    this.onSearchChange(item.organizationName?.substring(0, 2) || '');
    this.selectedItems = this.selectedOrganization ? [this.selectedOrganization] : [];
    
    // Convert resource IDs to objects for multiselect
    const selectedResources = item?.resourceNames?.map((name: any) => 
      this.resourceList.find((r: any) => r.name === name)
    ).filter((r: any) => r !== undefined) || [];
    console.log('Selected Resources for Edit:', selectedResources);
    this.visitForm.patchValue({
      organizationId: item?.organizationId || 0,
      subActivityId: item?.subActivityId || Number(this.selectedBudgetHead),
      dateOfVisit: item?.dateOfVisit ? this.convertToISOFormat(item.dateOfVisit) : '',
      timeOfVisit: item?.timeOfVisit || '',
      nonTrainingResourceIds: selectedResources,
      state: item?.state || 'Telangana',
      district: item?.district || '',
      mandal: item?.mandal || '',
      town: item?.town || '',
      streetNo: item?.streetNo || '',
      houseNo: item?.houseNo || '',
      latitude: item?.latitude || '',
      longitude: item?.longitude || '',
      contactNo: item?.contactNo || '',
      email: item?.email || '',
      withInHyderabad: item?.withInHyderabad ?? true
    });
    
    // Load mandals
    if (item?.district) {
      this.GetMandalByDistrict({ target: { value: item.district } });
    }
  }
  
  this.modalService.openModal(this.addVisitDetailsModal, {
    centered: true,
    size: 'xl',
    scrollable: true
  });
}

// Get Visit Details
getVisitDetailsList() {
  this.visitDetailsList = [];
  this._commonService.getDataByUrl(APIS.nontrainingtargets.citd.getVisitDetailsBySubActivity+`${this.selectedBudgetHead}`).subscribe({
    next: (res: any) => {
      this.visitDetailsList = res.data || [];
    },
    error: (err) => {
      console.log(err)
      this.toastrService.error(err);
    }
  });
}


// Submit Visit Form
onSubmitVisit(): void {
  this.isSubmitted = true;
  console.log(this.visitForm.value)
  if (this.visitForm.valid) {
    // Extract resource IDs
   
    const resourceIds = this.visitForm.value.nonTrainingResourceIds.map((r: any) => r.resourceId);
   console.log('Resource IDs to submit:', resourceIds,this.MandalList.find((m:any) => {
      if(m.mandalId == this.visitForm.value.mandal){
        return m.mandalName
      }
    })?.mandalName || '');
    const payload = {
      ...this.visitForm.value,
      nonTrainingResourceIds: resourceIds,
    //   district: this.allDistricts.find((d:any) => {if(d.districtId == this.visitForm.value.district){
    //     return d.districtName
    //   }}
    // )?.districtName || '',
    //   mandal:  this.MandalList.find((m:any) => {
    //   if(m.mandalId == this.visitForm.value.mandal){
    //     return m.mandalName
    //   }
    // })?.mandalName || '',
      dateOfVisit: this.visitForm.value.dateOfVisit ? 
        moment(this.visitForm.value.dateOfVisit).format('YYYY-MM-DD') : null
    };
    
    if (this.iseditModeVisit) {
      // Update
      this._commonService.update(APIS.nontrainingtargets.citd.updateVisitDetails, payload, this.visitDetailsID).subscribe({
        next: (res: any) => {
          this.toastrService.success('Visit Details Updated Successfully', 'Success!');
          this.getVisitDetailsList();
          this.updateOrganization(payload)
          this.closeVisitModal();
        },
        error: (err) => {
          this.toastrService.error(err.message, 'Error!');
          this.isSubmitted = false;
            this.closeVisitModal();
        }
      });

    } else {
      // Save
      this._commonService.add(APIS.nontrainingtargets.citd.saveVisitDetails, payload).subscribe({
        next: (res: any) => {
           this.updateOrganization(payload)
          this.toastrService.success('Visit Details Added Successfully', 'Success!');
          this.getVisitDetailsList();
          this.closeVisitModal();
        },
        error: (err) => {
          this.toastrService.error(err.message, 'Error!');
          this.isSubmitted = false;
            this.closeVisitModal();
        }
      });
    }
  } else {
    this.toastrService.warning('Please fill all required fields', 'Validation Error!');
  }
}
updateOrganization(payload: any) {
  let payloadOrg = {
    organizationId: payload.organizationId || 0,
    stateId: payload.state || "",
    // distId: payload.district || "",
    // mandal: payload.mandal || "",
    //  distId: this.allDistricts.find((d:any) => {if(d.districtName == payload.district){
    //     return d.districtId
    //   }}
    // )?.districtId || '',

    // mandal:  this.MandalList.find((m:any) => {
    //   if(m.mandalName == payload.mandal){
    //     return m.mandalId
    //   }
    // })?.mandalId || '',
    // distId: this.allDistricts.find((d:any) => d.districtName == this.visitForm.value.district)?.districtId || '',
    // mandal: this.MandalList.find((m:any) => m.mandalName == this.visitForm.value.mandal)?.mandalId || '',

    town: payload.town || "",
    streetNo: payload.streetNo || "",
    houseNo: payload.houseNo || "",
    latitude: payload.latitude || 0,
    longitude: payload.longitude || 0,
    contactNo: payload.contactNo || 0,
    email: payload.email || "",
  };
   this._commonService.update(APIS.masterList.updateOrganization, payloadOrg, payload.organizationId).subscribe({
        next: (res: any) => {
         
        },
        error: (err) => {
          this.toastrService.error(err.message, 'Error!');
          this.isSubmitted = false;
        }
      });
}
// Delete Visit Details
deleteVisitID: any;
deleteVisitDetails(id: any): void {
  this.deleteVisitID = id;
  const modal = new bootstrap.Modal(document.getElementById('exampleModalDeleteVisit'));
  modal.show();
}

confirmDeleteVisit(id: any) {
  this._commonService.deleteId(APIS.nontrainingtargets.citd.deleteVisitDetails, id).subscribe({
    next: (data: any) => {
      this.toastrService.success('Visit Details Deleted Successfully', 'Success!');
      this.getVisitDetailsList();
      this.closeDeleteVisitModal();
    },
    error: (err) => {
      this.toastrService.error(err.message, 'Error!');
    }
  });
}

closeVisitModal(): void {
  
   this.modalService.closeModal(this.addVisitDetailsModal);
  this.visitForm.reset();
  this.selectedItems = [];
  this.isSubmitted = false;
}

closeDeleteVisitModal(): void {
  const modal = document.getElementById('exampleModalDeleteVisit');
  if (modal) {
    const modalInstance = bootstrap.Modal.getInstance(modal);
    if (modalInstance) {
      modalInstance.hide();
    }
  }
  this.deleteVisitID = '';
}

// ...existing code...
}



