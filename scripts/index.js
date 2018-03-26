window.addEventListener('load', function() {
  Initialise(OnTuneIndexLoaded);

  $("#keyword-search").on('input',function(e) {
    UpdateFilteredTunes();
  });

  $("#fav-filter").on('change', function(e) {
    UpdateFilteredTunes();
  });

  $("#composer-select").on('change', function(e) {
    UpdateFilteredTunes();
  });
});

function OnTuneIndexLoaded()
{
  $("#keyword-search").attr("placeholder", "Search " + TuneIndex.length + " tunes...");
  $("#lbl-num-in-set").html(CurSet.length);

  UpdateComposerList();
  UpdateFilteredTunes();
}

function GetFilter() { return $("#keyword-search").val();}

// returns true if the tune should be shown based on the search filter
function PassesFilter(tune)
{
  var filterFav = $("#fav-filter").is(":checked");
  var composerFilter = $("#composer-select option:checked").val();

  return MatchesFilter(tune.title, GetFilter()) &&
    (!filterFav || IsFavorite(tune.filename)) &&
    (composerFilter == "" || tune.author == composerFilter);
}

// update which tunes are shown based on the filter
function UpdateFilteredTunes()
{
  $("#tune-container").empty();

  var tuneTemplate = function(tune, title) {
    return `<div class="tune-entry">
              <h1>${title}<i>(${tune.type})</i></h1>
              <a href="javascript:void(0);" onclick="javascript:LoadAndRenderTune('${tune.filename}', $(this).parent().find('.music-container')); $(this).addClass('active');">
                <button type="button" class="btn btn-outline-dark"><i class="fas fa-music"></i> View Music</button>
              </a>
              <a href="javascript:void(0);" onclick="javascript:PlayMidiForTune('${tune.filename}', $(this).parent().find('.midi-container')); $(this).addClass('active');">
                <button type="button" class="btn btn-outline-dark"><i class="fas fa-play"></i> Play</button>
              </a>
              <a href="javascript:void(0);" onclick="javascript:ToggleFavorite('${tune.filename}');  if(IsFavorite('${tune.filename}')) { $(this).addClass('active'); } else { $(this).removeClass('active'); }" class="fav-button ${IsFavorite(tune.filename) ? "active" : ""}">
                <button type="button" class="btn btn-outline-dark btn-favorite"><i class="fas fa-heart ico-favorite"></i> Favorite</button>
              </a>
              <a href="javascript:void(0);" onclick="javascript:AddTuneToSet('${tune.filename}'); if(IsInSet('${tune.filename}')) { $(this).addClass('active'); } else { $(this).removeClass('active'); } $('#lbl-num-in-set').html(CurSet.length);" class="set-button ${IsInSet(tune.filename) ? "active" : ""}">
                <button type="button" class="btn btn-outline-dark"><i class="fas fa-plus"></i> Add to Set</button>
              </a>
              <a href="${tune.filename}">
                <button type="button" class="btn btn-outline-dark"><i class="fas fa-download"></i> Download ABC</button>
              </a>
              <div class="midi-container"></div>
              <div class="music-container"></div>
            </div>`;
  };

  let count = 0;
  TuneIndex.forEach(function(tune)
  {
    if(count > 50) return;
    if(!PassesFilter(tune)) return;

    count += 1;
    var title = HighlightText(tune.title, GetFilter());
    $("#tune-container").append(tuneTemplate(tune, title));
  });

  if(count == 0)
  {
    $(".no-tunes-found").show();
  }
  else
  {
    $(".no-tunes-found").hide();
  }
}

function UpdateComposerList()
{
  $("#composer-select").empty();
  $("#composer-select").append("<option value=\"\" selected>Filter by composer...</option>");

  var composerLITemplate = function(composername) {
    return `<option value="${composername}">${composername}</option>`;
  }

  var uniqueComposers = [];

  TuneIndex.forEach(function(tune)
  {
    if(uniqueComposers.includes(tune.author))
      return;

    uniqueComposers.push(tune.author);
    $("#composer-select").append(composerLITemplate(tune.author));
  });
}

function ToggleAdvancedSearch()
{
  $("#advanced-search-opts").slideToggle();
}
