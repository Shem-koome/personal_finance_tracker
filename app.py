from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/get_budget', methods=['POST'])
def get_budget():
    data = request.get_json()
    income = data.get('income', 0)

    budget = {
        "Basic Needs (50%)": income * 0.50,
        "Savings & Investments (20%)": income * 0.20,
        "Wants (20%)": income * 0.20,
        "Miscellaneous/Charity (10%)": income * 0.10,
    }
    return jsonify({"budget": budget})

@app.route('/analyze_spending', methods=['POST'])
def analyze_spending():
    data = request.get_json()
    budget = data['budget']
    actual = data['actual_spending']
    feedback = {}
    total_budget = sum(budget.values())
    total_spent = sum(actual.values())

    for category in budget:
        b = budget[category]
        a = actual.get(category, 0)
        diff = b - a
        status = "Under Budget" if diff >= 0 else "Over Budget"
        feedback[category] = {
            "Budgeted": b,
            "Spent": a,
            "Difference": diff,
            "Status": status
        }

    # Determine overall comment
    if total_spent > total_budget:
        overall_comment = "You are over budget. Consider reducing non-essential expenses."
    elif total_spent == total_budget:
        overall_comment = "You are on budget. Well done!"
    else:
        overall_comment = "You are under budget. Great job saving!"

    return jsonify({
        "feedback": feedback,
        "overall_comment": overall_comment
    })

if __name__ == '__main__':
    app.run(debug=True)
