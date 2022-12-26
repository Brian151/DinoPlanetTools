package framework.editor;
import framework.codec.BinPack;
import framework.ManifestDB.TDPFileManifest;

class EditorState 
{
	public var bin:BinPack;
	public var manifest:TDPFileManifest;
	public var currTex:Int = 0;
	// need to store the actual textures being edited somehow... , TODO !

	public function new(/*binfile:BinPack,mfdb:ManifestDB*/) {
	//	bin = binfile;
	//	manifest = mfdb;
	}
}