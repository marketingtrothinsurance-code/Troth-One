import { commissionRepository, type CommissionSlab } from '../data/adminCommissionPayoutData'
import { applications } from '../data/mockData'
import { buildAdminProducts } from '../data/adminProductsPartnersData'
import { rmRepository } from './service'

export interface RMCommissionRule extends CommissionSlab {
 franchiseId:string
 franchiseName:string
 provider:string
 scope:'Global Admin Rule'
}

const providerByProduct=()=>new Map(buildAdminProducts(applications).map(product=>[product.name,product.providerName]))

export const rmCommissionService={
 list:():RMCommissionRule[]=>{
  const providers=providerByProduct(),franchises=rmRepository.franchises()
  return commissionRepository.load().slabs.flatMap(slab=>franchises.map(franchise=>({...slab,franchiseId:franchise.id,franchiseName:franchise.name,provider:providers.get(slab.product)||'All approved providers',scope:'Global Admin Rule' as const})))
 }
}
