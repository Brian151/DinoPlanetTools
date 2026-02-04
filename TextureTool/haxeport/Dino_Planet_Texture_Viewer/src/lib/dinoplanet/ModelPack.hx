package lib.dinoplanet;
import haxe.io.Bytes;
import haxe.io.UInt32Array;
import js.Browser.console; // X-PLAT THIS
import util.Util;

// could probably remove this since only one model per entry
typedef ModPackFile = {
	resCount : Int,
	resources : Array<ModPackResource>,
	data : Bytes
}

// needs re-name, and no need to duplicate this type
typedef ModPackResource = {
	ofs : Int,
	size : Int
}

// STILL WIP
class ModPack 
{
	// is there a valid reason Rare made bin/tab separate files?
	public var data : Bytes;
	public var offsetTable : Bytes;
	public var type : Int; // 0 : texture, 1 : model
	
	public function new() {
		type = 0;
	}
	
	// not entirely a fan of this... 
	public function loadData(bin:Bytes) {
		data = bin;
	}
	
	public function loadOffsets(tab:Bytes) {
		offsetTable = tab;
	}
	
	public function getItem(ord:Int):ModPackFile {
		/* 
			TODO : 
				EOF
		*/
		
		var tabBytes = offsetTable;
		var posBase = (ord * 4);
		
		var ofs:Int = util.Util.reverseI32(tabBytes.getInt32(posBase));
		var endOfs:Int = util.Util.reverseI32(tabBytes.getInt32(posBase + 4));
		
		var size:Int = (endOfs & 0x00ffffff) - (ofs & 0x00ffffff);
		var numSubTextures:Int = (ofs & 0xff000000) >> 24;
		var realOfs:Int = ofs & 0x00ffffff;
		
		var outBuf:Bytes = Bytes.alloc(size);
		outBuf.blit(0, data, realOfs, size);
		
		var out:ModPackFile = {
			resCount:numSubTextures,
			resources: [{
				ofs : realOfs,
				size : size
			}],
			data : outBuf
		}
		
		// sanity check before deleting entirely
		/*if (numSubTextures > 1 && type == 0) {
			// array is populated by reading offset table, remove the original entry
			out.resources.pop();
			
			var tabSize = (numSubTextures + 1) * 2;
			
			var table = new UInt32Array(tabSize);
			for (i in 0...tabSize) {
				var baseOf = realOfs + (4 * i);
				table[i] = Util.reverseI32(data.getInt32(baseOf));
			}
			
			for (i in 0...numSubTextures) {
				var ofs1:Int = table[i * 2];
				var ofs2:Int = table[(i + 1) * 2];
				var sizeComp:Int = ofs2 - ofs1;
				out.resources.push(
					{
						ofs:ofs1 + realOfs,
						size:sizeComp
					}
				);
			}
		} */
		return out; 
	}
	
	public function getFile(ord): Array<Bytes> {
		var datEntry:ModPackFile = getItem(ord);
		var out:Array<Bytes> = new Array();
		
		for (i in 0...datEntry.resCount) {
			var curr = datEntry.resources[i];
			var byteout:Bytes = Bytes.alloc(curr.size);
			byteout.blit(0, data, curr.ofs, curr.size);
			out.push(byteout);
		}
		
		return out;
	}
}