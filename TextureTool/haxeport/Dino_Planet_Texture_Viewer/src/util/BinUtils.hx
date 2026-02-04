package util;
import haxe.io.UInt8Array;
import js.lib.ArrayBuffer;
import haxe.io.Bytes;
import lib.ByteThingyWhatToNameIt; // purge

class BinUtils
{
	// gross ... 
	public static inline function createByteArray(src:ArrayBuffer,end:Bool) {
		var bytearr:Bytes = Bytes.ofData(src);
		return new ByteThingyWhatToNameIt(bytearr, end);
	}
	
	public static inline function BytesToU8Array(src:Bytes) : UInt8Array {
		var out:UInt8Array = new UInt8Array(src.length);
		for (i in 0...src.length) {
			out[i] = src.get(i);
		}
		return out;
	}
	
	public static inline function readU8ArrayFromBytes(src,pos,length) : UInt8Array {
		var out:UInt8Array = new UInt8Array(length);
		for (i in 0...length) {
			out[i] = src.get(pos + i);
		}
		return out;
	}
	
	public static inline function U8ArrayToBytes(src:UInt8Array) : Bytes {
		var out:Bytes = Bytes.alloc(src.length);
		for (i in 0...src.length) {
			out.set(i,src[i]);
		}
		return out;
	}
	
	
}