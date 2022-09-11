package framework.codec;
import framework.ByteThingyWhatToNameIt;
import haxe.io.Bytes;
import haxe.io.UInt32Array;
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
	var data : ByteThingyWhatToNameIt;
	var offsetTable : ByteThingyWhatToNameIt;
	
	
	public function new() {
		
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
		*/
		Syntax.code("console.log(\"getItem() runs!\")");
		offsetTable.position = (ord * 4);
		var ofs:Int = offsetTable.readUint32(false);
		var endOfs:Int = offsetTable.readUint32(false);
		var size:Int = (endOfs & 0x00ffffff) - (ofs & 0x00ffffff);
		var numSubTextures:Int = (ofs & 0xff000000) >> 24;
		var realOfs:Int = ofs & 0x00ffffff;
		data.position = realOfs;
		var outBuf:Bytes = Bytes.alloc(size);
		var outDat:ByteThingyWhatToNameIt = new ByteThingyWhatToNameIt(outBuf, false);
		outDat.writeUint8Array(data.readUint8Array(size));
		var out:BinPackFile = {
			resCount:numSubTextures,
			resources: [{
				ofs : realOfs,
				size : size
			}],
			data : outDat
		}
		if (numSubTextures > 1) {
			data.position = realOfs;
			// array is populated by reading offset table, remove the original entry
			out.resources.pop(); 
			// resource offset table
			var table:UInt32Array = data.readUint32Array((numSubTextures + 1) * 2,false);
				
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
}