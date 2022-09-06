package framework;
import haxe.io.BufferInput; // need?
import haxe.io.UInt8Array;
import haxe.io.UInt16Array;
import haxe.io.UInt32Array;
import haxe.io.Bytes;
import js.Syntax; // unfortunate...


class ByteThingyWhatToNameIt 
{
	public var tgt : Bytes;
	public var position : Int;
	var littleEndian : Bool;

	public function new(src:Bytes,endian:Bool) {
		tgt = src;
		position = 0;
		littleEndian = endian;
	}
	
	public function readUint8() {
		var out:Int = tgt.get(position);
		position++;
		return out;
	}
	
	public function readUint16(endian) {
		var a:Int = tgt.get(position);
		var b:Int = tgt.get(position + 1);
		if (endian || littleEndian) {
			position += 2;
			return (b << 8) + a; 
		}
		position += 2;
		return (a << 8) + b;
	}
	
	public function readUint32(endian) {
		var a:Int = tgt.get(position);
		var b:Int = tgt.get(position + 1);
		var c:Int = tgt.get(position + 2);
		var d:Int = tgt.get(position + 3);
		if (endian || littleEndian) {
			position += 4;
			return (d << 24) + (c << 16) + (b << 8) + a; 
		}
		position += 4;
		return (a << 24) + (b << 16) + (c << 8) + d;
	}
	
	// although rare, this *is* a thing, SMH!
	public function readUint24(endian) {
		var a:Int = tgt.get(position);
		var b:Int = tgt.get(position + 1);
		var c:Int = tgt.get(position + 2);
		if (endian || littleEndian) {
			position += 3;
			return (c << 16) + (b << 8) + a; 
		}
		position += 3;
		return (a << 16) + (b << 8) + c;
	}
	
	// TODO : ACTUALLY IMPLEMENT SIGNED INTS!!!
	public function readInt8(endian) {
		return readUint8();
	}
	
	public function readInt16(endian) {
		return readUint16(endian);
	}
	
	public function readInt32(endian) {
		return readUint32(endian);
	}
	
	public function readInt24(endian) {
		return readUint24(endian);
	}
	
	public function readUint8Array(length:Int) {
		var out = new UInt8Array(length);
		for (i in 0...length) {
			out[i] = readUint8();
		}
		return out;
	}
	
	public function readUint16Array(length:Int,endian:Bool) {
		var out = new UInt16Array(length);
		for (i in 0...length) {
			out[i] = readUint16(endian);
		}
		return out;
	}
	
	public function readUint32Array(length:Int,endian:Bool) {
		var out = new UInt32Array(length);
		for (i in 0...length) {
			out[i] = readUint32(endian);
		}
		return out;
	}
	
	// writing later...
	public function writeUint8(v:Int) {
		tgt.set(position, v & 255);
		position++;
	}
	
	public function writeUint8Array(src:UInt8Array) {
		for (i in 0...src.length) {
			writeUint8(src[i]);
		}
	}
	
	public function inflate(src:UInt8Array,write:Bool) : UInt8Array {
		#if js
			var decompressed:UInt8Array = Syntax.code("new Zlib.RawInflate({0}).decompress()", src);
			if (write) {
				writeUint8Array(decompressed);
			}
			return decompressed;
		#else
			throw new Error("not implemented for this target (yet)");
			return new UInt8Array(1);
		#end
	}
	
	public function deflate(src:UInt8Array,write:Bool) : UInt8Array {
		#if js
			var compressed:UInt8Array = Syntax.code("new Zlib.RawDeflate({0}).decompress()", src);
			if (write) {
				writeUint8Array(compressed);
			}
			return compressed;
		#else
			throw new Error("not implemented for this target (yet)");
			return new UInt8Array(1);
		#end
	}
	
	//eventually, floats T-T
	
	// EVENTUALLY, bit-fiddling
	
}