---
sidebar_label: 'BYOC 安全操作手册'
slug: /cloud/security/audit-logging/byoc-security-playbook
title: 'BYOC 安全操作手册'
description: '本页说明客户可用于识别潜在安全事件的方法'
doc_type: '指南'
keywords: ['byoc', 'security', 'playbook', 'best practices', 'compliance']
---



# BYOC 安全作战手册 {#byoc-security-playbook}

ClickHouse 在“自带云”（Bring Your Own Cloud，BYOC）模式下采用共享责任安全模型。该模型可从我们的信任中心（https://trust.clickhouse.com）下载。以下信息提供给 BYOC 客户，用作识别潜在安全事件的示例。客户应结合自身的安全计划来参考这些信息，以判断是否需要额外的检测和告警。



## 可能已泄露的 ClickHouse 凭证 {#compromised-clickhouse-credentials}

请参阅 [数据库审计日志](/cloud/security/audit-logging/database-audit-log) 文档，了解用于检测基于凭证的攻击和排查恶意活动的查询。



## 应用层拒绝服务攻击

发起拒绝服务（DoS）攻击的方法有多种。如果攻击的目标是通过特定 payload 使 ClickHouse 实例崩溃，请将系统恢复到运行状态，或重启系统并限制访问以重新获得控制权。使用以下查询查看 [system.crash&#95;log](/operations/system-tables/crash_log)，以获取有关此次攻击的更多信息。

```sql
SELECT * 
FROM clusterAllReplicas('default',system.crash_log)
```


## 遭入侵的 ClickHouse 创建的 AWS 角色 {#compromised-clickhouse-created-aws-roles}

ClickHouse 使用预先创建的角色来实现系统功能。本节假设客户在 AWS 上启用了 CloudTrail，并且能够访问 CloudTrail 日志。

如果某个安全事件可能是由于角色被入侵导致的，请在 CloudTrail 和 CloudWatch 中审阅与 ClickHouse IAM 角色及其相关操作有关的活动。有关 IAM 角色列表，请参考作为部署设置一部分提供的 [CloudFormation](/cloud/reference/byoc/onboarding/aws#cloudformation-iam-roles) 堆栈或 Terraform 模块。



## 未经授权访问 EKS 集群

ClickHouse BYOC 在 EKS 中运行。本节假设客户在 AWS 中使用 CloudTrail 和 CloudWatch，并且可以访问相应日志。

如果某个安全事件可能是由于 EKS 集群被入侵导致的，请在 EKS CloudWatch 日志中使用以下查询来识别特定威胁。

按用户名列出 Kubernetes API 调用次数

```sql
fields user.username
| stats count(*) as count by user.username
```

判断某个用户是否为 ClickHouse 工程师

```sql
fields @timestamp,user.extra.sessionName.0, requestURI, verb,userAgent, @message, @logStream, @log
| sort @timestamp desc
| filter user.username like /clickhouse.com/
| limit 10000
```

审查访问 Kubernetes Secret 的用户，并过滤掉服务角色

```sql
fields @timestamp,user.extra.sessionName.0, requestURI, verb,userAgent, @message, @logStream, @log
| sort @timestamp desc
| filter requestURI like /secret/
| filter verb="get"
| filter ispresent(user.extra.sessionName.0)
| filter user.username not like /ClickHouseManagementRole/
| filter user.username not like /data-plane-mgmt/
```
