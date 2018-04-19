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

// Vote data object
Product.Vote = function(product, user) {
  this.pID = product.ID;
  this.name = product.name;
  this.user = user;
  this.session = Product.sessionNum;
  this.dateStamp = Date.now();
};
Product.votes = []; // all votes cast

// return readable string from date number (like Date.now())
Product.dateNumToString = function(dateNum) {
  var d = new Date(dateNum - 24*60*60*1000);
  return d.toLocaleString();
};

// Session data object
Product.sessionIndex = 0; // index into sessions array. will be zero after first session created
Product.thisSessionIndex = 0;
Product.Session = function() {
  this.sessionNum = Product.sessionNum;
  this.userName = Product.userName;
  this.tableauSize = Product.tableauSize;
  this.sessionStart = Date.now();
  this.sessionEnd = 0;
  Product.thisSessionIndex = Product.sessionIndex;
  Product.sessionIndex++;
};

Product.sessions = []; // empty array of session objects

// Constructor for Product object
function Product(productName, imgFileName) {
  this.name = productName;
  this.src = imgFileName;
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
  // save vote
  Product.votes.push(new Product.Vote(Product.prodArray[prodID], Product.userName));
  // decrement global vote count and update display
  Product.voteCount--;

  if (Product.voteCount > 0) {
  // display more images
    Product.displayProductImages(Product.tableauSize);
  } else {
    // end timed portion of the session
    Product.sessions[Product.thisSessionIndex].sessionEnd = Date.now();
    // update affinity values of each product
    Product.updateAffinityResults();
    // Give each product it's own chart color
    Product.pickChartColors();
    // Save results under [userName+results] key
    localStorage[Product.sessions[Product.thisSessionIndex].userName.toLowerCase()+'Results'] = JSON.stringify(Product.prodArray);
    // Save sessions to local storage
    localStorage.sessions = JSON.stringify(Product.sessions);
    // Save votes to local storage, appending to existing votes
    localStorage.votes = JSON.stringify(Product.votes);

    Product.stopListening();
    Product.prepHtmlForResults(); // put results heading on the page (once)
    Product.displayResults('clickCount', false); // display votes initially decending sorted on clickCount (votes)
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

  // Add new form for selecting sort type
  var sortSelectHtml = '<form>\
  <fieldset id="sortSelection">\
    <div  id="sortBy">\
      <label for="sortBy">Sort Voting Results By:</label>\
      <input type="radio" name="sortBy" value="name" />Product Name\
      <input type="radio" name="sortBy" value="displayCount" />Views\
      <input type="radio" name="sortBy" value="clickCount" checked="checked" />Votes\
      <input type="radio" name="sortBy" value="affinity" />Affinity\
    </div>\
  </fieldset>\
  </form>';
  var divEl = document.createElement('div');
  divEl.setAttribute('id','sortSelection');
  divEl.innerHTML = sortSelectHtml;
  mainEl.appendChild(divEl);
};

Product.sortTypeListener = function(e) {
  console.log('sortTypeListener', e.target.value);
  if (e.target.value) {
    Product.topChart.destroy();

    Product.displayResults(e.target.value, (e.target.value === 'name' ? true : false));
  }
};

// Add headings to html for chart display
Product.prepHtmlForResults = function() {
  // Prep page for charts
  Product.resultsDisplayHeadings();
  // Add new canvas elements to page
  var mainEl = document.body.getElementsByTagName('main')[0];
  Product.createCanvas('chart0', mainEl);
  Product.createCanvas('chart1', mainEl);
};

// Display voting results
Product.displayResults = function(sortKey, ascending) {
  console.log('Display Results');
  // Gather voting data into arrays for graphing
  // first collect data and sort on votes
  Product.collectChartData(sortKey, ascending);

  // Create bar chart
  var ctx0 = document.getElementById('chart0').getContext('2d');
  Product.topChart = new Chart(ctx0, {
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
  Product.collectChartData('affinity', false);

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
  // add listener for sort selection change
  var el = document.getElementById('sortSelection');
  el.addEventListener('click', this.sortTypeListener);
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
  if (Product.userName === '') Product.userName = 'anonymous';
  Product.sessionNum = parseInt(document.getElementById('session').value);
  Product.tableauSize = parseInt(document.querySelector('input[name="tableauSize"]:checked').value);

  // stop listening for user input
  var formEl = document.getElementById('submit');
  formEl.removeEventListener('click', Product.getUserInput);

  // capture session data
  Product.sessions.push(new Product.Session());

  // restore or initialize product voting data
  Product.restoreResults(Product.userName);

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
Product.collectChartData = function(keyName, ascending) {
  // Sort products by keyName (typically clickCount (aka votes) or affinity (votes/views))
  Product.prodArray = Product.sortObjArrayOnKey(Product.prodArray, keyName, ascending);
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

// reconstitute Products.prodArray from localStorage
Product.constructorFactory = function(JSONstring) {
  if (JSONstring === null) return null;
  for (var o of JSONstring) {
    var p = new Product(o.name, o.src);
    p.displayCount = parseInt(o.displayCount);
    p.clickCount = parseInt(o.clickCount);
    p.affinity = parseFloat(o.affinity);
    p.ID = parseInt(o.ID);
    console.log('factory',o);
  }
  return Product.prodArray;
};

Product.restoreResults =function(user) {
  var resultsKey = user+'Results';
  Product.prodArray = Product.constructorFactory(JSON.parse(localStorage.getItem(resultsKey)))
    || [
      new Product('C3P0 Rolling Suitcase','img/bag.jpg'),
      new Product('Banana Slicer','img/banana.jpg'),
      new Product('Bathroom iPad Stand','img/bathroom.jpg'),
      new Product('Self Draining Boots','img/boots.jpg'),
      new Product('All-In-One Breakfast Appliance','img/breakfast.jpg'),
      new Product('Yummy Meatball Bubblegum','img/bubblegum.jpg'),
      new Product('Over-inflated Chair','img/chair.jpg'),
      new Product('Toy Gargoyl','img/cthulhu.jpg'),
      new Product('Duck\'s Beak Muzzle','img/dog-duck.jpg'),
      new Product('Canned Dragon Meat','img/dragon.png'),
      new Product('Bic Pen Cap Cutlery','img/pen-left.png'),
      new Product('Floor Sweeping Pet Footies','img/pet-sweep.jpg'),
      new Product('Pizza Cutting Scissors','img/scissors.jpg'),
      new Product('Kid\'s Shark Sleeping Bag','img/shark.jpg'),
      new Product('Baby Sweeping Onesie','img/sweep.png'),
      new Product('Star Wars Taun Taun Sleeping Bag','img/tauntaun.jpg'),
      new Product('Canned Unicorn Meat','img/unicorn.jpg'),
      new Product('Wiggling USB Dragon Tail','img/usb.gif'),
      new Product('Recycling Watering Can','img/water-can.jpg'),
      new Product('Boquet-Retaining Wine Glass','img/wine-glass.jpg')
    ];
};

// Initialize objects and first listener
Product.init = function() {
  // Restore session data
  Product.sessions = JSON.parse(localStorage.getItem('sessions'))
    || [];
  Product.sessionIndex = Product.sessions.length;
  Product.thisSessionIndex = Product.sessionIndex - 1;

  // Restore votes array
  Product.votes = JSON.parse(localStorage.getItem('votes')) || [];

  // Create anonymous user results so we can build store data
  if (localStorage.anonymousResults) localStorage.removeItem('anonymousResults');
  Product.restoreResults('anonymous');
  // mock up store description and price data
  Product.storeDetail = new Object();
  for (var p of Product.prodArray) {
    Product.storeDetail[p.name] = new Object();
    Product.storeDetail[p.name].description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi blandit, neque sit amet gravida mollis, lectus nisi ultrices lectus, id porttitor ipsum arcu et quam. Vivamus odio sapien, porta id magna sit amet, commodo aliquam augue.';
    Product.storeDetail[p.name].price = Math.round((Math.random() * 25 + 4)) + 0.99;
  }
  localStorage.setItem('storeDetail',JSON.stringify(Product.storeDetail));

  // get userName from last session and offer that as name for current session
  var el = document.getElementById('userName');
  el.setAttribute('value',(Product.sessions[0] ? Product.sessions[Product.sessions.length-1].userName : ''));

  // start up listener on user input form
  Product.formEl = document.getElementById('submit');
  Product.formEl.addEventListener('click', Product.getUserInput);
};

// Do it!
Product.init();