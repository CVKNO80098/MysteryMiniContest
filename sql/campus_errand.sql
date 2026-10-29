-- =============================================================
-- 校园代跑腿平台 数据库脚本
-- 库名：campus_errand
-- 字符集：utf8mb4   引擎：InnoDB
-- 说明：本脚本可以直接复制到 Navicat 查询窗口或 MySQL 命令行里执行。
--      脚本会先建库，再删表重建（DROP TABLE IF EXISTS），最后插入演示数据。
--      注意：本库不使用外键约束，只使用普通索引和唯一索引，
--            这样学生按任意顺序插入/删除数据都不会被外键拦住。
-- 执行顺序：全部复制执行即可，不需要手动选库。
-- =============================================================

SET NAMES utf8mb4;

-- 1. 建库（库名固定 campus_errand）
CREATE DATABASE IF NOT EXISTS `campus_errand`
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_general_ci;

USE `campus_errand`;


-- =============================================================
-- 表 1：user  用户表（顾客 / 骑手 / 管理员都在这张表里）
-- =============================================================
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
    `id`         BIGINT       NOT NULL AUTO_INCREMENT COMMENT '用户ID，主键自增',
    `username`   VARCHAR(50)  NOT NULL                COMMENT '登录用户名，唯一',
    `password`   VARCHAR(100) NOT NULL                COMMENT '登录密码，示例项目不加密，统一 123456',
    `real_name`  VARCHAR(50)  DEFAULT NULL            COMMENT '真实姓名',
    `nickname`   VARCHAR(50)  DEFAULT NULL            COMMENT '昵称，页面显示用',
    `phone`      VARCHAR(20)  DEFAULT NULL            COMMENT '手机号',
    `avatar`     VARCHAR(255) DEFAULT ''              COMMENT '头像图片地址，没有就存空字符串',
    `student_no` VARCHAR(30)  DEFAULT NULL            COMMENT '学号',
    `role`       TINYINT      NOT NULL DEFAULT 1      COMMENT '角色：1顾客 2骑手 3管理员',
    `balance`    DECIMAL(10,2) NOT NULL DEFAULT 0.00  COMMENT '账户余额，单位元',
    `status`     TINYINT      NOT NULL DEFAULT 1      COMMENT '状态：1正常 0禁用',
    `create_time` DATETIME    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';


