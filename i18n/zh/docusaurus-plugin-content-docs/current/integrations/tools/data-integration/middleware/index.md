---
sidebar_label: 'Middleware'
slug: /integrations/middleware
keywords: ['clickhouse', 'middleware', '可观测性', '集成', '监控']
description: '将 Middleware 连接到 ClickHouse，以监控和分析 ClickHouse 的指标与日志。'
title: '将 Middleware 连接到 ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_integration'
---

import PartnerBadge from '@theme/badges/PartnerBadge';

# 将 Middleware 连接到 ClickHouse \{#connecting-middleware-to-clickhouse\}

<PartnerBadge />

[Middleware](https://middleware.io/) 是一个云可观测性平台，用于监控基础设施、日志和应用性能。

您可以将 ClickHouse 连接到 Middleware，以收集并可视化数据库遥测数据，并将其纳入更广泛的监控工作流中。

## 前提条件 \{#prerequisites\}

* 一个正在运行的 ClickHouse 服务 (Cloud 或自管理)
* 可访问您的 ClickHouse 主机、端口、用户名和密码
* 一个 Middleware 账户

## 在 Middleware 中连接 ClickHouse \{#connect-clickhouse-in-middleware\}

1. 登录您的 Middleware 账户。
2. 前往 **集成**，搜索 **ClickHouse**。
3. 选择 ClickHouse 集成，然后输入您的连接信息：
   * 主机
   * 端口
   * 数据库
   * 用户名
   * 密码
4. 保存该集成并运行连接测试。

## 验证数据采集 \{#verify-data-collection\}

完成配置后，确认您可以在 Middleware 仪表板中看到 ClickHouse 的指标和/或日志。

如果连接验证失败，请检查以下各项：

* ClickHouse 是否接受来自 Middleware 的入站连接
* SSL/TLS 设置是否与您的 ClickHouse 端点匹配
* 凭据和数据库权限是否正确

## 更多资源 \{#additional-resources\}

* [Middleware 官网](https://middleware.io/)