import { LaborCalculationResult } from '../types';

export function calculateAngolaLaborCredits(params: {
  monthlySalary: number;
  yearsOfService: number;
  monthsOfService: number;
  noticeGiven: boolean;
  companySize?: 'Micro/Pequena' | 'Média' | 'Grande';
}): LaborCalculationResult {
  const { monthlySalary, yearsOfService, monthsOfService, noticeGiven } = params;

  // Total seniority years including rounded fraction (fraction >= 6 months counts as 1 year in Angolan customary jurisprudence or proportional)
  const fractionalYear = monthsOfService / 12;
  const totalSeniority = yearsOfService + fractionalYear;

  // Compensation for seniority according to Lei 12/23 (Art. 236.º)
  // Base rule: 1 monthly salary per completed year of service, proportional for remaining months
  const compensationAmount = Math.round(monthlySalary * Math.max(totalSeniority, 1));

  // Notice Period (Art. 208.º e 232.º): If employer failed to give written advance notice (typically 30 to 60 days, default 30 days = 1 monthly salary)
  const noticeAmount = noticeGiven ? 0 : Math.round(monthlySalary * 1.0);

  // Proportional Holidays (22 working days ≈ 1 full monthly salary proportional to months worked this year)
  // Assuming current cycle months worked = monthsOfService % 12 or at least 6 months
  const currentYearMonths = monthsOfService > 0 ? (monthsOfService % 12 || 6) : 6;
  const holidaysProportional = Math.round((monthlySalary / 12) * currentYearMonths);

  // Proportional Holiday Allowance (Subsídio de férias)
  const holidayAllowance = Math.round((monthlySalary / 12) * currentYearMonths);

  // Proportional Christmas Allowance (Subsídio de Natal - 50% do salário nos termos da LGT)
  const christmasAllowance = Math.round(((monthlySalary * 0.5) / 12) * currentYearMonths);

  const grossTotal = compensationAmount + noticeAmount + holidaysProportional + holidayAllowance + christmasAllowance;

  // INSS 3% (Trabalhador) on operational credits (notice + holiday proportions; compensation is typically exempt from INSS under Angolan law)
  const taxableInssBase = noticeAmount + holidaysProportional + holidayAllowance + christmasAllowance;
  const inssDeduction = Math.round(taxableInssBase * 0.03);

  // Estimated IRT (progressive rate approximate for Angolan tax scale)
  // Under Angolan law, legal compensation up to the statutory limit is exempt or taxed at reduced bracket
  const estimatedIrt = Math.round(taxableInssBase > 100000 ? (taxableInssBase - 100000) * 0.13 : 0);

  const netTotal = grossTotal - inssDeduction - estimatedIrt;

  return {
    monthlySalary,
    yearsOfService,
    monthsOfService,
    noticeGiven,
    compensationAmount,
    noticeAmount,
    holidaysProportional,
    holidayAllowance,
    christmasAllowance,
    grossTotal,
    inssDeduction,
    estimatedIrt,
    netTotal,
    legalBasis: 'Lei Geral do Trabalho de Angola n.º 12/23 (Art.º 232.º, 236.º e 208.º)',
  };
}

export function formatAOA(amount: number): string {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    maximumFractionDigits: 0,
  }).format(amount).replace('AOA', 'Kz');
}
