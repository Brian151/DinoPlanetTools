package framework.codec;
import framework.ByteThingyWhatToNameIt;
import js.lib.ArrayBuffer;
import js.lib.Uint32Array;

// probably a nicer way to handle this
typedef BinPackResource = {
	ofs : Int,
	size : Int,
	count : Int,
	frames : Array<BinPackSubResource>,
	data : ByteThingyWhatToNameIt
}

typedef BinPackSubResource = {
	ofs : Int,
	size : Int
}

// STILL WIP
class BinPack 
{
	var data : ByteThingyWhatToNameIt;
	var offsetTable : ByteThingyWhatToNameIt;
	// bin/tab processing probably will be merged here
	// for all intents and purposes, these pairs function as 1 file
	// a tab with no bin has no content
	// a bin with no tab has no layout/structure
	// is there a valid reason rare made them separate files?
	
	// this might need to do something slightly different for
	// each/certain tabs, as they're not entirely standarized/generalized[?]
	public function new(bin:ByteThingyWhatToNameIt,tab:ByteThingyWhatToNameIt) {
		data = bin;
		offsetTable = tab;
	}
	
	public function getItem(ord:Int) {
		/* 
			TODO : 
				EOF
		*/
		offsetTable.position = (ord * 4);
		var ofs:Int = offsetTable.readUint32();
		var endOfs:Int = offsetTable.readUint32();
		var size:Int = (endOfs & 0x00ffffff) - (ofs & 0x00ffffff);
		var numSubTextures:Int = (ofs & 0xff000000) >> 24;
		var realOfs:Int = ofs & 0x00ffffff;
		data.position = realOfs;
		var outDat : new DataStream(new ArrayBuffer(size), 0, false);
		outDat.writeUint8Array(data.readUint8Array(size));
		var out:BinPackResource = {
			ofs:realOfs,
			size:size,
			count:numSubTextures,
			frames:[],
			data : outDat 
		}
		if (numSubTextures > 1) {
			data.position = realOfs;
			// frame offset table
			var table:Uint32Array = data.readUint32Array((numSubTextures + 1) * 2);
				
			for (i in 0...numSubTextures) {
				var ofs1:Int = table[i * 2];
				var ofs2:Int = table[(i + 1) * 2];
				var sizeComp:Int = ofs2 - ofs1;
				//console.log(ofs1.toString(16) , ofs2.toString(16));
				out.frames.push(
					{
						ofs:ofs1,
						size:sizeComp
					}
				);
			}
		}
		return out; 
	}
}