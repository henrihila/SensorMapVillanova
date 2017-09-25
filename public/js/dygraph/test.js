/**
 * Created by enea on 12/12/16.
 */



var dygraphs = {};
var dygraphParams = {
    "labels": ["Time", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l"],
    "connectSeparatedPoints": true,
    "rollPeriod": 15,
//	"strokeWidth": 1.2,
    "showLabelsOnHighlight": true,
//	"highlightCircleSize": 1.2,
    "highlightSeriesOpts": {
//		strokeBorderWidth: 1.2,
//		"strokeWidth": 1.4,
//		"highlightCircleSize": 5
    },
    "labelsDivStyles": {
        'text-align': 'right',
        'background': 'none'
    },
    "drawPoints": false, //Making this true really affects the performance
    "title": "Test",
    "showRoller": false,
    "showRangeSelector": true,
    "fillGraph": false,
    series: {
        'i': {axis: 'y2'},
        'j': {axis: 'y2'},
        'k': {axis: 'y2'},
        'l': {axis: 'y2'},
    },
    axes: {
//		y2: {"valueRange": [0, 30]}
    },
    "legend": 'always',
    "ylabel": 'Primary y-axis',
    "y2label": 'Secondary y-axis',
    "labelsDivWidth": 150,
    "labelsSeparateLines": true,
    labelsDiv: document.getElementById('status')
//	"valueRange": [],
};

//
// dygraphs["dygraph-1"] = new Dygraph(document.getElementById("dygraph-1"), d, dygraphParams);
// dygraphs["dygraph-2"] = new Dygraph(document.getElementById("dygraph-2"), d, dygraphParams);


var graph = null;
var graph2 = null;
var metrics = null;
var dataType = "sine";
var timestamps = "aligned";
var numRuns = 0;
var numRuns2 = 0;

var durations = [];
var durations2 = [];


// updatePlot = function () {
//
//     console.log('trying to update');
//     document.getElementById('message').innerHTML = "";
//
//     var plotDiv = document.getElementById('plot');
//     plotDiv.innerHTML = 'Redrawing...';
//
//     var plotDiv2 = document.getElementById('plot2');
//     plotDiv2.innerHTML = 'Redrawing...';
//
//     var numeric = document.getElementById('numeric').checked;
//     var numPoints = parseInt(document.getElementById('points').value);
//     var numSeries = 1;
//     var repetitions = parseInt(document.getElementById('repetitions').value);
//
//     var data = [];
//     var xmin = numeric ? 0.0 : Date.parse("2014/01/01");
//     var xmax = numeric ? 2.0 * Math.PI : Date.parse("2014/12/31");
//     var adj = .5;
//     var delta = (xmax - xmin) / (numPoints - 1);
//
//     for (var i = 0; i < numPoints; ++i) {
//
//         var x = xmin + delta * i;
//         var elem = [x];
//
//         for (var j = 0; j < numSeries; j++) {
//             var y;
//             if (dataType == "rand") {
//                 y = Math.pow(Math.random() - Math.random(), 7);
//             } else {
//                 y = Math.sin(x + (j * adj));
//             }
//             elem.push(y);
//         }
//
//         if (timestamps == "aligned") {
//             data[i] = elem;
//         }
//         if (!numeric) data[i][0] = new Date(data[i][0]);
//
//     }
//
//     var labels = ["x"];
//     for (var j = 0; j < numSeries; j++) {
//         labels.push("data-set-" + j);
//     }
//
//     var rollPeriod = parseInt(document.getElementById('rollPeriod').value);
//     var opts = {labels: labels, rollPeriod: rollPeriod, timingName: "x"};
//
//     opts['fillGraph'] = document.getElementById('fill').checked;
//
//     var millisecondss = [];
//     var millisecondss2 = [];
//
//     for (var i = 0; i < repetitions; i++) {
//         if (graph != null) {
//             graph.destroy(); // release memory from prior graph.
//         }
//         if (graph2 != null) {
//             graph2.destroy(); // release memory from prior graph.
//         }
//
//
//         var start = new Date();
//         graph = new Dygraph(plotDiv, data, opts);
//         var end = new Date();
//         durations.push([numRuns++, end - start]);
//         millisecondss.push(end - start);
//
//
//         // adjust
//         // console.log('data', data);
//
//         var adjusted = [];
//         var l = data.length;
//         var i = 0;
//
//         for (; i < l; i++) {
//             if (i % 2 == 0)
//                 adjusted.push(data[i]);
//         }
//
//
//         // console.log('adjusted', adjusted);
//
//         var start2 = new Date();
//         graph2 = new Dygraph(plotDiv2, adjusted, opts);
//         var end2 = new Date();
//         durations2.push([numRuns2++, end2 - start2]);
//         millisecondss2.push(end2 - start2);
//
//     }
//
//     if (repetitions == 1) {
//         document.getElementById('message').innerHTML = "completed in " + (end - start) + " milliseconds.";
//         document.getElementById('message2').innerHTML = "completed in " + (end2 - start2) + " milliseconds!";
//     } else {
//         var avg = 0;
//         for (var i = 0; i < millisecondss.length; i++) {
//             avg += millisecondss[i];
//         }
//         avg /= millisecondss.length;
//         document.getElementById('message').innerHTML = "Durations: " + millisecondss + "<br>Average: " + avg;
//
//
//         var avg2 = 0;
//         for (var i2 = 0; i < millisecondss2.length; i2++) {
//             avg2 += millisecondss2[i2];
//         }
//         avg2 /= millisecondss2.length;
//         document.getElementById('message2').innerHTML = "Durations: " + millisecondss2 + "<br>Average: " + avg2;
//
//     }
//
//     return millisecondss;
// };

var plotData = [];

var opts = {};
var numeric = null;
var numPoints = null;
var numSeries = null;
var repetitions = null;
var labels = ["x"];
var rollPeriod = null;

var generateData = function () {

    numeric = document.getElementById('numeric').checked;
    numPoints = parseInt(document.getElementById('points').value);
    numSeries = parseInt(document.getElementById('series').value);
    repetitions = parseInt(document.getElementById('repetitions').value);

    var data = [];
    var xmin = numeric ? 0.0 : Date.parse("2014/01/01");
    var xmax = numeric ? 2.0 * Math.PI : Date.parse("2014/12/31");
    var adj = .5;
    var delta = (xmax - xmin) / (numPoints - 1);
    var unalignmentDelta = delta / numSeries;

    for (var i = 0; i < numPoints; ++i) {
        var x = xmin + delta * i;
        var elem = [x];
        for (var j = 0; j < numSeries; j++) {
            var y;
            if (dataType == "rand") {
                y = Math.pow(Math.random() - Math.random(), 7);
            } else {
                y = Math.sin(x + (j * adj));
            }
            elem.push(y);
        }
        if (timestamps == "aligned") {
            data[i] = elem;
        } else {
            for (var j = 0; j < numSeries; j++) {
                var elemCopy = elem.slice(0);
                elemCopy[0] += unalignmentDelta * j;
                data[i * numSeries + j] = elemCopy;
            }
        }
        if (!numeric) data[i][0] = new Date(data[i][0]);
    }
    var labels = ["x"];
    for (var j = 0; j < numSeries; j++) {
        labels.push("data-set-" + j);
    }

    rollPeriod = parseInt(document.getElementById('rollPeriod').value);
    opts = {labels: labels, rollPeriod: rollPeriod, timingName: "x"};
    opts['fillGraph'] = document.getElementById('fill').checked;

    return data;
};

updatePlot1 = function () {

    document.getElementById('message').innerHTML = "";
    var plotDiv = document.getElementById('plot');
    plotDiv.innerHTML = 'Redrawing...';

    var data = plotData;
    console.log(data.length);

    var millisecondss = [];
    for (var i = 0; i < repetitions; i++) {
        if (graph != null) {
            graph.destroy(); // release memory from prior graph.
        }
        var start = new Date();
        graph = new Dygraph(plotDiv, data, opts);
        var end = new Date();
        durations.push([numRuns++, end - start]);
        millisecondss.push(end - start);
    }
    if (repetitions == 1) {
        document.getElementById('message').innerHTML = "completed in " + (end - start) + " milliseconds.";
    } else {
        var avg = 0;
        for (var i = 0; i < millisecondss.length; i++) {
            avg += millisecondss[i];
        }
        avg /= millisecondss.length;
        document.getElementById('message').innerHTML =
            "Durations: " + millisecondss + "<br>Average: " + avg;
    }

    // if (durations.length > 0) {
    //     var start2 = new Date();
    //     if (!metrics) {
    //         metrics = new Dygraph(
    //             document.getElementById('metrics'),
    //             durations,
    //             {
    //                 highlightCircleSize: 4,
    //                 labels: ["Date", "ms"]
    //             });
    //     } else {
    //         metrics.updateOptions({file: durations});
    //     }
    //     var end2 = new Date();
    //     document.getElementById("metaperformance").innerHTML =
    //         "completed in " + (end2 - start2) + " milliseconds.";
    // }

    return millisecondss;
};

updatePlot2 = function () {

    document.getElementById('message2').innerHTML = "";
    var plotDiv2 = document.getElementById('plot2');
    plotDiv2.innerHTML = 'Redrawing...';

    var d = plotData;

    var data = [];
    var l = d.length;
    var i = 0;
    for (; i < l; i++) {
        if (i % 2 == 0)
            data.push(d[i]);
    }

    console.log(data.length);

    var millisecondss = [];
    for (var i = 0; i < repetitions; i++) {
        if (graph2 != null) {
            graph2.destroy(); // release memory from prior graph.
        }
        var start = new Date();
        graph2 = new Dygraph(plotDiv2, data, opts);
        var end = new Date();
        durations2.push([numRuns++, end - start]);
        millisecondss.push(end - start);
    }
    if (repetitions == 1) {
        document.getElementById('message2').innerHTML =
            "completed in " + (end - start) + " milliseconds.";
    } else {
        var avg = 0;
        for (var i = 0; i < millisecondss.length; i++) {
            avg += millisecondss[i];
        }
        avg /= millisecondss.length;
        document.getElementById('message2').innerHTML =
            "Durations: " + millisecondss + "<br>Average: " + avg;
    }

    // if (durations2.length > 0) {
    //     var start2 = new Date();
    //     if (!metrics) {
    //         metrics = new Dygraph(
    //             document.getElementById('metrics'),
    //             durations2,
    //             {
    //                 highlightCircleSize: 4,
    //                 labels: ["Date", "ms"]
    //             });
    //     } else {
    //         metrics.updateOptions({file: durations2});
    //     }
    //     var end2 = new Date();
    //     document.getElementById("metaperformance").innerHTML =
    //         "completed in " + (end2 - start2) + " milliseconds.";
    // }

    return millisecondss;
};

updatePlot = function () {
    plotData = [];
    plotData = generateData();
    updatePlot1();
    updatePlot2();

};

setDataType = function (radiobutton) {
    dataType = radiobutton.value;
};
setTimestampType = function (radiobutton) {
    timestamps = radiobutton.value;
};

var values = {
    points: 100,
    series: 1,
    rollPeriod: 1,
    repetitions: 1,
    type: 'sine'
};

// Parse the URL for parameters. Use it to override the values hash.
var href = window.location.href;
var qmindex = href.indexOf('?');
if (qmindex > 0) {
    var entries = href.substr(qmindex + 1).split('&');
    for (var idx = 0; idx < entries.length; idx++) {
        var entry = entries[idx];
        var eindex = entry.indexOf('=');
        if (eindex > 0) {
            values[entry.substr(0, eindex)] = entry.substr(eindex + 1);
        }
    }
}

var populate = function (name) {
    document.getElementById(name).value = values[name];
}

var populateRadio = function (name) {
    var val = values[name];
    var elem = document.getElementById(val);
    elem.checked = true;
    elem.onclick();
}

populate('points');
populate('series');
populate('rollPeriod');
populate('repetitions');
populateRadio('type');
if (values["go"]) {
    updatePlot();
}
