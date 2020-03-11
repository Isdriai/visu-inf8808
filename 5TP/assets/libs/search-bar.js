var searchBar = function(sources) {
  "use strict";

  var self = {};
  var isSearching = false;

  self.search = function() {};
  self.reset = function() {};

  // Initialisation de l'auto-complétion
  new autoComplete({
    selector: "#search-bar input",
    minChars: 1,
    source: function(term, suggest) {
      term = term.toLowerCase();
      var matches = [];
      sources.forEach(function(d) {
        if (~d.name.toLowerCase().indexOf(term)) {
          matches.push(d);
        }
      });
      suggest(matches);
    },
    renderItem: function(item, search) {
      search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      var re = new RegExp("(" + search.split(' ').join('|') + ")", "gi");
      return "<div class='autocomplete-suggestion' data-id='" + item.id + "' data-val='"
        + item.name + "'>" + item.name.replace(re, "<b>$1</b>") + "</div>";
    },
    onSelect: function(e, term, item) {
      isSearching = true;
      self.search(+item.getAttribute("data-id"), item.getAttribute("data-val"));
    }
  });

  // Ajout d'évènements sur la barre de recherche et le bouton.
  var searchBarInput = d3.select("#search-bar input");
  searchBarInput.on("keydown", function () {
    if (d3.event.key === "Enter") {
      validateInput();
    } else {
      isSearching = false;
      self.reset();
      searchBarInput.classed("error", false);
    }
  });
  d3.select("#search-bar button")
    .on("click", validateInput);

  /**
   * Valide la valeur entrée dans la barre et réalise une recherche.
   */
  function validateInput() {
    if (isSearching) {
      return;
    }
    function normalize(str) {
      return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
    var value = searchBarInput.node().value.toLowerCase();
    if (!value) {
      return;
    }
    var currentValue = normalize(value);
    const valueFound = sources.find(function(zone) {
      return normalize(zone.name.toLowerCase()) === currentValue;
    });
    if (valueFound) {
      isSearching = true;
      self.search(valueFound.id, valueFound.name);
    } else {
      isSearching = false;
      self.reset();
      searchBarInput.classed("error", true);
    }
  }

  return self;
};
