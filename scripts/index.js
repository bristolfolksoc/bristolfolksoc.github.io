window.addEventListener('load', function() {
  Initialise(OnTuneIndexLoaded);

  $("#keyword-search").on('input',function(e) {
    OnSearchFilterChanged();
  });

  $("#fav-filter").on('change', function(e) {
    OnSearchFilterChanged();
  });

  $("#composer-select").on('change', function(e) {
    OnSearchFilterChanged();
  });
});

function OnTuneIndexLoaded()
{
  $("#keyword-search").attr("placeholder", "Search " + TuneIndex.tunes.length + " tunes...");
  $("#lbl-num-in-set").html(CurSet.length);

  var d = new Date(TuneIndex.genTime);
  $("#updateTime").html("Last updated " + d.toString());

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

var pageIndex = 0;

function SetPageIndex(newIndex)
{
  pageIndex = newIndex;
  UpdateFilteredTunes();
}

function PrevPage()
{
  SetPageIndex(pageIndex - 1);
}

function NextPage()
{
  SetPageIndex(pageIndex + 1);
}

var filterChangedTimeout = 0;
function OnSearchFilterChanged()
{
  if(filterChangedTimeout == 0)
    $("#tune-container").html(`<p class="loading-spinner"><i class="fas fa-spinner fa-2x fa-spin"></i></p>`);

  clearTimeout(filterChangedTimeout);
  filterChangedTimeout = setTimeout(function() {
    pageIndex = 0;
    filterChangedTimeout = 0;
    UpdateFilteredTunes();
  }, 500);
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

  var count = 0;
  var maxperpage = 15;
  var skip = pageIndex * maxperpage;

  TuneIndex.tunes.forEach(function(tune)
  {
    if(!PassesFilter(tune)) return;

    count += 1;

    if(count <= skip || count > skip + maxperpage)
    {
      return;
    }

    var title = HighlightText(tune.title, GetFilter());
    $("#tune-container").append(tuneTemplate(tune, title));
  });

  if(count == 0)
  {
    $(".no-tunes-found").show();
    $(".tune-pagination").hide();
  }
  else
  {
    $(".no-tunes-found").hide();

    $(".tune-pagination").show();
    $(".tune-pagination .page-count").html("Showing " + (skip + 1) + " - " + Math.min(skip+maxperpage, count) + " of " + count);
    var pages = $(".tune-pagination .pagination");
    if(count <= maxperpage)
    {
      pages.hide();
    }
    else
    {
      pages.show();
      pages.html("");

      if(skip != 0)
      {
        pages.append(`<li class="page-item"><a class="page-link" href="javascript:void(0);" onclick="javascript:PrevPage();">Previous</a></li>`);
      }
      else
      {
        pages.append(`<li class="page-item disabled"><a class="page-link" href="#" tabindex="-1">Previous</a></li>`);
      }

      for(var i = 0; i < Math.ceil(count / maxperpage); i = i + 1)
      {
        if(i == pageIndex)
        {
          pages.append(`<li class="page-item disabled"><a class="page-link" href="#" tabindex="-1">${i+1}</a></li>`);
        }
        else
        {
          pages.append(`<li class="page-item"><a class="page-link" href="javascript:void(0);" onclick="javascript:SetPageIndex(${i});">${i+1}</a></li>`);
        }
      }

      if(skip + maxperpage < count)
      {
        pages.append(`<li class="page-item"><a class="page-link" href="javascript:void(0);" onclick="javascript:NextPage();">Next</a></li>`);
      }
      else
      {
        pages.append(`<li class="page-item disabled"><a class="page-link" href="#" tabindex="-1">Next</a></li>`);
      }
    }
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

  TuneIndex.tunes.forEach(function(tune)
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
