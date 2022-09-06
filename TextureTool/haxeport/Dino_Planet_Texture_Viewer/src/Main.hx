package;
import haxe.io.Bytes;
import framework.codec.Texture;
// import haxe.crypto.Md5;
// import framework.codec.Qoi;
import haxe.io.UInt8Array;
import haxe.io.UInt16Array;
import haxe.io.UInt32Array;
import js.Syntax;
import framework.ByteThingyWhatToNameIt;

class Main 
{
	
	static function main() 
	{
		// ugly hax enable old "Main()" code to be used, for now...
		Syntax.code("window.parseTexture = {0}",Texture.decodeTexture);
		Syntax.code("window.createByteArray = function(src) {var buf = {0}(src.length);var arr = new {1}(buf,false);arr.writeUint8Array(src);arr.position = 0;return arr;}", Bytes.alloc, ByteThingyWhatToNameIt);
	}
}