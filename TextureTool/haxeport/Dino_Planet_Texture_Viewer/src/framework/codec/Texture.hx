package framework.codec;
import haxe.io.Bytes;
import js.Syntax;
import js.lib.Error;
import haxe.io.UInt16Array;
import haxe.io.UInt8Array;
import framework.ByteThingyWhatToNameIt;

typedef TDinoPlanetTextureHeader = {
	// technically, these are not all Ints...
	width : Int,
	height : Int,
	format : Int,
	unk_0x3 : Int,
	unk_0x4 : Int,
	flags : Int,
	PTR_gdl : Int,
	levels : Int,
	unk_0xe : Int,
	unk_0x10 : Int,
	gdlIdx : Int,
	PTR_next : Int,
	unk_0x18 : Int,
	unk_0x1a : Int,
	unk_0x1b : Int,
	cms : Int,
	masks : Int,
	cmt : Int,
	maskt : Int
}

typedef TDinoPlanetTexture = {
	format : Int,
	width : Int,
	height : Int,
	pixels : UInt8Array,
	palette : UInt8Array
}

typedef TTextureFormatOverride = {
	format : Int,
	width : Int,
	height : Int,
	noSwizzle : Bool,
	forceOpacity : Bool,
	id : Int
}

// decodes and encodes textures in Dinosaur Planet's expected format
class Texture
{
	// TODO:
	// TIDY UP!
	// overrides [hopefully temp!]
	// re-factor decoders
	// re-implement debug funcs???
	// compressor
	// encoders
	
	static var CLUT4BIT:Array<Int> = [
		0x00, // 0 
		0x11, // 17 
		0x22, // 34 
		0x33, // 51 
		0x44, // 68 
		0x55, // 85 
		0x66, // 102 
		0x77, // 119 
		0x88, // 136 
		0x99, // 153 
		0xAA, // 170 
		0xBB, // 187 
		0xCC, // 204 
		0xDD, // 221 
		0xEE, // 238 
		0xFF  // 255
	];
	

	// some textures in TEX0 don't decode properly on their own
	// temp[?] solution will be an override settings object
	// that will be stored in the manifest entries
	public static function decodeTexture(src:ByteThingyWhatToNameIt,sizeComp:Int,?hack:TTextureFormatOverride) : TDinoPlanetTexture {
		var raw = decompressTexture(src,sizeComp);
		var header = readTextureHeader(raw);
		var noSwizzle : Bool = false;
		var forceOpacity : Bool = false;
		
		if (hack != null) {
			if (hack.width > 0) {
				header.width = hack.width;
			}
			if (hack.height > 0) {
				header.height = hack.height;
			}
			if (hack.format > -1) {
				header.format = hack.format;
			}
			noSwizzle = hack.noSwizzle;
			forceOpacity = hack.forceOpacity;
		}

		switch header.format {
		case 0 :
			return readTextureRGBA32(raw,header,noSwizzle);
		case 1 :
			return readTextureRGBA16(raw,header,noSwizzle);
		case 2 :
			return readTextureIA8(raw,header,noSwizzle);
		case 3 :
			return readTextureIA4P(raw,header,noSwizzle);
		case 4 :
			return readTextureIA16(raw,header,noSwizzle);
		case 5 :
			return readTextureIA8T(raw,header,noSwizzle);
		case 6 :
			return readTextureIA4(raw,header,noSwizzle);
		case 7 :
			return readTextureCI4(raw, header, noSwizzle);
		case 16 : 
			return readTextureI8(raw, header, noSwizzle);
		default :
			throw new Error("unknown texture format! (" + header.format + ")");
		}
	}

	public static function encodeTexture() : UInt8Array {
		// TODO
		throw new Error("not implemented");
		return new UInt8Array(0);
	}

	// debug funcs:
	// dumpTextureInfo, dump1B

