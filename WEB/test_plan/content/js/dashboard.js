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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.24597222222222223, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.2175, 500, 1500, "GET List Product"], "isController": false}, {"data": [0.5025, 500, 1500, "GET List Categories"], "isController": false}, {"data": [0.555, 500, 1500, "GET Categories by ID"], "isController": false}, {"data": [0.4125, 500, 1500, "DELETE Product"], "isController": false}, {"data": [0.055, 500, 1500, "POST Sign In User"], "isController": false}, {"data": [0.3875, 500, 1500, "GET List Offers"], "isController": false}, {"data": [0.35, 500, 1500, "GET List Product by ID"], "isController": false}, {"data": [0.0825, 500, 1500, "PUT Update Product"], "isController": false}, {"data": [0.3875, 500, 1500, "PUT Update Offer"], "isController": false}, {"data": [0.12125, 500, 1500, "POST Create Users"], "isController": false}, {"data": [0.3975, 500, 1500, "POST Create Offer"], "isController": false}, {"data": [0.00875, 500, 1500, "PUT Update Profile"], "isController": false}, {"data": [0.215, 500, 1500, "POST Create Product"], "isController": false}, {"data": [0.275, 500, 1500, "GET Get Profile"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 3600, 0, 0.0, 1902.2994444444398, 30, 6879, 1670.0, 3420.7000000000003, 4170.499999999998, 5564.619999999992, 10.410641989589358, 25.8012189804439, 31.043300860323885], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GET List Product", 200, 0, 0.0, 1675.31, 667, 5030, 1560.5, 2255.7000000000003, 2419.95, 4571.610000000005, 0.6073323231372358, 7.895118547473649, 0.24969424613357058], "isController": false}, {"data": ["GET List Categories", 200, 0, 0.0, 1279.555, 121, 5383, 1024.0, 3261.2, 3700.95, 5370.580000000002, 0.6070336994758264, 0.634302791444467, 0.10433391709740766], "isController": false}, {"data": ["GET Categories by ID", 200, 0, 0.0, 1130.9249999999995, 115, 5124, 981.0, 2465.600000000001, 3514.149999999999, 5032.170000000001, 0.6095312399998781, 0.43393386128897576, 0.10595367257810381], "isController": false}, {"data": ["DELETE Product", 200, 0, 0.0, 1368.7249999999997, 37, 5851, 959.0, 2865.6, 4194.25, 4937.2400000000025, 0.6309068655285107, 0.5416249183764242, 0.2766378736545911], "isController": false}, {"data": ["POST Sign In User", 400, 0, 0.0, 2465.9249999999993, 502, 6260, 2419.0, 3346.000000000001, 4170.799999999999, 5892.750000000003, 1.1629428268232762, 2.084393307264032, 0.43383218735008944], "isController": false}, {"data": ["GET List Offers", 200, 0, 0.0, 1530.14, 60, 5807, 986.5, 3600.100000000001, 4169.75, 5523.27, 0.6277404795309522, 2.0107465491928824, 0.26421498699007856], "isController": false}, {"data": ["GET List Product by ID", 200, 0, 0.0, 1352.7950000000005, 484, 5283, 1128.5, 2142.7000000000003, 2638.449999999998, 4741.750000000001, 0.6091172672562921, 1.3164338744198159, 0.2587558703676632], "isController": false}, {"data": ["PUT Update Product", 200, 0, 0.0, 1988.9300000000012, 1046, 5581, 1820.5, 2640.9, 3589.099999999998, 5100.310000000006, 0.6054239935582887, 1.291684506178352, 7.319765277117698], "isController": false}, {"data": ["PUT Update Offer", 200, 0, 0.0, 1438.6449999999995, 58, 5665, 922.0, 3350.1, 3985.049999999999, 5584.550000000004, 0.6293266205160478, 1.9964618814899306, 0.30360092825676527], "isController": false}, {"data": ["POST Create Users", 400, 0, 0.0, 2085.6550000000016, 529, 6126, 1960.5, 2998.100000000001, 3552.2999999999997, 5196.2400000000025, 1.1631592568575508, 2.085093596154014, 0.448679596151106], "isController": false}, {"data": ["POST Create Offer", 200, 0, 0.0, 1540.595, 91, 6011, 1115.5, 3450.600000000001, 4485.949999999996, 5525.860000000001, 0.6270536005417743, 1.9923525914557676, 0.32393686981113146], "isController": false}, {"data": ["PUT Update Profile", 400, 0, 0.0, 3172.3474999999994, 1008, 6879, 3062.0, 4506.7000000000035, 5592.549999999999, 6618.96, 1.1645883616862076, 1.7014476743170417, 14.045231338199372], "isController": false}, {"data": ["POST Create Product", 200, 0, 0.0, 1779.37, 441, 5725, 1583.5, 2598.2000000000003, 4509.349999999999, 5660.210000000001, 0.60714795284889, 1.2958072971215115, 7.336268324484152], "isController": false}, {"data": ["GET Get Profile", 400, 0, 0.0, 1854.2724999999998, 30, 5359, 1533.0, 3462.5000000000005, 4530.4, 5150.210000000002, 1.1755612570276521, 1.717255062628026, 0.483311805867814], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 3600, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
