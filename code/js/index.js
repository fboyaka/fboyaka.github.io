// index.js
// File constants
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

let p1Chart = "";
let p2Chart = "";
let pieChart = "";
let allInputs = {};

/**
 * Plugin which draws a vertical line on the given chart. 
 */
// https://stackoverflow.com/questions/30256695/chart-js-drawing-an-arbitrary-vertical-line
const verticalLinePlugin = {

  renderVerticalLine: function (chartInstance, pointIndex) {
    // console.log("pointIndex");
    // console.log(pointIndex);
    const lineLeftOffset = chartInstance.scales.x.getPixelForValue(parseInt(pointIndex) + 0.5);
    const scale = chartInstance.scales.y;

    const context = chartInstance.ctx;
    
    let lineColor = "#2f00ffff";
    let playerName = "";

    if(pointIndex == allInputs["P1Ac"]){
      playerName = "P1 AC";
      lineColor = "rgb(255, 166, 0)";
    } if(pointIndex == allInputs["P2Ac"]){
      playerName = "P2 AC";
      lineColor = "rgb(92, 0, 0)";
    } 

    if(pointIndex != 0 && playerName != ""){
      // render vertical line
      context.beginPath();
      context.strokeStyle = lineColor
      context.lineWidth = 5;
      context.moveTo(lineLeftOffset, scale.top);
      context.lineTo(lineLeftOffset, scale.bottom);
      context.stroke();

      // write label
      context.fillStyle = "#000000ff";
      context.textAlign = "center";
      context.fillText(playerName, lineLeftOffset, scale.top);
    }
  },

  beforeDatasetsDraw: function (chart, easing) {
    if(chart.config._config.lineAtIndex)
    chart.config._config.lineAtIndex.forEach(pointIndex => this.renderVerticalLine(chart, pointIndex));
  }
};

// Funtions
/**
 * Returns the current values of all text input fields.
 * @param {}
 * @return {Set}
 */
function getInputs(){
  console.log("getInputs");
  allInputs = {
    "P1Health" : document.getElementById("P1HP").value,
    "P1Ac" : document.getElementById("P1AC").value,
    "P1HitDice" : document.getElementById("P1HitDice").value,
    "P1DamageDice" : document.getElementById("P1DamageDice").value,
    "P1AverageHit" : 0,
    "P1HitDiceValues" : [],
    "P1AverageDamage" : 0,
    "P2Health" : document.getElementById("P2HP").value,
    "P2Ac" : document.getElementById("P2AC").value,
    "P2HitDice" : document.getElementById("P2HitDice").value,
    "P2DamageDice" : document.getElementById("P2DamageDice").value,
    "P2AverageHit" : 0,
    "P2AverageDamage" : 0,
    "P2HitDiceValues" : []
  };
}

/**
 * Removes all current values for text input fields.
 * @param {}
 */
function clearAllInputs(){
  console.log("clearAllInputs");
  document.getElementById("P1HP").value = "";
  document.getElementById("P1AC").value = "";
  document.getElementById("P1HitDice").value = "";
  document.getElementById("P1DamageDice").value = "";
  document.getElementById("P2HP").value = "";
  document.getElementById("P2AC").value = "";
  document.getElementById("P2HitDice").value = "";
  document.getElementById("P2DamageDice").value = "";
}

/**
 * Prints all current inputs to the console.
 * @param {}
 */
function printAllInputs(){
  console.log("printAllInputs");
  getInputs();
  console.log(userInputs);
}

/**
 * Applies the reduce function for every value of an array.
 * Format: [[1,2,3],[1,2,3]]
 * Result: [6,6]
 * @param {item, index, arr}
 */
function applyReduce(item, index, arr) {
  console.log("applyReduce");
  arr[index] = item.reduce((partialSum, a) => partialSum + a, 0);
}

/**
 * Returns a single list (flattened cartesian product) when given a list of lists
 * Format: [[1,2,3],[1,2,3]]
 * Result: [2,3,4,3,4,5,4,5,6]
 * @param {String}
 */
function cartesian(multiLists){
  console.log("cartesian");
  let resultsList = [];

  for(let i = 0; i < multiLists.length; i++){
    if(i == 0){resultsList = multiLists[0]}
    else{
      resultsList = math.setCartesian(resultsList, multiLists[i]);
      resultsList.forEach(applyReduce);
    }
  }
  return resultsList;
}

