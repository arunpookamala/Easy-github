const storyIDValue = document.getElementById("forStoryID");
const addedCount = document.getElementById("totalLinesAdded");
const removedCount = document.getElementById("totalLinesRemoved");
const fileNames = document.getElementById("fileNameList");
const commits = document.getElementById("commitList");

const extractCopyText = text =>
  text
    .split("\n")
    // Get rid of new lines
    .filter(_ => _.replace(/\s+/g, ""))
    .map(c => c.trim())
    .join("\n");

const copyToClipboard = code =>
  navigator.clipboard
    .writeText(code)
    .then(() => console.log("Copied to clipboard~"))
    .catch(() => console.log("Failed to copy to clipboard..."));

document.getElementById("copyStoryIDButton").addEventListener("click", _ => {
  const code = extractCopyText(storyIDValue.innerText);
  copyToClipboard(code);
});

document.getElementById("copyTotalAddedLines").addEventListener("click", _ => {
  const code = extractCopyText(addedCount.innerText);
  copyToClipboard(code);
});

document.getElementById("copyTotalRemovedLinesButton").addEventListener("click", _ => {
  const code = extractCopyText(removedCount.innerText);
  copyToClipboard(code);
});

document.getElementById("copyFileNamesButton").addEventListener("click", _ => {
  const code = extractCopyText(fileNames.innerText);
  copyToClipboard(code);
});

document.getElementById("copyCommitsPRButton").addEventListener("click", _ => {
  const code = extractCopyText(commits.innerText);
  copyToClipboard(code);
});

chrome.tabs.query(
  { active: true, windowId: chrome.windows.WINDOW_ID_CURRENT },
  function (tabs) {
    const tabId = tabs[0].id;
    setupStoryIDValue(tabId);
    setupAddedLineCount(tabId);
    setupFileNames(tabId);
    setupRemovedLineCount(tabId);
    setupcommitIDs(tabId);
  }
);

function setupStoryIDValue(tabId) {
  const code = `(function getStoryID(){
      const storyID = document.querySelector('.select2-chosen') 
        ? /[^/]*$/.exec(document.querySelector('.select2-chosen').textContent)[0]
        : undefined;
      return { storyID };
    })()`;
  chrome.tabs.executeScript(tabId, { code }, function (result) {
    const { storyID } = result[0];

    if (storyID) {
      storyIDValue.innerText = storyID;
    } else {
      storyIDValue.innerText = `No story ID found.`;
      copyStoryIDButton.style.visibility = "hidden";
    }
  });
}

function setupAddedLineCount(tabId) {
  const code = `(function getAddedLineCount(){
        var addedLineCount = 0;
        addedLineCount = document.querySelectorAll(".toc-diff-stats strong")[0].innerText.replace(" additions", "").replace(" addition", "");
      return { addedLineCount };
    })()`;

  chrome.tabs.executeScript(tabId, { code }, function (result) {
    const { addedLineCount } = result[0];

    if (addedLineCount) {
      addedCount.innerText = addedLineCount;
    } else {
      addedCount.innerText = `Added line counts are not found.`;
      copyTotalAddedLines.style.visibility = "hidden";
    }
  });
}

function setupRemovedLineCount(tabId) {
  const code = `(function getRemovedLineCount(){
        var removedLineCount = document.querySelectorAll(".toc-diff-stats strong")[1].innerText.replace(" deletions", "").replace(" deletion", "");
      return { removedLineCount };
    })()`;

  chrome.tabs.executeScript(tabId, { code }, function (result) {
    const { removedLineCount } = result[0];

    if (removedLineCount) {
      removedCount.innerText = removedLineCount;
    } else {
      removedCount.innerText = `Removed line counts are not found.`;
      copyTotalRemovedLinesButton.style.visibility = "hidden";
    }
  });
}

function setupFileNames(tabId) {
  const code = `(function getFileNames(){
        var fileList = '';
        [].forEach.call(document.querySelectorAll("#toc ol li > a"), (e)=>{
          fileList += e.textContent;
          fileList += '<br/>'
         });
      return { fileList };
    })()`;

  chrome.tabs.executeScript(tabId, { code }, function (result) {
    const { fileList } = result[0];

    if (fileList) {
      fileNames.innerHTML = fileList;
    } else {
      fileNames.innerText = `File names are not found.`;
      copyFileNamesButton.style.visibility = "hidden";
    }
  });
}

function setupcommitIDs(tabId) {
  const code = `(function getcommitIDs(){
        var commitList = '';
        var seperator = '..';
        [].forEach.call(document.querySelectorAll("#commits_bucket .text-right code > a"), (e)=>{
          if (commitList == '') {
            commitList += e.text;
          } else {
            commitList += seperator + e.text;
          }
        });
      return { commitList };
    })()`;

  chrome.tabs.executeScript(tabId, { code }, function (result) {
    const { commitList } = result[0];

    if (commitList) {
      commits.innerText = commitList;
    } else {
      commits.innerText = `Commit IDs are not found.`;
      copyCommitsPRButton.style.visibility = "hidden";
    }
  });
}