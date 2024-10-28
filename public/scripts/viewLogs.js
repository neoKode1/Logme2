document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const token = localStorage.getItem('googleToken');
    if (!token) {
        console.log('No authentication token found, redirecting to login');
        window.location.href = '/';
        return;
    }

    const searchForm = document.getElementById('searchForm');
    const logEntriesContainer = document.getElementById('logEntries');
    const paginationContainer = document.getElementById('pagination');

    searchForm?.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(searchForm);
        const searchParams = new URLSearchParams(formData);
        fetchLogs(searchParams);
    });

    async function fetchLogs(searchParams, page = 1) {
        try {
            const token = localStorage.getItem('googleToken');
            console.log('Fetching logs with token:', token?.substring(0, 20) + '...');
            
            const response = await fetch(`/api/logs?${searchParams.toString()}&page=${page}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    console.error('Authentication failed');
                    window.location.href = '/';
                    return;
                }
                throw new Error('Failed to fetch logs');
            }

            const data = await response.json();
            console.log('Received logs:', data);
            displayLogs(data.logs);
            displayPagination(data.currentPage, data.totalPages);
        } catch (error) {
            console.error('Error fetching logs:', error);
            if (logEntriesContainer) {
                logEntriesContainer.innerHTML = '<tr><td colspan="7" class="px-6 py-4 text-center text-red-500">Error fetching logs. Please try again.</td></tr>';
            }
        }
    }

    function displayLogs(logs) {
        if (!logEntriesContainer) return;

        if (!logs || logs.length === 0) {
            logEntriesContainer.innerHTML = '<tr><td colspan="7" class="px-6 py-4 text-center">No logs found.</td></tr>';
            return;
        }

        logEntriesContainer.innerHTML = logs.map(log => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">${log.hotel || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap">${log.arrivalTime || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap">${log.departureTime || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap">${log.cartsDelivered || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap">${log.cartsReceived || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap">${log.stainBags || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap">${log.calculatedWaitTime || 'N/A'}</td>
            </tr>
        `).join('');
    }

    function displayPagination(currentPage, totalPages) {
        if (!paginationContainer) return;

        let paginationHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `
                <button onclick="fetchLogs(new URLSearchParams(new FormData(document.getElementById('searchForm'))), ${i})" 
                        class="${i === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-200'} px-3 py-1 rounded mx-1">
                    ${i}
                </button>
            `;
        }
        paginationContainer.innerHTML = paginationHTML;
    }

    // Function to display messages
    function displayMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.textContent = message;
        messageDiv.className = `fixed top-4 right-4 p-4 rounded shadow-lg ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`;
        document.body.appendChild(messageDiv);
        setTimeout(() => messageDiv.remove(), 3000);
    }

    // Initial load of logs
    fetchLogs(new URLSearchParams());
});
