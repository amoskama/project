// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeDashboardPanels();
    initializeMaps();
    initializeCharts();
    initializeBinAnimations();
});

// Navigation Functionality
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    // Navigation toggle for mobile
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }
    
    // Navigation between sections
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Hide all sections
            document.querySelectorAll('.section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Show target section
            const targetId = this.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
            
            // Close mobile menu if open
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
            
            // Reinitialize components for the new section
            setTimeout(() => {
                initializeMaps();
                initializeCharts();
            }, 100);
        });
    });
}

// Dashboard Panel Switching
function initializeDashboardPanels() {
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    
    sidebarItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get the parent dashboard container
            const dashboard = this.closest('.dashboard-container') || 
                             this.closest('.marketplace-container')?.parentElement;
            
            if (!dashboard) return;
            
            // Update active sidebar item
            const sidebarMenu = this.closest('.sidebar-menu');
            sidebarMenu.querySelectorAll('.sidebar-item').forEach(i => {
                i.classList.remove('active');
            });
            this.classList.add('active');
            
            // Hide all content panels in this dashboard
            const contentPanels = dashboard.querySelectorAll('.content-panel');
            contentPanels.forEach(panel => {
                panel.classList.remove('active');
            });
            
            // Show target panel
            const targetPanelId = this.getAttribute('data-panel');
            const targetPanel = document.getElementById(targetPanelId);
            if (targetPanel) {
                targetPanel.classList.add('active');
                
                // Reinitialize components for the new panel
                setTimeout(() => {
                    if (targetPanelId.includes('map')) {
                        initializeMaps();
                    }
                    if (targetPanelId.includes('statistics') || targetPanelId.includes('analytics')) {
                        initializeCharts();
                    }
                }, 100);
            }
        });
    });
}

