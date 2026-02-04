package editor;
import lib.dinoplanet.TexPack;
import editor.ManifestDB.TDPFileManifest;

class EditorState 
{
	public var bin:TexPack;
	public var manifest:TDPFileManifest;
	public var currTex:Int = 0;
	// need to store the actual textures being edited somehow... , TODO !

	public function new(/*binfile:BinPack,mfdb:ManifestDB*/) {
	//	bin = binfile;
	//	manifest = mfdb;
	}
}