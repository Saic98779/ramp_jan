import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonServiceService } from '@app/_services/common-service.service';
import { APIS } from '@app/constants/constants';
import { ToastrService } from 'ngx-toastr';
import DataTable from 'datatables.net-dt';
import 'datatables.net-buttons-dt';
import 'datatables.net-responsive-dt';
import moment from 'moment';

@Component({
  selector: 'app-verification-participant',
  templateUrl: './verification-participant.component.html',
  styleUrls: ['./verification-participant.component.css']
})
export class VerificationParticipantComponent implements OnInit {
  verificationForm!: FormGroup;
  showQuestions: boolean = false;
  agencies: any[] = [];
  programs: any[] = [];
  participants: any[] = [];
  selectedAgency: string = '';
  selectedProgram: string = '';
  showTable: boolean = false;
  dataTable: any;
  agencyId:any;
  userDetails:any
  constructor(
    private _commonService: CommonServiceService,
    private toastrService: ToastrService,
    private fb: FormBuilder
  ) {
    this.userDetails = JSON.parse(sessionStorage.getItem('user') || '{}');
    console.log(this.userDetails);
    this.agencyId = JSON.parse(sessionStorage.getItem('user') || '{}').email;
    console.log(this.agencyId,'agency')
    this.verificationForm=this.fb.group({verificationStatusId:new FormControl('',[Validators.required] ),isNotificationSent:new FormControl(false),message:new FormControl('')});
    
  }

  ngOnInit(): void {
    this.loadAgencies();
    this.loadVerisationStatus()
  }
  get fVerf(){
   return this.verificationForm.controls;
  }
  onVerificationStatusChange(status: string,id:any): void {

    this.showQuestions = status === 'Verified';
    // this.verificationForm.reset()
    // this.fVerf['verificationStatusId'].setValue(id)
    // this.verificationForm.get('verificationStatusId')?.setValue(id)

  }
  getParticipantByUpdate:any
  ParticpantdataBYTable(data:any){
    this.getParticipantByUpdate=data
    console.log(data)
    this.verificationForm.reset();
    if(data?.ccVerificationStatusId && data?.questionAnswersList){
      if(data?.ccVerificationStatusId==1){
        this.showQuestions = true;
      }
     
      this.verificationForm.patchValue(this.mapToVerificationForm(data, this.verificationForm?.value))
    }
    else{
      this.showQuestions = false;
      this.verificationForm.patchValue({verificationStatusId:7})
    }
   
    console.log(this.verificationForm.value,data?.ccVerificationStatusId)
    // this.verificationForm.get('verificationStatusId')?.setValue(data?.ccVerificationStatusId)
    // this.fVerf['verificationStatusId'].patchValue(data?.ccVerificationStatusId)

  }
  mapToVerificationForm(response: any,fromdata:any): any {
    const form:any = {
      verificationStatusId: response.ccVerificationStatusId
  };
  
  response.questionAnswersList.forEach((qa:any) => {
      const key = `question_${qa.question.questionId}`;
      
      if (qa.question.questionType === "RadioButton") {
          form[key] = qa.answers || null;
      } else if (qa.question.questionType === "checkBox") {
          form[key] = qa.answers ? qa.answers.split(',') : [null, null, null];
      }
  });
  console.log(form)
  return form;

    // const verificationForm = {...fromdata,verificationStatusId: response.ccVerificationStatusId,};

    // // Map each question answer
    // response.questionAnswersList.forEach((qa: any) => {
    //   const questionId = qa.question.questionId;
    //   const answer = qa.answers === 'null' ? null : qa.answers;
      
    //   if (questionId === 1) {
    //     verificationForm.question_1 = answer;
    //   } else if (questionId === 2) {
    //     verificationForm.question_2 = answer;
    //   }
    // });

    // return verificationForm;
  }

