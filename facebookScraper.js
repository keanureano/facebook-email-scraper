window.membersList = window.membersList || [
  [
    "Profile Id",
    "Full Name",
    "ProfileLink",
    "Bio",
    "Image Src",
    "Group Id",
    "Group Joining Text",
    "Profile Type",
  ],
];

initialize();

function initialize() {
  createDownloadButton();
  setupRequestInterceptor();
}

function createDownloadButton() {
  const container = document.createElement("div");
  container.setAttribute(
    "style",
    [
      "position: fixed;",
      "top: 0;",
      "left: 0;",
      "z-index: 10;",
      "width: 100%;",
      "height: 100%;",
      "pointer-events: none;",
    ].join("")
  );

  const buttonContainer = document.createElement("div");
  buttonContainer.setAttribute(
    "style",
    [
      "position: absolute;",
      "bottom: 30px;",
      "right: 130px;",
      "color: white;",
      "min-width: 150px;",
      "background: var(--primary-button-background);",
      "border-radius: var(--button-corner-radius);",
      "padding: 0px 12px;",
      "cursor: pointer;",
      "font-weight:600;",
      "font-size:15px;",
      "display: inline-flex;",
      "pointer-events: auto;",
      "height: 36px;",
      "align-items: center;",
      "justify-content: center;",
    ].join("")
  );

  const buttonText = document.createTextNode("Download");
  const countSpan = document.createElement("span");
  countSpan.setAttribute("id", "member-count-tracker");
  countSpan.textContent = "0";
  const countText = document.createTextNode(" members");

  buttonContainer.appendChild(buttonText);
  buttonContainer.appendChild(countSpan);
  buttonContainer.appendChild(countText);

  buttonContainer.addEventListener("click", function () {
    const timestamp = new Date().toISOString();
    exportDataToCsv(`memberExport-${timestamp}.csv`, window.membersList);
  });

  container.appendChild(buttonContainer);
  document.body.appendChild(container);

  return container;
}

function setupRequestInterceptor() {
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.send = function () {
    this.addEventListener(
      "readystatechange",
      function () {
        if (
          this.readyState === 4 &&
          this.responseURL.includes("/api/graphql/")
        ) {
          parseApiResponseText(this.responseText);
        }
      },
      false
    );

    originalSend.apply(this, arguments);
  };
}

function processApiResponse(responseData) {
  let groupData;
  if (responseData?.data?.group) {
    groupData = responseData.data.group;
  } else {
    groupData = responseData?.data?.node;
  }

  let members;
  if (groupData?.new_members?.edges) {
    members = groupData.new_members.edges;
  } else if (groupData?.new_forum_members?.edges) {
    members = groupData.new_forum_members.edges;
  } else if (groupData?.search_results?.edges) {
    members = groupData.search_results.edges;
  } else {
    return;
  }

  const processedMembers = members.map((member) => {
    const node = member.node;
    const id = node.id;
    const name = node.name;
    const bio = node.bio_text?.text || "";
    const profileLink = node.url;
    const profileImage = node.profile_picture?.uri || "";
    const groupId = node.group_membership?.associated_group.id || "";
    const joinStatusText =
      member.join_status_text?.text ||
      member.membership?.join_status_text?.text ||
      "";
    const profileType = node.__isProfile ? "Profile" : "Group";

    return [
      id,
      name,
      profileLink,
      bio,
      profileImage,
      groupId,
      joinStatusText,
      profileType,
    ];
  });

  const currentMemberCount = window.membersList.length;
  window.membersList.push(...processedMembers);
  const countTracker = document.getElementById("member-count-tracker");
  if (countTracker) {
    countTracker.textContent = window.membersList.length.toString();
  }
}

function parseApiResponseText(responseText) {
  const responseData = [];

  try {
    responseData.push(JSON.parse(responseText));
  } catch (error) {
    const responseLines = responseText.split("\n");

    if (responseLines.length <= 1) {
      console.error("Failed to parse API response", error);
      return;
    }

    for (const line of responseLines) {
      try {
        responseData.push(JSON.parse(line));
      } catch (error) {
        console.error("Failed to parse API response", error);
      }
    }
  }

  for (const data of responseData) {
    processApiResponse(data);
  }
}

function exportDataToCsv(fileName, data) {
  let csvContent = "";

  for (let row of data) {
    let csvRow = row
      .map((value) => {
        if (value === null || value === undefined) {
          return "";
        }
        let stringValue = value.toString();
        if (value instanceof Date) {
          stringValue = value.toLocaleString();
        }
        stringValue = stringValue.replace(/"/g, '""');
        return /("|,|\n)/g.test(stringValue) ? `"${stringValue}"` : stringValue;
      })
      .join(",");
    csvContent += csvRow + "\n";
  }

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const anchor = document.createElement("a");
  if (anchor.download !== undefined) {
    const blobUrl = URL.createObjectURL(blob);
    anchor.setAttribute("href", blobUrl);
    anchor.setAttribute("download", fileName);
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }
}
