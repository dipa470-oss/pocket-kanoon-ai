export type FieldDef = {
  name: string;
  label: string;
  type: "text" | "textarea" | "date" | "email" | "tel";
  required?: boolean;
  placeholder?: string;
};

export type ComplaintType = {
  id: string;
  label: string;
  description: string;
  recipient: string;
  fields: FieldDef[];
};

const COMMON_FIELDS: FieldDef[] = [
  { name: "full_name", label: "Your Full Name", type: "text", required: true },
  { name: "address", label: "Your Address", type: "textarea", required: true },
  { name: "phone", label: "Contact Number", type: "tel", required: true },
  { name: "email", label: "Email", type: "email" },
];

export const COMPLAINT_TYPES: ComplaintType[] = [
  {
    id: "police",
    label: "Police Complaint",
    description: "General complaint to the SHO of the local police station.",
    recipient: "Station House Officer (SHO)",
    fields: [
      ...COMMON_FIELDS,
      { name: "police_station", label: "Police Station Name", type: "text", required: true },
      { name: "district", label: "District", type: "text", required: true },
      { name: "state", label: "State", type: "text", required: true },
      { name: "incident_date", label: "Date of Incident", type: "date", required: true },
      { name: "incident_location", label: "Place of Incident", type: "text", required: true },
      { name: "accused", label: "Accused Person(s) / Description", type: "textarea" },
      { name: "incident_details", label: "What Happened (in detail)", type: "textarea", required: true },
      { name: "witnesses", label: "Witnesses (if any)", type: "textarea" },
      { name: "evidence", label: "Evidence Available", type: "textarea" },
    ],
  },
  {
    id: "cyber",
    label: "Cyber Crime Complaint",
    description: "Online fraud, hacking, phishing, social media harassment.",
    recipient: "Cyber Crime Cell / cybercrime.gov.in",
    fields: [
      ...COMMON_FIELDS,
      { name: "incident_type", label: "Type of Cyber Crime", type: "text", placeholder: "e.g. UPI fraud, phishing, hacking", required: true },
      { name: "incident_date", label: "Date & Time of Incident", type: "text", required: true },
      { name: "platform", label: "Platform / App / Website", type: "text" },
      { name: "amount_lost", label: "Amount Lost (INR, if any)", type: "text" },
      { name: "suspect_details", label: "Suspect Details (UPI ID, phone, URL, etc.)", type: "textarea" },
      { name: "incident_details", label: "Detailed Description", type: "textarea", required: true },
      { name: "actions_taken", label: "Actions Already Taken (e.g. bank informed)", type: "textarea" },
    ],
  },
  {
    id: "consumer",
    label: "Consumer Complaint",
    description: "Defective product, deficient service — Consumer Protection Act 2019.",
    recipient: "District / State Consumer Disputes Redressal Commission",
    fields: [
      ...COMMON_FIELDS,
      { name: "seller_name", label: "Seller / Service Provider Name", type: "text", required: true },
      { name: "seller_address", label: "Seller / Service Provider Address", type: "textarea", required: true },
      { name: "product_service", label: "Product or Service", type: "text", required: true },
      { name: "purchase_date", label: "Date of Purchase", type: "date", required: true },
      { name: "amount", label: "Amount Paid (INR)", type: "text", required: true },
      { name: "issue", label: "Issue / Deficiency", type: "textarea", required: true },
      { name: "relief", label: "Relief Sought (refund, replacement, compensation)", type: "textarea", required: true },
    ],
  },
  {
    id: "rbi",
    label: "RBI Complaint",
    description: "Banking issues unresolved by your bank — Banking Ombudsman.",
    recipient: "Banking Ombudsman, Reserve Bank of India",
    fields: [
      ...COMMON_FIELDS,
      { name: "bank_name", label: "Bank Name & Branch", type: "text", required: true },
      { name: "account_no", label: "Account Number (last 4 digits)", type: "text" },
      { name: "complaint_no", label: "Bank Complaint Reference No.", type: "text" },
      { name: "complaint_date", label: "Date of Bank Complaint", type: "date" },
      { name: "issue", label: "Nature of Grievance", type: "textarea", required: true },
      { name: "relief", label: "Relief Sought", type: "textarea", required: true },
    ],
  },
  {
    id: "bank",
    label: "Bank Complaint",
    description: "Formal grievance to your bank's nodal officer.",
    recipient: "Branch Manager / Nodal Officer",
    fields: [
      ...COMMON_FIELDS,
      { name: "bank_name", label: "Bank Name & Branch", type: "text", required: true },
      { name: "account_no", label: "Account Number", type: "text", required: true },
      { name: "issue_date", label: "Date of Issue", type: "date" },
      { name: "issue", label: "Nature of Issue", type: "textarea", required: true },
      { name: "relief", label: "Relief Sought", type: "textarea", required: true },
    ],
  },
  {
    id: "loan_harassment",
    label: "Loan App Harassment Complaint",
    description: "Illegal recovery agents / loan-app abuse.",
    recipient: "Cyber Crime Cell / RBI / Local Police",
    fields: [
      ...COMMON_FIELDS,
      { name: "app_name", label: "Loan App / Lender Name", type: "text", required: true },
      { name: "loan_amount", label: "Loan Amount", type: "text" },
      { name: "harassment_type", label: "Type of Harassment", type: "textarea", required: true },
      { name: "agent_details", label: "Recovery Agent Phone Numbers / Names", type: "textarea" },
      { name: "incident_details", label: "What Happened", type: "textarea", required: true },
    ],
  },
  {
    id: "women_protection",
    label: "Women Protection Complaint",
    description: "Harassment, stalking, domestic violence, workplace abuse.",
    recipient: "National Commission for Women / Local Police / Mahila Thana",
    fields: [
      ...COMMON_FIELDS,
      { name: "accused", label: "Accused Person(s)", type: "textarea", required: true },
      { name: "relationship", label: "Relationship to Accused", type: "text" },
      { name: "incident_location", label: "Place of Incident", type: "text", required: true },
      { name: "incident_date", label: "When did it occur?", type: "text", required: true },
      { name: "incident_details", label: "Detailed Description", type: "textarea", required: true },
      { name: "witnesses", label: "Witnesses", type: "textarea" },
    ],
  },
  {
    id: "employer",
    label: "Employer Complaint",
    description: "Unpaid salary, wrongful termination, workplace harassment.",
    recipient: "Labour Commissioner / Internal Complaints Committee",
    fields: [
      ...COMMON_FIELDS,
      { name: "employer_name", label: "Employer / Company Name", type: "text", required: true },
      { name: "employer_address", label: "Employer Address", type: "textarea", required: true },
      { name: "designation", label: "Your Designation", type: "text" },
      { name: "joining_date", label: "Date of Joining", type: "date" },
      { name: "issue", label: "Nature of Issue", type: "textarea", required: true },
      { name: "amount_due", label: "Amount Due (if any)", type: "text" },
      { name: "relief", label: "Relief Sought", type: "textarea", required: true },
    ],
  },
  {
    id: "insurance",
    label: "Insurance Complaint",
    description: "Claim rejection or delay — IRDAI / Insurance Ombudsman.",
    recipient: "Insurance Ombudsman / IRDAI",
    fields: [
      ...COMMON_FIELDS,
      { name: "insurer", label: "Insurance Company", type: "text", required: true },
      { name: "policy_no", label: "Policy Number", type: "text", required: true },
      { name: "claim_no", label: "Claim Number", type: "text" },
      { name: "claim_amount", label: "Claim Amount", type: "text" },
      { name: "issue", label: "Issue with Claim", type: "textarea", required: true },
      { name: "relief", label: "Relief Sought", type: "textarea", required: true },
    ],
  },
  {
    id: "property",
    label: "Property Complaint",
    description: "Builder delay, illegal possession, RERA grievance.",
    recipient: "RERA Authority / Civil Court",
    fields: [
      ...COMMON_FIELDS,
      { name: "builder_name", label: "Builder / Opposite Party", type: "text", required: true },
      { name: "project_name", label: "Project / Property Name", type: "text", required: true },
      { name: "agreement_date", label: "Agreement Date", type: "date" },
      { name: "amount_paid", label: "Amount Paid (INR)", type: "text" },
      { name: "issue", label: "Nature of Dispute", type: "textarea", required: true },
      { name: "relief", label: "Relief Sought", type: "textarea", required: true },
    ],
  },
];

