import { productCatalogue, type CatalogueProduct, type ProductCategory } from './productCatalogue'
import type { Application, ProductType } from '../types'

export type AdminProductStatus='Active'|'Inactive'|'Draft'|'Under Review'|'Needs Attention'
export type PartnerStatus='Active'|'Inactive'|'Onboarding'|'Under Review'|'Needs Attention'
export type AvailabilityRole='Admin'|'Franchisee'|'RM'|'Operations'|'Customer'
export type FranchiseeAvailability='All'|'Selected'

export interface AdminDocument { id:string; name:string; type:string; version:string; updated:string; status:'Current'|'Review Due'|'Missing' }
export interface AdminActivity { id:string; title:string; detail:string; timestamp:string }
export interface AdminProduct {
  id:string; code:string; sourceProductId?:string; name:string; category:ProductCategory; productType:string; providerId:string; providerName:string
  shortDescription:string; description:string; status:AdminProductStatus; detailsEnabled:boolean; inquiryEnabled:boolean; buyEnabled:boolean
  applicationEnabled:boolean; featured:boolean; displayPriority:number; availableRoles:AvailabilityRole[]; franchiseeAvailability:FranchiseeAvailability
  selectedFranchisees:string[]; applicationCount:number; businessValue:number; sellingFranchisees:number; launchDate:string; updatedAt:string
  attentionReasons:string[]; documents:AdminDocument[]; activity:AdminActivity[]
}
export interface PartnerContact { name:string; designation:string; email:string; mobile:string; function:string }
export interface AdminPartner {
  id:string; name:string; type:string; legalName:string; website:string; status:PartnerStatus; primaryContact:PartnerContact; secondaryContacts:PartnerContact[]
  relationshipOwner:string; productIds:string[]; applicationCount:number; businessValue:number; since:string; agreementStatus:string
  onboardingStatus:string; serviceSla:string; lastReview:string; nextReview:string; categories:string[]; attentionReasons:string[]; documents:AdminDocument[]; activity:AdminActivity[]
}
export interface AdminResource { id:string; name:string; productId?:string; productName:string; partnerId?:string; partnerName:string; type:string; category:string; version:string; updated:string; status:'Current'|'Review Due'|'Missing' }

export function applicationMatchesAdminProduct(product:Pick<AdminProduct,'sourceProductId'|'name'|'productType'>,application:Application):boolean{
  if(['health-insurance','term-insurance','motor-insurance','home-loan','business-loan','personal-loan','loan-against-property'].includes(product.sourceProductId||''))return application.productName===product.name
  if(product.sourceProductId==='loan-protector')return application.product==='Loan Protector'
  if(product.sourceProductId==='equity-mutual-fund')return application.product==='Mutual Fund'
  if(product.sourceProductId==='demat-account')return application.product==='Demat'
  if(product.sourceProductId==='research-subscription')return application.product==='Research'
  if(product.sourceProductId==='financial-advisory')return application.product==='Advisory'
  return false
}

