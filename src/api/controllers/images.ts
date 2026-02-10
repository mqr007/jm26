import _ from "lodash";
import crypto from "crypto";

import APIException from "@/lib/exceptions/APIException.ts";
import EX from "@/api/consts/exceptions.ts";
import util from "@/lib/util.ts";
import { getCredit, receiveCredit, request } from "./core.ts";
import logger from "@/lib/logger.ts";
import { getImageByHistoryId, getAssetList } from "@/api/controllers/get_historyId.ts";
import { SmartPoller, PollingStatus } from "@/lib/smart-poller.ts";
import { DEFAULT_ASSISTANT_ID_CN, DEFAULT_ASSISTANT_ID_US, DEFAULT_IMAGE_MODEL, DRAFT_VERSION, DRAFT_MIN_VERSION, IMAGE_MODEL_MAP, IMAGE_MODEL_MAP_US, RESOLUTION_OPTIONS } from "@/api/consts/common.ts";
import { BASE_URL_DREAMINA_US, BASE_URL_IMAGEX_US, WEB_VERSION as DREAMINA_WEB_VERSION, DA_VERSION as DREAMINA_DA_VERSION, AIGC_FEATURES as DREAMINA_AIGC_FEATURES } from "@/api/consts/dreamina.ts";
import { createSignature } from "@/lib/aws-signature.ts";

export const DEFAULT_MODEL = DEFAULT_IMAGE_MODEL;

function getResolutionParams(resolution: string = '2k', ratio: string = '1:1'): { width: number; height: number; image_ratio: number; resolution_type: string } {
  const resolutionGroup = RESOLUTION_OPTIONS[resolution];
  if (!resolutionGroup) {
    const supportedResolutions = Object.keys(RESOLUTION_OPTIONS).join(', ');
    throw new Error(`不支持的分辨率 "${resolution}"。支持的分辨率: ${supportedResolutions}`);
  }

  const ratioConfig = resolutionGroup[ratio];
  if (!ratioConfig) {
    const supportedRatios = Object.keys(resolutionGroup).join(', ');
    throw new Error(`在 "${resolution}" 分辨率下，不支持的比例 "${ratio}"。支持的比例: ${supportedRatios}`);
  }

  return {
    width: ratioConfig.width,
    height: ratioConfig.height,
    image_ratio: ratioConfig.ratio,
    resolution_type: resolution,
  };
}
export function getModel(model: string, isUS: boolean) {
  const modelMap = isUS ? IMAGE_MODEL_MAP_US : IMAGE_MODEL_MAP;
  if (isUS && !modelMap[model]) {
    const supportedModels = Object.keys(modelMap).join(', ');
    throw new Error(`国际版不支持模型 "${model}"。支持的模型: ${supportedModels}`);
  }
  return modelMap[model] || modelMap[DEFAULT_MODEL];
}

function calculateCRC32(buffer: ArrayBuffer): string {
  const crcTable = [];
  for (let i = 0; i < 256; i++) {
    let crc = i;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 1) ? (0xEDB88320 ^ (crc >>> 1)) : (crc >>> 1);
    }
    crcTable[i] = crc;
  }

  let crc = 0 ^ (-1);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ bytes[i]) & 0xFF];
  }
  return ((crc ^ (-1)) >>> 0).toString(16).padStart(8, '0');
}

async function uploadImageFromUrl(imageUrl: string, refreshToken: string, isUS: boolean): Promise<string> {
  try {
    logger.info(`开始上传图片: ${imageUrl} (isUS: ${isUS})`);

    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`下载图片失败: ${imageResponse.status}`);
    }
    const imageBuffer = await imageResponse.arrayBuffer();

    return await uploadImageFromBuffer(Buffer.from(imageBuffer), refreshToken, isUS);

  } catch (error) {
    logger.error(`图片上传失败: ${error.message}`);
    throw error;
  }
}

