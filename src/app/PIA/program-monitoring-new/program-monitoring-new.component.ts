import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CommonServiceService } from '@app/_services/common-service.service';
import { Router } from '@angular/router';
import { APIS } from '@app/constants/constants';
import { LogisticsEvaluation, PreEventChecklist, ProgramDeliveryDetail } from './pages/models';

@Component({
  selector: 'app-program-monitoring-new',
  templateUrl: './program-monitoring-new.component.html',
  styleUrls: ['./program-monitoring-new.component.css']
})
export class ProgramMonitoringNewComponent implements OnInit {
  programForm!: FormGroup;
  programDeliveryDetailsForm!: FormGroup;
  currentStep = 1;
  totalSteps = 8;
  agencyId: any;
  programIds:any
  loginsessionDetails: any;
  constructor(private fb: FormBuilder,
    private toastrService: ToastrService,
    private _commonService: CommonServiceService, private router: Router,) { 
      // this.agencyId = JSON.parse(sessionStorage.getItem('user') || '{}').agencyId;
      this.createForm();
      this.addProgramDeliveryDetail()
    }
   
   curretstepsDetails:any = {
    1:'Basic Information',
    2:'Audience Profile',
    3:'Pre-Event Preparation',
    4:'Program Delivery Details',
    5:'Program Execution',
    6:'Logistics & Facilities Evaluation',
    // 7:'Post-Training Assessment',
    7:'Document Checklist',
    // 9:'Observations, Challenges, Best Practices',
    // 10:'Overall Program Rating (by Monitor)',
    8:'Additional Remarks / Recommendations'
   }
  ngOnInit(): void {
    // Load data if editing (example with ID 152)
    // this.loadProgramFeedback(152);
    this.loginsessionDetails = JSON.parse(sessionStorage.getItem('user') || '{}');  
    
      this.getAgenciesList(  )
  }
  agencyList:any
  agencyListFiltered:any;
  getAgenciesList() {
    this.agencyList = [];
    this._commonService.getDataByUrl(APIS.masterList.agencyList).subscribe((res: any) => {
      this.agencyList = res.data;
      this.agencyListFiltered=this.agencyList 
      this.agencyId=res.data[0].agencyId
      this.getProgramsByAgency(res.data[0].agencyId);
    }, (error) => {
      this.toastrService.error(error.error.message);
    });
  }
  agencyProgramList: any;
  agencyProgramListFiltered:any;
  getProgramsByAgency(agency:any) {
    this.agencyProgramList =[]
    this._commonService.getDataByUrl(`${APIS.programCreation.getProgramsListByAgency+'/'+agency}`).subscribe({
      next: (res: any) => {
        this.agencyProgramList = res?.data
        this.agencyProgramListFiltered=this.agencyProgramList
        if(res.data?.length){
          this.programIds = this.agencyProgramList[0].programId
          this.getByProgramId(this.programIds);
        }
        else{
          this.createForm()
          this.currentStep=1
        }
      
      },
      error: (err) => {
        new Error(err);
      }
    })
  }
  checklistItems = [
    { name: 'Program Agenda Circulated', key: 'programAgendaCirculated' },
    { name: 'Speaker Confirmations', key: 'speakerConfirmations' },
    { name: 'Training Materials Printed', key: 'trainingMaterialsPrinted' },
    { name: 'Invitations Sent', key: 'invitationsSent' },
    { name: 'Seating Arrangements Ready', key: 'seatingArrangementsReady' },
    { name: 'AV/Projector Tested', key: 'avProjectorTested' }
  ];
  evaluationItems = [
    { parameter: 'Venue Quality', key: 'venueQuality' },
    { parameter: 'Venue Accessibility for the persons with Disabilities', key: 'venueAccessibility' },
    { parameter: 'Food Quality (Lunch / Tea / Snacks)', key: 'foodQuality' },
    { parameter: 'Drinking Water Facility', key: 'drinkingWater' },
    { parameter: 'Toilet Hygiene', key: 'toiletHygiene' },
    { parameter: 'Projector / AV Equipment', key: 'avEquipment' },
    { parameter: 'Stationary Availability', key: 'stationary' },
    { parameter: 'Speaker accommodation and travel arrangements', key: 'speakerAccommodation' },
    // { parameter: 'Speaker Travel Arrangements', key: 'travelArrangements' }
  ];
  get fMon(){
    return this.programForm.controls;
  }
  addProgramDeliveryDetail(item?: ProgramDeliveryDetail): void {
    this.programDeliveryDetailsForm=this.fb.group({
      speakerName: ['', Validators.required],
      topicDelivered: ['', Validators.required],
      timeTaken: ['', [Validators.required, Validators.min(1)]],
      audioVisualUsed: [false],
      relevance: ['', ],
      // speakerEffectiveness: [1, [ Validators.min(1), Validators.max(5)]]
    });
  }
  createForm():any {
    this.programForm = this.fb.group({
      // Step 1: Basic Information
      state: ['', Validators.required],
      district: ['', Validators.required],
      dateOfMonitoring: ['', Validators.required],
      agencyName: ['', Validators.required],
      programType: ['', Validators.required],
      programName: ['', Validators.required],
      venueName: ['', Validators.required],
      hostingAgencyName: ['', Validators.required],
      spocName: ['', Validators.required],
      spocContact: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      inTime: ['', Validators.required],
      outTime: ['', Validators.required],

      // Step 2: Audience Profile
      maleParticipants: [0, Validators.min(0)],
      femaleParticipants: [0, Validators.min(0)],
      transGenderParticipants: [0, Validators.min(0)],
      totalParticipants: [0, Validators.min(0)],
      noOfSHG: [0, Validators.min(0)],
      noOfMSME: [0, Validators.min(0)],
      noOfStartup: [0, Validators.min(0)],
      noOfDIC: [0, Validators.min(0)],
      noOfIAs: [0, Validators.min(0)],
     
      // noOfOthers: [0, Validators.min(0)],
      // noOfSC: [0, Validators.min(0)],
      // noOfST: [0, Validators.min(0)],
      // noOfOC: [0, Validators.min(0)],
      // noOfBC: [0, Validators.min(0)],
      // noOfMinority: [0, Validators.min(0)],

      // Step 3: Pre-Event Preparation
      preEventChecklists: this.fb.array([]),
       participantKnowAboutProgram: [''],

      // Step 4: Program Delivery Details
      programDeliveryDetails: this.fb.array([]),

      // Step 5: Program Execution
      timingPunctuality: [false],
      sessionContinuity: [false],
      participantInterestLevel: [false],
      // overallEnergyEngagement: [''],
      // unforeseenIssues: [''],
      // participantQueries: [''],

      // Step 6: Logistics & Facilities Evaluation
      logisticsEvaluations: this.fb.array([]),

      // Step 7: Post-Training Assessment
      participantsFeedbackCollected: [false],
      resourceFeedbackCollected: [false],
      prePostTestsConducted: [false],
      learningHighlights: [''],

      // Step 8: Document Checklist
      attendanceSheet: [false],
      registrationForms: [false],
      participantFeedBack: [false],
      speakerFeedBack: [false],
      // photographsAttached: [false],
      // summaryReportPrepared: [false],

      // Step 9: Observations, Challenges, Best Practices
      observedPractices: [''],
      challengesFaced: [''],
      issuesAndCorrections: [''],

      // Step 10: Overall Program Rating
      overallProgramOrganization: [0, [Validators.min(1), Validators.max(5)]],
      qualityOfSessions: [0, [Validators.min(1), Validators.max(5)]],
      participantsSatisfaction: [0, [Validators.min(1), Validators.max(5)]],
      impactPotential: [0, [Validators.min(1), Validators.max(5)]],

      // Step 11: Additional Remarks
      additionalRemarks: ['']
    });

    // Initialize dynamic form arrays
    this.addPreEventChecklist();
    this.createdynamiclogisticsEvaluations();
    // this.addLogisticsEvaluation();
  }
  convertToISOFormat(date: string): string {
    //console.log(date)
    const [day, month, year] = date.split('-');
    return `${year}-${month}-${day}`; // Convert to yyyy-MM-dd format
  }
  finalObject:any
  getByProgramId(id: number){
    //console.log(id,'getByProgramId')
    this._commonService.getDataByUrl(APIS.programMonitoring.getProgramMonitoringByIdProgram+id).subscribe({
     
      next: (res: any) => {
        //console.log(res,'getByProgramId1234')
        if(res.data?.length){
          this.finalObject=res.data[0]
          this.monitorId=res.data[0].monitorId
          // //console.log(this.monitorId,this.currentStep,res.data[0]?.stepNumber,this.totalSteps)
          if (res.data[0]?.stepNumber < this.totalSteps) {
            this.currentStep=res.data[0]?.stepNumber+1 
          }
          else if(res.data[0]?.stepNumber==this.totalSteps){
            this.currentStep=1
          }
          else{
            this.currentStep=8
          }
          this.loadProgramFeedback(id)
        }
        else{
          this.monitorId=null
          this.currentStep=1
          this.createForm()
          this.addProgramDeliveryDetail()
          this.loadProgramFeedback(id)
        }
      },
      error: (err) => {
        new Error(err);
      }
    })
  }
  monitorId:any
  loadProgramFeedback(id: number): void {
    this.disability=false
    if(this.currentStep==1 && !this.monitorId){
      this._commonService.getDataByUrl(APIS.programMonitoring.getProgramMonitoringById+id).subscribe
      ({
        next: (data) => {
          ////console.log(data,'resp')
          // this.programForm.reset();
          
          this.programForm.patchValue({
            ...data.data,
            dateOfMonitoring: this.convertToISOFormat(data.data.dateOfMonitoring)
          });
        },
        error: (err) => {
          this.toastrService.error(err.message, "Location Creation Error!");
          new Error(err);
        },
      });
    }
    else{
      this._commonService.getDataByUrl(APIS.programMonitoring.getProgramMonitoringByIdUpdated+this.monitorId).subscribe
      ({
        next: (data) => {
          // this.currentStep=data.data[0]?.stepNumber+1 
          ////console.log(this.currentStep)
          if(data.data?.stepNumber==this.totalSteps){
            this.currentStep=1
          }
          this.programForm.reset();
          this.createForm()
          ////console.log(data.data, this.programForm.value)
          this.programForm.patchValue({
            ...data.data,
            dateOfMonitoring:data.data?.dateOfMonitoring?this.convertToISOFormat(data.data.dateOfMonitoring): null

          });
        
          if(data.data?.programDeliveryDetails?.length){
            const deliveryDetailsArray = this.programForm.get('programDeliveryDetails') as FormArray;
    
         // Push the new form group
         data.data?.programDeliveryDetails.forEach((item:any) => {
          deliveryDetailsArray.push(this.fb.group(item));
            })
          } 
        },
        error: (err) => {
          this.toastrService.error(err.message, "Location Creation Error!");
          new Error(err);
        },
      });
    }

  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  // Form Array Getters
  get preEventChecklists(): FormArray {
    return this.programForm.get('preEventChecklists') as FormArray;
  }

  // get programDeliveryDetails(): FormArray {
  //   return this.programForm.get('programDeliveryDetails') as FormArray;
  // }

  get logisticsEvaluations(): FormArray {
    return this.programForm.get('logisticsEvaluations') as FormArray;
  }

  // Dynamic Form Controls
  addPreEventChecklist(item?: PreEventChecklist): void {
    this.checklistItems.map((checklist) => {
      this.preEventChecklists.push(this.createChecklistGroup(checklist));
    })
    //console.log(this.preEventChecklists.value,this.preEventChecklists.controls)
  }
  

  createChecklistGroup(item: any): FormGroup {
    return this.fb.group({
      name: [item.name],
      status: [false], // Initialize with null for unselected state
      remarks: ['']
    });
  }


  createdynamiclogisticsEvaluations(){
    //console.log(this.logisticsEvaluations.value,this.evaluationItems)
    this.evaluationItems.map((checklist:any) => {
      this.addLogisticsEvaluation(checklist)
        })
  }
  addLogisticsEvaluation(item?: LogisticsEvaluation): void {
    this.logisticsEvaluations.push(this.fb.group({
      parameter: [item?.parameter || '', Validators.required],
      rating: [item?.rating || 1, [ Validators.min(1), Validators.max(5)]],
      remarks: [item?.remarks || '']
    }));
    //console.log(this.logisticsEvaluations.value)
  }

  // Step Navigation
  disability:any=false
  nextStep(): void {
    this.disability=true
    if(this.currentStep==1 && !this.monitorId){

      // this.programForm.get('programName')?.setValue(this.programIds)
      this.saveProgramData('save')
    }
    else{
      this.saveProgramData('update');
    }
  
  }
  FinalStep(): void {
    this.disability=true
    //console.log(this.currentStep,'final')
      this.saveProgramData('update');
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      this.updateProgressBar();
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.updateProgressBar();
      this.loadProgramFeedback(this.monitorId)
    }
  }
  saveProgramData(type:any){
    if(type=='update'){
      let Payload:any={...this.programForm.value,stepNumber:this.currentStep,logisticsEvaluations:this.programForm.value?.logisticsEvaluations?this.programForm.value?.logisticsEvaluations:[],programDeliveryDetails:this.programForm.value?.programDeliveryDetails?this.programForm.value?.programDeliveryDetails:[],preEventChecklists:this.programForm.value?.preEventChecklists?this.programForm.value?.preEventChecklists:[]}
      //console.log(this.programForm.value,this.programForm.value?.preEventChecklists)
      if(this.currentStep==3){
        console.log(this.programForm.value)
        Payload={stepNumber:this.currentStep,preEventChecklists:this.programForm.value?.preEventChecklists?this.programForm.value?.preEventChecklists:[],participantKnowAboutProgram:this.programForm.value?.participantKnowAboutProgram}
      }
      else if(this.currentStep==4){
        Payload={stepNumber:this.currentStep,programDeliveryDetails:this.programForm.value?.programDeliveryDetails?this.programForm.value?.programDeliveryDetails:[],preEventChecklists:[],logisticsEvaluations:[]}
      }
      else if(this.currentStep==5){
        Payload={stepNumber:this.currentStep,timingPunctuality:this.programForm.value?.timingPunctuality?this.programForm.value?.timingPunctuality:'',sessionContinuity:this.programForm.value?.sessionContinuity?this.programForm.value?.sessionContinuity:'',participantInterestLevel:this.programForm.value?.participantInterestLevel?this.programForm.value?.participantInterestLevel:'',overallEnergyEngagement:this.programForm.value?.overallEnergyEngagement?this.programForm.value?.overallEnergyEngagement:'',unforeseenIssues:this.programForm.value?.unforeseenIssues?this.programForm.value?.unforeseenIssues:'',participantQueries:this.programForm.value?.participantQueries?this.programForm.value?.participantQueries:''}
      }
      else if(this.currentStep==6){
        Payload={stepNumber:this.currentStep,logisticsEvaluations:this.programForm.value?.logisticsEvaluations?this.programForm.value?.logisticsEvaluations:[],preEventChecklists:[],programDeliveryDetails:[]}
      }
      else{
        Payload={...this.programForm.value,stepNumber:this.currentStep,logisticsEvaluations:this.programForm.value?.logisticsEvaluations?this.programForm.value?.logisticsEvaluations:[],programDeliveryDetails:this.programForm.value?.programDeliveryDetails?this.programForm.value?.programDeliveryDetails:[],preEventChecklists:this.programForm.value?.preEventChecklists?this.programForm.value?.preEventChecklists:[]}
      }

     
    this._commonService.add(APIS.programMonitoring.updateProgramMonitoring+this.monitorId, Payload).subscribe({
      next: (response) => {
        //console.log('Success:', response);
        this.disability=false
        this.toastrService.success(this.curretstepsDetails[this.currentStep]+' Data Updated Successfully','Program Monitoring');
       
        if (this.currentStep < this.totalSteps) {
          this.currentStep++;
          this.updateProgressBar();
        }
        this.loadProgramFeedback(this.monitorId)

        // Show success message
      },
      error: (error) => {
        this.disability=false
        //console.error('Error:', error);
        this.toastrService.success(error.message,'Program Monitoring');
        // Show error message
      }
    });
    }
    else{
      let Payload:any={...this.programForm.value,stepNumber:this.currentStep,logisticsEvaluations:[],programDeliveryDetails:[],preEventChecklists:[],programId:this.programIds}
    this._commonService.add(APIS.programMonitoring.saveProgramMonitoring, Payload).subscribe({
      next: (response) => {
        this.disability=false
        //console.log('Success:', response);
        this.monitorId=response.data.monitorId
        // this.toastrService.success(this.curretstepsDetails[this.currentStep]+' Data Saved Successfully','Program Monitoring');
        if (this.currentStep < this.totalSteps) {
          this.currentStep++;

          this.updateProgressBar();
        }
        this.loadProgramFeedback(this.monitorId)
        // Show success message
      },
      error: (error) => {
        this.disability=false
        //console.error('Error:', error);
        this.toastrService.success(error.message,'Program Monitoring');
        // Show error message
      }
    });
    }
    
  }
  updateProgressBar(): void {
    const progress = (this.currentStep / this.totalSteps) * 100;
    // Update your progress bar here (implementation depends on your UI)
  }

