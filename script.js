let prevScrollpos = window.pageYOffset;

window.onscroll = function() {
    let currentScrollPos = window.pageYOffset;

    /* If the user scrolls up, show the header. Otherwise, hide it. */
    if (prevScrollpos > currentScrollPos) {
        document.querySelector("header").style.top = "0";
    } else {
        document.querySelector("header").style.top = "-70px"; /* This value should match the height of your header */
    }
    prevScrollpos = currentScrollPos;
}
