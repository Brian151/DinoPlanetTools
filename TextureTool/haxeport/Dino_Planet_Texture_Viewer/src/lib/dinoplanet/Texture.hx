package lib.dinoplanet;
import haxe.io.Bytes;
import haxe.io.UInt16Array;
import haxe.io.UInt8Array;
import js.html.ImageData;  // X-PLAT THIS
import lib.dinoplanet.Rarezip;
import util.BitUtils;


// thanks to DKR decomp team for identifying:  sprX,sprY,type
// thanks to Banjeoin of the Dino Planet Community Discord Server for identifying remaining unknown fields

typedef TDinoPlanetTextureHeader = {
	// technically, these are not all Ints...
	width : Int, 
	height : Int,
	format : TDinoPlanetTextureFormat,
	sprX : Int, 
	sprY : Int,
	unk_0x5 : Int,
	flags : TDinoPlanetTextureFlags,
	PTR_gdl : Int,
	levels : Int,
	unk_0xe : Int,
	unk_0x10 : Int,
	gdlIdx : Int,
	PTR_next : Int,
	unk_0x18 : Int,
	unk_0x1a : Int,
	hwMSB : Int,
	cms : Int,
	masks : Int,
	cmt : Int,
	maskt : Int,
}

typedef TDinoPlanetTexture = {
	format : TDinoPlanetTextureFormat,
	flags : TDinoPlanetTextureFlags,
	width : Int,
	height : Int,
	pixels : UInt8Array,
	palette : UInt8Array
}

// the only hard-coded value is whether or not the texture is interlaced
// and only a few textures disable it
typedef TTextureFormatOverride = { 
	noSwizzle : Bool,
	id : Int
}

typedef TDinoPlanetTextureFormat = {
	pixelFormat : Int,
	gray : Bool,
	opaque : Bool,
}

typedef TDinoPlanetTextureFlags = {
	ovrNoInterlace : Bool, // 0x01 , not supported by "vanilla" DP, but should not have side effects
	stateSwitcher : Bool, // 0x40
	transparent : Bool, // 0x80
	transparent2 : Bool, // 0x81, need better name
	transparentAnimated : Bool, // 0xc0
	mipMapped : Bool, // 0x100
	compositeBase : Bool, // 0x4000
	compositeOverlay : Bool // 0x8000
}

// decodes and encodes textures in Dinosaur Planet's expected format
class Texture
{
	// TODO:
	// TIDY UP!
	// compressor
	// encoders
	
	// thx to DKR decomp for identifying all formats
	static var formats:Array<String> = [
		"RGBA32",
		"RGBA16",
		"I8",
		"I4",
		"IA16",
		"IA8",
		"IA4",
		"CI4",
		"CI8" // DP is not known to actually USE this format
	];
	
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
	

	// some textures don't display properly on their own
	// temp solution is an override settings object
	// stored in the manifest entries
	public static function decodeTexture(src:Bytes,sizeComp:Int,?hack:TTextureFormatOverride) : TDinoPlanetTexture {
		var raw:Bytes;
		if (sizeComp > 0) { // hack...
			raw = Rarezip.decompress(src);
		} else {
			raw = src;
		}
		
		var header = readTextureHeader(raw);
		var noSwizzle : Bool = false;
		
		if (hack != null) {
			noSwizzle = hack.noSwizzle;
		}

		switch header.format.pixelFormat {
		case 0 :
			return readTextureRGBA32(raw,header,noSwizzle);
		case 1 :
			return readTextureRGBA16(raw,header,noSwizzle);
		case 2 :
			return readTextureI8(raw,header,noSwizzle);
		case 3 :
			return readTextureI4(raw,header,noSwizzle);
		case 4 :
			return readTextureIA16(raw,header,noSwizzle);
		case 5 :
			return readTextureIA8(raw,header,noSwizzle);
		case 6 :
			return readTextureIA4(raw,header,noSwizzle);
		case 7 :
			return readTextureCI4(raw, header, noSwizzle);
		case 8 :
			return readTextureCI8(raw, header, noSwizzle); // no observed DP textures use this format
		default :
			throw "unknown texture format! (" + header.format + ")";
		}
	}
	
	public static function getFormatNames() : Array<String> {
		return formats;
	}

