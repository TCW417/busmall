'use strict';

// // Globals
// Product.productID = 0; // Give each product an internal ID
// Product.prodArray = []; // Array of product objects
// Product.voteCount = 25; // When === 0 show results
// Product.usedLastTurn = [999,999,999]; // ID's of last turn's pics
// Product.tableauSize; // number of product pics to display
// Product.sessionNum = 0; // session number of this user's voting
// Product.userName = ''; // this user's name
// // Globals for chart display
// Product.chartData = {
//   allProdNames: [],
//   allVotes: [],
//   allViews: [],
//   allAffinities: [], // votes/view percentage
//   allColors: []
// };

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
Product.sessions = []; // empty array of session objects
Product.Session = function() {
  this.sessionNum = Product.sessionNum;
  this.userName = Product.userName;
  this.tableauSize = Product.tableauSize;
  this.sessionStart = Date.now();
  this.sessionEnd = 0;
  this.votes = Product.voteCount; // vote countdown for this session
  this.prodArray = Product.restoreResults(Product.userName); // products voted on
  Product.thisSessionIndex = Product.sessionIndex;
  Product.sessionIndex++;
  // Product.sessions.push(this);
};

// Constructor for Product object
function Product(productName, imgFileName) {
  this.name = productName;
  this.src = imgFileName;
  this.displayCount = 0;
  this.clickCount = 0;
  this.affinity = 0;
  this.chartColor = 0;
  this.ID = Product.productID++;
  // Product.prodArray.push(this); // Add newly created object to product array
}

// Method: Calculate affinity (votes/views) for this object
// Product.prototype.votesPerView = function() {
//   var rv = 0;
//   if (this.displayCount !== 0) { // Protect against zero displays (shouldn't happen but...)
//     rv = (this.clickCount / this.displayCount) * 100;
//   }
//   this.affinity = Number.parseFloat(rv);
// };

// Method: Generate chart color for this based on its ID number
Product.genChartColor = function(thisObj) {
  var rgb = function(r, g, b) {
    return '#' + r.toString(16) + g.toString(16) + b.toString(16);
  };
  // debugger;
  var factor = (255 - 100) / Product.thisSession.prodArray.length;
  var r = 120;
  var g = Math.floor(100 + (parseInt(thisObj.ID) * factor));
  var b = Math.floor(250 - (parseInt(thisObj.ID) * factor));
  thisObj.chartColor = rgb(r, g, b);
};

// Return set of array indices that are unique between turns
Product.getRandomImageIndices = function(tableauSize) {
  var i = 0;
  var usedThisTurn = []; // put this turn's indices here
  while (i < tableauSize) { // for each "cell" in the picture tableau
    var r = Math.floor(Math.random() * Product.thisSession.prodArray.length); // get a random index
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
    imgEl.src = Product.thisSession.prodArray[displayList[img]].src; // set image src attribute
    var capEl = document.getElementById('c'+img);
    capEl.textContent = Product.thisSession.prodArray[displayList[img]].name; // update image caption
    // add pid attributes to image, caption and figure
    // Needed because user could click on any of these to vote
    imgEl.setAttribute('pid', Product.thisSession.prodArray[displayList[img]].ID);
    capEl.setAttribute('pid', Product.thisSession.prodArray[displayList[img]].ID);
    var figEl = document.getElementById('f'+img);
    figEl.setAttribute('pid', Product.thisSession.prodArray[displayList[img]].ID);
    // Increment product's displayed counter
    Product.thisSession.prodArray[displayList[img]].displayCount++;
  }
  // update votes remaining tally on screen
  var vcEl = document.getElementById('votes-left');
  vcEl.textContent = Product.thisSession.votes;
};

