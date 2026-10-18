
 import { Component, OnInit } from '@angular/core';
 import { FormBuilder, FormGroup, Validators } from '@angular/forms';
 import { CommonServiceService } from '../../../../_services/common-service.service';
 import { Ticket } from '../../../../_models/ticket.model';
 import { APIS, API_BASE_URL } from '../../../../constants/constants';
 import { ToastrService } from 'ngx-toastr';
 import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
 import { tick } from '@angular/core/testing';
 
 declare var bootstrap: any;
 declare var $: any;

@Component({
  selector: 'app-closed-tickets',
  templateUrl: './closed-tickets.component.html',
  styleUrls: ['./closed-tickets.component.css']
})
export class ClosedTicketsComponent implements OnInit {
   ticketForm: FormGroup;
   tickets: Ticket[] = [];
   selectedTicket: any | null = null;
   isEditMode = false;
   loading = false;
   selectedFiles: any = [];
   message = '';
   messageType: 'success' | 'error' = 'success';
   deleteTicketId: string = '';
   isSubmitted = false;
   dataTable: any;
 adminUpdateForm!: FormGroup; 
   // File preview properties
   filePreviewUrl: string = '';
   filePreviewType: 'image' | 'pdf' | 'document' = 'document';
   selectedFileName: string = '';
   currentTicketFiles: any[] = [];
   isDocViewerAvailable = false;
 
   // Pagination properties
   currentPage = 0;
   pageSize = 10;
   totalElements = 0;
   totalPages = 0;
 
   priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
   statuses = [
     'CREATED',
     'UNDER_REVIEW',
     'IN_PROGRESS',
     'UPDATED_WITH_INFO',
     'APPROVED',
     'RESOLVED',
     'CLOSED',
     'ADDITIONAL_INFO_NEEDED'
   ];
   types = ['BUG', 'FEATURE', 'NEW ENHANCEMENT', 'SUPPORT'];
   loginsessionDetails:any
   selectedAgencyId:any
   adminAssigneeData:any=[]
   constructor(
     private formBuilder: FormBuilder,
     private commonService: CommonServiceService,
     private toastrService: ToastrService,
     private sanitizer: DomSanitizer
   ) {
    
      this.initializeAdminUpdateForm();
     this.getAssigneeName()
      this.loginsessionDetails = JSON.parse(sessionStorage.getItem('user') || '{}');    
      this.selectedAgencyId = this.loginsessionDetails.agencyId;
 
     this.ticketForm = this.formBuilder.group({
       title: ['', [Validators.required, Validators.minLength(3)]],
       description: ['', [Validators.required, Validators.minLength(10)]],
       priority: ['LOW', [Validators.required]],
       status: ['CREATED', [Validators.required]],
       type: ['SUPPORT', [Validators.required]],
       message:[''],
       assigneeId: [this.loginsessionDetails?.userRole == 'ADMIN' || this.loginsessionDetails?.userRole == 'SPIU'?'dev@gmail.com':'admin@gmail.com',],
       reporterId:[this.loginsessionDetails.userId],
       assigneeName: ['',]
     });
      this.getStatusBasedLogin()
   }
 
   ngOnInit(): void {
     this.loadTickets();
   }
   // statuses
   getStatusBasedLogin(){
      this.statuses=[]
      let Role=this.loginsessionDetails.userRole!='ADMIN' && this.loginsessionDetails?.userRole != 'SPIU'&&  this.loginsessionDetails.userRole!='DEVELOPER' ?'AGENCY':this.loginsessionDetails.userRole
        this.commonService.getDataByUrl(APIS.tickets.getAllStatus+Role+'/statuses').subscribe({
       next: (response) => {
         this.statuses=response
       },
       error: (error) => {
         console.error('Error loading assignees:', error);
         this.showMessage('Error loading assignees', 'error');
       }
     });
   }
   getAssineeData: any = []
  getAssigneeName() {
     this.getAssineeData = [];
     this.commonService.getDataByUrl(APIS.tickets.getAllUser).subscribe({
       next: (response) => {
         if (response && response.data?.length > 0) {
             // Only keep users that have an agencyId property and get only userId
             this.getAssineeData = response.data
               .filter((user: any) => user.hasOwnProperty('agencyId'))
               .map((user: any) => user.userId);
         } else {
           this.getAssineeData = [];
         }
       },
       error: (error) => {
         console.error('Error loading assignees:', error);
         this.showMessage('Error loading assignees', 'error');
       }
     });
   }
 
