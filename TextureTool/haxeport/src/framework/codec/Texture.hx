package framework.codec;

typedef TDinoPlanetTextureHeader = {
	// TODO
}

typedef TDinoPlanetTexture = {
	// TODO
}
// decodes and encodes textures in Dinosaur Planet's expected format
class Texture 
{
	// TODO!!!
	
	// need encodeTexture
	// some textures in TEX0 don't decode properly on their own
	// temp[?] solution will be an override settings object
	// that will be stored in the manifest entries
	public static function decodeTexture() : TDinoPlanetTexture {
		
	}
	
	// debug funcs:
	// dumpTextureInfo, dump1B
	
	// util funcs belong elsewhere
	// fSize, truncateDecimals
	
	// need compressTexture
	static function decompressTexture() : DataStream {}
	
	static function readTextureHeader() : TDinoPlanetTextureHeader {}
	
	// need setBits & setBits32
	// these also are very small and get used a lot
	// inline?
	static function getBits() : Array<Int> {}
	
	static function getBits32() : Array<Int> {}
	
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