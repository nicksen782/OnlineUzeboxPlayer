<?php
// This function will create the new contents of the iframe. It modifies files in RAM and then returns the modified file.

if ($_POST['o'] == 'loadGame')		{ loadGame(); 	exit(); }
if ($_POST['o'] == 'loadGameSD')		{ loadGameSD(); 	exit(); }
else{
  // Set defaults if values were not provided.
  if( !$game) { $game = "atomix.uze" ; $sd = "0"; loadGame($game, $sd); }
}

function loadGame(){
  // Get the parameters... via GET or via POST. Whichever.
  $game = $_POST['game'] ? $_POST['game'] : $_GET['game'] ;
  $sd = $_POST['sd'] ? $_POST['sd'] : $_GET['sd'] ;

  // Set defaults if values were not provided.
  if( !$game) { $game = "atomix.uze" ; }
  if( !$sd  ) { $sd   = "0" ; }

  $gamefiles = getGameFile( $game);
  liveEditEmu($gamefiles);
}

// ?game=XXX&sd=0

// if( !$_GET['game']) { $_GET['game'] = "atomix.uze" ; }
// if( !$_GET['sd']  ) { $_GET['sd']   = "0" ; }

// if     ( $_GET['sd'] == "0" ) { $gamefiles = getGameFile(    $_GET['game']); }
// else if( $_GET['sd'] == "1" ) { $gamefiles = getGameFileList($_GET['game']); }

function getGameFile($gamestring){
  // Clear stat cache.
  clearstatcache();
  $gamestring =basename($gamestring) ;

  // return array(
  // $file = file_get_contents("games_nosd/".$gamestring);

  return array(
    "newname"      => "".$gamestring,
    "fullfilepath" => "games_nonsd/".$gamestring,
  ) ;
return;
  // Navigate to start directory
  $directory = 'GamesPackaged/';
  chdir($directory);

  // Get file listing minus the '.' and '..'.
  $scanned_directory = array_values(array_diff(scandir($directory), array('..', '.')));

  // Gather only the directory names.
  $dirlist = array();
  for($i=0; $i<sizeof($scanned_directory); $i++){
    if( is_dir($directory.'/'.$scanned_directory[$i]) ){
      array_push($dirlist, $scanned_directory[$i]);
    }
  }
  echo json_encode(array('projectnames' => $dirlist), JSON_PRETTY_PRINT);
}

// print_r($gamefiles);