// Event listener for click on product image
Product.figureClicked = function(e) {
  // figure out which product is displayed
  var prodID = e.target.getAttribute('pid');
  console.log(prodID, 'clicked');
  // increment it's vote count
  // debugger;
  Product.thisSession.prodArray[prodID].clickCount++; // = parseInt(Product.thisSession.prodArray[prodID].clickCount) + 1;
  // Product.prodArray[prodID].clickCount++;
  // save vote to votes array
  Product.votes.push(new Product.Vote(Product.thisSession.prodArray[prodID], Product.thisSession.userName));
  // decrement global vote count and update display
  Product.thisSession.votes--;
  Product.saveSessions(); // save data to local storage.
  Product.saveProdArray();
  Product.saveVotes();

  if (Product.thisSession.votes > 0) {
  // display more images
    Product.displayProductImages(Product.thisSession.tableauSize);
  } else {
    // end timed portion of the session
    Product.thisSession.sessionEnd = Date.now();
    // update affinity values of each product
    Product.updateAffinityResults();
    // Give each product it's own chart color
    Product.pickChartColors();
    // Save results under [userName+results] key
    // localStorage[Product.sessions[Product.thisSessionIndex].userName.toLowerCase()+'Results'] = JSON.stringify(Product.thisSession.prodArray);
    Product.saveProdArray();
    // Save sessions to local storage
    Product.saveSessions();
    // localStorage.sessions = JSON.stringify(Product.sessions);
    // Save votes to local storage, appending to existing votes
    // localStorage.votes = JSON.stringify(Product.votes);
    Product.saveVotes();

    Product.stopListening();
    Product.prepHtmlForResults(); // put results heading on the page (once)
    Product.displayResults('clickCount', false); // display votes initially decending sorted on clickCount (votes)
  }
};

Product.saveSessions = function() {
  localStorage.sessions = JSON.stringify(Product.sessions);
};
Product.saveProdArray = function() {
  localStorage[Product.userName.toLowerCase()+'Results'] = JSON.stringify(Product.prodArray);
};
Product.saveVotes = function() {
  localStorage.votes = JSON.stringify(Product.votes);
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
  for (var i of Product.thisSession.prodArray) {
    // i.votesPerView();
    i.affinity = Number.parseFloat(parseInt(i.clickCount) / parseInt(i.displayCount)) * 100;
  }
};

