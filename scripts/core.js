var TuneIndex = null;

// cookie expiry in days
var CDUR = 365;

var Favorites_CNAME = "fc_favs";
var Favorites = [];

var CurSet_CNAME = "fc_set";
var CurSet = [];

function DefaultSettings()
{
  return {
    cookiesEnabled: false,
    cleff: "treble",
    transposition: 0
  };
}

var Settings_CNAME = "fc_settings";
var Settings = DefaultSettings();

function Initialise(callback)
{
  LoadFavorites();
  LoadCurrentSet();
  LoadSettings();
  LoadTuneIndex(callback);
  SetupModals();
}

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

function LoadFavorites()
{
  var JSONString = GetCookie(Favorites_CNAME);

  if(JSONString == "")
  {
    Favorites = [];
    return;
  }

  Favorites = JSON.parse(JSONString);

  // if there is a JSON error reset the favorites
  if(Favorites == null)
    Favorites = [];
}

function LoadCurrentSet()
{
  var JSONString = GetCookie(CurSet_CNAME);

  if(JSONString == "")
  {
    CurSet = [];
    return;
  }

  CurSet = JSON.parse(JSONString);

  // if there is a JSON error reset the favorites
  if(CurSet == null)
    CurSet = [];
}

function LoadSettings()
{
  var JSONString = GetCookie(Settings_CNAME);

  if(JSONString == "")
  {
    return;
  }

  LoadedSettings = JSON.parse(JSONString);

  /*
   * The user may have some settings missing:
   * In this case we want to copy the default values for their missing settings
   * and resave their cookie so it is up to date
   */
  if(LoadedSettings != null)
  {
    Object.keys(LoadedSettings).forEach(function(key, index) {
      if(Settings.hasOwnProperty(key))
      {
        Settings[key] = LoadedSettings[key];
      }
    });

    SetCookie(Settings_CNAME, JSON.stringify(Settings), CDUR);

    $("#cleffSelect").val(Settings.cleff);
    $("#transpositionSelect").val(Math.floor(Settings.transposition / 12));
  }
}

function SetupModals()
{
  $('#cookiesModal').on('show.bs.modal', function (event) {
    Settings.cookiesEnabled = true;

    SetCookie(Settings_CNAME, JSON.stringify(Settings), CDUR);
  });

  $("#transpositionSelect").on('change', function(event) {
    Settings.transposition = parseInt($("#transpositionSelect").val()) * 12;
    if(!Settings.cookiesEnabled) $('#settingsModal').modal('hide');
    SetCookie(Settings_CNAME, JSON.stringify(Settings), CDUR);
  });

  $("#cleffSelect").on('change', function(event) {
    Settings.cleff = $("#cleffSelect").val();
    if(!Settings.cookiesEnabled) $('#settingsModal').modal('hide');
    SetCookie(Settings_CNAME, JSON.stringify(Settings), CDUR);
  });
}

function LoadAndRenderTune(filepath, div)
{
  let xhr = new XMLHttpRequest();
  xhr.open("GET", filepath);
  xhr.onload = function() {
    let processedABC = preProcessABC(xhr.responseText);
    ABCJS.renderAbc(div[0], processedABC,
      {
        visualTranspose: Settings.transposition,
        staffwidth: div.width() - 30,
      });
  };

  xhr.send();
}

function LoadMidiForTune(filepath, div, callback)
{
  let xhr = new XMLHttpRequest();
  xhr.open("GET", filepath);
  xhr.onload = function() {
    ABCJS.renderMidi(div[0], xhr.responseText, {},
    {
      listener: function (abcjsElement, currentEvent, context) { MidiListenerCallback(abcjsElement, currentEvent, context); },
      startingTune: 0
    });
    callback();
  };

  xhr.send();
}

function preProcessABC(inABC)
{
  // include the users selected cleff
  let keyText = GetABCHeader(inABC, 'K');

  let modifiedABC = SetABCHeader(inABC, 'K', keyText + " " + Settings.cleff);

  return modifiedABC;
}

function LoadRawABC(filepath, callback)
{
  let xhr = new XMLHttpRequest();
  xhr.open("GET", filepath);
  xhr.onload = function() {
    callback(xhr.responseText);
  };

  xhr.send();
}

