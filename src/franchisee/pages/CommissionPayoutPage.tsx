import { useMemo, useState, type FormEvent } from 'react'
import { Banknote, Calculator, Download, HandCoins, MessageSquareText, Plus, ReceiptIndianRupee, Search, ShieldCheck, WalletCards, X } from 'lucide-react'
import { DataTable, FilterSelect, Metric, Modal, PageHeader, Panel, StatusBadge, money } from '../components/FranchiseeUI'
import { franchiseeWorkspaceService } from '../services/franchiseeWorkspaceService'
import type { FranchiseeCommissionSlab, FranchiseeProduct, FranchiseeTicket } from '../types'
import { franchiseeBusinessReportRecords, type FranchiseeBusinessReportRecord } from '../businessReportsData'
import './commissionPayout.css'

type Tab='Commission Report'|'Payout Processing'|'Commission Slabs'|'Payout Queries'|'Reconciliation'
const tabs:Tab[]=['Commission Report','Payout Processing','Commission Slabs','Payout Queries','Reconciliation']

export function CommissionPayoutPage({products,tickets,onQuery,onToast}:{products:FranchiseeProduct[];tickets:FranchiseeTicket[];onQuery:()=>void;onToast:(message:string)=>void}){
  const [tab,setTab]=useState<Tab>('Commission Report')
  const [search,setSearch]=useState('')
  const [product,setProduct]=useState('All Products')
  const [type,setType]=useState('All')
  const [status,setStatus]=useState('All Statuses')
  const [page,setPage]=useState(1)
  const [selected,setSelected]=useState<FranchiseeBusinessReportRecord>()
  const [slabOpen,setSlabOpen]=useState(false)
  const [slabs,setSlabs]=useState(()=>franchiseeWorkspaceService.loadCommissionSlabs(products))
  const rows=useMemo(()=>franchiseeBusinessReportRecords.filter(item=>(product==='All Products'||item.product===product)&&(type==='All'||item.businessType===type)&&(status==='All Statuses'||item.revenueStatus===status)&&`${item.id} ${item.businessReference} ${item.customerName} ${item.product}`.toLowerCase().includes(search.toLowerCase())),[search,product,type,status])
  const total=franchiseeBusinessReportRecords.reduce((sum,item)=>sum+item.revenue,0)
  const paid=franchiseeBusinessReportRecords.filter(item=>item.revenueStatus==='Paid').reduce((sum,item)=>sum+item.revenue,0)
  const approved=franchiseeBusinessReportRecords.filter(item=>item.revenueStatus==='Approved').reduce((sum,item)=>sum+item.revenue,0)
  const pending=franchiseeBusinessReportRecords.filter(item=>item.revenueStatus==='Pending').reduce((sum,item)=>sum+item.revenue,0)
  const queryCount=tickets.filter(item=>item.category==='Payout Query'&&!['Resolved','Closed'].includes(item.status)).length
  const saveSlabs=(next:FranchiseeCommissionSlab[],message:string)=>{franchiseeWorkspaceService.saveCommissionSlabs(next);setSlabs(next);onToast(message)}
  const exportRows=()=>{const url=URL.createObjectURL(new Blob([['Commission ID,Business Reference,Date,Customer,Product,Type,Business Value,Commission,Status',...rows.map(item=>`${item.id},${item.businessReference},${item.date},${item.customerName},${item.product},${item.businessType},${item.businessValue},${item.revenue},${item.revenueStatus}`)].join('\n')],{type:'text/csv'})),anchor=document.createElement('a');anchor.href=url;anchor.download='franchise-commission-report.csv';anchor.click();URL.revokeObjectURL(url);onToast('Commission report downloaded')}
  return <div className="franchisee-commission-payout">
    <PageHeader eyebrow="FRANCHISE FINANCE" title="Commission & Payout" description="Manage commission slabs, franchise earnings, payout history and finance queries." actions={<><button className="tf-secondary" onClick={()=>setSlabOpen(true)}><HandCoins/> Configure Commission Slab</button><button className="tf-primary" onClick={exportRows}><Download/> Export Report</button></>}/>
    <div className="fcp-kpis">
      <Metric label="Gross Commission Earned" value={money(total)} meta="Calculated across transactions" icon={<Banknote/>}/>
      <Metric label="Payable Commission" value={money(approved+paid)} meta="Approved franchise earnings" icon={<HandCoins/>} tone="teal"/>
      <Metric label="Paid Commission" value={money(paid)} meta="Successfully disbursed" icon={<ShieldCheck/>} tone="violet"/>
      <Metric label="Pending Payout" value={money(pending)} meta="Review or approval pending" icon={<WalletCards/>} tone="orange"/>
      <Metric label="Payout Queries" value={queryCount} meta="Open finance support cases" icon={<MessageSquareText/>} tone="red"/>
      <Metric label="Upcoming Payouts" value={money(approved)} meta="Approved for next payout" icon={<ReceiptIndianRupee/>} tone="violet"/>
    </div>
    <nav className="fcp-tabs">{tabs.map(item=><button key={item} className={tab===item?'active':''} onClick={()=>setTab(item)}>{item}</button>)}</nav>
    {tab==='Commission Report'&&<>
      <div className="fcp-filters">
        <label className="fcp-search"><span>Search</span><div><Search/><input value={search} onChange={event=>{setSearch(event.target.value);setPage(1)}} placeholder="Transaction, customer or product"/></div></label>
        <FilterSelect label="Product" value={product} onChange={value=>{setProduct(value);setPage(1)}} options={['All Products',...new Set(franchiseeBusinessReportRecords.map(item=>item.product))]}/>
        <FilterSelect label="Transaction Type" value={type} onChange={value=>{setType(value);setPage(1)}} options={['All','New','Renewal']}/>
        <FilterSelect label="Payout Status" value={status} onChange={value=>{setStatus(value);setPage(1)}} options={['All Statuses','Pending','Approved','Paid']}/>
        <button onClick={()=>{setSearch('');setProduct('All Products');setType('All');setStatus('All Statuses');setPage(1)}}>Reset</button>
      </div>
      <Panel title="Gross earning report" subtitle={`${rows.length} transactions · New business and renewal`} action={<button className="fcp-panel-action" onClick={exportRows}><Download/> Download Statement</button>}>
        <CommissionTable rows={rows.slice((page-1)*8,page*8)} inspect={setSelected}/><Pager page={page} count={rows.length} set={setPage}/>
      </Panel>
    </>}
    {tab==='Payout Processing'&&<Panel title="Payout processing" subtitle="Commission approval and credit history for this franchise">
      <DataTable headers={['Commission ID','Payout Date','Business Reference','Customer','Product','Commission','Payout Status','Action']} empty={!franchiseeBusinessReportRecords.length}>{franchiseeBusinessReportRecords.map(item=><tr key={item.id}><td><b>{item.id}</b></td><td>{item.revenueDate?date(item.revenueDate):'—'}</td><td>{item.businessReference}</td><td>{item.customerName}</td><td>{item.product}</td><td><b>{money(item.revenue)}</b></td><td><StatusBadge>{item.revenueStatus}</StatusBadge></td><td><button className="fcp-link" onClick={()=>setSelected(item)}>View detail</button></td></tr>)}</DataTable>
    </Panel>}
    {tab==='Commission Slabs'&&<CommissionSlabs slabs={slabs} add={()=>setSlabOpen(true)} save={saveSlabs}/>} 
    {tab==='Payout Queries'&&<Panel title="Payout queries" subtitle="Finance support cases raised by this franchise">
      <DataTable headers={['Query','Subject','Raised Date','Assigned To','Priority','Status','Action']} empty={!tickets.filter(item=>item.category==='Payout Query').length}>{tickets.filter(item=>item.category==='Payout Query').map(item=><tr key={item.id}><td><b>{item.id}</b></td><td>{item.subject}</td><td>{item.created}</td><td>{item.assignedDesk}</td><td><StatusBadge>{item.priority}</StatusBadge></td><td><StatusBadge>{item.status}</StatusBadge></td><td><button className="fcp-link" onClick={onQuery}>Raise follow-up</button></td></tr>)}</DataTable><div className="fcp-integration-note"><MessageSquareText/> New payout queries are routed to HO Finance and remain trackable in Support & Service Desk.</div>
    </Panel>}
    {tab==='Reconciliation'&&<Reconciliation/>}
    {selected&&<Detail item={selected} close={()=>setSelected(undefined)} onQuery={onQuery}/>} 
    {slabOpen&&<SlabModal products={products} slabs={slabs} close={()=>setSlabOpen(false)} save={slab=>saveSlabs([slab,...slabs],'Commission slab created')}/>} 
  </div>
}