/**
 * Returns an array of 1 to N when given a value.
 * Format: 3
 * Result: [1,2,3]
 * @param {Int}
 */
function createArray(val){
  return Array.from({length: val}, (_, i) => i + 1);
}

/**
 * Creates a list of all possible outcomes when given a user input die string.
 * Format: 2d3
 * Result: [[1,2,3],[1,2,3]]
 * @param {String}
 */
function getDieValues(dieString){
  console.log("getDieValues: "+dieString);
  let resultsList = [];
  let dieStringSplit = dieString.split("d");
  if(dieStringSplit.length == 1){return [parseInt(dieStringSplit[0])];}

  let die = dieStringSplit[1];
  let times = dieStringSplit[0];
  console.log("Die: "+die);
  console.log("Times: "+times);
  for(let i = 0; i < times; i++){
    resultsList.push(createArray(die));
  }
  resultsList = cartesian(resultsList);
  return resultsList;
}

/**
 * Processes multiple die strings.
 * Format: ["2d3","1d4"]
 * Result: [[1,2,3],[1,2,3]]
 * @param {String}
 */
function getMultipleDieValues(item, index, arr){
  console.log("getMultipleDieValues: Index="+index);
  arr[index] = getDieValues(item);
}

/**
 * Creates a list of all possible outcomes when given a user input die string.
 * Format: 2d3+1
 * Result: [4, 5, 6, 5, 6, 7, 6, 7, 8]
 * @param {String}
 */
function processDieString(dieString){
  console.log("ProcessDieString: "+dieString);
  let allResultsList = [];
  if(typeof(dieString) == "string" && dieString.length == 0){return allResultsList;}
  // Remove any outlying formatting such as spaces
  dieString = dieString.replaceAll(" ","");
  let dieStringSplit = dieString.split("+");
  dieStringSplit.forEach(getMultipleDieValues);
  dieStringSplit = cartesian(dieStringSplit);
  return dieStringSplit;
}

/**
 * Creates a bar chart with set information at the given canvas id.
 * @param {String}
 */
