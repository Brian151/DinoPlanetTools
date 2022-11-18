package framework;
import framework.codec.Texture.TTextureFormatOverride;

// TODO : generalize
typedef TDPFileManifest = {
	fileName : String,
	fileHash : String,
	name : String,
	resources : Array<TManifestResourceEntry>
}

typedef TManifestResourceEntry = {
	ordinalId : Int,
	type : String,
	name : String,
	tags : Array<String>,
	path : String,
	hash : String,
	sources : Array<TDPManifestSourceFileReference>,
	resInfo : TDPManifestTextureInfoNew // todo
}

typedef TDPTextureOverrideDB = {
	overrides : Array<TTextureFormatOverride>,
	textureIDs : Array<Int>
}

typedef TDPManifestTextureInfoNew = {
	// each frame needs an entry for itself [?]
	frames : Array<TDPManifestTextureInfoNew>,
	// MD5 hash of [decompressed] file/data, identify duplicate/altered files
	hash : String, 
	// is there a reason to keep this? headers concievably could change
	format : Int, 
	width : Int,
	height : Int,
	formatOVR : TTextureFormatOverride
}


// better name? 
typedef TDPManifestSourceFileReference = {
	// TODO
	fileName : String, // "Krystal Eye.psd"
	// the editor likely will not officially support these files, 
	// but hash is still useful for verification and edit diffs
	// toolchaining MIGHT be looked-into [unlikely, and very low priority]
	hash : String,
	// never assume users store things in the same places, they don't
	// some files may even exist on external drives or web servers
	// latter would likely be a pain, particularly for web build of tool
	// [desktop builds currently don't exist so...]
	path : String
}

// NEEDS RE-WORK (make generic)!
class ManifestDB 
{
	// Manifest DBs are JSON objects to make editing Binpacks easier
	// they contain filenames, folder/directory paths, tags,
	// and even references to source files [like texture CDs]
	// they also contain pack names, pack descriptions, and
	// an MD5 hash of the raw [uncompressed] file
	
	// currently, these only support textures and have not been generalized
	// when/if project files and/or workspaces are implemented, 
	// manifestDBs will play an essential role
	
	public var texturePackName : String;
	public var texturePackHash : String;
	public var name : String;
	public var textures : Array<TDPManifestTextureInfoNew>;
}