-- ============================================================
-- Berberis Capital — Seed Data
-- Run AFTER schema.sql in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- INTERVIEW QUESTIONS
-- ============================================================

insert into public.interview_questions (category, difficulty, question_text, model_answer, hints) values

-- Accounting
('accounting', 'graduate', 'Walk me through the three financial statements.',
 'The income statement shows revenue, expenses and net profit over a period. The balance sheet is a snapshot of assets, liabilities and equity at a point in time. The cash flow statement reconciles net income to actual cash movements, split into operating, investing and financing activities. They are linked: net income flows from P&L into equity on the balance sheet and into operating cash flow on the cash flow statement.',
 'Start with income statement, then balance sheet, then cash flow. Show the linkages.'),

('accounting', 'graduate', 'If depreciation increases by £10m, what happens to the three statements?',
 'Income statement: EBIT falls by £10m; assuming 25% tax, net income falls by £7.5m. Balance sheet: PP&E falls by £10m; retained earnings fall by £7.5m; deferred tax liability falls by £2.5m (or tax payable falls). Cash flow statement: net income falls by £7.5m but depreciation is added back (non-cash), so OCF increases by £2.5m (the tax shield).',
 'Think about: IS → tax → NI. Then BS equity and PP&E. Then CFS add-back of non-cash charge.'),

('accounting', 'analyst', 'What is working capital and why does it matter in a DCF?',
 'Working capital = current assets minus current liabilities (typically: receivables + inventory – payables). In a DCF, increases in working capital consume cash (e.g. growing receivables means cash not yet collected), so they are subtracted from free cash flow. Decreases in working capital release cash. It matters because a fast-growing business may appear profitable but be cash-hungry due to rising working capital.',
 'WC = CA - CL. Link it to FCF: increases in WC = cash outflow.'),

-- DCF
('dcf', 'graduate', 'What is a DCF and what are its key components?',
 'A DCF values a business by discounting its future free cash flows back to present value using a discount rate (WACC). Key components: (1) Free cash flow projections (typically 5-10 years); (2) Terminal value (either Gordon Growth or exit multiple); (3) WACC as the discount rate; (4) Sum of PV of FCFs plus PV of terminal value, less net debt, to get equity value.',
 'Structure: FCFs → discount at WACC → terminal value → enterprise value → equity bridge.'),

('dcf', 'analyst', 'How do you calculate WACC, and what drives each component?',
 'WACC = (E/V × Ke) + (D/V × Kd × (1-t)) where E = equity value, D = debt value, V = E+D, Ke = cost of equity (CAPM: Rf + β × ERP), Kd = cost of debt, t = tax rate. Ke is driven by risk-free rate, beta (operating leverage, financial leverage, business risk) and equity risk premium. Kd is driven by credit risk and prevailing interest rates. Higher leverage increases WACC through higher beta and potentially higher Kd.',
 'CAPM for Ke. Remember debt tax shield. More debt → higher beta → higher Ke, but Kd is cheaper than Ke pre-tax.'),

('dcf', 'analyst', 'What is terminal value and what are the two methods for calculating it?',
 'Terminal value captures value beyond the explicit forecast period and typically represents 70-80%+ of total DCF value. (1) Gordon Growth Model (perpetuity growth): TV = FCF(t+1) / (WACC – g), where g is a long-run growth rate (typically GDP-level, 2-3%). (2) Exit Multiple: TV = EBITDA(t) × EV/EBITDA multiple. The exit multiple approach anchors to market comparables; the GGM is more theoretically pure. Always sense-check both.',
 'GGM vs exit multiple. GGM: FCF/(WACC-g). Exit: EBITDA × multiple. Which is more conservative?'),

-- LBO
('lbo', 'graduate', 'Walk me through an LBO model.',
 'An LBO involves acquiring a company using significant debt financing. Steps: (1) Set purchase price and financing structure (typically 50-70% debt, rest equity); (2) Project operating performance (revenue, EBITDA, FCF); (3) Model debt amortisation and interest; (4) Determine exit value at a given multiple in 3-5 years; (5) Calculate equity proceeds to sponsors; (6) Calculate returns (IRR and MOIC). Returns are driven by EBITDA growth, multiple expansion, and debt paydown.',
 'Entry → operating projections → debt paydown → exit → equity proceeds → IRR.'),

