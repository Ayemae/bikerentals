let products = [];

// Get data from json
$(() => {
  $.getJSON("bikerentals.json", data => {
    products = data.products;
    $.each(data.products, (i, product) => {
      if (product.product_type != "addon") {
        const productDiv = `<div id="item-${product.id}" 
         class="store-product" 
         data-id="${product.id}">
           <img src="${product.image}" alt="${product.name}" />
           <h2>${product.name}</h2>
           <span class="price">$${product.price.toFixed(2)}</span>
           <button id="buy-btn" >Add to cart</button>
         </div>`;
        $(productDiv).appendTo("#shop-index");
      }
    });
  }).then(() => {
    return products;
  });
});

$(document).ready(() => {
  let cart = {
    items: [],
    priceTotal: 0,
    hasBike: false,
    hasInsurance: false
  };

  const adjustCartSummary = () => {
    $("#my-cart").text(`
        $${cart.priceTotal.toFixed(2)} [${cart.items.length} items]
      `);
    $("#cart-total").text(`
        $${cart.priceTotal.toFixed(2)} [${cart.items.length} items]
      `);
  };

  const insurancePromo = () => {
    if (cart.hasInsurance == false) {
      $("#promo").html(`
    <p>Would you like to apply our insurance package to your order for only $9.99?</p>
    <button id="add-insurance" data-id="6">Yes, apply the insurance package.</button>`);
    }
  };

  const validCheckout = () => {
    if (cart.items.length > 0) {
      if (cart.hasBike == true) {
        $("#checkout").html(`
    <button id="checkout-submit">Checkout</button>`);
      } else {
        $("#checkout").html(
          `<button disabled>Your cart must contain a bike to checkout</button>`
        );
      }
    } else {
      $("#checkout").html(``);
    }
  };

  const findBike = dataID => {
    // make sure a bike is still in the cart
    if (products[dataID].product_type === "bike") {
      for (let i = 0; i < cart.items.length; i++) {
        if (products[cart.items[i] - 1].product_type === "bike") {
          return;
        } else {
          cart.hasBike = false;
          return cart.hasBike;
        }
      }
    }
  };

  // If Cart is in local storage, populate cart
  // if (localStorage.getItem("cart-items") != null) {
  //   cart = {
  //     items: $.map($(localStorage.getItem("cart-items")).text().split(','), function(value){
  //       return parseInt(+value)}),
  //     priceTotal: parseInt(localStorage.getItem("cart-priceTotal")),
  //     hasBike: (/true/i).test(localStorage.getItem("cart-hasBike")),
  //     hasInsurance: (/true/i).test(localStorage.getItem("cart-hasInsurance"))
  //   };
  // }

  const moreLessBtns = `
  <button id="less">-</button>
  <button id="more">+</button>
  `;

  const saveCart = () => {
    localStorage.setItem("cart-items", cart.items);
    localStorage.setItem("cart-priceTotal", cart.priceTotal);
    localStorage.setItem("cart-hasBike", cart.hasBike);
    localStorage.setItem("cart-hasInsurance", cart.hasInsurance);
  };

  ///////// WHEN PAGE OPENS
  insurancePromo();

  ////////////////////// BUY BUTTON
  $(document.body).on("touchstart click", "#buy-btn", function() {
    // Which item is being bought?
    const dataIndex =
      $(this)
        .parent()
        .data("id") - 1;

    // Get info for bought item
    const bought = {
      id: products[dataIndex].id,
      name: products[dataIndex].name,
      img: products[dataIndex].image,
      price: products[dataIndex].price,
      product_type: products[dataIndex].product_type
    };
    let itemCount = 0;

    // Push id of bought item into cart
    cart.items.push(bought.id);
    // Check for number of that item in cart
    for (let i = 0; i < cart.items.length; i++) {
      if (bought.id === cart.items[i]) {
        itemCount++;
      }
    }

    cart.priceTotal += bought.price;
    if (bought.product_type === "bike") cart.hasBike = true;
    if (bought.product_type === "addon") cart.hasInsurance = true;
    console.log(`Has Bike?: ${cart.hasBike}`);

    adjustCartSummary();
    if (itemCount > 1) {
      $(`div.cart-item[data-id='${bought.id}'`)
        .children()
        .children("div#item-amount")
        .text(`Amount: ${itemCount}`);
      $(`div.cart-item[data-id='${bought.id}'`)
        .children("#item-price")
        .text(`$${(bought.price * itemCount).toFixed(2)}`);
      console.log(`Found another ${bought.name} in cart`);
    } else {
      $("#cart-display").append(`
        <div class="cart-item" data-id="${bought.id}">
        <div class="cart-item-interior">
          <div id="item-amount">Amount: ${itemCount}</div> <div class="more-less">${moreLessBtns}</div>
        </div>
          <div id="item-img" class="cart-item-interior"><img src="${
            bought.img
          }" alt="${bought.name}" /> </div>
          <div id="item-name" class="cart-item-interior">${bought.name}</div>
          <div id="item-price" class="cart-item-interior">$${bought.price.toFixed(
            2
          )}</div>
          <div class="cart-item-interior"><button id="rmv-btn">remove from cart</button></div>
        </div>
      `);
    }
    console.log(cart.items);
    validCheckout();
    saveCart();
    return cart;
  });

  ///////////////////////// REMOVE BUTTON
  $(document.body).on("touchstart click", "#rmv-btn", function() {
    const removedID = $(this)
      .parent()
      .parent()
      .data("id");
    const dataIndex = removedID - 1;
    let nOfRmv = 0;

    findBike(dataIndex);

    // did customer remove insurance?
    if (products[dataIndex].product_type === "addon") {
      cart.hasInsurance = false;
      insurancePromo();
    }
    // Remove all item(s) of this id from cart
    for (let i = 0; i < cart.items.length; i++) {
      if (cart.items[i] === removedID) {
        cart.items.splice(i, 1);
        nOfRmv++;
        i--;
      }
    }
    // Subtract cart total by price of all items removed
    cart.priceTotal -= products[dataIndex].price * nOfRmv;
    console.log(`Has Bike?: ${cart.hasBike}`);

    adjustCartSummary();
    $(`div.cart-item[data-id='${removedID}']`).remove();

    console.log(cart.items);
    validCheckout();
    saveCart();
    return cart;
  });

  //////////////////////// MORE BUTTON
  $(document.body).on("touchstart click", "#more", function() {
    // Which item is being increased?
    const itemID = $(this)
      .closest(".cart-item")
      .data("id");
    console.log(itemID);
    // data id for item
    const dataIndex = itemID - 1;
    let itemCount = 0;

    // Check how many of item was already in cart
    for (let i = 0; i < cart.items.length; i++) {
      if (itemID === cart.items[i]) {
        itemCount++;
      }
    }
    // Add another of item
    itemCount++;

    // Push id of added item into cart
    cart.items.push(itemID);
    // Increase cart total by price of item added
    cart.priceTotal += products[dataIndex].price;

    // Change DOM to reflect change
    adjustCartSummary();
    $(`div.cart-item[data-id='${itemID}'`)
      .children(".cart-item-interior")
      .children("#item-amount")
      .text(`Amount: ${itemCount}`);
    $(`div.cart-item[data-id='${itemID}'`)
      .children("#item-price")
      .text(`$${(products[dataIndex].price * itemCount).toFixed(2)}`);

    console.log(cart.items);
    saveCart();
    return cart;
  });

  //////////////// LESS BUTTON
  $(document.body).on("touchstart click", "#less", function() {
    // Which item is being decreased?
    const itemID = $(this)
      .closest(".cart-item")
      .data("id");
    console.log(itemID);
    // data id for item
    const dataIndex = itemID - 1;
    let itemCount = 0;

    // Check how many of item was already in cart
    for (let i = 0; i < cart.items.length; i++) {
      if (itemID === cart.items[i]) {
        itemCount++;
      }
    }
    console.log(`itemCount after array acount: ${itemCount}`);

    // Remove one of this item from cart and from itemCount
    for (let i = 0; i < cart.items.length; i++) {
      if (cart.items[i] === itemID) {
        cart.items.splice(i, 1);
        itemCount--;
        console.log(`itemCount after subtraction: ${itemCount}`);

        // Decrease cart total by price of item added
        cart.priceTotal -= products[dataIndex].price;

        // Change DOM to reflect change
        adjustCartSummary();
        if (itemCount === 0) {
          findBike(dataIndex);
          $(`div.cart-item[data-id='${itemID}']`).remove();
        } else {
          $(`div.cart-item[data-id='${itemID}'`)
            .children(".cart-item-interior")
            .children("#item-amount")
            .text(`Amount: ${itemCount}`);
          $(`div.cart-item[data-id='${itemID}'`)
            .children("#item-price")
            .text(`$${(products[dataIndex].price * itemCount).toFixed(2)}`);
        }

        console.log(cart.items);
        validCheckout();
        saveCart();
        return cart;
      }
    }
  });

  //////////////////////// ADD INSURANCE
  $(document.body).on("touchstart click", "#add-insurance", function() {
    // Which item is being increased?
    const itemID = $(this).data("id");
    const dataIndex = itemID - 1;

    // Push id of added item into cart
    cart.items.push(itemID);
    // Increase cart total by price of item added
    cart.priceTotal += products[dataIndex].price;

    // Change DOM to reflect change
    adjustCartSummary();
    $("#cart-display").append(`
        <div class="cart-item" data-id="${itemID}">
        <div class="cart-item-interior">
          <div id="item-amount" style="font-size: .9em">Insurance has been applied to your order!</div>
        </div>
          <div id="item-img" class="cart-item-interior"><img src="${
            products[dataIndex].image
          }" alt="${products[dataIndex].name}" /> </div>
          <div id="item-name" class="cart-item-interior">${
            products[dataIndex].name
          }</div>
          <div id="item-price" class="cart-item-interior">$${products[
            dataIndex
          ].price.toFixed(2)}</div>
          <div class="cart-item-interior"><button id="rmv-btn">remove from cart</button></div>
        </div>
      `);
    $("#promo").html("");

    console.log(cart.items);
    validCheckout();
    saveCart();
    return cart;
  });

  $(document.body).on("touchstart click", "#checkout-submit", function() {
    let arrOfChecked = [];
    const validate = confirm(`Proceed to checkout?`);
    if (validate == true) {
      $("#info").html(`
    <h2>Thank you for your order!</h2>
      <h3>Order summary:</h3>
      <ul id="order-summary"></ul>
      <div class="summary-total">Total: $${cart.priceTotal.toFixed(2)}</div>
    `);

      for (let i = 0; i < cart.items.length; i++) {
        let dataIndex = cart.items[i] - 1;
        let nOfItem = 0;
        if (arrOfChecked.includes(cart.items[i]) == false) {
          arrOfChecked.push(cart.items[i]);
          for (let ii = 0; ii < cart.items.length; ii++) {
            console.log(dataIndex);
            if (cart.items[ii] === cart.items[i]) {
              nOfItem++;
            }
          }
          let listItem = `<li>${products[dataIndex].name}, ${nOfItem}</li>`;
          $("#order-summary").append(listItem);
        }
      };

      // reset cart
      cart = {
        items: [],
        priceTotal: 0,
        hasBike: false,
        hasInsurance: false
      };

      // Change DOM to reflect change
      adjustCartSummary();
      document.body.scrollTop = document.documentElement.scrollTop = 0;
      $("#cart-display").html(``);

      console.log(cart.items);
      validCheckout();
      saveCart();
      return cart;
    }
  });

  $(document.body).on("click mouseenter", ".activate-cart-drop", function() {
    if ( $( "#cart" ).first().is( ":hidden" ) ) {
      $( "#cart" ).slideDown( 500 ).css("display", "flex");
    }
  });

  $(document.body).on("mouseleave", ".header", function() {
    $( "#cart" ).fadeOut();
  });
});
