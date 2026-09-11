import type { FranchiseeProduct } from './types'

export type AgentRequirementStatus='Not Started'|'Completed'|'Pending HO Verification'|'Verified'|'Query Raised'
export type AgentEligibility='Eligible'|'Not Eligible'
export type AgentOnboardingStatus='Draft'|'Requirements Pending'|'Pending Verification'|'Partially Eligible'|'Eligible / Active'

export interface AgentFileMetadata {fileName:string;fileSize:number;fileType:string;uploadedAt:string}
export interface OnboardingRequirement {id:string;name:string;type:'KYC'|'Registration'|'Certification'|'Training'|'Authorization';mandatory:boolean;verificationRequired:boolean;documentRequired:boolean}
export interface AgentRequirement extends OnboardingRequirement {status:AgentRequirementStatus;document?:AgentFileMetadata;submittedAt?:string;verifiedBy?:string;verifiedAt?:string}
export interface AgentBusinessLine {id:string;name:string;productIds:string[];requirements:OnboardingRequirement[]}
export interface AgentLineAssignment {businessLineId:string;businessLine:string;requirements:AgentRequirement[]}
export interface AgentActivity {id:string;title:string;detail:string;time:string;actor:string}
export interface FranchiseeAgent {id:string;franchiseeId:string;subFranchiseeId?:string;agentCode:string;name:string;mobile:string;email:string;designation:string;assignments:AgentLineAssignment[];activity:AgentActivity[];createdAt:string;updatedAt:string}
export interface AgentDraft {agentCode:string;name:string;mobile:string;email:string;designation:string;businessLineIds:string[]}

const franchiseeId='FR-GJ-0418'
const requirement=(id:string,name:string,type:OnboardingRequirement['type'],verificationRequired:boolean,documentRequired=verificationRequired):OnboardingRequirement=>({id,name,type,mandatory:true,verificationRequired,documentRequired})
const base=(line:string)=>requirement(`${line}-kyc`,'Identity & KYC verification','KYC',true)
const configs:Record<string,OnboardingRequirement[]>={
  insurance:[requirement('insurance-posp-training','POSP training and examination','Training',false,false),requirement('insurance-irdai-posp','IRDAI / POSP registration','Registration',true),requirement('insurance-authorization','Insurance selling authorization','Authorization',true)],
  loans:[requirement('loans-process','Lending process and documentation training','Training',false,false),requirement('loans-authorization','Lender / DSA authorization','Authorization',true)],
  'loan-protector':[requirement('protector-training','Loan Protector product training','Training',false,false),requirement('protector-irdai-posp','IRDAI / POSP registration','Registration',true)],
  mf:[requirement('mf-nism','NISM Series V-A certification','Certification',true),requirement('mf-arn-euin','ARN / EUIN registration','Registration',true),requirement('mf-process','Mutual Fund process training','Training',false,false)],
  pms:[requirement('pms-suitability','PMS suitability and product training','Training',false,false),requirement('pms-authorization','HO Wealth authorization','Authorization',true)],
  aif:[requirement('aif-suitability','AIF suitability and product training','Training',false,false),requirement('aif-authorization','HO Wealth authorization','Authorization',true)],
  research:[requirement('research-certification','Applicable research/advisory certification','Certification',true),requirement('research-authorization','HO Compliance authorization','Authorization',true)]
}

export function buildAgentBusinessLines(products:FranchiseeProduct[]):AgentBusinessLine[]{
  const enabled=products.filter(product=>product.enabled),used=new Set<string>()
  const group=(id:string,name:string,predicate:(product:FranchiseeProduct)=>boolean)=>{const matches=enabled.filter(predicate);matches.forEach(product=>used.add(product.id));return matches.length?{id,name,productIds:matches.map(product=>product.id),requirements:[base(id),...(configs[id]||generic(id,name))]}:undefined}
  const grouped=[group('insurance','Insurance',product=>product.category==='Insurance'),group('loans','Loans',product=>product.category==='Loans'),group('loan-protector','Loan Protector',product=>product.id==='loan-protector'),group('mf','Mutual Funds',product=>product.id==='mf')].filter((line):line is AgentBusinessLine=>Boolean(line))
  const remaining=enabled.filter(product=>!used.has(product.id)).map(product=>({id:product.id,name:product.name,productIds:[product.id],requirements:[base(product.id),...(configs[product.id]||generic(product.id,product.name))]}))
  return [...grouped,...remaining]
}

const generic=(id:string,name:string)=>[requirement(`${id}-training`,`${name} product and process training`,'Training',false,false),requirement(`${id}-authorization`,`${name} HO authorization`,'Authorization',true)]
export const requirementSatisfied=(item:AgentRequirement)=>item.verificationRequired?item.status==='Verified':['Completed','Verified'].includes(item.status)
export const assignmentProgress=(assignment:AgentLineAssignment)=>Math.round(assignment.requirements.filter(requirementSatisfied).length/Math.max(1,assignment.requirements.length)*100)
export const assignmentEligibility=(assignment:AgentLineAssignment):AgentEligibility=>assignment.requirements.filter(item=>item.mandatory).every(requirementSatisfied)?'Eligible':'Not Eligible'
export function onboardingStatus(agent:FranchiseeAgent):AgentOnboardingStatus{const eligible=agent.assignments.filter(item=>assignmentEligibility(item)==='Eligible').length;if(agent.assignments.length&&eligible===agent.assignments.length)return'Eligible / Active';if(eligible)return'Partially Eligible';if(agent.assignments.some(line=>line.requirements.some(item=>item.status==='Pending HO Verification')))return'Pending Verification';if(agent.assignments.some(line=>line.requirements.some(item=>item.status!=='Not Started')))return'Requirements Pending';return'Draft'}
export const pendingRequirementCount=(agent:FranchiseeAgent)=>agent.assignments.reduce((sum,line)=>sum+line.requirements.filter(item=>!requirementSatisfied(item)).length,0)

