let currentStep = 1;

const taxBrackets = [
  { min: 0,       max: 150000,   rate: 0 },
  { min: 150001,  max: 300000,   rate: 0.05 },
  { min: 300001,  max: 500000,   rate: 0.10 },
  { min: 500001,  max: 750000,   rate: 0.15 },
  { min: 750001,  max: 1000000,  rate: 0.20 },
  { min: 1000001, max: 2000000,  rate: 0.25 },
  { min: 2000001, max: Infinity, rate: 0.30 }
];

function goToStep(step) {
  document.querySelectorAll(".step-content").forEach(el => {
    el.classList.add("d-none");
  });
  document.querySelectorAll(".step-indicator .step").forEach(el => {
    el.classList.remove("active");
  });
  document.getElementById(`step-${step}`).classList.remove("d-none");
  document.querySelectorAll(".step-indicator .step")[step - 1].classList.add("active");
  currentStep = step;
  if (step === 7) {
    calculateTax();
  }
}

function getValue(id) {
  // รับค่าจาก input type="text" แล้วลบ comma
  return parseFloat(document.getElementById(id).value.replace(/,/g, '')) || 0;
}

function calculateTax() {
  // ====== รายได้ (Step 1) ======
  const salary = getValue("salary");
  const bonus = getValue("bonus");
  const otherIncome = getValue("otherIncome");
  const totalIncome = salary + bonus + otherIncome;
  
  // ====== ลดหย่อนส่วนบุคคล/ครอบครัว (Group 1: Step 2) ======
  const fixedPersonalDeduction = 60000;
  const spouseDeduction = document.getElementById("spouseEligible").checked ? 60000 : 0;
  const spouseDisabledDeduction = (document.getElementById("spouseEligible").checked && document.getElementById("spouseDisabled").checked) ? 60000 : 0;
  const pregnancyDeduction = Math.min(getValue("pregnancyDeduction"), 60000);
  
  const legalChildren = parseInt(document.getElementById("legalChildren").value) || 0;
  let legalChildrenDeduction = legalChildren > 0 ? 30000 + ((legalChildren - 1) * 60000) : 0;
  
  const adoptedChildren = parseInt(document.getElementById("adoptedChildren").value) || 0;
  const adoptedChildrenDeduction = Math.min(adoptedChildren, 3) * 30000;
  
  const parentalCount = parseInt(document.getElementById("parentalCount").value) || 0;
  const parentalDeduction = Math.min(parentalCount, 4) * 30000;
  
  const disabilityCount = parseInt(document.getElementById("disabilityCount").value) || 0;
  const disabilityDeduction = disabilityCount * 60000;
  
  const totalPersonalDeduction = fixedPersonalDeduction +
                                 spouseDeduction +
                                 spouseDisabledDeduction +
                                 pregnancyDeduction +
                                 legalChildrenDeduction +
                                 adoptedChildrenDeduction +
                                 parentalDeduction +
                                 disabilityDeduction;
  
  // ====== ลดหย่อนกลุ่มกระตุ้นเศรษฐกิจ (Group 2: Step 3) ======
  const easyEReceipt = Math.min(getValue("easyEReceipt"), 50000);
  const housingInterest = Math.min(getValue("housingInterest"), 100000);
  
  let newHouseRaw = getValue("newHouse");
  if(newHouseRaw > 10000000) { newHouseRaw = 10000000; }
  const newHouseDeduction = Math.min(Math.floor(newHouseRaw / 1000000) * 10000, 100000);
  
  const provincialTour = Math.min(getValue("provincialTour"), 15000);
  const totalEconomicDeduction = easyEReceipt + housingInterest + newHouseDeduction + provincialTour;
  
  // ====== ลดหย่อนภาษีกลุ่มประกัน/เงินออม/การลงทุน (Group 3: Steps 4 & 5) ======
  const socialSecurityDeduction = Math.min(getValue("socialSecurity"), 9000);
  const lifeInsuranceRaw = getValue("lifeInsurance");
  const lifeInsuranceDeduction = Math.min(lifeInsuranceRaw, 100000);
  
  let healthInsuranceSelfRaw = getValue("healthInsuranceSelf");
  let healthInsuranceSelfDeduction = Math.min(healthInsuranceSelfRaw, 25000);
  if (lifeInsuranceDeduction + healthInsuranceSelfDeduction > 100000) {
    healthInsuranceSelfDeduction = Math.max(0, 100000 - lifeInsuranceDeduction);
  }
  
  const healthInsuranceParentsDeduction = Math.min(getValue("healthInsuranceParents"), 15000);
  const spouseInsuranceRaw = getValue("spouseInsurance");
  const spouseInsuranceDeductionFinal = Math.min(spouseInsuranceRaw, 10000);
  const socialEnterpriseInvestmentDeduction = Math.min(getValue("socialEnterpriseInvestment"), 100000);
  
  const thaiESGDeduction = Math.min(getValue("thaiesgFund") * 0.3, 300000);
  const rmfDeduction = Math.min(getValue("rmfFund") * 0.3, 500000);
  const ssfDeduction = Math.min(getValue("ssfFund") * 0.3, 200000);
  const pvdDeduction = Math.min(getValue("pvdFund") * 0.15, 500000);
  const savingsDeduction = Math.min(getValue("savingsFund"), 30000);
  const pensionInsuranceDeduction = Math.min(getValue("pensionInsurance") * 0.15, 200000);
  
  let retirementGroupDeduction = rmfDeduction + ssfDeduction + pvdDeduction + savingsDeduction + pensionInsuranceDeduction;
  if (retirementGroupDeduction > 500000) {
    retirementGroupDeduction = 500000;
  }
  
  const totalInsuranceInvestmentDeduction = socialSecurityDeduction +
                                              lifeInsuranceDeduction +
                                              healthInsuranceSelfDeduction +
                                              healthInsuranceParentsDeduction +
                                              spouseInsuranceDeductionFinal +
                                              socialEnterpriseInvestmentDeduction +
                                              thaiESGDeduction +
                                              retirementGroupDeduction;
  
  // ====== ลดหย่อนกลุ่มเงินบริจาค (Group 4: Step 6) ======
  const totalDeductionsExcludingDonation = totalPersonalDeduction + totalEconomicDeduction + totalInsuranceInvestmentDeduction;
  const netIncomeExcludingDonation = totalIncome - totalDeductionsExcludingDonation;
  const donationCap = netIncomeExcludingDonation * 0.1;
  
  const generalDonation = getValue("generalDonation");
  const educationDonation = getValue("educationDonation");
  let donationNonPolitical = generalDonation + 2 * educationDonation;
  let donationNonPoliticalEffective = Math.min(donationNonPolitical, donationCap);
  
  const politicalDonation = Math.min(getValue("politicalDonation"), 10000);
  const totalDonationDeduction = donationNonPoliticalEffective + politicalDonation;
  
  // ====== รวมค่าลดหย่อนทั้งหมด ======
  const totalDeduction = totalPersonalDeduction + totalEconomicDeduction + totalInsuranceInvestmentDeduction + totalDonationDeduction;
  
  // ====== คำนวณรายได้สุทธิและภาษี ======
  let netIncome = totalIncome - totalDeduction;
  if (netIncome < 0) netIncome = 0;
  
  let tax = 0;
  let breakdown = [];
  for (let bracket of taxBrackets) {
    if (netIncome > bracket.min) {
      let taxableAmount = Math.min(netIncome, bracket.max) - bracket.min;
      let taxForBracket = Math.round(taxableAmount * bracket.rate);
      tax += taxForBracket;
      
      let bgColor = "";
      if (bracket.rate >= 0.15) {
        bgColor = "#f8d7da";
      } else if (bracket.rate === 0.10) {
        bgColor = "#fff3cd";
      }
      
      breakdown.push({
        range: `${bracket.min.toLocaleString()} - ${bracket.max === Infinity ? "ขึ้นไป" : bracket.max.toLocaleString()}`,
        rate: `${(bracket.rate * 100).toFixed(0)}%`,
        tax: taxForBracket.toLocaleString(),
        bgColor: bgColor
      });
    }
  }
  
  // ====== แสดงผลลัพธ์ใน Step 7 ======
  document.getElementById("totalIncomeDisplay").innerText = totalIncome.toLocaleString();
  document.getElementById("totalDeductionDisplay").innerText = totalDeduction.toLocaleString();
  document.getElementById("taxDisplay").innerText = tax.toLocaleString();
  
  const tableBody = document.getElementById("taxTableBody");
  tableBody.innerHTML = "";
  breakdown.forEach(row => {
    tableBody.innerHTML += `<tr style="background-color: ${row.bgColor}">
                              <td>${row.range}</td>
                              <td>${row.rate}</td>
                              <td>${row.tax}</td>
                            </tr>`;
  });
  
  // แสดงรายละเอียดลดหย่อนในแต่ละกลุ่ม
  const deductionBreakdownHTML = `
    <table class="table">
      <thead>
        <tr>
          <th>หมวดลดหย่อน</th>
          <th>จำนวนเงิน (บาท)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>ส่วนบุคคล/ครอบครัว</td>
          <td>${totalPersonalDeduction.toLocaleString()}</td>
        </tr>
        <tr>
          <td>กระตุ้นเศรษฐกิจ</td>
          <td>${totalEconomicDeduction.toLocaleString()}</td>
        </tr>
        <tr>
          <td>ประกัน/เงินออม/การลงทุน</td>
          <td>${totalInsuranceInvestmentDeduction.toLocaleString()}</td>
        </tr>
        <tr>
          <td>เงินบริจาค</td>
          <td>${totalDonationDeduction.toLocaleString()}</td>
        </tr>
        <tr>
          <th>รวมลดหย่อน</th>
          <th>${totalDeduction.toLocaleString()}</th>
        </tr>
      </tbody>
    </table>
  `;
  document.getElementById("deductionBreakdown").innerHTML = deductionBreakdownHTML;
}

function formatNumberInput(input) {
  // ลบ comma ก่อน แล้วตรวจสอบว่าเป็นตัวเลขหรือไม่
  let value = input.value.replace(/,/g, '');
  if (!isNaN(value) && value !== '') {
    input.value = parseFloat(value).toLocaleString();
  }
}
  
// ใช้ event onblur เพื่อทำการ format หลังจากผู้ใช้พิมพ์เสร็จแล้ว
document.querySelectorAll('input.format-number').forEach(input => {
  input.addEventListener('blur', () => formatNumberInput(input));
});
  
function toggleCollapse(id) {
  const el = document.getElementById(id);
  el.classList.toggle("d-none");
}
  
document.getElementById("taxForm").addEventListener("submit", function(e) {
  e.preventDefault();
  alert("ข้อมูลถูกบันทึกแล้ว (ตัวอย่าง)");
});
