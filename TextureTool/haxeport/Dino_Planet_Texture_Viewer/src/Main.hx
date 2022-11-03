package;
import framework.EditorState;
import haxe.io.Bytes;
import framework.codec.Texture;
import js.html.Element;
import js.html.InputElement;
// import haxe.crypto.Md5;
// import framework.codec.Qoi;
import haxe.io.UInt8Array;
import haxe.io.UInt16Array;
import haxe.io.UInt32Array;
import js.Syntax;
import js.html.ImageData;
import framework.ByteThingyWhatToNameIt;
import framework.codec.BinPack;
import js.Browser.document;
import js.html.Image;

class Main 
{
	static public var filesTotal = 3;
	static public var filesLoaded = 0;
	static public var menu:Element = document.getElementById("navbar");
	static public var name_txt:InputElement = cast document.getElementById("name-txt");
	static public var tags_txt:InputElement = cast document.getElementById("tags-txt");
	static public var path_txt:InputElement = cast document.getElementById("path-txt");
	static public var ROM:EditorState;
	
	static function main() {
		// ugly hax enable old "Main()" code to be used, for now...
		ROM = new EditorState(); // can't use this yet...
		Syntax.code("window.parseTexture = {0}",Texture.decodeTexture);
		Syntax.code("window.createByteArray = function(src) {var buf = {0}(src.length);var arr = new {1}(buf,false);arr.writeUint8Array(src);arr.position = 0;return arr;}", Bytes.alloc, ByteThingyWhatToNameIt);
		Syntax.code("window.drawTexture = {0}", drawTexture);
		Syntax.code("window.ROM.bin = new {0}()", BinPack);
		Syntax.code("window.onFileLoaded = {0}", onFileLoaded);
		Syntax.code("window.advanceTexture = {0}", advanceTexture);
		Syntax.code("window.rewindTexture = {0}", rewindTexture);
		Syntax.code("window.displayTextureInfo = {0}", displayTextureInfo);
	}
	
	static function initMenu() {
		// todo : not hard-code this
		for (i in 0...3651) {
			generateMenuItem(i);
		}
	}
	
	static public function onFileLoaded() {
		filesLoaded++;
		if (filesLoaded < filesTotal) {
			return;
		}
		// TODO : cleanup
		// this code generates a fresh manifest
		//parseTab();
		// this code reads entire .bin and lists/extracts ALL textures
		//startloop();
		//createManifest("TEX0","Dinosaur Planet : 2001 developer test build[?] - UI and Particle");
		initMenu();
		var currTex:Int = 713;
		Syntax.code("window.setCurrTex({0})", currTex);
		displayTextureInfo(currTex);
	}
	
	// how ? 
	// TODO!
	/*static public function onBtnClick() {
		var tName = name_txt.value;
		var tTags = tags_txt.value;
		var tPath = path_txt.value;
		updateEntry(currTex,tName,tTags,tPath);
		currTex = ord;
		displayTextureInfo(ord);
	}*/
	
	static function generateMenuItem(ord:Int) {
			/*
			<div class="navEntry" onclick="alert('hi there')">
					<img width="32" height="32" class="texPreview" src="default_icon.png"/><h3 class="texName">&nbsp;&nbsp;&nbsp;&nbsp;a texture</h3>
				</div>
			*/
			//console.log(ord);
			var entryButton = document.createElement("div");
			entryButton.setAttribute("class","navEntry");
			entryButton.onclick = Syntax.code("function() {var tName = {0}.value; var tTags = {1}.value;var tPath = {2}.value;window.updateEntry(window.getCurrTex(),tName,tTags,tPath);window.setCurrTex(ord);window.displayTextureInfo(ord);}",name_txt,tags_txt,path_txt);
			var entryIcon = new Image();
			entryIcon.width = 32;
			entryIcon.height = 32;
			entryIcon.src = "default_icon.png";
			entryIcon.setAttribute("class","texPreview");
			var entryName = document.createElement("h3");
			var tInfo = Syntax.code("window.ROM.manifest.textures[ord]");
			//console.log(tInfo);
			entryName.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;" + tInfo.name;
			entryButton.appendChild(entryIcon);
			entryName.setAttribute("class","texName");
			entryName.setAttribute("id","texName_" + ord);
			entryButton.appendChild(entryName);
			menu.appendChild(entryButton);
		}
	
	static function drawTexture(x:Int,y:Int,texture:TDinoPlanetTexture,forceOpacity:Bool) : Void {
		var turtle:ImageData = new ImageData(texture.width,texture.height);
		var size:Int = texture.width * texture.height;
		var pal:UInt8Array = texture.palette;
		var f:Int = texture.format;
		//Syntax.code("console.log(\"testing call of drawTexture!\")");
		if (f == 23 || f == 7) { // CI formats only
			/* 
				it made more sense to create two copies of this loop than do an extra if statement on every iteration
				does it matter much? probably not
			*/
			if (forceOpacity) {
				for (i in 0...size) {
					var base:Int = i * 4;
					var basePal:Int = texture.pixels[i] * 4;
					turtle.data[base + 0] = texture.palette[basePal + 0];
					turtle.data[base + 1] = texture.palette[basePal + 1];
					turtle.data[base + 2] = texture.palette[basePal + 2];
					turtle.data[base + 3] = 255;
				}
			} else {
				for (i in 0...size) {
					var base:Int = i * 4;
					var basePal:Int = texture.pixels[i] * 4;
					turtle.data[base + 0] = texture.palette[basePal + 0];
					turtle.data[base + 1] = texture.palette[basePal + 1];
					turtle.data[base + 2] = texture.palette[basePal + 2];
					turtle.data[base + 3] = texture.palette[basePal + 3];
				}
			}
			drawPallete(texture.palette);
		} else if (f == 1 || f == 0 || f == 17 || f == 2 || f == 5 || f == 6 || f == 4 || f == 3) { // other formats are raw pixels
			if (forceOpacity) {
				for (i in 0...size) {
					var base:Int = i * 4;
					turtle.data[base + 0] = texture.pixels[base + 0];
					turtle.data[base + 1] = texture.pixels[base + 1];
					turtle.data[base + 2] = texture.pixels[base + 2];
					turtle.data[base + 3] = 255;
				}
			} else {
				for (i in 0...size) {
					var base:Int = i * 4;
					turtle.data[base + 0] = texture.pixels[base + 0];
					turtle.data[base + 1] = texture.pixels[base + 1];
					turtle.data[base + 2] = texture.pixels[base + 2];
					turtle.data[base + 3] = texture.pixels[base + 3];
				}
			}
		}
		drawImageData(turtle, x, y, 1);
	}
	
