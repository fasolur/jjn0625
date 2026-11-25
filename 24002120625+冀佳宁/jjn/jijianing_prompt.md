# AI 开发指令记录（追加写入，禁止覆盖）

2026-11-20 | 请初始化本项目：1、git init + .gitignore（排除 node_modules、.env）+ 首次提交 2、按 AGENTS.md 规则创建前后端目录骨架、安装依赖、3、创建前端首页 index.html，包括姓名、学号、项目名称、项目类别（自选、模仿），所有完成的 html 页面的超链接。有 canvas 背景动画。主体是页面链接导航。页面美观。4、创建 readme.md，在根目录下，包括学号、姓名。 | GLM

2026-11-20 | 姓名冀佳宁 学号24002120625 | GLM

2026-11-20 | 创建运行后台的bat文件，在根目录下。 | GLM

2026-11-20 | 创建 database.html 页面，输入用户名，密码，链接数据库，数据库使用 mysql，成功和错误都有提示，默认用户名 root，密码 Root | GLM

2026-11-20 | 完成科技新闻列表页面，新闻的数据存在数据库表里。网页显示后端接口链接和数据内容。 | GLM

2026-11-20 | 完成图文列表，图片可以使用网络图片或创建图片，创建一个新的表，网页显示后端接口链接和数据内容。 | GLM

2026-11-20 | 要和第二张图老师这种一样 为什么格式不对 | GLM

2026-11-25 | 使用硅基流动 完成在线客服页面：https://spontaneous-valkyrie-4e4229.netlify.app/llm-app-lesson （要求：后端 /api/chat 转发、Key 只存 backend/.env、多轮对话、硅基流动/七牛双平台热切换、"中华美食街"客服人设） | GLM

2026-11-25 | 新增 backend/routes/jjn_chat_routes.js、backend/controllers/jjn_chat_controller.js、frontend/service.html、css/jjn_service.css、js/jjn_service.js，app.js 挂载 /api/chat，AI 平台配置追加进 backend/.env（已确认被 .gitignore 忽略） | GLM

2026-11-25 | 完成知识库文件上传功能，构建2个知识库文件，完成基于知识库的问答，支持doc和docx，ppt，完成知识库管理（RAG）：基于本地上传、解析、分块、bigram检索Top3拼提示词、溯源回答；在控制台输出发送给大模型的数据和接收自大模型的数据 | GLM

2026-11-25 | 新增 backend/routes/jjn_kb_routes.js、backend/controllers/jjn_kb_controller.js、frontend/knowledge.html、css/jjn_knowledge.css、js/jjn_knowledge.js；生成 knowledge_files/jjn_门店手册.docx 与 jjn_秋季新品发布.pptx；app.js 挂载 /api/kb；.gitignore 增加 backend/uploads/ | GLM

2026-11-25 | 完成图像识别功能，上传图片，返回该图片的描述，使用已有的api-key和模型（硅基流动 Qwen3-VL-8B）。实现语音识别功能，使用七牛的Qwen-Audio-3.0-ASR-Flash模型，输入语音输出文字（七牛网关暂无该模型通道，自动降级硅基流动 SenseVoice，代码按七牛为主实现） | GLM

2026-11-25 | 新增 backend/routes/jjn_ai_routes.js、backend/controllers/jjn_ai_controller.js、frontend/ai.html、css/jjn_ai.css、js/jjn_ai.js（MediaRecorder 录音+音频上传）；.env 追加 QINIU_CUSTOMER_SERVICE_ASR_MODEL；app.js 挂载 /api/ai | GLM

2026-11-25 | 客服人设改为开放域通用助手：写诗/讲笑话/一般知识都正常回答，门店三类信息按口径保留；知识库问答保持只依据片段回答（RAG 设计不变） | GLM
