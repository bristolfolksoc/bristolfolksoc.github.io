var TuneIndex = null;

function LoadTuneIndex(callback)
{
  if(TuneIndex != null)
  {
    callback();
    return;
  }

  let xhr = new XMLHttpRequest();
  xhr.open("GET", "./tunes.json");
  xhr.onload = function() {
    TuneIndex = JSON.parse(xhr.responseText);
    callback();
  };

  xhr.send();
}

function LoadAndRenderTune(filepath, div)
{
  let xhr = new XMLHttpRequest();
  xhr.open("GET", filepath);
  xhr.onload = function() {
    ABCJS.renderAbc(div[0], xhr.responseText)
  };

  xhr.send();
}

function MatchesFilter(inText, filter)
{
  filter = filter.trim();
  if(filter.length == 0) return true;

  var text = inText.toLowerCase();
  var filters = filter.toLowerCase().split(" ");

  var result = false;

  filters.forEach(function(fi) {
    if(text.search(fi) != -1)
    {
      result = true;
      return;
    }
  });

  return result;
}

function HighlightText(inText, filter)
{
  filter = filter.trim();
  if(filter.length == 0) return inText;

  var filters = filter.toLowerCase().split(" ");

  return HighlightText_recursive(inText, filters);
}

function HighlightText_recursive(inText, filters)
{
  var text = inText.toLowerCase();
  if(text.length == 0) return "";

  var lowestIdx = -1;
  var lowestMatch = "";

  filters.forEach(function(fi) {
    var match = text.search(fi);

    if(match != -1 &&
        (lowestMatch == "" || match < lowestMatch))
    {
      lowestIdx = match;
      lowestMatch = fi;
    }
  });

  if(lowestIdx == -1) return inText;

  return inText.substr(0,lowestIdx) + "<span class=\"highlighted-text\">" + inText.substr(lowestIdx, lowestMatch.length) + "</span>" + HighlightText_recursive(inText.substr(lowestIdx + lowestMatch.length), filters);
}
