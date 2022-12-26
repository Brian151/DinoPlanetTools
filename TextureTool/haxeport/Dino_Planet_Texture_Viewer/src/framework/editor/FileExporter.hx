package framework.editor;
import framework.ByteThingyWhatToNameIt;
import framework.editor.EditorState;
import framework.codec.Texture;
import haxe.io.UInt8Array;
import js.html.Blob;
import js.Syntax;
import haxe.Json;
import framework.codec.PngTool;
import haxe.io.Bytes;
import lib.Rarezip;

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
			var texData = binfile.getFile(i);
			
			if (curr.resInfo.frames.length > 0) {
				for (j in 0...curr.resInfo.frames.length) {
					//Syntax.code("console.log({0})", tName + "frame_" + j + ".dptf");
					var texInfo = texInfo0.resources[j];
					if (format == 0 ) {
						var texFile = Rarezip.decompress(texData[j]);
						Syntax.code("{0}.file({1},{2})", zipfile, tName + "frame_" + j + ".dptf", texFile.readUint8Array(texFile.length));
					} else if (format == 1) {
						var texFile = Texture.decodeTexture(texData[j], texData[j].length, ovr);
						var forceOpacity:Bool = ovr.forceOpacity;
						var pngFile = exportPNG(texFile, forceOpacity);
						Syntax.code("{0}.file({1},{2})", zipfile, tName + "frame_" + j + ".png", pngFile);
					} else {
						var texFile = Rarezip.decompress(texData[j]);
						Syntax.code("{0}.file({1},{2})", zipfile, tName + "frame_" + j + ".dptf", texFile.readUint8Array(texFile.length));
					}
				}
			} else {
				//Syntax.code("console.log({0})", tName);
				var texInfo = texInfo0.resources[0];
				//Syntax.code("console.log({0})", texInfo);
				bindat.position = texInfo.ofs;
				if (format == 0 ) {
					//Syntax.code("console.log({0})",texData[0].tgt.length == texInfo.size);
					var texFile = Rarezip.decompress(texData[0]);
					Syntax.code("{0}.file({1},{2})", zipfile, tName, texFile.readUint8Array(texFile.length));
				} else if (format == 1) {
					var texFile = Texture.decodeTexture(texData[0], texData[0].tgt.length, ovr);
					var forceOpacity:Bool = ovr.forceOpacity;
					var pngFile = exportPNG(texFile, forceOpacity);
					var fName = tName.split(".")[0];
					Syntax.code("{0}.file({1},{2})", zipfile, fName + ".png", pngFile);
				} else {
					var texFile = Rarezip.decompress(texData[0]);
					Syntax.code("{0}.file({1},{2})", zipfile, tName, texFile.readUint8Array(texFile.length));
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