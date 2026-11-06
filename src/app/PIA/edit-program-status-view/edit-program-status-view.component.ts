  import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonServiceService } from '@app/_services/common-service.service';
import { APIS } from '@app/constants/constants';
import { ToastrService } from 'ngx-toastr';
import DataTable from 'datatables.net-dt';
import 'datatables.net-buttons-dt';
import 'datatables.net-responsive-dt';
declare var bootstrap: any;

@Component({
  selector: 'app-edit-program-status-view',
  templateUrl: './edit-program-status-view.component.html',
  styleUrls: ['./edit-program-status-view.component.css']
})
export class EditProgramStatusViewComponent implements OnInit {

  loginsessionDetails: any;
    agencyId: any;
    programIds:any
    constructor(private fb: FormBuilder,
      private toastrService: ToastrService,
      private _commonService: CommonServiceService, private router: Router,) { 
        this.agencyId = JSON.parse(sessionStorage.getItem('user') || '{}').agencyId;
      }
  
    ngOnInit(): void {
   
    this.loginsessionDetails = JSON.parse(sessionStorage.getItem('user') || '{}');  
    if(this.loginsessionDetails.userRole == 'ADMIN') {
      this.getAgenciesList()
    }
       this.getProgramsStatus()
    this.initializeEditForm();

  }
  ProgramStatusDropdown:any=['Program Created', 'Participants Added', 'Sessions Created','Program Execution Updated','Program Expenditure Updated', 'Program Expenditure Approved', 'Collage Added']
  getProgramsStatus(){
  console.log('getProgramsStatus');
     this._commonService.getDataByUrl(APIS.programCreation.getProgramStatus).subscribe({
        next: (res: any) => {
          this.ProgramStatusDropdown = res
          console.log( this.ProgramStatusDropdown);
        },
        error: (err:any) => {
          console.log('err',err);
          new Error(err);
        }
      })
}
     selectedAgencyId:any;
    agencyList:any;
    agencyListFiltered:any;
  getAgenciesList() {
    this.agencyList = [];
    this._commonService.getDataByUrl(APIS.masterList.agencyList).subscribe((res: any) => {
      this.agencyList = res.data;
      this.agencyListFiltered= this.agencyList;
      this.selectedAgencyId = res.data[0].agencyId
      this.getProgramsByAgencyAdmin(this.selectedAgencyId)
    }, (error) => {
      this.toastrService.error(error.error.message);
    });
  }
   agencyProgramList: any;
    agencyProgramListFiltered:any;
    getProgramsByAgencyAdmin(agency:any) {
        this.editProgramForm.reset();
      this._commonService.getDataByUrl(`${APIS.programCreation.getProgramsListByAgency+'/'+agency}`).subscribe({
        next: (res: any) => {
          this.agencyProgramList = res?.data
          this.agencyProgramListFiltered = this.agencyProgramList
          this.programIds = this.agencyProgramList[0]
          this.dropdownProgramsList(this.agencyProgramList[0],'table')
        },
        error: (err) => {
          new Error(err);
        }
      })
    }
    ProgramsDataBasedOnSelection:any={}
    dropdownProgramsList(event:any,from:any){
      console.log(event);
      this.ProgramsDataBasedOnSelection= event;
    }

 editProgramForm!: FormGroup;
  isEditModalOpen: boolean = false;
  initializeEditForm() {
    this.editProgramForm = this.fb.group({
      programTitle: ['', ],
      //  programTitle: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]+(\s[a-zA-Z]+)*$/)]],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      startTime: ['', ],
      endTime: ['', ],
      spocName: ['',],
      spocContactNo: ['', ],
      locationId: ['', ],
      status: ['', [Validators.required]]
    }, { validators: this.validateDates });
  }
getStatus(i:any,ProgramStatusDropdown:any,status:any){
  if(i <= ProgramStatusDropdown.indexOf(status)){
    return true;
  }
  else{
    return false;
  }

}
  validateDates: ValidatorFn = (formGroup: AbstractControl): ValidationErrors | null => {
    const startDate = formGroup.get('startDate')?.value;
    const endDate = formGroup.get('endDate')?.value;
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      // End date should not be before start date
      if (end < start) {
        formGroup.get('endDate')?.setErrors({ invalidEndDate: true });
        return { invalidEndDate: true };
      }
      // Start date should not be in the past (optional - remove if not needed)
      // if (start < currentDate) {
      //   formGroup.get('startDate')?.setErrors({ pastDate: true });
      //   return { pastDate: true };
      // }
    }

