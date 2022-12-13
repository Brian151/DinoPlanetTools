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
		this.ctx.fillStyle = "#000000";
		this.ctx.fillRect(0,0,this.scrn.width,this.scrn.height);
		var turtle = framework_codec_Texture.convertToImage(texture,forceOpacity);
		this.drawImageData(turtle,x,y,1);
		if(texture.format == 7 || texture.format == 8) {
			this.drawPallete(texture.palette);
		}
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
	Main.ROM = new framework_EditorState();
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
	Main.ROM.currTex = 713;
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
var format_png_Color = $hxEnums["format.png.Color"] = { __ename__:true,__constructs__:null
	,ColGrey: ($_=function(alpha) { return {_hx_index:0,alpha:alpha,__enum__:"format.png.Color",toString:$estr}; },$_._hx_name="ColGrey",$_.__params__ = ["alpha"],$_)
	,ColTrue: ($_=function(alpha) { return {_hx_index:1,alpha:alpha,__enum__:"format.png.Color",toString:$estr}; },$_._hx_name="ColTrue",$_.__params__ = ["alpha"],$_)
	,ColIndexed: {_hx_name:"ColIndexed",_hx_index:2,__enum__:"format.png.Color",toString:$estr}
};
format_png_Color.__constructs__ = [format_png_Color.ColGrey,format_png_Color.ColTrue,format_png_Color.ColIndexed];
var format_png_Chunk = $hxEnums["format.png.Chunk"] = { __ename__:true,__constructs__:null
	,CEnd: {_hx_name:"CEnd",_hx_index:0,__enum__:"format.png.Chunk",toString:$estr}
	,CHeader: ($_=function(h) { return {_hx_index:1,h:h,__enum__:"format.png.Chunk",toString:$estr}; },$_._hx_name="CHeader",$_.__params__ = ["h"],$_)
	,CData: ($_=function(b) { return {_hx_index:2,b:b,__enum__:"format.png.Chunk",toString:$estr}; },$_._hx_name="CData",$_.__params__ = ["b"],$_)
	,CPalette: ($_=function(b) { return {_hx_index:3,b:b,__enum__:"format.png.Chunk",toString:$estr}; },$_._hx_name="CPalette",$_.__params__ = ["b"],$_)
	,CUnknown: ($_=function(id,data) { return {_hx_index:4,id:id,data:data,__enum__:"format.png.Chunk",toString:$estr}; },$_._hx_name="CUnknown",$_.__params__ = ["id","data"],$_)
};
format_png_Chunk.__constructs__ = [format_png_Chunk.CEnd,format_png_Chunk.CHeader,format_png_Chunk.CData,format_png_Chunk.CPalette,format_png_Chunk.CUnknown];
var format_png_Writer = function(o) {
	this.o = o;
	o.set_bigEndian(true);
};
format_png_Writer.__name__ = true;
format_png_Writer.prototype = {
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
var framework_ByteThingyWhatToNameIt = function(src,endian) {
	this.tgt = src;
	this.position = 0;
	this.littleEndian = endian;
};
framework_ByteThingyWhatToNameIt.__name__ = true;
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
};
var framework_EditorState = function() {
	this.currTex = 0;
};
framework_EditorState.__name__ = true;
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
};
var framework_codec_Texture = function() { };
framework_codec_Texture.__name__ = true;
framework_codec_Texture.decodeTexture = function(src,sizeComp,hack) {
	var raw = framework_codec_Texture.decompressTexture(src,sizeComp);
	var header = framework_codec_Texture.readTextureHeader(raw);
	var noSwizzle = false;
	var forceOpacity = false;
	if(hack != null) {
		if(hack.format > -1) {
			header.format = hack.format;
		}
		noSwizzle = hack.noSwizzle;
		forceOpacity = hack.forceOpacity;
	}
	switch(header.format) {
	case 0:
		return framework_codec_Texture.readTextureRGBA32(raw,header,noSwizzle);
	case 1:
		return framework_codec_Texture.readTextureRGBA16(raw,header,noSwizzle);
	case 2:
		return framework_codec_Texture.readTextureIA8(raw,header,noSwizzle);
	case 3:
		return framework_codec_Texture.readTextureIA4P(raw,header,noSwizzle);
	case 4:
		return framework_codec_Texture.readTextureIA16(raw,header,noSwizzle);
	case 5:
		return framework_codec_Texture.readTextureIA8T(raw,header,noSwizzle);
	case 6:
		return framework_codec_Texture.readTextureIA4(raw,header,noSwizzle);
	case 7:
		return framework_codec_Texture.readTextureCI4(raw,header,noSwizzle);
	case 16:
		return framework_codec_Texture.readTextureI8(raw,header,noSwizzle);
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
	throw new Error("texture header write WIP, final files may not function in-game");
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
framework_codec_Texture.readTextureIA4P = function(src,header,noSwizzle) {
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
framework_codec_Texture.readTextureIA16 = function(src,header,noSwizzle) {
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
framework_codec_Texture.readTextureIA8 = function(src,header,noSwizzle) {
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
framework_codec_Texture.readTextureIA8T = function(src,header,noSwizzle) {
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
framework_codec_Texture.readTextureI8 = function(src,header,noSwizzle) {
	var width = header.width;
	var height = header.height;
	var format = 5;
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
			pix = (bits2 & -16777216) >>> 24;
			a = 255;
			bits2 <<= 8;
			r = pix;
			g = pix;
			b = pix;
			bitsLeft -= 8;
		} else {
			pix = (bits1 & -16777216) >>> 24;
			a = 255;
			bits1 <<= 8;
			r = pix;
			g = pix;
			b = pix;
			bitsLeft -= 8;
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
				img.data[base] = texture.palette[basePal];
				img.data[base + 1] = texture.palette[basePal + 1];
				img.data[base + 2] = texture.palette[basePal + 2];
				img.data[base + 3] = 255;
			}
		} else {
			var _g = 0;
			var _g1 = size;
			while(_g < _g1) {
				var i = _g++;
				var base = i * 4;
				var basePal = texture.pixels[i] * 4;
				img.data[base] = texture.palette[basePal];
				img.data[base + 1] = texture.palette[basePal + 1];
				img.data[base + 2] = texture.palette[basePal + 2];
				img.data[base + 3] = texture.palette[basePal + 3];
			}
		}
	} else if(f == 0 || f == 1 || f == 2 || f == 3 || f == 4 || f == 5 || f == 6) {
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
	}
	return img;
};
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
		if(curr.resInfo.frames.length > 0) {
			var _g2 = 0;
			var _g3 = curr.resInfo.frames.length;
			while(_g2 < _g3) {
				var j = _g2++;
				var texInfo = texInfo0.resources[j];
				if(format == 0) {
					var texFile = framework_codec_Texture.decompressTexture(bindat,texInfo.size).readUint8Array(texInfo.size);
					zipfile.file((tName + "frame_" + j + ".dptf"),texFile);
				} else if(format == 1) {
					var texFile1 = framework_codec_Texture.decodeTexture(bindat,texInfo.size,ovr);
					var forceOpacity = ovr.forceOpacity;
					var pngFile = framework_editor_FileExporter.exportPNGForZip(texFile1,forceOpacity);
					zipfile.file((tName + "frame_" + j + ".png"),pngFile);
				} else {
					var texFile2 = framework_codec_Texture.decompressTexture(bindat,texInfo.size).readUint8Array(texInfo.size);
					zipfile.file((tName + "frame_" + j + ".dptf"),texFile2);
				}
			}
		} else {
			var texInfo1 = texInfo0.resources[0];
			bindat.position = texInfo1.ofs;
			if(format == 0) {
				var texFile3 = framework_codec_Texture.decompressTexture(bindat,texInfo1.size).readUint8Array(texInfo1.size);
				zipfile.file(tName,texFile3);
			} else if(format == 1) {
				var texFile4 = framework_codec_Texture.decodeTexture(bindat,texInfo1.size,ovr);
				var forceOpacity1 = ovr.forceOpacity;
				var pngFile1 = framework_editor_FileExporter.exportPNGForZip(texFile4,forceOpacity1);
				var fName = tName.split(".")[0];
				zipfile.file((fName + ".png"),pngFile1);
			} else {
				var texFile5 = framework_codec_Texture.decompressTexture(bindat,texInfo1.size).readUint8Array(texInfo1.size);
				zipfile.file(tName,texFile5);
			}
		}
	}
	zipfile.file("manifest.json",JSON.stringify(src.manifest));
	zipfile.generateAsync({type:"blob",compression:"DEFLATE"}).then(function (blob) {saveAs(blob, exportName + ".zip");});
};
framework_editor_FileExporter.exportPNG = function(t,forceOpacity,fileName) {
	var cnv = window.document.createElement("canvas");
	cnv.width = t.width;
	cnv.height = t.height;
	var ctx = cnv.getContext("2d");
	var img = framework_codec_Texture.convertToImage(t,forceOpacity);
	ctx.putImageData(img,0,0);
	cnv.toBlob(function (blob) {saveAs(blob,"fileName.png");});
};
framework_editor_FileExporter.exportPNGForZip = function(t,forceOpacity) {
	var cnv = window.document.createElement("canvas");
	cnv.width = t.width;
	cnv.height = t.height;
	var ctx = cnv.getContext("2d");
	var img = framework_codec_Texture.convertToImage(t,forceOpacity);
	ctx.putImageData(img,0,0);
	var cut = "data:image/png;base64,";
	var datURL = cnv.toDataURL().substring(cut.length);
	var datByte = haxe_crypto_Base64.decode(datURL);
	return new framework_ByteThingyWhatToNameIt(datByte,false).readUint8Array(datByte.length);
};
var haxe_Exception = function(message,previous,native) {
	Error.call(this,message);
	this.message = message;
	this.__previousException = previous;
	this.__nativeException = native != null ? native : this;
};
haxe_Exception.__name__ = true;
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
	toString: function() {
		return this.get_message();
	}
	,get_message: function() {
		return this.message;
	}
	,get_native: function() {
		return this.__nativeException;
	}
});
var haxe_ValueException = function(value,previous,native) {
	haxe_Exception.call(this,String(value),previous,native);
	this.value = value;
};
haxe_ValueException.__name__ = true;
haxe_ValueException.__super__ = haxe_Exception;
haxe_ValueException.prototype = $extend(haxe_Exception.prototype,{
});
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
};
var haxe_io_Encoding = $hxEnums["haxe.io.Encoding"] = { __ename__:true,__constructs__:null
	,UTF8: {_hx_name:"UTF8",_hx_index:0,__enum__:"haxe.io.Encoding",toString:$estr}
	,RawNative: {_hx_name:"RawNative",_hx_index:1,__enum__:"haxe.io.Encoding",toString:$estr}
};
haxe_io_Encoding.__constructs__ = [haxe_io_Encoding.UTF8,haxe_io_Encoding.RawNative];
var haxe_crypto_Base64 = function() { };
haxe_crypto_Base64.__name__ = true;
haxe_crypto_Base64.decode = function(str,complement) {
	if(complement == null) {
		complement = true;
	}
	if(complement) {
		while(HxOverrides.cca(str,str.length - 1) == 61) str = HxOverrides.substr(str,0,-1);
	}
	return new haxe_crypto_BaseCode(haxe_crypto_Base64.BYTES).decodeBytes(haxe_io_Bytes.ofString(str));
};
var haxe_crypto_BaseCode = function(base) {
	var len = base.length;
	var nbits = 1;
	while(len > 1 << nbits) ++nbits;
	if(nbits > 8 || len != 1 << nbits) {
		throw haxe_Exception.thrown("BaseCode : base length must be a power of two.");
	}
	this.base = base;
	this.nbits = nbits;
};
haxe_crypto_BaseCode.__name__ = true;
haxe_crypto_BaseCode.prototype = {
	initTable: function() {
		var tbl = [];
		var _g = 0;
		while(_g < 256) {
			var i = _g++;
			tbl[i] = -1;
		}
		var _g = 0;
		var _g1 = this.base.length;
		while(_g < _g1) {
			var i = _g++;
			tbl[this.base.b[i]] = i;
		}
		this.tbl = tbl;
	}
	,decodeBytes: function(b) {
		var nbits = this.nbits;
		var base = this.base;
		if(this.tbl == null) {
			this.initTable();
		}
		var tbl = this.tbl;
		var size = b.length * nbits >> 3;
		var out = new haxe_io_Bytes(new ArrayBuffer(size));
		var buf = 0;
		var curbits = 0;
		var pin = 0;
		var pout = 0;
		while(pout < size) {
			while(curbits < 8) {
				curbits += nbits;
				buf <<= nbits;
				var i = tbl[b.b[pin++]];
				if(i == -1) {
					throw haxe_Exception.thrown("BaseCode : invalid encoded char");
				}
				buf |= i;
			}
			curbits -= 8;
			out.b[pout++] = buf >> curbits & 255;
		}
		return out;
	}
};
var haxe_ds_List = function() {
	this.length = 0;
};
haxe_ds_List.__name__ = true;
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
	var t = Main.ROM.bin.getItem(num);
	if(t.resCount > 1) {
		var posX = 0;
		var posY = 0;
		var _g = 0;
		var _g1 = t.resCount;
		while(_g < _g1) {
			var i = _g++;
			var t2 = t.resources[i];
			Main.ROM.bin.data.position = t2.ofs;
			var arr = Main.ROM.bin.data.readByteThingy(t2.size,false);
			var ovr = tInfo.resInfo.formatOVR;
			var tx = framework_codec_Texture.decodeTexture(arr,t2.size,ovr);
			if(tx.format > -1) {
				ui_UI.gfx.drawTexture(posX,posY,tx,ovr.forceOpacity);
				posY += tx.height + 8;
				if(posY >= 608 - (tx.height + 8)) {
					posY = 0;
					posX += tx.width + 8;
				}
			}
		}
	} else {
		Main.ROM.bin.data.position = t.resources[0].ofs;
		var arr = Main.ROM.bin.data.readByteThingy(t.resources[0].size,false);
		var ovr = tInfo.resInfo.formatOVR;
		var tx = framework_codec_Texture.decodeTexture(arr,t.resources[0].size,ovr);
		if(tx.format > -1) {
			ui_UI.gfx.drawTexture(0,0,tx,ovr.forceOpacity);
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
haxe_crypto_Base64.CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
haxe_crypto_Base64.BYTES = haxe_io_Bytes.ofString(haxe_crypto_Base64.CHARS);
Main.main();
})({});
