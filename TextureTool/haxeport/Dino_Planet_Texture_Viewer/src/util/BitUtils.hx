package util;

class BitUtils 
{
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
	
	public static inline function reverseI16(input:Int) : Int {
		var mask = 0xff;
		var out = (input & mask) << 8;
		input >>= 8;
		out |= (input & mask);
		return out;
	}
	
	public static inline function reverseI24(input:Int) {
		// TODO
	}
}