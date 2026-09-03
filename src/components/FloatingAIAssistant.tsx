import { useEffect, useRef, useState } from 'react'
import { Bot, ChevronDown, MessageCircle, Minimize2, Plus, Send, ShieldCheck, Sparkles, UserRound, X } from 'lucide-react'
import type { Application } from '../types'
import { productCatalogue, type CatalogueProduct } from '../data/productCatalogue'
import { sendMessage, suggestedQuestions, type ChatAction, type ChatReply } from '../services/chatService'
import { BuyJourney, InquiryModal, ProductDetails } from '../pages/CustomerProducts'

type Message={id:number;role:'assistant'|'user';content:string;reply?:ChatReply}
const welcome:Message={id:1,role:'assistant',content:'Hello Vivek! I’m Troth AI. I can help with products, applications, documents, calculators and common support questions. What would you like to know?'}
const contextualSuggestions:Record<string,string[]>={
  dashboard:['What needs my attention?','When is my policy renewal?','Show my applications','What is SIP?'],
  'my-products':['Explain Health Insurance','How do I renew a policy?','How do I start another investment?','Explain Loan Protector'],
  applications:['Where is my application?','Why is my application pending?','Explain my pending document requirement','What are application stages?'],
  calculator:['What does expected return mean?','How is EMI calculated?','What is a good SIP period?','Which calculator should I use?'],
  profile:['What is KYC?','Which document should I upload?','Why is PAN required?','Is my KYC complete?'],
  support:['How do I raise a service request?','Where are my support tickets?','Request a callback','How do I renew my policy?']
}

