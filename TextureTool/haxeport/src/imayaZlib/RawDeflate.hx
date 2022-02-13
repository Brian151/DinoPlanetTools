package imayaZlib;
import haxe.io.UInt8Array;

@:native("Zlib.RawDeflate") extern class RawDeflate 
{

	public function new(src:UInt8Array);
	public function compress():UInt8Array;
	
}