function drawImageData(iDat,x,y,scale) {
	var posX = x;
	var posY = y;
	var posP = 0;
	var arrP = iDat.data;
	// console.log(iDat);
	for (var iY = 0; iY < iDat.height; iY++) {
		for (var iX = 0; iX < iDat.width; iX++) {
			var base = posP * 4;
			var r = arrP[base];
			var g = arrP[base + 1];
			var b = arrP[base + 2];
			var a = arrP[base + 3];
			ctx.fillStyle = "#" + hexa(r) + hexa(g) + hexa(b) + hexa(a);
			ctx.fillRect(posX,posY,scale,scale);
			posX += scale;
			posP++;
		}
		posY += scale;
		posX = x;
	}
}

function hexa(n) {
	if (n < 16) {
		return "0" + n.toString(16);
	}
	return n.toString(16);
}