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
  jjn_category VARCHAR(50) NOT NULL DEFAULT '科技' COMMENT '图文分类',
  jjn_image_url VARCHAR(1000) NOT NULL COMMENT '图片地址',
  jjn_author VARCHAR(100) NOT NULL COMMENT '作者',
  jjn_create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='图文列表表';

INSERT INTO jjn_gallery (jjn_title, jjn_desc, jjn_category, jjn_image_url, jjn_author, jjn_create_time) VALUES
('未来城市天际线', '霓虹灯影中的未来都市夜景，玻璃幕墙折射出流动的光带。', '智慧城市', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=futuristic%20city%20skyline%20at%20night%2C%20neon%20lights%2C%20glass%20skyscrapers%2C%20cinematic%20lighting%2C%20ultra%20detailed%2C%20sci-fi%20atmosphere&image_size=landscape_16_9', '冀佳宁', NOW()),
('人工智能芯片', '微距视角下的人工智能加速芯片，金色电路如脉络般延展。', '人工智能', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=macro%20shot%20of%20AI%20accelerator%20chip%2C%20golden%20circuit%20traces%2C%20dark%20background%2C%20studio%20lighting%2C%20high%20detail%20product%20photography&image_size=landscape_16_9', '冀佳宁', NOW()),
('卫星与星海', '低轨卫星掠过璀璨银河，天线反射着来自地球的微光。', '航天探索', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=communication%20satellite%20orbiting%20earth%2C%20milky%20way%20galaxy%20background%2C%20realistic%20space%20photography%2C%20blue%20glow&image_size=landscape_16_9', '冀佳宁', NOW()),
('海上风电场', '清晨薄雾中的海上风电场，白色风机与朝霞交相辉映。', '新能源', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=offshore%20wind%20farm%20at%20sunrise%2C%20white%20wind%20turbines%2C%20sea%20mist%2C%20warm%20sky%2C%20aerial%20photography%2C%20clean%20energy&image_size=landscape_16_9', '冀佳宁', NOW()),
('实验室机械臂', '精密机械臂正在实验室中进行自动化装配作业。', '机器人', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=robotic%20arm%20in%20modern%20laboratory%2C%20precision%20automation%2C%20clean%20room%2C%20soft%20blue%20lighting%2C%20technology%20photography&image_size=landscape_16_9', '冀佳宁', NOW()),
('数据中心走廊', '数据中心机房内，蓝色指示灯沿走廊延伸至远方。', '数据中心', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=data%20center%20server%20room%20corridor%2C%20blue%20LED%20lights%2C%20rows%20of%20server%20racks%2C%20symmetrical%20composition%2C%20futuristic&image_size=landscape_16_9', '冀佳宁', NOW()),
('太赫兹通信实验', '6G 太赫兹通信实验装置，电磁波束在光学平台上传递。', '通信技术', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=terahertz%20communication%20laboratory%20equipment%2C%20optical%20table%2C%20laser%20beams%2C%20high%20tech%20research%2C%20purple%20and%20cyan%20lighting&image_size=landscape_16_9', '冀佳宁', NOW()),
('量子计算机特写', '稀释制冷机内部的量子计算芯片，层层金结构如倒置雕塑。', '前沿科技', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=quantum%20computer%20dilution%20refrigerator%2C%20golden%20chandelier%20structure%2C%20extreme%20close-up%2C%20dark%20lab%2C%20scientific%20photography&image_size=landscape_16_9', '冀佳宁', NOW());
