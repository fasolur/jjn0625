# 数据库变更记录（追加写入，禁止覆盖）

> 按执行顺序追加建表、改表及测试数据 INSERT 语句，仅凭此文件即可在新机器上完整重建数据库。

（暂无记录）

---

## 2026-11-20 建库建表 jjn_news 并插入测试数据

```sql
-- ============================================================
-- 姓名冀佳宁 | 学号24002120625 | 执行时间：2026-11-20
-- 步骤 1：创建数据库与科技新闻表 jjn_news，并插入测试数据
-- ============================================================

CREATE DATABASE IF NOT EXISTS jjn_web DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE jjn_web;

CREATE TABLE IF NOT EXISTS jjn_news (
  jjn_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '新闻ID',
  jjn_title VARCHAR(200) NOT NULL COMMENT '新闻标题',
  jjn_summary VARCHAR(500) NOT NULL COMMENT '新闻摘要',
  jjn_source VARCHAR(100) NOT NULL COMMENT '新闻来源',
  jjn_publish_time DATETIME NOT NULL COMMENT '发布时间',
  jjn_category VARCHAR(50) NOT NULL DEFAULT '科技' COMMENT '新闻分类'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='科技新闻表';

INSERT INTO jjn_news (jjn_title, jjn_summary, jjn_source, jjn_publish_time, jjn_category) VALUES
('国产大模型推理成本再降六成，开发者生态加速扩张', '多家云厂商宣布下调大模型 API 调用价格，推理单位成本较年初下降约六成，中小企业接入门槛显著降低。', '科技日报', '2026-11-19 09:30:00', '人工智能'),
('量子计算原型机实现千比特级纠缠，纠错方案获突破', '研究团队在超导量子芯片上实现千比特级量子比特纠缠，并验证了新型表面码纠错方案，为实用化铺路。', '新华网', '2026-11-18 14:05:00', '前沿科技'),
('新能源汽车固态电池量产线投产，续航突破 1200 公里', '首条全固态电池量产线正式投产，能量密度达到每公斤 500 瓦时，装车测试续航突破 1200 公里。', '中国汽车报', '2026-11-17 10:20:00', '新能源'),
('低空经济试点扩容，城市无人机物流航线新增 30 条', '多地获批扩大低空经济试点，新增 30 条城市无人机物流常态化航线，覆盖医疗急送与即时配送场景。', '经济日报', '2026-11-16 08:45:00', '航空航天'),
('开源 RISC-V 服务器芯片发布，能效比提升 40%', '新一代 RISC-V 架构服务器处理器发布，采用 3nm 工艺，同负载下能效比较上一代提升 40%。', '芯片观察', '2026-11-15 16:10:00', '半导体'),
('6G 技术试验完成外场验证，峰值速率达 1Tbps', '国内 6G 外场试验完成太赫兹通信验证，实测峰值速率达 1Tbps，时延降低至亚毫秒级。', '通信产业报', '2026-11-14 11:00:00', '通信'),
('脑机接口临床新进展：意念打字速度刷新纪录', '植入式脑机接口临床试验取得进展，受试者意念打字速度达到每分钟 90 字符，准确率超过 95%。', '生命科学周刊', '2026-11-13 15:30:00', '生物科技'),
('国产操作系统市场份额首超两成，生态适配数破 500 万', '最新统计显示国产操作系统桌面端市场份额首次突破 20%，软硬件生态适配总量超过 500 万款。', '信息技术导报', '2026-11-12 09:15:00', '软件'),
('人形机器人进入工厂产线，多场景协同作业测试成功', '多台人形机器人在汽车工厂完成协同装配测试，可连续作业 8 小时，故障自恢复率达 99%。', '智能制造网', '2026-11-11 13:40:00', '机器人'),
('卫星互联网完成全球组网最后一批发射，覆盖南北极', '最后一批发射任务圆满完成，低轨卫星互联网实现全球覆盖，含南北极在内的任意地点可接入。', '航天报', '2026-11-10 07:50:00', '航空航天');

```


---

## 2026-11-20 建表 jjn_gallery 并插入 8 条图文测试数据

