package framework.codec;
import framework.ByteThingyWhatToNameIt; // TODO : phase-out
import haxe.io.Bytes;
import haxe.io.UInt32Array;
import js.Browser;
import js.Syntax;

typedef BinPackFile = {
	resCount : Int,
	resources : Array<BinPackResource>,
	data : ByteThingyWhatToNameIt
}

typedef BinPackResource = {
	ofs : Int,
	size : Int
}

// STILL WIP

// might need to do something slightly different for
// each/certain tabs, as they're not entirely standarized/generalized[?]
class BinPack 
{
	// is there a valid reason Rare made bin/tab separate files?
	public var data : ByteThingyWhatToNameIt;
	public var offsetTable : ByteThingyWhatToNameIt;
	public var type : Int; // 0 : texture, 1 : model
	
	public function new() {
		type = 0;
	}
	
	// not entirely a fan of this... 
	public function loadData(bin:ByteThingyWhatToNameIt) {
		data = bin;
	}
	
	public function loadOffsets(tab:ByteThingyWhatToNameIt) {
		offsetTable = tab;
	}
	
	public function getItem(ord:Int):BinPackFile {
		/* 
			TODO : 
				EOF
				remove ByteThing
		*/
		
		var tabBytes = offsetTable.tgt;
		var posBase = (ord * 4);
		
		var ofs:Int = Util.reverseI32(tabBytes.getInt32(posBase));
		var endOfs:Int = Util.reverseI32(tabBytes.getInt32(posBase + 4));
		
		var size:Int = (endOfs & 0x00ffffff) - (ofs & 0x00ffffff);
		var numSubTextures:Int = (ofs & 0xff000000) >> 24;
		var realOfs:Int = ofs & 0x00ffffff;
		
		data.position = realOfs;
		var outBuf:Bytes = Bytes.alloc(size);
		var outDat:ByteThingyWhatToNameIt = new ByteThingyWhatToNameIt(outBuf, false);
		outDat.tgt.blit(0, data.tgt, realOfs, size);
		
		var out:BinPackFile = {
			resCount:numSubTextures,
			resources: [{
				ofs : realOfs,
				size : size
			}],
			data : outDat
		}
		if (type == 1) {
			out.resCount = 1;
		}
		if (numSubTextures > 1 && type == 0) {
			data.position = realOfs;
			// array is populated by reading offset table, remove the original entry
			out.resources.pop(); 
			// resource offset table
			//var table:UInt32Array = data.readUint32Array((numSubTextures + 1) * 2, false);
			var tabSize = (numSubTextures + 1) * 2;
			
			var table = new UInt32Array(tabSize);
			for (i in 0...tabSize) {
				var baseOf = realOfs + (4 * i);
				table[i] = Util.reverseI32(data.tgt.getInt32(baseOf));
			}
			
			for (i in 0...numSubTextures) {
				var ofs1:Int = table[i * 2];
				var ofs2:Int = table[(i + 1) * 2];
				var sizeComp:Int = ofs2 - ofs1;
				//console.log(Main.hexa(ofs1), Main.hexa(ofs2));
				out.resources.push(
					{
						ofs:ofs1 + realOfs,
						size:sizeComp
					}
				);
			}
		}
		return out; 
	}
	
	public function getFile(ord): Array<ByteThingyWhatToNameIt> {
		var datEntry:BinPackFile = getItem(ord);
		var out:Array<ByteThingyWhatToNameIt> = new Array();
		
		for (i in 0...datEntry.resCount) {
			var curr = datEntry.resources[i];
			data.position = curr.ofs;
			out.push(data.readByteThingy(curr.size,false));
		}
		
		return out;
	}
}