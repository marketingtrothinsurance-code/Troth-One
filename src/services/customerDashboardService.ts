import { customerDashboardSummary, customerInstallments, customerPromotions, type CustomerDashboardSummary, type CustomerInstallment, type CustomerPromotion } from '../data/customerDashboardData'

// Replace this local provider with an API implementation without changing dashboard consumers.
export const customerDashboardRepository = {
  getSummary:():CustomerDashboardSummary=>({...customerDashboardSummary}),
  listPromotions:():CustomerPromotion[]=>customerPromotions.map(item=>({...item})),
  listInstallments:():CustomerInstallment[]=>customerInstallments.map(item=>({...item}))
}
