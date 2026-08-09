// ======================================================
// DOCUMENT MANAGEMENT
// ======================================================

// Demo data
let documents = [
  {
    id: 1,
    name: "Annual Academic Calendar 2026",
    file: "Annual_Academic_Calendar_2026.pdf",
    privacy: ["Parents", "Principal", "Teacher", "Admin"],
  },
  {
    id: 2,
    name: "Student Admission Form",
    file: "Student_Admission_Form.docx",
    privacy: ["Parents", "Admin"],
  },
  {
    id: 3,
    name: "School Examination Routine - 2026",
    file: "Examination_Routine_2026.pdf",
    privacy: ["Parents", "Principal", "Teacher"],
  },
  {
    id: 4,
    name: "Teacher Attendance Report",
    file: "Teacher_Attendance_Report.xlsx",
    privacy: ["Principal", "Admin"],
  },
  {
    id: 5,
    name: "Student Result Sheet - Class 8",
    file: "Student_Result_Class_8.xlsx",
    privacy: ["Parents", "Principal", "Teacher"],
  },
  {
    id: 6,
    name: "School Holiday Notice",
    file: "School_Holiday_Notice.docx",
    privacy: ["Parents", "Teacher", "Admin", "Print"],
  },
  {
    id: 7,
    name: "Teacher Meeting Minutes",
    file: "Teacher_Meeting_Minutes.docx",
    privacy: ["Principal", "Teacher", "Admin"],
  },
];

// Current editing document ID
let editingId = null;

// Maximum file size = 10 MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed file extensions
const allowedExtensions = ["pdf", "doc", "docx", "xlsx"];

// ======================================================
// DOM ELEMENTS
// ======================================================

const documentForm = document.getElementById("documentForm");

const documentName = document.getElementById("documentName");

const documentFile = document.getElementById("documentFile");

const submitBtn = document.getElementById("submitBtn");

const resetBtn = document.getElementById("resetBtn");

const formTitle = document.getElementById("formTitle");

const documentTableBody = document.getElementById("documentTableBody");

const documentCount = document.getElementById("documentCount");

const selectedFile = document.getElementById("selectedFile");

const privacyDropdown = document.getElementById("privacyDropdown");

const privacyHeader = document.getElementById("privacyHeader");

const privacyOptions = document.getElementById("privacyOptions");

const privacyPlaceholder = document.getElementById("privacyPlaceholder");

const selectedPrivacy = document.getElementById("selectedPrivacy");

const notification = document.getElementById("notification");

// ======================================================
// INITIAL LOAD
// ======================================================

renderDocuments();

// ======================================================
// PRIVACY DROPDOWN
// ======================================================

privacyHeader.addEventListener("click", function (event) {
  event.stopPropagation();

  privacyOptions.classList.toggle("active");
});

// Close dropdown when clicking outside
document.addEventListener("click", function (event) {
  if (!privacyDropdown.contains(event.target)) {
    privacyOptions.classList.remove("active");
  }
});

// ======================================================
// PRIVACY CHECKBOXES
// ======================================================

const privacyCheckboxes = document.querySelectorAll(
  '.checkbox-option input[type="checkbox"]',
);

const allPrivacyCheckbox = document.querySelector(
  '.checkbox-option input[value="All"]',
);

// ======================================================
// PRIVACY CHECKBOX CHANGE
// ======================================================

privacyCheckboxes.forEach(function (checkbox) {
  checkbox.addEventListener("change", function () {
    // ==============================================
    // If "All" is selected/unselected
    // ==============================================

    if (checkbox.value === "All") {
      privacyCheckboxes.forEach(function (item) {
        item.checked = checkbox.checked;
      });
    }

    // ==============================================
    // If an individual role is changed
    // ==============================================
    else {
      const individualRoles = Array.from(privacyCheckboxes).filter(
        function (item) {
          return item.value !== "All";
        },
      );

      // Check whether every individual role
      // has been selected
      const allSelected = individualRoles.every(function (item) {
        return item.checked;
      });

      // Automatically update "All"
      allPrivacyCheckbox.checked = allSelected;
    }

    updatePrivacyDisplay();
  });
});

// ======================================================
// UPDATE PRIVACY DISPLAY
// ======================================================

