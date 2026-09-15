// ============================================================
// Imports
// ============================================================

import { Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { legacyCustomerHoldings } from '../customer360HoldingData'

import type { FranchiseeCustomer } from '../types'

import {
  DataTable,
  FilterSelect,
  Filters,
  money,
  PageHeader,
  Panel,
  StatusBadge,
} from '../components/FranchiseeUI'


// ============================================================
// Product Groups
// These IDs are used to identify investment and loan holdings
// from the legacy customer holding data.
// ============================================================

const investmentProductIds = new Set([
  'mf',
  'demat',
  'pms',
  'aif',
  'bonds',
  'fd',
  'ipo',
  'nps',
  'gold',
  'research',
])

const loanProductIds = new Set([
  'home-loan',
  'personal-loan',
  'business-loan',
  'lap',
])


// ============================================================
// Component Props
// ============================================================

interface Props {
  customers: FranchiseeCustomer[]

  // Used when another page wants to directly open
  // a particular customer's 360 profile.
  focusCustomerId?: string

  onFocusHandled?: () => void

  // Opens the complete Customer 360 view.
  onOpen360: (customerId: string) => void

  // Opens customer onboarding as a full page.
  onAddCustomer: () => void

  // Currently not used on this page,
  // but kept because it is part of the page interface.
  onApply: (customer: FranchiseeCustomer) => void
  onSupport: (customer: FranchiseeCustomer) => void

  onToast: (message: string) => void
}


// ============================================================
// Customers Page
// ============================================================

export function CustomersPage({
  customers,
  focusCustomerId,
  onFocusHandled,
  onOpen360,
  onAddCustomer,
  onApply: _,
  onSupport: __,
  onToast,
}: Props) {
  // ----------------------------------------------------------
  // Local Page State
  // ----------------------------------------------------------

  const [search, setSearch] = useState('')
  const [kyc, setKyc] = useState('All KYC')
  const [product, setProduct] = useState('All Products')
  const [source, setSource] = useState('All Sources')

  const kycOptions = useMemo(
    () => [
      'All KYC',
      ...new Set(customers.map(customerKycStatus)),
    ],
    [customers]
  )

  const productOptions = useMemo(
    () => [
      'All Products',
      ...new Set(customers.flatMap(customerProducts)),
    ],
    [customers]
  )

  const sourceOptions = useMemo(
    () => [
      'All Sources',
      ...new Set(
        customers
          .map(customerSource)
          .filter((value): value is string => Boolean(value))
      ),
    ],
    [customers]
  )


  // ----------------------------------------------------------
  // Filter Customers
  //
  // Customers can be searched using:
  // - Name
  // - Customer ID
  // - Mobile number
  // - Email
  //
  // They can also be filtered by KYC, product and source.
  // ----------------------------------------------------------

  const rows = useMemo(() => {
    const normalizedSearch = search.toLowerCase()

    return customers.filter((customer) => {
      const matchesKyc =
        kyc === 'All KYC' ||
        customerKycStatus(customer) === kyc

      const matchesProduct =
        product === 'All Products' ||
        customerProducts(customer).includes(product)

      const matchesSource =
        source === 'All Sources' ||
        customerSource(customer) === source

      const searchableText = `
        ${customer.name}
        ${customer.id}
        ${customer.mobile}
        ${customer.email || ''}
      `.toLowerCase()

      const matchesSearch =
        searchableText.includes(normalizedSearch)

      return (
        matchesKyc &&
        matchesProduct &&
        matchesSource &&
        matchesSearch
      )
    })
  }, [customers, search, kyc, product, source])


  // ----------------------------------------------------------
  // Automatically Open Customer 360
  //
  // If focusCustomerId is received from another page,
  // automatically open that customer's 360 profile.
  // ----------------------------------------------------------

  useEffect(() => {
    if (!focusCustomerId) {
      return
    }

    const customerExists = customers.some(
      (customer) => customer.id === focusCustomerId
    )

    if (customerExists) {
      onOpen360(focusCustomerId)
    }

    onFocusHandled?.()
  }, [
    focusCustomerId,
    customers,
    onFocusHandled,
    onOpen360,
  ])


  // ==========================================================
  // Page UI
  // ==========================================================

  return (
    <div className="franchisee-customers-page">

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <PageHeader
        eyebrow="CUSTOMER RELATIONSHIPS"
        title="Customers"
        description="A clear view of each customer's profile, investments, loans and relationship with your franchise."
        actions={
          <button
            className="tf-primary"
            onClick={onAddCustomer}
          >
            <Plus />
            Add New Customer
          </button>
        }
      />


      {/* ======================================================
          CUSTOMER DIRECTORY
      ====================================================== */}

      <Panel
        title="Customer Directory"
        subtitle={`${rows.length} customers`}
      >

        {/* ----------------------------------------------------
            Customer List Filters
        ---------------------------------------------------- */}

        <Filters
          search={search}
          onSearch={setSearch}
        >
          <FilterSelect
            label="KYC"
            value={kyc}
            onChange={setKyc}
            options={kycOptions}
          />

          <FilterSelect
            label="Products"
            value={product}
            onChange={setProduct}
            options={productOptions}
          />

          <FilterSelect
            label="Source"
            value={source}
            onChange={setSource}
            options={sourceOptions}
          />
        </Filters>


        {/* ----------------------------------------------------
            Customer Table
        ---------------------------------------------------- */}

        <DataTable
          headers={[
            'Customer Name',
            'Contact',
            'Source',
            'Insurance Premium',
            'Investments',
            'Loans',
            'KYC',
            'Open 360',
          ]}
          empty={!rows.length}
        >

          {rows.map((customer) => {

            // =================================================
            // CUSTOMER DATA
            // =================================================

            const profile = customer.profile360
            const sourceValue = customerSource(customer)
            const sourceDetail =
              profile?.preferences.referredBy?.trim()
            const kycStatus = customerKycStatus(customer)

            // Legacy holdings are used as a fallback where
            // Customer 360 data is not yet available.
            const legacy =
              legacyCustomerHoldings[customer.id] || []


            // =================================================
            // INSURANCE
            // =================================================

            // Only active policies should contribute to the
            // displayed Insurance Premium.
            const activePolicies =
              (profile?.policies || []).filter((policy) => {
                const status = policy.status.toLowerCase()

                return ![
                  'expired',
                  'lapsed',
                ].includes(status)
              })

            // Add premium amount from all active policies.
            const insurancePremium =
              activePolicies.reduce(
                (total, policy) =>
                  total + (policy.premiumAmount || 0),
                0
              )


            // =================================================
            // INVESTMENTS
            // =================================================

            const investments =
              profile?.investments || []

            // Legacy investment products are used when the
            // newer Customer 360 investment data is unavailable.
            const legacyInvestments =
              legacy.filter((holding) =>
                investmentProductIds.has(
                  holding.productId
                )
              )

            // Prefer Customer 360 investment data.
            // Otherwise, use legacy holdings.
            const investmentCount =
              investments.length ||
              legacyInvestments.length

            const investmentValue =
              investments.length > 0
                ? investments.reduce(
                    (total, investment) =>
                      total +
                      (investment.currentValue || 0),
                    0
                  )
                : legacyInvestments.reduce(
                    (total, investment) =>
                      total +
                      (investment.currentValue || 0),
                    0
                  )


            // =================================================
            // LOANS
            // =================================================

            const loans =
              profile?.loans || []

            const legacyLoans =
              legacy.filter((holding) =>
                loanProductIds.has(
                  holding.productId
                )
              )

            const loanCount =
              loans.length ||
              legacyLoans.length


            // -------------------------------------------------
            // Loan Name / Loan Type
            //
            // First preference:
            // Customer 360 loan type.
            //
            // Second preference:
            // Customer product containing "loan".
            //
            // Loan Protector is intentionally excluded.
            // -------------------------------------------------

            const loanType =
              loans[0]?.loanType ||
              customer.products.find(
                (product) =>
                  /loan/i.test(product) &&
                  !/protector/i.test(product)
              )


            // -------------------------------------------------
            // Loan Amount
            //
            // First preference: Original loan amount
            // Second: Outstanding amount
            // Third: Legacy loan amount
            // -------------------------------------------------

            const loanAmount =
              loans[0]?.originalAmount ||
              loans[0]?.outstandingAmount ||
              legacyLoans[0]?.investedOrCover


            // =================================================
            // CUSTOMER ROW
            // =================================================

            return (
              <tr key={customer.id}>

                {/* ---------------------------------------------
                    Customer Name
                --------------------------------------------- */}

                <td>
                  <button
                    className="tf-link-stack"
                    onClick={() =>
                      onOpen360(customer.id)
                    }
                  >
                    <b>{customer.name}</b>
                    <small>{customer.id}</small>
                  </button>
                </td>


                {/* ---------------------------------------------
                    Contact Details
                --------------------------------------------- */}

                <td>
                  <b>{customer.mobile}</b>

                  <small>
                    {customer.email ||
                      'Email not recorded'}
                  </small>
                </td>


                {/* ---------------------------------------------
                    Customer Source
                --------------------------------------------- */}

                <td>
                  {sourceValue ? (
                    <>
                      <b>{sourceValue}</b>
                      {sourceDetail && (
                        <small>{sourceDetail}</small>
                      )}
                    </>
                  ) : (
                    <span className="tf-customer-none">
                      —
                    </span>
                  )}
                </td>


                {/* ---------------------------------------------
                    Insurance Premium
                --------------------------------------------- */}

                <td>
                  {insurancePremium ? (
                    <b>
                      {money(insurancePremium)}

                      {activePolicies.length > 1
                        ? ' Total Premium'
                        : ''}
                    </b>
                  ) : (
                    <span className="tf-customer-none">
                      —
                    </span>
                  )}
                </td>


                {/* ---------------------------------------------
                    Investments
                --------------------------------------------- */}

                <td>
                  {investmentCount ? (
                    <>
                      <b>
                        {investmentValue
                          ? `${money(
                              investmentValue
                            )} Current Value`
                          : `${investmentCount} ${
                              investmentCount === 1
                                ? 'Product'
                                : 'Products'
                            }`}
                      </b>

                      <small>
                        {investmentCount}{' '}
                        {investmentCount === 1
                          ? 'investment'
                          : 'investments'}
                      </small>
                    </>
                  ) : (
                    <span className="tf-customer-none">
                      No Investments
                    </span>
                  )}
                </td>


                {/* ---------------------------------------------
                    Loans

                    Loan name is shown first.
                    Loan amount is displayed underneath.
                --------------------------------------------- */}

                <td>
                  {loanCount ? (
                    <>
                      <b>
                        {loanType ||
                          `${loanCount} Active ${
                            loanCount === 1
                              ? 'Loan'
                              : 'Loans'
                          }`}
                      </b>

                      <small>
                        {loanAmount
                          ? money(loanAmount)
                          : '—'}
                      </small>
                    </>
                  ) : (
                    <span className="tf-customer-none">
                      No Loans
                    </span>
                  )}
                </td>


                {/* ---------------------------------------------
                    KYC Status
                --------------------------------------------- */}

                <td>
                  <StatusBadge tone={kycTone(kycStatus)}>
                    {kycStatus}
                  </StatusBadge>
                </td>


                {/* ---------------------------------------------
                    Open Customer 360
                --------------------------------------------- */}

                <td>
                  <button
                    className="tf-customer-open"
                    onClick={() =>
                      onOpen360(customer.id)
                    }
                  >
                    Open 360
                  </button>
                </td>

              </tr>
            )
          })}
        </DataTable>
      </Panel>
    </div>
  )
}


function customerSource(customer: FranchiseeCustomer) {
  return customer.profile360?.preferences.source?.trim() || undefined
}


function customerKycStatus(customer: FranchiseeCustomer) {
  const status = customer.profile360?.kyc.status || customer.kyc

  return status === 'Verified' ? 'Complete' : status
}


function customerProducts(customer: FranchiseeCustomer) {
  return [...new Set(customer.products.filter(Boolean))]
}


function kycTone(status: string) {
  if (status === 'Complete') return 'green' as const
  if (status === 'Expired') return 'red' as const
  if (/pending|partial/i.test(status)) return 'amber' as const

  return 'gray' as const
}