async function uploadImageFromBuffer(imageBuffer: Buffer, refreshToken: string, isUS: boolean): Promise<string> {
  try {
    logger.info(`开始通过Buffer上传图片... (isUS: ${isUS})`);

    const tokenResult = await request("post", "/mweb/v1/get_upload_token", refreshToken, {
      data: {
        scene: 2,
      },
      params: isUS ? {
        aid: DEFAULT_ASSISTANT_ID_US,
        web_version: DREAMINA_WEB_VERSION,
        da_version: DREAMINA_DA_VERSION,
        aigc_features: DREAMINA_AIGC_FEATURES,
      } : {
        aid: DEFAULT_ASSISTANT_ID_CN.toString(),
      },
    });
    const { access_key_id, secret_access_key, session_token } = tokenResult;
    const service_id = isUS ? tokenResult.space_name : tokenResult.service_id;

    if (!access_key_id || !secret_access_key || !session_token) {
      throw new Error("获取上传令牌失败");
    }

    const actualServiceId = service_id || (isUS ? "wopfjsm1ax" : "tb4s082cfz");

    logger.info(`获取上传令牌成功: service_id=${actualServiceId}`);

    const fileSize = imageBuffer.byteLength;
    const crc32 = calculateCRC32(imageBuffer);

    logger.info(`图片Buffer: 大小=${fileSize}字节, CRC32=${crc32}`);

    const now = new Date();
    const timestamp = now.toISOString().replace(/[:\-]/g, '').replace(/\.\d{3}Z$/, 'Z');
    const randomStr = Math.random().toString(36).substring(2, 12);
    
    const applyUrlHost = isUS ? BASE_URL_IMAGEX_US : 'https://imagex.bytedanceapi.com';
    const applyUrl = `${applyUrlHost}/?Action=ApplyImageUpload&Version=2018-08-01&ServiceId=${actualServiceId}&FileSize=${fileSize}&s=${randomStr}${isUS ? '&device_platform=web' : ''}`;

    const requestHeaders = {
      'x-amz-date': timestamp,
      'x-amz-security-token': session_token
    };

    const authorization = createSignature('GET', applyUrl, requestHeaders, access_key_id, secret_access_key, session_token);

    const origin = isUS ? new URL(BASE_URL_DREAMINA_US).origin : 'https://jimeng.jianying.com';

    const applyResponse = await fetch(applyUrl, {
      method: 'GET',
      headers: {
        'accept': '*/*',
        'authorization': authorization,
        'origin': origin,
        'referer': `${origin}/ai-tool/generate`,
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
        'x-amz-date': timestamp,
        'x-amz-security-token': session_token,
      },
    });

    if (!applyResponse.ok) {
      const errorText = await applyResponse.text();
      throw new Error(`申请上传权限失败: ${applyResponse.status} - ${errorText}`);
    }

    const applyResult = await applyResponse.json();

    if (applyResult?.ResponseMetadata?.Error) {
      throw new Error(`申请上传权限失败: ${JSON.stringify(applyResult.ResponseMetadata.Error)}`);
    }

    const uploadAddress = applyResult?.Result?.UploadAddress;
    if (!uploadAddress || !uploadAddress.StoreInfos || !uploadAddress.UploadHosts) {
      throw new Error(`获取上传地址失败: ${JSON.stringify(applyResult)}`);
    }

    const storeInfo = uploadAddress.StoreInfos[0];
    const uploadHost = uploadAddress.UploadHosts[0];
    const auth = storeInfo.Auth;
    const uploadUrl = `https://${uploadHost}/upload/v1/${storeInfo.StoreUri}`;

    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': auth,
        'Content-CRC32': crc32,
        'Content-Disposition': 'attachment; filename="undefined"',
        'Content-Type': 'application/octet-stream',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
      },
      body: imageBuffer,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`图片上传失败: ${uploadResponse.status} - ${errorText}`);
    }

    const commitUrl = `${applyUrlHost}/?Action=CommitImageUpload&Version=2018-08-01&ServiceId=${actualServiceId}`;
    const commitTimestamp = new Date().toISOString().replace(/[:\-]/g, '').replace(/\.\d{3}Z$/, 'Z');
    const commitPayload = JSON.stringify({
      SessionKey: uploadAddress.SessionKey
    });
    const payloadHash = crypto.createHash('sha256').update(commitPayload, 'utf8').digest('hex');
    const commitRequestHeaders = {
      'x-amz-date': commitTimestamp,
      'x-amz-security-token': session_token,
      'x-amz-content-sha256': payloadHash
    };
    const commitAuthorization = createSignature('POST', commitUrl, commitRequestHeaders, access_key_id, secret_access_key, session_token, commitPayload);

    const commitResponse = await fetch(commitUrl, {
      method: 'POST',
      headers: {
        'authorization': commitAuthorization,
        'content-type': 'application/json',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
        'x-amz-date': commitTimestamp,
        'x-amz-security-token': session_token,
        'x-amz-content-sha256': payloadHash,
      },
      body: commitPayload,
    });

    if (!commitResponse.ok) {
      const errorText = await commitResponse.text();
      throw new Error(`提交上传失败: ${commitResponse.status} - ${errorText}`);
    }

    const commitResult = await commitResponse.json();
    if (commitResult?.ResponseMetadata?.Error) {
      throw new Error(`提交上传失败: ${JSON.stringify(commitResult.ResponseMetadata.Error)}`);
    }
    if (!commitResult?.Result?.Results || commitResult.Result.Results.length === 0) {
      throw new Error(`提交上传响应缺少结果: ${JSON.stringify(commitResult)}`);
    }
    const uploadResult = commitResult.Result.Results[0];
    if (uploadResult.UriStatus !== 2000) {
      throw new Error(`图片上传状态异常: UriStatus=${uploadResult.UriStatus}`);
    }
    const fullImageUri = uploadResult.Uri;
    logger.info(`图片Buffer上传完成: ${fullImageUri}`);
    return fullImageUri;
  } catch (error) {
    logger.error(`图片Buffer上传失败: ${error.message}`);
    throw error;
  }
}

