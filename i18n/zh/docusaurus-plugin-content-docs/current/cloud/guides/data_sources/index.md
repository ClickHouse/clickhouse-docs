---
slug: /cloud/guides/data-sources
title: '数据源'
hide_title: true
description: 'ClickHouse Cloud 指南部分的目录页'
doc_type: 'landing-page'
keywords: ['云指南', '文档', '操作指南', '云功能', '教程']
---

## 云集成 \\{#cloud-integrations\\}

本节包含将 ClickHouse Cloud 与需要额外配置的外部数据源集成的指南和参考文档。

| 页面                                                            | 描述                                                                      |
|-----------------------------------------------------------------|---------------------------------------------------------------------------|
| [Cloud IP 地址](/manage/data-sources/cloud-endpoints-api)       | 某些表函数和连接所需的网络配置信息                                        |
| [安全访问 S3 数据](/cloud/data-sources/secure-s3)               | 使用基于角色的访问方式访问 AWS S3 中的外部数据源                          |
| [安全访问 GCS 数据](/cloud/data-sources/secure-gcs)             | 使用 HMAC 密钥安全地访问 GCS 中的外部数据源                               |

## 外部数据源的其他连接方式 \\{#additional-connections-for-external-data-sources\\}

### 用于数据摄取的 ClickPipes \\{#clickpipes-for-data-ingestion\\}

ClickPipes 允许用户轻松集成来自多种来源的流式数据。有关更多信息，请参阅我们集成文档中的 [ClickPipes](/integrations/clickpipes)。

### 作为外部数据源的表函数 \\{#table-functions-as-external-data-sources\\}

ClickHouse 支持多种表函数以访问外部数据源。有关更多信息，请参阅 SQL 参考文档中的 [table functions](/sql-reference/table-functions) 部分。