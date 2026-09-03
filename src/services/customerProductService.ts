export interface ProductSupportContact {
  label: string
  phone: string
  dialable: boolean
}

const customerSupport: ProductSupportContact = {
  label: 'Customer Support',
  phone: '+91 XXXXX XXXXX',
  dialable: false
}

export const customerProductService = {
  getSupportContact: (_productId: string): ProductSupportContact => ({...customerSupport}),
  beginClaim: (reference: string) =>
    `Claim initiation for ${reference} requires claims API integration.`,
  downloadPolicy: (documentId: string) =>
    `Policy ${documentId} requires document API integration before download.`
}
