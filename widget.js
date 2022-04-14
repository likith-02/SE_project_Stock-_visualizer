(function() {
  angular
    .module("stockPriceWidget", [])
    .controller("MainCtrl", ["$http", "alphavantage", "chart",
    function($http, alphavantage, chart) {
      var vm = this;
      vm.symbol = "TSLA";
      vm.timeInterval = "days";
      vm.timeIntervalValue = 90;
      
      vm.setDataRange = function(numberOfDays){
        chart.update(vm.dataSet, vm.timeInterval, numberOfDays);
      }
      
      
      function getData() {
        alphavantage.getDailyDataSet(vm.symbol)
          .then(response => {
            vm.dataSet = response;
            chart.renderChart(vm.dataSet, vm.timeInterval, vm.timeIntervalValue);
            vm.currentClosingPrice = parseFloat(alphavantage.getCurrentClosingPrice(vm.dataSet, "Daily")).toFixed(2);
            vm.gainLoss = alphavantage.calculateGainLoss(vm.dataSet, "Daily");
        });
      }
      
      getData();
      
    }
  ])
  .constant("APIKEY", "9V66ST5SY883CWI1")
  .factory("alphavantage", ["$http", "APIKEY", function($http, APIKEY){
    
    var _latestDate;
    var _currentClosingPrice;
    
    function getDailyDataSet(symbol){
      return $http.get("https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=" + symbol + "&apikey=" + APIKEY)
        .then(response => {
          return response.data;
        });
    }
    
    function getInterDayDataSet(symbol){
      return $http.get("https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=" + symbol + "&interval=1min&apikey=" + APIKEY)
        .then(response => {
          return response.data;
        });
    }
    
    function getLatestDate(dataSet, timeInterval){
      _latestDate = moment();
      var dates = Object.keys(dataSet["Time Series (" + timeInterval + ")"]).map(d => moment(d));
      dates.forEach((date, i, a) => {
        _latestDate = (i === 0 || date.isAfter(_latestDate)) ? date : _latestDate;
      });
      return _latestDate;
    }
    
    function getCurrentClosingPrice(dataSet, timeInterval){
      var latest = getLatestDate(dataSet, timeInterval);
      _currentClosingPrice = dataSet["Time Series (" + timeInterval + ")"][latest.format("YYYY-MM-DD")]["4. close"];
      return _currentClosingPrice;
    }
    
    function calculateGainLoss(dataSet, timeInterval){
      //var currentClosingPrice = getCurrentClosingPrice(dataSet, timeInterval);
      var previousClosingPrice = 
            dataSet["Time Series (" + timeInterval + ")"][_latestDate.subtract(1, "days").format("YYYY-MM-DD")]["4. close"];
      return parseFloat(_currentClosingPrice - previousClosingPrice).toFixed(2);
    }
    
    return {
      getDailyDataSet: getDailyDataSet,
      getInterDayDataSet: getInterDayDataSet,
      getCurrentClosingPrice: getCurrentClosingPrice,
      calculateGainLoss: calculateGainLoss
    }
  }])
  .factory("dataSetFormatter", [function(){
    function format(dataSet, dayMonthYear, value){
      var formattedDataSet = {};
      formattedDataSet.closingValues = [];
      formattedDataSet.openingValues = [];
      formattedDataSet.highValues = [];
      formattedDataSet.lowValues = [];
      
      //get an array of all the dataSet date keys
      var dates = Object.keys(dataSet).map(d => moment(d));
      for(var i = dates.length - 1; i >= 0; i--){
        if(!dates[i].isSameOrAfter(moment().subtract(value, dayMonthYear))){
          dates.splice(i, 1);
        }
      }
      
      //now that we have a set of dates to target, we can iterate
      //over the new date set grabbing the corresponding objects in dataSet
      //and populating formattedDataSet
      dates.forEach(d => {
        var closingObj = {};
        closingObj.x = d;
        closingObj.y = dataSet[d.format("YYYY-MM-DD")]["4. close"];
        formattedDataSet.closingValues.push(closingObj);
        var openingObj = {};
        openingObj.x = d;
        openingObj.y = dataSet[d.format("YYYY-MM-DD")]["1. open"];
        formattedDataSet.openingValues.push(openingObj);
        var highObj = {};
        highObj.x = d;
        highObj.y = dataSet[d.format("YYYY-MM-DD")]["2. high"];
        formattedDataSet.highValues.push(highObj);
        var lowObj = {};
        lowObj.x = d;
        lowObj.y = dataSet[d.format("YYYY-MM-DD")]["3. low"];
        formattedDataSet.lowValues.push(lowObj);
      });
      return formattedDataSet;
    }
    
    return {
      format: format
    }
  }])
  .factory("chart", ["dataSetFormatter", function(dataSetFormatter){
    var priceChart;
    
    function update(dataSet, timeInterval, timeIntervalValue){
      var formattedDataSet = dataSetFormatter.format(dataSet["Time Series (Daily)"], timeInterval, timeIntervalValue);
      priceChart.data.datasets[0].data = formattedDataSet.closingValues;
      priceChart.data.datasets[1].data = formattedDataSet.openingValues;
      priceChart.data.datasets[2].data = formattedDataSet.highValues;
      priceChart.data.datasets[3].data = formattedDataSet.lowValues;
      priceChart.update();
    }
    
    function renderChart(dataSet, timeInterval, timeIntervalValue) {
        var formattedDataSet = dataSetFormatter.format(dataSet["Time Series (Daily)"], timeInterval, timeIntervalValue);
        //var formattedDataSet = getChartData(vm.dataSet["Time Series (Daily)"]);
        Chart.defaults.global.defaultFontFamily = "'Open Sans', sans-serif";
        var ctx = document.getElementById("myChart").getContext("2d");
        priceChart = new Chart(ctx, {
          type: "line",
          data: {
            datasets: [
              {
                label: "Closing Value",
                data: formattedDataSet.closingValues,
                borderColor: ["blue"],
                borderWidth: 1,
                fill: false
              },
              {
                label: "Opening Value",
                data: formattedDataSet.openingValues,
                borderColor: ["red"],
                borderWidth: 1,
                fill: false
              },
              {
                label: "High",
                data: formattedDataSet.highValues,
                borderColor: ["green"],
                borderWidth: 1,
                fill: false
              },
              {
                label: "Low",
                data: formattedDataSet.lowValues,
                borderColor: ["orange"],
                borderWidth: 1,
                fill: false
              }
            ]
          },
          options: {
            responsive: false,
            scales: {
              xAxes: [
                {
                  type: "time",
                  time: {
                    displayFormats: {
                      month: "MMM YYYY"
                    }
                  }
                }
              ]
            }
          }
        });
      }
    return {
      renderChart: renderChart,
      update: update
    }
  }])
})();
