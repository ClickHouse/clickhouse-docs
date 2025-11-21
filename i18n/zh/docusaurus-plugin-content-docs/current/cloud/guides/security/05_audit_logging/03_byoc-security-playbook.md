---
sidebar_label: 'BYOC 安全指南'
slug: /cloud/security/audit-logging/byoc-security-playbook
title: 'BYOC 安全指南'
description: '本页介绍客户可用于识别潜在安全事件的方法'
doc_type: 'guide'
keywords: ['byoc', 'security', 'playbook', '最佳实践', '合规性']
---



# BYOC 安全手册 {#byoc-security-playbook}

ClickHouse 基于安全责任共担模型运营自带云(BYOC)服务,该模型可从我们的信任中心 https://trust.clickhouse.com 下载。以下信息为 BYOC 客户提供了识别潜在安全事件的示例。客户应结合自身安全计划考虑这些信息,以确定是否需要配置额外的检测和告警机制。


## 可能已泄露的 ClickHouse 凭据 {#compromised-clickhouse-credentials}

请参阅[数据库审计日志](/cloud/security/audit-logging/database-audit-log)文档，了解如何通过查询检测基于凭据的攻击以及调查恶意活动。


## 应用层拒绝服务攻击 {#application-layer-dos-attack}

执行拒绝服务 (DoS) 攻击的方法有多种。如果攻击旨在通过特定载荷使 ClickHouse 实例崩溃,应将系统恢复到运行状态,或重启系统并限制访问以重新获得控制权。可使用以下查询检查 [system.crash_log](/operations/system-tables/crash_log) 以获取有关攻击的更多信息。

```sql
SELECT *
FROM clusterAllReplicas('default',system.crash_log)
```


## ClickHouse 创建的 AWS 角色被入侵 {#compromised-clickhouse-created-aws-roles}

ClickHouse 利用预先创建的角色来启用系统功能。本节假设客户正在使用 AWS CloudTrail,并且有权访问 CloudTrail 日志。

如果某个安全事件可能是由角色被入侵导致的,请在 CloudTrail 和 CloudWatch 中审查与 ClickHouse IAM 角色和操作相关的活动。有关 IAM 角色列表,请参阅设置过程中提供的 [CloudFormation](/cloud/reference/byoc/onboarding/aws#cloudformation-iam-roles) 堆栈或 Terraform 模块。


## 未经授权访问 EKS 集群 {#unauthorized-access-eks-cluster}

ClickHouse BYOC 运行在 EKS 内部。本节假定客户正在使用 AWS 中的 CloudTrail 和 CloudWatch,并且有权访问日志。

如果某个安全事件可能是 EKS 集群遭到入侵所致,请在 EKS CloudWatch 日志中使用以下查询来识别特定威胁。

按用户名列出 Kubernetes API 调用次数

```sql
fields user.username
| stats count(*) as count by user.username
```

识别用户是否为 ClickHouse 工程师

```sql
fields @timestamp,user.extra.sessionName.0, requestURI, verb,userAgent, @message, @logStream, @log
| sort @timestamp desc
| filter user.username like /clickhouse.com/
| limit 10000
```

审查访问 Kubernetes Secret 的用户,过滤掉服务角色

```sql
fields @timestamp,user.extra.sessionName.0, requestURI, verb,userAgent, @message, @logStream, @log
| sort @timestamp desc
| filter requestURI like /secret/
| filter verb="get"
| filter ispresent(user.extra.sessionName.0)
| filter user.username not like /ClickHouseManagementRole/
| filter user.username not like /data-plane-mgmt/
```
