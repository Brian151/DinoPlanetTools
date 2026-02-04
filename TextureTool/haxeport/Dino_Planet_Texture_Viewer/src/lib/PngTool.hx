package lib;
import haxe.io.Bytes;
import lib.dinoplanet.Texture;
import haxe.io.BytesOutput;
import js.html.ImageData; // NEED TO X-PLAT
import haxe.io.UInt8Array;
import lib.image.png.Data;
import lib.image.png.Reader;
import lib.image.png.Writer;
import lib.image.png.Tools;
import util.BinUtils;

class PngTool 
{
	// why does format.png do this?!
	// conversion works both ways
	// todo : move & re-name
	public static function BGRA(dat:Bytes) {
		var p = 0;
		for (i in 0...dat.length >> 2) {
			var r = dat.get(p);
			var g = dat.get(p + 1);
			var b = dat.get(p + 2);
			// var a = b.get(p + 3);
			dat.set(p++, b);
			dat.set(p++, g);
			dat.set(p++, r);
			//b.set(p++, b);
			p++;
		}
	}
	
	public static function textureToPNG(src:TDinoPlanetTexture):Bytes {
		switch(src.format.pixelFormat) {
			case 0 :
				var img = Texture.convertToImage(src,false);
				var dat = BinUtils.U8ArrayToBytes(cast img.data);
				BGRA(dat);
				var png = Tools.build32BGRA(src.width, src.height, dat);
				var pngB = new BytesOutput();
				new Writer(pngB).write(png);
				return pngB.getBytes();
			case 1 :
				var img = Texture.convertToImage(src,false);
				var dat = BinUtils.U8ArrayToBytes(cast img.data);
				BGRA(dat);
				var png = Tools.build32BGRA(src.width, src.height, dat);
				var pngB = new BytesOutput();
				new Writer(pngB).write(png);
				return pngB.getBytes();
			case 2 :
				var dat = BinUtils.U8ArrayToBytes(src.pixels);
				var png = Tools.buildGrey(src.width, src.height, dat);
				var pngB = new BytesOutput();
				new Writer(pngB).write(png);
				return pngB.getBytes();
			case 3 :
				var dat = BinUtils.U8ArrayToBytes(src.pixels);
				var png = Tools.buildGrey(src.width, src.height, dat);
				var pngB = new BytesOutput();
				new Writer(pngB).write(png);
				return pngB.getBytes();
			case 4 : 
				var img = Texture.convertToImage(src,false);
				var dat = BinUtils.U8ArrayToBytes(cast img.data);
				BGRA(dat);
				var png = Tools.build32BGRA(src.width, src.height, dat);
				var pngB = new BytesOutput();
				new Writer(pngB).write(png);
				return pngB.getBytes();
			case 5 :
				var img = Texture.convertToImage(src,false);
				var dat = BinUtils.U8ArrayToBytes(cast img.data);
				BGRA(dat);
				var png = Tools.build32BGRA(src.width, src.height, dat);
				var pngB = new BytesOutput();
				new Writer(pngB).write(png);
				return pngB.getBytes();
			case 6 :
				var img = Texture.convertToImage(src,false);
				var dat = BinUtils.U8ArrayToBytes(cast img.data);
				BGRA(dat);
				var png = Tools.build32BGRA(src.width, src.height, dat);
				var pngB = new BytesOutput();
				new Writer(pngB).write(png);
				return pngB.getBytes();
			case 7 :
				var dat = BinUtils.U8ArrayToBytes(src.pixels);
				var datPal = BinUtils.U8ArrayToBytes(src.palette);
				var png = Tools.buildIndexedWithTransparency(src.width, src.height, dat, datPal);
				var pngB = new BytesOutput();
				new Writer(pngB).write(png);
				return pngB.getBytes();
			case 8 :
				var dat = BinUtils.U8ArrayToBytes(src.pixels);
				var dat = BinUtils.U8ArrayToBytes(src.pixels);
				var datPal = BinUtils.U8ArrayToBytes(src.palette);
				var png = Tools.buildIndexedWithTransparency(src.width, src.height, dat, datPal);
				var pngB = new BytesOutput();
				new Writer(pngB).write(png);
				return pngB.getBytes();
		}
		return Bytes.alloc(256); // appease compiler
	}
	
	public static function PNGToTexture(src:Bytes):TDinoPlanetTexture {
		return null; // TODO!
	}
}