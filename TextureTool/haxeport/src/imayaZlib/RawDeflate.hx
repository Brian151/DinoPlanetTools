package imayaZlib;
import js.lib.Uint8Array;

@:native("Zlib.RawDeflate") extern class RawDeflate 
{

	public function new(src:Uint8Array);
	public function compress():Uint8Array;
	
}