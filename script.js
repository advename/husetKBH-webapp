//Basic setup
const burgerMenu = document.querySelector("header .burger-menu");
const burgerMenuSpans = document.querySelectorAll("header .burger-menu span");
const navigation = document.querySelector("header nav");
let navigationHeight = "450px";
let navigationExpanded = false;
let fetchActive = false;
let perPage = 10;
let pageNr = 1;
let sortData = "asc" //"desc" for oldest or "asc" for newest
let categoryID;

//All Events
const eventTemplate = document.querySelector("#event-template").content;
const events = document.querySelector("#events");

//Single Event
const sglEvent = document.querySelector("#sgl-event");

//API
const wordpressLinkAPI = "http://stud.advena.me/sem2-2018/07.01-wordpress/wp-json/wp/v2/events?filter[meta_key].acf=date&filter[meta_compare]=&filter[order]=";
const wordpressSlugAPI = "https://stud.advena.me/sem2-2018/07.01-wordpress/wp-json/wp/v2/events?slug="
const wordpressCategoryID = "https://stud.advena.me/sem2-2018/07.01-wordpress/wp-json/wp/v2/categories?slug="
const wordpressCategories = "http://stud.advena.me/sem2-2018/07.01-wordpress/wp-json/wp/v2/events?filter[meta_key].acf=date&filter[meta_compare]=&filter[order]=";

/*
"http://stud.advena.me/sem2-2018/07.01-wordpress/wp-json/wp/v2/events?filter[meta_key].acf=date&filter[meta_compare]="++"per_page=100&filter[order]=asc"
*/
let urlParams = new URLSearchParams(window.location.search);
let eventParams = urlParams.get("event");
console.log(eventParams);


//Initialize Website
function init() {
    if (eventParams) {
        //If params exists, load and display single event
        fetch(wordpressSlugAPI + eventParams + "&_embed").then(result => result.json()).then(data => displaySingleEvent(data));
    } else {
        fetchActive = true;
        bottomCheck(false);
        //Fetch all data and display all events
        fetchEvents()
    }
}

init();


//Fetch all data and display events
function fetchEvents() {
    if (categoryID) { //fetch based on categorie
        fetch(wordpressCategories  + sortData + "&_embed&per_page=" + perPage + "&page=" + pageNr + "&categories=" + categoryID).then(result => result.json()).then(data => displayEvents(data));
    } else { //fetch all
        fetch(wordpressLinkAPI  + sortData + "&_embed&per_page=" + perPage + "&page=" + pageNr).then(result => result.json()).then(data => displayEvents(data));
    }

}


