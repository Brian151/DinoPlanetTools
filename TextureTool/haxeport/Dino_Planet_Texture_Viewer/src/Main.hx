package;
import framework.EditorState;
import haxe.io.Bytes;
import framework.codec.Texture;
import js.html.Blob;
import js.html.Element;
import js.html.InputElement;
import js.html.FileReader;
import js.lib.ArrayBuffer;
import js.Syntax;
import framework.ByteThingyWhatToNameIt;
import framework.codec.BinPack;
import js.Browser.document;
import js.html.Image;
import js.lib.Uint8Array;
import haxe.Json;
import Graphics;

// all unused (now) but keep for reference
/*import haxe.io.UInt8Array;
import haxe.io.UInt16Array;
import haxe.io.UInt32Array;
import haxe.crypto.Md5;
import framework.codec.Qoi;*/

class Main 
{
	static public var filesTotal = 3;
	static public var filesLoaded = 0;
	static public var menu:Element = document.getElementById("navbar");
	static public var name_txt:InputElement = cast document.getElementById("name-txt");
	static public var tags_txt:InputElement = cast document.getElementById("tags-txt");
	static public var path_txt:InputElement = cast document.getElementById("path-txt");
	static public var filein:InputElement = cast document.getElementById("thefile");
	static public var filein2:InputElement = cast document.getElementById("thefile2");
	static public var filein3:InputElement = cast document.getElementById("thefile3");
	static public var ROM:EditorState;
	static var gfx:Graphics;
	
/*TODO : 
	generic manifest format
	ignore manifest file when loading [it's meta-data, NOT essential]
	remove overrides [texture format 100% ? how do the "Weird" ones work?]
	
	auto-link files to editorstate if matching names / formats ["tex0" + [".bin", ".tab", ".manifest"]]
	compare vanilla / modded packs
		load default manifest files + bins
	
	windows / linux builds [or at least haxe-neko]
		ifdefs for bits that just HAVE to use js.Syntax()
		non-web graphics system
	load from folders [almost certainly requires native build !]
	
	edit textures
		import / export textures
		load individual textures
		UI redesign
			editor UI
			better display of "array texture"
			render icon of actual texture
			re-scaling...
			use tags for searching
		project files
		pack bins
			encode textures
				texture format 100 %
				compression
			model texture references
				more tools ?
				export parts of the model "data"
					[de/en]code at least parts of the model "data" format" (aka opcodes)
				
	
	steal some assets (;
		debug font
		some menu elements
		"default icon" - x */
	
	// core funcs
	static function main() {
		ROM = new EditorState(); // can't use this yet...
		ROM.bin = new BinPack();
		gfx = new Graphics(cast document.getElementById("screen"));
		
		// for debugging with console
		Syntax.code("window.ROM = {0}", ROM);
		
		// glue code exports haxe funcs/vars to global (window)
		Syntax.code("window.advanceTexture = {0}", advanceTexture);
		Syntax.code("window.rewindTexture = {0}", rewindTexture);
		Syntax.code("window.displayTextureInfo = {0}", displayTextureInfo);
		Syntax.code("window.loadFile = {0}", loadFile);
		Syntax.code("window.exportManifest = {0}", exportManifest);
		Syntax.code("window.updateEntry = {0}", updateCurrentEntry);
	}
	static public function onFileLoaded() {
		filesLoaded++;
		if (filesLoaded < filesTotal) {
			return;
		}
		
		initMenu();
		ROM.currTex = 713;
		displayTextureInfo(ROM.currTex);
	}
	public static function loadFile() {
		if(filein.files.length > 0 && filein2.files.length > 0 && filein3.files.length > 0) {
			var file_texbin = filein.files[0];
			var file_textab = filein2.files[0];
			var file_texmf = filein3.files[0];
			var fr_tex = new FileReader();
			var fr_tab = new FileReader();
			var fr_mf = new FileReader();
			
			fr_tex.onload = function() {
				var arr:ByteThingyWhatToNameIt = createByteArray(fr_tex.result,false);
				ROM.bin.loadData(arr);
				onFileLoaded();
			}
			fr_tab.onload = function() {
				var arr:ByteThingyWhatToNameIt = createByteArray(fr_tab.result,false);
				ROM.bin.loadOffsets(arr);
				onFileLoaded();
			}
			fr_mf.onload = function() {
				ROM.manifest = Json.parse(fr_mf.result);
				onFileLoaded();
			}
			fr_tex.readAsArrayBuffer(file_texbin);
			fr_tab.readAsArrayBuffer(file_textab);
			fr_mf.readAsText(file_texmf);
		}
	}
	static function updateEntry(num:Int,name:String,tags:String,path:String) {
		ROM.manifest.resources[num].name = name;
		ROM.manifest.resources[num].tags = tags.split(",");
		ROM.manifest.resources[num].path = path;
		// how to de-couple this...
		var menuName:Element = document.getElementById("texName_" + num);
		menuName.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;" + name_txt.value;
	}
	static public function exportManifest() {
		var blob:Blob = new Blob([Json.stringify(ROM.manifest)], {type: "text/plain;charset=utf-8"});
		Syntax.code("saveAs({0}, \"manifest.json\")", blob);
	}
	
