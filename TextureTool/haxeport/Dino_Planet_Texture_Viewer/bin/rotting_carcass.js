// TEMP!
// old codebase must be elliminated [almost] entirely
(function($export){
		// exported files
		var filesout = new JSZip();
		function saveData(name) {
			filesout.generateAsync({type:"blob"}).then(function (blob) {
				saveAs(blob, name + ".zip");
			});
		}
		// boring HTML5 set-up
		var scrn = document.getElementById("screen");
		scrn.width = 800;
		scrn.height = 608;
		var ctx = scrn.getContext("2d");
		// access file inputs
		var filein = document.getElementById("thefile");
		var filein2 = document.getElementById("thefile2");
		var filein3 = document.getElementById("thefile3");
		// selection GUI (needs work!)
		var menu = document.getElementById("navbar");
		var currTex = 0;
		
		function generateMenuItem(ord) {
			// 11/3/2022 11:06 AM MST : moved to Main.generateMenuItem()
		}
		
		function initMenu() { // 3651, todo : not hard-code this
			// 11/2/2022 7:00 PM MST : moved to Main.initMenu()
		}
		
		// used for callback
		var filesTotal = 3;
		var filesLoaded = 0;
		
		// remnant of previous codebase
		var ROM = {
			/*tex : {},
			tab : {},*/ // 9/11/2022 3:45 PM MST : replaced by framework.codec.BinPack
			bin : {},
			manifest : {}
		}
		
		//var manifest_txt = document.getElementById("manifest-txt");
		var name_txt = document.getElementById("name-txt");
		var tags_txt = document.getElementById("tags-txt");
		var path_txt = document.getElementById("path-txt");
		
		// callback function triggered when .tab , .bin, and manifest are loaded
		function onFileLoaded() {
			// 11/2/2022 ??? MST : moved to Main.onFileLoaded()
		}
		
		// 10/25/2022 3:52 PM MST : hacked-in, refactor pending
		var isTex0 = false;
		
		// loads the .bin and .tab
		function loadFile() {
			if(filein.files.length > 0 && filein2.files.length > 0 && filein3.files.length > 0) {
				var file_texbin = filein.files[0];
				var file_textab = filein2.files[0];
				var file_texmf = filein3.files[0];
				var fr_tex = new FileReader(file_texbin);
				var fr_tab = new FileReader(file_textab);
				var fr_mf = new FileReader(file_texmf);
				//console.log(file_texbin);
				if (file_texbin.name == "TEX0.bin") { // 10/25/2022 3:53 PM MST : hacked-in, refactor pending
					isTex0 = true;
				} else {
					isTex0 = false;
				}
				
				fr_tex.onload = function() {
				//	var data = new DataStream(this.result,0,false);
				//	ROM["tex"] = data;
				//	ROM.tex.position = 0;
					var arr = createByteArray(new Uint8Array(this.result));
					ROM.bin.loadData(arr);
					$export.onFileLoaded(); // 11/2/2022 7:20 PM MST : hacked to use Main.onFileLoaded()
				}
				fr_tab.onload = function() {
				//	var data = new DataStream(this.result,0,false);
				//	ROM["tab"] = data;
				//	ROM.tab.position = 0;
					var arr = createByteArray(new Uint8Array(this.result));
					ROM.bin.loadOffsets(arr);
					$export.onFileLoaded();
				}
				fr_mf.onload = function() {
					ROM["manifest"] = JSON.parse(this.result);
					$export.onFileLoaded();
				}
				fr_tex.readAsArrayBuffer(file_texbin);
				fr_tab.readAsArrayBuffer(file_textab);
				fr_mf.readAsText(file_texmf);
			}
		}
		
		// retrieves a single .tab entry based on its ordinal (order in the .bin)
		function getTabEntry(ord) {
			// 9/10/2022 : 4:14 PM MST : replaced by framework.codec.BinPack.getItem()
		}
		
		function importManifest() {
			// ROM.manifest = JSON.parse(manifest_txt.value);
		}
		
		function exportManifest() {
			var blob = new Blob([JSON.stringify(ROM.manifest)], {type: "text/plain;charset=utf-8"});
			saveAs(blob, "manifest.json");
		}
		
		function displayTextureInfo(num) {
			// 11/3/2022 12:59 PM MST : moved to Main.displayTextureInfo()
		}
		
		// 10/20/2022 12:09 PM MST : hacked-in, refactor pending
		function getOVR(id) {
			if (!isTex0) { // 10/25/2022 3:54 PM MST : hacked-in, refactor pending
				return {width:0,height:0,format:-1,noSwizzle:false,forceOpacity:false};
			}
			for (var i=0; i < TEXOVR.overrides.length; i++) {
				var curr = TEXOVR.overrides[i];
				if (curr.id == id) {
					console.log("overrides for TEX # " + id + " : " + JSON.stringify(curr));
					return curr;
				}
			}
			return {width:0,height:0,format:-1,noSwizzle:false,forceOpacity:false};
		}
		
		function findCriticalErrors() {
			// 9/11/2022 3:47 PM MST : removed, no longer needed
		}
		
		function dumpAllTextureInfo() {
			// 9/11/2022 3:48 PM MST : removed, no longer needed
		}
		
		// both dedicated UI functions here!
		function advanceTexture() {
			// 11/3/2022 12:20 PM MST : moved to Main.advanceTexture() , Main.rewindTexture()
		}
		function rewindTexture() {}
		
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
		
	function drawTexture(x,y,texture,forceOpacity) {
		// 9/9/2022 3:03 PM MST : moved to Main.drawTexture
	}
		
	function drawImageData(iDat,x,y,scale) {
		// 9/9/2022 3:36 PM MST : moved to Main.drawImageData
	}

	function drawPalette(p) {
		// 9/9/2022 : 4:00 PM MST : moved to Main.drawPalette
	}

	function hexa(n) {
		// 9/9/2022 3:45 PM MST : moved to Main.hexa
	}
	
	// 11/2/2022 7:20 PM MST : hacked-in
	// update internal variable via haxe
	function setCurrTex(num) {
		currTex = num;
	}
	
	// 11/3/2022 11:06 AM MST : hacked-in
	// read internal variable via haxe
	function getCurrTex() {
		return currTex;
	}

function updateEntry(num,name,tags,path) {
		ROM.manifest.textures[num].name = name;
		ROM.manifest.textures[num].tags = tags.split(",");
		ROM.manifest.textures[num].path = path;
		// how to de-couple this...
		var menuName = document.getElementById("texName_" + num);
		menuName.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;" + name_txt.value;
	}
		
		//$export.saveData = saveData;
		//$export.generateMenuItem = generateMenuItem;
		// $export.initMenu = initMenu;
		$export.loadFile = loadFile;
		//$export.getTabEntry = getTabEntry;
		$export.importManifest = importManifest;
		$export.exportManifest = exportManifest;
		// $export.displayTextureInfo = displayTextureInfo;
		$export.logError = logError;
		$export.ROM = ROM;
		//$export.rewindTexture = rewindTexture;
		//$export.advanceTexture = advanceTexture;
		$export.ctx = ctx;
		$export.scrn = scrn;
		$export.setCurrTex = setCurrTex;
		$export.updateEntry = updateEntry;
		$export.getCurrTex = getCurrTex;
		$export.getOVR = getOVR;
})(this);