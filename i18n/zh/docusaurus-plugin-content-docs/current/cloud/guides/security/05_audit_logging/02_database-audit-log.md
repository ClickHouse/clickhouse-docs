---
sidebar_label: '数据库审计日志'
slug: /cloud/security/audit-logging/database-audit-log
title: '数据库审计日志'
description: '本页介绍用户如何查看数据库审计日志'
doc_type: 'guide'
keywords: ['审计日志', '数据库日志', '合规', '安全', '监控']
---



# 数据库审计日志 {#database-audit-log}

ClickHouse 默认提供数据库审计日志。本页重点介绍与安全相关的日志。有关系统记录的数据的更多信息，请参阅 [系统表（system tables）](/operations/system-tables/overview) 文档。

:::tip 日志保留
相关信息会直接记录到系统表中，默认保留期最长为 30 天。该时长可能更长或更短，并会受到系统合并（merge）频率的影响。用户可以采取额外措施以更长时间存储日志，或将日志导出到安全信息和事件管理（SIEM）系统进行长期存储。详见下文。
:::



## 与安全相关的日志 {#security-relevant-logs}

ClickHouse 主要将与安全相关的数据库事件记录在 session 日志和 query 日志中。

[system.session&#95;log](/operations/system-tables/session_log) 记录成功和失败的登录尝试，以及发起身份验证尝试的位置。此信息可用于识别针对 ClickHouse 实例的凭证填充或暴力破解攻击。

用于展示登录失败的示例查询

```sql
SELECT event_time
    ,type
    ,user
    ,auth_type
    ,client_address 
FROM clusterAllReplicas('default',system.session_log) 
WHERE type='LoginFailure' 
LIMIT 100
```

[system.query&#95;log](/operations/system-tables/query_log) 会记录在 ClickHouse 实例中执行的查询活动。这些信息有助于确定攻击者执行了哪些查询。

用于搜索名为 &quot;compromised&#95;account&quot; 的用户活动的示例查询

```sql
SELECT event_time
    ,address
    ,initial_user
    ,initial_address
    ,forwarded_for
    ,query 
FROM clusterAllReplicas('default', system.query_log) 
WHERE user=’compromised_account’
```


## 在服务内部保留日志数据 {#reatining-log-data-within-services}

需要更长时间保留或更高日志持久性的客户可以使用物化视图来实现这些目标。有关物化视图的更多信息，包括概念、优势以及实现方式，请参阅我们关于[物化视图](/materialized-views)的视频和文档。



## 导出日志 {#exporting-logs}

可以采用多种与 SIEM 系统兼容的格式，将系统日志写入或导出到存储位置。有关更多信息，请参阅我们的[表函数](/sql-reference/table-functions)文档。最常见的方法包括：
- [写入 S3](/sql-reference/table-functions/s3)
- [写入 GCS](/sql-reference/table-functions/gcs)
- [写入 Azure Blob Storage](/sql-reference/table-functions/azureBlobStorage)
