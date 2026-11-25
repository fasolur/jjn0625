# 接口记录（追加写入，禁止覆盖）

> 格式：接口路径 | HTTP 方法 | 请求参数（含示例）| 响应格式（含 JSON 示例）| 修改时间

（暂无接口记录）

---

接口路径：/api/database/connect | HTTP 方法：POST
请求参数（JSON Body）：{ "jjn_user": "root", "jjn_password": "Root", "jjn_host": "localhost" }（jjn_host 可选，默认 localhost）
成功响应：{ "code": 0, "msg": "数据库连接成功", "data": { "jjn_host": "localhost", "jjn_user": "root", "jjn_version": "8.0.x" } }
失败响应：{ "code": 1, "msg": "数据库连接失败：Access denied for user 'root'@'localhost' (using password: YES)", "data": null }
修改时间：2026-11-20

---

接口路径：/api/news/list | HTTP 方法：GET
请求参数：无
成功响应：{ "code": 0, "msg": "查询成功", "data": { "jjn_total": 10, "jjn_list": [ { "jjn_id": 1, "jjn_title": "国产大模型推理成本再降六成，开发者生态加速扩张", "jjn_summary": "多家云厂商宣布下调大模型 API 调用价格...", "jjn_source": "科技日报", "jjn_publish_time": "2026-11-19T01:30:00.000Z", "jjn_category": "人工智能" } ] } }
失败响应：{ "code": 1, "msg": "查询新闻列表失败：ER_BAD_DB_ERROR: Unknown database 'jjn_web'", "data": null }
修改时间：2026-11-20

---

接口路径：/api/gallery/list | HTTP 方法：GET
请求参数：无
成功响应：{ "code": 0, "msg": "查询成功", "data": { "jjn_total": 8, "jjn_list": [ { "jjn_id": 1, "jjn_title": "未来城市天际线", "jjn_desc": "霓虹灯影中的未来都市夜景，玻璃幕墙折射出流动的光带。", "jjn_image_url": "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=...&image_size=landscape_16_9", "jjn_author": "冀佳宁", "jjn_create_time": "2026-11-20T05:00:00.000Z" } ] } }
失败响应：{ "code": 1, "msg": "查询图文列表失败：...", "data": null }
修改时间：2026-11-20

---

接口路径：/api/chat/send | HTTP 方法：POST
请求参数：{ "jjn_messages": [ { "role": "user", "content": "你们几点营业？" } ], "provider": "siliconflow" }
说明：jjn_messages 为完整历史消息数组（多轮对话需整包发送）；provider 可选 siliconflow/qiniu，缺省读 .env 的 AI_PROVIDER
成功响应：{ "code": 0, "msg": "回复成功", "data": { "jjn_reply": "我们每天的营业时间是10:00-22:00 营业，欢迎光临！", "jjn_provider": "siliconflow", "jjn_model": "Qwen/Qwen2.5-7B-Instruct" } }
失败响应：{ "code": 1, "msg": "Key 无效或过期，请检查 backend/.env 里的 API Key", "data": null }（另有 402/404/429 友好提示）
修改时间：2026-11-25

---

接口路径：/api/kb/upload | HTTP 方法：POST（multipart/form-data，字段名 jjn_file）
说明：上传知识库文件，支持 doc/docx/ppt/pptx/txt/md（≤10MB），解析分块后入库
成功响应：{ "code": 0, "msg": "上传并解析成功", "data": { "jjn_name": "jjn_门店手册.docx", "jjn_chunk_count": 2 } }

接口路径：/api/kb/list | HTTP 方法：GET
说明：知识库文件列表（名称/大小/分块数/上传时间）
成功响应：{ "code": 0, "msg": "查询成功", "data": { "jjn_files": [ { "jjn_id": "f...", "jjn_name": "...", "jjn_size": 3411, "jjn_chunk_count": 2, "jjn_upload_time": "..." } ] } }

接口路径：/api/kb/file/:jjn_id | HTTP 方法：DELETE
说明：删除知识库文件及其全部分块
成功响应：{ "code": 0, "msg": "删除成功", "data": null }

接口路径：/api/kb/ask | HTTP 方法：POST
请求参数：{ "jjn_question": "会员卡有什么优惠？", "jjn_messages": [可选，多轮历史] }
说明：RAG 问答 —— bigram 检索 Top3 片段拼入 system 提示词后调大模型；控制台打印发送/接收数据
成功响应：{ "code": 0, "msg": "回答成功", "data": { "jjn_answer": "...", "jjn_sources": ["jjn_门店手册.docx"] } }
修改时间：2026-11-25

---

接口路径：/api/ai/image | HTTP 方法：POST（multipart/form-data，字段名 jjn_image）
说明：图像识别 —— 图片转 base64 交给硅基流动视觉模型（Qwen/Qwen3-VL-8B-Instruct），返回中文描述
成功响应：{ "code": 0, "msg": "成功", "data": { "jjn_description": "浩瀚星海中...", "jjn_model": "Qwen/Qwen3-VL-8B-Instruct", "jjn_file": "img_....jpg" } }

接口路径：/api/ai/asr | HTTP 方法：POST（multipart/form-data，字段名 jjn_audio）
说明：语音识别 —— 主用七牛 Qwen-Audio-3.0-ASR-Flash（/v1/audio/transcriptions）；网关无通道时自动降级硅基流动 SenseVoiceSmall，jjn_fallback=true 标记
成功响应：{ "code": 0, "msg": "成功", "data": { "jjn_text": "...", "jjn_provider": "七牛 · Qwen-Audio-3.0-ASR-Flash 或 硅基流动 SenseVoice（降级...）", "jjn_fallback": false } }
修改时间：2026-11-25