   // Load all tickets with updated structure
   loadTickets(): void {
     this.loading = true;
     let url:any=(this.loginsessionDetails?.userRole=='ADMIN' || this.loginsessionDetails?.userRole == 'SPIU')?APIS.tickets.getAll+'?statusFilter=CLOSED':APIS.tickets.getDataByReportandStatus+this.loginsessionDetails.userId+'?statusFilter=CLOSED'
     this.commonService.getDataByUrl(url).subscribe({
       next: (response) => {
         console.log('Load tickets response:', response);
         if (response && response.status === 200 && response.data) {
           this.tickets = response.data;
           this.totalElements = response.totalElements || response.data.length;
           this.totalPages = response.totalPages || Math.ceil(this.totalElements / this.pageSize);
         } else if (response && Array.isArray(response)) {
           this.tickets = response;
           this.totalElements = response.length;
         } else {
           this.tickets = [];
           this.totalElements = 0;
         }
         
         this.loading = false;
         this.reinitializeDataTable();
       },
       error: (error) => {
         console.error('Error loading tickets:', error);
         this.loading = false;
         this.tickets = [];
         this.totalElements = 0;
         this.reinitializeDataTable();
       }
     });
   }
 
   // DataTable methods
   reinitializeDataTable() {
     if (this.dataTable) {
       this.dataTable.destroy();
     }
     setTimeout(() => {
       this.initServerSideDataTable();
     }, 100);
   }
 
   // Updated DataTable configuration for the new response structure
  
