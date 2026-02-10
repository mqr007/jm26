import fs from "fs";
import _ from "lodash";

import Request from "@/lib/request/Request.ts";
import { generateImages, generateImageComposition } from "@/api/controllers/images.ts";
import { getImageByHistoryId, getAssetList, getImagesByHistoryIds } from "@/api/controllers/get_historyId.ts";
import { DEFAULT_IMAGE_MODEL } from "@/api/consts/common.ts";
import { tokenSplit } from "@/api/controllers/core.ts";
import util from "@/lib/util.ts";

export default {
  prefix: "/v1/images",

  post: {
    "/generations": async (request: Request) => {
      const unsupportedParams = ['size', 'width', 'height'];
      const bodyKeys = Object.keys(request.body);
      const foundUnsupported = unsupportedParams.filter(param => bodyKeys.includes(param));

      if (foundUnsupported.length > 0) {
        throw new Error(`不支持的参数: ${foundUnsupported.join(', ')}。请使用 ratio 和 resolution 参数控制图像尺寸。`);
      }

      // 检查是否错误地包含了 images 字段（images 字段应该用于 compositions 接口）
      if (bodyKeys.includes('images')) {
        throw new Error(`[接口使用错误]: /v1/images/generations 接口用于生成新图片，不应包含 'images' 字段。如需图片合成，请使用 /v1/images/compositions 接口`);
      }

      request
        .validate("body.model", v => _.isUndefined(v) || _.isString(v))
        .validate("body.prompt", _.isString)
        .validate("body.negative_prompt", v => _.isUndefined(v) || _.isString(v))
        .validate("body.ratio", v => _.isUndefined(v) || _.isString(v))
        .validate("body.resolution", v => _.isUndefined(v) || _.isString(v))
        .validate("body.intelligent_ratio", v => _.isUndefined(v) || _.isBoolean(v))
        .validate("body.sample_strength", v => _.isUndefined(v) || _.isFinite(v))
        .validate("body.response_format", v => _.isUndefined(v) || _.isString(v))
        .validate("headers.authorization", _.isString);

      const tokens = tokenSplit(request.headers.authorization);
      const token = _.sample(tokens);
      const {
        model,
        prompt,
        negative_prompt: negativePrompt,
        ratio,
        resolution,
        intelligent_ratio: intelligentRatio,
        sample_strength: sampleStrength,
        response_format,
      } = request.body;

      const responseFormat = _.defaultTo(response_format, "url");
      const result = await generateImages(model, prompt, {
        ratio,
        resolution,
        sampleStrength,
        negativePrompt,
        intelligentRatio,
      }, token);
      
      const imageUrls = result.imageUrls;
      const historyId = result.historyId;
      
      return {
        created: util.unixTimestamp(),
        data: {
          historyId: historyId
        }
      };
    },
    
    "/compositions": async (request: Request) => {
      const unsupportedParams = ['size', 'width', 'height'];
      const bodyKeys = Object.keys(request.body);
      const foundUnsupported = unsupportedParams.filter(param => bodyKeys.includes(param));

      if (foundUnsupported.length > 0) {
        throw new Error(`不支持的参数: ${foundUnsupported.join(', ')}。请使用 ratio 和 resolution 参数控制图像尺寸。`);
      }

      const contentType = request.headers['content-type'] || '';
      const isMultiPart = contentType.startsWith('multipart/form-data');

      if (isMultiPart) {
        request
          .validate("body.model", v => _.isUndefined(v) || _.isString(v))
          .validate("body.prompt", _.isString)
          .validate("body.negative_prompt", v => _.isUndefined(v) || _.isString(v))
          .validate("body.ratio", v => _.isUndefined(v) || _.isString(v))
          .validate("body.resolution", v => _.isUndefined(v) || _.isString(v))
          .validate("body.intelligent_ratio", v => _.isUndefined(v) || (typeof v === 'string' && (v === 'true' || v === 'false')) || _.isBoolean(v))
          .validate("body.sample_strength", v => _.isUndefined(v) || (typeof v === 'string' && !isNaN(parseFloat(v))) || _.isFinite(v))
          .validate("body.response_format", v => _.isUndefined(v) || _.isString(v))
          .validate("headers.authorization", _.isString);
      } else {
        request
          .validate("body.model", v => _.isUndefined(v) || _.isString(v))
          .validate("body.prompt", _.isString)
          .validate("body.images", _.isArray)
          .validate("body.negative_prompt", v => _.isUndefined(v) || _.isString(v))
          .validate("body.ratio", v => _.isUndefined(v) || _.isString(v))
          .validate("body.resolution", v => _.isUndefined(v) || _.isString(v))
          .validate("body.intelligent_ratio", v => _.isUndefined(v) || _.isBoolean(v))
          .validate("body.sample_strength", v => _.isUndefined(v) || _.isFinite(v))
          .validate("body.response_format", v => _.isUndefined(v) || _.isString(v))
          .validate("headers.authorization", _.isString);
      }

      let images: (string | Buffer)[] = [];
      if (isMultiPart) {
        const files = request.files?.images;
        if (!files) {
          throw new Error("在form-data中缺少 'images' 字段");
        }
        const imageFiles = Array.isArray(files) ? files : [files];
        if (imageFiles.length === 0) {
          throw new Error("至少需要提供1张输入图片");
        }
        if (imageFiles.length > 10) {
          throw new Error("最多支持10张输入图片");
        }
        images = imageFiles.map(file => fs.readFileSync(file.filepath));
      } else {
        const bodyImages = request.body.images;
        if (!bodyImages || bodyImages.length === 0) {
          throw new Error("至少需要提供1张输入图片");
        }
        if (bodyImages.length > 10) {
          throw new Error("最多支持10张输入图片");
        }
        bodyImages.forEach((image: any, index: number) => {
          if (!_.isString(image) && !_.isObject(image)) {
            throw new Error(`图片 ${index + 1} 格式不正确：应为URL字符串或包含url字段的对象`);
          }
          if (_.isObject(image) && !image.url) {
            throw new Error(`图片 ${index + 1} 缺少url字段`);
          }
        });
        images = bodyImages.map((image: any) => _.isString(image) ? image : image.url);
      }

      const tokens = tokenSplit(request.headers.authorization);
      const token = _.sample(tokens);

      const {
        model,
        prompt,
        negative_prompt: negativePrompt,
        ratio,
        resolution,
        intelligent_ratio: intelligentRatio,
        sample_strength: sampleStrength,
        response_format,
      } = request.body;
      const finalModel = _.defaultTo(model, DEFAULT_IMAGE_MODEL);

      // 如果是 multipart/form-data，需要将字符串转换为数字和布尔值
      const finalSampleStrength = isMultiPart && typeof sampleStrength === 'string'
        ? parseFloat(sampleStrength)
        : sampleStrength;

      const finalIntelligentRatio = isMultiPart && typeof intelligentRatio === 'string'
        ? intelligentRatio === 'true'
        : intelligentRatio;

      const responseFormat = _.defaultTo(response_format, "url");
      const result = await generateImageComposition(finalModel, prompt, images, {
        ratio,
        resolution,
        sampleStrength: finalSampleStrength,
        negativePrompt,
        intelligentRatio: finalIntelligentRatio,
      }, token);

      let data = [];
      if (responseFormat == "b64_json") {
        data = (
          await Promise.all(result.imageUrls.map((url) => util.fetchFileBASE64(url)))
        ).map((b64) => ({ b64_json: b64 }));
      } else {
        data = result.imageUrls.map((url) => ({
          url,
        }));
      }

      return {
        created: util.unixTimestamp(),
        data: {
          historyId: result.historyId,
        },
      };
    },
    
    "/get_history_by_ids": async (request: Request) => {
      request
        .validate("body.history_ids", v => _.isArray(v) || _.isString(v), "history_ids 必须是数组格式（如 [\"id1\", \"id2\"]）或字符串格式（如 \"id1\"）")
        .validate("headers.authorization", _.isString);

      const tokens = tokenSplit(request.headers.authorization);
      const token = _.sample(tokens);
      let { history_ids } = request.body;

      // 统一处理参数：如果是字符串，转换为数组
      if (_.isString(history_ids)) {
        history_ids = [history_ids];
      }

      // 验证历史记录ID数组
      if (!history_ids || history_ids.length === 0) {
        throw new Error("必须提供至少一个历史记录ID");
      }
      
      if (history_ids.length > 50) {
        throw new Error("最多支持50个历史记录ID");
      }
      
      // 验证每个ID都是字符串
      for (const id of history_ids) {
        if (!_.isString(id)) {
          throw new Error("历史记录ID必须是字符串类型");
        }
      }

      const result = await getImagesByHistoryIds(history_ids, token);
      
      // 如果请求指定了response_format，进行相应转换
      const responseFormat = _.defaultTo(request.body.response_format, "url");
      
      // 处理所有历史记录的图片数据
      let allImages = [];
      
      for (const historyId of history_ids) {
        const historyResult = result[historyId];
        
        if (historyResult.error) {
          console.warn(`历史记录 ${historyId} 查询失败:`, historyResult.error);
          continue;
        }

        if (responseFormat === "b64_json") {
          // 对于b64_json格式，优先使用largeimg URL并转换为base64
          const b64Images = await Promise.all(historyResult.images.map(async (imageObj) => {
            const imageUrl = imageObj.largeimg || imageObj.webp || imageObj.cover || imageObj.jpeg;
            if (!imageUrl) return { b64_json: null };
            
            try {
              const b64 = await util.fetchFileBASE64(imageUrl);
              return { b64_json: b64 };
            } catch (error) {
              console.error(`转换图片URL为base64失败: ${error.message}`);
              return { b64_json: null };
            }
          }));
          allImages = allImages.concat(b64Images);
        } else {
          // 对于url格式，返回各种尺寸的图片URL
          const urlImages = historyResult.images.map(imageObj => ({
            webp: imageObj.webp || "",
            cover: imageObj.cover || "",
            png: imageObj.png || imageObj.largeimg || "",
            large: imageObj.large || imageObj.largeimg || ""
          }));
          allImages = allImages.concat(urlImages);
        }
      }
      
      return {
        created: util.unixTimestamp(),
        data: allImages
      };
    },
  },
  
  get: {
    "/history/:id": async (request: Request) => {
      request
        .validate("params.id", _.isString)
        .validate("headers.authorization", _.isString);
        
      const tokens = tokenSplit(request.headers.authorization);
      const token = _.sample(tokens);
      const historyId = request.params.id;
      
      const result = await getImageByHistoryId(historyId, token);
      const images = result.images || [];
      
      return {
        created: util.unixTimestamp(),
        data: images.map((imageObj) => ({
          webp: imageObj.webp || "",
          cover: imageObj.cover || "",
          png: imageObj.png || "",
          large: imageObj.large || ""
        })),
      };
    },
    
    "/assets/:id": async (request: Request) => {
      request
        .validate("params.id", _.isString)
        .validate("headers.authorization", _.isString);
        
      const tokens = tokenSplit(request.headers.authorization);
      const token = _.sample(tokens);
      const historyId = request.params.id;
      
      const assets = await getAssetList(token);
      
      return {
        created: util.unixTimestamp(),
        data: assets,
      };
    },
  },
};
