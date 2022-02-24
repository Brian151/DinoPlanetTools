package;
import imayaZlib.RawDeflate;
import js.Browser.console;
import js.lib.Uint8Array;
import js.Lib;
import js.lib.ArrayBuffer;
import js.html.Blob;
import framework.codec.Texture;

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
		var test:RawDeflate = new RawDeflate(new Uint8Array(256));
		var test2:Uint8Array = test.compress();
		console.log(test2);
		console.log(MD5.hash("testing!"));
		Texture.decodeTexture(ds,100);
	}
}