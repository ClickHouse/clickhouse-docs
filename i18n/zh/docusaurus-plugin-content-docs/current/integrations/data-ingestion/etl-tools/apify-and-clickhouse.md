---
sidebar_label: 'Apify'
keywords: ['apify', '网页抓取', '数据摄取', 'actors', 'datasets', '自动化', 'webhooks']
slug: /integrations/apify
description: '将 Apify 中的网页抓取和自动化数据导入 ClickHouse'
title: '将 Apify 连接到 ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_ingestion'
  - website: 'https://apify.com/'
---

import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';
import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

# 将 Apify 连接到 ClickHouse \{#connect-apify-to-clickhouse\}

<CommunityMaintainedBadge />

[Apify](https://apify.com/) 是一个网页抓取与自动化平台。您可以构建、运行和扩展名为 [**Actors**](https://docs.apify.com/platform/actors) 的无服务器云程序。Actors 可用于抓取网站、爬取网络内容、处理数据或自动化工作流。每次 Actor 运行都会生成结构化输出，并将其存储在 [**Datasets**](https://docs.apify.com/platform/storage/dataset) (JSON 对象集合) 中。

将抓取或处理后的数据加载到 ClickHouse 中，用于分析、监控或数据富化管道。

## 关键概念 \{#key-concepts\}

| Apify 概念                                                             | 它是什么                                                                                                   |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **[Actor](https://docs.apify.com/platform/actors)**                  | 在 Apify 平台上运行的无服务器云程序。在 [Apify Store](https://apify.com/store) 中可找到数千个现成的 Actor。                       |
| **[Dataset](https://docs.apify.com/platform/storage/dataset)**       | Actor 运行的输出结果。它是类似表格的 JSON 对象集合，可通过 [Apify API](https://docs.apify.com/api/v2) 以 JSON、CSV、XML 或其他格式获取。 |
| **[Webhook](https://docs.apify.com/platform/integrations/webhooks)** | 一种事件驱动的 HTTP 调用，会在 Actor 运行成功、失败或发生其他生命周期事件时触发。使用 webhook 可自动化 Apify 到 ClickHouse 的管道。                 |

## 设置指南 \{#setup-guide\}

<VerticalStepper headerLevel="h3">
  ### 收集您的 ClickHouse 连接信息 \{#1-gather-your-connection-details\}

  <ConnectionDetails />

  ### Apify 前置条件 \{#2-apify-prerequisites\}

  您还需要：

  * 一个 [Apify 账户](https://console.apify.com/sign-up) (提供免费版) 。
  * 一个 [Apify API token](https://docs.apify.com/platform/integrations/api#api-token)，可在 [Apify Console](https://console.apify.com/) 的 **设置 &gt; 集成** 中找到。
  * 在本地安装 Node.js 18+ (用于 JavaScript 示例) 。

  ### 安装依赖 \{#3-install-dependencies\}

  安装 Apify JavaScript 客户端和 ClickHouse JavaScript 客户端：

  ```bash
  npm install apify-client @clickhouse/client
  ```

  :::note
  Apify 还提供 [Python 客户端](https://docs.apify.com/api/client/python)。如果您更倾向于使用 Python，请通过 pip 安装 `apify-client`，并为 ClickHouse 使用 [clickhouse-connect](/integrations/python)。
  :::

  ### 在 ClickHouse 中创建目标表 \{#4-create-a-target-table\}

  创建一个表来存放抓取到的数据。schema 取决于您使用的 Actor。以下示例针对一个商品抓取 Actor 使用 [MergeTree](/engines/table-engines/mergetree-family/mergetree.md)：

  ```sql
  CREATE TABLE apify_products
  (
      url        String,
      title      String,
      price      Float64,
      currency   String,
      scraped_at DateTime DEFAULT now()
  )
  ENGINE = MergeTree()
  ORDER BY (scraped_at, url);
  ```

  ### 拉取 Apify 数据集并加载到 ClickHouse \{#5-fetch-and-load\}

  以下脚本会拉取 Apify Actor 一次运行的结果，并将其插入 ClickHouse：

  ```javascript
  import { ApifyClient } from 'apify-client';
  import { createClient } from '@clickhouse/client';

  // 初始化客户端
  const apify = new ApifyClient({ token: 'YOUR_APIFY_API_TOKEN' });
  const clickhouse = createClient({
      url: 'https://YOUR_CLICKHOUSE_HOST:8443',
      username: 'default',
      password: 'YOUR_CLICKHOUSE_PASSWORD',
      database: 'default',
  });

  // 从某个 Actor 的最近一次运行中拉取数据集条目
  const run = await apify.actor('YOUR_ACTOR_ID').call();
  const { items } = await apify.dataset(run.defaultDatasetId).listItems();

  console.log(`Fetched ${items.length} items from Apify dataset.`);

  // 插入到 ClickHouse
  await clickhouse.insert({
      table: 'apify_products',
      values: items,
      format: 'JSONEachRow',
  });

  console.log(`Inserted ${items.length} rows into ClickHouse.`);
  await clickhouse.close();
  ```

  :::tip
  对于大型数据集，请使用 [List dataset items](https://docs.apify.com/api/v2#/reference/datasets/item-collection/list-items) 端点的 `limit` 和 `offset` 参数对结果进行分页。您还可以传递 `clean=true`，以仅获取非空且已去重的条目。
  :::

  ### 使用 webhook 实现自动化 \{#6-automate-with-webhooks\}

  与其手动运行脚本，不如将管道自动化，以便每次 Actor 完成后都将数据加载到 ClickHouse：

  1. 在 [Apify Console](https://console.apify.com/) 中，进入您的 Actor 并打开 **集成** 选项卡。
  2. 添加一个新的 webhook，配置如下：
     * **事件类型：** `ACTOR.RUN.SUCCEEDED`
     * **操作：** 向您的加载器端点发送 HTTP POST，或触发另一个负责将数据插入 ClickHouse 的 Actor。
  3. webhook 负载中包含 `defaultDatasetId`，您可以用它来拉取该次运行的结果。

  有关负载详情和配置选项，请参阅 [Apify webhook 文档](https://docs.apify.com/platform/integrations/webhooks)。

  另一种方法是使用 [Apify Schedules](https://docs.apify.com/platform/schedules) 按类似 cron 的计划运行 Actor，并结合 webhook 完成加载步骤。
</VerticalStepper>

## 最佳实践 \{#best-practices\}

### 从 Apify 拉取数据 \{#fetching-data-from-apify\}

使用 Apify 客户端库 (JavaScript 使用 [`apify-client`](https://docs.apify.com/api/client/js)，或 [Python](https://docs.apify.com/api/client/python)) ，而不要直接发起原始 HTTP 请求。它会为你处理分页、重试和身份验证。对于大型数据集，请使用 [List dataset items](https://docs.apify.com/api/v2#/reference/datasets/item-collection/list-items) 接口中的 `limit` 和 `offset` 参数对结果进行分页。

### 加载到 ClickHouse \{#loading-into-clickhouse\}

向 ClickHouse 插入数据时，请使用 [`JSONEachRow`](/interfaces/formats/JSONEachRow) 格式。它与 Apify 的 JSON 输出可直接对应，无需任何转换。

确保 ClickHouse 表的 schema 与 Actor 的输出字段一致。可在其 [Apify Store](https://apify.com/store) 页面或运行后的 **Dataset** 选项卡中查看 Actor 的输出 schema。

### 性能 \{#performance\}

对于通过 JavaScript 客户端进行的高处理量插入，请参考[性能优化提示](/integrations/javascript#tips-for-performance-optimizations)。应将多行数据合并为更大的批次插入，而不是一次插入一行；如果不便在客户端侧进行批处理，请考虑使用[异步插入](/optimize/asynchronous-inserts)。

### 安全性 \{#security\}

为简化说明，本页中的示例使用 `default` 用户和数据库。在生产环境中，请创建一个专用用户，并仅授予其向目标表执行插入操作所需的最小特权，同时安全地存储凭证 (例如存放在环境变量或密钥管理器中，而不是提交到源代码中) 。相关指引请参见 [云访问管理](/cloud/security/cloud_access_management)。

## 相关资源 \{#related-resources\}

* [Apify 平台文档](https://docs.apify.com)
* [Apify API 参考文档](https://docs.apify.com/api/v2)
* [Apify JavaScript 客户端](https://docs.apify.com/api/client/js)
* [Apify Python 客户端](https://docs.apify.com/api/client/python)
* [Apify Store (现成的 Actor) ](https://apify.com/store)
* [Apify 集成总览](https://docs.apify.com/platform/integrations)
* [ClickHouse JavaScript 客户端](/integrations/language-clients/js.md)