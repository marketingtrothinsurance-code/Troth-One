import { estimateMonthlyInvestment } from './calculators'

export const goalCategories = ['Emergency Fund','Home','Car','Child Education','Retirement','Travel','Wedding','Wealth Creation','Business','Other'] as const
export const goalPriorities = ['High','Medium','Low'] as const
export const goalStatuses = ['On Track','Behind','Completed','Paused'] as const
export type GoalCategory = typeof goalCategories[number]
export type GoalPriority = typeof goalPriorities[number]
export type GoalStatus = typeof goalStatuses[number]

export interface CustomerGoal {
  id:string; name:string; category:GoalCategory; targetAmount:number; currentAmount:number; targetDate:string
  priority:GoalPriority; status:GoalStatus; monthlyContribution?:number; expectedReturn?:number
  linkedProduct?:string; notes?:string; createdAt:string; updatedAt?:string
}

export const seededCustomerGoals:CustomerGoal[] = [
  {id:'goal-retirement',name:'Retirement',category:'Retirement',targetAmount:3000000,currentAmount:2040000,targetDate:'2032-03-31',priority:'High',status:'On Track',monthlyContribution:18000,expectedReturn:10,linkedProduct:'Mutual Fund',notes:'Build a dependable long-term retirement corpus.',createdAt:'2025-01-12T10:00:00.000Z'},
  {id:'goal-education',name:'Child Education',category:'Child Education',targetAmount:2000000,currentAmount:880000,targetDate:'2030-06-30',priority:'High',status:'On Track',monthlyContribution:15000,expectedReturn:10,linkedProduct:'Investment',notes:'Higher education fund.',createdAt:'2025-04-18T10:00:00.000Z'},
  {id:'goal-emergency',name:'Emergency Fund',category:'Emergency Fund',targetAmount:500000,currentAmount:410000,targetDate:'2027-03-31',priority:'High',status:'On Track',monthlyContribution:10000,expectedReturn:0,linkedProduct:'Other',notes:'Six months of essential expenses.',createdAt:'2025-08-03T10:00:00.000Z'},
  {id:'goal-home',name:'Home Upgrade',category:'Home',targetAmount:1500000,currentAmount:470000,targetDate:'2029-12-31',priority:'Medium',status:'Behind',monthlyContribution:12000,expectedReturn:10,linkedProduct:'Loan',notes:'Renovation and furnishing reserve.',createdAt:'2025-11-09T10:00:00.000Z'}
]

export const getMonthsRemaining=(targetDate:string)=>{
  const now=new Date(), target=new Date(`${targetDate}T23:59:59`)
  return Math.max(0,Math.ceil((target.getTime()-now.getTime())/(1000*60*60*24*30.4375)))
}

export const getGoalMetrics=(goal:CustomerGoal)=>{
  const progress=goal.targetAmount>0?Math.min(100,Math.max(0,goal.currentAmount/goal.targetAmount*100)):0
  const remaining=Math.max(0,goal.targetAmount-goal.currentAmount)
  const monthsRemaining=getMonthsRemaining(goal.targetDate)
  const years=monthsRemaining/12
  const futureSavings=goal.currentAmount*Math.pow(1+(goal.expectedReturn??0)/100,years)
  const futureGap=Math.max(0,goal.targetAmount-futureSavings)
  const estimatedMonthlyContribution=remaining===0||monthsRemaining===0?0:estimateMonthlyInvestment(futureGap,goal.expectedReturn??0,monthsRemaining)
  return {progress,remaining,monthsRemaining,estimatedMonthlyContribution}
}

export const normaliseGoalStatus=(goal:CustomerGoal):GoalStatus=>goal.currentAmount>=goal.targetAmount?'Completed':goal.status==='Completed'?'On Track':goal.status
export const priorityRank:Record<GoalPriority,number>={High:0,Medium:1,Low:2}