//Show single event
function displaySingleEvent(data) {
    console.log(data);

    sglEvent.querySelector(".date").innerHTML += " " + convertDate(data[0].acf.date);
    sglEvent.querySelector(".time").innerHTML += " KL." + data[0].acf.show_start;
    sglEvent.querySelector(".title").textContent = data[0].acf.title;
    sglEvent.querySelector(".venue a").textContent = data[0].acf.venue;
    sglEvent.querySelector(".venue a").setAttribute("href", "https://www.google.com/maps/place/" + data[0].acf.venue_location);

    sglEvent.querySelector(".show-start").innerHTML += data[0].acf.show_start;

    sglEvent.querySelector(".full-desc").innerHTML = data[0].acf.desc_long;


    //Category
    if (data[0]._embedded["wp:term"]) {
        console.log(data[0]._embedded["wp:term"][0]);
        data[0]._embedded["wp:term"][0].forEach(function (elem, i) {
            let catA = document.createElement("a");
            catA.setAttribute("href", "index.html");
            catA.textContent = elem.name;
            if (i == 0) {
                catA.textContent = elem.name + " /\u00A0";
            }
            catA.classList = "category";
            sglEvent.appendChild(catA);
            console.log("CATEGORRRY" + elem.name)
        })

    }


    //If data of links are empty, remove field from DOM
    if (data[0].acf.ticket_link == "") {
        sglEvent.querySelector("a.ticket-link").style.display = "none";
    } else {
        sglEvent.querySelector("a.ticket-link").textContent = data[0].acf.ticket_link;
    }

    if (data[0].acf.somedia_link == "") {
        sglEvent.querySelector("a.somedia-link").style.display = "none";
    } else {
        sglEvent.querySelector("a.somedia-link").setAttribute("href", data[0].acf.somedia_link);
    }

    if (data[0].acf.event_homepage == "") {
        sglEvent.querySelector("a.event-homepage").style.display = "none";
    } else {
        sglEvent.querySelector("a.event-homepage").setAttribute("href", data[0].acf.event_homepage);
    }


    //If data of time and age is empty, remove field from DOM
    if (data[0].acf.door_open == "") {
        sglEvent.querySelector(".door-open").style.display = "none";
    } else {
        sglEvent.querySelector(".door-open").innerHTML += data[0].acf.door_open;
    }

    if (data[0].acf.show_end == "") {
        sglEvent.querySelector(".show-end").style.display = "none";
    } else {
        sglEvent.querySelector(".show-end").innerHTML += data[0].acf.show_end;
    }

    if (data[0].acf.min_age == "") {
        sglEvent.querySelector(".min-age").style.display = "none";
    } else {
        sglEvent.querySelector(".min-age").innerHTML += data[0].acf.min_age;
    }


    //Free or not
    if (data[0].acf.price == 0) {
        sglEvent.querySelector(".price").textContent = "GRATIS";
    } else {
        sglEvent.querySelector(".price").textContent = data[0].acf.price + "kr.";
    }

    //Image available or not
    if (data[0]._embedded["wp:featuredmedia"]) {
        //image available
        sglEvent.querySelector("img").setAttribute("src", data[0]._embedded["wp:featuredmedia"][0].source_url);
        if (data[0]._embedded["wp:featuredmedia"][0].alt_text) {
            //Alt text available for image
            sglEvent.querySelector("img").setAttribute("alt", data[0]._embedded["wp:featuredmedia"][0].alt_text);
        } else {
            //ALt text not available, use title instead
            sglEvent.querySelector("img").setAttribute("alt", data[0].acf.title);

        }
    } else {
        //keep default image and set alt attribute to huset's placeholder image
        sglEvent.querySelector("img").setAttribute("alt", data[0].acf.title);
    }
    sglEvent.style.height = "calc( 100vh - 100px)";
    sglEvent.style.overflowY = "scroll";
    sglEvent.style.display = "block";
    fetchActive = false;


}


//Show all next 10 events
function displayEvents(data) {
    console.log(data);

    //When reached bottom, data sends error 400 and stop interval
    if (data.data) {
        if (data.data.status == 400) {
            fetchActive = true;
            bottomCheck(false);
        }
    } else {
        //Populate event template
        data.forEach(elem => {
            const clone = eventTemplate.cloneNode(true);
            clone.querySelector(".date").innerHTML += " " + convertDate(elem.acf.date);
            clone.querySelector(".time").innerHTML += " KL." + elem.acf.show_start;
            clone.querySelector(".short-desc").textContent = elem.acf.desc_teaser;
            clone.querySelector(".title").textContent = elem.acf.title;
            clone.querySelector(".venue").innerHTML += " " + elem.acf.venue;
            clone.querySelector(".event-slug").setAttribute("href", "?event=" + elem.slug);

            //Free or not
            if (elem.acf.price == 0) {
                clone.querySelector(".price").textContent = "GRATIS";
            } else {
                clone.querySelector(".price").textContent = elem.acf.price + "kr.";
            }

            //Image available or not
            if (elem._embedded["wp:featuredmedia"]) {
                //image available
                clone.querySelector("img").setAttribute("src", elem._embedded["wp:featuredmedia"][0].source_url);
                if (elem._embedded["wp:featuredmedia"][0].alt_text) {
                    //Alt text available for image
                    clone.querySelector("img").setAttribute("alt", elem._embedded["wp:featuredmedia"][0].alt_text);
                } else {
                    //ALt text not available, use title instead
                    clone.querySelector("img").setAttribute("alt", elem.acf.title);

                }
            } else {
                //keep default image and set alt attribute to huset's placeholder image
                clone.querySelector("img").setAttribute("alt", elem.acf.title);
            }
            events.appendChild(clone);

        })
        fetchActive = false;
        bottomCheck(true);
    }

}



