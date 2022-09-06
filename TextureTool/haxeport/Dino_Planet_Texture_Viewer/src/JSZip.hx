package;
//import js.Promise;
import js.html.ArrayBuffer;
import js.html.Blob;
import js.html.UInt8Array;


typedef JsZipAsyncSettings = {
	type : String
}
extern class JSZip 
{

	public function new();
	
	// promise type params causing issue, will use hand-coded JS for this bit
	// till i know what i am doing >.<
	// public function generateAsync() : Promise<Dynamic>;

	
#if (haxe_ver >= 4)
	public function test<T:String & ArrayBuffer & UInt8Array & Blob>(name:String,data:T) : JSZip;
#else
	public function file<T:(String , ArrayBuffer, UInt8Array, Blob)>(name:String,data:T) : JSZip;
#end
}