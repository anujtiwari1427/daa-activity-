/**
 * Statistics Page — Chart.js charts for priority distribution and status.
 */

let priorityChart = null;
let statusChart = null;

async function loadStatistics() {
    try {
        const res = await fetch(`${API}/api/statistics`);
        const stats = await res.json();

        // Update stat cards
        document.getElementById('stats-total').textContent = stats.total;
        document.getElementById('stats-emergency').textContent = stats.emergency;
        document.getElementById('stats-waiting').textContent = stats.waiting;
        document.getElementById('stats-completed').textContent = stats.completed;

        // Render charts
        renderPriorityChart(stats.priority_distribution);
        renderStatusChart(stats.status_distribution);
    } catch (err) {
        console.error('Statistics load error:', err);
    }
}

function renderPriorityChart(data) {
    const ctx = document.getElementById('chart-priority');
    if (!ctx) return;

    if (priorityChart) priorityChart.destroy();

    priorityChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Critical (9-10)', 'Serious (5-8)', 'Moderate (3-4)', 'Routine (1-2)'],
            datasets: [{
                label: 'Patients',
                data: [data.critical, data.serious, data.moderate, data.routine],
                backgroundColor: [
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(249, 115, 22, 0.8)',
                    'rgba(234, 179, 8, 0.8)',
                    'rgba(16, 185, 129, 0.8)'
                ],
                borderColor: [
                    '#ef4444', '#f97316', '#eab308', '#10b981'
                ],
                borderWidth: 2,
                borderRadius: 8,
                barPercentage: 0.6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1, font: { family: 'Plus Jakarta Sans', weight: '600' } },
                    grid: { color: 'rgba(0,0,0,0.05)' }
                },
                x: {
                    ticks: { font: { family: 'Plus Jakarta Sans', size: 12, weight: '600' } },
                    grid: { display: false }
                }
            }
        }
    });
}

function renderStatusChart(data) {
    const ctx = document.getElementById('chart-status');
    if (!ctx) return;

    if (statusChart) statusChart.destroy();

    statusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Waiting', 'In Treatment', 'Completed'],
            datasets: [{
                data: [data.waiting, data.in_treatment, data.completed],
                backgroundColor: [
                    'rgba(249, 115, 22, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)'
                ],
                borderColor: ['#f97316', '#3b82f6', '#10b981'],
                borderWidth: 2,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '55%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: { family: 'Plus Jakarta Sans', size: 12, weight: '600' },
                        usePointStyle: true,
                        pointStyleWidth: 10
                    }
                }
            }
        }
    });
}
