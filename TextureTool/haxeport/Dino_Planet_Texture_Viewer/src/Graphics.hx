package;
import js.html.CanvasElement;
import js.html.CanvasRenderingContext2D;
import js.html.ImageData;
import framework.codec.Texture;
import haxe.io.UInt8Array;

class Graphics 
{
	var scrn:CanvasElement;
	var ctx:CanvasRenderingContext2D;
	
	public function new(cnv:CanvasElement) {
		scrn = cnv;
		scrn.width = 800;
		scrn.height = 608;
		ctx = scrn.getContext("2d");
	}
	
	public function drawTexture(x:Int,y:Int,texture:TDinoPlanetTexture,forceOpacity:Bool) : Void {
		ctx.fillStyle = "#000000";
		ctx.fillRect(0,0,scrn.width,scrn.height);
		var turtle:ImageData = new ImageData(texture.width,texture.height);
		var size:Int = texture.width * texture.height;
		var pal:UInt8Array = texture.palette;
		var f:Int = texture.format;
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
	
	public function drawImageData(iDat:ImageData,x:Int,y:Int,scale:Int) : Void {
		var posX:Int = x;
		var posY:Int = y;
		var posP:Int = 0;
		var arrP:UInt8Array = cast iDat.data;
		for (iY in 0...iDat.height) {
			for (iX in 0...iDat.width) {
				var base:Int = posP * 4;
				var r:String = Main.hexa(arrP[base]); // todo : revert this to Ints
				var g:String = Main.hexa(arrP[base + 1]);
				var b:String = Main.hexa(arrP[base + 2]);
				var a:String = Main.hexa(arrP[base + 3]);
				ctx.fillStyle = "#" + r + g + b + a;
				ctx.fillRect(posX,posY,cast scale,cast scale);
				posX += scale;
				posP++;
			}
			posY += scale;
			posX = x;
		}
	}
	
	public function drawPallete(p:UInt8Array) {
		var w:Int = scrn.width;
		var h:Int = scrn.height;
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
			ctx.fillStyle = col;
			ctx.fillRect(posX,posY,16,16);
			posX += 16;
		}
	}
	
}