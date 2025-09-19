function getValue(id) {
  return document.getElementById(id).value;
}

function setText(id, text) {
  document.getElementById(id).innerText = text;
}

function setImageSrc(id, src) {
  document.getElementById(id).src = src;
}

// Event listener for search button
document.getElementById("search-btn").addEventListener("click", function () {
  var barcode = getValue("barcode-input").trim();
  // if user doesnt enter code= prompt will show at bottom
  if (barcode === "") {
    setText("error-message", "Please enter a barcode");
    return;
  }

  setText("error-message", ""); // Clear any previous error

  //  API URL with out barcode already generates, user can now search any  food product
  // var url = `https://us.openfoodfacts.org/api/v0/product/${barcode}.json`;

  var url = `https://us.openfoodfacts.org/api/v0/product/0078000082401.json`;
  // image of product here

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data.status) {
        var prodimg = data.product;
        console.log(prodimg);
        // Set product image
        if (prodimg.image_url) {
          setImageSrc("product-image", prodimg.image_url);
        } else {
          setImageSrc("product-image", "https://via.placeholder.com/400x250");
        }

        // Set product name
        setText("product-name", prodimg.product_name || "Unknown Product");
        // Get nutrition values safely
        var nutri = prodimg.nutriments || {};
        // protein check
        var protein;
        if (nutri.protein) {
          protein = nutri.protein_100g + "g per 100g";
        } else {
          protein = "0g";
        }
        // calories check
        var calories;
        if (nutri.energy_kcal) {
          calories = nutri.energy_kcal + "kcal";
        } else {
          calories = "0kcal";
        }
        // sodium display only
        var sodium;
        if (nutri.sodium) {
          sodium = nutri.sodium + "mg";
        } else {
          sodium = "0mg";
        }
        // fat check
        var fat;
        if (nutri.fat) {
          fat = nutri.fat_100g + "g per 100g";
        } else {
          fat = "0g";
        }
        // carbs check
        var carbs;
        if (nutri.carbs) {
          carbs = nutri.carbs_100g + "g per 100g";
        } else {
          carbs = "0g";
        }
        // cholesterol display only
        var cholesterol;
        if (nutri.cholesterol) {
          cholesterol = nutri.cholesterol + "mg";
        } else {
          cholesterol = "0mg";
        }
        //response displayed if true
        setText(
          "nutrition-info",
          `Calories: ${calories}\nProtein: ${protein}\nFat: ${fat}\nCarbs: ${carbs}\nSodium: ${sodium}\nCholesterol: ${cholesterol}`
        );
        // product error checking
      } else {
        setText("error-message", "Product not found for that barcode.");
      }
    })
    // catch error checking
    .catch((error) => {
      console.error("Fetch error:", error);
      setText("error-message", "Error fetching data. Please try again.");
    });
});
//Ai interaction
var botReply = "";
var userPrompt = "";
document.getElementById("Ai-btn").addEventListener("click", function () {
  userPrompt = getValue("Ai-input").trim();
  async function query(data) {
    const response = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    const result = await response.json();
    return result;
  }

  query({
    messages: [
      {
        role: "user",
        content: `Give me a recipe for ${userPrompt}?`,
      },
    ],
    model: "meta-llama/Llama-3.1-8B-Instruct:fireworks-ai",
  }).then((response) => {
    console.log(JSON.stringify(response));
    botReply = response.choices[0].message.content;
    // Render the reply in the output area
    setText("output", botReply);
    setProperty("output", "color", "black");
  });
});
