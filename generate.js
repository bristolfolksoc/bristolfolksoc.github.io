"use strict";

var TUNEBOOK_TEMPLATE = "printed_tunebook.tex"
const fs = require('fs');
const { exec } = require('child_process');

// returns the specified parameter of the ABC file as a string or a default value if it doesn't exist
let GetABCParam = (abc, paramname, defaultValue = "", instance = 1) => {
  let value = defaultValue;
  let lines = abc.split('\n');
  let curInstance = 0;

  for(let i = 0; i < lines.length; ++i)
  {
    if(lines[i].startsWith(paramname))
    {
      curInstance++;
      if(curInstance == instance)
      {
        let idx = lines[i].indexOf(":");
        if(idx == -1) value = lines[i].slice(paramname.length + 1).trim();
        else value = lines[i].slice(idx + 1).trim();

        break;
      }
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

      let obj = {
        title: AutoTrim(GetABCParam(abc, "T", "Sample Tune")),
        type: AutoTrim(GetABCParam(abc, "R", "Miscellaneous")),
        author:  AutoTrim(GetABCParam(abc, "C", "Anon.")),
        bars:  AutoTrim(GetABCParam(abc, "r", "0")),
        key: AutoTrim(GetABCParam(abc, "K", "")),
        filename: filepath,
        abc:abc
      };

      let altTitle = AutoTrim(GetABCParam(abc, "T", "", 2));
      if(altTitle != "")
      {
        obj.altTitle = altTitle;
      }

      //parse out tune details
      resolve(obj);
    });
  });
};

function GetAllTunes(dir)
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
            GetAllTunes(fullpath).then((rectunes) => {
              tunes = tunes.concat(rectunes);
            })
          );
        }
        else
        {
          tunes.push(fullpath);
        }
      });

      Promise.all(tunespromises).then(() => {
        resolve(tunes);
      });
    });
  });
}

function ParseDirectoryRecursvie(dir)
{
  return new Promise(function(resolve, reject) {
    GetAllTunes(dir).then((tunes) => {
      let tuneobjs = [];
      let tunespromises = [];

      tunes.forEach(function(tune) {
        tunespromises.push(
          ParseTune(tune).then((tuneobj) => {
            if(tuneobj != null)
            {
              delete tuneobj.abc;
              delete tuneobj.key;

              tuneobjs.push(tuneobj);
            }
          })
        );
      });


      Promise.all(tunespromises).then(() => {
        resolve(tuneobjs);
      });
    });
  });
}


function RenderTunes(tunes)
{
  return new Promise(function(resolve, reject) {
    let renders = 1;
    tunes.forEach(function(tune) {
      let pdffile = tune.replace(".abc", ".pdf");
      let psfile = tune.replace(".abc", ".ps");
      let epsfile = tune.replace(".abc", ".eps");

      if(fs.existsSync(pdffile))
      {
        let stime = fs.statSync(tune).mtime;
        let dtime = fs.statSync(pdffile).mtime;

        if(dtime >= stime) return;
      }

      renders++;
      const abc_ps = exec('abcm2ps -O= -c --composerspace -0.65cm --pagescale 0.75 --staffscale 1.5 ' + tune);

      let output = "";
      abc_ps.stdout.on('data', (data) => {
        output += data.toString();
      });
      abc_ps.stderr.on('data', (data) => {
        output += data.toString();
      });

      abc_ps.on('exit', (code) => {
        if(code != 0)
        {
          console.log(output);
          return;
        }

        const ps_eps = exec('ps2eps -f ' + psfile);
        ps_eps.on('exit', (code) => {
          const eps_pdf = exec('epstopdf ' + epsfile);

          eps_pdf.on('exit', (code) => {
            renders--;
            if(renders == 0) resolve(tunes);
          });
        });
      });
    });

    renders--;
    if(renders == 0) resolve(tunes);
  });
}

