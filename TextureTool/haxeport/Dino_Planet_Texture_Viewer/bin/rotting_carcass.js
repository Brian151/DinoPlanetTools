// TEMP!
// old codebase must be elliminated [almost] entirely
(function($export){
	// TODO : re-work 
	// exported files
	var filesout = new JSZip();
	function saveData(name) {
		filesout.generateAsync({type:"blob"}).then(function (blob) {
			saveAs(blob, name + ".zip");
		});
	}
	// make this look like the game's crash screen, cuz i can, and it looks cool!
	function logError(err) {
		// might import game font and render that, instead
		// i actually dislike sans-serif fonts for readability reasons
		ctx.font = "32px sans-serif";
		ctx.fillStyle = "#ffffff";
		// seems text draws from bottom to top, so y position needs to account for that
		ctx.fillText("ERROR!",0,32);
		ctx.fillStyle = "#00ff00";
		ctx.fillText("cause : " + err.cause,0,96);
		ctx.fillText(err.position,0,128);
		var pY = 192; // should probably declare this earlier
		ctx.fillStyle = "#00ffff";
		for (var i in err.message) {
			var curr = err.message[i];
			ctx.fillText(i + " : " + curr,0,pY);
			pY += 32;
		}
	}
	
	// TODO : migrate
	// boring HTML5 set-up
	var scrn = document.getElementById("screen");
	scrn.width = 800;
	scrn.height = 608;
	var ctx = scrn.getContext("2d");
	
	// migrated
	// var manifest_txt = document.getElementById("manifest-txt");
	// access file inputs
	/*var filein = document.getElementById("thefile");
	var filein2 = document.getElementById("thefile2");
	var filein3 = document.getElementById("thefile3");
	// selection GUI (needs work!)
	var menu = document.getElementById("navbar");*/
	function generateMenuItem(ord) {
		// 11/3/2022 11:06 AM MST : moved to Main.generateMenuItem()
		// > UI 11/25/2022
	}
	function initMenu() { // 3651, todo : not hard-code this
		// 11/2/2022 7:00 PM MST : moved to Main.initMenu()
		// > UI 11/25/2022
	}
	// used for callback
	/*var filesTotal = 3;
	var filesLoaded = 0;*/
	// callback function triggered when .tab , .bin, and manifest are loaded
	function onFileLoaded() {
		// 11/2/2022 ??? MST : moved to Main.onFileLoaded()
	}
	// 10/25/2022 3:52 PM MST : hacked-in, refactor pending
	// var isTex0 = false;
	// loads the .bin and .tab
	function loadFile() {
		// 11/7/2022 7:54 PM MST : replaced by Main.loadFile()
	}
	// retrieves a single .tab entry based on its ordinal (order in the .bin)
	function getTabEntry(ord) {
		// 9/10/2022 : 4:14 PM MST : replaced by framework.codec.BinPack.getItem()
	}
	function importManifest() {
		// ROM.manifest = JSON.parse(manifest_txt.value);
	}
	function displayTextureInfo(num) {
		// 11/3/2022 12:59 PM MST : moved to Main.displayTextureInfo()
		// > UI 11/25/2022
	}
	// both dedicated UI functions here!
	function advanceTexture() {
		// 11/3/2022 12:20 PM MST : moved to Main.advanceTexture() , Main.rewindTexture()
		// > UI 11/25/2022
	}
	function rewindTexture() {}
	function drawTexture(x,y,texture,forceOpacity) {
		// 9/9/2022 3:03 PM MST : moved to Main.drawTexture
		// > Graphics 11/9/2022
	}
	function drawImageData(iDat,x,y,scale) {
		// 9/9/2022 3:36 PM MST : moved to Main.drawImageData
		// > Graphics 11/9/2022
	}
	function drawPalette(p) {
		// 9/9/2022 : 4:00 PM MST : moved to Main.drawPalette
		// > Graphics 11/9/2022
	}
	function hexa(n) {
		// 9/9/2022 3:45 PM MST : moved to Main.hexa
		// > Util 11/25/2022
	}
	// 10/20/2022 12:09 PM MST : hacked-in, refactor pending
	function getOVR(id) {
		// 11/7/2022 7:54 MST : moved to Main.getOVR()
	}
	function updateEntry(num,name,tags,path) {
		// 11/9/2022 4:25 PM MST : moved to Main.updateEntry()
	}
	// remnant of previous codebase
	var ROM = { // 11/9/2022 4:25 PM : replaced by framework.EditorState
		/*tex : {},
		tab : {},*/ // 9/11/2022 3:45 PM MST : replaced by framework.codec.BinPack
		bin : {},
		manifest : {} // replaced by framework.ManifestDB
	}
	function exportManifest() {
		// moved to Main.exportManifest()
	}
	/*
	// 11/9/2022 4:45 PM MST : moved to framework.EdtorState.currTex
	var currTex = 0;
	// 11/2/2022 7:20 PM MST : hacked-in
	// update internal variable via haxe
	function setCurrTex(num) {
		currTex = num;
	}
	// 11/3/2022 11:06 AM MST : hacked-in
	// read internal variable via haxe
	function getCurrTex() {
		return currTex;
	}*/
	/*
	// moved to Main
	var name_txt = document.getElementById("name-txt");
	var tags_txt = document.getElementById("tags-txt");
	var path_txt = document.getElementById("path-txt");*/
	
	// exterminated
	function findCriticalErrors() {
		// 9/11/2022 3:47 PM MST : removed, no longer needed
	}	
	function dumpAllTextureInfo() {
		// 9/11/2022 3:48 PM MST : removed, no longer needed
	}
	function exportManifest() {
		// moved to Main.exportManifest()
	}
	
	// exports to global (window)
	// no longer required
	//$export.saveData = saveData;
	//$export.generateMenuItem = generateMenuItem;
	// $export.initMenu = initMenu;
	// $export.loadFile = loadFile;
	//$export.getTabEntry = getTabEntry;
	//$export.importManifest = importManifest;
	//$export.exportManifest = exportManifest;
	// $export.displayTextureInfo = displayTextureInfo;
	//$export.logError = logError;
	//$export.rewindTexture = rewindTexture;
	//$export.advanceTexture = advanceTexture;
	// $export.ROM = ROM;
	// $export.getOVR = getOVR;
	// $export.updateEntry = updateEntry;
	//$export.ctx = ctx;
	//$export.scrn = scrn;
	//$export.setCurrTex = setCurrTex;
	//$export.getCurrTex = getCurrTex;
	
})(this);