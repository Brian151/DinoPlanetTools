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
	public var length(get, null):Int;

	public function new(src:Bytes,endian:Bool) {
		tgt = src;
		position = 0;
		littleEndian = endian;
	}
	
	public function get_length() {
		return tgt.length;
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
	
	public function readInt8() {
		var n = readUint8();
		var flag = ((n & 0x80) >> 7) == 1;
		if (flag) {
			n |= Util.signExtension[31 - 7];
		}
	}
	
	public function readInt16(endian) {
		var n = readUint16(endian);
		var flag = ((n & 0x8000) >> 15) == 1;
		if (flag) {
			n |= Util.signExtension[31 - 15];
		}
		return n;
	}
	
	public function readInt32(endian) {
		var n = readUint32(endian);
		var flag = ((n & 0x80000000) >> 31) == 1;
		if (flag) {
			n |= Util.signExtension[31 - 31];
		}
		return n;
	}
	
	public function readInt24(endian) {
		var n = readUint24(endian);
		var flag = ((n & 0x800000) >> 23) == 1;
		if (flag) {
			n |= Util.signExtension[31 - 23];
		}
		return n;
	}
	
	public function readUint8Array(length:Int) {
		var out = new UInt8Array(length);
		for (i in 0...length) {
			out[i] = readUint8();
		}
		return out;
	}
	
	public function readByteThingy(length:Int,endian:Bool) : ByteThingyWhatToNameIt {
		var outBytes = Bytes.alloc(length);
		outBytes.blit(0, tgt, position, length);
		position += length;
		return new ByteThingyWhatToNameIt(outBytes, endian);
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
	
	public function readBytes(length:Int) {
		var out = Bytes.alloc(length);
		out.blit(0, tgt, position, length);
		return out;
	}
	
	// writing later...
	public function writeUint8(v:Int) {
		tgt.set(position, v & 255);
		position++;
	}
	
	public function writeUint16(v:Int, endian:Bool) {
		var a:Int = (v & 0xff00) >> 8;
		var b:Int = v & 0xff;
		if (endian || littleEndian) {
			tgt.set(position, b);
			tgt.set(position + 1,a);
		} else {
			tgt.set(position, a);
			tgt.set(position + 1,b);
		}
		position += 2;
	}
	
	public function writeUint32(v:Int,endian:Bool) {
		var a:Int = (v & 0xff000000) >> 24;
		var b:Int = (v & 0xff0000) >> 16;
		var c:Int = (v & 0xff00) >> 8;
		var d:Int = v & 0xff;
		if (endian || littleEndian) {
			tgt.set(position, d);
			tgt.set(position + 1, c);
			tgt.set(position + 2, b);
			tgt.set(position + 3, a);
		} else {
			tgt.set(position, a);
			tgt.set(position + 1, b);
			tgt.set(position + 2, c);
			tgt.set(position + 3, d);
		}
		position += 4;
	}
	
	public function writeUint24(v:Int, endian:Bool) {
		var a:Int = (v & 0xff0000) >> 16;
		var b:Int = (v & 0xff00) >> 8;
		var c:Int = v & 0xff;
		if (endian || littleEndian) {
			tgt.set(position, c);
			tgt.set(position + 1, b);
			tgt.set(position + 2, a);
		} else {
			tgt.set(position, a);
			tgt.set(position + 1, b);
			tgt.set(position + 2, c);
		}
		position += 3;
	}
	
	public function writeUint8Array(src:UInt8Array) {
		for (i in 0...src.length) {
			writeUint8(src[i]);
		}
	}
	
	//eventually, floats T-T
	
	// EVENTUALLY, bit-fiddling
	
}