function CommissionTable({rows,inspect}:{rows:FranchiseeBusinessReportRecord[];inspect:(row:FranchiseeBusinessReportRecord)=>void}){return <DataTable headers={['Transaction / Date','Business Reference','Customer','Vertical / Product','Type','Business Amount','Slab','Gross Commission','Payable','Payout Status','Action']} empty={!rows.length}>{rows.map(item=>{const rate=item.businessValue?item.revenue/item.businessValue*100:0;return <tr key={item.id}><td><b>{item.id}</b><small>{date(item.date)}</small></td><td>{item.businessReference}</td><td>{item.customerName}</td><td><b>{item.product}</b><small>Franchise product</small></td><td>{item.businessType}</td><td>{money(item.businessValue)}</td><td>{rate.toFixed(2)}%</td><td><b>{money(item.revenue)}</b></td><td>{money(item.revenue)}</td><td><StatusBadge>{item.revenueStatus}</StatusBadge></td><td><button className="fcp-link" onClick={()=>inspect(item)}><Calculator/> View calculation</button></td></tr>})}</DataTable>}

function CommissionSlabs({slabs,add,save}:{slabs:FranchiseeCommissionSlab[];add:()=>void;save:(next:FranchiseeCommissionSlab[],message:string)=>void}){
  const toggle=(id:string)=>save(slabs.map(item=>item.id===id?{...item,status:item.status==='Active'?'Inactive':'Active',updatedAt:'09 Sep 2026',updatedBy:'Franchise Principal'}:item),'Commission slab status updated')
  const duplicate=(slab:FranchiseeCommissionSlab)=>save([{...slab,id:`FSL-${Date.now().toString().slice(-5)}`,name:`${slab.name} Copy`,status:'Inactive',updatedAt:'09 Sep 2026',updatedBy:'Franchise Principal'},...slabs],'Commission slab duplicated')
  return <Panel title="Commission slabs" subtitle="Effective-dated product and transaction rules" action={<button className="tf-primary fcp-panel-action" onClick={add}><Plus/> Add Commission Slab</button>}>
    <DataTable headers={['Slab Name','Vertical / Product','Transaction Type','Calculation','Commission','Franchise Share','HO Share','Effective Period','Status','Last Updated','Actions']} empty={!slabs.length}>{slabs.map(item=><tr key={item.id}><td><b>{item.name}</b><small>{item.id}</small></td><td><b>{item.vertical}</b><small>{item.product}</small></td><td>{item.transactionType}</td><td>{item.calculationType}</td><td>{item.rate}{item.calculationType==='Percentage'?'%':''}</td><td>{item.franchiseSharePercent}%</td><td>{item.hoSharePercent}%</td><td>{date(item.effectiveFrom)}<small>to {item.effectiveTo?date(item.effectiveTo):'Open ended'}</small></td><td><StatusBadge>{item.status}</StatusBadge></td><td>{item.updatedAt}<small>{item.updatedBy}</small></td><td><div className="fcp-row-actions"><button onClick={()=>toggle(item.id)}>{item.status==='Active'?'Deactivate':'Activate'}</button><button onClick={()=>duplicate(item)}>Duplicate</button></div></td></tr>)}</DataTable>
  </Panel>
}

