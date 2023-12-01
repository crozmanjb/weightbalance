function handleCellClick(cell) {
	const selectedRow = cell.dataset.row;

	// Deselect other cells in the same row
	document.querySelectorAll(`.selectable-cell[data-row="${selectedRow}"]`).forEach((cell) => {
		cell.classList.remove('selected');
	});

	// Select the clicked cell
	cell.classList.add('selected');

	document.querySelector(`.score-cell[data-row="${selectedRow}"]`).innerHTML = cell.dataset.col;
	updateTotal();
}

function updateTotal() {
	let total = 0;
	let fiveCount = 0;
	let riskCat = 0;
	document.querySelectorAll(`.selected`).forEach((cell) => {
		total += parseInt(cell.dataset.col);
		if (parseInt(cell.dataset.col) == 5)
			fiveCount++;
	});
	document.getElementById("totalRisk").innerHTML = `${total}`;
	if (total <= 20 && fiveCount < 2){
		riskCat = 0;
		document.getElementById("risk0").classList.remove("hidden");
		document.getElementById("risk1").classList.add("hidden");
		document.getElementById("risk2").classList.add("hidden");
	} else if (fiveCount == 2 || fiveCount < 2 && total > 20 && total <= 32){
		riskCat = 1;
		document.getElementById("risk0").classList.add("hidden");
		document.getElementById("risk1").classList.remove("hidden");
		document.getElementById("risk2").classList.add("hidden");
	} else if (fiveCount > 2 || total > 32){
		riskCat = 2;
		document.getElementById("risk0").classList.add("hidden");
		document.getElementById("risk1").classList.add("hidden");
		document.getElementById("risk2").classList.remove("hidden");
	}
	
	let riskData = {"riskScore": total, "riskCat": riskCat};
	sessionStorage.setItem("riskData", JSON.stringify(riskData));
}

function clear() {
	for(let i = 0; i < 10; i++) {
		document.querySelectorAll(`.selectable-cell[data-row="${i}"]`).forEach((cell) => {
		cell.classList.remove('selected');
	});
		document.querySelector(`.score-cell[data-row="${i}"]`).innerHTML = "";

	}
	document.getElementById("risk0").classList.add("hidden");
	document.getElementById("risk1").classList.add("hidden");
	document.getElementById("risk2").classList.add("hidden");
	document.getElementById("totalRisk").innerHTML = "";
	sessionStorage.removeItem("riskData");
}

document.getElementById("clearButton").addEventListener("click", clear);