function MidiListenerCallback(abcjsElement, currentEvent, context)
{
  // update the progress bar
  var newWidth = 100 * currentEvent.progress;
  var container = jQuery(abcjsElement).parent().parent();
  var pb = container.find(".progress-bar");
  pb.css("width", newWidth + "%");

  //check if we should be looping
  if(currentEvent.progress === 1)
  {
    if(container.find(".btn-loop").hasClass("active"))
    {
      setTimeout(function() {
        ABCJS.midi.startPlaying(abcjsElement);
      }, 10);
    }
  }
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

function GetABCHeader(abc, header)
{
  let lines = abc.split('\n');

  for(let i = 0; i < lines.length; i++)
  {
    let line = lines[i];
    if(line.startsWith(header))
    {
      return line.substr(line.indexOf(':')+1).trim();
    }
  }

  return undefined;
}

function SetABCHeader(abc, header, value)
{
  let lines = abc.split('\n');
  let outABC = "";
  let found = false;

  lines.forEach(function(line) {
    let newLine = line;

    if(line.startsWith(header))
    {
      newLine = header + ":" + value;
      found = true;
    }

    if(outABC != "")
      outABC += "\n";

    outABC += newLine;
  });

  return outABC;
}

function ToggleFavorite(tunefilename)
{
  if(IsFavorite(tunefilename))
  {
    Favorites.splice(Favorites.indexOf(tunefilename), 1);
  }
  else
  {
    Favorites.push(tunefilename);
  }

  SetCookie(Favorites_CNAME, JSON.stringify(Favorites), CDUR);
}

function IsFavorite(tunefilename)
{
  return Favorites.includes(tunefilename);
}

function AddTuneToSet(tunefilename)
{
  if(IsInSet(tunefilename)) return;

  CurSet.push(tunefilename);

  SetCookie(CurSet_CNAME, JSON.stringify(CurSet), CDUR);
}

function RemoveTuneFromSet(tunefilename)
{
  let idx = CurSet.indexOf(tunefilename);

  if(idx == -1) return;

  CurSet.splice(idx, 1);

  SetCookie(CurSet_CNAME, JSON.stringify(CurSet), CDUR);
}

function IsInSet(tunefilename)
{
  return CurSet.includes(tunefilename);
}

var PDFNoteSize = 0.5;
var PDFTopMargin = 50;
var PDFLeftMargin = 50;
var PDFTunes = [];

var PDFReOrder = false;
var PDFIncludePageNumbers = false;

function OpenPDFModal(tunes)
{
  PDFTunes = tunes;
  $('#pdfModal').modal('show');

  var reOrderButton = $("#pdf-best-fit").parent();

  if(tunes.length == 1)
    reOrderButton.hide()
  else
    reOrderButton.show();

  OnPDFSettingChanged();
}

function OnPDFSettingChanged()
{
  // reset from previous version
  $('#btn-view-pdf button').html("<i class=\"fas fa-spinner fa-spin\"></i>");
  $('#btn-view-pdf').attr("href", "javascript:void(0);");
  $('#a-view-pdf').hide();

  PDFReOrder = $("#pdf-best-fit").is(":checked");
  PDFIncludePageNumbers = $("#pdf-include-pnumbers").is(":checked");

  setTimeout(function() {
    CreatePDF(PDFTunes, function(url) {
      $('#btn-view-pdf button').html("View PDF File");
      $('#btn-view-pdf').attr("href", url);
      $('#a-view-pdf a').attr("href", url);
      $('#a-view-pdf a').html(url);
      $('#a-view-pdf').show();
    });
  }, 500);
}

function CreatePDF(tunes, callback)
{
  var remainingTunes = 1;
  var tuneData = [];

  tunes.forEach(function(tune, index) {
    tuneData.push({
      path: tune,
      abc: ''
    });

    if(tune.startsWith("pagebreak"))
    {
      return;
    }

    remainingTunes++;

    LoadRawABC(tune, function(abc) {
      tuneData[index].abc = abc;

      //create a fake element and create the SVG inside of it
      tuneData[index].svg = document.createElement("div");
      document.body.appendChild(tuneData[index].svg);
      let processedABC = preProcessABC(abc);
      ABCJS.renderAbc(tuneData[index].svg, processedABC,
        {
          visualTranspose: Settings.transposition,
          staffwidth: 500 / PDFNoteSize
        });

      remainingTunes--;
      if(remainingTunes == 0)
      {
        CreatePDFFromTuneData(tuneData, callback);

        //clean up the created elements
        tuneData.forEach(function(data) {
          if(data.svg != undefined)
          {
            document.body.removeChild(data.svg);
          }
        });
      }
    });
  });

  remainingTunes--;
}

function CreatePDFFromTuneData(tuneData, callback)
{
  // create a document and pipe to a blob
  var doc = new PDFDocument({autoFirstPage:false});
  var stream = doc.pipe(blobStream());

  if(PDFIncludePageNumbers)
  {
    var pageNumber = 0;
    doc.on('pageAdded',
      function(){
        // Don't forget the reset the font family, size & color if needed
        doc.font('Times-Roman').text(++pageNumber, 0.5 * doc.page.width, doc.page.height - 70, {lineBreak: false});
      }
    );
  }
  doc.addPage();

  let yOffset = PDFTopMargin;
  tuneData.forEach(function(data, idx) {
    if(data.path.startsWith("pagebreak"))
    {
      if(yOffset != PDFTopMargin)
      {
          doc.addPage();
          yOffset = PDFTopMargin;
      }

      return;
    }
  
    if(yOffset + (data.svg.clientHeight * PDFNoteSize) >= 750)
    {
      doc.addPage();
      yOffset = PDFTopMargin;
    }

    AddSVGToPDFDocument(doc, data.svg.children[0], yOffset);
    yOffset += (data.svg.clientHeight * PDFNoteSize);
  });

  // end and display the document in the iframe to the right
  doc.end();
  stream.on('finish', function() {
    callback(stream.toBlobURL('application/pdf'));
  });
}

function AddSVGToPDFDocument(doc, svg, yOffset)
{
  //parse out the element type, and render if required
  if(svg.tagName == "text")
  {
    AddSVGTextToPDFDocument(doc, svg, yOffset);
  }
  else if(svg.tagName == "path")
  {
    AddSVGPathToPDFDocument(doc, svg, yOffset);
  }
  // Add more renderable SVG elements here as required

  for(let i = 0; i < svg.children.length; ++i)
  {
    AddSVGToPDFDocument(doc, svg.children[i], yOffset);
  }
}

// PDF Render functions
function AddSVGTextToPDFDocument(doc, text, yOffset)
{
  let textVal = text.textContent;
  let x = (text.getAttribute("x") * PDFNoteSize) + PDFLeftMargin;
  let y = (text.getAttribute("y") * PDFNoteSize) + yOffset;
  let font = "Helvetica";
  let size = 14;
  let isBold = false;
  let isItalic = false;

  if(text.hasAttribute("font-style"))
  {
    let fontStyle = text.getAttribute("font-style");

    isBold = fontStyle.includes("bold");
    isItalic = fontStyle.includes("italic");
  }

  if(text.hasAttribute("font-family"))
  {
    let fontFam = text.getAttribute("font-family");

    if(fontFam == "\"Times New Roman\"")
    {
      font = "Times-" + (isBold ? "Bold" : "") + (isItalic ? "Italic" : "") + (!isBold && !isItalic ? "Roman" : "");
    }
    else
    {
      font = (!isBold && !isItalic ? "Helvetica" : ("Helvetica-" + (isBold ? "Bold" : "") + (isItalic ? "Oblique" : "")));
    }
  }

  if(text.hasAttribute("font-size"))
  {
    //hacccky
    let fontSize = text.getAttribute("font-size");
    size = parseInt(fontSize.replace("px", "")) * PDFNoteSize;
  }

  if(text.hasAttribute("text-anchor"))
  {
    let fontAnchor = text.getAttribute("text-anchor");
    let textLength = text.getBBox().width * PDFNoteSize;

    if(fontAnchor == "end")
    {
      x -= textLength;
    }
    else if(fontAnchor == "middle")
    {
      x -= (textLength * 0.5);
    }
  }

  doc.font(font, size).text(textVal, x, y, {lineBreak: false});
}

function AddSVGPathToPDFDocument(doc, path, yOffset)
{
  let d = path.getAttribute("d");
  let fillOpacity = path.getAttribute("fill-opacity");
  let fill = path.getAttribute("fill");

  // nothing to draw
  if(fillOpacity == "0") return;

  doc.save()
    .translate(PDFLeftMargin, yOffset + 5)
    .scale(PDFNoteSize)
    .path(d);

  if(path.hasAttribute("fill-opacity"))
  {
    doc.fillOpacity(parseFloat(fillOpacity));
  }

  if(path.hasAttribute("fill") && fill != "none")
    doc.fill(fill);

  doc.restore();
}

function dateToString(d) {
  return d.getDate() + "/" + d.getMonth() + "/" + d.getFullYear() + " " + d.getHours() + ":" + (d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes());
}

// w3 schools functions
function SetCookie(cname, cvalue, exdays)
{
  if(!Settings.cookiesEnabled)
  {
    $('#cookiesModal').modal('show');
    return;
  }

  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function GetCookie(cname)
{
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

// returns the value of a parameter or the default value if it was not specified
function getHTMLParam(paramkey, defaultval = false)
{
  var query = window.location.search.substring(1);
  var vars = query.split("&");

  for (var i=0;i<vars.length;i++)
  {
    var pair = vars[i].split("=");
    if(pair[0] == paramkey)
      return pair[1];
  }

  return defaultval;
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

function GetTuneData(filename)
{
  return TuneIndex.tunes.find(function(tune) { return tune.filename == filename; })
}

function showSettingsModal()
{
  $("#settingsModal").modal();
}
