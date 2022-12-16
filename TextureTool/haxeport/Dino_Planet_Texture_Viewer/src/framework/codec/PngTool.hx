package framework.codec;
import haxe.io.Bytes;
import framework.codec.Texture;
import haxe.io.BytesOutput;
import js.html.ImageData;
import haxe.io.UInt8Array;
import lib.haxepngjs.Data;
import lib.haxepngjs.Reader;
import lib.haxepngjs.Writer;
import lib.haxepngjs.Tools;

class PngTool 
{
	// why does format.png do this?!
	// conversion works both ways
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
		switch(src.format) {
			case 0 :
				var img = Texture.convertToImage(src,false);
				var dat = Util.U8ArrayToBytes(cast img.data);
				BGRA(dat);
				var png = Tools.build32BGRA(src.width, src.height, dat);
				var pngB = new BytesOutput();
				new Writer(pngB).write(png);
				return pngB.getBytes();
			case 1 :
				var img = Texture.convertToImage(src,false);
				var dat = Util.U8ArrayToBytes(cast img.data);
				BGRA(dat);
				var png = Tools.build32BGRA(src.width, src.height, dat);
				var pngB = new BytesOutput();
				new Writer(pngB).write(png);
				return pngB.getBytes();
			case 2 :
				var dat = Util.U8ArrayToBytes(src.pixels);
				var png = Tools.buildGrey(src.width, src.height, dat);
				var pngB = new BytesOutput();
				new Writer(pngB).write(png);
				return pngB.getBytes();
			case 3 :
				var dat = Util.U8ArrayToBytes(src.pixels);
				var png = Tools.buildGrey(src.width, src.height, dat);
				var pngB = new BytesOutput();
				new Writer(pngB).write(png);
				return pngB.getBytes();
			case 4 : 
				var img = Texture.convertToImage(src,false);
				var dat = Util.U8ArrayToBytes(cast img.data);
				BGRA(dat);
				var png = Tools.build32BGRA(src.width, src.height, dat);
				var pngB = new BytesOutput();
				new Writer(pngB).write(png);
				return pngB.getBytes();
			case 5 :
				var img = Texture.convertToImage(src,false);
				var dat = Util.U8ArrayToBytes(cast img.data);
				BGRA(dat);
				var png = Tools.build32BGRA(src.width, src.height, dat);
				var pngB = new BytesOutput();
				new Writer(pngB).write(png);
				return pngB.getBytes();
			case 6 :
				var img = Texture.convertToImage(src,false);
				var dat = Util.U8ArrayToBytes(cast img.data);
				BGRA(dat);
				var png = Tools.build32BGRA(src.width, src.height, dat);
				var pngB = new BytesOutput();
				new Writer(pngB).write(png);
				return pngB.getBytes();
			case 7 :
				var dat = Util.U8ArrayToBytes(src.pixels);
				var datPal = Util.U8ArrayToBytes(src.palette);
				var png = Tools.buildIndexed(src.width, src.height, dat, datPal);
				var pngB = new BytesOutput();
				new Writer(pngB).write(png);
				return pngB.getBytes();
			case 8 :
				var dat = Util.U8ArrayToBytes(src.pixels);
				var datPal = Util.U8ArrayToBytes(src.palette);
				var png = Tools.buildIndexed(src.width, src.height, dat, datPal);
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