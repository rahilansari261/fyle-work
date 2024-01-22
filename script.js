const API_URL = "http://www.localhost:3000/api/users";
const SEARCH_API_URL = "http://www.localhost:3000/api/findusers";
const API_REPO_URL = "http://www.localhost:3000/api/repos";
const DEFAULT_PAGE_SIZE = 10;
const SIBLING_COUNT = 1;
const MAX_PAGE_SIZE = 100;

let currentPage = 1;
let totalCount = 0;
let pageSize = DEFAULT_PAGE_SIZE;
let siblingCount = SIBLING_COUNT;
const DOTS = "...";
let debounceTimer = 0;
let searchCurrentPage = 1;
let searchTotalCount = 0;
const searchPageSize = DEFAULT_PAGE_SIZE;

let username = "rahilansari261"; // replace with the desired username
const dropdown = document.getElementById("searchResults");
const loaderSmall = document.createElement("div");
loaderSmall.classList.add("loaderSmall");
const usernameInput = document.getElementById("usernameInput");
function clearSearchResults() {
  searchResults.innerHTML = ""; // Clear the dropdown
}
function fetchData(u_name) {
  document.getElementById("searchResults").style.display = "none";
  usernameInput.value = "";
  document.getElementById("in");
  username = u_name.trim();
  fetchUserData(username);
  fetchRepoData(username, 1, 10);
}

function changePage(page) {
  document.getElementById("loader").style.display = "block";
  document.querySelector(".container").style.display = "none";
  currentPage = page;
  console.log(username);
  fetchRepoData(username, currentPage, 10);

  displayPagination(totalCount, currentPage);
}

// Pagination relatd code
const range = (start, end) => {
  let length = end - start + 1;
  return Array.from({ length }, (_, idx) => idx + start);
};