	public static function encodeTexture(tex:TDinoPlanetTexture,head:TDinoPlanetTextureHeader) : UInt8Array {
		// TODO
		throw "not implemented";
		var headArr = writeTextureHeader(head);
		return new UInt8Array(0);
	}

	static function readTextureHeader(src:Bytes) : TDinoPlanetTextureHeader {
		var out : TDinoPlanetTextureHeader = {
			width : src.get(0),
			height : src.get(1),
			format : readFormatByte(src.get(2)),
			sprX : src.get(3),
			sprY : src.get(4),
			unk_0x5 : src.get(5),
			flags : readFlags(util.BitUtils.reverseI16(src.getUInt16(6))),
			PTR_gdl : util.BitUtils.reverseI32(src.getInt32(8)),
			levels : util.BitUtils.reverseI16(src.getUInt16(0xc)), // SPLIT : frame count, special sprite tag
			unk_0xe : util.BitUtils.reverseI16(src.getUInt16(0xe)),
			unk_0x10 : util.BitUtils.reverseI16(src.getUInt16(0x10)),
			gdlIdx : util.BitUtils.reverseI16(src.getUInt16(0x12)),
			PTR_next : util.BitUtils.reverseI32(src.getInt32(0x14)),
			unk_0x18 : util.BitUtils.reverseI16(src.getUInt16(0x18)), // 0x18 , confirmed pixel data length!
			unk_0x1a : src.get(0x1a), // sprite state switcher
			hwMSB : src.get(0x1b), // re-name "hi-res size"
			cms : src.get(0x1c), // wrap/mirror/clamp U
			masks : src.get(0x1d), // mask power U
			cmt : src.get(0x1e), // wrap/mirror/clamp V
			maskt : src.get(0x1f) // mask power V
		}
		out.width += ((out.hwMSB & 0xf0) << 4);
		out.height += ((out.hwMSB & 0x0f) << 8);
		return out;
	}

	// WIP
	static function writeTextureHeader(src:TDinoPlanetTextureHeader) : Bytes {
		var buf = Bytes.alloc(32);
		var wMSB:Int = src.width & 0xf00;
		var hMSB:Int = src.height & 0xf00;
		buf.set(0, src.width & 0xff);
		buf.set(1, src.height & 0xff);
		wMSB <<= 4;
		var formatByte = writeFormatByte(src.format);
		buf.set(2,formatByte);
		buf.set(3,src.sprX);
		buf.set(4,src.sprY);
		buf.set(5,1); // 0x5 has only ever been 1
		buf.setUInt16(6,util.BitUtils.reverseI16(writeFlags(src.flags)));
		buf.setInt32(8, 0);
		buf.setUInt16(0xc,util.BitUtils.reverseI16(src.levels));
		buf.setUInt16(0xe,util.BitUtils.reverseI16(src.unk_0xe));
		buf.setUInt16(0x10,util.BitUtils.reverseI16(src.unk_0x10));
		buf.setUInt16(0x12,util.BitUtils.reverseI16(src.gdlIdx));
		buf.setInt32(0x14,0);
		buf.setUInt16(0x18,util.BitUtils.reverseI16(src.unk_0x18));
		buf.set(0x1a,src.unk_0x1a);
		buf.set(0x1b,wMSB | hMSB);
		buf.set(0x1c,src.cms);
		buf.set(0x1d,src.masks);
		buf.set(0x1e,src.cmt);
		buf.set(0x1f,src.maskt);
		throw "texture header write WIP, final files may not function in-game";
		return buf;
	}
	
	static function readFlags(src:Int) : TDinoPlanetTextureFlags {
		return {
			ovrNoInterlace : (src & 0x01) > 0,
			stateSwitcher : (src & 0x40) > 0,
			transparent : (src & 0x80) > 0,
			transparent2 : (src & 0x81) > 0,
			transparentAnimated : (src & 0xc0) > 0,
			mipMapped : (src & 0x100) > 0,
			compositeBase : (src & 0x4000) > 0,
			compositeOverlay : (src & 0x8000) > 0
		}
	}
	
	static function writeFlags(src:TDinoPlanetTextureFlags) : Int {
		var out:Int = 0;
		if (src.ovrNoInterlace) {
			out |= 0x01;
		}
		if (src.stateSwitcher) {
			out |= 0x40;
		}
		if (src.transparent) {
			out |= 0x80;
		}
		if (src.transparent2) {
			out |= 0x81;
		}
		if (src.transparentAnimated) {
			out |= 0xc0;
		}
		if (src.mipMapped) {
			out |= 0x100;
		}
		if (src.compositeBase) {
			out |= 0x4000;
		}
		if (src.compositeOverlay) {
			out |= 0x8000;
		}
		return out;
	}
	
