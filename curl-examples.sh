#!/bin/bash

# 即梦AI API - curl使用示例
# 以下是使用curl调用即梦AI API的示例命令

# 配置API服务器地址
API_BASE_URL="http://localhost:5101"

# 配置Session Token（请替换为您自己的token）
SESSION_TOKEN="your_session_token_here"

# 1. 服务状态检查 (GET /)
echo "=== 服务状态检查 ==="
curl -X GET "$API_BASE_URL/"

# 2. 文生图 API (POST /v1/images/generations)
echo "\n=== 文生图 API 示例 ==="
curl -X POST "$API_BASE_URL/v1/images/generations" \
  -H "Authorization: Bearer $SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"model": "jimeng-4.0", "prompt": "一只可爱的小猫在草地上玩耍", "ratio": "1:1", "resolution": "2k"}'

# 3. 图生图/图片合成 API (POST /v1/images/compositions)
echo "\n=== 图生图 API 示例 (使用图片URL) ==="
curl -X POST "$API_BASE_URL/v1/images/compositions" \
  -H "Authorization: Bearer $SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"model": "jimeng-4.0", "prompt": "在图片中添加一只小狗", "images": ["https://example.com/image.jpg"], "ratio": "1:1", "resolution": "2k"}'

# 4. 图生图/图片合成 API (使用本地图片，multipart/form-data)
echo "\n=== 图生图 API 示例 (使用本地图片) ==="
curl -X POST "$API_BASE_URL/v1/images/compositions" \
  -H "Authorization: Bearer $SESSION_TOKEN" \
  -F "model=jimeng-4.0" \
  -F "prompt=在图片中添加一只小狗" \
  -F "images=@path/to/your/image.jpg" \
  -F "ratio=1:1" \
  -F "resolution=2k"

# 5. 通过历史ID获取图片 (POST /v1/images/get_history_by_ids)
echo "\n=== 通过历史ID获取图片 API 示例 ==="
curl -X POST "$API_BASE_URL/v1/images/get_history_by_ids" \
  -H "Authorization: Bearer $SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"history_ids": ["5682880156684"]}'

# 6. 通过历史ID获取单张图片 (GET /v1/images/history/:id)
echo "\n=== 通过历史ID获取单张图片 API 示例 ==="
HISTORY_ID="5682880156684"  # 请替换为实际的历史ID
curl -X GET "$API_BASE_URL/v1/images/history/$HISTORY_ID" \
  -H "Authorization: Bearer $SESSION_TOKEN"

# 7. 获取资产列表 (GET /v1/images/assets/:id)
echo "\n=== 获取资产列表 API 示例 ==="
ASSET_ID="123"  # 资产ID（注意：此API目前忽略此参数）
curl -X GET "$API_BASE_URL/v1/images/assets/$ASSET_ID" \
  -H "Authorization: Bearer $SESSION_TOKEN"

# 8. 聊天对话示例 (POST /v1/chat/completions)
echo "\n=== 聊天对话 API 示例 ==="
curl -X POST "$API_BASE_URL/v1/chat/completions" \
  -H "Authorization: Bearer $SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "你好，能帮我写一首关于春天的诗吗？"}], "model": "gpt-3.5-turbo", "stream": false}'

# 9. 聊天对话流式示例 (POST /v1/chat/completions)
echo "\n=== 聊天对话流式返回 API 示例 ==="
curl -X POST "$API_BASE_URL/v1/chat/completions" \
  -H "Authorization: Bearer $SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "你好，能帮我写一首关于春天的诗吗？"}], "model": "gpt-3.5-turbo", "stream": true}'

# 10. 视频生成示例 (POST /v1/videos/generations)
echo "\n=== 视频生成 API 示例 ==="
curl -X POST "$API_BASE_URL/v1/videos/generations" \
  -H "Authorization: Bearer $SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "一只可爱的小猫在草地上玩耍", "model": "jimeng-video-3.0", "ratio": "1:1", "resolution": "720p", "duration": 5}'

echo "\n所有示例执行完成！"