// this function determines the order of tune types in the books
function TypeOrder(type)
{
  let order = [
    "jig",
    "slip jig",
    "reel",
    "rant",
    "american old-timey",
    "march",
    "polka",
    "hornpipe (not swung)",
    "hornpipe (swung)",
    "hornpipe (3/2)",
    "schottische",
    "strathspey",
    "dance tune",
    "playford",
    "morris",
    "rag morris",
    "waltz",
    "o'carolan",
    "mazurka",
    "air",
    "ragtime"
  ];

  for(let i = 0; i < order.length; i++)
  {
    if(type == order[i])
    {
      return i;
    }
  }

  if(type == "miscellaneous") return 1000;

  return order.length + (type.charCodeAt(0) - 65);
}

function GetTunesFromFilter(tunes, filter, only)
{
  return new Promise(function(resolve, reject) {
    let out = [];
    let count = 1;
    let done = function()
    {
      out.sort(function(tune1, tune2) {
      });

      out.sort(function(tune1, tune2) {
        let typediff = TypeOrder(tune1.type.toLowerCase()) - TypeOrder(tune2.type.toLowerCase());
        let bardiff = tune1.bars - tune2.bars;

        if(typediff != 0) return typediff;
        else if(bardiff != 0) return bardiff;

        //return tune1.title.localeCompare(tune2.title);
        return 0;
      });

      resolve(out);
    }

    tunes.forEach(function(tunefilename) {
      if(only != undefined)
      {
        if(!only.includes(tunefilename.substr(11))) return;
        only.splice(only.indexOf(tunefilename.substr(11)), 1);
      }

      count++;
      ParseTune(tunefilename).then((tune) => {
        let result = eval(filter);
        tune.filename = tunefilename.substr(10);
        if(result === true)
        {
          out.push(tune);
        }

        count--;
        if(count == 0) done();
      });
    });

    if(only != undefined && only.length > 0)
      console.log("Failed to find: " + only);

    count--;
    if(count == 0) done();
  });
}

function GetAuthorsFromZ(zfield)
{
  let prefixes = ["ABC by ", "ABC  by ", "ABC transcription by ", "Transcribed to abc by "];
  prefixes.forEach(function(prefix) {
    if(zfield.startsWith(prefix))
    {
      zfield = zfield.substr(prefix.length);
    }
  });

  let authors = [];
  let breakcharacters = /&|and|,|\./gi
  let parts = zfield.split(breakcharacters);

  parts.forEach(function(part) {
    part = part.replace(/\(.+\)/gi, "");
    authors.push(part.trim());
  });

  return authors;
}

