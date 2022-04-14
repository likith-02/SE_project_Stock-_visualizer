var st;
url1 = 'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol='
symbol='IBM'
url2='&interval=5min&apikey=XXSG53NAUKF66BZR';

var input;

function setup() {
createCanvas(600, 300);
  var button = select('#submit');
  button.mousePressed(stockAsk);
  input = select('#stock');
}

function stockAsk() {
  var url = url1 + input.value() + url2;
  console.log(url);
  loadJSON(url, gotData);
}

function gotData(data) {
  var mainContainer = document.getElementById("data");
  for (var i = 0; i < data.length; i++) {
    var div = document.createElement("div");
    div.innerHTML = 'Name: ' + data[i].firstName + ' ' + data[i].lastName;
    mainContainer.appendChild(div);
  }
  console.log(mainContainer);
}

function draw() {

}

