package editor;
import editor.EditorState;
import lib.dinoplanet.Texture;
import haxe.io.UInt8Array;
import js.html.Blob;
import js.Syntax; // this needs to go...
import haxe.Json;
import lib.PngTool;
import haxe.io.Bytes;
import lib.dinoplanet.Rarezip;
import util.BinUtils;
import util.BitUtils;

class FileExporter 
{
	public static function exportZip(src:EditorState,format:Int) {
		var zipfile = Syntax.code("new JSZip()");
		var warnlog = "WARNING! TEXTURE EXPORT STILL WIP!\n";
		var binfile = src.bin;
		var exportName = src.manifest.fileName;
		for (i in 0...src.manifest.resources.length) {
			var curr = src.manifest.resources[i];
			var ovr = curr.resInfo.formatOVR;
			// re-add later
			// var tName = curr.path;
			var tName = "TEX_" + i;
			var texInfo0 = binfile.getItem(i);
			var texData = binfile.getFile(i);
			
			if (curr.resInfo.frames.length > 0) {
				for (j in 0...curr.resInfo.frames.length) {
					var texInfo = texInfo0.resources[j];
					if (format == 0 ) {
						var texFile = Rarezip.decompress(texData[j]);
						Syntax.code("{0}.file({1},{2})", zipfile, tName + "_frame_" + j + ".dptf", BinUtils.BytesToU8Array(texFile));
					} else if (format == 1) {
						var texFile = Texture.decodeTexture(texData[j], texData[j].length, ovr);
						var forceOpacity:Bool = texFile.format.opaque;
						if (forceOpacity) {
							warnlog += tName + "_frame_" + j  + " has the opaque flag set. \n";
							warnlog += "it may appear blank in image editors if transparency is enabled.\n";
						}
						if (texFile.format.pixelFormat == 1 && texFile.height == 44) {
							warnlog += tName + "_frame_" + j + " contains extra data that cannot yet be decoded.\n";
							warnlog += "please export as raw to ensure losslessness.\n";
						}
						forceOpacity = false; // we shouldn't do this in export
						var pngFile = exportPNG(texFile, forceOpacity);
						Syntax.code("{0}.file({1},{2})", zipfile, tName + "_frame_" + j + ".png", pngFile);
					} else {
						var texFile = Rarezip.decompress(texData[j]);
						Syntax.code("{0}.file({1},{2})", zipfile, tName + "_frame_" + j + ".dptf", BinUtils.BytesToU8Array(texFile));
					}
				}
			} else {
				var texInfo = texInfo0.resources[0];
				if (format == 0 ) {
					var texFile = Rarezip.decompress(texData[0]);
					Syntax.code("{0}.file({1},{2})", zipfile, tName, BinUtils.BytesToU8Array(texFile));
				} else if (format == 1) {
					var texFile = Texture.decodeTexture(texData[0], texData[0].length, ovr);
					var forceOpacity:Bool = texFile.format.opaque;
					if (forceOpacity) {
						warnlog += tName + " has the opaque flag set. \n";
						warnlog += "it may appear blank in image editors if transparency is enabled.\n";
					}
					if (texFile.format.pixelFormat == 1 && texFile.height == 44) {
						warnlog += tName + " contains extra data that cannot yet be decoded.\n";
						warnlog += "please export as raw to ensure losslessness.\n";
					}
					forceOpacity = false; // we shouldn't do this in export
					var pngFile = exportPNG(texFile, forceOpacity);
					var fName = tName.split(".")[0];
					Syntax.code("{0}.file({1},{2})", zipfile, fName + ".png", pngFile);
				} else {
					var texFile = Rarezip.decompress(texData[0]);
					Syntax.code("{0}.file({1},{2})", zipfile, tName, BinUtils.BytesToU8Array(texFile));
				}
			}
		}
		// re-add later
		// Syntax.code("{0}.file({1},{2})", zipfile, "manifest.json", Json.stringify(src.manifest));
		Syntax.code("{0}.file({1},{2})", zipfile, "WARNINGS.txt", warnlog);
		Syntax.code("{0}.generateAsync({type:\"blob\",compression:\"DEFLATE\"}).then(function (blob) {saveAs(blob, {1} + \".zip\");})",zipfile,exportName);
	}
	
	public static function exportPNG(t:TDinoPlanetTexture,forceOpacity:Bool,?fileName:String) : UInt8Array {
		var pngBin:Bytes = PngTool.textureToPNG(t);
		var pngArr = BinUtils.BytesToU8Array(pngBin);
		if (fileName != null) {
			var pngArrBufView = Syntax.code("new DataView({0}.buffer)", pngArr);
			var pngBlob = new Blob([pngArrBufView]);
			Syntax.code("saveAs({1},\"{0}.png\")", fileName, pngBlob);
		}
		return pngArr;
	}
}