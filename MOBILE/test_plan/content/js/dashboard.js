/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.25566666666666665, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.12, 500, 1500, "GET Seller Product ID"], "isController": false}, {"data": [0.525, 500, 1500, "GET Buyer Order by ID"], "isController": false}, {"data": [0.2375, 500, 1500, "POST Auth Login"], "isController": false}, {"data": [0.0, 500, 1500, "POST Seller Product"], "isController": false}, {"data": [0.4125, 500, 1500, "PATCH Edit Order by ID"], "isController": false}, {"data": [0.17, 500, 1500, "GET Buyer Product"], "isController": false}, {"data": [0.2, 500, 1500, "POST Buyer Order"], "isController": false}, {"data": [0.465, 500, 1500, "GET Buyer Order"], "isController": false}, {"data": [0.1325, 500, 1500, "POST Auth Register"], "isController": false}, {"data": [0.0175, 500, 1500, "GET Seller Product"], "isController": false}, {"data": [0.2775, 500, 1500, "DELETE Seller Product by ID"], "isController": false}, {"data": [0.4425, 500, 1500, "PUT Buyer Order"], "isController": false}, {"data": [0.465, 500, 1500, "GET Buyer Product by ID"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 3000, 0, 0.0, 4123.170000000007, 66, 34610, 1632.0, 10456.000000000002, 16745.799999999992, 26237.899999999998, 4.840450678227814, 4.577629332808413, 5.125758375088943], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GET Seller Product ID", 200, 0, 0.0, 6394.740000000002, 570, 26524, 4429.5, 14979.4, 17489.299999999992, 24728.740000000016, 0.3332239248113536, 0.23299641617668865, 0.11552196612112356], "isController": false}, {"data": ["GET Buyer Order by ID", 200, 0, 0.0, 920.4000000000001, 66, 7995, 776.0, 1385.4000000000003, 2446.649999999997, 3303.170000000001, 0.3368182798016814, 0.38681474320974346, 0.11545235958045914], "isController": false}, {"data": ["POST Auth Login", 400, 0, 0.0, 2685.7550000000006, 235, 13745, 1754.0, 6493.1, 8261.2, 10523.66, 0.6494993172138428, 0.31396695509848843, 0.16998614942706042], "isController": false}, {"data": ["POST Seller Product", 200, 0, 0.0, 14914.475, 1817, 30738, 15109.0, 25756.7, 27724.05, 30244.640000000003, 0.3262339390953859, 0.21568396168708617, 3.097871609002099], "isController": false}, {"data": ["PATCH Edit Order by ID", 200, 0, 0.0, 2766.525000000001, 72, 34610, 1113.0, 3100.4000000000005, 16007.75, 30943.850000000002, 0.3376940896780425, 0.22029262881341052, 0.21513487924059355], "isController": false}, {"data": ["GET Buyer Product", 200, 0, 0.0, 2275.975000000001, 257, 7991, 1737.5, 5061.4, 5770.7, 7777.8, 0.33402420673426203, 1.553016844005685, 0.13471874744262716], "isController": false}, {"data": ["POST Buyer Order", 200, 0, 0.0, 3338.800000000001, 191, 14055, 2246.0, 7019.600000000001, 7680.049999999999, 14030.930000000006, 0.3357033993326216, 0.221616697215676, 0.1367073413297883], "isController": false}, {"data": ["GET Buyer Order", 200, 0, 0.0, 1128.5349999999994, 90, 9175, 960.5, 2224.4, 2710.75, 3674.5400000000013, 0.3365496259250908, 0.3871635345114814, 0.11338830170327767], "isController": false}, {"data": ["POST Auth Register", 400, 0, 0.0, 4559.720000000005, 343, 20030, 2864.5, 11001.400000000001, 12670.649999999998, 17199.320000000007, 0.6473497501229964, 0.35591592706957714, 0.5980288427692652], "isController": false}, {"data": ["GET Seller Product", 200, 0, 0.0, 6697.294999999998, 631, 17279, 6726.5, 10959.000000000002, 12949.899999999992, 16763.020000000004, 0.32985011610724085, 0.23128162437988178, 0.11209750039582014], "isController": false}, {"data": ["DELETE Seller Product by ID", 200, 0, 0.0, 6074.029999999999, 78, 33534, 1277.5, 22869.200000000004, 25807.8, 29481.97, 0.3381222717759196, 0.10302162968172551, 0.15957456082143426], "isController": false}, {"data": ["PUT Buyer Order", 200, 0, 0.0, 1553.9000000000008, 70, 31492, 1070.0, 2053.0, 3548.0999999999967, 21720.860000000044, 0.33716294242099853, 0.21961687753399026, 0.1300579709534125], "isController": false}, {"data": ["GET Buyer Product by ID", 200, 0, 0.0, 1291.925, 76, 5179, 876.0, 3039.9000000000005, 4017.2999999999993, 4767.31, 0.3349511473751553, 0.28163372840821166, 0.11579365836992675], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 3000, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
