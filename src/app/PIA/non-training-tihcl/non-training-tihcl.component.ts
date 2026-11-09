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
  selector: 'app-non-training-tihcl',
  templateUrl: './non-training-tihcl.component.html',
  styleUrls: ['./non-training-tihcl.component.css']
})
export class NonTrainingTihclComponent implements OnInit {

 
   financialForm!: FormGroup;
   travelForm!: FormGroup;
   paymentForm!: FormGroup;
    isSubmitted = false;
   loginsessionDetails: any;
   selectedAgencyId: any;
    getListingOnNSEData: any[] = [];
   @ViewChild(MonthlyRangeComponent) monthlyRange!: MonthlyRangeComponent;
  constructor(private fb: FormBuilder, private toastrService: ToastrService,
       private _commonService: CommonServiceService,
       private router: Router,) {
    this.loginsessionDetails = JSON.parse(sessionStorage.getItem('user') || '{}');    
      this.selectedAgencyId = this.loginsessionDetails.agencyId;
    //  this.financialForm = this.createForm();
 
   }
 
   ngOnInit(): void {
    this.initializeForm();
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
            //  this.getPreliminaryDataById()
         
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
           if(this.selectedBudgetHead=='67'){
             this.getDataFianance()
           }
           else{
              this.getListingOnNSE()
           }
 
           
         }, (error) => {
             if(this.selectedBudgetHead=='67'){
             this.getDataFianance()
           }
           else{
              this.getListingOnNSE()
           }
            // this.toastrService.error(error.message);
         });
       }
    getSubactivities(event:any){
        return this.SubActivityList?.find((item:any)=>item?.subActivityId==event)?.subActivityName || ''
      }
  getListingOnNSE(){
      this.getListingOnNSEData=[]
     this._commonService.getDataByUrl(APIS.nontrainingtargets.tihcl.getTihclData+this.selectedBudgetHead).subscribe((res: any) => {
           this.getListingOnNSEData = res.data
           this.physicalTargetAchievement=0
           this.physicalTargetAchievement=res.data.length

             this.getListingOnNSEData?.map((item:any)=>{
              this.financialTargetAchievement+=Number(item?.amountOfLoanProvided)
            })
     }, (error) => {
            // this.toastrService.error(error.message);
          this.getListingOnNSEData=[]
     }
        );
    }
 getCorpusData:any=[]
 totalSanctionedAmount: number = 0;
 totalAmountReleased: number = 0;
 get isBharathramLogin(): boolean {
   return (this.loginsessionDetails?.email || '').toLowerCase() === 'bharathram@tihcl.org';
 }
 getDataFianance(){
     this._commonService.getDataByUrl(APIS.nontrainingtargets.tihcl.getCorpusList).subscribe((res: any) => {
            this.getCorpusData=res.data;
            this.physicalTargetAchievement=0
            this.physicalTargetAchievement=this.getCorpusData?.length
            this.financialTargetAchievement=0
            this.totalSanctionedAmount = 0;
            this.totalAmountReleased = 0;
            this.getCorpusData?.map((item:any)=>{
              const sanctioned = Number(item?.sanctionedAmount) || 0;
              const released = Number(item?.totalDisbursedAmount) || 0;
              this.totalSanctionedAmount += sanctioned;
              this.totalAmountReleased += released;
              // bharathram@tihcl.org: financial achievement = Σ Amount Released.
              // Everyone else keeps the original behaviour (Σ Sanctioned Amount).
              this.financialTargetAchievement += this.isBharathramLogin ? released : sanctioned;
            })

        }, (error) => {
          // this.toastrService.error(error.message);
          this.financialTargetAchievement=0
          this.totalSanctionedAmount = 0;
          this.totalAmountReleased = 0;
        });
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
  convertToISOFormat(date: string): string {   
   if(date) {
     const [day, month, year] = date.split('-');
     return `${year}-${month}-${day}`; // Convert to yyyy-MM-dd format
   }
   else{
     return '';
   }
  
 }



//  corpusDebitFinancing
 corpusform!: FormGroup;
// Initialize the reactive form

  initializeForm(): void {
    this.corpusform = this.fb.group({
      nameOfTheMsmeIdentified: ['', [Validators.required]],
      dateOfIdentification: ['', [Validators.required]],
      amountOfLoanProvided: ['', [Validators.required, Validators.min(0)]],
      purpose: ['', [Validators.required]],
      dateOfLoan: ['', [Validators.required]],
      dateOfListing: ['', [Validators.required]],
      subActivityId: [this.selectedBudgetHead]
    });
  }
 isCorpusSubmitted = false;
  iseditMode = false;
  currentEditId: number | null = null;
  // CREATE & UPDATE operation
  onCorpusSubmit(): void {
    this.isCorpusSubmitted = true;
    
    if (this.corpusform.valid) {
      const formData = {
        ...this.corpusform.value,
        listingOnNSEId:0,
        dateOfIdentification: this.convertToISOFormat(this.corpusform.value.dateOfIdentification),
        dateOfLoan: this.convertToISOFormat(this.corpusform.value.dateOfLoan),
        dateOfListing: this.convertToISOFormat(this.corpusform.value.dateOfListing),
        subActivityId: Number(this.selectedBudgetHead)
      };

      if (this.iseditMode && this.currentEditId) {
        this._commonService.add(APIS.nontrainingtargets.tihcl.savetihclData,{...formData, listingOnNSEId: this.currentEditId,}).subscribe((res: any) => {
                  this.toastrService.success('Data Updated successfully','Non Training Progress Data Success!');
                  this.isCorpusSubmitted = false;
                   this.closeModal();
                
                }, (error) => {
                   this.closeModal();
                  this.isCorpusSubmitted = false;
                  this.toastrService.error(error.message,"Non Training Progress Data Error!");
      });
                this.getDeatilOfTargets()
       
      } else {
          this._commonService.add(APIS.nontrainingtargets.tihcl.savetihclData,formData).subscribe((res: any) => {
                  this.toastrService.success('Data Updated successfully','Non Training Progress Data Success!');
                  this.isCorpusSubmitted = false;
                   this.closeModal();
                
                }, (error) => {
                   this.closeModal();
                  this.isCorpusSubmitted = false;
                  this.toastrService.error(error.message,"Non Training Progress Data Error!");
      });
                this.getDeatilOfTargets()
       
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.corpusform.controls).forEach(key => {
        this.corpusform.get(key)?.markAsTouched();
      });
    }
  }
  // Open modal for add/edit
  openModel(mode: string, item?: any): void {
    this.iseditMode = mode === 'edit';
    this.isCorpusSubmitted = false;
    
    if (this.iseditMode && item) {
      this.currentEditId = item.listingOnNSEId;
      this.corpusform.patchValue({
        nameOfTheMsmeIdentified: item.nameOfTheMsmeIdentified,
        dateOfIdentification: this.convertToISOFormat(item.dateOfIdentification),
        amountOfLoanProvided: item.amountOfLoanProvided,
        purpose: item.purpose,
        dateOfLoan: this.convertToISOFormat(item.dateOfLoan),
        dateOfListing: this.convertToISOFormat(item.dateOfListing),
        subActivityId: item.subActivityId || this.selectedBudgetHead
      });
    } else {
      this.resetCorpusForm();
    }
    
    // Open Bootstrap modal
    const modal = new bootstrap.Modal(document.getElementById('addListingOnNSE'));
    modal.show();
  }

  // Reset form
  resetCorpusForm(): void {
    this.corpusform.reset();
    this.isCorpusSubmitted = false;
    this.iseditMode = false;
    this.currentEditId = null;
     // Set default subActivityId
    this.corpusform.patchValue({
      subActivityId: this.selectedBudgetHead
    });
  }
   // Close modal
  closeModal(): void {
    const modal = bootstrap.Modal.getInstance(document.getElementById('addListingOnNSE'));
    if (modal) {
      modal.hide();
    }
    this.resetCorpusForm();
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
        .deleteId(APIS.nontrainingtargets.tihcl.deletetihclData,item).subscribe({
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
}