	// making these public is debatable, however the manifest needs this feature
	// and it makes little sense to code-dupe it
	// maybe add a param to make decode/encode return raw texture data?
	public static function decompressTexture(src:ByteThingyWhatToNameIt,sizeComp:Int) : ByteThingyWhatToNameIt {
		//var size:Int = src.readInt32();
		//var what:Int = src.readUint8();
		src.position += 5;
		var decompressed:UInt8Array = src.inflate(src.readUint8Array(sizeComp - 5), false);
		var buf:Bytes = Bytes.alloc(decompressed.length);
		var out:ByteThingyWhatToNameIt = new ByteThingyWhatToNameIt(buf, false);
		out.writeUint8Array(decompressed);
		out.position = 0;
		
		return out;
	}

	public static function compressTexture(src:UInt8Array) : UInt8Array {
		throw new Error("compression not implemented");
		
		return new UInt8Array(0);
	}

	static function readTextureHeader(src:ByteThingyWhatToNameIt) : TDinoPlanetTextureHeader {
		var out : TDinoPlanetTextureHeader = {
			width : src.readUint8(),
			height : src.readUint8(),
			format : src.readUint8(),
			unk_0x3 : src.readUint8(),
			unk_0x4 : src.readUint16(false),
			flags : src.readInt16(false),
			PTR_gdl : src.readUint32(false),
			levels : src.readUint16(false),
			unk_0xe : src.readUint16(false),
			unk_0x10 : src.readUint16(false),
			gdlIdx : src.readInt16(false),
			PTR_next : src.readUint32(false),
			unk_0x18 : src.readInt16(false), // pixelBufferSize?
			unk_0x1a : src.readUint8(),
			unk_0x1b : src.readUint8(),
			cms : src.readUint8(),
			masks : src.readUint8(),
			cmt : src.readUint8(),
			maskt : src.readUint8()
		}
		out.format &= 0x0f;
		return out;
	}

	// TODO, need to add various write methods to "ByteThingyWhatToNameIt"
	static function writeTextureHeader(src:TDinoPlanetTextureHeader) : UInt8Array {
		var buf = Bytes.alloc(32);
		var dest = new ByteThingyWhatToNameIt(buf,false);
		throw new Error("texture header write not supported!");
		return new UInt8Array(0);
	}

	// still need swizzle, unless this works same in reverse?
	static function deSwizzleBits64(src:ByteThingyWhatToNameIt, row:Int) : Array<Int> {
		var out:Array<Int> = new Array();
		var bits1:Int = src.readUint32(false);
		var bits2:Int = src.readUint32(false);
		if ((row % 2) == 1)
		{
			out.push(bits2); // yuck!
			out.push(bits1);
		}
		else {
			out.push(bits1);
			out.push(bits2);
		}
		return out;
	}

	static function deSwizzleBits128(src:ByteThingyWhatToNameIt, row:Int) : Array<Int> {
		var out:Array<Int> = new Array();
		var bits1:Int = src.readUint32(false);
		var bits2:Int = src.readUint32(false);
		var bits3:Int = src.readUint32(false);
		var bits4:Int = src.readUint32(false);
		if ((row % 2) == 1)
		{
			out.push(bits3);
			out.push(bits4);
			out.push(bits1);
			out.push(bits2);
		}
		else {
			out.push(bits1);
			out.push(bits2);
			out.push(bits3);
			out.push(bits4);
		}
		return out;
	}

	// tbh, probably should be a util func
	// need an RGBA32 > RGBA16 function
	// but then, what to re-name this?
	// return type debatable
	static function RGBA16(c:Int) : Array<Int> {
		var r:Int = c & 0x0f800; // 11111 00000 00000 0
		var g:Int = c & 0x07c0; //  00000 11111 00000 0
		var b:Int = c & 0x03e; //   00000 00000 11111 0
		var a:Int = c & 0x01; //    00000 00000 00000 1
		r >>= 8; // >> 11 (align) - 3
		g >>= 3; // >> 6 (align) - 3
		b <<= 2; // >> 1 (align) - 3 , but blue is only 1 bit off from being aligned, so we shift left
		var out:Array<Int> = new Array();
		out.push(r);
		out.push(g);
		out.push(b);
		out.push(a * 255);
		return out;
	}

