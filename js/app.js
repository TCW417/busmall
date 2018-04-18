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
  this.name = productName;
  this.src = 'img/' + imgFileName;
  this.displayCount = 0;
  this.clickCount = 0;
  this.affinity = 0;
  this.chartColor = 0;
  this.ID = Product.productID++;
  Product.prodArray.push(this); // Add newly created object to product array
}

// Method: Calculate affinity (votes/views) for this object
Product.prototype.votesPerView = function() {
  var rv = 0;
  if (this.displayCount !== 0) { // Protect against zero displays (shouldn't happen but...)
    rv = (this.clickCount / this.displayCount) * 100;
  }
  this.affinity = Number.parseFloat(rv);
};

// Method: Generate chart color for this based on its ID number
Product.prototype.genChartColor = function() {
  var rgb = function(r, g, b) {
    return '#' + r.toString(16) + g.toString(16) + b.toString(16);
  };
  var factor = (255 - 100) / Product.prodArray.length;
  var r = 120;
  var g = Math.floor(100 + (this.ID * factor));
  var b = Math.floor(250 - (this.ID * factor));
  this.chartColor = rgb(r, g, b);
};

// Return set of array indices that are unique between turns
Product.getRandomImageIndices = function(tableauSize) {
  var i = 0;
  var usedThisTurn = []; // put this turn's indices here
  while (i < tableauSize) { // for each "cell" in the picture tableau
    var r = Math.floor(Math.random() * Product.prodArray.length); // get a random index
    // test r against last turn's products and what's been picked so for for this turn
    if (!Product.usedLastTurn.includes(r) && !usedThisTurn.includes(r)) {
      // It's unique. Add it to the this turn array
      usedThisTurn.push(r);
      i++;
    }
  }
  Product.usedLastTurn = usedThisTurn; // save this turn as last turn for next turn...
  return usedThisTurn;
};

// Display a tableau's worth of product images
Product.displayProductImages = function(tableauSize) {
  // get a list of unique random array indices
  var displayList = Product.getRandomImageIndices(tableauSize);
  // Display the images on the page
  for (var img = 0; img < displayList.length; img++) {
    // modify DOM for image to display file and name
    var imgEl = document.getElementById('i'+img);
    imgEl.src = Product.prodArray[displayList[img]].src; // set image src attribute
    var capEl = document.getElementById('c'+img);
    capEl.textContent = Product.prodArray[displayList[img]].name; // update image caption
    // add pid attributes to image, caption and figure
    // Needed because user could click on any of these to vote
    imgEl.setAttribute('pid', Product.prodArray[displayList[img]].ID);
    capEl.setAttribute('pid', Product.prodArray[displayList[img]].ID);
    var figEl = document.getElementById('f'+img);
    figEl.setAttribute('pid', Product.prodArray[displayList[img]].ID);
    // Increment product's displayed counter
    Product.prodArray[displayList[img]].displayCount++;
  }
  // update votes remaining tally on screen
  var vcEl = document.getElementById('votes-left');
  vcEl.textContent = Product.voteCount;
};