function updatePrivacyDisplay() {
  const selectedRoles = getSelectedPrivacy();

  // Nothing selected
  if (selectedRoles.length === 0) {
    privacyPlaceholder.textContent = "Select privacy roles";

    selectedPrivacy.innerHTML = "";

    return;
  }

  // All roles selected
  if (selectedRoles.length === 5) {
    privacyPlaceholder.textContent = "All roles selected";
  }

  // Some roles selected
  else {
    privacyPlaceholder.textContent = selectedRoles.length + " role(s) selected";
  }

  // Display selected roles
  selectedPrivacy.innerHTML = "";

  selectedRoles.forEach(function (role) {
    const tag = document.createElement("span");

    tag.className = "privacy-tag";

    tag.textContent = role;

    selectedPrivacy.appendChild(tag);
  });
}

// ======================================================
// GET SELECTED PRIVACY
// ======================================================

function getSelectedPrivacy() {
  const selected = [];

  privacyCheckboxes.forEach(function (checkbox) {
    // Do NOT store "All".
    // "All" is only a convenience checkbox.
    if (checkbox.checked && checkbox.value !== "All") {
      selected.push(checkbox.value);
    }
  });

  return selected;
}

// ======================================================
// FILE SELECTION
// ======================================================

documentFile.addEventListener("change", function () {
  const file = documentFile.files[0];

  if (!file) {
    selectedFile.textContent = "";

    return;
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    showNotification("File size cannot exceed 10 MB.", "error");

    documentFile.value = "";

    selectedFile.textContent = "";

    return;
  }

  // Check extension
  const extension = file.name.split(".").pop().toLowerCase();

  if (!allowedExtensions.includes(extension)) {
    showNotification("Unsupported file format.", "error");

    documentFile.value = "";

    selectedFile.textContent = "";

    return;
  }

  selectedFile.textContent =
    "Selected: " + file.name + " (" + formatFileSize(file.size) + ")";
});

// ======================================================
// FORM SUBMIT
// ======================================================

documentForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = documentName.value.trim();

  const privacy = getSelectedPrivacy();

  // Validate document name
  if (!name) {
    showNotification("Please enter the document name.", "error");

    documentName.focus();

    return;
  }

  // Validate privacy
  if (privacy.length === 0) {
    showNotification("Please select at least one privacy role.", "error");

    return;
  }

  // ==================================================
  // EDIT MODE
  // ==================================================

  if (editingId !== null) {
    const documentIndex = documents.findIndex((doc) => doc.id === editingId);

    if (documentIndex !== -1) {
      documents[documentIndex].name = name;

      documents[documentIndex].privacy = privacy;

      // If a new file was selected
      if (documentFile.files.length > 0) {
        const file = documentFile.files[0];

        documents[documentIndex].file = file.name;
      }
    }

    showNotification("Document updated successfully.", "success");

    resetForm();

    renderDocuments();

    return;
  }

  // ==================================================
  // SAVE MODE
  // ==================================================

  if (documentFile.files.length === 0) {
    showNotification("Please attach a document.", "error");

    return;
  }

  const file = documentFile.files[0];

  const newDocument = {
    id: Date.now(),

    name: name,

    file: file.name,

    privacy: privacy,
  };

  documents.unshift(newDocument);

  showNotification("Document saved successfully.", "success");

  resetForm();

  renderDocuments();
});

// ======================================================
// RESET BUTTON
// ======================================================

resetBtn.addEventListener("click", function () {
  resetForm();
});

// ======================================================
// RESET FORM
// ======================================================

function resetForm() {
  documentForm.reset();

  editingId = null;

  formTitle.textContent = "Add Document";

  submitBtn.textContent = "Save";

  documentFile.value = "";

  selectedFile.textContent = "";

  // Clear privacy
  privacyCheckboxes.forEach(function (checkbox) {
    checkbox.checked = false;
  });

  updatePrivacyDisplay();

  privacyOptions.classList.remove("active");
}

// ======================================================
// RENDER DOCUMENT LIST
// ======================================================

