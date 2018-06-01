window.addEventListener('load', function() {
  Initialise(OnTuneIndexLoaded);
});

function OnTuneIndexLoaded()
{
  $("#lbl-num-in-set").html(CurSet.length);
  $("#lbl-num-in-set").show();

  var setlist = $("#setlist");
  setlist.html("");

  var setTemplate = function(tune) {
    return `<li class="list-group-item setlist-item" onmousedown="javascript:DragBegin($(this));"">
              <i class="fas fa-bars"></i>
              <span class="setlist-title">${tune.title}</span>
              <a class="setlist-remove" href="javascript:void(0);" onclick="RemoveFromSetClicked('${tune.filename}', $(this))"><i class="fas fa-trash-alt"></i></button>
            </li>`;
  };

  CurSet.forEach(function(tunefilename) {
    let tuneData = GetTuneData(tunefilename);

    let removeBtn = setlist.append(setTemplate(tuneData)).find(".setlist-remove");
    removeBtn[0].addEventListener('mousedown', function(event) {
      event.stopPropagation();
    });
  });

  document.addEventListener('mouseup', DragEnd);

  OnSetListChanged();
}

function OnSetListChanged()
{
  let container = $("#setlist-music-container");

  if(CurSet.length == 0)
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

  let numTunes = CurSet.length;
  let abcs = [];

  CurSet.forEach(function(tune, index) {
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
  RemoveTuneFromSet(tune);
  $("#lbl-num-in-set").html(CurSet.length);
  element.parent().slideUp(function() {
    element.parent().remove();

    OnSetListChanged();
  });

}

var currentlyDragged = undefined;

function DragBegin(element)
{
  DragEnd()
  currentlyDragged = element;

  currentlyDragged.addClass("grabbed");
}

function DragEnd()
{
  if(currentlyDragged == undefined) return;

  currentlyDragged.removeClass("grabbed");

  currentlyDragged = undefined;
}
