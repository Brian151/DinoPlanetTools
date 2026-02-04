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
		var turtle = lib_dinoplanet_Texture.convertToImage(texture,forceOpacity);
		this.drawImageData(turtle,x,y,1);
		if(texture.format.pixelFormat == 7 || texture.format.pixelFormat == 8) {
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
				var r = StringTools.hex(arrP[base],2);
				var g = StringTools.hex(arrP[base + 1],2);
				var b = StringTools.hex(arrP[base + 2],2);
				var a = StringTools.hex(arrP[base + 3],2);
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
	,rect: function(posX,posY,width,height,color) {
		this.ctx.fillStyle = color;
		this.ctx.fillRect(posX,posY,width,height);
	}
	,drawText: function(txt,color,posX,posY) {
		this.ctx.font = "16px Georgia";
		this.ctx.fillStyle = color;
		this.ctx.fillText(txt,posX,posY);
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
	Main.ROM = new editor_EditorState();
	Main.ROM.bin = new lib_dinoplanet_TexPack();
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
	var texDat2 = lib_dinoplanet_Rarezip.decompress(texDat);
	var tex = lib_dinoplanet_Texture.decodeTexture(texDat2,0,tOVR);
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
			var arr = haxe_io_Bytes.ofData(fr_tex.result);
			Main.ROM.bin.loadData(arr);
			Main.onFileLoaded();
		};
		fr_tab.onload = function() {
			var arr = haxe_io_Bytes.ofData(fr_tab.result);
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
var Std = function() { };
Std.__name__ = true;
Std.string = function(s) {
	return js_Boot.__string_rec(s,"");
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
var dev_ManifestConverter = function() { };
dev_ManifestConverter.__name__ = true;
dev_ManifestConverter.update2 = function() {
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
dev_ManifestConverter.update3 = function() {
	var mf = Main.ROM.manifest;
	var _g = 0;
	var _g1 = mf.resources.length;
	while(_g < _g1) {
		var i = _g++;
		var res = mf.resources[i].resInfo;
		Reflect.deleteField(res.formatOVR,"forceOpacity");
	}
	Main.exportManifest();
};
dev_ManifestConverter.findNonInterlaced = function(src) {
	var res = src.resources;
	var _g = 0;
	var _g1 = src.resources.length;
	while(_g < _g1) {
		var i = _g++;
		var curr = res[i];
		var ovr = curr.resInfo.formatOVR;
		if(ovr.noSwizzle) {
			$global.console.log(JSON.stringify(curr));
		}
	}
};
var editor_EditorState = function() {
	this.currTex = 0;
};
editor_EditorState.__name__ = true;
var editor_FileExporter = function() { };
editor_FileExporter.__name__ = true;
editor_FileExporter.exportZip = function(src,format) {
	var zipfile = new JSZip();
	var warnlog = "WARNING! TEXTURE EXPORT STILL WIP!\n";
	var binfile = src.bin;
	var exportName = src.manifest.fileName;
	var _g = 0;
	var _g1 = src.manifest.resources.length;
	while(_g < _g1) {
		var i = _g++;
		var curr = src.manifest.resources[i];
		var ovr = curr.resInfo.formatOVR;
		var tName = "TEX_" + i;
		var texInfo0 = binfile.getItem(i);
		var texData = binfile.getFile(i);
		if(curr.resInfo.frames.length > 0) {
			var _g2 = 0;
			var _g3 = curr.resInfo.frames.length;
			while(_g2 < _g3) {
				var j = _g2++;
				var texInfo = texInfo0.resources[j];
				if(format == 0) {
					var texFile = lib_dinoplanet_Rarezip.decompress(texData[j]);
					var tmp = tName + "_frame_" + j + ".dptf";
					var this1 = new Uint8Array(texFile.length);
					var out = this1;
					var _g4 = 0;
					var _g5 = texFile.length;
					while(_g4 < _g5) {
						var i1 = _g4++;
						out[i1] = texFile.b[i1];
					}
					zipfile.file(tmp,out);
				} else if(format == 1) {
					var texFile1 = lib_dinoplanet_Texture.decodeTexture(texData[j],texData[j].length,ovr);
					var forceOpacity = texFile1.format.opaque;
					if(forceOpacity) {
						warnlog += tName + "_frame_" + j + " has the opaque flag set. \n";
						warnlog += "it may appear blank in image editors if transparency is enabled.\n";
					}
					if(texFile1.format.pixelFormat == 1 && texFile1.height == 44) {
						warnlog += tName + "_frame_" + j + " contains extra data that cannot yet be decoded.\n";
						warnlog += "please export as raw to ensure losslessness.\n";
					}
					forceOpacity = false;
					var pngFile = editor_FileExporter.exportPNG(texFile1,forceOpacity);
					zipfile.file((tName + "_frame_" + j + ".png"),pngFile);
				} else {
					var texFile2 = lib_dinoplanet_Rarezip.decompress(texData[j]);
					var tmp1 = tName + "_frame_" + j + ".dptf";
					var this2 = new Uint8Array(texFile2.length);
					var out1 = this2;
					var _g6 = 0;
					var _g7 = texFile2.length;
					while(_g6 < _g7) {
						var i2 = _g6++;
						out1[i2] = texFile2.b[i2];
					}
					zipfile.file(tmp1,out1);
				}
			}
		} else {
			var texInfo1 = texInfo0.resources[0];
			if(format == 0) {
				var texFile3 = lib_dinoplanet_Rarezip.decompress(texData[0]);
				var this3 = new Uint8Array(texFile3.length);
				var out2 = this3;
				var _g8 = 0;
				var _g9 = texFile3.length;
				while(_g8 < _g9) {
					var i3 = _g8++;
					out2[i3] = texFile3.b[i3];
				}
				zipfile.file(tName,out2);
			} else if(format == 1) {
				var texFile4 = lib_dinoplanet_Texture.decodeTexture(texData[0],texData[0].length,ovr);
				var forceOpacity1 = texFile4.format.opaque;
				if(forceOpacity1) {
					warnlog += tName + " has the opaque flag set. \n";
					warnlog += "it may appear blank in image editors if transparency is enabled.\n";
				}
				if(texFile4.format.pixelFormat == 1 && texFile4.height == 44) {
					warnlog += tName + " contains extra data that cannot yet be decoded.\n";
					warnlog += "please export as raw to ensure losslessness.\n";
				}
				forceOpacity1 = false;
				var pngFile1 = editor_FileExporter.exportPNG(texFile4,forceOpacity1);
				var fName = tName.split(".")[0];
				zipfile.file((fName + ".png"),pngFile1);
			} else {
				var texFile5 = lib_dinoplanet_Rarezip.decompress(texData[0]);
				var this4 = new Uint8Array(texFile5.length);
				var out3 = this4;
				var _g10 = 0;
				var _g11 = texFile5.length;
				while(_g10 < _g11) {
					var i4 = _g10++;
					out3[i4] = texFile5.b[i4];
				}
				zipfile.file(tName,out3);
			}
		}
	}
	zipfile.file("WARNINGS.txt",warnlog);
	zipfile.generateAsync({type:"blob",compression:"DEFLATE"}).then(function (blob) {saveAs(blob, exportName + ".zip");});
};
editor_FileExporter.exportPNG = function(t,forceOpacity,fileName) {
	var pngBin = lib_PngTool.textureToPNG(t);
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
var editor_ManifestDB = function() { };
editor_ManifestDB.__name__ = true;
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
	,readUInt16: function() {
		var ch1 = this.readByte();
		var ch2 = this.readByte();
		if(this.bigEndian) {
			return ch2 | ch1 << 8;
		} else {
			return ch1 | ch2 << 8;
		}
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
	get: function(pos) {
		return this.b[pos];
	}
	,blit: function(pos,src,srcpos,len) {
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
	,getUInt16: function(pos) {
		if(this.data == null) {
			this.data = new DataView(this.b.buffer,this.b.byteOffset,this.b.byteLength);
		}
		return this.data.getUint16(pos,true);
	}
	,setUInt16: function(pos,v) {
		if(this.data == null) {
			this.data = new DataView(this.b.buffer,this.b.byteOffset,this.b.byteLength);
		}
		this.data.setUint16(pos,v,true);
	}
	,getInt32: function(pos) {
		if(this.data == null) {
			this.data = new DataView(this.b.buffer,this.b.byteOffset,this.b.byteLength);
		}
		return this.data.getInt32(pos,true);
	}
	,setInt32: function(pos,v) {
		if(this.data == null) {
			this.data = new DataView(this.b.buffer,this.b.byteOffset,this.b.byteLength);
		}
		this.data.setInt32(pos,v,true);
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
	set_position: function(p) {
		if(p < 0) {
			p = 0;
		} else if(p > this.totlen) {
			p = this.totlen;
		}
		this.len = this.totlen - p;
		return this.pos = p;
	}
	,readByte: function() {
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
	,__properties__: $extend(haxe_io_Input.prototype.__properties__,{set_position:"set_position"})
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
var lib_ByteThingyWhatToNameIt = function(src,endian) {
	this.tgt = src;
	this.position = 0;
	this.littleEndian = endian;
};
lib_ByteThingyWhatToNameIt.__name__ = true;
lib_ByteThingyWhatToNameIt.prototype = {
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
	,readInt8: function() {
		var n = this.readUint8();
		var flag = (n & 128) >> 7 == 1;
		if(flag) {
			n |= util_Util.signExtension[24];
		}
	}
	,readInt16: function(endian) {
		var n = this.readUint16(endian);
		var flag = (n & 32768) >> 15 == 1;
		if(flag) {
			n |= util_Util.signExtension[16];
		}
		return n;
	}
	,readInt32: function(endian) {
		var n = this.readUint32(endian);
		var flag = (n & -2147483648) >> 31 == 1;
		if(flag) {
			n |= util_Util.signExtension[0];
		}
		return n;
	}
	,readInt24: function(endian) {
		var n = this.readUint24(endian);
		var flag = (n & 8388608) >> 23 == 1;
		if(flag) {
			n |= util_Util.signExtension[8];
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
		return new lib_ByteThingyWhatToNameIt(outBytes,endian);
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
		if(endian || this.littleEndian) {
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
		if(endian || this.littleEndian) {
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
		if(endian || this.littleEndian) {
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
	,__properties__: {get_length:"get_length"}
};
var lib_Deflate = function() { };
lib_Deflate.__name__ = true;
lib_Deflate.run = function(b,level) {
	if(level == null) {
		level = 9;
	}
	var length = b.length;
	var this1 = new Uint8Array(length);
	var out = this1;
	var _g = 0;
	var _g1 = length;
	while(_g < _g1) {
		var i = _g++;
		out[i] = b.b[i];
	}
	var raw = out;
	var src = pako.deflateRaw(raw);
	var out = new haxe_io_Bytes(new ArrayBuffer(src.length));
	var _g = 0;
	var _g1 = src.length;
	while(_g < _g1) {
		var i = _g++;
		out.b[i] = src[i];
	}
	var out1 = out;
	return out1;
};
var lib_Inflate = function() { };
lib_Inflate.__name__ = true;
lib_Inflate.run = function(bytes) {
	console.log("hello from js decompressor!");
	var length = bytes.length;
	var this1 = new Uint8Array(length);
	var out = this1;
	var _g = 0;
	var _g1 = length;
	while(_g < _g1) {
		var i = _g++;
		out[i] = bytes.b[i];
	}
	var compressed = out;
	var src = pako.inflateRaw(compressed);
	var out = new haxe_io_Bytes(new ArrayBuffer(src.length));
	var _g = 0;
	var _g1 = src.length;
	while(_g < _g1) {
		var i = _g++;
		out.b[i] = src[i];
	}
	return out;
};
var lib_PngTool = function() { };
lib_PngTool.__name__ = true;
lib_PngTool.BGRA = function(dat) {
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
lib_PngTool.textureToPNG = function(src) {
	switch(src.format.pixelFormat) {
	case 0:
		var img = lib_dinoplanet_Texture.convertToImage(src,false);
		var src1 = img.data;
		var out = new haxe_io_Bytes(new ArrayBuffer(src1.length));
		var _g = 0;
		var _g1 = src1.length;
		while(_g < _g1) {
			var i = _g++;
			out.b[i] = src1[i];
		}
		var dat = out;
		lib_PngTool.BGRA(dat);
		var png = lib_image_png_Tools.build32BGRA(src.width,src.height,dat);
		var pngB = new haxe_io_BytesOutput();
		new lib_image_png_Writer(pngB).write(png);
		return pngB.getBytes();
	case 1:
		var img = lib_dinoplanet_Texture.convertToImage(src,false);
		var src1 = img.data;
		var out = new haxe_io_Bytes(new ArrayBuffer(src1.length));
		var _g = 0;
		var _g1 = src1.length;
		while(_g < _g1) {
			var i = _g++;
			out.b[i] = src1[i];
		}
		var dat = out;
		lib_PngTool.BGRA(dat);
		var png = lib_image_png_Tools.build32BGRA(src.width,src.height,dat);
		var pngB = new haxe_io_BytesOutput();
		new lib_image_png_Writer(pngB).write(png);
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
		var png = lib_image_png_Tools.buildGrey(src.width,src.height,dat);
		var pngB = new haxe_io_BytesOutput();
		new lib_image_png_Writer(pngB).write(png);
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
		var png = lib_image_png_Tools.buildGrey(src.width,src.height,dat);
		var pngB = new haxe_io_BytesOutput();
		new lib_image_png_Writer(pngB).write(png);
		return pngB.getBytes();
	case 4:
		var img = lib_dinoplanet_Texture.convertToImage(src,false);
		var src1 = img.data;
		var out = new haxe_io_Bytes(new ArrayBuffer(src1.length));
		var _g = 0;
		var _g1 = src1.length;
		while(_g < _g1) {
			var i = _g++;
			out.b[i] = src1[i];
		}
		var dat = out;
		lib_PngTool.BGRA(dat);
		var png = lib_image_png_Tools.build32BGRA(src.width,src.height,dat);
		var pngB = new haxe_io_BytesOutput();
		new lib_image_png_Writer(pngB).write(png);
		return pngB.getBytes();
	case 5:
		var img = lib_dinoplanet_Texture.convertToImage(src,false);
		var src1 = img.data;
		var out = new haxe_io_Bytes(new ArrayBuffer(src1.length));
		var _g = 0;
		var _g1 = src1.length;
		while(_g < _g1) {
			var i = _g++;
			out.b[i] = src1[i];
		}
		var dat = out;
		lib_PngTool.BGRA(dat);
		var png = lib_image_png_Tools.build32BGRA(src.width,src.height,dat);
		var pngB = new haxe_io_BytesOutput();
		new lib_image_png_Writer(pngB).write(png);
		return pngB.getBytes();
	case 6:
		var img = lib_dinoplanet_Texture.convertToImage(src,false);
		var src1 = img.data;
		var out = new haxe_io_Bytes(new ArrayBuffer(src1.length));
		var _g = 0;
		var _g1 = src1.length;
		while(_g < _g1) {
			var i = _g++;
			out.b[i] = src1[i];
		}
		var dat = out;
		lib_PngTool.BGRA(dat);
		var png = lib_image_png_Tools.build32BGRA(src.width,src.height,dat);
		var pngB = new haxe_io_BytesOutput();
		new lib_image_png_Writer(pngB).write(png);
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
		var png = lib_image_png_Tools.buildIndexedWithTransparency(src.width,src.height,dat,datPal);
		var pngB = new haxe_io_BytesOutput();
		new lib_image_png_Writer(pngB).write(png);
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
		var png = lib_image_png_Tools.buildIndexedWithTransparency(src.width,src.height,dat,datPal);
		var pngB = new haxe_io_BytesOutput();
		new lib_image_png_Writer(pngB).write(png);
		return pngB.getBytes();
	}
	return new haxe_io_Bytes(new ArrayBuffer(256));
};
lib_PngTool.PNGToTexture = function(src) {
	return null;
};
var lib_dinoplanet_Model = function() { };
lib_dinoplanet_Model.__name__ = true;
lib_dinoplanet_Model.readModel = function(dat) {
	var out = { datBytes : dat, header : lib_dinoplanet_Model.readModelHeader(dat), textures : []};
	lib_dinoplanet_Model.readModelTextureList(out);
	return out;
};
lib_dinoplanet_Model.readModelHeader = function(dat) {
	var stream = new haxe_io_BytesInput(dat,0);
	stream.set_bigEndian(true);
	var out = { PTR_texture : stream.readInt32(), PTR_vert : stream.readInt32(), PTR_face : stream.readInt32(), PTR_F3DtriOps : stream.readInt32(), UNK_0x10 : stream.readInt32(), PTR_vertGroupOffset : stream.readInt32(), PTR_vertGroup : stream.readInt32(), PTR_blendShape : stream.readInt32(), PTR_joint : stream.readInt32(), UNK_0x24 : stream.readInt32(), PTR_hitbox : stream.readInt32(), PTR_edgeVector : stream.readInt32(), UNK_0x30 : stream.readInt32(), PTR_collisionBox : stream.readInt32(), PTR_F3DDrawMode : stream.readInt32(), PTR_eyeAnim : stream.readInt32(), UNK_0x40 : stream.readInt32(), UNK_0x44 : stream.readInt32(), UNK_0x48 : stream.readInt32(), UNK_0x4c : stream.readInt32(), PTR_unk0x50 : stream.readInt32(), PTR_unk0x54 : stream.readInt32(), byteLength : stream.readInt32(), UNK_0x5c : stream.readInt32(), UNK_0x60 : stream.readUInt16(), vertCount : stream.readUInt16(), faceCount : stream.readUInt16(), UNK_0x66 : stream.readUInt16(), UNK_0x68 : stream.readInt32(), F3DOpCount : stream.readUInt16(), hitboxCount : stream.readByte(), jointCount : stream.readByte(), UNK_0x70 : stream.readUInt16(), textureCount : stream.readUInt16(), countFaceRangeWithEnvMap : stream.readByte(), countEFPairsInDrawMode : stream.readByte(), countTextureAnimations : stream.readByte(), UNK_0x77 : stream.readByte(), UNK_0x78 : stream.readInt32(), UNK_0x7c : stream.readInt32()};
	$global.console.log(stream.pos);
	return out;
};
lib_dinoplanet_Model.readModelTextureList = function(model) {
	var stream = new haxe_io_BytesInput(model.datBytes,model.header.PTR_texture);
	stream.set_bigEndian(true);
	var _g = 0;
	var _g1 = model.header.textureCount;
	while(_g < _g1) {
		var i = _g++;
		model.textures.push({ UNK_0x00 : stream.readUInt16(), textureID : stream.readUInt16(), x : stream.readByte(), y : stream.readByte(), UNK_06 : stream.readByte(), UNK_07 : stream.readByte()});
	}
};
lib_dinoplanet_Model.decompressModel = function(comp) {
	var stream = new haxe_io_BytesInput(comp,0);
	stream.set_bigEndian(true);
	var animEntries = stream.readUInt16();
	stream.set_position(stream.pos + 6);
	stream.set_bigEndian(false);
	var decompSize = stream.readInt32();
	var level = stream.readByte();
	var compSize = stream.totlen - 13;
	var this1 = new Uint8Array(compSize);
	var compressed = this1;
	var _g = 0;
	var _g1 = compSize;
	while(_g < _g1) {
		var i = _g++;
		compressed[i] = stream.readByte();
	}
	var decompressed = pako.inflateRaw(compressed);
	var out = new haxe_io_Bytes(new ArrayBuffer(decompSize));
	var _g = 0;
	var _g1 = decompSize;
	while(_g < _g1) {
		var i = _g++;
		out.b[i] = decompressed[i];
	}
	return out;
};
var lib_dinoplanet_Rarezip = function() { };
lib_dinoplanet_Rarezip.__name__ = true;
lib_dinoplanet_Rarezip.decompress = function(src) {
	var size = src.getInt32(0);
	var level = src.b[4];
	var compressedSize = src.length - 5;
	var this1 = new Uint8Array(compressedSize);
	var out = this1;
	var _g = 0;
	var _g1 = compressedSize;
	while(_g < _g1) {
		var i = _g++;
		out[i] = src.b[5 + i];
	}
	var compressed = out;
	var decompressed = pako.inflateRaw(compressed);
	if(decompressed.length != size) {
		$global.console.log(size,StringTools.hex(size,2));
		$global.console.log(decompressed.length,StringTools.hex(decompressed.length,2));
		throw haxe_Exception.thrown("decompressed size does not match");
	}
	var out = new haxe_io_Bytes(new ArrayBuffer(decompressed.length));
	var _g = 0;
	var _g1 = decompressed.length;
	while(_g < _g1) {
		var i = _g++;
		out.b[i] = decompressed[i];
	}
	var out1 = out;
	return out1;
};
var lib_dinoplanet_TexPack = function() {
};
lib_dinoplanet_TexPack.__name__ = true;
lib_dinoplanet_TexPack.prototype = {
	loadData: function(bin) {
		this.data = bin;
	}
	,loadOffsets: function(tab) {
		this.offsetTable = tab;
	}
	,getItem: function(ord) {
		var tabBytes = this.offsetTable;
		var posBase = ord * 4;
		var input = tabBytes.getInt32(posBase);
		var mask = 255;
		var out = (input & mask) << 24;
		input >>= 8;
		out |= (input & mask) << 16;
		input >>= 8;
		out |= (input & mask) << 8;
		input >>= 8;
		var ofs = out |= input & mask;
		var input = tabBytes.getInt32(posBase + 4);
		var mask = 255;
		var out = (input & mask) << 24;
		input >>= 8;
		out |= (input & mask) << 16;
		input >>= 8;
		out |= (input & mask) << 8;
		input >>= 8;
		var endOfs = out |= input & mask;
		var size = (endOfs & 16777215) - (ofs & 16777215);
		var numSubTextures = (ofs & -16777216) >> 24;
		var realOfs = ofs & 16777215;
		var outBuf = new haxe_io_Bytes(new ArrayBuffer(size));
		outBuf.blit(0,this.data,realOfs,size);
		var out = { resCount : numSubTextures, resources : [{ ofs : realOfs, size : size}], data : outBuf};
		if(numSubTextures > 1) {
			out.resources.pop();
			var tabSize = (numSubTextures + 1) * 2;
			var this1 = new Uint32Array(tabSize);
			var table = this1;
			var _g = 0;
			var _g1 = tabSize;
			while(_g < _g1) {
				var i = _g++;
				var baseOf = realOfs + 4 * i;
				var input = this.data.getInt32(baseOf);
				var mask = 255;
				var out1 = (input & mask) << 24;
				input >>= 8;
				out1 |= (input & mask) << 16;
				input >>= 8;
				out1 |= (input & mask) << 8;
				input >>= 8;
				table[i] = out1 |= input & mask;
			}
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
			var byteout = new haxe_io_Bytes(new ArrayBuffer(curr.size));
			byteout.blit(0,this.data,curr.ofs,curr.size);
			out.push(byteout);
		}
		return out;
	}
};
var lib_dinoplanet_Texture = function() { };
lib_dinoplanet_Texture.__name__ = true;
lib_dinoplanet_Texture.decodeTexture = function(src,sizeComp,hack) {
	var raw;
	if(sizeComp > 0) {
		raw = lib_dinoplanet_Rarezip.decompress(src);
	} else {
		raw = src;
	}
	var header = lib_dinoplanet_Texture.readTextureHeader(raw);
	var noSwizzle = false;
	if(hack != null) {
		noSwizzle = hack.noSwizzle;
	}
	switch(header.format.pixelFormat) {
	case 0:
		return lib_dinoplanet_Texture.readTextureRGBA32(raw,header,noSwizzle);
	case 1:
		return lib_dinoplanet_Texture.readTextureRGBA16(raw,header,noSwizzle);
	case 2:
		return lib_dinoplanet_Texture.readTextureI8(raw,header,noSwizzle);
	case 3:
		return lib_dinoplanet_Texture.readTextureI4(raw,header,noSwizzle);
	case 4:
		return lib_dinoplanet_Texture.readTextureIA16(raw,header,noSwizzle);
	case 5:
		return lib_dinoplanet_Texture.readTextureIA8(raw,header,noSwizzle);
	case 6:
		return lib_dinoplanet_Texture.readTextureIA4(raw,header,noSwizzle);
	case 7:
		return lib_dinoplanet_Texture.readTextureCI4(raw,header,noSwizzle);
	case 8:
		return lib_dinoplanet_Texture.readTextureCI8(raw,header,noSwizzle);
	default:
		throw haxe_Exception.thrown("unknown texture format! (" + Std.string(header.format) + ")");
	}
};
lib_dinoplanet_Texture.getFormatNames = function() {
	return lib_dinoplanet_Texture.formats;
};
lib_dinoplanet_Texture.encodeTexture = function(tex,head) {
	throw haxe_Exception.thrown("not implemented");
};
lib_dinoplanet_Texture.readTextureHeader = function(src) {
	var src1 = src.b[0];
	var src2 = src.b[1];
	var out = lib_dinoplanet_Texture.readFormatByte(src.b[2]);
	var src3 = src.b[3];
	var src4 = src.b[4];
	var src5 = src.b[5];
	var input = src.getUInt16(6);
	var mask = 255;
	var out1 = (input & mask) << 8;
	input >>= 8;
	var out2 = lib_dinoplanet_Texture.readFlags(out1 |= input & mask);
	var input = src.getInt32(8);
	var mask = 255;
	var out1 = (input & mask) << 24;
	input >>= 8;
	out1 |= (input & mask) << 16;
	input >>= 8;
	out1 |= (input & mask) << 8;
	input >>= 8;
	var input1 = src.getUInt16(12);
	var mask1 = 255;
	var out3 = (input1 & mask1) << 8;
	input1 >>= 8;
	var input2 = src.getUInt16(14);
	var mask2 = 255;
	var out4 = (input2 & mask2) << 8;
	input2 >>= 8;
	var input3 = src.getUInt16(16);
	var mask3 = 255;
	var out5 = (input3 & mask3) << 8;
	input3 >>= 8;
	var input4 = src.getUInt16(18);
	var mask4 = 255;
	var out6 = (input4 & mask4) << 8;
	input4 >>= 8;
	var input5 = src.getInt32(20);
	var mask5 = 255;
	var out7 = (input5 & mask5) << 24;
	input5 >>= 8;
	out7 |= (input5 & mask5) << 16;
	input5 >>= 8;
	out7 |= (input5 & mask5) << 8;
	input5 >>= 8;
	var input6 = src.getUInt16(24);
	var mask6 = 255;
	var out8 = (input6 & mask6) << 8;
	input6 >>= 8;
	var out9 = { width : src1, height : src2, format : out, sprX : src3, sprY : src4, unk_0x5 : src5, flags : out2, PTR_gdl : out1 |= input & mask, levels : out3 |= input1 & mask1, unk_0xe : out4 |= input2 & mask2, unk_0x10 : out5 |= input3 & mask3, gdlIdx : out6 |= input4 & mask4, PTR_next : out7 |= input5 & mask5, unk_0x18 : out8 |= input6 & mask6, unk_0x1a : src.b[26], hwMSB : src.b[27], cms : src.b[28], masks : src.b[29], cmt : src.b[30], maskt : src.b[31]};
	out9.width += (out9.hwMSB & 240) << 4;
	out9.height += (out9.hwMSB & 15) << 8;
	return out9;
};
lib_dinoplanet_Texture.writeTextureHeader = function(src) {
	var buf = new haxe_io_Bytes(new ArrayBuffer(32));
	var wMSB = src.width & 3840;
	var hMSB = src.height & 3840;
	buf.b[0] = src.width & 255;
	buf.b[1] = src.height & 255;
	wMSB <<= 4;
	var formatByte = lib_dinoplanet_Texture.writeFormatByte(src.format);
	buf.b[2] = formatByte;
	buf.b[3] = src.sprX;
	buf.b[4] = src.sprY;
	buf.b[5] = 1;
	var input = lib_dinoplanet_Texture.writeFlags(src.flags);
	var mask = 255;
	var out = (input & mask) << 8;
	input >>= 8;
	buf.setUInt16(6,out |= input & mask);
	buf.setInt32(8,0);
	var input = src.levels;
	var mask = 255;
	var out = (input & mask) << 8;
	input >>= 8;
	buf.setUInt16(12,out |= input & mask);
	var input = src.unk_0xe;
	var mask = 255;
	var out = (input & mask) << 8;
	input >>= 8;
	buf.setUInt16(14,out |= input & mask);
	var input = src.unk_0x10;
	var mask = 255;
	var out = (input & mask) << 8;
	input >>= 8;
	buf.setUInt16(16,out |= input & mask);
	var input = src.gdlIdx;
	var mask = 255;
	var out = (input & mask) << 8;
	input >>= 8;
	buf.setUInt16(18,out |= input & mask);
	buf.setInt32(20,0);
	var input = src.unk_0x18;
	var mask = 255;
	var out = (input & mask) << 8;
	input >>= 8;
	buf.setUInt16(24,out |= input & mask);
	buf.b[26] = src.unk_0x1a;
	buf.b[27] = wMSB | hMSB;
	buf.b[28] = src.cms;
	buf.b[29] = src.masks;
	buf.b[30] = src.cmt;
	buf.b[31] = src.maskt;
	throw haxe_Exception.thrown("texture header write WIP, final files may not function in-game");
};
lib_dinoplanet_Texture.readFlags = function(src) {
	return { ovrNoInterlace : (src & 1) > 0, stateSwitcher : (src & 64) > 0, transparent : (src & 128) > 0, transparent2 : (src & 129) > 0, transparentAnimated : (src & 192) > 0, mipMapped : (src & 256) > 0, compositeBase : (src & 16384) > 0, compositeOverlay : (src & 32768) > 0};
};
lib_dinoplanet_Texture.writeFlags = function(src) {
	var out = 0;
	if(src.ovrNoInterlace) {
		out |= 1;
	}
	if(src.stateSwitcher) {
		out |= 64;
	}
	if(src.transparent) {
		out |= 128;
	}
	if(src.transparent2) {
		out |= 129;
	}
	if(src.transparentAnimated) {
		out |= 192;
	}
	if(src.mipMapped) {
		out |= 256;
	}
	if(src.compositeBase) {
		out |= 16384;
	}
	if(src.compositeOverlay) {
		out |= 32768;
	}
	return out;
};
lib_dinoplanet_Texture.readFormatByte = function(src) {
	return { pixelFormat : src & 15, gray : (src & 32) > 0, opaque : (src & 16) > 0};
};
lib_dinoplanet_Texture.writeFormatByte = function(src) {
	var out = 0;
	out |= src.pixelFormat;
	if(src.gray) {
		out |= 32;
	}
	if(src.opaque) {
		out |= 16;
	}
	return out;
};
lib_dinoplanet_Texture.interlace64 = function(bits1,bits2,row) {
	var out = [];
	if(row % 2 == 1) {
		out.push(bits2);
		out.push(bits1);
	} else {
		out.push(bits1);
		out.push(bits2);
	}
	return out;
};
lib_dinoplanet_Texture.interlace128 = function(bits1,bits2,bits3,bits4,row) {
	var out = [];
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
lib_dinoplanet_Texture.RGBA16 = function(c) {
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
lib_dinoplanet_Texture.readPalette = function(src,numColors,pos) {
	var this1 = new Uint8Array(numColors * 4);
	var palette = this1;
	var _g = 0;
	var _g1 = numColors;
	while(_g < _g1) {
		var i = _g++;
		var input = src.getUInt16(pos);
		var mask = 255;
		var out = (input & mask) << 8;
		input >>= 8;
		var c0 = out |= input & mask;
		var c = lib_dinoplanet_Texture.RGBA16(c0);
		var base = i * 4;
		palette[base] = c[0];
		palette[base + 1] = c[1];
		palette[base + 2] = c[2];
		palette[base + 3] = c[3];
		pos += 2;
	}
	return palette;
};
lib_dinoplanet_Texture.writePalette = function() {
};
lib_dinoplanet_Texture.readTextureRGBA32 = function(src,header,noSwizzle) {
	var width = header.width;
	var height = header.height;
	var format = header.format;
	var imageSize = width * height;
	var this1 = new Uint8Array(imageSize * 4);
	var pixels = this1;
	var position = 32;
	var bitsLeft = 128;
	var currentRow = 0;
	var input = src.getInt32(position);
	var mask = 255;
	var out = (input & mask) << 24;
	input >>= 8;
	out |= (input & mask) << 16;
	input >>= 8;
	out |= (input & mask) << 8;
	input >>= 8;
	var bits1 = out |= input & mask;
	position += 4;
	var input = src.getInt32(position);
	var mask = 255;
	var out = (input & mask) << 24;
	input >>= 8;
	out |= (input & mask) << 16;
	input >>= 8;
	out |= (input & mask) << 8;
	input >>= 8;
	var bits2 = out |= input & mask;
	position += 4;
	var input = src.getInt32(position);
	var mask = 255;
	var out = (input & mask) << 24;
	input >>= 8;
	out |= (input & mask) << 16;
	input >>= 8;
	out |= (input & mask) << 8;
	input >>= 8;
	var bits3 = out |= input & mask;
	position += 4;
	var input = src.getInt32(position);
	var mask = 255;
	var out = (input & mask) << 24;
	input >>= 8;
	out |= (input & mask) << 16;
	input >>= 8;
	out |= (input & mask) << 8;
	input >>= 8;
	var bits4 = out |= input & mask;
	position += 4;
	var bitSrc = lib_dinoplanet_Texture.interlace128(bits1,bits2,bits3,bits4,currentRow);
	bits1 = bitSrc[0];
	bits2 = bitSrc[1];
	bits3 = bitSrc[2];
	bits4 = bitSrc[3];
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
			var input = src.getInt32(position);
			var mask = 255;
			var out = (input & mask) << 24;
			input >>= 8;
			out |= (input & mask) << 16;
			input >>= 8;
			out |= (input & mask) << 8;
			input >>= 8;
			out |= input & mask;
			bits1 = out;
			position += 4;
			var input1 = src.getInt32(position);
			var mask1 = 255;
			var out1 = (input1 & mask1) << 24;
			input1 >>= 8;
			out1 |= (input1 & mask1) << 16;
			input1 >>= 8;
			out1 |= (input1 & mask1) << 8;
			input1 >>= 8;
			out1 |= input1 & mask1;
			bits2 = out1;
			position += 4;
			var input2 = src.getInt32(position);
			var mask2 = 255;
			var out2 = (input2 & mask2) << 24;
			input2 >>= 8;
			out2 |= (input2 & mask2) << 16;
			input2 >>= 8;
			out2 |= (input2 & mask2) << 8;
			input2 >>= 8;
			out2 |= input2 & mask2;
			bits3 = out2;
			position += 4;
			var input3 = src.getInt32(position);
			var mask3 = 255;
			var out3 = (input3 & mask3) << 24;
			input3 >>= 8;
			out3 |= (input3 & mask3) << 16;
			input3 >>= 8;
			out3 |= (input3 & mask3) << 8;
			input3 >>= 8;
			out3 |= input3 & mask3;
			bits4 = out3;
			position += 4;
			bitSrc = lib_dinoplanet_Texture.interlace128(bits1,bits2,bits3,bits4,currentRow);
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
	return { format : format, flags : header.flags, palette : this1, width : width, height : height, pixels : pixels};
};
lib_dinoplanet_Texture.readTextureRGBA16 = function(src,header,noSwizzle) {
	var width = header.width;
	var height = header.height;
	if(height == 44) {
		height = width;
	}
	var format = header.format;
	var imageSize = width * height;
	var this1 = new Uint8Array(imageSize * 4);
	var pixels = this1;
	var position = 32;
	var bitsLeft = 64;
	var currentRow = 0;
	var input = src.getInt32(position);
	var mask = 255;
	var out = (input & mask) << 24;
	input >>= 8;
	out |= (input & mask) << 16;
	input >>= 8;
	out |= (input & mask) << 8;
	input >>= 8;
	var bits1 = out |= input & mask;
	position += 4;
	var input = src.getInt32(position);
	var mask = 255;
	var out = (input & mask) << 24;
	input >>= 8;
	out |= (input & mask) << 16;
	input >>= 8;
	out |= (input & mask) << 8;
	input >>= 8;
	var bits2 = out |= input & mask;
	position += 4;
	var out = [];
	if(currentRow % 2 == 1) {
		out.push(bits2);
		out.push(bits1);
	} else {
		out.push(bits1);
		out.push(bits2);
	}
	var bitSrc = out;
	bits1 = bitSrc[0];
	bits2 = bitSrc[1];
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
			var input = src.getInt32(position);
			var mask = 255;
			var out = (input & mask) << 24;
			input >>= 8;
			out |= (input & mask) << 16;
			input >>= 8;
			out |= (input & mask) << 8;
			input >>= 8;
			out |= input & mask;
			bits1 = out;
			position += 4;
			var input1 = src.getInt32(position);
			var mask1 = 255;
			var out1 = (input1 & mask1) << 24;
			input1 >>= 8;
			out1 |= (input1 & mask1) << 16;
			input1 >>= 8;
			out1 |= (input1 & mask1) << 8;
			input1 >>= 8;
			out1 |= input1 & mask1;
			bits2 = out1;
			position += 4;
			var out2 = [];
			if(currentRow % 2 == 1) {
				out2.push(bits2);
				out2.push(bits1);
			} else {
				out2.push(bits1);
				out2.push(bits2);
			}
			bitSrc = out2;
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
		var c = lib_dinoplanet_Texture.RGBA16(pix);
		pixels[base] = c[0];
		pixels[base + 1] = c[1];
		pixels[base + 2] = c[2];
		pixels[base + 3] = c[3];
	}
	var this1 = new Uint8Array(4);
	return { format : format, flags : header.flags, palette : this1, width : width, height : height, pixels : pixels};
};
lib_dinoplanet_Texture.readTextureI8 = function(src,header,noSwizzle) {
	var width = header.width;
	var height = header.height;
	var format = header.format;
	var imageSize = width * height;
	var this1 = new Uint8Array(imageSize);
	var pixels = this1;
	var position = 32;
	var bitsLeft = 64;
	var currentRow = 0;
	var input = src.getInt32(position);
	var mask = 255;
	var out = (input & mask) << 24;
	input >>= 8;
	out |= (input & mask) << 16;
	input >>= 8;
	out |= (input & mask) << 8;
	input >>= 8;
	var bits1 = out |= input & mask;
	position += 4;
	var input = src.getInt32(position);
	var mask = 255;
	var out = (input & mask) << 24;
	input >>= 8;
	out |= (input & mask) << 16;
	input >>= 8;
	out |= (input & mask) << 8;
	input >>= 8;
	var bits2 = out |= input & mask;
	position += 4;
	var out = [];
	if(currentRow % 2 == 1) {
		out.push(bits2);
		out.push(bits1);
	} else {
		out.push(bits1);
		out.push(bits2);
	}
	var bitSrc = out;
	bits1 = bitSrc[0];
	bits2 = bitSrc[1];
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
			var input = src.getInt32(position);
			var mask = 255;
			var out = (input & mask) << 24;
			input >>= 8;
			out |= (input & mask) << 16;
			input >>= 8;
			out |= (input & mask) << 8;
			input >>= 8;
			out |= input & mask;
			bits1 = out;
			position += 4;
			var input1 = src.getInt32(position);
			var mask1 = 255;
			var out1 = (input1 & mask1) << 24;
			input1 >>= 8;
			out1 |= (input1 & mask1) << 16;
			input1 >>= 8;
			out1 |= (input1 & mask1) << 8;
			input1 >>= 8;
			out1 |= input1 & mask1;
			bits2 = out1;
			position += 4;
			var out2 = [];
			if(currentRow % 2 == 1) {
				out2.push(bits2);
				out2.push(bits1);
			} else {
				out2.push(bits1);
				out2.push(bits2);
			}
			bitSrc = out2;
			bits1 = bitSrc[0];
			bits2 = bitSrc[1];
			bitsLeft = 64;
		}
		var pix = 0;
		if(bitsLeft <= 32) {
			pix = (bits2 & -16777216) >>> 24;
			bits2 <<= 8;
			bitsLeft -= 8;
		} else {
			pix = (bits1 & -16777216) >>> 24;
			bits1 <<= 8;
			bitsLeft -= 8;
		}
		pixels[j] = pix;
	}
	var this1 = new Uint8Array(4);
	return { format : format, flags : header.flags, palette : this1, width : width, height : height, pixels : pixels};
};
lib_dinoplanet_Texture.readTextureI4 = function(src,header,noSwizzle) {
	var width = header.width;
	var height = header.height;
	var format = header.format;
	var imageSize = width * height;
	var this1 = new Uint8Array(imageSize);
	var pixels = this1;
	var position = 32;
	var bitsLeft = 64;
	var currentRow = 0;
	var input = src.getInt32(position);
	var mask = 255;
	var out = (input & mask) << 24;
	input >>= 8;
	out |= (input & mask) << 16;
	input >>= 8;
	out |= (input & mask) << 8;
	input >>= 8;
	var bits1 = out |= input & mask;
	position += 4;
	var input = src.getInt32(position);
	var mask = 255;
	var out = (input & mask) << 24;
	input >>= 8;
	out |= (input & mask) << 16;
	input >>= 8;
	out |= (input & mask) << 8;
	input >>= 8;
	var bits2 = out |= input & mask;
	position += 4;
	var out = [];
	if(currentRow % 2 == 1) {
		out.push(bits2);
		out.push(bits1);
	} else {
		out.push(bits1);
		out.push(bits2);
	}
	var bitSrc = out;
	bits1 = bitSrc[0];
	bits2 = bitSrc[1];
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
			var input = src.getInt32(position);
			var mask = 255;
			var out = (input & mask) << 24;
			input >>= 8;
			out |= (input & mask) << 16;
			input >>= 8;
			out |= (input & mask) << 8;
			input >>= 8;
			out |= input & mask;
			bits1 = out;
			position += 4;
			var input1 = src.getInt32(position);
			var mask1 = 255;
			var out1 = (input1 & mask1) << 24;
			input1 >>= 8;
			out1 |= (input1 & mask1) << 16;
			input1 >>= 8;
			out1 |= (input1 & mask1) << 8;
			input1 >>= 8;
			out1 |= input1 & mask1;
			bits2 = out1;
			position += 4;
			var out2 = [];
			if(currentRow % 2 == 1) {
				out2.push(bits2);
				out2.push(bits1);
			} else {
				out2.push(bits1);
				out2.push(bits2);
			}
			bitSrc = out2;
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
		pixels[j] = lib_dinoplanet_Texture.CLUT4BIT[pix];
	}
	var this1 = new Uint8Array(4);
	return { format : format, flags : header.flags, palette : this1, width : width, height : height, pixels : pixels};
};
lib_dinoplanet_Texture.readTextureIA16 = function(src,header,noSwizzle) {
	var width = header.width;
	var height = header.height;
	var format = header.format;
	var imageSize = width * height;
	var this1 = new Uint8Array(imageSize * 2);
	var pixels = this1;
	var position = 32;
	var bitsLeft = 64;
	var currentRow = 0;
	var input = src.getInt32(position);
	var mask = 255;
	var out = (input & mask) << 24;
	input >>= 8;
	out |= (input & mask) << 16;
	input >>= 8;
	out |= (input & mask) << 8;
	input >>= 8;
	var bits1 = out |= input & mask;
	position += 4;
	var input = src.getInt32(position);
	var mask = 255;
	var out = (input & mask) << 24;
	input >>= 8;
	out |= (input & mask) << 16;
	input >>= 8;
	out |= (input & mask) << 8;
	input >>= 8;
	var bits2 = out |= input & mask;
	position += 4;
	var out = [];
	if(currentRow % 2 == 1) {
		out.push(bits2);
		out.push(bits1);
	} else {
		out.push(bits1);
		out.push(bits2);
	}
	var bitSrc = out;
	bits1 = bitSrc[0];
	bits2 = bitSrc[1];
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
			var input = src.getInt32(position);
			var mask = 255;
			var out = (input & mask) << 24;
			input >>= 8;
			out |= (input & mask) << 16;
			input >>= 8;
			out |= (input & mask) << 8;
			input >>= 8;
			out |= input & mask;
			bits1 = out;
			position += 4;
			var input1 = src.getInt32(position);
			var mask1 = 255;
			var out1 = (input1 & mask1) << 24;
			input1 >>= 8;
			out1 |= (input1 & mask1) << 16;
			input1 >>= 8;
			out1 |= (input1 & mask1) << 8;
			input1 >>= 8;
			out1 |= input1 & mask1;
			bits2 = out1;
			position += 4;
			var out2 = [];
			if(currentRow % 2 == 1) {
				out2.push(bits2);
				out2.push(bits1);
			} else {
				out2.push(bits1);
				out2.push(bits2);
			}
			bitSrc = out2;
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
	return { format : format, flags : header.flags, palette : this1, width : width, height : height, pixels : pixels};
};
lib_dinoplanet_Texture.readTextureIA8 = function(src,header,noSwizzle) {
	var width = header.width;
	var height = header.height;
	var format = header.format;
	var imageSize = width * height;
	var this1 = new Uint8Array(imageSize * 2);
	var pixels = this1;
	var position = 32;
	var bitsLeft = 64;
	var currentRow = 0;
	var input = src.getInt32(position);
	var mask = 255;
	var out = (input & mask) << 24;
	input >>= 8;
	out |= (input & mask) << 16;
	input >>= 8;
	out |= (input & mask) << 8;
	input >>= 8;
	var bits1 = out |= input & mask;
	position += 4;
	var input = src.getInt32(position);
	var mask = 255;
	var out = (input & mask) << 24;
	input >>= 8;
	out |= (input & mask) << 16;
	input >>= 8;
	out |= (input & mask) << 8;
	input >>= 8;
	var bits2 = out |= input & mask;
	position += 4;
	var out = [];
	if(currentRow % 2 == 1) {
		out.push(bits2);
		out.push(bits1);
	} else {
		out.push(bits1);
		out.push(bits2);
	}
	var bitSrc = out;
	bits1 = bitSrc[0];
	bits2 = bitSrc[1];
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
			var input = src.getInt32(position);
			var mask = 255;
			var out = (input & mask) << 24;
			input >>= 8;
			out |= (input & mask) << 16;
			input >>= 8;
			out |= (input & mask) << 8;
			input >>= 8;
			out |= input & mask;
			bits1 = out;
			position += 4;
			var input1 = src.getInt32(position);
			var mask1 = 255;
			var out1 = (input1 & mask1) << 24;
			input1 >>= 8;
			out1 |= (input1 & mask1) << 16;
			input1 >>= 8;
			out1 |= (input1 & mask1) << 8;
			input1 >>= 8;
			out1 |= input1 & mask1;
			bits2 = out1;
			position += 4;
			var out2 = [];
			if(currentRow % 2 == 1) {
				out2.push(bits2);
				out2.push(bits1);
			} else {
				out2.push(bits1);
				out2.push(bits2);
			}
			bitSrc = out2;
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
			r = lib_dinoplanet_Texture.CLUT4BIT[pix];
			bitsLeft -= 8;
		} else {
			pix = (bits1 & -268435456) >>> 28;
			a = (bits1 & 251658240) >>> 24;
			bits1 <<= 8;
			r = lib_dinoplanet_Texture.CLUT4BIT[pix];
			bitsLeft -= 8;
		}
		var base = j * 2;
		pixels[base] = r;
		pixels[base + 1] = lib_dinoplanet_Texture.CLUT4BIT[a];
	}
	var this1 = new Uint8Array(4);
	return { format : format, flags : header.flags, palette : this1, width : width, height : height, pixels : pixels};
};
lib_dinoplanet_Texture.readTextureIA4 = function(src,header,noSwizzle) {
	var width = header.width;
	var height = header.height;
	var format = header.format;
	var imageSize = width * height;
	var this1 = new Uint8Array(imageSize * 4);
	var pixels = this1;
	var position = 32;
	var bitsLeft = 64;
	var currentRow = 0;
	var input = src.getInt32(position);
	var mask = 255;
	var out = (input & mask) << 24;
	input >>= 8;
	out |= (input & mask) << 16;
	input >>= 8;
	out |= (input & mask) << 8;
	input >>= 8;
	var bits1 = out |= input & mask;
	position += 4;
	var input = src.getInt32(position);
	var mask = 255;
	var out = (input & mask) << 24;
	input >>= 8;
	out |= (input & mask) << 16;
	input >>= 8;
	out |= (input & mask) << 8;
	input >>= 8;
	var bits2 = out |= input & mask;
	position += 4;
	var out = [];
	if(currentRow % 2 == 1) {
		out.push(bits2);
		out.push(bits1);
	} else {
		out.push(bits1);
		out.push(bits2);
	}
	var bitSrc = out;
	bits1 = bitSrc[0];
	bits2 = bitSrc[1];
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
			var input = src.getInt32(position);
			var mask = 255;
			var out = (input & mask) << 24;
			input >>= 8;
			out |= (input & mask) << 16;
			input >>= 8;
			out |= (input & mask) << 8;
			input >>= 8;
			out |= input & mask;
			bits1 = out;
			position += 4;
			var input1 = src.getInt32(position);
			var mask1 = 255;
			var out1 = (input1 & mask1) << 24;
			input1 >>= 8;
			out1 |= (input1 & mask1) << 16;
			input1 >>= 8;
			out1 |= (input1 & mask1) << 8;
			input1 >>= 8;
			out1 |= input1 & mask1;
			bits2 = out1;
			position += 4;
			var out2 = [];
			if(currentRow % 2 == 1) {
				out2.push(bits2);
				out2.push(bits1);
			} else {
				out2.push(bits1);
				out2.push(bits2);
			}
			bitSrc = out2;
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
			r = lib_dinoplanet_Texture.CLUT4BIT[pix * 2];
			bitsLeft -= 4;
		} else {
			pix = (bits1 & -268435456) >>> 28;
			a = pix & 1;
			pix >>>= 1;
			bits1 <<= 4;
			r = lib_dinoplanet_Texture.CLUT4BIT[pix * 2];
			bitsLeft -= 4;
		}
		var base = j * 2;
		pixels[base] = r;
		pixels[base + 1] = a * 255;
	}
	var this1 = new Uint8Array(4);
	return { format : format, flags : header.flags, palette : this1, width : width, height : height, pixels : pixels};
};
lib_dinoplanet_Texture.readTextureCI4 = function(src,header,noSwizzle) {
	var width = header.width;
	var height = header.height;
	var format = header.format;
	var imageSize = width * height;
	var this1 = new Uint8Array(imageSize);
	var pixels = this1;
	var bitsLeft = 64;
	var position = 32;
	var bitsLeft = 64;
	var currentRow = 0;
	var input = src.getInt32(position);
	var mask = 255;
	var out = (input & mask) << 24;
	input >>= 8;
	out |= (input & mask) << 16;
	input >>= 8;
	out |= (input & mask) << 8;
	input >>= 8;
	var bits1 = out |= input & mask;
	position += 4;
	var input = src.getInt32(position);
	var mask = 255;
	var out = (input & mask) << 24;
	input >>= 8;
	out |= (input & mask) << 16;
	input >>= 8;
	out |= (input & mask) << 8;
	input >>= 8;
	var bits2 = out |= input & mask;
	position += 4;
	var out = [];
	if(currentRow % 2 == 1) {
		out.push(bits2);
		out.push(bits1);
	} else {
		out.push(bits1);
		out.push(bits2);
	}
	var bitSrc = out;
	bits1 = bitSrc[0];
	bits2 = bitSrc[1];
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
			var input = src.getInt32(position);
			var mask = 255;
			var out = (input & mask) << 24;
			input >>= 8;
			out |= (input & mask) << 16;
			input >>= 8;
			out |= (input & mask) << 8;
			input >>= 8;
			out |= input & mask;
			bits1 = out;
			position += 4;
			var input1 = src.getInt32(position);
			var mask1 = 255;
			var out1 = (input1 & mask1) << 24;
			input1 >>= 8;
			out1 |= (input1 & mask1) << 16;
			input1 >>= 8;
			out1 |= (input1 & mask1) << 8;
			input1 >>= 8;
			out1 |= input1 & mask1;
			bits2 = out1;
			position += 4;
			var out2 = [];
			if(currentRow % 2 == 1) {
				out2.push(bits2);
				out2.push(bits1);
			} else {
				out2.push(bits1);
				out2.push(bits2);
			}
			bitSrc = out2;
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
	var palette = lib_dinoplanet_Texture.readPalette(src,16,position);
	return { format : format, flags : header.flags, palette : palette, width : width, height : height, pixels : pixels};
};
lib_dinoplanet_Texture.readTextureCI8 = function(src,header,noSwizzle) {
	var width = header.width;
	var height = header.height;
	var format = header.format;
	var imageSize = width * height;
	var this1 = new Uint8Array(imageSize);
	var pixels = this1;
	var position = 32;
	var bitsLeft = 64;
	var currentRow = 0;
	var input = src.getInt32(position);
	var mask = 255;
	var out = (input & mask) << 24;
	input >>= 8;
	out |= (input & mask) << 16;
	input >>= 8;
	out |= (input & mask) << 8;
	input >>= 8;
	var bits1 = out |= input & mask;
	position += 4;
	var input = src.getInt32(position);
	var mask = 255;
	var out = (input & mask) << 24;
	input >>= 8;
	out |= (input & mask) << 16;
	input >>= 8;
	out |= (input & mask) << 8;
	input >>= 8;
	var bits2 = out |= input & mask;
	position += 4;
	var out = [];
	if(currentRow % 2 == 1) {
		out.push(bits2);
		out.push(bits1);
	} else {
		out.push(bits1);
		out.push(bits2);
	}
	var bitSrc = out;
	bits1 = bitSrc[0];
	bits2 = bitSrc[1];
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
			var input = src.getInt32(position);
			var mask = 255;
			var out = (input & mask) << 24;
			input >>= 8;
			out |= (input & mask) << 16;
			input >>= 8;
			out |= (input & mask) << 8;
			input >>= 8;
			out |= input & mask;
			bits1 = out;
			position += 4;
			var input1 = src.getInt32(position);
			var mask1 = 255;
			var out1 = (input1 & mask1) << 24;
			input1 >>= 8;
			out1 |= (input1 & mask1) << 16;
			input1 >>= 8;
			out1 |= (input1 & mask1) << 8;
			input1 >>= 8;
			out1 |= input1 & mask1;
			bits2 = out1;
			position += 4;
			var out2 = [];
			if(currentRow % 2 == 1) {
				out2.push(bits2);
				out2.push(bits1);
			} else {
				out2.push(bits1);
				out2.push(bits2);
			}
			bitSrc = out2;
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
	var palette = lib_dinoplanet_Texture.readPalette(src,16,position);
	return { format : format, flags : header.flags, palette : palette, width : width, height : height, pixels : pixels};
};
lib_dinoplanet_Texture.convertToImage = function(texture,forceOpacity) {
	var img = new ImageData(texture.width,texture.height);
	var size = texture.width * texture.height;
	var pal = texture.palette;
	var f = texture.format.pixelFormat;
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
var lib_image_png_Color = $hxEnums["lib.image.png.Color"] = { __ename__:true,__constructs__:null
	,ColGrey: ($_=function(alpha) { return {_hx_index:0,alpha:alpha,__enum__:"lib.image.png.Color",toString:$estr}; },$_._hx_name="ColGrey",$_.__params__ = ["alpha"],$_)
	,ColTrue: ($_=function(alpha) { return {_hx_index:1,alpha:alpha,__enum__:"lib.image.png.Color",toString:$estr}; },$_._hx_name="ColTrue",$_.__params__ = ["alpha"],$_)
	,ColIndexed: {_hx_name:"ColIndexed",_hx_index:2,__enum__:"lib.image.png.Color",toString:$estr}
};
lib_image_png_Color.__constructs__ = [lib_image_png_Color.ColGrey,lib_image_png_Color.ColTrue,lib_image_png_Color.ColIndexed];
var lib_image_png_Chunk = $hxEnums["lib.image.png.Chunk"] = { __ename__:true,__constructs__:null
	,CEnd: {_hx_name:"CEnd",_hx_index:0,__enum__:"lib.image.png.Chunk",toString:$estr}
	,CHeader: ($_=function(h) { return {_hx_index:1,h:h,__enum__:"lib.image.png.Chunk",toString:$estr}; },$_._hx_name="CHeader",$_.__params__ = ["h"],$_)
	,CData: ($_=function(b) { return {_hx_index:2,b:b,__enum__:"lib.image.png.Chunk",toString:$estr}; },$_._hx_name="CData",$_.__params__ = ["b"],$_)
	,CPalette: ($_=function(b) { return {_hx_index:3,b:b,__enum__:"lib.image.png.Chunk",toString:$estr}; },$_._hx_name="CPalette",$_.__params__ = ["b"],$_)
	,CUnknown: ($_=function(id,data) { return {_hx_index:4,id:id,data:data,__enum__:"lib.image.png.Chunk",toString:$estr}; },$_._hx_name="CUnknown",$_.__params__ = ["id","data"],$_)
};
lib_image_png_Chunk.__constructs__ = [lib_image_png_Chunk.CEnd,lib_image_png_Chunk.CHeader,lib_image_png_Chunk.CData,lib_image_png_Chunk.CPalette,lib_image_png_Chunk.CUnknown];
var lib_image_png_Reader = function(i) {
	this.i = i;
	i.set_bigEndian(true);
	this.checkCRC = true;
};
lib_image_png_Reader.__name__ = true;
lib_image_png_Reader.prototype = {
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
			if(c == lib_image_png_Chunk.CEnd) {
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
			color1 = lib_image_png_Color.ColGrey(false);
			break;
		case 2:
			color1 = lib_image_png_Color.ColTrue(false);
			break;
		case 3:
			color1 = lib_image_png_Color.ColIndexed;
			break;
		case 4:
			color1 = lib_image_png_Color.ColGrey(true);
			break;
		case 6:
			color1 = lib_image_png_Color.ColTrue(true);
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
			return lib_image_png_Chunk.CData(data);
		case "IEND":
			return lib_image_png_Chunk.CEnd;
		case "IHDR":
			return lib_image_png_Chunk.CHeader(this.readHeader(new haxe_io_BytesInput(data)));
		case "PLTE":
			return lib_image_png_Chunk.CPalette(data);
		default:
			return lib_image_png_Chunk.CUnknown(id,data);
		}
	}
};
var lib_image_png_Tools = function() { };
lib_image_png_Tools.__name__ = true;
lib_image_png_Tools.getHeader = function(d) {
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
lib_image_png_Tools.getPalette = function(d) {
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
lib_image_png_Tools.filter = function(data,x,y,stride,prev,p,numChannels) {
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
lib_image_png_Tools.reverseBytes = function(b) {
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
lib_image_png_Tools.extractGrey = function(d) {
	var h = lib_image_png_Tools.getHeader(d);
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
	data = lib_Inflate.run(data);
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
lib_image_png_Tools.extract32 = function(d,bytes,flipY) {
	var h = lib_image_png_Tools.getHeader(d);
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
	data = lib_Inflate.run(data);
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
		var pal = lib_image_png_Tools.getPalette(d);
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
lib_image_png_Tools.buildGrey = function(width,height,data,level) {
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
	l.add(lib_image_png_Chunk.CHeader({ width : width, height : height, colbits : 8, color : lib_image_png_Color.ColGrey(false), interlaced : false}));
	l.add(lib_image_png_Chunk.CData(lib_Deflate.run(rgb,level)));
	l.add(lib_image_png_Chunk.CEnd);
	return l;
};
lib_image_png_Tools.buildIndexed = function(width,height,data,palette,level) {
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
	l.add(lib_image_png_Chunk.CHeader({ width : width, height : height, colbits : 8, color : lib_image_png_Color.ColIndexed, interlaced : false}));
	l.add(lib_image_png_Chunk.CPalette(palette));
	l.add(lib_image_png_Chunk.CData(lib_Deflate.run(rgb,level)));
	l.add(lib_image_png_Chunk.CEnd);
	return l;
};
lib_image_png_Tools.buildIndexedWithTransparency = function(width,height,data,palette,level) {
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
	l.add(lib_image_png_Chunk.CHeader({ width : width, height : height, colbits : 8, color : lib_image_png_Color.ColIndexed, interlaced : false}));
	var numCols = Math.floor(palette.length / 4);
	var pal2 = new haxe_io_Bytes(new ArrayBuffer(numCols * 3));
	var trns = new haxe_io_Bytes(new ArrayBuffer(numCols));
	var _g = 0;
	var _g1 = numCols;
	while(_g < _g1) {
		var p = _g++;
		pal2.b[p * 3] = palette.b[p * 4];
		pal2.b[p * 3 + 1] = palette.b[p * 4 + 1];
		pal2.b[p * 3 + 2] = palette.b[p * 4 + 2];
		trns.b[p] = palette.b[p * 4 + 3];
	}
	l.add(lib_image_png_Chunk.CPalette(pal2));
	l.add(lib_image_png_Chunk.CUnknown("tRNS",trns));
	l.add(lib_image_png_Chunk.CData(lib_Deflate.run(rgb,level)));
	l.add(lib_image_png_Chunk.CEnd);
	return l;
};
lib_image_png_Tools.buildRGB = function(width,height,data,level) {
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
	l.add(lib_image_png_Chunk.CHeader({ width : width, height : height, colbits : 8, color : lib_image_png_Color.ColTrue(false), interlaced : false}));
	l.add(lib_image_png_Chunk.CData(lib_Deflate.run(rgb,level)));
	l.add(lib_image_png_Chunk.CEnd);
	return l;
};
lib_image_png_Tools.build32ARGB = function(width,height,data,level) {
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
	l.add(lib_image_png_Chunk.CHeader({ width : width, height : height, colbits : 8, color : lib_image_png_Color.ColTrue(true), interlaced : false}));
	l.add(lib_image_png_Chunk.CData(lib_Deflate.run(rgba,level)));
	l.add(lib_image_png_Chunk.CEnd);
	return l;
};
lib_image_png_Tools.build32BGRA = function(width,height,data,level) {
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
	l.add(lib_image_png_Chunk.CHeader({ width : width, height : height, colbits : 8, color : lib_image_png_Color.ColTrue(true), interlaced : false}));
	l.add(lib_image_png_Chunk.CData(lib_Deflate.run(rgba,level)));
	l.add(lib_image_png_Chunk.CEnd);
	return l;
};
var lib_image_png_Writer = function(o) {
	this.o = o;
	o.set_bigEndian(true);
};
lib_image_png_Writer.__name__ = true;
lib_image_png_Writer.prototype = {
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
		var arr2 = lib_dinoplanet_Rarezip.decompress(arr);
		var tx = lib_dinoplanet_Texture.decodeTexture(arr2,0,ovr);
		if(tx.format.pixelFormat > -1) {
			ui_UI.gfx.drawTexture(posX,posY,tx,tx.format.opaque);
			posY += tx.height + 8;
			if(posY >= 608 - (tx.height + 8)) {
				posY = 0;
				posX += tx.width + 8;
			}
			ui_UI.textureInfoTooltip(tx);
		}
	}
};
ui_UI.textureInfoTooltip = function(tx) {
	var fNames = lib_dinoplanet_Texture.getFormatNames();
	var pos = 400;
	var posInc = 16;
	ui_UI.gfx.rect(0,pos - 16,1024,208,"#000000");
	ui_UI.gfx.drawText("format : " + fNames[tx.format.pixelFormat],"#00ffff",16,pos += posInc);
	ui_UI.gfx.drawText("opaque : " + Std.string(tx.format.opaque),"#00ffff",16,pos += posInc);
	ui_UI.gfx.drawText("greyscale : " + Std.string(tx.format.gray),"#00ffff",16,pos += posInc);
	var flgs = tx.flags;
	ui_UI.gfx.drawText("no interlace : " + (flgs.ovrNoInterlace == null ? "null" : "" + flgs.ovrNoInterlace),"#00ff00",16,pos += posInc);
	ui_UI.gfx.drawText("state switcher : " + (flgs.ovrNoInterlace == null ? "null" : "" + flgs.ovrNoInterlace),"#00ff00",16,pos += posInc);
	ui_UI.gfx.drawText("transparent : " + (flgs.ovrNoInterlace == null ? "null" : "" + flgs.ovrNoInterlace),"#00ff00",16,pos += posInc);
	ui_UI.gfx.drawText("transparent+ : " + (flgs.ovrNoInterlace == null ? "null" : "" + flgs.ovrNoInterlace),"#00ff00",16,pos += posInc);
	ui_UI.gfx.drawText("transparent animated : " + (flgs.ovrNoInterlace == null ? "null" : "" + flgs.ovrNoInterlace),"#00ff00",16,pos += posInc);
	ui_UI.gfx.drawText("mip-mapped : " + (flgs.ovrNoInterlace == null ? "null" : "" + flgs.ovrNoInterlace),"#00ff00",16,pos += posInc);
	ui_UI.gfx.drawText("composite - base : " + (flgs.ovrNoInterlace == null ? "null" : "" + flgs.ovrNoInterlace),"#00ff00",16,pos += posInc);
	ui_UI.gfx.drawText("composite - overlay : " + (flgs.ovrNoInterlace == null ? "null" : "" + flgs.ovrNoInterlace),"#00ff00",16,pos += posInc);
};
ui_UI.exportZip = function() {
	editor_FileExporter.exportZip(Main.ROM,0);
};
ui_UI.exportZipPNG = function() {
	editor_FileExporter.exportZip(Main.ROM,1);
};
var util_BinUtils = function() { };
util_BinUtils.__name__ = true;
util_BinUtils.createByteArray = function(src,end) {
	var bytearr = haxe_io_Bytes.ofData(src);
	return new lib_ByteThingyWhatToNameIt(bytearr,end);
};
util_BinUtils.BytesToU8Array = function(src) {
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
util_BinUtils.readU8ArrayFromBytes = function(src,pos,length) {
	var this1 = new Uint8Array(length);
	var out = this1;
	var _g = 0;
	var _g1 = length;
	while(_g < _g1) {
		var i = _g++;
		out[i] = src.get(pos + i);
	}
	return out;
};
util_BinUtils.U8ArrayToBytes = function(src) {
	var out = new haxe_io_Bytes(new ArrayBuffer(src.length));
	var _g = 0;
	var _g1 = src.length;
	while(_g < _g1) {
		var i = _g++;
		out.b[i] = src[i];
	}
	return out;
};
var util_BitUtils = function() { };
util_BitUtils.__name__ = true;
util_BitUtils.reverseI32 = function(input) {
	var mask = 255;
	var out = (input & mask) << 24;
	input >>= 8;
	out |= (input & mask) << 16;
	input >>= 8;
	out |= (input & mask) << 8;
	input >>= 8;
	out |= input & mask;
	return out;
};
util_BitUtils.reverseI16 = function(input) {
	var mask = 255;
	var out = (input & mask) << 8;
	input >>= 8;
	out |= input & mask;
	return out;
};
util_BitUtils.reverseI24 = function(input) {
};
var util_Util = function() { };
util_Util.__name__ = true;
util_Util.dataSize = function(size) {
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
util_Util.truncateDecimals = function(num,places) {
	var num2 = num == null ? "null" : "" + num;
	var out = HxOverrides.substr(num2,0,num2.indexOf(".") + (places + 1));
	return out;
};
util_Util.hexa = function(n) {
	return StringTools.hex(n,2);
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
lib_dinoplanet_Texture.formats = ["RGBA32","RGBA16","I8","I4","IA16","IA8","IA4","CI4","CI8"];
lib_dinoplanet_Texture.CLUT4BIT = [0,17,34,51,68,85,102,119,136,153,170,187,204,221,238,255];
util_Util.signExtension = [-1,-2,-4,-8,-16,-32,-64,-128,-256,-512,-1024,-2048,-4096,-8192,-16384,-32768,-65536,-131072,-262144,-524288,-1048576,-2097152,-4194304,-8388608,-16777216,-33554432,-67108864,-134217728,-268435456,-536870912,-1073741824,-2147483648];
Main.main();
})(typeof window != "undefined" ? window : typeof global != "undefined" ? global : typeof self != "undefined" ? self : this);