const paginationRange = (totalCount, pageSize, siblingCount, currentPage) => {
  const totalPageCount = Math.ceil(totalCount / pageSize);

  // Pages count is determined as siblingCount + firstPage + lastPage + currentPage + 2*DOTS
  const totalPageNumbers = siblingCount + 5;

  /*
        If the number of pages is less than the page numbers we want to show in our
        paginationComponent, we return the range [1..totalPageCount]
      */
  // < 1 2 3 >              example
  if (totalPageNumbers >= totalPageCount) {
    return range(1, totalPageCount);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(
    currentPage + siblingCount,
    totalPageCount
  );

  /*
        We do not want to show dots if there is only one position left 
        after/before the left/right page count as that would lead to a change if our Pagination
        component size which we do not want
      */
  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPageCount - 2;

  const firstPageIndex = 1;
  const lastPageIndex = totalPageCount;

  // < 1 2 3 ... 6 >        example
  if (!shouldShowLeftDots && shouldShowRightDots) {
    let leftItemCount = 3 + 2 * siblingCount;
    let leftRange = range(1, leftItemCount);

    return [...leftRange, DOTS, totalPageCount];
  }

  // < 1 ... 4 5 6 >        example
  if (shouldShowLeftDots && !shouldShowRightDots) {
    let rightItemCount = 3 + 2 * siblingCount;
    let rightRange = range(totalPageCount - rightItemCount + 1, totalPageCount);
    return [firstPageIndex, DOTS, ...rightRange];
  }
  // < 1 ... 4 5 6 ... 10 > example
  if (shouldShowLeftDots && shouldShowRightDots) {
    let middleRange = range(leftSiblingIndex, rightSiblingIndex);
    return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
  }
  return paginationRange;
};

function fetchUserData(username) {
  dropdown.style.display = "none";
  // const userUrl = `${API_URL}?username=${username}`;
  const userUrl = `https://api.github.com/users/${username}`;

  fetch(userUrl)
    .then((response) => response.json())
    .then((userData) => {
      displayUserInfo(userData);
      totalCount = userData.public_repos;
      displayPagination(totalCount, currentPage);
    })
    .catch((error) => {
      console.error(error);
    });
}

function fetchRepoData(username, currentPage, pageSize) {
  // const reposUrl = `${API_REPO_URL}?username=${username}&page=${currentPage}&per_page=${pageSize}`;
  const reposUrl = `https://api.github.com/users/${username}/repos?page=${currentPage}&per_page=${pageSize}`;
  // ${username}/repos?page=${page}&per_page=${per_page}
  fetch(reposUrl)
    .then((response) => response.json())
    .then((data) => {
      displayRepositories(data);
      document.getElementById("loader").style.display = "none";
      document.querySelector(".container").style.display = "block";
    })
    .catch((error) => {
      console.error(error);
      document.getElementById("loader").style.display = "none";
      document.querySelector(".container").style.display = "none";
      document.getElementById("error").style.display = "block";
    });
}

let searchResultsData = []; // Array to store search results

// ...

function fetchUserSearchedData(username, searchCurrentPage) {
  // const userUrl = `${SEARCH_API_URL}?username=${username}&per_page=10&page=${searchCurrentPage}`;
  const userUrl = `https://api.github.com/search/users?q=${username}&per_page=10&page=${searchCurrentPage}`;

  fetch(userUrl)
    .then((response) => response.json())
    .then((userData) => {
      if (searchCurrentPage === 1) {
        // Clear the array if it's the first page
        searchResultsData = [];
      }

      clearSearchResults();
      searchTotalCount = userData.total_count;
      userData.items.forEach((result) => {
        dropdown.addEventListener("scroll", handleScroll);
        const listItem = document.createElement("div");
        listItem.classList.add("dropdown-item");
        listItem.textContent = result.login;
        listItem.addEventListener("click", function () {
          usernameInput.value = result.login;

          fetchData(result.login);
          clearSearchResults();
        });

        searchResultsData.push(listItem); // Add the listItem to the array
      });

      // Append all items in the array to the dropdown
      searchResultsData.forEach((item) => {
        dropdown.appendChild(item);
      });

      // Append loaderSmall after all items
      dropdown.appendChild(loaderSmall);
    })
    .catch((error) => {
      console.error(error);
    });
}

function displayUserInfo(userData) {
  const userContainer = document.getElementById("user-info");
  userContainer.innerHTML = "";

  const userHtml = `
        <div class="user">
        <div class="user-left">
        
        <img src="${userData.avatar_url}" alt="User Avatar" >
        <div class="align-info"> <img src="link.svg" alt="github profile link" width="20" height="20" > ${
          userData.html_url
        }</div>
        </div>
            <div class="user-info">                     
            <div class="user-name">${
              userData.name
                ? `<div>${userData.name}</div>`
                : `<div class="tw"> name not provided. </div> `
            }</div>
            ${
              userData.bio
                ? `<div class="user-desc">${userData.bio}</div>`
                : `<div class="tw"> bio not provided. </div> `
            }
            <div class="align-info"> <img src="pin.svg" alt="address" width="16" height="16" > ${
              userData.location || `<p class="tw">Not specified. </p> `
            }</div>
            ${
              userData.twitter_username
                ? `<div>Twitter: <a href="https://twitter.com/${userData.twitter_username}" target="_blank">${userData.twitter_username}</a></div>`
                : `<div class="tw">not a twitter user. </div> `
            }
            </div>
        </div>
    `;

  userContainer.innerHTML = userHtml;
}

function truncateRepositoryName(name) {
  const maxLength = 24;

  if (name.length > maxLength) {
    return name.slice(0, maxLength) + "...";
  }

  return name;
}

function displayRepositories(data) {
  const repositoriesContainer = document.getElementById("repositories");
  repositoriesContainer.innerHTML = "";

  data.forEach((repository) => {
    const repositoryHtml = `
        <div class="repository">
            <div class="repo_title">${truncateRepositoryName(
              repository.name
            )}</div>
      
            <div>${
              repository.description
                ? repository.description
                : `<div class="tw">No description provided. </div> `
            }</div>
            <div class="topics-info">
                <div>Topics: </div>
                    <div class="topics">
                    
                    ${
                      repository.topics.length > 0
                        ? repository.topics
                            .map((topic) => `<div class="topic">${topic}</div>`)
                            .join("")
                        : `<div class="tw">No topics provided. </div> `
                    }                                                                  
                    </div>
                </div>
            </div>
    `;
    repositoriesContainer.innerHTML += repositoryHtml;
  });
}

function displayPagination(totalCount, currentPage) {
  const svgImagePrev = document.createElement("img");
  svgImagePrev.setAttribute(
    "src",
    "data:image/svg+xml;charset=utf-8," +
      encodeURIComponent(
        "<svg stroke='#fff' fill='#fff' stroke-width='0' viewBox='0 0 256 256' height='1em' width='1em' xmlns='http://www.w3.org/2000/svg' version='1.1' xmlns:xlink='http://www.w3.org/1999/xlink' transform='matrix(-1,0,0,1,0,0)'><path d='M184.49,136.49l-80,80a12,12,0,0,1-17-17L159,128,87.51,56.49a12,12,0,1,1,17-17l80,80A12,12,0,0,1,184.49,136.49Z'></path></svg>"
      )
  );

  const lastPage = Math.ceil(totalCount / pageSize);
  const paginationContainer = document.getElementById("pagination");
  if (totalCount === 0) {
    paginationContainer.style.visibility = "hidden";
    return;
  } else {
    paginationContainer.style.visibility = "visible";
  }
  paginationContainer.innerHTML = "";
  const pageRange = paginationRange(
    totalCount,
    pageSize,
    siblingCount,
    currentPage
  );

  const textContainer = document.createElement("div");
  textContainer.textContent = "Previous";

  const pageLinkPrev = document.createElement("div");
  pageLinkPrev.classList.add("page-next-prev");

  pageLinkPrev.appendChild(svgImagePrev);
  pageLinkPrev.appendChild(textContainer);

  pageLinkPrev.onclick = function () {
    if (currentPage !== 1) {
      changePage(currentPage - 1);
    } else {
      pageLinkPrev.style.cursor = "not-allowed";
    }
  };

  pageLinkPrev.addEventListener("mouseover", function () {
    if (currentPage === 1) {
      pageLinkPrev.style.cursor = "not-allowed";
    }
  });
  pageLinkPrev.addEventListener("mouseout", function () {
    pageLinkPrev.style.cursor = "pointer";
  });

  paginationContainer.appendChild(pageLinkPrev);

  // paginationContainer.appendChild(pageLink);

  for (let i = 0; i < pageRange.length; i++) {
    if (pageRange[i] === currentPage) {
      const pageLink = document.createElement("div");
      pageLink.textContent = pageRange[i];
      pageLink.classList.add("active");
      pageLink.classList.add("page-btn");
      paginationContainer.appendChild(pageLink);
    } else if (pageRange[i] === "...") {
      const pageLink = document.createElement("div");
      pageLink.classList.add("page-btn");
      pageLink.textContent = pageRange[i];
      paginationContainer.appendChild(pageLink);
    } else {
      const pageLink = document.createElement("div");
      pageLink.classList.add("page-btn");
      pageLink.textContent = pageRange[i];
      pageLink.onclick = function () {
        changePage(pageRange[i]);
      };
      paginationContainer.appendChild(pageLink);
    }
  }

  const nextPageLink = document.createElement("div");

  const svgImage = document.createElement("img");
  svgImage.setAttribute(
    "src",
    "data:image/svg+xml;charset=utf-8," +
      encodeURIComponent(
        "<svg stroke='#fff' fill='#fff' stroke-width='0' viewBox='0 0 256 256' height='1em' width='1em' xmlns='http://www.w3.org/2000/svg'><path d='M184.49,136.49l-80,80a12,12,0,0,1-17-17L159,128,87.51,56.49a12,12,0,1,1,17-17l80,80A12,12,0,0,1,184.49,136.49Z'></path></svg>"
      )
  );

  nextPageLink.textContent = "Next";
  nextPageLink.classList.add("page-next-prev");
  nextPageLink.onclick = function () {
    changePage(currentPage + 1);
  };

  nextPageLink.onclick = function () {
    if (currentPage !== lastPage) {
      changePage(currentPage + 1);
    } else {
      nextPageLink.style.cursor = "not-allowed";
    }
  };

  nextPageLink.addEventListener("mouseover", function () {
    if (currentPage === lastPage) {
      nextPageLink.style.cursor = "not-allowed";
    }
  });
  nextPageLink.addEventListener("mouseout", function () {
    nextPageLink.style.cursor = "pointer";
  });

  nextPageLink.appendChild(svgImage);
  paginationContainer.appendChild(nextPageLink);
}

//////////////  PAGINATION CODE //////////////

/////////////////////////////////////////////////

usernameInput.addEventListener("input", function () {
  dropdown.style.display = "block";
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(function () {
    const user_name = usernameInput.value.trim();
    if (user_name) {
      fetchUserSearchedData(user_name, (searchCurrentPage = 1));
    } else {
      clearSearchResults();
    }
  }, 300);
});

function handleScroll() {
  if (
    dropdown.clientHeight + dropdown.scrollTop >= dropdown.scrollHeight &&
    searchCurrentPage !== Math.ceil(searchTotalCount / 10)
  ) {
    searchCurrentPage++;

    fetchUserSearchedData(usernameInput.value, searchCurrentPage);

    dropdown.removeEventListener("scroll", handleScroll);
  } else if (searchCurrentPage === Math.ceil(searchTotalCount / 10)) {
    dropdown.removeEventListener("scroll", handleScroll);
    loaderSmall.style.display = "none";
    const noMoreResults = document.createElement("div");
    noMoreResults.classList.add("no-more-results");
    noMoreResults.textContent = "No more results";
    dropdown.appendChild(noMoreResults);

 
  }
}

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("loader").style.display = "block";

  const savedTheme = localStorage.getItem("theme");
  const themeIcon = document.getElementById("lightModeIcon");

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    themeIcon.src = theme === "dark" ? "moon.svg" : "sun.svg";
    localStorage.setItem("theme", theme);
  }

  setTheme(savedTheme || "light");

  const themeSwitch = document.querySelector(".theme-switch");
  themeSwitch.addEventListener("click", () =>
    setTheme(
      document.documentElement.getAttribute("data-theme") === "light"
        ? "dark"
        : "light"
    )
  );

  fetchData(username);

  // Attach event listener for input changes with debounce
});
