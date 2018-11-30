window.addEventListener('load', function() {
  Initialise(OnTuneIndexLoaded);
});

var usingParameterSet = true;
var LocalSet;

function OnTuneIndexLoaded()
{
  $("#lbl-num-in-set").html(CurSet.length);
  $("#lbl-num-in-set").show();

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

  OnSetListChanged();
}

function OnSetListChanged()
{
  var setlist = $("#setlist");
  setlist.html("");

  var setTemplate = function(filename, title) {
    return `<li class="list-group-item setlist-item">
              <a href="javascript:void(0);" onclick="MoveTuneUp('${filename}', $(this));" class="moveupbtn"><button type="button" class="btn btn-outline-dark" style="padding-bottom:1px;"><i class="fas fa-sort-up"></i></button></a>
              <a href="javascript:void(0);" onclick="MoveTuneDown('${filename}', $(this));" class="movedownbtn"><button type="button" class="btn btn-outline-dark" style="padding-top:1px;"><i class="fas fa-sort-down"></i></button></a>
              <span class="setlist-title">${title}</span>
              <a class="setlist-remove" href="javascript:void(0);" onclick="RemoveFromSetClicked('${filename}', $(this))"><i class="fas fa-trash-alt"></i></button>
            </li>`;
  };

  if(LocalSet.length == 0)
  {
    setlist.hide();
    $(".no-tunes-found").show();
    return;
  }
  else
  {
    setlist.show();
    $(".no-tunes-found").hide();
  }

  LocalSet.forEach(function(tunefilename, idx) {
    if(tunefilename.startsWith("pagebreak"))
    {
      LocalSet[idx] = "pagebreak" + idx;
      let removeBtn = setlist.append(setTemplate("pagebreak" + idx, "New Page")).find(".setlist-remove");

      removeBtn[0].addEventListener('mousedown', function(event) {
        event.stopPropagation();
      });
      return;
    }

    let tuneData = GetTuneData(tunefilename);

    let removeBtn = setlist.append(setTemplate(tuneData.filename, tuneData.title)).find(".setlist-remove");
    removeBtn[0].addEventListener('mousedown', function(event) {
      event.stopPropagation();
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

function AddPageBreak()
{
  LocalSet.push("pagebreak");

  if(!usingParameterSet)
  {
    CurSet = LocalSet;
    SetCookie(CurSet_CNAME, JSON.stringify(CurSet), CDUR);
  }

  OnSetListChanged();
}