function initializeBarChart(canvasId){
  console.log("Initializng Bar: "+canvasId);
  let ctx = "";
  if(canvasId == "P1"){ctx = "player1Chart";}
  if(canvasId == "P2"){ctx = "player2Chart";}
  if(ctx == ""){return "";}
  let labels = months.slice(0,7);
  let data = {
    labels: labels,
    datasets: [{
      label: "My First Dataset",
      data: [65, 59, 80, 81, 56, 55, 40],
      backgroundColor: [
        "rgba(255, 99, 132, 0.2)",
        "rgba(255, 159, 64, 0.2)",
        "rgba(255, 205, 86, 0.2)",
        "rgba(75, 192, 192, 0.2)",
        "rgba(54, 162, 235, 0.2)",
        "rgba(153, 102, 255, 0.2)",
        "rgba(201, 203, 207, 0.2)"
      ],
      borderColor: [
        "rgb(255, 99, 132)",
        "rgb(255, 159, 64)",
        "rgb(255, 205, 86)",
        "rgb(75, 192, 192)",
        "rgb(54, 162, 235)",
        "rgb(153, 102, 255)",
        "rgb(201, 203, 207)"
      ],
      borderWidth: 1
    },{
      label: "My Second Dataset",
      data: [10, 20, 30, 40, 50, 60, 60],
      backgroundColor: [
        "rgba(75, 192, 192, 0.2)",
        "rgba(54, 162, 235, 0.2)",
        "rgba(153, 102, 255, 0.2)",
        "rgba(201, 203, 207, 0.2)",
        "rgba(255, 99, 132, 0.2)",
        "rgba(255, 159, 64, 0.2)",
        "rgba(255, 205, 86, 0.2)"
      ],
      borderColor: [
        "rgb(75, 192, 192)",
        "rgb(54, 162, 235)",
        "rgb(153, 102, 255)",
        "rgb(201, 203, 207)",
        "rgb(255, 99, 132)",
        "rgb(255, 159, 64)",
        "rgb(255, 205, 86)"        
      ],
      borderWidth: 1
    }
  ]
  };
  if(canvasId == "P1"){
    p1Chart = new Chart(ctx, {
      type: "bar",
      data: data,
      options: {
        scales: {
          x:{
            stacked: true,
          },
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
  if(canvasId == "P2"){
    p2Chart = new Chart(ctx, {
      type: "bar",
      data: data,
      options: {
        scales: {
          y: {
            beginAtZero: true,
            max: 120
          }
        }
      }
    });
  }
}

/**
 * Creates a pie chart with set information at the given canvas id.
 * @param {String}
 */
function initializePieChart(canvasId){
  console.log("initializePieChart: "+canvasId);
  let ctx = document.getElementById(canvasId);
  let data = {
    labels: [
      "Red",
      "Blue",
      "Yellow"
    ],
    datasets: [{
      label: "My First Dataset",
      data: [300, 50, 100],
      backgroundColor: [
        "rgb(255, 99, 132)",
        "rgb(54, 162, 235)",
        "rgb(255, 205, 86)"
      ],
      hoverOffset: 4
    }]
  };
  
  pieChart = new Chart("oddsPieChart", {
    type: "pie",
    data: data,
  });
}

/**
 * Updates the Pie Chart when given the necessary
 * @param {string}
 */
function calculateDamageScore(player){
  console.log("calculateDamageScore");
  let damageScore = 0;
  let hitDice = [];
  let ac = 0;
  let hp = 0;
  let avgDamage = 0;

  if(player == "P1"){
    hitDice = allInputs["P1HitDiceValues"];
    ac = allInputs["P2Ac"];
    hp = allInputs["P2Health"];
    avgDamage = allInputs["P1AverageDamage"];
  }else if(player == "P2"){
    hitDice = allInputs["P2HitDiceValues"];
    ac = allInputs["P1Ac"];
    hp = allInputs["P1Health"];
    avgDamage = allInputs["P2AverageDamage"];
  }else{
    console.log("Bad input for calculateDamageScore");
    return 0;
  }

  let totalCount = hitDice.length;
  let greaterThanCount = 0;
  for (const item of hitDice) {
    if(item >= ac){greaterThanCount = greaterThanCount + 1;}
  }

  damageScore = (greaterThanCount/totalCount)*(avgDamage/hp);
  return damageScore;
}

/**
 * Updates the Pie Chart when given the necessary
 * @param {Chart,String}
 */
function displayPieChart(chart,canvasId){
  console.log("initializePieChart: ");
  let p1FullCalc = calculateDamageScore("P1");
  let p2FullCalc = calculateDamageScore("P2");
  let calcSum = p1FullCalc+p2FullCalc;
  Chart.getChart(canvasId).destroy();

  let data = {
    labels: [
      "Player 1",
      "Player 2"
    ],
    datasets: [{
      label: "Odds",
      data: [p1FullCalc/calcSum, p2FullCalc/calcSum],
      backgroundColor: [
        "#bc5090",
        "#ffa600"
      ],
      hoverOffset: 4
    }]
  };

  chart.destroy();
  chart = new Chart("oddsPieChart", {
    type: "pie",
    data: data,
    options: {
      plugins: {
        tooltip: {
          callbacks: {
            label: function (tooltipData) {
              const labels = tooltipData.dataset.label.toString();
              const values = tooltipData.dataset.data[tooltipData.dataIndex].toFixed(3);
              const result = tooltipData.dataset.data.reduce((var1, var2) => var1 + var2,0);
              const percentage = (values / result * 100).toFixed(2).toString() + "%";
              return `${labels}: ${percentage}`;
            }
          }
        }
      }
    }
  });
  return "";
}

/**
 * Takes a 1D array and returns a 2D array where the first row is the values
 * and the second row is the count
 * @param {array}
 */
function countValues(inputData){
  console.log("countValues");
  let valueCount = [[],[]];

  const map = inputData.reduce((acc, e) => acc.set(e, (acc.get(e) || 0) + 1), new Map());
  valueCount[0] = [...map.keys()];
  valueCount[1] = [...map.values()];
  return valueCount;
}

/**
 * Takes a 1D array and returns a 2D array where the first row is the values
 * and the second row is the count
 * @param {chart}
 */
function removeData(chart) {
  console.log("removeData");
  chart.data.labels.pop();
  chart.data.datasets.forEach((dataset) => {
      dataset.data.pop();
  });
  chart.update();
}


/**
 * Updates the given graph with a given string of data
 * Source of how to get 
 * https://www.youtube.com/watch?v=aSaSGpb2q5w
 * @param {Chart, string}
 */
function displayBothGraphs(chart,canvasId){
  console.log("display both at "+canvasId);
  
  // https://leimao.github.io/blog/JavaScript-ChartJS-Histogram/
  // p1 calculations
  let p1allVals = countValues(allInputs["P1HitDiceValues"]);
  let p1x_vals = p1allVals[0];
  let p1y_vals = p1allVals[1];
  let p1y_vals_sums = p1y_vals;
  p1y_vals_sums = p1y_vals_sums.reduce((partialSum, a) => partialSum + a, 0);
  let p1data = p1x_vals.map((k, i) => ({x: k, y: p1y_vals[i]}));
  let p1backgroundColor = Array(p1x_vals.length).fill("rgba(88, 80, 141, 0.2)");
  let p1borderColor = Array(p1x_vals.length).fill("rgba(88, 80, 141, 1)");

  let p1xMax = Math.max(...p1x_vals);
  let p1yMax = Math.max(...p1y_vals);
  p1xMax = p1xMax + Math.round(p1xMax * 0.1);
  p1yMax = p1yMax + Math.round(p1yMax * 0.1);

  // p2 calculations
  let p2allVals = countValues(allInputs["P2HitDiceValues"]);
  let p2x_vals = p2allVals[0];
  let p2y_vals = p2allVals[1];
  let p2y_vals_sums = p2y_vals;
  p2y_vals_sums = p2y_vals_sums.reduce((partialSum, a) => partialSum + a, 0);
  let p2data = p2x_vals.map((k, i) => ({x: k, y: p2y_vals[i]}));
  let p2backgroundColor = Array(p2x_vals.length).fill("rgba(255, 166, 0, 0.2)");
  let p2borderColor = Array(p2x_vals.length).fill("rgba(255, 166, 0, 1)");

  let p2xMax = Math.max(...p2x_vals);
  let p2yMax = Math.max(...p2y_vals);
  p2xMax = p2xMax + Math.round(p2xMax * 0.1);
  p2yMax = p2yMax + Math.round(p2yMax * 0.1);

  console.log("p1 sums:"+p1y_vals_sums);
  console.log("p2 sums:"+p2y_vals_sums);

  let p1enemyAC = 0;
  let p2enemyAC = 0;
  p1enemyAC = allInputs["P2Ac"];
  p2enemyAC = allInputs["P1Ac"];
  if(p1enemyAC > p1xMax){ p1enemyAC = 0; }
  if(p2enemyAC > p2xMax){ p2enemyAC = 0; }

  let xMax = Math.max(p1xMax,p2xMax);
  let yMax = Math.max(p1yMax,p2yMax);

  Chart.getChart(canvasId).destroy();
  chart = new Chart(canvasId, {
    type: "bar",
    data: {
      datasets: [{
        label: "# of P1 rolls with this value",
        data: p1data,
        backgroundColor: p1backgroundColor,
        borderColor: p1borderColor,
        borderWidth: 1,
        barPercentage: 1,
        categoryPercentage: 1,
        borderRadius: 5,
      },{
        label: "# of P2 rolls with this value",
        data: p2data,
        backgroundColor: p2backgroundColor,
        borderColor: p2borderColor,
        borderWidth: 1,
        barPercentage: 1,
        categoryPercentage: 1,
        borderRadius: 5,
      },
      ]
    },
    lineAtIndex: [p1enemyAC, p2enemyAC],
    plugins: [verticalLinePlugin],
    options: {
      scales: {
        x: {
          beginAtZero: true,
          type: "linear",
          offset: false,
          grid: {
            offset: false
          },
          ticks: {
            stepSize: 1
          },
          title: {
            display: true,
            text: "Result",
            font: {
              size: 14
            }
          },
          stacked: true,
          max: xMax
        }, 
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Frequency",
            font: {
              size: 14
            }
          },
          max: yMax
          }
      },
      plugins: {
        title: {
          display: true,
          text: "Comparison of P1 and P2 Hit Dice and AC"
        },
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            title: (items) => {
              if (!items.length) {
                return "";
              }
              const item = items[0];
              const y_vals_sums = item.datasetIndex == 0 ? p1y_vals_sums : p2y_vals_sums;
              const y = item.parsed.y;
              return "Odds of value: "+((y/y_vals_sums*100).toFixed(2)).toString()+"%";
            }
          }
        }
      }
    },
    annotation: {
      annotations: [
        {
          type: "line",
          mode: "vertical",
          scaleID: "x-axis-0",
          value: 5,
          borderColor: "red",
          label: {
            content: "Playher AC",
            enabled: true,
            position: "top"
          }
        }
      ]
    }
  });
}

/**
 * Updates the given graph with a given string of data
 * @param {Chart, array, string}
 */
function displayGraph(chart,inputData,canvasId){
  console.log("display "+canvasId+" graph");
  
  //https://leimao.github.io/blog/JavaScript-ChartJS-Histogram/
  let allVals = countValues(inputData);
  let x_vals = allVals[0];
  let y_vals = allVals[1];
  let y_vals_sums = y_vals;
  y_vals_sums = y_vals_sums.reduce((partialSum, a) => partialSum + a, 0);
  let data = x_vals.map((k, i) => ({x: k, y: y_vals[i]}));
  let backgroundColor = Array(x_vals.length).fill("rgba(255, 99, 132, 0.2)");
  let borderColor = Array(x_vals.length).fill("rgba(255, 99, 132, 1)");

  console.log(x_vals);
  console.log(Math.max(...x_vals));
  let xMax = Math.max(...x_vals);
  let yMax = Math.max(...y_vals);
  xMax = xMax + Math.round(xMax * 0.1);
  yMax = yMax + Math.round(yMax * 0.1);

  let enemyAC = 0;
  if(canvasId == "player1Chart"){ enemyAC = allInputs["P2Ac"] - 0.5; }
  if(canvasId == "player2Chart"){ enemyAC = allInputs["P1Ac"] - 0.5; }
  if(enemyAC > xMax){ enemyAC = 0; }

  Chart.getChart(canvasId).destroy();
  chart = new Chart(canvasId, {
    type: "bar",
    data: {
      datasets: [{
        label: "Num of results",
        data: data,
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1,
        barPercentage: 1,
        categoryPercentage: 1,
        borderRadius: 5,
      }]
    },
    lineAtIndex: [enemyAC],
    plugins: [verticalLinePlugin],
    options: {
      scales: {
        x: {
          beginAtZero: true,
          type: "linear",
          offset: false,
          grid: {
            offset: false
          },
          ticks: {
            stepSize: 1
          },
          title: {
            display: true,
            text: "Result",
            font: {
              size: 14
            }
          },
          max: xMax
        }, 
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Frequency",
            font: {
              size: 14
            }
          },
          max: yMax
        }
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            title: (items) => {
              if (!items.length) {
                return "";
              }
              const item = items[0];
              const y = item.parsed.y;
              return "Odds of value: "+((y/y_vals_sums*100).toFixed(2)).toString()+"%";
            }
          }
        }
      }
    },
    annotation: {
      annotations: [
        {
          type: "line",
          mode: "vertical",
          scaleID: "x-axis-0",
          value: 5,
          borderColor: "red",
          label: {
            content: "Playher AC",
            enabled: true,
            position: "top"
          }
        }
      ]
    }
  });
}