	// currently using a U8 Array as return, should i abstract a palette type?
	static function readPalette(src:ByteThingyWhatToNameIt,numColors:Int) : UInt8Array {
		var pal16:UInt16Array = src.readUint16Array(numColors,false);
		var palette = new UInt8Array(numColors * 4);
		for (i in 0...numColors) {
			var c:Array<Int> = RGBA16(pal16[i]);
			var base:Int = i * 4;
			palette[base + 0] = c[0];
			palette[base + 1] = c[1];
			palette[base + 2] = c[2];
			palette[base + 3] = c[3];
		}
		return palette;
	}

	// TODO
	static function writePalette() {}

	// all need equivalent write functions
	// 'packed' versions might be
	// I8, I4, with alpha set as 'intensity'
	// texture64 shows this as an option, but
	// docu doesn't mention it[?]
	// still need to verify this against some sample textures
	// it's easy, i'm just lazy :P

	// assuming this works [should!]
	// IA4P() > delete, add I4() with Bool:useAlpha argument
	// IA8() > delete, add I8() with Bool:useAlpha argument
	//     or Int/Enum:alphaMode [0:full,1:intensity,2:binary] , this order makes mose sense[?]
	//     [I8 in fact seems to be used at least once, splash screen BG]
	// IA8T() > rename [thus, replace existing] IA8()
	// all others remain as-is
	// argument Bool:forceOpacity? 4 textures ignore their alpha
	// this could also be implemented in the viewer/editor

	// since some textures are not swizzled, all decoders/encoders
	// need a Bool:noSwizzle argument to override the swizzling
	// given the current implementation, get/setBits() might also need to do this

	static function readTextureIA4P(src:ByteThingyWhatToNameIt,header:TDinoPlanetTextureHeader,noSwizzle:Bool) : TDinoPlanetTexture {
		// should i just add the header to the texture type? it might be something
		// that needs to be processed outside of the codec
		var width : Int = header.width;
		var height : Int = header.height;
		var format : Int = header.format;
		var imageSize : Int = width * height;
		// we're outputting RGBA32 for now
		// maybe we shouldn't be doing that?
		// essentilly just creating an ImageData by another name
		// and the editor needs to account for format-specific limitations
		var pixels : UInt8Array = new UInt8Array(imageSize * 4);
		src.position = 0x20;
		var bitsLeft : Int = 64;
		var currentRow : Int = 0;
		var bitSrc : Array<Int> = deSwizzleBits64(src, currentRow);
		// in hindsight, why in the HELL am i doing it like this?!
		var bits1 : Int = bitSrc[0];
		var bits2 : Int = bitSrc[1];
		for (i in 0...imageSize)
		{
			if (i > 0 && (i % width) == 0) {
				if (!noSwizzle) {
					currentRow++;
				}
			}
			if (bitsLeft <= 0) {
				bitSrc = deSwizzleBits64(src, currentRow);
				// in hindsight, why in the HELL am i doing it like this?!
				bits1 = bitSrc[0];
				bits2 = bitSrc[1];
				bitsLeft = 64;
			}
			var pix : Int = 0;
			var r : Int = 0;
			var g : Int = 0;
			var b : Int = 0;
			var a : Int = 0;
			// U64 in JS not exactly supported
			if (bitsLeft <= 32) {
				pix = (bits2 & 0xe0000000) >>> 28;
				a = (bits2 & 0xf0000000) >>> 28;
				bits2 <<= 4;
				pix >>>= 1;
				r = CLUT4BIT[pix * 2];
				g = CLUT4BIT[pix * 2];
				b = CLUT4BIT[pix * 2];
				bitsLeft -= 4;
			}
			else {
				pix = (bits1 & 0xe0000000) >>> 28;
				a = (bits1 & 0xf0000000) >>> 28;
				bits1 <<= 4;
				pix >>>= 1;
				r = CLUT4BIT[pix * 2];
				g = CLUT4BIT[pix * 2];
				b = CLUT4BIT[pix * 2];
				bitsLeft -= 4;
			}
			var base : Int = i * 4;
			pixels[base + 0] = r;
			pixels[base + 1] = g;
			pixels[base + 2] = b;
			pixels[base + 3] = CLUT4BIT[a];
		}
		return {
			format : format,
			palette : new UInt8Array(4),
			width : width,
			height : height,
			pixels : pixels
		}
	}
	
