// Advanced Features for Excel Filter Pro

// ===== MODAL MANAGEMENT =====
function toggleModal(modal) {
    if (!modal) return;
    const isVisible = modal.style.display === 'flex';
    modal.style.display = isVisible ? 'none' : 'flex';
    modal.classList.toggle('show', !isVisible);
}

// ===== DATE RANGE FILTERING =====
function handleDateRangeChange() {
    const preset = dateRangePreset.value;
    if (preset === 'custom') {
        customDateRange.style.display = 'block';
    } else {
        customDateRange.style.display = 'none';
        if (preset) {
            const range = getDateRange(preset);
            dateFrom.value = range.from;
            dateTo.value = range.to;
        } else {
            dateFrom.value = '';
            dateTo.value = '';
        }
    }
    applyFilters();
}

function getDateRange(preset) {
    const today = new Date();
    const from = new Date();
    const to = new Date();
    
    switch(preset) {
        case 'today':
            break;
        case 'yesterday':
            from.setDate(today.getDate() - 1);
            to.setDate(today.getDate() - 1);
            break;
        case 'last7days':
            from.setDate(today.getDate() - 7);
            break;
        case 'last30days':
            from.setDate(today.getDate() - 30);
            break;
        case 'thisMonth':
            from.setDate(1);
            break;
        case 'lastMonth':
            from.setMonth(today.getMonth() - 1);
            from.setDate(1);
            to.setDate(0);
            break;
    }
    
    return {
        from: from.toISOString().split('T')[0],
        to: to.toISOString().split('T')[0]
    };
}

// ===== NUMERIC RANGE FILTERING =====
function handleNumericColumnChange() {
    const col = numericColumnSelect.value;
    if (col) {
        numericRangeInputs.style.display = 'block';
    } else {
        numericRangeInputs.style.display = 'none';
        numericMin.value = '';
        numericMax.value = '';
        applyFilters();
    }
}

function populateNumericColumns() {
    if (!numericColumnSelect) return;
    numericColumnSelect.innerHTML = '<option value="">Select numeric column...</option>';
    
    columns.forEach(col => {
        const values = originalData.map(row => row[col]).filter(v => v !== null && v !== undefined && v !== '');
        const isNumeric = values.length > 0 && values.every(v => !isNaN(parseFloat(v)));
        
        if (isNumeric) {
            const option = document.createElement('option');
            option.value = col;
            option.textContent = col;
            numericColumnSelect.appendChild(option);
        }
    });
}

// ===== COLUMN VISIBILITY =====
function setupColumnVisibility() {
    const list = document.getElementById('column-visibility-list');
    if (!list) return;
    
    list.innerHTML = '';
    columns.forEach(col => {
        const item = document.createElement('label');
        item.className = 'checkbox-label';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = !hiddenColumns.has(col);
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                hiddenColumns.delete(col);
            } else {
                hiddenColumns.add(col);
            }
            renderTable();
        });
        
        item.appendChild(checkbox);
        item.appendChild(document.createTextNode(col));
        list.appendChild(item);
    });
}

function toggleAllColumns(show) {
    if (show) {
        hiddenColumns.clear();
    } else {
        columns.forEach(col => hiddenColumns.add(col));
    }
    setupColumnVisibility();
    renderTable();
}

