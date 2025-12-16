---
sidebar_title: '查询 API 端点'
slug: /cloud/features/query-api-endpoints
description: '从已保存的查询轻松创建 REST API 端点'
keywords: ['api', '查询 API 端点', '查询端点', '查询 REST API']
title: '查询 API 端点'
doc_type: 'guide'
---

import {CardSecondary} from '@clickhouse/click-ui/bundled';
import Link from '@docusaurus/Link'

# 查询 API 端点 {#query-api-endpoints}

构建交互式数据驱动应用不仅需要高速数据库、结构良好的数据以及经过优化的查询，
前端和微服务同样需要一种简单的方式来使用这些查询返回的数据，最好是通过结构清晰的 API。

**Query API Endpoints** 功能允许您在 ClickHouse Cloud 控制台中，直接基于任意已保存的 SQL 查询创建一个 API 端点。
您可以通过 HTTP 访问这些 API 端点来执行已保存的查询，而无需通过原生驱动连接到您的 ClickHouse Cloud 服务。

:::tip 指南
请参阅 [Query API endpoints 指南](/cloud/get-started/query-endpoints)，了解如何通过几个简单步骤配置
Query API 端点
:::