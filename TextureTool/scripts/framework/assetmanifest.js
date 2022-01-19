/*
			currently , generates a fresh manifest DB
		
			TODO :	
			
			re-name "manifestFromTab()"
			create object/"class"
			specify what file we're using and not hard-code it...
				save a manifest to file
					load a manifest from file
					edit a manifest
					Manifest format : {
						texturepackname : String // would be TEX0.bin or TEX1.bin by default
						texturepackhash : MD5 hash // [or multiple] of entire .bin and .tab // may not actually do this for whole file...
						name : String // "GUI and Particle" , "Environment and Actor"
						textures : TextureInfo[]
					}
			create function[s] specifically for manifest creation/management
			
			tab files always seem to be the same format*, so maybe this should be generalized for all tab/bin pairs
			
			*GAMETEXT seems to work differently?
		*/
	var noHash = "00000000000000000000000000000000";
	function createManifest(packName,packLongName) {
			var db = {};
			// i've been testing TEX1...
			db.texturePackFileName = packName;
			db.name = packLongName;
			db.textures = [];
			for (var i=0; i < 3651; i++) { // should use a while loop here
				var tex_info = getTabEntry(i);
				if (tex_info.count == 1) { // EOF is assumed count = 0, since the EOF entry is the singular instance of count=0
					// create a single manifest texture entry and add it to the manifest
					var texInfoBig = manifestTextureEntry(ROM.tex,tex_info.ofs,tex_info.size,i);
					db.textures.push(texInfoBig);
				} else if (tex_info.count > 1) {
					// ROM.tex.position = tex_info.ofs;
					
					var texInfoBig = {
						ordinalID : i,
						name : "texture # " + i,
						tags : ["unsorted"],
						path : "unsorted/tex_" + i + "/",
						isArrayTexture : true,
						hasSources : false, // todo...
						format : "group",
						hash : noHash, // should we bother?
						subTextures : []
					}
					
					for (var i2=0; i2 < tex_info.count; i2++) {
						var texInfoSub = manifestTextureEntry(ROM.tex,tex_info.frames[i2].ofs,tex_info.frames[i2].size,i);
						texInfoSub.name = "texture # " + i;
						texInfoSub.path = "unsorted/tex_" + i + "/" + "subtex_" + i2 + ".dptf";
						texInfoBig.subTextures.push(texInfoSub);
					}
					db.textures.push(texInfoBig);
				} else {
					break;
				}
			}
			ROM.manifest = db;
			// manifest_txt.value = JSON.stringify(db);
		}
	
	/*
		TextureInfo = {
			ordinalID : Int position [in the pack]
			name : String // "Krystal Eye" // for searching
			tags : String[] // ["object","player","krystal"] // for searching
			path : String // "objects/player/krystal/eye" // used specifically during extraction
			isArrayTexture : Bool // used for array textures
			subTextures : TextureInfo[] // only present in array textures
			hash : MD5 hash // texture, decompressed // texture arrays would use the hash for the sub-texture
			format : Int // format ID // this would affect file extension, e.g. .CI4, .RGBA16, .RGBA32, ...
			width : Int
			height : Int
			hasSources : Bool // source files have been located/created
			sources : TextureInfo[]
		}
	*/
	function manifestTextureEntry(bytes,ofs,size,ord) {
		// decompress and read texture data
		bytes.position = ofs;
		var bytesRaw = decompressTexture(bytes,size);
		var tex_head = readTextureHeader(bytesRaw);
		bytesRaw.position = 0;
		var bytesAsStr = strDecodeAscii.decode(bytesRaw._buffer);
		
		return {
			ordinalID : ord,
			name : "texture # " + ord,
			tags : ["unsorted"],
			/* 
				MOAR extensions!!! "D[inosaur]P[lanet]T[exture]F[ormat]"
				given that these aren't quite stock N64/Ultra64 texture formats,
				seems reasonable, and so it shall be
			*/
			path : "unsorted/tex_" + ord + ".dptf", 
			isArrayTexture : false,
			hasSources : false, // todo...
			format : formats[tex_head.format],
			width : tex_head.width,
			height : tex_head.height,
			hash : md5(bytesAsStr)
		}
	}
	
	function tagInRange(start,end,tag) {
		for (var i=start; i <= end; i++) {
			var found = false;
			for (var j=0; j < ROM.manifest.textures[i].tags.length; j++) {
				var curr = ROM.manifest.textures[i].tags[j];
				if (curr == tag) {
					found = true;
				}
			}
			if (!found) {
				ROM.manifest.textures[i].tags.push(tag);
				if (i == currTex) {
					tags_txt.value = curr.tags.join(",");
				}
			}
		}
	}
	
	function prefixInRange(start,end,name) {
		for (var i=start; i <= end; i++) {
			ROM.manifest.textures[i].name = name + " - " + ROM.manifest.textures[i].name;
			name_txt.value = ROM.manifest.textures[i].name;
			var menuName = document.getElementById("texName_" + i);
			menuName.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;" + name_txt.value;
		}
	}
	
	function updateEntry(num,name,tags,path) {
		ROM.manifest.textures[num].name = name;
		ROM.manifest.textures[num].tags = tags.split(",");
		ROM.manifest.textures[num].path = path;
		// can this be de-coupled?
		var menuName = document.getElementById("texName_" + num);
		menuName.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;" + name_txt.value;
	}
	
	