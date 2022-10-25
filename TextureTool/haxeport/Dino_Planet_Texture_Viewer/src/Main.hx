package;
import haxe.io.Bytes;
import framework.codec.Texture;
// import haxe.crypto.Md5;
// import framework.codec.Qoi;
import haxe.io.UInt8Array;
import haxe.io.UInt16Array;
import haxe.io.UInt32Array;
import js.Syntax;
import js.html.ImageData;
import framework.ByteThingyWhatToNameIt;
import framework.codec.BinPack;

class Main 
{
	
	static function main() 
	{
		// ugly hax enable old "Main()" code to be used, for now...
		Syntax.code("window.parseTexture = {0}",Texture.decodeTexture);
		Syntax.code("window.createByteArray = function(src) {var buf = {0}(src.length);var arr = new {1}(buf,false);arr.writeUint8Array(src);arr.position = 0;return arr;}", Bytes.alloc, ByteThingyWhatToNameIt);
		Syntax.code("window.drawTexture = {0}", drawTexture);
		Syntax.code("window.ROM.bin = new {0}()", BinPack);
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
}