    // Clear errors if validation passes
    if (formGroup.get('endDate')?.errors?.['invalidEndDate']) {
      formGroup.get('endDate')?.setErrors(null);
    }
    // if (formGroup.get('startDate')?.errors?.['pastDate']) {
    //   formGroup.get('startDate')?.setErrors(null);
    // }
    
    return null;
  }

  onEditProgram() {
    if (this.ProgramsDataBasedOnSelection) {
      // Populate form with existing data
      this.editProgramForm.patchValue({
        programTitle: this.ProgramsDataBasedOnSelection.programTitle,
        startDate: this.convertDateForInput(this.ProgramsDataBasedOnSelection.startDate),
        endDate: this.convertDateForInput(this.ProgramsDataBasedOnSelection.endDate),
        startTime: this.ProgramsDataBasedOnSelection.startTime,
        endTime: this.ProgramsDataBasedOnSelection.endTime,
        spocName: this.ProgramsDataBasedOnSelection.spocName,
        spocContactNo: this.ProgramsDataBasedOnSelection.spocContactNo,
        locationId: this.ProgramsDataBasedOnSelection.locationId || 1,
        status: this.ProgramsDataBasedOnSelection.status
      });

      // Show modal
      const editModal = document.getElementById('editProgramModal');
      if (editModal) {
        const modalInstance = new bootstrap.Modal(editModal);
        modalInstance.show();
        this.isEditModalOpen = true;
      }
    }
  }

  convertDateForInput(dateString: string): string {
    if (!dateString) return '';
    // Convert from DD-MM-YYYY to YYYY-MM-DD for input[type="date"]
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateString;
  }

  convertDateForAPI(dateString: string): string {
    if (!dateString) return '';
    // Convert from YYYY-MM-DD to DD-MM-YYYY for API
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateString;
  }

  onSubmitEdit() {
    const formValues = this.editProgramForm.value;
      console.log(formValues)
      const payload = {
        programTitle: formValues.programTitle,
        startDate: this.convertDateForAPI(formValues.startDate),
        endDate: this.convertDateForAPI(formValues.endDate),
        startTime: formValues.startTime,
        endTime: formValues.endTime,
        spocName: formValues.spocName,
        spocContactNo: parseInt(formValues.spocContactNo),
        locationId: parseInt(formValues.locationId),
        status: formValues.status
      };

      const programId = this.ProgramsDataBasedOnSelection.programId || this.ProgramsDataBasedOnSelection.id;
         console.log(payload,'paylo ')
      this._commonService.updatedata(`${APIS.programCreation.updateProgramStatus}/${programId}`, payload).subscribe({
        next: (res: any) => {
          this.toastrService.success('Program updated successfully!');
          this.closeConfirmSession()
          // Refresh the program data
          if (this.loginsessionDetails.userRole === 'ADMIN') {
            this.getProgramsByAgencyAdmin(this.selectedAgencyId);
          }
        },
        error: (err) => {
           this.closeConfirmSession()
          this.toastrService.error(err.error?.message || 'Failed to update program');
        }
      });
    
  }

  closeConfirmSession() {
      const editSessionModal = document.getElementById('exampleModalDeleteConfirm');
      if (editSessionModal) {
          const modalInstance = bootstrap.Modal.getInstance(editSessionModal);
          modalInstance.hide();
        }
  }
  ShowConfirmSession() {
    if (this.editProgramForm.valid && this.ProgramsDataBasedOnSelection) {
      console.log('Form is valid, showing confirmation modal');
      this.closeEditModal();
      const editSessionModal = document.getElementById('exampleModalDeleteConfirm');
      if (editSessionModal) {
        let modalInstance = bootstrap.Modal.getInstance(editSessionModal);
        if (!modalInstance) {
          modalInstance = new bootstrap.Modal(editSessionModal);
        }
        modalInstance.show();
      }
    } else {
      this.closeConfirmSession();
      this.markFormGroupTouched(this.editProgramForm);
      this.toastrService.warning('Please fill all required fields correctly');
    }
  }
  closeEditModal() {
    const editModal = document.getElementById('editProgramModal');
    if (editModal) {
      const modalInstance = bootstrap.Modal.getInstance(editModal);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
    this.isEditModalOpen = false;
    // this.editProgramForm.reset();
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Getter for easy access to form controls in template
  get editFormControls() {
    return this.editProgramForm.controls;
  }

}
