---
sidebar_label: '数据库审计日志'
slug: /cloud/security/audit-logging/database-audit-log
title: '数据库审计日志'
description: '本页介绍如何查看数据库审计日志'
doc_type: 'guide'
keywords: ['审计日志', '数据库日志', '合规', '安全', '监控']
---



# 数据库审计日志 {#database-audit-log}

ClickHouse 默认提供数据库审计日志功能。本页面重点介绍与安全相关的日志。有关系统记录数据的更多信息,请参阅[系统表](/operations/system-tables/overview)文档。

:::tip 日志保留
信息直接记录到系统表中,默认保留最多 30 天。此期限可能更长或更短,受系统中合并操作频率的影响。客户可以采取额外措施来延长日志存储时间,或将日志导出到安全信息和事件管理 (SIEM) 系统进行长期存储。详细信息见下文。
:::


## 安全相关日志 {#security-relevant-logs}

ClickHouse 主要将与安全相关的数据库事件记录到会话日志和查询日志中。

[system.session_log](/operations/system-tables/session_log) 记录成功和失败的登录尝试,以及身份验证尝试的来源位置。这些信息可用于识别针对 ClickHouse 实例的凭据填充攻击或暴力破解攻击。

显示登录失败的示例查询

```sql
select event_time
    ,type
    ,user
    ,auth_type
    ,client_address
FROM clusterAllReplicas('default',system.session_log)
WHERE type='LoginFailure'
LIMIT 100
```

[system.query_log](/operations/system-tables/query_log) 捕获 ClickHouse 实例中执行的查询活动。这些信息可用于确定威胁行为者执行了哪些查询。

搜索"compromised_account"用户活动的示例查询

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


## 在服务内保留日志数据 {#reatining-log-data-within-services}

需要更长保留期限或日志持久性的用户可以使用物化视图来实现这些目标。有关物化视图的更多信息,包括其定义、优势以及实现方法,请参阅我们的[物化视图](/materialized-views)视频和文档。


## 导出日志 {#exporting-logs}

系统日志可以使用与 SIEM 系统兼容的多种格式写入或导出到存储位置。有关更多信息,请参阅我们的[表函数](/sql-reference/table-functions)文档。最常用的方法有:

- [写入 S3](/sql-reference/table-functions/s3)
- [写入 GCS](/sql-reference/table-functions/gcs)
- [写入 Azure Blob Storage](/sql-reference/table-functions/azureBlobStorage)