  // onSubmit(): void {
  //   if (this.programForm.valid) {
  //     const formData = this.programForm.value;
  //     // Format date if needed
  //     formData.dateOfMonitoring = new Date(formData.dateOfMonitoring).toISOString().split('T')[0];

  //     this.programFeedbackService.updateProgramFeedback(152, formData).subscribe({
  //       next: (response) => {
  //         //console.log('Success:', response);
  //         // Show success message
  //       },
  //       error: (error) => {
  //         //console.error('Error:', error);
  //         // Show error message
  //       }
  //     });
  //   } else {
  //     // Mark all fields as touched to show validation messages
  //     this.markFormGroupTouched(this.programForm);
  //   }
  // }
  Enterdata(event:any){
    //console.log(event)
    const total=(this.programForm.get('maleParticipants')?.value || 0) + (this.programForm.get('femaleParticipants')?.value  || 0) + (this.programForm.get('transGenderParticipants')?.value  || 0)
    this.programForm.get('totalParticipants')?.setValue(total)
  }
  markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      }
    });
  }
  // Form Submission
  submit(){

    //console.log(this.programForm.value,this.programDeliveryDetailsForm.value)

    // this.fMon['programDeliveryDetails'](this.fMon['programDeliveryDetails'].value,this.programDeliveryDetailsForm.value)
    const deliveryDetailsArray = this.programForm.get('programDeliveryDetails') as FormArray;
    
    // Push the new form group
    deliveryDetailsArray.push(this.fb.group(this.programDeliveryDetailsForm.value));

    this.programDeliveryDetailsForm.reset();
  }
  deleteDelivery(index: number) {
    const deliveryDetailsArray = this.programForm.get('programDeliveryDetails') as FormArray;
    deliveryDetailsArray.removeAt(index);
  }
}
