'use strict';

// Globals
Product.productID = 0; // Give each product an internal ID
Product.prodArray = []; // Array of product objects
Product.voteCount = 25; // When === 0 show results
Product.usedLastTurn = [999,999,999]; // ID's of last turn's pics
Product.tableauSize; // number of product pics to display
Product.sessionNum = 0; // session number of this user's voting
Product.userName = ''; // this user's name
// Globals for chart display
Product.chartData = {
  allProdNames: [],
  allVotes: [],
  allViews: [],
  allAffinities: [], // votes/view percentage
  allColors: []
};

// Constructor for Product object
function Product(productName, imgFileName) {
  // var rgb = function(r, g, b) {
  //   return '#' + r.toString(16) + g.toString(16) + b.toString(16);
  // };
  this.name = productName;
  this.src = 'img/' + imgFileName;
  this.displayCount = 0;
  this.clickCount = 0;
  this.affinity = 0;
  // var r = 120;
  // var g = 100 + (Product.productID * 7);
  // var b = 250 - (Product.productID * 7);
  this.chartColor = 0; //rgb(r, g, b);
  this.ID = Product.productID++;
  Product.prodArray.push(this);
}

Product.prototype.votesPerView = function() {
  var rv = 0;
  if (this.displayCount !== 0) {
    rv = (this.clickCount / this.displayCount) * 100;
  }
  this.affinity = Number.parseFloat(rv);
  return this.affinity;
};

Product.rgb = function(r, g, b) {
  return '#' + r.toString(16) + g.toString(16) + b.toString(16);
};

Product.prototype.genChartColor = function() {
  var factor = (255 - 100) / Product.prodArray.length;
  var r = 120;
  var g = Math.floor(100 + (this.ID * factor));
  var b = Math.floor(250 - (this.ID * factor));
  this.chartColor = Product.rgb(r, g, b);
  console.log('genColor r g b chartColor', r, g, b, this.chartColor);
};

new Product('C3P0 Rolling Suitcase','bag.jpg');
new Product('Banana Slicer','banana.jpg');
new Product('Bathroom iPad Stand','bathroom.jpg');
new Product('Self Draining Boots','boots.jpg');
new Product('All-In-One Breakfast Appliance','breakfast.jpg');
new Product('Yummy Meatball Bubblegum','bubblegum.jpg');
new Product('Over-inflated Chair','chair.jpg');
new Product('Toy Gargoyl','cthulhu.jpg');
new Product('Duck\'s Beak Muzzle','dog-duck.jpg');
new Product('Canned Dragon Meat','dragon.png');
new Product('Bic Pen Cap Cutlery','pen-left.png');
new Product('Floor Sweeping Pet Footies','pet-sweep.jpg');
new Product('Pizza Cutting Scissors','scissors.jpg');
new Product('Kid\'s Shark Sleeping Bag','shark.jpg');
new Product('Baby Sweeping Onesie','sweep.png');
new Product('Star Wars Taun Taun Sleeping Bag','tauntaun.jpg');
new Product('Canned Unicorn Meat','unicorn.jpg');
new Product('Wiggling USB Dragon Tail','usb.gif');
new Product('Recycling Watering Can','water-can.jpg');
new Product('Boquet-Retaining Wine Glass','wine-glass.jpg');

Product.getRandomImageIndices = function(tableauSize) {
  // return three random product indexes that aren't in
  // usedLastTurn array
  var i = 0;
  var usedThisTurn = [];
  while (i < tableauSize) {
    var r = Math.floor(Math.random() * Product.prodArray.length);
    if (!Product.usedLastTurn.includes(r) && !usedThisTurn.includes(r)) { // r is unique last turn
      usedThisTurn.push(r);
      i++;
    }
  }
  console.log('last turn',Product.usedLastTurn,'this turn',usedThisTurn);
  Product.usedLastTurn = usedThisTurn;
  return usedThisTurn;
};

