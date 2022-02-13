package;
import js.html.ArrayBuffer;
import js.html.Uint32Array;
import js.html.Uint16Array;
import js.html.Uint8Array;
import js.html.Int32Array;
import js.html.Int16Array;
import js.html.Int8Array;


extern class DataStream 
{
	// pretty sure it is not intended to be public 
	// but i tend to overwrite it a lot
	public var position:Int;
	
	public function new(src:ArrayBuffer, offset:Int, endian:Bool);
	
	public function readUint32(?endian:Bool) : Int;
	public function readUint16(?endian:Bool) : Int;
	public function readUint8(?endian:Bool) : Int;
	
	public function readInt32(?endian:Bool) : Int;
	public function readInt16(?endian:Bool) : Int;
	public function readInt8(?endian:Bool) : Int;
	
	public function readUint32Array(length:Int,?endian:Bool) : Uint32Array;
	public function readUint16Array(length:Int,?endian:Bool) : Uint16Array;
	public function readUint8Array(length:Int,?endian:Bool) : Uint8Array;
	
	public function readInt32Array(length:Int,?endian:Bool) : Int32Array;
	public function readInt16Array(length:Int,?endian:Bool) : Int16Array;
	public function readInt8Array(length:Int,?endian:Bool) : Int8Array;
	
	
}