  initServerSideDataTable() {
  const self = this;
  
  // Check if user is ADMIN or SPIU to show additional columns
  const isAdminOrSpiu = this.loginsessionDetails?.userRole === 'ADMIN' || this.loginsessionDetails?.userRole === 'SPIU';
  
  this.dataTable = $('#tickets-table').DataTable({
    destroy: true,
    scrollY: "415px",
    scrollX: true,
    scrollCollapse: true,
    paging: true,
    serverSide: true,
    processing: true,
    pageLength: 10,
    lengthMenu: [5, 10, 25, 50],
    autoWidth: false,
    info: true,
    searching: false,
    ajax: (data: any, callback: any, settings: any) => {
      const page = data.start / data.length;
      const size = data.length;
      
      let params = `&page=${page}&size=${size}`;
      
      console.log('API Call:', `${APIS.tickets.getDataByReportId+this.loginsessionDetails.userId}${params}`);
     let url:any=(this.loginsessionDetails?.userRole=='ADMIN' || this.loginsessionDetails?.userRole == 'SPIU')?APIS.tickets.getAll+'?statusFilter=CLOSED':APIS.tickets.getDataByReportandStatus+this.loginsessionDetails.userId+'?statusFilter=CLOSED'
      
      this.commonService.getDataByUrl(`${url}${params}`)
        .subscribe({
          next: (res: any) => {
            console.log('Server response:', res);
            let responseData = [];
            let totalElements = 0;
            
            if (res && res.status === 200 && res.data) {
              responseData = res.data;
              totalElements = res.totalElements || res.data.length;
            } else if (res && Array.isArray(res)) {
              responseData = res;
              totalElements = res.length;
            }
            
            self.tickets = responseData;
            self.totalElements = totalElements;
            
            callback({
              draw: data.draw,
              recordsTotal: totalElements,
              recordsFiltered: totalElements,
              data: responseData
            });
          },
          error: (err) => {
            console.error('Error loading tickets:', err);
            self.toastrService.error(err.message || 'Error loading tickets', "Tickets Error!");
            callback({
              draw: data.draw,
              recordsTotal: 0,
              recordsFiltered: 0,
              data: []
            });
          }
        });
    },
    columns: [
      { 
        title: 'S.No',
        render: function(data: any, type: any, row: any, meta: any) {
      return meta.settings._iDisplayStart + meta.row + 1;
        },
        className: 'text-center',
        orderable: false,
        width: isAdminOrSpiu ? '4%' : '5%'
      },
      { 
        data: 'title',
        title: 'Title',
        className: 'text-start fw-bold text-wrap',
        width: isAdminOrSpiu ? '15%' : '30%',
        render: function(data: any, type: any, row: any) {
      return `<span class="text-primary cursor-pointer" title="Click for details">${data || '-'}</span>`;
        }
      },
      { 
        data: 'ticketId',
        title: 'Ticket Id',
        className: 'text-start fw-bold',
        width: isAdminOrSpiu ? '10%' : '10%',
        render: function(data: any, type: any, row: any) {
      return `<span  title="Click for details">${data || '-'}</span>`;
      }
        },
       
        { 
      data: 'status',
      title: 'Status',
      render: function(data: any, _type: any, _row: any) {
      if (!data) return '-';
      const statusText = data.replace(/_/g, ' ');
      let style = '';
      switch (data) {
        case 'CREATED':
        style = 'background-color: #007bff; color: #fff;';
        break;
        case 'UNDER_REVIEW':
        style = 'background-color: #ffc107; color: #212529;';
        break;
        case 'IN_PROGRESS':
        style = 'background-color: #fd7e14; color: #fff;';
        break;
        case 'RESOLVED':
        style = 'background-color: #28a745; color: #fff;';
        break;
        case 'CLOSED':
        style = 'background-color: #6c757d; color: #fff;';
        break;
        case 'ADDITIONAL_INFO_NEEDED':
        style = 'background-color: #dc3545; color: #fff;';
        break;
        case 'APPROVED':
        style = 'background-color: #198754; color: #fff;';
        break;
        case 'UPDATED_WITH_INFO':
        style = 'background-color: #0dcaf0; color: #212529;';
        break;
        default:
        style = 'background-color: #adb5bd; color: #fff;';
      }
      return `<span class="badge" style="${style}">${statusText}</span>`;
      },
      className: 'text-center',
      width: isAdminOrSpiu ? '10%' : '12%'
        },
        {
      data: 'assigneeId',
      title: 'Assignee Id',
      render: function(data: any, _type: any, row: any) {
      return data || row.assigneeId || 'unassigned';
        },
        className: 'text-start',
        width: isAdminOrSpiu ? '12%' : '15%'
      },
       // Agency Name column - only for ADMIN/SPIU
        ...(isAdminOrSpiu ? [{
          data: 'agencyName',
          title: 'Agency Name',
          className: 'text-start',
          width: '12%',
          render: function(data: any, _type: any, row: any) {
            return data || row.agencyName || '-';
          }
        }] : []),
        // Reporter ID column - only for ADMIN/SPIU
        ...(isAdminOrSpiu ? [{
          data: 'reporterId',
          title: 'Reporter ID',
          className: 'text-start',
          width: '12%',
          render: function(data: any, _type: any, row: any) {
            return data || row.reporterId || '-';
          }
        }] : []),
      { 
        data: 'type',
        title: 'Type',
        render: function(data: any, _type: any, _row: any) {
      if (!data) return '-';
      let style = '';
      switch (data) {
        case 'BUG':
        case 'ISSUE':
          style = 'background-color: #dc3545; color: #fff;';
          break;
        case 'FEATURE':
          style = 'background-color: #28a745; color: #fff;';
          break;
        case 'NEW ENHANCEMENT':
          style = 'background-color: #17a2b8; color: #fff;';
          break;
        case 'SUPPORT':
          style = 'background-color: #007bff; color: #fff;';
          break;
        default:
          style = 'background-color: #6c757d; color: #fff;';
      }
      return `<span class="badge" style="${style}">${data}</span>`;
        },
        className: 'text-center',
        width: isAdminOrSpiu ? '8%' : '10%'
      },
      {
        data: 'priority',
        title: 'Priority',
        render: function(data: any, _type: any, _row: any) {
      if (!data) return '-';
      let style = '';
      switch (data) {
        case 'LOW':
          style = 'background-color: #17a2b8; color: #fff;';
          break;
        case 'MEDIUM':
          style = 'background-color: #ffc107; color: #212529;';
          break;
        case 'HIGH':
          style = 'background-color: #fd7e14; color: #fff;';
          break;
        case 'CRITICAL':
          style = 'background-color: #dc3545; color: #fff;';
          break;
        default:
          style = 'background-color: #6c757d; color: #fff;';
      }
      return `<span class="badge" style="${style}">${data}</span>`;
        },
        className: 'text-center',
        width: isAdminOrSpiu ? '8%' : '10%'
      },
      {
        data: 'updatedAt',
        title: 'Created On',
        render: function(data: any, type: any, row: any) {
      if (data) {
        try {
          // Handle dd-mm-yyyy format
          if (data.includes('-') && data.split('-').length === 3) {
        return data;
          }
          const date = new Date(data);
          return date.toLocaleDateString('en-GB');
        } catch (e) {
          return data;
        }
      }
      return '-';
          },
          className: 'text-center',
          width: isAdminOrSpiu ? '10%' : '12%'
        },
        { 
          data: null,
          title: 'Actions',
          name: 'actions',
          render: (data: any, type: any, row: any, meta: any) => {
          const hasAttachments = row.attachments && row.attachments.length > 0;
          const hasComments = row.comments && row.comments.length > 0;

          let actions = `
            <div class="btn-group" role="group">
            <button type="button" class="btn btn-lime-green btn-sm view-details-btn"  
              data-row='${JSON.stringify(row).replace(/'/g, "&#39;")}' 
              title="View Details">
              <i class="fas fa-eye"></i> Details
            </button>
          `;

          // Only show edit button if not admin
         //  if (this.loginsessionDetails?.userId === row.reporterId) {
         //    actions += `
         //    <button type="button" class="btn btn-lime-green btn-sm edit-btn ms-1"  [ngClass]="{'disabled': row.status === 'CLOSED' }"
         //      data-row='${JSON.stringify(row).replace(/'/g, "&#39;")}' 
         //      title="Edit Ticket">
         //      <i class="fas fa-edit"></i>
         //    </button>
         //    `;
         //  }

          actions += `</div>`;
          return actions;
          },
          // className: 'text-center',
          orderable: false,
          width: isAdminOrSpiu ? '14%' : '16%'
        }
        ].flat(), // Use flat() to properly merge conditional columns
        initComplete: function() {
      console.log('Server-side DataTable initialization complete');
      self.attachEventHandlers();
    },
    drawCallback: function() {
      self.attachEventHandlers();
    }
  });
}
   // Updated event handlers
   attachEventHandlers() {
     const self = this;
     
     // Remove existing event handlers to prevent duplicates
     $('#tickets-table').off('click', '.edit-btn, .view-files-btn, .view-details-btn, .view-comments-btn, td:first-child + td');
     
     // Title click for details
     // $('#tickets-table').on('click', 'td:first-child + td span', function(this: HTMLElement) {
     //   const rowData = self.dataTable.row($(this).closest('tr')).data();
     //   self.viewTicketDetails(rowData);
     // });
 
     // View details button
     $('#tickets-table').on('click', '.view-details-btn', function(this: HTMLElement) {
       const rowData = JSON.parse($(this).attr('data-row') || '{}');
       self.viewTicketDetails(rowData);
     });
 
     // Edit button
     $('#tickets-table').on('click', '.edit-btn', function(this: HTMLElement) {
       const rowData = JSON.parse($(this).attr('data-row') || '{}');
       console.log('Edit button clicked for:', rowData);
       self.openTicketModal('edit', rowData);
     });
 
     // View files button
     $('#tickets-table').on('click', '.view-files-btn', function(this: HTMLElement) {
       const rowData = JSON.parse($(this).attr('data-row') || '{}');
       console.log('View files button clicked for:', rowData);
       self.viewTicketFiles(rowData);
     });
 
     // View comments button
     $('#tickets-table').on('click', '.view-comments-btn', function(this: HTMLElement) {
       const rowData = JSON.parse($(this).attr('data-row') || '{}');
       console.log('View comments button clicked for:', rowData);
       self.viewTicketComments(rowData);
     });
   }
 
 
 
