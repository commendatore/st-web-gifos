class GifosCommons {
  constructor(hamburgerBttnId, hamburgerMenuId, themeBttnId) {
    // hamburger menu and theme switcher
    this.hamburgerBttn = document.getElementById(hamburgerBttnId);
    this.hamburgerMenu = document.getElementById(hamburgerMenuId);
    this.themeBttn = document.getElementById(themeBttnId);

    this.hamburgerBttn.addEventListener("click", this.toggleHamburger);
    this.themeBttn.addEventListener("click", this.toggleTheme);

    // theme environment
    this.iconsLight = document.getElementById("theme-light");
    this.iconsNight = document.getElementById("theme-night");
    this.currentTheme = localStorage.getItem("theme");
    if (this.isNightMode()) this.themeBttn.innerHTML = "Modo Diurno";
  }

  toggleHamburger = () => {
    let isClosed = this.hamburgerMenu.classList.contains("navbar-menu--close");

    if (isClosed) {
      this.hamburgerBttn.classList.replace(
        "navbar-buttons__hamburger-icon--open-menu",
        "navbar-buttons__hamburger-icon--close-menu"
      );
      this.hamburgerMenu.classList.replace(
        "navbar-menu--close",
        "navbar-menu--show"
      );
    } else {
      this.hamburgerBttn.classList.replace(
        "navbar-buttons__hamburger-icon--close-menu",
        "navbar-buttons__hamburger-icon--open-menu"
      );
      this.hamburgerMenu.classList.replace(
        "navbar-menu--show",
        "navbar-menu--close"
      );
    }
  };

  toggleTheme = () => {
    if (this.isNightMode()) {
      this.setLightMode();
      this.themeBttn.innerHTML = "Modo Nocturno";
    } else {
      this.setNightMode();
      this.themeBttn.innerHTML = "Modo Diurno";
    }
  };

  isNightMode = () => {
    // check current theme
    if (this.currentTheme) {
      if (this.currentTheme === "night") {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  setNightMode = () => {
    // change theme css color variables
    document.documentElement.setAttribute("data-theme", "night");
    // change theme css assets
    this.iconsNight.media = "";
    this.iconsLight.media = "none";
    // save current theme preference
    localStorage.setItem("theme", "night");
    this.currentTheme = "night";
  };

  setLightMode = () => {
    // change theme css color variables
    document.documentElement.setAttribute("data-theme", "light");
    // change theme css assets
    this.iconsLight.media = "";
    this.iconsNight.media = "none";
    // save current theme preference
    localStorage.setItem("theme", "light");
    this.currentTheme = "light";
  };

  getPage = () => {
    return document.documentElement.dataset.page;
  };
}

class GifosSlides {
  constructor() {
    this.trendingSlider = undefined;
    this.backwardBttn = undefined;
    this.forwardBttn = undefined;
    this.apiTrending = undefined;
    this.trendingSliderLength = 0;
  }

  setSlider = async (
    carouselId,
    carouselClass,
    backwardBttnId,
    forwardBttnId,
    trendingGifsCallback
  ) => {
    this.trendingSlider = document.getElementById(carouselId);
    this.backwardBttn = document.getElementById(backwardBttnId);
    this.forwardBttn = document.getElementById(forwardBttnId);
    this.apiTrending = trendingGifsCallback;

    this.backwardBttn.addEventListener("click", this.backwardSlides);
    this.forwardBttn.addEventListener("click", this.forwardSlides);

    let giphyArr = await this.apiTrending({ rating: "r" });
    let gifosSlides = this.appendSlides(giphyArr, carouselClass);
    this.trendingSlider.innerHTML = gifosSlides.content;
    this.trendingSliderLength = gifosSlides.length;
  };

  appendSlides = (giphyArr, classType) => {
    let slides = [];
    let length = 0;

    giphyArr.forEach((giphy, i) => {
      let slide = `
<div class="${classType}">
<img src="${giphy.url}" alt="${giphy.title}">
</div>`;

      length = i + 1;
      slides.push(slide);
    });

    return {
      length: length,
      content: slides.join("\n"),
    };
  };

  forwardSlides = () => {
    let step = this.trendingSlider.scrollWidth / this.trendingSliderLength;
    this.trendingSlider.scrollLeft += step;
  };

  backwardSlides = () => {
    let step = this.trendingSlider.scrollWidth / this.trendingSliderLength;
    this.trendingSlider.scrollLeft -= step;
  };
}

class GifosSearch {
  constructor(query) {
    this.limit = query.limit;
    this.rating = query.rating;

    this.total = 0;
    this.offset = 0;
    this.lastPage = false;

    this.apiSearch = undefined;
    this.apiAutocomplete = undefined;
    this.searchBox = undefined;
    this.autocompleteBox = undefined;
    this.submitBttn = undefined;
    this.clearBttn = undefined;
    this.resultsBox = undefined;
    this.resultsGridBox = undefined;
    this.moreBttn = undefined;
    this.resultsSlideClass = undefined;
    this.apiTrendingTerms = undefined;
    this.trendingTermsBox = undefined;
  }

  setSearchBox = async (
    searchCallback,
    autocompleteCallback,
    searchBoxId,
    autocompleteBoxId,
    submitBttnId,
    clearBttnId,
    resultsBoxId,
    resultsGridBoxId,
    moreBttnId,
    resultsSlideClass,
    trendingTermsCallback = undefined,
    trendingTermsBoxId = undefined
  ) => {
    this.apiSearch = searchCallback;
    this.apiAutocomplete = autocompleteCallback;
    this.searchBox = document.getElementById(searchBoxId);
    this.autocompleteBox = document.getElementById(autocompleteBoxId);
    this.submitBttn = document.getElementById(submitBttnId);
    this.clearBttn = document.getElementById(clearBttnId);
    this.resultsBox = document.getElementById(resultsBoxId);
    this.resultsGridBox = document.getElementById(resultsGridBoxId);
    this.moreBttn = document.getElementById(moreBttnId);
    this.resultsSlideClass = resultsSlideClass;

    this.searchBox.addEventListener("input", this.validateSearch);
    this.searchBox.addEventListener("keyup", ({ key }) => {
      if (key === "Enter" && this.searchBox.checkValidity()) this.searchGifos();
      if (key === "Escape") this.focusSearchBox();
    });
    this.submitBttn.addEventListener("click", this.searchGifos);
    this.clearBttn.addEventListener("click", this.focusSearchBox);
    this.moreBttn.addEventListener("click", this.nextPage);

    // trending terms links
    if (
      typeof trendingTermsBoxId !== "undefined" &&
      typeof trendingTermsCallback !== "undefined"
    ) {
      this.apiTrendingTerms = trendingTermsCallback;
      this.trendingTermsBox = document.getElementById(trendingTermsBoxId);

      let content = await this.trendingTerms();
      this.trendingTermsBox.innerHTML = content;
      this.linkSuggestions(this.trendingTermsBox);
    }
  };

  focusSearchBox = () => {
    this.searchBox.value = "";
    this.searchBox.focus();
    this.validateSearch();
    this.closeResults();
  };

  linkSuggestions = (contentBox) => {
    let terms = contentBox.querySelectorAll("a");
    terms.forEach((term) => {
      term.addEventListener("click", (e) => {
        this.searchBox.value = e.target.innerHTML;
        this.searchGifos();
      });
    });
  };

  trendingTerms = async () => {
    let terms = [];
    let limit = 5;
    let giphyArr = await this.apiTrendingTerms();

    for (let i = 0; i < limit; i++) {
      let term = `<li><a href="#">${giphyArr[i]}</a></li>`;
      terms.push(term);
    }

    return terms.join("\n");
  };

  autocomplete = async () => {
    let autocomplete = [];
    let giphyArr = await this.apiAutocomplete({
      term: this.searchBox.value,
      limit: 11,
    });

    if (typeof giphyArr === "undefined" || !giphyArr.length) return false;

    giphyArr.forEach((term) => {
      let suggestion = `<li><a href="#">${term.name}</a></li>`;
      autocomplete.push(suggestion);
    });

    return autocomplete.join("\n");
  };

  openAutocomplete = () => {
    this.submitBttn.classList.replace(
      "search-bttn__submit--hide",
      "search-bttn__submit--show"
    );
    this.clearBttn.classList.replace(
      "search-bttn__focus",
      "search-bttn__clear"
    );

    this.autocompleteBox.classList.replace(
      "search-autocomplete--hide",
      "search-autocomplete--show"
    );
  };

  closeAutocomplete = () => {
    this.submitBttn.classList.replace(
      "search-bttn__submit--show",
      "search-bttn__submit--hide"
    );
    if (this.searchBox.value === "") {
      this.clearBttn.classList.replace(
        "search-bttn__clear",
        "search-bttn__focus"
      );
    } else {
      this.clearBttn.classList.replace(
        "search-bttn__focus",
        "search-bttn__clear"
      );
    }
    this.autocompleteBox.classList.replace(
      "search-autocomplete--show",
      "search-autocomplete--hide"
    );
  };

  validateSearch = async () => {
    if (this.searchBox.checkValidity()) {
      let content = await this.autocomplete();

      if (content) {
        this.autocompleteBox.innerHTML = content;
        this.linkSuggestions(this.autocompleteBox);
        this.openAutocomplete();
      } else {
        this.closeAutocomplete();
      }
    } else {
      this.closeAutocomplete();
    }
  };

  searchGifos = async () => {
    this.closeAutocomplete();
    this.resultsBox.getElementsByTagName(
      "h2"
    )[0].innerHTML = this.searchBox.value;

    this.total = 0;
    this.offset = 0;
    this.lastPage = false;
    let query = {
      term: this.searchBox.value,
      limit: this.limit,
      offset: this.offset,
      rating: this.rating,
    };

    let giphyArr = await this.apiSearch(query);
    this.total = giphyArr.total;

    if (!this.total) {
      this.resultsGridBox.innerHTML = "";
    } else {
      this.resultsGridBox.innerHTML = this.appendSlides(
        giphyArr.images,
        this.resultsSlideClass
      );
    }

    this.openResults();
  };

  openResults = () => {
    let resultsContent = this.resultsBox.getElementsByClassName("grid")[0];
    let resultsNotFound = this.resultsBox.getElementsByClassName(
      "not-found"
    )[0];

    if (this.total > this.limit) {
      resultsContent.style.display = "flex";
      resultsNotFound.style.display = "none";
      this.moreBttn.style.display = "inline-block";
      this.moreBttn.style.visibility = "visible";
    }

    if (this.total && this.total < this.limit) {
      resultsContent.style.display = "flex";
      resultsNotFound.style.display = "none";
      this.moreBttn.style.display = "inline-block";
      this.moreBttn.style.visibility = "hidden";
    }

    if (!this.total) {
      resultsContent.style.display = "none";
      resultsNotFound.style.display = "flex";
    }

    if (this.resultsBox.classList.contains("results--hide"))
      this.resultsBox.classList.replace("results--hide", "results--show");
  };

  closeResults = () => {
    if (this.resultsBox.classList.contains("results--show"))
      this.resultsBox.classList.replace("results--show", "results--hide");
  };

  nextPage = async () => {
    if (this.lastPage) {
      this.moreBttn.style.visibility = "hidden";
    }

    this.offset += this.limit;

    let query = {
      term: this.searchBox.value,
      limit: this.limit,
      offset: this.offset,
      rating: this.rating,
    };

    let giphyArr = await this.apiSearch(query);
    const slides = this.appendSlides(giphyArr.images, this.resultsSlideClass);

    this.resultsGridBox.insertAdjacentHTML("beforeend", slides);

    if (this.total <= this.offset + this.limit * 2) {
      this.lastPage = true;
    }
  };

  appendSlides = (giphyArr, classType) => {
    let slides = [];

    giphyArr.forEach((giphy) => {
      let slide = `
<div class="${classType}">
<img src="${giphy.url}" alt="${giphy.title}">
</div>`;

      slides.push(slide);
    });

    return slides.join("\n");
  };
}

export { GifosCommons, GifosSlides, GifosSearch };
