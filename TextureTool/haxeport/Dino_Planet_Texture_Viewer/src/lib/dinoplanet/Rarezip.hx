package lib.dinoplanet;
import haxe.io.Bytes;
import haxe.io.UInt8Array;
import pako.Pako;
import js.Browser.console; // NEED TO X-PLAT
import util.BinUtils;

class Rarezip 
{
	// TODO
	/*public static function compress(src:ByteThingyWhatToNameIt) : ByteThingyWhatToNameIt {
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
	}*/
	
	public static function decompress(src:Bytes) : Bytes {
		var size:Int = src.getInt32(0);
		var level:Int = src.get(4);
		var compressedSize = src.length - 5;
		
		#if js
			var compressed:UInt8Array = BinUtils.readU8ArrayFromBytes(src, 5, compressedSize);
			// dual cast cuz whiny compiler... 
			var decompressed:UInt8Array = cast Pako.inflateRaw(cast compressed);
		#else
			throw "not implemented";
		#end
		
		if (decompressed.length != size) {
			console.log(size, util.Util.hexa(size));
			console.log(decompressed.length,util.Util.hexa(decompressed.length));
			throw "decompressed size does not match";
			
		}
		
		var out:Bytes = BinUtils.U8ArrayToBytes(decompressed);
		return out;
	}
}