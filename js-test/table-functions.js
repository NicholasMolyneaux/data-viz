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

function toggleRowVisibility(row, rowExtra) {
    console.log(row)
    if (document.getElementById(rowExtra).style.display === "table-cell") {
            document.getElementById(rowExtra).style.display = "none";
        }
        else {
            document.getElementById(rowExtra).style.display = "table-cell";
        }

}