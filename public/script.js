// Handle Signup with validation 
document.getElementById('SignupForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name')?.value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!name || !email || !password) {
        alert('All fields are required!');
        return;
    }

    try {
        const response = await axios.post('http://localhost:3000/api/signup', { name, email, password });

        if (response.data.success) {
            alert('Signup successful!');
            window.location.href = 'login.html';
        } else {
            alert(response.data.message);
        }
    } catch (error) {
        console.error('Error during signup:', error);
        alert('Signup failed');
    }
});

// Handle Login with Validation
document.getElementById('LoginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
        alert('Both fields are required!');
        return;
    }

    try {
        const response = await axios.post('http://localhost:3000/api/login', { email, password });

        if (response.data.success) {
            const isPremium = response.data.user.isPremium; 
            localStorage.setItem('authToken', response.data.token);
            localStorage.setItem('isPremium', isPremium); 

            alert('Login successful!');
            window.location.href = 'dashboard.html';
        } else {
            alert(response.data.message);
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('Login failed. Please check your credentials and try again.');
    }
});

document.getElementById('newUserBtn')?.addEventListener('click', () => {
    window.location.href = 'signup.html';
});

// Switch to Signup page from Login page
document.getElementById('newUserBtn')?.addEventListener('click', () => {
    window.location.href = 'signup.html';
});

// Switch to Login page from Signup page
document.getElementById('loginBtn')?.addEventListener('click', () => {
    window.location.href = 'login.html';
});


//below is forgot pass code
document.getElementById('forgotPasswordBtn')?.addEventListener('click', () => {
    document.getElementById('ForgotPasswordForm').style.display = 'block';
    document.getElementById('LoginForm').style.display = 'none';
});
document.getElementById('ForgotPasswordForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('forgotEmail').value;

    try {
        const response = await axios.post('http://localhost:3000/password/forgotpassword', { email });
        alert(response.data.message);
        document.getElementById('ForgotPasswordForm').style.display = 'none';
        document.getElementById('LoginForm').style.display = 'block';
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to send reset link.');
    }
});


//this is leaderboard code
function displayLeaderboard(leaderboard) {
    const leaderboardList = document.getElementById('leaderboard-list');
    leaderboardList.innerHTML = ''; 

    leaderboard.forEach(entry => {
        const listItem = document.createElement('li');
        listItem.textContent = `${entry.userName}: ₹${entry.totalExpense}`;
        leaderboardList.appendChild(listItem);
    });
}
document.getElementById('show-leaderboard').addEventListener('click', async () => {
    const token = localStorage.getItem('authToken');

    // if (!token) {
    //     alert('You need to log in to view the leaderboard.');
    //     return;
    // }

    try {
        const response = await axios.get('http://localhost:3000/api/premium/showleaderboard', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
            displayLeaderboard(response.data.leaderboard);
        } else {
            alert('Failed to fetch leaderboard data.');
        }
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        alert('Error fetching leaderboard. Please try again later.');
    }
});







// this is expenses adding code

document.addEventListener('DOMContentLoaded', () => {
    const expForm = document.getElementById('expense-form');
    const expList = document.getElementById('expense-list');
    const buyPremiumBtn = document.getElementById('buy-premium');
    let editingExpense = null;

    expForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const amount = expForm['amount'].value;
        const description = expForm['description'].value;
        const category = expForm['category'].value;
        const token = localStorage.getItem('authToken');

        // if (!token) {
        //     console.log('No token found. Please log in again.');
        //     return;
        // }

        try {
            if (editingExpense) {
                const response = await axios.put(`/api/expenses/${editingExpense.id}`,
                    { amount, description, category },
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );
                if (response.data && response.data.expense) {
                    displayExpense(response.data.expense);
                    editingExpense = null;
                    expForm.reset();
                }
            } else {
                const response = await axios.post('/api/expenses',
                    { amount, description, category },
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );
                if (response.data && response.data.expense) {
                    displayExpense(response.data.expense);
                    expForm.reset();
                }
            }
        } catch (err) {
            console.log('Error Updating/Editing Expense', err.message);
        }
    });

    async function fetchExpenses() {
        const token = localStorage.getItem('authToken');
        // if (!token) {
        //     console.log('No token found. Please log in again.');
        //     return;
        // }

        try {
            const response = await axios.get('/api/expenses', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const expenses = response.data.expenses;

            if (expenses && Array.isArray(expenses)) {
                expList.innerHTML = '';
                expenses.forEach(expense => displayExpense(expense));
            }
        } catch (error) {
            console.log('Error fetching expenses:', error.message);
        }
    }

    function displayExpense(expense) {
        const expenseContainer = document.createElement('li');

        const expenseText = document.createElement('span');
        expenseText.textContent = `${expense.amount}, ${expense.description}, ${expense.category}`;

        const editBtn = document.createElement('button');
        editBtn.setAttribute('data-id', expense.id);
        editBtn.textContent = 'Edit';

        const deleteBtn = document.createElement('button');
        deleteBtn.setAttribute('data-id', expense.id);
        deleteBtn.textContent = 'Delete';

        expenseContainer.appendChild(expenseText);
        expenseContainer.appendChild(editBtn);
        expenseContainer.appendChild(deleteBtn);
        expList.appendChild(expenseContainer);

        editBtn.addEventListener('click', () => {
            expForm['amount'].value = expense.amount;
            expForm['description'].value = expense.description;
            expForm['category'].value = expense.category;
            editingExpense = expense;
        });

        deleteBtn.addEventListener('click', async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await axios.delete(`/api/expenses/${expense.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.data && response.data.success) {
                    expenseContainer.remove();
                }
            } catch (error) {
                console.log('Error Deleting Expense:', error.message);
            }
        });
    }



 //razorpay premium code

 //premium user code 
document.addEventListener('DOMContentLoaded', () => {
    const buyPremiumBtn = document.getElementById('buy-premium');
    const premiumMessage = document.getElementById('premium-message');
    const isPremium = localStorage.getItem('isPremium') === 'true';

    if (isPremium) {
        buyPremiumBtn.hidden = true; // Hide button if the user is premium
        premiumMessage.textContent = 'You are a premium user!'; 
    } else {
        buyPremiumBtn.hidden = false; // Show button if the user is not premium
        premiumMessage.textContent = ''; 
    }
});
    buyPremiumBtn.addEventListener('click', async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get('http://localhost:3000/purchase/premiummember', {
                headers: { Authorization: `Bearer ${token}` },
            });
    
            const options = {
                key: response.data.key_id,
                order_id: response.data.order.id,
                handler: async (paymentResponse) => {
                    try {
                        const updateResponse = await axios.post(
                            'http://localhost:3000/purchase/updatetransactionstatus',
                            {
                                order_id: options.order_id,
                                payment_id: paymentResponse.razorpay_payment_id,
                            },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
    
                        localStorage.setItem('isPremium', 'true'); 
                        alert('You are now a premium user!');
                        buyPremiumBtn.style.display = 'none'; // Hide the button
                    } catch (err) {
                        console.error('Error updating premium status:', err.message);
                    }
                },
            };
            const rzp = new Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error('Error initiating premium membership:', err.message);
        }
    });
    

    fetchExpenses();
});
