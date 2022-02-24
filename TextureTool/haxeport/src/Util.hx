package;

// TODO : split this, will regret not doing so later!

class Util 
{
	// B > KB > MB > GB > ...
	public static function dataSize(size:Int) : String {
		var k : Int = 1024; 
		var m : Int = k * k;
		var g : Int = m * k; // NEVER gonna happen in an N64 game...lol
			
		var fk : Int = size / k;
		var fm : Int = size / m; 
		var fg : Int = size / g;
			
		if (fg >= 1) {
			return truncateDecimals(fg,2) + " GB";
		} else if (fm >= 1) {
			return truncateDecimals(fm,2) + " MB";
		} else if (fk >= 1) {
			return truncateDecimals(fk,2) + " KB";
		}
		return size + " B";
	}
	
	/* 
		toFixed(), without rounding
		https://stackoverflow.com/a/12810744
	*/
	public static inline function truncateDecimal(num:Int,places:Int) : String {
		var num2 : String = num.toString(); //If it's not already a String
		var out : String = num2.slice(0, (num2.indexOf(".")) + (places + 1));
		return out;
	}
	
}