function liveEditEmu($gamefiles){
  $cuzebox_extra = file_get_contents("cuzebox_extra.js");

  // Comment out the auto-run part of the cuzebox.js file. Permanent.
  $cuzeboxjs = file_get_contents("APP_cuzebox/cuzebox.js");
  $replacestr1 = 'memoryInitializer="cuzebox.html.mem";';
  $newstr1     = 'memoryInitializer="APP_cuzebox/cuzebox.html.mem";';
  $cuzeboxjs = str_replace($replacestr1, $newstr1, $cuzeboxjs);

  // $replacestr1 = 'function runCaller(){if(!Module["calledRun"])run()';
  // $newstr1     = 'function runCaller(){/*if(!Module["calledRun"])run()*/';
  // $cuzeboxjs = str_replace($replacestr1, $newstr1, $cuzeboxjs);
  // file_put_contents("cuzebox.js", $cuzeboxjs);

  // Load, edit, send the cuzebox.html file.
  $cuzeboxhtml = file_get_contents("APP_cuzebox/cuzebox.html");

  $script0_tofind=
    "<script>

          (function() {
            var memoryInitializer = 'cuzebox.html.mem';
            if (typeof Module['locateFile'] === 'function') {
              memoryInitializer = Module['locateFile'](memoryInitializer);
            } else if (Module['memoryInitializerPrefixURL']) {
              memoryInitializer = Module['memoryInitializerPrefixURL'] + memoryInitializer;
            }
            var xhr = Module['memoryInitializerRequest'] = new XMLHttpRequest();
            xhr.open('GET', memoryInitializer, true);
            xhr.responseType = 'arraybuffer';
            xhr.send(null);
          })();

          var script = document.createElement('script');
          script.src = \"cuzebox.js\";
          document.body.appendChild(script);

</script>";
  $script0_toreplace=
  "
  <!-- cuzebox.js-->
  <script>
  ".$cuzeboxjs."
  </script>

  <!-- Cuzebox Extra-->
  <script>
  ".$cuzebox_extra."
  </script>

  <!-- Setup the filesystem-->
  <script>
    var filelist=(".json_encode(array($gamefiles), JSON_PRETTY_PRINT).");
    var currentgame='".$gamefiles['fullfilepath']."';
    //Module['preInit'] = extras_preInit(filelist) ;
    Module['preRun'] = extras_preInit(filelist) ;
    Module['postRun'] = extras_postRun(currentgame);
    Module.arguments.push('".$gamefiles['newname']."');
  </script>


  <!-- mem stuff-->
  <script>
  window.onload=function(){
    (function() {
      var memoryInitializer = 'APP_cuzebox/cuzebox.html.mem';
      if (typeof Module['locateFile'] === 'function') {
        memoryInitializer = Module['locateFile'](memoryInitializer);
      } else if (Module['memoryInitializerPrefixURL']) {
        memoryInitializer = Module['memoryInitializerPrefixURL'] + memoryInitializer;
      }
      var xhr = Module['memoryInitializerRequest'] = new XMLHttpRequest();
      xhr.open('GET', memoryInitializer, true);
      xhr.responseType = 'arraybuffer';
      xhr.send(null);
    })();
  };
  </script>

  "
  ;

  $cuzeboxhtml = str_replace($script0_tofind, $script0_toreplace, $cuzeboxhtml);

  // I do not like all messages being output to the dev console. Remove this feature.
  $annoyingCon1   = "            console.log(text);";
  $noannoyingCon1 = "//console.log(text);";
  $cuzeboxhtml = str_replace($annoyingCon1, $noannoyingCon1, $cuzeboxhtml);

  $annoyingCon1   = "            console.log(text);";
  $noannoyingCon1 = "//console.log(text);";
  $cuzeboxhtml = str_replace($annoyingCon1, $noannoyingCon1, $cuzeboxhtml);


  // Send the modified page.
  echo $cuzeboxhtml;


  // Read in the list of roms.
  // $string = file_get_contents("listofroms.json");
  // $listofroms = json_decode($string, true);
  // print_r($listofroms);
  // Get the index of the array. Match the title key of each array dimension.
  // function searchArray($key, $st, $array) { foreach ($array as $k => $v) { if ($v[$key] === $st) { return $k; }} return null; }
  // $gameNameMatch = searchArray('title', $_GET['game'], $listofroms);

  // // Only continue if there was a match. The !==NULL part will allow for a returned value of 0.
  // 	// echo "ya " . $_GET['game'] . ' ' . $gameNameMatch. ' ' . $listofroms[$gameNameMatch]['jsfile'] . ' ' . "";
  // if($gameNameMatch !== NULL) {
  // 	// echo " good news everyone! " . ' ' . $gameNameMatch . ' <<';
  // 	file_put_contents("error.txt", "SUCCESS: this was returned: ".$gameNameMatch." <<<< " . $_GET['game'] . " " . time());
  // 	$_GET['game'] = $listofroms[$gameNameMatch]['title'];
  // 	$jsfile = $listofroms[$gameNameMatch]['jsfile'];
  // }
  // else {
  // 	// We should load a default game. A small game.
  // 	// echo "$gameNameMatch alert('A valid game has not been selected yet. A default game will load. You can change your game with the select menu at the upper-left.');";
  // 	file_put_contents("error.txt", "ERROR: this was returned: ".$gameNameMatch." <<<< " . $_GET['game'] . " " . time());
  // 	$gameNameMatch = 10;
  // 	$_GET['game'] = $listofroms[$gameNameMatch]['title'];
  // 	$jsfile = $listofroms[$gameNameMatch]['jsfile'];
  // }

  // Replace part of the file.

  // Output the modified file.
  // echo 'Location: cuzebox.php/?game='.$listofroms[$gameNameMatch]["title"];
  // echo $jsfile;
  // header('Location: cuzebox.php');
  // REPLACEMEWITHTHECORRECTSTRING

  // $replacestr1 = "'REPLACEMEWITHTHECORRECTSTRING'";
  // $newstr1     = "'".$jsfile."'";
  // $emuMOD = str_replace($replacestr1, $newstr1, $emu);
  // echo json_encode(array($emuMOD));
  // header('Location: cuzebox.php/?game='.$listofroms[$gameNameMatch]["title"]);
  // header('Location: GamesPackaged/');
  // chdir("GamesPackaged/");
  // echo $emuMOD;
  // file_put_contents("test.html", $emuMOD);
}
?>