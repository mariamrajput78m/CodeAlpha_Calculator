const expressionEl = document.getElementById("expression");
const resultEl = document.getElementById("result");
const buttons = document.querySelectorAll(".buttons button");
const historyPanel = document.getElementById("historyPanel");
const historyBtn = document.getElementById("historyBtn");

let output = "";
let history = JSON.parse(localStorage.getItem("calcHistory") || "[]");

const safeEval = (expr) => {
    try {
        const cleaned = expr.replace(/%/g, "/100");
        if (!/^[0-9+\-*/.() ]+$/.test(cleaned)) return null;
        const result = Function('"use strict";return (' + cleaned + ')')();
        if (!isFinite(result)) return null;
        return result;
    } catch {
        return null;
    }
};

const updateDisplay = () => {
    expressionEl.textContent = output;
    if (output === "") {
        resultEl.textContent = "0";
        return;
    }
    const preview = safeEval(output);
    resultEl.textContent = preview === null ? "" : preview;
};

const renderHistory = () => {
    historyPanel.innerHTML = history
        .slice(-10)
        .reverse()
        .map((h, i) => `<div class="history-item" data-i="${history.length - 1 - i}">${h.expr} = ${h.result}</div>`)
        .join("");
};

const calculate = (btnValue) => {
    if (btnValue === "=") {
        const res = safeEval(output);
        if (res === null) {
            resultEl.textContent = "Error";
            output = "";
            return;
        }
        history.push({ expr: output, result: res });
        localStorage.setItem("calcHistory", JSON.stringify(history));
        renderHistory();
        output = Number(res.toFixed(8)).toString();
        expressionEl.textContent = "";
        resultEl.textContent = output;
    } else if (btnValue === "AC") {
        output = "";
        updateDisplay();
    } else if (btnValue === "DEL") {
        output = output.slice(0, -1);
        updateDisplay();
    } else {
        output += btnValue;
        updateDisplay();
    }
};

buttons.forEach((button) => {
    button.addEventListener("click", (e) => {
        const btnEl = e.currentTarget;
        btnEl.classList.add("pressed");
        setTimeout(() => btnEl.classList.remove("pressed"), 120);
        calculate(btnEl.dataset.value);
    });
});

historyBtn.addEventListener("click", () => {
    historyPanel.classList.toggle("show");
});

historyPanel.addEventListener("click", (e) => {
    const item = e.target.closest(".history-item");
    if (!item) return;
    output = history[item.dataset.i].result.toString();
    updateDisplay();
});

const btn = document.getElementById("btn");

btn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        btn.innerHTML = '<i class="bi bi-brightness-high-fill"></i>';
    } else {
        btn.innerHTML = '<i class="bi bi-moon-fill"></i>';
    }
});

document.addEventListener("keydown", (e) => {
    const key = e.key;
    if (/[0-9.]/.test(key)) calculate(key);
    else if (["+", "-", "*", "/", "%"].includes(key)) calculate(key);
    else if (key === "Enter") { e.preventDefault(); calculate("="); }
    else if (key === "Backspace") calculate("DEL");
    else if (key === "Escape") calculate("AC");
});

renderHistory();