function Reconciliation(){
  const generated=franchiseeBusinessReportRecords.reduce((sum,item)=>sum+item.revenue,0)
  const approved=franchiseeBusinessReportRecords.filter(item=>item.revenueStatus!=='Pending').reduce((sum,item)=>sum+item.revenue,0)
  const paid=franchiseeBusinessReportRecords.filter(item=>item.revenueStatus==='Paid').reduce((sum,item)=>sum+item.revenue,0)
  const difference=generated-paid
  return <><section className="fcp-mini-kpis">{[['Commission Generated',money(generated)],['Commission Approved',money(approved)],['Payout Processed',money(paid)],['Difference / Unreconciled',money(difference)],['Exceptions',franchiseeBusinessReportRecords.filter(item=>item.revenueStatus!=='Paid').length]].map(([label,value])=><article key={label}><span>{label}</span><b>{value}</b></article>)}</section><Panel title="Reconciliation register" subtitle="Transaction-level payout matching for this franchise"><DataTable headers={['Reference','Customer','Product','Commission','Approved Payout','Paid Amount','Difference','Status','Remarks']} empty={!franchiseeBusinessReportRecords.length}>{franchiseeBusinessReportRecords.map(item=>{const approvedAmount=item.revenueStatus==='Pending'?0:item.revenue,paidAmount=item.revenueStatus==='Paid'?item.revenue:0,differenceAmount=item.revenue-paidAmount;return <tr key={item.id}><td><b>{item.businessReference}</b><small>{item.id}</small></td><td>{item.customerName}</td><td>{item.product}</td><td>{money(item.revenue)}</td><td>{money(approvedAmount)}</td><td>{money(paidAmount)}</td><td>{money(differenceAmount)}</td><td><StatusBadge>{item.revenueStatus==='Paid'?'Matched':item.revenueStatus==='Approved'?'Under Review':'Unmatched'}</StatusBadge></td><td>{item.revenueStatus==='Paid'?'Matched by payment reference':'Finance review pending'}</td></tr>})}</DataTable></Panel></>
}

