'use strict';

// Globals
var productID = 0; // Give each product an internal ID
var prodArray = []; // Array of product objects
var voteCount = 25; // When === 0 show results
var usedLastTurn = [999,999,999]; // ID's of last turn's pics

// Constructor for Product object
function Product(productName, imgFileName) {
  this.name = productName;
  this.src = 'img/' + imgFileName;
  this.displayCount = 0;
  this.clickCount = 0;
  this.ID = productID++;
  prodArray.push(this);
}

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

function getThreeRandomImageIndices() {
  // return three random product indexes that aren't in
  // usedLastTurn array
  var i = 0;
  var usedThisTurn = [];
  while (i < 3) {
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


function displayThreeImages() {
  // Select three images at random that weren't used last turn
  var displayList = getThreeRandomImageIndices();
  // Display the three images on the page
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
}

function figureClicked(e) {
  // figure out which product is displayed
  var prodID = e.target.getAttribute('pid');
  console.log(prodID);
  // increment it's vote count
  prodArray[prodID].clickCount++;
  // decrement global vote count
  voteCount--;
  if (voteCount > 0) {
  // display three more images
    displayThreeImages();
  } else {
    // shut down listeners and display results
    stopListening();
    displayResults();
  }
}

function stopListening() {
  var figure0 = document.getElementById('f0');
  figure0.removeEventListener('click',figureClicked);
  var figure1 = document.getElementById('f1');
  figure1.removeEventListener('click', figureClicked);
  var figure2 = document.getElementById('f2');
  figure2.removeEventListener('click', figureClicked);
}

function startListening() {
  var figure0 = document.getElementById('f0');
  figure0.addEventListener('click',figureClicked);
  var figure1 = document.getElementById('f1');
  figure1.addEventListener('click', figureClicked);
  var figure2 = document.getElementById('f2');
  figure2.addEventListener('click', figureClicked);
}

function displayResults() {
  console.log('Display Results Here');
}

displayThreeImages();

startListening();