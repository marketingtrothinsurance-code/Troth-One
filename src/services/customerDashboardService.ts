import { customerDashboardBaseSummary, customerInstallments, customerLoans, customerPromotions, type CustomerDashboardSummary, type CustomerInstallment, type CustomerPromotion } from '../data/customerDashboardData'

const upcomingStatuses:CustomerInstallment['status'][]=['Upcoming','Scheduled','Due Soon']
const upcomingInstallments=()=>customerInstallments.filter(item=>upcomingStatuses.includes(item.status))

// Replace this local provider with an API implementation without changing dashboard consumers.
export const customerDashboardRepository = {
  getSummary:():CustomerDashboardSummary=>{
    const activeLoans=customerLoans.filter(loan=>loan.status==='Active')
    const payments=upcomingInstallments()
    return {...customerDashboardBaseSummary,activeLoanCount:activeLoans.length,activeLoanOutstandingAmount:activeLoans.reduce((sum,loan)=>sum+loan.outstandingBalance,0),upcomingPaymentCount:payments.length,upcomingPaymentAmount:payments.reduce((sum,item)=>sum+item.amount,0)}
  },
  listPromotions:():CustomerPromotion[]=>customerPromotions.map(item=>({...item})),
  listInstallments:():CustomerInstallment[]=>upcomingInstallments().map(item=>({...item}))
}
