import { useState } from 'react'
import { ArrowRight, Calculator, CalendarClock, CheckCircle2, ChevronRight, CircleDollarSign, Clock3, Download, FileText, GraduationCap, Headphones, HeartPulse, Home, Landmark, MessageCircle, PiggyBank, Plus, RefreshCw, ShieldCheck, TrendingUp, Upload, WalletCards } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Application } from '../types'
import { formatINR } from '../data/mockData'
import { PageHeader, StatusBadge } from '../components/UI'

interface Props { apps:Application[]; onNavigate:(page:string,filter?:string)=>void; onToast:(message:string)=>void }

const products = [
  {name:'Mutual Funds',value:'₹18.75 L',meta:'3 folios',filter:'Mutual Funds',icon:TrendingUp,tone:'blue'},
  {name:'Insurance',value:'3 policies',meta:'All active',filter:'Insurance',icon:ShieldCheck,tone:'green'},
  {name:'Loans',value:'₹22.50 L',meta:'2 active loans',filter:'Loans',icon:Landmark,tone:'navy'},
  {name:'Loan Protector',value:'1 active cover',meta:'₹20 L protected',filter:'Loan Protector',icon:HeartPulse,tone:'violet'},
  {name:'Demat Account',value:'Active',meta:'Client ID: TRO•••4821',filter:'Demat',icon:WalletCards,tone:'cyan'},
  {name:'PMS / AIF',value:'₹3.20 L',meta:'2 investments',filter:'PMS / AIF',icon:CircleDollarSign,tone:'purple'},
  {name:'Bonds',value:'₹2.75 L',meta:'3 investments',filter:'Bonds',icon:PiggyBank,tone:'amber'},
  {name:'Research / Advisory',value:'Active',meta:'Renews 15 Oct 2026',filter:'Research / Advisory',icon:FileText,tone:'slate'}
]

const renewals = [
  ['Health Insurance','Policy: HDF12345678','21 Sep 2026','19 days'],
  ['Motor Insurance','Policy: TAT98243110','05 Oct 2026','33 days'],
  ['Research Subscription','ID: RS10024','15 Oct 2026','43 days']
]
const payments = [
  ['Home Loan EMI','Home Advantage Loan','05 Sep 2026',35000,'Upcoming'],
  ['Health Premium','Family Health Secure','10 Sep 2026',18750,'Upcoming'],
  ['Mutual Fund SIP','Equity Opportunities Fund','15 Sep 2026',10000,'Scheduled']
]
const transactions = [
  ['Mutual Fund SIP','01 Sep 2026',10000,'Success'],['Home Loan EMI','05 Aug 2026',35000,'Success'],['Health Insurance Premium','21 Jul 2026',18750,'Success'],['Research Subscription','15 Jul 2026',12000,'Success'],['Investment Redemption','10 Jul 2026',45000,'Pending']
]
const goals:Array<[string,number,string,LucideIcon]> = [
  ['Retirement',68,'₹20.4 L of ₹30 L',PiggyBank],['Child education',44,'₹8.8 L of ₹20 L',GraduationCap],['Emergency fund',82,'₹4.1 L of ₹5 L',ShieldCheck],['Home upgrade',31,'₹4.7 L of ₹15 L',Home]
]
const quickActions:Array<[LucideIcon,string,string]> = [[Calculator,'Plan your future','calculator'],[TrendingUp,'Explore products','my-products'],[Plus,'Start application','my-products'],[Upload,'Upload document','profile'],[MessageCircle,'Request callback','support'],[Headphones,'Service request','support'],[Download,'Download statement','download']]