export async function generateImageComposition(
  _model: string,
  prompt: string,
  images: (string | Buffer)[],
  {
    ratio = '1:1',
    resolution = '2k',
    sampleStrength = 0.5,
    negativePrompt = "",
  }: {
    ratio?: string;
    resolution?: string;
    sampleStrength?: number;
    negativePrompt?: string;
  },
  refreshToken: string
) {
  const isUS = refreshToken.toLowerCase().startsWith('us-');
  const model = getModel(_model, isUS);
  
  let width, height, image_ratio, resolution_type;

  if (_model === 'nanobanana') {
    logger.warn('nanobanana模型当前固定使用1024x1024分辨率和2k的清晰度，您输入的参数将被忽略。');
    width = 1024;
    height = 1024;
    image_ratio = 1;
    resolution_type = '2k';
  } else {
    const params = getResolutionParams(resolution, ratio);
    width = params.width;
    height = params.height;
    image_ratio = params.image_ratio;
    resolution_type = params.resolution_type;
  }

  const imageCount = images.length;
  logger.info(`使用模型: ${_model} 映射模型: ${model} 图生图功能 ${imageCount}张图片 ${width}x${height} 精细度: ${sampleStrength}`);

  try {
    const { totalCredit } = await getCredit(refreshToken);
    if (totalCredit <= 0)
      await receiveCredit(refreshToken);
  } catch (e) {
    logger.warn(`获取积分失败，可能是不支持的区域或token已失效: ${e.message}`);
  }

  const uploadedImageIds: string[] = [];
  for (let i = 0; i < images.length; i++) {
    try {
      const image = images[i];
      let imageId: string;
      if (typeof image === 'string') {
        logger.info(`正在处理第 ${i + 1}/${imageCount} 张图片 (URL)...`);
        imageId = await uploadImageFromUrl(image, refreshToken, isUS);
      } else {
        logger.info(`正在处理第 ${i + 1}/${imageCount} 张图片 (Buffer)...`);
        imageId = await uploadImageFromBuffer(image, refreshToken, isUS);
      }
      uploadedImageIds.push(imageId);
      logger.info(`图片 ${i + 1}/${imageCount} 上传成功: ${imageId}`);
    } catch (error) {
      logger.error(`图片 ${i + 1}/${imageCount} 上传失败: ${error.message}`);
      throw new APIException(EX.API_IMAGE_GENERATION_FAILED, `图片上传失败: ${error.message}`);
    }
  }

  logger.info(`所有图片上传完成，开始图生图: ${uploadedImageIds.join(', ')}`);

  const componentId = util.uuid();
  const submitId = util.uuid();
  
  const core_param = {
    type: "",
    id: util.uuid(),
    model,
    prompt: `##${prompt}`,
    sample_strength: sampleStrength,
    image_ratio: image_ratio,
    large_image_info: {
      type: "",
      id: util.uuid(),
      height: height,
      width: width,
      resolution_type: resolution_type
    },
    intelligent_ratio: false,
  };

  const { aigc_data } = await request(
    "post",
    "/mweb/v1/aigc_draft/generate",
    refreshToken,
    {
      params: {
      },
      data: {
        extend: {
          root_model: model,
        },
        submit_id: submitId,
        metrics_extra: JSON.stringify({
          promptSource: "custom",
          generateCount: 1,
          enterFrom: "click",
          generateId: submitId,
          isRegenerate: false
        }),
        draft_content: JSON.stringify({
          type: "draft",
          id: util.uuid(),
          min_version: DRAFT_MIN_VERSION,
          min_features: [],
          is_from_tsn: true,
          version: DRAFT_VERSION,
          main_component_id: componentId,
          component_list: [
            {
              type: "image_base_component",
              id: componentId,
              min_version: DRAFT_MIN_VERSION,
              aigc_mode: "workbench",
              metadata: {
                type: "",
                id: util.uuid(),
                created_platform: 3,
                created_platform_version: "",
                created_time_in_ms: Date.now().toString(),
                created_did: "",
              },
              generate_type: "blend",
              abilities: {
                type: "",
                id: util.uuid(),
                blend: {
                  type: "",
                  id: util.uuid(),
                  min_features: [],
                  core_param: core_param,
                  ability_list: uploadedImageIds.map((imageId) => ({
                    type: "",
                    id: util.uuid(),
                    name: "byte_edit",
                    image_uri_list: [imageId],
                    image_list: [{
                      type: "image",
                      id: util.uuid(),
                      source_from: "upload",
                      platform_type: 1,
                      name: "",
                      image_uri: imageId,
                      width: 0,
                      height: 0,
                      format: "",
                      uri: imageId
                    }],
                    strength: 0.5
                  })),
                  prompt_placeholder_info_list: uploadedImageIds.map((_, index) => ({
                    type: "",
                    id: util.uuid(),
                    ability_index: index
                  })),
                  postedit_param: {
                    type: "",
                    id: util.uuid(),
                    generate_type: 0
                  }
                },
              },
            },
          ],
        }),
        http_common_info: {
          aid: isUS ? DEFAULT_ASSISTANT_ID_US : DEFAULT_ASSISTANT_ID_CN
        }
      },
    }
  );

  const historyId = aigc_data?.history_record_id;
  if (!historyId)
    throw new APIException(EX.API_IMAGE_GENERATION_FAILED, "记录ID不存在");

  logger.info(`图生图任务已提交，historyId: ${historyId}。请通过historyId接口获取生成结果。`);
  
  // 直接返回historyId和空的imageUrls数组，由前端通过history_id接口获取实际图片
  return { imageUrls: [], historyId };
}