	static function readTextureIA16(src:ByteThingyWhatToNameIt,header:TDinoPlanetTextureHeader,noSwizzle:Bool) : TDinoPlanetTexture {
		var width : Int = header.width;
		var height : Int = header.height;
		var format : Int = header.format;
		var imageSize = width * height;
		var pixels : UInt8Array = new UInt8Array(imageSize * 4);
		src.position = 0x20;
		var bitsLeft : Int = 64;
		var currentRow : Int = 0;
		var bitSrc : Array<Int> = deSwizzleBits64(src,currentRow);
		var bits1 : Int = bitSrc[0];
		var bits2 : Int = bitSrc[1];
		for (j in 0...imageSize) {
			if (j > 0 && ((j % width) != 0)) {
				if (!noSwizzle) {
					currentRow++;
				}
			}
			if (bitsLeft <= 0)
			{
				bitSrc = deSwizzleBits64(src,currentRow);
				bits1 = bitSrc[0];
				bits2 = bitSrc[1];
				bitsLeft = 64;
			}
			var pix : Int = 0;
			var a : Int = 0;
			if (bitsLeft <= 32) {
				pix = (bits2 & 0xff000000) >>> 24;
				a = (bits2 & 0x00ff0000) >>> 16;
				bits2 <<= 16;
				bitsLeft -= 16;
			}
			else {
				pix = (bits1 & 0xff000000) >>> 24;
				a = (bits1 & 0x00ff0000) >>> 16;
				bits1 <<= 16;
				bitsLeft -= 16;
			}
			var base : Int = j * 4;
			pixels[base + 0] = pix;
			pixels[base + 1] = pix;
			pixels[base + 2] = pix;
			pixels[base + 3] = a;
		}
		return {
			format : format,
			palette : new UInt8Array(4),
			width : width,
			height : height,
			pixels : pixels
		}
	}

	static function readTextureIA8(src:ByteThingyWhatToNameIt,header:TDinoPlanetTextureHeader,noSwizzle:Bool) : TDinoPlanetTexture {
		var width : Int = header.width;
		var height : Int = header.height;
		var format = header.format;
		var imageSize : Int = width * height;
		var pixels : UInt8Array = new UInt8Array(imageSize * 4);
		src.position = 0x20;
		var bitsleft : Int = 64;
		var currentRow : Int = 0;
		var bitSrc : Array<Int> = deSwizzleBits64(src,currentRow);
		var bits1 : Int = bitSrc[0];
		var bits2 : Int = bitSrc[1];
		for (j in 0...imageSize) {
			if (j > 0 && ((j % width) != 0)) {
				if (!noSwizzle) {
					currentRow++;
				}
			}
			if (bitsleft <= 0) {
				bitSrc = deSwizzleBits64(src,currentRow);
				bits1 = bitSrc[0];
				bits2 = bitSrc[1];
				bitsleft = 64;
			}
			var pix : Int = 0;
			var r : Int = 0;
			var g : Int = 0;
			var b : Int = 0;
			var a : Int = 0;
			if (bitsleft <= 32)
			{
				pix = (bits2 & 0xf0000000) >>> 28;
				a = (bits2 & 0xff000000) >>> 24;
				bits2 <<= 8;
				r = CLUT4BIT[pix];
				g = CLUT4BIT[pix];
				b = CLUT4BIT[pix];
				bitsleft -= 8;
			}
			else
			{
				pix = (bits1 & 0xf0000000) >>> 28;
				a = (bits1 & 0xff000000) >>> 24;
				bits1 <<= 8;
				r = CLUT4BIT[pix];
				g = CLUT4BIT[pix];
				b = CLUT4BIT[pix];
				bitsleft -= 8;
			}
			var base : Int = j * 4;
			pixels[base + 0] = r;
			pixels[base + 1] = g;
			pixels[base + 2] = b;
			pixels[base + 3] = a;
		}
		return {
			format : format,
			palette : new UInt8Array(4),
			width : width,
			height : height,
			pixels : pixels
		}
	}

