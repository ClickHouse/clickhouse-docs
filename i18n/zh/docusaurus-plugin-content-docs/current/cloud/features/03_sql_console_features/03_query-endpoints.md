---
sidebar_title: '查询 API 端点'
slug: /cloud/features/query-api-endpoints
description: '从已保存的查询轻松创建 REST API 端点'
keywords: ['api', '查询 API 端点', '查询端点', '查询 REST API']
title: '查询 API 端点'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import {CardSecondary} from '@clickhouse/click-ui/bundled';
import console_api_keys from '@site/static/images/cloud/guides/query-endpoints/console-api-keys.png';
import edit_api_key from '@site/static/images/cloud/guides/query-endpoints/api-key-edit.png';
import specific_locations from '@site/static/images/cloud/guides/query-endpoints/specific-locations.png';
import Link from '@docusaurus/Link'


# 查询 API 端点 \{#query-api-endpoints\}

构建交互式数据驱动应用不仅需要高速数据库、结构良好的数据以及经过优化的查询，
前端和微服务同样需要一种简单的方式来使用这些查询返回的数据，最好是通过结构清晰的 API。

**Query API Endpoints** 功能允许您在 ClickHouse Cloud 控制台中，直接基于任意已保存的 SQL 查询创建一个 API 端点。
您可以通过 HTTP 访问这些 API 端点来执行已保存的查询，而无需通过原生驱动连接到您的 ClickHouse Cloud 服务。

## IP 访问控制 \{#ip-access-control\}

Query API 端点遵循基于 API 密钥的 IP 白名单配置。与 SQL Console 类似，Query API 端点会在 ClickHouse 基础设施内部代理请求，因此服务级别的 IP 白名单设置不适用。

要限制哪些客户端可以调用您的 Query API 端点：

<VerticalStepper headerLevel="h4">

#### 打开 API 密钥设置 \{#open-settings\}

1. 进入 ClickHouse Cloud Console → **Organization** → **API Keys**

<Image img={console_api_keys} alt="API Keys"/>

2. 点击用于 Query API 端点的 API 密钥旁边的 **Edit**

<Image img={edit_api_key} alt="Edit"/>

#### 添加允许的 IP 地址 \{#add-ips\}

1. 在 **Alow access to this API Key** 部分中，选择 **Specific locations**
2. 输入 IP 地址或 CIDR 范围（例如：`203.0.113.1` 或 `203.0.113.0/24`）
3. 根据需要添加多条记录

<Image img={specific_locations} alt="Specific locations"/>

创建 Query API 端点需要 Admin Console Role，以及具有相应权限的 API 密钥。

</VerticalStepper>

:::tip Guide
有关如何通过几个简单步骤设置 Query API 端点的说明，请参见 [Query API endpoints guide](/cloud/get-started/query-endpoints)
:::