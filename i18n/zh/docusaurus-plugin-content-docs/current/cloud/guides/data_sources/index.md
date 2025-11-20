---
slug: /cloud/guides/data-sources
title: '数据源'
hide_title: true
description: 'ClickHouse Cloud 指南部分的内容目录页'
doc_type: 'landing-page'
keywords: ['cloud guides', 'documentation', 'how-to', 'cloud features', 'tutorials']
---



## 云集成 {#cloud-integrations}

本节包含将 ClickHouse Cloud 与需要额外配置的外部数据源进行集成的指南和参考文档。

| 页面                                                           | 描述                                                            |
| -------------------------------------------------------------- | ---------------------------------------------------------------------- |
| [云 IP 地址](/manage/data-sources/cloud-endpoints-api) | 某些表函数和连接所需的网络信息 |
| [安全访问 S3 数据](/cloud/data-sources/secure-s3)    | 使用基于角色的访问控制访问 AWS S3 中的外部数据源         |


## 外部数据源的其他连接方式 {#additional-connections-for-external-data-sources}

### 使用 ClickPipes 进行数据摄取 {#clickpipes-for-data-ingestion}

ClickPipes 允许用户轻松集成来自多个数据源的流式数据。更多信息请参阅集成文档中的 [ClickPipes](/integrations/clickpipes)。

### 使用表函数作为外部数据源 {#table-functions-as-external-data-sources}

ClickHouse 支持多种表函数来访问外部数据源。更多信息请参阅 SQL 参考文档中的[表函数](/sql-reference/table-functions)。
