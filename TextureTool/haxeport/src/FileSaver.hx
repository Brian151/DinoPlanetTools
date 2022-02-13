package;
import js.html.Blob;


@:native("window") extern class FileSaver 
{

	static function saveAs(data:Blob, fileName:String):Void;
	
}