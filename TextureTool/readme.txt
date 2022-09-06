work in progress tool for dinosaur planet textures

currently supports viewing* and extracting textures

usage:
	load a matching .bin, .tab, and manifest JSON (only TEX1 tested/supported at this time)
	it's suggested to copy TEX1.manifest.json to the same folder as your .bin and .tab
	some slowdown during load may be encountered, milegage varies based on your specs (JS is slow!)
	
	user interface should be self-explanatory
	

goals:
	view/edit:
		view - x (TEX1 only, some errors)
		extract textures as raw data and maybe PNG
		import textures
		edit textures[?]
	filesystem: (if game developers developed games like we hack them...)
		name textures - x
		tag textures - x
		re-pack bins
		FAR FUTURE : edit model texrefs[?]
		
*some textures cannot be viewed, cause errors
	some formats not yet implemented or aren't decoding properly
	issues with image dimensions
	TEX0 has a highly likely chance of causing errors, even a crash
	
by https://github.com/Brian151