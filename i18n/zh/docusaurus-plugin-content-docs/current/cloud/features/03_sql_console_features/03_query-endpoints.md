---
sidebar_title: '查询 API 端点'
slug: /cloud/features/query-api-endpoints
description: '基于已保存的查询轻松创建 REST API 端点'
keywords: ['api', 'query api endpoints', 'query endpoints', 'query rest api']
title: '查询 API 端点'
doc_type: 'guide'
---

import {CardSecondary} from '@clickhouse/click-ui/bundled';
import Link from '@docusaurus/Link'


# 查询 API 端点

要构建交互式的数据驱动应用，不仅需要高速的数据库、良好设计的数据结构以及优化过的查询。
你的前端和微服务同样需要一种简单的方式来使用这些查询返回的数据，最好是通过结构清晰的 API。

**Query API Endpoints** 功能允许你在 ClickHouse Cloud 控制台中，直接基于任意已保存的 SQL 查询创建一个 API 端点。
你可以通过 HTTP 访问这些 API 端点来执行已保存的查询，而无需通过原生驱动连接到 ClickHouse Cloud 服务。

:::tip 指南
请参阅[查询 API 端点指南](/cloud/get-started/query-endpoints)，了解如何通过几个简单步骤完成
查询 API 端点的配置
:::