package framework.codec;
import framework.codec.Qoi_Types;
import haxe.io.Bytes;
import haxe.io.BytesInput;
import haxe.io.BytesOutput;
import haxe.io.UInt8Array;

/*[Quite OK Image Format]
MIT License

Copyright (c) 2022 Dominic Szablewski

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.*/

// Haxe implementation by https://github.com/Brian151

/*WORK-IN-PROGRESS
as-is (last update as of 9 / 14 / 2023), WILL NOT decode / encode all valid Qoi files
additionally, all code is subject to radical change until stabilized
currently, supported OPs should be: RGBA , RGB, INDEX
most up - to - date version may be located at:
https://github.com/Brian151/DinoPlanetTools/blob/main/TextureTool/haxeport/Dino_Planet_Texture_Viewer/src/framework/codec/Qoi.hx
update notes and issues may be located at:
https://github.com/Brian151/DinoPlanetTools/issues/2
*/

class Qoi 
{
	public static final magicval : Int = 0x716F6966; // "qoif"
	var op_rgb : Int = 0x0fe;  // 1111 1110
	var op_rgba : Int = 0x0ff; // 1111 1111
	var op_index : Int = 0;    // 00
	var op_diff : Int = 1;     // 01
	var op_luma : Int = 2;     // 10
	var op_run : Int = 3;      // 11

	public static function decode(src:Qoi_Image) : Qoi_DisplayImage {
		var w = src.header.width;
		var h = src.header.height;
		var size = w * h;
		var datBuf : BytesInput = new BytesInput(src.data);
		datBuf.bigEndian = true;
		var hashCLUT : UInt8Array = new UInt8Array(64 * 4);
		addToCLUT(hashCLUT, 0, 0, 0, 255);
		var out : Qoi_DisplayImage = {
			width : w,
			height : h,
			pixels : new UInt8Array(size * 4);
		}
		var srcDat = src.data;
		for (i in datBuf.length) {
			var currInd = i * 4;
			var op = datBuf.readByte();
			var op2 = op & (0b11000000) >> 6;
			if (op == 255) {
				var r : Int = datBuf.readByte();
				var g : Int = datBuf.readByte();
				var b : Int = datBuf.readByte();
				var a : Int = datBuf.readByte();
				out.pixels[ind + 0] = r;
				out.pixels[ind + 1] = g;
				out.pixels[ind + 2] = b;
				out.pixels[ind + 3] = a;
				addToCLUT(hashCLUT, r, g, b, a);
			} else if (op == 254) {
				var r : Int = datBuf.readByte();
				var g : Int = datBuf.readByte();
				var b : Int = datBuf.readByte();
				out.pixels[ind + 0] = r;
				out.pixels[ind + 1] = g;
				out.pixels[ind + 2] = b;
				out.pixels[ind + 3] = 255;
				addToCLUT(hashCLUT, r, g, b, 255);
			} else {
				if (op2 == 0) {
					var r : Int = hashCLUT[op * 4 + 0];
					var g : Int = hashCLUT[op * 4 + 1];
					var b : Int = hashCLUT[op * 4 + 2];
					var a : Int = hashCLUT[op * 4 + 3];
					out.pixels[ind + 0] = r;
					out.pixels[ind + 1] = g;
					out.pixels[ind + 2] = b;
					out.pixels[ind + 3] = a;
				}
			}
			}
		}
	}
	
	public static function encode(src:Qoi_DisplayImage) : Qoi_Image {
		var hashCLUT : UInt8Array = new UInt8Array(64 * 4);
		var w : Int = src.width;
		var h : Int = src.height;
		var header : Qoi_Header = {
			magic : magicval,
			width : w,
			height : h,
			channels : 4,
			colorspace : 0
		}
		var datBuf : BytesOutput;
		datBuf.bigEndian = true;
		var size = w * h;
		addToCLUT(hashCLUT, 0, 0, 0, 255);
		var srcPx = src.pixels;
		for (i in srcPx.length) {
			var currInd = i * 4;
			var r : Int = srcPx[currInd + 0];
			var g : Int = srcPx[currInd + 1];
			var b : Int = srcPx[currInd + 2];
			var a : Int = srcPx[currInd + 3];
			var h = hash(r, g, b, a);
			var inCLUT = compareCLUT(hashCLUT, h, r, g, b, a);
			if (inCLUT) {
				datBuf.writeByte(h);
			} else {
				addToCLUT(hashCLUT, r, g, b, a);
				if (a < 255) {
					datBuf.writeByte(255);
					datBuf.writeByte(r);
					datBuf.writeByte(g);
					datBuf.writeByte(b);
					datBuf.writeByte(a);
				} else {
					datBuf.writeByte(254);
					datBuf.writeByte(r);
					datBuf.writeByte(g);
					datBuf.writeByte(b);
				}
			}
		}
		var out : Qoi_Image = {
			header : header,
			data : datBuf.getBytes()
		}
		return out;
	}
	
	public static function write(src:Qoi_Image) : Bytes {
		var datBuf = new BytesOutput();
		datBuf.bigEndian = true;
		var head = src.header;
		var datPx = src.data;
		datBuf.writeInt32(head.magic);
		datBuf.writeInt32(head.width);
		datBuf.writeInt32(head.height);
		datBuf.writeByte(head.channels);
		datBuf.writeByte(head.colorspace);
		datBuf.writeBytes(datPx, 0, datPx.length);
		return datBuf.getBytes();
	}
	
	public static function read(src:Bytes) : Qoi_Image {
		var datBuf : BytesInput = new BytesInput(src);
		datBuf.bigEndian = true;
		var head = {
			magic : datBuf.readInt32(),
			width : datBuf.readInt32(),
			height : datBuf.readInt32(),
			channels : datBuf.readByte(),
			colorspace : datBuf.readByte()
		}
		var out : Qoi_Image = {
			header : head,
			data = datBuf.readBytes(datBuf,datBuf.position,datBuf.length - 14)
		}
		return out;
	}
	
	public static inline function hash(r:Int,g:Int,b:Int,a:Int) : Int {
		return (r * 3 + g * 5 + b * 7 + a * 11) % 64;
	}
	
	public static inline function addToCLUT(dst:UInt8Array,r:Int, g:Int, b:Int, a:Int) {
		var pos = hash(r, g, b, a) * 4;
		dst[pos + 0] = r;
		dst[pos + 1] = g;
		dst[pos + 2] = b;
		dst[pos + 3] = a;
	}
	
	public static inline function compareCLUT(src:UInt8Array, pos : Int, r : Int, g ; Int, b : Int, a : Int ) : Bool {
		var realPos = pos * 4;
		var r0 : Int = src[realPos + 0];
		var g0 : Int = src[realPos + 1];
		var b0 : Int = src[realPos + 2];
		var a0 : Int = src[realPos + 3];
		return (r == r0 && g == g0 && b == b0 && a == a0);
	}
}