	static function readTextureIA4(src:ByteThingyWhatToNameIt,header:TDinoPlanetTextureHeader,noSwizzle:Bool) : TDinoPlanetTexture {
		var width : Int = header.width;
		var height : Int = header.height;
		var format : Int = header.format;
		var imageSize : Int = width * height;
		var pixels : UInt8Array = new UInt8Array(imageSize * 4);
		src.position = 0x20;
		var bitsLeft : Int = 64;
		var currentRow : Int = 0;
		var bitSrc : Array<Int> = deSwizzleBits64(src,currentRow);
		var bits1 : Int = bitSrc[0];
		var bits2 : Int = bitSrc[1];
		for (j in 0...imageSize) {
			if (j > 0 && ((j % width) != 0)) {
				if (!noSwizzle) {
					currentRow++;
				}
			}
			if (bitsLeft <= 0) {
				bitSrc = deSwizzleBits64(src,currentRow);
				bits1 = bitSrc[0];
				bits2 = bitSrc[1];
				bitsLeft = 64;
			}
			var pix : Int = 0;
			var r : Int = 0;
			var g : Int = 0;
			var b : Int = 0;
			var a : Int = 0;
			if (bitsLeft <= 32) {
				pix = (bits2 & 0xf0000000) >>> 28;
				a = pix & 0x01;
				pix >>>= 1;
				bits2 <<= 4;
				r = CLUT4BIT[pix * 2];
				g = CLUT4BIT[pix * 2];
				b = CLUT4BIT[pix * 2];
				bitsLeft -= 4;
			}
			else
			{
				pix = (bits1 & 0xf0000000) >>> 28;
				a = pix & 0x01;
				pix >>>= 1;
				bits1 <<= 4;
				r = CLUT4BIT[pix * 2];
				g = CLUT4BIT[pix * 2];
				b = CLUT4BIT[pix * 2];
				bitsLeft -= 4;
			}
			var base : Int = j * 4;
			pixels[base + 0] = r;
			pixels[base + 1] = g;
			pixels[base + 2] = b;
			pixels[base + 3] = a * 255;
		}
		return {
			format : format,
			palette : new UInt8Array(4),
			width : width,
			height : height,
			pixels : pixels
		}
	}

	static function readTextureIA8T(src:ByteThingyWhatToNameIt,header:TDinoPlanetTextureHeader,noSwizzle:Bool) : TDinoPlanetTexture {
		var width  : Int= header.width;
		var height : Int = header.height;
		var format : Int = header.format;
		var imageSize : Int = width * height;
		var pixels : UInt8Array = new UInt8Array(imageSize * 4);
		src.position = 0x20;
		var bitsLeft : Int = 64;
		var currentRow : Int = 0;
		var bitSrc : Array<Int> = deSwizzleBits64(src,currentRow);
		var bits1 : Int = bitSrc[0];
		var bits2 : Int = bitSrc[1];
		for (j in 0...imageSize) {
			if (j > 0 && ((j % width) != 0)) {
				if (!noSwizzle) {
					currentRow++;
				}
			}
			if (bitsLeft <= 0) {
				bitSrc = deSwizzleBits64(src,currentRow);
				bits1 = bitSrc[0];
				bits2 = bitSrc[1];
				bitsLeft = 64;
			}
			var pix : Int = 0;
			var r : Int= 0;
			var g : Int = 0;
			var b : Int = 0;
			var a : Int = 0;
			if (bitsLeft <= 32) {
				pix = (bits2 & 0xf0000000) >>> 28;
				a = (bits2 & 0x0f000000) >>> 24;
				bits2 <<= 8;
				r = CLUT4BIT[pix];
				g = CLUT4BIT[pix];
				b = CLUT4BIT[pix];
				bitsLeft -= 8;
			}
			else
			{
				pix = (bits1 & 0xf0000000) >>> 28;
				a = (bits1 & 0x0f000000) >>> 24;
				bits1 <<= 8;
				r = CLUT4BIT[pix];
				g = CLUT4BIT[pix];
				b = CLUT4BIT[pix];
				bitsLeft -= 8;
			}
			var base : Int = j * 4;
			pixels[base + 0] = r;
			pixels[base + 1] = g;
			pixels[base + 2] = b;
			pixels[base + 3] = CLUT4BIT[a];
		}
		return {
			format : format,
			palette : new UInt8Array(4),
			width : width,
			height : height,
			pixels : pixels
		}
	}

