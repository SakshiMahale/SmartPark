document.addEventListener('DOMContentLoaded', function() {
    // Enhanced parking data with all required properties
    const parkingData = {
        bandra: {
            name: "Bandra Parking Lot",
            price: 60,
            slots: generateSlots(),
            address: "Near Bandra Station"
        },
        juhu: {
            name: "Juhu Beach Parking",
            price: 50,
            slots: generateSlots(),
            address: "Opposite Juhu Beach"
        },
        andheri: {
            name: "Andheri Parking",
            price: 40,
            slots: generateSlots(),
            address: "Near Andheri Station"
        },
        colaba: {
            name: "Colaba Parking",
            price: 70,
            slots: generateSlots(),
            address: "Near Gateway of India"
        },
        dadar: {
            name: "Dadar Parking",
            price: 45,
            slots: generateSlots(),
            address: "Near Dadar Station"
        },
        powai: {
            name: "Powai Parking",
            price: 55,
            slots: generateSlots(),
            address: "Near Hiranandani Complex"
        }
    };

    let currentLocation = null;
    let selectedSlot = null;

    // Improved slot generation with consistent randomness
    function generateSlots() {
        const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
        const slots = [];
        const now = new Date();
        const randomSeed = now.getDate() + now.getMonth(); // Daily changing pattern
        
        rows.forEach((row, rowIndex) => {
            slots.push(
                { 
                    id: `${row}1`, 
                    status: (randomSeed + rowIndex) % 3 !== 0 ? 'available' : 'booked' 
                },
                { 
                    id: `${row}2`, 
                    status: (randomSeed + rowIndex + 1) % 3 !== 0 ? 'available' : 'booked' 
                }
            );
        });
        
        return slots;
    }

    // Enhanced location button initialization
    function initializeLocationButtons() {
        document.querySelectorAll('.location-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                currentLocation = this.dataset.location;
                showParkingGrid(currentLocation);
                
                // Reset form when changing location
                document.getElementById('booking-form').style.display = 'none';
                document.getElementById('selected-slot').textContent = 'None';
                selectedSlot = null;
            });
        });
    }

    // Improved parking grid display
    function showParkingGrid(location) {
        const locationData = parkingData[location];
        if (!locationData) return;
        
        document.getElementById('parking-location-name').textContent = 
            `${locationData.name} (${locationData.address})`;
        document.getElementById('price-per-hour').textContent = locationData.price;
        
        const grid = document.querySelector('.parking-grid');
        grid.innerHTML = '';
        
        locationData.slots.forEach(slot => {
            const slotElement = document.createElement('div');
            slotElement.className = `slot ${slot.status === 'available' ? 'green' : 'red'}`;
            slotElement.textContent = slot.id;
            slotElement.title = slot.status === 'available' ? 'Available' : 'Booked';
            
            if (slot.status === 'available') {
                slotElement.addEventListener('click', () => selectSlot(slot.id));
                slotElement.style.cursor = 'pointer';
            } else {
                slotElement.style.cursor = 'not-allowed';
            }
            
            grid.appendChild(slotElement);
        });
        
        document.getElementById('parking-display').style.display = 'block';
    }

    // Enhanced slot selection
    function selectSlot(slotId) {
        selectedSlot = slotId;
        document.getElementById('selected-slot').textContent = slotId;
        
        // Update visual selection
        document.querySelectorAll('.slot').forEach(slot => {
            slot.classList.remove('selected');
            if (slot.textContent === slotId) {
                slot.classList.add('selected');
            }
        });
        
        // Show booking form with animation
        const bookingForm = document.getElementById('booking-form');
        bookingForm.style.display = 'block';
        bookingForm.style.opacity = 0;
        let opacity = 0;
        const fadeIn = setInterval(() => {
            opacity += 0.1;
            bookingForm.style.opacity = opacity;
            if (opacity >= 1) clearInterval(fadeIn);
        }, 50);
        
        // Set default date and time
        const now = new Date();
        document.getElementById('booking-date').min = now.toISOString().split('T')[0];
        document.getElementById('booking-date').valueAsDate = now;
        
        // Set time to next hour
        const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
        document.getElementById('booking-time').value = 
            `${String(nextHour.getHours()).padStart(2, '0')}:00`;
        
        calculateAmount();
    }

    // Robust amount calculation
    function calculateAmount() {
        const duration = document.getElementById('duration').value;
        const pricePerHour = parseInt(document.getElementById('price-per-hour').textContent) || 0;
        
        if (duration && pricePerHour > 0) {
            const total = duration * pricePerHour;
            document.getElementById('total-amount').textContent = `₹${total}`;
            document.getElementById('total-amount').style.color = total > 200 ? '#e74c3c' : '#2ecc71';
        } else {
            document.getElementById('total-amount').textContent = '₹0';
        }
    }

    // Initialize form validation
    function initializeFormValidation() {
        document.getElementById('duration').addEventListener('change', calculateAmount);
        
        document.getElementById('booking-date').addEventListener('change', function() {
            const selectedDate = new Date(this.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                alert("Please select today's date or a future date");
                this.value = '';
            }
        });
    }

    // Enhanced payment processing
    function initializePaymentButton() {
        document.getElementById('proceed-to-pay').addEventListener('click', function() {
            if (!validateBookingForm()) return;
            
            const bookingDetails = getBookingDetails();
            if (confirm(`Confirm booking for ₹${bookingDetails.totalAmount}?`)) {
                redirectToPayment(bookingDetails);
            }
        });
    }

    function validateBookingForm() {
        const errors = [];
        
        if (!currentLocation) {
            errors.push('Please select a location first');
        }
        
        if (!selectedSlot) {
            errors.push('Please select a parking slot');
        }
        
        const date = document.getElementById('booking-date').value;
        if (!date) {
            errors.push('Please select a date');
        }
        
        const time = document.getElementById('booking-time').value;
        if (!time) {
            errors.push('Please select a time');
        }
        
        const duration = document.getElementById('duration').value;
        if (!duration) {
            errors.push('Please select duration');
        }
        
        if (errors.length > 0) {
            alert(errors.join('\n'));
            return false;
        }
        
        return true;
    }

    function getBookingDetails() {
        const pricePerHour = parseInt(document.getElementById('price-per-hour').textContent);
        const duration = document.getElementById('duration').value;
        
        return {
            location: parkingData[currentLocation].name,
            slot: selectedSlot,
            date: document.getElementById('booking-date').value,
            time: document.getElementById('booking-time').value,
            duration: duration,
            pricePerHour: pricePerHour,
            totalAmount: duration * pricePerHour,
            address: parkingData[currentLocation].address
        };
    }

    function redirectToPayment(booking) {
        window.location.href = `paymentbywallet.html?` +
            `location=${encodeURIComponent(booking.location)}` +
            `&slot=${encodeURIComponent(booking.slot)}` +
            `&date=${booking.date}` +
            `&time=${booking.time}` +
            `&duration=${booking.duration}` +
            `&pricePerHour=${booking.pricePerHour}` +
            `&total=${booking.totalAmount}` +
            `&address=${encodeURIComponent(booking.address)}`;
    }

    // Initialize everything
    initializeLocationButtons();
    initializeFormValidation();
    initializePaymentButton();
});