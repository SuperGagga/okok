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
  // ซ่อนทุกส่วนของฟอร์ม
  document.querySelectorAll(".step-content").forEach((el) => {
    el.classList.add("d-none");
  });
  // ลบคลาส active ใน step-indicator ทั้งหมด
  document.querySelectorAll(".step-indicator .step").forEach((el) => {
    el.classList.remove("active");
  });
  
  // แสดงเฉพาะส่วนที่เลือก
  document.getElementById(`step-${step}`).classList.remove("d-none");
  document.querySelectorAll(".step-indicator .step")[step - 1].classList.add("active");
  
  currentStep = step;
  
  // เมื่อเข้าสู่ Step 3 ให้คำนวณภาษีและแสดงตาราง
  if (step === 3) {
    calculateTax();
  }
}

function calculateTax() {
    // รับค่ารายได้
    const salary = parseFloat(document.getElementById("salary").value.replace(/,/g, '')) || 0;
    const bonus = parseFloat(document.getElementById("bonus").value.replace(/,/g, '')) || 0;
    const otherIncome = parseFloat(document.getElementById("otherIncome").value.replace(/,/g, '')) || 0;
    const totalIncome = salary + bonus + otherIncome;
    
    // รับค่าลดหย่อน
    const personalDeduction = parseFloat(document.getElementById("personalDeduction").value.replace(/,/g, '')) || 0;
    const socialInsurance = parseFloat(document.getElementById("socialInsurance").value.replace(/,/g, '')) || 0;
    const otherDeduction = parseFloat(document.getElementById("otherDeduction").value.replace(/,/g, '')) || 0;
    const totalDeduction = personalDeduction + socialInsurance + otherDeduction;
    
    // คำนวณรายได้สุทธิ
    let netIncome = totalIncome - totalDeduction;
    if (netIncome < 0) netIncome = 0;
    
    // คำนวณภาษีโดยใช้แต่ละขั้น
    let tax = 0;
    let breakdown = [];
    for (let bracket of taxBrackets) {
      if (netIncome > bracket.min) {
        let taxableAmount = Math.min(netIncome, bracket.max) - bracket.min;
        let taxForBracket = Math.round(taxableAmount * bracket.rate); // ใช้ Math.round()
        tax += taxForBracket;
        breakdown.push({
          range: `${bracket.min.toLocaleString()} - ${bracket.max === Infinity ? "ขึ้นไป" : bracket.max.toLocaleString()}`,
          rate: `${(bracket.rate * 100).toFixed(0)}%`,
          tax: taxForBracket.toLocaleString()
        });
      }
    }
    
    // อัปเดตส่วนสรุปใน Step 3
    document.getElementById("totalIncomeDisplay").innerText = totalIncome.toLocaleString();
    document.getElementById("totalDeductionDisplay").innerText = totalDeduction.toLocaleString();
    document.getElementById("taxDisplay").innerText = tax.toLocaleString();
    
    // อัปเดตตารางแสดงรายละเอียดภาษี
    const tableBody = document.getElementById("taxTableBody");
    tableBody.innerHTML = "";
    breakdown.forEach(row => {
      const tr = `<tr>
                    <td>${row.range}</td>
                    <td>${row.rate}</td>
                    <td>${row.tax}</td>
                  </tr>`;
      tableBody.innerHTML += tr;
    });
  }

function formatNumberInput(input) {
    let value = input.value.replace(/,/g, ''); // ลบเครื่องหมายจุลภาคทั้งหมดก่อน
    if (!isNaN(value) && value !== '') {
      input.value = parseFloat(value).toLocaleString();
    }
  }
  
  document.querySelectorAll('input[type="text"]').forEach(input => {
    input.addEventListener('input', () => formatNumberInput(input));
  });

document.getElementById("taxForm").addEventListener("submit", function(e) {
  e.preventDefault();
  alert("ข้อมูลถูกบันทึกแล้ว (ตัวอย่าง)");
});