// ... (rest of the file is for text-to-image, can be left as is for now)
export async function generateImages(
  _model: string,
  prompt: string,
  {
    ratio = '1:1',
    resolution = '2k',
    sampleStrength = 0.5,
    negativePrompt = "",
  }: {
    ratio?: string;
    resolution?: string;
    sampleStrength?: number;
    negativePrompt?: string;
  },
  refreshToken: string
) {
  const isUS = refreshToken.toLowerCase().startsWith('us-');
  const model = getModel(_model, isUS);
  logger.info(`使用模型: ${_model} 映射模型: ${model} 分辨率: ${resolution} 比例: ${ratio} 精细度: ${sampleStrength}`);

  const result = await generateImagesInternal(_model, prompt, { ratio, resolution, sampleStrength, negativePrompt }, refreshToken);
  return result;
}

async function generateImagesInternal(
  _model: string,
  prompt: string,
  {
    ratio,
    resolution,
    sampleStrength = 0.5,
    negativePrompt = "",
  }: {
    ratio: string;
    resolution: string;
    sampleStrength?: number;
    negativePrompt?: string;
  },
  refreshToken: string
) {
  const isUS = refreshToken.toLowerCase().startsWith('us-');
  const model = getModel(_model, isUS);
  
  let width, height, image_ratio, resolution_type;

  if (_model === 'nanobanana') {
    logger.warn('nanobanana模型当前固定使用1024x1024分辨率和2k的清晰度，您输入的参数将被忽略。');
    width = 1024;
    height = 1024;
    image_ratio = 1;
    resolution_type = '2k';
  } else {
    const params = getResolutionParams(resolution, ratio);
    width = params.width;
    height = params.height;
    image_ratio = params.image_ratio;
    resolution_type = params.resolution_type;
  }

  const { totalCredit, giftCredit, purchaseCredit, vipCredit } = await getCredit(refreshToken);
  if (totalCredit <= 0)
    await receiveCredit(refreshToken);

  logger.info(`当前积分状态: 总计=${totalCredit}, 赠送=${giftCredit}, 购买=${purchaseCredit}, VIP=${vipCredit}`);

  const isJimeng40MultiImage = _model === "jimeng-4.0" && (
    prompt.includes("连续") ||
    prompt.includes("绘本") ||
    prompt.includes("故事") ||
    /\d+张/.test(prompt)
  );

  if (isJimeng40MultiImage) {
    return await generateJimeng40MultiImages(_model, prompt, { ratio, resolution, sampleStrength, negativePrompt }, refreshToken);
  }

  const componentId = util.uuid();
  
  const core_param = {
    type: "",
    id: util.uuid(),
    model,
    prompt,
    negative_prompt: negativePrompt,
    seed: Math.floor(Math.random() * 100000000) + 2500000000,
    sample_strength: sampleStrength,
    image_ratio: image_ratio,
    large_image_info: {
      type: "",
      id: util.uuid(),
      height: height,
      width: width,
      resolution_type: resolution_type
    },
    intelligent_ratio: false
  };

  const { aigc_data } = await request(
    "post",
    "/mweb/v1/aigc_draft/generate",
    refreshToken,
    {
      params: {
      },
      data: {
        extend: {
          root_model: model,
        },
        submit_id: util.uuid(),
        metrics_extra: JSON.stringify({
          promptSource: "custom",
          generateCount: 1,
          enterFrom: "click",
          generateId: util.uuid(),
          isRegenerate: false
        }),
        draft_content: JSON.stringify({
          type: "draft",
          id: util.uuid(),
          min_version: DRAFT_MIN_VERSION,
          min_features: [],
          is_from_tsn: true,
          version: DRAFT_VERSION,
          main_component_id: componentId,
          component_list: [
            {
              type: "image_base_component",
              id: componentId,
              min_version: DRAFT_MIN_VERSION,
              aigc_mode: "workbench",
              metadata: {
                type: "",
                id: util.uuid(),
                created_platform: 3,
                created_platform_version: "",
                created_time_in_ms: Date.now().toString(),
                created_did: ""
              },
              generate_type: "generate",
              abilities: {
                type: "",
                id: util.uuid(),
                generate: {
                  type: "",
                  id: util.uuid(),
                  core_param: core_param,
                },
              },
            },
          ],
        }),
        http_common_info: {
          aid: isUS ? DEFAULT_ASSISTANT_ID_US : DEFAULT_ASSISTANT_ID_CN
        }
      },
    }
  );
  const historyId = aigc_data.history_record_id;
  if (!historyId)
    throw new APIException(EX.API_IMAGE_GENERATION_FAILED, "记录ID不存在");

  logger.info(`图片生成任务已提交，historyId: ${historyId}。请通过historyId接口获取生成结果。`);
  
  // 直接返回historyId和空的imageUrls数组，由前端通过history_id接口获取实际图片
  return { imageUrls: [], historyId };
}

