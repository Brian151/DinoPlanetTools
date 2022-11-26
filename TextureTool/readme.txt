work in progress tool for dinosaur planet textures

currently supports viewing* and extracting textures

usage:
	load a matching .bin, .tab, and manifest JSON
	some slowdown during load may be encountered, milegage varies based on your specs (JS is slow!)
	see HOWTOUSE.txt for more precise info

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

*TEXPRE.bin, despite my best efforts, cannot be decoded as of yet
	
by https://github.com/Brian151