function GenerateTunebook(allTunes, book)
{
  fs.readFile(TUNEBOOK_TEMPLATE, (err, data) => {
    if(err)
    {
      console.log("Error opening file : " + err);
      resolve(null);
    }

    GetTunesFromFilter(allTunes, book.tunefilter, book.only).then((tunes) => {
      if(tunes.length == 0)
      {
        console.log("Tunebook " + book.name + " does not contain any tunes, skipping");
        return;
      }

      let tuneStr = "";
      let date = new Date(1990);
      let uniqueauthors = [];

      let curType = "";

      tunes.forEach(function(tune) {
        let tunepath = "builttunes/" + tune.filename;

        let mtime = fs.statSync(tunepath).mtime;
        if(date < mtime) date = mtime;

        let zfield = AutoTrim(GetABCParam(tune.abc, "Z", ""));
        let authors = GetAuthorsFromZ(zfield);

        authors.forEach(function(author) {
          if(author != "" && !uniqueauthors.includes(author))
          {
            uniqueauthors.push(author);
          }
        });

        if(curType != tune.type.toLowerCase())
        {
          curType = tune.type.toLowerCase();
          tuneStr += "\\subsection{" + tune.type + "}\n";
        }

        tuneStr += "\\tune{builttunes/" + tune.filename.substr(0, tune.filename.length - 4) + "}{" + tune.title + "}\n";

        if(tune.altTitle != undefined)
        {
          tuneStr += "\\index{" + tune.altTitle + "}\n"
        }
      });

      let tex = data + '';
      tex = tex.replace("%%{{TUNES}}%%", tuneStr);
      tex = tex.replace("%%{{TITLE}}%%", book.title.replace("\n", "\\\\ \\vspace{0.65cm}"));

      if(uniqueauthors.length > 0)
      {
        let authorsStr = "\\begin{itemize}";

        uniqueauthors.forEach(function(author) {
          author = author.replace("&", "\\&");
          authorsStr += "\\item " + author + "\n";
        });
        authorsStr += "\\end{itemize}\n";

        tex = tex.replace("%%{{AUTHORS}}%%", authorsStr);
      }

      let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      tex = tex.replace("%%{{DATE}}%%", date.getDate() + " " + months[date.getMonth()] + " " + date.getFullYear());

      tex = tex.replace("%%{{INDEX}}%%", book.showIndex != false ? "\\printindex" : "");

      fs.writeFileSync(book.name + ".tex", tex);

      const latex = exec('pdflatex -shell-escape -halt-on-error ' + book.name + ".tex");
      let output = "";
      latex.stdout.on('data', (data) => {
        output += data.toString();
      });
      latex.stderr.on('data', (data) => {
        output += data.toString();
      });

      latex.on('exit', (code) => {
        if(code == 0)
        {
          const index = exec('makeindex -s indexstyle.ist ' + book.name);
          index.on('exit', (code) => {
            const latex = exec('pdflatex -shell-escape ' + book.name + ".tex");

            latex.on('exit', (code) => {
              // Cleanup
              fs.unlink(book.name + ".tex");
              fs.unlink(book.name + ".log");
              fs.unlink(book.name + ".ind");
              fs.unlink(book.name + ".idx");
              fs.unlink(book.name + ".ilg");
              fs.unlink(book.name + ".aux");
              fs.unlink(book.name + ".toc");
            });
          });
        }
        else
        {
          console.log("Latex Error:");
          console.log(output);
        }
      });
    });
  });
}

function CopyTunesWithExensions(tunes)
{
  let buildfolder = "builttunes";

  if(!fs.existsSync(buildfolder))
  {
    fs.mkdirSync(buildfolder);
  }

  return new Promise(function(resolve, reject) {
    let streams = 1;
    let newtunes = [];

    tunes.forEach(function(tune) {
      let newpath = tune.replace("tunes/", buildfolder + "/");
      newpath = newpath.replace(/'|"|/gi, "");
      newpath = newpath.replace(" ", "_");

      // ensure it has a .abc extension
      if(newpath.includes("."))
      {
        if(newpath.substr(newpath.length - 4, 4) != ".abc")
        {
          newpath = newpath.substr(0, newpath.length - 4) + ".abc";
          console.log(newpath);
        }
      }
      else
      {
        newpath = newpath + ".abc";
      }

      newtunes.push(newpath);

      let stime = fs.statSync(tune).mtime;

      if(fs.existsSync(newpath))
      {
        let dtime = fs.statSync(newpath).mtime;

        if(dtime >= stime) return;
      }

      streams++;
      let ws = fs.createWriteStream(newpath);
      fs.createReadStream(tune).pipe(ws);
      ws.on('finish', () => {
        streams--;
        if(streams == 0) resolve(newtunes);
      });
    });

    streams--;
    if(streams == 0) resolve(newtunes);
  });

}


// *****************************************************
// *****************************************************
// *****************************************************


var GenBooks = false;

process.argv.forEach(function (val, index, array) {
  if(val.toLowerCase() == "--books")
  {
    GenBooks = true;
  }
});

if(GenBooks)
{
  console.log("Generate tunebook pdfs");
  let p = GetAllTunes("tunes");

  p.then((tunes) => {
    return CopyTunesWithExensions(tunes);
  }).then((tunes) => {
    return RenderTunes(tunes);
  }).then((tunes) => {
    fs.readdir("books", (err, files) => {
      files.forEach(function(file) {
        let book = JSON.parse(fs.readFileSync("books/" + file));
        console.log(book.name);
        GenerateTunebook(tunes, book);
      });
    });
  });
}
else
{
  console.log("Building tune database");
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
}
