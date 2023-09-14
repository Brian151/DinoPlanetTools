package lib;
import framework.ByteThingyWhatToNameIt;
import haxe.io.Bytes;
import haxe.io.UInt8Array;
import pako.Pako;

class Rarezip 
{
	public static function compress(src:ByteThingyWhatToNameIt) : ByteThingyWhatToNameIt {
		var size:Int = src.length;
		
		#if js
			src.position = 0;
			var rawBytes = src.readUint8Array(size);
			// dual cast cuz whiny compiler... 
			var compressed:UInt8Array = cast Pako.deflateRaw(cast rawBytes, {level:9});
		#else
			throw "not implemented";
		#end
		
		var out = new ByteThingyWhatToNameIt(Bytes.alloc(compressed.length + 5),false);
		out.writeUint32(size, true);
		out.writeUint8(9);
		out.writeUint8Array(compressed);
		out.position = 0;
		
		return out;
	}
	
	public static function decompress(src:ByteThingyWhatToNameIt) : ByteThingyWhatToNameIt {
		var size:Int = src.readUint32(true);
		var level:Int = src.readUint8();
		var compressedSize = src.length - 5;
		
		#if js
			var compressed:UInt8Array = src.readUint8Array(compressedSize);
			// dual cast cuz whiny compiler... 
			var decompressed:UInt8Array = cast Pako.inflateRaw(cast compressed);
		#else
			throw "not implemented";
		#end
		
		if (decompressed.length != size) {
			throw "decompressed size does not match";
		}
		
		var out:ByteThingyWhatToNameIt = new ByteThingyWhatToNameIt(Bytes.alloc(decompressed.length), false);
		out.writeUint8Array(decompressed);
		out.position = 0; // for a fun bug : don't do this
		return out;
	}
}