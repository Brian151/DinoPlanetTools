package framework.codec;

// TODO
class Qoi 
{
	var magic : Int = 0x716F6966; // "qoif"
	var op_rgb : Int = 0x0fe;  // 1111 1110
	var op_rgba : Int = 0x0ff; // 1111 1111
	var op_index : Int = 0;    // 00
	var op_diff : Int = 1;     // 01
	var op_luma : Int = 2;     // 10
	var op_run : Int = 3;      // 11

	public static function decode() {
		
	}
	
	public static function encode() {
		
	}
	
}