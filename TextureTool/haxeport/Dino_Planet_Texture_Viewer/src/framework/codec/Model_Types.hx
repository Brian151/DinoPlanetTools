package framework.codec;
import haxe.io.Bytes;

typedef T_ModelHeader = {
	PTR_texture : Int,
	PTR_vert : Int,
	PTR_face : Int,
	PTR_F3DtriOps : Int,
	UNK_0x10 : Int, // null ?
	PTR_vertGroupOffset : Int,
	PTR_vertGroup : Int,
	PTR_blendShape : Int,
	PTR_joint : Int,
	UNK_0x24 : Int, // null ?
	PTR_hitbox : Int,
	PTR_edgeVector : Int,
	UNK_0x30 : Int, // null ?
	PTR_collisionBox : Int,
	PTR_F3DDrawMode : Int,
	PTR_eyeAnim : Int,
	UNK_0x40 : Int,
	UNK_0x44 : Int,
	UNK_0x48 : Int,
	UNK_0x4c : Int,
	PTR_unk0x50 : Int,
	PTR_unk0x54 : Int,
	byteLength : Int,
	UNK_0x5c : Int,
	UNK_0x60 : Int, // 16-bit
	vertCount : Int, // 16-bit
	faceCount : Int, // 16-bit
	UNK_0x66 : Int, // null ? 16-bit
	UNK_0x68 : Int, // null ?
	F3DOpCount : Int, // 16-bit
	hitboxCount : Int, // 8-bit
	jointCount : Int, // 8-bit
	UNK_0x70 : Int, // 16-bit
	textureCount : Int, // 16-bit
	countFaceRangeWithEnvMap : Int, //8-bit
	countEFPairsInDrawMode : Int, //8-bit
	countTextureAnimations : Int, //8-bit
	UNK_0x77 : Int, // null? 8-bit
	UNK_0x78 : Int, // null?
	UNK_0x7c : Int // null
}

typedef T_ModelTextureReference = {
	UNK_0x00 : Int, //null? 16-bit
	textureID : Int, // 16-bit
	x : Int, // 8-bit
	y : Int, // 8-bit
	UNK_06 : Int, // flags? 8-bit
	UNK_07 : Int, // null? 8-bit
}

typedef T_Model = {
	datBytes : Bytes,
	header : T_ModelHeader,
	textures : Array<T_ModelTextureReference>
}