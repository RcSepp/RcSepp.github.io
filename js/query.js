let thumbnails = document.getElementsByClassName("thumbnail");
let timeline = document.getElementsByClassName("thumbnail__timeline--progress");
let videos = document.querySelectorAll("video");
let loader = document.getElementsByClassName("thumbnail__loader");

for (let i = 0; i < thumbnails.length; i++) {
  thumbnails[i].addEventListener("mouseover", () => {
    videos[i].play();
    timeline[i].style.transition = `width ${videos[i].duration}s linear`;
    timeline[i].style.width = "100%";
  });
  thumbnails[i].addEventListener("mouseout", () => {
    videos[i].currentTime = 0;
    videos[i].pause();
    timeline[i].style.transition = `width 0s linear`;
    timeline[i].style.width = "0%";
  });
}

for (let i = 0; i < videos.length; i++) {
  videos[i].addEventListener(
    "loadeddata",
    function () {
      thumbnails[i].classList.add("thumbnail__loaded");
    },
    false
  );
}



/* DO NOT FORGET TO CHECK EXTERNAL SCRIPTS OF THIS PROJECT */

var mainElem = document.getElementById("main-scrollbar");
var innerElem1 = document.getElementById("inner-1");
var innerElem2 = document.getElementById("inner-2");

Scrollbar.use(OverscrollPlugin);

const options = {
  damping: 0.11,
  renderByPixels: !("ontouchstart" in document)
};
const overscrollOptions = {
  enable: true,
  effect: navigator.userAgent.match(/Android/) ? "glow" : "bounce",
  damping: 0.11,
  maxOverscroll: navigator.userAgent.match(/Android/) ? 150 : 100,
  glowColor: mainElem.dataset.glowColor
};

const scrollbar = [
  Scrollbar.init(mainElem, {
    ...options,
    delegateTo: document,
    plugins: {
      overscroll: { ...overscrollOptions }
    }
  }),
  // Scrollbar.init(innerElem1, {
  //   ...options,
  //   plugins: {
  //     overscroll: { ...overscrollOptions }
  //   }
  // }),
  // Scrollbar.init(innerElem2, {
  //   ...options,
  //   plugins: {
  //     overscroll: { ...overscrollOptions }
  //   }
  // })
];