// Pick a chart color for each product
Product.pickChartColors = function() {
  for (var i in Product.thisSession.prodArray) {
    Product.genChartColor(Product.thisSession.prodArray[i]);
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
  console.group('getUserInput');
  Product.userName = document.getElementById('userName').value;
  if (Product.userName === '') Product.userName = 'anonymous';
  Product.sessionNum = parseInt(document.getElementById('session').value);
  Product.tableauSize = parseInt(document.querySelector('input[name="tableauSize"]:checked').value);
  console.log('userName',Product.userName,'sessonNum',Product.sessionNum,'tableauSize',Product.tableauSize);

  // stop listening for user input
  var formEl = document.getElementById('submit');
  formEl.removeEventListener('click', Product.getUserInput);

  // new session or resume last incomplete session?
  Product.thisSession = Product.getThisSession(Product.userName);
  console.log('thisSession',Product.thisSession);
  Product.sessions.push(Product.thisSession);

  // capture session data
  // Product.sessions.push(Product.thisSession);
  Product.saveSessions();

  // restore or initialize user's accumulated product voting data
  //Product.prodArray = Product.restoreResults(Product.userName);
  Product.saveProdArray();
  // localStorage.setItem(Product.userName.toLowerCase()+'Results', Product.prodArray); // save data

  // remove input form from page
  Product.clearUserInputForm();
  console.groupEnd();

  // begin voting products
  Product.voteProducts();
};

// Return new session if last one was completed or
// last session if it wasn't completed.
Product.getThisSession = function(userName) {
  var lastSession = Product.findLastSession(userName);
  if (lastSession === null || lastSession.votes === 0) { // create a new session
    lastSession = new Product.Session();
  } else {
    lastSession = Product.restoreSessionObj(lastSession);
    Product.prodArray = lastSession.prodArray;
  }
  return lastSession;
};

// Scan sessions array for userName.
Product.findLastSession = function(userName) {
  for (var s = Product.sessions.length-1; s >= 0; s--) {
    if (userName.toLowerCase() === Product.sessions[s].userName.toLowerCase()) {
      Product.sessions[s].votes = parseInt(Product.sessions[s].votes);
      return Product.sessions[s];
    }
  }
  return null;
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
  for (var f = 0; f < Product.thisSession.tableauSize; f++) {
    Product.createFigureElement(f);
  }
  // Display intial set of product images
  Product.displayProductImages(Product.thisSession.tableauSize);
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
  Product.thisSession.prodArray = Product.sortObjArrayOnKey(Product.thisSession.prodArray, keyName, ascending);
  // clear all arrays (needed between sorts otherwise we get 2x data)
  Product.chartData.allProdNames = [];
  Product.chartData.allVotes = [];
  Product.chartData.allViews = [];
  Product.chartData.allAffinities = [];
  Product.chartData.allColors = [];
  // populate the chart data arrays
  var pObj = Product.objParamDeconstruct(Product.thisSession.prodArray);
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
Product.productFactory = function(JSONstring) {
  // debugger;
  // Product.prodArray = [];
  // if (JSONstring !== null) {
  if (JSONstring === null) return null;
  var oArray = [];
  for (var o of JSONstring) {
    // var p = new Product(o.name, o.src);
    o.displayCount = parseInt(o.displayCount);
    o.clickCount = parseInt(o.clickCount);
    o.affinity = parseFloat(o.affinity);
    o.ID = parseInt(o.ID);
    oArray.push(o);
  }
  // }
  return oArray;
};

// reconstitute Products.sessions array
Product.sessionsFactory = function(JSONstring) {
  if (JSONstring === null) return null;

  var sArray = [];
  for (var o of JSONstring) {
    o = Product.restoreSessionObj(o);
    // pArray = Product.productFactory(o.prodArray); // replace with prodArray from prior session
    // s.prodArray = pArray
    sArray.push(o);
  }
  return sArray;
};

Product.restoreSessionObj = function(o) {
  // var pArray = [];
  // var s = new Product.Session();
  o.sessonNum = parseInt(o.sessionNum);
  // s.userName = o.userName;
  o.tableauSize = parseInt(o.tableauSize);
  o.sessionStart = parseInt(o.sessionStart);
  o.sessionEnd = parseInt(o.sessionEnd);
  o.votes = parseInt(o.votes);
  // s.prodArray = []; // clear prodArray created by constructor
  for (var i in o.prodArray) {
    o.prodArray[i] = Product.restoreProdObj(o.prodArray[i]);
  }
  return o;
};

Product.restoreProdObj = function(o) {
  // var p = new Product(o.name, o.src);
  // p.displayCount = parseInt(o.displayCount);
  // p.clickCount = parseInt(o.clickCount);
  // p.affinity = parseFloat(o.affinity);
  // p.ID = parseInt(o.ID);
  // return p;
  o.displayCount = parseInt(o.displayCount);
  o.clickCount = parseInt(o.clickCount);
  o.affinity = parseFloat(o.affinity);
  o.ID = parseInt(o.ID);
  return o;
};

Product.restoreResults =function(user) {
  // debugger;
  var resultsKey = user.toLowerCase()+'Results';
  Product.prodArray = Product.productFactory(JSON.parse(localStorage.getItem(resultsKey)))
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
  return Product.prodArray;
};

Product.initSessionData = function() {

  var sessions = JSON.parse(localStorage.getItem('sessions'));
  if (sessions) {
    Product.sessions = Product.sessionsFactory(sessions);
    Product.sessionIndex = Product.sessions.length;
    Product.thisSessionIndex = Product.sessionIndex - 1;
  } //else {
  //   new Product.Session(); //create new session (pushes onto Product.sessions array)
  // }
  // Product.sessions = Product.sessionsFactory(JSON.parse(localStorage.getItem('sessions')))
  // || [];
  // Product.sessionIndex = Product.sessions.length; // index of next session
  // Product.thisSessionIndex = Product.sessionIndex - 1; // index of last session

};

// Initialize objects and first listener
Product.init = function() {
  // Globals
  Product.productID = 0; // Give each product an internal ID
  Product.prodArray = []; // Array of product objects
  Product.voteCount = 25; // When === 0 show results
  Product.usedLastTurn = [999,999,999]; // ID's of last turn's pics
  Product.tableauSize; // number of product pics to display
  Product.sessionNum = 0; // session number of this user's voting
  Product.sessions;
  Product.userName = ''; // this user's name
  // Globals for chart display
  Product.chartData = {
    allProdNames: [],
    allVotes: [],
    allViews: [],
    allAffinities: [], // votes/view percentage
    allColors: []
  };

  // Restore session data
  Product.initSessionData();

  // get userName from last session and offer that as name for current session
  var el = document.getElementById('userName');
  el.setAttribute('value',(Product.sessions[0] ? Product.sessions[Product.thisSessionIndex].userName : ''));

  // Restore votes array
  Product.votes = JSON.parse(localStorage.getItem('votes')) || [];

  // start up listener on user input form
  Product.formEl = document.getElementById('submit');
  Product.formEl.addEventListener('click', Product.getUserInput);
};

// Do it!
Product.init();