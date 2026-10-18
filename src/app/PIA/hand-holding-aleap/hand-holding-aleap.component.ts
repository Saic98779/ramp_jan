import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { APIS } from '@app/constants/constants';
import { ToastrService } from 'ngx-toastr';
import { CommonServiceService } from '@app/_services/common-service.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ModalService } from '@app/_services/modal.service';

declare var bootstrap: any;

// aleapdesignstudio

// businessplan

// banknbfcfinance

// cfcsupport

// counselling

// creditcounselling

// govtschemeapplication

// govtschemefinance

// loandocumentpreparation

// machineryidentification

// marketstudy

// sectoradvisory

// tradefairparticipation

// vendorconnection

// formalisationcompliance
@Component({
  selector: 'app-hand-holding-aleap',
  templateUrl: './hand-holding-aleap.component.html',
  styleUrls: ['./hand-holding-aleap.component.css']
})
export class HandHoldingAleapComponent implements OnInit {
  @Input() activityId: any;
  @Input() subActivityId: any;
  @Input() handHoldingType: any;
  @Output() handHoldingDataChange= new EventEmitter<number>();
  @ViewChild('addHandHoldingModal') addHandHoldingModal: any;
  @ViewChild('addHandHoldingByFormaliasationModal') addHandHoldingByFormaliasationModal: any;
  @ViewChild('deleteModalTemplate') deleteModalTemplate: any;
  @ViewChild('addParticipantModalTemplate') addParticipantModalTemplate: any;
  @ViewChild('addGovtSchemesModalTemplate') addGovtSchemesModalTemplate: any;
  @ViewChild('addAccessTechnologyModalTemplate') addAccessTechnologyModalTemplate: any;
  @ViewChild('addPackagingAccessModalTemplate') addPackagingAccessModalTemplate: any;
  @ViewChild('addFinanceAccessModalTemplate') addFinanceAccessModalTemplate: any;
  @ViewChild('feasibilityInputsModalTemplate') feasibilityInputsModalTemplate: any;
  handHoldingForm!: FormGroup;
  handHoldingList: any = [];
  organizationList: any[] = [];
  participantList: any = [];
  isEditMode = false;
  isSubmitted = false;
  editingId: number | null = null;
  apiUrl = 'https://ramp-tg.metaversedu.in/workflow';
  
  uploadedFile: File | null = null;
  uploadedImage1: any  = null;
  uploadedImage2: any  = null;
  uploadedImage3: any  = null;

  handHoldingTypes = [
    { value: 'Counselling', label: 'Counselling' },
    { value: 'Mentoring', label: 'Mentoring' },
    { value: 'Training', label: 'Training' },
    { value: 'Workshop', label: 'Workshop' }
  ];
selectedAccessType: string = ''; // For radio button selection
selectedFinanceAccessType: string = '';
feasibilityInputList: any[] = [];
feasibilityInputForm!: FormGroup;
isFeasibilityFormVisible: boolean = false;
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
     private commonService: CommonServiceService,
     private toastrService: ToastrService,
        private _commonService: CommonServiceService,
    private modalService: ModalService
  ) {
    this.formDetailsforParticipant();
     this.handHoldingForm = this.fb.group({
      subjectDelivered: [''],
      originalIdea: [''],
      finalIdea: [''],
      handholdingSupportId: [null],
      organizationId: [1, Validators.required],
      counselledBy: [''],
      participantIds: [[]],
      nonTrainingActivityId: [null],
      nonTrainingSubActivityId: [null],
      handHoldingType: [''],
      counsellingDate: [''],
      counsellingTime: [''],
      bankName: [''],
      branchName: [''],
      bankRemarks: [''],
      adviseDetails: [''],
      details: [''],
      applicationNo: [''],
      applicationDate: [''],
      time: [''],
      status: [''],
      sanctionDate: [''],
      sanctionedAmount: [''],
      sanctionDetails: [''],
      govtSchemeDetails: [''],
      // New fields for vendor connection
      vendorSuggested: [''],
      quotationDate: [''],
      cost: [null],
      // New fields for machinery identification
      requirement: [''],
      existingMachinery: [''],
      suggestedMachinery: [''],
      manufacturer: [''],
      groundingDate: [''],
      placeOfInstallation: [''],
      costOfMachinery: [null],
      // New fields for CFC support
      technologyDetails: [''],
      vendorName: [''],
      vendorContactNo: [''],
      vendorEmail: [''],
      approxCost: [null],
      // ALEAP Design Studio fields
      studioAccessDate: [''],
      
      // Trade Fair Participation fields
      eventType: [''],
      eventDate: [''],
      eventLocation: [''],
      organizedBy: [''],

        // Finance Access fields
      // bankName: [''],
      // branchName: [''],
      dprSubmissionDate: [''],
      statusOfApplication: [''],
      // sanctionDetails: [''],
      // sanctionDate: [''],
      // sanctionedAmount: [''],
      // counselledBy: [''],
      // subjectDelivered: [''],
      schemeName: [''],
    });
    console.log('Activity ID:', this.activityId);
    console.log('Sub Activity ID:', this.subActivityId);
    console.log('Hand Holding Type:', this.handHoldingType);
  }
  handHoldingTypeOptions:any = 
  {
    counselling: 'Counselling',
    businessplan: 'Business Plan',
    sectoradvisory: 'Advisory',
    marketstudy: 'Market Study'
  }

// In ngOnInit or constructor, initialize the feasibility input form
initializeFeasibilityInputForm() {
  this.feasibilityInputForm = this.fb.group({
    feasibilityInputId: [null],
    inputDetails: ['', [Validators.required, Validators.minLength(5)]],
    source: ['', Validators.required],
    sector: ['', [Validators.required, Validators.minLength(3)]],
    feasibilityActivity: ['', [Validators.required, Validators.minLength(3)]]
  });
}

selectedPackagingAccessType: string = '';
  ngOnInit(): void {
    // this.formDetails()
    this.loadHandHoldingData();
    this.loadOrganizations();
    this.initializeFeasibilityInputForm();
    // this.loadParticipants();
  }
  ngOnChanges(): void {
    console.log('Activity ID changed:', this.activityId);
    console.log('Sub Activity ID changed:', this.subActivityId);
    console.log('Hand Holding Type changed:', this.handHoldingType);
    
    if (this.activityId && this.subActivityId && this.handHoldingType) {
      this.addFieldsDynamically()
      this.handHoldingForm.patchValue({
        nonTrainingActivityId: this.activityId,
        nonTrainingSubActivityId: this.subActivityId,
        handHoldingType: this.handHoldingType
      });
      this.loadHandHoldingData();
    }
  }
//  addFieldsDynamically(){
//   // Clear all validators
//   this.handHoldingForm.get('subjectDelivered')?.clearValidators();
//   this.handHoldingForm.get('originalIdea')?.clearValidators();
//   this.handHoldingForm.get('finalIdea')?.clearValidators();
//   this.handHoldingForm.get('bankName')?.clearValidators();
//   this.handHoldingForm.get('branchName')?.clearValidators();
//   this.handHoldingForm.get('bankRemarks')?.clearValidators();
//   this.handHoldingForm.get('adviseDetails')?.clearValidators();
//   this.handHoldingForm.get('details')?.clearValidators();
//   this.handHoldingForm.get('counselledBy')?.clearValidators();
//   this.handHoldingForm.get('participantIds')?.clearValidators();
//   this.handHoldingForm.get('counsellingDate')?.clearValidators();
//   this.handHoldingForm.get('counsellingTime')?.clearValidators();
//   this.handHoldingForm.get('applicationNo')?.clearValidators();
//   this.handHoldingForm.get('applicationDate')?.clearValidators();
//   this.handHoldingForm.get('time')?.clearValidators();
//   this.handHoldingForm.get('status')?.clearValidators();
//   this.handHoldingForm.get('sanctionDate')?.clearValidators();
//   this.handHoldingForm.get('sanctionedAmount')?.clearValidators();
//   this.handHoldingForm.get('sanctionDetails')?.clearValidators();
//   this.handHoldingForm.get('govtSchemeDetails')?.clearValidators();
  
//   // Clear all values
//   this.handHoldingForm.get('subjectDelivered')?.patchValue('');
//   this.handHoldingForm.get('originalIdea')?.patchValue('');
//   this.handHoldingForm.get('finalIdea')?.patchValue('');
//   this.handHoldingForm.get('bankName')?.patchValue('');
//   this.handHoldingForm.get('branchName')?.patchValue('');
//   this.handHoldingForm.get('bankRemarks')?.patchValue('');
//   this.handHoldingForm.get('adviseDetails')?.patchValue('');
//   this.handHoldingForm.get('details')?.patchValue('');
//   this.handHoldingForm.get('applicationNo')?.patchValue('');
//   this.handHoldingForm.get('applicationDate')?.patchValue('');
//   this.handHoldingForm.get('time')?.patchValue('');
//   this.handHoldingForm.get('status')?.patchValue('');
//   this.handHoldingForm.get('sanctionDate')?.patchValue('');
//   this.handHoldingForm.get('sanctionedAmount')?.patchValue('');
//   this.handHoldingForm.get('sanctionDetails')?.patchValue('');
//   this.handHoldingForm.get('govtSchemeDetails')?.patchValue('');
  