// Select product images at random that weren't used last turn
Product.displayProductImages = function(tableauSize) {
  var displayList = Product.getRandomImageIndices(tableauSize);
  // Display the images on the page
  for (var img = 0; img < displayList.length; img++) {
    // modify DOM for image to display file and name
    var imgEl = document.getElementById(
      'i'+img);
    imgEl.src = Product.prodArray[displayList[img]].src;
    var capEl = document.getElementById('c'+img);
    capEl.textContent = Product.prodArray[displayList[img]].name;
    // add pid attributes to image, caption and figure
    // Needed because user could click on any of these to vote
    var pID = Product.prodArray[displayList[img]].ID;
    imgEl.setAttribute('pid', pID);
    capEl.setAttribute('pid', pID);
    var figEl = document.getElementById('f'+img);
    figEl.setAttribute('pid', pID);
    Product.prodArray[displayList[img]].displayCount++;
  }
  // update votes remaining tally
  var vcEl = document.getElementById('votes-left');
  vcEl.textContent = Product.voteCount;
};

Product.figureClicked = function(e) {
  // figure out which product is displayed
  var prodID = e.target.getAttribute('pid');
  console.log(prodID);
  // increment it's vote count
  Product.prodArray[prodID].clickCount++;
  // decrement global vote count and update display
  Product.voteCount--;

  if (Product.voteCount > 0) {
  // display more images
    Product.displayProductImages(Product.tableauSize);
  } else {
    // shut down listeners and display results
    Product.stopListening();
    Product.displayResults();
  }
};

Product.startListening = function() {
  var figures = document.getElementById('product-pics');
  figures.addEventListener('click', Product.figureClicked);
};

Product.stopListening = function() {
  var figures = document.getElementById('product-pics');
  figures.removeEventListener('click', Product.figureClicked);
};

Product.updateAffinityResults = function() {
  // call votesPerView method on each product
  for (var i of Product.prodArray) {
    i.votesPerView();
  }
};

Product.pickChartColors = function() {
//  var colors = Product.genRandomColors(); //get array of colors
  for (var i in Product.prodArray) {
    Product.prodArray[i].genChartColor();
  }
};

Product.displayResults = function() {
  console.log('Display Results Here');
  // delete <main> element from page
  var mainEl = document.body.getElementsByTagName('main')[0];
  document.body.removeChild(mainEl);

  var bodyEl = document.getElementsByTagName('body')[0];
  var footerEl = document.getElementsByTagName('footer')[0];

  // create a new <main>
  mainEl = document.createElement('main');
  bodyEl.insertBefore(mainEl, footerEl);

  // Add new h2 element
  var h2El = document.createElement('h2');
  h2El.textContent = 'Voting Results';
  mainEl.appendChild(h2El);

  // Add new canvas elements
  Product.createCanvas('chart0', mainEl);
  Product.createCanvas('chart1', mainEl);

  // Gather voting data into arrays for graphing
  // update affinity values of each product
  Product.updateAffinityResults();
  // Give each product it's own chart color
  Product.pickChartColors();

  // first collect data and sort on votes
  Product.collectChartData('clickCount');

  // Create bar chart
  var ctx0 = document.getElementById('chart0').getContext('2d');
  var votesChart = new Chart(ctx0, {
    type: 'horizontalBar',
    data: {
      labels: Product.chartData.allProdNames,
      datasets: [{
        label: 'Number of Votes',
        data: Product.chartData.allVotes,
        backgroundColor: Product.chartData.allColors,
        borderColor: Product.chartData.allColors,
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero:true
          }
        }]
      },
      title: {
        display: true,
        text: 'Product Voting Results',
        fontSize: 20,
        fontStyle: 'bold'
      },
      layout: {
        padding: {
          left: 0,
          right: 0,
          top: 25,
          bottom: 25
        }
      }
    }
  });

  // then sort on affinity
  Product.collectChartData('affinity');

  var ctx1 = document.getElementById('chart1').getContext('2d');
  var affinitiesChart = new Chart(ctx1, {
    type: 'horizontalBar',
    data: {
      labels: Product.chartData.allProdNames,
      datasets: [{
        label: 'Affinity: votes / views * 100',
        data: Product.chartData.allAffinities,
        backgroundColor: Product.chartData.allColors,
        borderColor: Product.chartData.allColors,
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero:true
          }
        }]
      },
      title: {
        display: true,
        text: 'Product Affinity Results',
        fontSize: 20,
        fontStyle: 'bold'
      },
      layout: {
        padding: {
          left: 0,
          right: 0,
          top: 25,
          bottom: 25
        }
      }
    }
  });
};

Product.createTextElement = function(tag, text, parent) {
  var el = document.createElement(tag);
  el.textContent = text;
  parent.appendChild(el);
};

Product.createCanvas = function(canvasId, parentEl) {
  var canvasEl = document.createElement('canvas');
  canvasEl.setAttribute('width','1000');
  canvasEl.setAttribute('id',canvasId);
  parentEl.appendChild(canvasEl);
};

