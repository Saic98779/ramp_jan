import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonServiceService } from '@app/_services/common-service.service';
import { APIS } from '@app/constants/constants';
import { ToastrService } from 'ngx-toastr';
import DataTable from 'datatables.net-dt';
import 'datatables.net-buttons-dt';
import 'datatables.net-responsive-dt';

@Component({
  selector: 'app-all-participants-verification',
  templateUrl: './all-participants-verification.component.html',
  styleUrls: ['./all-participants-verification.component.css']
})
export class AllParticipantsVerificationComponent implements OnInit {

  verificationForm!: FormGroup;
  showQuestions: boolean = false;
  agencies: any[] = [];
  programs: any[] = [];
  participants: any[] = [];
  selectedAgency: string = '';
  selectedProgram: string = '';
  showTable: boolean = false;
  dataTable: any;
  constructor(
    private _commonService: CommonServiceService,
    private toastrService: ToastrService,
    private fb: FormBuilder
  ) {
    this.verificationForm = this.fb.group({
      verificationStatus: ['', Validators.required],
      attendedProgram: [''],
      morningSession: [false],
      afternoonSession: [false],
      programUseful: [''],
      programSource: [''],
      foodQuality: [''],
      trainerQuality: [''],
      contactForPrograms: ['']
    });
  }

  onVerificationStatusChange(status: string): void {
    this.showQuestions = status === 'Answered';
    this.verificationForm.reset();
    this.verificationForm.get('verificationStatus')?.setValue(status)
  }

  submitVerification(): void {
    // if (this.verificationForm.valid) {
    //   console.log(this.verificationForm.value);
    //   // Handle form submission logic here
    // } else {
    //   console.error('Form is invalid');
    // }
    this.toastrService.success('Participant Verification Updated Successfully', 'Success');
  }

  ngOnInit(): void {
    this.loadAgencies();
  }

  loadAgencies(): void {
    this._commonService.getDataByUrl(APIS.masterList.agencyList).subscribe({
      next: (data: any) => {
        this.agencies = data.data;
      },
      error: (err) => {
        console.error('Error loading agencies:', err);
      }
    });
  }

  onAgencyChange(): void {
    this.programs = [];
    this.selectedProgram = '';
    if (this.selectedAgency) {
      this._commonService.getDataByUrl(`${APIS.programCreation.getProgramsListByAgency}${this.selectedAgency}`).subscribe({
        next: (data: any) => {
          this.programs = data.data;
        },
        error: (err) => {
          console.error('Error loading programs:', err);
        }
      });
    }
  }

  onProgramChange(): void {
    this.participants = [];
    this.showTable = false;   
  }

  showParticipants(): void {
    this.showTable = true;
    this.participants = [];
    if (this.selectedProgram) {
      this._commonService.getDataByUrl(`${APIS.participantdata.getDataByProgramId}${this.selectedProgram}`).subscribe({
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
 // get program details 
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
 GetQuestion:any=[]
 getQuestionBySubactivityId(){
  this.GetQuestion={}
  this.verificationForm=new FormGroup({verificationStatusId:new FormControl('',[Validators.required])})
  this._commonService.getById(APIS.callCenter.getQuestionById, this.programData?.subActivityId).subscribe({
    next: (data: any) => {
      this.GetQuestion = data.data;
      this.GetQuestion.map((item:any,index:any)=>{
        item.answers= item.answers.split(',')
        item['formValue']='Q'+(index+1)
        this.verificationForm.addControl('Q'+(index+1), new FormControl(''))
      })
      
    },
    error: (err: any) => {
      this.toastrService.error(err.message, "Error fetching Questions details!");
    }
  });
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

}