export const FIR_FIELDS: FieldDef[] = [
  { name: "full_name", label: "Complainant Full Name", type: "text", required: true },
  { name: "father_name", label: "Father's / Husband's Name", type: "text" },
  { name: "age", label: "Age", type: "text" },
  { name: "occupation", label: "Occupation", type: "text" },
  { name: "address", label: "Address", type: "textarea", required: true },
  { name: "phone", label: "Phone", type: "tel", required: true },
  { name: "police_station", label: "Police Station", type: "text", required: true },
  { name: "state", label: "State", type: "text", required: true },
  { name: "district", label: "District", type: "text", required: true },
  { name: "incident_date", label: "Date of Incident", type: "date", required: true },
  { name: "incident_time", label: "Time of Incident", type: "text" },
  { name: "incident_location", label: "Place of Incident", type: "textarea", required: true },
  { name: "accused", label: "Accused Person(s) Details", type: "textarea" },
  { name: "incident_details", label: "Detailed Account of the Incident", type: "textarea", required: true },
  { name: "stolen_property", label: "Property Stolen / Lost (if any)", type: "textarea" },
  { name: "witnesses", label: "Witnesses", type: "textarea" },
  { name: "delay_reason", label: "Reason for Delay in Reporting (if any)", type: "textarea" },
];

export function complaintTypeById(id: string): ComplaintType | undefined {
  return COMPLAINT_TYPES.find((c) => c.id === id);
}