export function CustomerDashboard({apps,onNavigate,onToast}:Props) {
  const [period,setPeriod]=useState('6M')
  const active=apps.filter(a=>!['Completed','Rejected'].includes(a.status)).length
  const pending=apps.filter(a=>a.pendingAction!=='None'&&!['Completed','Rejected'].includes(a.status))
  const completed=apps.filter(a=>a.status==='Completed').length
  const closed=apps.filter(a=>['Rejected'].includes(a.status)).length
  const greeting = new Date().getHours()<12?'Good morning':new Date().getHours()<17?'Good afternoon':'Good evening'
  const goProducts=(filter?:string)=>{if(filter)sessionStorage.setItem('troth-product-filter',filter);onNavigate('my-products')}
  return <div className="page customer-dashboard">
    <PageHeader eyebrow="MY FINANCIAL WORLD" title={`${greeting}, Vivek`} description="Here’s your financial overview for today." actions={<div className="customer-login"><Clock3 size={15}/><span>Last login<b>02 Sep 2026, 09:42 AM</b></span></div>}/>

    <div className="section-heading"><div><h2>My Financial Snapshot</h2><p>Your complete financial relationship with Troth One</p></div></div>
    <section className="financial-snapshot">
      <button onClick={()=>goProducts('Mutual Funds')}><span className="snapshot-icon blue"><TrendingUp/></span><small>Total investments</small><strong>₹18,75,430</strong><p><b className="positive">↑ 6.20%</b> vs previous period</p></button>
      <button onClick={()=>goProducts('Insurance')}><span className="snapshot-icon green"><ShieldCheck/></span><small>Insurance coverage</small><strong>₹1.25 Cr</strong><p>3 active policies</p></button>
      <button onClick={()=>goProducts('Loans')}><span className="snapshot-icon navy"><Landmark/></span><small>Active loans</small><strong>₹22,50,000</strong><p>2 active loans</p></button>
      <button onClick={()=>goProducts('Loan Protector')}><span className="snapshot-icon violet"><HeartPulse/></span><small>Loan protection</small><strong>₹20 L</strong><p>Active and covered</p></button>
      <button onClick={()=>onToast('Payment details opened')}><span className="snapshot-icon amber"><CalendarClock/></span><small>Upcoming payments</small><strong>₹63,750</strong><p>Next 15 days</p></button>
      <button onClick={()=>{sessionStorage.setItem('troth-product-filter','Renewals');onNavigate('my-products')}}><span className="snapshot-icon cyan"><RefreshCw/></span><small>Upcoming renewals</small><strong>3</strong><p>Next 60 days</p></button>
    </section>

    <section className="customer-row customer-overview-row">
      <div className="customer-card products-overview">
        <div className="customer-card-head"><div><h2>My Products Overview</h2><p>All your products in one place</p></div><button onClick={()=>goProducts()}>View all <ArrowRight/></button></div>
        <div className="customer-product-grid">{products.map(({name,value,meta,filter,icon:Icon,tone})=><button key={name} onClick={()=>goProducts(filter)}><span className={`customer-product-icon ${tone}`}><Icon/></span><span><b>{name}</b><strong>{value}</strong><small>{meta}</small></span><ChevronRight/></button>)}</div>
      </div>
      <div className="customer-card portfolio-card">
        <div className="customer-card-head"><div><h2>Portfolio Value Trend</h2><p>Current value <b>₹18,75,430</b></p></div></div>
        <div className="period-tabs">{['1M','3M','6M','1Y'].map(p=><button className={period===p?'active':''} onClick={()=>setPeriod(p)} key={p}>{p}</button>)}</div>
        <div className="portfolio-change"><b>+₹1,09,480</b><span>+6.20% in selected period</span></div>
        <svg className="line-chart" viewBox="0 0 420 160" preserveAspectRatio="none" aria-label="Portfolio value trend">
          <defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#315efb" stopOpacity=".22"/><stop offset="1" stopColor="#315efb" stopOpacity="0"/></linearGradient></defs>
          <g className="chart-grid"><line x1="0" y1="30" x2="420" y2="30"/><line x1="0" y1="80" x2="420" y2="80"/><line x1="0" y1="130" x2="420" y2="130"/></g>
          <path className="chart-area" d="M0,126 C45,120 58,98 95,105 S145,116 170,83 S225,63 254,74 S315,49 340,56 S385,28 420,34 L420,160 L0,160 Z"/>
          <path className="chart-line" d="M0,126 C45,120 58,98 95,105 S145,116 170,83 S225,63 254,74 S315,49 340,56 S385,28 420,34"/>
          <circle cx="420" cy="34" r="5"/>
        </svg><div className="chart-labels"><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Sep</span></div>
      </div>
      <div className="customer-card allocation-card">
        <div className="customer-card-head"><div><h2>Asset Allocation</h2><p>By current value</p></div></div>
        <div className="allocation-donut"><div><strong>₹24.7 L</strong><small>Total value</small></div></div>
        <div className="allocation-legend">{[['Mutual Funds','51%','blue'],['PMS / AIF','21%','violet'],['Bonds','18%','green'],['Other','10%','slate']].map(([n,v,t])=><div key={n}><i className={t}/><span>{n}</span><b>{v}</b></div>)}</div>
      </div>
    </section>

    <section className="customer-row customer-action-row">
      <div className="customer-card action-required-card">
        <div className="customer-card-head"><div><span className="attention-label">ACTION REQUIRED</span><h2>{pending.length || 2} items need your attention</h2><p>Complete these to keep applications moving</p></div><button onClick={()=>onNavigate('applications','Action Required')}>View all <ArrowRight/></button></div>
        <div className="customer-action-list">{(pending.length?pending:apps.slice(0,2)).slice(0,3).map((a,i)=><div key={a.id}><span className="action-product-icon"><Upload/></span><div><small>{a.product} • {a.id}</small><b>{a.pendingAction==='None'?(i?'Complete KYC':'Upload salary slip'):a.pendingAction}</b><span>Pending since {i?'31 Aug':'30 Aug'} 2026</span></div><button onClick={()=>onToast('Document upload opened')}>{a.pendingAction.toLowerCase().includes('confirm')?'Respond':'Upload document'}</button></div>)}</div>
      </div>
      <div className="customer-card compact-list-card">
        <div className="customer-card-head"><div><h2>Upcoming Renewals</h2><p>Next 60 days</p></div><button onClick={()=>goProducts('Renewals')}>View all</button></div>
        <div className="renewal-list">{renewals.map(([name,id,date,days])=><div key={name}><span className="mini-product-icon"><RefreshCw/></span><div><b>{name}</b><small>{id}</small><span>{date} • {days} left</span></div><button onClick={()=>onToast('Renewal request submitted')}>Renew</button></div>)}</div>
      </div>
      <div className="customer-card compact-list-card">
        <div className="customer-card-head"><div><h2>Upcoming Payments</h2><p>Your scheduled commitments</p></div><button onClick={()=>onToast('Payment schedule opened')}>View all</button></div>
        <div className="payment-list">{payments.map(([type,name,date,amount,status])=><button key={String(type)} onClick={()=>onToast('Payment details opened')}><span className="mini-product-icon payment"><CircleDollarSign/></span><div><b>{String(type)}</b><small>{String(name)}</small><span>{String(date)}</span></div><div><strong>{formatINR(Number(amount))}</strong><StatusBadge status={String(status)}/></div></button>)}</div>
      </div>
    </section>

    <section className="customer-row customer-info-row">
      <div className="customer-card transactions-card"><div className="customer-card-head"><div><h2>Recent Transactions</h2><p>Your latest financial activity</p></div><button onClick={()=>onToast('Transaction history will be available here')}>View all</button></div><div className="transaction-table"><div className="transaction-head"><span>Transaction</span><span>Date</span><span>Amount</span><span>Status</span></div>{transactions.map(([name,date,amount,status])=><div key={String(name)+date}><span><i><CircleDollarSign/></i><b>{String(name)}</b></span><span>{String(date)}</span><strong>{formatINR(Number(amount))}</strong><StatusBadge status={String(status)}/></div>)}</div></div>
      <div className="customer-card applications-summary"><div className="customer-card-head"><div><h2>My Applications</h2><p>Track recent requests</p></div><button onClick={()=>onNavigate('applications')}>View all <ArrowRight/></button></div><div className="application-counts"><button onClick={()=>onNavigate('applications','In Progress')}><strong>{active}</strong><span>Active</span></button><button onClick={()=>onNavigate('applications','Action Required')}><strong>{pending.length}</strong><span>Action needed</span></button><button onClick={()=>onNavigate('applications','Completed')}><strong>{completed}</strong><span>Completed</span></button><button onClick={()=>onNavigate('applications','Rejected')}><strong>{closed}</strong><span>Closed</span></button></div><div className="customer-application-list">{apps.slice(0,4).map(a=><button key={a.id} onClick={()=>{sessionStorage.setItem('troth-open-app',a.id);onNavigate('applications')}}><div><b>{a.productName}</b><span>{a.id} • {a.provider}</span></div><div><small>{a.stage}</small><StatusBadge status={a.status}/></div><ChevronRight/></button>)}</div></div>
      <div className="customer-card service-card"><div className="customer-card-head"><div><h2>Service Requests</h2><p>Support and assistance</p></div></div><div className="service-counts"><div><strong>2</strong><span>Open</span></div><div><strong>1</strong><span>In progress</span></div><div><strong>8</strong><span>Resolved</span></div></div><div className="service-latest"><span><MessageCircle/></span><div><b>Statement request</b><small>SR-10248 • In progress</small></div></div><div className="service-latest"><span><Headphones/></span><div><b>Policy nominee update</b><small>SR-10231 • Open</small></div></div><div className="service-buttons"><button onClick={()=>onNavigate('support')}>View all</button><button onClick={()=>onNavigate('support')}><Plus/> Raise request</button></div></div>
    </section>

    <section className="customer-bottom-row">
      <div className="customer-card goals-card"><div className="customer-card-head"><div><h2>My Goals</h2><p>Progress towards what matters to you</p></div><button onClick={()=>onToast('Goals workspace opened')}>Manage goals</button></div><div className="goals-grid">{goals.map(([name,progress,amount,Icon])=><div key={String(name)}><span><Icon/></span><div><p><b>{String(name)}</b><strong>{Number(progress)}%</strong></p><div className="goal-bar"><i style={{width:`${progress}%`}}/></div><small>{String(amount)}</small></div></div>)}</div></div>
      <div className="customer-card quick-actions-card"><div className="customer-card-head"><div><h2>Quick Actions</h2><p>Common things you may need</p></div></div><div className="customer-quick-grid">{quickActions.map(([Icon,label,target])=><button key={label} onClick={()=>{if(target==='download'){onToast('Statement download prepared');return}if(target==='my-products')sessionStorage.setItem('troth-product-focus','explore');onNavigate(target)}}><span><Icon/></span>{label}</button>)}</div></div>
    </section>

    <section className="advisory-banner"><div className="banner-art"><ShieldCheck/></div><div><span>SMART PROTECTION CHECK</span><h2>Protect your home loan and your family’s future</h2><p>You have an active home loan. A Loan Protector can help cover the outstanding amount during unforeseen events.</p></div><button onClick={()=>goProducts('Loan Protector')}>Explore Loan Protector <ArrowRight/></button></section>
  </div>
}