export function FloatingAIAssistant({page,apps,onNavigate,onToast}:{page:string;apps:Application[];onNavigate:(page:string)=>void;onToast:(message:string)=>void}){
  const [open,setOpen]=useState(false);const [bubble,setBubble]=useState(false);const [unread,setUnread]=useState(false)
  const [messages,setMessages]=useState<Message[]>([welcome]);const [input,setInput]=useState('');const [typing,setTyping]=useState(false)
  const [detail,setDetail]=useState<CatalogueProduct|null>(null);const [buy,setBuy]=useState<CatalogueProduct|null>(null);const [inquiry,setInquiry]=useState<CatalogueProduct|null>(null)
  const endRef=useRef<HTMLDivElement>(null);const inputRef=useRef<HTMLInputElement>(null)
  const suggestions=contextualSuggestions[page]||suggestedQuestions.slice(0,5)
  useEffect(()=>{if(sessionStorage.getItem('troth-ai-bubble-seen'))return;const timer=window.setTimeout(()=>{setBubble(true);setUnread(true);sessionStorage.setItem('troth-ai-bubble-seen','true')},1600);return()=>window.clearTimeout(timer)},[])
  useEffect(()=>{if(open){setUnread(false);setBubble(false);window.setTimeout(()=>inputRef.current?.focus(),180)}},[open])
  useEffect(()=>endRef.current?.scrollIntoView({behavior:'smooth'}),[messages,typing,open])
  useEffect(()=>{const key=(event:KeyboardEvent)=>{if(event.key==='Escape'&&open)setOpen(false)};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[open])
  const ask=async(text=input)=>{const value=text.trim();if(!value||typing)return;setMessages(current=>[...current,{id:Date.now(),role:'user',content:value}]);setInput('');setTyping(true);const reply=await sendMessage(value,{applications:apps});setTyping(false);setMessages(current=>[...current,{id:Date.now()+1,role:'assistant',content:reply.text,reply}])}
  const navigate=(target:string)=>{setOpen(false);onNavigate(target)}
  const handleAction=(action:ChatAction)=>{const product=productCatalogue.find(p=>p.id===action.target);if(action.type==='product-details'){if(action.target==='calculator')navigate('calculator');else if(action.target==='my-products')navigate('my-products');else if(product)setDetail(product)}else if(action.type==='buy'&&product)setBuy(product);else if(action.type==='inquiry'&&product)setInquiry(product);else if(action.type==='view-application'){sessionStorage.setItem('troth-open-app',action.target||'');navigate('applications')}else if(action.type==='upload')navigate('profile');else if(action.type==='support'){sessionStorage.setItem('troth-support-request','true');window.dispatchEvent(new Event('troth-open-support-request'));navigate('support')}else if(action.type==='callback')onToast('Callback requested. Our team will contact you shortly.')}
  const reset=()=>{setMessages([{...welcome,id:Date.now()}]);setInput('');setTyping(false)}
  return <div className="floating-ai-root">
    {!open&&bubble&&<div className="ai-suggestion-bubble"><button className="bubble-main" onClick={()=>setOpen(true)}><Sparkles/><span><b>Need help with an application?</b><small>Ask me about products, documents or renewals.</small></span></button><button className="bubble-close" onClick={()=>{setBubble(false);setUnread(false)}} aria-label="Dismiss suggestion"><X/></button></div>}
    {!open&&<button className="ai-trigger-button" onClick={()=>setOpen(true)} aria-label="Ask Troth AI" title="Ask Troth AI"><Bot/>{unread&&<i>1</i>}<span>Ask Troth AI</span></button>}
    {open&&<aside className="floating-ai-panel" aria-label="Troth AI chat assistant">
      <header className="ai-chat-header"><div className="chat-avatar"><Bot/></div><div><h2>Troth AI</h2><span><i/> Online • How can I help you?</span></div><button onClick={reset} title="Start new chat" aria-label="Start new chat"><Plus/></button><button onClick={()=>setOpen(false)} title="Minimize chat" aria-label="Minimize chat"><Minimize2/></button><button onClick={()=>setOpen(false)} title="Close chat" aria-label="Close chat"><X/></button></header>
      <div className="chat-safety"><ShieldCheck/> General guidance only. Suitability, returns, coverage and lending decisions depend on applicable terms and individual circumstances.</div>
      <div className="chat-messages">{messages.map(m=><div key={m.id} className={`chat-message ${m.role}`}><span>{m.role==='assistant'?<Bot/>:<UserRound/>}</span><div><p>{m.content}</p>{m.reply?.bullets&&<ul>{m.reply.bullets.map(x=><li key={x}>{x}</li>)}</ul>}{m.reply?.caution&&<small>{m.reply.caution}</small>}{m.reply?.actions&&<div className="chat-action-buttons">{m.reply.actions.map(a=><button key={a.label} onClick={()=>handleAction(a)}>{a.label}</button>)}</div>}</div></div>)}{typing&&<div className="chat-message assistant"><span><Bot/></span><div className="typing"><i/><i/><i/></div></div>}<div ref={endRef}/></div>
      {messages.length===1&&<div className="chat-suggestions"><span>Suggestions for this page</span><div>{suggestions.slice(0,5).map(q=><button key={q} onClick={()=>ask(q)}>{q}</button>)}</div></div>}
      <div className="chat-human-help"><span>Need more help?</span><button onClick={()=>handleAction({label:'Raise Service Request',type:'support'})}>Raise Request</button><button onClick={()=>handleAction({label:'Request Callback',type:'callback'})}>Callback</button><button onClick={()=>navigate('support')}>Go to Support</button></div>
      <form className="chat-input" onSubmit={e=>{e.preventDefault();ask()}}><input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask Troth AI..." aria-label="Message Troth AI"/><button disabled={!input.trim()||typing} aria-label="Send message"><Send/></button></form>
    </aside>}
    {detail&&<ProductDetails product={detail} owned={false} onClose={()=>setDetail(null)} onBuy={()=>{setDetail(null);setBuy(detail)}} onInquiry={()=>{setDetail(null);setInquiry(detail)}}/>}
    {buy&&<BuyJourney product={buy} onClose={()=>setBuy(null)} onComplete={()=>{setBuy(null);onToast('Application started successfully')}}/>}
    {inquiry&&<InquiryModal product={inquiry} alreadySubmitted={false} onClose={()=>setInquiry(null)} onSubmit={()=>{setInquiry(null);onToast('Inquiry submitted successfully. Our team will contact you shortly.')}}/>}
  </div>
}