	static function readFormatByte(src:Int) : TDinoPlanetTextureFormat {
		return {
			pixelFormat : src & 0xf,
			gray : (src & 0x20) > 0,
			opaque : (src & 0x10) > 0
		}
	}
	
	static function writeFormatByte(src:TDinoPlanetTextureFormat) : Int {
		var out:Int = 0;
		out |= src.pixelFormat;
		if (src.gray) {
			out |= 0x20;
		}
		if (src.opaque) {
			out |= 0x10;
		}
		return out;
	}
	
	// there's GOT to be a less ugly way to do this...
	static inline function interlace64(bits1:Int,bits2:Int,row:Int) : Array<Int> {
		var out:Array<Int> = new Array();
		if ((row % 2) == 1) {
			out.push(bits2); // yuck!
			out.push(bits1);
		}
		else {
			out.push(bits1);
			out.push(bits2);
		}
		return out;
	}

	static function interlace128(bits1:Int,bits2:Int,bits3:Int,bits4:Int, row:Int) : Array<Int> {
		var out:Array<Int> = new Array();
		if ((row % 2) == 1) {
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
	static function readPalette(src:Bytes, numColors:Int, pos:Int) : UInt8Array {
		var palette:UInt8Array = new UInt8Array(numColors * 4);
		for (i in 0...numColors) {
			var c0 = util.BitUtils.reverseI16(src.getUInt16(pos));
			var c:Array<Int> = RGBA16(c0);
			var base:Int = i * 4;
			palette[base + 0] = c[0];
			palette[base + 1] = c[1];
			palette[base + 2] = c[2];
			palette[base + 3] = c[3];
			pos += 2;
		}
		return palette;
	}

	// TODO
	static function writePalette() {}

	// implement handling of format.opaque, format.greyScale

	// some textures are not interlaced, and the game hard-codes this
	// flags[0x1] has been set-aside since it's unused
	// but this needs to be implemented
	
	static function readTextureRGBA32(src:Bytes,header:TDinoPlanetTextureHeader,noSwizzle:Bool) : TDinoPlanetTexture {
		var width : Int = header.width;
		var height : Int = header.height;
		var format : TDinoPlanetTextureFormat = header.format;
		var imageSize : Int = width * height;
		var pixels : UInt8Array = new UInt8Array(imageSize * 4);
		var position:Int = 0x20;
		var bitsLeft : Int = 128;
		var currentRow : Int = 0;
		var bits1:Int = util.BitUtils.reverseI32(src.getInt32(position));
		position += 4;
		var bits2:Int = util.BitUtils.reverseI32(src.getInt32(position));
		position += 4;
		var bits3:Int = util.BitUtils.reverseI32(src.getInt32(position));
		position += 4;
		var bits4:Int = util.BitUtils.reverseI32(src.getInt32(position));
		position += 4;
		var bitSrc:Array<Int> = interlace128(bits1,bits2,bits3,bits4,currentRow);
		bits1 = bitSrc[0];
		bits2 = bitSrc[1];
		bits3 = bitSrc[2];
		bits4 = bitSrc[3];
		for (j in 0...imageSize) {
			if (j > 0 && ((j % width) != 0)) {
				if (!noSwizzle) {
					currentRow++;
				}
			}
			if (bitsLeft <= 0) {
				bits1= util.BitUtils.reverseI32(src.getInt32(position));
				position += 4;
				bits2 = util.BitUtils.reverseI32(src.getInt32(position));
				position += 4;
				bits3 = util.BitUtils.reverseI32(src.getInt32(position));
				position += 4;
				bits4 = util.BitUtils.reverseI32(src.getInt32(position));
				position += 4;
				bitSrc = interlace128(bits1,bits2,bits3,bits4,currentRow);
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
			flags : header.flags,
			palette : new UInt8Array(4),
			width : width,
			height : height,
			pixels : pixels
		}
	}

	static function readTextureRGBA16(src:Bytes,header:TDinoPlanetTextureHeader,noSwizzle:Bool) : TDinoPlanetTexture {
		var width : Int = header.width;
		var height : Int = header.height;
		// there's something going on here!
		// but we can't read the extra crap yet
		if (height == 44) {
			height = width;
		}
		var format : TDinoPlanetTextureFormat = header.format;
		var imageSize : Int = width * height;
		var pixels = new UInt8Array(imageSize * 4);
		var position:Int = 0x20;
		var bitsLeft : Int = 64;
		var currentRow : Int = 0;
		var bits1:Int = util.BitUtils.reverseI32(src.getInt32(position));
		position += 4;
		var bits2:Int = util.BitUtils.reverseI32(src.getInt32(position));
		position += 4;
		var bitSrc:Array<Int> = interlace64(bits1,bits2,currentRow);
		bits1 = bitSrc[0];
		bits2 = bitSrc[1];
		for (j in 0...imageSize) {
			if (j > 0 && ((j % width) != 0)) {
				if (!noSwizzle) {
					currentRow++;
				}
			}
			if (bitsLeft <= 0) {
				bits1 = util.BitUtils.reverseI32(src.getInt32(position));
				position += 4;
				bits2 = util.BitUtils.reverseI32(src.getInt32(position));
				position += 4;
				bitSrc = interlace64(bits1,bits2,currentRow);
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
			flags : header.flags,
			palette : new UInt8Array(4),
			width : width,
			height : height,
			pixels : pixels
		}
	}

	static function readTextureI8(src:Bytes,header:TDinoPlanetTextureHeader,noSwizzle:Bool) : TDinoPlanetTexture {
		var width : Int = header.width;
		var height : Int = header.height;
		var format : TDinoPlanetTextureFormat = header.format;
		var imageSize : Int = width * height;
		var pixels : UInt8Array = new UInt8Array(imageSize);
		var position:Int = 0x20;
		var bitsLeft : Int = 64;
		var currentRow : Int = 0;
		var bits1:Int = util.BitUtils.reverseI32(src.getInt32(position));
		position += 4;
		var bits2:Int = util.BitUtils.reverseI32(src.getInt32(position));
		position += 4;
		var bitSrc:Array<Int> = interlace64(bits1,bits2,currentRow);
		bits1 = bitSrc[0];
		bits2 = bitSrc[1];
		for (j in 0...imageSize) {
			if (j > 0 && ((j % width) != 0)) {
				if (!noSwizzle) {
					currentRow++;
				}
			}
			if (bitsLeft <= 0) {
				bits1 = util.BitUtils.reverseI32(src.getInt32(position));
				position += 4;
				bits2 = util.BitUtils.reverseI32(src.getInt32(position));
				position += 4;
				bitSrc = interlace64(bits1,bits2,currentRow);
				bits1 = bitSrc[0];
				bits2 = bitSrc[1];
				bitsLeft = 64;
			}
			var pix : Int = 0;
			if (bitsLeft <= 32) {
				pix = (bits2 & 0xff000000) >>> 24;
				bits2 <<= 8;
				bitsLeft -= 8;
			}
			else {
				pix = (bits1 & 0xff000000) >>> 24;
				bits1 <<= 8;
				bitsLeft -= 8;
			}
			pixels[j] = pix;
		}
		return {
			format : format,
			flags : header.flags,
			palette : new UInt8Array(4),
			width : width,
			height : height,
			pixels : pixels
		}
	}

	static function readTextureI4(src:Bytes,header:TDinoPlanetTextureHeader,noSwizzle:Bool) : TDinoPlanetTexture {
		// should i just add the header to the texture type? it might be something
		// that needs to be processed outside of the codec
		var width : Int = header.width;
		var height : Int = header.height;
		var format : TDinoPlanetTextureFormat = header.format;
		var imageSize : Int = width * height;
		// we're outputting RGBA32 for now
		// maybe we shouldn't be doing that?
		// essentilly just creating an ImageData by another name
		// and the editor needs to account for format-specific limitations
		var pixels : UInt8Array = new UInt8Array(imageSize);
		var position:Int = 0x20;
		var bitsLeft : Int = 64;
		var currentRow : Int = 0;
		var bits1:Int = util.BitUtils.reverseI32(src.getInt32(position));
		position += 4;
		var bits2:Int = util.BitUtils.reverseI32(src.getInt32(position));
		position += 4;
		var bitSrc:Array<Int> = interlace64(bits1,bits2,currentRow);
		bits1 = bitSrc[0];
		bits2 = bitSrc[1];
		for (j in 0...imageSize) {
			if (j > 0 && ((j % width) != 0)) {
				if (!noSwizzle) {
					currentRow++;
				}
			}
			if (bitsLeft <= 0) {
				bits1 = util.BitUtils.reverseI32(src.getInt32(position));
				position += 4;
				bits2 = util.BitUtils.reverseI32(src.getInt32(position));
				position += 4;
				bitSrc = interlace64(bits1,bits2,currentRow);
				bits1 = bitSrc[0];
				bits2 = bitSrc[1];
				bitsLeft = 64;
			}
			var pix : Int = 0;
			// U64 in JS not exactly supported
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
			pixels[j] = CLUT4BIT[pix];
		}
		return {
			format : format,
			flags : header.flags,
			palette : new UInt8Array(4),
			width : width,
			height : height,
			pixels : pixels
		}
	}
	
	static function readTextureIA16(src:Bytes,header:TDinoPlanetTextureHeader,noSwizzle:Bool) : TDinoPlanetTexture {
		var width : Int = header.width;
		var height : Int = header.height;
		var format : TDinoPlanetTextureFormat = header.format;
		var imageSize = width * height;
		var pixels : UInt8Array = new UInt8Array(imageSize * 2);
		var position:Int = 0x20;
		var bitsLeft : Int = 64;
		var currentRow : Int = 0;
		var bits1:Int = util.BitUtils.reverseI32(src.getInt32(position));
		position += 4;
		var bits2:Int = util.BitUtils.reverseI32(src.getInt32(position));
		position += 4;
		var bitSrc:Array<Int> = interlace64(bits1,bits2,currentRow);
		bits1 = bitSrc[0];
		bits2 = bitSrc[1];
		for (j in 0...imageSize) {
			if (j > 0 && ((j % width) != 0)) {
				if (!noSwizzle) {
					currentRow++;
				}
			}
			if (bitsLeft <= 0) {
				bits1 = util.BitUtils.reverseI32(src.getInt32(position));
				position += 4;
				bits2 = util.BitUtils.reverseI32(src.getInt32(position));
				position += 4;
				bitSrc = interlace64(bits1,bits2,currentRow);
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
			var base : Int = j * 2;
			pixels[base + 0] = pix;
			pixels[base + 1] = a;
		}
		return {
			format : format,
			flags : header.flags,
			palette : new UInt8Array(4),
			width : width,
			height : height,
			pixels : pixels
		}
	}

	static function readTextureIA8(src:Bytes,header:TDinoPlanetTextureHeader,noSwizzle:Bool) : TDinoPlanetTexture {
		var width  : Int= header.width;
		var height : Int = header.height;
		var format : TDinoPlanetTextureFormat = header.format;
		var imageSize : Int = width * height;
		var pixels : UInt8Array = new UInt8Array(imageSize * 2);
		var position:Int = 0x20;
		var bitsLeft : Int = 64;
		var currentRow : Int = 0;
		var bits1:Int = util.BitUtils.reverseI32(src.getInt32(position));
		position += 4;
		var bits2:Int = util.BitUtils.reverseI32(src.getInt32(position));
		position += 4;
		var bitSrc:Array<Int> = interlace64(bits1,bits2,currentRow);
		bits1 = bitSrc[0];
		bits2 = bitSrc[1];
		for (j in 0...imageSize) {
			if (j > 0 && ((j % width) != 0)) {
				if (!noSwizzle) {
					currentRow++;
				}
			}
			if (bitsLeft <= 0) {
				bits1 = util.BitUtils.reverseI32(src.getInt32(position));
				position += 4;
				bits2 = util.BitUtils.reverseI32(src.getInt32(position));
				position += 4;
				bitSrc = interlace64(bits1,bits2,currentRow);
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
				bitsLeft -= 8;
			}
			else
			{
				pix = (bits1 & 0xf0000000) >>> 28;
				a = (bits1 & 0x0f000000) >>> 24;
				bits1 <<= 8;
				r = CLUT4BIT[pix];
				bitsLeft -= 8;
			}
			var base : Int = j * 2;
			pixels[base + 0] = r;
			pixels[base + 1] = CLUT4BIT[a];
		}
		return {
			format : format,
			flags : header.flags,
			palette : new UInt8Array(4),
			width : width,
			height : height,
			pixels : pixels
		}
	}

	static function readTextureIA4(src:Bytes,header:TDinoPlanetTextureHeader,noSwizzle:Bool) : TDinoPlanetTexture {
		var width : Int = header.width;
		var height : Int = header.height;
		var format : TDinoPlanetTextureFormat = header.format;
		var imageSize : Int = width * height;
		var pixels : UInt8Array = new UInt8Array(imageSize * 4);
		var position:Int = 0x20;
		var bitsLeft : Int = 64;
		var currentRow : Int = 0;
		var bits1:Int = util.BitUtils.reverseI32(src.getInt32(position));
		position += 4;
		var bits2:Int = util.BitUtils.reverseI32(src.getInt32(position));
		position += 4;
		var bitSrc:Array<Int> = interlace64(bits1,bits2,currentRow);
		bits1 = bitSrc[0];
		bits2 = bitSrc[1];
		for (j in 0...imageSize) {
			if (j > 0 && ((j % width) != 0)) {
				if (!noSwizzle) {
					currentRow++;
				}
			}
			if (bitsLeft <= 0) {
				bits1 = util.BitUtils.reverseI32(src.getInt32(position));
				position += 4;
				bits2 = util.BitUtils.reverseI32(src.getInt32(position));
				position += 4;
				bitSrc = interlace64(bits1,bits2,currentRow);
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
				bitsLeft -= 4;
			}
			else
			{
				pix = (bits1 & 0xf0000000) >>> 28;
				a = pix & 0x01;
				pix >>>= 1;
				bits1 <<= 4;
				r = CLUT4BIT[pix * 2];
				bitsLeft -= 4;
			}
			var base : Int = j * 2;
			pixels[base + 0] = r;
			pixels[base + 1] = a * 255;
		}
		return {
			format : format,
			flags : header.flags,
			palette : new UInt8Array(4),
			width : width,
			height : height,
			pixels : pixels
		}
	}

	static function readTextureCI4(src:Bytes,header:TDinoPlanetTextureHeader,noSwizzle:Bool) : TDinoPlanetTexture {
		var width : Int = header.width;
		var height : Int = header.height;
		var format : TDinoPlanetTextureFormat = header.format;
		var imageSize : Int = width * height;
		var pixels : UInt8Array = new UInt8Array(imageSize);
		var bitsLeft : Int = 64;
		var position:Int = 0x20;
		var bitsLeft : Int = 64;
		var currentRow : Int = 0;
		var bits1:Int = util.BitUtils.reverseI32(src.getInt32(position));
		position += 4;
		var bits2:Int = util.BitUtils.reverseI32(src.getInt32(position));
		position += 4;
		var bitSrc:Array<Int> = interlace64(bits1,bits2,currentRow);
		bits1 = bitSrc[0];
		bits2 = bitSrc[1];
		for (j in 0...imageSize) {
			if (j > 0 && ((j % width) != 0)) {
				if (!noSwizzle) {
					currentRow++;
				}
			}
			if (bitsLeft <= 0) {
				bits1 = util.BitUtils.reverseI32(src.getInt32(position));
				position += 4;
				bits2 = util.BitUtils.reverseI32(src.getInt32(position));
				position += 4;
				bitSrc = interlace64(bits1,bits2,currentRow);
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
		var palette = readPalette(src, 16, position);
		return {
			format : format,
			flags : header.flags,
			palette : palette,
			width : width,
			height : height,
			pixels : pixels
		}
	}
	
	static function readTextureCI8(src:Bytes, header:TDinoPlanetTextureHeader, noSwizzle:Bool) : TDinoPlanetTexture {
		var width : Int = header.width;
		var height : Int = header.height;
		var format : TDinoPlanetTextureFormat = header.format;
		var imageSize : Int = width * height;
		var pixels : UInt8Array = new UInt8Array(imageSize);
		var position:Int = 0x20;
		var bitsLeft : Int = 64;
		var currentRow : Int = 0;
		var bits1:Int = util.BitUtils.reverseI32(src.getInt32(position));
		position += 4;
		var bits2:Int = util.BitUtils.reverseI32(src.getInt32(position));
		position += 4;
		var bitSrc:Array<Int> = interlace64(bits1,bits2,currentRow);
		bits1 = bitSrc[0];
		bits2 = bitSrc[1];
		for (j in 0...imageSize) {
			if (j > 0 && ((j % width) != 0)) {
				if (!noSwizzle) {
					currentRow++;
				}
			}
			if (bitsLeft <= 0) {
				bits1 = util.BitUtils.reverseI32(src.getInt32(position));
				position += 4;
				bits2 = util.BitUtils.reverseI32(src.getInt32(position));
				position += 4;
				bitSrc = interlace64(bits1,bits2,currentRow);
				bits1 = bitSrc[0];
				bits2 = bitSrc[1];
				bitsLeft = 64;
			}
			var pix = 0;
			if (bitsLeft <= 32) {
				pix = (bits2 & 0xff000000) >>> 28;
				bits2 <<= 8;
				bitsLeft -= 8;
			}
			else {
				pix = (bits1 & 0xff000000) >>> 28;
				bits1 <<= 8;
				bitsLeft -= 8;
			}
			pixels[j] = pix;
		}
		var palette = readPalette(src,16,position);
		return {
			format : format,
			flags : header.flags,
			palette : palette,
			width : width,
			height : height,
			pixels : pixels
		}
	}
	
	public static function convertToImage(texture:TDinoPlanetTexture,forceOpacity:Bool) : ImageData {
		var img:ImageData = new ImageData(texture.width,texture.height);
		var size:Int = texture.width * texture.height;
		var pal:UInt8Array = texture.palette;
		var f:Int = texture.format.pixelFormat;
		if (f == 7 || f == 8) { // CI formats only
			/* 
				it made more sense to create two copies of this loop than do an extra if statement on every iteration
				does it matter much? probably not
			*/
			if (forceOpacity) {
				for (i in 0...size) {
					var base:Int = i * 4;
					var basePal:Int = texture.pixels[i] * 4;
					img.data[base + 0] = pal[basePal + 0];
					img.data[base + 1] = pal[basePal + 1];
					img.data[base + 2] = pal[basePal + 2];
					img.data[base + 3] = 255;
				}
			} else {
				for (i in 0...size) {
					var base:Int = i * 4;
					var basePal:Int = texture.pixels[i] * 4;
					img.data[base + 0] = pal[basePal + 0];
					img.data[base + 1] = pal[basePal + 1];
					img.data[base + 2] = pal[basePal + 2];
					img.data[base + 3] = pal[basePal + 3];
				}
			}
		} else if (f == 0 || f == 1) { // RGBA32, RGBA16
			if (forceOpacity) {
				for (i in 0...size) {
					var base:Int = i * 4;
					img.data[base + 0] = texture.pixels[base + 0];
					img.data[base + 1] = texture.pixels[base + 1];
					img.data[base + 2] = texture.pixels[base + 2];
					img.data[base + 3] = 255;
				}
			} else {
				for (i in 0...size) {
					var base:Int = i * 4;
					img.data[base + 0] = texture.pixels[base + 0];
					img.data[base + 1] = texture.pixels[base + 1];
					img.data[base + 2] = texture.pixels[base + 2];
					img.data[base + 3] = texture.pixels[base + 3];
				}
			}
		} else if (f == 2 || f == 3) { // I4, I8
			for (i in 0...size) {
				var p = texture.pixels[i];
				var base:Int = i * 4;
				img.data[base + 0] = p;
				img.data[base + 1] = p;
				img.data[base + 2] = p;
				img.data[base + 3] = 255;
			}
		} else if (f == 4 || f == 5 || f == 6) { // IA4 , IA8 , IA16
			if (forceOpacity) {
				for (i in 0...size) {
					var base0 = i * 2;
					var p = texture.pixels[base0];
					// var pa = texture.pixels[base0 + 1]
					var base:Int = i * 4;
					img.data[base + 0] = p;
					img.data[base + 1] = p;
					img.data[base + 2] = p;
					img.data[base + 3] = 255;
				}
			} else {
				for (i in 0...size) {
					var base0 = i * 2;
					var p = texture.pixels[base0];
					var pa = texture.pixels[base0 + 1];
					var base:Int = i * 4;
					img.data[base + 0] = p;
					img.data[base + 1] = p;
					img.data[base + 2] = p;
					img.data[base + 3] = pa;
				}
			}
		}
		return img;
	}

}