interface PartnerSeed { name:string; type:string; legalName:string; contact:string; designation:string; email:string; mobile:string; owner:string; website:string; status?:PartnerStatus }
const partnerSeeds:PartnerSeed[]=[
  {name:'HDFC ERGO',type:'Insurance Company',legalName:'HDFC ERGO General Insurance Company Limited',contact:'Rahul Shah',designation:'Partnerships Manager',email:'rahul.shah@hdfcergo.example',mobile:'+91 98••• ••412',owner:'Kavya Shah',website:'www.hdfcergo.com'},
  {name:'ICICI Lombard',type:'Insurance Company',legalName:'ICICI Lombard General Insurance Company Limited',contact:'Aditi Rao',designation:'National Alliances Lead',email:'aditi.rao@icicilombard.example',mobile:'+91 97••• ••185',owner:'Rohan Mehta',website:'www.icicilombard.com'},
  {name:'Tata AIG',type:'Insurance Company',legalName:'Tata AIG General Insurance Company Limited',contact:'Nikhil Sen',designation:'Channel Manager',email:'nikhil.sen@tataaig.example',mobile:'+91 96••• ••734',owner:'Rohan Mehta',website:'www.tataaig.com'},
  {name:'HDFC Bank',type:'Bank',legalName:'HDFC Bank Limited',contact:'Parth Iyer',designation:'Alliance Banking Head',email:'parth.iyer@hdfcbank.example',mobile:'+91 95••• ••628',owner:'Manav Desai',website:'www.hdfcbank.com'},
  {name:'Tata Capital',type:'NBFC',legalName:'Tata Capital Limited',contact:'Neha Kapoor',designation:'Partner Business Lead',email:'neha.kapoor@tatacapital.example',mobile:'+91 94••• ••391',owner:'Manav Desai',website:'www.tatacapital.com'},
  {name:'Bajaj Finserv',type:'NBFC',legalName:'Bajaj Finance Limited',contact:'Siddharth Jain',designation:'Strategic Alliances',email:'siddharth.jain@bajajfinserv.example',mobile:'+91 93••• ••264',owner:'Ira Patel',website:'www.bajajfinserv.in',status:'Under Review'},
  {name:'ICICI Prudential',type:'Insurance Company',legalName:'ICICI Prudential Life Insurance Company Limited',contact:'Priya Sethi',designation:'Protection Partnerships',email:'priya.sethi@iciciprulife.example',mobile:'+91 92••• ••547',owner:'Kavya Shah',website:'www.iciciprulife.com'},
  {name:'HDFC Life',type:'Insurance Company',legalName:'HDFC Life Insurance Company Limited',contact:'Varun Nair',designation:'Corporate Alliances',email:'varun.nair@hdfclife.example',mobile:'+91 91••• ••803',owner:'Kavya Shah',website:'www.hdfclife.com'},
  {name:'HDFC AMC',type:'AMC',legalName:'HDFC Asset Management Company Limited',contact:'Shruti Bose',designation:'Distribution Partnerships',email:'shruti.bose@hdfcfund.example',mobile:'+91 90••• ••175',owner:'Ira Patel',website:'www.hdfcfund.com'},
  {name:'Angel One',type:'Broker / Platform',legalName:'Angel One Limited',contact:'Mihir Shah',designation:'Platform Partnerships',email:'mihir.shah@angelone.example',mobile:'+91 89••• ••684',owner:'Ira Patel',website:'www.angelone.in'},
  {name:'Troth Research',type:'Research Provider',legalName:'Troth Research Services',contact:'Anmol Singh',designation:'Research Operations Lead',email:'research@troth.example',mobile:'+91 88••• ••326',owner:'Admin Team',website:'research.troth.example'},
  {name:'Troth Advisory',type:'Other Financial Partner',legalName:'Troth Advisory Services',contact:'Ritu Kapoor',designation:'Advisory Practice Lead',email:'advisory@troth.example',mobile:'+91 87••• ••954',owner:'Admin Team',website:'advisory.troth.example'},
]

const productProvider:Record<string,string>={
  'health-insurance':'HDFC ERGO','term-insurance':'ICICI Prudential','motor-insurance':'Tata AIG','home-loan':'HDFC Bank','business-loan':'Tata Capital','personal-loan':'Bajaj Finserv','loan-against-property':'HDFC Bank','loan-protector':'HDFC Life','equity-mutual-fund':'HDFC AMC','demat-account':'Angel One','pms':'Troth Advisory','aif':'Troth Advisory','corporate-bonds':'Angel One','research-subscription':'Troth Research','financial-advisory':'Troth Advisory'
}
const categoryType=(product:CatalogueProduct):ProductType|undefined=>product.category==='Mutual Funds'?'Mutual Fund':product.id==='demat-account'?'Demat':product.id==='research-subscription'?'Research':product.id==='financial-advisory'?'Advisory':(['Insurance','Loans','Loan Protector'] as string[]).includes(product.category)?product.category as ProductType:undefined
const documentSet=(id:string,name:string):AdminDocument[]=>[
  {id:`DOC-${id}-01`,name:`${name} Product Guide`,type:'Product Guide',version:'v2.1',updated:'28 Aug 2026',status:'Current'},
  {id:`DOC-${id}-02`,name:`${name} Required Documents`,type:'Required Documents',version:'v1.4',updated:'19 Aug 2026',status:'Current'},
  {id:`DOC-${id}-03`,name:`${name} Terms & Conditions`,type:'Terms & Conditions',version:'v3.0',updated:'04 Jul 2026',status:id==='personal-loan'?'Review Due':'Current'},
]

