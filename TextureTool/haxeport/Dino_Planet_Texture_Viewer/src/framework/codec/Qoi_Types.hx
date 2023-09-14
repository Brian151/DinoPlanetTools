package framework.codec;
import haxe.io.Bytes;
import haxe.io.UInt8Array;

// readme and license/credits in Qoi.hx

typedef Qoi_Header = {
	magic : Int, //cons 0x716F6966,  "qoif"
	width : Int,
	height : Int,
	channels : Int, // 8-bit
	colorspace : Int
}

typedef Qoi_Image = {
	header : Qoi_Header,
	data : Bytes
}

/*
	this is an annoying one
	haxe, out of the box, has multiple things not locked-down as x-plat
	image format is one of them (iirc)
	so as not to cause any weird issues, generic image object
*/
typedef Qoi_DisplayImage = {
	width : Int,
	height : Int,
	pixels : UInt8Array
}