	static function readTextureRGBA32(src:ByteThingyWhatToNameIt,header:TDinoPlanetTextureHeader,noSwizzle:Bool) : TDinoPlanetTexture {
		var width : Int = header.width;
		var height : Int = header.height;
		var format : Int = header.format;
		var imageSize : Int = width * height;
		var pixels : UInt8Array = new UInt8Array(imageSize * 4);
		src.position = 0x20;
		var bitsLeft : Int = 128;
		var currentRow : Int = 0;
		var bitSrc : Array<Int> = deSwizzleBits128(src,currentRow);
		for (j in 0...imageSize) {
			if (j > 0 && ((j % width) != 0)) {
				if (!noSwizzle) {
					currentRow++;
				}
			}
			if (bitsLeft <= 0) {
				bitSrc = deSwizzleBits128(src,currentRow);
				bitsLeft = 128;
			}
			var pix : Int = 0;
			var r : Int = 0;
			var g : Int = 0;
			var b : Int = 0;
			var a : Int = 0;
			if (bitsLeft >= 32) {
				pix = bitSrc.shift();
				r = (pix & 0xff000000) >>> 24;
				g = (pix & 0x00ff0000) >>> 16;
				b = (pix & 0x0000ff00) >>> 8;
				a = pix & 0x000000ff;
				bitsLeft -= 32;
			}
			var base : Int = j * 4;
			pixels[base + 0] = r;
			pixels[base + 1] = g;
			pixels[base + 2] = b;
			pixels[base + 3] = a;
		}
		return {
			format : format,
			palette : new UInt8Array(4),
			width : width,
			height : height,
			pixels : pixels
		}
	}

	static function readTextureRGBA16(src:ByteThingyWhatToNameIt,header:TDinoPlanetTextureHeader,noSwizzle:Bool) : TDinoPlanetTexture {
		var width : Int = header.width;
		var height : Int = header.height;
		var format : Int = header.format;
		var imageSize : Int = width * height;
		var pixels = new UInt8Array(imageSize * 4);
		src.position = 0x20;
		var bitsLeft : Int = 64;
		var currentRow : Int = 0;
		var bitSrc : Array<Int> = deSwizzleBits64(src,currentRow);
		var bits1 : Int = bitSrc[0];
		var bits2 : Int = bitSrc[1];
		for (j in 0...imageSize) {
			if (j > 0 && ((j % width) != 0)) {
				if (!noSwizzle) {
					currentRow++;
				}
			}
			if (bitsLeft <= 0) {
				bitSrc = deSwizzleBits64(src,currentRow);
				bits1 = bitSrc[0];
				bits2 = bitSrc[1];
				bitsLeft = 64;
			}
			var pix = 0;
			if (bitsLeft <= 32) {
				pix = (bits2 & 0xffff0000) >>> 16;
				bits2 <<= 16;
				bitsLeft -= 16;
			}
			else
			{
				pix = (bits1 & 0xffff0000) >>> 16;
				bits1 <<= 16;
				bitsLeft -= 16;
			}
			var base : Int = j * 4;
			var c : Array<Int> = RGBA16(pix);
			pixels[base + 0] = c[0];
			pixels[base + 1] = c[1];
			pixels[base + 2] = c[2];
			pixels[base + 3] = c[3];
		}
		return {
			format : format,
			palette : new UInt8Array(4),
			width : width,
			height : height,
			pixels : pixels
		}
	}

