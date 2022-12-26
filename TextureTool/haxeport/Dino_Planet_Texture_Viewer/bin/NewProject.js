(function ($global) { "use strict";
var $estr = function() { return js_Boot.__string_rec(this,''); },$hxEnums = $hxEnums || {},$_;
function $extend(from, fields) {
	var proto = Object.create(from);
	for (var name in fields) proto[name] = fields[name];
	if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
	return proto;
}
var Graphics = function(cnv) {
	this.scrn = cnv;
	this.scrn.width = 800;
	this.scrn.height = 608;
	this.ctx = this.scrn.getContext("2d");
};
Graphics.__name__ = true;
Graphics.prototype = {
	drawTexture: function(x,y,texture,forceOpacity) {
		var turtle = framework_codec_Texture.convertToImage(texture,forceOpacity);
		this.drawImageData(turtle,x,y,1);
		if(texture.format == 7 || texture.format == 8) {
			this.drawPallete(texture.palette);
		}
	}
	,clearScreen: function() {
		this.ctx.fillStyle = "#000000";
		this.ctx.fillRect(0,0,this.scrn.width,this.scrn.height);
	}
	,drawImageData: function(iDat,x,y,scale) {
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
				var r = Util.hexa(arrP[base]);
				var g = Util.hexa(arrP[base + 1]);
				var b = Util.hexa(arrP[base + 2]);
				var a = Util.hexa(arrP[base + 3]);
				this.ctx.fillStyle = "#" + r + g + b + a;
				this.ctx.fillRect(posX,posY,scale,scale);
				posX += scale;
				++posP;
			}
			posY += scale;
			posX = x;
		}
	}
	,drawPallete: function(p) {
		var w = this.scrn.width;
		var h = this.scrn.height;
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
			this.ctx.fillStyle = col;
			this.ctx.fillRect(posX,posY,16,16);
			posX += 16;
		}
	}
};
var HxOverrides = function() { };
HxOverrides.__name__ = true;
HxOverrides.cca = function(s,index) {
	var x = s.charCodeAt(index);
	if(x != x) {
		return undefined;
	}
	return x;
};
HxOverrides.substr = function(s,pos,len) {
	if(len == null) {
		len = s.length;
	} else if(len < 0) {
		if(pos == 0) {
			len = s.length + len;
		} else {
			return "";
		}
	}
	return s.substr(pos,len);
};
HxOverrides.now = function() {
	return Date.now();
};
var Main = function() { };
Main.__name__ = true;
Main.main = function() {
	Main.ROM = new framework_editor_EditorState();
	Main.ROM.bin = new framework_codec_BinPack();
	Main.gfx = new Graphics(window.document.getElementById("screen"));
	window.ROM = Main.ROM;
	window.advanceTexture = ui_UI.advanceTexture;
	window.rewindTexture = ui_UI.rewindTexture;
	window.displayTextureInfo = ui_UI.displayTextureInfo;
	window.loadFile = Main.loadFile;
	window.exportManifest = Main.exportManifest;
	window.updateEntry = ui_UI.updateCurrentEntry;
	window.exportZip = ui_UI.exportZip;
	window.exportPNGZip = ui_UI.exportZipPNG;
};
Main.onFileLoaded = function() {
	Main.filesLoaded++;
	if(Main.filesLoaded < Main.filesTotal) {
		return;
	}
	ui_UI.initMenu(Main.gfx,Main.menu,Main.name_txt,Main.tags_txt,Main.path_txt);
	Main.ROM.currTex = 687;
	var curr = Main.ROM.manifest.resources[Main.ROM.currTex];
	var tOVR = curr.resInfo.formatOVR;
	var binfile = Main.ROM.bin;
	var texDat = binfile.getFile(Main.ROM.currTex)[0];
	var texDat2 = lib_Rarezip.decompress(texDat);
	var tex = framework_codec_Texture.decodeTexture(texDat2,0,tOVR);
	ui_UI.displayTextureInfo(Main.ROM.currTex);
};
Main.loadFile = function() {
	if(Main.filein.files.length > 0 && Main.filein2.files.length > 0 && Main.filein3.files.length > 0) {
		var file_texbin = Main.filein.files[0];
		var file_textab = Main.filein2.files[0];
		var file_texmf = Main.filein3.files[0];
		var fr_tex = new FileReader();
		var fr_tab = new FileReader();
		var fr_mf = new FileReader();
		fr_tex.onload = function() {
			var arr = Util.createByteArray(fr_tex.result,false);
			Main.ROM.bin.loadData(arr);
			Main.onFileLoaded();
		};
		fr_tab.onload = function() {
			var arr = Util.createByteArray(fr_tab.result,false);
			Main.ROM.bin.loadOffsets(arr);
			Main.onFileLoaded();
		};
		fr_mf.onload = function() {
			Main.ROM.manifest = JSON.parse(fr_mf.result);
			Main.onFileLoaded();
		};
		fr_tex.readAsArrayBuffer(file_texbin);
		fr_tab.readAsArrayBuffer(file_textab);
		fr_mf.readAsText(file_texmf);
	}
};
Main.updateEntry = function(num,name,tags,path) {
	Main.ROM.manifest.resources[num].name = name;
	Main.ROM.manifest.resources[num].tags = tags.split(",");
	Main.ROM.manifest.resources[num].path = path;
	var menuName = window.document.getElementById("texName_" + num);
	menuName.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;" + Main.name_txt.value;
};
Main.exportManifest = function() {
	var blob = new Blob([JSON.stringify(Main.ROM.manifest)],{ type : "text/plain;charset=utf-8"});
	saveAs(blob, "manifest.json");
};
Math.__name__ = true;
var Reflect = function() { };
Reflect.__name__ = true;
Reflect.getProperty = function(o,field) {
	var tmp;
	if(o == null) {
		return null;
	} else {
		var tmp1;
		if(o.__properties__) {
			tmp = o.__properties__["get_" + field];
			tmp1 = tmp;
		} else {
			tmp1 = false;
		}
		if(tmp1) {
			return o[tmp]();
		} else {
			return o[field];
		}
	}
};
Reflect.deleteField = function(o,field) {
	if(!Object.prototype.hasOwnProperty.call(o,field)) {
		return false;
	}
	delete(o[field]);
	return true;
};
var StringTools = function() { };
StringTools.__name__ = true;
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
var Util = function() { };
Util.__name__ = true;
Util.dataSize = function(size) {
	var k = 1024;
	var m = k * k;
	var g = m * k;
	var fk = Math.floor(size / k);
	var fm = Math.floor(size / m);
	var fg = Math.floor(size / g);
	if(fg >= 1) {
		var num2 = fg == null ? "null" : "" + fg;
		var out = HxOverrides.substr(num2,0,num2.indexOf(".") + 3);
		return out + " GB";
	} else if(fm >= 1) {
		var num2 = fm == null ? "null" : "" + fm;
		var out = HxOverrides.substr(num2,0,num2.indexOf(".") + 3);
		return out + " MB";
	} else if(fk >= 1) {
		var num2 = fk == null ? "null" : "" + fk;
		var out = HxOverrides.substr(num2,0,num2.indexOf(".") + 3);
		return out + " KB";
	}
	return size + " B";
};
Util.truncateDecimals = function(num,places) {
	var num2 = num == null ? "null" : "" + num;
	var out = HxOverrides.substr(num2,0,num2.indexOf(".") + (places + 1));
	return out;
};
Util.createByteArray = function(src,end) {
	var arr = new Uint8Array(src);
	var bytearr = haxe_io_Bytes.ofData(arr.buffer);
	return new framework_ByteThingyWhatToNameIt(bytearr,end);
};
Util.hexa = function(n) {
	return StringTools.hex(n,2);
};
Util.BytesToU8Array = function(src) {
	var this1 = new Uint8Array(src.length);
	var out = this1;
	var _g = 0;
	var _g1 = src.length;
	while(_g < _g1) {
		var i = _g++;
		out[i] = src.b[i];
	}
	return out;
};
Util.U8ArrayToBytes = function(src) {
	var out = new haxe_io_Bytes(new ArrayBuffer(src.length));
	var _g = 0;
	var _g1 = src.length;
	while(_g < _g1) {
		var i = _g++;
		out.b[i] = src[i];
	}
	return out;
};
var framework_ByteThingyWhatToNameIt = function(src,endian) {
	this.tgt = src;
	this.position = 0;
	this.littleEndian = endian;
};
framework_ByteThingyWhatToNameIt.__name__ = true;
framework_ByteThingyWhatToNameIt.prototype = {
	get_length: function() {
		return this.tgt.length;
	}
	,readUint8: function() {
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
		var n = this.readUint8();
		var flag = (n & 128) >> 7 == 1;
		if(flag) {
			n |= Util.signExtension[24];
		}
	}
	,readInt16: function(endian) {
		var n = this.readUint16(endian);
		var flag = (n & 32768) >> 15 == 1;
		if(flag) {
			n |= Util.signExtension[16];
		}
		return n;
	}
	,readInt32: function(endian) {
		var n = this.readUint32(endian);
		var flag = (n & -2147483648) >> 31 == 1;
		if(flag) {
			n |= Util.signExtension[0];
		}
		return n;
	}
	,readInt24: function(endian) {
		var n = this.readUint24(endian);
		var flag = (n & 8388608) >> 23 == 1;
		if(flag) {
			n |= Util.signExtension[8];
		}
		return n;
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
	,readByteThingy: function(length,endian) {
		var outBytes = new haxe_io_Bytes(new ArrayBuffer(length));
		outBytes.blit(0,this.tgt,this.position,length);
		this.position += length;
		return new framework_ByteThingyWhatToNameIt(outBytes,endian);
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
	,readBytes: function(length) {
		var out = new haxe_io_Bytes(new ArrayBuffer(length));
		out.blit(0,this.tgt,this.position,length);
		return out;
	}
	,writeUint8: function(v) {
		this.tgt.b[this.position] = v & 255;
		this.position++;
	}
	,writeUint16: function(v,endian) {
		var a = (v & 65280) >> 8;
		var b = v & 255;
		if(endian) {
			this.tgt.b[this.position] = b;
			this.tgt.b[this.position + 1] = a;
		} else {
			this.tgt.b[this.position] = a;
			this.tgt.b[this.position + 1] = b;
		}
		this.position += 2;
	}
	,writeUint32: function(v,endian) {
		var a = (v & -16777216) >> 24;
		var b = (v & 16711680) >> 16;
		var c = (v & 65280) >> 8;
		var d = v & 255;
		if(endian) {
			this.tgt.b[this.position] = d;
			this.tgt.b[this.position + 1] = c;
			this.tgt.b[this.position + 2] = b;
			this.tgt.b[this.position + 3] = a;
		} else {
			this.tgt.b[this.position] = a;
			this.tgt.b[this.position + 1] = b;
			this.tgt.b[this.position + 2] = c;
			this.tgt.b[this.position + 3] = d;
		}
		this.position += 4;
	}
	,writeUint24: function(v,endian) {
		var a = (v & 16711680) >> 16;
		var b = (v & 65280) >> 8;
		var c = v & 255;
		if(endian) {
			this.tgt.b[this.position] = c;
			this.tgt.b[this.position + 1] = b;
			this.tgt.b[this.position + 2] = a;
		} else {
			this.tgt.b[this.position] = a;
			this.tgt.b[this.position + 1] = b;
			this.tgt.b[this.position + 2] = c;
		}
		this.position += 3;
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
	,__properties__: {get_length:"get_length"}
};
var framework_ManifestDB = function() { };
framework_ManifestDB.__name__ = true;
var framework_codec_BinPack = function() {
};
framework_codec_BinPack.__name__ = true;
framework_codec_BinPack.prototype = {
	loadData: function(bin) {
		this.data = bin;
	}
	,loadOffsets: function(tab) {
		this.offsetTable = tab;
	}
	,getItem: function(ord) {
		this.offsetTable.position = ord * 4;
		var ofs = this.offsetTable.readUint32(false);
		var endOfs = this.offsetTable.readUint32(false);
		var size = (endOfs & 16777215) - (ofs & 16777215);
		var numSubTextures = (ofs & -16777216) >> 24;
		var realOfs = ofs & 16777215;
		this.data.position = realOfs;
		var outBuf = new haxe_io_Bytes(new ArrayBuffer(size));
		var outDat = new framework_ByteThingyWhatToNameIt(outBuf,false);
		outDat.writeUint8Array(this.data.readUint8Array(size));
		var out = { resCount : numSubTextures, resources : [{ ofs : realOfs, size : size}], data : outDat};
		if(numSubTextures > 1) {
			this.data.position = realOfs;
			out.resources.pop();
			var table = this.data.readUint32Array((numSubTextures + 1) * 2,false);
			var _g = 0;
			var _g1 = numSubTextures;
			while(_g < _g1) {
				var i = _g++;
				var ofs1 = table[i * 2];
				var ofs2 = table[(i + 1) * 2];
				var sizeComp = ofs2 - ofs1;
				out.resources.push({ ofs : ofs1 + realOfs, size : sizeComp});
			}
		}
		return out;
	}
	,getFile: function(ord) {
		var datEntry = this.getItem(ord);
		var out = [];
		var _g = 0;
		var _g1 = datEntry.resCount;
		while(_g < _g1) {
			var i = _g++;
			var curr = datEntry.resources[i];
			this.data.position = curr.ofs;
			out.push(this.data.readByteThingy(curr.size,false));
		}
		return out;
	}
};
var framework_codec_PngTool = function() { };
framework_codec_PngTool.__name__ = true;
framework_codec_PngTool.BGRA = function(dat) {
	var p = 0;
	var _g = 0;
	var _g1 = dat.length >> 2;
	while(_g < _g1) {
		var i = _g++;
		var r = dat.b[p];
		var g = dat.b[p + 1];
		var b = dat.b[p + 2];
		dat.b[p++] = b;
		dat.b[p++] = g;
		dat.b[p++] = r;
		++p;
	}
};
framework_codec_PngTool.textureToPNG = function(src) {
	switch(src.format) {
	case 0:
		var img = framework_codec_Texture.convertToImage(src,false);
		var src1 = img.data;
		var out = new haxe_io_Bytes(new ArrayBuffer(src1.length));
		var _g = 0;
		var _g1 = src1.length;
		while(_g < _g1) {
			var i = _g++;
			out.b[i] = src1[i];
		}
		var dat = out;
		framework_codec_PngTool.BGRA(dat);
		var png = lib_haxepngjs_Tools.build32BGRA(src.width,src.height,dat);
		var pngB = new haxe_io_BytesOutput();
		new lib_haxepngjs_Writer(pngB).write(png);
		return pngB.getBytes();
	case 1:
		var img = framework_codec_Texture.convertToImage(src,false);
		var src1 = img.data;
		var out = new haxe_io_Bytes(new ArrayBuffer(src1.length));
		var _g = 0;
		var _g1 = src1.length;
		while(_g < _g1) {
			var i = _g++;
			out.b[i] = src1[i];
		}
		var dat = out;
		framework_codec_PngTool.BGRA(dat);
		var png = lib_haxepngjs_Tools.build32BGRA(src.width,src.height,dat);
		var pngB = new haxe_io_BytesOutput();
		new lib_haxepngjs_Writer(pngB).write(png);
		return pngB.getBytes();
	case 2:
		var src1 = src.pixels;
		var out = new haxe_io_Bytes(new ArrayBuffer(src1.length));
		var _g = 0;
		var _g1 = src1.length;
		while(_g < _g1) {
			var i = _g++;
			out.b[i] = src1[i];
		}
		var dat = out;
		var png = lib_haxepngjs_Tools.buildGrey(src.width,src.height,dat);
		var pngB = new haxe_io_BytesOutput();
		new lib_haxepngjs_Writer(pngB).write(png);
		return pngB.getBytes();
	case 3:
		var src1 = src.pixels;
		var out = new haxe_io_Bytes(new ArrayBuffer(src1.length));
		var _g = 0;
		var _g1 = src1.length;
		while(_g < _g1) {
			var i = _g++;
			out.b[i] = src1[i];
		}
		var dat = out;
		var png = lib_haxepngjs_Tools.buildGrey(src.width,src.height,dat);
		var pngB = new haxe_io_BytesOutput();
		new lib_haxepngjs_Writer(pngB).write(png);
		return pngB.getBytes();
	case 4:
		var img = framework_codec_Texture.convertToImage(src,false);
		var src1 = img.data;
		var out = new haxe_io_Bytes(new ArrayBuffer(src1.length));
		var _g = 0;
		var _g1 = src1.length;
		while(_g < _g1) {
			var i = _g++;
			out.b[i] = src1[i];
		}
		var dat = out;
		framework_codec_PngTool.BGRA(dat);
		var png = lib_haxepngjs_Tools.build32BGRA(src.width,src.height,dat);
		var pngB = new haxe_io_BytesOutput();
		new lib_haxepngjs_Writer(pngB).write(png);
		return pngB.getBytes();
	case 5:
		var img = framework_codec_Texture.convertToImage(src,false);
		var src1 = img.data;
		var out = new haxe_io_Bytes(new ArrayBuffer(src1.length));
		var _g = 0;
		var _g1 = src1.length;
		while(_g < _g1) {
			var i = _g++;
			out.b[i] = src1[i];
		}
		var dat = out;
		framework_codec_PngTool.BGRA(dat);
		var png = lib_haxepngjs_Tools.build32BGRA(src.width,src.height,dat);
		var pngB = new haxe_io_BytesOutput();
		new lib_haxepngjs_Writer(pngB).write(png);
		return pngB.getBytes();
	case 6:
		var img = framework_codec_Texture.convertToImage(src,false);
		var src1 = img.data;
		var out = new haxe_io_Bytes(new ArrayBuffer(src1.length));
		var _g = 0;
		var _g1 = src1.length;
		while(_g < _g1) {
			var i = _g++;
			out.b[i] = src1[i];
		}
		var dat = out;
		framework_codec_PngTool.BGRA(dat);
		var png = lib_haxepngjs_Tools.build32BGRA(src.width,src.height,dat);
		var pngB = new haxe_io_BytesOutput();
		new lib_haxepngjs_Writer(pngB).write(png);
		return pngB.getBytes();
	case 7:
		var src1 = src.pixels;
		var out = new haxe_io_Bytes(new ArrayBuffer(src1.length));
		var _g = 0;
		var _g1 = src1.length;
		while(_g < _g1) {
			var i = _g++;
			out.b[i] = src1[i];
		}
		var dat = out;
		var src1 = src.palette;
		var out = new haxe_io_Bytes(new ArrayBuffer(src1.length));
		var _g = 0;
		var _g1 = src1.length;
		while(_g < _g1) {
			var i = _g++;
			out.b[i] = src1[i];
		}
		var datPal = out;
		var png = lib_haxepngjs_Tools.buildIndexed(src.width,src.height,dat,datPal);
		var pngB = new haxe_io_BytesOutput();
		new lib_haxepngjs_Writer(pngB).write(png);
		return pngB.getBytes();
	case 8:
		var src1 = src.pixels;
		var out = new haxe_io_Bytes(new ArrayBuffer(src1.length));
		var _g = 0;
		var _g1 = src1.length;
		while(_g < _g1) {
			var i = _g++;
			out.b[i] = src1[i];
		}
		var dat = out;
		var src1 = src.palette;
		var out = new haxe_io_Bytes(new ArrayBuffer(src1.length));
		var _g = 0;
		var _g1 = src1.length;
		while(_g < _g1) {
			var i = _g++;
			out.b[i] = src1[i];
		}
		var datPal = out;
		var png = lib_haxepngjs_Tools.buildIndexed(src.width,src.height,dat,datPal);
		var pngB = new haxe_io_BytesOutput();
		new lib_haxepngjs_Writer(pngB).write(png);
		return pngB.getBytes();
	}
	return new haxe_io_Bytes(new ArrayBuffer(256));
};
framework_codec_PngTool.PNGToTexture = function(src) {
	return null;
};
var framework_codec_Texture = function() { };
framework_codec_Texture.__name__ = true;
framework_codec_Texture.decodeTexture = function(src,sizeComp,hack) {
	var raw = null;
	if(sizeComp > 0) {
		raw = framework_codec_Texture.decompressTexture(src,sizeComp);
	} else {
		raw = src;
	}
	var header = framework_codec_Texture.readTextureHeader(raw);
	var noSwizzle = false;
	var forceOpacity = false;
	if(hack != null) {
		noSwizzle = hack.noSwizzle;
	}
	switch(header.format) {
	case 0:
		return framework_codec_Texture.readTextureRGBA32(raw,header,noSwizzle);
	case 1:
		return framework_codec_Texture.readTextureRGBA16(raw,header,noSwizzle);
	case 2:
		return framework_codec_Texture.readTextureI8(raw,header,noSwizzle);
	case 3:
		return framework_codec_Texture.readTextureI4(raw,header,noSwizzle);
	case 4:
		return framework_codec_Texture.readTextureIA16(raw,header,noSwizzle);
	case 5:
		return framework_codec_Texture.readTextureIA8(raw,header,noSwizzle);
	case 6:
		return framework_codec_Texture.readTextureIA4(raw,header,noSwizzle);
	case 7:
		return framework_codec_Texture.readTextureCI4(raw,header,noSwizzle);
	case 8:
		return framework_codec_Texture.readTextureCI8(raw,header,noSwizzle);
	default:
		throw haxe_Exception.thrown("unknown texture format! (" + header.format + ")");
	}
};
framework_codec_Texture.encodeTexture = function(tex,head) {
	throw haxe_Exception.thrown("not implemented");
};
framework_codec_Texture.decompressTexture = function(src,sizeComp) {
	var decompressed = lib_Rarezip.decompress(src);
	return decompressed;
};
framework_codec_Texture.compressTexture = function(src) {
	throw haxe_Exception.thrown("compression not implemented");
};
framework_codec_Texture.readTextureHeader = function(src) {
	var out = { width : src.readUint8(), height : src.readUint8(), format : src.readUint8(), sprX : src.readUint8(), sprY : src.readUint8(), unk_0x5 : src.readUint8(), flags : src.readInt16(false), PTR_gdl : src.readUint32(false), levels : src.readUint16(false), unk_0xe : src.readUint16(false), unk_0x10 : src.readUint16(false), gdlIdx : src.readInt16(false), PTR_next : src.readUint32(false), unk_0x18 : src.readInt16(false), unk_0x1a : src.readUint8(), hwMSB : src.readUint8(), cms : src.readUint8(), masks : src.readUint8(), cmt : src.readUint8(), maskt : src.readUint8(), type : 0};
	out.width += (out.hwMSB & 240) << 4;
	out.height += (out.hwMSB & 15) << 8;
	out.type = (out.format & 240) >> 4;
	out.format &= 15;
	return out;
};
framework_codec_Texture.writeTextureHeader = function(src) {
	var buf = new haxe_io_Bytes(new ArrayBuffer(32));
	var dest = new framework_ByteThingyWhatToNameIt(buf,false);
	var wMSB = src.width & 3840;
	var hMSB = src.height & 3840;
	dest.writeUint8(src.width & 255);
	dest.writeUint8(src.height & 255);
	wMSB <<= 4;
	var formatByte = src.format | src.type << 4;
	dest.writeUint8(formatByte);
	dest.writeUint8(src.sprX);
	dest.writeUint8(src.sprY);
	dest.writeUint8(1);
	dest.writeUint16(src.flags,false);
	dest.writeUint32(src.PTR_gdl,false);
	dest.writeUint16(src.levels,false);
	dest.writeUint16(src.unk_0xe,false);
	dest.writeUint16(src.unk_0x10,false);
	dest.writeUint16(src.gdlIdx,false);
	dest.writeUint32(src.PTR_next,false);
	dest.writeUint16(src.unk_0x18,false);
	dest.writeUint8(src.unk_0x1a);
	dest.writeUint8(wMSB | hMSB);
	dest.writeUint8(src.cms);
	dest.writeUint8(src.masks);
	dest.writeUint8(src.cmt);
	dest.writeUint8(src.maskt);
	throw haxe_Exception.thrown("texture header write WIP, final files may not function in-game");
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
framework_codec_Texture.readTextureRGBA32 = function(src,header,noSwizzle) {
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
			if(!noSwizzle) {
				++currentRow;
			}
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
framework_codec_Texture.readTextureRGBA16 = function(src,header,noSwizzle) {
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
			if(!noSwizzle) {
				++currentRow;
			}
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
framework_codec_Texture.readTextureI8 = function(src,header,noSwizzle) {
	var width = header.width;
	var height = header.height;
	var format = header.format;
	var imageSize = width * height;
	var this1 = new Uint8Array(imageSize);
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
			if(!noSwizzle) {
				++currentRow;
			}
		}
		if(bitsleft <= 0) {
			bitSrc = framework_codec_Texture.deSwizzleBits64(src,currentRow);
			bits1 = bitSrc[0];
			bits2 = bitSrc[1];
			bitsleft = 64;
		}
		var pix = 0;
		if(bitsleft <= 32) {
			pix = (bits2 & -16777216) >>> 24;
			bits2 <<= 8;
			bitsleft -= 8;
		} else {
			pix = (bits1 & -16777216) >>> 24;
			bits1 <<= 8;
			bitsleft -= 8;
		}
		pixels[j] = pix;
	}
	var this1 = new Uint8Array(4);
	return { format : format, palette : this1, width : width, height : height, pixels : pixels};
};
framework_codec_Texture.readTextureI4 = function(src,header,noSwizzle) {
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
		var i = _g++;
		if(i > 0 && i % width == 0) {
			if(!noSwizzle) {
				++currentRow;
			}
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
		pixels[i] = framework_codec_Texture.CLUT4BIT[pix];
	}
	var this1 = new Uint8Array(4);
	return { format : format, palette : this1, width : width, height : height, pixels : pixels};
};
framework_codec_Texture.readTextureIA16 = function(src,header,noSwizzle) {
	var width = header.width;
	var height = header.height;
	var format = header.format;
	var imageSize = width * height;
	var this1 = new Uint8Array(imageSize * 2);
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
			if(!noSwizzle) {
				++currentRow;
			}
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
		var base = j * 2;
		pixels[base] = pix;
		pixels[base + 1] = a;
	}
	var this1 = new Uint8Array(4);
	return { format : format, palette : this1, width : width, height : height, pixels : pixels};
};
framework_codec_Texture.readTextureIA8 = function(src,header,noSwizzle) {
	var width = header.width;
	var height = header.height;
	var format = header.format;
	var imageSize = width * height;
	var this1 = new Uint8Array(imageSize * 2);
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
			if(!noSwizzle) {
				++currentRow;
			}
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
			bitsLeft -= 8;
		} else {
			pix = (bits1 & -268435456) >>> 28;
			a = (bits1 & 251658240) >>> 24;
			bits1 <<= 8;
			r = framework_codec_Texture.CLUT4BIT[pix];
			bitsLeft -= 8;
		}
		var base = j * 2;
		pixels[base] = r;
		pixels[base + 1] = framework_codec_Texture.CLUT4BIT[a];
	}
	var this1 = new Uint8Array(4);
	return { format : format, palette : this1, width : width, height : height, pixels : pixels};
};
framework_codec_Texture.readTextureIA4 = function(src,header,noSwizzle) {
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
			if(!noSwizzle) {
				++currentRow;
			}
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
			bitsLeft -= 4;
		} else {
			pix = (bits1 & -268435456) >>> 28;
			a = pix & 1;
			pix >>>= 1;
			bits1 <<= 4;
			r = framework_codec_Texture.CLUT4BIT[pix * 2];
			bitsLeft -= 4;
		}
		var base = j * 2;
		pixels[base] = r;
		pixels[base + 1] = a * 255;
	}
	var this1 = new Uint8Array(4);
	return { format : format, palette : this1, width : width, height : height, pixels : pixels};
};
framework_codec_Texture.readTextureCI4 = function(src,header,noSwizzle) {
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
			if(!noSwizzle) {
				++currentRow;
			}
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
framework_codec_Texture.readTextureCI8 = function(src,header,noSwizzle) {
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
			if(!noSwizzle) {
				++currentRow;
			}
		}
		if(bitsLeft <= 0) {
			bitSrc = framework_codec_Texture.deSwizzleBits64(src,currentRow);
			bits1 = bitSrc[0];
			bits2 = bitSrc[1];
			bitsLeft = 64;
		}
		var pix = 0;
		if(bitsLeft <= 32) {
			pix = (bits2 & -16777216) >>> 28;
			bits2 <<= 8;
			bitsLeft -= 8;
		} else {
			pix = (bits1 & -16777216) >>> 28;
			bits1 <<= 8;
			bitsLeft -= 8;
		}
		pixels[j] = pix;
	}
	var palette = framework_codec_Texture.readPalette(src,16);
	return { format : format, palette : palette, width : width, height : height, pixels : pixels};
};
framework_codec_Texture.convertToImage = function(texture,forceOpacity) {
	var img = new ImageData(texture.width,texture.height);
	var size = texture.width * texture.height;
	var pal = texture.palette;
	var f = texture.format;
	if(f == 7 || f == 8) {
		if(forceOpacity) {
			var _g = 0;
			var _g1 = size;
			while(_g < _g1) {
				var i = _g++;
				var base = i * 4;
				var basePal = texture.pixels[i] * 4;
				img.data[base] = pal[basePal];
				img.data[base + 1] = pal[basePal + 1];
				img.data[base + 2] = pal[basePal + 2];
				img.data[base + 3] = 255;
			}
		} else {
			var _g = 0;
			var _g1 = size;
			while(_g < _g1) {
				var i = _g++;
				var base = i * 4;
				var basePal = texture.pixels[i] * 4;
				img.data[base] = pal[basePal];
				img.data[base + 1] = pal[basePal + 1];
				img.data[base + 2] = pal[basePal + 2];
				img.data[base + 3] = pal[basePal + 3];
			}
		}
	} else if(f == 0 || f == 1) {
		if(forceOpacity) {
			var _g = 0;
			var _g1 = size;
			while(_g < _g1) {
				var i = _g++;
				var base = i * 4;
				img.data[base] = texture.pixels[base];
				img.data[base + 1] = texture.pixels[base + 1];
				img.data[base + 2] = texture.pixels[base + 2];
				img.data[base + 3] = 255;
			}
		} else {
			var _g = 0;
			var _g1 = size;
			while(_g < _g1) {
				var i = _g++;
				var base = i * 4;
				img.data[base] = texture.pixels[base];
				img.data[base + 1] = texture.pixels[base + 1];
				img.data[base + 2] = texture.pixels[base + 2];
				img.data[base + 3] = texture.pixels[base + 3];
			}
		}
	} else if(f == 2 || f == 3) {
		var _g = 0;
		var _g1 = size;
		while(_g < _g1) {
			var i = _g++;
			var p = texture.pixels[i];
			var base = i * 4;
			img.data[base] = p;
			img.data[base + 1] = p;
			img.data[base + 2] = p;
			img.data[base + 3] = 255;
		}
	} else if(f == 4 || f == 5 || f == 6) {
		if(forceOpacity) {
			var _g = 0;
			var _g1 = size;
			while(_g < _g1) {
				var i = _g++;
				var base0 = i * 2;
				var p = texture.pixels[base0];
				var base = i * 4;
				img.data[base] = p;
				img.data[base + 1] = p;
				img.data[base + 2] = p;
				img.data[base + 3] = 255;
			}
		} else {
			var _g = 0;
			var _g1 = size;
			while(_g < _g1) {
				var i = _g++;
				var base0 = i * 2;
				var p = texture.pixels[base0];
				var pa = texture.pixels[base0 + 1];
				var base = i * 4;
				img.data[base] = p;
				img.data[base + 1] = p;
				img.data[base + 2] = p;
				img.data[base + 3] = pa;
			}
		}
	}
	return img;
};
var framework_dev_ManifestConverter = function() { };
framework_dev_ManifestConverter.__name__ = true;
framework_dev_ManifestConverter.update2 = function() {
	var mf = Main.ROM.manifest;
	var _g = 0;
	var _g1 = mf.resources.length;
	while(_g < _g1) {
		var i = _g++;
		var res = mf.resources[i].resInfo;
		var w = Reflect.getProperty(res.formatOVR,"width");
		var h = Reflect.getProperty(res.formatOVR,"height");
		Reflect.deleteField(res.formatOVR,"format");
		if(w > 0) {
			res.width = w;
		}
		if(h > 0) {
			res.height = h;
		}
		Reflect.deleteField(res.formatOVR,"width");
		Reflect.deleteField(res.formatOVR,"height");
		mf.resources[i].resInfo.formatOVR = res.formatOVR;
		switch(res.format) {
		case "IA4P":
			res.format = "I4";
			break;
		case "IA8P":
			res.format = "I8";
			break;
		default:
		}
	}
	Main.exportManifest();
};
var framework_editor_EditorState = function() {
	this.currTex = 0;
};
framework_editor_EditorState.__name__ = true;
var framework_editor_FileExporter = function() { };
framework_editor_FileExporter.__name__ = true;
framework_editor_FileExporter.exportZip = function(src,format) {
	var zipfile = new JSZip();
	var binfile = src.bin;
	var bindat = src.bin.data;
	var exportName = src.manifest.fileName;
	var _g = 0;
	var _g1 = src.manifest.resources.length;
	while(_g < _g1) {
		var i = _g++;
		var curr = src.manifest.resources[i];
		var ovr = curr.resInfo.formatOVR;
		var tName = curr.path;
		var texInfo0 = binfile.getItem(i);
		var texData = binfile.getFile(i);
		if(curr.resInfo.frames.length > 0) {
			var _g2 = 0;
			var _g3 = curr.resInfo.frames.length;
			while(_g2 < _g3) {
				var j = _g2++;
				var texInfo = texInfo0.resources[j];
				if(format == 0) {
					var texFile = lib_Rarezip.decompress(texData[j]);
					zipfile.file((tName + "frame_" + j + ".dptf"),texFile.readUint8Array(texFile.get_length()));
				} else if(format == 1) {
					var texFile1 = framework_codec_Texture.decodeTexture(texData[j],texData[j].get_length(),ovr);
					var forceOpacity = ovr.forceOpacity;
					var pngFile = framework_editor_FileExporter.exportPNG(texFile1,forceOpacity);
					zipfile.file((tName + "frame_" + j + ".png"),pngFile);
				} else {
					var texFile2 = lib_Rarezip.decompress(texData[j]);
					zipfile.file((tName + "frame_" + j + ".dptf"),texFile2.readUint8Array(texFile2.get_length()));
				}
			}
		} else {
			var texInfo1 = texInfo0.resources[0];
			bindat.position = texInfo1.ofs;
			if(format == 0) {
				var texFile3 = lib_Rarezip.decompress(texData[0]);
				zipfile.file(tName,texFile3.readUint8Array(texFile3.get_length()));
			} else if(format == 1) {
				var texFile4 = framework_codec_Texture.decodeTexture(texData[0],texData[0].tgt.length,ovr);
				var forceOpacity1 = ovr.forceOpacity;
				var pngFile1 = framework_editor_FileExporter.exportPNG(texFile4,forceOpacity1);
				var fName = tName.split(".")[0];
				zipfile.file((fName + ".png"),pngFile1);
			} else {
				var texFile5 = lib_Rarezip.decompress(texData[0]);
				zipfile.file(tName,texFile5.readUint8Array(texFile5.get_length()));
			}
		}
	}
	zipfile.file("manifest.json",JSON.stringify(src.manifest));
	zipfile.generateAsync({type:"blob",compression:"DEFLATE"}).then(function (blob) {saveAs(blob, exportName + ".zip");});
};
framework_editor_FileExporter.exportPNG = function(t,forceOpacity,fileName) {
	var pngBin = framework_codec_PngTool.textureToPNG(t);
	var this1 = new Uint8Array(pngBin.length);
	var out = this1;
	var _g = 0;
	var _g1 = pngBin.length;
	while(_g < _g1) {
		var i = _g++;
		out[i] = pngBin.b[i];
	}
	var pngArr = out;
	if(fileName != null) {
		var pngArrBufView = new DataView(pngArr.buffer);
		var pngBlob = new Blob([pngArrBufView]);
		saveAs(pngBlob,"fileName.png");
	}
	return pngArr;
};
var haxe_Exception = function(message,previous,native) {
	Error.call(this,message);
	this.message = message;
	this.__previousException = previous;
	this.__nativeException = native != null ? native : this;
};
haxe_Exception.__name__ = true;
haxe_Exception.caught = function(value) {
	if(((value) instanceof haxe_Exception)) {
		return value;
	} else if(((value) instanceof Error)) {
		return new haxe_Exception(value.message,null,value);
	} else {
		return new haxe_ValueException(value,null,value);
	}
};
haxe_Exception.thrown = function(value) {
	if(((value) instanceof haxe_Exception)) {
		return value.get_native();
	} else if(((value) instanceof Error)) {
		return value;
	} else {
		var e = new haxe_ValueException(value);
		return e;
	}
};
haxe_Exception.__super__ = Error;
haxe_Exception.prototype = $extend(Error.prototype,{
	unwrap: function() {
		return this.__nativeException;
	}
	,toString: function() {
		return this.get_message();
	}
	,get_message: function() {
		return this.message;
	}
	,get_native: function() {
		return this.__nativeException;
	}
	,__properties__: {get_native:"get_native",get_message:"get_message"}
});
var haxe_ValueException = function(value,previous,native) {
	haxe_Exception.call(this,String(value),previous,native);
	this.value = value;
};
haxe_ValueException.__name__ = true;
haxe_ValueException.__super__ = haxe_Exception;
haxe_ValueException.prototype = $extend(haxe_Exception.prototype,{
	unwrap: function() {
		return this.value;
	}
});
var haxe_ds_List = function() {
	this.length = 0;
};
haxe_ds_List.__name__ = true;
haxe_ds_List.prototype = {
	add: function(item) {
		var x = new haxe_ds__$List_ListNode(item,null);
		if(this.h == null) {
			this.h = x;
		} else {
			this.q.next = x;
		}
		this.q = x;
		this.length++;
	}
};
var haxe_ds__$List_ListNode = function(item,next) {
	this.item = item;
	this.next = next;
};
haxe_ds__$List_ListNode.__name__ = true;
var haxe_exceptions_PosException = function(message,previous,pos) {
	haxe_Exception.call(this,message,previous);
	if(pos == null) {
		this.posInfos = { fileName : "(unknown)", lineNumber : 0, className : "(unknown)", methodName : "(unknown)"};
	} else {
		this.posInfos = pos;
	}
};
haxe_exceptions_PosException.__name__ = true;
haxe_exceptions_PosException.__super__ = haxe_Exception;
haxe_exceptions_PosException.prototype = $extend(haxe_Exception.prototype,{
	toString: function() {
		return "" + haxe_Exception.prototype.toString.call(this) + " in " + this.posInfos.className + "." + this.posInfos.methodName + " at " + this.posInfos.fileName + ":" + this.posInfos.lineNumber;
	}
});
var haxe_exceptions_NotImplementedException = function(message,previous,pos) {
	if(message == null) {
		message = "Not implemented";
	}
	haxe_exceptions_PosException.call(this,message,previous,pos);
};
haxe_exceptions_NotImplementedException.__name__ = true;
haxe_exceptions_NotImplementedException.__super__ = haxe_exceptions_PosException;
haxe_exceptions_NotImplementedException.prototype = $extend(haxe_exceptions_PosException.prototype,{
});
var haxe_io_Input = function() { };
haxe_io_Input.__name__ = true;
haxe_io_Input.prototype = {
	readByte: function() {
		throw new haxe_exceptions_NotImplementedException(null,null,{ fileName : "haxe/io/Input.hx", lineNumber : 53, className : "haxe.io.Input", methodName : "readByte"});
	}
	,readBytes: function(s,pos,len) {
		var k = len;
		var b = s.b;
		if(pos < 0 || len < 0 || pos + len > s.length) {
			throw haxe_Exception.thrown(haxe_io_Error.OutsideBounds);
		}
		try {
			while(k > 0) {
				b[pos] = this.readByte();
				++pos;
				--k;
			}
		} catch( _g ) {
			if(!((haxe_Exception.caught(_g).unwrap()) instanceof haxe_io_Eof)) {
				throw _g;
			}
		}
		return len - k;
	}
	,set_bigEndian: function(b) {
		this.bigEndian = b;
		return b;
	}
	,readFullBytes: function(s,pos,len) {
		while(len > 0) {
			var k = this.readBytes(s,pos,len);
			if(k == 0) {
				throw haxe_Exception.thrown(haxe_io_Error.Blocked);
			}
			pos += k;
			len -= k;
		}
	}
	,read: function(nbytes) {
		var s = new haxe_io_Bytes(new ArrayBuffer(nbytes));
		var p = 0;
		while(nbytes > 0) {
			var k = this.readBytes(s,p,nbytes);
			if(k == 0) {
				throw haxe_Exception.thrown(haxe_io_Error.Blocked);
			}
			p += k;
			nbytes -= k;
		}
		return s;
	}
	,readInt32: function() {
		var ch1 = this.readByte();
		var ch2 = this.readByte();
		var ch3 = this.readByte();
		var ch4 = this.readByte();
		if(this.bigEndian) {
			return ch4 | ch3 << 8 | ch2 << 16 | ch1 << 24;
		} else {
			return ch1 | ch2 << 8 | ch3 << 16 | ch4 << 24;
		}
	}
	,readString: function(len,encoding) {
		var b = new haxe_io_Bytes(new ArrayBuffer(len));
		this.readFullBytes(b,0,len);
		return b.getString(0,len,encoding);
	}
	,__properties__: {set_bigEndian:"set_bigEndian"}
};
var haxe_io_Bytes = function(data) {
	this.length = data.byteLength;
	this.b = new Uint8Array(data);
	this.b.bufferValue = data;
	data.hxBytes = this;
	data.bytes = this.b;
};
haxe_io_Bytes.__name__ = true;
haxe_io_Bytes.ofString = function(s,encoding) {
	if(encoding == haxe_io_Encoding.RawNative) {
		var buf = new Uint8Array(s.length << 1);
		var _g = 0;
		var _g1 = s.length;
		while(_g < _g1) {
			var i = _g++;
			var c = s.charCodeAt(i);
			buf[i << 1] = c & 255;
			buf[i << 1 | 1] = c >> 8;
		}
		return new haxe_io_Bytes(buf.buffer);
	}
	var a = [];
	var i = 0;
	while(i < s.length) {
		var c = s.charCodeAt(i++);
		if(55296 <= c && c <= 56319) {
			c = c - 55232 << 10 | s.charCodeAt(i++) & 1023;
		}
		if(c <= 127) {
			a.push(c);
		} else if(c <= 2047) {
			a.push(192 | c >> 6);
			a.push(128 | c & 63);
		} else if(c <= 65535) {
			a.push(224 | c >> 12);
			a.push(128 | c >> 6 & 63);
			a.push(128 | c & 63);
		} else {
			a.push(240 | c >> 18);
			a.push(128 | c >> 12 & 63);
			a.push(128 | c >> 6 & 63);
			a.push(128 | c & 63);
		}
	}
	return new haxe_io_Bytes(new Uint8Array(a).buffer);
};
haxe_io_Bytes.ofData = function(b) {
	var hb = b.hxBytes;
	if(hb != null) {
		return hb;
	}
	return new haxe_io_Bytes(b);
};
haxe_io_Bytes.prototype = {
	blit: function(pos,src,srcpos,len) {
		if(pos < 0 || srcpos < 0 || len < 0 || pos + len > this.length || srcpos + len > src.length) {
			throw haxe_Exception.thrown(haxe_io_Error.OutsideBounds);
		}
		if(srcpos == 0 && len == src.b.byteLength) {
			this.b.set(src.b,pos);
		} else {
			this.b.set(src.b.subarray(srcpos,srcpos + len),pos);
		}
	}
	,fill: function(pos,len,value) {
		var _g = 0;
		var _g1 = len;
		while(_g < _g1) {
			var i = _g++;
			this.b[pos++] = value;
		}
	}
	,getString: function(pos,len,encoding) {
		if(pos < 0 || len < 0 || pos + len > this.length) {
			throw haxe_Exception.thrown(haxe_io_Error.OutsideBounds);
		}
		if(encoding == null) {
			encoding = haxe_io_Encoding.UTF8;
		}
		var s = "";
		var b = this.b;
		var i = pos;
		var max = pos + len;
		switch(encoding._hx_index) {
		case 0:
			var debug = pos > 0;
			while(i < max) {
				var c = b[i++];
				if(c < 128) {
					if(c == 0) {
						break;
					}
					s += String.fromCodePoint(c);
				} else if(c < 224) {
					var code = (c & 63) << 6 | b[i++] & 127;
					s += String.fromCodePoint(code);
				} else if(c < 240) {
					var c2 = b[i++];
					var code1 = (c & 31) << 12 | (c2 & 127) << 6 | b[i++] & 127;
					s += String.fromCodePoint(code1);
				} else {
					var c21 = b[i++];
					var c3 = b[i++];
					var u = (c & 15) << 18 | (c21 & 127) << 12 | (c3 & 127) << 6 | b[i++] & 127;
					s += String.fromCodePoint(u);
				}
			}
			break;
		case 1:
			while(i < max) {
				var c = b[i++] | b[i++] << 8;
				s += String.fromCodePoint(c);
			}
			break;
		}
		return s;
	}
};
var haxe_io_BytesBuffer = function() {
	this.pos = 0;
	this.size = 0;
};
haxe_io_BytesBuffer.__name__ = true;
haxe_io_BytesBuffer.prototype = {
	addByte: function(byte) {
		if(this.pos == this.size) {
			this.grow(1);
		}
		this.view.setUint8(this.pos++,byte);
	}
	,add: function(src) {
		if(this.pos + src.length > this.size) {
			this.grow(src.length);
		}
		if(this.size == 0) {
			return;
		}
		var sub = new Uint8Array(src.b.buffer,src.b.byteOffset,src.length);
		this.u8.set(sub,this.pos);
		this.pos += src.length;
	}
	,addBytes: function(src,pos,len) {
		if(pos < 0 || len < 0 || pos + len > src.length) {
			throw haxe_Exception.thrown(haxe_io_Error.OutsideBounds);
		}
		if(this.pos + len > this.size) {
			this.grow(len);
		}
		if(this.size == 0) {
			return;
		}
		var sub = new Uint8Array(src.b.buffer,src.b.byteOffset + pos,len);
		this.u8.set(sub,this.pos);
		this.pos += len;
	}
	,grow: function(delta) {
		var req = this.pos + delta;
		var nsize = this.size == 0 ? 16 : this.size;
		while(nsize < req) nsize = nsize * 3 >> 1;
		var nbuf = new ArrayBuffer(nsize);
		var nu8 = new Uint8Array(nbuf);
		if(this.size > 0) {
			nu8.set(this.u8);
		}
		this.size = nsize;
		this.buffer = nbuf;
		this.u8 = nu8;
		this.view = new DataView(this.buffer);
	}
	,getBytes: function() {
		if(this.size == 0) {
			return new haxe_io_Bytes(new ArrayBuffer(0));
		}
		var b = new haxe_io_Bytes(this.buffer);
		b.length = this.pos;
		return b;
	}
};
var haxe_io_BytesInput = function(b,pos,len) {
	if(pos == null) {
		pos = 0;
	}
	if(len == null) {
		len = b.length - pos;
	}
	if(pos < 0 || len < 0 || pos + len > b.length) {
		throw haxe_Exception.thrown(haxe_io_Error.OutsideBounds);
	}
	this.b = b.b;
	this.pos = pos;
	this.len = len;
	this.totlen = len;
};
haxe_io_BytesInput.__name__ = true;
haxe_io_BytesInput.__super__ = haxe_io_Input;
haxe_io_BytesInput.prototype = $extend(haxe_io_Input.prototype,{
	readByte: function() {
		if(this.len == 0) {
			throw haxe_Exception.thrown(new haxe_io_Eof());
		}
		this.len--;
		return this.b[this.pos++];
	}
	,readBytes: function(buf,pos,len) {
		if(pos < 0 || len < 0 || pos + len > buf.length) {
			throw haxe_Exception.thrown(haxe_io_Error.OutsideBounds);
		}
		if(this.len == 0 && len > 0) {
			throw haxe_Exception.thrown(new haxe_io_Eof());
		}
		if(this.len < len) {
			len = this.len;
		}
		var b1 = this.b;
		var b2 = buf.b;
		var _g = 0;
		var _g1 = len;
		while(_g < _g1) {
			var i = _g++;
			b2[pos + i] = b1[this.pos + i];
		}
		this.pos += len;
		this.len -= len;
		return len;
	}
});
var haxe_io_Output = function() { };
haxe_io_Output.__name__ = true;
haxe_io_Output.prototype = {
	writeByte: function(c) {
		throw new haxe_exceptions_NotImplementedException(null,null,{ fileName : "haxe/io/Output.hx", lineNumber : 47, className : "haxe.io.Output", methodName : "writeByte"});
	}
	,writeBytes: function(s,pos,len) {
		if(pos < 0 || len < 0 || pos + len > s.length) {
			throw haxe_Exception.thrown(haxe_io_Error.OutsideBounds);
		}
		var b = s.b;
		var k = len;
		while(k > 0) {
			this.writeByte(b[pos]);
			++pos;
			--k;
		}
		return len;
	}
	,set_bigEndian: function(b) {
		this.bigEndian = b;
		return b;
	}
	,write: function(s) {
		var l = s.length;
		var p = 0;
		while(l > 0) {
			var k = this.writeBytes(s,p,l);
			if(k == 0) {
				throw haxe_Exception.thrown(haxe_io_Error.Blocked);
			}
			p += k;
			l -= k;
		}
	}
	,writeFullBytes: function(s,pos,len) {
		while(len > 0) {
			var k = this.writeBytes(s,pos,len);
			pos += k;
			len -= k;
		}
	}
	,writeInt32: function(x) {
		if(this.bigEndian) {
			this.writeByte(x >>> 24);
			this.writeByte(x >> 16 & 255);
			this.writeByte(x >> 8 & 255);
			this.writeByte(x & 255);
		} else {
			this.writeByte(x & 255);
			this.writeByte(x >> 8 & 255);
			this.writeByte(x >> 16 & 255);
			this.writeByte(x >>> 24);
		}
	}
	,writeString: function(s,encoding) {
		var b = haxe_io_Bytes.ofString(s,encoding);
		this.writeFullBytes(b,0,b.length);
	}
	,__properties__: {set_bigEndian:"set_bigEndian"}
};
var haxe_io_BytesOutput = function() {
	this.b = new haxe_io_BytesBuffer();
};
haxe_io_BytesOutput.__name__ = true;
haxe_io_BytesOutput.__super__ = haxe_io_Output;
haxe_io_BytesOutput.prototype = $extend(haxe_io_Output.prototype,{
	writeByte: function(c) {
		this.b.addByte(c);
	}
	,writeBytes: function(buf,pos,len) {
		this.b.addBytes(buf,pos,len);
		return len;
	}
	,getBytes: function() {
		return this.b.getBytes();
	}
});
var haxe_io_Encoding = $hxEnums["haxe.io.Encoding"] = { __ename__:true,__constructs__:null
	,UTF8: {_hx_name:"UTF8",_hx_index:0,__enum__:"haxe.io.Encoding",toString:$estr}
	,RawNative: {_hx_name:"RawNative",_hx_index:1,__enum__:"haxe.io.Encoding",toString:$estr}
};
haxe_io_Encoding.__constructs__ = [haxe_io_Encoding.UTF8,haxe_io_Encoding.RawNative];
var haxe_io_Eof = function() {
};
haxe_io_Eof.__name__ = true;
haxe_io_Eof.prototype = {
	toString: function() {
		return "Eof";
	}
};
var haxe_io_Error = $hxEnums["haxe.io.Error"] = { __ename__:true,__constructs__:null
	,Blocked: {_hx_name:"Blocked",_hx_index:0,__enum__:"haxe.io.Error",toString:$estr}
	,Overflow: {_hx_name:"Overflow",_hx_index:1,__enum__:"haxe.io.Error",toString:$estr}
	,OutsideBounds: {_hx_name:"OutsideBounds",_hx_index:2,__enum__:"haxe.io.Error",toString:$estr}
	,Custom: ($_=function(e) { return {_hx_index:3,e:e,__enum__:"haxe.io.Error",toString:$estr}; },$_._hx_name="Custom",$_.__params__ = ["e"],$_)
};
haxe_io_Error.__constructs__ = [haxe_io_Error.Blocked,haxe_io_Error.Overflow,haxe_io_Error.OutsideBounds,haxe_io_Error.Custom];
var haxe_iterators_ArrayIterator = function(array) {
	this.current = 0;
	this.array = array;
};
haxe_iterators_ArrayIterator.__name__ = true;
haxe_iterators_ArrayIterator.prototype = {
	hasNext: function() {
		return this.current < this.array.length;
	}
	,next: function() {
		return this.array[this.current++];
	}
};
var js_Boot = function() { };
js_Boot.__name__ = true;
js_Boot.__string_rec = function(o,s) {
	if(o == null) {
		return "null";
	}
	if(s.length >= 5) {
		return "<...>";
	}
	var t = typeof(o);
	if(t == "function" && (o.__name__ || o.__ename__)) {
		t = "object";
	}
	switch(t) {
	case "function":
		return "<function>";
	case "object":
		if(o.__enum__) {
			var e = $hxEnums[o.__enum__];
			var con = e.__constructs__[o._hx_index];
			var n = con._hx_name;
			if(con.__params__) {
				s = s + "\t";
				return n + "(" + ((function($this) {
					var $r;
					var _g = [];
					{
						var _g1 = 0;
						var _g2 = con.__params__;
						while(true) {
							if(!(_g1 < _g2.length)) {
								break;
							}
							var p = _g2[_g1];
							_g1 = _g1 + 1;
							_g.push(js_Boot.__string_rec(o[p],s));
						}
					}
					$r = _g;
					return $r;
				}(this))).join(",") + ")";
			} else {
				return n;
			}
		}
		if(((o) instanceof Array)) {
			var str = "[";
			s += "\t";
			var _g = 0;
			var _g1 = o.length;
			while(_g < _g1) {
				var i = _g++;
				str += (i > 0 ? "," : "") + js_Boot.__string_rec(o[i],s);
			}
			str += "]";
			return str;
		}
		var tostr;
		try {
			tostr = o.toString;
		} catch( _g ) {
			return "???";
		}
		if(tostr != null && tostr != Object.toString && typeof(tostr) == "function") {
			var s2 = o.toString();
			if(s2 != "[object Object]") {
				return s2;
			}
		}
		var str = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		var k = null;
		for( k in o ) {
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
			continue;
		}
		if(str.length != 2) {
			str += ", \n";
		}
		str += s + k + " : " + js_Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str += "\n" + s + "}";
		return str;
	case "string":
		return o;
	default:
		return String(o);
	}
};
var lib_Rarezip = function() { };
lib_Rarezip.__name__ = true;
lib_Rarezip.compress = function(src) {
	var size = src.get_length();
	var compressed = new Zlib.RawDeflate(src).compress();
	var out = new framework_ByteThingyWhatToNameIt(new haxe_io_Bytes(new ArrayBuffer(compressed.length + 5)),false);
	out.writeUint32(size,true);
	out.writeUint8(9);
	out.writeUint8Array(compressed);
	out.position = 0;
	return out;
};
lib_Rarezip.decompress = function(src) {
	var size = src.readUint32(true);
	var level = src.readUint8();
	var compressedSize = src.get_length() - 5;
	var compressed = src.readUint8Array(compressedSize);
	var decompressed = new Zlib.RawInflate(compressed).decompress();
	if(decompressed.length != size) {
		throw haxe_Exception.thrown("decompressed size does not match");
	}
	var out = new framework_ByteThingyWhatToNameIt(new haxe_io_Bytes(new ArrayBuffer(decompressed.length)),false);
	out.writeUint8Array(decompressed);
	out.position = 0;
	return out;
};
var lib_haxepngjs_Color = $hxEnums["lib.haxepngjs.Color"] = { __ename__:true,__constructs__:null
	,ColGrey: ($_=function(alpha) { return {_hx_index:0,alpha:alpha,__enum__:"lib.haxepngjs.Color",toString:$estr}; },$_._hx_name="ColGrey",$_.__params__ = ["alpha"],$_)
	,ColTrue: ($_=function(alpha) { return {_hx_index:1,alpha:alpha,__enum__:"lib.haxepngjs.Color",toString:$estr}; },$_._hx_name="ColTrue",$_.__params__ = ["alpha"],$_)
	,ColIndexed: {_hx_name:"ColIndexed",_hx_index:2,__enum__:"lib.haxepngjs.Color",toString:$estr}
};
lib_haxepngjs_Color.__constructs__ = [lib_haxepngjs_Color.ColGrey,lib_haxepngjs_Color.ColTrue,lib_haxepngjs_Color.ColIndexed];
var lib_haxepngjs_Chunk = $hxEnums["lib.haxepngjs.Chunk"] = { __ename__:true,__constructs__:null
	,CEnd: {_hx_name:"CEnd",_hx_index:0,__enum__:"lib.haxepngjs.Chunk",toString:$estr}
	,CHeader: ($_=function(h) { return {_hx_index:1,h:h,__enum__:"lib.haxepngjs.Chunk",toString:$estr}; },$_._hx_name="CHeader",$_.__params__ = ["h"],$_)
	,CData: ($_=function(b) { return {_hx_index:2,b:b,__enum__:"lib.haxepngjs.Chunk",toString:$estr}; },$_._hx_name="CData",$_.__params__ = ["b"],$_)
	,CPalette: ($_=function(b) { return {_hx_index:3,b:b,__enum__:"lib.haxepngjs.Chunk",toString:$estr}; },$_._hx_name="CPalette",$_.__params__ = ["b"],$_)
	,CUnknown: ($_=function(id,data) { return {_hx_index:4,id:id,data:data,__enum__:"lib.haxepngjs.Chunk",toString:$estr}; },$_._hx_name="CUnknown",$_.__params__ = ["id","data"],$_)
};
lib_haxepngjs_Chunk.__constructs__ = [lib_haxepngjs_Chunk.CEnd,lib_haxepngjs_Chunk.CHeader,lib_haxepngjs_Chunk.CData,lib_haxepngjs_Chunk.CPalette,lib_haxepngjs_Chunk.CUnknown];
var lib_haxepngjs_Reader = function(i) {
	this.i = i;
	i.set_bigEndian(true);
	this.checkCRC = true;
};
lib_haxepngjs_Reader.__name__ = true;
lib_haxepngjs_Reader.prototype = {
	read: function() {
		var b = 137;
		if(this.i.readByte() != b) {
			throw haxe_Exception.thrown("Invalid header");
		}
		var b = 80;
		if(this.i.readByte() != b) {
			throw haxe_Exception.thrown("Invalid header");
		}
		var b = 78;
		if(this.i.readByte() != b) {
			throw haxe_Exception.thrown("Invalid header");
		}
		var b = 71;
		if(this.i.readByte() != b) {
			throw haxe_Exception.thrown("Invalid header");
		}
		var b = 13;
		if(this.i.readByte() != b) {
			throw haxe_Exception.thrown("Invalid header");
		}
		var b = 10;
		if(this.i.readByte() != b) {
			throw haxe_Exception.thrown("Invalid header");
		}
		var b = 26;
		if(this.i.readByte() != b) {
			throw haxe_Exception.thrown("Invalid header");
		}
		var b = 10;
		if(this.i.readByte() != b) {
			throw haxe_Exception.thrown("Invalid header");
		}
		var l = new haxe_ds_List();
		while(true) {
			var c = this.readChunk();
			l.add(c);
			if(c == lib_haxepngjs_Chunk.CEnd) {
				break;
			}
		}
		return l;
	}
	,readHeader: function(i) {
		i.set_bigEndian(true);
		var width = i.readInt32();
		var height = i.readInt32();
		var colbits = i.readByte();
		var color = i.readByte();
		var color1;
		switch(color) {
		case 0:
			color1 = lib_haxepngjs_Color.ColGrey(false);
			break;
		case 2:
			color1 = lib_haxepngjs_Color.ColTrue(false);
			break;
		case 3:
			color1 = lib_haxepngjs_Color.ColIndexed;
			break;
		case 4:
			color1 = lib_haxepngjs_Color.ColGrey(true);
			break;
		case 6:
			color1 = lib_haxepngjs_Color.ColTrue(true);
			break;
		default:
			throw haxe_Exception.thrown("Unknown color model " + color + ":" + colbits);
		}
		var compress = i.readByte();
		var filter = i.readByte();
		if(compress != 0 || filter != 0) {
			throw haxe_Exception.thrown("Invalid header");
		}
		var interlace = i.readByte();
		if(interlace != 0 && interlace != 1) {
			throw haxe_Exception.thrown("Invalid header");
		}
		return { width : width, height : height, colbits : colbits, color : color1, interlaced : interlace == 1};
	}
	,readChunk: function() {
		var dataLen = this.i.readInt32();
		var id = this.i.readString(4);
		var data = this.i.read(dataLen);
		var crc = this.i.readInt32();
		if(this.checkCRC) {
			var c_crc = -1;
			var tmp = (c_crc ^ HxOverrides.cca(id,0)) & 255;
			tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
			tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
			tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
			tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
			tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
			tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
			tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
			tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
			c_crc = c_crc >>> 8 ^ tmp;
			var tmp = (c_crc ^ HxOverrides.cca(id,1)) & 255;
			tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
			tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
			tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
			tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
			tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
			tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
			tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
			tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
			c_crc = c_crc >>> 8 ^ tmp;
			var tmp = (c_crc ^ HxOverrides.cca(id,2)) & 255;
			tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
			tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
			tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
			tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
			tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
			tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
			tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
			tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
			c_crc = c_crc >>> 8 ^ tmp;
			var tmp = (c_crc ^ HxOverrides.cca(id,3)) & 255;
			tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
			tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
			tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
			tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
			tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
			tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
			tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
			tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
			c_crc = c_crc >>> 8 ^ tmp;
			var b = data.b.bufferValue;
			var _g = 0;
			var _g1 = data.length;
			while(_g < _g1) {
				var i = _g++;
				var tmp = (c_crc ^ b.bytes[i]) & 255;
				tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
				tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
				tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
				tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
				tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
				tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
				tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
				tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
				c_crc = c_crc >>> 8 ^ tmp;
			}
			if((c_crc ^ -1) != crc) {
				throw haxe_Exception.thrown("CRC check failure");
			}
		}
		switch(id) {
		case "IDAT":
			return lib_haxepngjs_Chunk.CData(data);
		case "IEND":
			return lib_haxepngjs_Chunk.CEnd;
		case "IHDR":
			return lib_haxepngjs_Chunk.CHeader(this.readHeader(new haxe_io_BytesInput(data)));
		case "PLTE":
			return lib_haxepngjs_Chunk.CPalette(data);
		default:
			return lib_haxepngjs_Chunk.CUnknown(id,data);
		}
	}
};
var lib_haxepngjs_Tools = function() { };
lib_haxepngjs_Tools.__name__ = true;
lib_haxepngjs_Tools.getHeader = function(d) {
	var _g_head = d.h;
	while(_g_head != null) {
		var val = _g_head.item;
		_g_head = _g_head.next;
		var c = val;
		if(c._hx_index == 1) {
			var h = c.h;
			return h;
		}
	}
	throw haxe_Exception.thrown("Header not found");
};
lib_haxepngjs_Tools.getPalette = function(d) {
	var _g_head = d.h;
	while(_g_head != null) {
		var val = _g_head.item;
		_g_head = _g_head.next;
		var c = val;
		if(c._hx_index == 3) {
			var b = c.b;
			return b;
		}
	}
	return null;
};
lib_haxepngjs_Tools.filter = function(data,x,y,stride,prev,p,numChannels) {
	if(numChannels == null) {
		numChannels = 4;
	}
	var b = y == 0 ? 0 : data.b[p - stride];
	var c = x == 0 || y == 0 ? 0 : data.b[p - stride - numChannels];
	var k = prev + b - c;
	var pa = k - prev;
	if(pa < 0) {
		pa = -pa;
	}
	var pb = k - b;
	if(pb < 0) {
		pb = -pb;
	}
	var pc = k - c;
	if(pc < 0) {
		pc = -pc;
	}
	if(pa <= pb && pa <= pc) {
		return prev;
	} else if(pb <= pc) {
		return b;
	} else {
		return c;
	}
};
lib_haxepngjs_Tools.reverseBytes = function(b) {
	var p = 0;
	var _g = 0;
	var _g1 = b.length >> 2;
	while(_g < _g1) {
		var i = _g++;
		var b1 = b.b[p];
		var g = b.b[p + 1];
		var r = b.b[p + 2];
		var a = b.b[p + 3];
		b.b[p++] = a;
		b.b[p++] = r;
		b.b[p++] = g;
		b.b[p++] = b1;
	}
};
lib_haxepngjs_Tools.extractGrey = function(d) {
	var h = lib_haxepngjs_Tools.getHeader(d);
	var grey = new haxe_io_Bytes(new ArrayBuffer(h.width * h.height));
	var data = null;
	var fullData = null;
	var _g_head = d.h;
	while(_g_head != null) {
		var val = _g_head.item;
		_g_head = _g_head.next;
		var c = val;
		if(c._hx_index == 2) {
			var b = c.b;
			if(fullData != null) {
				fullData.add(b);
			} else if(data == null) {
				data = b;
			} else {
				fullData = new haxe_io_BytesBuffer();
				fullData.add(data);
				fullData.add(b);
				data = null;
			}
		}
	}
	if(fullData != null) {
		data = fullData.getBytes();
	}
	if(data == null) {
		throw haxe_Exception.thrown("Data not found");
	}
	var this1 = new Uint8Array(data.length);
	var out = this1;
	var _g = 0;
	var _g1 = data.length;
	while(_g < _g1) {
		var i = _g++;
		out[i] = data.b[i];
	}
	var compressedStream = out;
	var inflateStream1 = new Zlib.RawInflate(compressedStream).compress();
	var out = new haxe_io_Bytes(new ArrayBuffer(inflateStream1.length));
	var _g = 0;
	var _g1 = inflateStream1.length;
	while(_g < _g1) {
		var i = _g++;
		out.b[i] = inflateStream1[i];
	}
	data = out;
	var r = 0;
	var w = 0;
	var _g = h.color;
	if(_g._hx_index == 0) {
		var alpha = _g.alpha;
		if(h.colbits != 8) {
			throw haxe_Exception.thrown("Unsupported color mode");
		}
		var width = h.width;
		var stride = (alpha ? 2 : 1) * width + 1;
		if(data.length < h.height * stride) {
			throw haxe_Exception.thrown("Not enough data");
		}
		var rinc = alpha ? 2 : 1;
		var _g = 0;
		var _g1 = h.height;
		while(_g < _g1) {
			var y = _g++;
			var f = data.b[r++];
			switch(f) {
			case 0:
				var _g2 = 0;
				var _g3 = width;
				while(_g2 < _g3) {
					var x = _g2++;
					var v = data.b[r];
					r += rinc;
					grey.b[w++] = v;
				}
				break;
			case 1:
				var cv = 0;
				var _g4 = 0;
				var _g5 = width;
				while(_g4 < _g5) {
					var x1 = _g4++;
					cv += data.b[r];
					r += rinc;
					grey.b[w++] = cv;
				}
				break;
			case 2:
				var stride = y == 0 ? 0 : width;
				var _g6 = 0;
				var _g7 = width;
				while(_g6 < _g7) {
					var x2 = _g6++;
					var v1 = data.b[r] + grey.b[w - stride];
					r += rinc;
					grey.b[w++] = v1;
				}
				break;
			case 3:
				var cv1 = 0;
				var stride1 = y == 0 ? 0 : width;
				var _g8 = 0;
				var _g9 = width;
				while(_g8 < _g9) {
					var x3 = _g8++;
					cv1 = data.b[r] + (cv1 + grey.b[w - stride1] >> 1) & 255;
					r += rinc;
					grey.b[w++] = cv1;
				}
				break;
			case 4:
				var stride2 = width;
				var cv2 = 0;
				var _g10 = 0;
				var _g11 = width;
				while(_g10 < _g11) {
					var x4 = _g10++;
					var numChannels = 1;
					if(numChannels == null) {
						numChannels = 4;
					}
					var b = y == 0 ? 0 : grey.b[w - stride2];
					var c = x4 == 0 || y == 0 ? 0 : grey.b[w - stride2 - numChannels];
					var k = cv2 + b - c;
					var pa = k - cv2;
					if(pa < 0) {
						pa = -pa;
					}
					var pb = k - b;
					if(pb < 0) {
						pb = -pb;
					}
					var pc = k - c;
					if(pc < 0) {
						pc = -pc;
					}
					cv2 = (pa <= pb && pa <= pc ? cv2 : pb <= pc ? b : c) + data.b[r] & 255;
					r += rinc;
					grey.b[w++] = cv2;
				}
				break;
			default:
				throw haxe_Exception.thrown("Invalid filter " + f);
			}
		}
	} else {
		throw haxe_Exception.thrown("Unsupported color mode");
	}
	return grey;
};
lib_haxepngjs_Tools.extract32 = function(d,bytes,flipY) {
	var h = lib_haxepngjs_Tools.getHeader(d);
	var bgra = bytes == null ? new haxe_io_Bytes(new ArrayBuffer(h.width * h.height * 4)) : bytes;
	var data = null;
	var fullData = null;
	var _g_head = d.h;
	while(_g_head != null) {
		var val = _g_head.item;
		_g_head = _g_head.next;
		var c = val;
		if(c._hx_index == 2) {
			var b = c.b;
			if(fullData != null) {
				fullData.add(b);
			} else if(data == null) {
				data = b;
			} else {
				fullData = new haxe_io_BytesBuffer();
				fullData.add(data);
				fullData.add(b);
				data = null;
			}
		}
	}
	if(fullData != null) {
		data = fullData.getBytes();
	}
	if(data == null) {
		throw haxe_Exception.thrown("Data not found");
	}
	var this1 = new Uint8Array(data.length);
	var out = this1;
	var _g = 0;
	var _g1 = data.length;
	while(_g < _g1) {
		var i = _g++;
		out[i] = data.b[i];
	}
	var compressedStream = out;
	var inflateStream1 = new Zlib.RawInflate(compressedStream).compress();
	var out = new haxe_io_Bytes(new ArrayBuffer(inflateStream1.length));
	var _g = 0;
	var _g1 = inflateStream1.length;
	while(_g < _g1) {
		var i = _g++;
		out.b[i] = inflateStream1[i];
	}
	data = out;
	var r = 0;
	var w = 0;
	var lineDelta = 0;
	if(flipY) {
		lineDelta = -h.width * 8;
		w = (h.height - 1) * (h.width * 4);
	}
	var flipY1 = flipY ? -1 : 1;
	var _g = h.color;
	switch(_g._hx_index) {
	case 0:
		var alpha = _g.alpha;
		if(h.colbits != 8) {
			throw haxe_Exception.thrown("Unsupported color mode");
		}
		var width = h.width;
		var stride = (alpha ? 2 : 1) * width + 1;
		if(data.length < h.height * stride) {
			throw haxe_Exception.thrown("Not enough data");
		}
		var alphvaIdx = -1;
		if(!alpha) {
			var _g1_head = d.h;
			while(_g1_head != null) {
				var val = _g1_head.item;
				_g1_head = _g1_head.next;
				var t = val;
				if(t._hx_index == 4) {
					if(t.id == "tRNS") {
						var data1 = t.data;
						if(data1.length >= 2) {
							alphvaIdx = data1.b[1];
						}
						break;
					}
				}
			}
		}
		var _g1 = 0;
		var _g2 = h.height;
		while(_g1 < _g2) {
			var y = _g1++;
			var f = data.b[r++];
			switch(f) {
			case 0:
				if(alpha) {
					var _g3 = 0;
					var _g4 = width;
					while(_g3 < _g4) {
						var x = _g3++;
						var v = data.b[r++];
						bgra.b[w++] = v;
						bgra.b[w++] = v;
						bgra.b[w++] = v;
						bgra.b[w++] = data.b[r++];
					}
				} else {
					var _g5 = 0;
					var _g6 = width;
					while(_g5 < _g6) {
						var x1 = _g5++;
						var v1 = data.b[r++];
						bgra.b[w++] = v1;
						bgra.b[w++] = v1;
						bgra.b[w++] = v1;
						bgra.b[w++] = v1 == alphvaIdx ? 0 : 255;
					}
				}
				break;
			case 1:
				var cv = 0;
				var ca = 0;
				if(alpha) {
					var _g7 = 0;
					var _g8 = width;
					while(_g7 < _g8) {
						var x2 = _g7++;
						cv += data.b[r++];
						bgra.b[w++] = cv;
						bgra.b[w++] = cv;
						bgra.b[w++] = cv;
						ca += data.b[r++];
						bgra.b[w++] = ca;
					}
				} else {
					var _g9 = 0;
					var _g10 = width;
					while(_g9 < _g10) {
						var x3 = _g9++;
						cv += data.b[r++];
						bgra.b[w++] = cv;
						bgra.b[w++] = cv;
						bgra.b[w++] = cv;
						bgra.b[w++] = cv == alphvaIdx ? 0 : 255;
					}
				}
				break;
			case 2:
				var stride = y == 0 ? 0 : width * 4 * flipY1;
				if(alpha) {
					var _g11 = 0;
					var _g12 = width;
					while(_g11 < _g12) {
						var x4 = _g11++;
						var v2 = data.b[r++] + bgra.b[w - stride];
						bgra.b[w++] = v2;
						bgra.b[w++] = v2;
						bgra.b[w++] = v2;
						bgra.b[w++] = data.b[r++] + bgra.b[w - stride];
					}
				} else {
					var _g13 = 0;
					var _g14 = width;
					while(_g13 < _g14) {
						var x5 = _g13++;
						var v3 = data.b[r++] + bgra.b[w - stride];
						bgra.b[w++] = v3;
						bgra.b[w++] = v3;
						bgra.b[w++] = v3;
						bgra.b[w++] = v3 == alphvaIdx ? 0 : 255;
					}
				}
				break;
			case 3:
				var cv1 = 0;
				var ca1 = 0;
				var stride1 = y == 0 ? 0 : width * 4 * flipY1;
				if(alpha) {
					var _g15 = 0;
					var _g16 = width;
					while(_g15 < _g16) {
						var x6 = _g15++;
						cv1 = data.b[r++] + (cv1 + bgra.b[w - stride1] >> 1) & 255;
						bgra.b[w++] = cv1;
						bgra.b[w++] = cv1;
						bgra.b[w++] = cv1;
						ca1 = data.b[r++] + (ca1 + bgra.b[w - stride1] >> 1) & 255;
						bgra.b[w++] = ca1;
					}
				} else {
					var _g17 = 0;
					var _g18 = width;
					while(_g17 < _g18) {
						var x7 = _g17++;
						cv1 = data.b[r++] + (cv1 + bgra.b[w - stride1] >> 1) & 255;
						bgra.b[w++] = cv1;
						bgra.b[w++] = cv1;
						bgra.b[w++] = cv1;
						bgra.b[w++] = cv1 == alphvaIdx ? 0 : 255;
					}
				}
				break;
			case 4:
				var stride2 = width * 4 * flipY1;
				var cv2 = 0;
				var ca2 = 0;
				if(alpha) {
					var _g19 = 0;
					var _g20 = width;
					while(_g19 < _g20) {
						var x8 = _g19++;
						var b = y == 0 ? 0 : bgra.b[w - stride2];
						var c = x8 == 0 || y == 0 ? 0 : bgra.b[w - stride2 - 4];
						var k = cv2 + b - c;
						var pa = k - cv2;
						if(pa < 0) {
							pa = -pa;
						}
						var pb = k - b;
						if(pb < 0) {
							pb = -pb;
						}
						var pc = k - c;
						if(pc < 0) {
							pc = -pc;
						}
						var pos = r++;
						cv2 = (pa <= pb && pa <= pc ? cv2 : pb <= pc ? b : c) + data.b[pos] & 255;
						bgra.b[w++] = cv2;
						bgra.b[w++] = cv2;
						bgra.b[w++] = cv2;
						var b1 = y == 0 ? 0 : bgra.b[w - stride2];
						var c1 = x8 == 0 || y == 0 ? 0 : bgra.b[w - stride2 - 4];
						var k1 = ca2 + b1 - c1;
						var pa1 = k1 - ca2;
						if(pa1 < 0) {
							pa1 = -pa1;
						}
						var pb1 = k1 - b1;
						if(pb1 < 0) {
							pb1 = -pb1;
						}
						var pc1 = k1 - c1;
						if(pc1 < 0) {
							pc1 = -pc1;
						}
						var pos1 = r++;
						ca2 = (pa1 <= pb1 && pa1 <= pc1 ? ca2 : pb1 <= pc1 ? b1 : c1) + data.b[pos1] & 255;
						bgra.b[w++] = ca2;
					}
				} else {
					var _g21 = 0;
					var _g22 = width;
					while(_g21 < _g22) {
						var x9 = _g21++;
						var b2 = y == 0 ? 0 : bgra.b[w - stride2];
						var c2 = x9 == 0 || y == 0 ? 0 : bgra.b[w - stride2 - 4];
						var k2 = cv2 + b2 - c2;
						var pa2 = k2 - cv2;
						if(pa2 < 0) {
							pa2 = -pa2;
						}
						var pb2 = k2 - b2;
						if(pb2 < 0) {
							pb2 = -pb2;
						}
						var pc2 = k2 - c2;
						if(pc2 < 0) {
							pc2 = -pc2;
						}
						var pos2 = r++;
						cv2 = (pa2 <= pb2 && pa2 <= pc2 ? cv2 : pb2 <= pc2 ? b2 : c2) + data.b[pos2] & 255;
						bgra.b[w++] = cv2;
						bgra.b[w++] = cv2;
						bgra.b[w++] = cv2;
						bgra.b[w++] = cv2 == alphvaIdx ? 0 : 255;
					}
				}
				break;
			default:
				throw haxe_Exception.thrown("Invalid filter " + f);
			}
			w += lineDelta;
		}
		break;
	case 1:
		var alpha = _g.alpha;
		if(h.colbits != 8) {
			throw haxe_Exception.thrown("Unsupported color mode");
		}
		var width = h.width;
		var stride = (alpha ? 4 : 3) * width + 1;
		if(data.length < h.height * stride) {
			throw haxe_Exception.thrown("Not enough data");
		}
		var alphaRed = -1;
		var alphaGreen = -1;
		var alphaBlue = -1;
		if(!alpha) {
			var _g1_head = d.h;
			while(_g1_head != null) {
				var val = _g1_head.item;
				_g1_head = _g1_head.next;
				var t = val;
				if(t._hx_index == 4) {
					if(t.id == "tRNS") {
						var data1 = t.data;
						if(data1.length >= 6) {
							alphaRed = data1.b[1];
							alphaGreen = data1.b[3];
							alphaBlue = data1.b[5];
						}
						break;
					}
				}
			}
		}
		var cr = 0;
		var cg = 0;
		var cb = 0;
		var ca = 0;
		var _g = 0;
		var _g1 = h.height;
		while(_g < _g1) {
			var y = _g++;
			var f = data.b[r++];
			switch(f) {
			case 0:
				if(alpha) {
					var _g2 = 0;
					var _g3 = width;
					while(_g2 < _g3) {
						var x = _g2++;
						bgra.b[w++] = data.b[r + 2];
						bgra.b[w++] = data.b[r + 1];
						bgra.b[w++] = data.b[r];
						bgra.b[w++] = data.b[r + 3];
						r += 4;
					}
				} else {
					var _g4 = 0;
					var _g5 = width;
					while(_g4 < _g5) {
						var x1 = _g4++;
						cb = data.b[r + 2];
						bgra.b[w++] = cb;
						cg = data.b[r + 1];
						bgra.b[w++] = cg;
						cr = data.b[r];
						bgra.b[w++] = cr;
						bgra.b[w++] = cr == alphaRed && cg == alphaGreen && cb == alphaBlue ? 0 : 255;
						r += 3;
					}
				}
				break;
			case 1:
				ca = 0;
				cb = ca;
				cg = cb;
				cr = cg;
				if(alpha) {
					var _g6 = 0;
					var _g7 = width;
					while(_g6 < _g7) {
						var x2 = _g6++;
						cb += data.b[r + 2];
						bgra.b[w++] = cb;
						cg += data.b[r + 1];
						bgra.b[w++] = cg;
						cr += data.b[r];
						bgra.b[w++] = cr;
						ca += data.b[r + 3];
						bgra.b[w++] = ca;
						r += 4;
					}
				} else {
					var _g8 = 0;
					var _g9 = width;
					while(_g8 < _g9) {
						var x3 = _g8++;
						cb += data.b[r + 2];
						bgra.b[w++] = cb;
						cg += data.b[r + 1];
						bgra.b[w++] = cg;
						cr += data.b[r];
						bgra.b[w++] = cr;
						bgra.b[w++] = cr == alphaRed && cg == alphaGreen && cb == alphaBlue ? 0 : 255;
						r += 3;
					}
				}
				break;
			case 2:
				var stride = y == 0 ? 0 : width * 4 * flipY1;
				if(alpha) {
					var _g10 = 0;
					var _g11 = width;
					while(_g10 < _g11) {
						var x4 = _g10++;
						bgra.b[w] = data.b[r + 2] + bgra.b[w - stride];
						++w;
						bgra.b[w] = data.b[r + 1] + bgra.b[w - stride];
						++w;
						bgra.b[w] = data.b[r] + bgra.b[w - stride];
						++w;
						bgra.b[w] = data.b[r + 3] + bgra.b[w - stride];
						++w;
						r += 4;
					}
				} else {
					var _g12 = 0;
					var _g13 = width;
					while(_g12 < _g13) {
						var x5 = _g12++;
						cb = data.b[r + 2] + bgra.b[w - stride];
						bgra.b[w] = cb;
						++w;
						cg = data.b[r + 1] + bgra.b[w - stride];
						bgra.b[w] = cg;
						++w;
						cr = data.b[r] + bgra.b[w - stride];
						bgra.b[w] = cr;
						++w;
						bgra.b[w++] = cr == alphaRed && cg == alphaGreen && cb == alphaBlue ? 0 : 255;
						r += 3;
					}
				}
				break;
			case 3:
				ca = 0;
				cb = ca;
				cg = cb;
				cr = cg;
				var stride1 = y == 0 ? 0 : width * 4 * flipY1;
				if(alpha) {
					var _g14 = 0;
					var _g15 = width;
					while(_g14 < _g15) {
						var x6 = _g14++;
						cb = data.b[r + 2] + (cb + bgra.b[w - stride1] >> 1) & 255;
						bgra.b[w++] = cb;
						cg = data.b[r + 1] + (cg + bgra.b[w - stride1] >> 1) & 255;
						bgra.b[w++] = cg;
						cr = data.b[r] + (cr + bgra.b[w - stride1] >> 1) & 255;
						bgra.b[w++] = cr;
						ca = data.b[r + 3] + (ca + bgra.b[w - stride1] >> 1) & 255;
						bgra.b[w++] = ca;
						r += 4;
					}
				} else {
					var _g16 = 0;
					var _g17 = width;
					while(_g16 < _g17) {
						var x7 = _g16++;
						cb = data.b[r + 2] + (cb + bgra.b[w - stride1] >> 1) & 255;
						bgra.b[w++] = cb;
						cg = data.b[r + 1] + (cg + bgra.b[w - stride1] >> 1) & 255;
						bgra.b[w++] = cg;
						cr = data.b[r] + (cr + bgra.b[w - stride1] >> 1) & 255;
						bgra.b[w++] = cr;
						bgra.b[w++] = cr == alphaRed && cg == alphaGreen && cb == alphaBlue ? 0 : 255;
						r += 3;
					}
				}
				break;
			case 4:
				var stride2 = width * 4 * flipY1;
				ca = 0;
				cb = ca;
				cg = cb;
				cr = cg;
				if(alpha) {
					var _g18 = 0;
					var _g19 = width;
					while(_g18 < _g19) {
						var x8 = _g18++;
						var b = y == 0 ? 0 : bgra.b[w - stride2];
						var c = x8 == 0 || y == 0 ? 0 : bgra.b[w - stride2 - 4];
						var k = cb + b - c;
						var pa = k - cb;
						if(pa < 0) {
							pa = -pa;
						}
						var pb = k - b;
						if(pb < 0) {
							pb = -pb;
						}
						var pc = k - c;
						if(pc < 0) {
							pc = -pc;
						}
						cb = (pa <= pb && pa <= pc ? cb : pb <= pc ? b : c) + data.b[r + 2] & 255;
						bgra.b[w++] = cb;
						var b1 = y == 0 ? 0 : bgra.b[w - stride2];
						var c1 = x8 == 0 || y == 0 ? 0 : bgra.b[w - stride2 - 4];
						var k1 = cg + b1 - c1;
						var pa1 = k1 - cg;
						if(pa1 < 0) {
							pa1 = -pa1;
						}
						var pb1 = k1 - b1;
						if(pb1 < 0) {
							pb1 = -pb1;
						}
						var pc1 = k1 - c1;
						if(pc1 < 0) {
							pc1 = -pc1;
						}
						cg = (pa1 <= pb1 && pa1 <= pc1 ? cg : pb1 <= pc1 ? b1 : c1) + data.b[r + 1] & 255;
						bgra.b[w++] = cg;
						var b2 = y == 0 ? 0 : bgra.b[w - stride2];
						var c2 = x8 == 0 || y == 0 ? 0 : bgra.b[w - stride2 - 4];
						var k2 = cr + b2 - c2;
						var pa2 = k2 - cr;
						if(pa2 < 0) {
							pa2 = -pa2;
						}
						var pb2 = k2 - b2;
						if(pb2 < 0) {
							pb2 = -pb2;
						}
						var pc2 = k2 - c2;
						if(pc2 < 0) {
							pc2 = -pc2;
						}
						cr = (pa2 <= pb2 && pa2 <= pc2 ? cr : pb2 <= pc2 ? b2 : c2) + data.b[r] & 255;
						bgra.b[w++] = cr;
						var b3 = y == 0 ? 0 : bgra.b[w - stride2];
						var c3 = x8 == 0 || y == 0 ? 0 : bgra.b[w - stride2 - 4];
						var k3 = ca + b3 - c3;
						var pa3 = k3 - ca;
						if(pa3 < 0) {
							pa3 = -pa3;
						}
						var pb3 = k3 - b3;
						if(pb3 < 0) {
							pb3 = -pb3;
						}
						var pc3 = k3 - c3;
						if(pc3 < 0) {
							pc3 = -pc3;
						}
						ca = (pa3 <= pb3 && pa3 <= pc3 ? ca : pb3 <= pc3 ? b3 : c3) + data.b[r + 3] & 255;
						bgra.b[w++] = ca;
						r += 4;
					}
				} else {
					var _g20 = 0;
					var _g21 = width;
					while(_g20 < _g21) {
						var x9 = _g20++;
						var b4 = y == 0 ? 0 : bgra.b[w - stride2];
						var c4 = x9 == 0 || y == 0 ? 0 : bgra.b[w - stride2 - 4];
						var k4 = cb + b4 - c4;
						var pa4 = k4 - cb;
						if(pa4 < 0) {
							pa4 = -pa4;
						}
						var pb4 = k4 - b4;
						if(pb4 < 0) {
							pb4 = -pb4;
						}
						var pc4 = k4 - c4;
						if(pc4 < 0) {
							pc4 = -pc4;
						}
						cb = (pa4 <= pb4 && pa4 <= pc4 ? cb : pb4 <= pc4 ? b4 : c4) + data.b[r + 2] & 255;
						bgra.b[w++] = cb;
						var b5 = y == 0 ? 0 : bgra.b[w - stride2];
						var c5 = x9 == 0 || y == 0 ? 0 : bgra.b[w - stride2 - 4];
						var k5 = cg + b5 - c5;
						var pa5 = k5 - cg;
						if(pa5 < 0) {
							pa5 = -pa5;
						}
						var pb5 = k5 - b5;
						if(pb5 < 0) {
							pb5 = -pb5;
						}
						var pc5 = k5 - c5;
						if(pc5 < 0) {
							pc5 = -pc5;
						}
						cg = (pa5 <= pb5 && pa5 <= pc5 ? cg : pb5 <= pc5 ? b5 : c5) + data.b[r + 1] & 255;
						bgra.b[w++] = cg;
						var b6 = y == 0 ? 0 : bgra.b[w - stride2];
						var c6 = x9 == 0 || y == 0 ? 0 : bgra.b[w - stride2 - 4];
						var k6 = cr + b6 - c6;
						var pa6 = k6 - cr;
						if(pa6 < 0) {
							pa6 = -pa6;
						}
						var pb6 = k6 - b6;
						if(pb6 < 0) {
							pb6 = -pb6;
						}
						var pc6 = k6 - c6;
						if(pc6 < 0) {
							pc6 = -pc6;
						}
						cr = (pa6 <= pb6 && pa6 <= pc6 ? cr : pb6 <= pc6 ? b6 : c6) + data.b[r] & 255;
						bgra.b[w++] = cr;
						bgra.b[w++] = cr == alphaRed && cg == alphaGreen && cb == alphaBlue ? 0 : 255;
						r += 3;
					}
				}
				break;
			default:
				throw haxe_Exception.thrown("Invalid filter " + f);
			}
			w += lineDelta;
		}
		break;
	case 2:
		var pal = lib_haxepngjs_Tools.getPalette(d);
		if(pal == null) {
			throw haxe_Exception.thrown("PNG Palette is missing");
		}
		var alpha = null;
		var _g1_head = d.h;
		while(_g1_head != null) {
			var val = _g1_head.item;
			_g1_head = _g1_head.next;
			var t = val;
			if(t._hx_index == 4) {
				if(t.id == "tRNS") {
					var data1 = t.data;
					alpha = data1;
					break;
				}
			}
		}
		if(alpha != null && alpha.length < 1 << h.colbits) {
			var alpha2 = new haxe_io_Bytes(new ArrayBuffer(1 << h.colbits));
			alpha2.blit(0,alpha,0,alpha.length);
			alpha2.fill(alpha.length,alpha2.length - alpha.length,255);
			alpha = alpha2;
		}
		var width = h.width;
		var stride = Math.ceil(width * h.colbits / 8) + 1;
		if(data.length < h.height * stride) {
			throw haxe_Exception.thrown("Not enough data");
		}
		var tmp = h.width * h.colbits;
		var rline = tmp >> 3;
		var _g = 0;
		var _g1 = h.height;
		while(_g < _g1) {
			var y = _g++;
			var f = data.b[r++];
			if(f == 0) {
				r += rline;
				continue;
			}
			switch(f) {
			case 1:
				var c = 0;
				var _g2 = 0;
				var _g3 = width;
				while(_g2 < _g3) {
					var x = _g2++;
					var v = data.b[r];
					c += v;
					data.b[r++] = c & 255;
				}
				break;
			case 2:
				var stride = y == 0 ? 0 : rline + 1;
				var _g4 = 0;
				var _g5 = width;
				while(_g4 < _g5) {
					var x1 = _g4++;
					var v1 = data.b[r];
					data.b[r] = v1 + data.b[r - stride];
					++r;
				}
				break;
			case 3:
				var c1 = 0;
				var stride1 = y == 0 ? 0 : rline + 1;
				var _g6 = 0;
				var _g7 = width;
				while(_g6 < _g7) {
					var x2 = _g6++;
					var v2 = data.b[r];
					c1 = v2 + (c1 + data.b[r - stride1] >> 1) & 255;
					data.b[r++] = c1;
				}
				break;
			case 4:
				var stride2 = rline + 1;
				var c2 = 0;
				var _g8 = 0;
				var _g9 = width;
				while(_g8 < _g9) {
					var x3 = _g8++;
					var v3 = data.b[r];
					var numChannels = 1;
					if(numChannels == null) {
						numChannels = 4;
					}
					var b = y == 0 ? 0 : data.b[r - stride2];
					var c3 = x3 == 0 || y == 0 ? 0 : data.b[r - stride2 - numChannels];
					var k = c2 + b - c3;
					var pa = k - c2;
					if(pa < 0) {
						pa = -pa;
					}
					var pb = k - b;
					if(pb < 0) {
						pb = -pb;
					}
					var pc = k - c3;
					if(pc < 0) {
						pc = -pc;
					}
					c2 = (pa <= pb && pa <= pc ? c2 : pb <= pc ? b : c3) + v3 & 255;
					data.b[r++] = c2;
				}
				break;
			default:
				throw haxe_Exception.thrown("Invalid filter " + f);
			}
		}
		var r = 0;
		if(h.colbits == 8) {
			var _g = 0;
			var _g1 = h.height;
			while(_g < _g1) {
				var y = _g++;
				++r;
				var _g2 = 0;
				var _g3 = h.width;
				while(_g2 < _g3) {
					var x = _g2++;
					var c = data.b[r++];
					bgra.b[w++] = pal.b[c * 3 + 2];
					bgra.b[w++] = pal.b[c * 3 + 1];
					bgra.b[w++] = pal.b[c * 3];
					bgra.b[w++] = alpha != null ? alpha.b[c] : 255;
				}
				w += lineDelta;
			}
		} else if(h.colbits < 8) {
			var req = h.colbits;
			var mask = (1 << req) - 1;
			var _g = 0;
			var _g1 = h.height;
			while(_g < _g1) {
				var y = _g++;
				++r;
				var bits = 0;
				var nbits = 0;
				var _g2 = 0;
				var _g3 = h.width;
				while(_g2 < _g3) {
					var x = _g2++;
					if(nbits < req) {
						bits = bits << 8 | data.b[r++];
						nbits += 8;
					}
					var c = bits >>> nbits - req & mask;
					nbits -= req;
					bgra.b[w++] = pal.b[c * 3 + 2];
					bgra.b[w++] = pal.b[c * 3 + 1];
					bgra.b[w++] = pal.b[c * 3];
					bgra.b[w++] = alpha != null ? alpha.b[c] : 255;
				}
				w += lineDelta;
			}
		} else {
			throw haxe_Exception.thrown(h.colbits + " indexed bits per pixel not supported");
		}
		break;
	}
	return bgra;
};
lib_haxepngjs_Tools.buildGrey = function(width,height,data,level) {
	if(level == null) {
		level = 9;
	}
	var rgb = new haxe_io_Bytes(new ArrayBuffer(width * height + height));
	var w = 0;
	var r = 0;
	var _g = 0;
	var _g1 = height;
	while(_g < _g1) {
		var y = _g++;
		rgb.b[w++] = 0;
		var _g2 = 0;
		var _g3 = width;
		while(_g2 < _g3) {
			var x = _g2++;
			rgb.b[w++] = data.b[r++];
		}
	}
	var l = new haxe_ds_List();
	l.add(lib_haxepngjs_Chunk.CHeader({ width : width, height : height, colbits : 8, color : lib_haxepngjs_Color.ColGrey(false), interlaced : false}));
	var this1 = new Uint8Array(rgb.length);
	var out = this1;
	var _g = 0;
	var _g1 = rgb.length;
	while(_g < _g1) {
		var i = _g++;
		out[i] = rgb.b[i];
	}
	var rawStream = out;
	var deflateStream1 = new Zlib.RawDeflate(rawStream).compress();
	var out = new haxe_io_Bytes(new ArrayBuffer(deflateStream1.length));
	var _g = 0;
	var _g1 = deflateStream1.length;
	while(_g < _g1) {
		var i = _g++;
		out.b[i] = deflateStream1[i];
	}
	var deflateStream2 = out;
	l.add(lib_haxepngjs_Chunk.CData(deflateStream2));
	l.add(lib_haxepngjs_Chunk.CEnd);
	return l;
};
lib_haxepngjs_Tools.buildIndexed = function(width,height,data,palette,level) {
	if(level == null) {
		level = 9;
	}
	var rgb = new haxe_io_Bytes(new ArrayBuffer(width * height + height));
	var w = 0;
	var r = 0;
	var _g = 0;
	var _g1 = height;
	while(_g < _g1) {
		var y = _g++;
		rgb.b[w++] = 0;
		var _g2 = 0;
		var _g3 = width;
		while(_g2 < _g3) {
			var x = _g2++;
			rgb.b[w++] = data.b[r++];
		}
	}
	var l = new haxe_ds_List();
	l.add(lib_haxepngjs_Chunk.CHeader({ width : width, height : height, colbits : 8, color : lib_haxepngjs_Color.ColIndexed, interlaced : false}));
	l.add(lib_haxepngjs_Chunk.CPalette(palette));
	var this1 = new Uint8Array(rgb.length);
	var out = this1;
	var _g = 0;
	var _g1 = rgb.length;
	while(_g < _g1) {
		var i = _g++;
		out[i] = rgb.b[i];
	}
	var rawStream = out;
	var deflateStream1 = new Zlib.RawDeflate(rawStream).compress();
	var out = new haxe_io_Bytes(new ArrayBuffer(deflateStream1.length));
	var _g = 0;
	var _g1 = deflateStream1.length;
	while(_g < _g1) {
		var i = _g++;
		out.b[i] = deflateStream1[i];
	}
	var deflateStream2 = out;
	l.add(lib_haxepngjs_Chunk.CData(deflateStream2));
	l.add(lib_haxepngjs_Chunk.CEnd);
	return l;
};
lib_haxepngjs_Tools.buildRGB = function(width,height,data,level) {
	if(level == null) {
		level = 9;
	}
	var rgb = new haxe_io_Bytes(new ArrayBuffer(width * height * 3 + height));
	var w = 0;
	var r = 0;
	var _g = 0;
	var _g1 = height;
	while(_g < _g1) {
		var y = _g++;
		rgb.b[w++] = 0;
		var _g2 = 0;
		var _g3 = width;
		while(_g2 < _g3) {
			var x = _g2++;
			rgb.b[w++] = data.b[r + 2];
			rgb.b[w++] = data.b[r + 1];
			rgb.b[w++] = data.b[r];
			r += 3;
		}
	}
	var l = new haxe_ds_List();
	l.add(lib_haxepngjs_Chunk.CHeader({ width : width, height : height, colbits : 8, color : lib_haxepngjs_Color.ColTrue(false), interlaced : false}));
	var this1 = new Uint8Array(rgb.length);
	var out = this1;
	var _g = 0;
	var _g1 = rgb.length;
	while(_g < _g1) {
		var i = _g++;
		out[i] = rgb.b[i];
	}
	var rawStream = out;
	var deflateStream1 = new Zlib.RawDeflate(rawStream).compress();
	var out = new haxe_io_Bytes(new ArrayBuffer(deflateStream1.length));
	var _g = 0;
	var _g1 = deflateStream1.length;
	while(_g < _g1) {
		var i = _g++;
		out.b[i] = deflateStream1[i];
	}
	var deflateStream2 = out;
	l.add(lib_haxepngjs_Chunk.CData(deflateStream2));
	l.add(lib_haxepngjs_Chunk.CEnd);
	return l;
};
lib_haxepngjs_Tools.build32ARGB = function(width,height,data,level) {
	if(level == null) {
		level = 9;
	}
	var rgba = new haxe_io_Bytes(new ArrayBuffer(width * height * 4 + height));
	var w = 0;
	var r = 0;
	var _g = 0;
	var _g1 = height;
	while(_g < _g1) {
		var y = _g++;
		rgba.b[w++] = 0;
		var _g2 = 0;
		var _g3 = width;
		while(_g2 < _g3) {
			var x = _g2++;
			rgba.b[w++] = data.b[r + 1];
			rgba.b[w++] = data.b[r + 2];
			rgba.b[w++] = data.b[r + 3];
			rgba.b[w++] = data.b[r];
			r += 4;
		}
	}
	var l = new haxe_ds_List();
	l.add(lib_haxepngjs_Chunk.CHeader({ width : width, height : height, colbits : 8, color : lib_haxepngjs_Color.ColTrue(true), interlaced : false}));
	var this1 = new Uint8Array(rgba.length);
	var out = this1;
	var _g = 0;
	var _g1 = rgba.length;
	while(_g < _g1) {
		var i = _g++;
		out[i] = rgba.b[i];
	}
	var rawStream = out;
	var deflateStream1 = new Zlib.RawDeflate(rawStream).compress();
	var out = new haxe_io_Bytes(new ArrayBuffer(deflateStream1.length));
	var _g = 0;
	var _g1 = deflateStream1.length;
	while(_g < _g1) {
		var i = _g++;
		out.b[i] = deflateStream1[i];
	}
	var deflateStream2 = out;
	l.add(lib_haxepngjs_Chunk.CData(deflateStream2));
	l.add(lib_haxepngjs_Chunk.CEnd);
	return l;
};
lib_haxepngjs_Tools.build32BGRA = function(width,height,data,level) {
	if(level == null) {
		level = 9;
	}
	var rgba = new haxe_io_Bytes(new ArrayBuffer(width * height * 4 + height));
	var w = 0;
	var r = 0;
	var _g = 0;
	var _g1 = height;
	while(_g < _g1) {
		var y = _g++;
		rgba.b[w++] = 0;
		var _g2 = 0;
		var _g3 = width;
		while(_g2 < _g3) {
			var x = _g2++;
			rgba.b[w++] = data.b[r + 2];
			rgba.b[w++] = data.b[r + 1];
			rgba.b[w++] = data.b[r];
			rgba.b[w++] = data.b[r + 3];
			r += 4;
		}
	}
	var l = new haxe_ds_List();
	l.add(lib_haxepngjs_Chunk.CHeader({ width : width, height : height, colbits : 8, color : lib_haxepngjs_Color.ColTrue(true), interlaced : false}));
	var this1 = new Uint8Array(rgba.length);
	var out = this1;
	var _g = 0;
	var _g1 = rgba.length;
	while(_g < _g1) {
		var i = _g++;
		out[i] = rgba.b[i];
	}
	var rawStream = out;
	var deflateStream1 = new Zlib.RawDeflate(rawStream).compress();
	var out = new haxe_io_Bytes(new ArrayBuffer(deflateStream1.length));
	var _g = 0;
	var _g1 = deflateStream1.length;
	while(_g < _g1) {
		var i = _g++;
		out.b[i] = deflateStream1[i];
	}
	var deflateStream2 = out;
	l.add(lib_haxepngjs_Chunk.CData(deflateStream2));
	l.add(lib_haxepngjs_Chunk.CEnd);
	return l;
};
var lib_haxepngjs_Writer = function(o) {
	this.o = o;
	o.set_bigEndian(true);
};
lib_haxepngjs_Writer.__name__ = true;
lib_haxepngjs_Writer.prototype = {
	write: function(png) {
		var b = 137;
		this.o.writeByte(b);
		var b = 80;
		this.o.writeByte(b);
		var b = 78;
		this.o.writeByte(b);
		var b = 71;
		this.o.writeByte(b);
		var b = 13;
		this.o.writeByte(b);
		var b = 10;
		this.o.writeByte(b);
		var b = 26;
		this.o.writeByte(b);
		var b = 10;
		this.o.writeByte(b);
		var _g_head = png.h;
		while(_g_head != null) {
			var val = _g_head.item;
			_g_head = _g_head.next;
			var c = val;
			switch(c._hx_index) {
			case 0:
				this.writeChunk("IEND",new haxe_io_Bytes(new ArrayBuffer(0)));
				break;
			case 1:
				var h = c.h;
				var b = new haxe_io_BytesOutput();
				b.set_bigEndian(true);
				b.writeInt32(h.width);
				b.writeInt32(h.height);
				b.writeByte(h.colbits);
				var _g = h.color;
				var tmp;
				switch(_g._hx_index) {
				case 0:
					var alpha = _g.alpha;
					tmp = alpha ? 4 : 0;
					break;
				case 1:
					var alpha1 = _g.alpha;
					tmp = alpha1 ? 6 : 2;
					break;
				case 2:
					tmp = 3;
					break;
				}
				b.writeByte(tmp);
				b.writeByte(0);
				b.writeByte(0);
				b.writeByte(h.interlaced ? 1 : 0);
				this.writeChunk("IHDR",b.getBytes());
				break;
			case 2:
				var d = c.b;
				this.writeChunk("IDAT",d);
				break;
			case 3:
				var b1 = c.b;
				this.writeChunk("PLTE",b1);
				break;
			case 4:
				var id = c.id;
				var data = c.data;
				this.writeChunk(id,data);
				break;
			}
		}
	}
	,writeChunk: function(id,data) {
		this.o.writeInt32(data.length);
		this.o.writeString(id);
		this.o.write(data);
		var crc_crc = -1;
		var tmp = (crc_crc ^ HxOverrides.cca(id,0)) & 255;
		tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
		tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
		tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
		tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
		tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
		tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
		tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
		tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
		crc_crc = crc_crc >>> 8 ^ tmp;
		var tmp = (crc_crc ^ HxOverrides.cca(id,1)) & 255;
		tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
		tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
		tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
		tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
		tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
		tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
		tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
		tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
		crc_crc = crc_crc >>> 8 ^ tmp;
		var tmp = (crc_crc ^ HxOverrides.cca(id,2)) & 255;
		tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
		tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
		tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
		tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
		tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
		tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
		tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
		tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
		crc_crc = crc_crc >>> 8 ^ tmp;
		var tmp = (crc_crc ^ HxOverrides.cca(id,3)) & 255;
		tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
		tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
		tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
		tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
		tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
		tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
		tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
		tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
		crc_crc = crc_crc >>> 8 ^ tmp;
		var b = data.b.bufferValue;
		var _g = 0;
		var _g1 = data.length;
		while(_g < _g1) {
			var i = _g++;
			var tmp = (crc_crc ^ b.bytes[i]) & 255;
			tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
			tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
			tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
			tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
			tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
			tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
			tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
			tmp = tmp >>> 1 ^ -(tmp & 1) & -306674912;
			crc_crc = crc_crc >>> 8 ^ tmp;
		}
		this.o.writeInt32(crc_crc ^ -1);
	}
};
var ui_UI = function() { };
ui_UI.__name__ = true;
ui_UI.initMenu = function(ctx,menuEl,name,tags,path) {
	ui_UI.gfx = ctx;
	ui_UI.menu = menuEl;
	ui_UI.name_txt = name;
	ui_UI.tags_txt = tags;
	ui_UI.path_txt = path;
	var _g = 0;
	var _g1 = Main.ROM.manifest.resources.length;
	while(_g < _g1) {
		var i = _g++;
		ui_UI.generateMenuItem(i);
	}
};
ui_UI.generateMenuItem = function(ord) {
	var entryButton = window.document.createElement("div");
	entryButton.setAttribute("class","navEntry");
	entryButton.onclick = function() {var tName = ui_UI.name_txt.value; var tTags = ui_UI.tags_txt.value;var tPath = ui_UI.path_txt.value;Main.updateEntry(Main.ROM.currTex,tName,tTags,tPath);Main.ROM.currTex= ord;window.displayTextureInfo(ord);}
	var entryIcon = new Image();
	entryIcon.width = 32;
	entryIcon.height = 32;
	entryIcon.src = "default_icon.png";
	entryIcon.setAttribute("class","texPreview");
	var entryName = window.document.createElement("h3");
	var tInfo = Main.ROM.manifest.resources[ord];
	entryName.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;" + tInfo.name;
	entryButton.appendChild(entryIcon);
	entryName.setAttribute("class","texName");
	entryName.setAttribute("id","texName_" + ord);
	entryButton.appendChild(entryName);
	ui_UI.menu.appendChild(entryButton);
};
ui_UI.advanceTexture = function() {
	var tName = ui_UI.name_txt.value;
	var tTags = ui_UI.tags_txt.value;
	var tPath = ui_UI.path_txt.value;
	Main.updateEntry(Main.ROM.currTex,tName,tTags,tPath);
	Main.ROM.currTex += 1;
	ui_UI.displayTextureInfo(Main.ROM.currTex);
};
ui_UI.rewindTexture = function() {
	var tName = ui_UI.name_txt.value;
	var tTags = ui_UI.tags_txt.value;
	var tPath = ui_UI.path_txt.value;
	Main.updateEntry(Main.ROM.currTex,tName,tTags,tPath);
	Main.ROM.currTex -= 1;
	ui_UI.displayTextureInfo(Main.ROM.currTex);
};
ui_UI.updateCurrentEntry = function() {
	var tName = ui_UI.name_txt.value;
	var tTags = ui_UI.tags_txt.value;
	var tPath = ui_UI.path_txt.value;
	Main.updateEntry(Main.ROM.currTex,tName,tTags,tPath);
};
ui_UI.displayTextureInfo = function(num) {
	if(num > 3651 || num < 0) {
		num = 0;
	}
	var tInfo = Main.ROM.manifest.resources[num];
	ui_UI.name_txt.value = tInfo.name;
	ui_UI.tags_txt.value = tInfo.tags.join(",");
	ui_UI.path_txt.value = tInfo.path;
	ui_UI.gfx.clearScreen();
	var t0 = Main.ROM.bin.getFile(num);
	var posX = 0;
	var posY = 0;
	var _g = 0;
	var _g1 = t0.length;
	while(_g < _g1) {
		var i = _g++;
		var arr = t0[i];
		var ovr = tInfo.resInfo.formatOVR;
		var arr2 = lib_Rarezip.decompress(arr);
		var tx = framework_codec_Texture.decodeTexture(arr2,0,ovr);
		if(tx.format > -1) {
			ui_UI.gfx.drawTexture(posX,posY,tx,ovr.forceOpacity);
			posY += tx.height + 8;
			if(posY >= 608 - (tx.height + 8)) {
				posY = 0;
				posX += tx.width + 8;
			}
		}
	}
};
ui_UI.exportZip = function() {
	framework_editor_FileExporter.exportZip(Main.ROM,0);
};
ui_UI.exportZipPNG = function() {
	framework_editor_FileExporter.exportZip(Main.ROM,1);
};
if(typeof(performance) != "undefined" ? typeof(performance.now) == "function" : false) {
	HxOverrides.now = performance.now.bind(performance);
}
if( String.fromCodePoint == null ) String.fromCodePoint = function(c) { return c < 0x10000 ? String.fromCharCode(c) : String.fromCharCode((c>>10)+0xD7C0)+String.fromCharCode((c&0x3FF)+0xDC00); }
String.__name__ = true;
Array.__name__ = true;
js_Boot.__toStr = ({ }).toString;
Main.filesTotal = 3;
Main.filesLoaded = 0;
Main.menu = window.document.getElementById("navbar");
Main.name_txt = window.document.getElementById("name-txt");
Main.tags_txt = window.document.getElementById("tags-txt");
Main.path_txt = window.document.getElementById("path-txt");
Main.filein = window.document.getElementById("thefile");
Main.filein2 = window.document.getElementById("thefile2");
Main.filein3 = window.document.getElementById("thefile3");
Util.signExtension = [-1,-2,-4,-8,-16,-32,-64,-128,-256,-512,-1024,-2048,-4096,-8192,-16384,-32768,-65536,-131072,-262144,-524288,-1048576,-2097152,-4194304,-8388608,-16777216,-33554432,-67108864,-134217728,-268435456,-536870912,-1073741824,-2147483648];
framework_codec_Texture.formats = ["RGBA32","RGBA16","I8","I4","IA16","IA8","IA4","CI4","CI8"];
framework_codec_Texture.CLUT4BIT = [0,17,34,51,68,85,102,119,136,153,170,187,204,221,238,255];
Main.main();
})({});