  // Load Agencies
  agenciesFiltered:any=[]
  loadAgencies(): void {
    this._commonService.getDataByUrl(APIS.masterList.agencyList).subscribe({
      next: (data: any) => {
        this.agencies = data.data;
        this.agenciesFiltered = this.agencies
      },
      error: (err) => {
        console.error('Error loading agencies:', err);
      }
    });
  }
  // Load Programs
  programsFiltered:any=[]
  onAgencyChange(): void {
    this.programs = [];
    this.selectedProgram = '';
    if (this.selectedAgency) {
      // https://ramp-tg.metaversedu.in/workflow/programs/status/status-list/1?statuses=Attendance%20Marked&statuses=Program%20Execution%20Updated&statuses=Program%20Expenditure%20Updated'
      // `${APIS.programCreation.getProgramsListByAgency}/${this.selectedAgency}`
      let url=`${APIS.programCreation.getNewProgramListByAgency}${this.selectedAgency}?statuses=Attendance%20Marked&statuses=Program%20Execution%20Updated&statuses=Program%20Execution&statuses=Program%20Expenditure%20Updated`
      this._commonService.getDataByUrl(url).subscribe({
        next: (data: any) => {
          this.programs = data.data;
          this.programsFiltered = this.programs
        },
        error: (err) => {
          console.error('Error loading programs:', err);
        }
      });
    }
  }
  // Change Program
  onProgramChange(): void {
    this.participants = [];
    this.showTable = false;   
    this.getProgramDetailsById(this.selectedProgram)
  }
  // Show Participant
  showParticipants(): void {
    this.showTable = true;
    this.participants = [];
    if (this.selectedProgram) {
      this._commonService.getDataByUrl(`${APIS.callCenter.getDataByProgramVerificationId}${this.selectedProgram}`).subscribe({
        next: (data: any) => {
          if(data.data.length === 0){
            this.toastrService.success('No Records Found', 'Success');
          }else{
            this.participants = data.data;
          
          
            this.reinitializeDataTable()
          }
          
        },
        error: (err) => {
          console.error('Error loading participants:', err);
        }
      });
    }
  }
  reinitializeDataTable() {
    if (this.dataTable) {
      this.dataTable.destroy();
    }
    setTimeout(() => {
      this.initializeDataTable();
    }, 0);
  }