const event=(title:string,detail:string,actor='Franchise Principal'):AgentActivity=>({id:crypto.randomUUID(),title,detail,time:new Date().toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}),actor})
const assignments=(ids:string[],lines:AgentBusinessLine[])=>ids.reduce<AgentLineAssignment[]>((rows,id)=>{const line=lines.find(item=>item.id===id);if(line)rows.push({businessLineId:line.id,businessLine:line.name,requirements:line.requirements.map(item=>({...item,status:'Not Started'}))});return rows},[])
const complete=(assignment:AgentLineAssignment,statuses:Record<string,AgentRequirementStatus>):AgentLineAssignment=>({...assignment,requirements:assignment.requirements.map(item=>({...item,status:statuses[item.id]||item.status,...(statuses[item.id]==='Verified'?{verifiedBy:'HO Compliance',verifiedAt:'2026-08-29T11:30:00.000Z'}:{})}))})
function seed(products:FranchiseeProduct[]):FranchiseeAgent[]{const lines=buildAgentBusinessLines(products),first=assignments(['insurance'],lines),second=assignments(['loans','mf'],lines);return[
  {id:'AG-1',franchiseeId,agentCode:'AGT-1001',name:'Amit Shah',mobile:'+91 98250 77142',email:'amit.shah@example.in',designation:'Insurance Advisor',assignments:first.map(line=>complete(line,Object.fromEntries(line.requirements.map(item=>[item.id,item.verificationRequired?'Verified':'Completed'])))),activity:[{id:'AA-1',title:'Insurance eligibility activated',detail:'All mandatory Insurance requirements were completed and verified. Eligibility was calculated automatically.',time:'29 Aug 2026, 11:35 AM',actor:'System'},{id:'AA-2',title:'Registration verified',detail:'IRDAI / POSP registration verified.',time:'29 Aug 2026, 11:30 AM',actor:'HO Compliance'}],createdAt:'2026-08-18T10:00:00.000Z',updatedAt:'2026-08-29T11:35:00.000Z'},
  {id:'AG-2',franchiseeId,agentCode:'AGT-1002',name:'Kavya Mehta',mobile:'+91 98980 34118',email:'kavya.mehta@example.in',designation:'Business Associate',assignments:second.map(line=>complete(line,line.businessLineId==='loans'?{'loans-process':'Completed','loans-kyc':'Pending HO Verification','loans-authorization':'Pending HO Verification'}:{'mf-process':'Completed','mf-kyc':'Pending HO Verification','mf-nism':'Pending HO Verification'})),activity:[{id:'AA-3',title:'Requirements submitted',detail:'KYC and certification evidence sent for Head Office verification.',time:'05 Sep 2026, 04:20 PM',actor:'Franchise Principal'},{id:'AA-4',title:'Business lines assigned',detail:'Loans and Mutual Funds assigned.',time:'03 Sep 2026, 10:10 AM',actor:'Franchise Principal'}],createdAt:'2026-09-03T10:00:00.000Z',updatedAt:'2026-09-05T16:20:00.000Z'}
]}

const storageKey='troth-franchisee-agents-v1'
const read=(products:FranchiseeProduct[])=>{try{const value=localStorage.getItem(storageKey);return value?JSON.parse(value) as FranchiseeAgent[]:seed(products)}catch{return seed(products)}}
const write=(rows:FranchiseeAgent[])=>{try{localStorage.setItem(storageKey,JSON.stringify(rows))}catch{/* Keep the in-memory workflow available. */}}
export const franchiseeAgentRepository={
  load:(products:FranchiseeProduct[])=>read(products).filter(agent=>agent.franchiseeId===franchiseeId),
  nextCode:(products:FranchiseeProduct[])=>`AGT-${String(Math.max(1000,...read(products).map(agent=>Number(agent.agentCode.replace(/\D/g,''))||1000))+1)}`,
  create:(draft:AgentDraft,products:FranchiseeProduct[])=>{const agent:FranchiseeAgent={id:crypto.randomUUID(),franchiseeId,agentCode:draft.agentCode,name:draft.name,mobile:draft.mobile,email:draft.email,designation:draft.designation,assignments:assignments(draft.businessLineIds,buildAgentBusinessLines(products)),activity:[event('Agent onboarding started',`${draft.businessLineIds.length} business line(s) assigned. Eligibility remains gated by requirements.`)],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};write([agent,...read(products)]);return agent},
  updateRequirement:(agentId:string,businessLineId:string,requirementId:string,status:AgentRequirementStatus,products:FranchiseeProduct[],document?:AgentFileMetadata)=>{const rows=read(products);let result:FranchiseeAgent|undefined;const updated=rows.map(agent=>{if(agent.id!==agentId)return agent;const requirementName=agent.assignments.flatMap(line=>line.requirements).find(item=>item.id===requirementId)?.name||'Requirement';result={...agent,assignments:agent.assignments.map(line=>line.businessLineId===businessLineId?{...line,requirements:line.requirements.map(item=>item.id===requirementId?{...item,status,document:document||item.document,submittedAt:new Date().toISOString()}:item)}:line),activity:[event(status==='Completed'?'Requirement completed':'Requirement submitted',`${requirementName}: ${status}.`),...agent.activity],updatedAt:new Date().toISOString()};return result});write(updated);return result}
}
