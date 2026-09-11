export interface CompactTickerItem {
  id: string
  label: string
  text: string
}

export function CompactTicker<T extends CompactTickerItem>({label,items,onSelect}:{label:string;items:T[];onSelect?:(item:T)=>void}){
  return <section className="offers-ticker" aria-label={label}>
    <div className="offers-ticker-label"><span>{label}</span></div>
    <div className="offers-ticker-viewport" aria-live="off">
      <div className="offers-ticker-track">
        {[false,true].map(duplicate=><div className="offers-ticker-group" aria-hidden={duplicate||undefined} key={duplicate?'duplicate':'primary'}>{items.map(item=><span className="offers-ticker-item" key={`${duplicate?'copy-':''}${item.id}`}><button tabIndex={duplicate?-1:0} onClick={()=>onSelect?.(item)}><b>{item.label}</b><span>{item.text}</span></button><i>•</i></span>)}</div>)}
      </div>
    </div>
  </section>
}
