package ui;
import js.html.Element;
import js.html.InputElement;
import js.Browser.document;
import js.Syntax;
import js.html.Image;
import framework.ByteThingyWhatToNameIt;
import framework.codec.Texture;
import framework.codec.Texture.TTextureFormatOverride;

class UI
{
	static var gfx:Graphics;
	static var menu:Element;
	static var name_txt:InputElement;
	static var tags_txt:InputElement;
	static var path_txt:InputElement;
	
	// UI funcs
	public static function initMenu(ctx,menuEl:Element,name:InputElement, tags:InputElement, path:InputElement) {
		gfx = ctx;
		menu = menuEl;
		name_txt = name;
		tags_txt = tags;
		path_txt = path;
		// todo : not hard-code this
		for (i in 0...Main.ROM.manifest.resources.length) {
			generateMenuItem(i);
		}
	}
	
	public static function generateMenuItem(ord:Int) {
		/*
			<div class="navEntry" onclick="alert('hi there')">
				<img width="32" height="32" class="texPreview" src="default_icon.png"/><h3 class="texName">&nbsp;&nbsp;&nbsp;&nbsp;a texture</h3>
			</div>
		*/
		//console.log(ord);
		var entryButton = document.createElement("div");
		entryButton.setAttribute("class", "navEntry");
		// weird issue compiling, MUST specify Main.updateEntry
		entryButton.onclick = Syntax.code("function() {var tName = {0}.value; var tTags = {1}.value;var tPath = {2}.value;{3}({4},tName,tTags,tPath);{4}= ord;window.displayTextureInfo(ord);}",name_txt,tags_txt,path_txt,Main.updateEntry,Main.ROM.currTex);
		var entryIcon = new Image();
		entryIcon.width = 32;
		entryIcon.height = 32;
		entryIcon.src = "default_icon.png";
		entryIcon.setAttribute("class","texPreview");
		var entryName = document.createElement("h3");
		var tInfo = Main.ROM.manifest.resources[ord];
		//console.log(tInfo);
		entryName.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;" + tInfo.name;
		entryButton.appendChild(entryIcon);
		entryName.setAttribute("class","texName");
		entryName.setAttribute("id","texName_" + ord);
		entryButton.appendChild(entryName);
		menu.appendChild(entryButton);
	}
	
	public static function advanceTexture() {
		var tName:String = name_txt.value;
		var tTags:String = tags_txt.value;
		var tPath:String = path_txt.value;
		Main.updateEntry(Main.ROM.currTex,tName,tTags,tPath);
		Main.ROM.currTex += 1;
		displayTextureInfo(Main.ROM.currTex);
	}
	
	public static function rewindTexture() {
		var tName:String = name_txt.value;
		var tTags:String = tags_txt.value;
		var tPath:String = path_txt.value;
		Main.updateEntry(Main.ROM.currTex,tName,tTags,tPath);
		Main.ROM.currTex -= 1;
		displayTextureInfo(Main.ROM.currTex);
	}
	
	public static function updateCurrentEntry() { // just HTML... 
		var tName:String = name_txt.value;
		var tTags:String = tags_txt.value;
		var tPath:String = path_txt.value;
		Main.updateEntry(Main.ROM.currTex,tName,tTags,tPath);
	}
	
	public static function displayTextureInfo(num) {
		if (num > 3651 || num < 0) { // still bad
			num = 0;
		}
		
		var tInfo:Dynamic = Main.ROM.manifest.resources[num];
		name_txt.value = tInfo.name;
		tags_txt.value = tInfo.tags.join(",");
		path_txt.value = tInfo.path;
		
		var t = Main.ROM.bin.getItem(num);
		if (t.resCount > 1) {
			var posX = 0;
			var posY = 0;
			for (i in 0...t.resCount) {
				var t2 = t.resources[i];
				Main.ROM.bin.data.position = t2.ofs;
				var arr:ByteThingyWhatToNameIt = Main.ROM.bin.data.readByteThingy(t2.size, false);
				var ovr:TTextureFormatOverride = tInfo.resInfo.formatOVR;
				
				var tx = Texture.decodeTexture(arr,t2.size,ovr);
				if (tx.format > -1) {
					gfx.drawTexture(posX,posY,tx,ovr.forceOpacity);
					posY += tx.height + 8;
					// todo : magic #'s bad!
					if (posY >= 608 - (tx.height + 8)) {
						posY = 0;
						posX += tx.width + 8;
					}
				}
			}
		} else {
			Main.ROM.bin.data.position = t.resources[0].ofs;
			var arr:ByteThingyWhatToNameIt = Main.ROM.bin.data.readByteThingy(t.resources[0].size,false);
			var ovr:TTextureFormatOverride = tInfo.resInfo.formatOVR;
			var tx = Texture.decodeTexture(arr,t.resources[0].size,ovr);
			//console.log(dumpTextureInfo(t.ofs,t.size,0,num));
			if (tx.format > -1) {
				gfx.drawTexture(0,0,tx,ovr.forceOpacity);
			}
		}
	}
	
	// how ? 
	// TODO!
	/*static public function onBtnClick() {
		var tName = name_txt.value;
		var tTags = tags_txt.value;
		var tPath = path_txt.value;
		updateEntry(currTex,tName,tTags,tPath);
		currTex = ord;
		displayTextureInfo(ord);
	}*/
}