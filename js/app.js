'use strict';

// Globals
var productID = 0;
var prodArray = [];

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
new Product('Canned Dragon Meat','dragon.jpg');
new Product('Bic Pen Cap Cutlery','pen-left.jpg');
new Product('Pen Floor Sweeping Footies','pet-sweep.jpg');
new Product('Pizza Cutting Scissors','scissors.jpg');
new Product('Kid\'s Shark Sleeping Bag','shark.jpg');
new Product('Baby Sweeping Onesie','sweep.png');
new Product('Star Wars Taun Taun Sleeping Bag','tauntaun.jpg');
new Product('Canned Unicorn Meat','unicorn.jpg');
new Product('Wiggling USB Dragon Tail','usb.gif');
new Product('Recycling Watering Can','water-can.jpg');
new Product('Boquet-Retaining Wine Glass','wine-glass.jpg');
