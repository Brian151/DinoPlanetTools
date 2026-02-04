package;
import util.Util;
import editor.EditorState;
import editor.FileExporter;
import haxe.io.Bytes;
import lib.dinoplanet.Texture;
import js.html.Blob;  // X-PLAT THIS
import js.html.Element;  // X-PLAT THIS
import js.html.InputElement;  // X-PLAT THIS
import js.html.FileReader;  // X-PLAT THIS
import js.Syntax; // X-PLAT THIS
import lib.dinoplanet.TexPack;
import js.Browser.document; // X-PLAT THIS
import haxe.Json;
import Graphics;
import ui.UI;
import dev.ManifestConverter; // add flag
import lib.dinoplanet.Rarezip;
import js.Browser.console;  // X-PLAT THIS
import lib.dinoplanet.Model;
import lib.dinoplanet.Model_Types;

// all unused (now) but keep for reference
/*
import haxe.crypto.Md5;
import lib.Qoi;*/

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
	
	// core funcs
	static function main() {
		ROM = new EditorState(); // can't use this yet...
		ROM.bin = new TexPack();
		// ROM.bin.type = 1; // dummy!
		gfx = new Graphics(cast document.getElementById("screen"));
		
		// for debugging with console
		Syntax.code("window.ROM = {0}", ROM);
		
		// glue code exports haxe funcs/vars to global (window)
		Syntax.code("window.advanceTexture = {0}", UI.advanceTexture);
		Syntax.code("window.rewindTexture = {0}", UI.rewindTexture);
		Syntax.code("window.displayTextureInfo = {0}", UI.displayTextureInfo);
		Syntax.code("window.loadFile = {0}", loadFile);
		Syntax.code("window.exportManifest = {0}", exportManifest);
		Syntax.code("window.updateEntry = {0}", UI.updateCurrentEntry);
		Syntax.code("window.exportZip = {0}", UI.exportZip);
		Syntax.code("window.exportPNGZip = {0}", UI.exportZipPNG);
	}
	
	static public function onFileLoaded() {
		filesLoaded++;
		if (filesLoaded < filesTotal) {
			return;
		}
		// TODO : split model analysis into another app
		UI.initMenu(gfx, menu, name_txt, tags_txt, path_txt);
		
		ROM.currTex = 687;
		// temp!
		
		var curr = ROM.manifest.resources[ROM.currTex];
		var tOVR = curr.resInfo.formatOVR;
		var binfile:TexPack = ROM.bin;
		var texDat = binfile.getFile(ROM.currTex)[0];
		var texDat2 = Rarezip.decompress(texDat);
		var tex = Texture.decodeTexture(texDat2, 0,tOVR);
		// FileExporter.exportPNG(tex, tOVR.forceOpacity, "aFileName");
		// FileExporter.exportZip(ROM,1);
		// ManifestConverter.update2();
		
		UI.displayTextureInfo(ROM.currTex);
		
		/*var curr = ROM.bin.getFile(0)[0];
		//console.log(curr);
		var mdldat = Model.decompressModel(curr.tgt);
		console.log(mdldat);
		var mdl = Model.readModel(mdldat);
		console.log(mdl);*/
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
				var arr:Bytes = Bytes.ofData(fr_tex.result);
				ROM.bin.loadData(arr);
				onFileLoaded();
			}
			fr_tab.onload = function() {
				var arr:Bytes = Bytes.ofData(fr_tab.result);
				ROM.bin.loadOffsets(arr);
				onFileLoaded();
			}
			// manifest should be optional...
			fr_mf.onload = function() {
				ROM.manifest = Json.parse(fr_mf.result);
				// ManifestConverter.update3();
				// ManifestConverter.findNonInterlaced(ROM.manifest);
				onFileLoaded();
			}
			fr_tex.readAsArrayBuffer(file_texbin);
			fr_tab.readAsArrayBuffer(file_textab);
			fr_mf.readAsText(file_texmf);
		}
	}
	
	public static function updateEntry(num:Int,name:String,tags:String,path:String) {
		ROM.manifest.resources[num].name = name;
		ROM.manifest.resources[num].tags = tags.split(",");
		ROM.manifest.resources[num].path = path;
		// how to de-couple this...
		var menuName:Element = document.getElementById("texName_" + num);
		menuName.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;" + name_txt.value;
	}
	
	public static function exportManifest() {
		var blob:Blob = new Blob([Json.stringify(ROM.manifest)], {type: "text/plain;charset=utf-8"});
		Syntax.code("saveAs({0}, \"manifest.json\")", blob);
	}
}