//   // Set validators based on type
//   if(this.handHoldingType=='counselling'){
//     this.handHoldingForm.get('counselledBy')?.setValidators([Validators.required]);
//     this.handHoldingForm.get('participantIds')?.setValidators([Validators.required]);
//     this.handHoldingForm.get('counsellingDate')?.setValidators([Validators.required]);
//     this.handHoldingForm.get('counsellingTime')?.setValidators([Validators.required]);
//     this.handHoldingForm.get('subjectDelivered')?.setValidators([Validators.required, Validators.minLength(3)]);
//     this.handHoldingForm.get('originalIdea')?.setValidators([Validators.required, Validators.minLength(3)]);
//     this.handHoldingForm.get('finalIdea')?.setValidators([Validators.required, Validators.minLength(3)]);
//   }
//   else if(this.handHoldingType=='businessplan'){
//     this.handHoldingForm.get('counselledBy')?.setValidators([Validators.required]);
//     this.handHoldingForm.get('participantIds')?.setValidators([Validators.required]);
//     this.handHoldingForm.get('counsellingDate')?.setValidators([Validators.required]);
//     this.handHoldingForm.get('counsellingTime')?.setValidators([Validators.required]);
//     this.handHoldingForm.get('bankName')?.setValidators([Validators.required, Validators.minLength(3)]);
//     this.handHoldingForm.get('branchName')?.setValidators([Validators.required, Validators.minLength(3)]);
//     this.handHoldingForm.get('bankRemarks')?.setValidators([Validators.required, Validators.minLength(5)]);
//   }
//   else if(this.handHoldingType=='sectoradvisory'){
//     this.handHoldingForm.get('counselledBy')?.setValidators([Validators.required]);
//     this.handHoldingForm.get('participantIds')?.setValidators([Validators.required]);
//     this.handHoldingForm.get('counsellingDate')?.setValidators([Validators.required]);
//     this.handHoldingForm.get('counsellingTime')?.setValidators([Validators.required]);
//     this.handHoldingForm.get('adviseDetails')?.setValidators([Validators.required, Validators.minLength(5)]);
//   }
//   else if(this.handHoldingType=='formalisationcompliance'){
//     this.handHoldingForm.get('details')?.setValidators([Validators.required, Validators.minLength(5)]);
//   }
//   else if(this.handHoldingType=='marketstudy'){
//     this.handHoldingForm.get('counselledBy')?.setValidators([Validators.required]);
//     this.handHoldingForm.get('participantIds')?.setValidators([Validators.required]);
//     this.handHoldingForm.get('counsellingDate')?.setValidators([Validators.required]);
//     this.handHoldingForm.get('counsellingTime')?.setValidators([Validators.required]);
//   }
//   else if(this.handHoldingType=='govtschemeapplication'){
//     this.handHoldingForm.get('applicationNo')?.setValidators([Validators.required, Validators.minLength(3)]);
//     this.handHoldingForm.get('applicationDate')?.setValidators([Validators.required]);
//     this.handHoldingForm.get('time')?.setValidators([Validators.required]);
//     this.handHoldingForm.get('status')?.setValidators([Validators.required]);
//     this.handHoldingForm.get('govtSchemeDetails')?.setValidators([Validators.required, Validators.minLength(10)]);
//   }
  
//   // Update validity for all fields
//   Object.keys(this.handHoldingForm.controls).forEach(key => {
//     this.handHoldingForm.get(key)?.updateValueAndValidity();
//   });

