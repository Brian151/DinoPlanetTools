package framework.codec;
import imayaZlib.RawInflate;
import js.Error;
import js.html.ArrayBuffer;
import js.html.Uint8Array;

typedef TDinoPlanetTextureHeader = {
	// technically, these are not all Ints...
	width : Int,
	height : Int,
	format : Int,
	unk_0x3 : Int,
	unk_0x4 : Int,
	flags : Int,
	PTR_Gfx : Int,
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
	pixels : Uint8Array,
	palette : Uint8Array
}

typedef TTextureFormatOverride = {
	format : Int,
	width : Int,
	height : Int,
	noSwizzle : Bool,
	forceOpacity : Bool
}

// decodes and encodes textures in Dinosaur Planet's expected format
class Texture 
{
	// TODO!!!
	
	// some textures in TEX0 don't decode properly on their own
	// temp[?] solution will be an override settings object
	// that will be stored in the manifest entries
	public static function decodeTexture(src:DataStream/*,?hack:TTextureFormatOverride*/) : TDinoPlanetTexture {
		var raw = decompressTexture(src);
		var header = readTextureHeader(raw);
		
		switch header.format {
			case 0 : 
				return readTextureRGBA32(raw,header);
			case 1 :
				return readTextureRGBA16(raw,header);
			case 2 :
				return readTextureIA8(raw,header);
			case 3 : 
				return readTextureIA4P(raw,header);
			case 4 :
				return readTextureIA16(raw,header);
			case 5 :
				return readTextureIA8T(raw,header);
			case 6 :
				return readTextureIA4(raw,header);
			case 7 :
				return readTextureCI4(raw,header);
			default : 
				throw new Error("unknown texture format!");
		}
	}
	
	public static function encodeTexture() : Uint8Array {
		// TODO
		throw new Error("not implemented");
		return {
			format : -1,
			width : 0,
			height : 0,
			pixels : new Uint8Array(0),
			palette : new Uint8Array(0)
		}
	}
	
	// debug funcs:
	// dumpTextureInfo, dump1B
	
	// util funcs belong elsewhere
	// fSize, truncateDecimals
	
	// making these public is debatable, however the manifest needs this feature
	// and it makes little sense to code-dupe it
	// maybe add a param to make decode/encode return raw texture data?
	public static function decompressTexture(src:DataStream,sizeComp:Int) : DataStream {
		var size:Int = src.readInt32();
		var what:Int = src.readUint8();
		
		var compressed:Uint8Array = src.readUint8Array(sizeComp - 5);
		var decompressed:Uint8Array = new RawInflate(compressed).decompress();
		var outBuffer:ArrayBuffer = new ArrayBuffer(decompressed.length);
		var out:DataStream = new DataStream(outBuffer, 0, false);
		out.writeUint8Array(decompressed);
		
		return out;
	}
	
	public static function compressTexture(src:Uint8Array) : Uint8Array {
		throw new Error("compression not implemented");
		
		return new Uint8Array(0);
	}
	
	static function readTextureHeader(src:DataStream) : TDinoPlanetTextureHeader {
		return {
			width : src.readUint8(),
			height : src.readUint8(),
			format : src.readUint8(), 
			unk_0x3 : src.readUint8(),
			unk_0x4 : src.readUint16(),
			flags : src.readInt16(),
			PTR_gdl : src.readUint32(),
			levels : src.readUint16(),
			unk_0xe : src.readUint16(),
			unk_0x10 : src.readUint16(),
			gdlIdx : src.readInt16(),
			PTR_next : src.readUint32(),
			unk_0x18 : src.readInt16(), // pixelBufferSize?
			unk_0x1a : src.readUint8(),
			unk_0x1b : src.readUint8(),
			cms : src.readUint8(),
			masks : src.readUint8(),
			cmt : src.readUint8(),
			maskt : src.readUint8()
		}
	}
	
	// TODO, need to add various write methods to DataStream extern
	static function writeTextureHeader(src:TDinoPlanetTextureHeader) : Uint8Array {
		var dest = new DataStream(new ArrayBuffer(32), 0, false);
		throw new Error("texture header write not supported!");
		return new Uint8Array(0);
	}
	
	// need setBits & setBits32
	// re-name "deSwizzleBits[32]" & "swizzleBits[32]" respectively?
	// get/set is a biiit strange since these don't simply retrieve bits,
	// but potentially re-order them
	// these also are very small and get used a lot
	// inline?
	
	static function getBits(src:DataStream , row:Int) : Array<Int> {
		var out:Array<Int> = new Array();
		var bits1:Int = src.readUint32();
		var bits2:Int = src.readUint32();
		if ((row % 2) == 1) {
			out.push(bits2); // yuck!
			out.push(bits1);
		} else {
			out.push(bits1);
			out.push(bits2);
		}
		return out;
	}
	
	static function getBits32(src:DataStream , row:Int) : Array<Int> {
		var out:Array<Int> = new Array();
		var bits1:Int = src.readUint32();
		var bits2:Int = src.readUint32();
		var bits3:Int = src.readUint32();
		var bits4:Int = src.readUint32();
		if ((row % 2) == 1) {
			out.push(bits3);
			out.push(bits4);
			out.push(bits1);
			out.push(bits2);
		} else {
			out.push(bits1);
			out.push(bits2);
			out.push(bits3);
			out.push(bits4);
		}
		return out;
	}
	
	// tbh, probably should be a util func
	// need an RGB16 > RGBA32 function
	// but then, what to re-name this?
	// return type debatable
	static function RGBA16() : Array<Int> {} 
	
	// currently using a U8 Array as return, should i abstract a palette type?
	// need writePalette
	static function readPalette() {}
	
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
	
	static function readTextureIA4P() : TDinoPlanetTexture {}
	
	static function readTextureIA16() : TDinoPlanetTexture {}
	
	static function readTextureIA8() : TDinoPlanetTexture {}
	
	static function readTextureIA4() : TDinoPlanetTexture {}
	
	static function readTextureIA8T() : TDinoPlanetTexture {}
	
	static function readTextureRGBA32() : TDinoPlanetTexture {}
	
	static function readTextureRGBA16() : TDinoPlanetTexture {}
	
	static function readTextureCI4() : TDinoPlanetTexture {}
	
	// these should probably not be handled by the [en/de]coder at all
	function drawTexture(){}
	function drawPalette(){}

}