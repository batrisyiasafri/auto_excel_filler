//MULTIPLE DATA ENTRY
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("dataForm");
  const addAnother = document.getElementById("addAnother");
  const msgPopup = document.getElementById("msg-popup");
  const uploadCsv = document.getElementById("uploadCsv");
  const sampleCsv = document.getElementById("sampleCsv");

  form.addEventListener("input", previewData);

  //auto focus on the next field after entering a valid value n adding a enter key to add new entries
  form.addEventListener("keydown", e => {
    if(e.key === "Enter" && e.target.tagName === "INPUT"){
      e.preventDefault();
      addAnother.click();
    }
  });

  //sort the form
  Sortable.create(form, {
    handle: '.drag-handle',
    draggable: '.entry',
    animation: 150, 
    onEnd: () => {
      previewData();
    }  
  });

  //preview initial data
  previewData();

  //clear preview on form reset
  form.addEventListener("reset", () => {
    const preview = document.getElementById("preview");
    preview.innerHTML = "<p>No data to preview</p>";
  });

  //preview form data
  function previewData() {
    const preview = document.getElementById("preview");
    const entries = document.querySelectorAll(".entry");

    if (entries.length === 0) {
      preview.innerHTML = "<p>No data to preview</p>";
      return;
    }

    let html = `<table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Address</th>
        </tr>
      </thead>
      <tbody>`;

    entries.forEach(entry => {
      const name = entry.querySelector('input[name="name"]').value.trim();
      const email = entry.querySelector('input[name="email"]').value.trim();
      const phone = entry.querySelector('input[name="phone"]').value.trim();
      const address = entry.querySelector('input[name="address"]').value.trim();

      html += `<tr>
        <td>${name || "&nbsp;"}</td>
        <td>${email || "&nbsp;"}</td>
        <td>${phone || "&nbsp;"}</td>
        <td>${address || "&nbsp;"}</td>
      </tr>`;
    });

    html += "</tbody></table>";
    preview.innerHTML = html;
  }

  //validate the form
  function validateInput(input){
    const errorMsg = input.nextElementSibling; //the small tag
    let valid = true;

    if(!input.checkValidity()){
      errorMsg.textContent = input.validationMessage;
      errorMsg.style.display = "block";
      input.classList.add("invalid");
      valid = false;
    } else {
      errorMsg.textContent = "";
      errorMsg.style.display = "none";
      input.classList.remove("invalid");
    }
    return valid;
  }

  //validate the input
  document.querySelectorAll("input").forEach(input => {
    input.addEventListener("input", () => {
      validateInput(input);
    });
  });

  //validate email
  function validateEmail(email){
    const allowedDomain = ['.com', '.edu', '.gov', '.bn', '.gov.bn', '.edu.bn']; //only allowed domains

    //extract domain from email
    const domainMatch = email.match(/\.[a-z]{2,}$/i);
    if(!domainMatch) return false;

    const emailDomain = email.split("@")[1]?.toLowerCase();
    if(!emailDomain) return false;

    return allowedDomain.some(domain => emailDomain.endsWith(domain));

    // const domain = domainMatch[0].toLowerCase();
    // return validateEmail.includes(domain);
  }

  //email input
  document.querySelectorAll('input[name="email"]').forEach(input => {
    input.addEventListener("input", e => {
      const val = e.target.value .trim();

      if(val && !validateEmail(val)){
        e.target.setCustomValidity("Email must end with a valid domain. e.g. .com, .edu, .gov, .bn");
      } else {
        e.target.setCustomValidity(""); //clear error
      }

      validateInput(e.target); //called from existing valid feedcack
    });
  });

  //validate if duplicate email
  function duplicateEmail(){
    const emails = [...document.querySelectorAll('input[name="email"]')]
    .map(input => input.value.trim().toLowerCase())
    .filter(email => email !== "");

    const seen = new Set();
    for (const email of emails){
      if(seen.has(email)){
        showFlash(`Duplicate email found: ${email}`);
        return true;
      }
      seen.add(email);
    }
    return false;
  }

  // function dabelCekCSV(value) {
  //   return /^[=+\-@]/.test(value) ? `'${value}`: value;
  // }

  //validate phhone numbr
  document.querySelectorAll('input[name="phone"]').forEach(input => {
    input.addEventListener("input", e => {
      let val = e.target.value.replace(/\D/g, ""); //only number allowed, no aplhanbet
      if(!val.startsWith("673")){
        val = "673" + val //.replace(/^673/, ""); //force ONLY 673 AT START
      }
      if(val.length > 10) val = val.slice(0,10); //maxlength 10 digit
      e.target.value = val;
      validateInput(e.target);
    });
  });

  //export to pdf
  document.getElementById("exportPdf").addEventListener("click", () => {
    const entries = document.querySelectorAll(".entry");
    //if form is emptry, cannot export pdf
    const isFormEmpty = [...entries]. every(entry => {
      const name = entry.querySelector('input[name="name"]').value.trim();
      const email = entry.querySelector('input[name="email"]').value.trim();
      const phone = entry.querySelector('input[name="phone"]').value.trim();
      const address = entry.querySelector('input[name="address"]').value.trim();
      return !name && !email && !phone && !address;
    });

    if(isFormEmpty){
      showFlash("No data to export"); //show msg that its empty
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const data = [];
    entries.forEach(entry => {
      const name = entry.querySelector('input[name="name"]').value.trim();
      const email = entry.querySelector('input[name="email"]').value.trim();
      const phone = entry.querySelector('input[name="phone"]').value.trim();
      const address = entry.querySelector('input[name="address"]').value.trim();
      data.push([name, email, phone, address]);

    });

    // auto table in pdf output
    doc.text("Auto-Fill Data Export", 14, 15);
    doc.autoTable({
      head: [["Name", "Email", "Phone", "Address"]],
      body: data,
      startY: 20,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [52,152,219] },
    });

    doc.save("autofill_data.pdf");
    showFlash("PDF downloaded successfully");

  });

  //upload CSV file
  uploadCsv.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        const data = results.data;

        const headers = Object.keys(data[0] || {});
        const requiredHeaders = ["name", "email", "phone", "address"];
        const missing = requiredHeaders.filter(h => !headers.includes(h));

        if (missing.length > 0) {
          showFlash("Missing headers: " + missing.join(", "));
          return;
        }

        //clear existing entries except the first
        const entries = form.querySelectorAll(".entry");
        entries.forEach((entry, index) => {
          if (index === 0) {
            entry.querySelectorAll("input").forEach(input => (input.value = ""));
          } else {
            entry.remove();
          }
        });

        //fill in entries
        data.forEach((row, index) => {
          let entry;
          if (index === 0) {
            entry = form.querySelector(".entry"); 
            const oldRemoveBtn = entry.querySelector(".removeBtn"); //remove existing rmv bttn and reattach fresh one
            if(oldRemoveBtn) oldRemoveBtn.remove();
            confirmDelete(entry); //ensure rmv bttn is working
          } else {
            const newEntry = form.querySelector(".entry").cloneNode(true);
            newEntry.querySelectorAll("input").forEach(input => (input.value = ""));
            form.insertBefore(newEntry, form.querySelector(".button-row"));
            confirmDelete(newEntry);
            entry = newEntry;
          }

          entry.querySelector('input[name="name"]').value = row.name?.trim() || "";
          entry.querySelector('input[name="email"]').value = row.email?.trim() || "";
          entry.querySelector('input[name="phone"]').value = row.phone?.trim() || "";
          entry.querySelector('input[name="address"]').value = row.address?.trim() || "";
        });

        previewData();
        checkRemoveBtn();
        showFlash("CSV file uploaded successfully");
      },
      error: function (err) {
        console.error("CSV parsing error: ", err);
        showFlash("Error reading CSV file");
      }
    });
  });

  //download sample CSV
  sampleCsv.addEventListener("click", () => {
    const sample = `name,email,phone,address
Ali,ali@example.com,6738211609,Tutong
Siti,siti@example.com,6738272300,Temburong`;

    const blob = new Blob([sample], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "sample.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
  });

  //show popup message
  function showFlash(msg) {
    msgPopup.innerHTML = `<div class="msg">${msg}</div>`;
    msgPopup.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => (msgPopup.textContent = ""), 4000);
  }

  //confirm delete for entry
  function confirmDelete(entry) {

    //remove existing rmv bttn to avoid duplicate
    entry.querySelector(".removeBtn")?.remove();
    entry.querySelector(".drag-handle")?.remove();

    //drag handle
    const dragHandle = document.createElement("div");
    dragHandle.className = "drag-handle";
    dragHandle.textContent = "☰";
    dragHandle.style.cursor = "grab";
    dragHandle.style.marginRight = "10px";
    dragHandle.style.userSelect = "none";
    entry.prepend(dragHandle);

    //rmv bttn
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "Remove";
    removeBtn.classList.add("removeBtn");

    removeBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to delete this entry?")) {
        entry.remove();
        previewData();
        checkRemoveBtn();
      }
    });

    entry.appendChild(removeBtn);
  }

  //check and disable remove buttons when only one entry
  function checkRemoveBtn() {
    const entries = document.querySelectorAll(".entry");
    entries.forEach(entry => {
      const btn = entry.querySelector(".removeBtn");
      if (btn) {
        btn.disabled = entries.length === 1;
      }
    });
  }

  //add another entry
  addAnother.addEventListener("click", () => {
    const firstEntry = form.querySelector(".entry");
    const newEntry = firstEntry.cloneNode(true);

    //clear input values n invalid styles
    newEntry.querySelectorAll("input").forEach(input => {
      input.value = "";
      input.classList.remove("invalid");
    });

    //clear error msg
    newEntry.querySelectorAll(".error-msg").forEach(msg => {
      msg.textContent = "";
      msg.style.display = "none";
    });

    //reattach validation listenr
    newEntry.querySelectorAll("input").forEach(input => {
      input.addEventListener("input", () => {
        validateInput(input);
      });
    });

    //reattach email domain validation
    newEntry.querySelector('input[name="email"]').addEventListener("input", e => {
      const val = e.target.value.trim();
      if(val && !validateEmail(val)){
        e.target.setCustomValidity("Email must end with a valid domain. e.g. .com, .edu, .gov, .bn");   
      } else {
        e.target.setCustomValidity("");
      }
      validateInput(e.target);
    });

    //rettach phone number formatting
    newEntry.querySelector('input[name="phone"]').addEventListener("input", e => {
      let val = e.target.value.replace(/\D/g, "");
      if (!val.startsWith("673")){
        val = "673" + val;
      }
      if(val.length > 10) val = val.slice(0,10);
      e.target.value = val;
      validateInput(e.target);
    });

    //insert new entry b4 the add another button (button row)
    form.insertBefore(newEntry, form.querySelector(".button-row"));

    //reattach rmv bttn
    confirmDelete(newEntry);

    //update preview
    previewData();
    checkRemoveBtn();

  });

  //attach remove button to first entry on load
  const firstEntry = form.querySelector(".entry");
  confirmDelete(firstEntry);
  checkRemoveBtn();

  //submit form
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if(duplicateEmail()) return;

    const loading = document.getElementById("loading");
    loading.style.display = "block";

    const submitBtn = form.querySelector('input[type="submit"]');
    submitBtn.disabled = true;

    const formData = new FormData(form);

    fetch("/generate", {
      method: "POST",
      body: formData,
    })
      .then(response => {
        if (!response.ok) throw new Error("Download failed");
        return response.blob();
      })
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "autofill_output.xlsx";
        document.body.appendChild(a);
        a.click();
        a.remove();

        const allEntries = document.querySelectorAll(".entry");
        allEntries.forEach((entry, index) => {
          if (index === 0) {
            entry.querySelectorAll("input").forEach(input => (input.value = ""));
          } else {
            entry.remove();
          }
        });

        previewData();
        checkRemoveBtn();
        showFlash("Excel file downloaded successfully.");
      })
      .catch(err => {
        console.error(err);
        showFlash("Failed to download file.");
      })
      .finally(() => {
        submitBtn.disabled = false;
        loading.style.display = "none";
      });
  });
});
