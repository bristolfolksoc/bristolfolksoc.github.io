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
    return `<li class="list-group-item setlist-item">
              <i class="fas fa-bars"></i>
              <span class="setlist-title">${tune.title}</span>
              <i class="fas fa-trash-alt"></i>
            </li>`;
  };

  CurSet.forEach(function(tunefilename) {
    var tuneData = GetTuneData(tunefilename);

    setlist.append(setTemplate(tuneData));
  });

  if(CurSet.length == 0)
  {
    $(".no-tunes-found").show();
  }
}
