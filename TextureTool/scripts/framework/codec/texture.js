/*
			TODO : 
				make this a module
				delete the various debug console.log() or proxy them through another function
				
				re-indent, that's gonna drive me NUTS!
				
				functions, probably don't need dedicated decoder/encoders for each type
					RGBA : RGBA16 , RGBA32
					CI   : CI4, CI8 (not found yet)
					IA   : IA4, IA8
					I    : I4, I8 (neither found)
					1BPP : not found, could probably use I decoder/encoder
					IAP  : strange IA8 variant uses whole byte for alpha and MSB 4 bits for intensity
				
				better format table
				better format detection
				
				what the hell is going on with the format IDs?
					the N64 format IDs are definitely 4 bit, possibly 3-bit
					what is the remaining four bits used for? ANYTHING?
					
					identified:
						RGBA32 : 0
						RGBA16 : 1 
						Packed IA8 : 2 (IA8 variant where 4 bits I, whole byte is A, probabaly needs to decode to IA16 on hw)
						Packed IA4 : 3 (IA4 variant where 3 bits I, whole nibble is A, probabaly needs to decode to IA8 on hw)					
						IA16   : 4					
						IA8    : 5 
						IA4    : 6						
						CI4    : 7 
						
					observed pattern:
						LSB 4 bits are the N64 texture format IDs
						what are the MSB 4 bits?
			
			
			unknown formats (possibly still wrong):
				551[5] : 8
				551[1] : 16
				551[0] : 24
				560[1] : 33
				20 : 37
				571 : 38
				186 : 49
				263 : 50
				433 : 51
				579[1] : 56
				290[1] : 57
				622[0] : 72
				622[1] : 74
				550[1] : 90
				550[0] : 106
				339[1] : 123
				241[1] : 124
				530[1] : 136
				636[0] : 156
				245[1] : 176
				244[0] : 177
				244[1] : 178
				334[1] : 190
				342[2] : 255
			
			weird stuff:
				20 : height = 44 , error fixed by ignoring lower nibble
				107 : weird width
			
			ERRORS:
				737 : height = 0 ?!
		*/
		var formats = [
			"RGBA32",
			"RGBA16",
			"Packed IA8",
			"Packed IA4",
			"IA16",
			"IA8",
			"IA4",
			"CI4",
			// these all may not exist!
			"unknown",
			"unknown",
			"unknown",
			"unknown",
			"unknown",
			"unknown",
			"unknown",
			"unknown"
		];
		var allFormats = [ // remove...
			[],
			[],
			[],
			[],
			[],
			[],
			[],
			[],
			[],
			[],
			[],
			[],
			[],
			[],
			[],
			[]
		]
		
	function parseTexture(offset,sizeComp,numSubTextures,ordinal) {
			//console.log("[texture #" + ordinal + "]");
			//console.log("@0x" + offset.toString(16));
			/*
				array texture headers:
				
				U32 count1 = count + 1;
				ArrayTextureInfo[] table
				
				ArrayTextureInfo {
					U32 offset
					U32 decompressedSize
				}
				
				compressed size is found similar to the .tab files
				read two entries, subtract second entry offset
				the difference is that these entries are 2 U32s (why is uncompressedSize duplicated?)
				
				the actual texture data is the same as all single compressed textures
				
				single texture format:
				{
					U32 decompressedSize (little endian)
					Byte const = 0x09
					Byte[] data // compressedSize long, deflate compression
				}
			*/
			
			var bytes = ROM.tex;
			bytes.position = offset;
			
			var bytesRaw = decompressTexture(ROM.tex,sizeComp);
			//console.log(decompressed.length == sizeRaw);
			var textureHeader = readTextureHeader(bytesRaw);
			//console.log("dims : " + textureHeader.width + " x " + textureHeader.height);
			// we seem to be reading some invalid format IDs, why?
			//console.log("format : " + textureHeader.format + " (" + formats[textureHeader.format] + ")");
			//allFormats[textureHeader.format].push(ordinal);
			//ctx.fillStyle = "#000080";
			//ctx.fillRect(0,0,1000,1000);
			
			/*// temp, extracting raw data for analysis
			bytesRaw.position = 0;
			var tex_raw = bytesRaw.readUint8Array(bytesRaw._byteLength);
			filesout.file("tex_" + ordinal + ".dptf",tex_raw);*/
			
			var t = {}
			
			// catch width issues till that's sorted-out
			/*
			if (textureHeader.width != 128 && textureHeader.width != 64 && textureHeader.width != 32 && textureHeader.width != 16) {
				var err = new Error("TEXTURE WIDTH");
				var err2 = {
					cause : "texture width error",
					position : "@Texture : 196",
					message : {
						texture : ordinal + " (" + numSubTextures + ") " + " @0x" + offset.toString(16),
						width : textureHeader.width
					}
				}
				logError(err2);
				throw err;
			}
			// catch height issues till that's sorted-out
			if (textureHeader.height != 128 && textureHeader.height != 64 && textureHeader.height != 32 && textureHeader.height != 16) {
				var err = new Error("TEXTURE HEIGHT");
				var err2 = {
					cause : "texture height error",
					position : "@Texture : 210",
					message : {
						texture : ordinal + " (" + numSubTextures + ") " + " @0x" + offset.toString(16),
						height : textureHeader.height
					}
				}
				logError(err2);
				throw err;
			}*/
			/*textureHeader.width |= textureHeader.widthEx;
			textureHeader.height |= textureHeader.heightEx;*/
			if (ordinal == 687) {
				textureHeader.width = 320;
				textureHeader.format = 5;
			}
			//console.log(textureHeader);
			
			switch(textureHeader.format) {
				case 0:
					t = readTextureRGBA32(bytesRaw,textureHeader);
					//drawTexture(t,false);
					break;
				case 1:
					t = readTextureRGBA16(bytesRaw,textureHeader);
					//drawTexture(t,false);
					break;
				case 2:
					t = readTextureIA8(bytesRaw,textureHeader);
					//drawTexture(t,false);
					break;
				case 3:
					t = readTextureIA4P(bytesRaw,textureHeader);
					//drawTexture(t,false);
					break;
				case 4:
					t = readTextureIA16(bytesRaw,textureHeader);
					//drawTexture(t,false);
					break;
				case 5:
					t = readTextureIA8T(bytesRaw,textureHeader);
					//drawTexture(t,false);
					break;
				case 6:
					t = readTextureIA4(bytesRaw,textureHeader);
					//drawTexture(t,false);
					break;
				case 7:
					t = readTextureCI4(bytesRaw,textureHeader);
					// drawPalette(t.palette);
					// drawTexture(t,false);
					break;
				default :
					var err = new Error("TEXTURE FORMAT");
					var err2 = {
						cause : "texture format error",
						position : "@Texture : 258",
						message : {
							texture : ordinal + " (" + numSubTextures + ") " + " @0x" + offset.toString(16),
							format : textureHeader.format
						}
					}
					logError(err2);
					throw err;
			}
			
			return t;
		}
		
		/*
			dump raw information about a texture
		*/
		function dumpTextureInfo(offset,sizeComp,numSubTextures,ordinal) {
			var out = "[texture #" + ordinal + "]\n";
			out += "@0x" + offset.toString(16) + "\n";
			
			var bytes = ROM.tex;
			bytes.position = offset;
			
			var bytesRaw = decompressTexture(ROM.tex,sizeComp);
			//console.log(decompressed.length == sizeRaw);
			var textureHeader = readTextureHeader(bytesRaw);
			
			out += "/-- header info --/\n";
			for (i in textureHeader) {
				out += i + " = " + textureHeader[i] + "\n";
			}
			
			out += "/-- raw header dump --/\n";
			bytesRaw.position = 0;
			for (var i2 = 0; i2 < 16; i2++) {
				out += hexa(bytesRaw.readUint8()) + " ";
			//	console.log("it : " + i2);
			}
			out += "\n";
			for (var i3 = 0; i3 < 16; i3++) {
				out += hexa(bytesRaw.readUint8()) + " ";
			//	console.log("it # 2 : " + i3);
			}
			out += "\n/-- other info --/\n";
			out += "size = " + fsize(bytesRaw._byteLength) + "\n";
			out += "format[?] = " + formats[textureHeader.format];
			
			return out;
		}
		
		// filesize strings
		function fsize(size) {
			var k = 1024; 
			var m = k * k;
			var g = m * k; // NEVER gonna happen in an N64 game...lol
			
			var fk = size / k;
			var fm = size / m; 
			var fg = size / g;
			
			if (fg >= 1) {
				return truncateDecimals(fg,2) + " GB";
			} else if (fm >= 1) {
				return truncateDecimals(fm,2) + " MB";
			} else if (fk >= 1) {
				return truncateDecimals(fk,2) + " KB";
			}
			return size + " B";
		}
		
		/* 
			toFixed(), without rounding
			https://stackoverflow.com/a/12810744
		*/
		function truncateDecimals(num,places) {
			num2 = num.toString(); //If it's not already a String
			out = num2.slice(0, (num2.indexOf(".")) + (places + 1));
			return out;
		}
		/*
			decompresses a texture, obviously
		*/
		function decompressTexture(bytes,sizeComp) {
			var sizeRaw = bytes.readUint32(true);
			var what = bytes.readUint8();
			/* 
				we have read 5 bytes, the compressed texture header, 
				so we should read 5 less bytes for the compressed data, itself
				certain textures cause errors if this isn't done
			*/
			var compressed = bytes.readUint8Array(sizeComp - 5);
			
			var decompressed = new Zlib.RawInflate(compressed).decompress();
			var bytesRaw = new Uint8Array(decompressed.length);
			// copy array, inflate buffer oversized, causes problems
			for (var i=0; i < decompressed.length; i++) {
				bytesRaw[i] = decompressed[i];
			}
			//console.log(decompressed);
			return new DataStream(bytesRaw.buffer,0,false);
		}
		
		// ref from decomp repo:
		/*
			typedef struct Texture
			{
				u8 width;
				u8 height;
				u8 format;
				u8 unk_0x3;
				u16 unk_0x4;
				s16 flags;
				Gfx *gdl;
				u16 levels;
				u16 unk_0xe;
				u16 unk_0x10;
				s16 gdlIdx;
				struct Texture *next;
				s16 unk_0x18;
				u8 unk_0x1a;
				u8 unk_0x1b;
				u8 cms;
				u8 masks;
				u8 cmt;
				u8 maskt;
			} Texture; // Size: 0x20, followed by texture data
		*/
		/*
			height byte seems to be {U4 height , U4 unk_0x1_00001111}
			format byte seems to be {U4 unk_0x2_11110000, U4 format}
			
			still some screwy things happening with the dimensions
			
			detected by the tool yet not reflected by files so far : formats 8-15, do they exist?
			multiple files checked according to allFormats list
			all incidences definitively mis-identified
			HOW?!
		*/
		function readTextureHeader(srcBytes) {
			var out = {
				width : srcBytes.readUint8(),
				height : srcBytes.readUint8(),
				format : srcBytes.readUint8(), 
				unk_0x3 : srcBytes.readUint8(),
				unk_0x4 : srcBytes.readUint16(),
				flags : srcBytes.readInt16(),
				PTR_gdl : srcBytes.readUint32(),
				levels : srcBytes.readUint16(),
				unk_0xe : srcBytes.readUint16(),
				unk_0x10 : srcBytes.readUint16(),
				gdlIdx : srcBytes.readInt16(),
				PTR_next : srcBytes.readUint32(),
				// unk_0x18 : srcBytes.readInt16(),
				pixelBufferSize : srcBytes.readUint16(), // debugging the size errors led to this conclusion
				unk_0x1a : srcBytes.readUint8(),
				unk_0x1b : srcBytes.readUint8(),
				cms : srcBytes.readUint8(),
				masks : srcBytes.readUint8(),
				cmt : srcBytes.readUint8(),
				maskt : srcBytes.readUint8()
			}
			//out.unk_0x1_00001111 = out.height & 0x0f;
			//out.height &= 0xf0;
			out.formatRaw = "0x" + hexa(out.format);
			out.format &= 0x0f;
			out.dimsRaw = "0x" + hexa(out.width) + " , " + "0x" + hexa(out.height);
			/*out.heightEx = (out.unk_0x4 & 0xff00);
			out.widthEx = (out.unk_0x4 & 0xff) << 8;*/
			return out;
		}
		
		/*
			every odd-numbered row has the raw data swapped in 32-bit chunks
			seems intentional...
			
			this function reads two U32s and returns them in a different order depending on the row
			
			decoders currently use this
			a writebits() or setbits() will be needed for encoders
		*/
		function getbits(src,row) {
			out = [];
			var bits1 = src.readUint32();
			var bits2 = src.readUint32();
			if (row % 2) {
				out.push(bits2,bits1);
			} else {
				out.push(bits1,bits2);
			}
			return out;
		}
		
		/*
			RGBA32 works a bit differently
		*/
		function getbits32(src,row) {
			var out = [];
			var bits1 = src.readUint32();
			var bits2 = src.readUint32();
			var bits3 = src.readUint32();
			var bits4 = src.readUint32();
			if (row % 2) {
				out.push(bits3,bits4,bits1,bits2);
			} else {
				out.push(bits1,bits2,bits3,bits4);
			}
			return out;
		}
		
		/*
			converts RGBA16 color to RGBA32 color
		
			the values produced here technically are not correct
			might switch for a lookup table because  there's no reason to do this for every RGBA16 color:
				component = (c & mask) >> bitOffset;
				component /= 31;
				component = Math.floor(component * 255);
		*/
		function RGBA16(c) {
			var r = c & 0b1111100000000000;
			var g = c & 0b0000011111000000;
			var b = c & 0b0000000000111110;
			var a = c & 0b0000000000000001;
			r >>= 8; // >> 11 (align) - 3
			g >>= 3; // >> 6 (align) - 3
			b <<= 2; // >> 1 (align) - 3 , but blue is only 1 bit off from being aligned, so we shift left
			return [r,g,b,a * 255];
		}
		
		function readPalette(bytes,numColors) {
			var pal16 = bytes.readUint16Array(numColors);
			var palette = new Uint8Array(numColors * 4); 
			for (var i=0; i < pal16.length; i++) {
				var c = RGBA16(pal16[i]);
				var base = i * 4;
				palette[base + 0] = c[0];
				palette[base + 1] = c[1];
				palette[base + 2] = c[2];
				palette[base + 3] = c[3];
			}
			console.log(palette);
			return palette;
		}
		
		// look-up table for 4-bit components
		var CLUT4BIT = [
			0x00, // 0 
			0x11, // 17 
			0x22, // 34 
			0x33, // 51 
			0x44, // 68 
			0x55, // 85 
			0x66, // 102 
			0x77, // 119 
			0x88, // 136 
			0x99, // 153 
			0xAA, // 170 
			0xBB, // 187 
			0xCC, // 204 
			0xDD, // 221 
			0xEE, // 238 
			0xFF  // 255
		];
		
		// decodes Packed IA4 textures
		function readTextureIA4P(srcBytes,header) {
			var width = header.width;
			var height = header.height;
			var format = header.format;
			var imagesize = width * height;
			var pixels = new Uint8Array(imagesize * 4);
			srcBytes.position = 0x20;
			var bitsleft = 64;
			var currentRow = 0;
			var bitsrc = getbits(srcBytes,height,currentRow);
			var bits1 = bitsrc[0];
			var bits2 = bitsrc[1];
			for (var j=0; j < imagesize; j++) {
				if (j > 0 && !(j % width)) {
					currentRow++;
				}
				if (bitsleft <= 0) {
					var bitsrc = getbits(srcBytes,currentRow);
					var bits1 = bitsrc[0];
					var bits2 = bitsrc[1];
					bitsleft = 64;
					// console.log(bits1,bits2);
				}
				var p = 0;
				var r = 0;
				var g = 0;
				var b = 0;
				var a = 0;
				if (bitsleft <= 32) {
					// JS deals exclusively in int64s... >.>
					p = (bits2 & 0xe0000000) >>> 28; 
					a = (bits2 & 0xf0000000) >>> 28;
					bits2 <<= 4;
					p >>>= 1;
					//console.log(p);
					r = CLUT4BIT[p * 2];
					g = CLUT4BIT[p * 2];
					b = CLUT4BIT[p * 2];
					bitsleft -= 4;
				} else {
					p = (bits1 & 0xe0000000) >>> 28;
					a = (bits1 & 0xf0000000) >>> 28;
					bits1 <<= 4;
					p >>>= 1;
					//console.log(p);
					r = CLUT4BIT[p * 2];
					g = CLUT4BIT[p * 2];
					b = CLUT4BIT[p * 2];
					bitsleft -= 4;
				}
				var base = j * 4;
				pixels[base + 0] = r;
				pixels[base + 1] = g;
				pixels[base + 2] = b;
				pixels[base + 3] = CLUT4BIT[a];
			}
			return {
				format : format,
				palette : new Uint8Array(4),
				width : width,
				height : height,
				pixels : pixels
			}
		}
		
		// decodes IA16 textures
		function readTextureIA16(srcBytes,header) {
			var width = header.width;
			var height = header.height;
			var format = header.format;
			var imagesize = width * height;
			var pixels = new Uint8Array(imagesize * 4);
			srcBytes.position = 0x20;
			var bitsleft = 64;
			var currentRow = 0;
			var bitsrc = getbits(srcBytes,height,currentRow);
			var bits1 = bitsrc[0];
			var bits2 = bitsrc[1];
			for (var j=0; j < imagesize; j++) {
				if (j > 0 && !(j % width)) {
					currentRow++;
				}
				if (bitsleft <= 0) {
					var bitsrc = getbits(srcBytes,currentRow);
					var bits1 = bitsrc[0];
					var bits2 = bitsrc[1];
					bitsleft = 64;
					// console.log(bits1,bits2);
				}
				var p = 0;
				var a = 0;
				if (bitsleft <= 32) {
					// JS deals exclusively in int64s... >.>
					p = (bits2 & 0xff000000) >>> 24; 
					a = (bits2 & 0x00ff0000) >>> 16; 
					bits2 <<= 16;
					//console.log(p);
					bitsleft -= 16;
				} else {
					p = (bits1 & 0xff000000) >>> 24;
					a = (bits1 & 0x00ff0000) >>> 16;
					bits1 <<= 16;
					//console.log(p);
					bitsleft -= 16;
				}
				var base = j * 4;
				pixels[base + 0] = p;
				pixels[base + 1] = p;
				pixels[base + 2] = p;
				pixels[base + 3] = a;
			}
			return {
				format : format,
				palette : new Uint8Array(4),
				width : width,
				height : height,
				pixels : pixels
			}
		}
		
		// decodes weird IA8 variant...
		function readTextureIA8(srcBytes,header) {
			var width = header.width;
			var height = header.height;
			var format = header.format;
			var imagesize = width * height;
			var pixels = new Uint8Array(imagesize * 4);
			srcBytes.position = 0x20;
			var bitsleft = 64;
			var currentRow = 0;
			var bitsrc = getbits(srcBytes,height,currentRow);
			var bits1 = bitsrc[0];
			var bits2 = bitsrc[1];
			for (var j=0; j < imagesize; j++) {
				if (j > 0 && !(j % width)) {
					currentRow++;
				}
				if (bitsleft <= 0) {
					var bitsrc = getbits(srcBytes,currentRow);
					var bits1 = bitsrc[0];
					var bits2 = bitsrc[1];
					bitsleft = 64;
					// console.log(bits1,bits2);
				}
				var p = 0;
				var r = 0;
				var g = 0;
				var b = 0;
				var a = 0;
				if (bitsleft <= 32) {
					// JS deals exclusively in int64s... >.>
					p = (bits2 & 0xf0000000) >>> 28; 
					a = (bits2 & 0xff000000) >>> 24; 
					bits2 <<= 8;
					//console.log(p);
					r = CLUT4BIT[p];
					g = CLUT4BIT[p];
					b = CLUT4BIT[p];
					bitsleft -= 8;
				} else {
					p = (bits1 & 0xf0000000) >>> 28;
					a = (bits1 & 0xff000000) >>> 24;
					bits1 <<= 8;
					//console.log(p);
					r = CLUT4BIT[p];
					g = CLUT4BIT[p];
					b = CLUT4BIT[p];
					bitsleft -= 8;
				}
				var base = j * 4;
				pixels[base + 0] = r;
				pixels[base + 1] = g;
				pixels[base + 2] = b;
				pixels[base + 3] = a;
			}
			return {
				format : format,
				palette : new Uint8Array(4),
				width : width,
				height : height,
				pixels : pixels
			}
		}
		
		// decodes IA4 textures
		function readTextureIA4(srcBytes,header) {
			var width = header.width;
			var height = header.height;
			var format = header.format;
			var imagesize = width * height;
			var pixels = new Uint8Array(imagesize * 4);
			srcBytes.position = 0x20;
			var bitsleft = 64;
			var currentRow = 0;
			var bitsrc = getbits(srcBytes,height,currentRow);
			var bits1 = bitsrc[0];
			var bits2 = bitsrc[1];
			for (var j=0; j < imagesize; j++) {
				if (j > 0 && !(j % width)) {
					currentRow++;
				}
				if (bitsleft <= 0) {
					var bitsrc = getbits(srcBytes,currentRow);
					var bits1 = bitsrc[0];
					var bits2 = bitsrc[1];
					bitsleft = 64;
					// console.log(bits1,bits2);
				}
				var p = 0;
				var r = 0;
				var g = 0;
				var b = 0;
				var a = 0;
				if (bitsleft <= 32) {
					// JS deals exclusively in int64s... >.>
					p = (bits2 & 0xf0000000) >>> 28; 
					a = p & 0b0001;
					p >>>= 1;
					bits2 <<= 4;
					//console.log(p);
					r = CLUT4BIT[p * 2];
					g = CLUT4BIT[p * 2];
					b = CLUT4BIT[p * 2];
					bitsleft -= 4;
				} else {
					p = (bits1 & 0xf0000000) >>> 28;
					a = p & 0b0001;
					p >>>= 1;
					bits1 <<= 4;
					//console.log(p);
					r = CLUT4BIT[p * 2];
					g = CLUT4BIT[p * 2];
					b = CLUT4BIT[p * 2];
					bitsleft -= 4;
				}
				var base = j * 4;
				pixels[base + 0] = r;
				pixels[base + 1] = g;
				pixels[base + 2] = b;
				pixels[base + 3] = a * 255;
			}
			return {
				format : format,
				palette : new Uint8Array(4),
				width : width,
				height : height,
				pixels : pixels
			}
		}
		
		// decodes "true" IA8 textures
		// TODO : better naming for these two formats!
		function readTextureIA8T(srcBytes,header) {
			var width = header.width;
			var height = header.height;
			var format = header.format;
			var imagesize = width * height;
			var pixels = new Uint8Array(imagesize * 4);
			srcBytes.position = 0x20;
			var bitsleft = 64;
			var currentRow = 0;
			var bitsrc = getbits(srcBytes,height,currentRow);
			var bits1 = bitsrc[0];
			var bits2 = bitsrc[1];
			for (var j=0; j < imagesize; j++) {
				if (j > 0 && !(j % width)) {
					currentRow++;
				}
				if (bitsleft <= 0) {
					var bitsrc = getbits(srcBytes,currentRow);
					var bits1 = bitsrc[0];
					var bits2 = bitsrc[1];
					bitsleft = 64;
					// console.log(bits1,bits2);
				}
				var p = 0;
				var r = 0;
				var g = 0;
				var b = 0;
				var a = 0;
				if (bitsleft <= 32) {
					// JS deals exclusively in int64s... >.>
					p = (bits2 & 0xf0000000) >>> 28; 
					a = (bits2 & 0x0f000000) >>> 24; 
					bits2 <<= 8;
					//console.log(p);
					r = CLUT4BIT[p];
					g = CLUT4BIT[p];
					b = CLUT4BIT[p];
					bitsleft -= 8;
				} else {
					p = (bits1 & 0xf0000000) >>> 28;
					a = (bits1 & 0x0f000000) >>> 24;
					bits1 <<= 8;
					//console.log(p);
					r = CLUT4BIT[p];
					g = CLUT4BIT[p];
					b = CLUT4BIT[p];
					bitsleft -= 8;
				}
				var base = j * 4;
				pixels[base + 0] = r;
				pixels[base + 1] = g;
				pixels[base + 2] = b;
				pixels[base + 3] = CLUT4BIT[a];
			}
			return {
				format : format,
				palette : new Uint8Array(4),
				width : width,
				height : height,
				pixels : pixels
			}
		}
		
		/*
			"decodes"* RGBA32 textures
			
			*hard to call this a REAL decoder since most of its work is wholesale copying bytes to output
				texture's pixel array
		*/
		function readTextureRGBA32(srcBytes,header) {
			var width = header.width;
			var height = header.height;
			var format = header.format;
			var imagesize = width * height;
			var pixels = new Uint8Array(imagesize * 4);
			srcBytes.position = 0x20;
			var bitsleft = 128;
			var currentRow = 0;
			var bitsrc = getbits32(srcBytes,height,currentRow);
			for (var j=0; j < imagesize; j++) {
				if (j > 0 && !(j % width)) {
					currentRow++;
				}
				if (bitsleft <= 0) {
					bitsrc = getbits32(srcBytes,currentRow);
					bitsleft = 128;
				}
				var p = 0;
				var r = 0;
				var g = 0;
				var b = 0;
				var a = 0;
				if (bitsleft >= 32) {
					// JS deals exclusively in int64s... >.>
					p = bitsrc.shift();
					r = (p & 0xff000000) >>> 24;
					g = (p & 0x00ff0000) >>> 16;
					b = (p & 0x0000ff00) >>> 8;
					a = p & 0x000000ff;
					bitsleft -= 32;
				}
				var base = j * 4;
				pixels[base + 0] = r;
				pixels[base + 1] = g;
				pixels[base + 2] = b;
				pixels[base + 3] = a;
			}
			return {
				format : format,
				palette : new Uint8Array(4),
				width : width,
				height : height,
				pixels : pixels
			}
		}
		
		// decodes RGBA16 textures
		function readTextureRGBA16(srcBytes,header) {
			var width = header.width;
			var height = header.height;
			var format = header.format;
			var imagesize = width * height;
			var pixels = new Uint8Array(imagesize * 4);
			srcBytes.position = 0x20;
			var bitsleft = 64;
			var currentRow = 0;
			var bitsrc = getbits(srcBytes,height,currentRow);
			var bits1 = bitsrc[0];
			var bits2 = bitsrc[1];
			for (var j=0; j < imagesize; j++) {
				if (j > 0 && !(j % width)) {
					currentRow++;
				}
				if (bitsleft <= 0) {
					var bitsrc = getbits(srcBytes,currentRow);
					var bits1 = bitsrc[0];
					var bits2 = bitsrc[1];
					bitsleft = 64;
					// console.log(bits1,bits2);
				}
				var p = 0;
				if (bitsleft <= 32) {
					// JS deals exclusively in int64s... >.>
					p = (bits2 & 0xffff0000) >>> 16;
					bits2 <<= 16;
					bitsleft -= 16;
				} else {
					p = (bits1 & 0xffff0000) >>> 16;
					bits1 <<= 16;
					bitsleft -= 16;
				}
				var base = j * 4;
				var c = RGBA16(p);
				//console.log(c);
				pixels[base + 0] = c[0];
				pixels[base + 1] = c[1];
				pixels[base + 2] = c[2];
				pixels[base + 3] = c[3];
			}
			return {
				format : format,
				palette : new Uint8Array(4),
				width : width,
				height : height,
				pixels : pixels
			}
		}
		
		// decodes CI4 textures
		function readTextureCI4(srcBytes,header) {
			var width = header.width;
			var height = header.height;
			var format = header.format;
			var imagesize = width * height;
			var pixels = new Uint8Array(imagesize);
			srcBytes.position = 0x20;
			var bitsleft = 64;
			var currentRow = 0;
			var bitsrc = getbits(srcBytes,height,currentRow);
			var bits1 = bitsrc[0];
			var bits2 = bitsrc[1];
			for (var j=0; j < imagesize; j++) {
				if (j > 0 && !(j % width)) {
					currentRow++;
				}
				if (bitsleft <= 0) {
					var bitsrc = getbits(srcBytes,currentRow);
					var bits1 = bitsrc[0];
					var bits2 = bitsrc[1];
					bitsleft = 64;
					// console.log(bits1,bits2);
				}
				var p = 0;
				if (bitsleft <= 32) {
					// JS deals exclusively in int64s... >.>
					p = (bits2 & 0xf0000000) >>> 28;
					bits2 <<= 4;
					bitsleft -= 4;
				} else {
					p = (bits1 & 0xf0000000) >>> 28;
					bits1 <<= 4;
					bitsleft -= 4;
				}
				pixels[j] = p;
			}
			var palette = readPalette(srcBytes,16);
			return {
				format : format,
				palette : palette,
				width : width,
				height : height,
				pixels : pixels
			}
		}
		
		/*
			takes a decoded texture and renders it (currently at 0,0) on screen
			can optionally ignore the alpha channel and force 100% opacity
		
			TODO :	
				split into convertTexture and drawTexture
				actually, drawTexture() even really a thing to consider?
		*/
		function drawTexture(x,y,texture,forceOpacity) {
			var turtle = new ImageData(texture.width,texture.height);
			var size = texture.width * texture.height;
			var pal = texture.palette;
			var f = texture.format;
			console.log(f);
			if (f == 23 || f == 7) { // CI formats have a palette
				/* 
					it made more sense to create two copies of this loop than do an extra if statement on every iteration
					does it matter much? probably not
				*/
				if(forceOpacity) {
					for (var i=0; i < size; i++) {
						var base = i * 4;
						var basePal = texture.pixels[i] * 4;
						turtle.data[base + 0] = texture.palette[basePal + 0];
						turtle.data[base + 1] = texture.palette[basePal + 1];
						turtle.data[base + 2] = texture.palette[basePal + 2];
						turtle.data[base + 3] = 255;
					}
				} else {
					for (var i=0; i < size; i++) {
						var base = i * 4;
						var basePal = texture.pixels[i] * 4;
						turtle.data[base + 0] = texture.palette[basePal + 0];
						turtle.data[base + 1] = texture.palette[basePal + 1];
						turtle.data[base + 2] = texture.palette[basePal + 2];
						turtle.data[base + 3] = texture.palette[basePal + 3];
					}
				}
			} else if (f == 1 || f == 0 || f == 17 || f == 2 || f == 5 || f == 6 || f == 4 || f == 3) { // other formats are raw pixels
				if(forceOpacity) {
					for (var i=0; i < size; i++) {
						var base = i * 4;
						turtle.data[base + 0] = texture.pixels[base + 0];
						turtle.data[base + 1] = texture.pixels[base + 1];
						turtle.data[base + 2] = texture.pixels[base + 2];
						turtle.data[base + 3] = 255;
					}
				} else {
					for (var i=0; i < size; i++) {
						var base = i * 4;
						turtle.data[base + 0] = texture.pixels[base + 0];
						turtle.data[base + 1] = texture.pixels[base + 1];
						turtle.data[base + 2] = texture.pixels[base + 2];
						turtle.data[base + 3] = texture.pixels[base + 3];
					}
				}
			}
			//console.log(turtle);
			//ctx.putImageData(turtle,x,y);
			drawImageData(turtle,x,y,1);
		}
		
		// draws a palette
		// currently fixed at top right corner of the screen
		// also expects 16 colors, that COULD be an issue later
		function drawPalette(p) {
			var w = scrn.width;
			var h = scrn.height;
			//console.log(w, h);
			var baseX = w - (4 * 16);
			var posX = baseX;
			var posY = 0;
			for (var i=0; i < 16; i++) {
				if (i > 0 && !(i % 4)) {
					posX = baseX;
					posY += 16;
				}
				var base = i * 4;
				var r = p[base];
				var g = p[base + 1];
				var b = p[base + 2];
				/*
					strict format expectations, what a pain in the ass!
					r,g,b as ints, a as a float
					comma, SPACE between each entry (yes, this matters...)
				*/
				var col = "rgba(" + [Math.floor(r),Math.floor(g),Math.floor(b)].join(", ") + ", 1)";
				//console.log(col);
				//console.log(posX,posY);
				ctx.fillStyle = col;
				ctx.fillRect(posX,posY,16,16);
				posX += 16;
			}
		}