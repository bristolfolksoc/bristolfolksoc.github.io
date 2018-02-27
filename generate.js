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

let ParseTune = (filepath) => {
  return new Promise(function(resolve, reject) {
    // initialise the object with the default values
    let obj =

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
        title: GetABCParam(abc, "T", "Sample Tune"),
        type: GetABCParam(abc, "R", "jig"),
        author: GetABCParam(abc, "C", "n/a"),
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
  fs.writeFile("./tunes.json", JSON.stringify(tunes), () => {});
});
