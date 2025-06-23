document.addEventListener('DOMContentLoaded', () => {
    const getRateBtn = document.getElementById('get-rate-btn');
    const startDateInput = document.getElementById('start-date');
    const rateTypeSelect = document.getElementById('rate-type');
    const currencyPairSelect = document.getElementById('currency-pair');
    const resultContainer = document.getElementById('result-container');
    const mainTitle = document.getElementById('main-title');

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
        
        fetch(`http://127.0.0.1:5000/api/get_rate?start_date=${startDate}&rate_type=${rateType}&pair=${currencyPair}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    resultContainer.innerHTML = `<p style="color: red;">Error: ${data.error}</p>`;
                    return;
                }
                
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
                resultContainer.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
            });
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