 // Update the previewFile method to work with the new modal
 previewFile(file: any, index: number): void {
   this.selectedFileName = file.fileName || file.name;
   this.filePreviewUrl = this.getFileDownloadUrl(file);
   this.filePreviewType = this.getFileType(this.selectedFileName);
   this.currentTicketFiles = [file]; // Show only single file
   this.closeAllModel()
   const modalElement = document.getElementById('filePreviewModal');
   if (modalElement) {
     const modal = new bootstrap.Modal(modalElement);
     modal.show();
   }
   this.openFileInNewTab(file);
 }
 
 
   getFileIcon(fileName: string): string {
     const ext = fileName.split('.').pop()?.toLowerCase();
     
     switch (ext) {
       case 'pdf':
         return 'fas fa-file-pdf text-danger';
       case 'doc':
       case 'docx':
         return 'fas fa-file-word text-primary';
       case 'xls':
       case 'xlsx':
         return 'fas fa-file-excel text-success';
       case 'ppt':
       case 'pptx':
         return 'fas fa-file-powerpoint text-warning';
       case 'jpg':
       case 'jpeg':
       case 'png':
       case 'gif':
       case 'bmp':
       case 'webp':
         return 'fas fa-file-image text-info';
       case 'txt':
         return 'fas fa-file-alt text-secondary';
       case 'zip':
       case 'rar':
       case '7z':
         return 'fas fa-file-archive text-dark';
       default:
         return 'fas fa-file text-muted';
     }
   }
 
   formatFileSize(bytes: number): string {
     if (bytes === 0) return '0 Bytes';
     
     const k = 1024;
     const sizes = ['Bytes', 'KB', 'MB', 'GB'];
     const i = Math.floor(Math.log(bytes) / Math.log(k));
     
     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
   }
 
   getSafeUrl(url: string): SafeResourceUrl {
     return this.sanitizer.bypassSecurityTrustResourceUrl(url);
   }
 
   // Create or update ticket
   onSubmit(): void {
     this.isSubmitted = true;
     console.log('Form Values:', this.ticketForm.value,this.selectedFiles);
     if (this.ticketForm.invalid) {
       this.markFormGroupTouched(this.ticketForm);
       return;
     }
 
     this.loading = true;
     const ticketData: any = this.ticketForm.value;
     let comments:any=[{message:ticketData?.message,authorId:this.loginsessionDetails.userId}]
     delete ticketData.message;
     if (this.isEditMode && this.selectedTicket?.ticketId) {
       // Update existing ticket
       if (this.selectedFiles.length > 0) {
         let formData = { ...ticketData, attachments: this.selectedFiles,comments:comments, }
         this.commonService.updatedata(APIS.tickets.update + this.selectedTicket.ticketId, formData).subscribe({
           next: (response) => {
             this.toastrService.success('Ticket updated successfully!');
             this.handleSuccess();
           },
           error: (error) => {
             console.error('Error updating ticket:', error);
             this.toastrService.error('Error updating ticket');
             this.loading = false;
           }
         });
       } else {
         this.commonService.updatedata(APIS.tickets.update + this.selectedTicket.ticketId, {...ticketData,comments:comments,attachments:this.selectedFiles}).subscribe({
           next: (response) => {
             this.toastrService.success('Ticket updated successfully!');
             this.handleSuccess();
           },
           error: (error) => {
             console.error('Error updating ticket:', error);
             this.toastrService.error('Error updating ticket');
             this.loading = false;
           }
         });
       }
     } else {
       // Create new ticket
       if (this.selectedFiles.length > 0) {
         const formData = new FormData();
         formData.append('ticket', JSON.stringify({...ticketData, comments:comments, assigneeId: (this.loginsessionDetails?.userRole == 'ADMIN' || this.loginsessionDetails?.userRole == 'SPIU') ?ticketData?.assigneeId:'admin@gmail.com',reporterId:this.loginsessionDetails.userId}));
         this.selectedFiles.forEach((file: any) => {
           formData.append('files', file);
         });
         
         this.commonService.add(APIS.tickets.save, formData).subscribe({
           next: (response: any) => {
             this.toastrService.success('Ticket created successfully!');
             this.handleSuccess();
           },
           error: (error: any) => {
             console.error('Error creating ticket:', error);
             this.toastrService.error('Error creating ticket');
             this.loading = false;
           }
         });
       } else {
         const formData = new FormData();
         formData.append('ticket', JSON.stringify({...ticketData, comments:comments, assigneeId: (this.loginsessionDetails?.userRole == 'ADMIN' || this.loginsessionDetails?.userRole == 'SPIU') ?ticketData?.assigneeId:'admin@gmail.com',reporterId:this.loginsessionDetails.userId}));
         this.commonService.add(APIS.tickets.save, formData).subscribe({
           next: (response: any) => {
             this.toastrService.success('Ticket created successfully!');
             this.handleSuccess();
           },
           error: (error: any) => {
             console.error('Error creating ticket:', error);
             this.toastrService.error('Error creating ticket');
             this.loading = false;
           }
         });
       }
     }
   }
 