  initializeDataTable() {
    this.dataTable = new DataTable('#view-table-callcenter', {
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

  // get Verification Status Fields
  verificationStatus:any=[]
  loadVerisationStatus() {
    this.verificationStatus=[]
    this._commonService.getDataByUrl(APIS.callCenter.getVeriaficationStatus).subscribe({
      next: (data: any) => {
        this.verificationStatus = data.data;
      },
      error: (err) => {
        this.verificationStatus=[]
        console.error('Error loading agencies:', err);
      }
    });
  }
  programData:any={}
  getProgramDetailsById(ProgrmId:any){
    this._commonService.getById(APIS.programCreation.getSingleProgramsList, ProgrmId)?.subscribe({
      next: (data: any) => {
       if(data?.data){
         this.programData = data?.data;
         this.getQuestionBySubactivityId()
       }
       
        
      },
      error: (err: any) => {
        this.toastrService.error(err.message, "Error fetching program details!");
      }
    });
  }
  onNotificationCheckboxChange(event: any) {
    if (event.target.checked) {
      this.fVerf['message'].setValue(this.fVerf['message'].value || '');
      this.fVerf['message'].setValidators([Validators.required, Validators.minLength(10)]);
    } else {
       this.fVerf['message'].setValue('');
      this.fVerf['message'].clearValidators();
    }
    this.fVerf['message'].updateValueAndValidity();
  }
  GetQuestion: any[] = []; // Initialize as an array
 getQuestionBySubactivityId(){
  this.GetQuestion = []; // Reset to an empty array at the start
  this.verificationForm = this.fb.group({verificationStatusId:new FormControl('',[Validators.required] ),isNotificationSent:new FormControl(false),message:new FormControl('')});

  this._commonService.getById(APIS.callCenter.getQuestionById, this.programData.subActivityId).subscribe({
    next: (data: any) => {
      // Ensure data.data is an array before assigning it
      if (data && Array.isArray(data.data)) {
        this.GetQuestion = data.data;
      } else if (data && data.data) {
        // If it's a single object, wrap it in an array
        this.GetQuestion = [data.data];
      } else {
        // Otherwise, ensure it's an empty array
        this.GetQuestion = [];
      }

      this.GetQuestion.forEach((question:any) => {
        if (question.questionType === 'RadioButton') {
          this.verificationForm.addControl(`question_${question.questionId}`, new FormControl(''));
        } else if (question.questionType === 'checkBox') {
          const answers = this.getAnswersArray(question.answers);
          const checkboxControls = answers.map(() => new FormControl(false));
          this.verificationForm.addControl(`question_${question.questionId}`, new FormArray(checkboxControls));
        } else {
          this.verificationForm.addControl(`question_${question.questionId}`, new FormControl(''));
        }
      });
    },
    error: (err: any) => {
      // this.toastrService.error("Could not fetch questions due to a server error.", "API Error!");
      this.GetQuestion = []; 
    }
  });
 }
  // Fixed method with proper typing
  getCheckboxControl(questionId: number, index: number): FormControl {
    const formArray = this.verificationForm.get(`question_${questionId}`) as FormArray;
    return formArray.at(index) as FormControl;
  }

  getAnswersArray(answersString: string): string[] {
    return answersString?.split(',').map(item => item.trim());
  }

  // update 
  submitVerification() {
    let payload:any={
      "programId": this.programData.programId,
      "participantId": this.getParticipantByUpdate?.participantId,
      "verifiedBy": this.agencyId,
      "verificationDate": moment().format('yyyy-MM-DD'),
      "verificationStatusId": this.verificationForm.value?.verificationStatusId?Number(this.verificationForm.value?.verificationStatusId):7,
      "questionAnswerList": this.prepareQuestionAnswers(this.verificationForm.value),
      "message": this.fVerf['isNotificationSent'].value ? this.fVerf['message'].value : null,
    }
    console.log(payload,'srk')
    this._commonService
      .add(APIS.callCenter.add, payload).subscribe({
        next: (data: any) => {
         this.showParticipants()
          if(!this.verificationForm.value?.isNotificationSent){
            this.toastrService.success('Participant Verification Updated Successfully', 'Success');
          }
         
        },
        error: (err) => {

          this.toastrService.error(err.message, "Participant Data Error!");
          new Error(err);
        },
      });
    
      if(this.verificationForm.value?.isNotificationSent){
        let payloadNotifiction= {
                        "callCenterUserId":   this.agencyId, 
                        "agencyId": this.programData.agencyId,
                        "participantId": this.getParticipantByUpdate?.participantId,
                        "programId": this.programData.programId,
                        "message": this.fVerf['isNotificationSent'].value ? this.fVerf['message'].value : null,
                      }
         this._commonService.add(APIS.callCenter.updateNotificationCCToAgency,payloadNotifiction).subscribe({
        next: (data: any) => {
         this.showParticipants()
         this.toastrService.success('Participant Verification Updated Successfully', 'Success');
        },
        error: (err) => {

          this.toastrService.error(err.message, "Participant Data Error!");
          new Error(err);
        },
      });

      }
  
  }
  prepareQuestionAnswers(formData: any): any[] {
    return this.GetQuestion.map((question:any) => {
      const questionKey = `question_${question.questionId}`;
      const formValue = formData[questionKey];

      if (question.questionType === 'RadioButton') {
        return {
          questionId: question.questionId,
          answers: [formValue] // Radio button returns single value as array
        };
      } else if (question.questionType === 'checkBox') {
        const answers = this.getAnswersArray(question.answers);
        const selectedAnswers = answers.filter((_, index) => formValue[index]);
        return {
          questionId: question.questionId,
          answers: selectedAnswers
        };
      }
      return null;
    }).filter((item:any) => item !== null);
  }
}