// Event listener for click on product image
Product.figureClicked = function(e) {
  // figure out which product is displayed
  var prodID = e.target.getAttribute('pid');
  console.log(prodID, 'clicked');
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

// Add listener to product pics
Product.startListening = function() {
  var figures = document.getElementById('product-pics');
  figures.addEventListener('click', Product.figureClicked);
};

// Remove listener from product pics
Product.stopListening = function() {
  var figures = document.getElementById('product-pics');
  figures.removeEventListener('click', Product.figureClicked);
};

// After voting, generate affinity values for each product
Product.updateAffinityResults = function() {
  // call votesPerView method on each product
  for (var i of Product.prodArray) {
    i.votesPerView();
  }
};

// Pick a chart color for each product
Product.pickChartColors = function() {
  for (var i in Product.prodArray) {
    Product.prodArray[i].genChartColor();
  }
};

// Setup page headings for results display
Product.resultsDisplayHeadings = function() {
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
};

// Display voting results
Product.displayResults = function() {
  console.log('Display Results');
  // Prep page for charts
  Product.resultsDisplayHeadings();
  // Add new canvas elements to page
  var mainEl = document.body.getElementsByTagName('main')[0];
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
  new Chart(ctx0, {
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

  // then sort on affinity and create another bar chart
  Product.collectChartData('affinity');

  var ctx1 = document.getElementById('chart1').getContext('2d');
  new Chart(ctx1, {
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

// Helper: Create a text element <tag>text</tag> in <parent>
Product.createTextElement = function(tag, text, parent) {
  var el = document.createElement(tag);
  el.textContent = text;
  parent.appendChild(el);
};

// Helper: create a canvas element with id in parentEl
Product.createCanvas = function(canvasId, parentEl) {
  var canvasEl = document.createElement('canvas');
  canvasEl.setAttribute('width','1000');
  canvasEl.setAttribute('id',canvasId);
  parentEl.appendChild(canvasEl);
};

// Append a <figure> element to <div id=product-pics>
Product.createFigureElement = function(figNum) {
  // Get product-pics div element
  var ppDiv = document.getElementById('product-pics');

  // create new figure element and assign figNum as id
  var newFig = document.createElement('figure');
  newFig.setAttribute('id','f' + figNum);

  // add new img element (blank for now)
  var newImg = document.createElement('img');
  newImg.setAttribute('id','i' + figNum);
  newImg.setAttribute('src','');
  newFig.appendChild(newImg); // append to figure element

  // add new figcaption (blank for now)
  var newCap = document.createElement('figcaption');
  newCap.setAttribute('id','c' + figNum);
  newFig.appendChild(newCap);

  // append to division
  ppDiv.appendChild(newFig);
};

// Listener on user input form submit button
Product.getUserInput = function() {
  // get name, session and tableauSize
  Product.userName = document.getElementById('userName').value;
  Product.sessionNum = parseInt(document.getElementById('session').value);
  Product.tableauSize = parseInt(document.querySelector('input[name="tableauSize"]:checked').value);

  // stop listening for user input
  var formEl = document.getElementById('submit');
  formEl.removeEventListener('click', Product.getUserInput);

  // remove input form from page
  Product.clearUserInputForm();

  // begin voting products
  Product.voteProducts();
};

// Delete user input html from page prior to displaying product pics
Product.clearUserInputForm = function() {
  // delete <main> element from page
  var formEl = document.getElementById('input-form');
  formEl.parentNode.removeChild(formEl);
  return false;
};

// Add headings to page for the voting process including votes remaining
Product.insertTableauHeading = function() {
  var mainEl = document.getElementById('product-headings');
  var heading = document.createElement('h3');
  heading.textContent = 'Click on the product you\'d be most likely to purchase';
  mainEl.appendChild(heading);
  var subHeading = document.createElement('h4');
  subHeading.innerHTML = '<span id="votes-left">25</span> Votes Remaining';
  mainEl.appendChild(subHeading);
};

// Collect votes for the products
Product.voteProducts = function() {
  // setup HTML elements for the voting process
  // 1) add tableau heading to the page
  Product.insertTableauHeading();
  // 2) add figure elements
  for (var f = 0; f < Product.tableauSize; f++) {
    Product.createFigureElement(f);
  }
  // Display intial set of product images
  Product.displayProductImages(Product.tableauSize);
  // Start listening for votes
  Product.startListening();
};

// Sort Object array on keyname value in accending order of 3rd param == false
Product.sortObjArrayOnKey = function(objArray, keyName, accending) {
  // This is a standard bubble sort
  var swap = function(i, j) {
    var temp = rtnArray[i];
    rtnArray[i] = rtnArray[j];
    rtnArray[j] = temp;
  };
  var test = function(a, b) {
    return (accending ? a > b : a < b);
  };
  var swapped, rtnArray = objArray.slice(0); // create a clone of the obj arracy
  do {
    swapped = false;
    for (var p = 0; p < rtnArray.length; p++) {
      if (rtnArray[p] && rtnArray[p+1] && test(rtnArray[p][keyName], rtnArray[p+1][keyName])) {
        swap(p, p+1);
        swapped = true;
      }
    }
  } while (swapped);
  return rtnArray;
};

// Gather charting data sorted on keyName.
Product.collectChartData = function(keyName) {
  // Sort products by keyName (typically clickCount (aka votes) or affinity (votes/views))
  Product.prodArray = Product.sortObjArrayOnKey(Product.prodArray, keyName, false);
  // clear all arrays (needed between sorts otherwise we get 2x data)
  Product.chartData.allProdNames = [];
  Product.chartData.allVotes = [];
  Product.chartData.allViews = [];
  Product.chartData.allAffinities = [];
  Product.chartData.allColors = [];
  // populate the chart data arrays
  var pObj = Product.objParamDeconstruct(Product.prodArray);
  Product.chartData.allProdNames = pObj.name; 
  Product.chartData.allVotes = pObj.clickCount;
  Product.chartData.allViews = pObj.displayCount;
  Product.chartData.allAffinities = pObj.affinity;
  Product.chartData.allColors = pObj.chartColor;
};

// Helper: Deconstruct objArray into a collection of arrays within a single object.
Product.objParamDeconstruct = function(objArray) {
  var o = {}; // blank object
  var objNames = Object.getOwnPropertyNames(objArray[0]); // array of key names
  // initialize return object
  for (var k of objNames) {
    o[k] = [];
  }
  for (k of objNames) { // for each object key name
    for (var obj of objArray) { // for each object in the array
      o[k].push(obj[k]); // add value of key to return object array
    }
  }
  return o;
};

// Initialize objects and first listener
Product.init = function() {
  // instantiate products
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

  // start up listener on user input form
  Product.formEl = document.getElementById('submit');
  Product.formEl.addEventListener('click', Product.getUserInput);
};

// Do it!
Product.init();