/**
 * Returns false when the string contains a value other than numbers, a plus(+), or the lowercase letter d.
 * @param {string}
 */
function validateString(inputString){
  let temp = /[^0-9d +]/g.test(inputString);
  return temp;
}

/**
 * Returns false when the string is not a single number or contains any non numeric values.
 * @param {string}
 */
function validateInteger(inputString){
  let temp = /[^0-9]/g.test(inputString);
  return temp;
}

/**
 * Creates an alert and returns false when any input is invalid.
 * Returns true when all inputs are valid.
 * @param {array}
 */
function validateInputs(){
  let invalidFields = [];
  console.log("P1Health"+allInputs["P1Health"].length);
  // Integer verification
  try{
    // P1Health
    if(allInputs["P1Health"].length == 0 || validateInteger(allInputs["P1Health"])){ invalidFields.push("Player 1 Health"); }
  }
  catch{
    invalidFields.push("Player 1 Health");
  }
  try{
    // P1Ac
    if(allInputs["P1Ac"].length == 0 || validateInteger(allInputs["P1Ac"])){ invalidFields.push("Player 1 AC"); }
  }
  catch{
    invalidFields.push("Player 1 AC");
  }
  try{
    // P2Health
    if(allInputs["P2Health"].length == 0 || validateInteger(allInputs["P2Health"])){ invalidFields.push("Player 2 Health"); }
  }
  catch{
    invalidFields.push("Player 2 Health");
  }
  try{
    // P2Ac
    if(allInputs["P2Ac"].length == 0 || validateInteger(allInputs["P2Ac"])){ invalidFields.push("Player 2 AC"); }
  }
  catch{
    invalidFields.push("Player 2 AC");
  }

  let temp = "";
  // String verification
  try{
    // P1HitDice
    if(allInputs["P1HitDice"].length == 0 || validateString(allInputs["P1HitDice"])){ invalidFields.push("Player 1 Hit Dice"); }
  }
  catch{
    invalidFields.push("Player 1 Hit Dice");
  }
  try{
    // P1DamageDice
    if(allInputs["P1DamageDice"].length == 0 || validateString(allInputs["P1DamageDice"])){ invalidFields.push("Player 1 Damage Dice"); }
  }
  catch{
    invalidFields.push("Player 1 Damage Dice");
  }
  try{
    // P2HitDice
    if(allInputs["P2HitDice"].length == 0 || validateString(allInputs["P2HitDice"])){ invalidFields.push("Player 2 Hit Dice"); }
  }
  catch{
    invalidFields.push("Player 2 Hit Dice");
  }
  try{
    // P2DamageDice
    if(allInputs["P2DamageDice"].length == 0 || validateString(allInputs["P2DamageDice"])){ invalidFields.push("Player 2 Damage Dice"); }
  }
  catch{
    invalidFields.push("Player 2 Damage Dice");
  }

  if(invalidFields.length > 0){
    invalidFields = invalidFields.join("\n");
    alert("The following inputs are invalid:\n"+invalidFields);
    return false;
  } else{
    return true;
  }
}

