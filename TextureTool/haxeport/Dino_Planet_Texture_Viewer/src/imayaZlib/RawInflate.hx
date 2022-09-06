package imayaZlib;
import js.lib.Uint8Array;

@:native("Zlib.RawInflate") extern class RawInflate 
{

	public function new(src:Uint8Array);
	public function decompress():Uint8Array;
	
}