	// UI funcs
	static function initMenu() {
		// todo : not hard-code this
		for (i in 0...ROM.manifest.resources.length) {
			generateMenuItem(i);
		}
	}
	static function generateMenuItem(ord:Int) {
		/*
		<div class="navEntry" onclick="alert('hi there')">
			<img width="32" height="32" class="texPreview" src="default_icon.png"/><h3 class="texName">&nbsp;&nbsp;&nbsp;&nbsp;a texture</h3>
		</div>
		*/
		//console.log(ord);
		var entryButton = document.createElement("div");
		entryButton.setAttribute("class", "navEntry");
		// weird issue compiling, MUST specify Main.updateEntry
		entryButton.onclick = Syntax.code("function() {var tName = {0}.value; var tTags = {1}.value;var tPath = {2}.value;{3}({4},tName,tTags,tPath);{4}= ord;window.displayTextureInfo(ord);}",name_txt,tags_txt,path_txt,Main.updateEntry,ROM.currTex);
		var entryIcon = new Image();
		entryIcon.width = 32;
		entryIcon.height = 32;
		entryIcon.src = "default_icon.png";
		entryIcon.setAttribute("class","texPreview");
		var entryName = document.createElement("h3");
		var tInfo = ROM.manifest.resources[ord];
		//console.log(tInfo);
		entryName.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;" + tInfo.name;
		entryButton.appendChild(entryIcon);
		entryName.setAttribute("class","texName");
		entryName.setAttribute("id","texName_" + ord);
		entryButton.appendChild(entryName);
		menu.appendChild(entryButton);
	}
	public static function advanceTexture() {
		var tName:String = name_txt.value;
		var tTags:String = tags_txt.value;
		var tPath:String = path_txt.value;
		updateEntry(ROM.currTex,tName,tTags,tPath);
		ROM.currTex += 1;
		displayTextureInfo(ROM.currTex);
	}	
	public static function rewindTexture() {
		var tName:String = name_txt.value;
		var tTags:String = tags_txt.value;
		var tPath:String = path_txt.value;
		updateEntry(ROM.currTex,tName,tTags,tPath);
		ROM.currTex -= 1;
		displayTextureInfo(ROM.currTex);
	}
	public static function updateCurrentEntry() { // just HTML... 
		var tName:String = name_txt.value;
		var tTags:String = tags_txt.value;
		var tPath:String = path_txt.value;
		updateEntry(ROM.currTex,tName,tTags,tPath);
	}
	static function displayTextureInfo(num) {
		if (num > 3651 || num < 0) { // still bad
			num = 0;
		}
		
		var tInfo:Dynamic = ROM.manifest.resources[num];
		name_txt.value = tInfo.name;
		tags_txt.value = tInfo.tags.join(",");
		path_txt.value = tInfo.path;
		
		var t = ROM.bin.getItem(num);
		if (t.resCount > 1) {
			var posX = 0;
			var posY = 0;
			for (i in 0...t.resCount) {
				var t2 = t.resources[i];
				ROM.bin.data.position = t2.ofs;
				var arr:ByteThingyWhatToNameIt = ROM.bin.data.readByteThingy(t2.size, false);
				var ovr:TTextureFormatOverride = tInfo.resInfo.formatOVR;
				
				var tx = Texture.decodeTexture(arr,t2.size,ovr);
				if (tx.format > -1) {
					gfx.drawTexture(posX,posY,tx,ovr.forceOpacity);
					posY += tx.height + 8;
					// todo : magic #'s bad!
					if (posY >= 608 - (tx.height + 8)) {
						posY = 0;
						posX += tx.width + 8;
					}
				}
			}
		} else {
			ROM.bin.data.position = t.resources[0].ofs;
			var arr:ByteThingyWhatToNameIt = ROM.bin.data.readByteThingy(t.resources[0].size,false);
			var ovr:TTextureFormatOverride = tInfo.resInfo.formatOVR;
			var tx = Texture.decodeTexture(arr,t.resources[0].size,ovr);
			//console.log(dumpTextureInfo(t.ofs,t.size,0,num));
			if (tx.format > -1) {
				gfx.drawTexture(0,0,tx,ovr.forceOpacity);
			}
		}
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
	
	// util funcs
	// gross ... 
	static function createByteArray(src:ArrayBuffer,end:Bool) {
		var arr = new Uint8Array(src);
		var bytearr:Bytes = Bytes.ofData(arr.buffer);
		return new ByteThingyWhatToNameIt(bytearr, end);
	}
	public static function hexa(n:Int) : String {
		return StringTools.hex(n,2);
	}
}