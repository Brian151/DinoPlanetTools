package framework;
import framework.codec.Texture.TTextureFormatOverride;

// TODO : generalize
typedef TDPFileManifest = {
	texturePackName : String,
	texturePackHash : String,
	name : String,
	textures : Array<TDPManifestTextureInfo>
}

typedef TDPTextureOverrideDB = {
	overrides : Array<TTextureFormatOverride>,
	textureIDs : Array<Int>
}

// should split this out to 
// ManifestEntry [general-purpose] 
// and ManifestTextureInfo [unique : textures]
typedef TDPManifestTextureInfo = {
	// general-purpose fields
	ordinalId : Int, // position in the pack
	name : String, // "Krystal Eye" for searching & export/import
	tags : Array<String>, // ["object","player","krystal"] for searching
	path : String, // "objects/player/krystal/eye" , used specifically during export/import
	// texture-specific
	isArrayTexture : Bool, // indicates array textures , might not need
	subTextures : Array<TDPManifestTextureInfo>, // each single texture in an array needs an entry for itself
	// general-purpose again
	hash : String, // MD5 hash of [decompressed] file/data, indentify duplicate/altered files
	// textures... 
	// these three fields exist in the headers but it's useful to add them to the manifest databases
	format : Int, // format ID
	width : Int,
	height : Int,
	// general-purpose...
	hasSources : Bool, // needed?
	sources : Array<TDPManifestSourceFileReference>
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
	public var textures : Array<TDPManifestTextureInfo>;
}