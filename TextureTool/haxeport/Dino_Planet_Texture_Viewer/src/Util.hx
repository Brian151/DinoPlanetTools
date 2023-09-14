package;
import haxe.io.UInt8Array;
import js.lib.ArrayBuffer;
import js.lib.Uint8Array;
import haxe.io.Bytes;
import framework.ByteThingyWhatToNameIt;

// TODO : split this, will regret not doing so later!

class Util 
{
	// > Math
	public static var signExtension:Array<Int> = [
		-1, // 0
		-2,
		-4,
		-8,
		-16,
		-32,
		-64,
		-128,
		-256, // 8
		-512,
		-1024,
		-2048,
		-4096,
		-8192,
		-16384,
		-32768,
		-65536, // 16
		-131072,
		-262144,
		-524288,
		-1048576,
		-2097152,
		-4194304,
		-8388608,
		-16777216, // 24
		-33554432,
		-67108864,
		-134217728,
		-268435456,
		-536870912,
		-1073741824,
		-2147483648 // 31
	];
	
	// > ???
	// B > KB > MB > GB > ...
	public static function dataSize(size:Int) : String {
		var k : Int = 1024; 
		var m : Int = k * k;
		var g : Int = m * k; // NEVER gonna happen in an N64 game...lol
		
		var fk : Int = Math.floor(size / k);
		var fm : Int = Math.floor(size / m); 
		var fg : Int = Math.floor(size / g);
		
		if (fg >= 1) {
			return truncateDecimals(fg,2) + " GB";
		} else if (fm >= 1) {
			return truncateDecimals(fm,2) + " MB";
		} else if (fk >= 1) {
			return truncateDecimals(fk,2) + " KB";
		}
		return size + " B";
	}
	
	// > Math?
	/* 
		toFixed(), without rounding
		https://stackoverflow.com/a/12810744
	*/
	public static inline function truncateDecimals(num:Int, places:Int) : String {
		var num2 : String = Std.string(num); //If it's not already a String
		var out : String = num2.substr(0, (num2.indexOf(".")) + (places + 1));
		return out;
	}
	
	// > ???
	// gross ... 
	public static function createByteArray(src:ArrayBuffer,end:Bool) {
		var bytearr:Bytes = Bytes.ofData(src);
		return new ByteThingyWhatToNameIt(bytearr, end);
	}
	
	// > Math?
	public static function hexa(n:Int) : String {
		return StringTools.hex(n,2);
	}
	
	public static inline function BytesToU8Array(src:Bytes) : UInt8Array {
		var out:UInt8Array = new UInt8Array(src.length);
		for (i in 0...src.length) {
			out[i] = src.get(i);
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
	
	public static inline function reverseI32(input:Int) : Int {
		var mask = 0xff;
		var out = (input & mask) << 24;
		input >>= 8;
		out |= (input & mask) << 16;
		input >>= 8;
		out |= (input & mask) << 8;
		input >>= 8;
		out |= (input & mask);
		return out;
	}
	
	public static inline function reverseI16(input:Int) {
		// TODO
	}
	
	public static inline function reverseI24(input:Int) {
		// TODO
	}
}