   // Handle success response
   handleSuccess(): void {
     this.adminAssigneeId=''
     this.adminComment=''
     this.adminStatus=''
     this.resetForm();
     this.closeAllModel()
     this.loading = false;
     
     // Refresh the table
     setTimeout(() => { 
       this.loadTickets();
     }, 500);
     
     // Close modal
     const modal = document.getElementById('addTicketModal');
     if (modal) {
       const modalInstance = bootstrap.Modal.getInstance(modal);
       modalInstance?.hide();
     }
   }
 
  
 
   // Modal for ticket details
   showTicketDetailModal = false;
   selectedTicketForDetails: any = null;
 
  
 
   // New method for viewing ticket details
   viewTicketDetails(ticket: Ticket): void {
     this.adminAssigneeData=[]
     this.selectedTicketForDetails = ticket;
     this.showTicketDetailModal = true;
     
      this.closeAllModel()
      if( this.loginsessionDetails?.userRole != 'ADMIN' && this.loginsessionDetails?.userRole != 'SPIU' && this.loginsessionDetails?.userRole!='DEVELOPER'){
        this.adminUpdateForm.patchValue({
         adminAssigneeId: this.selectedTicketForDetails?.assigneeId,
         adminStatus: this.selectedTicketForDetails?.status,
         adminComment: '',
       });
       this.activeScreenTab=''
       const modalElement = document.getElementById('ticketDetailModalAdminClosed');
     if (modalElement) {
       const modal = new bootstrap.Modal(modalElement);
       modal.show();
     }
      }
      else{
       console.log(this.loginsessionDetails?.userId)
        this.adminAssigneeId=this.selectedTicketForDetails?.assigneeId
       this.adminStatus=this.selectedTicketForDetails?.status
       this.adminUpdateForm.patchValue({
         adminAssigneeId: this.selectedTicketForDetails?.assigneeId,
         adminStatus: this.selectedTicketForDetails?.status,
         adminComment: '',
       });
       this.loginsessionDetails?.userRole!='DEVELOPER' && this.loginsessionDetails?.userRole != 'SPIU' && this.loginsessionDetails?.userRole!='ADMIN'? this.adminAssigneeData=['admin@gmail.com']: this.loginsessionDetails?.userRole=='DEVELOPER'?this.adminAssigneeData=['admin@gmail.com'] :this.adminAssigneeData=['dev@gmail.com',ticket.reporterId]
      this.activeScreenTab=''
       const modalElement = document.getElementById('ticketDetailModalAdminClosed');
     if (modalElement) {
       const modal = new bootstrap.Modal(modalElement);
       modal.show();
     }
      }
     
   }
 
   // View comments method
   viewTicketComments(ticket: Ticket): void {
     this.selectedTicketForDetails = ticket;
      this.closeAllModel()
     const modalElement = document.getElementById('commentsModal');
     if (modalElement) {
       const modal = new bootstrap.Modal(modalElement);
       modal.show();
     }
   }
 
   // Updated file viewing method
   viewTicketFiles(ticket: any): void {
     this.currentTicketFiles = ticket.attachments || [];
     this.selectedTicketForDetails = ticket;
      this.closeAllModel()
     const modalElement = document.getElementById('filePreviewModal');
     if (modalElement) {
       const modal = new bootstrap.Modal(modalElement);
       modal.show();
     }
   }
 
