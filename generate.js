"use strict";

const fs = require('fs');

// returns the specified parameter of the ABC file as a string or a default value if it doesn't exist
let GetABCParam = (abc, paramname, defaultValue = "") => {
  let value = defaultValue;
  let lines = abc.split('\n');

  for(let i = 0; i < lines.length; ++i)
  {
    if(lines[i].startsWith(paramname))
    {
      value = lines[i].slice(paramname.length + 1).trim();
      break;
    }
  }

  return value;
};

let AutoTrim = (str) => {
  return str.trim().replace("*", "");
};

let ParseTune = (filepath) => {
  return new Promise(function(resolve, reject) {
    fs.readFile(filepath, (err, data) => {
      if(err)
      {
        console.log("Error opening file : " + err);
        resolve(null);
      }

      // convert data to a string
      let abc = data + '';

      //parse out tune details
      resolve({
        title: AutoTrim(GetABCParam(abc, "T", "Sample Tune")),
        type: AutoTrim(GetABCParam(abc, "R", "Jig")),
        author:  AutoTrim(GetABCParam(abc, "C", "Anon.")),
        filename: filepath
      });
    });
  });
};

function ParseDirectoryRecursvie(dir)
{
  return new Promise(function(resolve, reject) {
    fs.readdir(dir, (err, files) => {
      if(err)
        reject(err);

      let tunes = [];
      let tunespromises = [];

      files.forEach((file) => {
        let fullpath = dir + "/" + file;

        if(fs.lstatSync(fullpath).isDirectory())
        {
          tunespromises.push(
            ParseDirectoryRecursvie(fullpath).then((rectunes) => {
              tunes = tunes.concat(rectunes);
            })
          );
        }
        else
        {
          tunespromises.push(
            ParseTune(fullpath).then((tuneobj) => {
              if(tuneobj != null)
                tunes.push(tuneobj);
            })
          );
        }
      });

      Promise.all(tunespromises).then(() => {
        resolve(tunes);
      });
    });
  });
}

ParseDirectoryRecursvie("./tunes").then((tunes) => {
  tunes.sort(function(a,b) {
    if (a.title < b.title)
      return -1;
    if (a.title > b.title)
      return 1;
    return 0;
  });

  let obj = {
    genTime: Date.now(),
    tunes: tunes
  };
  fs.writeFile("./tunes.json", JSON.stringify(obj), () => {});
});