// ===== DATA CLEANING TOOLS =====
function removeDuplicates() {
    const before = originalData.length;
    const seen = new Set();
    
    originalData = originalData.filter(row => {
        const key = JSON.stringify(row);
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
    
    const removed = before - originalData.length;
    filteredData = [...originalData];
    renderTable();
    updateStats();
    showToast(`Removed ${removed} duplicate row(s)`);
    toggleModal(dataToolsModal);
}

function removeEmptyRows() {
    const before = originalData.length;
    
    originalData = originalData.filter(row => {
        return Object.values(row).some(val => val !== null && val !== undefined && val !== '');
    });
    
    const removed = before - originalData.length;
    filteredData = [...originalData];
    renderTable();
    updateStats();
    showToast(`Removed ${removed} empty row(s)`);
    toggleModal(dataToolsModal);
}

function trimWhitespace() {
    let count = 0;
    
    originalData = originalData.map(row => {
        const newRow = {};
        Object.keys(row).forEach(key => {
            const val = row[key];
            if (typeof val === 'string') {
                const trimmed = val.trim();
                if (trimmed !== val) count++;
                newRow[key] = trimmed;
            } else {
                newRow[key] = val;
            }
        });
        return newRow;
    });
    
    filteredData = [...originalData];
    renderTable();
    showToast(`Trimmed whitespace from ${count} cell(s)`);
    toggleModal(dataToolsModal);
}

function validateEmails() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    dataValidation.invalidEmails.clear();
    let invalidCount = 0;
    
    originalData.forEach((row, index) => {
        Object.values(row).forEach(val => {
            const str = String(val);
            if (str.includes('@') && !emailRegex.test(str)) {
                dataValidation.invalidEmails.add(index);
                invalidCount++;
            }
        });
    });
    
    renderTable();
    showToast(`Found ${invalidCount} invalid email(s)`, invalidCount > 0 ? 'error' : 'success');
    toggleModal(dataToolsModal);
}

function transformCase(type) {
    const col = columnSelect.value;
    if (!col) {
        showToast('Please select a column first', 'error');
        return;
    }
    
    let count = 0;
    originalData = originalData.map(row => {
        const val = row[col];
        if (typeof val === 'string') {
            count++;
            row[col] = type === 'upper' ? val.toUpperCase() : val.toLowerCase();
        }
        return row;
    });
    
    filteredData = [...originalData];
    renderTable();
    showToast(`Transformed ${count} cell(s) to ${type}case`);
    toggleModal(dataToolsModal);
}

// ===== FIND & REPLACE =====
function openFindReplace() {
    toggleModal(dataToolsModal);
    toggleModal(findReplaceModal);
    
    const frColumnSelect = document.getElementById('fr-column-select');
    if (frColumnSelect) {
        frColumnSelect.innerHTML = '<option value="all">All Columns</option>';
        columns.forEach(col => {
            const option = document.createElement('option');
            option.value = col;
            option.textContent = col;
            frColumnSelect.appendChild(option);
        });
    }
}

function previewFindReplace() {
    const findText = document.getElementById('fr-find')?.value;
    const replaceText = document.getElementById('fr-replace')?.value;
    const column = document.getElementById('fr-column-select')?.value;
    const caseSensitive = document.getElementById('fr-case-sensitive')?.checked;
    const wholeWord = document.getElementById('fr-whole-word')?.checked;
    
    if (!findText) {
        showToast('Please enter text to find', 'error');
        return;
    }
    
    let matches = 0;
    const preview = document.getElementById('fr-preview');
    const previewItems = [];
    
    originalData.forEach((row, rowIndex) => {
        const cols = column === 'all' ? Object.keys(row) : [column];
        
        cols.forEach(col => {
            const val = String(row[col] || '');
            let searchVal = val;
            let searchFind = findText;
            
            if (!caseSensitive) {
                searchVal = val.toLowerCase();
                searchFind = findText.toLowerCase();
            }
            
            if (wholeWord) {
                const regex = new RegExp(`\\b${searchFind}\\b`, caseSensitive ? 'g' : 'gi');
                if (regex.test(val)) {
                    matches++;
                    if (previewItems.length < 5) {
                        previewItems.push(`Row ${rowIndex + 1}, ${col}: "${val}" → "${val.replace(regex, replaceText)}"`);
                    }
                }
            } else {
                if (searchVal.includes(searchFind)) {
                    matches++;
                    if (previewItems.length < 5) {
                        const flags = caseSensitive ? 'g' : 'gi';
                        const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
                        previewItems.push(`Row ${rowIndex + 1}, ${col}: "${val}" → "${val.replace(regex, replaceText)}"`);
                    }
                }
            }
        });
    });
    
    if (preview) {
        preview.style.display = 'block';
        preview.innerHTML = `<strong>Found ${matches} match(es)</strong><br>` + 
            previewItems.map(item => `<div class="preview-item">${item}</div>`).join('');
    }
}

function performFindReplace() {
    const findText = document.getElementById('fr-find')?.value;
    const replaceText = document.getElementById('fr-replace')?.value;
    const column = document.getElementById('fr-column-select')?.value;
    const caseSensitive = document.getElementById('fr-case-sensitive')?.checked;
    const wholeWord = document.getElementById('fr-whole-word')?.checked;
    
    if (!findText) {
        showToast('Please enter text to find', 'error');
        return;
    }
    
    let replacements = 0;
    
    originalData = originalData.map(row => {
        const cols = column === 'all' ? Object.keys(row) : [column];
        
        cols.forEach(col => {
            const val = String(row[col] || '');
            
            if (wholeWord) {
                const regex = new RegExp(`\\b${findText}\\b`, caseSensitive ? 'g' : 'gi');
                if (regex.test(val)) {
                    row[col] = val.replace(regex, replaceText);
                    replacements++;
                }
            } else {
                const flags = caseSensitive ? 'g' : 'gi';
                const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
                if (regex.test(val)) {
                    row[col] = val.replace(regex, replaceText);
                    replacements++;
                }
            }
        });
        
        return row;
    });
    
    filteredData = [...originalData];
    renderTable();
    showToast(`Replaced ${replacements} occurrence(s)`);
    toggleModal(findReplaceModal);
}

// ===== CLIPBOARD =====
function copyToClipboard() {
    if (filteredData.length === 0) {
        showToast('No data to copy', 'error');
        return;
    }
    
    const visibleColumns = columns.filter(col => !hiddenColumns.has(col));
    const headers = visibleColumns.join('\t');
    const rows = filteredData.map(row =>
        visibleColumns.map(col => row[col] || '').join('\t')
    );
    
    const text = [headers, ...rows].join('\n');
    
    navigator.clipboard.writeText(text).then(() => {
        showToast('Data copied to clipboard!');
        toggleModal(dataToolsModal);
    }).catch(err => {
        showToast('Failed to copy to clipboard', 'error');
        console.error(err);
    });
}

// ===== FILTER SAVE/LOAD =====
function saveCurrentFilters() {
    const filterConfig = {
        name: prompt('Enter a name for this filter configuration:'),
        timestamp: new Date().toISOString(),
        filters: {
            globalSearch: searchGlobal?.value || '',
            emailFilter: emailFilter?.value || '',
            columnSelect: columnSelect?.value || '',
            columnFilterValue: columnFilterValue?.value || '',
            dateRangePreset: dateRangePreset?.value || '',
            dateFrom: dateFrom?.value || '',
            dateTo: dateTo?.value || '',
            numericColumn: numericColumnSelect?.value || '',
            numericMin: numericMin?.value || '',
            numericMax: numericMax?.value || '',
            regexEnabled: regexToggle?.checked || false,
            caseSensitive: caseSensitiveToggle?.checked || false
        }
    };
    
    if (!filterConfig.name) return;
    
    savedFilters.push(filterConfig);
    localStorage.setItem('excelProFilters', JSON.stringify(savedFilters));
    showToast(`Filter "${filterConfig.name}" saved!`);
}

function loadSavedFilters() {
    const stored = localStorage.getItem('excelProFilters');
    if (!stored) {
        showToast('No saved filters found', 'error');
        return;
    }
    
    savedFilters = JSON.parse(stored);
    
    const filterNames = savedFilters.map((f, i) => `${i + 1}. ${f.name} (${new Date(f.timestamp).toLocaleDateString()})`).join('\n');
    const choice = prompt(`Select a filter to load:\n\n${filterNames}\n\nEnter number:`);
    
    if (!choice) return;
    
    const index = parseInt(choice) - 1;
    if (index >= 0 && index < savedFilters.length) {
        const config = savedFilters[index].filters;
        
        if (searchGlobal) searchGlobal.value = config.globalSearch;
        if (emailFilter) emailFilter.value = config.emailFilter;
        if (columnSelect) columnSelect.value = config.columnSelect;
        if (columnFilterValue) columnFilterValue.value = config.columnFilterValue;
        if (dateRangePreset) dateRangePreset.value = config.dateRangePreset;
        if (dateFrom) dateFrom.value = config.dateFrom;
        if (dateTo) dateTo.value = config.dateTo;
        if (numericColumnSelect) numericColumnSelect.value = config.numericColumn;
        if (numericMin) numericMin.value = config.numericMin;
        if (numericMax) numericMax.value = config.numericMax;
        if (regexToggle) regexToggle.checked = config.regexEnabled;
        if (caseSensitiveToggle) caseSensitiveToggle.checked = config.caseSensitive;
        
        applyFilters();
        showToast(`Filter "${savedFilters[index].name}" loaded!`);
    }
}

// ===== VISUALIZATION =====
function setupVisualization() {
    const vizColumnSelect = document.getElementById('viz-column-select');
    if (!vizColumnSelect) return;
    
    vizColumnSelect.innerHTML = '<option value="">Select column...</option>';
    columns.forEach(col => {
        const option = document.createElement('option');
        option.value = col;
        option.textContent = col;
        vizColumnSelect.appendChild(option);
    });
}

function generateChart() {
    const column = document.getElementById('viz-column-select')?.value;
    const type = document.getElementById('viz-type-select')?.value;
    
    if (!column) {
        showToast('Please select a column', 'error');
        return;
    }
    
    const container = document.getElementById('chart-container');
    if (!container) return;
    
    const values = filteredData.map(row => row[column]).filter(v => v !== null && v !== undefined && v !== '');
    
    if (values.length === 0) {
        showToast('No data to visualize', 'error');
        return;
    }
    
    // Count frequency
    const frequency = {};
    values.forEach(val => {
        frequency[val] = (frequency[val] || 0) + 1;
    });
    
    const sortedData = Object.entries(frequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20); // Top 20
    
    container.innerHTML = '';
    
    if (type === 'bar') {
        renderBarChart(container, sortedData, column);
    } else if (type === 'pie') {
        renderPieChart(container, sortedData, column);
    } else if (type === 'line') {
        renderLineChart(container, sortedData, column);
    } else if (type === 'histogram') {
        renderHistogram(container, values, column);
    }
    
    document.getElementById('export-chart-btn').style.display = 'block';
}

function renderBarChart(container, data, title) {
    const maxValue = Math.max(...data.map(d => d[1]));
    
    const chart = document.createElement('div');
    chart.className = 'chart bar-chart';
    chart.innerHTML = `<h3>${title} Distribution</h3>`;
    
    data.forEach(([label, value]) => {
        const bar = document.createElement('div');
        bar.className = 'chart-bar';
        
        const barFill = document.createElement('div');
        barFill.className = 'chart-bar-fill';
        barFill.style.width = `${(value / maxValue) * 100}%`;
        barFill.textContent = value;
        
        const barLabel = document.createElement('div');
        barLabel.className = 'chart-bar-label';
        barLabel.textContent = label;
        
        bar.appendChild(barLabel);
        bar.appendChild(barFill);
        chart.appendChild(bar);
    });
    
    container.appendChild(chart);
}

function renderPieChart(container, data, title) {
    const total = data.reduce((sum, d) => sum + d[1], 0);
    
    const chart = document.createElement('div');
    chart.className = 'chart pie-chart';
    chart.innerHTML = `<h3>${title} Distribution</h3>`;
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 200 200');
    svg.setAttribute('width', '300');
    svg.setAttribute('height', '300');
    
    let currentAngle = 0;
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];
    
    data.forEach(([label, value], index) => {
        const percentage = (value / total) * 100;
        const angle = (value / total) * 360;
        
        const x1 = 100 + 80 * Math.cos((currentAngle - 90) * Math.PI / 180);
        const y1 = 100 + 80 * Math.sin((currentAngle - 90) * Math.PI / 180);
        
        currentAngle += angle;
        
        const x2 = 100 + 80 * Math.cos((currentAngle - 90) * Math.PI / 180);
        const y2 = 100 + 80 * Math.sin((currentAngle - 90) * Math.PI / 180);
        
        const largeArc = angle > 180 ? 1 : 0;
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`);
        path.setAttribute('fill', colors[index % colors.length]);
        path.setAttribute('stroke', '#fff');
        path.setAttribute('stroke-width', '2');
        
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        title.textContent = `${label}: ${value} (${percentage.toFixed(1)}%)`;
        path.appendChild(title);
        
        svg.appendChild(path);
    });
    
    chart.appendChild(svg);
    
    const legend = document.createElement('div');
    legend.className = 'chart-legend';
    data.forEach(([label, value], index) => {
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.innerHTML = `<span class="legend-color" style="background: ${colors[index % colors.length]}"></span> ${label}: ${value}`;
        legend.appendChild(item);
    });
    chart.appendChild(legend);
    
    container.appendChild(chart);
}

function renderLineChart(container, data, title) {
    const chart = document.createElement('div');
    chart.className = 'chart line-chart';
    chart.innerHTML = `<h3>${title} Trend</h3>`;
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 400 200');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '300');
    
    const maxValue = Math.max(...data.map(d => d[1]));
    const points = data.map(([label, value], index) => {
        const x = (index / (data.length - 1)) * 380 + 10;
        const y = 190 - (value / maxValue) * 170;
        return `${x},${y}`;
    }).join(' ');
    
    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    polyline.setAttribute('points', points);
    polyline.setAttribute('fill', 'none');
    polyline.setAttribute('stroke', '#6366f1');
    polyline.setAttribute('stroke-width', '3');
    
    svg.appendChild(polyline);
    chart.appendChild(svg);
    container.appendChild(chart);
}

function renderHistogram(container, values, title) {
    const numericValues = values.map(v => parseFloat(v)).filter(v => !isNaN(v));
    
    if (numericValues.length === 0) {
        showToast('Column must contain numeric values for histogram', 'error');
        return;
    }
    
    const min = Math.min(...numericValues);
    const max = Math.max(...numericValues);
    const binCount = 10;
    const binSize = (max - min) / binCount;
    
    const bins = Array(binCount).fill(0);
    numericValues.forEach(val => {
        const binIndex = Math.min(Math.floor((val - min) / binSize), binCount - 1);
        bins[binIndex]++;
    });
    
    const binLabels = bins.map((_, i) => {
        const start = (min + i * binSize).toFixed(1);
        const end = (min + (i + 1) * binSize).toFixed(1);
        return `${start}-${end}`;
    });
    
    const data = binLabels.map((label, i) => [label, bins[i]]);
    renderBarChart(container, data, `${title} Histogram`);
}

function exportChart() {
    const container = document.getElementById('chart-container');
    if (!container || !container.firstChild) {
        showToast('No chart to export', 'error');
        return;
    }
    
    showToast('Chart export feature coming soon!');
}

// Make functions available globally
window.advancedFeatures = {
    toggleModal,
    handleDateRangeChange,
    handleNumericColumnChange,
    populateNumericColumns,
    setupColumnVisibility,
    toggleAllColumns,
    removeDuplicates,
    removeEmptyRows,
    trimWhitespace,
    validateEmails,
    transformCase,
    openFindReplace,
    previewFindReplace,
    performFindReplace,
    copyToClipboard,
    saveCurrentFilters,
    loadSavedFilters,
    setupVisualization,
    generateChart,
    exportChart
};