('lbo', 'analyst', 'What are the key value drivers of returns in an LBO?',
 'Three main drivers: (1) EBITDA growth — revenue growth and margin expansion increase the exit EBITDA base; (2) Multiple expansion — buying at 8x and exiting at 10x creates value even with flat earnings; (3) Debt paydown (financial engineering) — using FCF to pay down debt increases equity value. A rule of thumb: 1x EBITDA growth → ~10-15% IRR contribution. In practice, PE firms target 20%+ IRR; financial engineering alone rarely delivers this.',
 'Growth + multiple expansion + leverage. Which matters most? Think about sensitivity analysis.'),

-- Behavioural
('behavioural', 'graduate', 'Why investment banking?',
 'A strong answer covers three things: genuine interest in deal-making/corporate finance; specific evidence of that interest (a transaction you followed, course, internship, or work experience); and why this firm specifically (their league table ranking, deal flow, team, or culture based on your research). Avoid vague answers about "fast-paced environments" or "high salaries" — anchors on intellectually interesting work and long-term career development are more credible.',
 'Three-part answer: passion → evidence → firm-specific. Be specific and honest.'),

('behavioural', 'uni_spring', 'Tell me about yourself.',
 'Use a 60-90 second structured narrative: (1) where you are now (degree, year, university); (2) relevant experience (internships, societies, finance involvement); (3) why you are interested in this role/firm specifically. Keep it concise — this is an invitation to set up the conversation, not a life story. End on your interest in the role so the interviewer naturally follows up.',
 'Structure: present → past experience → future aspiration. Practice until it flows naturally.');


-- ============================================================
-- FLASHCARD DECKS + CARDS
-- ============================================================

insert into public.flashcard_decks (name, description, category, is_premium) values
('Accounting Fundamentals', 'Core accounting concepts for finance interviews', 'accounting', false),
('Valuation Concepts', 'DCF, comparables and precedent transactions', 'valuation', true);

-- Accounting deck cards (insert after getting deck IDs)
do $$
declare
  accounting_deck_id uuid;
  valuation_deck_id uuid;
begin
  select id into accounting_deck_id from public.flashcard_decks where name = 'Accounting Fundamentals' limit 1;
  select id into valuation_deck_id from public.flashcard_decks where name = 'Valuation Concepts' limit 1;

  insert into public.flashcards (deck_id, front, back, difficulty) values

  -- Accounting deck
  (accounting_deck_id, 'What is EBITDA?',
   'Earnings Before Interest, Taxes, Depreciation and Amortisation. A proxy for operating cash flow from the core business, stripping out capital structure, tax jurisdiction and non-cash charges. Widely used as a valuation base (EV/EBITDA) because it is comparable across companies with different leverage.',
   2),

  (accounting_deck_id, 'What is the difference between EBIT and EBITDA?',
   'EBIT = Earnings Before Interest and Taxes (includes D&A as a cost). EBITDA adds back D&A, treating them as non-cash accounting charges. EBITDA is a better proxy for cash generation; EBIT better reflects the income impact of capital expenditure over time via depreciation.',
   2),

  (accounting_deck_id, 'How does a £10m increase in depreciation affect free cash flow?',
   'Free cash flow increases by £7.5m (assuming 25% tax rate). Depreciation is a non-cash charge: it reduces EBIT and therefore net income by £10m × (1 – 25%) = £7.5m, but it is added back in the cash flow statement as a non-cash item. Net effect: FCF improves by the tax shield = £10m × 25% = £2.5m.',
   3),

  (accounting_deck_id, 'What is working capital?',
   'Working capital = Current Assets – Current Liabilities. More narrowly in finance: Receivables + Inventory – Payables (excluding cash and debt). An increase in working capital is a use of cash; a decrease is a source. Fast-growing businesses often have high working capital needs.',
   2),

  (accounting_deck_id, 'What is the difference between cash basis and accrual accounting?',
   'Cash basis: revenue and expenses recorded when cash changes hands. Accrual basis: revenue recorded when earned (regardless of payment) and expenses when incurred. GAAP/IFRS require accrual accounting. This creates differences between net income and cash flow — hence why the cash flow statement is needed.',
   2),

  (accounting_deck_id, 'What is goodwill on a balance sheet?',
   'Goodwill arises in acquisitions when the purchase price exceeds the fair value of identifiable net assets. It represents intangible value: brand, customer relationships, workforce, synergies. Under IFRS and US GAAP, goodwill is not amortised but is tested annually for impairment. An impairment charge reduces goodwill and hits the income statement.',
   3),

  (accounting_deck_id, 'Walk me through the linkages between the three financial statements.',
   'Net income from the income statement flows into retained earnings on the balance sheet (equity section) and into operating activities on the cash flow statement. Depreciation on the IS is added back on the CFS (non-cash). CapEx on the CFS reduces PP&E on the balance sheet. Debt issuance on the CFS increases debt on the balance sheet. Ending cash on the CFS = cash on the balance sheet.',
   3),

  -- Valuation deck
  (valuation_deck_id, 'What are the three main valuation methodologies?',
   '(1) DCF — intrinsic value based on discounted future cash flows. (2) Trading Comparables (CCA) — value relative to publicly traded peers using multiples (EV/EBITDA, P/E). (3) Precedent Transactions (CTA) — value relative to prior M&A deals for comparable companies, typically at a premium to trading comps due to control premium.',
   1),

  (valuation_deck_id, 'What is enterprise value vs equity value?',
   'Enterprise Value (EV) = Equity Value + Net Debt (Debt – Cash) + Minority Interest – Associates. EV is the value of the whole business regardless of capital structure. Equity Value is the residual value to shareholders. EV multiples (EV/EBITDA, EV/EBIT) are capital structure-neutral; equity multiples (P/E) are not.',
   2),

  (valuation_deck_id, 'What is the equity value bridge from enterprise value?',
   'Equity Value = EV – Gross Debt + Cash + Associates – Minority Interest ± other items (pension deficits, contingent liabilities, etc.). You subtract debt (owed to creditors) and add back cash (owned by shareholders). Associates are partially-owned entities not consolidated; minority interest is the external portion of consolidated subsidiaries.',
   3),

  (valuation_deck_id, 'Why is EV/EBITDA preferred over P/E in many situations?',
   'EV/EBITDA is capital structure-neutral: it compares companies with different leverage without distortion. P/E is affected by interest expense and tax rates, making cross-company comparison harder. EV/EBITDA also adds back non-cash D&A, making it more comparable across companies with different asset bases or accounting policies.',
   2);