function SlabModal({products,slabs,close,save}:{products:FranchiseeProduct[];slabs:FranchiseeCommissionSlab[];close:()=>void;save:(slab:FranchiseeCommissionSlab)=>void}){
  const [error,setError]=useState('')
  const submit=(event:FormEvent<HTMLFormElement>)=>{event.preventDefault();const form=new FormData(event.currentTarget),from=String(form.get('from')),to=String(form.get('to')),product=String(form.get('product')),transactionType=String(form.get('transactionType')) as FranchiseeCommissionSlab['transactionType'],franchise=Number(form.get('franchise')),ho=Number(form.get('ho')),agent=Number(form.get('agent'));if(franchise+ho+agent>100){setError('Total profit-sharing percentage cannot exceed 100%.');return}if(to&&to<from){setError('Effective To cannot be before Effective From.');return}if(slabs.some(item=>item.status==='Active'&&item.product===product&&item.transactionType===transactionType&&(!to||item.effectiveFrom<=to)&&(!item.effectiveTo||item.effectiveTo>=from))){setError('An active slab already overlaps this product, transaction type and date period.');return}const selected=products.find(item=>item.name===product);save({id:`FSL-${Date.now().toString().slice(-5)}`,name:String(form.get('name')),vertical:selected?.category||String(form.get('vertical')),product,transactionType,calculationType:String(form.get('calculationType')) as FranchiseeCommissionSlab['calculationType'],rate:Number(form.get('rate')),franchiseSharePercent:franchise,hoSharePercent:ho,agentSharePercent:agent,effectiveFrom:from,effectiveTo:to,status:String(form.get('status')) as FranchiseeCommissionSlab['status'],updatedAt:'09 Sep 2026',updatedBy:'Franchise Principal',remarks:String(form.get('remarks'))});close()}
  return <Modal title="Configure Commission Slab" subtitle="Create an effective-dated commission rule for your franchise" onClose={close}><form className="fcp-slab-form" onSubmit={submit}><div className="fcp-form-grid">
    <label>Slab Name *<input name="name" required/></label>
    <label>Business Vertical *<select name="vertical"><option>Insurance</option><option>Loans</option><option>Loan Protector</option><option>Investment & Wealth</option></select></label>
    <label>Product *<select name="product">{products.map(item=><option key={item.id}>{item.name}</option>)}</select></label>
    <label>Transaction Type *<select name="transactionType"><option>New Business</option><option>Renewal</option></select></label>
    <label>Calculation Type *<select name="calculationType"><option>Percentage</option><option>Fixed Amount</option></select></label>
    <label>Commission Rate / Amount *<input name="rate" type="number" step="0.01" min="0" required/></label>
    <label>Franchise Share % *<input name="franchise" type="number" min="0" max="100" defaultValue="100" required/></label>
    <label>HO Share % *<input name="ho" type="number" min="0" max="100" defaultValue="0" required/></label>
    <label>Agent / RM Share %<input name="agent" type="number" min="0" max="100" defaultValue="0"/></label>
    <label>Status<select name="status"><option>Active</option><option>Inactive</option></select></label>
    <label>Effective From *<input name="from" type="date" required/></label>
    <label>Effective To<input name="to" type="date"/></label>
    <label className="wide">Remarks<textarea name="remarks"/></label>
  </div>{error&&<p className="fcp-error">{error}</p>}<div className="fcp-form-actions"><button type="button" className="tf-secondary" onClick={close}>Cancel</button><button className="tf-primary">Create Slab</button></div></form></Modal>
}

