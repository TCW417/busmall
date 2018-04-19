// Append a <div> element to <div id=product-pics>
createStoreItemElement = function(itemNum) {
  // Get store items div element
  var siDiv = document.getElementById('store-items');

  // create new store item (div) element and assign itemNum as id
  var newItem = document.createElement('div');
  newItem.setAttribute('id','p' + itemNum);

  // add new img element (blank for now)
  var newImg = document.createElement('img');
  newImg.setAttribute('id','i' + itemNum);
  newImg.setAttribute('src','');
  newItem.appendChild(newImg); // append to figure element

  // add new h3 for product name
  var newH3 = document.createElement('h3');
  newH3.setAttribute('id', 'h' + itemNum);
  newItem.appendChild(newH3);

  // add p elemenet for description
  var newDesc = document.createElement('p');
  newDesc.setAttribute('id','d' + itemNum);
  newItem.appendChild(newDesc);

  // add p element for price
  var newPrice = document.createElement('p');
  newPrice.setAttribute('id','c' + itemNum);
  newPrice.innerHTML = 'Price: $<span id=v'+itemNum+'></span>';
  newItem.appendChild(newPrice);

  // append to division
  siDiv.appendChild(newItem);
};

fillInStoreItem = function(productIndex, pageIndex) {
  // add data from products[productIndex] to page at pageIndex
  var prodImgSrc = Product.prodArray[productIndex].src;
  var prodName = Product.prodArray[prodIndex].name;
  var prodDesc = Product.storeDetail[prodName].description;
  var prodPrice = Product.storeDetail[prodName].price;

  var imgEl = document.getElementById('i' +  pageIndex);
  var hEl = document.getElementById('h' + pageIndex);
  var descEl = document.getElementById('d' + pageIndex);
  var priceEl = document.getElementById('v' + pageIndex);
};

getDataFromStorage = function() {
  Product.prodArray = JSON.parse(localStorage.getItem('anonymousResults'));
}