end $$;


-- ============================================================
-- LATERAL MOVES (sample data)
-- ============================================================

insert into public.lateral_moves (person_name, from_firm, from_role, to_firm, to_role, division, seniority, date_moved, is_verified) values
('Alex Chen', 'Goldman Sachs', 'Analyst', 'Blackstone', 'Associate', 'Private Equity', 'Analyst', '2025-09-01', true),
('Sarah Mills', 'JP Morgan', 'Analyst', 'KKR', 'Associate', 'Credit', 'Analyst', '2025-09-01', true),
('James Park', 'Morgan Stanley', 'Associate', 'Citadel', 'VP', 'Equities', 'Associate', '2025-10-01', false),
('Emily Watson', 'Barclays', 'VP', 'Deutsche Bank', 'Director', 'Investment Banking', 'VP', '2025-11-01', true),
('Marcus Thompson', 'UBS', 'Analyst', 'Apollo', 'Associate', 'Private Equity', 'Analyst', '2025-08-01', true),
('Priya Sharma', 'HSBC', 'Associate', 'Lazard', 'VP', 'M&A', 'Associate', '2025-12-01', false),
('Oliver Reed', 'Rothschild', 'Analyst', 'Bain Capital', 'Associate', 'Private Equity', 'Analyst', '2026-01-01', true),
('Charlotte Davis', 'Evercore', 'VP', 'Centerview', 'Director', 'Restructuring', 'VP', '2026-01-01', false),
('Daniel Kim', 'BlackRock', 'Associate', 'Ares Management', 'VP', 'Asset Management', 'Associate', '2025-10-01', true),
('Isabella Brown', 'Macquarie', 'Analyst', 'Brookfield', 'Associate', 'Infrastructure', 'Analyst', '2025-11-01', true);


-- ============================================================
-- FOUNDING CODES (120 codes — batch 1: first 20 as examples)
-- Run the full list before beta launch
-- ============================================================

insert into public.founding_codes (code) values
('BERBERIS-001'), ('BERBERIS-002'), ('BERBERIS-003'), ('BERBERIS-004'), ('BERBERIS-005'),
('BERBERIS-006'), ('BERBERIS-007'), ('BERBERIS-008'), ('BERBERIS-009'), ('BERBERIS-010'),
('BERBERIS-011'), ('BERBERIS-012'), ('BERBERIS-013'), ('BERBERIS-014'), ('BERBERIS-015'),
('BERBERIS-016'), ('BERBERIS-017'), ('BERBERIS-018'), ('BERBERIS-019'), ('BERBERIS-020')
on conflict do nothing;