function Pager({page,count,set}:{page:number;count:number;set:(page:number)=>void}){const pages=Math.max(1,Math.ceil(count/8));return <div className="fcp-pager"><span>{count} records · Page {page} of {pages}</span><button disabled={page===1} onClick={()=>set(page-1)}>Previous</button><button disabled={page===pages} onClick={()=>set(page+1)}>Next</button></div>}
function Detail({item,close,onQuery}:{item:FranchiseeBusinessReportRecord;close:()=>void;onQuery:()=>void}){const rate=item.businessValue?item.revenue/item.businessValue*100:0;return <><button className="fcp-scrim" onClick={close}/><aside className="fcp-drawer"><header><div><span>COMMISSION DETAIL</span><h2>{item.id}</h2><p>{item.businessReference} · {item.customerName}</p></div><button onClick={close}><X/></button></header><div className="fcp-drawer-body"><Panel title="Commission calculation" subtitle="Transparent franchise earning calculation"><div className="fcp-facts">{[['Business Amount',money(item.businessValue)],['Applicable Rate',`${rate.toFixed(2)}%`],['Commission Earned',money(item.revenue)],['Business Type',item.businessType],['Product',item.product],['Payout Status',item.revenueStatus]].map(([label,value])=><div key={label}><span>{label}</span><b>{value}</b></div>)}</div><div className="fcp-formula"><Calculator/><div><b>Calculation formula</b><p>{money(item.businessValue)} × {rate.toFixed(2)}% = {money(item.revenue)}</p></div></div></Panel><Panel title="Payout information"><div className="fcp-facts">{[['Revenue Date',item.revenueDate?date(item.revenueDate):'Not paid'],['Registered Beneficiary','Troth Meridian Financial Services'],['Status',item.revenueStatus],['Data Scope','Current franchise only']].map(([label,value])=><div key={label}><span>{label}</span><b>{value}</b></div>)}</div></Panel><button className="tf-secondary fcp-query" onClick={onQuery}><MessageSquareText/> Raise query with HO Finance</button></div></aside></>}
const date=(value:string)=>new Date(`${value}${value.length===10?'T00:00:00':''}`).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})
