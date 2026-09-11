import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, CalendarDays, TrendingUp } from 'lucide-react'
import { PageHeader, StatCard } from '../components/UI'
import {
  adminBusinessPeriodFixtures,
  buildAdminBusinessView,
  businessPeriods,
  formatAdminBusinessINR,
  type BusinessPeriod,
} from '../data/adminBusinessData'
import { franchisees } from '../data/mockData'
import type { Application } from '../types'

interface Props { apps:Application[]; onNavigate:(page:string,filter?:string)=>void }

export function AdminBusinessDetails({apps,onNavigate}:Props) {
  const [period,setPeriod]=useState<BusinessPeriod>('This Month')
  const view=useMemo(()=>buildAdminBusinessView(apps,franchisees,period),[apps,period])
  const today=useMemo(()=>buildAdminBusinessView(apps,franchisees,'Today'),[apps])
  const month=useMemo(()=>buildAdminBusinessView(apps,franchisees,'This Month'),[apps])
  const matrixProducts=view.products.slice(0,4).map(item=>item.product)
  const growthPeriods:BusinessPeriod[]=['Today','This Week','This Month']

  return <div className="page admin-business-details">
    <PageHeader eyebrow="ADMIN BUSINESS DETAILS" title="Business Performance" description="Detailed contribution by product and franchisee" actions={<button className="secondary-btn" onClick={()=>onNavigate('dashboard')}><ArrowLeft/> Back to Dashboard</button>}/>

    <div className="admin-business-toolbar">
      <div><CalendarDays/><span>Reporting period</span></div>
      <div className="admin-period-tabs">{businessPeriods.map(item=><button key={item} className={period===item?'active':''} onClick={()=>setPeriod(item)}>{item}</button>)}</div>
    </div>

    <section className="admin-business-summary">
      <StatCard label="Today's Business" value={formatAdminBusinessINR(today.amount)} meta={`${signed(today.growthPercent)} vs yesterday`} tone="green"/>
      <StatCard label="Month-to-Date Business" value={formatAdminBusinessINR(month.amount)} meta={`${signed(month.growthPercent)} vs previous MTD`} tone="blue"/>
      <StatCard label={`${period} Applications`} value={view.applications} meta="Contributing business cases" tone="violet"/>
      <StatCard label="Contributing Franchisees" value={view.activeFranchisees} meta={`Active in ${period.toLowerCase()}`} tone="navy"/>
    </section>

    <section className="admin-business-analysis-grid">
      <article className="panel admin-contribution-panel">
        <PanelHeader title="Business by Product" subtitle={`${period} contribution across ${view.products.length} products`}/>
        <div className="admin-contribution-list">{view.products.map(item=><button key={item.product} onClick={()=>onNavigate('applications')}>
          <span className="contribution-rank">{view.products.indexOf(item)+1}</span>
          <span className="contribution-main"><b>{item.product}</b><small>{item.applications} applications</small><i><em style={{width:`${item.contributionPercent}%`}}/></i></span>
          <span className="contribution-value"><b>{formatAdminBusinessINR(item.amount)}</b><small>{item.contributionPercent.toFixed(1)}%</small></span><ArrowRight/>
        </button>)}</div>
      </article>

      <article className="panel admin-contribution-panel">
        <PanelHeader title="Business by Franchisee" subtitle={`${period} partner contribution`}/>
        <div className="admin-contribution-list franchisee-contribution-list">{view.franchisees.map((item,index)=><button key={item.franchiseeName} onClick={()=>onNavigate('franchisees')}>
          <span className="contribution-rank">{index+1}</span>
          <span className="contribution-main"><b>{item.franchiseeName}</b><small>{item.city} · {item.applications} applications</small><i><em style={{width:`${item.contributionPercent}%`}}/></i></span>
          <span className="contribution-value"><b>{formatAdminBusinessINR(item.amount)}</b><small>{item.contributionPercent.toFixed(1)}%</small></span><ArrowRight/>
        </button>)}</div>
      </article>
    </section>

    <article className="panel admin-matrix-panel">
      <PanelHeader title="Product Contribution by Franchisee" subtitle={`Top contributing partners for ${period.toLowerCase()}`}/>
      <div className="admin-business-table-wrap"><table className="admin-business-table"><thead><tr><th>Franchisee</th>{matrixProducts.map(product=><th key={product}>{product}</th>)}<th>Total</th></tr></thead><tbody>{view.matrix.slice(0,8).map(row=><tr key={row.franchiseeName} onClick={()=>onNavigate('franchisees')}><td><b>{row.franchiseeName}</b><small>{row.city}</small></td>{matrixProducts.map(product=><td key={product}>{row.products[product]?formatAdminBusinessINR(row.products[product]||0):'—'}</td>)}<td><b>{formatAdminBusinessINR(row.amount)}</b></td></tr>)}</tbody></table></div>
    </article>

    <article className="panel admin-growth-panel">
      <PanelHeader title="Business Growth" subtitle="Comparison with the equivalent previous period"/>
      <div className="admin-growth-grid">{growthPeriods.map(item=>{
        const metric=buildAdminBusinessView(apps,franchisees,item)
        return <div key={item}><span className="growth-icon"><TrendingUp/></span><span><small>{item}</small><b>{formatAdminBusinessINR(metric.amount)}</b><em>{signed(metric.growthPercent)}</em></span><p>Previous period<br/><b>{formatAdminBusinessINR(adminBusinessPeriodFixtures[item].previousAmount)}</b></p></div>
      })}</div>
    </article>
  </div>
}

function PanelHeader({title,subtitle}:{title:string;subtitle:string}) {
  return <div className="panel-head"><div><b>{title}</b><small>{subtitle}</small></div></div>
}

function signed(value:number):string { return `${value>=0?'+':''}${value.toFixed(1)}%` }
