// Centralized mock data for demo scenarios

export const suppliers = [
  {
    id: 'acme-precision',
    name: 'ACME Precision',
    email: 'quotes@acmeprecision.com',
    history: {
      totalOrders: 12,
      onTimeRate: 0.98,
      averageRating: 4.7,
      lastOrderDate: '2023-11-15'
    },
    capabilities: [
      'First Article Inspection included',
      'ITAR compliant',
      'In-house leak testing'
    ]
  },
  {
    id: 'midwest-mfg',
    name: 'Midwest Manufacturing',
    email: 'quotes@midwestmfg.com',
    history: {
      totalOrders: 5,
      onTimeRate: 1.0,
      averageRating: 4.9,
      lastOrderDate: '2023-12-20'
    },
    capabilities: [
      'Fast turnaround',
      'Volume discounts',
      'Flexible payment terms'
    ]
  },
  {
    id: 'protech-cnc',
    name: 'ProTech CNC',
    email: 'quotes@protechcnc.com',
    history: {
      totalOrders: 0,
      onTimeRate: null,
      averageRating: null,
      lastOrderDate: null
    },
    capabilities: [
      'Competitive pricing',
      'ISO 9001:2015 certified',
      'In-house anodizing'
    ]
  },
  {
    id: 'allied-parts',
    name: 'Allied Parts',
    email: 'quotes@alliedparts.com',
    history: {
      totalOrders: 8,
      onTimeRate: 0.95,
      averageRating: 4.5,
      lastOrderDate: '2023-10-08'
    },
    capabilities: [
      'Large capacity',
      'Multi-material expertise'
    ]
  }
]

export const quotes = [
  {
    supplierId: 'acme-precision',
    rfqId: 'RFQ-2024-0847',
    unitPrice: 87.50,
    tooling: 2500,
    leadTime: '7 weeks',
    terms: 'Net 30',
    notes: 'Includes First Article Inspection at no additional cost',
    validUntil: '2025-02-15',
    receivedAt: '2025-01-15T11:20:00Z'
  },
  {
    supplierId: 'midwest-mfg',
    rfqId: 'RFQ-2024-0847',
    unitPrice: 92.00,
    tooling: 1800,
    leadTime: '6.5 weeks',
    terms: '50% deposit, 50% on delivery',
    notes: 'Volume discounts available',
    validUntil: '2025-02-28',
    receivedAt: '2025-01-15T13:45:00Z'
  },
  {
    supplierId: 'protech-cnc',
    rfqId: 'RFQ-2024-0847',
    unitPrice: 79.95,
    tooling: 3200,
    leadTime: '8 weeks',
    terms: 'Net 45',
    notes: 'ISO 9001:2015 certified, First article inspection included',
    validUntil: '2025-03-01',
    receivedAt: '2025-01-16T09:15:00Z'
  }
]

// Email content templates
export const emailTemplates = {
  rfqRequest: (data) => `Hello Procurement Team,

We need to initiate a Request for Quote (RFQ) for a critical component in ${data.projectName || 'Project Titan'}.

**Part Details:**
- Part Name: ${data.partName}
- Part Number: ${data.partNumber || 'N/A'}
- Initial Quantity: ${data.quantity} units
- Annual Volume: ${data.annualVolume || data.quantity * 3} units/year
- Material: ${data.material}

**Requirements:**
- Delivery Date: ${data.deliveryDate || '8 weeks from today'}
- Special Requirement: ${data.specialRequirements || 'Standard requirements'}
- ITAR Compliance: ${data.itarRequired ? 'Domestic suppliers only (US-based manufacturing required)' : 'Not required'}

**Attachments:**
- Engineering drawing (PDF)
- CAD file (STEP format)
- Material specification document

Please coordinate with suppliers and provide quotes by ${data.quoteDeadline || '2 weeks from today'}.

Thank you,
${data.requesterName || 'Engineering Department'}`,

  rfqToSupplier: (data) => `Dear ${data.supplierName} Team,

We are requesting a quote for the following component:

**RFQ Number:** ${data.rfqId}
**Part:** ${data.partName} (${data.partNumber || 'N/A'})
**Quantity:** ${data.quantity} units (initial order), ${data.annualVolume || data.quantity * 3} units/year (forecast)
**Material:** ${data.material} per attached specification
**Delivery:** ${data.deliveryDate || '8 weeks from PO date'}

**Key Requirements:**
- ${data.specialRequirements || 'Per engineering drawings and CAD files attached'}
- ${data.itarRequired ? 'ITAR compliance: US-based manufacturing only' : ''}

**Quote Deadline:** ${data.quoteDeadline || '2 weeks from today'}

Please provide:
- Unit price for ${data.quantity} pcs
- Tooling/NRE costs (if applicable)
- Lead time
- Payment terms
- Quality certifications

Attached files:
- ${data.attachments?.join(', ') || 'Engineering drawings and specifications'}

We look forward to your response.

Best regards,
ProcureFlow Agent
Procurement Department`,

  clarificationEmail: (data) => `Hello Procurement Team,

Thank you for the ${data.rfqId}. We've reviewed the drawings and specifications, and we need clarification on a few items before we can provide an accurate quote:

${data.questions.map((q, i) => `**Question ${i + 1}: ${q.category}**
${q.question}`).join('\n\n')}

Once we have these clarifications, we can provide a detailed quote within 2 business days.

Best regards,
Engineering Team
${data.supplierName}`,

  quoteResponse: (data) => `Dear Procurement Team,

Thank you for the opportunity to quote on ${data.rfqId}.

**Quote Summary:**
- **Unit Price:** $${data.unitPrice.toFixed(2)} per unit (${data.quantity} pcs)
- **Tooling/NRE:** $${data.tooling.toLocaleString()} (one-time)
- **Lead Time:** ${data.leadTime} from PO and approved drawing
- **Payment Terms:** ${data.terms}
- **Minimum Order:** ${data.quantity} units

**Notes:**
${data.notes || 'Standard manufacturing practices apply'}

**Validity:** This quote is valid for 30 days.

We look forward to your business.

Best regards,
Sales Team
${data.supplierName}`
}

