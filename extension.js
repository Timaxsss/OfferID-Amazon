document.addEventListener("DOMContentLoaded", async function () {
    const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
    if (!currentTab || !currentTab.url.includes("amazon.fr")) {
      document.getElementById("status").innerText =
        "⚠️ Please open an Amazon product page.";
      return;
    }
  
    chrome.scripting.executeScript(
      {
        target: { tabId: currentTab.id },
        function: extractProductData,
      },
      (scriptResult) => {
        if (
          chrome.runtime.lastError ||
          !scriptResult ||
          !scriptResult[0] ||
          !scriptResult[0].result
        ) {
          document.getElementById("status").innerText =
            "⚠️ Unable to extract data.";
          return;
        }
  
        const { productAsin, productOfferId } = scriptResult[0].result;
        if (!productAsin || !productOfferId) {
          document.getElementById("status").innerText =
            "⚠️ ASIN or Offer ID not found.";
          return;
        }
  
        // Copy button configuration
        document
          .getElementById("copy-asin")
          .addEventListener("click", () => {
            copyToClipboard(productAsin, "ASIN copied successfully");
          });
  
        document
          .getElementById("copy-offer-id")
          .addEventListener("click", () => {
            copyToClipboard(productOfferId, "Offer ID copied successfully");
          });
  
        document.getElementById("status").innerText = "✅ Data extracted successfully";
      }
    );
  });
  
  function extractProductData() {
    // ASIN extraction
    const asinInputElement = document.querySelector("#ASIN");
    const productAsin = asinInputElement ? asinInputElement.value : null;
  
    // Offer ID extraction
    const offerInputElement =
      document.querySelector("#offerListingID") ||
      document.querySelector("input[name='items[0.base][offerListingId]']");
    const productOfferId = offerInputElement ? offerInputElement.value : null;
  
    return { productAsin, productOfferId };
  }
  
  function copyToClipboard(textToCopy, successMessage) {
    navigator.clipboard.writeText(textToCopy).then(() => {
      const statusElement = document.getElementById("status");
      statusElement.innerText = `📋 ${successMessage}`;
      setTimeout(() => {
        statusElement.innerText = "✅ Data extracted successfully";
      }, 1500);
    });
  }