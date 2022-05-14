"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  const search = await axios.get("https://api.tvmaze.com/search/shows", {
    params: { q: term },
  });
  const shows = search.data;
  console.log(shows);
  const showList = [];
  let id, name, summary, image;

  for (let item of shows) {
    id = item.show.id;
    name = item.show.name;
    if (item.show.summary) {
      summary = item.show.summary;
    } else {
      summary = "<p>No Summary Available</p>";
    }

    if (item.show.image) {
      image = item.show.image.original;
    } else {
      image = "https://tinyurl.com/tv-missing";
    }

    showList.push({ id, name, summary, image });
  }

  return showList;
}

/** Given list of shows, create markup for each and append to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="${show.name}"
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-dark btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `
    );

    $showsList.append($show);
  }
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  let $term = $("#search-query");
  const shows = await getShowsByTerm($term.val());

  $episodesArea.hide();
  populateShows(shows);
  $term.val("");
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const result = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`);
  const episodes = result.data;
  const episodesList = [];
  let epId, name, season, number;

  for (let episode of episodes) {
    epId = episode.id;
    name = episode.name;
    season = episode.season;
    number = episode.number;

    episodesList.push({ epId, name, season, number });
  }
  return episodesList;
}

//given an array of episodes, this will append a new LI for each episode to the ul in the episodes-area section of the DOM
//if there are no episodes available, it will instead append an h3 with a message

function populateEpisodes(episodes) {
  const $episodesList = $("#episodes-list");
  if (!(episodes.length === 0)) {
    for (let episode of episodes) {
      $(
        `<li>"${episode.name}" (season ${episode.season}, episode ${episode.number})</li>`
      ).appendTo($($episodesList));
    }
  } else {
    $("<h3>**No Episodes Available**</h3>").appendTo($episodesArea);
  }
}

//this section of code handles a click on each episodes list button.
//it grabs the show id using the show-id data attribute on the parent div containing the .Show class,
//then passes this id into the getEpisodesOfShow() function.
//the resultant array is then passed into the populateEpisodes() function to populate the DOM

$showsList.on("click", "button", async function (e) {
  $episodesArea.show();
  $("#episodes-list").empty();
  if ($("h3")) {
    $("h3").remove();
  }
  const showId = $(e.target).parents("div.Show").data("show-id");
  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
});