   // Helper methods
   getStatusBadgeClass(status: string): string {
     const statusClasses: { [key: string]: string } = {
       'CREATED': 'bg-primary',
       'UNDER_REVIEW': 'bg-warning text-dark',
       'IN_PROGRESS': 'bg-info',
       'RESOLVED': 'bg-success',
       'CLOSED': 'bg-secondary',
       'ADDITIONAL_INFO_NEEDED': 'bg-danger'
     };
     return statusClasses[status] || 'bg-secondary';
   }
 
   getPriorityBadgeClass(priority: string): string {
     const priorityClasses: { [key: string]: string } = {
       'LOW': 'bg-info',
       'MEDIUM': 'bg-warning text-dark',
       'HIGH': 'bg-orange',
       'CRITICAL': 'bg-danger'
     };
     return priorityClasses[priority] || 'bg-secondary';
   }
 
   getTypeBadgeClass(type: string): string {
     const typeClasses: { [key: string]: string } = {
       'BUG': 'bg-danger',
       'ISSUE': 'bg-danger',
       'FEATURE': 'bg-success',
       'NEW ENHANCEMENT': 'bg-info',
       'SUPPORT': 'bg-primary'
     };
     return typeClasses[type] || 'bg-secondary';
   }
  readonly BASE_URL = 'https://ramp-tg.metaversedu.in/';
   // File download URL method
   getFileDownloadUrl(file: any): string {
     
 
     if (file.filePath) {
       // Convert Windows path to URL format
       let urlPath = file.filePath.replace(/\\/g, '/');
       // Remove the local path prefix and add API base URL
       if (urlPath.includes('public_html')) {
         urlPath = urlPath.substring(urlPath.indexOf('public_html') + 11);
       }
       console.log('Generated file download URL:', `${this.BASE_URL}${urlPath}`);
       return `${this.BASE_URL}${urlPath}`;
     }
     return '';
   }
 // getFileDownloadUrl(path: any): string {
 //   const trimmed = path.filePath?.split('public_html/')?.[1];
 //   return trimmed ? `${API_BASE_URL}${trimmed}` : '';
 // }
   // File type detection
   getFileType(fileName: string): 'image' | 'pdf' | 'document' {
     const extension = fileName.toLowerCase().split('.').pop();
     if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension || '')) {
       return 'image';
     } else if (extension === 'pdf') {
       return 'pdf';
     }
     return 'document';
   }
   // Open ticket modal
   openTicketModal(mode: string, ticket?: any): void {
     this.isEditMode = mode === 'edit';
     this.isSubmitted = false;
     
     if (mode === 'edit' && ticket) {
       this.selectedTicket = ticket;
       this.selectedFiles = ticket.attachments || [];
       this.ticketForm.patchValue({
         title: ticket.title,
         description: ticket.description,
         priority: ticket.priority,
         status: ticket.status,
         type: ticket.type,
         assigneeId: ticket.assigneeId,
         assigneeName: ticket.assigneeName
       });
     } else {
       this.selectedFiles = [];
       this.resetForm();
      
     }
 
     setTimeout(() => {
       const fileInput = document.getElementById('files') as HTMLInputElement;
       if (fileInput) {
         fileInput.value = '';
       }
     }, 100);
  this.closeAllModel()
     const modalElement = document.getElementById('addTicketModal');
     if (modalElement) {
       const modal = new bootstrap.Modal(modalElement);
       modal.show();
     }
   }
 
   // Delete ticket (show confirmation modal)
   deleteTicket(ticketId: string): void {
     this.deleteTicketId = ticketId;
      this.closeAllModel()
     const deleteModal = document.getElementById('deleteConfirmModal');
     if (deleteModal) {
       const modal = new bootstrap.Modal(deleteModal);
       modal.show();
     }
   }
 
   // Confirm delete ticket
   confirmDeleteTicket(ticketId: string): void {
     this.loading = true;
     this.commonService.deleteId(APIS.tickets.delete, ticketId).subscribe({
       next: (response) => {
         this.toastrService.success('Ticket deleted successfully!');
         this.loadTickets();
         this.loading = false;
         
         const deleteModal = document.getElementById('deleteConfirmModal');
         if (deleteModal) {
           const modal = bootstrap.Modal.getInstance(deleteModal);
           modal?.hide();
         }
       },
       error: (error) => {
         console.error('Error deleting ticket:', error);
         this.toastrService.error('Error deleting ticket');
         this.loading = false;
       }
     });
   }
 
   // Handle file selection
   onFileSelect(event: any): void {
     const files = event.target.files;
     this.selectedFiles = Array.from(files);
     console.log('Selected files:', this.selectedFiles);
   }
 
   // Remove selected file
   removeFile(index: number): void {
     this.selectedFiles.splice(index, 1);
   }
 
   // Reset form
   resetForm(): void {
     this.ticketForm.reset({
       priority: 'LOW',
       status: 'CREATED',
       type: 'SUPPORT',
       assigneeId: [this.loginsessionDetails?.userRole == 'ADMIN' || this.loginsessionDetails?.userRole == 'SPIU'?'dev@gmail.com':'admin@gmail.com',],
     });
     this.selectedTicket = null;
     const fileInput = document.getElementById('files') as HTMLInputElement;
     if (fileInput) {
       fileInput.value = '';
     }
     this.isEditMode = false;
     this.selectedFiles = [];
   }
 
   // Show message
   showMessage(text: string, type: 'success' | 'error'): void {
     this.message = text;
     this.messageType = type;
     setTimeout(() => {
       this.message = '';
     }, 5000);
   }
 
   // Mark form group as touched for validation
   private markFormGroupTouched(formGroup: FormGroup): void {
     Object.keys(formGroup.controls).forEach(key => {
       const control = formGroup.get(key);
       control?.markAsTouched();
     });
   }
 
   // Reset ticket form for modal
   resetTicketForm(): void {
     this.resetForm();
   }
 
   // Get form control for validation
   get f() { return this.ticketForm.controls; }
  closeAllModel(): void {
   // Hide Angular-controlled modal flags
   this.showTicketDetailModal = false;
 
   // Clear file preview data
   this.filePreviewUrl = '';
   this.selectedFileName = '';
   this.currentTicketFiles = [];
 
   // List of modal IDs used in this component
   const modalIds = [
     'ticketDetailModal',
     'filePreviewModal', 
     'commentsModal',
     'addTicketModal',
     'deleteConfirmModal',
     'ticketDetailModalAdminClosed'
 
   ];
 
   // Hide each modal if open with proper error handling
   modalIds.forEach(id => {
     try {
       const modalElement = document.getElementById(id);
       if (modalElement) {
         const modalInstance = bootstrap.Modal.getInstance(modalElement);
         if (modalInstance) {
           modalInstance.hide();
         }
         // Remove any remaining backdrop
         const backdrop = document.querySelector('.modal-backdrop');
         if (backdrop) {
           backdrop.remove();
         }
         // Reset body styles
         document.body.classList.remove('modal-open');
         document.body.style.overflow = '';
         document.body.style.paddingRight = '';
       }
     } catch (error) {
       console.error(`Error closing modal ${id}:`, error);
     }
   });
 }
 
 
 // Helper method to get file type name for display
 getFileTypeName(fileName: string): string {
   const extension = fileName.toLowerCase().split('.').pop();
   const typeMap: { [key: string]: string } = {
     'doc': 'Word Document',
     'docx': 'Word Document',
     'xls': 'Excel Spreadsheet',
     'xlsx': 'Excel Spreadsheet',
     'ppt': 'PowerPoint Presentation',
     'pptx': 'PowerPoint Presentation',
     'txt': 'Text Document',
     'zip': 'Archive',
     'rar': 'Archive',
     '7z': 'Archive',
     'csv': 'CSV File',
     'json': 'JSON File',
     'xml': 'XML File'
   };
   return typeMap[extension || ''] || 'Document';
 }
 
 // Handle image loading errors
 onImageError(event: any, file: any): void {
   console.error('Failed to load image:', file.fileName);
   event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04NS42IDY1LjRMMTA3LjQgOTBMMTI4LjYgNjVIMTQyVjEwNUg1OFY2NUg4NS42WiIgZmlsbD0iIzlDQTNBRiIvPgo8Y2lyY2xlIGN4PSI3OCIgY3k9IjQ4IiByPSI4IiBmaWxsPSIjOUNBM0FGIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTI1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjg3Mjg4IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pgo8L3N2Zz4K';
   event.target.style.height = '200px';
   event.target.style.objectFit = 'contain';
 }
 
 // Handle successful image loading
 onImageLoad(event: any, file: any): void {
   console.log('Image loaded successfully:', file.fileName);
 }
 
 // Open file in new tab
 openFileInNewTab(file: any): void {
   const url = this.getFileDownloadUrl(file);
   if (url) {
     window.open(url, '_blank');
   } else {
     this.toastrService.error('Unable to open file');
   }
 }
 // admin related comments
 adminAssigneeId:any=''
 adminComment:any=''
 adminStatus:any=''
 onAdminCommentSubmit(){
    if (this.adminUpdateForm.invalid) {
       this.markFormGroupTouched1(this.adminUpdateForm);
       this.toastrService.error('Please fill in all required fields correctly.');
       return;
     }
      const formValue = this.adminUpdateForm.value;
   console.log('Admin Comment:', formValue.adminComment,this.selectedTicketForDetails);
   let ticketData: any = {};
   let comments:any=[{message:formValue.adminComment,authorId:this.loginsessionDetails.userId}]
   ticketData = {
     assigneeId: this.adminAssigneeId,
     status: formValue.adminStatus?formValue.adminStatus:this.selectedTicketForDetails.status,
     
   };
     this.loading = true;
    if (this.selectedFiles.length > 0) {
         let formData = { ...ticketData, attachments: this.selectedFiles,comments:comments, }
         this.commonService.updatedata(APIS.tickets.update + this.selectedTicketForDetails?.ticketId, formData).subscribe({
           next: (response) => {
             this.toastrService.success('Ticket updated successfully!');
              this.handleSuccess();
           this.resetAdminUpdateForm();
           },
           error: (error) => {
             console.error('Error updating ticket:', error);
             this.toastrService.error('Error updating ticket');
             this.loading = false;
                this.handleSuccess();
           this.resetAdminUpdateForm();
           }
         });
       } else {
         this.commonService.updatedata(APIS.tickets.update + this.selectedTicketForDetails?.ticketId, {...ticketData,comments:comments,attachments:this.selectedFiles}).subscribe({
           next: (response) => {
             this.toastrService.success('Ticket updated successfully!');
              this.handleSuccess();
           this.resetAdminUpdateForm();
           },
           error: (error) => {
             console.error('Error updating ticket:', error);
             this.toastrService.error('Error updating ticket');
             this.loading = false;
                this.handleSuccess();
           this.resetAdminUpdateForm();
           }
         });
       }
 }
 // Update the previewFile method to be simpler since we're showing previews inlin
 
 
 // Initialize the admin update reactive form
   initializeAdminUpdateForm(): void {
     this.adminUpdateForm = this.formBuilder.group({
       adminAssigneeId: ['', [Validators.required]],
       adminComment: ['', ],
       adminStatus: ['', [Validators.required]]
     });
   }
 
   // Getter for easy access to form controls
   get adminUpdateFormControls() {
     return this.adminUpdateForm.controls;
   }
 
   // Reset admin update form
   resetAdminUpdateForm(): void {
     this.adminUpdateForm.reset();
   }
 
   // Populate admin form with selected ticket data
   populateAdminUpdateForm(ticket: any): void {
     this.adminUpdateForm.patchValue({
       adminAssigneeId: ticket?.assigneeId || '',
       adminComment: '',
       adminStatus: ticket?.status || ''
     });
   }
 
   // Updated method to handle admin form submission
   onAdminUpdateTicket(): void {
     if (this.adminUpdateForm.invalid) {
       this.markFormGroupTouched1(this.adminUpdateForm);
       this.toastrService.error('Please fill in all required fields correctly.');
       return;
     }
 
     const formValue = this.adminUpdateForm.value;
     console.log('Admin Update Form Value:', formValue, this.selectedTicketForDetails);
     
     let ticketData: any = {};
     let comments: any = [{
       message: formValue.adminComment,
       authorId: this.loginsessionDetails.userId
     }];
     
     ticketData = {
       assigneeId: formValue.adminAssigneeId,
       status: formValue.adminStatus || this.selectedTicketForDetails?.status,
     };
 
     this.loading = true;
     
     if (this.selectedFiles.length > 0) {
       let formData = { 
         ...ticketData, 
         attachments: this.selectedFiles, 
         comments: comments 
       };
       
       this.commonService.updatedata(
         APIS.tickets.update + this.selectedTicketForDetails?.ticketId, 
         formData
       ).subscribe({
         next: (response) => {
           this.toastrService.success('Ticket updated successfully!');
           this.handleSuccess();
           this.resetAdminUpdateForm();
         },
         error: (error) => {
           console.error('Error updating ticket:', error);
           this.toastrService.error('Error updating ticket');
           this.loading = false;
           this.handleSuccess();
         }
       });
     } else {
       this.commonService.updatedata(
         APIS.tickets.update + this.selectedTicketForDetails?.ticketId, 
         { ...ticketData, comments: comments, attachments: this.selectedFiles }
       ).subscribe({
         next: (response) => {
           this.toastrService.success('Ticket updated successfully!');
           this.handleSuccess();
           this.resetAdminUpdateForm();
         },
         error: (error) => {
           console.error('Error updating ticket:', error);
           this.toastrService.error('Error updating ticket');
           this.loading = false;
           this.handleSuccess();
         }
       });
     }
   }
 
   // Helper method to mark all fields as touched for validation display
   private markFormGroupTouched1(formGroup: FormGroup): void {
     Object.keys(formGroup.controls).forEach(key => {
       const control = formGroup.get(key);
       control?.markAsTouched();
       
       if (control instanceof FormGroup) {
         this.markFormGroupTouched1(control);
       }
     });
   }
 
   // Update the method that opens ticket details to populate the form
   openTicketDetailsAdmin(ticket: any): void {
     this.selectedTicketForDetails = ticket;
     this.currentTicketFiles = ticket.attachments || [];
     this.populateAdminUpdateForm(ticket); // Populate the reactive form
     
     // Update admin assignee data if needed
     this.adminAssigneeData = this.getAssineeData;
     this.activeScreenTab=''
     // Show the modal
     const modal = new bootstrap.Modal(document.getElementById('ticketDetailModalAdminClosed'));
     modal.show();
   }
 
   // Keep the existing onAdminCommentSubmit method as alias for backward compatibility
   // onAdminCommentSubmit(): void {
   //   this.onAdminUpdateTicket();
   // }
   activeScreenTab:any=''
   activeScreen(event:any){
     this.activeScreenTab=event
 
   }
 }
 
 
 
 
 