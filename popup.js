/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  var queryInfo = {
    active: true,
    currentWindow: true,
  };

  chrome.tabs.query(queryInfo, function (tabs) {
    var tab = tabs[0];
    var url = tab.url;

    console.assert(typeof url == "string", "tab.url should be a string");
    callback(url);
  });
}

function getNumberOfSyllables(text) {
  var n = 0;
  var arr = text.split(" ");
  for (var i = arr.length - 1; i >= 0; i--) {
    var word = arr[i];
    word = word.toLowerCase();
    if (word.length <= 3) {
      n += 1;
      continue;
    }
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
    word = word.replace(/^y/, "");
    n += word.match(/[aeiouy]{1,2}/g).length;
  }
  return n;
}

function renderText(text) {
  var w = text.split(/[^\s]+/).length - 1;
  var st = text.split(/[^.!?]+/).length - 1;

  var sy = getNumberOfSyllables(text);
  var fr = 206.835 - 1.015 * (w / st) - 84.6 * (sy / w);
  var readability;
  if (fr <= 30) {
    readability = "Difficult";
  } else if (fr >= 90) {
    readability = "Easy";
  } else {
    readability = "Moderate";
  }

  var finalText =
    "Number of words: " +
    w +
    "\n" +
    "Number of sentences: " +
    st +
    "\n" +
    "Flesch readability score: " +
    readability +
    " ";

  document.getElementById("text").textContent = finalText;
}

document.addEventListener("DOMContentLoaded", function () {
  getCurrentTabUrl(function (url) {
    chrome.tabs.executeScript(
      {
        code: "window.getSelection().toString();",
      },
      function (selection) {
        if (!selection || selection == "") {
          document.getElementById("text").textContent =
            "Please select your text!";
        } else renderText(selection[0]);
      }
    );
  });
});