/**
 * Creates an alert and returns false when any input is invalid.
 * Returns true when all inputs are valid.
 * @param {}
 */
function processAllInputs(){
  console.log("processAllInputs");
  getInputs();

  let valid = validateInputs();
  if(valid){

    let p1Process = processDieString(allInputs["P1HitDice"]);
    console.log("Process Result1:");
    console.log(p1Process.length);
    allInputs["P1HitDiceValues"] = p1Process;
    // displayGraph(p1Chart,p1Process,"player1Chart");


    let p2Process = processDieString(allInputs["P2HitDice"]);
    console.log("Process Result2:");
    console.log(p2Process.length);
    allInputs["P2HitDiceValues"] = p2Process;
    // displayGraph(p2Chart,p2Process,"player2Chart");

    // Moving all chart displaying functionality into the new single graph.
    displayBothGraphs(p1Chart,"player1Chart");
    try{
      Chart.getChart("player2Chart").destroy();
    }catch{
      console.log("Chart already destroyed");
    }
    

    // Getting the result of hit dice
    let p1HitSum = p1Process.reduce((acc, curr) => acc + curr, 0);
    let p1HitAverage = p1HitSum / p1Process.length;
    console.log("P1HitAverage: "+p1HitAverage);

    let p2HitSum = p1Process.reduce((acc, curr) => acc + curr, 0);
    let p2HitAverage = p2HitSum / p2Process.length;
    console.log("P2HitAverage: "+p2HitAverage);

    // Getting the result of damage dice
    let p1Damage = processDieString(allInputs["P1DamageDice"]);
    let p1DamageSum = p1Damage.reduce((acc, curr) => acc + curr, 0);
    let p1DamageAverage = p1DamageSum / p1Damage.length;
    console.log("P1DamageAverage: "+p1DamageAverage);
    document.getElementById("p1DPS").innerHTML = p1DamageAverage;

    let p2Damage = processDieString(allInputs["P2DamageDice"]);
    let p2DamageSum = p2Damage.reduce((acc, curr) => acc + curr, 0);
    let p2DamageAverage = p2DamageSum / p2Damage.length;
    console.log("P2DamageAverage: "+p2DamageAverage);
    document.getElementById("p2DPS").innerHTML = p2DamageAverage;

    allInputs["P1AverageHit"] = p1HitAverage;
    allInputs["P1AverageDamage"] = p1DamageAverage;
    allInputs["P2AverageHit"] = p2HitAverage;
    allInputs["P2AverageDamage"] = p2DamageAverage;

    displayPieChart(pieChart,"oddsPieChart");
  }
  else{
    console.log("Booooooo!");
  }
}

// Function execution
/**
 * Waits until all content is loaded before initializing the three charts.
 */
document.addEventListener("DOMContentLoaded", function() {
  initializeBarChart("P1");
  initializePieChart("oddsPieChart");
  initializeBarChart("P2");
});