	static function readTextureCI4(src:ByteThingyWhatToNameIt,header:TDinoPlanetTextureHeader,noSwizzle:Bool) : TDinoPlanetTexture {
		var width : Int = header.width;
		var height : Int = header.height;
		var format : Int = header.format;
		var imageSize : Int = width * height;
		var pixels : UInt8Array = new UInt8Array(imageSize);
		src.position = 0x20;
		var bitsLeft : Int = 64;
		var currentRow : Int = 0;
		var bitSrc : Array<Int> = deSwizzleBits64(src,currentRow);
		var bits1 : Int = bitSrc[0];
		var bits2 : Int = bitSrc[1];
		for (j in 0...imageSize) {
			if (j > 0 && ((j % width) != 0)) {
				if (!noSwizzle) {
					currentRow++;
				}
			}
			if (bitsLeft <= 0) {
				bitSrc = deSwizzleBits64(src,currentRow);
				bits1 = bitSrc[0];
				bits2 = bitSrc[1];
				bitsLeft = 64;
			}
			var pix = 0;
			if (bitsLeft <= 32) {
				pix = (bits2 & 0xf0000000) >>> 28;
				bits2 <<= 4;
				bitsLeft -= 4;
			}
			else {
				pix = (bits1 & 0xf0000000) >>> 28;
				bits1 <<= 4;
				bitsLeft -= 4;
			}
			pixels[j] = pix;
		}
		var palette = readPalette(src,16);
		return {
			format : format,
			palette : palette,
			width : width,
			height : height,
			pixels : pixels
		}
	}
	
	// probably should replace IA8P since it's actually I8 with alpha = intensity
	static function readTextureI8(src:ByteThingyWhatToNameIt,header:TDinoPlanetTextureHeader,noSwizzle:Bool) : TDinoPlanetTexture {
		var width  : Int = header.width;
		var height : Int = header.height;
		var format : Int = 5; // hax
		var imageSize : Int = width * height;
		var pixels : UInt8Array = new UInt8Array(imageSize * 4);
		src.position = 0x20;
		var bitsLeft : Int = 64;
		var currentRow : Int = 0;
		var bitSrc : Array<Int> = deSwizzleBits64(src,currentRow);
		var bits1 : Int = bitSrc[0];
		var bits2 : Int = bitSrc[1];
		for (j in 0...imageSize) {
			if (j > 0 && ((j % width) != 0)) {
				if (!noSwizzle) {
					currentRow++;
				}
			}
			if (bitsLeft <= 0) {
				bitSrc = deSwizzleBits64(src,currentRow);
				bits1 = bitSrc[0];
				bits2 = bitSrc[1];
				bitsLeft = 64;
			}
			var pix : Int = 0;
			var r : Int= 0;
			var g : Int = 0;
			var b : Int = 0;
			var a : Int = 0;
			if (bitsLeft <= 32) {
				pix = (bits2 & 0xff000000) >>> 24;
				a = 255;
				bits2 <<= 8;
				r = pix;
				g = pix;
				b = pix;
				bitsLeft -= 8;
			}
			else
			{
				pix = (bits1 & 0xff000000) >>> 24;
				a = 255;
				bits1 <<= 8;
				r = pix;
				g = pix;
				b = pix;
				bitsLeft -= 8;
			}
			var base : Int = j * 4;
			pixels[base + 0] = r;
			pixels[base + 1] = g;
			pixels[base + 2] = b;
			pixels[base + 3] = a;
		}
		//Syntax.code("console.log({0})",pixels);
		return {
			format : format,
			palette : new UInt8Array(4),
			width : width,
			height : height,
			pixels : pixels
		}
	}

	// these should probably not be handled by the [en/de]coder at all
	//function drawTexture(){}
	//function drawPalette(){}
}