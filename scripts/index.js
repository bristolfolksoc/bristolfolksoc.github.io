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
              <a href="javascript:void(0);" onclick="javascript:ViewMusicClicked('${tune.filename}', $(this));">
                <button type="button" class="btn btn-outline-dark"><i class="fas fa-music"></i> View Music</button>
              </a>
              <a href="javascript:void(0);" onclick="javascript:PlayMIDIClicked('${tune.filename}', $(this))">
                <button type="button" class="btn btn-outline-dark"><i class="fas fa-headphones"></i> Play MIDI</button>
              </a>
              <a href="javascript:void(0);" onclick="javascript:ToggleFavorite('${tune.filename}');  if(IsFavorite('${tune.filename}')) { $(this).addClass('active'); } else { $(this).removeClass('active'); }" class="fav-button ${IsFavorite(tune.filename) ? "active" : ""}">
                <button type="button" class="btn btn-outline-dark btn-favorite"><i class="fas fa-heart ico-favorite"></i> Favorite</button>
              </a>
              <a href="javascript:void(0);" onclick="javascript:AddTuneToSet('${tune.filename}'); if(IsInSet('${tune.filename}')) { $(this).addClass('active'); } else { $(this).removeClass('active'); } $('#lbl-num-in-set').html(CurSet.length);" class="set-button ${IsInSet(tune.filename) ? "active" : ""}">
                <button type="button" class="btn btn-outline-dark"><i class="fas fa-plus"></i> Add to Set</button>
              </a>
              <a href="javascript:void(0);" onclick="javascript:ViewABCClicked('${tune.filename}', $(this));">
                <button type="button" class="btn btn-outline-dark"><i class="fas fa-download"></i> View ABC</button>
              </a>
              <div class="abc-container" style="display:none">Loading...</div>
              <div class="midi-container" onload="javascript:$this.hide()">
                <div class="midi-container-hidden"></div>
                <a href="javascript:void(0);" onclick="javascript:PlayMIDI($(this).parent());" class="btn-play">
                  <button type="button" class="btn btn-outline-dark btn-favorite"><i class="fas fa-play"></i> / <i class="fas fa-pause"></i></button>
                </a>
                <a href="javascript:void(0);" onclick="javascript:StopMIDI($(this).parent());">
                  <button type="button" class="btn btn-outline-dark btn-favorite"><i class="fas fa-step-backward"></i></button>
                </a>
                <div class="progress tune-playback-bar">
                  <div class="progress-bar" role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
                <a href="javascript:void(0);" onclick="javascript:SetLooping($(this));" class="btn-loop">
                  <button type="button" class="btn btn-outline-dark btn-favorite"><i class="fas fa-sync"></i></button>
                </a>
              </div>
              <div class="music-container" style="display:none">Loading...</div>
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

function ViewMusicClicked(abc, button)
{
  if(!button.hasClass('active'))
  {
    LoadAndRenderTune(abc, button.parent().find('.music-container'));
    button.parent().find('.music-container').slideDown();
    button.addClass('active');
  }
  else
  {
    button.parent().find('.music-container').slideUp();
    button.removeClass('active');
  }
}

function PlayMIDIClicked(abc, button)
{
  if(!button.hasClass('active'))
  {
    button.addClass('active');

    var customControls = button.parent().find('.midi-container');

    LoadMidiForTune(abc, customControls.find('.midi-container-hidden'), function() {
      customControls.slideToggle();
      customControls.css('display', 'flex');

      PlayMIDI(customControls);
    });
  }
  else
  {
    button.parent().find('.midi-container').slideToggle();
    button.removeClass('active');
  }
}

function ViewABCClicked(abc, button)
{
  if(!button.hasClass('active'))
  {
    button.addClass('active');
    LoadRawABC(abc, function(abctext) {
      var lines = abctext.split('\n');
      var container = button.parent().find(".abc-container");
      var html = "";

      lines.forEach(function(line, idx) {
        html = html + line + "<br/>";
      });

      container.html("<p>" + html + "<p>");
      container.slideDown();
    });
  }
  else
  {
    button.removeClass('active');
    button.parent().find(".abc-container").slideUp();
  }
}

function SetLooping(button)
{
  if(!button.hasClass('active'))
  {
    button.addClass('active');
  }
  else
  {
    button.removeClass('active');
  }
}

function PlayMIDI(container)
{
  ABCJS.midi.startPlaying(container.find('.midi-container-hidden')[0].firstChild);
}

function StopMIDI(container)
{
  ABCJS.midi.stopPlaying();
  container.find('.progress-bar').css("width", "0%");
}
