(function ($global) { "use strict";
var Main = function() { };
Main.main = function() {
	window.parseTexture = framework_codec_Texture.decodeTexture;
	window.createByteArray = function(src) {var buf = haxe_io_Bytes.alloc(src.length);var arr = new framework_ByteThingyWhatToNameIt(buf,false);arr.writeUint8Array(src);arr.position = 0;return arr;}
	window.drawTexture = Main.drawTexture;
};
Main.drawTexture = function(x,y,texture,forceOpacity) {
	var turtle = new ImageData(texture.width,texture.height);
	var size = texture.width * texture.height;
	var pal = texture.palette;
	var f = texture.format;
	if(f == 23 || f == 7) {
		if(forceOpacity) {
			var _g = 0;
			var _g1 = size;
			while(_g < _g1) {
				var i = _g++;
				var base = i * 4;
				var basePal = texture.pixels[i] * 4;
				turtle.data[base] = texture.palette[basePal];
				turtle.data[base + 1] = texture.palette[basePal + 1];
				turtle.data[base + 2] = texture.palette[basePal + 2];
				turtle.data[base + 3] = 255;
			}
		} else {
			var _g = 0;
			var _g1 = size;
			while(_g < _g1) {
				var i = _g++;
				var base = i * 4;
				var basePal = texture.pixels[i] * 4;
				turtle.data[base] = texture.palette[basePal];
				turtle.data[base + 1] = texture.palette[basePal + 1];
				turtle.data[base + 2] = texture.palette[basePal + 2];
				turtle.data[base + 3] = texture.palette[basePal + 3];
			}
		}
		Main.drawPallete(texture.palette);
	} else if(f == 1 || f == 0 || f == 17 || f == 2 || f == 5 || f == 6 || f == 4 || f == 3) {
		if(forceOpacity) {
			var _g = 0;
			var _g1 = size;
			while(_g < _g1) {
				var i = _g++;
				var base = i * 4;
				turtle.data[base] = texture.pixels[base];
				turtle.data[base + 1] = texture.pixels[base + 1];
				turtle.data[base + 2] = texture.pixels[base + 2];
				turtle.data[base + 3] = 255;
			}
		} else {
			var _g = 0;
			var _g1 = size;
			while(_g < _g1) {
				var i = _g++;
				var base = i * 4;
				turtle.data[base] = texture.pixels[base];
				turtle.data[base + 1] = texture.pixels[base + 1];
				turtle.data[base + 2] = texture.pixels[base + 2];
				turtle.data[base + 3] = texture.pixels[base + 3];
			}
		}
	}
	Main.drawImageData(turtle,x,y,1);
};
Main.drawImageData = function(iDat,x,y,scale) {
	var posX = x;
	var posY = y;
	var posP = 0;
	var arrP = iDat.data;
	var _g = 0;
	var _g1 = iDat.height;
	while(_g < _g1) {
		var iY = _g++;
		var _g2 = 0;
		var _g3 = iDat.width;
		while(_g2 < _g3) {
			var iX = _g2++;
			var base = posP * 4;
			var r = Main.hexa(arrP[base]);
			var g = Main.hexa(arrP[base + 1]);
			var b = Main.hexa(arrP[base + 2]);
			var a = Main.hexa(arrP[base + 3]);
			ctx.fillStyle = "#" + r + g + b + a;
			ctx.fillRect(posX,posY,scale,scale);
			posX += scale;
			++posP;
		}
		posY += scale;
		posX = x;
	}
};
Main.hexa = function(n) {
	return StringTools.hex(n,2);
};
Main.drawPallete = function(p) {
	var w = scrn.width;
	var h = scrn.height;
	var baseX = w - 64;
	var posX = baseX;
	var posY = 0;
	var _g = 0;
	while(_g < 16) {
		var i = _g++;
		if(i > 0 && i % 4 == 0) {
			posX = baseX;
			posY += 16;
		}
		var base = i * 4;
		var r = p[base];
		var g = p[base + 1];
		var b = p[base + 2];
		var col = "rgba(" + [Math.floor(r),Math.floor(g),Math.floor(b)].join(", ") + ", 1)";
		ctx.fillStyle = col;
		ctx.fillRect(posX,posY,16,16);
		posX += 16;
	}
};
var StringTools = function() { };
StringTools.hex = function(n,digits) {
	var s = "";
	var hexChars = "0123456789ABCDEF";
	while(true) {
		s = hexChars.charAt(n & 15) + s;
		n >>>= 4;
		if(!(n > 0)) {
			break;
		}
	}
	if(digits != null) {
		while(s.length < digits) s = "0" + s;
	}
	return s;
};
var framework_ByteThingyWhatToNameIt = function(src,endian) {
	this.tgt = src;
	this.position = 0;
	this.littleEndian = endian;
};
framework_ByteThingyWhatToNameIt.prototype = {
	readUint8: function() {
		var out = this.tgt.b[this.position];
		this.position++;
		return out;
	}
	,readUint16: function(endian) {
		var a = this.tgt.b[this.position];
		var b = this.tgt.b[this.position + 1];
		if(endian || this.littleEndian) {
			this.position += 2;
			return (b << 8) + a;
		}
		this.position += 2;
		return (a << 8) + b;
	}
	,readUint32: function(endian) {
		var a = this.tgt.b[this.position];
		var b = this.tgt.b[this.position + 1];
		var c = this.tgt.b[this.position + 2];
		var d = this.tgt.b[this.position + 3];
		if(endian || this.littleEndian) {
			this.position += 4;
			return (d << 24) + (c << 16) + (b << 8) + a;
		}
		this.position += 4;
		return (a << 24) + (b << 16) + (c << 8) + d;
	}
	,readUint24: function(endian) {
		var a = this.tgt.b[this.position];
		var b = this.tgt.b[this.position + 1];
		var c = this.tgt.b[this.position + 2];
		if(endian || this.littleEndian) {
			this.position += 3;
			return (c << 16) + (b << 8) + a;
		}
		this.position += 3;
		return (a << 16) + (b << 8) + c;
	}
	,readInt8: function(endian) {
		return this.readUint8();
	}
	,readInt16: function(endian) {
		return this.readUint16(endian);
	}
	,readInt32: function(endian) {
		return this.readUint32(endian);
	}
	,readInt24: function(endian) {
		return this.readUint24(endian);
	}
	,readUint8Array: function(length) {
		var this1 = new Uint8Array(length);
		var out = this1;
		var _g = 0;
		var _g1 = length;
		while(_g < _g1) {
			var i = _g++;
			out[i] = this.readUint8();
		}
		return out;
	}
	,readUint16Array: function(length,endian) {
		var this1 = new Uint16Array(length);
		var out = this1;
		var _g = 0;
		var _g1 = length;
		while(_g < _g1) {
			var i = _g++;
			out[i] = this.readUint16(endian);
		}
		return out;
	}
	,readUint32Array: function(length,endian) {
		var this1 = new Uint32Array(length);
		var out = this1;
		var _g = 0;
		var _g1 = length;
		while(_g < _g1) {
			var i = _g++;
			out[i] = this.readUint32(endian);
		}
		return out;
	}
	,writeUint8: function(v) {
		this.tgt.b[this.position] = v & 255;
		this.position++;
	}
	,writeUint8Array: function(src) {
		var _g = 0;
		var _g1 = src.length;
		while(_g < _g1) {
			var i = _g++;
			this.writeUint8(src[i]);
		}
	}
	,inflate: function(src,write) {
		var decompressed = new Zlib.RawInflate(src).decompress();
		if(write) {
			this.writeUint8Array(decompressed);
		}
		return decompressed;
	}
	,deflate: function(src,write) {
		var compressed = new Zlib.RawDeflate(src).decompress();
		if(write) {
			this.writeUint8Array(compressed);
		}
		return compressed;
	}
};
var framework_codec_Texture = function() { };
framework_codec_Texture.decodeTexture = function(src,sizeComp,hack) {
	var raw = framework_codec_Texture.decompressTexture(src,sizeComp);
	var header = framework_codec_Texture.readTextureHeader(raw);
	var noSwizzle = false;
	var forceOpacity = false;
	if(hack != null) {
		if(hack.width > 0) {
			header.width = hack.width;
		}
		if(hack.height > 0) {
			header.height = hack.height;
		}
		if(hack.format > -1) {
			header.format = hack.format;
		}
		noSwizzle = hack.noSwizzle;
		forceOpacity = hack.forceOpacity;
	}
	switch(header.format) {
	case 0:
		return framework_codec_Texture.readTextureRGBA32(raw,header);
	case 1:
		return framework_codec_Texture.readTextureRGBA16(raw,header);
	case 2:
		return framework_codec_Texture.readTextureIA8(raw,header);
	case 3:
		return framework_codec_Texture.readTextureIA4P(raw,header);
	case 4:
		return framework_codec_Texture.readTextureIA16(raw,header);
	case 5:
		return framework_codec_Texture.readTextureIA8T(raw,header);
	case 6:
		return framework_codec_Texture.readTextureIA4(raw,header);
	case 7:
		return framework_codec_Texture.readTextureCI4(raw,header);
	default:
		throw new Error("unknown texture format! (" + header.format + ")");
	}
};
framework_codec_Texture.encodeTexture = function() {
	throw new Error("not implemented");
};
framework_codec_Texture.decompressTexture = function(src,sizeComp) {
	src.position += 5;
	var decompressed = src.inflate(src.readUint8Array(sizeComp - 5),false);
	var buf = new haxe_io_Bytes(new ArrayBuffer(decompressed.length));
	var out = new framework_ByteThingyWhatToNameIt(buf,false);
	out.writeUint8Array(decompressed);
	out.position = 0;
	return out;
};
framework_codec_Texture.compressTexture = function(src) {
	throw new Error("compression not implemented");
};
framework_codec_Texture.readTextureHeader = function(src) {
	var out = { width : src.readUint8(), height : src.readUint8(), format : src.readUint8(), unk_0x3 : src.readUint8(), unk_0x4 : src.readUint16(false), flags : src.readInt16(false), PTR_gdl : src.readUint32(false), levels : src.readUint16(false), unk_0xe : src.readUint16(false), unk_0x10 : src.readUint16(false), gdlIdx : src.readInt16(false), PTR_next : src.readUint32(false), unk_0x18 : src.readInt16(false), unk_0x1a : src.readUint8(), unk_0x1b : src.readUint8(), cms : src.readUint8(), masks : src.readUint8(), cmt : src.readUint8(), maskt : src.readUint8()};
	out.format &= 15;
	return out;
};
framework_codec_Texture.writeTextureHeader = function(src) {
	var buf = new haxe_io_Bytes(new ArrayBuffer(32));
	var dest = new framework_ByteThingyWhatToNameIt(buf,false);
	throw new Error("texture header write not supported!");
};
framework_codec_Texture.deSwizzleBits64 = function(src,row) {
	var out = [];
	var bits1 = src.readUint32(false);
	var bits2 = src.readUint32(false);
	if(row % 2 == 1) {
		out.push(bits2);
		out.push(bits1);
	} else {
		out.push(bits1);
		out.push(bits2);
	}
	return out;
};
framework_codec_Texture.deSwizzleBits128 = function(src,row) {
	var out = [];
	var bits1 = src.readUint32(false);
	var bits2 = src.readUint32(false);
	var bits3 = src.readUint32(false);
	var bits4 = src.readUint32(false);
	if(row % 2 == 1) {
		out.push(bits3);
		out.push(bits4);
		out.push(bits1);
		out.push(bits2);
	} else {
		out.push(bits1);
		out.push(bits2);
		out.push(bits3);
		out.push(bits4);
	}
	return out;
};
framework_codec_Texture.RGBA16 = function(c) {
	var r = c & 63488;
	var g = c & 1984;
	var b = c & 62;
	var a = c & 1;
	r >>= 8;
	g >>= 3;
	b <<= 2;
	var out = [];
	out.push(r);
	out.push(g);
	out.push(b);
	out.push(a * 255);
	return out;
};
framework_codec_Texture.readPalette = function(src,numColors) {
	var pal16 = src.readUint16Array(numColors,false);
	var this1 = new Uint8Array(numColors * 4);
	var palette = this1;
	var _g = 0;
	var _g1 = numColors;
	while(_g < _g1) {
		var i = _g++;
		var c = framework_codec_Texture.RGBA16(pal16[i]);
		var base = i * 4;
		palette[base] = c[0];
		palette[base + 1] = c[1];
		palette[base + 2] = c[2];
		palette[base + 3] = c[3];
	}
	return palette;
};
framework_codec_Texture.writePalette = function() {
};
framework_codec_Texture.readTextureIA4P = function(src,header) {
	var width = header.width;
	var height = header.height;
	var format = header.format;
	var imageSize = width * height;
	var this1 = new Uint8Array(imageSize * 4);
	var pixels = this1;
	src.position = 32;
	var bitsLeft = 64;
	var currentRow = 0;
	var bitSrc = framework_codec_Texture.deSwizzleBits64(src,currentRow);
	var bits1 = bitSrc[0];
	var bits2 = bitSrc[1];
	var _g = 0;
	var _g1 = imageSize;
	while(_g < _g1) {
		var i = _g++;
		if(i > 0 && i % width == 0) {
			++currentRow;
		}
		if(bitsLeft <= 0) {
			bitSrc = framework_codec_Texture.deSwizzleBits64(src,currentRow);
			bits1 = bitSrc[0];
			bits2 = bitSrc[1];
			bitsLeft = 64;
		}
		var pix = 0;
		var r = 0;
		var g = 0;
		var b = 0;
		var a = 0;
		if(bitsLeft <= 32) {
			pix = (bits2 & -536870912) >>> 28;
			a = (bits2 & -268435456) >>> 28;
			bits2 <<= 4;
			pix >>>= 1;
			r = framework_codec_Texture.CLUT4BIT[pix * 2];
			g = framework_codec_Texture.CLUT4BIT[pix * 2];
			b = framework_codec_Texture.CLUT4BIT[pix * 2];
			bitsLeft -= 4;
		} else {
			pix = (bits1 & -536870912) >>> 28;
			a = (bits1 & -268435456) >>> 28;
			bits1 <<= 4;
			pix >>>= 1;
			r = framework_codec_Texture.CLUT4BIT[pix * 2];
			g = framework_codec_Texture.CLUT4BIT[pix * 2];
			b = framework_codec_Texture.CLUT4BIT[pix * 2];
			bitsLeft -= 4;
		}
		var base = i * 4;
		pixels[base] = r;
		pixels[base + 1] = g;
		pixels[base + 2] = b;
		pixels[base + 3] = framework_codec_Texture.CLUT4BIT[a];
	}
	var this1 = new Uint8Array(4);
	return { format : format, palette : this1, width : width, height : height, pixels : pixels};
};
framework_codec_Texture.readTextureIA16 = function(src,header) {
	var width = header.width;
	var height = header.height;
	var format = header.format;
	var imageSize = width * height;
	var this1 = new Uint8Array(imageSize * 4);
	var pixels = this1;
	src.position = 32;
	var bitsLeft = 64;
	var currentRow = 0;
	var bitSrc = framework_codec_Texture.deSwizzleBits64(src,currentRow);
	var bits1 = bitSrc[0];
	var bits2 = bitSrc[1];
	var _g = 0;
	var _g1 = imageSize;
	while(_g < _g1) {
		var j = _g++;
		if(j > 0 && j % width != 0) {
			++currentRow;
		}
		if(bitsLeft <= 0) {
			bitSrc = framework_codec_Texture.deSwizzleBits64(src,currentRow);
			bits1 = bitSrc[0];
			bits2 = bitSrc[1];
			bitsLeft = 64;
		}
		var pix = 0;
		var a = 0;
		if(bitsLeft <= 32) {
			pix = (bits2 & -16777216) >>> 24;
			a = (bits2 & 16711680) >>> 16;
			bits2 <<= 16;
			bitsLeft -= 16;
		} else {
			pix = (bits1 & -16777216) >>> 24;
			a = (bits1 & 16711680) >>> 16;
			bits1 <<= 16;
			bitsLeft -= 16;
		}
		var base = j * 4;
		pixels[base] = pix;
		pixels[base + 1] = pix;
		pixels[base + 2] = pix;
		pixels[base + 3] = a;
	}
	var this1 = new Uint8Array(4);
	return { format : format, palette : this1, width : width, height : height, pixels : pixels};
};
framework_codec_Texture.readTextureIA8 = function(src,header) {
	var width = header.width;
	var height = header.height;
	var format = header.format;
	var imageSize = width * height;
	var this1 = new Uint8Array(imageSize * 4);
	var pixels = this1;
	src.position = 32;
	var bitsleft = 64;
	var currentRow = 0;
	var bitSrc = framework_codec_Texture.deSwizzleBits64(src,currentRow);
	var bits1 = bitSrc[0];
	var bits2 = bitSrc[1];
	var _g = 0;
	var _g1 = imageSize;
	while(_g < _g1) {
		var j = _g++;
		if(j > 0 && j % width != 0) {
			++currentRow;
		}
		if(bitsleft <= 0) {
			bitSrc = framework_codec_Texture.deSwizzleBits64(src,currentRow);
			bits1 = bitSrc[0];
			bits2 = bitSrc[1];
			bitsleft = 64;
		}
		var pix = 0;
		var r = 0;
		var g = 0;
		var b = 0;
		var a = 0;
		if(bitsleft <= 32) {
			pix = (bits2 & -268435456) >>> 28;
			a = (bits2 & -16777216) >>> 24;
			bits2 <<= 8;
			r = framework_codec_Texture.CLUT4BIT[pix];
			g = framework_codec_Texture.CLUT4BIT[pix];
			b = framework_codec_Texture.CLUT4BIT[pix];
			bitsleft -= 8;
		} else {
			pix = (bits1 & -268435456) >>> 28;
			a = (bits1 & -16777216) >>> 24;
			bits1 <<= 8;
			r = framework_codec_Texture.CLUT4BIT[pix];
			g = framework_codec_Texture.CLUT4BIT[pix];
			b = framework_codec_Texture.CLUT4BIT[pix];
			bitsleft -= 8;
		}
		var base = j * 4;
		pixels[base] = r;
		pixels[base + 1] = g;
		pixels[base + 2] = b;
		pixels[base + 3] = a;
	}
	var this1 = new Uint8Array(4);
	return { format : format, palette : this1, width : width, height : height, pixels : pixels};
};
framework_codec_Texture.readTextureIA4 = function(src,header) {
	var width = header.width;
	var height = header.height;
	var format = header.format;
	var imageSize = width * height;
	var this1 = new Uint8Array(imageSize * 4);
	var pixels = this1;
	src.position = 32;
	var bitsLeft = 64;
	var currentRow = 0;
	var bitSrc = framework_codec_Texture.deSwizzleBits64(src,currentRow);
	var bits1 = bitSrc[0];
	var bits2 = bitSrc[1];
	var _g = 0;
	var _g1 = imageSize;
	while(_g < _g1) {
		var j = _g++;
		if(j > 0 && j % width != 0) {
			++currentRow;
		}
		if(bitsLeft <= 0) {
			bitSrc = framework_codec_Texture.deSwizzleBits64(src,currentRow);
			bits1 = bitSrc[0];
			bits2 = bitSrc[1];
			bitsLeft = 64;
		}
		var pix = 0;
		var r = 0;
		var g = 0;
		var b = 0;
		var a = 0;
		if(bitsLeft <= 32) {
			pix = (bits2 & -268435456) >>> 28;
			a = pix & 1;
			pix >>>= 1;
			bits2 <<= 4;
			r = framework_codec_Texture.CLUT4BIT[pix * 2];
			g = framework_codec_Texture.CLUT4BIT[pix * 2];
			b = framework_codec_Texture.CLUT4BIT[pix * 2];
			bitsLeft -= 4;
		} else {
			pix = (bits1 & -268435456) >>> 28;
			a = pix & 1;
			pix >>>= 1;
			bits1 <<= 4;
			r = framework_codec_Texture.CLUT4BIT[pix * 2];
			g = framework_codec_Texture.CLUT4BIT[pix * 2];
			b = framework_codec_Texture.CLUT4BIT[pix * 2];
			bitsLeft -= 4;
		}
		var base = j * 4;
		pixels[base] = r;
		pixels[base + 1] = g;
		pixels[base + 2] = b;
		pixels[base + 3] = a * 255;
	}
	var this1 = new Uint8Array(4);
	return { format : format, palette : this1, width : width, height : height, pixels : pixels};
};
framework_codec_Texture.readTextureIA8T = function(src,header) {
	var width = header.width;
	var height = header.height;
	var format = header.format;
	var imageSize = width * height;
	var this1 = new Uint8Array(imageSize * 4);
	var pixels = this1;
	src.position = 32;
	var bitsLeft = 64;
	var currentRow = 0;
	var bitSrc = framework_codec_Texture.deSwizzleBits64(src,currentRow);
	var bits1 = bitSrc[0];
	var bits2 = bitSrc[1];
	var _g = 0;
	var _g1 = imageSize;
	while(_g < _g1) {
		var j = _g++;
		if(j > 0 && j % width != 0) {
			++currentRow;
		}
		if(bitsLeft <= 0) {
			bitSrc = framework_codec_Texture.deSwizzleBits64(src,currentRow);
			bits1 = bitSrc[0];
			bits2 = bitSrc[1];
			bitsLeft = 64;
		}
		var pix = 0;
		var r = 0;
		var g = 0;
		var b = 0;
		var a = 0;
		if(bitsLeft <= 32) {
			pix = (bits2 & -268435456) >>> 28;
			a = (bits2 & 251658240) >>> 24;
			bits2 <<= 8;
			r = framework_codec_Texture.CLUT4BIT[pix];
			g = framework_codec_Texture.CLUT4BIT[pix];
			b = framework_codec_Texture.CLUT4BIT[pix];
			bitsLeft -= 8;
		} else {
			pix = (bits1 & -268435456) >>> 28;
			a = (bits1 & 251658240) >>> 24;
			bits1 <<= 8;
			r = framework_codec_Texture.CLUT4BIT[pix];
			g = framework_codec_Texture.CLUT4BIT[pix];
			b = framework_codec_Texture.CLUT4BIT[pix];
			bitsLeft -= 8;
		}
		var base = j * 4;
		pixels[base] = r;
		pixels[base + 1] = g;
		pixels[base + 2] = b;
		pixels[base + 3] = framework_codec_Texture.CLUT4BIT[a];
	}
	var this1 = new Uint8Array(4);
	return { format : format, palette : this1, width : width, height : height, pixels : pixels};
};
framework_codec_Texture.readTextureRGBA32 = function(src,header) {
	var width = header.width;
	var height = header.height;
	var format = header.format;
	var imageSize = width * height;
	var this1 = new Uint8Array(imageSize * 4);
	var pixels = this1;
	src.position = 32;
	var bitsLeft = 128;
	var currentRow = 0;
	var bitSrc = framework_codec_Texture.deSwizzleBits128(src,currentRow);
	var _g = 0;
	var _g1 = imageSize;
	while(_g < _g1) {
		var j = _g++;
		if(j > 0 && j % width != 0) {
			++currentRow;
		}
		if(bitsLeft <= 0) {
			bitSrc = framework_codec_Texture.deSwizzleBits128(src,currentRow);
			bitsLeft = 128;
		}
		var pix = 0;
		var r = 0;
		var g = 0;
		var b = 0;
		var a = 0;
		if(bitsLeft >= 32) {
			pix = bitSrc.shift();
			r = (pix & -16777216) >>> 24;
			g = (pix & 16711680) >>> 16;
			b = (pix & 65280) >>> 8;
			a = pix & 255;
			bitsLeft -= 32;
		}
		var base = j * 4;
		pixels[base] = r;
		pixels[base + 1] = g;
		pixels[base + 2] = b;
		pixels[base + 3] = a;
	}
	var this1 = new Uint8Array(4);
	return { format : format, palette : this1, width : width, height : height, pixels : pixels};
};
framework_codec_Texture.readTextureRGBA16 = function(src,header) {
	var width = header.width;
	var height = header.height;
	var format = header.format;
	var imageSize = width * height;
	var this1 = new Uint8Array(imageSize * 4);
	var pixels = this1;
	src.position = 32;
	var bitsLeft = 64;
	var currentRow = 0;
	var bitSrc = framework_codec_Texture.deSwizzleBits64(src,currentRow);
	var bits1 = bitSrc[0];
	var bits2 = bitSrc[1];
	var _g = 0;
	var _g1 = imageSize;
	while(_g < _g1) {
		var j = _g++;
		if(j > 0 && j % width != 0) {
			++currentRow;
		}
		if(bitsLeft <= 0) {
			bitSrc = framework_codec_Texture.deSwizzleBits64(src,currentRow);
			bits1 = bitSrc[0];
			bits2 = bitSrc[1];
			bitsLeft = 64;
		}
		var pix = 0;
		if(bitsLeft <= 32) {
			pix = (bits2 & -65536) >>> 16;
			bits2 <<= 16;
			bitsLeft -= 16;
		} else {
			pix = (bits1 & -65536) >>> 16;
			bits1 <<= 16;
			bitsLeft -= 16;
		}
		var base = j * 4;
		var c = framework_codec_Texture.RGBA16(pix);
		pixels[base] = c[0];
		pixels[base + 1] = c[1];
		pixels[base + 2] = c[2];
		pixels[base + 3] = c[3];
	}
	var this1 = new Uint8Array(4);
	return { format : format, palette : this1, width : width, height : height, pixels : pixels};
};
framework_codec_Texture.readTextureCI4 = function(src,header) {
	var width = header.width;
	var height = header.height;
	var format = header.format;
	var imageSize = width * height;
	var this1 = new Uint8Array(imageSize);
	var pixels = this1;
	src.position = 32;
	var bitsLeft = 64;
	var currentRow = 0;
	var bitSrc = framework_codec_Texture.deSwizzleBits64(src,currentRow);
	var bits1 = bitSrc[0];
	var bits2 = bitSrc[1];
	var _g = 0;
	var _g1 = imageSize;
	while(_g < _g1) {
		var j = _g++;
		if(j > 0 && j % width != 0) {
			++currentRow;
		}
		if(bitsLeft <= 0) {
			bitSrc = framework_codec_Texture.deSwizzleBits64(src,currentRow);
			bits1 = bitSrc[0];
			bits2 = bitSrc[1];
			bitsLeft = 64;
		}
		var pix = 0;
		if(bitsLeft <= 32) {
			pix = (bits2 & -268435456) >>> 28;
			bits2 <<= 4;
			bitsLeft -= 4;
		} else {
			pix = (bits1 & -268435456) >>> 28;
			bits1 <<= 4;
			bitsLeft -= 4;
		}
		pixels[j] = pix;
	}
	var palette = framework_codec_Texture.readPalette(src,16);
	return { format : format, palette : palette, width : width, height : height, pixels : pixels};
};
var haxe_io_Bytes = function(data) {
	this.length = data.byteLength;
	this.b = new Uint8Array(data);
	this.b.bufferValue = data;
	data.hxBytes = this;
	data.bytes = this.b;
};
haxe_io_Bytes.alloc = function(length) {
	return new haxe_io_Bytes(new ArrayBuffer(length));
};
var haxe_iterators_ArrayIterator = function(array) {
	this.current = 0;
	this.array = array;
};
haxe_iterators_ArrayIterator.prototype = {
	hasNext: function() {
		return this.current < this.array.length;
	}
	,next: function() {
		return this.array[this.current++];
	}
};
framework_codec_Texture.CLUT4BIT = [0,17,34,51,68,85,102,119,136,153,170,187,204,221,238,255];
Main.main();
})({});
