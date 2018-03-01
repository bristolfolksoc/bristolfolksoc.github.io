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