async function generateJimeng40MultiImages(
  _model: string,
  prompt: string,
  {
    ratio = '1:1',
    resolution = '2k',
    sampleStrength = 0.5,
    negativePrompt = "",
  }: {
    ratio?: string;
    resolution?: string;
    sampleStrength?: number;
    negativePrompt?: string;
  },
  refreshToken: string
) {
  const isUS = refreshToken.toLowerCase().startsWith('us-');
  const model = getModel(_model, isUS);
  const { width, height, image_ratio, resolution_type } = getResolutionParams(resolution, ratio);

  const targetImageCount = prompt.match(/(\d+)张/) ? parseInt(prompt.match(/(\d+)张/)[1]) : 4;

  logger.info(`使用 多图生成: ${targetImageCount}张图片 ${width}x${height} 精细度: ${sampleStrength}`);

  const componentId = util.uuid();
  const submitId = util.uuid();

  const { aigc_data } = await request(
    "post",
    "/mweb/v1/aigc_draft/generate",
    refreshToken,
    {
      params: {
      },
      data: {
        extend: {
          root_model: model,
        },
        submit_id: submitId,
        metrics_extra: JSON.stringify({
          templateId: "",
          generateCount: 1,
          promptSource: "custom",
          templateSource: "",
          lastRequestId: "",
          originRequestId: "",
        }),
        draft_content: JSON.stringify({
          type: "draft",
          id: util.uuid(),
          min_version: DRAFT_MIN_VERSION,
          min_features: [],
          is_from_tsn: true,
          version: DRAFT_VERSION,
          main_component_id: componentId,
          component_list: [
            {
              type: "image_base_component",
              id: componentId,
              min_version: DRAFT_MIN_VERSION,
              aigc_mode: "workbench",
              metadata: {
                type: "",
                id: util.uuid(),
                created_platform: 3,
                created_platform_version: "",
                created_time_in_ms: Date.now().toString(),
                created_did: ""
              },
              generate_type: "generate",
              abilities: {
                type: "",
                id: util.uuid(),
                generate: {
                  type: "",
                  id: util.uuid(),
                  core_param: {
                    type: "",
                    id: util.uuid(),
                    model,
                    prompt,
                    negative_prompt: negativePrompt,
                    seed: Math.floor(Math.random() * 100000000) + 2500000000,
                    sample_strength: sampleStrength,
                    image_ratio: image_ratio,
                    large_image_info: {
                      type: "",
                      id: util.uuid(),
                      height: height,
                      width: width,
                      resolution_type: resolution_type
                    },
                    intelligent_ratio: false
                  },
                },
              },
            },
          ],
        }),
        http_common_info: {
          aid: isUS ? DEFAULT_ASSISTANT_ID_US : DEFAULT_ASSISTANT_ID_CN
        }
      },
    }
  );

  const historyId = aigc_data?.history_record_id;
  if (!historyId)
    throw new APIException(EX.API_IMAGE_GENERATION_FAILED, "记录ID不存在");

  logger.info(`多图生成任务已提交，historyId: ${historyId}。请通过historyId接口获取生成结果。`);
  
  // 直接返回historyId和空的imageUrls数组，由前端通过history_id接口获取实际图片
  return { imageUrls: [], historyId };
}

export default {
  generateImages,
  generateImageComposition,
  getImageByHistoryId,
  getAssetList,
};