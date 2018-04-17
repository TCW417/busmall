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
Product.allProdNames = [];
Product.allVotes = [];
Product.allViews = [];
Product.allAffinities = []; // votes/view percentage
Product.allColors = [];

// Constructor for Product object
function Product(productName, imgFileName) {
  this.name = productName;
  this.src = 'img/' + imgFileName;
  this.displayCount = 0;
  this.clickCount = 0;
  this.ID = Product.productID++;
  Product.prodArray.push(this);
}

Product.prototype.votesPerView = function() {
  var rv = 0;
  if (this.displayCount !== 0) {
    rv = (this.clickCount / this.displayCount) * 100;
  }
  return Number.parseFloat(rv); //.toPrecision(1);
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
  Product.collectChartData();

  // Create bar chart
  var ctx0 = document.getElementById('chart0').getContext('2d');
  var votesChart = new Chart(ctx0, {
    type: 'horizontalBar',
    data: {
      labels: Product.allProdNames,
      datasets: [{
        label: 'Number of Votes',
        data: Product.allVotes,
        backgroundColor: Product.allColors,
        borderColor: Product.allColors,
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

  var ctx1 = document.getElementById('chart1').getContext('2d');
  var affinitiesChart = new Chart(ctx1, {
    type: 'horizontalBar',
    data: {
      labels: Product.allProdNames,
      datasets: [{
        label: 'Affinity: votes / views * 100',
        data: Product.allAffinities,
        backgroundColor: Product.allColors,
        borderColor: Product.allColors,
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

Product.collectChartData = function() {
  for (var p = 0; p < Product.prodArray.length; p++) {
    Product.allProdNames.push(Product.prodArray[p].name);
    Product.allVotes.push(Product.prodArray[p].clickCount);
    Product.allViews.push(Product.prodArray[p].displayCount);
    Product.allAffinities.push(Product.prodArray[p].votesPerView());
  }
  Product.allColors = Product.genRandomColors(); // get chart colors
};

Product.genRandomColors = function() {
  var ca = [], c, i = 0;
  while (i < Product.prodArray.length) {
    c = '#'+Math.floor(Math.random() * 0xFFFFFF).toString(16);
    if (!ca.includes(c)) {
      ca.push(c);
    }
    i++;
  }
  return ca;
};

Product.formEl = document.getElementById('submit');
Product.formEl.addEventListener('click', Product.getUserInput);