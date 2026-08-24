#version 430
//#include <required.glsl> // [HACK 4/6/2023] See SCC shader_merger.cpp
// SCC_BACKEND_SHADER_FLAGS_BEGIN__
// SCC_BACKEND_SHADER_FLAGS_END__
//SG_REFLECTION_BEGIN(200)
//attribute vec4 boneData 5
//attribute vec3 blendShape0Pos 6
//attribute vec3 blendShape0Normal 12
//attribute vec3 blendShape1Pos 7
//attribute vec3 blendShape1Normal 13
//attribute vec3 blendShape2Pos 8
//attribute vec3 blendShape2Normal 14
//attribute vec3 blendShape3Pos 9
//attribute vec3 blendShape4Pos 10
//attribute vec3 blendShape5Pos 11
//attribute vec4 position 0
//attribute vec3 normal 1
//attribute vec4 tangent 2
//attribute vec2 texture0 3
//attribute vec2 texture1 4
//attribute vec4 color 18
//attribute float edgeDist 19
//attribute float textureId 20
//attribute vec3 positionNext 15
//attribute vec3 positionPrevious 16
//attribute vec4 strandProperties 17
//output vec4 sc_FragData0 0
//sampler sampler baseTex0SmpSC 0:28
//sampler sampler baseTex1SmpSC 0:29
//sampler sampler baseTex2SmpSC 0:30
//sampler sampler baseTex3SmpSC 0:31
//sampler sampler baseTex4SmpSC 0:32
//sampler sampler baseTex5SmpSC 0:33
//sampler sampler baseTex6SmpSC 0:34
//sampler sampler baseTex7SmpSC 0:35
//sampler sampler intensityTextureSmpSC 0:36
//sampler sampler sc_OITCommonSampler 0:39
//sampler sampler sc_RayTracingHitCasterIdAndBarycentricSmpSC 0:40
//sampler sampler sc_RayTracingRayDirectionSmpSC 0:41
//sampler sampler sc_ScreenTextureSmpSC 0:43
//texture texture2D baseTex0 0:3:0:28
//texture texture2D baseTex1 0:4:0:29
//texture texture2D baseTex2 0:5:0:30
//texture texture2D baseTex3 0:6:0:31
//texture texture2D baseTex4 0:7:0:32
//texture texture2D baseTex5 0:8:0:33
//texture texture2D baseTex6 0:9:0:34
//texture texture2D baseTex7 0:10:0:35
//texture texture2D intensityTexture 0:11:0:36
//texture texture2D sc_OITAlpha0 0:14:0:39
//texture texture2D sc_OITAlpha1 0:15:0:39
//texture texture2D sc_OITDepthHigh0 0:16:0:39
//texture texture2D sc_OITDepthHigh1 0:17:0:39
//texture texture2D sc_OITDepthLow0 0:18:0:39
//texture texture2D sc_OITDepthLow1 0:19:0:39
//texture texture2D sc_OITFilteredDepthBoundsTexture 0:20:0:39
//texture texture2D sc_OITFrontDepthTexture 0:21:0:39
//texture utexture2D sc_RayTracingHitCasterIdAndBarycentric 0:22:0:40
//texture texture2D sc_RayTracingRayDirection 0:23:0:41
//texture texture2D sc_ScreenTexture 0:25:0:43
//texture texture2DArray baseTex0ArrSC 0:46:0:28
//texture texture2DArray baseTex1ArrSC 0:47:0:29
//texture texture2DArray baseTex2ArrSC 0:48:0:30
//texture texture2DArray baseTex3ArrSC 0:49:0:31
//texture texture2DArray baseTex4ArrSC 0:50:0:32
//texture texture2DArray baseTex5ArrSC 0:51:0:33
//texture texture2DArray baseTex6ArrSC 0:52:0:34
//texture texture2DArray baseTex7ArrSC 0:53:0:35
//texture texture2DArray intensityTextureArrSC 0:54:0:36
//texture texture2DArray sc_ScreenTextureArrSC 0:58:0:43
//ssbo int sc_RayTracingCasterIndexBuffer 0:0:4 {
//uint sc_RayTracingCasterTriangles 0:[1]:4
//}
//ssbo float sc_RayTracingCasterNonAnimatedVertexBuffer 0:2:4 {
//float sc_RayTracingCasterNonAnimatedVertices 0:[1]:4
//}
//ssbo float sc_RayTracingCasterVertexBuffer 0:1:4 {
//float sc_RayTracingCasterVertices 0:[1]:4
//}
//spec_const bool BLEND_MODE_AVERAGE 0 0
//spec_const bool BLEND_MODE_BRIGHT 1 0
//spec_const bool BLEND_MODE_COLOR 2 0
//spec_const bool BLEND_MODE_COLOR_BURN 3 0
//spec_const bool BLEND_MODE_COLOR_DODGE 4 0
//spec_const bool BLEND_MODE_DARKEN 5 0
//spec_const bool BLEND_MODE_DIFFERENCE 6 0
//spec_const bool BLEND_MODE_DIVIDE 7 0
//spec_const bool BLEND_MODE_DIVISION 8 0
//spec_const bool BLEND_MODE_EXCLUSION 9 0
//spec_const bool BLEND_MODE_FORGRAY 10 0
//spec_const bool BLEND_MODE_HARD_GLOW 11 0
//spec_const bool BLEND_MODE_HARD_LIGHT 12 0
//spec_const bool BLEND_MODE_HARD_MIX 13 0
//spec_const bool BLEND_MODE_HARD_PHOENIX 14 0
//spec_const bool BLEND_MODE_HARD_REFLECT 15 0
//spec_const bool BLEND_MODE_HUE 16 0
//spec_const bool BLEND_MODE_INTENSE 17 0
//spec_const bool BLEND_MODE_LIGHTEN 18 0
//spec_const bool BLEND_MODE_LINEAR_LIGHT 19 0
//spec_const bool BLEND_MODE_LUMINOSITY 20 0
//spec_const bool BLEND_MODE_NEGATION 21 0
//spec_const bool BLEND_MODE_NOTBRIGHT 22 0
//spec_const bool BLEND_MODE_OVERLAY 23 0
//spec_const bool BLEND_MODE_PIN_LIGHT 24 0
//spec_const bool BLEND_MODE_REALISTIC 25 0
//spec_const bool BLEND_MODE_SATURATION 26 0
//spec_const bool BLEND_MODE_SOFT_LIGHT 27 0
//spec_const bool BLEND_MODE_SUBTRACT 28 0
//spec_const bool BLEND_MODE_VIVID_LIGHT 29 0
//spec_const bool ENABLE_STIPPLE_PATTERN_TEST 30 0
//spec_const bool SC_USE_CLAMP_TO_BORDER_baseTex0 31 0
//spec_const bool SC_USE_CLAMP_TO_BORDER_baseTex1 32 0
//spec_const bool SC_USE_CLAMP_TO_BORDER_baseTex2 33 0
//spec_const bool SC_USE_CLAMP_TO_BORDER_baseTex3 34 0
//spec_const bool SC_USE_CLAMP_TO_BORDER_baseTex4 35 0
//spec_const bool SC_USE_CLAMP_TO_BORDER_baseTex5 36 0
//spec_const bool SC_USE_CLAMP_TO_BORDER_baseTex6 37 0
//spec_const bool SC_USE_CLAMP_TO_BORDER_baseTex7 38 0
//spec_const bool SC_USE_CLAMP_TO_BORDER_intensityTexture 39 0
//spec_const bool SC_USE_UV_MIN_MAX_baseTex0 40 0
//spec_const bool SC_USE_UV_MIN_MAX_baseTex1 41 0
//spec_const bool SC_USE_UV_MIN_MAX_baseTex2 42 0
//spec_const bool SC_USE_UV_MIN_MAX_baseTex3 43 0
//spec_const bool SC_USE_UV_MIN_MAX_baseTex4 44 0
//spec_const bool SC_USE_UV_MIN_MAX_baseTex5 45 0
//spec_const bool SC_USE_UV_MIN_MAX_baseTex6 46 0
//spec_const bool SC_USE_UV_MIN_MAX_baseTex7 47 0
//spec_const bool SC_USE_UV_MIN_MAX_intensityTexture 48 0
//spec_const bool SC_USE_UV_TRANSFORM_baseTex0 49 0
//spec_const bool SC_USE_UV_TRANSFORM_baseTex1 50 0
//spec_const bool SC_USE_UV_TRANSFORM_baseTex2 51 0
//spec_const bool SC_USE_UV_TRANSFORM_baseTex3 52 0
//spec_const bool SC_USE_UV_TRANSFORM_baseTex4 53 0
//spec_const bool SC_USE_UV_TRANSFORM_baseTex5 54 0
//spec_const bool SC_USE_UV_TRANSFORM_baseTex6 55 0
//spec_const bool SC_USE_UV_TRANSFORM_baseTex7 56 0
//spec_const bool SC_USE_UV_TRANSFORM_intensityTexture 57 0
//spec_const bool UseViewSpaceDepthVariant 58 1
//spec_const bool baseTex0HasSwappedViews 59 0
//spec_const bool baseTex1HasSwappedViews 60 0
//spec_const bool baseTex2HasSwappedViews 61 0
//spec_const bool baseTex3HasSwappedViews 62 0
//spec_const bool baseTex4HasSwappedViews 63 0
//spec_const bool baseTex5HasSwappedViews 64 0
//spec_const bool baseTex6HasSwappedViews 65 0
//spec_const bool baseTex7HasSwappedViews 66 0
//spec_const bool intensityTextureHasSwappedViews 67 0
//spec_const bool sc_BlendMode_Add 68 0
//spec_const bool sc_BlendMode_AddWithAlphaFactor 69 0
//spec_const bool sc_BlendMode_AlphaTest 70 0
//spec_const bool sc_BlendMode_AlphaToCoverage 71 0
//spec_const bool sc_BlendMode_ColoredGlass 72 0
//spec_const bool sc_BlendMode_Custom 73 0
//spec_const bool sc_BlendMode_Max 74 0
//spec_const bool sc_BlendMode_Min 75 0
//spec_const bool sc_BlendMode_Multiply 76 0
//spec_const bool sc_BlendMode_MultiplyOriginal 77 0
//spec_const bool sc_BlendMode_Normal 78 0
//spec_const bool sc_BlendMode_PremultipliedAlpha 79 0
//spec_const bool sc_BlendMode_PremultipliedAlphaAuto 80 0
//spec_const bool sc_BlendMode_PremultipliedAlphaHardware 81 0
//spec_const bool sc_BlendMode_Screen 82 0
//spec_const bool sc_DepthOnly 83 0
//spec_const bool sc_FramebufferFetch 84 0
//spec_const bool sc_MotionVectorsPass 85 0
//spec_const bool sc_OITCompositingPass 86 0
//spec_const bool sc_OITDepthBoundsPass 87 0
//spec_const bool sc_OITDepthGatherPass 88 0
//spec_const bool sc_OITDepthPrepass 89 0
//spec_const bool sc_OITFrontLayerPass 90 0
//spec_const bool sc_OITMaxLayers4Plus1 91 0
//spec_const bool sc_OITMaxLayers8 92 0
//spec_const bool sc_OITMaxLayersVisualizeLayerCount 93 0
//spec_const bool sc_OutputBounds 94 0
//spec_const bool sc_ProjectiveShadowsCaster 95 0
//spec_const bool sc_ProjectiveShadowsReceiver 96 0
//spec_const bool sc_RayTracingCasterForceOpaque 97 0
//spec_const bool sc_RenderAlphaToColor 98 0
//spec_const bool sc_ScreenTextureHasSwappedViews 99 0
//spec_const bool sc_TAAEnabled 100 0
//spec_const bool sc_VertexBlending 101 0
//spec_const bool sc_VertexBlendingUseNormals 102 0
//spec_const bool sc_Voxelization 103 0
//spec_const int SC_SOFTWARE_WRAP_MODE_U_baseTex0 104 -1
//spec_const int SC_SOFTWARE_WRAP_MODE_U_baseTex1 105 -1
//spec_const int SC_SOFTWARE_WRAP_MODE_U_baseTex2 106 -1
//spec_const int SC_SOFTWARE_WRAP_MODE_U_baseTex3 107 -1
//spec_const int SC_SOFTWARE_WRAP_MODE_U_baseTex4 108 -1
//spec_const int SC_SOFTWARE_WRAP_MODE_U_baseTex5 109 -1
//spec_const int SC_SOFTWARE_WRAP_MODE_U_baseTex6 110 -1
//spec_const int SC_SOFTWARE_WRAP_MODE_U_baseTex7 111 -1
//spec_const int SC_SOFTWARE_WRAP_MODE_U_intensityTexture 112 -1
//spec_const int SC_SOFTWARE_WRAP_MODE_V_baseTex0 113 -1
//spec_const int SC_SOFTWARE_WRAP_MODE_V_baseTex1 114 -1
//spec_const int SC_SOFTWARE_WRAP_MODE_V_baseTex2 115 -1
//spec_const int SC_SOFTWARE_WRAP_MODE_V_baseTex3 116 -1
//spec_const int SC_SOFTWARE_WRAP_MODE_V_baseTex4 117 -1
//spec_const int SC_SOFTWARE_WRAP_MODE_V_baseTex5 118 -1
//spec_const int SC_SOFTWARE_WRAP_MODE_V_baseTex6 119 -1
//spec_const int SC_SOFTWARE_WRAP_MODE_V_baseTex7 120 -1
//spec_const int SC_SOFTWARE_WRAP_MODE_V_intensityTexture 121 -1
//spec_const int baseTex0Layout 122 0
//spec_const int baseTex1Layout 123 0
//spec_const int baseTex2Layout 124 0
//spec_const int baseTex3Layout 125 0
//spec_const int baseTex4Layout 126 0
//spec_const int baseTex5Layout 127 0
//spec_const int baseTex6Layout 128 0
//spec_const int baseTex7Layout 129 0
//spec_const int intensityTextureLayout 130 0
//spec_const int sc_DepthBufferMode 131 0
//spec_const int sc_RenderingSpace 132 -1
//spec_const int sc_ScreenTextureLayout 133 0
//spec_const int sc_ShaderCacheConstant 134 0
//spec_const int sc_SkinBonesCount 135 0
//spec_const int sc_StereoRenderingMode 136 0
//spec_const int sc_StereoRendering_IsClipDistanceEnabled 137 0
//spec_const int sc_StereoViewID 138 0
//SG_REFLECTION_END
#define sc_StereoRendering_Disabled 0
#define sc_StereoRendering_InstancedClipped 1
#define sc_StereoRendering_Multiview 2
#ifdef VERTEX_SHADER
#define scOutPos(clipPosition) gl_Position=clipPosition
#define MAIN main
#endif
#ifdef SC_ENABLE_INSTANCED_RENDERING
#ifndef sc_EnableInstancing
#define sc_EnableInstancing 1
#endif
#endif
#define mod(x,y) (x-y*floor((x+1e-6)/y))
#if __VERSION__<300
#define isinf(x) (x!=0.0&&x*2.0==x ? true : false)
#define isnan(x) (x>0.0||x<0.0||x==0.0 ? false : true)
#define inverse(M) M
#endif
#ifdef sc_EnableStereoClipDistance
#if defined(GL_APPLE_clip_distance)
#extension GL_APPLE_clip_distance : require
#elif defined(GL_EXT_clip_cull_distance)
#extension GL_EXT_clip_cull_distance : require
#else
#error Clip distance is requested but not supported by this device.
#endif
#endif
#ifdef sc_EnableMultiviewStereoRendering
#define sc_StereoRenderingMode sc_StereoRendering_Multiview
#define sc_NumStereoViews 2
#extension GL_OVR_multiview2 : require
#ifdef VERTEX_SHADER
#ifdef sc_EnableInstancingFallback
#define sc_GlobalInstanceID (sc_FallbackInstanceID*2+gl_InstanceID)
#else
#define sc_GlobalInstanceID gl_InstanceID
#endif
#define sc_LocalInstanceID sc_GlobalInstanceID
#define sc_StereoViewID int(gl_ViewID_OVR)
#endif
#elif defined(sc_EnableInstancedClippedStereoRendering)
#ifndef sc_EnableInstancing
#error Instanced-clipped stereo rendering requires enabled instancing.
#endif
#ifndef sc_EnableStereoClipDistance
#define sc_StereoRendering_IsClipDistanceEnabled 0
#else
#define sc_StereoRendering_IsClipDistanceEnabled 1
#endif
#define sc_StereoRenderingMode sc_StereoRendering_InstancedClipped
#define sc_NumStereoClipPlanes 1
#define sc_NumStereoViews 2
#ifdef VERTEX_SHADER
#ifdef sc_EnableInstancingFallback
#define sc_GlobalInstanceID (sc_FallbackInstanceID*2+gl_InstanceID)
#else
#define sc_GlobalInstanceID gl_InstanceID
#endif
#define sc_LocalInstanceID (sc_GlobalInstanceID/2)
#define sc_StereoViewID (sc_GlobalInstanceID%2)
#endif
#else
#define sc_StereoRenderingMode sc_StereoRendering_Disabled
#endif
#if defined(sc_EnableInstancing)&&defined(VERTEX_SHADER)
#ifdef GL_ARB_draw_instanced
#extension GL_ARB_draw_instanced : require
#define gl_InstanceID gl_InstanceIDARB
#endif
#ifdef GL_EXT_draw_instanced
#extension GL_EXT_draw_instanced : require
#define gl_InstanceID gl_InstanceIDEXT
#endif
#ifndef sc_InstanceID
#define sc_InstanceID gl_InstanceID
#endif
#ifndef sc_GlobalInstanceID
#ifdef sc_EnableInstancingFallback
#define sc_GlobalInstanceID (sc_FallbackInstanceID)
#define sc_LocalInstanceID (sc_FallbackInstanceID)
#else
#define sc_GlobalInstanceID gl_InstanceID
#define sc_LocalInstanceID gl_InstanceID
#endif
#endif
#endif
#ifndef GL_ES
#extension GL_EXT_gpu_shader4 : enable
#extension GL_ARB_shader_texture_lod : enable
#define precision
#define lowp
#define mediump
#define highp
#define sc_FragmentPrecision
#endif
#ifdef GL_ES
#ifdef sc_FramebufferFetch
#if defined(GL_EXT_shader_framebuffer_fetch)
#extension GL_EXT_shader_framebuffer_fetch : require
#elif defined(GL_ARM_shader_framebuffer_fetch)
#extension GL_ARM_shader_framebuffer_fetch : require
#else
#error Framebuffer fetch is requested but not supported by this device.
#endif
#endif
#ifdef GL_FRAGMENT_PRECISION_HIGH
#define sc_FragmentPrecision highp
#else
#define sc_FragmentPrecision mediump
#endif
#ifdef FRAGMENT_SHADER
precision highp int;
precision highp float;
#endif
#endif
#ifdef VERTEX_SHADER
#ifdef sc_EnableMultiviewStereoRendering
layout(num_views=sc_NumStereoViews) in;
#endif
#endif
#define SC_INT_FALLBACK_FLOAT int
#define SC_INTERPOLATION_FLAT flat
#define SC_INTERPOLATION_CENTROID centroid
#ifndef sc_NumStereoViews
#define sc_NumStereoViews 1
#endif
#ifndef sc_TextureRenderingLayout_Regular
#define sc_TextureRenderingLayout_Regular 0
#define sc_TextureRenderingLayout_StereoInstancedClipped 1
#define sc_TextureRenderingLayout_StereoMultiview 2
#endif
#if defined VERTEX_SHADER
struct sc_Vertex_t
{
vec4 position;
vec3 normal;
vec3 tangent;
vec2 texture0;
vec2 texture1;
};
#ifndef sc_StereoRenderingMode
#define sc_StereoRenderingMode 0
#endif
#ifndef sc_StereoViewID
#define sc_StereoViewID 0
#endif
#ifndef sc_RenderingSpace
#define sc_RenderingSpace -1
#endif
#ifndef sc_TAAEnabled
#define sc_TAAEnabled 0
#elif sc_TAAEnabled==1
#undef sc_TAAEnabled
#define sc_TAAEnabled 1
#endif
#ifndef sc_MotionVectorsPass
#define sc_MotionVectorsPass 0
#elif sc_MotionVectorsPass==1
#undef sc_MotionVectorsPass
#define sc_MotionVectorsPass 1
#endif
#ifndef sc_NumStereoViews
#define sc_NumStereoViews 1
#endif
#ifndef sc_StereoRendering_IsClipDistanceEnabled
#define sc_StereoRendering_IsClipDistanceEnabled 0
#endif
#ifndef sc_ShaderCacheConstant
#define sc_ShaderCacheConstant 0
#endif
#ifndef sc_SkinBonesCount
#define sc_SkinBonesCount 0
#endif
#ifndef sc_VertexBlending
#define sc_VertexBlending 0
#elif sc_VertexBlending==1
#undef sc_VertexBlending
#define sc_VertexBlending 1
#endif
#ifndef sc_VertexBlendingUseNormals
#define sc_VertexBlendingUseNormals 0
#elif sc_VertexBlendingUseNormals==1
#undef sc_VertexBlendingUseNormals
#define sc_VertexBlendingUseNormals 1
#endif
#ifndef sc_DepthBufferMode
#define sc_DepthBufferMode 0
#endif
struct sc_Camera_t
{
vec3 position;
float aspect;
vec2 clipPlanes;
};
#ifndef sc_Voxelization
#define sc_Voxelization 0
#elif sc_Voxelization==1
#undef sc_Voxelization
#define sc_Voxelization 1
#endif
#ifndef UseViewSpaceDepthVariant
#define UseViewSpaceDepthVariant 1
#elif UseViewSpaceDepthVariant==1
#undef UseViewSpaceDepthVariant
#define UseViewSpaceDepthVariant 1
#endif
#ifndef sc_OITDepthGatherPass
#define sc_OITDepthGatherPass 0
#elif sc_OITDepthGatherPass==1
#undef sc_OITDepthGatherPass
#define sc_OITDepthGatherPass 1
#endif
#ifndef sc_OITCompositingPass
#define sc_OITCompositingPass 0
#elif sc_OITCompositingPass==1
#undef sc_OITCompositingPass
#define sc_OITCompositingPass 1
#endif
#ifndef sc_OITDepthBoundsPass
#define sc_OITDepthBoundsPass 0
#elif sc_OITDepthBoundsPass==1
#undef sc_OITDepthBoundsPass
#define sc_OITDepthBoundsPass 1
#endif
#ifndef sc_ProjectiveShadowsReceiver
#define sc_ProjectiveShadowsReceiver 0
#elif sc_ProjectiveShadowsReceiver==1
#undef sc_ProjectiveShadowsReceiver
#define sc_ProjectiveShadowsReceiver 1
#endif
#ifndef sc_OutputBounds
#define sc_OutputBounds 0
#elif sc_OutputBounds==1
#undef sc_OutputBounds
#define sc_OutputBounds 1
#endif
layout(binding=0,std430) readonly buffer sc_RayTracingCasterIndexBuffer
{
uint sc_RayTracingCasterTriangles[1];
} sc_RayTracingCasterIndexBuffer_obj;
layout(binding=1,std430) readonly buffer sc_RayTracingCasterVertexBuffer
{
float sc_RayTracingCasterVertices[1];
} sc_RayTracingCasterVertexBuffer_obj;
layout(binding=2,std430) readonly buffer sc_RayTracingCasterNonAnimatedVertexBuffer
{
float sc_RayTracingCasterNonAnimatedVertices[1];
} sc_RayTracingCasterNonAnimatedVertexBuffer_obj;
uniform mat4 sc_ModelMatrix;
uniform mat4 sc_ProjectorMatrix;
uniform vec2 sc_TAAJitterOffset;
uniform mat4 sc_ViewProjectionMatrixArray[sc_NumStereoViews];
uniform mat4 sc_PrevFrameViewProjectionMatrixArray[sc_NumStereoViews];
uniform mat4 sc_PrevFrameModelMatrix;
uniform mat4 sc_ModelMatrixInverse;
uniform int sc_FallbackInstanceID;
uniform vec4 sc_StereoClipPlanes[sc_NumStereoViews];
uniform vec4 sc_UniformConstants;
uniform vec4 sc_BoneMatrices[(sc_SkinBonesCount*3)+1];
uniform mat3 sc_SkinBonesNormalMatrices[sc_SkinBonesCount+1];
uniform vec4 weights0;
uniform vec4 weights1;
uniform mat4 sc_ProjectionMatrixInverseArray[sc_NumStereoViews];
uniform mat4 sc_ViewMatrixArray[sc_NumStereoViews];
uniform mat4 sc_ModelViewMatrixArray[sc_NumStereoViews];
uniform mat4 sc_ProjectionMatrixArray[sc_NumStereoViews];
uniform sc_Camera_t sc_Camera;
uniform vec4 voxelization_params_0;
uniform vec4 voxelization_params_frustum_lrbt;
uniform vec4 voxelization_params_frustum_nf;
uniform vec3 voxelization_params_camera_pos;
uniform mat4 sc_ModelMatrixVoxelization;
uniform mat3 sc_NormalMatrix;
uniform int PreviewEnabled;
uniform uvec4 sc_RayTracingCasterConfiguration;
uniform float depthRef;
out vec4 varPosAndMotion;
out vec4 varNormalAndMotion;
out float varClipDistance;
flat out int varStereoViewID;
in vec4 boneData;
in vec3 blendShape0Pos;
in vec3 blendShape0Normal;
in vec3 blendShape1Pos;
in vec3 blendShape1Normal;
in vec3 blendShape2Pos;
in vec3 blendShape2Normal;
in vec3 blendShape3Pos;
in vec3 blendShape4Pos;
in vec3 blendShape5Pos;
in vec4 position;
in vec3 normal;
in vec4 tangent;
in vec2 texture0;
in vec2 texture1;
out vec4 varScreenPos;
out vec4 varTex01;
out vec4 varTangent;
out vec4 varColor;
in vec4 color;
out float varViewSpaceDepth;
out vec2 varShadowTex;
out vec4 PreviewVertexColor;
out float PreviewVertexSaved;
in float edgeDist;
in float textureId;
out float Interpolator_N2_float_edgeDist;
out float Interpolator_N9_float_textureId;
out vec2 varScreenTexturePos;
in vec3 positionNext;
in vec3 positionPrevious;
in vec4 strandProperties;
void sc_SetClipDistancePlatform(float dstClipDistance)
{
#if sc_StereoRenderingMode==sc_StereoRendering_InstancedClipped&&sc_StereoRendering_IsClipDistanceEnabled
gl_ClipDistance[0]=dstClipDistance;
#endif
}
void sc_SetClipDistance(float dstClipDistance)
{
#if (sc_StereoRendering_IsClipDistanceEnabled==1)
{
sc_SetClipDistancePlatform(dstClipDistance);
}
#else
{
varClipDistance=dstClipDistance;
}
#endif
}
void sc_SetClipDistance(vec4 clipPosition)
{
#if (sc_StereoRenderingMode==1)
{
sc_SetClipDistance(dot(clipPosition,sc_StereoClipPlanes[sc_StereoViewID]));
}
#endif
}
void sc_SetClipPosition(vec4 clipPosition)
{
#if (sc_ShaderCacheConstant!=0)
{
clipPosition.x+=(sc_UniformConstants.x*float(sc_ShaderCacheConstant));
}
#endif
#if (sc_StereoRenderingMode>0)
{
varStereoViewID=sc_StereoViewID;
}
#endif
sc_SetClipDistance(clipPosition);
gl_Position=clipPosition;
}
int sc_GetLocalInstanceIDInternal(int id)
{
#ifdef sc_LocalInstanceID
return sc_LocalInstanceID;
#else
return 0;
#endif
}
void blendTargetShapeWithNormal(inout sc_Vertex_t v,vec3 position_1,vec3 normal_1,float weight)
{
vec3 l9_0=v.position.xyz+(position_1*weight);
v=sc_Vertex_t(vec4(l9_0.x,l9_0.y,l9_0.z,v.position.w),v.normal,v.tangent,v.texture0,v.texture1);
v.normal+=(normal_1*weight);
}
void sc_BlendVertex(inout sc_Vertex_t v)
{
#if (sc_VertexBlending)
{
#if (sc_VertexBlendingUseNormals)
{
blendTargetShapeWithNormal(v,blendShape0Pos,blendShape0Normal,weights0.x);
blendTargetShapeWithNormal(v,blendShape1Pos,blendShape1Normal,weights0.y);
blendTargetShapeWithNormal(v,blendShape2Pos,blendShape2Normal,weights0.z);
}
#else
{
vec3 l9_0=v.position.xyz+(blendShape0Pos*weights0.x);
v=sc_Vertex_t(vec4(l9_0.x,l9_0.y,l9_0.z,v.position.w),v.normal,v.tangent,v.texture0,v.texture1);
vec3 l9_1=v.position.xyz+(blendShape1Pos*weights0.y);
v=sc_Vertex_t(vec4(l9_1.x,l9_1.y,l9_1.z,v.position.w),v.normal,v.tangent,v.texture0,v.texture1);
vec3 l9_2=v.position.xyz+(blendShape2Pos*weights0.z);
v=sc_Vertex_t(vec4(l9_2.x,l9_2.y,l9_2.z,v.position.w),v.normal,v.tangent,v.texture0,v.texture1);
vec3 l9_3=v.position.xyz+(blendShape3Pos*weights0.w);
v=sc_Vertex_t(vec4(l9_3.x,l9_3.y,l9_3.z,v.position.w),v.normal,v.tangent,v.texture0,v.texture1);
vec3 l9_4=v.position.xyz+(blendShape4Pos*weights1.x);
v=sc_Vertex_t(vec4(l9_4.x,l9_4.y,l9_4.z,v.position.w),v.normal,v.tangent,v.texture0,v.texture1);
vec3 l9_5=v.position.xyz+(blendShape5Pos*weights1.y);
v=sc_Vertex_t(vec4(l9_5.x,l9_5.y,l9_5.z,v.position.w),v.normal,v.tangent,v.texture0,v.texture1);
}
#endif
}
#endif
}
vec4 sc_GetBoneWeights()
{
vec4 l9_0;
#if (sc_SkinBonesCount>0)
{
vec4 l9_1=vec4(1.0,fract(boneData.yzw));
vec4 l9_2=l9_1;
l9_2.x=1.0-dot(l9_1.yzw,vec3(1.0));
l9_0=l9_2;
}
#else
{
l9_0=vec4(0.0);
}
#endif
return l9_0;
}
void sc_GetBoneMatrix(int index,out vec4 m0,out vec4 m1,out vec4 m2)
{
int l9_0=3*index;
m0=sc_BoneMatrices[l9_0];
m1=sc_BoneMatrices[l9_0+1];
m2=sc_BoneMatrices[l9_0+2];
}
vec3 skinVertexPosition(int i,vec4 v)
{
vec3 l9_0;
#if (sc_SkinBonesCount>0)
{
vec4 param_1;
vec4 param_2;
vec4 param_3;
sc_GetBoneMatrix(i,param_1,param_2,param_3);
l9_0=vec3(dot(v,param_1),dot(v,param_2),dot(v,param_3));
}
#else
{
l9_0=v.xyz;
}
#endif
return l9_0;
}
void sc_SkinVertex(inout sc_Vertex_t v)
{
#if (sc_SkinBonesCount>0)
{
vec4 l9_0=sc_GetBoneWeights();
int l9_1=int(boneData.x);
int l9_2=int(boneData.y);
int l9_3=int(boneData.z);
int l9_4=int(boneData.w);
float l9_5=l9_0.x;
float l9_6=l9_0.y;
float l9_7=l9_0.z;
float l9_8=l9_0.w;
vec3 l9_9=(((skinVertexPosition(l9_1,v.position)*l9_5)+(skinVertexPosition(l9_2,v.position)*l9_6))+(skinVertexPosition(l9_3,v.position)*l9_7))+(skinVertexPosition(l9_4,v.position)*l9_8);
v.position=vec4(l9_9.x,l9_9.y,l9_9.z,v.position.w);
v.normal=((((sc_SkinBonesNormalMatrices[l9_1]*v.normal)*l9_5)+((sc_SkinBonesNormalMatrices[l9_2]*v.normal)*l9_6))+((sc_SkinBonesNormalMatrices[l9_3]*v.normal)*l9_7))+((sc_SkinBonesNormalMatrices[l9_4]*v.normal)*l9_8);
v.tangent=((((sc_SkinBonesNormalMatrices[l9_1]*v.tangent)*l9_5)+((sc_SkinBonesNormalMatrices[l9_2]*v.tangent)*l9_6))+((sc_SkinBonesNormalMatrices[l9_3]*v.tangent)*l9_7))+((sc_SkinBonesNormalMatrices[l9_4]*v.tangent)*l9_8);
}
#endif
}
int sc_GetStereoViewIndex()
{
int l9_0;
#if (sc_StereoRenderingMode==0)
{
l9_0=0;
}
#else
{
l9_0=sc_StereoViewID;
}
#endif
return l9_0;
}
mat4 createVoxelOrthoMatrix(float left,float right,float bottom,float top,float near,float far)
{
return mat4(vec4(2.0/(right-left),0.0,0.0,(-(right+left))/(right-left)),vec4(0.0,2.0/(top-bottom),0.0,(-(top+bottom))/(top-bottom)),vec4(0.0,0.0,(-2.0)/(far-near),(-(far+near))/(far-near)),vec4(0.0,0.0,0.0,1.0));
}
void main()
{
if (sc_RayTracingCasterConfiguration.x!=0u)
{
sc_SetClipPosition(vec4(position.xy,depthRef+(1e-10*position.z),1.0+(1e-10*position.w)));
return;
}
PreviewVertexColor=vec4(0.5);
PreviewVertexSaved=0.0;
sc_Vertex_t l9_0=sc_Vertex_t(position,normal,tangent.xyz,texture0,texture1);
sc_BlendVertex(l9_0);
sc_SkinVertex(l9_0);
#if (sc_RenderingSpace==3)
{
varPosAndMotion=vec4(vec3(0.0).x,vec3(0.0).y,vec3(0.0).z,varPosAndMotion.w);
varNormalAndMotion=vec4(l9_0.normal.x,l9_0.normal.y,l9_0.normal.z,varNormalAndMotion.w);
varTangent=vec4(l9_0.tangent.x,l9_0.tangent.y,l9_0.tangent.z,varTangent.w);
}
#else
{
#if (sc_RenderingSpace==4)
{
varPosAndMotion=vec4(vec3(0.0).x,vec3(0.0).y,vec3(0.0).z,varPosAndMotion.w);
varNormalAndMotion=vec4(l9_0.normal.x,l9_0.normal.y,l9_0.normal.z,varNormalAndMotion.w);
varTangent=vec4(l9_0.tangent.x,l9_0.tangent.y,l9_0.tangent.z,varTangent.w);
}
#else
{
#if (sc_RenderingSpace==2)
{
varPosAndMotion=vec4(l9_0.position.x,l9_0.position.y,l9_0.position.z,varPosAndMotion.w);
varNormalAndMotion=vec4(l9_0.normal.x,l9_0.normal.y,l9_0.normal.z,varNormalAndMotion.w);
varTangent=vec4(l9_0.tangent.x,l9_0.tangent.y,l9_0.tangent.z,varTangent.w);
}
#else
{
#if (sc_RenderingSpace==1)
{
vec4 l9_1=sc_ModelMatrix*l9_0.position;
varPosAndMotion=vec4(l9_1.x,l9_1.y,l9_1.z,varPosAndMotion.w);
vec3 l9_2=sc_NormalMatrix*l9_0.normal;
varNormalAndMotion=vec4(l9_2.x,l9_2.y,l9_2.z,varNormalAndMotion.w);
vec3 l9_3=sc_NormalMatrix*l9_0.tangent;
varTangent=vec4(l9_3.x,l9_3.y,l9_3.z,varTangent.w);
}
#endif
}
#endif
}
#endif
}
#endif
bool l9_4=PreviewEnabled==1;
vec2 l9_5;
if (l9_4)
{
vec2 l9_6=l9_0.texture0;
l9_6.x=1.0-l9_0.texture0.x;
l9_5=l9_6;
}
else
{
l9_5=l9_0.texture0;
}
varColor=color;
vec3 l9_7;
vec3 l9_8;
vec3 l9_9;
if (l9_4)
{
l9_9=varTangent.xyz;
l9_8=varNormalAndMotion.xyz;
l9_7=varPosAndMotion.xyz;
}
else
{
l9_9=varTangent.xyz;
l9_8=varNormalAndMotion.xyz;
l9_7=varPosAndMotion.xyz;
}
varPosAndMotion=vec4(l9_7.x,l9_7.y,l9_7.z,varPosAndMotion.w);
vec3 l9_10=normalize(l9_8);
varNormalAndMotion=vec4(l9_10.x,l9_10.y,l9_10.z,varNormalAndMotion.w);
vec3 l9_11=normalize(l9_9);
varTangent=vec4(l9_11.x,l9_11.y,l9_11.z,varTangent.w);
varTangent.w=tangent.w;
#if (UseViewSpaceDepthVariant&&((sc_OITDepthGatherPass||sc_OITCompositingPass)||sc_OITDepthBoundsPass))
{
vec4 l9_12;
#if (sc_RenderingSpace==3)
{
l9_12=sc_ProjectionMatrixInverseArray[sc_GetStereoViewIndex()]*l9_0.position;
}
#else
{
vec4 l9_13;
#if (sc_RenderingSpace==2)
{
l9_13=sc_ViewMatrixArray[sc_GetStereoViewIndex()]*l9_0.position;
}
#else
{
vec4 l9_14;
#if (sc_RenderingSpace==1)
{
l9_14=sc_ModelViewMatrixArray[sc_GetStereoViewIndex()]*l9_0.position;
}
#else
{
l9_14=l9_0.position;
}
#endif
l9_13=l9_14;
}
#endif
l9_12=l9_13;
}
#endif
varViewSpaceDepth=-l9_12.z;
}
#endif
vec4 l9_15;
#if (sc_RenderingSpace==3)
{
l9_15=l9_0.position;
}
#else
{
vec4 l9_16;
#if (sc_RenderingSpace==4)
{
l9_16=(sc_ModelViewMatrixArray[sc_GetStereoViewIndex()]*l9_0.position)*vec4(1.0/sc_Camera.aspect,1.0,1.0,1.0);
}
#else
{
vec4 l9_17;
#if (sc_RenderingSpace==2)
{
l9_17=sc_ViewProjectionMatrixArray[sc_GetStereoViewIndex()]*vec4(varPosAndMotion.xyz,1.0);
}
#else
{
vec4 l9_18;
#if (sc_RenderingSpace==1)
{
l9_18=sc_ViewProjectionMatrixArray[sc_GetStereoViewIndex()]*vec4(varPosAndMotion.xyz,1.0);
}
#else
{
l9_18=vec4(0.0);
}
#endif
l9_17=l9_18;
}
#endif
l9_16=l9_17;
}
#endif
l9_15=l9_16;
}
#endif
varTex01=vec4(l9_5,l9_0.texture1);
#if (sc_ProjectiveShadowsReceiver)
{
vec4 l9_19;
#if (sc_RenderingSpace==1)
{
l9_19=sc_ModelMatrix*l9_0.position;
}
#else
{
l9_19=l9_0.position;
}
#endif
vec4 l9_20=sc_ProjectorMatrix*l9_19;
varShadowTex=((l9_20.xy/vec2(l9_20.w))*0.5)+vec2(0.5);
}
#endif
vec4 l9_21;
#if (sc_DepthBufferMode==1)
{
vec4 l9_22;
if (sc_ProjectionMatrixArray[sc_GetStereoViewIndex()][2].w!=0.0)
{
vec4 l9_23=l9_15;
l9_23.z=((log2(max(sc_Camera.clipPlanes.x,1.0+l9_15.w))*(2.0/log2(sc_Camera.clipPlanes.y+1.0)))-1.0)*l9_15.w;
l9_22=l9_23;
}
else
{
l9_22=l9_15;
}
l9_21=l9_22;
}
#else
{
l9_21=l9_15;
}
#endif
vec4 l9_24;
#if (sc_TAAEnabled)
{
vec2 l9_25=l9_21.xy+(sc_TAAJitterOffset*l9_21.w);
l9_24=vec4(l9_25.x,l9_25.y,l9_21.z,l9_21.w);
}
#else
{
l9_24=l9_21;
}
#endif
sc_SetClipPosition(l9_24);
#if (sc_Voxelization)
{
sc_Vertex_t l9_26=sc_Vertex_t(l9_0.position,l9_0.normal,l9_0.tangent,l9_5,l9_0.texture1);
sc_BlendVertex(l9_26);
sc_SkinVertex(l9_26);
int l9_27=sc_GetLocalInstanceIDInternal(sc_FallbackInstanceID);
int l9_28=int(voxelization_params_0.w);
vec4 l9_29=createVoxelOrthoMatrix(voxelization_params_frustum_lrbt.x,voxelization_params_frustum_lrbt.y,voxelization_params_frustum_lrbt.z,voxelization_params_frustum_lrbt.w,voxelization_params_frustum_nf.x,voxelization_params_frustum_nf.y)*vec4(((sc_ModelMatrixVoxelization*l9_26.position).xyz+vec3(float(l9_27%l9_28)*voxelization_params_0.y,float(l9_27/l9_28)*voxelization_params_0.y,(float(l9_27)*(voxelization_params_0.y/voxelization_params_0.z))+voxelization_params_frustum_nf.x))-voxelization_params_camera_pos,1.0);
l9_29.w=1.0;
varScreenPos=l9_29;
sc_SetClipPosition(l9_29*1.0);
}
#else
{
#if (sc_OutputBounds)
{
sc_Vertex_t l9_30=sc_Vertex_t(l9_0.position,l9_0.normal,l9_0.tangent,l9_5,l9_0.texture1);
sc_BlendVertex(l9_30);
sc_SkinVertex(l9_30);
vec2 l9_31=((l9_30.position.xy/vec2(l9_30.position.w))*0.5)+vec2(0.5);
varTex01=vec4(l9_31.x,l9_31.y,varTex01.z,varTex01.w);
vec4 l9_32=sc_ModelMatrixVoxelization*l9_30.position;
vec3 l9_33=l9_32.xyz-voxelization_params_camera_pos;
varPosAndMotion=vec4(l9_33.x,l9_33.y,l9_33.z,varPosAndMotion.w);
vec3 l9_34=normalize(l9_30.normal);
varNormalAndMotion=vec4(l9_34.x,l9_34.y,l9_34.z,varNormalAndMotion.w);
vec4 l9_35=createVoxelOrthoMatrix(voxelization_params_frustum_lrbt.x,voxelization_params_frustum_lrbt.y,voxelization_params_frustum_lrbt.z,voxelization_params_frustum_lrbt.w,voxelization_params_frustum_nf.x,voxelization_params_frustum_nf.y)*vec4(l9_33.x,l9_33.y,l9_33.z,l9_32.w);
vec4 l9_36=vec4(l9_35.x,l9_35.y,l9_35.z,vec4(0.0).w);
l9_36.w=1.0;
varScreenPos=l9_36;
sc_SetClipPosition(l9_36*1.0);
}
#endif
}
#endif
Interpolator_N2_float_edgeDist=edgeDist;
Interpolator_N9_float_textureId=textureId;
vec4 l9_37=varPosAndMotion;
#if (sc_MotionVectorsPass)
{
vec4 l9_38=vec4(l9_37.xyz,1.0);
#if (sc_MotionVectorsPass)
{
vec4 l9_39=sc_ViewProjectionMatrixArray[sc_GetStereoViewIndex()]*l9_38;
vec4 l9_40=sc_PrevFrameViewProjectionMatrixArray[sc_GetStereoViewIndex()]*vec4(((sc_PrevFrameModelMatrix*sc_ModelMatrixInverse)*l9_38).xyz,1.0);
vec2 l9_41=((l9_39.xy/vec2(l9_39.w)).xy-(l9_40.xy/vec2(l9_40.w)).xy)*0.5;
varPosAndMotion.w=l9_41.x;
varNormalAndMotion.w=l9_41.y;
}
#endif
}
#endif
}
#elif defined FRAGMENT_SHADER // #if defined VERTEX_SHADER
#ifndef sc_FramebufferFetch
#define sc_FramebufferFetch 0
#elif sc_FramebufferFetch==1
#undef sc_FramebufferFetch
#define sc_FramebufferFetch 1
#endif
struct sc_RayTracingHitPayload
{
vec3 viewDirWS;
vec3 positionWS;
vec3 normalWS;
vec4 tangentWS;
vec4 color;
vec2 uv0;
vec2 uv1;
vec2 uv2;
vec2 uv3;
uvec2 id;
};
#ifndef sc_StereoRenderingMode
#define sc_StereoRenderingMode 0
#endif
#ifndef sc_ScreenTextureHasSwappedViews
#define sc_ScreenTextureHasSwappedViews 0
#elif sc_ScreenTextureHasSwappedViews==1
#undef sc_ScreenTextureHasSwappedViews
#define sc_ScreenTextureHasSwappedViews 1
#endif
#ifndef sc_ScreenTextureLayout
#define sc_ScreenTextureLayout 0
#endif
#ifndef sc_BlendMode_Normal
#define sc_BlendMode_Normal 0
#elif sc_BlendMode_Normal==1
#undef sc_BlendMode_Normal
#define sc_BlendMode_Normal 1
#endif
#ifndef sc_BlendMode_AlphaToCoverage
#define sc_BlendMode_AlphaToCoverage 0
#elif sc_BlendMode_AlphaToCoverage==1
#undef sc_BlendMode_AlphaToCoverage
#define sc_BlendMode_AlphaToCoverage 1
#endif
#ifndef sc_BlendMode_PremultipliedAlphaHardware
#define sc_BlendMode_PremultipliedAlphaHardware 0
#elif sc_BlendMode_PremultipliedAlphaHardware==1
#undef sc_BlendMode_PremultipliedAlphaHardware
#define sc_BlendMode_PremultipliedAlphaHardware 1
#endif
#ifndef sc_BlendMode_PremultipliedAlphaAuto
#define sc_BlendMode_PremultipliedAlphaAuto 0
#elif sc_BlendMode_PremultipliedAlphaAuto==1
#undef sc_BlendMode_PremultipliedAlphaAuto
#define sc_BlendMode_PremultipliedAlphaAuto 1
#endif
#ifndef sc_BlendMode_PremultipliedAlpha
#define sc_BlendMode_PremultipliedAlpha 0
#elif sc_BlendMode_PremultipliedAlpha==1
#undef sc_BlendMode_PremultipliedAlpha
#define sc_BlendMode_PremultipliedAlpha 1
#endif
#ifndef sc_BlendMode_AddWithAlphaFactor
#define sc_BlendMode_AddWithAlphaFactor 0
#elif sc_BlendMode_AddWithAlphaFactor==1
#undef sc_BlendMode_AddWithAlphaFactor
#define sc_BlendMode_AddWithAlphaFactor 1
#endif
#ifndef sc_BlendMode_AlphaTest
#define sc_BlendMode_AlphaTest 0
#elif sc_BlendMode_AlphaTest==1
#undef sc_BlendMode_AlphaTest
#define sc_BlendMode_AlphaTest 1
#endif
#ifndef sc_BlendMode_Multiply
#define sc_BlendMode_Multiply 0
#elif sc_BlendMode_Multiply==1
#undef sc_BlendMode_Multiply
#define sc_BlendMode_Multiply 1
#endif
#ifndef sc_BlendMode_MultiplyOriginal
#define sc_BlendMode_MultiplyOriginal 0
#elif sc_BlendMode_MultiplyOriginal==1
#undef sc_BlendMode_MultiplyOriginal
#define sc_BlendMode_MultiplyOriginal 1
#endif
#ifndef sc_BlendMode_ColoredGlass
#define sc_BlendMode_ColoredGlass 0
#elif sc_BlendMode_ColoredGlass==1
#undef sc_BlendMode_ColoredGlass
#define sc_BlendMode_ColoredGlass 1
#endif
#ifndef sc_BlendMode_Add
#define sc_BlendMode_Add 0
#elif sc_BlendMode_Add==1
#undef sc_BlendMode_Add
#define sc_BlendMode_Add 1
#endif
#ifndef sc_BlendMode_Screen
#define sc_BlendMode_Screen 0
#elif sc_BlendMode_Screen==1
#undef sc_BlendMode_Screen
#define sc_BlendMode_Screen 1
#endif
#ifndef sc_BlendMode_Min
#define sc_BlendMode_Min 0
#elif sc_BlendMode_Min==1
#undef sc_BlendMode_Min
#define sc_BlendMode_Min 1
#endif
#ifndef sc_BlendMode_Max
#define sc_BlendMode_Max 0
#elif sc_BlendMode_Max==1
#undef sc_BlendMode_Max
#define sc_BlendMode_Max 1
#endif
#ifndef sc_MotionVectorsPass
#define sc_MotionVectorsPass 0
#elif sc_MotionVectorsPass==1
#undef sc_MotionVectorsPass
#define sc_MotionVectorsPass 1
#endif
#ifndef sc_StereoRendering_IsClipDistanceEnabled
#define sc_StereoRendering_IsClipDistanceEnabled 0
#endif
#ifndef sc_ShaderCacheConstant
#define sc_ShaderCacheConstant 0
#endif
#ifndef sc_FramebufferFetch
#define sc_FramebufferFetch 0
#elif sc_FramebufferFetch==1
#undef sc_FramebufferFetch
#define sc_FramebufferFetch 1
#endif
#ifndef sc_RayTracingCasterForceOpaque
#define sc_RayTracingCasterForceOpaque 0
#elif sc_RayTracingCasterForceOpaque==1
#undef sc_RayTracingCasterForceOpaque
#define sc_RayTracingCasterForceOpaque 1
#endif
#ifndef intensityTextureHasSwappedViews
#define intensityTextureHasSwappedViews 0
#elif intensityTextureHasSwappedViews==1
#undef intensityTextureHasSwappedViews
#define intensityTextureHasSwappedViews 1
#endif
#ifndef BLEND_MODE_REALISTIC
#define BLEND_MODE_REALISTIC 0
#elif BLEND_MODE_REALISTIC==1
#undef BLEND_MODE_REALISTIC
#define BLEND_MODE_REALISTIC 1
#endif
#ifndef BLEND_MODE_FORGRAY
#define BLEND_MODE_FORGRAY 0
#elif BLEND_MODE_FORGRAY==1
#undef BLEND_MODE_FORGRAY
#define BLEND_MODE_FORGRAY 1
#endif
#ifndef BLEND_MODE_NOTBRIGHT
#define BLEND_MODE_NOTBRIGHT 0
#elif BLEND_MODE_NOTBRIGHT==1
#undef BLEND_MODE_NOTBRIGHT
#define BLEND_MODE_NOTBRIGHT 1
#endif
#ifndef BLEND_MODE_DIVISION
#define BLEND_MODE_DIVISION 0
#elif BLEND_MODE_DIVISION==1
#undef BLEND_MODE_DIVISION
#define BLEND_MODE_DIVISION 1
#endif
#ifndef BLEND_MODE_BRIGHT
#define BLEND_MODE_BRIGHT 0
#elif BLEND_MODE_BRIGHT==1
#undef BLEND_MODE_BRIGHT
#define BLEND_MODE_BRIGHT 1
#endif
#ifndef BLEND_MODE_INTENSE
#define BLEND_MODE_INTENSE 0
#elif BLEND_MODE_INTENSE==1
#undef BLEND_MODE_INTENSE
#define BLEND_MODE_INTENSE 1
#endif
#ifndef intensityTextureLayout
#define intensityTextureLayout 0
#endif
#ifndef SC_USE_UV_TRANSFORM_intensityTexture
#define SC_USE_UV_TRANSFORM_intensityTexture 0
#elif SC_USE_UV_TRANSFORM_intensityTexture==1
#undef SC_USE_UV_TRANSFORM_intensityTexture
#define SC_USE_UV_TRANSFORM_intensityTexture 1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_U_intensityTexture
#define SC_SOFTWARE_WRAP_MODE_U_intensityTexture -1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_V_intensityTexture
#define SC_SOFTWARE_WRAP_MODE_V_intensityTexture -1
#endif
#ifndef SC_USE_UV_MIN_MAX_intensityTexture
#define SC_USE_UV_MIN_MAX_intensityTexture 0
#elif SC_USE_UV_MIN_MAX_intensityTexture==1
#undef SC_USE_UV_MIN_MAX_intensityTexture
#define SC_USE_UV_MIN_MAX_intensityTexture 1
#endif
#ifndef SC_USE_CLAMP_TO_BORDER_intensityTexture
#define SC_USE_CLAMP_TO_BORDER_intensityTexture 0
#elif SC_USE_CLAMP_TO_BORDER_intensityTexture==1
#undef SC_USE_CLAMP_TO_BORDER_intensityTexture
#define SC_USE_CLAMP_TO_BORDER_intensityTexture 1
#endif
#ifndef BLEND_MODE_LIGHTEN
#define BLEND_MODE_LIGHTEN 0
#elif BLEND_MODE_LIGHTEN==1
#undef BLEND_MODE_LIGHTEN
#define BLEND_MODE_LIGHTEN 1
#endif
#ifndef BLEND_MODE_DARKEN
#define BLEND_MODE_DARKEN 0
#elif BLEND_MODE_DARKEN==1
#undef BLEND_MODE_DARKEN
#define BLEND_MODE_DARKEN 1
#endif
#ifndef BLEND_MODE_DIVIDE
#define BLEND_MODE_DIVIDE 0
#elif BLEND_MODE_DIVIDE==1
#undef BLEND_MODE_DIVIDE
#define BLEND_MODE_DIVIDE 1
#endif
#ifndef BLEND_MODE_AVERAGE
#define BLEND_MODE_AVERAGE 0
#elif BLEND_MODE_AVERAGE==1
#undef BLEND_MODE_AVERAGE
#define BLEND_MODE_AVERAGE 1
#endif
#ifndef BLEND_MODE_SUBTRACT
#define BLEND_MODE_SUBTRACT 0
#elif BLEND_MODE_SUBTRACT==1
#undef BLEND_MODE_SUBTRACT
#define BLEND_MODE_SUBTRACT 1
#endif
#ifndef BLEND_MODE_DIFFERENCE
#define BLEND_MODE_DIFFERENCE 0
#elif BLEND_MODE_DIFFERENCE==1
#undef BLEND_MODE_DIFFERENCE
#define BLEND_MODE_DIFFERENCE 1
#endif
#ifndef BLEND_MODE_NEGATION
#define BLEND_MODE_NEGATION 0
#elif BLEND_MODE_NEGATION==1
#undef BLEND_MODE_NEGATION
#define BLEND_MODE_NEGATION 1
#endif
#ifndef BLEND_MODE_EXCLUSION
#define BLEND_MODE_EXCLUSION 0
#elif BLEND_MODE_EXCLUSION==1
#undef BLEND_MODE_EXCLUSION
#define BLEND_MODE_EXCLUSION 1
#endif
#ifndef BLEND_MODE_OVERLAY
#define BLEND_MODE_OVERLAY 0
#elif BLEND_MODE_OVERLAY==1
#undef BLEND_MODE_OVERLAY
#define BLEND_MODE_OVERLAY 1
#endif
#ifndef BLEND_MODE_SOFT_LIGHT
#define BLEND_MODE_SOFT_LIGHT 0
#elif BLEND_MODE_SOFT_LIGHT==1
#undef BLEND_MODE_SOFT_LIGHT
#define BLEND_MODE_SOFT_LIGHT 1
#endif
#ifndef BLEND_MODE_HARD_LIGHT
#define BLEND_MODE_HARD_LIGHT 0
#elif BLEND_MODE_HARD_LIGHT==1
#undef BLEND_MODE_HARD_LIGHT
#define BLEND_MODE_HARD_LIGHT 1
#endif
#ifndef BLEND_MODE_COLOR_DODGE
#define BLEND_MODE_COLOR_DODGE 0
#elif BLEND_MODE_COLOR_DODGE==1
#undef BLEND_MODE_COLOR_DODGE
#define BLEND_MODE_COLOR_DODGE 1
#endif
#ifndef BLEND_MODE_COLOR_BURN
#define BLEND_MODE_COLOR_BURN 0
#elif BLEND_MODE_COLOR_BURN==1
#undef BLEND_MODE_COLOR_BURN
#define BLEND_MODE_COLOR_BURN 1
#endif
#ifndef BLEND_MODE_LINEAR_LIGHT
#define BLEND_MODE_LINEAR_LIGHT 0
#elif BLEND_MODE_LINEAR_LIGHT==1
#undef BLEND_MODE_LINEAR_LIGHT
#define BLEND_MODE_LINEAR_LIGHT 1
#endif
#ifndef BLEND_MODE_VIVID_LIGHT
#define BLEND_MODE_VIVID_LIGHT 0
#elif BLEND_MODE_VIVID_LIGHT==1
#undef BLEND_MODE_VIVID_LIGHT
#define BLEND_MODE_VIVID_LIGHT 1
#endif
#ifndef BLEND_MODE_PIN_LIGHT
#define BLEND_MODE_PIN_LIGHT 0
#elif BLEND_MODE_PIN_LIGHT==1
#undef BLEND_MODE_PIN_LIGHT
#define BLEND_MODE_PIN_LIGHT 1
#endif
#ifndef BLEND_MODE_HARD_MIX
#define BLEND_MODE_HARD_MIX 0
#elif BLEND_MODE_HARD_MIX==1
#undef BLEND_MODE_HARD_MIX
#define BLEND_MODE_HARD_MIX 1
#endif
#ifndef BLEND_MODE_HARD_REFLECT
#define BLEND_MODE_HARD_REFLECT 0
#elif BLEND_MODE_HARD_REFLECT==1
#undef BLEND_MODE_HARD_REFLECT
#define BLEND_MODE_HARD_REFLECT 1
#endif
#ifndef BLEND_MODE_HARD_GLOW
#define BLEND_MODE_HARD_GLOW 0
#elif BLEND_MODE_HARD_GLOW==1
#undef BLEND_MODE_HARD_GLOW
#define BLEND_MODE_HARD_GLOW 1
#endif
#ifndef BLEND_MODE_HARD_PHOENIX
#define BLEND_MODE_HARD_PHOENIX 0
#elif BLEND_MODE_HARD_PHOENIX==1
#undef BLEND_MODE_HARD_PHOENIX
#define BLEND_MODE_HARD_PHOENIX 1
#endif
#ifndef BLEND_MODE_HUE
#define BLEND_MODE_HUE 0
#elif BLEND_MODE_HUE==1
#undef BLEND_MODE_HUE
#define BLEND_MODE_HUE 1
#endif
#ifndef BLEND_MODE_SATURATION
#define BLEND_MODE_SATURATION 0
#elif BLEND_MODE_SATURATION==1
#undef BLEND_MODE_SATURATION
#define BLEND_MODE_SATURATION 1
#endif
#ifndef BLEND_MODE_COLOR
#define BLEND_MODE_COLOR 0
#elif BLEND_MODE_COLOR==1
#undef BLEND_MODE_COLOR
#define BLEND_MODE_COLOR 1
#endif
#ifndef BLEND_MODE_LUMINOSITY
#define BLEND_MODE_LUMINOSITY 0
#elif BLEND_MODE_LUMINOSITY==1
#undef BLEND_MODE_LUMINOSITY
#define BLEND_MODE_LUMINOSITY 1
#endif
#ifndef sc_SkinBonesCount
#define sc_SkinBonesCount 0
#endif
#ifndef UseViewSpaceDepthVariant
#define UseViewSpaceDepthVariant 1
#elif UseViewSpaceDepthVariant==1
#undef UseViewSpaceDepthVariant
#define UseViewSpaceDepthVariant 1
#endif
#ifndef sc_OITDepthGatherPass
#define sc_OITDepthGatherPass 0
#elif sc_OITDepthGatherPass==1
#undef sc_OITDepthGatherPass
#define sc_OITDepthGatherPass 1
#endif
#ifndef sc_OITCompositingPass
#define sc_OITCompositingPass 0
#elif sc_OITCompositingPass==1
#undef sc_OITCompositingPass
#define sc_OITCompositingPass 1
#endif
#ifndef sc_OITDepthBoundsPass
#define sc_OITDepthBoundsPass 0
#elif sc_OITDepthBoundsPass==1
#undef sc_OITDepthBoundsPass
#define sc_OITDepthBoundsPass 1
#endif
#ifndef sc_NumStereoViews
#define sc_NumStereoViews 1
#endif
#ifndef sc_OITMaxLayers4Plus1
#define sc_OITMaxLayers4Plus1 0
#elif sc_OITMaxLayers4Plus1==1
#undef sc_OITMaxLayers4Plus1
#define sc_OITMaxLayers4Plus1 1
#endif
#ifndef sc_OITMaxLayersVisualizeLayerCount
#define sc_OITMaxLayersVisualizeLayerCount 0
#elif sc_OITMaxLayersVisualizeLayerCount==1
#undef sc_OITMaxLayersVisualizeLayerCount
#define sc_OITMaxLayersVisualizeLayerCount 1
#endif
#ifndef sc_OITMaxLayers8
#define sc_OITMaxLayers8 0
#elif sc_OITMaxLayers8==1
#undef sc_OITMaxLayers8
#define sc_OITMaxLayers8 1
#endif
#ifndef sc_OITFrontLayerPass
#define sc_OITFrontLayerPass 0
#elif sc_OITFrontLayerPass==1
#undef sc_OITFrontLayerPass
#define sc_OITFrontLayerPass 1
#endif
#ifndef sc_OITDepthPrepass
#define sc_OITDepthPrepass 0
#elif sc_OITDepthPrepass==1
#undef sc_OITDepthPrepass
#define sc_OITDepthPrepass 1
#endif
#ifndef ENABLE_STIPPLE_PATTERN_TEST
#define ENABLE_STIPPLE_PATTERN_TEST 0
#elif ENABLE_STIPPLE_PATTERN_TEST==1
#undef ENABLE_STIPPLE_PATTERN_TEST
#define ENABLE_STIPPLE_PATTERN_TEST 1
#endif
#ifndef sc_ProjectiveShadowsCaster
#define sc_ProjectiveShadowsCaster 0
#elif sc_ProjectiveShadowsCaster==1
#undef sc_ProjectiveShadowsCaster
#define sc_ProjectiveShadowsCaster 1
#endif
#ifndef sc_RenderAlphaToColor
#define sc_RenderAlphaToColor 0
#elif sc_RenderAlphaToColor==1
#undef sc_RenderAlphaToColor
#define sc_RenderAlphaToColor 1
#endif
#ifndef sc_BlendMode_Custom
#define sc_BlendMode_Custom 0
#elif sc_BlendMode_Custom==1
#undef sc_BlendMode_Custom
#define sc_BlendMode_Custom 1
#endif
#ifndef sc_Voxelization
#define sc_Voxelization 0
#elif sc_Voxelization==1
#undef sc_Voxelization
#define sc_Voxelization 1
#endif
#ifndef sc_OutputBounds
#define sc_OutputBounds 0
#elif sc_OutputBounds==1
#undef sc_OutputBounds
#define sc_OutputBounds 1
#endif
#ifndef baseTex0HasSwappedViews
#define baseTex0HasSwappedViews 0
#elif baseTex0HasSwappedViews==1
#undef baseTex0HasSwappedViews
#define baseTex0HasSwappedViews 1
#endif
#ifndef baseTex1HasSwappedViews
#define baseTex1HasSwappedViews 0
#elif baseTex1HasSwappedViews==1
#undef baseTex1HasSwappedViews
#define baseTex1HasSwappedViews 1
#endif
#ifndef baseTex2HasSwappedViews
#define baseTex2HasSwappedViews 0
#elif baseTex2HasSwappedViews==1
#undef baseTex2HasSwappedViews
#define baseTex2HasSwappedViews 1
#endif
#ifndef baseTex3HasSwappedViews
#define baseTex3HasSwappedViews 0
#elif baseTex3HasSwappedViews==1
#undef baseTex3HasSwappedViews
#define baseTex3HasSwappedViews 1
#endif
#ifndef baseTex4HasSwappedViews
#define baseTex4HasSwappedViews 0
#elif baseTex4HasSwappedViews==1
#undef baseTex4HasSwappedViews
#define baseTex4HasSwappedViews 1
#endif
#ifndef baseTex5HasSwappedViews
#define baseTex5HasSwappedViews 0
#elif baseTex5HasSwappedViews==1
#undef baseTex5HasSwappedViews
#define baseTex5HasSwappedViews 1
#endif
#ifndef baseTex6HasSwappedViews
#define baseTex6HasSwappedViews 0
#elif baseTex6HasSwappedViews==1
#undef baseTex6HasSwappedViews
#define baseTex6HasSwappedViews 1
#endif
#ifndef baseTex7HasSwappedViews
#define baseTex7HasSwappedViews 0
#elif baseTex7HasSwappedViews==1
#undef baseTex7HasSwappedViews
#define baseTex7HasSwappedViews 1
#endif
#ifndef baseTex0Layout
#define baseTex0Layout 0
#endif
#ifndef SC_USE_UV_TRANSFORM_baseTex0
#define SC_USE_UV_TRANSFORM_baseTex0 0
#elif SC_USE_UV_TRANSFORM_baseTex0==1
#undef SC_USE_UV_TRANSFORM_baseTex0
#define SC_USE_UV_TRANSFORM_baseTex0 1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_U_baseTex0
#define SC_SOFTWARE_WRAP_MODE_U_baseTex0 -1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_V_baseTex0
#define SC_SOFTWARE_WRAP_MODE_V_baseTex0 -1
#endif
#ifndef SC_USE_UV_MIN_MAX_baseTex0
#define SC_USE_UV_MIN_MAX_baseTex0 0
#elif SC_USE_UV_MIN_MAX_baseTex0==1
#undef SC_USE_UV_MIN_MAX_baseTex0
#define SC_USE_UV_MIN_MAX_baseTex0 1
#endif
#ifndef SC_USE_CLAMP_TO_BORDER_baseTex0
#define SC_USE_CLAMP_TO_BORDER_baseTex0 0
#elif SC_USE_CLAMP_TO_BORDER_baseTex0==1
#undef SC_USE_CLAMP_TO_BORDER_baseTex0
#define SC_USE_CLAMP_TO_BORDER_baseTex0 1
#endif
#ifndef baseTex1Layout
#define baseTex1Layout 0
#endif
#ifndef SC_USE_UV_TRANSFORM_baseTex1
#define SC_USE_UV_TRANSFORM_baseTex1 0
#elif SC_USE_UV_TRANSFORM_baseTex1==1
#undef SC_USE_UV_TRANSFORM_baseTex1
#define SC_USE_UV_TRANSFORM_baseTex1 1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_U_baseTex1
#define SC_SOFTWARE_WRAP_MODE_U_baseTex1 -1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_V_baseTex1
#define SC_SOFTWARE_WRAP_MODE_V_baseTex1 -1
#endif
#ifndef SC_USE_UV_MIN_MAX_baseTex1
#define SC_USE_UV_MIN_MAX_baseTex1 0
#elif SC_USE_UV_MIN_MAX_baseTex1==1
#undef SC_USE_UV_MIN_MAX_baseTex1
#define SC_USE_UV_MIN_MAX_baseTex1 1
#endif
#ifndef SC_USE_CLAMP_TO_BORDER_baseTex1
#define SC_USE_CLAMP_TO_BORDER_baseTex1 0
#elif SC_USE_CLAMP_TO_BORDER_baseTex1==1
#undef SC_USE_CLAMP_TO_BORDER_baseTex1
#define SC_USE_CLAMP_TO_BORDER_baseTex1 1
#endif
#ifndef baseTex2Layout
#define baseTex2Layout 0
#endif
#ifndef SC_USE_UV_TRANSFORM_baseTex2
#define SC_USE_UV_TRANSFORM_baseTex2 0
#elif SC_USE_UV_TRANSFORM_baseTex2==1
#undef SC_USE_UV_TRANSFORM_baseTex2
#define SC_USE_UV_TRANSFORM_baseTex2 1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_U_baseTex2
#define SC_SOFTWARE_WRAP_MODE_U_baseTex2 -1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_V_baseTex2
#define SC_SOFTWARE_WRAP_MODE_V_baseTex2 -1
#endif
#ifndef SC_USE_UV_MIN_MAX_baseTex2
#define SC_USE_UV_MIN_MAX_baseTex2 0
#elif SC_USE_UV_MIN_MAX_baseTex2==1
#undef SC_USE_UV_MIN_MAX_baseTex2
#define SC_USE_UV_MIN_MAX_baseTex2 1
#endif
#ifndef SC_USE_CLAMP_TO_BORDER_baseTex2
#define SC_USE_CLAMP_TO_BORDER_baseTex2 0
#elif SC_USE_CLAMP_TO_BORDER_baseTex2==1
#undef SC_USE_CLAMP_TO_BORDER_baseTex2
#define SC_USE_CLAMP_TO_BORDER_baseTex2 1
#endif
#ifndef baseTex3Layout
#define baseTex3Layout 0
#endif
#ifndef SC_USE_UV_TRANSFORM_baseTex3
#define SC_USE_UV_TRANSFORM_baseTex3 0
#elif SC_USE_UV_TRANSFORM_baseTex3==1
#undef SC_USE_UV_TRANSFORM_baseTex3
#define SC_USE_UV_TRANSFORM_baseTex3 1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_U_baseTex3
#define SC_SOFTWARE_WRAP_MODE_U_baseTex3 -1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_V_baseTex3
#define SC_SOFTWARE_WRAP_MODE_V_baseTex3 -1
#endif
#ifndef SC_USE_UV_MIN_MAX_baseTex3
#define SC_USE_UV_MIN_MAX_baseTex3 0
#elif SC_USE_UV_MIN_MAX_baseTex3==1
#undef SC_USE_UV_MIN_MAX_baseTex3
#define SC_USE_UV_MIN_MAX_baseTex3 1
#endif
#ifndef SC_USE_CLAMP_TO_BORDER_baseTex3
#define SC_USE_CLAMP_TO_BORDER_baseTex3 0
#elif SC_USE_CLAMP_TO_BORDER_baseTex3==1
#undef SC_USE_CLAMP_TO_BORDER_baseTex3
#define SC_USE_CLAMP_TO_BORDER_baseTex3 1
#endif
#ifndef baseTex4Layout
#define baseTex4Layout 0
#endif
#ifndef SC_USE_UV_TRANSFORM_baseTex4
#define SC_USE_UV_TRANSFORM_baseTex4 0
#elif SC_USE_UV_TRANSFORM_baseTex4==1
#undef SC_USE_UV_TRANSFORM_baseTex4
#define SC_USE_UV_TRANSFORM_baseTex4 1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_U_baseTex4
#define SC_SOFTWARE_WRAP_MODE_U_baseTex4 -1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_V_baseTex4
#define SC_SOFTWARE_WRAP_MODE_V_baseTex4 -1
#endif
#ifndef SC_USE_UV_MIN_MAX_baseTex4
#define SC_USE_UV_MIN_MAX_baseTex4 0
#elif SC_USE_UV_MIN_MAX_baseTex4==1
#undef SC_USE_UV_MIN_MAX_baseTex4
#define SC_USE_UV_MIN_MAX_baseTex4 1
#endif
#ifndef SC_USE_CLAMP_TO_BORDER_baseTex4
#define SC_USE_CLAMP_TO_BORDER_baseTex4 0
#elif SC_USE_CLAMP_TO_BORDER_baseTex4==1
#undef SC_USE_CLAMP_TO_BORDER_baseTex4
#define SC_USE_CLAMP_TO_BORDER_baseTex4 1
#endif
#ifndef baseTex5Layout
#define baseTex5Layout 0
#endif
#ifndef SC_USE_UV_TRANSFORM_baseTex5
#define SC_USE_UV_TRANSFORM_baseTex5 0
#elif SC_USE_UV_TRANSFORM_baseTex5==1
#undef SC_USE_UV_TRANSFORM_baseTex5
#define SC_USE_UV_TRANSFORM_baseTex5 1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_U_baseTex5
#define SC_SOFTWARE_WRAP_MODE_U_baseTex5 -1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_V_baseTex5
#define SC_SOFTWARE_WRAP_MODE_V_baseTex5 -1
#endif
#ifndef SC_USE_UV_MIN_MAX_baseTex5
#define SC_USE_UV_MIN_MAX_baseTex5 0
#elif SC_USE_UV_MIN_MAX_baseTex5==1
#undef SC_USE_UV_MIN_MAX_baseTex5
#define SC_USE_UV_MIN_MAX_baseTex5 1
#endif
#ifndef SC_USE_CLAMP_TO_BORDER_baseTex5
#define SC_USE_CLAMP_TO_BORDER_baseTex5 0
#elif SC_USE_CLAMP_TO_BORDER_baseTex5==1
#undef SC_USE_CLAMP_TO_BORDER_baseTex5
#define SC_USE_CLAMP_TO_BORDER_baseTex5 1
#endif
#ifndef baseTex6Layout
#define baseTex6Layout 0
#endif
#ifndef SC_USE_UV_TRANSFORM_baseTex6
#define SC_USE_UV_TRANSFORM_baseTex6 0
#elif SC_USE_UV_TRANSFORM_baseTex6==1
#undef SC_USE_UV_TRANSFORM_baseTex6
#define SC_USE_UV_TRANSFORM_baseTex6 1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_U_baseTex6
#define SC_SOFTWARE_WRAP_MODE_U_baseTex6 -1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_V_baseTex6
#define SC_SOFTWARE_WRAP_MODE_V_baseTex6 -1
#endif
#ifndef SC_USE_UV_MIN_MAX_baseTex6
#define SC_USE_UV_MIN_MAX_baseTex6 0
#elif SC_USE_UV_MIN_MAX_baseTex6==1
#undef SC_USE_UV_MIN_MAX_baseTex6
#define SC_USE_UV_MIN_MAX_baseTex6 1
#endif
#ifndef SC_USE_CLAMP_TO_BORDER_baseTex6
#define SC_USE_CLAMP_TO_BORDER_baseTex6 0
#elif SC_USE_CLAMP_TO_BORDER_baseTex6==1
#undef SC_USE_CLAMP_TO_BORDER_baseTex6
#define SC_USE_CLAMP_TO_BORDER_baseTex6 1
#endif
#ifndef baseTex7Layout
#define baseTex7Layout 0
#endif
#ifndef SC_USE_UV_TRANSFORM_baseTex7
#define SC_USE_UV_TRANSFORM_baseTex7 0
#elif SC_USE_UV_TRANSFORM_baseTex7==1
#undef SC_USE_UV_TRANSFORM_baseTex7
#define SC_USE_UV_TRANSFORM_baseTex7 1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_U_baseTex7
#define SC_SOFTWARE_WRAP_MODE_U_baseTex7 -1
#endif
#ifndef SC_SOFTWARE_WRAP_MODE_V_baseTex7
#define SC_SOFTWARE_WRAP_MODE_V_baseTex7 -1
#endif
#ifndef SC_USE_UV_MIN_MAX_baseTex7
#define SC_USE_UV_MIN_MAX_baseTex7 0
#elif SC_USE_UV_MIN_MAX_baseTex7==1
#undef SC_USE_UV_MIN_MAX_baseTex7
#define SC_USE_UV_MIN_MAX_baseTex7 1
#endif
#ifndef SC_USE_CLAMP_TO_BORDER_baseTex7
#define SC_USE_CLAMP_TO_BORDER_baseTex7 0
#elif SC_USE_CLAMP_TO_BORDER_baseTex7==1
#undef SC_USE_CLAMP_TO_BORDER_baseTex7
#define SC_USE_CLAMP_TO_BORDER_baseTex7 1
#endif
#ifndef sc_DepthOnly
#define sc_DepthOnly 0
#elif sc_DepthOnly==1
#undef sc_DepthOnly
#define sc_DepthOnly 1
#endif
layout(binding=1,std430) readonly buffer sc_RayTracingCasterVertexBuffer
{
float sc_RayTracingCasterVertices[1];
} sc_RayTracingCasterVertexBuffer_obj;
layout(binding=2,std430) readonly buffer sc_RayTracingCasterNonAnimatedVertexBuffer
{
float sc_RayTracingCasterNonAnimatedVertices[1];
} sc_RayTracingCasterNonAnimatedVertexBuffer_obj;
layout(binding=0,std430) readonly buffer sc_RayTracingCasterIndexBuffer
{
uint sc_RayTracingCasterTriangles[1];
} sc_RayTracingCasterIndexBuffer_obj;
uniform vec4 sc_CurrentRenderTargetDims;
uniform float sc_ShadowDensity;
uniform vec4 sc_ShadowColor;
uniform vec4 sc_UniformConstants;
uniform uvec4 sc_RayTracingCasterConfiguration;
uniform uvec4 sc_RayTracingCasterOffsetPNTC;
uniform uvec4 sc_RayTracingCasterFormatPNTC;
uniform uvec4 sc_RayTracingCasterOffsetTexture;
uniform uvec4 sc_RayTracingCasterFormatTexture;
uniform mat4 sc_ModelMatrix;
uniform mat3 sc_NormalMatrix;
uniform float correctedIntensity;
uniform mat3 intensityTextureTransform;
uniform vec4 intensityTextureUvMinMax;
uniform vec4 intensityTextureBorderColor;
uniform mat4 sc_ProjectionMatrixArray[sc_NumStereoViews];
uniform float alphaTestThreshold;
uniform mat3 baseTex0Transform;
uniform vec4 baseTex0UvMinMax;
uniform vec4 baseTex0BorderColor;
uniform mat3 baseTex1Transform;
uniform vec4 baseTex1UvMinMax;
uniform vec4 baseTex1BorderColor;
uniform mat3 baseTex2Transform;
uniform vec4 baseTex2UvMinMax;
uniform vec4 baseTex2BorderColor;
uniform mat3 baseTex3Transform;
uniform vec4 baseTex3UvMinMax;
uniform vec4 baseTex3BorderColor;
uniform mat3 baseTex4Transform;
uniform vec4 baseTex4UvMinMax;
uniform vec4 baseTex4BorderColor;
uniform mat3 baseTex5Transform;
uniform vec4 baseTex5UvMinMax;
uniform vec4 baseTex5BorderColor;
uniform mat3 baseTex6Transform;
uniform vec4 baseTex6UvMinMax;
uniform vec4 baseTex6BorderColor;
uniform mat3 baseTex7Transform;
uniform vec4 baseTex7UvMinMax;
uniform vec4 baseTex7BorderColor;
uniform int PreviewEnabled;
uniform usampler2D sc_RayTracingHitCasterIdAndBarycentric;
uniform sampler2D sc_RayTracingRayDirection;
uniform sampler2D baseTex7;
uniform sampler2DArray baseTex7ArrSC;
uniform sampler2D baseTex6;
uniform sampler2DArray baseTex6ArrSC;
uniform sampler2D baseTex5;
uniform sampler2DArray baseTex5ArrSC;
uniform sampler2D baseTex4;
uniform sampler2DArray baseTex4ArrSC;
uniform sampler2D baseTex3;
uniform sampler2DArray baseTex3ArrSC;
uniform sampler2D baseTex2;
uniform sampler2DArray baseTex2ArrSC;
uniform sampler2D baseTex1;
uniform sampler2DArray baseTex1ArrSC;
uniform sampler2D baseTex0;
uniform sampler2DArray baseTex0ArrSC;
uniform sampler2D sc_ScreenTexture;
uniform sampler2DArray sc_ScreenTextureArrSC;
uniform sampler2D intensityTexture;
uniform sampler2DArray intensityTextureArrSC;
uniform sampler2D sc_OITFrontDepthTexture;
uniform sampler2D sc_OITDepthHigh0;
uniform sampler2D sc_OITDepthLow0;
uniform sampler2D sc_OITAlpha0;
uniform sampler2D sc_OITDepthHigh1;
uniform sampler2D sc_OITDepthLow1;
uniform sampler2D sc_OITAlpha1;
uniform sampler2D sc_OITFilteredDepthBoundsTexture;
flat in int varStereoViewID;
in vec4 varPosAndMotion;
in vec4 varNormalAndMotion;
in float varClipDistance;
#if sc_FramebufferFetch&&defined(GL_EXT_shader_framebuffer_fetch)
#define out inout
#endif
layout(location=0) out vec4 sc_FragData0;
#if sc_FramebufferFetch&&defined(GL_EXT_shader_framebuffer_fetch)
#undef out
#endif
in vec4 varScreenPos;
in float varViewSpaceDepth;
in vec4 PreviewVertexColor;
in float PreviewVertexSaved;
in float Interpolator_N2_float_edgeDist;
in float Interpolator_N9_float_textureId;
in vec4 varColor;
in vec4 varTex01;
in vec4 varTangent;
in vec2 varScreenTexturePos;
in vec2 varShadowTex;
vec3 sc_RayTracingInterpolateAnimatedFloat3(vec3 brc,uvec3 indices,uint offset)
{
uvec3 l9_0=(indices*uvec3(6u))+uvec3(offset);
uint l9_1=l9_0.x;
uint l9_2=l9_0.y;
uint l9_3=l9_0.z;
return ((vec3(sc_RayTracingCasterNonAnimatedVertexBuffer_obj.sc_RayTracingCasterNonAnimatedVertices[l9_1],sc_RayTracingCasterNonAnimatedVertexBuffer_obj.sc_RayTracingCasterNonAnimatedVertices[l9_1+1u],sc_RayTracingCasterNonAnimatedVertexBuffer_obj.sc_RayTracingCasterNonAnimatedVertices[l9_1+2u])*brc.x)+(vec3(sc_RayTracingCasterNonAnimatedVertexBuffer_obj.sc_RayTracingCasterNonAnimatedVertices[l9_2],sc_RayTracingCasterNonAnimatedVertexBuffer_obj.sc_RayTracingCasterNonAnimatedVertices[l9_2+1u],sc_RayTracingCasterNonAnimatedVertexBuffer_obj.sc_RayTracingCasterNonAnimatedVertices[l9_2+2u])*brc.y))+(vec3(sc_RayTracingCasterNonAnimatedVertexBuffer_obj.sc_RayTracingCasterNonAnimatedVertices[l9_3],sc_RayTracingCasterNonAnimatedVertexBuffer_obj.sc_RayTracingCasterNonAnimatedVertices[l9_3+1u],sc_RayTracingCasterNonAnimatedVertexBuffer_obj.sc_RayTracingCasterNonAnimatedVertices[l9_3+2u])*brc.z);
}
vec4 sc_RayTracingFetchUnorm4(uint offset)
{
uint l9_0=floatBitsToUint(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[offset]);
return vec4(float(l9_0&255u),float((l9_0>>uint(8))&255u),float((l9_0>>uint(16))&255u),float((l9_0>>uint(24))&255u))/vec4(255.0);
}
sc_RayTracingHitPayload sc_RayTracingEvaluateHitPayload(ivec2 screenPos)
{
ivec2 l9_0=screenPos;
uvec4 l9_1=texelFetch(sc_RayTracingHitCasterIdAndBarycentric,l9_0,0);
uvec2 l9_2=l9_1.xy;
if (l9_1.x!=(sc_RayTracingCasterConfiguration.y&65535u))
{
return sc_RayTracingHitPayload(vec3(0.0),vec3(0.0),vec3(0.0),vec4(0.0),vec4(0.0),vec2(0.0),vec2(0.0),vec2(0.0),vec2(0.0),l9_2);
}
vec2 l9_3=unpackHalf2x16(l9_1.z|(l9_1.w<<uint(16)));
float l9_4=l9_3.x;
float l9_5=l9_3.y;
float l9_6=(1.0-l9_4)-l9_5;
vec3 l9_7=vec3(l9_6,l9_4,l9_5);
ivec2 l9_8=screenPos;
vec4 l9_9=texelFetch(sc_RayTracingRayDirection,l9_8,0);
float l9_10=l9_9.x;
float l9_11=l9_9.y;
float l9_12=(1.0-abs(l9_10))-abs(l9_11);
vec3 l9_13=vec3(l9_10,l9_11,l9_12);
float l9_14=clamp(-l9_12,0.0,1.0);
float l9_15;
if (l9_10>=0.0)
{
l9_15=-l9_14;
}
else
{
l9_15=l9_14;
}
float l9_16;
if (l9_11>=0.0)
{
l9_16=-l9_14;
}
else
{
l9_16=l9_14;
}
vec2 l9_17=vec2(l9_15,l9_16);
vec2 l9_18=l9_13.xy+l9_17;
uint l9_19=min(l9_1.y,sc_RayTracingCasterConfiguration.z)*6u;
uint l9_20=l9_19&4294967292u;
uint l9_21=l9_20/4u;
uint l9_22=sc_RayTracingCasterIndexBuffer_obj.sc_RayTracingCasterTriangles[l9_21];
uint l9_23=l9_21+1u;
uint l9_24=sc_RayTracingCasterIndexBuffer_obj.sc_RayTracingCasterTriangles[l9_23];
uvec4 l9_25=(uvec4(l9_22,l9_22,l9_24,l9_24)&uvec4(65535u,4294967295u,65535u,4294967295u))>>uvec4(0u,16u,0u,16u);
uvec3 l9_26;
if (l9_19==l9_20)
{
l9_26=l9_25.xyz;
}
else
{
l9_26=l9_25.yzw;
}
bool l9_27=sc_RayTracingCasterConfiguration.x==2u;
vec3 l9_28;
if (l9_27)
{
l9_28=sc_RayTracingInterpolateAnimatedFloat3(l9_7,l9_26,0u);
}
else
{
uint l9_29=sc_RayTracingCasterConfiguration.y>>16u;
uint l9_30=(l9_26.x*l9_29)+sc_RayTracingCasterOffsetPNTC.x;
uint l9_31=(l9_26.y*l9_29)+sc_RayTracingCasterOffsetPNTC.x;
uint l9_32=(l9_26.z*l9_29)+sc_RayTracingCasterOffsetPNTC.x;
vec3 l9_33;
if (sc_RayTracingCasterFormatPNTC.x==5u)
{
l9_33=((vec3(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_30],sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_30+1u],sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_30+2u])*l9_6)+(vec3(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_31],sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_31+1u],sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_31+2u])*l9_4))+(vec3(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_32],sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_32+1u],sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_32+2u])*l9_5);
}
else
{
vec3 l9_34;
if (sc_RayTracingCasterFormatPNTC.x==6u)
{
l9_34=((vec3(unpackHalf2x16(floatBitsToUint(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_30])),unpackHalf2x16(floatBitsToUint(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_30+1u])).x)*l9_6)+(vec3(unpackHalf2x16(floatBitsToUint(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_31])),unpackHalf2x16(floatBitsToUint(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_31+1u])).x)*l9_4))+(vec3(unpackHalf2x16(floatBitsToUint(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_32])),unpackHalf2x16(floatBitsToUint(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_32+1u])).x)*l9_5);
}
else
{
l9_34=vec3(1.0,0.0,0.0);
}
l9_33=l9_34;
}
l9_28=(sc_ModelMatrix*vec4(l9_33,1.0)).xyz;
}
vec3 l9_35;
if (sc_RayTracingCasterOffsetPNTC.y>0u)
{
vec3 l9_36;
if (l9_27)
{
l9_36=sc_RayTracingInterpolateAnimatedFloat3(l9_7,l9_26,3u);
}
else
{
uint l9_37=sc_RayTracingCasterConfiguration.y>>16u;
uint l9_38=(l9_26.x*l9_37)+sc_RayTracingCasterOffsetPNTC.y;
uint l9_39=(l9_26.y*l9_37)+sc_RayTracingCasterOffsetPNTC.y;
uint l9_40=(l9_26.z*l9_37)+sc_RayTracingCasterOffsetPNTC.y;
vec3 l9_41;
if (sc_RayTracingCasterFormatPNTC.y==5u)
{
l9_41=((vec3(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_38],sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_38+1u],sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_38+2u])*l9_6)+(vec3(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_39],sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_39+1u],sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_39+2u])*l9_4))+(vec3(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_40],sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_40+1u],sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_40+2u])*l9_5);
}
else
{
vec3 l9_42;
if (sc_RayTracingCasterFormatPNTC.y==6u)
{
l9_42=((vec3(unpackHalf2x16(floatBitsToUint(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_38])),unpackHalf2x16(floatBitsToUint(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_38+1u])).x)*l9_6)+(vec3(unpackHalf2x16(floatBitsToUint(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_39])),unpackHalf2x16(floatBitsToUint(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_39+1u])).x)*l9_4))+(vec3(unpackHalf2x16(floatBitsToUint(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_40])),unpackHalf2x16(floatBitsToUint(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_40+1u])).x)*l9_5);
}
else
{
l9_42=vec3(1.0,0.0,0.0);
}
l9_41=l9_42;
}
l9_36=normalize(sc_NormalMatrix*l9_41);
}
l9_35=l9_36;
}
else
{
l9_35=vec3(1.0,0.0,0.0);
}
bool l9_43=!l9_27;
bool l9_44;
if (l9_43)
{
l9_44=sc_RayTracingCasterOffsetPNTC.z>0u;
}
else
{
l9_44=l9_43;
}
vec4 l9_45;
if (l9_44)
{
uint l9_46=sc_RayTracingCasterConfiguration.y>>16u;
uint l9_47=(l9_26.x*l9_46)+sc_RayTracingCasterOffsetPNTC.z;
uint l9_48=(l9_26.y*l9_46)+sc_RayTracingCasterOffsetPNTC.z;
uint l9_49=(l9_26.z*l9_46)+sc_RayTracingCasterOffsetPNTC.z;
vec4 l9_50;
if (sc_RayTracingCasterFormatPNTC.z==5u)
{
l9_50=((vec4(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_47],sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_47+1u],sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_47+2u],sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_47+3u])*l9_6)+(vec4(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_48],sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_48+1u],sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_48+2u],sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_48+3u])*l9_4))+(vec4(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_49],sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_49+1u],sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_49+2u],sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_49+3u])*l9_5);
}
else
{
vec4 l9_51;
if (sc_RayTracingCasterFormatPNTC.z==6u)
{
l9_51=((vec4(unpackHalf2x16(floatBitsToUint(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_47])),unpackHalf2x16(floatBitsToUint(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_47+1u])))*l9_6)+(vec4(unpackHalf2x16(floatBitsToUint(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_48])),unpackHalf2x16(floatBitsToUint(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_48+1u])))*l9_4))+(vec4(unpackHalf2x16(floatBitsToUint(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_49])),unpackHalf2x16(floatBitsToUint(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_49+1u])))*l9_5);
}
else
{
vec4 l9_52;
if (sc_RayTracingCasterFormatPNTC.z==2u)
{
l9_52=((sc_RayTracingFetchUnorm4(l9_47)*l9_6)+(sc_RayTracingFetchUnorm4(l9_48)*l9_4))+(sc_RayTracingFetchUnorm4(l9_49)*l9_5);
}
else
{
l9_52=vec4(1.0,0.0,0.0,0.0);
}
l9_51=l9_52;
}
l9_50=l9_51;
}
l9_45=vec4(normalize(sc_NormalMatrix*l9_50.xyz),l9_50.w);
}
else
{
l9_45=vec4(1.0,0.0,0.0,1.0);
}
vec4 l9_53;
if (sc_RayTracingCasterFormatPNTC.w>0u)
{
uint l9_54=sc_RayTracingCasterConfiguration.y>>16u;
uint l9_55=(l9_26.x*l9_54)+sc_RayTracingCasterOffsetPNTC.w;
uint l9_56=(l9_26.y*l9_54)+sc_RayTracingCasterOffsetPNTC.w;
uint l9_57=(l9_26.z*l9_54)+sc_RayTracingCasterOffsetPNTC.w;
vec4 l9_58;
if (sc_RayTracingCasterFormatPNTC.w==5u)
{
l9_58=((vec4(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_55],sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_55+1u],sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_55+2u],sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_55+3u])*l9_6)+(vec4(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_56],sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_56+1u],sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_56+2u],sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_56+3u])*l9_4))+(vec4(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_57],sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_57+1u],sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_57+2u],sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_57+3u])*l9_5);
}
else
{
vec4 l9_59;
if (sc_RayTracingCasterFormatPNTC.w==6u)
{
l9_59=((vec4(unpackHalf2x16(floatBitsToUint(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_55])),unpackHalf2x16(floatBitsToUint(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_55+1u])))*l9_6)+(vec4(unpackHalf2x16(floatBitsToUint(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_56])),unpackHalf2x16(floatBitsToUint(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_56+1u])))*l9_4))+(vec4(unpackHalf2x16(floatBitsToUint(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_57])),unpackHalf2x16(floatBitsToUint(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_57+1u])))*l9_5);
}
else
{
vec4 l9_60;
if (sc_RayTracingCasterFormatPNTC.w==2u)
{
l9_60=((sc_RayTracingFetchUnorm4(l9_55)*l9_6)+(sc_RayTracingFetchUnorm4(l9_56)*l9_4))+(sc_RayTracingFetchUnorm4(l9_57)*l9_5);
}
else
{
l9_60=vec4(1.0,0.0,0.0,0.0);
}
l9_59=l9_60;
}
l9_58=l9_59;
}
l9_53=l9_58;
}
else
{
l9_53=vec4(0.0);
}
uvec3 l9_61=l9_26%uvec3(2u);
vec2 l9_62=vec2(dot(l9_7,vec3(uvec3(1u)-l9_61)),0.0);
vec2 l9_63;
if (sc_RayTracingCasterFormatTexture.x>0u)
{
uint l9_64=sc_RayTracingCasterConfiguration.y>>16u;
uint l9_65=(l9_26.x*l9_64)+sc_RayTracingCasterOffsetTexture.x;
uint l9_66=(l9_26.y*l9_64)+sc_RayTracingCasterOffsetTexture.x;
uint l9_67=(l9_26.z*l9_64)+sc_RayTracingCasterOffsetTexture.x;
vec2 l9_68;
if (sc_RayTracingCasterFormatTexture.x==5u)
{
l9_68=((vec2(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_65],sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_65+1u])*l9_6)+(vec2(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_66],sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_66+1u])*l9_4))+(vec2(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_67],sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_67+1u])*l9_5);
}
else
{
vec2 l9_69;
if (sc_RayTracingCasterFormatTexture.x==6u)
{
l9_69=((unpackHalf2x16(floatBitsToUint(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_65]))*l9_6)+(unpackHalf2x16(floatBitsToUint(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_66]))*l9_4))+(unpackHalf2x16(floatBitsToUint(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_67]))*l9_5);
}
else
{
l9_69=vec2(1.0,0.0);
}
l9_68=l9_69;
}
l9_63=l9_68;
}
else
{
l9_63=l9_62;
}
vec2 l9_70;
if (sc_RayTracingCasterFormatTexture.y>0u)
{
uint l9_71=sc_RayTracingCasterConfiguration.y>>16u;
uint l9_72=(l9_26.x*l9_71)+sc_RayTracingCasterOffsetTexture.y;
uint l9_73=(l9_26.y*l9_71)+sc_RayTracingCasterOffsetTexture.y;
uint l9_74=(l9_26.z*l9_71)+sc_RayTracingCasterOffsetTexture.y;
vec2 l9_75;
if (sc_RayTracingCasterFormatTexture.y==5u)
{
l9_75=((vec2(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_72],sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_72+1u])*l9_6)+(vec2(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_73],sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_73+1u])*l9_4))+(vec2(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_74],sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_74+1u])*l9_5);
}
else
{
vec2 l9_76;
if (sc_RayTracingCasterFormatTexture.y==6u)
{
l9_76=((unpackHalf2x16(floatBitsToUint(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_72]))*l9_6)+(unpackHalf2x16(floatBitsToUint(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_73]))*l9_4))+(unpackHalf2x16(floatBitsToUint(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_74]))*l9_5);
}
else
{
l9_76=vec2(1.0,0.0);
}
l9_75=l9_76;
}
l9_70=l9_75;
}
else
{
l9_70=l9_62;
}
vec2 l9_77;
if (sc_RayTracingCasterFormatTexture.z>0u)
{
uint l9_78=sc_RayTracingCasterConfiguration.y>>16u;
uint l9_79=(l9_26.x*l9_78)+sc_RayTracingCasterOffsetTexture.z;
uint l9_80=(l9_26.y*l9_78)+sc_RayTracingCasterOffsetTexture.z;
uint l9_81=(l9_26.z*l9_78)+sc_RayTracingCasterOffsetTexture.z;
vec2 l9_82;
if (sc_RayTracingCasterFormatTexture.z==5u)
{
l9_82=((vec2(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_79],sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_79+1u])*l9_6)+(vec2(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_80],sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_80+1u])*l9_4))+(vec2(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_81],sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_81+1u])*l9_5);
}
else
{
vec2 l9_83;
if (sc_RayTracingCasterFormatTexture.z==6u)
{
l9_83=((unpackHalf2x16(floatBitsToUint(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_79]))*l9_6)+(unpackHalf2x16(floatBitsToUint(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_80]))*l9_4))+(unpackHalf2x16(floatBitsToUint(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_81]))*l9_5);
}
else
{
l9_83=vec2(1.0,0.0);
}
l9_82=l9_83;
}
l9_77=l9_82;
}
else
{
l9_77=l9_62;
}
vec2 l9_84;
if (sc_RayTracingCasterFormatTexture.w>0u)
{
uint l9_85=sc_RayTracingCasterConfiguration.y>>16u;
uint l9_86=(l9_26.x*l9_85)+sc_RayTracingCasterOffsetTexture.w;
uint l9_87=(l9_26.y*l9_85)+sc_RayTracingCasterOffsetTexture.w;
uint l9_88=(l9_26.z*l9_85)+sc_RayTracingCasterOffsetTexture.w;
vec2 l9_89;
if (sc_RayTracingCasterFormatTexture.w==5u)
{
l9_89=((vec2(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_86],sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_86+1u])*l9_6)+(vec2(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_87],sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_87+1u])*l9_4))+(vec2(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_88],sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_88+1u])*l9_5);
}
else
{
vec2 l9_90;
if (sc_RayTracingCasterFormatTexture.w==6u)
{
l9_90=((unpackHalf2x16(floatBitsToUint(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_86]))*l9_6)+(unpackHalf2x16(floatBitsToUint(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_87]))*l9_4))+(unpackHalf2x16(floatBitsToUint(sc_RayTracingCasterVertexBuffer_obj.sc_RayTracingCasterVertices[l9_88]))*l9_5);
}
else
{
l9_90=vec2(1.0,0.0);
}
l9_89=l9_90;
}
l9_84=l9_89;
}
else
{
l9_84=l9_62;
}
return sc_RayTracingHitPayload(-normalize(vec3(l9_18.x,l9_18.y,l9_13.z)),l9_28,l9_35,l9_45,l9_53,l9_63,l9_70,l9_77,l9_84,l9_2);
}
int sc_GetStereoViewIndex()
{
int l9_0;
#if (sc_StereoRenderingMode==0)
{
l9_0=0;
}
#else
{
l9_0=varStereoViewID;
}
#endif
return l9_0;
}
int baseTex7GetStereoViewIndex()
{
int l9_0;
#if (baseTex7HasSwappedViews)
{
l9_0=1-sc_GetStereoViewIndex();
}
#else
{
l9_0=sc_GetStereoViewIndex();
}
#endif
return l9_0;
}
void sc_SoftwareWrapEarly(inout float uv,int softwareWrapMode)
{
if (softwareWrapMode==1)
{
uv=fract(uv);
}
else
{
if (softwareWrapMode==2)
{
float l9_0=fract(uv);
uv=mix(l9_0,1.0-l9_0,clamp(step(0.25,fract((uv-l9_0)*0.5)),0.0,1.0));
}
}
}
void sc_ClampUV(inout float value,float minValue,float maxValue,bool useClampToBorder,inout float clampToBorderFactor)
{
float l9_0=clamp(value,minValue,maxValue);
float l9_1=step(abs(value-l9_0),9.9999997e-06);
clampToBorderFactor*=(l9_1+((1.0-float(useClampToBorder))*(1.0-l9_1)));
value=l9_0;
}
vec2 sc_TransformUV(vec2 uv,bool useUvTransform,mat3 uvTransform)
{
if (useUvTransform)
{
uv=vec2((uvTransform*vec3(uv,1.0)).xy);
}
return uv;
}
void sc_SoftwareWrapLate(inout float uv,int softwareWrapMode,bool useClampToBorder,inout float clampToBorderFactor)
{
if ((softwareWrapMode==0)||(softwareWrapMode==3))
{
sc_ClampUV(uv,0.0,1.0,useClampToBorder,clampToBorderFactor);
}
}
vec3 sc_SamplingCoordsViewToGlobal(vec2 uv,int renderingLayout,int viewIndex)
{
vec3 l9_0;
if (renderingLayout==0)
{
l9_0=vec3(uv,0.0);
}
else
{
vec3 l9_1;
if (renderingLayout==1)
{
l9_1=vec3(uv.x,(uv.y*0.5)+(0.5-(float(viewIndex)*0.5)),0.0);
}
else
{
l9_1=vec3(uv,float(viewIndex));
}
l9_0=l9_1;
}
return l9_0;
}
int baseTex6GetStereoViewIndex()
{
int l9_0;
#if (baseTex6HasSwappedViews)
{
l9_0=1-sc_GetStereoViewIndex();
}
#else
{
l9_0=sc_GetStereoViewIndex();
}
#endif
return l9_0;
}
int baseTex5GetStereoViewIndex()
{
int l9_0;
#if (baseTex5HasSwappedViews)
{
l9_0=1-sc_GetStereoViewIndex();
}
#else
{
l9_0=sc_GetStereoViewIndex();
}
#endif
return l9_0;
}
int baseTex4GetStereoViewIndex()
{
int l9_0;
#if (baseTex4HasSwappedViews)
{
l9_0=1-sc_GetStereoViewIndex();
}
#else
{
l9_0=sc_GetStereoViewIndex();
}
#endif
return l9_0;
}
int baseTex3GetStereoViewIndex()
{
int l9_0;
#if (baseTex3HasSwappedViews)
{
l9_0=1-sc_GetStereoViewIndex();
}
#else
{
l9_0=sc_GetStereoViewIndex();
}
#endif
return l9_0;
}
int baseTex2GetStereoViewIndex()
{
int l9_0;
#if (baseTex2HasSwappedViews)
{
l9_0=1-sc_GetStereoViewIndex();
}
#else
{
l9_0=sc_GetStereoViewIndex();
}
#endif
return l9_0;
}
int baseTex1GetStereoViewIndex()
{
int l9_0;
#if (baseTex1HasSwappedViews)
{
l9_0=1-sc_GetStereoViewIndex();
}
#else
{
l9_0=sc_GetStereoViewIndex();
}
#endif
return l9_0;
}
int baseTex0GetStereoViewIndex()
{
int l9_0;
#if (baseTex0HasSwappedViews)
{
l9_0=1-sc_GetStereoViewIndex();
}
#else
{
l9_0=sc_GetStereoViewIndex();
}
#endif
return l9_0;
}
void sc_writeFragData0(vec4 col)
{
#if (sc_ShaderCacheConstant!=0)
{
col.x+=(sc_UniformConstants.x*float(sc_ShaderCacheConstant));
}
#endif
sc_FragData0=col;
}
vec2 sc_SamplingCoordsGlobalToView(vec3 uvi,int renderingLayout,int viewIndex)
{
if (renderingLayout==1)
{
uvi.y=((2.0*uvi.y)+float(viewIndex))-1.0;
}
return uvi.xy;
}
vec2 sc_ScreenCoordsGlobalToView(vec2 uv)
{
vec2 l9_0;
#if (sc_StereoRenderingMode==1)
{
l9_0=sc_SamplingCoordsGlobalToView(vec3(uv,0.0),1,sc_GetStereoViewIndex());
}
#else
{
l9_0=uv;
}
#endif
return l9_0;
}
int sc_ScreenTextureGetStereoViewIndex()
{
int l9_0;
#if (sc_ScreenTextureHasSwappedViews)
{
l9_0=1-sc_GetStereoViewIndex();
}
#else
{
l9_0=sc_GetStereoViewIndex();
}
#endif
return l9_0;
}
vec4 sc_readFragData0()
{
#if sc_FramebufferFetch
#ifdef GL_EXT_shader_framebuffer_fetch
return sc_FragData0;
#elif defined(GL_ARM_shader_framebuffer_fetch)
return gl_LastFragColorARM;
#endif
#else
return vec4(0.0);
#endif
}
int intensityTextureGetStereoViewIndex()
{
int l9_0;
#if (intensityTextureHasSwappedViews)
{
l9_0=1-sc_GetStereoViewIndex();
}
#else
{
l9_0=sc_GetStereoViewIndex();
}
#endif
return l9_0;
}
float transformSingleColor(float original,float intMap,float target)
{
#if ((BLEND_MODE_REALISTIC||BLEND_MODE_FORGRAY)||BLEND_MODE_NOTBRIGHT)
{
return original/pow(1.0-target,intMap);
}
#else
{
#if (BLEND_MODE_DIVISION)
{
return original/(1.0-target);
}
#else
{
#if (BLEND_MODE_BRIGHT)
{
return original/pow(1.0-target,2.0-(2.0*original));
}
#endif
}
#endif
}
#endif
return 0.0;
}
vec3 RGBtoHCV(vec3 rgb)
{
vec4 l9_0;
if (rgb.y<rgb.z)
{
l9_0=vec4(rgb.zy,-1.0,0.66666669);
}
else
{
l9_0=vec4(rgb.yz,0.0,-0.33333334);
}
vec4 l9_1;
if (rgb.x<l9_0.x)
{
l9_1=vec4(l9_0.xyw,rgb.x);
}
else
{
l9_1=vec4(rgb.x,l9_0.yzx);
}
float l9_2=l9_1.x-min(l9_1.w,l9_1.y);
return vec3(abs(((l9_1.w-l9_1.y)/((6.0*l9_2)+1e-07))+l9_1.z),l9_2,l9_1.x);
}
vec3 RGBToHSL(vec3 rgb)
{
vec3 l9_0=RGBtoHCV(rgb);
float l9_1=l9_0.y;
float l9_2=l9_0.z-(l9_1*0.5);
return vec3(l9_0.x,l9_1/((1.0-abs((2.0*l9_2)-1.0))+1e-07),l9_2);
}
vec3 HUEtoRGB(float hue)
{
return clamp(vec3(abs((6.0*hue)-3.0)-1.0,2.0-abs((6.0*hue)-2.0),2.0-abs((6.0*hue)-4.0)),vec3(0.0),vec3(1.0));
}
vec3 HSLToRGB(vec3 hsl)
{
return ((HUEtoRGB(hsl.x)-vec3(0.5))*((1.0-abs((2.0*hsl.z)-1.0))*hsl.y))+vec3(hsl.z);
}
vec3 transformColor(float yValue,vec3 original,vec3 target,float weight,float intMap)
{
#if (BLEND_MODE_INTENSE)
{
return mix(original,HSLToRGB(vec3(target.x,target.y,RGBToHSL(original).z)),vec3(weight));
}
#else
{
return mix(original,clamp(vec3(transformSingleColor(yValue,intMap,target.x),transformSingleColor(yValue,intMap,target.y),transformSingleColor(yValue,intMap,target.z)),vec3(0.0),vec3(1.0)),vec3(weight));
}
#endif
}
vec3 definedBlend(vec3 a,vec3 b)
{
#if (BLEND_MODE_LIGHTEN)
{
return max(a,b);
}
#else
{
#if (BLEND_MODE_DARKEN)
{
return min(a,b);
}
#else
{
#if (BLEND_MODE_DIVIDE)
{
return b/a;
}
#else
{
#if (BLEND_MODE_AVERAGE)
{
return (a+b)*0.5;
}
#else
{
#if (BLEND_MODE_SUBTRACT)
{
return max((a+b)-vec3(1.0),vec3(0.0));
}
#else
{
#if (BLEND_MODE_DIFFERENCE)
{
return abs(a-b);
}
#else
{
#if (BLEND_MODE_NEGATION)
{
return vec3(1.0)-abs((vec3(1.0)-a)-b);
}
#else
{
#if (BLEND_MODE_EXCLUSION)
{
return (a+b)-((a*2.0)*b);
}
#else
{
#if (BLEND_MODE_OVERLAY)
{
float l9_0;
if (a.x<0.5)
{
l9_0=(2.0*a.x)*b.x;
}
else
{
l9_0=1.0-((2.0*(1.0-a.x))*(1.0-b.x));
}
float l9_1;
if (a.y<0.5)
{
l9_1=(2.0*a.y)*b.y;
}
else
{
l9_1=1.0-((2.0*(1.0-a.y))*(1.0-b.y));
}
float l9_2;
if (a.z<0.5)
{
l9_2=(2.0*a.z)*b.z;
}
else
{
l9_2=1.0-((2.0*(1.0-a.z))*(1.0-b.z));
}
return vec3(l9_0,l9_1,l9_2);
}
#else
{
#if (BLEND_MODE_SOFT_LIGHT)
{
return (((vec3(1.0)-(b*2.0))*a)*a)+((a*2.0)*b);
}
#else
{
#if (BLEND_MODE_HARD_LIGHT)
{
float l9_3;
if (b.x<0.5)
{
l9_3=(2.0*b.x)*a.x;
}
else
{
l9_3=1.0-((2.0*(1.0-b.x))*(1.0-a.x));
}
float l9_4;
if (b.y<0.5)
{
l9_4=(2.0*b.y)*a.y;
}
else
{
l9_4=1.0-((2.0*(1.0-b.y))*(1.0-a.y));
}
float l9_5;
if (b.z<0.5)
{
l9_5=(2.0*b.z)*a.z;
}
else
{
l9_5=1.0-((2.0*(1.0-b.z))*(1.0-a.z));
}
return vec3(l9_3,l9_4,l9_5);
}
#else
{
#if (BLEND_MODE_COLOR_DODGE)
{
float l9_6;
if (b.x==1.0)
{
l9_6=b.x;
}
else
{
l9_6=min(a.x/(1.0-b.x),1.0);
}
float l9_7;
if (b.y==1.0)
{
l9_7=b.y;
}
else
{
l9_7=min(a.y/(1.0-b.y),1.0);
}
float l9_8;
if (b.z==1.0)
{
l9_8=b.z;
}
else
{
l9_8=min(a.z/(1.0-b.z),1.0);
}
return vec3(l9_6,l9_7,l9_8);
}
#else
{
#if (BLEND_MODE_COLOR_BURN)
{
float l9_9;
if (b.x==0.0)
{
l9_9=b.x;
}
else
{
l9_9=max(1.0-((1.0-a.x)/b.x),0.0);
}
float l9_10;
if (b.y==0.0)
{
l9_10=b.y;
}
else
{
l9_10=max(1.0-((1.0-a.y)/b.y),0.0);
}
float l9_11;
if (b.z==0.0)
{
l9_11=b.z;
}
else
{
l9_11=max(1.0-((1.0-a.z)/b.z),0.0);
}
return vec3(l9_9,l9_10,l9_11);
}
#else
{
#if (BLEND_MODE_LINEAR_LIGHT)
{
float l9_12;
if (b.x<0.5)
{
l9_12=max((a.x+(2.0*b.x))-1.0,0.0);
}
else
{
l9_12=min(a.x+(2.0*(b.x-0.5)),1.0);
}
float l9_13;
if (b.y<0.5)
{
l9_13=max((a.y+(2.0*b.y))-1.0,0.0);
}
else
{
l9_13=min(a.y+(2.0*(b.y-0.5)),1.0);
}
float l9_14;
if (b.z<0.5)
{
l9_14=max((a.z+(2.0*b.z))-1.0,0.0);
}
else
{
l9_14=min(a.z+(2.0*(b.z-0.5)),1.0);
}
return vec3(l9_12,l9_13,l9_14);
}
#else
{
#if (BLEND_MODE_VIVID_LIGHT)
{
float l9_15;
if (b.x<0.5)
{
float l9_16;
if ((2.0*b.x)==0.0)
{
l9_16=2.0*b.x;
}
else
{
l9_16=max(1.0-((1.0-a.x)/(2.0*b.x)),0.0);
}
l9_15=l9_16;
}
else
{
float l9_17;
if ((2.0*(b.x-0.5))==1.0)
{
l9_17=2.0*(b.x-0.5);
}
else
{
l9_17=min(a.x/(1.0-(2.0*(b.x-0.5))),1.0);
}
l9_15=l9_17;
}
float l9_18;
if (b.y<0.5)
{
float l9_19;
if ((2.0*b.y)==0.0)
{
l9_19=2.0*b.y;
}
else
{
l9_19=max(1.0-((1.0-a.y)/(2.0*b.y)),0.0);
}
l9_18=l9_19;
}
else
{
float l9_20;
if ((2.0*(b.y-0.5))==1.0)
{
l9_20=2.0*(b.y-0.5);
}
else
{
l9_20=min(a.y/(1.0-(2.0*(b.y-0.5))),1.0);
}
l9_18=l9_20;
}
float l9_21;
if (b.z<0.5)
{
float l9_22;
if ((2.0*b.z)==0.0)
{
l9_22=2.0*b.z;
}
else
{
l9_22=max(1.0-((1.0-a.z)/(2.0*b.z)),0.0);
}
l9_21=l9_22;
}
else
{
float l9_23;
if ((2.0*(b.z-0.5))==1.0)
{
l9_23=2.0*(b.z-0.5);
}
else
{
l9_23=min(a.z/(1.0-(2.0*(b.z-0.5))),1.0);
}
l9_21=l9_23;
}
return vec3(l9_15,l9_18,l9_21);
}
#else
{
#if (BLEND_MODE_PIN_LIGHT)
{
float l9_24;
if (b.x<0.5)
{
l9_24=min(a.x,2.0*b.x);
}
else
{
l9_24=max(a.x,2.0*(b.x-0.5));
}
float l9_25;
if (b.y<0.5)
{
l9_25=min(a.y,2.0*b.y);
}
else
{
l9_25=max(a.y,2.0*(b.y-0.5));
}
float l9_26;
if (b.z<0.5)
{
l9_26=min(a.z,2.0*b.z);
}
else
{
l9_26=max(a.z,2.0*(b.z-0.5));
}
return vec3(l9_24,l9_25,l9_26);
}
#else
{
#if (BLEND_MODE_HARD_MIX)
{
float l9_27;
if (b.x<0.5)
{
float l9_28;
if ((2.0*b.x)==0.0)
{
l9_28=2.0*b.x;
}
else
{
l9_28=max(1.0-((1.0-a.x)/(2.0*b.x)),0.0);
}
l9_27=l9_28;
}
else
{
float l9_29;
if ((2.0*(b.x-0.5))==1.0)
{
l9_29=2.0*(b.x-0.5);
}
else
{
l9_29=min(a.x/(1.0-(2.0*(b.x-0.5))),1.0);
}
l9_27=l9_29;
}
bool l9_30=l9_27<0.5;
float l9_31;
if (b.y<0.5)
{
float l9_32;
if ((2.0*b.y)==0.0)
{
l9_32=2.0*b.y;
}
else
{
l9_32=max(1.0-((1.0-a.y)/(2.0*b.y)),0.0);
}
l9_31=l9_32;
}
else
{
float l9_33;
if ((2.0*(b.y-0.5))==1.0)
{
l9_33=2.0*(b.y-0.5);
}
else
{
l9_33=min(a.y/(1.0-(2.0*(b.y-0.5))),1.0);
}
l9_31=l9_33;
}
bool l9_34=l9_31<0.5;
float l9_35;
if (b.z<0.5)
{
float l9_36;
if ((2.0*b.z)==0.0)
{
l9_36=2.0*b.z;
}
else
{
l9_36=max(1.0-((1.0-a.z)/(2.0*b.z)),0.0);
}
l9_35=l9_36;
}
else
{
float l9_37;
if ((2.0*(b.z-0.5))==1.0)
{
l9_37=2.0*(b.z-0.5);
}
else
{
l9_37=min(a.z/(1.0-(2.0*(b.z-0.5))),1.0);
}
l9_35=l9_37;
}
return vec3(l9_30 ? 0.0 : 1.0,l9_34 ? 0.0 : 1.0,(l9_35<0.5) ? 0.0 : 1.0);
}
#else
{
#if (BLEND_MODE_HARD_REFLECT)
{
float l9_38;
if (b.x==1.0)
{
l9_38=b.x;
}
else
{
l9_38=min((a.x*a.x)/(1.0-b.x),1.0);
}
float l9_39;
if (b.y==1.0)
{
l9_39=b.y;
}
else
{
l9_39=min((a.y*a.y)/(1.0-b.y),1.0);
}
float l9_40;
if (b.z==1.0)
{
l9_40=b.z;
}
else
{
l9_40=min((a.z*a.z)/(1.0-b.z),1.0);
}
return vec3(l9_38,l9_39,l9_40);
}
#else
{
#if (BLEND_MODE_HARD_GLOW)
{
float l9_41;
if (a.x==1.0)
{
l9_41=a.x;
}
else
{
l9_41=min((b.x*b.x)/(1.0-a.x),1.0);
}
float l9_42;
if (a.y==1.0)
{
l9_42=a.y;
}
else
{
l9_42=min((b.y*b.y)/(1.0-a.y),1.0);
}
float l9_43;
if (a.z==1.0)
{
l9_43=a.z;
}
else
{
l9_43=min((b.z*b.z)/(1.0-a.z),1.0);
}
return vec3(l9_41,l9_42,l9_43);
}
#else
{
#if (BLEND_MODE_HARD_PHOENIX)
{
return (min(a,b)-max(a,b))+vec3(1.0);
}
#else
{
#if (BLEND_MODE_HUE)
{
return HSLToRGB(vec3(RGBToHSL(b).x,RGBToHSL(a).yz));
}
#else
{
#if (BLEND_MODE_SATURATION)
{
vec3 l9_44=RGBToHSL(a);
return HSLToRGB(vec3(l9_44.x,RGBToHSL(b).y,l9_44.z));
}
#else
{
#if (BLEND_MODE_COLOR)
{
return HSLToRGB(vec3(RGBToHSL(b).xy,RGBToHSL(a).z));
}
#else
{
#if (BLEND_MODE_LUMINOSITY)
{
return HSLToRGB(vec3(RGBToHSL(a).xy,RGBToHSL(b).z));
}
#else
{
vec3 l9_45=a;
vec3 l9_46=b;
float l9_47=((0.29899999*l9_45.x)+(0.58700001*l9_45.y))+(0.114*l9_45.z);
float l9_48=pow(l9_47,1.0/correctedIntensity);
vec4 l9_49;
#if (intensityTextureLayout==2)
{
bool l9_50=(int(SC_USE_CLAMP_TO_BORDER_intensityTexture)!=0)&&(!(int(SC_USE_UV_MIN_MAX_intensityTexture)!=0));
float l9_51=l9_48;
sc_SoftwareWrapEarly(l9_51,ivec2(SC_SOFTWARE_WRAP_MODE_U_intensityTexture,SC_SOFTWARE_WRAP_MODE_V_intensityTexture).x);
float l9_52=l9_51;
float l9_53=0.5;
sc_SoftwareWrapEarly(l9_53,ivec2(SC_SOFTWARE_WRAP_MODE_U_intensityTexture,SC_SOFTWARE_WRAP_MODE_V_intensityTexture).y);
float l9_54=l9_53;
vec2 l9_55;
float l9_56;
#if (SC_USE_UV_MIN_MAX_intensityTexture)
{
bool l9_57;
#if (SC_USE_CLAMP_TO_BORDER_intensityTexture)
{
l9_57=ivec2(SC_SOFTWARE_WRAP_MODE_U_intensityTexture,SC_SOFTWARE_WRAP_MODE_V_intensityTexture).x==3;
}
#else
{
l9_57=(int(SC_USE_CLAMP_TO_BORDER_intensityTexture)!=0);
}
#endif
float l9_58=l9_52;
float l9_59=1.0;
sc_ClampUV(l9_58,intensityTextureUvMinMax.x,intensityTextureUvMinMax.z,l9_57,l9_59);
float l9_60=l9_58;
float l9_61=l9_59;
bool l9_62;
#if (SC_USE_CLAMP_TO_BORDER_intensityTexture)
{
l9_62=ivec2(SC_SOFTWARE_WRAP_MODE_U_intensityTexture,SC_SOFTWARE_WRAP_MODE_V_intensityTexture).y==3;
}
#else
{
l9_62=(int(SC_USE_CLAMP_TO_BORDER_intensityTexture)!=0);
}
#endif
float l9_63=l9_54;
float l9_64=l9_61;
sc_ClampUV(l9_63,intensityTextureUvMinMax.y,intensityTextureUvMinMax.w,l9_62,l9_64);
l9_56=l9_64;
l9_55=vec2(l9_60,l9_63);
}
#else
{
l9_56=1.0;
l9_55=vec2(l9_52,l9_54);
}
#endif
vec2 l9_65=sc_TransformUV(l9_55,(int(SC_USE_UV_TRANSFORM_intensityTexture)!=0),intensityTextureTransform);
float l9_66=l9_65.x;
float l9_67=l9_56;
sc_SoftwareWrapLate(l9_66,ivec2(SC_SOFTWARE_WRAP_MODE_U_intensityTexture,SC_SOFTWARE_WRAP_MODE_V_intensityTexture).x,l9_50,l9_67);
float l9_68=l9_65.y;
float l9_69=l9_67;
sc_SoftwareWrapLate(l9_68,ivec2(SC_SOFTWARE_WRAP_MODE_U_intensityTexture,SC_SOFTWARE_WRAP_MODE_V_intensityTexture).y,l9_50,l9_69);
float l9_70=l9_69;
vec3 l9_71=sc_SamplingCoordsViewToGlobal(vec2(l9_66,l9_68),intensityTextureLayout,intensityTextureGetStereoViewIndex());
vec4 l9_72=texture(intensityTextureArrSC,l9_71,0.0);
vec4 l9_73;
#if (SC_USE_CLAMP_TO_BORDER_intensityTexture)
{
l9_73=mix(intensityTextureBorderColor,l9_72,vec4(l9_70));
}
#else
{
l9_73=l9_72;
}
#endif
l9_49=l9_73;
}
#else
{
bool l9_74=(int(SC_USE_CLAMP_TO_BORDER_intensityTexture)!=0)&&(!(int(SC_USE_UV_MIN_MAX_intensityTexture)!=0));
float l9_75=l9_48;
sc_SoftwareWrapEarly(l9_75,ivec2(SC_SOFTWARE_WRAP_MODE_U_intensityTexture,SC_SOFTWARE_WRAP_MODE_V_intensityTexture).x);
float l9_76=l9_75;
float l9_77=0.5;
sc_SoftwareWrapEarly(l9_77,ivec2(SC_SOFTWARE_WRAP_MODE_U_intensityTexture,SC_SOFTWARE_WRAP_MODE_V_intensityTexture).y);
float l9_78=l9_77;
vec2 l9_79;
float l9_80;
#if (SC_USE_UV_MIN_MAX_intensityTexture)
{
bool l9_81;
#if (SC_USE_CLAMP_TO_BORDER_intensityTexture)
{
l9_81=ivec2(SC_SOFTWARE_WRAP_MODE_U_intensityTexture,SC_SOFTWARE_WRAP_MODE_V_intensityTexture).x==3;
}
#else
{
l9_81=(int(SC_USE_CLAMP_TO_BORDER_intensityTexture)!=0);
}
#endif
float l9_82=l9_76;
float l9_83=1.0;
sc_ClampUV(l9_82,intensityTextureUvMinMax.x,intensityTextureUvMinMax.z,l9_81,l9_83);
float l9_84=l9_82;
float l9_85=l9_83;
bool l9_86;
#if (SC_USE_CLAMP_TO_BORDER_intensityTexture)
{
l9_86=ivec2(SC_SOFTWARE_WRAP_MODE_U_intensityTexture,SC_SOFTWARE_WRAP_MODE_V_intensityTexture).y==3;
}
#else
{
l9_86=(int(SC_USE_CLAMP_TO_BORDER_intensityTexture)!=0);
}
#endif
float l9_87=l9_78;
float l9_88=l9_85;
sc_ClampUV(l9_87,intensityTextureUvMinMax.y,intensityTextureUvMinMax.w,l9_86,l9_88);
l9_80=l9_88;
l9_79=vec2(l9_84,l9_87);
}
#else
{
l9_80=1.0;
l9_79=vec2(l9_76,l9_78);
}
#endif
vec2 l9_89=sc_TransformUV(l9_79,(int(SC_USE_UV_TRANSFORM_intensityTexture)!=0),intensityTextureTransform);
float l9_90=l9_89.x;
float l9_91=l9_80;
sc_SoftwareWrapLate(l9_90,ivec2(SC_SOFTWARE_WRAP_MODE_U_intensityTexture,SC_SOFTWARE_WRAP_MODE_V_intensityTexture).x,l9_74,l9_91);
float l9_92=l9_89.y;
float l9_93=l9_91;
sc_SoftwareWrapLate(l9_92,ivec2(SC_SOFTWARE_WRAP_MODE_U_intensityTexture,SC_SOFTWARE_WRAP_MODE_V_intensityTexture).y,l9_74,l9_93);
float l9_94=l9_93;
vec3 l9_95=sc_SamplingCoordsViewToGlobal(vec2(l9_90,l9_92),intensityTextureLayout,intensityTextureGetStereoViewIndex());
vec4 l9_96=texture(intensityTexture,l9_95.xy,0.0);
vec4 l9_97;
#if (SC_USE_CLAMP_TO_BORDER_intensityTexture)
{
l9_97=mix(intensityTextureBorderColor,l9_96,vec4(l9_94));
}
#else
{
l9_97=l9_96;
}
#endif
l9_49=l9_97;
}
#endif
float l9_98=((((l9_49.x*256.0)+l9_49.y)+(l9_49.z/256.0))/257.00391)*16.0;
float l9_99;
#if (BLEND_MODE_FORGRAY)
{
l9_99=max(l9_98,1.0);
}
#else
{
l9_99=l9_98;
}
#endif
float l9_100;
#if (BLEND_MODE_NOTBRIGHT)
{
l9_100=min(l9_99,1.0);
}
#else
{
l9_100=l9_99;
}
#endif
return transformColor(l9_47,l9_45,l9_46,1.0,l9_100);
}
#endif
}
#endif
}
#endif
}
#endif
}
#endif
}
#endif
}
#endif
}
#endif
}
#endif
}
#endif
}
#endif
}
#endif
}
#endif
}
#endif
}
#endif
}
#endif
}
#endif
}
#endif
}
#endif
}
#endif
}
#endif
}
#endif
}
#endif
}
#endif
}
vec4 sc_OutputMotionVectorIfNeeded(vec4 finalColor)
{
#if (sc_MotionVectorsPass)
{
float l9_0=floor(((varPosAndMotion.w*5.0)+0.5)*65535.0);
float l9_1=floor(l9_0*0.00390625);
float l9_2=floor(((varNormalAndMotion.w*5.0)+0.5)*65535.0);
float l9_3=floor(l9_2*0.00390625);
return vec4(l9_1/255.0,(l9_0-(l9_1*256.0))/255.0,l9_3/255.0,(l9_2-(l9_3*256.0))/255.0);
}
#else
{
return finalColor;
}
#endif
}
float getFrontLayerZTestEpsilon()
{
#if (sc_SkinBonesCount>0)
{
return 5e-07;
}
#else
{
return 5.0000001e-08;
}
#endif
}
void unpackValues(float channel,int passIndex,inout int values[8])
{
#if (sc_OITCompositingPass)
{
channel=floor((channel*255.0)+0.5);
int l9_0=((passIndex+1)*4)-1;
for (int snapLoopIndex=0; snapLoopIndex==0; snapLoopIndex+=0)
{
if (l9_0>=(passIndex*4))
{
values[l9_0]=(values[l9_0]*4)+int(floor(mod(channel,4.0)));
channel=floor(channel/4.0);
l9_0--;
continue;
}
else
{
break;
}
}
}
#endif
}
float getDepthOrderingEpsilon()
{
#if (sc_SkinBonesCount>0)
{
return 0.001;
}
#else
{
return 0.0;
}
#endif
}
int encodeDepth(float depth,vec2 depthBounds)
{
float l9_0=(1.0-depthBounds.x)*1000.0;
return int(clamp((depth-l9_0)/((depthBounds.y*1000.0)-l9_0),0.0,1.0)*65535.0);
}
float viewSpaceDepth()
{
#if (UseViewSpaceDepthVariant&&((sc_OITDepthGatherPass||sc_OITCompositingPass)||sc_OITDepthBoundsPass))
{
return varViewSpaceDepth;
}
#else
{
return sc_ProjectionMatrixArray[sc_GetStereoViewIndex()][3].z/(sc_ProjectionMatrixArray[sc_GetStereoViewIndex()][2].z+((gl_FragCoord.z*2.0)-1.0));
}
#endif
}
float packValue(inout int value)
{
#if (sc_OITDepthGatherPass)
{
int l9_0=value;
value/=4;
return floor(floor(mod(float(l9_0),4.0))*64.0)/255.0;
}
#else
{
return 0.0;
}
#endif
}
void main()
{
#if (sc_DepthOnly)
{
return;
}
#endif
#if ((sc_StereoRenderingMode==1)&&(sc_StereoRendering_IsClipDistanceEnabled==0))
{
if (varClipDistance<0.0)
{
discard;
}
}
#endif
bool l9_0=sc_RayTracingCasterConfiguration.x!=0u;
vec4 l9_1;
vec2 l9_2;
float l9_3;
float l9_4;
if (l9_0)
{
sc_RayTracingHitPayload l9_5=sc_RayTracingEvaluateHitPayload(ivec2(gl_FragCoord.xy));
if (l9_5.id.x!=(sc_RayTracingCasterConfiguration.y&65535u))
{
return;
}
l9_4=Interpolator_N2_float_edgeDist;
l9_3=Interpolator_N9_float_textureId;
l9_2=l9_5.uv0;
l9_1=l9_5.color;
}
else
{
l9_4=Interpolator_N2_float_edgeDist;
l9_3=Interpolator_N9_float_textureId;
l9_2=varTex01.xy;
l9_1=varColor;
}
int l9_6=int(l9_3);
float l9_7;
if (l9_4>0.0)
{
l9_7=l9_1.w*(1.0-smoothstep(0.0,1.0,l9_4));
}
else
{
l9_7=l9_1.w;
}
vec4 l9_8;
float l9_9;
if (l9_6<0)
{
l9_9=l9_7;
l9_8=l9_1;
}
else
{
int l9_10;
if (l9_6<8)
{
l9_10=l9_6;
}
else
{
l9_10=l9_6-8;
}
vec4 l9_11;
if (l9_10==0)
{
vec4 l9_12;
#if (baseTex0Layout==2)
{
bool l9_13=(int(SC_USE_CLAMP_TO_BORDER_baseTex0)!=0)&&(!(int(SC_USE_UV_MIN_MAX_baseTex0)!=0));
float l9_14=l9_2.x;
sc_SoftwareWrapEarly(l9_14,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex0,SC_SOFTWARE_WRAP_MODE_V_baseTex0).x);
float l9_15=l9_14;
float l9_16=l9_2.y;
sc_SoftwareWrapEarly(l9_16,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex0,SC_SOFTWARE_WRAP_MODE_V_baseTex0).y);
float l9_17=l9_16;
vec2 l9_18;
float l9_19;
#if (SC_USE_UV_MIN_MAX_baseTex0)
{
bool l9_20;
#if (SC_USE_CLAMP_TO_BORDER_baseTex0)
{
l9_20=ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex0,SC_SOFTWARE_WRAP_MODE_V_baseTex0).x==3;
}
#else
{
l9_20=(int(SC_USE_CLAMP_TO_BORDER_baseTex0)!=0);
}
#endif
float l9_21=l9_15;
float l9_22=1.0;
sc_ClampUV(l9_21,baseTex0UvMinMax.x,baseTex0UvMinMax.z,l9_20,l9_22);
float l9_23=l9_21;
float l9_24=l9_22;
bool l9_25;
#if (SC_USE_CLAMP_TO_BORDER_baseTex0)
{
l9_25=ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex0,SC_SOFTWARE_WRAP_MODE_V_baseTex0).y==3;
}
#else
{
l9_25=(int(SC_USE_CLAMP_TO_BORDER_baseTex0)!=0);
}
#endif
float l9_26=l9_17;
float l9_27=l9_24;
sc_ClampUV(l9_26,baseTex0UvMinMax.y,baseTex0UvMinMax.w,l9_25,l9_27);
l9_19=l9_27;
l9_18=vec2(l9_23,l9_26);
}
#else
{
l9_19=1.0;
l9_18=vec2(l9_15,l9_17);
}
#endif
vec2 l9_28=sc_TransformUV(l9_18,(int(SC_USE_UV_TRANSFORM_baseTex0)!=0),baseTex0Transform);
float l9_29=l9_28.x;
float l9_30=l9_19;
sc_SoftwareWrapLate(l9_29,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex0,SC_SOFTWARE_WRAP_MODE_V_baseTex0).x,l9_13,l9_30);
float l9_31=l9_28.y;
float l9_32=l9_30;
sc_SoftwareWrapLate(l9_31,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex0,SC_SOFTWARE_WRAP_MODE_V_baseTex0).y,l9_13,l9_32);
float l9_33=l9_32;
vec3 l9_34=sc_SamplingCoordsViewToGlobal(vec2(l9_29,l9_31),baseTex0Layout,baseTex0GetStereoViewIndex());
vec4 l9_35=texture(baseTex0ArrSC,l9_34,0.0);
vec4 l9_36;
#if (SC_USE_CLAMP_TO_BORDER_baseTex0)
{
l9_36=mix(baseTex0BorderColor,l9_35,vec4(l9_33));
}
#else
{
l9_36=l9_35;
}
#endif
l9_12=l9_36;
}
#else
{
bool l9_37=(int(SC_USE_CLAMP_TO_BORDER_baseTex0)!=0)&&(!(int(SC_USE_UV_MIN_MAX_baseTex0)!=0));
float l9_38=l9_2.x;
sc_SoftwareWrapEarly(l9_38,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex0,SC_SOFTWARE_WRAP_MODE_V_baseTex0).x);
float l9_39=l9_38;
float l9_40=l9_2.y;
sc_SoftwareWrapEarly(l9_40,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex0,SC_SOFTWARE_WRAP_MODE_V_baseTex0).y);
float l9_41=l9_40;
vec2 l9_42;
float l9_43;
#if (SC_USE_UV_MIN_MAX_baseTex0)
{
bool l9_44;
#if (SC_USE_CLAMP_TO_BORDER_baseTex0)
{
l9_44=ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex0,SC_SOFTWARE_WRAP_MODE_V_baseTex0).x==3;
}
#else
{
l9_44=(int(SC_USE_CLAMP_TO_BORDER_baseTex0)!=0);
}
#endif
float l9_45=l9_39;
float l9_46=1.0;
sc_ClampUV(l9_45,baseTex0UvMinMax.x,baseTex0UvMinMax.z,l9_44,l9_46);
float l9_47=l9_45;
float l9_48=l9_46;
bool l9_49;
#if (SC_USE_CLAMP_TO_BORDER_baseTex0)
{
l9_49=ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex0,SC_SOFTWARE_WRAP_MODE_V_baseTex0).y==3;
}
#else
{
l9_49=(int(SC_USE_CLAMP_TO_BORDER_baseTex0)!=0);
}
#endif
float l9_50=l9_41;
float l9_51=l9_48;
sc_ClampUV(l9_50,baseTex0UvMinMax.y,baseTex0UvMinMax.w,l9_49,l9_51);
l9_43=l9_51;
l9_42=vec2(l9_47,l9_50);
}
#else
{
l9_43=1.0;
l9_42=vec2(l9_39,l9_41);
}
#endif
vec2 l9_52=sc_TransformUV(l9_42,(int(SC_USE_UV_TRANSFORM_baseTex0)!=0),baseTex0Transform);
float l9_53=l9_52.x;
float l9_54=l9_43;
sc_SoftwareWrapLate(l9_53,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex0,SC_SOFTWARE_WRAP_MODE_V_baseTex0).x,l9_37,l9_54);
float l9_55=l9_52.y;
float l9_56=l9_54;
sc_SoftwareWrapLate(l9_55,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex0,SC_SOFTWARE_WRAP_MODE_V_baseTex0).y,l9_37,l9_56);
float l9_57=l9_56;
vec3 l9_58=sc_SamplingCoordsViewToGlobal(vec2(l9_53,l9_55),baseTex0Layout,baseTex0GetStereoViewIndex());
vec4 l9_59=texture(baseTex0,l9_58.xy,0.0);
vec4 l9_60;
#if (SC_USE_CLAMP_TO_BORDER_baseTex0)
{
l9_60=mix(baseTex0BorderColor,l9_59,vec4(l9_57));
}
#else
{
l9_60=l9_59;
}
#endif
l9_12=l9_60;
}
#endif
l9_11=l9_12;
}
else
{
vec4 l9_61;
if (l9_10==1)
{
vec4 l9_62;
#if (baseTex1Layout==2)
{
bool l9_63=(int(SC_USE_CLAMP_TO_BORDER_baseTex1)!=0)&&(!(int(SC_USE_UV_MIN_MAX_baseTex1)!=0));
float l9_64=l9_2.x;
sc_SoftwareWrapEarly(l9_64,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex1,SC_SOFTWARE_WRAP_MODE_V_baseTex1).x);
float l9_65=l9_64;
float l9_66=l9_2.y;
sc_SoftwareWrapEarly(l9_66,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex1,SC_SOFTWARE_WRAP_MODE_V_baseTex1).y);
float l9_67=l9_66;
vec2 l9_68;
float l9_69;
#if (SC_USE_UV_MIN_MAX_baseTex1)
{
bool l9_70;
#if (SC_USE_CLAMP_TO_BORDER_baseTex1)
{
l9_70=ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex1,SC_SOFTWARE_WRAP_MODE_V_baseTex1).x==3;
}
#else
{
l9_70=(int(SC_USE_CLAMP_TO_BORDER_baseTex1)!=0);
}
#endif
float l9_71=l9_65;
float l9_72=1.0;
sc_ClampUV(l9_71,baseTex1UvMinMax.x,baseTex1UvMinMax.z,l9_70,l9_72);
float l9_73=l9_71;
float l9_74=l9_72;
bool l9_75;
#if (SC_USE_CLAMP_TO_BORDER_baseTex1)
{
l9_75=ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex1,SC_SOFTWARE_WRAP_MODE_V_baseTex1).y==3;
}
#else
{
l9_75=(int(SC_USE_CLAMP_TO_BORDER_baseTex1)!=0);
}
#endif
float l9_76=l9_67;
float l9_77=l9_74;
sc_ClampUV(l9_76,baseTex1UvMinMax.y,baseTex1UvMinMax.w,l9_75,l9_77);
l9_69=l9_77;
l9_68=vec2(l9_73,l9_76);
}
#else
{
l9_69=1.0;
l9_68=vec2(l9_65,l9_67);
}
#endif
vec2 l9_78=sc_TransformUV(l9_68,(int(SC_USE_UV_TRANSFORM_baseTex1)!=0),baseTex1Transform);
float l9_79=l9_78.x;
float l9_80=l9_69;
sc_SoftwareWrapLate(l9_79,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex1,SC_SOFTWARE_WRAP_MODE_V_baseTex1).x,l9_63,l9_80);
float l9_81=l9_78.y;
float l9_82=l9_80;
sc_SoftwareWrapLate(l9_81,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex1,SC_SOFTWARE_WRAP_MODE_V_baseTex1).y,l9_63,l9_82);
float l9_83=l9_82;
vec3 l9_84=sc_SamplingCoordsViewToGlobal(vec2(l9_79,l9_81),baseTex1Layout,baseTex1GetStereoViewIndex());
vec4 l9_85=texture(baseTex1ArrSC,l9_84,0.0);
vec4 l9_86;
#if (SC_USE_CLAMP_TO_BORDER_baseTex1)
{
l9_86=mix(baseTex1BorderColor,l9_85,vec4(l9_83));
}
#else
{
l9_86=l9_85;
}
#endif
l9_62=l9_86;
}
#else
{
bool l9_87=(int(SC_USE_CLAMP_TO_BORDER_baseTex1)!=0)&&(!(int(SC_USE_UV_MIN_MAX_baseTex1)!=0));
float l9_88=l9_2.x;
sc_SoftwareWrapEarly(l9_88,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex1,SC_SOFTWARE_WRAP_MODE_V_baseTex1).x);
float l9_89=l9_88;
float l9_90=l9_2.y;
sc_SoftwareWrapEarly(l9_90,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex1,SC_SOFTWARE_WRAP_MODE_V_baseTex1).y);
float l9_91=l9_90;
vec2 l9_92;
float l9_93;
#if (SC_USE_UV_MIN_MAX_baseTex1)
{
bool l9_94;
#if (SC_USE_CLAMP_TO_BORDER_baseTex1)
{
l9_94=ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex1,SC_SOFTWARE_WRAP_MODE_V_baseTex1).x==3;
}
#else
{
l9_94=(int(SC_USE_CLAMP_TO_BORDER_baseTex1)!=0);
}
#endif
float l9_95=l9_89;
float l9_96=1.0;
sc_ClampUV(l9_95,baseTex1UvMinMax.x,baseTex1UvMinMax.z,l9_94,l9_96);
float l9_97=l9_95;
float l9_98=l9_96;
bool l9_99;
#if (SC_USE_CLAMP_TO_BORDER_baseTex1)
{
l9_99=ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex1,SC_SOFTWARE_WRAP_MODE_V_baseTex1).y==3;
}
#else
{
l9_99=(int(SC_USE_CLAMP_TO_BORDER_baseTex1)!=0);
}
#endif
float l9_100=l9_91;
float l9_101=l9_98;
sc_ClampUV(l9_100,baseTex1UvMinMax.y,baseTex1UvMinMax.w,l9_99,l9_101);
l9_93=l9_101;
l9_92=vec2(l9_97,l9_100);
}
#else
{
l9_93=1.0;
l9_92=vec2(l9_89,l9_91);
}
#endif
vec2 l9_102=sc_TransformUV(l9_92,(int(SC_USE_UV_TRANSFORM_baseTex1)!=0),baseTex1Transform);
float l9_103=l9_102.x;
float l9_104=l9_93;
sc_SoftwareWrapLate(l9_103,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex1,SC_SOFTWARE_WRAP_MODE_V_baseTex1).x,l9_87,l9_104);
float l9_105=l9_102.y;
float l9_106=l9_104;
sc_SoftwareWrapLate(l9_105,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex1,SC_SOFTWARE_WRAP_MODE_V_baseTex1).y,l9_87,l9_106);
float l9_107=l9_106;
vec3 l9_108=sc_SamplingCoordsViewToGlobal(vec2(l9_103,l9_105),baseTex1Layout,baseTex1GetStereoViewIndex());
vec4 l9_109=texture(baseTex1,l9_108.xy,0.0);
vec4 l9_110;
#if (SC_USE_CLAMP_TO_BORDER_baseTex1)
{
l9_110=mix(baseTex1BorderColor,l9_109,vec4(l9_107));
}
#else
{
l9_110=l9_109;
}
#endif
l9_62=l9_110;
}
#endif
l9_61=l9_62;
}
else
{
vec4 l9_111;
if (l9_10==2)
{
vec4 l9_112;
#if (baseTex2Layout==2)
{
bool l9_113=(int(SC_USE_CLAMP_TO_BORDER_baseTex2)!=0)&&(!(int(SC_USE_UV_MIN_MAX_baseTex2)!=0));
float l9_114=l9_2.x;
sc_SoftwareWrapEarly(l9_114,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex2,SC_SOFTWARE_WRAP_MODE_V_baseTex2).x);
float l9_115=l9_114;
float l9_116=l9_2.y;
sc_SoftwareWrapEarly(l9_116,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex2,SC_SOFTWARE_WRAP_MODE_V_baseTex2).y);
float l9_117=l9_116;
vec2 l9_118;
float l9_119;
#if (SC_USE_UV_MIN_MAX_baseTex2)
{
bool l9_120;
#if (SC_USE_CLAMP_TO_BORDER_baseTex2)
{
l9_120=ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex2,SC_SOFTWARE_WRAP_MODE_V_baseTex2).x==3;
}
#else
{
l9_120=(int(SC_USE_CLAMP_TO_BORDER_baseTex2)!=0);
}
#endif
float l9_121=l9_115;
float l9_122=1.0;
sc_ClampUV(l9_121,baseTex2UvMinMax.x,baseTex2UvMinMax.z,l9_120,l9_122);
float l9_123=l9_121;
float l9_124=l9_122;
bool l9_125;
#if (SC_USE_CLAMP_TO_BORDER_baseTex2)
{
l9_125=ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex2,SC_SOFTWARE_WRAP_MODE_V_baseTex2).y==3;
}
#else
{
l9_125=(int(SC_USE_CLAMP_TO_BORDER_baseTex2)!=0);
}
#endif
float l9_126=l9_117;
float l9_127=l9_124;
sc_ClampUV(l9_126,baseTex2UvMinMax.y,baseTex2UvMinMax.w,l9_125,l9_127);
l9_119=l9_127;
l9_118=vec2(l9_123,l9_126);
}
#else
{
l9_119=1.0;
l9_118=vec2(l9_115,l9_117);
}
#endif
vec2 l9_128=sc_TransformUV(l9_118,(int(SC_USE_UV_TRANSFORM_baseTex2)!=0),baseTex2Transform);
float l9_129=l9_128.x;
float l9_130=l9_119;
sc_SoftwareWrapLate(l9_129,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex2,SC_SOFTWARE_WRAP_MODE_V_baseTex2).x,l9_113,l9_130);
float l9_131=l9_128.y;
float l9_132=l9_130;
sc_SoftwareWrapLate(l9_131,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex2,SC_SOFTWARE_WRAP_MODE_V_baseTex2).y,l9_113,l9_132);
float l9_133=l9_132;
vec3 l9_134=sc_SamplingCoordsViewToGlobal(vec2(l9_129,l9_131),baseTex2Layout,baseTex2GetStereoViewIndex());
vec4 l9_135=texture(baseTex2ArrSC,l9_134,0.0);
vec4 l9_136;
#if (SC_USE_CLAMP_TO_BORDER_baseTex2)
{
l9_136=mix(baseTex2BorderColor,l9_135,vec4(l9_133));
}
#else
{
l9_136=l9_135;
}
#endif
l9_112=l9_136;
}
#else
{
bool l9_137=(int(SC_USE_CLAMP_TO_BORDER_baseTex2)!=0)&&(!(int(SC_USE_UV_MIN_MAX_baseTex2)!=0));
float l9_138=l9_2.x;
sc_SoftwareWrapEarly(l9_138,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex2,SC_SOFTWARE_WRAP_MODE_V_baseTex2).x);
float l9_139=l9_138;
float l9_140=l9_2.y;
sc_SoftwareWrapEarly(l9_140,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex2,SC_SOFTWARE_WRAP_MODE_V_baseTex2).y);
float l9_141=l9_140;
vec2 l9_142;
float l9_143;
#if (SC_USE_UV_MIN_MAX_baseTex2)
{
bool l9_144;
#if (SC_USE_CLAMP_TO_BORDER_baseTex2)
{
l9_144=ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex2,SC_SOFTWARE_WRAP_MODE_V_baseTex2).x==3;
}
#else
{
l9_144=(int(SC_USE_CLAMP_TO_BORDER_baseTex2)!=0);
}
#endif
float l9_145=l9_139;
float l9_146=1.0;
sc_ClampUV(l9_145,baseTex2UvMinMax.x,baseTex2UvMinMax.z,l9_144,l9_146);
float l9_147=l9_145;
float l9_148=l9_146;
bool l9_149;
#if (SC_USE_CLAMP_TO_BORDER_baseTex2)
{
l9_149=ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex2,SC_SOFTWARE_WRAP_MODE_V_baseTex2).y==3;
}
#else
{
l9_149=(int(SC_USE_CLAMP_TO_BORDER_baseTex2)!=0);
}
#endif
float l9_150=l9_141;
float l9_151=l9_148;
sc_ClampUV(l9_150,baseTex2UvMinMax.y,baseTex2UvMinMax.w,l9_149,l9_151);
l9_143=l9_151;
l9_142=vec2(l9_147,l9_150);
}
#else
{
l9_143=1.0;
l9_142=vec2(l9_139,l9_141);
}
#endif
vec2 l9_152=sc_TransformUV(l9_142,(int(SC_USE_UV_TRANSFORM_baseTex2)!=0),baseTex2Transform);
float l9_153=l9_152.x;
float l9_154=l9_143;
sc_SoftwareWrapLate(l9_153,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex2,SC_SOFTWARE_WRAP_MODE_V_baseTex2).x,l9_137,l9_154);
float l9_155=l9_152.y;
float l9_156=l9_154;
sc_SoftwareWrapLate(l9_155,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex2,SC_SOFTWARE_WRAP_MODE_V_baseTex2).y,l9_137,l9_156);
float l9_157=l9_156;
vec3 l9_158=sc_SamplingCoordsViewToGlobal(vec2(l9_153,l9_155),baseTex2Layout,baseTex2GetStereoViewIndex());
vec4 l9_159=texture(baseTex2,l9_158.xy,0.0);
vec4 l9_160;
#if (SC_USE_CLAMP_TO_BORDER_baseTex2)
{
l9_160=mix(baseTex2BorderColor,l9_159,vec4(l9_157));
}
#else
{
l9_160=l9_159;
}
#endif
l9_112=l9_160;
}
#endif
l9_111=l9_112;
}
else
{
vec4 l9_161;
if (l9_10==3)
{
vec4 l9_162;
#if (baseTex3Layout==2)
{
bool l9_163=(int(SC_USE_CLAMP_TO_BORDER_baseTex3)!=0)&&(!(int(SC_USE_UV_MIN_MAX_baseTex3)!=0));
float l9_164=l9_2.x;
sc_SoftwareWrapEarly(l9_164,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex3,SC_SOFTWARE_WRAP_MODE_V_baseTex3).x);
float l9_165=l9_164;
float l9_166=l9_2.y;
sc_SoftwareWrapEarly(l9_166,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex3,SC_SOFTWARE_WRAP_MODE_V_baseTex3).y);
float l9_167=l9_166;
vec2 l9_168;
float l9_169;
#if (SC_USE_UV_MIN_MAX_baseTex3)
{
bool l9_170;
#if (SC_USE_CLAMP_TO_BORDER_baseTex3)
{
l9_170=ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex3,SC_SOFTWARE_WRAP_MODE_V_baseTex3).x==3;
}
#else
{
l9_170=(int(SC_USE_CLAMP_TO_BORDER_baseTex3)!=0);
}
#endif
float l9_171=l9_165;
float l9_172=1.0;
sc_ClampUV(l9_171,baseTex3UvMinMax.x,baseTex3UvMinMax.z,l9_170,l9_172);
float l9_173=l9_171;
float l9_174=l9_172;
bool l9_175;
#if (SC_USE_CLAMP_TO_BORDER_baseTex3)
{
l9_175=ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex3,SC_SOFTWARE_WRAP_MODE_V_baseTex3).y==3;
}
#else
{
l9_175=(int(SC_USE_CLAMP_TO_BORDER_baseTex3)!=0);
}
#endif
float l9_176=l9_167;
float l9_177=l9_174;
sc_ClampUV(l9_176,baseTex3UvMinMax.y,baseTex3UvMinMax.w,l9_175,l9_177);
l9_169=l9_177;
l9_168=vec2(l9_173,l9_176);
}
#else
{
l9_169=1.0;
l9_168=vec2(l9_165,l9_167);
}
#endif
vec2 l9_178=sc_TransformUV(l9_168,(int(SC_USE_UV_TRANSFORM_baseTex3)!=0),baseTex3Transform);
float l9_179=l9_178.x;
float l9_180=l9_169;
sc_SoftwareWrapLate(l9_179,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex3,SC_SOFTWARE_WRAP_MODE_V_baseTex3).x,l9_163,l9_180);
float l9_181=l9_178.y;
float l9_182=l9_180;
sc_SoftwareWrapLate(l9_181,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex3,SC_SOFTWARE_WRAP_MODE_V_baseTex3).y,l9_163,l9_182);
float l9_183=l9_182;
vec3 l9_184=sc_SamplingCoordsViewToGlobal(vec2(l9_179,l9_181),baseTex3Layout,baseTex3GetStereoViewIndex());
vec4 l9_185=texture(baseTex3ArrSC,l9_184,0.0);
vec4 l9_186;
#if (SC_USE_CLAMP_TO_BORDER_baseTex3)
{
l9_186=mix(baseTex3BorderColor,l9_185,vec4(l9_183));
}
#else
{
l9_186=l9_185;
}
#endif
l9_162=l9_186;
}
#else
{
bool l9_187=(int(SC_USE_CLAMP_TO_BORDER_baseTex3)!=0)&&(!(int(SC_USE_UV_MIN_MAX_baseTex3)!=0));
float l9_188=l9_2.x;
sc_SoftwareWrapEarly(l9_188,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex3,SC_SOFTWARE_WRAP_MODE_V_baseTex3).x);
float l9_189=l9_188;
float l9_190=l9_2.y;
sc_SoftwareWrapEarly(l9_190,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex3,SC_SOFTWARE_WRAP_MODE_V_baseTex3).y);
float l9_191=l9_190;
vec2 l9_192;
float l9_193;
#if (SC_USE_UV_MIN_MAX_baseTex3)
{
bool l9_194;
#if (SC_USE_CLAMP_TO_BORDER_baseTex3)
{
l9_194=ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex3,SC_SOFTWARE_WRAP_MODE_V_baseTex3).x==3;
}
#else
{
l9_194=(int(SC_USE_CLAMP_TO_BORDER_baseTex3)!=0);
}
#endif
float l9_195=l9_189;
float l9_196=1.0;
sc_ClampUV(l9_195,baseTex3UvMinMax.x,baseTex3UvMinMax.z,l9_194,l9_196);
float l9_197=l9_195;
float l9_198=l9_196;
bool l9_199;
#if (SC_USE_CLAMP_TO_BORDER_baseTex3)
{
l9_199=ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex3,SC_SOFTWARE_WRAP_MODE_V_baseTex3).y==3;
}
#else
{
l9_199=(int(SC_USE_CLAMP_TO_BORDER_baseTex3)!=0);
}
#endif
float l9_200=l9_191;
float l9_201=l9_198;
sc_ClampUV(l9_200,baseTex3UvMinMax.y,baseTex3UvMinMax.w,l9_199,l9_201);
l9_193=l9_201;
l9_192=vec2(l9_197,l9_200);
}
#else
{
l9_193=1.0;
l9_192=vec2(l9_189,l9_191);
}
#endif
vec2 l9_202=sc_TransformUV(l9_192,(int(SC_USE_UV_TRANSFORM_baseTex3)!=0),baseTex3Transform);
float l9_203=l9_202.x;
float l9_204=l9_193;
sc_SoftwareWrapLate(l9_203,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex3,SC_SOFTWARE_WRAP_MODE_V_baseTex3).x,l9_187,l9_204);
float l9_205=l9_202.y;
float l9_206=l9_204;
sc_SoftwareWrapLate(l9_205,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex3,SC_SOFTWARE_WRAP_MODE_V_baseTex3).y,l9_187,l9_206);
float l9_207=l9_206;
vec3 l9_208=sc_SamplingCoordsViewToGlobal(vec2(l9_203,l9_205),baseTex3Layout,baseTex3GetStereoViewIndex());
vec4 l9_209=texture(baseTex3,l9_208.xy,0.0);
vec4 l9_210;
#if (SC_USE_CLAMP_TO_BORDER_baseTex3)
{
l9_210=mix(baseTex3BorderColor,l9_209,vec4(l9_207));
}
#else
{
l9_210=l9_209;
}
#endif
l9_162=l9_210;
}
#endif
l9_161=l9_162;
}
else
{
vec4 l9_211;
if (l9_10==4)
{
vec4 l9_212;
#if (baseTex4Layout==2)
{
bool l9_213=(int(SC_USE_CLAMP_TO_BORDER_baseTex4)!=0)&&(!(int(SC_USE_UV_MIN_MAX_baseTex4)!=0));
float l9_214=l9_2.x;
sc_SoftwareWrapEarly(l9_214,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex4,SC_SOFTWARE_WRAP_MODE_V_baseTex4).x);
float l9_215=l9_214;
float l9_216=l9_2.y;
sc_SoftwareWrapEarly(l9_216,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex4,SC_SOFTWARE_WRAP_MODE_V_baseTex4).y);
float l9_217=l9_216;
vec2 l9_218;
float l9_219;
#if (SC_USE_UV_MIN_MAX_baseTex4)
{
bool l9_220;
#if (SC_USE_CLAMP_TO_BORDER_baseTex4)
{
l9_220=ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex4,SC_SOFTWARE_WRAP_MODE_V_baseTex4).x==3;
}
#else
{
l9_220=(int(SC_USE_CLAMP_TO_BORDER_baseTex4)!=0);
}
#endif
float l9_221=l9_215;
float l9_222=1.0;
sc_ClampUV(l9_221,baseTex4UvMinMax.x,baseTex4UvMinMax.z,l9_220,l9_222);
float l9_223=l9_221;
float l9_224=l9_222;
bool l9_225;
#if (SC_USE_CLAMP_TO_BORDER_baseTex4)
{
l9_225=ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex4,SC_SOFTWARE_WRAP_MODE_V_baseTex4).y==3;
}
#else
{
l9_225=(int(SC_USE_CLAMP_TO_BORDER_baseTex4)!=0);
}
#endif
float l9_226=l9_217;
float l9_227=l9_224;
sc_ClampUV(l9_226,baseTex4UvMinMax.y,baseTex4UvMinMax.w,l9_225,l9_227);
l9_219=l9_227;
l9_218=vec2(l9_223,l9_226);
}
#else
{
l9_219=1.0;
l9_218=vec2(l9_215,l9_217);
}
#endif
vec2 l9_228=sc_TransformUV(l9_218,(int(SC_USE_UV_TRANSFORM_baseTex4)!=0),baseTex4Transform);
float l9_229=l9_228.x;
float l9_230=l9_219;
sc_SoftwareWrapLate(l9_229,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex4,SC_SOFTWARE_WRAP_MODE_V_baseTex4).x,l9_213,l9_230);
float l9_231=l9_228.y;
float l9_232=l9_230;
sc_SoftwareWrapLate(l9_231,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex4,SC_SOFTWARE_WRAP_MODE_V_baseTex4).y,l9_213,l9_232);
float l9_233=l9_232;
vec3 l9_234=sc_SamplingCoordsViewToGlobal(vec2(l9_229,l9_231),baseTex4Layout,baseTex4GetStereoViewIndex());
vec4 l9_235=texture(baseTex4ArrSC,l9_234,0.0);
vec4 l9_236;
#if (SC_USE_CLAMP_TO_BORDER_baseTex4)
{
l9_236=mix(baseTex4BorderColor,l9_235,vec4(l9_233));
}
#else
{
l9_236=l9_235;
}
#endif
l9_212=l9_236;
}
#else
{
bool l9_237=(int(SC_USE_CLAMP_TO_BORDER_baseTex4)!=0)&&(!(int(SC_USE_UV_MIN_MAX_baseTex4)!=0));
float l9_238=l9_2.x;
sc_SoftwareWrapEarly(l9_238,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex4,SC_SOFTWARE_WRAP_MODE_V_baseTex4).x);
float l9_239=l9_238;
float l9_240=l9_2.y;
sc_SoftwareWrapEarly(l9_240,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex4,SC_SOFTWARE_WRAP_MODE_V_baseTex4).y);
float l9_241=l9_240;
vec2 l9_242;
float l9_243;
#if (SC_USE_UV_MIN_MAX_baseTex4)
{
bool l9_244;
#if (SC_USE_CLAMP_TO_BORDER_baseTex4)
{
l9_244=ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex4,SC_SOFTWARE_WRAP_MODE_V_baseTex4).x==3;
}
#else
{
l9_244=(int(SC_USE_CLAMP_TO_BORDER_baseTex4)!=0);
}
#endif
float l9_245=l9_239;
float l9_246=1.0;
sc_ClampUV(l9_245,baseTex4UvMinMax.x,baseTex4UvMinMax.z,l9_244,l9_246);
float l9_247=l9_245;
float l9_248=l9_246;
bool l9_249;
#if (SC_USE_CLAMP_TO_BORDER_baseTex4)
{
l9_249=ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex4,SC_SOFTWARE_WRAP_MODE_V_baseTex4).y==3;
}
#else
{
l9_249=(int(SC_USE_CLAMP_TO_BORDER_baseTex4)!=0);
}
#endif
float l9_250=l9_241;
float l9_251=l9_248;
sc_ClampUV(l9_250,baseTex4UvMinMax.y,baseTex4UvMinMax.w,l9_249,l9_251);
l9_243=l9_251;
l9_242=vec2(l9_247,l9_250);
}
#else
{
l9_243=1.0;
l9_242=vec2(l9_239,l9_241);
}
#endif
vec2 l9_252=sc_TransformUV(l9_242,(int(SC_USE_UV_TRANSFORM_baseTex4)!=0),baseTex4Transform);
float l9_253=l9_252.x;
float l9_254=l9_243;
sc_SoftwareWrapLate(l9_253,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex4,SC_SOFTWARE_WRAP_MODE_V_baseTex4).x,l9_237,l9_254);
float l9_255=l9_252.y;
float l9_256=l9_254;
sc_SoftwareWrapLate(l9_255,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex4,SC_SOFTWARE_WRAP_MODE_V_baseTex4).y,l9_237,l9_256);
float l9_257=l9_256;
vec3 l9_258=sc_SamplingCoordsViewToGlobal(vec2(l9_253,l9_255),baseTex4Layout,baseTex4GetStereoViewIndex());
vec4 l9_259=texture(baseTex4,l9_258.xy,0.0);
vec4 l9_260;
#if (SC_USE_CLAMP_TO_BORDER_baseTex4)
{
l9_260=mix(baseTex4BorderColor,l9_259,vec4(l9_257));
}
#else
{
l9_260=l9_259;
}
#endif
l9_212=l9_260;
}
#endif
l9_211=l9_212;
}
else
{
vec4 l9_261;
if (l9_10==5)
{
vec4 l9_262;
#if (baseTex5Layout==2)
{
bool l9_263=(int(SC_USE_CLAMP_TO_BORDER_baseTex5)!=0)&&(!(int(SC_USE_UV_MIN_MAX_baseTex5)!=0));
float l9_264=l9_2.x;
sc_SoftwareWrapEarly(l9_264,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex5,SC_SOFTWARE_WRAP_MODE_V_baseTex5).x);
float l9_265=l9_264;
float l9_266=l9_2.y;
sc_SoftwareWrapEarly(l9_266,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex5,SC_SOFTWARE_WRAP_MODE_V_baseTex5).y);
float l9_267=l9_266;
vec2 l9_268;
float l9_269;
#if (SC_USE_UV_MIN_MAX_baseTex5)
{
bool l9_270;
#if (SC_USE_CLAMP_TO_BORDER_baseTex5)
{
l9_270=ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex5,SC_SOFTWARE_WRAP_MODE_V_baseTex5).x==3;
}
#else
{
l9_270=(int(SC_USE_CLAMP_TO_BORDER_baseTex5)!=0);
}
#endif
float l9_271=l9_265;
float l9_272=1.0;
sc_ClampUV(l9_271,baseTex5UvMinMax.x,baseTex5UvMinMax.z,l9_270,l9_272);
float l9_273=l9_271;
float l9_274=l9_272;
bool l9_275;
#if (SC_USE_CLAMP_TO_BORDER_baseTex5)
{
l9_275=ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex5,SC_SOFTWARE_WRAP_MODE_V_baseTex5).y==3;
}
#else
{
l9_275=(int(SC_USE_CLAMP_TO_BORDER_baseTex5)!=0);
}
#endif
float l9_276=l9_267;
float l9_277=l9_274;
sc_ClampUV(l9_276,baseTex5UvMinMax.y,baseTex5UvMinMax.w,l9_275,l9_277);
l9_269=l9_277;
l9_268=vec2(l9_273,l9_276);
}
#else
{
l9_269=1.0;
l9_268=vec2(l9_265,l9_267);
}
#endif
vec2 l9_278=sc_TransformUV(l9_268,(int(SC_USE_UV_TRANSFORM_baseTex5)!=0),baseTex5Transform);
float l9_279=l9_278.x;
float l9_280=l9_269;
sc_SoftwareWrapLate(l9_279,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex5,SC_SOFTWARE_WRAP_MODE_V_baseTex5).x,l9_263,l9_280);
float l9_281=l9_278.y;
float l9_282=l9_280;
sc_SoftwareWrapLate(l9_281,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex5,SC_SOFTWARE_WRAP_MODE_V_baseTex5).y,l9_263,l9_282);
float l9_283=l9_282;
vec3 l9_284=sc_SamplingCoordsViewToGlobal(vec2(l9_279,l9_281),baseTex5Layout,baseTex5GetStereoViewIndex());
vec4 l9_285=texture(baseTex5ArrSC,l9_284,0.0);
vec4 l9_286;
#if (SC_USE_CLAMP_TO_BORDER_baseTex5)
{
l9_286=mix(baseTex5BorderColor,l9_285,vec4(l9_283));
}
#else
{
l9_286=l9_285;
}
#endif
l9_262=l9_286;
}
#else
{
bool l9_287=(int(SC_USE_CLAMP_TO_BORDER_baseTex5)!=0)&&(!(int(SC_USE_UV_MIN_MAX_baseTex5)!=0));
float l9_288=l9_2.x;
sc_SoftwareWrapEarly(l9_288,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex5,SC_SOFTWARE_WRAP_MODE_V_baseTex5).x);
float l9_289=l9_288;
float l9_290=l9_2.y;
sc_SoftwareWrapEarly(l9_290,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex5,SC_SOFTWARE_WRAP_MODE_V_baseTex5).y);
float l9_291=l9_290;
vec2 l9_292;
float l9_293;
#if (SC_USE_UV_MIN_MAX_baseTex5)
{
bool l9_294;
#if (SC_USE_CLAMP_TO_BORDER_baseTex5)
{
l9_294=ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex5,SC_SOFTWARE_WRAP_MODE_V_baseTex5).x==3;
}
#else
{
l9_294=(int(SC_USE_CLAMP_TO_BORDER_baseTex5)!=0);
}
#endif
float l9_295=l9_289;
float l9_296=1.0;
sc_ClampUV(l9_295,baseTex5UvMinMax.x,baseTex5UvMinMax.z,l9_294,l9_296);
float l9_297=l9_295;
float l9_298=l9_296;
bool l9_299;
#if (SC_USE_CLAMP_TO_BORDER_baseTex5)
{
l9_299=ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex5,SC_SOFTWARE_WRAP_MODE_V_baseTex5).y==3;
}
#else
{
l9_299=(int(SC_USE_CLAMP_TO_BORDER_baseTex5)!=0);
}
#endif
float l9_300=l9_291;
float l9_301=l9_298;
sc_ClampUV(l9_300,baseTex5UvMinMax.y,baseTex5UvMinMax.w,l9_299,l9_301);
l9_293=l9_301;
l9_292=vec2(l9_297,l9_300);
}
#else
{
l9_293=1.0;
l9_292=vec2(l9_289,l9_291);
}
#endif
vec2 l9_302=sc_TransformUV(l9_292,(int(SC_USE_UV_TRANSFORM_baseTex5)!=0),baseTex5Transform);
float l9_303=l9_302.x;
float l9_304=l9_293;
sc_SoftwareWrapLate(l9_303,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex5,SC_SOFTWARE_WRAP_MODE_V_baseTex5).x,l9_287,l9_304);
float l9_305=l9_302.y;
float l9_306=l9_304;
sc_SoftwareWrapLate(l9_305,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex5,SC_SOFTWARE_WRAP_MODE_V_baseTex5).y,l9_287,l9_306);
float l9_307=l9_306;
vec3 l9_308=sc_SamplingCoordsViewToGlobal(vec2(l9_303,l9_305),baseTex5Layout,baseTex5GetStereoViewIndex());
vec4 l9_309=texture(baseTex5,l9_308.xy,0.0);
vec4 l9_310;
#if (SC_USE_CLAMP_TO_BORDER_baseTex5)
{
l9_310=mix(baseTex5BorderColor,l9_309,vec4(l9_307));
}
#else
{
l9_310=l9_309;
}
#endif
l9_262=l9_310;
}
#endif
l9_261=l9_262;
}
else
{
vec4 l9_311;
if (l9_10==6)
{
vec4 l9_312;
#if (baseTex6Layout==2)
{
bool l9_313=(int(SC_USE_CLAMP_TO_BORDER_baseTex6)!=0)&&(!(int(SC_USE_UV_MIN_MAX_baseTex6)!=0));
float l9_314=l9_2.x;
sc_SoftwareWrapEarly(l9_314,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex6,SC_SOFTWARE_WRAP_MODE_V_baseTex6).x);
float l9_315=l9_314;
float l9_316=l9_2.y;
sc_SoftwareWrapEarly(l9_316,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex6,SC_SOFTWARE_WRAP_MODE_V_baseTex6).y);
float l9_317=l9_316;
vec2 l9_318;
float l9_319;
#if (SC_USE_UV_MIN_MAX_baseTex6)
{
bool l9_320;
#if (SC_USE_CLAMP_TO_BORDER_baseTex6)
{
l9_320=ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex6,SC_SOFTWARE_WRAP_MODE_V_baseTex6).x==3;
}
#else
{
l9_320=(int(SC_USE_CLAMP_TO_BORDER_baseTex6)!=0);
}
#endif
float l9_321=l9_315;
float l9_322=1.0;
sc_ClampUV(l9_321,baseTex6UvMinMax.x,baseTex6UvMinMax.z,l9_320,l9_322);
float l9_323=l9_321;
float l9_324=l9_322;
bool l9_325;
#if (SC_USE_CLAMP_TO_BORDER_baseTex6)
{
l9_325=ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex6,SC_SOFTWARE_WRAP_MODE_V_baseTex6).y==3;
}
#else
{
l9_325=(int(SC_USE_CLAMP_TO_BORDER_baseTex6)!=0);
}
#endif
float l9_326=l9_317;
float l9_327=l9_324;
sc_ClampUV(l9_326,baseTex6UvMinMax.y,baseTex6UvMinMax.w,l9_325,l9_327);
l9_319=l9_327;
l9_318=vec2(l9_323,l9_326);
}
#else
{
l9_319=1.0;
l9_318=vec2(l9_315,l9_317);
}
#endif
vec2 l9_328=sc_TransformUV(l9_318,(int(SC_USE_UV_TRANSFORM_baseTex6)!=0),baseTex6Transform);
float l9_329=l9_328.x;
float l9_330=l9_319;
sc_SoftwareWrapLate(l9_329,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex6,SC_SOFTWARE_WRAP_MODE_V_baseTex6).x,l9_313,l9_330);
float l9_331=l9_328.y;
float l9_332=l9_330;
sc_SoftwareWrapLate(l9_331,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex6,SC_SOFTWARE_WRAP_MODE_V_baseTex6).y,l9_313,l9_332);
float l9_333=l9_332;
vec3 l9_334=sc_SamplingCoordsViewToGlobal(vec2(l9_329,l9_331),baseTex6Layout,baseTex6GetStereoViewIndex());
vec4 l9_335=texture(baseTex6ArrSC,l9_334,0.0);
vec4 l9_336;
#if (SC_USE_CLAMP_TO_BORDER_baseTex6)
{
l9_336=mix(baseTex6BorderColor,l9_335,vec4(l9_333));
}
#else
{
l9_336=l9_335;
}
#endif
l9_312=l9_336;
}
#else
{
bool l9_337=(int(SC_USE_CLAMP_TO_BORDER_baseTex6)!=0)&&(!(int(SC_USE_UV_MIN_MAX_baseTex6)!=0));
float l9_338=l9_2.x;
sc_SoftwareWrapEarly(l9_338,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex6,SC_SOFTWARE_WRAP_MODE_V_baseTex6).x);
float l9_339=l9_338;
float l9_340=l9_2.y;
sc_SoftwareWrapEarly(l9_340,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex6,SC_SOFTWARE_WRAP_MODE_V_baseTex6).y);
float l9_341=l9_340;
vec2 l9_342;
float l9_343;
#if (SC_USE_UV_MIN_MAX_baseTex6)
{
bool l9_344;
#if (SC_USE_CLAMP_TO_BORDER_baseTex6)
{
l9_344=ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex6,SC_SOFTWARE_WRAP_MODE_V_baseTex6).x==3;
}
#else
{
l9_344=(int(SC_USE_CLAMP_TO_BORDER_baseTex6)!=0);
}
#endif
float l9_345=l9_339;
float l9_346=1.0;
sc_ClampUV(l9_345,baseTex6UvMinMax.x,baseTex6UvMinMax.z,l9_344,l9_346);
float l9_347=l9_345;
float l9_348=l9_346;
bool l9_349;
#if (SC_USE_CLAMP_TO_BORDER_baseTex6)
{
l9_349=ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex6,SC_SOFTWARE_WRAP_MODE_V_baseTex6).y==3;
}
#else
{
l9_349=(int(SC_USE_CLAMP_TO_BORDER_baseTex6)!=0);
}
#endif
float l9_350=l9_341;
float l9_351=l9_348;
sc_ClampUV(l9_350,baseTex6UvMinMax.y,baseTex6UvMinMax.w,l9_349,l9_351);
l9_343=l9_351;
l9_342=vec2(l9_347,l9_350);
}
#else
{
l9_343=1.0;
l9_342=vec2(l9_339,l9_341);
}
#endif
vec2 l9_352=sc_TransformUV(l9_342,(int(SC_USE_UV_TRANSFORM_baseTex6)!=0),baseTex6Transform);
float l9_353=l9_352.x;
float l9_354=l9_343;
sc_SoftwareWrapLate(l9_353,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex6,SC_SOFTWARE_WRAP_MODE_V_baseTex6).x,l9_337,l9_354);
float l9_355=l9_352.y;
float l9_356=l9_354;
sc_SoftwareWrapLate(l9_355,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex6,SC_SOFTWARE_WRAP_MODE_V_baseTex6).y,l9_337,l9_356);
float l9_357=l9_356;
vec3 l9_358=sc_SamplingCoordsViewToGlobal(vec2(l9_353,l9_355),baseTex6Layout,baseTex6GetStereoViewIndex());
vec4 l9_359=texture(baseTex6,l9_358.xy,0.0);
vec4 l9_360;
#if (SC_USE_CLAMP_TO_BORDER_baseTex6)
{
l9_360=mix(baseTex6BorderColor,l9_359,vec4(l9_357));
}
#else
{
l9_360=l9_359;
}
#endif
l9_312=l9_360;
}
#endif
l9_311=l9_312;
}
else
{
vec4 l9_361;
#if (baseTex7Layout==2)
{
bool l9_362=(int(SC_USE_CLAMP_TO_BORDER_baseTex7)!=0)&&(!(int(SC_USE_UV_MIN_MAX_baseTex7)!=0));
float l9_363=l9_2.x;
sc_SoftwareWrapEarly(l9_363,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex7,SC_SOFTWARE_WRAP_MODE_V_baseTex7).x);
float l9_364=l9_363;
float l9_365=l9_2.y;
sc_SoftwareWrapEarly(l9_365,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex7,SC_SOFTWARE_WRAP_MODE_V_baseTex7).y);
float l9_366=l9_365;
vec2 l9_367;
float l9_368;
#if (SC_USE_UV_MIN_MAX_baseTex7)
{
bool l9_369;
#if (SC_USE_CLAMP_TO_BORDER_baseTex7)
{
l9_369=ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex7,SC_SOFTWARE_WRAP_MODE_V_baseTex7).x==3;
}
#else
{
l9_369=(int(SC_USE_CLAMP_TO_BORDER_baseTex7)!=0);
}
#endif
float l9_370=l9_364;
float l9_371=1.0;
sc_ClampUV(l9_370,baseTex7UvMinMax.x,baseTex7UvMinMax.z,l9_369,l9_371);
float l9_372=l9_370;
float l9_373=l9_371;
bool l9_374;
#if (SC_USE_CLAMP_TO_BORDER_baseTex7)
{
l9_374=ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex7,SC_SOFTWARE_WRAP_MODE_V_baseTex7).y==3;
}
#else
{
l9_374=(int(SC_USE_CLAMP_TO_BORDER_baseTex7)!=0);
}
#endif
float l9_375=l9_366;
float l9_376=l9_373;
sc_ClampUV(l9_375,baseTex7UvMinMax.y,baseTex7UvMinMax.w,l9_374,l9_376);
l9_368=l9_376;
l9_367=vec2(l9_372,l9_375);
}
#else
{
l9_368=1.0;
l9_367=vec2(l9_364,l9_366);
}
#endif
vec2 l9_377=sc_TransformUV(l9_367,(int(SC_USE_UV_TRANSFORM_baseTex7)!=0),baseTex7Transform);
float l9_378=l9_377.x;
float l9_379=l9_368;
sc_SoftwareWrapLate(l9_378,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex7,SC_SOFTWARE_WRAP_MODE_V_baseTex7).x,l9_362,l9_379);
float l9_380=l9_377.y;
float l9_381=l9_379;
sc_SoftwareWrapLate(l9_380,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex7,SC_SOFTWARE_WRAP_MODE_V_baseTex7).y,l9_362,l9_381);
float l9_382=l9_381;
vec3 l9_383=sc_SamplingCoordsViewToGlobal(vec2(l9_378,l9_380),baseTex7Layout,baseTex7GetStereoViewIndex());
vec4 l9_384=texture(baseTex7ArrSC,l9_383,0.0);
vec4 l9_385;
#if (SC_USE_CLAMP_TO_BORDER_baseTex7)
{
l9_385=mix(baseTex7BorderColor,l9_384,vec4(l9_382));
}
#else
{
l9_385=l9_384;
}
#endif
l9_361=l9_385;
}
#else
{
bool l9_386=(int(SC_USE_CLAMP_TO_BORDER_baseTex7)!=0)&&(!(int(SC_USE_UV_MIN_MAX_baseTex7)!=0));
float l9_387=l9_2.x;
sc_SoftwareWrapEarly(l9_387,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex7,SC_SOFTWARE_WRAP_MODE_V_baseTex7).x);
float l9_388=l9_387;
float l9_389=l9_2.y;
sc_SoftwareWrapEarly(l9_389,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex7,SC_SOFTWARE_WRAP_MODE_V_baseTex7).y);
float l9_390=l9_389;
vec2 l9_391;
float l9_392;
#if (SC_USE_UV_MIN_MAX_baseTex7)
{
bool l9_393;
#if (SC_USE_CLAMP_TO_BORDER_baseTex7)
{
l9_393=ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex7,SC_SOFTWARE_WRAP_MODE_V_baseTex7).x==3;
}
#else
{
l9_393=(int(SC_USE_CLAMP_TO_BORDER_baseTex7)!=0);
}
#endif
float l9_394=l9_388;
float l9_395=1.0;
sc_ClampUV(l9_394,baseTex7UvMinMax.x,baseTex7UvMinMax.z,l9_393,l9_395);
float l9_396=l9_394;
float l9_397=l9_395;
bool l9_398;
#if (SC_USE_CLAMP_TO_BORDER_baseTex7)
{
l9_398=ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex7,SC_SOFTWARE_WRAP_MODE_V_baseTex7).y==3;
}
#else
{
l9_398=(int(SC_USE_CLAMP_TO_BORDER_baseTex7)!=0);
}
#endif
float l9_399=l9_390;
float l9_400=l9_397;
sc_ClampUV(l9_399,baseTex7UvMinMax.y,baseTex7UvMinMax.w,l9_398,l9_400);
l9_392=l9_400;
l9_391=vec2(l9_396,l9_399);
}
#else
{
l9_392=1.0;
l9_391=vec2(l9_388,l9_390);
}
#endif
vec2 l9_401=sc_TransformUV(l9_391,(int(SC_USE_UV_TRANSFORM_baseTex7)!=0),baseTex7Transform);
float l9_402=l9_401.x;
float l9_403=l9_392;
sc_SoftwareWrapLate(l9_402,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex7,SC_SOFTWARE_WRAP_MODE_V_baseTex7).x,l9_386,l9_403);
float l9_404=l9_401.y;
float l9_405=l9_403;
sc_SoftwareWrapLate(l9_404,ivec2(SC_SOFTWARE_WRAP_MODE_U_baseTex7,SC_SOFTWARE_WRAP_MODE_V_baseTex7).y,l9_386,l9_405);
float l9_406=l9_405;
vec3 l9_407=sc_SamplingCoordsViewToGlobal(vec2(l9_402,l9_404),baseTex7Layout,baseTex7GetStereoViewIndex());
vec4 l9_408=texture(baseTex7,l9_407.xy,0.0);
vec4 l9_409;
#if (SC_USE_CLAMP_TO_BORDER_baseTex7)
{
l9_409=mix(baseTex7BorderColor,l9_408,vec4(l9_406));
}
#else
{
l9_409=l9_408;
}
#endif
l9_361=l9_409;
}
#endif
l9_311=l9_361;
}
l9_261=l9_311;
}
l9_211=l9_261;
}
l9_161=l9_211;
}
l9_111=l9_161;
}
l9_61=l9_111;
}
l9_11=l9_61;
}
vec4 l9_410=l9_11*l9_1;
bool l9_411=l9_6>=8;
bool l9_412;
if (l9_411)
{
l9_412=l9_11.w>0.0;
}
else
{
l9_412=l9_411;
}
vec4 l9_413;
if (l9_412)
{
vec3 l9_414=l9_410.xyz/vec3(l9_11.w);
l9_413=vec4(l9_414.x,l9_414.y,l9_414.z,l9_410.w);
}
else
{
l9_413=l9_410;
}
l9_9=l9_7*l9_11.w;
l9_8=l9_413;
}
vec3 l9_415=l9_8.xyz*l9_9;
vec4 l9_416=vec4(l9_415,l9_9);
#if (sc_BlendMode_AlphaTest)
{
if (l9_9<alphaTestThreshold)
{
discard;
}
}
#endif
#if (ENABLE_STIPPLE_PATTERN_TEST)
{
if (l9_9<((mod(dot(floor(mod(gl_FragCoord.xy,vec2(4.0))),vec2(4.0,1.0))*9.0,16.0)+1.0)/17.0))
{
discard;
}
}
#endif
if (l9_0)
{
vec4 l9_417;
#if (sc_RayTracingCasterForceOpaque)
{
vec4 l9_418=l9_416;
l9_418.w=1.0;
l9_417=l9_418;
}
#else
{
l9_417=l9_416;
}
#endif
sc_writeFragData0(max(l9_417,vec4(0.0)));
return;
}
vec4 l9_419;
#if (sc_ProjectiveShadowsCaster)
{
float l9_420;
#if (((sc_BlendMode_Normal||sc_BlendMode_AlphaToCoverage)||sc_BlendMode_PremultipliedAlphaHardware)||sc_BlendMode_PremultipliedAlphaAuto)
{
l9_420=l9_9;
}
#else
{
float l9_421;
#if (sc_BlendMode_PremultipliedAlpha)
{
l9_421=clamp(l9_9*2.0,0.0,1.0);
}
#else
{
float l9_422;
#if (sc_BlendMode_AddWithAlphaFactor)
{
l9_422=clamp(dot(l9_416.xyz,vec3(l9_9)),0.0,1.0);
}
#else
{
float l9_423;
#if (sc_BlendMode_AlphaTest)
{
l9_423=1.0;
}
#else
{
float l9_424;
#if (sc_BlendMode_Multiply)
{
l9_424=(1.0-dot(l9_416.xyz,vec3(0.33333001)))*l9_9;
}
#else
{
float l9_425;
#if (sc_BlendMode_MultiplyOriginal)
{
l9_425=(1.0-clamp(dot(l9_416.xyz,vec3(1.0)),0.0,1.0))*l9_9;
}
#else
{
float l9_426;
#if (sc_BlendMode_ColoredGlass)
{
l9_426=clamp(dot(l9_416.xyz,vec3(1.0)),0.0,1.0)*l9_9;
}
#else
{
float l9_427;
#if (sc_BlendMode_Add)
{
l9_427=clamp(dot(l9_416.xyz,vec3(1.0)),0.0,1.0);
}
#else
{
float l9_428;
#if (sc_BlendMode_AddWithAlphaFactor)
{
l9_428=clamp(dot(l9_416.xyz,vec3(1.0)),0.0,1.0)*l9_9;
}
#else
{
float l9_429;
#if (sc_BlendMode_Screen)
{
l9_429=dot(l9_416.xyz,vec3(0.33333001))*l9_9;
}
#else
{
float l9_430;
#if (sc_BlendMode_Min)
{
l9_430=1.0-clamp(dot(l9_416.xyz,vec3(1.0)),0.0,1.0);
}
#else
{
float l9_431;
#if (sc_BlendMode_Max)
{
l9_431=clamp(dot(l9_416.xyz,vec3(1.0)),0.0,1.0);
}
#else
{
l9_431=1.0;
}
#endif
l9_430=l9_431;
}
#endif
l9_429=l9_430;
}
#endif
l9_428=l9_429;
}
#endif
l9_427=l9_428;
}
#endif
l9_426=l9_427;
}
#endif
l9_425=l9_426;
}
#endif
l9_424=l9_425;
}
#endif
l9_423=l9_424;
}
#endif
l9_422=l9_423;
}
#endif
l9_421=l9_422;
}
#endif
l9_420=l9_421;
}
#endif
l9_419=vec4(mix(sc_ShadowColor.xyz,sc_ShadowColor.xyz*l9_416.xyz,vec3(sc_ShadowColor.w)),sc_ShadowDensity*l9_420);
}
#else
{
vec4 l9_432;
#if (sc_RenderAlphaToColor)
{
l9_432=vec4(l9_9);
}
#else
{
vec4 l9_433;
#if (sc_BlendMode_Custom)
{
vec4 l9_434;
#if (sc_FramebufferFetch)
{
l9_434=sc_readFragData0();
}
#else
{
vec2 l9_435=sc_ScreenCoordsGlobalToView(gl_FragCoord.xy*sc_CurrentRenderTargetDims.zw);
vec4 l9_436;
#if (sc_ScreenTextureLayout==2)
{
l9_436=texture(sc_ScreenTextureArrSC,sc_SamplingCoordsViewToGlobal(l9_435,sc_ScreenTextureLayout,sc_ScreenTextureGetStereoViewIndex()),0.0);
}
#else
{
l9_436=texture(sc_ScreenTexture,sc_SamplingCoordsViewToGlobal(l9_435,sc_ScreenTextureLayout,sc_ScreenTextureGetStereoViewIndex()).xy,0.0);
}
#endif
l9_434=l9_436;
}
#endif
vec3 l9_437=mix(l9_434.xyz,definedBlend(l9_434.xyz,l9_416.xyz).xyz,vec3(l9_9));
vec4 l9_438=vec4(l9_437.x,l9_437.y,l9_437.z,vec4(0.0).w);
l9_438.w=1.0;
l9_433=l9_438;
}
#else
{
vec4 l9_439;
#if (sc_Voxelization)
{
l9_439=vec4(varScreenPos.xyz,1.0);
}
#else
{
vec4 l9_440;
#if (sc_OutputBounds)
{
float l9_441=clamp(abs(gl_FragCoord.z),0.0,1.0);
l9_440=vec4(l9_441,1.0-l9_441,1.0,1.0);
}
#else
{
vec4 l9_442;
#if (sc_BlendMode_MultiplyOriginal)
{
l9_442=vec4(mix(vec3(1.0),l9_416.xyz,vec3(l9_9)),l9_9);
}
#else
{
vec4 l9_443;
#if (sc_BlendMode_Screen||sc_BlendMode_PremultipliedAlphaAuto)
{
float l9_444;
#if (sc_BlendMode_PremultipliedAlphaAuto)
{
l9_444=clamp(l9_9,0.0,1.0);
}
#else
{
l9_444=l9_9;
}
#endif
l9_443=vec4(l9_416.xyz*l9_444,l9_444);
}
#else
{
l9_443=l9_416;
}
#endif
l9_442=l9_443;
}
#endif
l9_440=l9_442;
}
#endif
l9_439=l9_440;
}
#endif
l9_433=l9_439;
}
#endif
l9_432=l9_433;
}
#endif
l9_419=l9_432;
}
#endif
vec4 l9_445;
if (PreviewEnabled==1)
{
vec4 l9_446;
if (((PreviewVertexSaved*1.0)!=0.0) ? true : false)
{
l9_446=PreviewVertexColor;
}
else
{
l9_446=vec4(0.0);
}
l9_445=l9_446;
}
else
{
l9_445=l9_419;
}
vec4 l9_447=sc_OutputMotionVectorIfNeeded(max(l9_445,vec4(0.0)));
vec4 l9_448=clamp(l9_447,vec4(0.0),vec4(1.0));
#if (sc_OITDepthBoundsPass)
{
#if (sc_OITDepthBoundsPass)
{
float l9_449=clamp(viewSpaceDepth()/1000.0,0.0,1.0);
sc_writeFragData0(vec4(max(0.0,1.0-(l9_449-0.0039215689)),min(1.0,l9_449+0.0039215689),0.0,0.0));
}
#endif
}
#else
{
#if (sc_OITDepthPrepass)
{
sc_writeFragData0(vec4(1.0));
}
#else
{
#if (sc_OITDepthGatherPass)
{
#if (sc_OITDepthGatherPass)
{
vec2 l9_450=sc_ScreenCoordsGlobalToView(gl_FragCoord.xy*sc_CurrentRenderTargetDims.zw);
#if (sc_OITMaxLayers4Plus1)
{
if ((gl_FragCoord.z-texture(sc_OITFrontDepthTexture,l9_450).x)<=getFrontLayerZTestEpsilon())
{
discard;
}
}
#endif
int l9_451=encodeDepth(viewSpaceDepth(),texture(sc_OITFilteredDepthBoundsTexture,l9_450).xy);
float l9_452=packValue(l9_451);
int l9_459=int(l9_448.w*255.0);
float l9_460=packValue(l9_459);
sc_writeFragData0(vec4(packValue(l9_451),packValue(l9_451),packValue(l9_451),packValue(l9_451)));
}
#endif
}
#else
{
#if (sc_OITCompositingPass)
{
#if (sc_OITCompositingPass)
{
vec2 l9_463=sc_ScreenCoordsGlobalToView(gl_FragCoord.xy*sc_CurrentRenderTargetDims.zw);
#if (sc_OITMaxLayers4Plus1)
{
if ((gl_FragCoord.z-texture(sc_OITFrontDepthTexture,l9_463).x)<=getFrontLayerZTestEpsilon())
{
discard;
}
}
#endif
int l9_464[8];
int l9_465[8];
int l9_466=0;
for (int snapLoopIndex=0; snapLoopIndex==0; snapLoopIndex+=0)
{
if (l9_466<8)
{
l9_464[l9_466]=0;
l9_465[l9_466]=0;
l9_466++;
continue;
}
else
{
break;
}
}
int l9_467;
#if (sc_OITMaxLayers8)
{
l9_467=2;
}
#else
{
l9_467=1;
}
#endif
int l9_468=0;
for (int snapLoopIndex=0; snapLoopIndex==0; snapLoopIndex+=0)
{
if (l9_468<l9_467)
{
vec4 l9_469;
vec4 l9_470;
vec4 l9_471;
if (l9_468==0)
{
l9_471=texture(sc_OITAlpha0,l9_463);
l9_470=texture(sc_OITDepthLow0,l9_463);
l9_469=texture(sc_OITDepthHigh0,l9_463);
}
else
{
l9_471=vec4(0.0);
l9_470=vec4(0.0);
l9_469=vec4(0.0);
}
vec4 l9_472;
vec4 l9_473;
vec4 l9_474;
if (l9_468==1)
{
l9_474=texture(sc_OITAlpha1,l9_463);
l9_473=texture(sc_OITDepthLow1,l9_463);
l9_472=texture(sc_OITDepthHigh1,l9_463);
}
else
{
l9_474=l9_471;
l9_473=l9_470;
l9_472=l9_469;
}
if (any(notEqual(l9_472,vec4(0.0)))||any(notEqual(l9_473,vec4(0.0))))
{
int l9_475[8]=l9_464;
unpackValues(l9_472.w,l9_468,l9_475);
unpackValues(l9_472.z,l9_468,l9_475);
unpackValues(l9_472.y,l9_468,l9_475);
unpackValues(l9_472.x,l9_468,l9_475);
unpackValues(l9_473.w,l9_468,l9_475);
unpackValues(l9_473.z,l9_468,l9_475);
unpackValues(l9_473.y,l9_468,l9_475);
unpackValues(l9_473.x,l9_468,l9_475);
int l9_484[8]=l9_465;
unpackValues(l9_474.w,l9_468,l9_484);
unpackValues(l9_474.z,l9_468,l9_484);
unpackValues(l9_474.y,l9_468,l9_484);
unpackValues(l9_474.x,l9_468,l9_484);
}
l9_468++;
continue;
}
else
{
break;
}
}
vec4 l9_489=texture(sc_OITFilteredDepthBoundsTexture,l9_463);
vec2 l9_490=l9_489.xy;
int l9_491;
#if (sc_SkinBonesCount>0)
{
l9_491=encodeDepth(((1.0-l9_489.x)*1000.0)+getDepthOrderingEpsilon(),l9_490);
}
#else
{
l9_491=0;
}
#endif
int l9_492=encodeDepth(viewSpaceDepth(),l9_490);
vec4 l9_493;
l9_493=l9_448*l9_448.w;
vec4 l9_494;
int l9_495=0;
for (int snapLoopIndex=0; snapLoopIndex==0; snapLoopIndex+=0)
{
if (l9_495<8)
{
int l9_496=l9_464[l9_495];
int l9_497=l9_492-l9_491;
bool l9_498=l9_496<l9_497;
bool l9_499;
if (l9_498)
{
l9_499=l9_464[l9_495]>0;
}
else
{
l9_499=l9_498;
}
if (l9_499)
{
vec3 l9_500=l9_493.xyz*(1.0-(float(l9_465[l9_495])/255.0));
l9_494=vec4(l9_500.x,l9_500.y,l9_500.z,l9_493.w);
}
else
{
l9_494=l9_493;
}
l9_493=l9_494;
l9_495++;
continue;
}
else
{
break;
}
}
sc_writeFragData0(l9_493);
#if (sc_OITMaxLayersVisualizeLayerCount)
{
discard;
}
#endif
}
#endif
}
#else
{
#if (sc_OITFrontLayerPass)
{
#if (sc_OITFrontLayerPass)
{
if (abs(gl_FragCoord.z-texture(sc_OITFrontDepthTexture,sc_ScreenCoordsGlobalToView(gl_FragCoord.xy*sc_CurrentRenderTargetDims.zw)).x)>getFrontLayerZTestEpsilon())
{
discard;
}
sc_writeFragData0(l9_448);
}
#endif
}
#else
{
sc_writeFragData0(l9_447);
}
#endif
}
#endif
}
#endif
}
#endif
}
#endif
}
#endif // #elif defined FRAGMENT_SHADER // #if defined VERTEX_SHADER
