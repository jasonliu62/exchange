document.addEventListener('DOMContentLoaded', () => {
    const getRateBtn = document.getElementById('get-rate-btn');
    const startDateInput = document.getElementById('start-date');
    const rateTypeSelect = document.getElementById('rate-type');
    const currencyPairSelect = document.getElementById('currency-pair');
    const exportBtn = document.getElementById('export-btn');
    const resultContainer = document.getElementById('result-container');
    const mainTitle = document.getElementById('main-title');

    let lastData = null; // Variable to store the last fetched data

    // Set default date to today
    startDateInput.value = new Date().toISOString().split('T')[0];

    getRateBtn.addEventListener('click', () => {
        const startDate = startDateInput.value;
        const rateType = rateTypeSelect.value;
        const currencyPair = currencyPairSelect.value;

        if (!startDate) {
            alert('Please select a start date.');
            return;
        }

        // Update title
        mainTitle.textContent = `${currencyPair.replace('-', ' to ')} Exchange Rate`;

        resultContainer.innerHTML = 'Loading...';
        lastData = null; // Reset data on new fetch
        
        fetch(`http://127.0.0.1:5000/api/get_rate?start_date=${startDate}&rate_type=${rateType}&pair=${currencyPair}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    resultContainer.innerHTML = `<p style="color: red;">Error: ${data.error}</p>`;
                    return;
                }
                
                lastData = data; // Store the successful data fetch

                if (Object.keys(data).length === 0) {
                    resultContainer.innerHTML = '<p>No data available for the selected period.</p>';
                    return;
                }

                if (rateType === 'daily') {
                    displayTable('Date', 'Rate', data);
                } else if (rateType === 'weekly') {
                    displayTable('Period', 'Average Rate', data);
                } else { // Monthly
                    displayTable('Period', 'Average Rate', data);
                }
            })
            .catch(error => {
                lastData = null; // Reset data on error
                resultContainer.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
            });
    });

    exportBtn.addEventListener('click', () => {
        if (!lastData || Object.keys(lastData).length === 0) {
            alert('No data available to export. Please "Get Rate" first.');
            return;
        }

        const rateType = rateTypeSelect.value;
        const header1 = (rateType === 'daily') ? 'Date' : 'Period';
        const header2 = (rateType === 'daily') ? 'Rate' : 'Average Rate';

        // Convert the data from {key: value} to [{Header1: key, Header2: value}] format for xlsx
        const dataForSheet = Object.keys(lastData).map(key => {
            return {
                [header1]: key,
                [header2]: lastData[key]
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(dataForSheet);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Exchange Rates");

        // Generate a filename based on the current request
        const currencyPair = currencyPairSelect.value;
        const startDate = startDateInput.value;
        const fileName = `Export_${currencyPair}_${rateType}_from_${startDate}.xlsx`;
        
        XLSX.writeFile(workbook, fileName);
    });

    function displayTable(header1, header2, data) {
        let table = `<table><tr><th>${header1}</th><th>${header2}</th></tr>`;
        for (const [key, value] of Object.entries(data)) {
            const rate = (typeof value === 'number') ? value.toFixed(4) : 'N/A';
            table += `<tr><td>${key}</td><td>${rate}</td></tr>`;
        }
        table += '</table>';
        resultContainer.innerHTML = table;
    }
}); 