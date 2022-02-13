package imayaZlib;
import haxe.io.UInt8Array;

@:native("Zlib.RawInflate") extern class RawInflate 
{

	public function new(src:UInt8Array);
	public function decompress():UInt8Array;
	
}