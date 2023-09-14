package framework.dev;
import Reflect;
import framework.ManifestDB.TDPFileManifest;
import js.Browser;

class ManifestConverter 
{
	/*
		! WARNING !
		internal development code not meant for general use
		may corrupt data and/or crash program
	*/
	
	// "version 1" to "version 2" was done with hand-coded JS and was not saved,
	//   overrides were merged with the manifest data
	
	// updates from "version 2" to "version 3" , 
	//   removing width, height, format overrides,
	//   re-naming format strings correctly[?]
	public static function update2() {
		var mf = Main.ROM.manifest;
		for (i in 0...mf.resources.length){
			var res = mf.resources[i].resInfo;
			var w = Reflect.getProperty(res.formatOVR,"width");
			var h = Reflect.getProperty(res.formatOVR,"height");
			Reflect.deleteField(res.formatOVR, "format");
			if (w > 0) { // re-encode previously overridden width/height 
				res.width = w;
			}
			if (h > 0) {
				res.height = h;
			}
			Reflect.deleteField(res.formatOVR, "width");
			Reflect.deleteField(res.formatOVR, "height");
			mf.resources[i].resInfo.formatOVR = res.formatOVR;
			switch(res.format) {
				case "IA8P" : // only these two are wrong
					res.format = "I8";
				case "IA4P" :
					res.format = "I4";
				default : 
			}
		}
		Main.exportManifest();
	}
	
	
}