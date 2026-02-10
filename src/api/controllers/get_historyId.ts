import APIException from "@/lib/exceptions/APIException.ts";
import EX from "@/api/consts/exceptions.ts";
import { request } from "./core.ts";
import logger from "@/lib/logger.ts";

const DEFAULT_ASSISTANT_ID = "513695";

export async function getImageByHistoryId(historyId: string, refreshToken: string) {
  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await request(
        "post",
        "/mweb/v1/get_history_by_ids",
        refreshToken,
        {
          data: {
            history_ids: [historyId],
            image_info: { 
              width: 2048, 
              height: 2048, 
              format: "webp" 
            },
            http_common_info: { 
              aid: Number(DEFAULT_ASSISTANT_ID),
              device_platform: "web",
              region: "CN"
            }
          },
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Referer": "https://jimeng.jianying.com/ai-tool/image/generate"
          }
        }
      );

      logger.info(`获取历史记录响应 (尝试 ${attempt}/${maxRetries}): ${JSON.stringify(result)}`);

      if (!result) {
        if (attempt < maxRetries) {
          logger.info(`Empty response received, retrying in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
        throw new APIException(EX.API_IMAGE_GENERATION_FAILED, "获取历史记录失败: 服务器返回空响应");
      }

      if (typeof result !== 'object') {
        throw new APIException(EX.API_IMAGE_GENERATION_FAILED, "获取历史记录失败: 响应格式错误");
      }

      if (!result[historyId]) {
        throw new APIException(EX.API_IMAGE_GENERATION_FAILED, "历史记录不存在");
      }

      const item_list = result[historyId].item_list || [];
      return {
        images: item_list.map(item => ({
          webp: item?.common_attr?.cover_url_map?.["2400"] || "",
          cover: item?.common_attr?.cover_url_map?.["1080"] || "",
          png: item?.common_attr?.cover_url || "",
          large: item?.image?.large_images?.[0]?.image_url || ""
        }))
      };
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      logger.info(`Error occurred, retrying in ${retryDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  throw new APIException(EX.API_IMAGE_GENERATION_FAILED, "获取历史记录失败: 超过最大重试次数");
}

export async function getImagesByHistoryIds(historyIds: string[], refreshToken: string) {
  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await request(
        "post",
        "/mweb/v1/get_history_by_ids",
        refreshToken,
        {
          data: {
            history_ids: historyIds,
            image_info: { 
              width: 2048, 
              height: 2048, 
              format: "webp" 
            },
            http_common_info: { 
              aid: Number(DEFAULT_ASSISTANT_ID),
              device_platform: "web",
              region: "CN"
            }
          },
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Referer": "https://jimeng.jianying.com/ai-tool/image/generate"
          }
        }
      );

      logger.info(`批量获取历史记录响应 (尝试 ${attempt}/${maxRetries}): ${JSON.stringify(result)}`);

      if (!result) {
        if (attempt < maxRetries) {
          logger.info(`Empty response received, retrying in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
        throw new APIException(EX.API_IMAGE_GENERATION_FAILED, "批量获取历史记录失败: 服务器返回空响应");
      }

      if (typeof result !== 'object') {
        throw new APIException(EX.API_IMAGE_GENERATION_FAILED, "批量获取历史记录失败: 响应格式错误");
      }

      // 处理每个历史记录ID的结果
      const results = {};
      for (const historyId of historyIds) {
        if (!result[historyId]) {
          results[historyId] = {
            error: "历史记录不存在",
            images: []
          };
          continue;
        }

        const item_list = result[historyId].item_list || [];
        results[historyId] = {
          images: item_list.map(item => ({
            webp: item?.common_attr?.cover_url_map?.["2400"] || "",
            cover: item?.common_attr?.cover_url_map?.["1080"] || "",
            png: item?.common_attr?.cover_url || "",
            large: item?.image?.large_images?.[0]?.image_url || ""
          }))
        };
      }

      return results;
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      logger.info(`Error occurred, retrying in ${retryDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  throw new APIException(EX.API_IMAGE_GENERATION_FAILED, "批量获取历史记录失败: 超过最大重试次数");
}

export async function getAssetList(refreshToken: string) {
  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await request(
        "get",
        "/mweb/v1/get_asset_list",
        refreshToken,
        {
          params: {
            aid: DEFAULT_ASSISTANT_ID,
            da_version: "3.2.5",
            aigc_features: "app_lip_sync"
          },
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Referer": "https://jimeng.jianying.com/ai-tool/image/generate"
          }
        }
      );

      logger.info(`获取资产列表响应 (尝试 ${attempt}/${maxRetries}): ${JSON.stringify(result)}`);

      if (!result) {
        if (attempt < maxRetries) {
          logger.info(`Empty response received, retrying in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
        throw new APIException(EX.API_REQUEST_FAILED, "获取资产列表失败: 服务器返回空响应");
      }

      if (typeof result !== 'object') {
        throw new APIException(EX.API_REQUEST_FAILED, "获取资产列表失败: 响应格式错误");
      }

      return {
        assets: result.asset_list || [],
        total: result.total || 0
      };
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      logger.info(`Error occurred, retrying in ${retryDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  throw new APIException(EX.API_REQUEST_FAILED, "获取资产列表失败: 超过最大重试次数");
}
