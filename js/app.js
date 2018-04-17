'use strict';

// Globals
var productID = 0; // Give each product an internal ID
var prodArray = []; // Array of product objects
var voteCount = 25; // When === 0 show results
var usedLastTurn = [999,999,999]; // ID's of last turn's pics
var tableauSize; // number of product pics to display
var sessionNum, userName;
// Constructor for Product object
function Product(productName, imgFileName) {
  this.name = productName;
  this.src = 'img/' + imgFileName;
  this.displayCount = 0;
  this.clickCount = 0;
  this.ID = productID++;
  prodArray.push(this);
}

Product.prototype.votesPerView = function() {
  var rv = 0;
  if (this.displayCount !== 0) {
    rv = this.clickCount / this.displayCount;
  }
  return Number.parseFloat(rv).toPrecision(1);
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

function getRandomImageIndices(tableauSize) {
  // return three random product indexes that aren't in
  // usedLastTurn array
  var i = 0;
  var usedThisTurn = [];
  while (i < tableauSize) {
    var r = Math.floor(Math.random() * prodArray.length);
    if (!usedLastTurn.includes(r) && !usedThisTurn.includes(r)) { // r is unique last turn
      usedThisTurn.push(r);
      i++;
    }
  }
  console.log('last turn',usedLastTurn,'this turn',usedThisTurn);
  usedLastTurn = usedThisTurn;
  return usedThisTurn;
}

// Select product images at random that weren't used last turn
function displayProductImages(tableauSize) {
  var displayList = getRandomImageIndices(tableauSize);
  // Display the images on the page
  for (var img = 0; img < displayList.length; img++) {
    // modify DOM for image to display file and name
    var imgEl = document.getElementById(
      'i'+img);
    imgEl.src = prodArray[displayList[img]].src;
    var capEl = document.getElementById('c'+img);
    capEl.textContent = prodArray[displayList[img]].name;
    // add pid attributes to image, caption and figure
    // Needed because user could click on any of these to vote
    var pID = prodArray[displayList[img]].ID;
    imgEl.setAttribute('pid', pID);
    capEl.setAttribute('pid', pID);
    var figEl = document.getElementById('f'+img);
    figEl.setAttribute('pid', pID);
    prodArray[displayList[img]].displayCount++;
  }
  // update votes remaining tally
  var vcEl = document.getElementById('votes-left');
  vcEl.textContent = voteCount;
}

function figureClicked(e) {
  // figure out which product is displayed
  var prodID = e.target.getAttribute('pid');
  console.log(prodID);
  // increment it's vote count
  prodArray[prodID].clickCount++;
  // decrement global vote count and update display
  voteCount--;

  if (voteCount > 0) {
  // display more images
    displayProductImages(tableauSize);
  } else {
    // shut down listeners and display results
    stopListening(tableauSize);
    displayResults();
  }
}

function startListening(tableauSize) {
  for (var p = 0; p < tableauSize; p++) {
    var figure = document.getElementById('f'+p);
    figure.addEventListener('click',figureClicked);
  }
}

function stopListening(tableauSize) {
  for (var p = 0; p < tableauSize; p++) {
    var figure = document.getElementById('f'+p);
    figure.removeEventListener('click',figureClicked);
  }
}

function displayResults() {
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

  // Create a table with header and append to main
  var tableEl = document.createElement('table');
  var trEl = document.createElement('tr');
  createTextElement('th','Product',trEl);
  createTextElement('th','Votes',trEl);
  createTextElement('th','Views',trEl);
  createTextElement('th','Votes/View',trEl);
  tableEl.appendChild(trEl);
  mainEl.appendChild(tableEl);

  // Loop through Products displaying results

  for (var p = 0; p < prodArray.length; p++) {
    console.log(prodArray[p].name, prodArray[p].clickCount,prodArray[p].displayCount,prodArray[p].votesPerView());
    trEl = document.createElement('tr');
    createTextElement('td',prodArray[p].name,trEl);
    createTextElement('td',prodArray[p].clickCount,trEl);
    createTextElement('td',prodArray[p].displayCount,trEl);
    createTextElement('td',prodArray[p].votesPerView(),trEl);
    tableEl.appendChild(trEl);
  }
}

function createTextElement(tag, text, parent) {
  var el = document.createElement(tag);
  el.textContent = text;
  parent.appendChild(el);
}

function createFigureElement(figNum) {
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
}

function getUserInput() {

  userName = document.getElementById('userName').value;
  sessionNum = parseInt(document.getElementById('session').value);
  tableauSize = parseInt(document.querySelector('input[name="tableauSize"]:checked').value);

  // stop listening
  var formEl = document.getElementById('submit');
  formEl.removeEventListener('click', getUserInput);

  // remove input form from page
  clearUserInputForm();

  // begin voting products
  voteProducts();
}

function clearUserInputForm() {
  // delete <main> element from page
  var formEl = document.getElementById('input-form');
  formEl.parentNode.removeChild(formEl);
  return false;
}

function insertTableauHeading() {
  var mainEl = document.getElementById('product-headings');
  var heading = document.createElement('h3');
  heading.textContent = 'Click on the product you\'d be most likely to purchase';
  mainEl.appendChild(heading);
  var subHeading = document.createElement('h4');
  subHeading.innerHTML = '<span id="votes-left">25</span> Votes Remaining';
  mainEl.appendChild(subHeading);
}

function voteProducts() {

  insertTableauHeading();

  for (var f = 0; f < tableauSize; f++) {
    createFigureElement(f);
  }

  displayProductImages(tableauSize);

  startListening(tableauSize);
}

var formEl = document.getElementById('submit');
formEl.addEventListener('click', getUserInput);