Product.createFigureElement = function(figNum) {
  // This is what we want to append to the #product-pics div
  // <figure id="f0">
  //   <img src="" id="i0"/>
  //   <figcaption id="c0"></figcaption>
  // </figure>
  var ppDiv = document.getElementById('product-pics');

  // new figure element
  var newFig = document.createElement('figure');
  newFig.setAttribute('id','f' + figNum);

  // new img element (blank for now)
  var newImg = document.createElement('img');
  newImg.setAttribute('id','i' + figNum);
  newImg.setAttribute('src','');
  newFig.appendChild(newImg); // append to figure element

  // new figcaption (blank for now)
  var newCap = document.createElement('figcaption');
  newCap.setAttribute('id','c' + figNum);
  newFig.appendChild(newCap);

  // append to division
  ppDiv.appendChild(newFig);
};

Product.getUserInput = function() {

  Product.userName = document.getElementById('userName').value;
  Product.sessionNum = parseInt(document.getElementById('session').value);
  Product.tableauSize = parseInt(document.querySelector('input[name="tableauSize"]:checked').value);

  // stop listening
  var formEl = document.getElementById('submit');
  formEl.removeEventListener('click', Product.getUserInput);

  // remove input form from page
  Product.clearUserInputForm();

  // begin voting products
  Product.voteProducts();
};

Product.clearUserInputForm = function() {
  // delete <main> element from page
  var formEl = document.getElementById('input-form');
  formEl.parentNode.removeChild(formEl);
  return false;
};

Product.insertTableauHeading = function() {
  var mainEl = document.getElementById('product-headings');
  var heading = document.createElement('h3');
  heading.textContent = 'Click on the product you\'d be most likely to purchase';
  mainEl.appendChild(heading);
  var subHeading = document.createElement('h4');
  subHeading.innerHTML = '<span id="votes-left">25</span> Votes Remaining';
  mainEl.appendChild(subHeading);
};

Product.voteProducts = function() {

  Product.insertTableauHeading();

  for (var f = 0; f < Product.tableauSize; f++) {
    Product.createFigureElement(f);
  }

  Product.displayProductImages(Product.tableauSize);

  Product.startListening();
};

// Sort all prodArray entries on keyname value
// use a bubble sort.
Product.sortProdArrayOn = function(keyName) {
  var swap = function(i, j) {
    var temp = Product.prodArray[i];
    Product.prodArray[i] = Product.prodArray[j];
    Product.prodArray[j] = temp;
  };
  var swapped;
  do {
    swapped = false;
    for (var p = 0; p < Product.prodArray.length; p++) {
      if (Product.prodArray[p] && Product.prodArray[p+1] && Product.prodArray[p][keyName] < Product.prodArray[p+1][keyName]) {
        swap(p, p+1);
        swapped = true;
      }
    }
  } while (swapped);
};

// Gather charting data sorted on keyName. Return new object array?
Product.collectChartData = function(keyName) {

  Product.sortProdArrayOn(keyName);

  // clear all arrays
  Product.chartData.allProdNames = [];
  Product.chartData.allVotes = [];
  Product.chartData.allViews = [];
  Product.chartData.allAffinities = [];
  Product.chartData.allColors = [];
  // populate the chart data arrays
  for (var p = 0; p < Product.prodArray.length; p++) {
    Product.chartData.allProdNames.push(Product.prodArray[p].name);
    Product.chartData.allVotes.push(Product.prodArray[p].clickCount);
    Product.chartData.allViews.push(Product.prodArray[p].displayCount);
    Product.chartData.allAffinities.push(Product.prodArray[p].affinity);
    Product.chartData.allColors.push(Product.prodArray[p].chartColor);
  }
};

Product.genRandomColors = function() {
  var ca = [], c, r, g, b, i = 0;
  while (i < Product.prodArray.length) {
    r = Math.floor(Math.random() * 0xF * 0xF).toString(16);
    g = Math.floor(Math.random() * 0xF * 0xE).toString(16);
    b = Math.floor(Math.random() * 0xF * 0xF).toString(16);
    c = '#'+ r + g + b;
    if (!ca.includes(c)) {
      ca.push(c);
    }
    i++;
  }
  return ca;
};

Product.formEl = document.getElementById('submit');
Product.formEl.addEventListener('click', Product.getUserInput);