// State
let originalData = [];
let filteredData = [];
let columns = [];
let sortConfig = { column: null, direction: 'asc' };

// Theme Management
const themeToggle = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

// Initialize theme from localStorage or system preference
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    } else if (prefersDark) {
        htmlElement.setAttribute('data-theme', 'dark');
        updateThemeIcon('dark');
    }
}

function updateThemeIcon(theme) {
    if (theme === 'dark') {
        themeToggle.innerHTML = '<i class="ph ph-sun"></i>';
        themeToggle.title = 'Switch to light mode';
    } else {
        themeToggle.innerHTML = '<i class="ph ph-moon"></i>';
        themeToggle.title = 'Switch to dark mode';
    }
}

themeToggle.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
    
    showToast(`Switched to ${newTheme} mode`);
});

// Initialize theme on page load
initializeTheme();

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
const regexToggle = document.getElementById('regex-toggle');
const caseSensitiveToggle = document.getElementById('case-sensitive-toggle');
const exportCsvBtn = document.getElementById('export-csv-btn');
const exportJsonBtn = document.getElementById('export-json-btn');
const shortcutsModal = document.getElementById('shortcuts-modal');
const closeShortcutsBtn = document.getElementById('close-shortcuts');

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
regexToggle.addEventListener('change', applyFilters);
caseSensitiveToggle.addEventListener('change', applyFilters);
exportCsvBtn.addEventListener('click', exportCsv);
exportJsonBtn.addEventListener('click', exportJson);

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key.toLowerCase()) {
            case 'f':
                e.preventDefault();
                searchGlobal.focus();
                break;
            case 'e':
                e.preventDefault();
                if (e.shiftKey) {
                    exportCsv();
                } else {
                    downloadExcel();
                }
                break;
            case 'r':
                e.preventDefault();
                resetFilters();
                break;
            case 'k':
                e.preventDefault();
                toggleShortcutsModal();
                break;
            case 'd':
                e.preventDefault();
                themeToggle.click();
                break;
        }
    }
});

closeShortcutsBtn.addEventListener('click', toggleShortcutsModal);
shortcutsModal.addEventListener('click', (e) => {
    if (e.target === shortcutsModal) toggleShortcutsModal();
});

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
        updateColumnStatistics(columnSelect.value);
    } else {
        columnFilterValue.disabled = true;
        columnFilterValue.value = "";
        columnFilterValue.placeholder = "Value...";
        document.getElementById('column-stats').style.display = 'none';
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
        
        // Add sort indicator
        let sortClass = '';
        if (sortConfig.column === col) {
            sortClass = sortConfig.direction === 'asc' ? 'sort-asc' : 'sort-desc';
        }
        th.className = sortClass;
        
        // Create header content with sort indicator
        const headerContent = document.createElement('div');
        headerContent.style.display = 'flex';
        headerContent.style.alignItems = 'center';
        
        const text = document.createTextNode(col);
        headerContent.appendChild(text);
        
        const indicator = document.createElement('span');
        indicator.className = 'sort-indicator';
        headerContent.appendChild(indicator);
        
        th.appendChild(headerContent);
        th.addEventListener('click', () => sortColumn(col));
        th.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            updateColumnStatistics(col);
        });
        
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

/* PWA Install Prompt (mobile) */
let deferredPrompt = null;
const INSTALL_SHOWN_KEY = 'pwaInstallPromptShown';

function isMobile() {
    return /android|iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isIos() {
    const ua = navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(ua) && !window.MSStream;
}

const installModal = document.getElementById('install-modal');
const installConfirmBtn = document.getElementById('install-confirm-btn');
const installLaterBtn = document.getElementById('install-later-btn');
const installCancelBtn = document.getElementById('install-cancel-btn');

function showInstallModal() {
    if (!installModal) return;
    if (!isMobile()) return;
    if (localStorage.getItem(INSTALL_SHOWN_KEY)) return;
    localStorage.setItem(INSTALL_SHOWN_KEY, '1');

    const iosEl = installModal.querySelector('.ios-instructions');
    const andEl = installModal.querySelector('.android-instructions');

    if (isIos()) {
        if (iosEl) iosEl.style.display = 'block';
        if (andEl) andEl.style.display = 'none';
    } else {
        if (iosEl) iosEl.style.display = 'none';
        if (andEl) andEl.style.display = 'block';
    }

    installModal.classList.add('show');
    installModal.style.display = 'flex';
    installModal.setAttribute('aria-hidden', 'false');
}

function hideInstallModal() {
    if (!installModal) return;
    installModal.classList.remove('show');
    installModal.style.display = 'none';
    installModal.setAttribute('aria-hidden', 'true');
}

// Handle native install prompt for supported browsers (Chrome/Android)
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (isMobile()) showInstallModal();
});

window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    showToast('App installed successfully!');
    localStorage.setItem('pwaInstalled', '1');
    hideInstallModal();
});

