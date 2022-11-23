package framework.codec;
import framework.ByteThingyWhatToNameIt;


// format spec provided by Banjeoin of the Dino Planet Community Discord Server

// do i really need this object ???
typedef TDPFontContainer = { 
	count : Int,
	fonts : Array<TDPFont>
}

typedef TDPFont = {
	name : String,
	textures : Array<Int>, // todo : bind actual textures
	characters : Array<TDPFontCharacterDefinition>
}

typedef TDPFontCharacterDefinition = {
	texture : Int,
	kerning : Int,
	scrOffX : Int,
	scrOffY : Int,
	u : Int,
	v : Int,
	width : Int,
	height : Int
}

class FontBin 
{
	public static function readFontBin(src:ByteThingyWhatToNameIt) : TDPFontContainer {
		var numCount : Int = src.readInt32(false);
		var out : TDPFontContainer = {
			count : numCount,
			fonts : new Array()
		}
		for (i in 0...count) {
			out.fonts.push(readFont(src));
		}
		return out;
	}
	
	public static function readFont(src:ByteThingyWhatToNameIt) : TDPFont {
		var out : TDPFont = {
			name : readFontName(src),
			textures : new Array(),
			characters : new Array()
		}
		for (i in 0...256) {
			out.textures.push(src.readInt16(false));
		}
		for (j in 0...256) {
			out.characters.push(readFontCharacter);
		}
		return out;
	}
	
	public static function readFontName(src:ByteThingyWhatToNameIt) : String {
		var out = "";
		for (i in 0...0x40) {
			var c = src.readUint8();
			if (c >= 32) {
				out += String.fromCharCode(c);
			}
		}
		return out;
	}
	
	public static function readFontCharacter(src:ByteThingyWhatToNameIt) : TDPFontCharacterDefinition {
		var out : TDPFontCharacterDefinition = {
			texture : src.readUint8(),
			kerning : src.readUint8(),
			scrOffX : src.readUint8(),
			scrOffY : src.readUint8(),
			u : src.readUint8(),
			v : src.readUint8(),
			width : src.readUint8(),
			height : src.readUint8()
		}
		return out;
	}
}