```sql
-- ============================================================
-- 姓名冀佳宁 | 学号24002120625 | 执行时间：2026-11-20
-- 步骤 2：创建图文表 jjn_gallery，并插入 8 条测试数据
-- 图片地址为 text_to_image 生成接口，image_size=landscape_16_9
-- ============================================================

CREATE DATABASE IF NOT EXISTS jjn_web DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE jjn_web;

CREATE TABLE IF NOT EXISTS jjn_gallery (
  jjn_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '图文ID',
  jjn_title VARCHAR(200) NOT NULL COMMENT '图文标题',
  jjn_desc VARCHAR(500) NOT NULL COMMENT '图文描述',
  jjn_image_url VARCHAR(1000) NOT NULL COMMENT '图片地址',
  jjn_author VARCHAR(100) NOT NULL COMMENT '作者',
  jjn_create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='图文列表表';

INSERT INTO jjn_gallery (jjn_title, jjn_desc, jjn_image_url, jjn_author, jjn_create_time) VALUES
('未来城市天际线', '霓虹灯影中的未来都市夜景，玻璃幕墙折射出流动的光带。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=futuristic%20city%20skyline%20at%20night%2C%20neon%20lights%2C%20glass%20skyscrapers%2C%20cinematic%20lighting%2C%20ultra%20detailed%2C%20sci-fi%20atmosphere&image_size=landscape_16_9', '冀佳宁', NOW()),
('人工智能芯片', '微距视角下的人工智能加速芯片，金色电路如脉络般延展。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=macro%20shot%20of%20AI%20accelerator%20chip%2C%20golden%20circuit%20traces%2C%20dark%20background%2C%20studio%20lighting%2C%20high%20detail%20product%20photography&image_size=landscape_16_9', '冀佳宁', NOW()),
('卫星与星海', '低轨卫星掠过璀璨银河，天线反射着来自地球的微光。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=communication%20satellite%20orbiting%20earth%2C%20milky%20way%20galaxy%20background%2C%20realistic%20space%20photography%2C%20blue%20glow&image_size=landscape_16_9', '冀佳宁', NOW()),
('海上风电场', '清晨薄雾中的海上风电场，白色风机与朝霞交相辉映。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=offshore%20wind%20farm%20at%20sunrise%2C%20white%20wind%20turbines%2C%20sea%20mist%2C%20warm%20sky%2C%20aerial%20photography%2C%20clean%20energy&image_size=landscape_16_9', '冀佳宁', NOW()),
('实验室机械臂', '精密机械臂正在实验室中进行自动化装配作业。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=robotic%20arm%20in%20modern%20laboratory%2C%20precision%20automation%2C%20clean%20room%2C%20soft%20blue%20lighting%2C%20technology%20photography&image_size=landscape_16_9', '冀佳宁', NOW()),
('数据中心走廊', '数据中心机房内，蓝色指示灯沿走廊延伸至远方。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=data%20center%20server%20room%20corridor%2C%20blue%20LED%20lights%2C%20rows%20of%20server%20racks%2C%20symmetrical%20composition%2C%20futuristic&image_size=landscape_16_9', '冀佳宁', NOW()),
('太赫兹通信实验', '6G 太赫兹通信实验装置，电磁波束在光学平台上传递。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=terahertz%20communication%20laboratory%20equipment%2C%20optical%20table%2C%20laser%20beams%2C%20high%20tech%20research%2C%20purple%20and%20cyan%20lighting&image_size=landscape_16_9', '冀佳宁', NOW()),
('量子计算机特写', '稀释制冷机内部的量子计算芯片，层层金结构如倒置雕塑。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=quantum%20computer%20dilution%20refrigerator%2C%20golden%20chandelier%20structure%2C%20extreme%20close-up%2C%20dark%20lab%2C%20scientific%20photography&image_size=landscape_16_9', '冀佳宁', NOW());

```


---

## 2026-11-20 jjn_gallery 表增加 jjn_category 字段并为 8 条数据设置分类

```sql
ALTER TABLE jjn_gallery ADD COLUMN jjn_category VARCHAR(50) NOT NULL DEFAULT '科技' COMMENT '图文分类' AFTER jjn_desc;

UPDATE jjn_gallery SET jjn_category='智慧城市' WHERE jjn_id=1;
UPDATE jjn_gallery SET jjn_category='人工智能' WHERE jjn_id=2;
UPDATE jjn_gallery SET jjn_category='航天探索' WHERE jjn_id=3;
UPDATE jjn_gallery SET jjn_category='新能源' WHERE jjn_id=4;
UPDATE jjn_gallery SET jjn_category='机器人' WHERE jjn_id=5;
UPDATE jjn_gallery SET jjn_category='数据中心' WHERE jjn_id=6;
UPDATE jjn_gallery SET jjn_category='通信技术' WHERE jjn_id=7;
UPDATE jjn_gallery SET jjn_category='前沿科技' WHERE jjn_id=8;
```
（同时已将 jjn_gallery_init.sql 重建脚本同步更新为含分类字段的版本）

