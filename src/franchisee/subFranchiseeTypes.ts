export type SubFranchiseeStatus='Active'|'Pending Approval'|'Inactive'|'Rejected'
export type SubFranchiseeKycStatus='Verified'|'KYC Pending'|'Rejected'
export type LegalEntityType='Proprietorship'|'Partnership'|'LLP'|'Private Limited'|'Individual'
export type SubFranchiseeDocumentType='PAN Card'|'Identity Proof'|'GST Certificate'|'Business Registration'|'Cancelled Cheque'|'Photograph / Logo'|'Signed Agreement'

export interface SubFranchiseeDocument { id:string; type:SubFranchiseeDocumentType; fileName:string; size:number; uploadedAt:string; status:'Uploaded'|'Verified'|'Pending'|'Rejected' }
export interface SubFranchisee {
  id:string; parentFranchiseeId:string; headOfficeId:string; code:string; firmName:string; contactPerson:string; mobile:string; email:string
  businessType:string; legalEntityType:LegalEntityType; pan:string; gstin:string; registrationNumber:string; yearsInBusiness:number
  addressLine:string; area:string; city:string; district:string; state:string; pinCode:string; territory:string; dateAdded:string
  kycStatus:SubFranchiseeKycStatus; status:SubFranchiseeStatus; products:string[]; effectiveDate:string; documents:SubFranchiseeDocument[]
  invitationStatus:'Not Sent'|'Sent'|'Accepted'; lastInvitationAt?:string; businessGenerated:number
}
export type SubFranchiseeDraft=Omit<SubFranchisee,'id'|'parentFranchiseeId'|'headOfficeId'|'code'|'dateAdded'|'kycStatus'|'status'|'invitationStatus'|'businessGenerated'>