// Buttons
if (installConfirmBtn) {
    installConfirmBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const choice = await deferredPrompt.userChoice;
            if (choice && choice.outcome === 'accepted') {
                showToast('Thanks for installing!');
            } else {
                showToast('Install dismissed');
            }
            deferredPrompt = null;
            hideInstallModal();
        } else if (isIos()) {
            showToast('Tap Share → Add to Home Screen in Safari');
        } else {
            showToast('Install not available');
            hideInstallModal();
        }
    });
}

if (installLaterBtn) installLaterBtn.addEventListener('click', hideInstallModal);
if (installCancelBtn) installCancelBtn.addEventListener('click', hideInstallModal);

// Show iOS install hint on initial mobile visits (if not shown already)
if (isIos() && isMobile() && !localStorage.getItem(INSTALL_SHOWN_KEY)) {
    setTimeout(showInstallModal, 1200);
}

// Column Sorting
function sortColumn(columnName) {
    if (sortConfig.column === columnName) {
        sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    } else {
        sortConfig.column = columnName;
        sortConfig.direction = 'asc';
    }

    filteredData.sort((a, b) => {
        const aVal = String(a[columnName] || '').toLowerCase();
        const bVal = String(b[columnName] || '').toLowerCase();

        // Try numeric comparison first
        const aNum = parseFloat(aVal);
        const bNum = parseFloat(bVal);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
            return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
        }

        return sortConfig.direction === 'asc' 
            ? aVal.localeCompare(bVal) 
            : bVal.localeCompare(aVal);
    });

    renderTable();
}

// Advanced Filtering
function applyFilters() {
    const globalTerm = searchGlobal.value.toLowerCase();
    const emailTerm = emailFilter.value.toLowerCase();
    const specificColTerm = columnFilterValue.value.toLowerCase();
    const specificCol = columnSelect.value;
    const useRegex = regexToggle.checked;
    const caseSensitive = caseSensitiveToggle.checked;

    filteredData = originalData.filter(row => {
        // Global Search with regex support
        let matchesGlobal = true;
        if (globalTerm) {
            try {
                const flags = caseSensitive ? 'g' : 'gi';
                const regex = new RegExp(useRegex ? globalTerm : globalTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
                const values = Object.values(row).join(" ");
                matchesGlobal = regex.test(values);
            } catch (e) {
                matchesGlobal = Object.values(row).join(" ").toLowerCase().includes(globalTerm);
            }
        }
        
        // Email Filter
        let matchesEmail = true;
        if (emailTerm) {
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

// CSV Export
function exportCsv() {
    if (filteredData.length === 0) {
        showToast("No data to export.", "error");
        return;
    }

    const headers = columns.join(',');
    const rows = filteredData.map(row =>
        columns.map(col => {
            const value = row[col] || '';
            const stringValue = String(value);
            // Escape quotes and wrap in quotes if contains comma or newline
            return stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')
                ? `"${stringValue.replace(/"/g, '""')}"` 
                : stringValue;
        }).join(',')
    );

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const date = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', url);
    link.setAttribute('download', `Filtered_Data_${date}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast("CSV exported successfully!");
}

// JSON Export
function exportJson() {
    if (filteredData.length === 0) {
        showToast("No data to export.", "error");
        return;
    }

    const json = JSON.stringify(filteredData, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const date = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', url);
    link.setAttribute('download', `Filtered_Data_${date}.json`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast("JSON exported successfully!");
}

// Column Statistics
function updateColumnStatistics(columnName) {
    const columnData = originalData
        .map(row => row[columnName])
        .filter(val => val !== null && val !== undefined && val !== '');

    if (columnData.length === 0) {
        document.getElementById('column-stats').style.display = 'none';
        return;
    }

    // Determine type
    const isNumeric = columnData.every(val => !isNaN(parseFloat(val)));
    const type = isNumeric ? 'Number' : 'Text';

    let stats = {
        type: type,
        unique: new Set(columnData).size,
        min: '-',
        max: '-',
        avg: '-'
    };

    if (isNumeric) {
        const nums = columnData.map(v => parseFloat(v));
        stats.min = Math.min(...nums).toFixed(2);
        stats.max = Math.max(...nums).toFixed(2);
        stats.avg = (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2);
    } else {
        stats.min = Math.min(...columnData.map(v => String(v).length));
        stats.max = Math.max(...columnData.map(v => String(v).length));
    }

    document.getElementById('stat-type').textContent = stats.type;
    document.getElementById('stat-min').textContent = stats.min;
    document.getElementById('stat-max').textContent = stats.max;
    document.getElementById('stat-avg').textContent = stats.avg;
    document.getElementById('stat-unique').textContent = stats.unique;
    document.getElementById('column-stats').style.display = 'block';
}

// Keyboard Shortcuts Modal
function toggleShortcutsModal() {
    shortcutsModal.classList.toggle('show');
}
