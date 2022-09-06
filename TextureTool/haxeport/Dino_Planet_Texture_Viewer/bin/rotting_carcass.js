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
		
		function generateMenuItem(ord) {
			/*
			<div class="navEntry" onclick="alert('hi there')">
					<img width="32" height="32" class="texPreview" src="default_icon.png"/><h3 class="texName">&nbsp;&nbsp;&nbsp;&nbsp;a texture</h3>
				</div>
			*/
			//console.log(ord);
			var entryButton = document.createElement("div");
			entryButton.setAttribute("class","navEntry");
			entryButton.onclick = function() {
				var tName = name_txt.value;
				var tTags = tags_txt.value;
				var tPath = path_txt.value;
				updateEntry(currTex,tName,tTags,tPath);
				currTex = ord;
				displayTextureInfo(ord);
			}
			var entryIcon = new Image();
			entryIcon.width = 32;
			entryIcon.height = 32;
			entryIcon.src = "default_icon.png";
			entryIcon.setAttribute("class","texPreview");
			var entryName = document.createElement("h3");
			var tInfo = ROM.manifest.textures[ord];
			//console.log(tInfo);
			entryName.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;" + tInfo.name;
			entryButton.appendChild(entryIcon);
			entryName.setAttribute("class","texName");
			entryName.setAttribute("id","texName_" + ord);
			entryButton.appendChild(entryName);
			menu.appendChild(entryButton);
		}
		
		function initMenu() { // 3651, todo : not hard-code this
			for (var i=0; i < 3651; i++) {
				generateMenuItem(i);
			}
		}
		
		// used for callback
		var filesTotal = 3;
		var filesLoaded = 0;
		
		// remnant of previous codebase
		// TODO : create object/"class" for tex/bin pairs... 
		var ROM = {
			tex : {},
			tab : {},
			manifest : {}
		}
		
		//var manifest_txt = document.getElementById("manifest-txt");
		var name_txt = document.getElementById("name-txt");
		var tags_txt = document.getElementById("tags-txt");
		var path_txt = document.getElementById("path-txt");
		
		// callback function triggered when both .tab and .bin are loaded
		function onFileLoaded() {
			filesLoaded++;
			if (filesLoaded < filesTotal) {
				return;
			}
			// this code generates a fresh manifest
			//parseTab();
			// this code reads entire .bin and lists/extracts ALL textures
			//startloop();
			//createManifest("TEX0","Dinosaur Planet : 2001 developer test build[?] - UI and Particle");
			initMenu();
			currTex = 713;
			displayTextureInfo(currTex);
		}
		
		// loads the .bin and .tab
		function loadFile() {
			if(filein.files.length > 0 && filein2.files.length > 0 && filein3.files.length > 0) {
				var file_texbin = filein.files[0];
				var file_textab = filein2.files[0];
				var file_texmf = filein3.files[0];
				var fr_tex = new FileReader(file_texbin);
				var fr_tab = new FileReader(file_textab);
				var fr_mf = new FileReader(file_texmf);
				
				fr_tex.onload = function() {
					var data = new DataStream(this.result,0,false);
					ROM["tex"] = data;
					onFileLoaded();
				}
				fr_tab.onload = function() {
					var data = new DataStream(this.result,0,false);
					ROM["tab"] = data;
					onFileLoaded();
					
				}
				fr_mf.onload = function() {
					ROM["manifest"] = JSON.parse(this.result);
					onFileLoaded();
				}
				fr_tex.readAsArrayBuffer(file_texbin);
				fr_tab.readAsArrayBuffer(file_textab);
				fr_mf.readAsText(file_texmf);
			}
		}
		
		// retrieves a single .tab entry based on its ordinal (order in the .bin)
		function getTabEntry(ord) {
			/* 
				TODO : 
					EOF
			*/
			
			// need to be more consistent/careful with accessing and manipulating these DataStreams
			// errors still occur...
			var bytes = ROM.tab;
			ROM.tab.position = (ord * 4);
			var ofs = bytes.readUint32();
			var endOfs = bytes.readUint32();
			var size = (endOfs & 0x00ffffff) - (ofs & 0x00ffffff);
			var numSubTextures = (ofs & 0xff000000) >> 24;
			var realOfs = ofs & 0x00ffffff;
			var out = {ofs:realOfs,size:size,count:numSubTextures,frames:[]}
			if (numSubTextures > 1) {
				var bytes2 = ROM.tex;
				bytes2.position = realOfs;
				// frame offset table
				var table = bytes2.readUint32Array((numSubTextures + 1) * 2);
				
				for (var i=0; i < numSubTextures; i++) {
					var ofs1 = table[i * 2];
					var ofs2 = table[(i + 1) * 2];
					var sizeComp = ofs2 - ofs1;
					//console.log(ofs1.toString(16) , ofs2.toString(16));
					out.frames.push({ofs:ofs1 + realOfs,size:sizeComp});
				}
			}
			return out; 
		}
		
		function importManifest() {
			// ROM.manifest = JSON.parse(manifest_txt.value);
		}
		
		function exportManifest() {
			var blob = new Blob([JSON.stringify(ROM.manifest)], {type: "text/plain;charset=utf-8"});
			saveAs(blob, "manifest.json");
		}
		
		function displayTextureInfo(num) {
			if (num > 3651 || num < 0) {
				num = 0;
			}
			var tInfo = ROM.manifest.textures[num];
			name_txt.value = tInfo.name;
			tags_txt.value = tInfo.tags.join(",");
			path_txt.value = tInfo.path;
			
			ctx.fillStyle = "#000000";
			ctx.fillRect(0,0,scrn.width,scrn.height);
			var t = getTabEntry(num);
			if (t.count > 1) {
				console.log(num,JSON.stringify(t));
				var posX = 0;
				var posY = 0;
				for (var i=0; i < t.count; i++) {
					var t2 = t.frames[i];
					//var tx = parseTexture(t2.ofs,t2.size,i,num);
					ROM.tex.position = t2.ofs;
					var arr = createByteArray(ROM.tex.readUint8Array(t2.size));
					var tx = parseTexture(arr,t2.size,{width:0,height:0,format:-1,noSwizzle:false,forceOpacity:false});
					if (tx.format > -1) {
						drawTexture(posX,posY,tx,true);
						posY += tx.height + 8;
						if (posY >= scrn.height - (tx.height + 8)) {
							posY = 0;
							posX += tx.width + 8;
						}
					}
				}
			} else {
				ROM.tex.position = t.ofs;
				var arr = createByteArray(ROM.tex.readUint8Array(t.size));
				var tx = parseTexture(arr,t.size,{width:0,height:0,format:-1,noSwizzle:false,forceOpacity:false});
				//console.log(dumpTextureInfo(t.ofs,t.size,0,num));
				if (tx.format > -1) {
					drawTexture(0,0,tx,false);
				}
			}
		}
		
		function findCriticalErrors() {
			var theShitLoad = "";
			
			for (var num = 0; num < 3652; num++) {
				var t = getTabEntry(num);
				if (t.count > 1) {
					for (var i=0; i < t.count; i++) {
						var t2 = t.frames[i];
						try {
							var t2 = t.frames[i];
							var tx = parseTexture(t2.ofs,t2.size,i,num);
						} catch(err) {
							theShitLoad += "tex # " + num + "_" + i + "\n";
							theShitLoad += err.message + "\n";
							theShitLoad += err.stack + "\n";
							theShitLoad += dumpTextureInfo(t2.ofs,t2.size,0,num + "_" + i);
							theShitLoad += "\n\n\n";
						}
					}
				} else {
					try {
						var tx = parseTexture(t.ofs,t.size,i,num);
					} catch(err) {
						theShitLoad += "tex # " + num + "\n";
						theShitLoad += err.message + "\n";
						theShitLoad += err.stack + "\n";
						theShitLoad += dumpTextureInfo(t.ofs,t.size,0,num);
						theShitLoad += "\n\n\n";
					}
				}
			}
			
			var blob = new Blob([theShitLoad], {type: "text/plain;charset=utf-8"});
			saveAs(blob, "error.txt");
		}
		
		function dumpAllTextureInfo() {
			var theShitLoad = "";
			
			for (var num = 0; num < ROM.manifest.textures.length; num++) {
				var t = getTabEntry(num);
				if (t.count > 1) {
					for (var i=0; i < t.count; i++) {
						var t2 = t.frames[i];
						theShitLoad += "\n\n\n" + dumpTextureInfo(t2.ofs,t2.size,0,num + "_" + i);
					}
				} else {
					theShitLoad += "\n\n\n" + dumpTextureInfo(t.ofs,t.size,0,num);
				}
			}
			
			var blob = new Blob([theShitLoad], {type: "text/plain;charset=utf-8"});
			saveAs(blob, "dump.txt");
		}
		
		// both dedicated UI functions here!
		function advanceTexture() {
			var tName = name_txt.value;
			var tTags = tags_txt.value;
			var tPath = path_txt.value;
			updateEntry(currTex,tName,tTags,tPath);
			currTex += 1;
			displayTextureInfo(currTex);
		}
		
		function rewindTexture() {
			var tName = name_txt.value;
			var tTags = tags_txt.value;
			var tPath = path_txt.value;
			updateEntry(currTex,tName,tTags,tPath);
			currTex -= 1;
			displayTextureInfo(currTex);
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
		
				function drawTexture(x,y,texture,forceOpacity) {
			var turtle = new ImageData(texture.width,texture.height);
			var size = texture.width * texture.height;
			var pal = texture.palette;
			var f = texture.format;
			console.log(f);
			if (f == 23 || f == 7) { // CI formats have a palette
				/* 
					it made more sense to create two copies of this loop than do an extra if statement on every iteration
					does it matter much? probably not
				*/
				if(forceOpacity) {
					for (var i=0; i < size; i++) {
						var base = i * 4;
						var basePal = texture.pixels[i] * 4;
						turtle.data[base + 0] = texture.palette[basePal + 0];
						turtle.data[base + 1] = texture.palette[basePal + 1];
						turtle.data[base + 2] = texture.palette[basePal + 2];
						turtle.data[base + 3] = 255;
					}
				} else {
					for (var i=0; i < size; i++) {
						var base = i * 4;
						var basePal = texture.pixels[i] * 4;
						turtle.data[base + 0] = texture.palette[basePal + 0];
						turtle.data[base + 1] = texture.palette[basePal + 1];
						turtle.data[base + 2] = texture.palette[basePal + 2];
						turtle.data[base + 3] = texture.palette[basePal + 3];
					}
				}
			} else if (f == 1 || f == 0 || f == 17 || f == 2 || f == 5 || f == 6 || f == 4 || f == 3) { // other formats are raw pixels
				if(forceOpacity) {
					for (var i=0; i < size; i++) {
						var base = i * 4;
						turtle.data[base + 0] = texture.pixels[base + 0];
						turtle.data[base + 1] = texture.pixels[base + 1];
						turtle.data[base + 2] = texture.pixels[base + 2];
						turtle.data[base + 3] = 255;
					}
				} else {
					for (var i=0; i < size; i++) {
						var base = i * 4;
						turtle.data[base + 0] = texture.pixels[base + 0];
						turtle.data[base + 1] = texture.pixels[base + 1];
						turtle.data[base + 2] = texture.pixels[base + 2];
						turtle.data[base + 3] = texture.pixels[base + 3];
					}
				}
			}
			//console.log(turtle);
			//ctx.putImageData(turtle,x,y);
			drawImageData(turtle,x,y,1);
		}
		
		function drawImageData(iDat,x,y,scale) {
	var posX = x;
	var posY = y;
	var posP = 0;
	var arrP = iDat.data;
	// console.log(iDat);
	for (var iY = 0; iY < iDat.height; iY++) {
		for (var iX = 0; iX < iDat.width; iX++) {
			var base = posP * 4;
			var r = arrP[base];
			var g = arrP[base + 1];
			var b = arrP[base + 2];
			var a = arrP[base + 3];
			ctx.fillStyle = "#" + hexa(r) + hexa(g) + hexa(b) + hexa(a);
			ctx.fillRect(posX,posY,scale,scale);
			posX += scale;
			posP++;
		}
		posY += scale;
		posX = x;
	}
}

function drawPalette(p) {
			var w = scrn.width;
			var h = scrn.height;
			//console.log(w, h);
			var baseX = w - (4 * 16);
			var posX = baseX;
			var posY = 0;
			for (var i=0; i < 16; i++) {
				if (i > 0 && !(i % 4)) {
					posX = baseX;
					posY += 16;
				}
				var base = i * 4;
				var r = p[base];
				var g = p[base + 1];
				var b = p[base + 2];
				/*
					strict format expectations, what a pain in the ass!
					r,g,b as ints, a as a float
					comma, SPACE between each entry (yes, this matters...)
				*/
				var col = "rgba(" + [Math.floor(r),Math.floor(g),Math.floor(b)].join(", ") + ", 1)";
				//console.log(col);
				//console.log(posX,posY);
				ctx.fillStyle = col;
				ctx.fillRect(posX,posY,16,16);
				posX += 16;
			}
		}

function hexa(n) {
	if (n < 16) {
		return "0" + n.toString(16);
	}
	return n.toString(16);
}

function updateEntry(num,name,tags,path) {
		ROM.manifest.textures[num].name = name;
		ROM.manifest.textures[num].tags = tags.split(",");
		ROM.manifest.textures[num].path = path;
		// can this be de-coupled?
		var menuName = document.getElementById("texName_" + num);
		menuName.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;" + name_txt.value;
	}
		
		//$export.saveData = saveData;
		$export.generateMenuItem = generateMenuItem;
		$export.initMenu = initMenu;
		$export.loadFile = loadFile;
		$export.getTabEntry = getTabEntry;
		$export.importManifest = importManifest;
		$export.exportManifest = exportManifest;
		$export.displayTextureInfo = displayTextureInfo;
		$export.logError = logError;
		$export.ROM = ROM;
		$export.rewindTexture = rewindTexture;
		$export.advanceTexture = advanceTexture;
		// $export.drawTexture = drawTexture; // don't need to do this...
		
})(this);