function renderDocuments() {
  documentTableBody.innerHTML = "";

  documents.forEach(function (doc, index) {
    const row = document.createElement("tr");

    // SL
    const slCell = document.createElement("td");

    slCell.textContent = index + 1;

    // Document Name
    const nameCell = document.createElement("td");

    nameCell.textContent = doc.name;

    // Attachment
    const attachmentCell = document.createElement("td");

    const fileWrapper = document.createElement("div");

    fileWrapper.className = "file-name";

    const fileIcon = document.createElement("span");

    fileIcon.className = "file-icon";

    fileIcon.textContent = getFileIcon(doc.file);

    const fileName = document.createElement("span");

    fileName.className = "attachment-name";

    fileName.textContent = doc.file;

    fileWrapper.appendChild(fileIcon);

    fileWrapper.appendChild(fileName);

    attachmentCell.appendChild(fileWrapper);

    // Privacy
    const privacyCell = document.createElement("td");

    const privacyList = document.createElement("div");

    privacyList.className = "privacy-list";

    doc.privacy.forEach(function (role) {
      const badge = document.createElement("span");

      badge.className = "privacy-badge";

      badge.textContent = role;

      privacyList.appendChild(badge);
    });

    privacyCell.appendChild(privacyList);

    // Action
    const actionCell = document.createElement("td");

    const actionButtons = document.createElement("div");

    actionButtons.className = "action-buttons";

    // Edit button
    const editButton = document.createElement("button");

    editButton.className = "action-btn edit-btn";

    editButton.title = "Update";

    editButton.innerHTML = "✎";

    editButton.addEventListener("click", function () {
      editDocument(doc.id);
    });

    // Delete button
    const deleteButton = document.createElement("button");

    deleteButton.className = "action-btn delete-btn";

    deleteButton.title = "Delete";

    deleteButton.innerHTML = "🗑";

    deleteButton.addEventListener("click", function () {
      deleteDocument(doc.id);
    });

    actionButtons.appendChild(editButton);

    actionButtons.appendChild(deleteButton);

    actionCell.appendChild(actionButtons);

    // Add cells to row
    row.appendChild(slCell);

    row.appendChild(nameCell);

    row.appendChild(attachmentCell);

    row.appendChild(privacyCell);

    row.appendChild(actionCell);

    documentTableBody.appendChild(row);
  });

  // Update count
  documentCount.textContent =
    documents.length + (documents.length === 1 ? " document" : " documents");
}

// ======================================================
// EDIT DOCUMENT
// ======================================================

function editDocument(id) {
  const documentData = documents.find((doc) => doc.id === id);

  if (!documentData) {
    return;
  }

  editingId = id;

  // Set document name
  documentName.value = documentData.name;

  // Set privacy
  privacyCheckboxes.forEach(function (checkbox) {
    checkbox.checked = documentData.privacy.includes(checkbox.value);
  });

  updatePrivacyDisplay();

  // File is intentionally not populated.
  // Browsers do not allow setting a file input
  // programmatically for security reasons.

  documentFile.value = "";

  selectedFile.textContent =
    "Current file: " +
    documentData.file +
    " (select a new file only if you want to replace it)";

  // Change form to edit mode
  formTitle.textContent = "Edit Document";

  submitBtn.textContent = "Update";

  // Scroll to form
  document.querySelector(".form-card").scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

// ======================================================
// DELETE DOCUMENT
// ======================================================

function deleteDocument(id) {
  const documentData = documents.find((doc) => doc.id === id);

  if (!documentData) {
    return;
  }

  const confirmDelete = confirm(
    'Are you sure you want to delete "' + documentData.name + '"?',
  );

  if (!confirmDelete) {
    return;
  }

  documents = documents.filter((doc) => doc.id !== id);

  // If currently editing this document
  if (editingId === id) {
    resetForm();
  }

  renderDocuments();

  showNotification("Document deleted successfully.", "success");
}

// ======================================================
// FILE ICON
// ======================================================

function getFileIcon(fileName) {
  const extension = fileName.split(".").pop().toLowerCase();

  switch (extension) {
    case "pdf":
      return "📕";

    case "doc":
    case "docx":
      return "📘";

    case "xlsx":
      return "📗";

    default:
      return "📄";
  }
}

// ======================================================
// FORMAT FILE SIZE
// ======================================================

function formatFileSize(bytes) {
  if (bytes === 0) {
    return "0 Bytes";
  }

  const units = ["Bytes", "KB", "MB", "GB"];

  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + " " + units[i];
}

// ======================================================
// NOTIFICATION
// ======================================================

function showNotification(message, type = "success") {
  notification.textContent = message;

  notification.className = "notification show " + type;

  setTimeout(function () {
    notification.classList.remove("show");
  }, 3000);
}
