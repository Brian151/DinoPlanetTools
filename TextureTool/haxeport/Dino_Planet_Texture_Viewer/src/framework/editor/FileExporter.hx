package framework.editor;
import framework.ByteThingyWhatToNameIt;
import framework.EditorState;
import framework.codec.Texture;
import framework.codec.BinPack;
import haxe.crypto.Base64;
import haxe.io.BytesOutput;
import haxe.io.UInt8Array;
import js.Browser;
import js.html.Blob;
import lib.haxepngjs.Tools;
import lib.haxepngjs.Writer;
import ui.UI;
import js.Syntax;
import haxe.Json;
import js.html.ImageData;
import js.html.CanvasElement;
import js.html.CanvasRenderingContext2D;
import js.Browser.document;
import framework.codec.PngTool;
import haxe.io.Bytes;

class FileExporter 
{
	public static function exportZip(src:EditorState,format:Int) {
		var zipfile = Syntax.code("new JSZip()");
		var binfile = src.bin;
		var bindat = src.bin.data;
		var exportName = src.manifest.fileName;
		for (i in 0...src.manifest.resources.length) {
			var curr = src.manifest.resources[i];
			var ovr = curr.resInfo.formatOVR;
			var tName = curr.path;
			var texInfo0 = binfile.getItem(i);
			if (curr.resInfo.frames.length > 0) {
				for (j in 0...curr.resInfo.frames.length) {
					//Syntax.code("console.log({0})", tName + "frame_" + j + ".dptf");
					var texInfo = texInfo0.resources[j];
					if (format == 0 ) {
						var texFile = Texture.decompressTexture(bindat, texInfo.size).readUint8Array(texInfo.size);
						Syntax.code("{0}.file({1},{2})", zipfile, tName + "frame_" + j + ".dptf", texFile);
					} else if (format == 1) {
						var texFile = Texture.decodeTexture(bindat, texInfo.size, ovr);
						var forceOpacity:Bool = ovr.forceOpacity;
						var pngFile = exportPNG(texFile, forceOpacity);
						Syntax.code("{0}.file({1},{2})", zipfile, tName + "frame_" + j + ".png", pngFile);
					} else {
						var texFile = Texture.decompressTexture(bindat, texInfo.size).readUint8Array(texInfo.size);
						Syntax.code("{0}.file({1},{2})", zipfile, tName + "frame_" + j + ".dptf", texFile);
					}
				}
			} else {
				//Syntax.code("console.log({0})", tName);
				var texInfo = texInfo0.resources[0];
				//Syntax.code("console.log({0})", texInfo);
				bindat.position = texInfo.ofs;
				if (format == 0 ) {
					var texFile = Texture.decompressTexture(bindat, texInfo.size).readUint8Array(texInfo.size);
					Syntax.code("{0}.file({1},{2})", zipfile, tName, texFile);
				} else if (format == 1) {
					var texFile = Texture.decodeTexture(bindat, texInfo.size, ovr);
					var forceOpacity:Bool = ovr.forceOpacity;
					var pngFile = exportPNG(texFile, forceOpacity);
					var fName = tName.split(".")[0];
					Syntax.code("{0}.file({1},{2})", zipfile, fName + ".png", pngFile);
				} else {
					var texFile = Texture.decompressTexture(bindat, texInfo.size).readUint8Array(texInfo.size);
					Syntax.code("{0}.file({1},{2})", zipfile, tName, texFile);
				}
				
			}
		}
		Syntax.code("{0}.file({1},{2})", zipfile, "manifest.json", Json.stringify(src.manifest));
		Syntax.code("{0}.generateAsync({type:\"blob\",compression:\"DEFLATE\"}).then(function (blob) {saveAs(blob, {1} + \".zip\");})",zipfile,exportName);
	}
	
	public static function exportPNG(t:TDinoPlanetTexture,forceOpacity:Bool,?fileName:String) : UInt8Array {
		var pngBin:Bytes = PngTool.textureToPNG(t);
		var pngArr = Util.BytesToU8Array(pngBin);
		if (fileName != null) {
			var pngArrBufView = Syntax.code("new DataView({0}.buffer)", pngArr);
			var pngBlob = new Blob([pngArrBufView]);
			Syntax.code("saveAs({1},\"{0}.png\")", fileName, pngBlob);
		}
		return pngArr;
	}
}