-- =============================================================
-- 表 2：address  收货地址表
-- =============================================================
DROP TABLE IF EXISTS `address`;
CREATE TABLE `address` (
    `id`           BIGINT      NOT NULL AUTO_INCREMENT COMMENT '地址ID，主键自增',
    `user_id`      BIGINT      NOT NULL                COMMENT '所属用户ID，对应 user.id',
    `contact_name` VARCHAR(50) NOT NULL                COMMENT '联系人姓名',
    `phone`        VARCHAR(20) NOT NULL                COMMENT '联系人手机号',
    `building`     VARCHAR(50) NOT NULL                COMMENT '宿舍楼，例如 3号楼',
    `room`         VARCHAR(30) NOT NULL                COMMENT '房间号，例如 305',
    `detail`       VARCHAR(255) DEFAULT NULL           COMMENT '详细地址补充说明',
    `is_default`   TINYINT     NOT NULL DEFAULT 0      COMMENT '是否默认地址：1默认 0普通',
    `create_time`  DATETIME    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收货地址表';


-- =============================================================
-- 表 3：rider  骑手表（骑手的接单状态、统计信息）
-- =============================================================
DROP TABLE IF EXISTS `rider`;
CREATE TABLE `rider` (
    `id`           BIGINT      NOT NULL AUTO_INCREMENT COMMENT '骑手ID，主键自增',
    `user_id`      BIGINT      NOT NULL                COMMENT '对应的用户ID，对应 user.id',
    `real_name`    VARCHAR(50) NOT NULL                COMMENT '骑手真实姓名',
    `phone`        VARCHAR(20) NOT NULL                COMMENT '骑手手机号',
    `student_no`   VARCHAR(30) DEFAULT NULL            COMMENT '骑手学号',
    `status`       TINYINT     NOT NULL DEFAULT 0      COMMENT '接单状态：0休息 1可接单',
    `total_orders` INT         NOT NULL DEFAULT 0      COMMENT '累计完成订单数',
    `credit_score` INT         NOT NULL DEFAULT 100    COMMENT '信用分，默认100',
    `create_time`  DATETIME    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='骑手表';


-- =============================================================
-- 表 4：shop  店铺表（校园外卖店 + 小卖部）
-- =============================================================
DROP TABLE IF EXISTS `shop`;
CREATE TABLE `shop` (
    `id`           BIGINT       NOT NULL AUTO_INCREMENT COMMENT '店铺ID，主键自增',
    `shop_name`    VARCHAR(100) NOT NULL                COMMENT '店铺名称',
    `shop_type`    TINYINT      NOT NULL DEFAULT 2      COMMENT '店铺类型：2校园外卖 3小卖部',
    `logo`         VARCHAR(255) DEFAULT ''              COMMENT '店铺logo图片地址',
    `phone`        VARCHAR(20)  DEFAULT NULL            COMMENT '店铺联系电话',
    `address`      VARCHAR(255) DEFAULT NULL            COMMENT '店铺地址',
    `open_time`    VARCHAR(10)  DEFAULT NULL            COMMENT '开始营业时间，例如 08:00',
    `close_time`   VARCHAR(10)  DEFAULT NULL            COMMENT '结束营业时间，例如 20:00',
    `min_amount`   DECIMAL(10,2) NOT NULL DEFAULT 0.00  COMMENT '起送价，单位元',
    `delivery_fee` DECIMAL(10,2) NOT NULL DEFAULT 0.00  COMMENT '配送费，单位元',
    `notice`       VARCHAR(255) DEFAULT NULL            COMMENT '店铺公告',
    `status`       TINYINT      NOT NULL DEFAULT 1      COMMENT '营业状态：1营业 0休息',
    `sort`         INT          NOT NULL DEFAULT 0      COMMENT '排序值，越小越靠前',
    `create_time`  DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_shop_type` (`shop_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='店铺表';


-- =============================================================
-- 表 5：goods_category  商品分类表
-- =============================================================
DROP TABLE IF EXISTS `goods_category`;
CREATE TABLE `goods_category` (
    `id`          BIGINT      NOT NULL AUTO_INCREMENT COMMENT '分类ID，主键自增',
    `shop_id`     BIGINT      NOT NULL DEFAULT 0      COMMENT '所属店铺ID，0表示平台通用分类',
    `name`        VARCHAR(50) NOT NULL                COMMENT '分类名称',
    `sort`        INT         NOT NULL DEFAULT 0      COMMENT '排序值，越小越靠前',
    `status`      TINYINT     NOT NULL DEFAULT 1      COMMENT '状态：1启用 0停用',
    `create_time` DATETIME    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_shop_id` (`shop_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品分类表';


-- =============================================================
-- 表 6：goods  商品表
-- =============================================================
DROP TABLE IF EXISTS `goods`;
CREATE TABLE `goods` (
    `id`             BIGINT       NOT NULL AUTO_INCREMENT COMMENT '商品ID，主键自增',
    `shop_id`        BIGINT       NOT NULL                COMMENT '所属店铺ID，对应 shop.id',
    `category_id`    BIGINT       NOT NULL                COMMENT '所属分类ID，对应 goods_category.id',
    `goods_name`     VARCHAR(100) NOT NULL                COMMENT '商品名称',
    `image`          VARCHAR(255) DEFAULT ''              COMMENT '商品图片地址',
    `price`          DECIMAL(10,2) NOT NULL DEFAULT 0.00  COMMENT '现价，单位元',
    `original_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00  COMMENT '原价（划线价），单位元',
    `stock`          INT          NOT NULL DEFAULT 0      COMMENT '库存数量',
    `sales`          INT          NOT NULL DEFAULT 0      COMMENT '已售数量',
    `unit`           VARCHAR(10)  NOT NULL DEFAULT '份'   COMMENT '单位，例如 份/瓶/袋',
    `description`    VARCHAR(255) DEFAULT NULL            COMMENT '商品描述',
    `status`         TINYINT      NOT NULL DEFAULT 1      COMMENT '状态：1上架 0下架',
    `sort`           INT          NOT NULL DEFAULT 0      COMMENT '排序值，越小越靠前',
    `create_time`    DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`    DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_shop_id` (`shop_id`),
    KEY `idx_category_id` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';


-- =============================================================
-- 表 7：express_station  快递驿站表
-- =============================================================
DROP TABLE IF EXISTS `express_station`;
CREATE TABLE `express_station` (
    `id`             BIGINT       NOT NULL AUTO_INCREMENT COMMENT '驿站ID，主键自增',
    `station_name`   VARCHAR(100) NOT NULL                COMMENT '驿站名称',
    `address`        VARCHAR(255) DEFAULT NULL            COMMENT '驿站地址',
    `phone`          VARCHAR(20)  DEFAULT NULL            COMMENT '驿站联系电话',
    `business_hours` VARCHAR(50)  DEFAULT NULL            COMMENT '营业时间，例如 08:00-20:00',
    `status`         TINYINT      NOT NULL DEFAULT 1      COMMENT '状态：1启用 0停用',
    `create_time`    DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='快递驿站表';


-- =============================================================
-- 表 8：orders  订单主表（三种业务共用一张表，靠 order_type 区分）
-- =============================================================
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
    `id`                BIGINT       NOT NULL AUTO_INCREMENT COMMENT '订单ID，主键自增',
    `order_no`          VARCHAR(32)  NOT NULL                COMMENT '订单号，后端生成，唯一',
    `order_type`        TINYINT      NOT NULL                COMMENT '订单类型：1代取快递 2校园外卖 3小卖部',
    `user_id`           BIGINT       NOT NULL                COMMENT '下单用户ID，对应 user.id',
    `rider_id`          BIGINT       DEFAULT NULL            COMMENT '接单骑手ID，对应 rider.id，没人接单时为NULL',
    `shop_id`           BIGINT       DEFAULT NULL            COMMENT '店铺ID，外卖/小卖部订单才有，代取快递为NULL',
    `station_id`        BIGINT       DEFAULT NULL            COMMENT '快递驿站ID，代取快递订单才有，其它为NULL',
    `receiver_name`     VARCHAR(50)  NOT NULL                COMMENT '收货人姓名',
    `receiver_phone`    VARCHAR(20)  NOT NULL                COMMENT '收货人手机号',
    `receiver_building` VARCHAR(50)  NOT NULL                COMMENT '收货宿舍楼',
    `receiver_room`     VARCHAR(30)  NOT NULL                COMMENT '收货房间号',
    `pickup_code`       VARCHAR(30)  DEFAULT NULL            COMMENT '取件码，代取快递订单才有',
    `express_company`   VARCHAR(30)  DEFAULT NULL            COMMENT '快递公司，例如 中通快递',
    `package_size`      TINYINT      DEFAULT NULL            COMMENT '包裹大小：1小件 2中件 3大件',
    `package_weight`    DECIMAL(5,2) DEFAULT NULL            COMMENT '包裹重量，单位公斤',
    `goods_amount`      DECIMAL(10,2) NOT NULL DEFAULT 0.00  COMMENT '商品总金额，单位元',
    `delivery_fee`      DECIMAL(10,2) NOT NULL DEFAULT 0.00  COMMENT '配送费，单位元',
    `tip`               DECIMAL(10,2) NOT NULL DEFAULT 0.00  COMMENT '小费，单位元',
    `total_amount`      DECIMAL(10,2) NOT NULL DEFAULT 0.00  COMMENT '订单总金额 = 商品金额 + 配送费 + 小费',
    `remark`            VARCHAR(255) DEFAULT NULL            COMMENT '订单备注',
    `expect_time`       DATETIME     DEFAULT NULL            COMMENT '期望送达时间',
    `status`            TINYINT      NOT NULL DEFAULT 0      COMMENT '订单状态：0待支付 1待接单 2配送中 3已完成 4已取消',
    `pay_status`        TINYINT      NOT NULL DEFAULT 0      COMMENT '支付状态：0未付 1已付',
    `pay_time`          DATETIME     DEFAULT NULL            COMMENT '支付时间',
    `accept_time`       DATETIME     DEFAULT NULL            COMMENT '骑手接单时间',
    `finish_time`       DATETIME     DEFAULT NULL            COMMENT '订单完成时间',
    `cancel_reason`     VARCHAR(255) DEFAULT NULL            COMMENT '取消原因',
    `create_time`       DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`       DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_order_no` (`order_no`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_rider_id` (`rider_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单主表';


-- =============================================================
-- 表 9：order_item  订单明细表（订单里买了哪些商品）
-- =============================================================
DROP TABLE IF EXISTS `order_item`;
CREATE TABLE `order_item` (
    `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '明细ID，主键自增',
    `order_id`    BIGINT       NOT NULL                COMMENT '所属订单ID，对应 orders.id',
    `goods_id`    BIGINT       NOT NULL                COMMENT '商品ID，对应 goods.id',
    `goods_name`  VARCHAR(100) NOT NULL                COMMENT '下单时的商品名称（快照，商品改名不影响历史订单）',
    `goods_image` VARCHAR(255) DEFAULT ''              COMMENT '下单时的商品图片（快照）',
    `price`       DECIMAL(10,2) NOT NULL DEFAULT 0.00  COMMENT '下单时的单价，单位元',
    `quantity`    INT          NOT NULL DEFAULT 1      COMMENT '购买数量',
    `amount`      DECIMAL(10,2) NOT NULL DEFAULT 0.00  COMMENT '小计金额 = 单价 × 数量',
    PRIMARY KEY (`id`),
    KEY `idx_order_id` (`order_id`),
    KEY `idx_goods_id` (`goods_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单明细表';


-- =============================================================
-- 表 10：order_status_log  订单状态流水表（记录订单状态变化过程）
-- =============================================================
DROP TABLE IF EXISTS `order_status_log`;
CREATE TABLE `order_status_log` (
    `id`            BIGINT       NOT NULL AUTO_INCREMENT COMMENT '流水ID，主键自增',
    `order_id`      BIGINT       NOT NULL                COMMENT '订单ID，对应 orders.id',
    `status`        TINYINT      NOT NULL                COMMENT '变化后的订单状态：0待支付 1待接单 2配送中 3已完成 4已取消',
    `operator_id`   BIGINT       DEFAULT NULL            COMMENT '操作人ID，对应 user.id',
    `operator_role` TINYINT      DEFAULT NULL            COMMENT '操作人角色：1顾客 2骑手 3管理员',
    `remark`        VARCHAR(255) DEFAULT NULL            COMMENT '状态变化说明',
    `create_time`   DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '记录时间',
    PRIMARY KEY (`id`),
    KEY `idx_order_id` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单状态流水表';


-- =============================================================
-- 表 11：cart  购物车表
-- =============================================================
DROP TABLE IF EXISTS `cart`;
CREATE TABLE `cart` (
    `id`          BIGINT   NOT NULL AUTO_INCREMENT COMMENT '购物车ID，主键自增',
    `user_id`     BIGINT   NOT NULL                COMMENT '用户ID，对应 user.id',
    `shop_id`     BIGINT   NOT NULL                COMMENT '店铺ID，对应 shop.id',
    `goods_id`    BIGINT   NOT NULL                COMMENT '商品ID，对应 goods.id',
    `quantity`    INT      NOT NULL DEFAULT 1      COMMENT '购买数量',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_goods` (`user_id`, `goods_id`),
    KEY `idx_shop_id` (`shop_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='购物车表';


-- =============================================================
-- 表 12：order_review  订单评价表（项目预留，前端暂时没用到）
-- =============================================================
DROP TABLE IF EXISTS `order_review`;
CREATE TABLE `order_review` (
    `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '评价ID，主键自增',
    `order_id`    BIGINT       NOT NULL                COMMENT '订单ID，对应 orders.id，一个订单只能评价一次',
    `user_id`     BIGINT       NOT NULL                COMMENT '评价人用户ID，对应 user.id',
    `rider_id`    BIGINT       DEFAULT NULL            COMMENT '被评价的骑手ID，对应 rider.id',
    `score`       TINYINT      NOT NULL DEFAULT 5      COMMENT '评分，1到5分',
    `content`     VARCHAR(255) DEFAULT NULL            COMMENT '评价内容',
    `create_time` DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_order_id` (`order_id`),
    KEY `idx_rider_id` (`rider_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单评价表';


-- =============================================================
-- 表 13：announcement  首页公告 / 轮播图表
-- =============================================================
DROP TABLE IF EXISTS `announcement`;
CREATE TABLE `announcement` (
    `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '公告ID，主键自增',
    `title`       VARCHAR(100) NOT NULL                COMMENT '标题',
    `content`     VARCHAR(500) DEFAULT NULL            COMMENT '内容',
    `image`       VARCHAR(255) DEFAULT ''              COMMENT '图片地址，轮播图必填',
    `type`        TINYINT      NOT NULL DEFAULT 1      COMMENT '类型：1公告 2轮播',
    `status`      TINYINT      NOT NULL DEFAULT 1      COMMENT '状态：1显示 0隐藏',
    `sort`        INT          NOT NULL DEFAULT 0      COMMENT '排序值，越小越靠前',
    `create_time` DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='首页公告轮播表';


-- =============================================================
-- 演示数据开始
-- =============================================================

-- 用户：1顾客 2骑手 3管理员，密码都是 123456
INSERT INTO `user` (`id`, `username`, `password`, `real_name`, `nickname`, `phone`, `avatar`, `student_no`, `role`, `balance`, `status`) VALUES
(1, 'xiaoming',   '123456', '张小明', '小明',   '13800000001', '', '2021010101', 1, 100.00, 1),
(2, 'dali',       '123456', '李大力', '大力',   '13800000002', '', '2021010102', 2, 200.00, 1),
(3, 'wanglaoshi', '123456', '王老师', '王老师', '13800000003', '', 'T2021001',   3,   0.00, 1);

-- 收货地址：2 条，都属于张小明
INSERT INTO `address` (`id`, `user_id`, `contact_name`, `phone`, `building`, `room`, `detail`, `is_default`) VALUES
(1, 1, '张小明', '13800000001', '3号楼', '305', '3号楼下快递柜旁边那栋', 1),
(2, 1, '张小明', '13800000001', '1号楼', '512', '一食堂后面那栋', 0);

-- 骑手：1 条，对应李大力
INSERT INTO `rider` (`id`, `user_id`, `real_name`, `phone`, `student_no`, `status`, `total_orders`, `credit_score`) VALUES
(1, 2, '李大力', '13800000002', '2021010102', 1, 26, 98);

-- 店铺：4 家（2 家校园外卖、2 家小卖部）
INSERT INTO `shop` (`id`, `shop_name`, `shop_type`, `logo`, `phone`, `address`, `open_time`, `close_time`, `min_amount`, `delivery_fee`, `notice`, `status`, `sort`) VALUES
(1, '一食堂·兰州拉面',   2, '', '13800001001', '第一食堂一楼 08 号窗口', '07:00', '21:00', 15.00, 2.00, '现拉现煮，高峰期请耐心等待', 1, 1),
(2, '二食堂·黄焖鸡米饭', 2, '', '13800001002', '第二食堂二楼 12 号窗口', '10:00', '20:30', 16.00, 2.00, '米饭免费加，汤免费',         1, 2),
(3, '3号楼下便利店',     3, '', '13800001003', '3号楼一楼架空层',        '07:00', '23:30', 10.00, 3.00, '24 小时可下单，9 点前送到',   1, 3),
(4, '校园超市零食铺',    3, '', '13800001004', '校园超市进门右手边',     '08:30', '22:00', 12.00, 3.00, '满 20 元减 2 元',            1, 4);

-- 商品分类：9 条（shop_id 为 0 表示平台通用分类，这里都挂在具体店铺下）
INSERT INTO `goods_category` (`id`, `shop_id`, `name`, `sort`, `status`) VALUES
(1, 1, '招牌拉面',   1, 1),
(2, 1, '小吃凉菜',   2, 1),
(3, 2, '黄焖鸡系列', 1, 1),
(4, 2, '配菜饮料',   2, 1),
(5, 3, '饮料水',     1, 1),
(6, 3, '零食',       2, 1),
(7, 3, '生活用品',   3, 1),
(8, 4, '零食膨化',   1, 1),
(9, 4, '方便速食',   2, 1);

-- 商品：12 条，都是校园里常见的东西
INSERT INTO `goods` (`id`, `shop_id`, `category_id`, `goods_name`, `image`, `price`, `original_price`, `stock`, `sales`, `unit`, `description`, `status`, `sort`) VALUES
(1,  1, 1, '兰州牛肉拉面',         '', 15.00, 18.00, 100, 320, '份', '招牌，牛肉片加萝卜加香菜', 1, 1),
(2,  1, 1, '加辣牛肉拉面',         '', 17.00, 20.00,  80, 156, '份', '多加一勺辣椒油，能吃辣的选', 1, 2),
(3,  1, 2, '卤鸡蛋',               '',  2.50,  3.00, 200, 480, '个', '拉面好搭档',               1, 3),
(4,  2, 3, '黄焖鸡米饭（小份）',   '', 16.00, 18.00, 120, 265, '份', '小份装，一个女生刚好吃完', 1, 1),
(5,  2, 3, '黄焖鸡米饭（大份）',   '', 20.00, 23.00,  90, 143, '份', '大份装，米饭可以免费加',   1, 2),
(6,  2, 4, '土豆片',               '',  4.00,  5.00, 150,  88, '份', '黄焖鸡里那种软土豆片',     1, 3),
(7,  2, 4, '冰红茶',               '',  3.50,  4.00, 300, 210, '瓶', '500ml，冰镇更好喝',        1, 4),
(8,  3, 5, '农夫山泉550ml',        '',  2.00,  2.50, 500, 660, '瓶', '宿舍常备',                 1, 1),
(9,  3, 6, '乐事薯片（原味）',     '',  6.50,  7.50, 100, 175, '袋', '看剧必备',                 1, 2),
(10, 3, 7, '心相印抽纸',           '',  5.00,  6.50, 120,  96, '包', '3 层 100 抽',              1, 3),
(11, 4, 8, '可比克薯片',           '',  5.50,  6.00,  80,  60, '袋', '番茄味，大袋装',           1, 1),
(12, 4, 9, '康师傅红烧牛肉面',     '',  4.50,  5.00, 200, 330, '桶', '桶装，宿舍泡着方便',       1, 2);

-- 快递驿站：3 个
INSERT INTO `express_station` (`id`, `station_name`, `address`, `phone`, `business_hours`, `status`) VALUES
(1, '菜鸟驿站3号楼店', '3号楼一楼架空层东侧', '0571-88880001', '08:00-20:00', 1),
(2, '京东快递服务站', '学校东门快递服务中心', '0571-88880002', '09:00-19:00', 1),
(3, '邮政快递代收点', '学校西门邮政服务点',   '0571-88880003', '08:30-18:00', 1);

-- 订单：4 条，覆盖三种业务
-- 1 号：代取快递，待接单，还没人接
-- 2 号：校园外卖，配送中，李大力已接单
-- 3 号：小卖部，已完成
-- 4 号：代取快递，待接单
INSERT INTO `orders` (`id`, `order_no`, `order_type`, `user_id`, `rider_id`, `shop_id`, `station_id`, `receiver_name`, `receiver_phone`, `receiver_building`, `receiver_room`, `pickup_code`, `express_company`, `package_size`, `package_weight`, `goods_amount`, `delivery_fee`, `tip`, `total_amount`, `remark`, `expect_time`, `status`, `pay_status`, `pay_time`, `accept_time`, `finish_time`, `cancel_reason`) VALUES
(1, CONCAT('CE', DATE_FORMAT(NOW(), '%Y%m%d'), '0001'), 1, 1, NULL, NULL, 1, '张小明', '13800000001', '3号楼', '305', '8-2-3051', '中通快递', 2, 2.50, 0.00, 3.00, 1.00, 4.00, '有点重，麻烦送到宿舍门口', DATE_ADD(NOW(), INTERVAL 1 HOUR), 1, 1, DATE_SUB(NOW(), INTERVAL 30 MINUTE), NULL, NULL, NULL),
(2, CONCAT('CE', DATE_FORMAT(NOW(), '%Y%m%d'), '0002'), 2, 1, 1,    1,    NULL, '张小明', '13800000001', '3号楼', '305', NULL, NULL, NULL, NULL, 20.00, 2.00, 0.00, 22.00, '拉面多加辣，鸡蛋单独装', DATE_ADD(NOW(), INTERVAL 30 MINUTE), 2, 1, DATE_SUB(NOW(), INTERVAL 45 MINUTE), DATE_SUB(NOW(), INTERVAL 20 MINUTE), NULL, NULL),
(3, CONCAT('CE', DATE_FORMAT(NOW(), '%Y%m%d'), '0003'), 3, 1,    1,    3,    NULL, '张小明', '13800000001', '1号楼', '512', NULL, NULL, NULL, NULL, 15.50, 3.00, 0.00, 18.50, '放宿舍门口就行，不用敲门', DATE_SUB(NOW(), INTERVAL 10 MINUTE), 3, 1, DATE_SUB(NOW(), INTERVAL 90 MINUTE), DATE_SUB(NOW(), INTERVAL 70 MINUTE), DATE_SUB(NOW(), INTERVAL 40 MINUTE), NULL),
(4, CONCAT('CE', DATE_FORMAT(NOW(), '%Y%m%d'), '0004'), 1, 1, NULL, NULL, 2, '张小明', '13800000001', '3号楼', '305', 'JD-0098', '京东快递', 1, 0.80, 0.00, 2.00, 0.50, 2.50, '小件，下午四点以后送', DATE_ADD(NOW(), INTERVAL 2 HOUR), 1, 1, DATE_SUB(NOW(), INTERVAL 15 MINUTE), NULL, NULL, NULL);

-- 订单明细：有商品的订单才需要（2 号外卖单、3 号小卖部单）
INSERT INTO `order_item` (`id`, `order_id`, `goods_id`, `goods_name`, `goods_image`, `price`, `quantity`, `amount`) VALUES
(1, 2, 1, '兰州牛肉拉面',     '', 15.00, 1, 15.00),
(2, 2, 3, '卤鸡蛋',           '',  2.50, 2,  5.00),
(3, 3, 8, '农夫山泉550ml',    '',  2.00, 2,  4.00),
(4, 3, 9, '乐事薯片（原味）', '',  6.50, 1,  6.50),
(5, 3, 10, '心相印抽纸',      '',  5.00, 1,  5.00);

-- 订单状态流水
INSERT INTO `order_status_log` (`id`, `order_id`, `status`, `operator_id`, `operator_role`, `remark`) VALUES
(1, 1, 1, 1, 1, '用户下单并支付成功，等待骑手接单'),
(2, 2, 1, 1, 1, '用户下单并支付成功，等待骑手接单'),
(3, 2, 2, 2, 2, '骑手李大力已接单，开始配送'),
(4, 3, 1, 1, 1, '用户下单并支付成功，等待骑手接单'),
(5, 3, 2, 2, 2, '骑手李大力已接单，开始配送'),
(6, 3, 3, 2, 2, '商品已送到宿舍门口，订单完成'),
(7, 4, 1, 1, 1, '用户下单并支付成功，等待骑手接单');

-- 订单评价：给 3 号已完成订单补一条
INSERT INTO `order_review` (`id`, `order_id`, `user_id`, `rider_id`, `score`, `content`) VALUES
(1, 3, 1, 1, 5, '送得很快，东西也没坏，好评');

-- 购物车：张小明在 3号楼下便利店 加了三样东西（同一个店铺才能一起结算）
INSERT INTO `cart` (`id`, `user_id`, `shop_id`, `goods_id`, `quantity`) VALUES
(1, 1, 3, 8,  3),
(2, 1, 3, 9,  1),
(3, 1, 3, 10, 1);

-- 首页公告与轮播图：各 1 条
INSERT INTO `announcement` (`id`, `title`, `content`, `image`, `type`, `status`, `sort`) VALUES
(1, '校园代跑腿平台上线啦', '代取快递、食堂外卖、小卖部送货都能下单，首单免配送费。', '', 1, 1, 1),
(2, '新用户立减 2 元',     '活动时间：本月 1 号到 30 号，下单自动抵扣。',       '', 2, 1, 2);

-- =============================================================
-- 演示数据结束
-- 自检查询：执行下面几行可以看看每张表插入了多少条数据
-- =============================================================
-- SELECT COUNT(*) AS user_count FROM `user`;
-- SELECT COUNT(*) AS shop_count FROM `shop`;
-- SELECT COUNT(*) AS goods_count FROM `goods`;
-- SELECT COUNT(*) AS order_count FROM `orders`;
