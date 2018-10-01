/*function onRowClick(tableID) {
    const table = document.getElementById(tableID);
    console.log(table);
    const rows = table.getElementsByTagName("tr");
    for (r of rows) {
        r.onclick = makeLarge(r.getElementsByTagName("td")[0])
    }
}*/

function makeLarge(cell) {
    cell.style.fontSize = "50px";
}

function toggleRowVisibility(rowExtra) {
    for (const rows of document.getElementsByClassName(rowExtra)) {
        if (rows.style.display === "table-row") {
            rows.style.display = "none";
        }
        else {
            rows.style.display = "table-row";
        }
    }
}