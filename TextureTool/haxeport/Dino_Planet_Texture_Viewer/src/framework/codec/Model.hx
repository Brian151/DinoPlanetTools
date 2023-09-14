package framework.codec;
import framework.codec.Model_Types;
import haxe.io.Bytes;
import haxe.io.BytesInput;
import haxe.io.UInt8Array;
import js.Syntax;
import js.Browser.console;
import pako.Pako;


class Model 
{
	/*TODO : 
		export texture references
	*/
	
	public static function readModel(dat:Bytes) : T_Model {
		var out = {
			datBytes : dat,
			header : readModelHeader(dat),
			textures : new Array()
		}
		readModelTextureList(out);
		return out;
	}
		
	public static function readModelHeader(dat:Bytes) : T_ModelHeader {
		var stream : BytesInput = new BytesInput(dat, 0);
		stream.bigEndian = true;
		var out = {
			PTR_texture : stream.readInt32(),
			PTR_vert : stream.readInt32(),
			PTR_face : stream.readInt32(),
			PTR_F3DtriOps : stream.readInt32(),
			UNK_0x10 : stream.readInt32(), // null ?
			PTR_vertGroupOffset : stream.readInt32(),
			PTR_vertGroup : stream.readInt32(),
			PTR_blendShape : stream.readInt32(),
			PTR_joint : stream.readInt32(),
			UNK_0x24 : stream.readInt32(), // null ?
			PTR_hitbox : stream.readInt32(),
			PTR_edgeVector : stream.readInt32(),
			UNK_0x30 : stream.readInt32(), // null ?
			PTR_collisionBox : stream.readInt32(),
			PTR_F3DDrawMode : stream.readInt32(),
			PTR_eyeAnim : stream.readInt32(),
			UNK_0x40 : stream.readInt32(),
			UNK_0x44 : stream.readInt32(),
			UNK_0x48 : stream.readInt32(),
			UNK_0x4c : stream.readInt32(),
			PTR_unk0x50 : stream.readInt32(),
			PTR_unk0x54 : stream.readInt32(),
			byteLength : stream.readInt32(),
			UNK_0x5c : stream.readInt32(),
			UNK_0x60 : stream.readUInt16(), // 16-bit
			vertCount : stream.readUInt16(), // 16-bit
			faceCount : stream.readUInt16(), // 16-bit
			UNK_0x66 : stream.readUInt16(), // null ? 16-bit
			UNK_0x68 : stream.readInt32(), // null ?
			F3DOpCount : stream.readUInt16(), // 16-bit
			hitboxCount : stream.readByte(), // 8-bit
			jointCount : stream.readByte(), // 8-bit
			UNK_0x70 : stream.readUInt16(), // 16-bit
			textureCount : stream.readUInt16(), // 16-bit
			countFaceRangeWithEnvMap : stream.readByte(), //8-bit
			countEFPairsInDrawMode : stream.readByte(), //8-bit
			countTextureAnimations : stream.readByte(), //8-bit
			UNK_0x77 : stream.readByte(), // null? 8-bit
			UNK_0x78 : stream.readInt32(), // null?
			UNK_0x7c : stream.readInt32() // null
		}
		console.log(stream.position);
		return out;
	}
	
	public static function readModelTextureList(model:T_Model) {
		var stream : BytesInput = new BytesInput(model.datBytes, model.header.PTR_texture);
		stream.bigEndian = true;
		
		for (i in 0...model.header.textureCount) {
			//console.log(stream.position);
			model.textures.push({
				UNK_0x00 : stream.readUInt16(), //null? 16-bit
				textureID : stream.readUInt16(), // 16-bit
				x : stream.readByte(), // 8-bit
				y : stream.readByte(), // 8-bit
				UNK_06 : stream.readByte(), // flags? 8-bit
				UNK_07 : stream.readByte(), // null? 8-bit
			});
		}
	}
	
	public static function decompressModel(comp:Bytes) : Bytes {
		var stream : BytesInput = new BytesInput(comp, 0);
		stream.bigEndian = true;
		var animEntries : Int = stream.readUInt16();
		stream.position += 6;
		stream.bigEndian = false;
		var decompSize = stream.readInt32();
		var level = stream.readByte();
		var compSize = stream.length - 13;
		
		#if js
			var compressed : UInt8Array = new UInt8Array(compSize);
			for (i in 0...compSize) {
				compressed[i] = stream.readByte();
			}
			
			// dual cast cuz whiny compiler... 
			var decompressed:UInt8Array = cast Pako.inflateRaw(cast compressed);
			var out : Bytes = Bytes.alloc(decompSize);
			for (i in 0...decompSize) {
				out.set(i, decompressed[i]);
			}
			return out;
		#else
			throw "not implemented";
		#end
		
	}
}