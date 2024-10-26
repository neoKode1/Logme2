document.addEventListener('DOMContentLoaded', function() {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
        window.location.href = '/index.html'; // Redirect to login page if not authenticated
        return;
    }

    const searchForm = document.getElementById('searchForm');
    const logEntriesContainer = document.getElementById('logEntries');
    const paginationContainer = document.getElementById('pagination');

    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(searchForm);
        const searchParams = new URLSearchParams(formData);
        fetchLogs(searchParams);
    });

    async function fetchLogs(searchParams, page = 1) {
        try {
            const token = localStorage.getItem('jwtToken'); // Assume we store the JWT in localStorage after login
            const response = await fetch(`/api/logs?${searchParams.toString()}&page=${page}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                if (response.status === 401) {
                    // Token might be expired, redirect to login
                    window.location.href = '/index.html';
                    return;
                }
                throw new Error('Failed to fetch logs');
            }
            const data = await response.json();
            displayLogs(data.logs);
            displayPagination(data.currentPage, data.totalPages);
        } catch (error) {
            console.error('Error fetching logs:', error);
            logEntriesContainer.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-red-500">Error fetching logs. Please try again.</td></tr>';
        }
    }

    function displayLogs(logs) {
        if (logs.length === 0) {
            logEntriesContainer.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center">No logs found matching the search criteria.</td></tr>';
            return;
        }

        logEntriesContainer.innerHTML = logs.map(log => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">${log.driverName || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap">${log.truckNumber || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap">${log.date || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap">${log.hotel || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <button onclick="editLog('${log.id}')" class="text-indigo-600 hover:text-indigo-900">Edit</button>
                    <button onclick="viewDetails('${log.id}')" class="ml-2 text-green-600 hover:text-green-900">View Details</button>
                </td>
            </tr>
        `).join('');
    }

    function displayPagination(currentPage, totalPages) {
        let paginationHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `
                <button onclick="fetchLogs(new URLSearchParams(new FormData(document.getElementById('searchForm'))), ${i})" 
                        class="${i === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-200'} px-3 py-1 rounded">
                    ${i}
                </button>
            `;
        }
        paginationContainer.innerHTML = paginationHTML;
    }

    // Initial load of logs
    fetchLogs(new URLSearchParams());
});

function editLog(logId) {
    // Implement the edit functionality
    console.log(`Editing log with ID: ${logId}`);
    // You can redirect to an edit page or open a modal for editing
}

function viewDetails(logId) {
    // Implement the view details functionality
    console.log(`Viewing details for log with ID: ${logId}`);
    // You can open a modal or navigate to a details page here
}