export function buildAdminProducts(applications:Application[]):AdminProduct[]{
  return productCatalogue.map((product,index)=>{
    const type=categoryType(product)
    const related=type?applications.filter(app=>applicationMatchesAdminProduct({sourceProductId:product.id,name:product.name,productType:type},app)):[]
    const providerName=productProvider[product.id]||related[0]?.provider||'Partner assignment pending'
    const provider=partnerSeeds.find(item=>item.name===providerName)
    const status:AdminProductStatus=index===12?'Under Review':product.status
    const attentionReasons=[...(status==='Under Review'?['Product configuration is under review']:[]),...(provider?.status==='Under Review'?['Provider relationship is under review']:[])]
    return {id:`APRD-${String(index+1).padStart(3,'0')}`,code:`PRD-${product.category.replace(/[^A-Z]/gi,'').slice(0,3).toUpperCase()}-${String(index+1).padStart(3,'0')}`,sourceProductId:product.id,name:product.name,category:product.category,productType:type||product.category,providerId:`PRV-${String(Math.max(1,partnerSeeds.findIndex(item=>item.name===providerName)+1)).padStart(3,'0')}`,providerName,shortDescription:product.shortDescription,description:product.importantNote,status,detailsEnabled:product.detailsEnabled,inquiryEnabled:product.inquiryEnabled,buyEnabled:product.buyEnabled,applicationEnabled:true,featured:index<4,displayPriority:index+1,availableRoles:['Admin','Franchisee','RM','Operations','Customer'],franchiseeAvailability:'All',selectedFranchisees:[],applicationCount:related.length,businessValue:related.reduce((sum,app)=>sum+app.amount,0),sellingFranchisees:new Set(related.map(app=>app.franchisee)).size,launchDate:`${String(8+index%18).padStart(2,'0')} ${index%2?'Mar':'Jan'} 2026`,updatedAt:'02 Sep 2026',attentionReasons,documents:documentSet(product.id,product.name),activity:[{id:`PACT-${index}-1`,title:status==='Under Review'?'Product moved under review':'Catalogue configuration reviewed',detail:`Customer details ${product.detailsEnabled?'enabled':'disabled'} · Buy journey ${product.buyEnabled?'enabled':'disabled'}`,timestamp:'02 Sep 2026'},{id:`PACT-${index}-2`,title:'Product resources updated',detail:`${product.requiredDocuments.length} required document types configured`,timestamp:'28 Aug 2026'}]}
  })
}

export function buildAdminPartners(products:AdminProduct[],applications:Application[]):AdminPartner[]{
  return partnerSeeds.map((seed,index)=>{
    const linked=products.filter(product=>product.providerName===seed.name)
    const related=applications.filter(app=>app.provider===seed.name)
    const status=seed.status||'Active'
    return {id:`PRV-${String(index+1).padStart(3,'0')}`,name:seed.name,type:seed.type,legalName:seed.legalName,website:seed.website,status,primaryContact:{name:seed.contact,designation:seed.designation,email:seed.email,mobile:seed.mobile,function:'Partnerships'},secondaryContacts:[{name:`${['Meera','Dev','Riya'][index%3]} ${['Shah','Patel','Desai'][index%3]}`,designation:'Operations Contact',email:`operations@${seed.name.toLowerCase().replace(/[^a-z]/g,'')}.example`,mobile:'+91 86••• ••418',function:'Operations'}],relationshipOwner:seed.owner,productIds:linked.map(product=>product.id),applicationCount:related.length,businessValue:related.reduce((sum,app)=>sum+app.amount,0),since:`${String(10+index%15).padStart(2,'0')} Apr 2024`,agreementStatus:status==='Under Review'?'Review Due':'Active',onboardingStatus:status==='Onboarding'?'In Progress':'Complete',serviceSla:'2 business days',lastReview:'18 Aug 2026',nextReview:'18 Nov 2026',categories:Array.from(new Set(linked.map(product=>product.category))),attentionReasons:status==='Under Review'?['Commercial agreement review is due']:[],documents:[{id:`PDOC-${index}-1`,name:'Distribution Agreement',type:'Agreement',version:'v2.0',updated:'18 Aug 2026',status:status==='Under Review'?'Review Due':'Current'},{id:`PDOC-${index}-2`,name:'Escalation Matrix',type:'Escalation Matrix',version:'v1.3',updated:'12 Jul 2026',status:'Current'}],activity:[{id:`PRACT-${index}-1`,title:'Partner relationship reviewed',detail:`Reviewed by ${seed.owner}`,timestamp:'18 Aug 2026'},{id:`PRACT-${index}-2`,title:'Contact directory confirmed',detail:`Primary contact: ${seed.contact}`,timestamp:'12 Jul 2026'}]}
  })
}
export function buildAdminResources(products:AdminProduct[],partners:AdminPartner[]):AdminResource[]{
  const productResources=products.flatMap(product=>product.documents.map(doc=>({id:doc.id,name:doc.name,productId:product.id,productName:product.name,partnerId:product.providerId,partnerName:product.providerName,type:doc.type,category:doc.type==='Product Guide'?'Product Brochures':doc.type,version:doc.version,updated:doc.updated,status:doc.status})))
  const partnerResources=partners.flatMap(partner=>partner.documents.map(doc=>({id:doc.id,name:`${partner.name} ${doc.name}`,productName:'All linked products',partnerId:partner.id,partnerName:partner.name,type:doc.type,category:'Partner Documents',version:doc.version,updated:doc.updated,status:doc.status})))
  return [...productResources,...partnerResources]
}

export const productCategories:ProductCategory[]=['Insurance','Loans','Loan Protector','Mutual Funds','Investments','Research / Advisory']
export const availabilityRoles:AvailabilityRole[]=['Admin','Franchisee','RM','Operations','Customer']
export const franchiseeChoices=['Troth Finserve','Aarohi Wealth','Navkar Associates','BluePeak Capital','Shreeji Finance','Vertex Advisory']
export const partnerTypes=['Insurance Company','Bank','NBFC','AMC','Broker / Platform','Research Provider','Other Financial Partner']
