// State
let originalData = [];
let filteredData = [];
let columns = [];

// DOM Elements
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const fileNameDisplay = document.getElementById('file-name');
const workspace = document.getElementById('workspace');
const tableHead = document.querySelector('#data-table thead');
const tableBody = document.querySelector('#data-table tbody');
const emptyState = document.getElementById('empty-state');
const totalRowsEl = document.getElementById('total-rows');
const filteredRowsEl = document.getElementById('filtered-rows');

// Filters
const searchGlobal = document.getElementById('search-global');
const emailFilter = document.getElementById('email-filter');
const columnSelect = document.getElementById('column-select');
const columnFilterValue = document.getElementById('column-filter-value');
const resetBtn = document.getElementById('reset-filters');
const downloadBtn = document.getElementById('download-btn');

// --- Event Listeners ---

// Drag & Drop
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => dropArea.classList.add('drag-active'), false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => dropArea.classList.remove('drag-active'), false);
});

dropArea.addEventListener('drop', handleDrop, false);
fileInput.addEventListener('change', handleFiles, false);

// Filter Inputs
searchGlobal.addEventListener('input', applyFilters);
emailFilter.addEventListener('input', applyFilters);
columnSelect.addEventListener('change', handleColumnSelectChange);
columnFilterValue.addEventListener('input', applyFilters);
resetBtn.addEventListener('click', resetFilters);
downloadBtn.addEventListener('click', downloadExcel);

// --- Functions ---

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles({ target: { files: files } });
}

function handleFiles(e) {
    const file = e.target.files[0];
    if (!file) return;

    fileNameDisplay.textContent = `Processing: ${file.name}`;
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Assume first sheet is key
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Parse to JSON
            const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            if (json.length === 0) {
                showToast("File appears empty!", "error");
                return;
            }

            processData(json);
            
            // UI Transition
            workspace.style.display = "grid";
            dropArea.style.display = "none";
            showToast("File uploaded successfully!");

        } catch (err) {
            console.error(err);
            showToast("Error processing file. Please try a valid Excel/CSV.", "error");
            fileNameDisplay.textContent = "Error uploading file.";
        }
    };
    
    reader.readAsArrayBuffer(file);
}

function processData(rawData) {
    // Extract headers (first row)
    const headers = rawData[0];
    columns = headers;
    
    // Extract data rows (skip first row)
    // Map array of values to object with header keys for easier filtering
    const dataRows = rawData.slice(1).map(row => {
        let obj = {};
        headers.forEach((header, index) => {
            obj[header] = row[index] || ""; // Handle empty cells
        });
        return obj;
    });

    originalData = dataRows;
    filteredData = [...originalData];

    populateColumnSelect(headers);
    renderTable();
    updateStats();
}

function populateColumnSelect(headers) {
    columnSelect.innerHTML = '<option value="">Select Column...</option>';
    headers.forEach(header => {
        const option = document.createElement('option');
        option.value = header;
        option.textContent = header;
        columnSelect.appendChild(option);
    });
}

function handleColumnSelectChange() {
    if (columnSelect.value) {
        columnFilterValue.disabled = false;
        columnFilterValue.placeholder = `Filter by ${columnSelect.value}...`;
    } else {
        columnFilterValue.disabled = true;
        columnFilterValue.value = "";
        columnFilterValue.placeholder = "Value...";
        applyFilters(); // Clear the specific column filter immediately
    }
}

function applyFilters() {
    const globalTerm = searchGlobal.value.toLowerCase();
    const emailTerm = emailFilter.value.toLowerCase();
    const specificColTerm = columnFilterValue.value.toLowerCase();
    const specificCol = columnSelect.value;

    filteredData = originalData.filter(row => {
        // Global Search
        const values = Object.values(row).join(" ").toLowerCase();
        const matchesGlobal = values.includes(globalTerm);
        
        // Email Filter
        // Heuristic: Check all columns that look like email OR specifically check columns named 'email'
        // Ideally we check all values for now since user wants "filter by email" explicitly
        let matchesEmail = true;
        if (emailTerm) {
            // Find if any value in the row contains the email term AND looks like an email part
            // Or just simple contains for now
            matchesEmail = Object.values(row).some(val => 
                String(val).toLowerCase().includes(emailTerm)
            );
        }

        // Specific Column Filter
        let matchesSpecific = true;
        if (specificCol && specificColTerm) {
            const cellValue = String(row[specificCol]).toLowerCase();
            matchesSpecific = cellValue.includes(specificColTerm);
        }

        return matchesGlobal && matchesEmail && matchesSpecific;
    });

    renderTable();
    updateStats();
}

function resetFilters() {
    searchGlobal.value = "";
    emailFilter.value = "";
    columnSelect.value = "";
    columnFilterValue.value = "";
    columnFilterValue.disabled = true;
    
    applyFilters();
    showToast("Filters reset.");
}

function renderTable() {
    // Clear existing
    tableHead.innerHTML = "";
    tableBody.innerHTML = "";

    if (filteredData.length === 0) {
        emptyState.style.display = 'block';
        return;
    } else {
        emptyState.style.display = 'none';
    }

    // Headers
    const trHead = document.createElement('tr');
    columns.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col;
        trHead.appendChild(th);
    });
    tableHead.appendChild(trHead);

    // Body (Limit to first 100 to avoid freezing DOM on massive files)
    const RENDER_LIMIT = 100;
    const subset = filteredData.slice(0, RENDER_LIMIT);

    subset.forEach(row => {
        const tr = document.createElement('tr');
        columns.forEach(col => {
            const td = document.createElement('td');
            td.textContent = row[col];
            tr.appendChild(td);
        });
        tableBody.appendChild(tr);
    });

    if (filteredData.length > RENDER_LIMIT) {
        const infoRow = document.createElement('tr');
        const infoTd = document.createElement('td');
        infoTd.colSpan = columns.length;
        infoTd.style.textAlign = 'center';
        infoTd.style.color = '#6b7280';
        infoTd.textContent = `... and ${filteredData.length - RENDER_LIMIT} more rows. Download to see all.`;
        infoRow.appendChild(infoTd);
        tableBody.appendChild(infoRow);
    }
}

function updateStats() {
    totalRowsEl.textContent = originalData.length.toLocaleString();
    filteredRowsEl.textContent = filteredData.length.toLocaleString();
}

function downloadExcel() {
    if (filteredData.length === 0) {
        showToast("No data to download.", "error");
        return;
    }

    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Filtered Data");
    
    // Generate filename with timestamp
    const date = new Date().toISOString().slice(0,10);
    XLSX.writeFile(wb, `Filtered_Data_${date}.xlsx`);
    
    showToast("Download started!");
}

function showToast(message, type = "success") {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    
    const icon = type === 'success' ? '<i class="ph ph-check-circle"></i>' : '<i class="ph ph-warning-circle"></i>';
    
    toast.innerHTML = `${icon} <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
