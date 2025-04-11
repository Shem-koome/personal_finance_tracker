const API_URL = "http://127.0.0.1:5000";

let budgetData = {};

// Clear income on refresh
window.onload = () => {
    document.getElementById("income").value = '';
};

async function generateBudget() {
    const income = document.getElementById("income").value;
    if (!income || income <= 0) {
        alert("Please enter a valid income.");
        return;
    }

    const response = await fetch(`${API_URL}/get_budget`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ income: parseFloat(income) })
    });

    const result = await response.json();
    budgetData = result.budget;
    displayBudgetTable(budgetData);
}

function displayBudgetTable(budget) {
    const table = document.getElementById("budgetTable");
    table.innerHTML = `<tr><th>Category</th><th>Budget (KES)</th><th>Actual Spending (KES)</th></tr>`;

    for (let category in budget) {
        let row = table.insertRow();
        row.insertCell(0).innerText = category;
        row.insertCell(1).innerText = budget[category].toFixed(2);
        row.insertCell(2).innerHTML = `<input type="number" id="${category}" placeholder="Enter spent">`;
    }

    document.getElementById("step2").style.display = "block";
    document.getElementById("results").style.display = "none";
    document.getElementById("errorMsg").style.display = "none";
}

async function analyzeSpending() {
    let actualSpending = {};
    let hasEmpty = false;

    for (let category in budgetData) {
        const val = document.getElementById(category).value;
        if (!val || parseFloat(val) < 0) {
            hasEmpty = true;
            break;
        }
        actualSpending[category] = parseFloat(val);
    }

    if (hasEmpty) {
        document.getElementById("errorMsg").style.display = "block";
        return;
    } else {
        document.getElementById("errorMsg").style.display = "none";
    }

    const response = await fetch(`${API_URL}/analyze_spending`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budget: budgetData, actual_spending: actualSpending })
    });

    const result = await response.json();
    displayFeedback(result);
}

function displayFeedback(data) {
    const feedback = data.feedback;
    const overallComment = data.overall_comment;

    const table = document.getElementById("feedbackTable");
    table.innerHTML = `<tr><th>Category</th><th>Budgeted (KES)</th><th>Spent (KES)</th><th>Difference</th><th>Status</th></tr>`;

    for (let category in feedback) {
        let row = table.insertRow();
        row.insertCell(0).innerText = category;
        row.insertCell(1).innerText = feedback[category].Budgeted.toFixed(2);
        row.insertCell(2).innerText = feedback[category].Spent.toFixed(2);
        row.insertCell(3).innerText = feedback[category].Difference.toFixed(2);

        let statusCell = row.insertCell(4);
        statusCell.innerText = feedback[category].Status;

        if (feedback[category].Status === "Over Budget") {
            statusCell.classList.add("status-over");
        } else if (feedback[category].Status === "Under Budget") {
            statusCell.classList.add("status-under");
        } else if (feedback[category].Status === "On Budget") {
            statusCell.classList.add("status-on");
        }
    }

    // Display overall comment
    const commentContainer = document.getElementById("overallComment");
    commentContainer.innerText = overallComment;
    
    if (overallComment.includes("over budget")) {
        commentContainer.className = "comment-over";
    } else {
        commentContainer.className = "comment-on";
    }

    document.getElementById("results").style.display = "block";
}
