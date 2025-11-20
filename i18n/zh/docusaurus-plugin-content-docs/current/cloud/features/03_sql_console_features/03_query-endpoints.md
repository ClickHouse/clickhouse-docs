---
sidebar_title: '查询 API 端点'
slug: /cloud/features/query-api-endpoints
description: '从保存的查询轻松创建 REST API 端点'
keywords: ['api', 'query api endpoints', 'query endpoints', 'query rest api']
title: '查询 API 端点'
doc_type: 'guide'
---

import {CardSecondary} from '@clickhouse/click-ui/bundled';
import Link from '@docusaurus/Link'


# Query API 端点

构建交互式数据驱动应用程序不仅需要快速的数据库、结构良好的数据和优化的查询，
您的前端和微服务还需要一种便捷的方式来使用这些查询返回的数据,最好是通过结构良好的 API。

**Query API 端点**功能允许您直接从 ClickHouse Cloud 控制台中任何已保存的 SQL 查询创建 API 端点。
您可以通过 HTTP 访问 API 端点来执行已保存的查询,而无需通过原生驱动程序连接到 ClickHouse Cloud 服务。

:::tip 指南
请参阅 [Query API 端点指南](/cloud/get-started/query-endpoints) 了解如何通过几个简单步骤设置 Query API 端点
:::