window.addEventListener('load', function() {
  Initialise(OnTuneIndexLoaded);
});

var usingParameterSet = true;
var LocalSet;

function OnTuneIndexLoaded()
{
  $("#lbl-num-in-set").html(CurSet.length);
  $("#lbl-num-in-set").show();

  var setlist = $("#setlist");
  setlist.html("");

  var setTemplate = function(tune) {
    return `<li class="list-group-item setlist-item">
              <a href="javascript:void(0);" onclick="MoveTuneUp('${tune.filename}', $(this));" class="moveupbtn"><button type="button" class="btn btn-outline-dark" style="padding-bottom:1px;"><i class="fas fa-sort-up"></i></button></a>
              <a href="javascript:void(0);" onclick="MoveTuneDown('${tune.filename}', $(this));" class="movedownbtn"><button type="button" class="btn btn-outline-dark" style="padding-top:1px;"><i class="fas fa-sort-down"></i></button></a>
              <span class="setlist-title">${tune.title}</span>
              <a class="setlist-remove" href="javascript:void(0);" onclick="RemoveFromSetClicked('${tune.filename}', $(this))"><i class="fas fa-trash-alt"></i></button>
            </li>`;
  };

  try
  {
    LocalSet = JSON.parse(decodeURIComponent(getHTMLParam("set", "")));
    $("#msg-parameterset").show();
  } catch(e) {
    LocalSet = CurSet;
    usingParameterSet = false;
  }

  if(history)
  {
    history.replaceState(null, null, "set.html");
  }

  LocalSet.forEach(function(tunefilename) {
    let tuneData = GetTuneData(tunefilename);

    let removeBtn = setlist.append(setTemplate(tuneData)).find(".setlist-remove");
    removeBtn[0].addEventListener('mousedown', function(event) {
      event.stopPropagation();
    });
  });

  if(LocalSet.length == 0)
  {
    $("#set-cotnainer").hide();
    $(".no-tunes-found").show();
  }

  OnSetListChanged();
}

function OnSetListChanged()
{
  return;
  let container = $("#setlist-music-container");

  if(LocalSet.length == 0)
  {
    conainer.html("");
    container.hide();
    $(".no-tunes-found").show();
    return;
  }
  else
  {
    container.show();
    $(".no-tunes-found").hide();
  }

  container.html("<i class=\"fas fa-spinner fa-2x fa-spin\"></i>");

  let numTunes = LocalSet.length;
  let abcs = [];

  LocalSet.forEach(function(tune, index) {
    LoadRawABC(tune, function(abc) {
      abcs.splice(index, 0, abc);
      numTunes--;

      // check if all requests have returned
      if(numTunes == 0)
      {
        let superABC = "";
        let containers = [];

        container.html("");

        abcs.forEach(function(tuneABC, index) {
          tuneABC = SetABCHeader(tuneABC, "X", index+1);
          superABC = superABC + "\n" + tuneABC;

          container.append("<div></div>");
          containers.push(container[0].children[index]);
        });

        console.log(superABC);

        ABCJS.renderAbc(containers, superABC,
          { },
          {
              staffwidth: container.width() - 30,
          },
          { });
      }
    });
  });
}


function RemoveFromSetClicked(tune, element)
{
  let idx = LocalSet.indexOf(tune);

  if(idx != -1) LocalSet.splice(idx, 1);

  if(!usingParameterSet)
  {
    CurSet = LocalSet;
    SetCookie(CurSet_CNAME, JSON.stringify(CurSet), CDUR);
  }

  $("#lbl-num-in-set").html(LocalSet.length);
  element.parent().slideUp(function() {
    element.parent().remove();

    OnSetListChanged();
  });

}

function CreateSetPDF()
{
  OpenPDFModal(LocalSet);
}

function GetSharableLink()
{
  $('#shareLinkText').val(window.location + "?set=" + encodeURIComponent(JSON.stringify(LocalSet)));
  $('#shareModal').modal('show');
}

function MoveTuneDown(tune, element)
{
    let div = $(element.parent());
    div.insertAfter(div.next());

    let idx = LocalSet.indexOf(tune);

    LocalSet[idx] = LocalSet[idx + 1];
    LocalSet[idx + 1] = tune;

    if(!usingParameterSet)
    {
      CurSet = LocalSet;
      SetCookie(CurSet_CNAME, JSON.stringify(CurSet), CDUR);
    }
}

function MoveTuneUp(tune, element)
{
    let div = $(element.parent());
    div.insertBefore(div.prev());

    let idx = LocalSet.indexOf(tune);

    LocalSet[idx] = LocalSet[idx - 1];
    LocalSet[idx - 1] = tune;

    if(!usingParameterSet)
    {
      CurSet = LocalSet;
      SetCookie(CurSet_CNAME, JSON.stringify(CurSet), CDUR);
    }
}
