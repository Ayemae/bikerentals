let products = [];

$(() => {
  $.getJSON("bikerentals.json", data => {
    products = data.products;
    $.each(data.products, (i, product) => {
      const productDiv = `<div id="item-${product.id}" 
         class="store-product" 
         data-id="${product.id}">

           <img src="${product.image}" alt="${product.name}" />

           <h2>${product.name}</h2>

           <span class="price">${product.price.toFixed(2)}</span>

           <button id="buy-btn" >Add to cart</button>

         </div>`;
      $(productDiv).appendTo("#shop-index");
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

  $(document.body).on("click", "#buy-btn", function() {
    const dataIndex =
      $(this)
        .parent()
        .data("id") - 1;
    const bought = {
      id: products[dataIndex].id,
      name: products[dataIndex].name,
      img: products[dataIndex].image,
      price: products[dataIndex].price,
      product_type: products[dataIndex].product_type
    };

    cart.items.push(bought.id);
    cart.priceTotal += bought.price;
    if (bought.product_type === "bike") cart.hasBike = true;
    if (bought.product_type === "addon") cart.hasInsurance = true;
    console.log(`Has Bike?: ${cart.hasBike}`);

    $("#my-cart").text(`
        $${cart.priceTotal.toFixed(2)} [${cart.items.length} items]
      `);
    $("#cart-total").text(`
        $${cart.priceTotal.toFixed(2)} [${cart.items.length} items]
      `);
    $("#cart-display").append(`
        <div class="cart-item" data-id="${bought.id}">
          <div><img src="${bought.img}" alt="${bought.name}" /> </div>
          <div>${bought.name}</div>
          <div>${bought.price.toFixed(2)}</div>
          <button id="rmv-btn">remove</button>
        </div>
      `);
    return cart;
  });

  $(document.body).on("click", "#rmv-btn", function() {
    const removedID = $(this)
      .parent()
      .data("id");
    const dataIndex = removedID - 1;
    let nOfRmv = 0;

    $(() => {
      if (products[dataIndex].product_type === "bike") {
        for (let i = 0; i < cart.items.length; i++) {
          if (products[cart.items[i] - 1].product_type === "bike") {
            console.log("Bike Found");
            return;
          } else {
            console.log("No bike.");
            cart.hasBike = false;
          }
        }
      }
    });

    if (products[dataIndex].product_type === "addon") cart.hasInsurance = false;

    for (let i = 0; i < cart.items.length; i++) {
      if (cart.items[i] === removedID) {
        cart.items.splice(i, 1);
        nOfRmv++;
        i--;
      }
    }

    cart.priceTotal -= products[dataIndex].price * nOfRmv;

    console.log(`Has Bike?: ${cart.hasBike}`);

    $("#my-cart").text(`
        $${cart.priceTotal.toFixed(2)} [${cart.items.length} items]
      `);
    $("#cart-total").text(`
        $${cart.priceTotal.toFixed(2)} [${cart.items.length} items]
      `);
    $(`div.cart-item[data-id='${removedID}']`).remove();

    console.log(cart);
    return cart;
  });
});
