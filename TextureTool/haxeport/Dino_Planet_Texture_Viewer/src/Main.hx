package;
import Util;
import framework.EditorState;
import framework.editor.FileExporter;
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
import js.lib.Uint8Array;
import haxe.Json;
import Graphics;
import ui.UI ;

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
	generic manifest format [mostly done]
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
		
		UI.initMenu(gfx, menu, name_txt, tags_txt, path_txt);
		
		ROM.currTex = 713;
		// temp!
		// FileExporter.exportZip(ROM,1);
		/*var binfile = ROM.bin;
		var bindat = ROM.bin.data;
		var curr = ROM.manifest.resources[713];
		var tOVR = curr.resInfo.formatOVR;
		var texInfo0 = binfile.getItem(713);
		var texInfo = texInfo0.resources[0];
		bindat.position = texInfo.ofs;
		var tex = Texture.decodeTexture(bindat, texInfo.size);
		FileExporter.exportPNG(tex, tOVR.forceOpacity, "aFileName");*/
		
		UI.displayTextureInfo(ROM.currTex);
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
				var arr:ByteThingyWhatToNameIt = Util.createByteArray(fr_tex.result,false);
				ROM.bin.loadData(arr);
				onFileLoaded();
			}
			fr_tab.onload = function() {
				var arr:ByteThingyWhatToNameIt = Util.createByteArray(fr_tab.result,false);
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