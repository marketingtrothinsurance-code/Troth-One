import { useEffect, useMemo, useState } from 'react'
import { BadgeIndianRupee, BriefcaseBusiness, Clock3, Download, Target, TrendingUp, WalletCards } from 'lucide-react'
import { PageHeader, SearchBox, Select, StatCard, StatusBadge } from '../components/UI'
import { formatINR } from '../data/mockData'
import { franchiseeRepository } from '../services/franchiseeService'
import type { BusinessVertical, RevenueStatus } from '../types/franchisee'

const workspace=franchiseeRepository.getBusinessWorkspace()
const dateRanges=['All Dates','September 2026','August 2026','Jul–Sep 2026'] as const
const trendRanges=['3 Months','6 Months'] as const

export function FranchiseeBusiness(){
  const [search,setSearch]=useState('')
  const [dateRange,setDateRange]=useState<(typeof dateRanges)[number]>('All Dates')
  const [vertical,setVertical]=useState<'All Verticals'|BusinessVertical>('All Verticals')
  const [product,setProduct]=useState('All Products')
  const [status,setStatus]=useState<'All Statuses'|RevenueStatus>('All Statuses')
  const [trendRange,setTrendRange]=useState<(typeof trendRanges)[number]>('6 Months')
  const [page,setPage]=useState(1)
  const products=[...new Set(workspace.records.map(item=>item.product))]
  const rows=useMemo(()=>workspace.records.filter(item=>{
    const dateMatches=dateRange==='All Dates'||(dateRange==='September 2026'&&item.date.startsWith('2026-09'))||(dateRange==='August 2026'&&item.date.startsWith('2026-08'))||(dateRange==='Jul–Sep 2026'&&item.date>='2026-07-01'&&item.date<='2026-09-30')
    const query=`${item.customer} ${item.reference} ${item.product} ${item.id}`.toLowerCase()
    return dateMatches&&(vertical==='All Verticals'||item.vertical===vertical)&&(product==='All Products'||item.product===product)&&(status==='All Statuses'||item.status===status)&&query.includes(search.toLowerCase())
  }),[dateRange,product,search,status,vertical])
  useEffect(()=>setPage(1),[dateRange,product,search,status,vertical])
  const pageSize=6
  const totalPages=Math.max(1,Math.ceil(rows.length/pageSize))
  const visibleRows=rows.slice((page-1)*pageSize,page*pageSize)
  const performance=workspace.productPerformance.filter(item=>(vertical==='All Verticals'||item.vertical===vertical)&&(product==='All Products'||item.product===product))
  const trend=trendRange==='3 Months'?workspace.trend.slice(-3):workspace.trend
  const trendMax=Math.max(...trend.map(item=>item.business))
  const revenueMax=Math.max(...trend.map(item=>item.revenue))
  const pending=rows.filter(item=>item.status!=='Paid')
  const clearFilters=()=>{setSearch('');setDateRange('All Dates');setVertical('All Verticals');setProduct('All Products');setStatus('All Statuses')}

  return <div className="page franchisee-business-page">
    <PageHeader eyebrow="BUSINESS PERFORMANCE" title="Business & Revenue" description="Track business performance, revenue, earnings and product-wise growth." actions={<button className="secondary-btn" disabled title="Export API integration required"><Download/> Download Report</button>}/>

    <div className="business-filter-bar">
      <SearchBox value={search} onChange={setSearch} placeholder="Search customer, product or reference"/>
      <Select value={dateRange} onChange={value=>setDateRange(value as typeof dateRange)} label="Date Range">{dateRanges.map(item=><option key={item}>{item}</option>)}</Select>
      <Select value={vertical} onChange={value=>setVertical(value as typeof vertical)} label="Vertical"><option>All Verticals</option>{['Insurance','Loans','Investments','Protection'].map(item=><option key={item}>{item}</option>)}</Select>
      <Select value={product} onChange={setProduct} label="Product"><option>All Products</option>{products.map(item=><option key={item}>{item}</option>)}</Select>
      <Select value={status} onChange={value=>setStatus(value as typeof status)} label="Revenue Status"><option>All Statuses</option>{['Pending','Under Process','Approved','Paid'].map(item=><option key={item}>{item}</option>)}</Select>
      <button onClick={clearFilters}>Reset</button>
    </div>

    <section className="stats-grid franchisee-business-kpis">
      <StatCard label="Total Business" value={formatINR(workspace.summary.totalBusiness,true)} meta="Recorded business" icon={<BriefcaseBusiness/>}/>
      <StatCard label="Total Revenue" value={formatINR(workspace.summary.totalRevenue,true)} meta="Earnings to date" icon={<BadgeIndianRupee/>} tone="green"/>
      <StatCard label="Pending Revenue" value={formatINR(workspace.summary.pendingRevenue,true)} meta="Awaiting settlement" icon={<Clock3/>} tone="amber"/>
      <StatCard label="Target Achievement" value={`${workspace.summary.targetAchievement}%`} meta="Monthly revenue target" icon={<Target/>} tone="blue"/>
      <StatCard label="Business This Month" value={formatINR(workspace.summary.businessThisMonth,true)} meta="September 2026" icon={<WalletCards/>} tone="violet"/>
      <StatCard label="Revenue This Month" value={formatINR(workspace.summary.revenueThisMonth,true)} meta="September 2026" icon={<TrendingUp/>} tone="green"/>
    </section>

    <section className="business-analytics-grid">
      <div className="panel business-trend-panel"><div className="panel-head"><div><b>Business Performance Trend</b><small>Business generated and revenue earned</small></div><div className="business-period-tabs">{trendRanges.map(item=><button className={trendRange===item?'active':''} onClick={()=>setTrendRange(item)} key={item}>{item}</button>)}</div></div><div className="business-trend-chart">{trend.map(item=><div key={item.period}><div><i className="business-bar" style={{height:`${item.business/trendMax*100}%`}} title={`Business ${formatINR(item.business)}`}/><i className="revenue-bar" style={{height:`${item.revenue/revenueMax*72}%`}} title={`Revenue ${formatINR(item.revenue)}`}/></div><span>{item.period}</span></div>)}</div><div className="business-chart-legend"><span><i/> Business generated</span><span><i/> Revenue earned</span></div></div>
      <div className="panel business-mix-panel"><div className="panel-head"><div><b>Business Mix</b><small>Revenue contribution by product</small></div></div><div className="business-mix-list">{performance.map(item=><div key={item.product}><p><span>{item.product}<small>{item.vertical}</small></span><b>{item.contribution}%</b></p><i><em style={{width:`${item.contribution}%`}}/></i><small>{formatINR(item.businessValue)} business • {formatINR(item.revenue)} revenue</small></div>)}</div></div>
    </section>

    <section className="business-revenue-grid">
      <div className="panel"><div className="panel-head"><div><b>Target vs Achievement</b><small>Monthly revenue target</small></div></div><div className="target-workspace"><div className="target-ring" style={{'--target':`${workspace.summary.targetAchievement}%`} as React.CSSProperties}><span><b>{workspace.summary.targetAchievement}%</b><small>Achieved</small></span></div><div><p>Monthly target <b>{formatINR(workspace.summary.monthlyTarget)}</b></p><p>Achieved <b>{formatINR(workspace.summary.targetAchievedAmount)}</b></p><p>Remaining <b>{formatINR(workspace.summary.targetRemaining)}</b></p></div></div></div>
      <div className="panel"><div className="panel-head"><div><b>Revenue & Earnings Summary</b><small>Service-provided settlement values</small></div></div><div className="earnings-summary"><div><span>Total earned</span><b>{formatINR(workspace.summary.totalRevenue)}</b></div><div><span>Paid revenue</span><b>{formatINR(workspace.summary.paidRevenue)}</b></div><div><span>Pending revenue</span><b>{formatINR(workspace.summary.pendingRevenue)}</b></div><div><span>Incentive / bonus</span><b>{formatINR(workspace.summary.incentive)}</b></div><div><span>Adjustments</span><b>{formatINR(workspace.summary.adjustments)}</b></div></div></div>
    </section>

    <section className="panel business-performance-table"><div className="panel-head"><div><b>Product / Vertical Performance</b><small>Applications, conversion, business and contribution</small></div></div><div className="data-table-wrap"><table className="data-table"><thead><tr><th>Product / Vertical</th><th>Applications</th><th>Converted</th><th>Business Value</th><th>Revenue</th><th>Conversion</th><th>Contribution</th></tr></thead><tbody>{performance.map(item=><tr key={item.product}><td><b>{item.product}</b><small>{item.vertical}</small></td><td>{item.applications}</td><td>{item.converted}</td><td><b>{formatINR(item.businessValue)}</b></td><td><b>{formatINR(item.revenue)}</b></td><td>{item.conversionRate}%</td><td><span className="contribution-cell"><i><em style={{width:`${item.contribution}%`}}/></i>{item.contribution}%</span></td></tr>)}</tbody></table></div></section>

    <section className="panel business-records-panel"><div className="panel-head"><div><b>Detailed Business</b><small>{rows.length} matching business records</small></div></div><div className="data-table-wrap"><table className="data-table business-records-table"><thead><tr><th>Date</th><th>Customer</th><th>Reference</th><th>Product / Vertical</th><th>Business Amount</th><th>Revenue</th><th>Status</th><th>Assigned Team</th></tr></thead><tbody>{visibleRows.map(item=><tr key={item.id}><td>{formatDate(item.date)}</td><td><b>{item.customer}</b><small>{item.id}</small></td><td><b className="link-text">{item.reference}</b></td><td><b>{item.product}</b><small>{item.vertical}</small></td><td><b>{formatINR(item.businessAmount)}</b></td><td><b>{formatINR(item.revenue)}</b></td><td><StatusBadge status={item.status}/></td><td>{item.assignedTo}</td></tr>)}</tbody></table></div>{!rows.length&&<div className="business-empty"><b>No matching business records</b><p>Change or reset the filters to see more data.</p><button onClick={clearFilters}>Reset filters</button></div>}{rows.length>pageSize&&<div className="business-pagination"><button disabled={page===1} onClick={()=>setPage(value=>value-1)}>Previous</button><span>Page {page} of {totalPages}</span><button disabled={page===totalPages} onClick={()=>setPage(value=>value+1)}>Next</button></div>}</section>

    <section className="panel pending-earnings-panel"><div className="panel-head"><div><b>Pending Revenue / Earnings</b><small>Approved and in-process settlements</small></div></div><div className="pending-earnings-list">{pending.map(item=><div key={item.id}><div><b>{item.customer}</b><small>{item.product} • {item.reference}</small></div><strong>{formatINR(item.revenue)}</strong><span><StatusBadge status={item.status}/><small>{item.expectedPayoutDate?`Expected ${formatDate(item.expectedPayoutDate)}`:'Date pending'}</small></span></div>)}</div>{!pending.length&&<div className="business-empty compact"><b>No pending earnings in this view</b></div>}</section>
  </div>
}

function formatDate(value:string){return new Intl.DateTimeFormat('en-IN',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(`${value}T00:00:00`))}
