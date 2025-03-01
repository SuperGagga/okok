// ฟังก์ชันคำนวณเบี้ยปรับโดยใช้สูตร compound penalty: 
// penalty = taxDue * (1 + 0.015)^n  โดย n คือจำนวนเดือนที่ชำระล่าช้า
// นอกจากนี้ เราจะสร้างตารางที่แสดงรายละเอียดสำหรับแต่ละเดือน

function calculatePenalty() {
    const taxDue = parseFloat(document.getElementById("taxDue").value.replace(/,/g, '')) || 0;
    const delayMonths = parseInt(document.getElementById("delayMonths").value) || 0;
    
    if (taxDue <= 0) {
      alert("กรุณากรอกภาษีที่ต้องชำระให้ถูกต้อง");
      return;
    }
    if (delayMonths < 0) {
      alert("กรุณากรอกจำนวนเดือนที่ชำระล่าช้าให้ถูกต้อง");
      return;
    }
    
    // สร้างตารางรายละเอียดสำหรับแต่ละเดือน
    let tableHTML = `
      <table class="table table-bordered">
        <thead>
          <tr>
            <th>เดือนที่ชำระล่าช้า</th>
            <th>เบี้ยปรับ (บาท)</th>
            <th>คำอธิบาย</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    for (let n = 0; n <= delayMonths; n++) {
      // คำนวณเบี้ยปรับแบบทบดอกทบต้น
      let penalty = taxDue * Math.pow(1 + 0.015, n);
      penalty = parseFloat(penalty.toFixed(2));
      
      // คำอธิบาย: ระบุว่าในเดือนนั้นจะถูกปรับเพิ่ม 1.5% จากภาษีที่ต้องชำระ (คำนวณแบบทบดอกทบ)
      let description = `ชำระล่าช้า ${n} เดือน: คิด 1.5% ต่อเดือน (ทบดอกทบ)`;
      tableHTML += `
        <tr>
          <td>${n}</td>
          <td>${penalty.toLocaleString()}</td>
          <td>${description}</td>
        </tr>
      `;
    }
    
    tableHTML += `
        </tbody>
      </table>
    `;
    
    // แสดงผลใน element ที่มี id "penaltyTableContainer"
    document.getElementById("penaltyTableContainer").innerHTML = tableHTML;
    
    // แสดง Card ผลลัพธ์
    document.getElementById("resultCard").classList.remove("d-none");
  }
  
  document.querySelectorAll('input.format-number').forEach(input => {
    input.addEventListener('blur', () => formatNumberInput(input));
  });
  
  function formatNumberInput(input) {
    let value = input.value.replace(/,/g, '');
    if (!isNaN(value) && value !== '') {
      input.value = parseFloat(value).toLocaleString();
    }
  }
  