// Map Initialization
function initializeMaps() {
    // Household Map
    const householdMapElement = document.getElementById('household-map');
    if (householdMapElement && !householdMapElement._map) {
        const householdMap = L.map('household-map').setView([40.7128, -74.0060], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(householdMap);
        
        L.marker([40.7128, -74.0060])
            .addTo(householdMap)
            .bindPopup('<b>Your Bin</b><br>123 Green Street')
            .openPopup();
            
        householdMapElement._map = householdMap;
    }
    
    // Aggregator Map
    const aggregatorMapElement = document.getElementById('aggregator-map-view');
    if (aggregatorMapElement && !aggregatorMapElement._map) {
        const aggregatorMap = L.map('aggregator-map-view').setView([40.7128, -74.0060], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(aggregatorMap);
        
        // Add sample bins with different statuses
        const binLocations = [
            { coords: [40.7128, -74.0060], status: 'warning', id: 'BIN-001' },
            { coords: [40.7218, -74.0100], status: 'success', id: 'BIN-002' },
            { coords: [40.7058, -74.0160], status: 'danger', id: 'BIN-003' },
            { coords: [40.7180, -74.0020], status: 'success', id: 'BIN-004' },
            { coords: [40.7080, -74.0080], status: 'warning', id: 'BIN-005' }
        ];
        
        binLocations.forEach(bin => {
            let iconColor;
            switch(bin.status) {
                case 'success': iconColor = 'green'; break;
                case 'warning': iconColor = 'orange'; break;
                case 'danger': iconColor = 'red'; break;
                default: iconColor = 'blue';
            }
            
            const icon = L.divIcon({
                className: `bin-marker bin-marker-${iconColor}`,
                html: `<div class="marker-pin"></div>`,
                iconSize: [30, 42],
                iconAnchor: [15, 42]
            });
            
            L.marker(bin.coords, { icon: icon })
                .addTo(aggregatorMap)
                .bindPopup(`<b>${bin.id}</b><br>Status: ${bin.status === 'success' ? 'OK' : bin.status === 'warning' ? 'Nearly Full' : 'Full'}`);
        });
        
        aggregatorMapElement._map = aggregatorMap;
        
        // Add custom CSS for map markers
        if (!document.getElementById('map-marker-styles')) {
            const style = document.createElement('style');
            style.id = 'map-marker-styles';
            style.textContent = `
                .bin-marker { position: relative; }
                .marker-pin {
                    width: 30px;
                    height: 30px;
                    border-radius: 50% 50% 50% 0;
                    position: absolute;
                    transform: rotate(-45deg);
                    left: 50%;
                    top: 50%;
                    margin: -15px 0 0 -15px;
                }
                .bin-marker-green .marker-pin { background: #28a745; }
                .bin-marker-orange .marker-pin { background: #ffc107; }
                .bin-marker-red .marker-pin { background: #dc3545; }
            `;
            document.head.appendChild(style);
        }
    }
}

// Chart Initialization
function initializeCharts() {
    // Waste Generation Chart (Household)
    const wasteChartCanvas = document.getElementById('wasteChart');
    if (wasteChartCanvas && !wasteChartCanvas._chart) {
        const ctx = wasteChartCanvas.getContext('2d');
        wasteChartCanvas._chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Waste (kg)',
                    data: [3.2, 2.8, 4.1, 3.5, 3.8, 4.5, 2.9],
                    borderColor: '#2E8B57',
                    backgroundColor: 'rgba(46, 139, 87, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Kilograms (kg)'
                        }
                    }
                }
            }
        });
    }
    
    // Waste Breakdown Chart (Household)
    const breakdownChartCanvas = document.getElementById('breakdownChart');
    if (breakdownChartCanvas && !breakdownChartCanvas._chart) {
        const ctx = breakdownChartCanvas.getContext('2d');
        breakdownChartCanvas._chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Organic', 'Plastic', 'Paper', 'Glass', 'Metal'],
                datasets: [{
                    data: [40, 25, 15, 12, 8],
                    backgroundColor: [
                        '#2E8B57',
                        '#20B2AA',
                        '#FFA500',
                        '#9370DB',
                        '#DC3545'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

// Bin Animations
function initializeBinAnimations() {
    const fillLevels = document.querySelectorAll('.fill-level');
    
    fillLevels.forEach(level => {
        // Animate the fill level on page load
        const height = level.style.height;
        level.style.height = '0%';
        
        setTimeout(() => {
            level.style.height = height;
        }, 500);
    });
    
    // Animate the floating bin in hero section
    const floatingBin = document.querySelector('.floating-bin');
    if (floatingBin) {
        // Animation is handled by CSS, but we can add interactive effects
        floatingBin.addEventListener('mouseenter', function() {
            this.style.animationPlayState = 'paused';
        });
        
        floatingBin.addEventListener('mouseleave', function() {
            this.style.animationPlayState = 'running';
        });
    }
}

// Simulate Real-time Data Updates
function simulateDataUpdates() {
    // Update bin fill levels randomly (for demo purposes)
    setInterval(() => {
        const fillProgresses = document.querySelectorAll('.fill-progress');
        fillProgresses.forEach(progress => {
            if (Math.random() > 0.7) { // 30% chance to update
                const currentWidth = parseInt(progress.style.width);
                const change = Math.random() * 10 - 5; // -5% to +5%
                let newWidth = currentWidth + change;
                newWidth = Math.max(5, Math.min(100, newWidth)); // Keep between 5% and 100%
                progress.style.width = `${newWidth}%`;
                
                // Update the percentage text if available
                const percentElement = progress.closest('.fill-indicator').querySelector('.fill-percent');
                if (percentElement) {
                    percentElement.textContent = `${Math.round(newWidth)}% Full`;
                }
                
                // Update status badge if in a table
                const statusBadge = progress.closest('tr')?.querySelector('.status-badge');
                if (statusBadge) {
                    if (newWidth < 70) {
                        statusBadge.className = 'status-badge success';
                        statusBadge.textContent = 'OK';
                    } else if (newWidth < 90) {
                        statusBadge.className = 'status-badge warning';
                        statusBadge.textContent = 'Nearly Full';
                    } else {
                        statusBadge.className = 'status-badge danger';
                        statusBadge.textContent = 'Full';
                    }
                }
            }
        });
    }, 5000);
}

// Initialize data simulation after a delay
setTimeout(simulateDataUpdates, 3000);

// Form Handling
document.addEventListener('DOMContentLoaded', function() {
    // Settings form handling
    const settingsForm = document.querySelector('.settings-grid');
    if (settingsForm) {
        settingsForm.addEventListener('change', function(e) {
            if (e.target.type === 'checkbox' || e.target.type === 'select-one') {
                // In a real app, we would save these settings to the server
                console.log('Setting changed:', e.target.name || e.target.id, e.target.value || e.target.checked);
                
                // Show a confirmation (in a real app, this would be more sophisticated)
                showNotification('Settings saved successfully', 'success');
            }
        });
    }
    
    // Booking system handling
    const bookButtons = document.querySelectorAll('.btn-primary');
    bookButtons.forEach(button => {
        if (button.textContent.includes('Book') || button.textContent.includes('Add to Cart')) {
            button.addEventListener('click', function() {
                const wasteCard = this.closest('.waste-card, .catalog-item');
                const wasteType = wasteCard?.querySelector('h3')?.textContent || 'Unknown waste type';
                
                // In a real app, this would add to a shopping cart or initiate a booking process
                showNotification(`${wasteType} added to cart`, 'success');
            });
        }
    });
    
    // Reward redemption
    const redeemButtons = document.querySelectorAll('.btn-reward');
    redeemButtons.forEach(button => {
        button.addEventListener('click', function() {
            const rewardCard = this.closest('.reward-card');
            const rewardName = rewardCard?.querySelector('h4')?.textContent || 'Unknown reward';
            const rewardCost = rewardCard?.querySelector('.reward-cost')?.textContent || '0 pts';
            
            // In a real app, this would process the redemption
            showNotification(`You redeemed ${rewardName} for ${rewardCost}`, 'success');
        });
    });
});

// Notification System
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} global-notification`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    // Add styles for global notifications if not already added
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .global-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 350px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                animation: slideInRight 0.3s ease;
            }
            .notification-close {
                background: none;
                border: none;
                cursor: pointer;
                margin-left: auto;
            }
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', function() {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'check-circle';
        case 'warning': return 'exclamation-triangle';
        case 'danger': return 'times-circle';
        default: return 'info-circle';
    }
}

// Search and Filter Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Bin monitoring search
    const binSearch = document.querySelector('#bin-monitoring input[type="text"]');
    if (binSearch) {
        binSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('#bin-monitoring .data-table tbody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }
    
    // Marketplace filters
    const marketplaceFilters = document.querySelectorAll('.marketplace-filters select, .marketplace-filters input');
    marketplaceFilters.forEach(filter => {
        filter.addEventListener('change', function() {
            // In a real app, this would filter the marketplace results
            console.log('Filter changed:', this.name || this.id, this.value);
        });
    });
});

// Responsive Helpers
function handleResize() {
    // Adjust map sizes on window resize
    const maps = document.querySelectorAll('.map-container.small #household-map, .map-container.large #aggregator-map-view');
    maps.forEach(mapElement => {
        if (mapElement._map) {
            setTimeout(() => {
                mapElement._map.invalidateSize();
            }, 200);
        }
    });
}

window.addEventListener('resize', handleResize);