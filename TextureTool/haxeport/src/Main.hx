package;
import imayaZlib.RawDeflate;
import js.Browser.console;
import haxe.io.UInt8Array;
import js.Lib;
import js.html.ArrayBuffer;
import js.html.Blob;

/**
 * ...
 * @author Brian
 */
class Main 
{
	
	static function main() 
	{
		var dat:ArrayBuffer = new ArrayBuffer(256);
		var arr:Array<ArrayBuffer> = new Array();
		arr.push(dat);
		//FileSaver.saveAs(new Blob(arr), "256.bin");
		var ds:DataStream = new DataStream(dat,0,false);
		console.log(ds.readUint32());
		console.log(ds.position);
		var test:RawDeflate = new RawDeflate(new UInt8Array(256));
		var test2:UInt8Array = test.compress();
		console.log(test2);
		console.log(MD5.hash("testing!"));
	}
}