// Expand or minimize header navigation
burgerMenu.addEventListener("click", expandNavigation);

function expandNavigation() {
    if (navigationExpanded) {
        // close navigation
        burgerMenuSpans.forEach(elem => {
            elem.classList.remove("active");
        })
        navigation.style.removeProperty("height");
        navigationExpanded = !navigationExpanded;
    } else {
        //open navigation
        burgerMenuSpans.forEach(elem => {
            elem.classList.add("active");
        })
        navigation.style.height = navigationHeight;
        navigationExpanded = !navigationExpanded;
    }
}


//Switch bottomNav
const bottomNavLeft = document.querySelector("#bottom-nav");
const bottomActive = document.querySelector("#bottom-nav .active-back");
const eventsCategories = document.querySelector("#events-categories");
let bottomNavStatus = 1;
bottomNavLeft.addEventListener("click", switchBottomNav);

function switchBottomNav() {
    if (bottomNavStatus == 1) {
        //Show Categories
        bottomActive.style.left = "50vw";
        bottomNavStatus = 2;
        eventsCategories.style.left = "0vw";

    } else {
        //Hide categories
        bottomActive.style.left = "0";
        bottomNavStatus = 1;
        eventsCategories.style.removeProperty("left");
    }
}




const comedy = document.querySelector("#events-categories .comedy");
const meetups = document.querySelector("#events-categories .meetups");
const poetrySlam = document.querySelector("#events-categories .poetry-slam");

//()=>{}; is the same as function(){};
comedy.addEventListener("click", ()=>{fetchCategoryID("comedy")});
meetups.addEventListener("click", ()=>{fetchCategoryID("meetups")});
poetrySlam.addEventListener("click", ()=>{fetchCategoryID("poetry-slam")});

//Use slug to get category ID
function fetchCategoryID(slug) {
    switchBottomNav();
    fetchActive = true;
    bottomCheck(false);
    fetch(wordpressCategoryID + slug).then(result => result.json()).then(data => getCategoryID(data, slug));

}

//Fetch all events with categoryID and clear events
function getCategoryID(data, slug) {
    //Clear all displayed events
    events.innerHTML = "";
    while (events.firstChild) {
        events.removeChild(events.firstChild);
    }

    categoryID = data[0].id;
    pageNr = 1;

    fetchEvents();
}


//Convert Date from "2018-05-01 13:19:25 GMT+02:00" to a friendly view "01/05"
function convertDate(date) {
    let d = new Date(date);
    let day, month;
    if (d.getDate() > 10) {
        day = d.getDate();
    } else {
        day = "0" + d.getDate();
    }
    if ((d.getMonth() + 1) > 10) {
        month = d.getMonth() + 1;
    } else {
        month = "0" + (d.getMonth() + 1);
    }

    return day + "/" + month;
}


//Check if bottom reached, if yes, load next x events
var bottomCheckInterval;
function bottomCheck(status) {
    if (status) {
        bottomCheckInterval = setInterval(function () {
            if (bottomVisible() && fetchActive === false) {
                console.log("We've reached rock bottom, fetching articles")
                pageNr = pageNr + 1;
                console.log("Page Number" + pageNr);
                fetchEvents();
            }
        }, 1000)
    } else {
        clearInterval(bottomCheckInterval);
    }
}

function bottomVisible() {
    const scrollY = window.scrollY
    const visible = document.documentElement.clientHeight
    const pageHeight = document.documentElement.scrollHeight
    const bottomOfPage = visible + scrollY >= pageHeight
    return bottomOfPage || pageHeight < visible
}

const mobileOnly = document.querySelector("#mobile-only");
const mobileOnlyContinue = document.querySelector("#mobile-only .continue");
mobileOnlyContinue.addEventListener("click", ()=>{mobileOnly.style.display="none";});

//If leaving/changing page, store amount of loaded pageNr and scroll position
window.onbeforeunload = function () {
    //
};