//   // Add dynamic validators for government schemes based on status
//   if(this.handHoldingType=='govtschemeapplication'){
//     this.handHoldingForm.get('status')?.valueChanges.subscribe(status => {
//       if(status === 'APPROVED'){
//         this.handHoldingForm.get('sanctionDate')?.setValidators([Validators.required]);
//         this.handHoldingForm.get('sanctionedAmount')?.setValidators([Validators.required, Validators.min(1)]);
//         this.handHoldingForm.get('sanctionDetails')?.setValidators([Validators.required, Validators.minLength(5)]);
//       } else {
//         this.handHoldingForm.get('sanctionDate')?.clearValidators();
//         this.handHoldingForm.get('sanctionedAmount')?.clearValidators();
//         this.handHoldingForm.get('sanctionDetails')?.clearValidators();
//       }
//       this.handHoldingForm.get('sanctionDate')?.updateValueAndValidity();
//       this.handHoldingForm.get('sanctionedAmount')?.updateValueAndValidity();
//       this.handHoldingForm.get('sanctionDetails')?.updateValueAndValidity();
//     });
//   }
// }
 addFieldsDynamically() {
    // Clear all validators
    this.handHoldingForm.get('subjectDelivered')?.clearValidators();
    this.handHoldingForm.get('originalIdea')?.clearValidators();
    this.handHoldingForm.get('finalIdea')?.clearValidators();
    this.handHoldingForm.get('bankName')?.clearValidators();
    this.handHoldingForm.get('branchName')?.clearValidators();
    this.handHoldingForm.get('bankRemarks')?.clearValidators();
    this.handHoldingForm.get('adviseDetails')?.clearValidators();
    this.handHoldingForm.get('details')?.clearValidators();
    this.handHoldingForm.get('counselledBy')?.clearValidators();
    this.handHoldingForm.get('participantIds')?.clearValidators();
    this.handHoldingForm.get('counsellingDate')?.clearValidators();
    this.handHoldingForm.get('counsellingTime')?.clearValidators();
    this.handHoldingForm.get('applicationNo')?.clearValidators();
    this.handHoldingForm.get('applicationDate')?.clearValidators();
    this.handHoldingForm.get('time')?.clearValidators();
    this.handHoldingForm.get('status')?.clearValidators();
    this.handHoldingForm.get('sanctionDate')?.clearValidators();
    this.handHoldingForm.get('sanctionedAmount')?.clearValidators();
    this.handHoldingForm.get('sanctionDetails')?.clearValidators();
    this.handHoldingForm.get('govtSchemeDetails')?.clearValidators();
    
    // Clear new fields
    this.handHoldingForm.get('vendorSuggested')?.clearValidators();
    this.handHoldingForm.get('quotationDate')?.clearValidators();
    this.handHoldingForm.get('cost')?.clearValidators();
    this.handHoldingForm.get('requirement')?.clearValidators();
    this.handHoldingForm.get('existingMachinery')?.clearValidators();
    this.handHoldingForm.get('suggestedMachinery')?.clearValidators();
    this.handHoldingForm.get('manufacturer')?.clearValidators();
    this.handHoldingForm.get('groundingDate')?.clearValidators();
    this.handHoldingForm.get('placeOfInstallation')?.clearValidators();
    this.handHoldingForm.get('costOfMachinery')?.clearValidators();
    this.handHoldingForm.get('technologyDetails')?.clearValidators();
    this.handHoldingForm.get('vendorName')?.clearValidators();
    this.handHoldingForm.get('vendorContactNo')?.clearValidators();
    this.handHoldingForm.get('vendorEmail')?.clearValidators();
    this.handHoldingForm.get('approxCost')?.clearValidators();
    // alleap design studio fields
      this.handHoldingForm.get('studioAccessDate')?.clearValidators();
    this.handHoldingForm.get('eventType')?.clearValidators();
    this.handHoldingForm.get('eventDate')?.clearValidators();
    this.handHoldingForm.get('eventLocation')?.clearValidators();
    this.handHoldingForm.get('organizedBy')?.clearValidators();

    // Clear all values
    this.handHoldingForm.get('subjectDelivered')?.patchValue('');
    this.handHoldingForm.get('originalIdea')?.patchValue('');
    this.handHoldingForm.get('finalIdea')?.patchValue('');
    this.handHoldingForm.get('bankName')?.patchValue('');
    this.handHoldingForm.get('branchName')?.patchValue('');
    this.handHoldingForm.get('bankRemarks')?.patchValue('');
    this.handHoldingForm.get('adviseDetails')?.patchValue('');
    this.handHoldingForm.get('details')?.patchValue('');
    this.handHoldingForm.get('applicationNo')?.patchValue('');
    this.handHoldingForm.get('applicationDate')?.patchValue('');
    this.handHoldingForm.get('time')?.patchValue('');
    this.handHoldingForm.get('status')?.patchValue('');
    this.handHoldingForm.get('sanctionDate')?.patchValue('');
    this.handHoldingForm.get('sanctionedAmount')?.patchValue('');
    this.handHoldingForm.get('sanctionDetails')?.patchValue('');
    this.handHoldingForm.get('govtSchemeDetails')?.patchValue('');
    
    // Clear new fields
    this.handHoldingForm.get('vendorSuggested')?.patchValue('');
    this.handHoldingForm.get('quotationDate')?.patchValue('');
    this.handHoldingForm.get('cost')?.patchValue(null);
    this.handHoldingForm.get('requirement')?.patchValue('');
    this.handHoldingForm.get('existingMachinery')?.patchValue('');
    this.handHoldingForm.get('suggestedMachinery')?.patchValue('');
    this.handHoldingForm.get('manufacturer')?.patchValue('');
    this.handHoldingForm.get('groundingDate')?.patchValue('');
    this.handHoldingForm.get('placeOfInstallation')?.patchValue('');
    this.handHoldingForm.get('costOfMachinery')?.patchValue(null);
    this.handHoldingForm.get('technologyDetails')?.patchValue('');
    this.handHoldingForm.get('vendorName')?.patchValue('');
    this.handHoldingForm.get('vendorContactNo')?.patchValue('');
    this.handHoldingForm.get('vendorEmail')?.patchValue('');
    this.handHoldingForm.get('approxCost')?.patchValue(null);

      // Clear values
    this.handHoldingForm.get('studioAccessDate')?.patchValue('');
    this.handHoldingForm.get('eventType')?.patchValue('');
    this.handHoldingForm.get('eventDate')?.patchValue('');
    this.handHoldingForm.get('eventLocation')?.patchValue('');
    this.handHoldingForm.get('organizedBy')?.patchValue('');

     this.handHoldingForm.get('bankName')?.clearValidators();
    this.handHoldingForm.get('branchName')?.clearValidators();
    this.handHoldingForm.get('dprSubmissionDate')?.clearValidators();
    this.handHoldingForm.get('statusOfApplication')?.clearValidators();
    this.handHoldingForm.get('counsellingDate')?.clearValidators();
    this.handHoldingForm.get('counsellingTime')?.clearValidators();
    this.handHoldingForm.get('schemeName')?.clearValidators();

    // Clear finance values
    this.handHoldingForm.get('bankName')?.patchValue('');
    this.handHoldingForm.get('branchName')?.patchValue('');
    this.handHoldingForm.get('dprSubmissionDate')?.patchValue('');
    this.handHoldingForm.get('statusOfApplication')?.patchValue('');
    this.handHoldingForm.get('sanctionDetails')?.patchValue('');
    this.handHoldingForm.get('sanctionDate')?.patchValue('');
    this.handHoldingForm.get('sanctionedAmount')?.patchValue('');
    this.handHoldingForm.get('counsellingDate')?.patchValue('');
    this.handHoldingForm.get('counsellingTime')?.patchValue('');
    this.handHoldingForm.get('subjectDelivered')?.patchValue('');
    this.handHoldingForm.get('schemeName')?.patchValue('');

    // Set validators based on type
    if (this.handHoldingType == 'counselling') {
      this.handHoldingForm.get('counselledBy')?.setValidators([Validators.required]);
      this.handHoldingForm.get('participantIds')?.setValidators([Validators.required]);
      this.handHoldingForm.get('counsellingDate')?.setValidators([Validators.required]);
      this.handHoldingForm.get('counsellingTime')?.setValidators([Validators.required]);
      this.handHoldingForm.get('subjectDelivered')?.setValidators([Validators.required, Validators.minLength(3)]);
      this.handHoldingForm.get('originalIdea')?.setValidators([Validators.required, Validators.minLength(3)]);
      this.handHoldingForm.get('finalIdea')?.setValidators([Validators.required, Validators.minLength(3)]);
    }
    else if (this.handHoldingType == 'businessplan') {
      this.handHoldingForm.get('counselledBy')?.setValidators([Validators.required]);
      this.handHoldingForm.get('participantIds')?.setValidators([Validators.required]);
      this.handHoldingForm.get('counsellingDate')?.setValidators([Validators.required]);
      this.handHoldingForm.get('counsellingTime')?.setValidators([Validators.required]);
      this.handHoldingForm.get('bankName')?.setValidators([Validators.required, Validators.minLength(3)]);
      this.handHoldingForm.get('branchName')?.setValidators([Validators.required, Validators.minLength(3)]);
      this.handHoldingForm.get('bankRemarks')?.setValidators([Validators.required, Validators.minLength(5)]);
    }
    else if (this.handHoldingType == 'sectoradvisory') {
      this.handHoldingForm.get('counselledBy')?.setValidators([Validators.required]);
      this.handHoldingForm.get('participantIds')?.setValidators([Validators.required]);
      this.handHoldingForm.get('counsellingDate')?.setValidators([Validators.required]);
      this.handHoldingForm.get('counsellingTime')?.setValidators([Validators.required]);
      this.handHoldingForm.get('adviseDetails')?.setValidators([Validators.required, Validators.minLength(5)]);
    }
    else if (this.handHoldingType == 'formalisationcompliance') {
      // this.handHoldingForm.get('details')?.setValidators([]);
    }
    else if (this.handHoldingType == 'marketstudy') {
      this.handHoldingForm.get('counselledBy')?.setValidators([Validators.required]);
      this.handHoldingForm.get('participantIds')?.setValidators([Validators.required]);
      this.handHoldingForm.get('counsellingDate')?.setValidators([Validators.required]);
      this.handHoldingForm.get('counsellingTime')?.setValidators([Validators.required]);
    }
    else if (this.handHoldingType == 'govtschemeapplication') {
      this.handHoldingForm.get('applicationNo')?.setValidators([Validators.required, Validators.minLength(3)]);
      this.handHoldingForm.get('applicationDate')?.setValidators([Validators.required]);
      this.handHoldingForm.get('time')?.setValidators([Validators.required]);
      this.handHoldingForm.get('status')?.setValidators([Validators.required]);
      this.handHoldingForm.get('govtSchemeDetails')?.setValidators([Validators.required, Validators.minLength(10)]);
    }
    else if (this.handHoldingType == 'AccessToTechnologyAndInfrastructure') {
      if(this.selectedAccessType === 'vendorconnection') {
        // Vendor Connection validators
      this.handHoldingForm.get('vendorSuggested')?.setValidators([Validators.required, Validators.minLength(3)]);
      this.handHoldingForm.get('quotationDate')?.setValidators([Validators.required]);
      // this.handHoldingForm.get('details')?.setValidators([Validators.required, Validators.minLength(10)]);
      this.handHoldingForm.get('cost')?.setValidators([Validators.required, Validators.min(1)]);
      }
       else if (this.selectedAccessType == 'machineryidentification') {
      // Machinery Identification validators
      this.handHoldingForm.get('requirement')?.setValidators([Validators.required, Validators.minLength(10)]);
      this.handHoldingForm.get('existingMachinery')?.setValidators([Validators.required, Validators.minLength(3)]);
      this.handHoldingForm.get('suggestedMachinery')?.setValidators([Validators.required, Validators.minLength(3)]);
      this.handHoldingForm.get('manufacturer')?.setValidators([Validators.required, Validators.minLength(3)]);
      this.handHoldingForm.get('groundingDate')?.setValidators([Validators.required]);
      this.handHoldingForm.get('placeOfInstallation')?.setValidators([Validators.required, Validators.minLength(5)]);
      this.handHoldingForm.get('costOfMachinery')?.setValidators([Validators.required, Validators.min(1)]);
    }
    else if (this.selectedAccessType == 'cfcsupport') {
      // CFC Support validators
      this.handHoldingForm.get('technologyDetails')?.setValidators([Validators.required, Validators.minLength(10)]);
      this.handHoldingForm.get('vendorName')?.setValidators([Validators.required, Validators.minLength(3)]);
      this.handHoldingForm.get('vendorContactNo')?.setValidators([Validators.required, Validators.pattern(/^[6789]\d{9}$/)]);
      this.handHoldingForm.get('vendorEmail')?.setValidators([Validators.required, Validators.email]);
      this.handHoldingForm.get('approxCost')?.setValidators([Validators.required, Validators.min(1)]);
    }

      
    }
    else if (this.handHoldingType == 'AccessToFinance') {
      if (this.selectedFinanceAccessType === 'banknbfcfinance') {
        this.handHoldingForm.get('bankName')?.setValidators([Validators.required, Validators.minLength(3)]);
        this.handHoldingForm.get('branchName')?.setValidators([Validators.required, Validators.minLength(3)]);
        this.handHoldingForm.get('dprSubmissionDate')?.setValidators([Validators.required]);
        this.handHoldingForm.get('statusOfApplication')?.setValidators([Validators.required]);
        // this.handHoldingForm.get('details')?.setValidators([Validators.required, Validators.minLength(10)]);
      } else if (this.selectedFinanceAccessType === 'creditcounselling') {
        this.handHoldingForm.get('counselledBy')?.setValidators([Validators.required]);
        this.handHoldingForm.get('participantIds')?.setValidators([Validators.required]);
        this.handHoldingForm.get('counsellingDate')?.setValidators([Validators.required]);
        this.handHoldingForm.get('counsellingTime')?.setValidators([Validators.required]);
        this.handHoldingForm.get('subjectDelivered')?.setValidators([Validators.required, Validators.minLength(10)]);
      } else if (this.selectedFinanceAccessType === 'govtschemefinance') {
        this.handHoldingForm.get('schemeName')?.setValidators([Validators.required, Validators.minLength(3)]);
        this.handHoldingForm.get('statusOfApplication')?.setValidators([Validators.required]);
        // this.handHoldingForm.get('applicationDate')?.setValidators(null);
        // this.handHoldingForm.get('time')?.setValidators(null);
        // this.handHoldingForm.get('details')?.setValidators([Validators.required, Validators.minLength(10)]);
      }
    }
     else if (this.handHoldingType == 'aleapdesignstudio') {
      if (this.selectedPackagingAccessType === 'tradefairparticipation') {
        // this.handHoldingForm.get('participantIds')?.setValidators([Validators.required]);
        this.handHoldingForm.get('eventType')?.setValidators([Validators.required]);
        this.handHoldingForm.get('eventDate')?.setValidators([Validators.required]);
        this.handHoldingForm.get('eventLocation')?.setValidators([Validators.required, Validators.minLength(5)]);
        this.handHoldingForm.get('organizedBy')?.setValidators([Validators.required, Validators.minLength(3)]);
      } else if (this.selectedPackagingAccessType === 'aleapdesignstudio') {
        // this.handHoldingForm.get('participantIds')?.setValidators([Validators.required]);
        this.handHoldingForm.get('studioAccessDate')?.setValidators([Validators.required]);
        // this.handHoldingForm.get('details')?.setValidators([Validators.required, Validators.minLength(10)]);
      }
    }
   

    // Update validity for all fields
    Object.keys(this.handHoldingForm.controls).forEach(key => {
      this.handHoldingForm.get(key)?.updateValueAndValidity();
    });

    // Add dynamic validators for government schemes based on status
    if (this.handHoldingType == 'govtschemeapplication') {
      this.handHoldingForm.get('status')?.valueChanges.subscribe(status => {
        if (status === 'APPROVED') {
          this.handHoldingForm.get('sanctionDate')?.setValidators([Validators.required]);
          this.handHoldingForm.get('sanctionedAmount')?.setValidators([Validators.required, Validators.min(1)]);
          // this.handHoldingForm.get('sanctionDetails')?.setValidators([Validators.required, Validators.minLength(5)]);
        } else {
          this.handHoldingForm.get('sanctionDate')?.clearValidators();
          this.handHoldingForm.get('sanctionedAmount')?.clearValidators();
          this.handHoldingForm.get('sanctionDetails')?.clearValidators();
        }
        this.handHoldingForm.get('sanctionDate')?.updateValueAndValidity();
        this.handHoldingForm.get('sanctionedAmount')?.updateValueAndValidity();
        this.handHoldingForm.get('sanctionDetails')?.updateValueAndValidity();
      });
    }
      if (this.handHoldingType == 'AccessToFinance') {
      this.handHoldingForm.get('statusOfApplication')?.valueChanges.subscribe(status => {
        if (status === 'APPROVED') {
          this.handHoldingForm.get('sanctionDate')?.setValidators([Validators.required]);
          this.handHoldingForm.get('sanctionedAmount')?.setValidators([Validators.required, Validators.min(1)]);
          // this.handHoldingForm.get('sanctionDetails')?.setValidators([Validators.required, Validators.minLength(5)]);
        } else {
          this.handHoldingForm.get('sanctionDate')?.clearValidators();
          this.handHoldingForm.get('sanctionedAmount')?.clearValidators();
          this.handHoldingForm.get('sanctionDetails')?.clearValidators();
        }
        this.handHoldingForm.get('sanctionDate')?.updateValueAndValidity();
        this.handHoldingForm.get('sanctionedAmount')?.updateValueAndValidity();
        this.handHoldingForm.get('sanctionDetails')?.updateValueAndValidity();
      });
    }
  }
 


  get f() {
    return this.handHoldingForm.controls;
  }

  loadHandHoldingData(): void {
     this.handHoldingList=[]
    const params = {
      type: 'counselling',
      id: '',
      subActivityId: ''
    };
     // For Access to Technology & Infrastructure, use the specific type
    if (this.handHoldingType === 'AccessToTechnologyAndInfrastructure' ) {
       this._commonService.getDataByUrl(APIS.nontrainingtargets.aleap.getHandHoldingData+'?type=accesstotechnology'+'&subActivityId='+this.subActivityId).subscribe({
       next: (response) => {
         this.handHoldingList = response.data || [];
       },
       error: (error) => {
         this.toastrService.error('Failed to load vendor details', 'Non Training Progress Data Error!');
         console.error('Load vendor data error:', error);
       }
     });
    }
    else if (this.handHoldingType === 'aleapdesignstudio') {
      this._commonService.getDataByUrl(APIS.nontrainingtargets.aleap.getHandHoldingData + '?type=accesstopackaginglabellingandbranding' + '&subActivityId=' + this.subActivityId).subscribe({
        next: (response) => {
          this.handHoldingList = response.data || [];
        },
        error: (error) => {
          this.toastrService.error('Failed to load data', 'Data Error!');
          console.error('Load data error:', error);
        }
      });
    }
     else if (this.handHoldingType === 'AccessToFinance') {
      this._commonService.getDataByUrl(APIS.nontrainingtargets.aleap.getHandHoldingData + '?type=accesstofinance' + '&subActivityId=' + this.subActivityId).subscribe({
        next: (response) => {
          this.handHoldingList = response.data || [];
        },
        error: (error) => {
          this.toastrService.error('Failed to load data', 'Data Error!');
        }
      });
    }
    else{
       this._commonService.getDataByUrl(APIS.nontrainingtargets.aleap.getHandHoldingData+'?type=' + this.handHoldingType+'&subActivityId='+this.subActivityId).subscribe({
       next: (response) => {
         this.handHoldingList = response.data || [];
       },
       error: (error) => {
         this.toastrService.error('Failed to load vendor details', 'Non Training Progress Data Error!');
         console.error('Load vendor data error:', error);
       }
     });
    }
    
   
  }
 
 onFinanceAccessTypeChange(type: string): void {
    this.selectedFinanceAccessType = type;
    this.addFieldsDynamically();
  }
  // loadOrganizations(): void {
  //   this.http.get<any>(`${this.apiUrl}/organization-name`).subscribe({
  //     next: (response) => {
  //       this.organizationList = response;
  //     },
  //     error: (error) => {
  //       console.error('Error loading organizations:', error);
  //     }
  //   });
  // }
 // Dropdown Settings for Organization
 dropdownListOrg: any = [];
 dropdownSettingsOrg: IDropdownSettings = {};
  assignFluidData1Org() {
    this.dropdownSettingsOrg = {
      singleSelection: true,
      idField: 'organizationId',
      textField: 'organizationName',
      itemsShowLimit: 1,
      allowSearchFilter: true,
      clearSearchFilter: true,
      maxHeight: 197,
      searchPlaceholderText: "Search SHG/StartUp",
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
  OrganizationData: any[] = []
  filteredOrganizationData: any = []
  searchValue: boolean = true;
  loadOrganizations(Orgvalue?:any) {
    this._commonService.getDataByUrl(APIS.participantdata.getOrgnizationDataOnlyPagination + '?page=0&size=500').subscribe({
      next: (res: any) => {
        this.OrganizationData = res?.data;
        this.filteredOrganizationData = this.OrganizationData.slice();
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
    // loadOrganizations() {
    //   this._commonService.getDataByUrl(APIS.participantdata.getOrgnizationDataOnlyId).subscribe({
    //     next: (res: any) => {
    //       this.OrganizationData = res?.data
    //       this.filteredOrganizationData = this.OrganizationData.slice()
    //       this.assignFluidData1Org()
    //       // this.submitedData=res?.data?.data
    //       // this.advanceSearch(this.getSelDataRange);
    //       // modal.close()
  
    //     },
    //     error: (err) => {
    //       this.toastrService.error(err.message, "Organization Data Error!");
    //       new Error(err);
    //     },
    //   });
    // }
    // Handle organization selection
// Handle resource selection
onOrganizationSelect(item: any) {
  console.log('Resource selected:', item);
  this.handHoldingForm.patchValue({
    participantIds: []
  });
  this.loadParticipants(item);
}

    filteredParticipantData: any = []
 loadParticipants(organizationid:any): void {
  this.participantList = [];
  console.log('Organization Data for Participants:', organizationid);
  this._commonService.getDataByUrl(APIS.participantdata.getParticipantNonTrainingbyOrgainizationId+organizationid).subscribe({
    next: (res: any) => {
      // Transform data to have a unified ID field
      this.participantList = res?.data.map((item: any) => ({
        id: item.participantId || item.influencedId, // Use whichever is available
        participantId: item.participantId,
        influencedId: item.influencedId,
        participantName: item.participantName,
        type: item.participantId ? 'participant' : 'influenced' // Track the type
      }));
      this.filteredParticipantData = this.participantList.slice();
      console.log('Participant List:', this.participantList);

      this.assignResourceDropdownSettings();
    },
    error: (err) => {
      this.toastrService.error(err.message, "Participants Data Error!");
      new Error(err);
    },
  });
}
// Resource Dropdown Settings
dropdownSettingsResource: IDropdownSettings = {};
dropdownListResource: any = [];
assignResourceDropdownSettings() {
  this.dropdownSettingsResource = {
    singleSelection: false,
    idField: 'id', // Use the unified ID field
    textField: 'participantName',
    itemsShowLimit: 2,
    enableCheckAll: true,
    selectAllText: "Select All Participants",
    unSelectAllText: "Clear All",
    allowSearchFilter: true,
    clearSearchFilter: true,
    maxHeight: 197,
    searchPlaceholderText: "Search Participants",
    noDataAvailablePlaceholderText: "No Participants Available",
    closeDropDownOnSelection: false,
    showSelectedItemsAtTop: false,
    defaultOpen: false,
  };
  this.dropdownListResource = this.participantList;
}

// Handle resource selection
onItemSelectResource(item: any) {
  console.log('Resource selected:', item);
}

onItemDeSelectResource(item: any) {
  console.log('Resource deselected:', item);
}
convertToISOFormat(date: string): string {   
  if(date) {
    const [day, month, year] = date.split('-');
     console.log('Converted date:', date,`${year}/${month}/${day}`);
    return `${year}-${month}-${day}`; // Convert to yyyy-MM-dd format
  }
  else{
    return '';
  }

}
  // openModal(mode: string, item?: any): void {
  //   this.isEditMode = mode === 'edit';
  //   this.isSubmitted = false;
    
  //   this.uploadedFilesHandHolding=null
  //  if (this.isEditMode && item) {
  //     if(this.handHoldingType=='counselling' ){
  //       this.editingId = item.counselletingId || null;
  //     }
  //     else if(this.handHoldingType=='businessplan'){
  //       this.editingId = item.businessPlanId || null;
  //       this.uploadedFilesHandHolding=item?.planFileUploadPath
  //     }
  //     else if(this.handHoldingType=='sectoradvisory'){
  //       this.editingId = item.sectorAdvisoryId || null;
  //     }
  //     else if(this.handHoldingType=='marketstudy'){
  //       this.editingId = item.marketStudyId || null;
  //     }
  //     else if(this.handHoldingType=='formalisationcompliance'){
  //       this.editingId = item.formalisationComplianceId || null;
  //       this.uploadedFilesHandHolding=item?.documentPath
  //     }
  //     else{
  //       this.editingId = item.counselletingId || null;
  //     }
     
  //     this.addFieldsDynamically()
  //     this.handHoldingForm.patchValue(item);
      
  //     // Only process participants for non-formalisation types
  //     if(this.handHoldingType !== 'formalisationcompliance') {
  //       const selectedResources = item?.participantNames?.map((name: any) => 
  //         this.participantList.find((r: any) => r.participantName === name)
  //       ).filter((r: any) => r !== undefined) || [];
        
  //       this.handHoldingForm.patchValue({
  //         counsellingDate: item?.counsellingDate ? this.convertToISOFormat(item.counsellingDate) : null,
  //         participantIds: selectedResources,
  //         organizationId: this.OrganizationData.find(org => org.organizationId == item.organizationId) ? [this.OrganizationData.find(org => org.organizationId ===item.organizationId)] : []
  //       });
  //     } else {
  //       // For formalisation compliance, only set organization
  //       this.handHoldingForm.patchValue({
  //         organizationId: this.OrganizationData.find(org => org.organizationId == item.organizationId) ? [this.OrganizationData.find(org => org.organizationId ===item.organizationId)] : []
  //       });
  //     }
  //   } else {
  //     this.resetForm();
  //   }
  //    setTimeout(() => {
  //      const fileInput = document.getElementById('fileInput') as HTMLInputElement;
  //      if (fileInput) {
  //        fileInput.value = '';
  //      }
  //    }, 100);
  //     setTimeout(() => {
  //      const fileInput = document.getElementById('image1Input') as HTMLInputElement;
  //      const fileInput2 = document.getElementById('image2Input') as HTMLInputElement;
  //      const fileInput3 = document.getElementById('image3Input') as HTMLInputElement;
  //      if (fileInput) {
  //        fileInput.value = '';
  //      }
  //      if(fileInput2){
  //        fileInput2.value = '';
  //      }
  //      if(fileInput3){
  //        fileInput3.value = '';
  //      }
  //    }, 100);
  //   if(this.handHoldingType=='formalisationcompliance'){
  //     const modalElement = document.getElementById('addHandHoldingByFormaliasation');
  //   const modal = new bootstrap.Modal(modalElement);
  //   modal.show();
  //   }
  //   else{
  //     const modalElement = document.getElementById('addHandHolding');
  //   const modal = new bootstrap.Modal(modalElement);
  //   modal.show();
  //   }
    
  // }
  openModal(mode: string, item?: any): void {
    this.closeModal(); // Close any existing modals
  this.isEditMode = mode === 'edit';
  this.isSubmitted = false;
  
  this.uploadedFilesHandHolding=null;
  this.filteredOrganizationData = this.OrganizationData.slice();

  if (this.isEditMode && item) {
      this.onSearchChange(item.organizationName?.substring(0, 2) || '');
      this.loadParticipants(item?.organizationId); // Load participants based on the organization's ID
    if(this.handHoldingType=='counselling'){
      this.editingId = item.counselletingId || null;
    }
    else if(this.handHoldingType=='businessplan'){
      this.editingId = item.businessPlanId || null;
      this.uploadedFilesHandHolding=item?.planFileUploadPath;
    }
    else if(this.handHoldingType=='sectoradvisory'){
      this.editingId = item.sectorAdvisoryId || null;
    }
    else if(this.handHoldingType=='marketstudy'){
      this.editingId = item.marketStudyId || null;
      this.feasibilityInputList=item?.feasibilityInputResponses || [];
    }
    else if(this.handHoldingType=='formalisationcompliance'){
      this.editingId = item.formalisationComplianceId || null;
      this.uploadedFilesHandHolding=item?.documentPath;
    }
    else if(this.handHoldingType=='govtschemeapplication'){
      this.editingId = item.govtSchemeApplicationId || null;
    }
     else if (this.handHoldingType === 'AccessToTechnologyAndInfrastructure' || 
               this.handHoldingType === 'machineryidentification' || 
               this.handHoldingType === 'cfcsupport') {
        if (item.accessToTechnologyId) {
          this.editingId = item.accessToTechnologyId;
          this.selectedAccessType = item.accessToTechnologyType;
        } 

      }
      else if (this.handHoldingType === 'AccessToFinance') {
         if (item.accessToFinanceId) {
          this.editingId = item.accessToFinanceId;
           this.selectedFinanceAccessType = item.accessToFinanceType;
        
        }
      }
      else if (this.handHoldingType == 'aleapdesignstudio') {
        if (item.accessToPackagingId) {
          this.editingId = item.accessToPackagingId;
          this.selectedPackagingAccessType = item.accessToPackagingType;
        } 
      }
    else{
      this.editingId = item.counselletingId || null;
    }
   
    this.addFieldsDynamically();
    this.handHoldingForm.patchValue(item);
    
    setTimeout(() => {
      // Handle different form types
    if(this.handHoldingType === 'govtschemeapplication') {
      this.handHoldingForm.patchValue({
        applicationDate: item?.applicationDate ? this.convertToISOFormat(item.applicationDate) : null,
        sanctionDate: item?.sanctionDate ? this.convertToISOFormat(item.sanctionDate) : null,
        govtSchemeDetails: item?.details || '',
        // organizationId: this.OrganizationData.find(org => org.organizationId == item.organizationId) ? [this.OrganizationData.find(org => org.organizationId ===item.organizationId)] : []
      });
    }
     // Handle Access to Technology & Infrastructure types
      else if (this.handHoldingType === 'AccessToTechnologyAndInfrastructure' || 
               this.handHoldingType === 'machineryidentification' || 
               this.handHoldingType === 'cfcsupport') {
        this.handHoldingForm.patchValue({
          // organizationId: this.OrganizationData.find(org => org.organizationId == item.organizationId) ? 
          //   [this.OrganizationData.find(org => org.organizationId === item.organizationId)] : [],
          quotationDate: item?.quotationDate ? this.convertToISOFormat(item.quotationDate) : null,
          groundingDate: item?.groundingDate ? this.convertToISOFormat(item.groundingDate) : null,
        });
      }
      else if (this.handHoldingType === 'AccessToFinance') {
        
        this.handHoldingForm.patchValue({
          ...item,
          dprSubmissionDate: item?.dprSubmissionDate ? this.convertToISOFormat(item.dprSubmissionDate) : null,
          counsellingDate: item?.counsellingDate ? this.convertToISOFormat(item.counsellingDate) : null,
          applicationDate: item?.applicationDate ? this.convertToISOFormat(item.applicationDate) : null,
          sanctionDate: item?.bankSanctionDate || item?.govtSanctionDate ? 
            this.convertToISOFormat(item.bankSanctionDate || item.govtSanctionDate) : null,
          bankName: item?.institutionName || '',
          statusOfApplication: item?.bankApplicationStatus || item?.govtApplicationStatus || '',
          sanctionDetails: item?.bankSanctionDetails || item?.govtSanctionDetails || '',
          sanctionedAmount: item?.bankSanctionedAmount || item?.govtSanctionedAmount || null,
          details: item?.bankDetails || item?.govtDetails || '',
          // organizationId: this.OrganizationData.find(org => org.organizationId == item.organizationId) ? 
          //   [this.OrganizationData.find(org => org.organizationId === item.organizationId)] : []
        });
        
        if (this.selectedFinanceAccessType === 'creditcounselling') {
          const selectedResources = item?.participants?.map((participant: any) => {
            const id = participant.participantId || participant.influencedParticipantId;
            return this.participantList.find((r: any) => r.id === id);
          }).filter((r: any) => r !== undefined) || [];
          
          this.handHoldingForm.patchValue({
            participantIds: selectedResources
          });
        }
        
      }
      else if(this.handHoldingType === 'aleapdesignstudio') {
      console.log('Editing item for Packaging Access:', item);
       this.handHoldingForm.patchValue({
          ...item,
          studioAccessDate: item?.studioAccessDate ? this.convertToISOFormat(item.studioAccessDate) : null,
          eventDate: item?.eventDate ? this.convertToISOFormat(item.eventDate) : null,
          // organizationId: this.OrganizationData.find(org => org.organizationId == item.organizationId) ? 
          //   [this.OrganizationData.find(org => org.organizationId === item.organizationId)] : []
        });
        
        this.uploadedImage1 = item?.aleapDesignStudioImage1;
        this.uploadedImage2 = item?.aleapDesignStudioImage2;
        this.uploadedImage3 = item?.aleapDesignStudioImage3;
    }
    else if(this.handHoldingType !== 'formalisationcompliance') {
       const selectedResources = item?.participants?.map((participant: any) => {
            const id = participant.participantId || participant.influencedParticipantId;
            console.log('Mapping participant ID:', id,item.participants,this.participantList,this.participantList.find((r: any) => r.id === id));
            return this.participantList.find((r: any) => r.id === id);
          }).filter((r: any) => r !== undefined) || [];

      this.handHoldingForm.patchValue({
        counsellingDate: item?.counsellingDate ? this.convertToISOFormat(item.counsellingDate) : null,
        participantIds: selectedResources,
        // organizationId: this.OrganizationData.find(org => org.organizationId == item.organizationId) ? [this.OrganizationData.find(org => org.organizationId ===item.organizationId)] : []
      });
      console.log('Patched form values:', selectedResources,this.participantList);
    }
    
       else {
         const selectedResources = item?.participants?.map((participant: any) => {
            const id = participant.participantId || participant.influencedParticipantId;
            return this.participantList.find((r: any) => r.id === id);
          }).filter((r: any) => r !== undefined) || [];
      this.handHoldingForm.patchValue({
         participantIds: selectedResources,
        // organizationId: this.OrganizationData.find(org => org.organizationId == item.organizationId) ? [this.OrganizationData.find(org => org.organizationId ===item.organizationId)] : []
      });
    }
    },100);
  }
    else {
    this.resetForm();
  }
  
  setTimeout(() => {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }, 100);
   setTimeout(() => {
       const fileInput = document.getElementById('image1Input') as HTMLInputElement;
       const fileInput2 = document.getElementById('image2Input') as HTMLInputElement;
       const fileInput3 = document.getElementById('image3Input') as HTMLInputElement;
       if (fileInput) {
         fileInput.value = '';
       }
       if(fileInput2){
         fileInput2.value = '';
       }
       if(fileInput3){
         fileInput3.value = '';
       }
     }, 100);
  if(this.handHoldingType=='formalisationcompliance'){
    this.modalService.openModal(this.addHandHoldingByFormaliasationModal, { 
      modalDialogClass: 'modal-xl',
      backdrop: 'static'
    });
  }
  else if(this.handHoldingType=='govtschemeapplication'){
    this.modalService.openModal(this.addGovtSchemesModalTemplate, { 
      modalDialogClass: 'modal-xl',
      backdrop: 'static'
    });
  }
  else if (this.handHoldingType === 'AccessToTechnologyAndInfrastructure' || 
             this.handHoldingType === 'machineryidentification' || 
             this.handHoldingType === 'cfcsupport') {
    this.modalService.openModal(this.addAccessTechnologyModalTemplate, { 
      modalDialogClass: 'modal-xl',
      backdrop: 'static'
    });
  }
  else if (this.handHoldingType === 'AccessToFinance') {
    this.modalService.openModal(this.addFinanceAccessModalTemplate, { 
      modalDialogClass: 'modal-xl',
      backdrop: 'static'
    });
  }
  else  if (this.handHoldingType == 'aleapdesignstudio') {
    this.modalService.openModal(this.addPackagingAccessModalTemplate, { 
      modalDialogClass: 'modal-xl',
      backdrop: 'static'
    });
  }
  else{
    this.modalService.openModal(this.addHandHoldingModal, { 
      modalDialogClass: 'modal-xl',
      backdrop: 'static'
    });
  }
}
 
 uploadedFilesHandHolding: any = ''
  onFileSelected(event: any, type: string): void {
    const file = event.target.files[0];
    if (file) {
      switch(type) {
        case 'file':
          this.uploadedFile = file;
          this.uploadedFilesHandHolding= file;

          break;
        case 'image1':
          this.uploadedImage1 = file;
          break;
        case 'image2':
          this.uploadedImage2 = file;
          break;
        case 'image3':
          this.uploadedImage3 = file;
          break;
      }
    }
  }

  removeFile(type: string): void {
    switch(type) {
      case 'file':
        this.uploadedFile = null;
        this.uploadedFilesHandHolding=null
        break;
      case 'image1':
        this.uploadedImage1 = null;
        break;
      case 'image2':
        this.uploadedImage2 = null;
        break;
      case 'image3':
        this.uploadedImage3 = null;
        break;
    }
    const fileInput = document.getElementById(`${type}Input`) as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

   onAccessTypeChange(type: string): void {
    this.selectedAccessType = type;
    this.addFieldsDynamically();
  }
  onPackagingAccessTypeChange(type: string): void {
    this.selectedPackagingAccessType = type;
    this.addFieldsDynamically();
    // this.loadHandHoldingData();
  }
  // market studey 
  addFeasibilityInput() {
  if (this.feasibilityInputForm.valid) {
    this.feasibilityInputList.push({
      ...this.feasibilityInputForm.value,
      tempId: Date.now() // temporary ID for tracking
    });
    this.feasibilityInputForm.reset();
    this.isFeasibilityFormVisible = false;
  } else {
    Object.keys(this.feasibilityInputForm.controls).forEach(key => {
      this.feasibilityInputForm.get(key)?.markAsTouched();
    });
  }
}
// Remove feasibility input from list
removeFeasibilityInput(index: number) {
  this.feasibilityInputList.splice(index, 1);
}

// Edit feasibility input
editItem: any ;
editFeasibilityInput(item: any, index: number) {
  this.editItem=item
  this.feasibilityInputForm.patchValue(item);
  this.isFeasibilityFormVisible = true;
  this.removeFeasibilityInput(index);
}

// Show/Hide feasibility input form
toggleFeasibilityInputForm() {
  this.isFeasibilityFormVisible = !this.isFeasibilityFormVisible;
  if (!this.isFeasibilityFormVisible) {
    if(Object.keys(this.editItem || {}).length>0){
      this.feasibilityInputList.push(this.editItem)
      this.editItem=null
    }
    this.feasibilityInputForm.reset();
  }
}
// onSubmit(): void {
//     console.log('Form submitted', this.handHoldingForm.value);
    
//     Object.keys(this.handHoldingForm.controls).forEach(key => {
//       this.handHoldingForm.get(key)?.markAsTouched();
//     });
    
//     this.isSubmitted = true;
    
//     if (this.handHoldingForm.valid) {
//       const formData = new FormData();
//       const formValue = this.handHoldingForm.value;
      
//       formData.append('type', this.handHoldingType);
      
//       // Build JSON data based on type
//       let jsonData: any = {
//         organizationId: formValue.organizationId && formValue.organizationId.length > 0 
//           ? formValue.organizationId[0].organizationId 
//           : null,
//         nonTrainingActivityId: this.activityId,
//         nonTrainingSubActivityId: this.subActivityId,
//         handHoldingType: this.handHoldingType
//       };
      
//       // Add common fields for non-formalisation types
//       if(this.handHoldingType !== 'formalisationcompliance') {
//         jsonData = {
//           ...jsonData,
//           counselledBy: formValue.counselledBy,
//           participantIds: formValue.participantIds?.map((p: any) => p.participantId) || [],
//           counsellingDate: formValue.counsellingDate,
//           counsellingTime: formValue.counsellingTime
//         };
//       }
      
//       // Add type-specific fields
//       if (this.handHoldingType === 'counselling') {
//         jsonData = {
//           ...jsonData,
//           subjectDelivered: formValue.subjectDelivered,
//           originalIdea: formValue.originalIdea,
//           finalIdea: formValue.finalIdea
//         };
//       } else if (this.handHoldingType === 'businessplan') {
//         jsonData = {
//           ...jsonData,
//           bankName: formValue.bankName,
//           branchName: formValue.branchName,
//           bankRemarks: formValue.bankRemarks,
//         };
//       }
//       else if (this.handHoldingType === 'sectoradvisory') {
//         jsonData = {
//           ...jsonData,
//           adviseDetails: formValue.adviseDetails
//         };
//       }
//       else if (this.handHoldingType === 'formalisationcompliance') {
//         jsonData = {"organizationId":jsonData.organizationId,
//          "handHoldingType":"formalisationcompliance",
//           details: formValue.details,
//           activityId: this.activityId,
//           subActivityId: this.subActivityId
//         }
//       }
      
//       // Handle file upload for business plan and formalisation compliance
//       if(this.isEditMode && this.editingId && (this.handHoldingType === 'businessplan' || this.handHoldingType === 'formalisationcompliance')){
//         if (this.uploadedFilesHandHolding?.name && typeof this.uploadedFilesHandHolding !== 'string') {
//           formData.append("file", this.uploadedFilesHandHolding);
//         }
//       }
     
      
//       console.log('JSON Data to be sent:', jsonData);
//       formData.append('data', JSON.stringify(jsonData));
      
//       if (this.uploadedFile && !this.isEditMode) {
//         formData.append('file', this.uploadedFile);
        
//       }
      
//       if (this.isEditMode && this.editingId) {
//         this.updateHandHolding(formData);
//       } else {
//         this.saveHandHolding(formData);
//       }
//     } else {
//       console.log('Form is invalid');
//       Object.keys(this.handHoldingForm.controls).forEach(key => {
//         const control = this.handHoldingForm.get(key);
//         if (control && control.invalid) {
//           console.log(`${key} errors:`, control.errors);
//         }
//       });
//       this.toastrService.error('Please fill all required fields', 'Form Validation Error');
//     }
//   }
//   onSubmit(): void {
//   console.log('Form submitted', this.handHoldingForm.value);
  
//   Object.keys(this.handHoldingForm.controls).forEach(key => {
//     this.handHoldingForm.get(key)?.markAsTouched();
//   });
  
//   this.isSubmitted = true;
  
//   if (this.handHoldingForm.valid) {
//     const formData = new FormData();
//     const formValue = this.handHoldingForm.value;
    
//     formData.append('type', this.handHoldingType);
    
//     let jsonData: any = {
//       organizationId: formValue.organizationId && formValue.organizationId.length > 0 
//         ? formValue.organizationId[0].organizationId 
//         : null,
//       nonTrainingActivityId: this.activityId,
//       nonTrainingSubActivityId: this.subActivityId,
//       handHoldingType: this.handHoldingType
//     };
    
//     // Add type-specific fields
//     if (this.handHoldingType === 'counselling') {
//       jsonData = {
//         ...jsonData,
//         counselledBy: formValue.counselledBy,
//         participantIds: formValue.participantIds?.map((p: any) => p.participantId) || [],
//         counsellingDate: formValue.counsellingDate,
//         counsellingTime: formValue.counsellingTime,
//         subjectDelivered: formValue.subjectDelivered,
//         originalIdea: formValue.originalIdea,
//         finalIdea: formValue.finalIdea
//       };
//     } else if (this.handHoldingType === 'businessplan') {
//       jsonData = {
//         ...jsonData,
//         counselledBy: formValue.counselledBy,
//         participantIds: formValue.participantIds?.map((p: any) => p.participantId) || [],
//         counsellingDate: formValue.counsellingDate,
//         counsellingTime: formValue.counsellingTime,
//         bankName: formValue.bankName,
//         branchName: formValue.branchName,
//         bankRemarks: formValue.bankRemarks,
//       };
//     }
//     else if (this.handHoldingType === 'sectoradvisory') {
//       jsonData = {
//         ...jsonData,
//         counselledBy: formValue.counselledBy,
//         participantIds: formValue.participantIds?.map((p: any) => p.participantId) || [],
//         counsellingDate: formValue.counsellingDate,
//         counsellingTime: formValue.counsellingTime,
//         adviseDetails: formValue.adviseDetails
//       };
//     }
//     else if (this.handHoldingType === 'formalisationcompliance') {
//       jsonData = {
//         ...jsonData,
//         details: formValue.details,
//       };
//     }
//     else if (this.handHoldingType === 'govtschemeapplication') {
//       jsonData = {
//         nonTrainingActivityId: this.activityId,
//         nonTrainingSubActivityId: this.subActivityId,
//         organizationId: jsonData.organizationId,
//         applicationNo: formValue.applicationNo,
//         status: formValue.status,
//         applicationDate: formValue.applicationDate,
//         time: formValue.time,
//         sanctionDetails: formValue.status === 'APPROVED' ? formValue.sanctionDetails : null,
//         sanctionDate: formValue.status === 'APPROVED' ? formValue.sanctionDate : null,
//         sanctionedAmount: formValue.status === 'APPROVED' ? formValue.sanctionedAmount : null,
//         details: formValue.govtSchemeDetails,
//       };
//     }
    
//     console.log('JSON Data to be sent:', jsonData);
//     formData.append('data', JSON.stringify(jsonData));
    
//     if (this.uploadedFile && !this.isEditMode) {
//       formData.append('file', this.uploadedFile);
//     }
    
//     if (this.isEditMode && this.editingId && (this.handHoldingType === 'businessplan' || this.handHoldingType === 'formalisationcompliance')) {
//       if (this.uploadedFilesHandHolding?.name && typeof this.uploadedFilesHandHolding !== 'string') {
//         formData.append("file", this.uploadedFilesHandHolding);
//       }
//     }
    
//     if (this.isEditMode && this.editingId) {
//       this.updateHandHolding(formData);
//     } else {
//       this.saveHandHolding(formData);
//     }
//   } else {
//     console.log('Form is invalid');
//     Object.keys(this.handHoldingForm.controls).forEach(key => {
//       const control = this.handHoldingForm.get(key);
//       if (control && control.invalid) {
//         console.log(`${key} errors:`, control.errors);
//       }
//     });
//     this.toastrService.error('Please fill all required fields', 'Form Validation Error');
//   }
// }
 onSubmit(): void {
    console.log('Form submitted', this.handHoldingForm.value,this.participantList);

    Object.keys(this.handHoldingForm.controls).forEach(key => {
      this.handHoldingForm.get(key)?.markAsTouched();
    });

    this.isSubmitted = true;
    if (this.handHoldingType === 'marketstudy' && this.feasibilityInputList.length === 0) {
    this.toastrService.error('Please add at least one feasibility input');
    return;
  }
    if (this.handHoldingForm.valid) {
      const formData = new FormData();
      const formValue = this.handHoldingForm.value;
       const participantIds: number[] = [];
      const influencedParticipantIds: number[] = [];
      this.participantList.forEach((p: any) => {
        console.log('Participant List Item:', p);
        formValue.participantIds?.forEach((selected: any) => {
          if (p.id === selected.id) {
            if (p.type === 'participant' && p.participantId) {
              participantIds.push(p.participantId);
            } else if (p.type === 'influenced' && p.influencedId) {
              influencedParticipantIds.push(p.influencedId);
            }
          }
        });
      }
      );
      console.log('Mapped Participant IDs:', participantIds);
      console.log('Mapped Influenced Participant IDs:', influencedParticipantIds);

      let jsonData: any = {
        organizationId: formValue.organizationId ? formValue.organizationId: null,

        nonTrainingActivityId: Number(this.activityId),
        nonTrainingSubActivityId: Number(this.subActivityId),
        handHoldingType: this.handHoldingType
      };

      // Add type-specific fields
      if (this.handHoldingType === 'counselling') {
        jsonData = {
              ...jsonData,
              counselledBy: formValue.counselledBy,
              participantIds: participantIds,
              influencedParticipantIds: influencedParticipantIds,
              counsellingDate: formValue.counsellingDate,
              counsellingTime: formValue.counsellingTime,
              subjectDelivered: formValue.subjectDelivered,
              originalIdea: formValue.originalIdea,
              finalIdea: formValue.finalIdea
            };
         formData.append('type', this.handHoldingType);
      } else if (this.handHoldingType === 'businessplan') {
        jsonData = {
          ...jsonData,
          counselledBy: formValue.counselledBy,
         participantIds: participantIds,
              influencedParticipantIds: influencedParticipantIds,
          counsellingDate: formValue.counsellingDate,
          counsellingTime: formValue.counsellingTime,
          bankName: formValue.bankName,
          branchName: formValue.branchName,
          bankRemarks: formValue.bankRemarks,
        };
         formData.append('type', this.handHoldingType);
      }
      else if (this.handHoldingType === 'sectoradvisory') {
        jsonData = {
          ...jsonData,
          counselledBy: formValue.counselledBy,
        participantIds: participantIds,
              influencedParticipantIds: influencedParticipantIds,
              counsellingDate: formValue.counsellingDate,
          counsellingTime: formValue.counsellingTime,
          adviseDetails: formValue.adviseDetails
        };
         formData.append('type', this.handHoldingType);
      }
      else if (this.handHoldingType === 'formalisationcompliance') {
        jsonData = {
        organizationId: jsonData.organizationId,
        nonTrainingActivityId:jsonData.nonTrainingActivityId,
        nonTrainingSubActivityId: jsonData.nonTrainingSubActivityId,
        details: formValue.details,
        };
         formData.append('type', this.handHoldingType);
      }
        // Add feasibilityInputRequests for market study
    else  if (this.handHoldingType === 'marketstudy') {
       const feasibilityInputRequests = this.feasibilityInputList.map(item => ({
      inputDetails: item.inputDetails,

      source: item.source,
      sector: item.sector,
      // feasibilityInputId: item.feasibilityInputId,
      marketStudyId: this.editingId || null,
      feasibilityActivity: item.feasibilityActivity
    }));
     jsonData = {
          ...jsonData,
          counselledBy: formValue.counselledBy,
           participantIds: participantIds,
              influencedParticipantIds: influencedParticipantIds,
          counsellingDate: formValue.counsellingDate,
          counsellingTime: formValue.counsellingTime,
          feasibilityInputRequests:feasibilityInputRequests
        };
        console.log('Feasibility Input Requests:', jsonData,feasibilityInputRequests);
         
    formData.append('type', this.handHoldingType);
  }
      else if (this.handHoldingType === 'govtschemeapplication') {
        jsonData = {
          nonTrainingActivityId: this.activityId,
          nonTrainingSubActivityId: this.subActivityId,
          organizationId: jsonData.organizationId,
          applicationNo: formValue.applicationNo,
          status: formValue.status,
          applicationDate: formValue.applicationDate,
          time: formValue.time,
          sanctionDetails: formValue.status === 'APPROVED' ? formValue.sanctionDetails : null,
          sanctionDate: formValue.status === 'APPROVED' ? formValue.sanctionDate : null,
          sanctionedAmount: formValue.status === 'APPROVED' ? formValue.sanctionedAmount : null,
          details: formValue.govtSchemeDetails,
        };
         formData.append('type', this.handHoldingType);
      }

      else if (this.handHoldingType === 'AccessToTechnologyAndInfrastructure') {
        
        if (this.selectedAccessType === 'vendorconnection') {
          jsonData = {
          ...jsonData,
          handHoldingType: 'vendor connection',
          accessToTechnologyType:this.selectedAccessType,
          vendorSuggested: formValue.vendorSuggested,
          quotationDate: formValue.quotationDate,
          details: formValue.details,
          cost: formValue.cost
        };
         formData.append('type', 'accesstotechnology');
        }
         else if (this.selectedAccessType === 'machineryidentification') {
        jsonData = {
          ...jsonData,
          handHoldingType: "Machinery Identification",
           accessToTechnologyType:this.selectedAccessType,
          requirement: formValue.requirement,
          existingMachinery: formValue.existingMachinery,
          suggestedMachinery: formValue.suggestedMachinery,
          manufacturer: formValue.manufacturer,
          groundingDate: formValue.groundingDate,
          placeOfInstallation: formValue.placeOfInstallation,
          costOfMachinery: formValue.costOfMachinery
        };
        formData.append('type', 'accesstotechnology');
      }
      else if (this.selectedAccessType === 'cfcsupport') {
        jsonData = {
          ...jsonData,
          handHoldingType: 'CFC Support',
           accessToTechnologyType:this.selectedAccessType,
          technologyDetails: formValue.technologyDetails,
          vendorName: formValue.vendorName,
          vendorContactNo: formValue.vendorContactNo,
          vendorEmail: formValue.vendorEmail,
          approxCost: formValue.approxCost
        };
        formData.append('type', 'accesstotechnology');
      }
      }
      else if (this.handHoldingType === 'aleapdesignstudio') {
        if (this.selectedPackagingAccessType === 'aleapdesignstudio') {
          jsonData = {
            ...jsonData,
            accessToPackagingType: this.selectedPackagingAccessType || '',
            handHoldingType: 'ALEAP DESIGN STUDIO',
            // participantIds: formValue.participantIds?.map((p: any) => p.participantId) || [],
            studioAccessDate: formValue.studioAccessDate,
            details: formValue.details
          };
          formData.append('type', 'accesstopackaginglabellingandbranding');
          
          // Add images
          if (this.uploadedImage1 && typeof this.uploadedImage1 !== 'string') {
            formData.append('image1', this.uploadedImage1);
          }
          if (this.uploadedImage2 && typeof this.uploadedImage2 !== 'string') {
            formData.append('image2', this.uploadedImage2);
          }
          if (this.uploadedImage3 && typeof this.uploadedImage3 !== 'string') {
            formData.append('image3', this.uploadedImage3);
          }
        } else if (this.selectedPackagingAccessType === 'tradefairparticipation') {
          jsonData = {
            ...jsonData,
            accessToPackagingType: this.selectedPackagingAccessType || '',
            handHoldingType: 'Trade Fair Participation',
            // participantIds: formValue.participantIds?.map((p: any) => p.participantId) || [],
            eventType: formValue.eventType,
            eventDate: formValue.eventDate,
            eventLocation: formValue.eventLocation,
            organizedBy: formValue.organizedBy
          };
          formData.append('type', 'accesstopackaginglabellingandbranding');
        }
      }
      else    if (this.handHoldingType === 'AccessToFinance') {
        if (this.selectedFinanceAccessType === 'banknbfcfinance') {
          jsonData = {
            ...jsonData,
            handHoldingType: 'NT_HANDHOLDING',
            accessToFinanceType:this.selectedFinanceAccessType,
            institutionName: formValue.bankName,
            branchName: formValue.branchName,
            dprSubmissionDate: formValue.dprSubmissionDate,
            bankApplicationStatus: formValue.statusOfApplication,
            participantIds:  [],
            influencedParticipantIds: [],
            // bankSanctionDetails: formValue.statusOfApplication === 'APPROVED' ? formValue.sanctionDetails : null,
            bankSanctionDate: formValue.statusOfApplication === 'APPROVED' ? formValue.sanctionDate : null,
            bankSanctionedAmount: formValue.statusOfApplication === 'APPROVED' ? formValue.sanctionedAmount : null,
            bankDetails: formValue.details
          };
          formData.append('type', 'accesstofinance');
        } else if (this.selectedFinanceAccessType === 'creditcounselling') {
          jsonData = {
            ...jsonData,
           handHoldingType: 'NT_HANDHOLDING',
           accessToFinanceType:this.selectedFinanceAccessType,
            counselledBy: formValue.counselledBy,
            participantIds: participantIds? participantIds : [],
            influencedParticipantIds: influencedParticipantIds? influencedParticipantIds : [],
            counsellingDate: formValue.counsellingDate,
            // counsellingTime: formValue.counsellingTime,
            subjectDelivered: formValue.subjectDelivered
          };
          formData.append('type', 'accesstofinance');
        } else if (this.selectedFinanceAccessType === 'govtschemefinance') {
          jsonData = {
            ...jsonData,
            handHoldingType: 'NT_HANDHOLDING',
            accessToFinanceType:this.selectedFinanceAccessType,
            schemeName: formValue.schemeName,
            participantIds:  [],
            influencedParticipantIds: [],
            govtApplicationStatus: formValue.statusOfApplication,
            // applicationDate: formValue.applicationDate,
            // time: formValue.time,
            // govtSanctionDetails: formValue.statusOfApplication === 'APPROVED' ? formValue.sanctionDetails : null,
            govtSanctionDate: formValue.statusOfApplication === 'APPROVED' ? formValue.sanctionDate : null,
            govtSanctionedAmount: formValue.statusOfApplication === 'APPROVED' ? formValue.sanctionedAmount : null,
            govtDetails: formValue.details
          };
          formData.append('type', 'accesstofinance');
        }
      }
      else{
        formData.append('type', this.handHoldingType);
      }
     

      console.log('JSON Data to be sent:', jsonData);
      formData.append('data', JSON.stringify(jsonData));

      if (this.uploadedFile && !this.isEditMode) {
        formData.append('file', this.uploadedFile);
      }

      if (this.isEditMode && this.editingId && (this.handHoldingType === 'businessplan' || this.handHoldingType === 'formalisationcompliance')) {
        if (this.uploadedFilesHandHolding?.name && typeof this.uploadedFilesHandHolding !== 'string') {
          formData.append("file", this.uploadedFilesHandHolding);
        }
      }

      if (this.isEditMode && this.editingId) {
        this.updateHandHolding(formData);
      } else {
        this.saveHandHolding(formData);
      }
    } else {
      console.log('Form is invalid');
      Object.keys(this.handHoldingForm.controls).forEach(key => {
        const control = this.handHoldingForm.get(key);
        if (control && control.invalid) {
          console.log(`${key} errors:`, control.errors);
        }
      });
      this.toastrService.error('Please fill all required fields', 'Form Validation Error');
    }
  }



  saveHandHolding(formData: FormData): void {
     this.commonService.add(APIS.nontrainingtargets.aleap.save, formData).subscribe({
      next: (response) => {
        console.log('Saved successfully:', response);
        this.toastrService.success('Data saved successfully', 'Save Successful');
        this.loadHandHoldingData();
        this.closeModal();
        this.resetForm();
      },
      error: (error) => {
          this.toastrService.error(error, 'Save Error');
        console.error('Error saving data:', error);
      }
    });
  }

  updateHandHolding(formData: FormData): void {
    this.commonService.update(APIS.nontrainingtargets.aleap.update, formData, this.editingId).subscribe({
      next: (response) => {
        console.log('Updated successfully:', response);
        this.toastrService.success('Data updated successfully', 'Update Successful');
        this.loadHandHoldingData();
        this.closeModal();
        this.resetForm();
      },
      error: (error) => {
          this.toastrService.error(error, 'Update Error');
        console.error('Error updating data:', error);
      }
    });
  }

  deleteHandHolding(item: any): void {
    
    if(this.handHoldingType=='counselling' ){
      this.editingId = item.counselletingId || null;
    }
    else if(this.handHoldingType=='businessplan'){
      this.editingId = item.businessPlanId || null;
    }
    else if(this.handHoldingType=='sectoradvisory'){
      this.editingId = item.sectorAdvisoryId || null;
    }
    else if(this.handHoldingType=='marketstudy'){
      this.editingId = item.marketStudyId || null;
    }
    else if(this.handHoldingType=='formalisationcompliance'){
      this.editingId = item.formalisationComplianceId || null;
    }
    else if(this.handHoldingType=='govtschemeapplication'){
    this.editingId = item.govtSchemeApplicationId || null;
  }
   else if (this.handHoldingType === 'AccessToTechnologyAndInfrastructure' || 
             this.handHoldingType === 'machineryidentification' || 
             this.handHoldingType === 'cfcsupport') {
      if (item.accessToTechnologyId) {
        this.editingId = item.accessToTechnologyId;
      } else if (item.accessToTechnologyId) {
        this.editingId = item.accessToTechnologyId;
      } else if (item.accessToTechnologyId) {
        this.editingId = item.accessToTechnologyId;
      }
    }
    else if (this.handHoldingType == 'AccessToFinance') {
      if (item.accessToFinanceId) {
        this.editingId = item.accessToFinanceId;
        this.selectedFinanceAccessType = 'banknbfcfinance';
      } else if (item.accessToFinanceId) {
        this.editingId = item.accessToFinanceId;
        this.selectedFinanceAccessType = 'creditcounselling';
      } else if (item.accessToFinanceId) {
        this.editingId = item.accessToFinanceId;
        this.selectedFinanceAccessType = 'govtschemefinance';
      }
    }
    else  if (this.handHoldingType == 'aleapdesignstudio') {
      if (item.accessToPackagingId) {
        this.editingId = item.accessToPackagingId;
        this.selectedPackagingAccessType = 'aleapdesignstudio';
      } else if (item.accessToPackagingId) {
        this.editingId = item.accessToPackagingId;
        this.selectedPackagingAccessType = 'tradefairparticipation';
      }
    }
    else{
      this.editingId = item.counselletingId || null;
    }
    
    this.modalService.openModal(this.deleteModalTemplate, { 
      modalDialogClass: 'modal-dialog-centered',
      backdrop: 'static'
    });
  }
  

  confirmDelete(): void {
    if (this.editingId) {
      let type:any='';
      if(this.handHoldingType === 'AccessToTechnologyAndInfrastructure'){
        type='accesstotechnology'
      }
      else if(this.handHoldingType === 'aleapdesignstudio'){
        type='accesstopackaginglabellingandbranding'
      }
      else{
        type=this.handHoldingType
      }
       this.commonService.deleteByUrl(APIS.nontrainingtargets.aleap.delete+this.editingId+'?type='+type).subscribe({
        next: (response) => {
          console.log('Deleted successfully:', response);
          this.toastrService.success('Data deleted successfully', 'Delete Successful');
          this.loadHandHoldingData();
          this.modalService.closeModal(this.deleteModalTemplate);
        },
        error: (error) => {
          this.toastrService.error(error, 'Delete Error');
          console.error('Error deleting data:', error);
        }
      });
     
    }
    else {
      this.toastrService.error('Invalid ID for deletion', 'Delete Error');
    }
  }

 closeModal(): void {
    this.modalService.closeModal(this.addHandHoldingModal);
    this.modalService.closeModal(this.addHandHoldingByFormaliasationModal);
    this.modalService.closeModal(this.addGovtSchemesModalTemplate);
    this.modalService.closeModal(this.addAccessTechnologyModalTemplate);
    this.modalService.closeModal(this.addPackagingAccessModalTemplate);
    this.modalService.closeModal(this.addFinanceAccessModalTemplate);
  }


  resetForm(): void {
    this.handHoldingForm.reset();
    this.addFieldsDynamically()
    // this.formDetails()
    this.isEditMode = false;
    this.isSubmitted = false;
    this.editingId = null;
    this.uploadedFile = null;
    this.uploadedImage1 = null;
    this.uploadedImage2 = null;
    this.uploadedImage3 = null;
    this.feasibilityInputList = []; // Reset feasibility inputs
  this.isFeasibilityFormVisible = false;
  this.feasibilityInputForm.reset();
  }
  // addd by upendranath reddy for common file preview
  showFileViewer(filePath: string) {
    console.log('File path to open:', filePath);

    this._commonService.openFile(filePath);

  }
  feasibilityInputListModal: any[] = [];
  ShowFeasibilityInputs(item: any): void {
    this.feasibilityInputListModal = item || [];
    this.modalService.openModal(this.feasibilityInputsModalTemplate, { 
      modalDialogClass: 'modal-lg',
      backdrop: 'static'
    });
  }
  closeFeasibilityModal(): void {
    this.modalService.closeModal(this.feasibilityInputsModalTemplate);
  }
  participantForm!: FormGroup;
  participantSubmitted = false;

 formDetailsforParticipant(){
    this.participantForm = this.fb.group({
      participantName: ['', [Validators.required, Validators.pattern(/^[A-Za-z][A-Za-z .]*$/)]],
      isAspirant: ['Existing Oragnization'],
      organizationId: [null, Validators.required],
      mobileNo: ['', [Validators.required, Validators.pattern(/^[6789]\d{9}$/)]]
    });
 }

  // Getter for participant form controls
  get pf() {
    return this.participantForm.controls;
  }

  // Open participant modal
  openParticipantModal(): void {
    this.participantSubmitted = false;
    this.participantForm.reset();
    this.modalService.openModal(this.addParticipantModalTemplate, { 
      modalDialogClass: 'modal-dialog-centered modal-lg',
      backdrop: 'static'
    });
  }

  // Save participant
  saveParticipant(): void {
    this.participantSubmitted = true;

    if (this.participantForm.valid) {
      const payload = {
        participantName: this.participantForm.value.participantName,
        mobileNo: this.participantForm.value.mobileNo,
        // isAspirant: this.participantForm.value.isAspirant === 'Aspirant' ? true : false,
        isAspirant:this.participantForm.value.organizationId?'Existing Oragnization':'Aspirant',
        organizationId: this.participantForm.value.organizationId,
        // "organizationId": this.participantForm.value.organizationId?.[0]?.organizationId

        // programIds: [this.handHoldingForm.value.programIds || this.activityId]
      };

      this._commonService.add(APIS.nonparticipant.add, payload).subscribe({
        next: (response: any) => {
          if (response?.status === 400) {
            this.toastrService.error(response?.message, 'Participant Data Error!');
          } else {
            this.toastrService.success('Participant added successfully', 'Success!');
            this.closeParticipantModal();
            this.loadParticipants(this.participantForm.value.organizationId); // Reload participants list
            this.resetParticipantForm();
          }
        },
        error: (error) => {
          this.toastrService.error(error.message || 'Failed to add participant', 'Error!');
          console.error('Save participant error:', error);
        }
      });
    } else {
      this.toastrService.error('Please fill all required fields correctly', 'Validation Error');
    }
  }

  // Close participant modal
  closeParticipantModal(): void {
    this.modalService.closeModal(this.addParticipantModalTemplate);
  }

  // Reset participant form
  resetParticipantForm(): void {
    this.participantForm.reset();
    this.participantSubmitted = false;
  }
  closeDeleteModal(): void {
    this.modalService.closeModal(this.deleteModalTemplate);
  }

  // ...existing code...
}