	static function drawImageData(iDat:ImageData,x:Int,y:Int,scale:Int) : Void {
		var posX:Int = x;
		var posY:Int = y;
		var posP:Int = 0;
		var arrP:UInt8Array = cast iDat.data;
		for (iY in 0...iDat.height) {
			for (iX in 0...iDat.width) {
				var base:Int = posP * 4;
				var r:String = hexa(arrP[base]); // todo : revert this to Ints
				var g:String = hexa(arrP[base + 1]);
				var b:String = hexa(arrP[base + 2]);
				var a:String = hexa(arrP[base + 3]);
				Syntax.code("ctx.fillStyle = \"#\" + r + g + b + a");
				Syntax.code("ctx.fillRect(posX,posY,scale,scale)");
				posX += scale;
				posP++;
			}
			posY += scale;
			posX = x;
		}
	}
	
	static function hexa(n:Int) : String {
		return StringTools.hex(n,2);
	}
	
	static function drawPallete(p:UInt8Array) {
		var w:Int = Syntax.code("scrn.width");
		var h:Int = Syntax.code("scrn.height");
		//console.log(w, h);
		var baseX = w - (4 * 16);
		var posX = baseX;
		var posY = 0;
		for (i in 0...16) {
			if (i > 0 && (i % 4 == 0)) {
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
			Syntax.code("ctx.fillStyle = col");
			Syntax.code("ctx.fillRect(posX,posY,16,16)");
			posX += 16;
		}
	}
	
	// both dedicated UI functions here!
	public static function advanceTexture() {
		var tName:String = name_txt.value;
		var tTags:String = tags_txt.value;
		var tPath:String = path_txt.value;
		Syntax.code("window.updateEntry(window.getCurrTex(),tName,tTags,tPath)");
		Syntax.code("window.setCurrTex(window.getCurrTex() + 1)");
		displayTextureInfo(Syntax.code("window.getCurrTex()"));
	}
		
	public static function rewindTexture() {
		var tName:String = name_txt.value;
		var tTags:String = tags_txt.value;
		var tPath:String = path_txt.value;
		Syntax.code("window.updateEntry(window.getCurrTex(),tName,tTags,tPath)");
		Syntax.code("window.setCurrTex(window.getCurrTex() - 1)");
		displayTextureInfo(Syntax.code("window.getCurrTex()"));
	}
	
	static function displayTextureInfo(num) {
		if (num > 3651 || num < 0) { // still bad
			num = 0;
		}
		
		var tInfo:Dynamic = Syntax.code("window.ROM.manifest.textures[num]");
		name_txt.value = tInfo.name;
		tags_txt.value = tInfo.tags.join(",");
		path_txt.value = tInfo.path;
		
		Syntax.code("ctx.fillStyle = \"#000000\"");
		Syntax.code("ctx.fillRect(0,0,scrn.width,scrn.height)");
		
		var t = Syntax.code("window.ROM.bin.getItem(num)");
		if (t.resCount > 1) {
			var posX = 0;
			var posY = 0;
			for (i in 0...t.resCount) {
				var t2 = t.resources[i];
				Syntax.code("window.ROM.bin.data.position = t2.ofs");
				var arr:ByteThingyWhatToNameIt = Syntax.code("window.createByteArray(window.ROM.bin.data.readUint8Array(t2.size))");
				var ovr:TTextureFormatOverride = Syntax.code("window.getOVR(num)");
				
				var tx = Texture.decodeTexture(arr,t2.size,ovr);
				if (tx.format > -1) {
					drawTexture(posX,posY,tx,ovr.forceOpacity);
					posY += tx.height + 8;
					if (posY >= Syntax.code("scrn.height") - (tx.height + 8)) {
						posY = 0;
						posX += tx.width + 8;
					}
				}
			}
		} else {
			Syntax.code("ROM.bin.data.position = t.resources[0].ofs");
			var arr:ByteThingyWhatToNameIt = Syntax.code("window.createByteArray(window.ROM.bin.data.readUint8Array(t.resources[0].size))");
			var ovr:TTextureFormatOverride = Syntax.code("window.getOVR(num)");
			var tx = Texture.decodeTexture(arr,t.resources[0].size,ovr);
			//console.log(dumpTextureInfo(t.ofs,t.size,0,num));
			if (tx.format > -1) {
				drawTexture(0,0,tx,ovr.forceOpacity);
			}
		}
	}
}