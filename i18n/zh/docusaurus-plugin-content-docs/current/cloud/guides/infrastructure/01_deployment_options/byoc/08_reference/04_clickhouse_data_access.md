---
title: 'ClickHouse 数据访问（BYOC）'
slug: /cloud/reference/byoc/reference/clickhouse_data_access
sidebar_label: 'ClickHouse 数据访问'
keywords: ['BYOC', '自带云', '数据访问', '员工访问', 'system.query_log', '故障排查访问', '合规']
description: '在 BYOC 部署中，ClickHouse 员工可访问哪些客户数据'
doc_type: '参考'
---

默认情况下，ClickHouse 员工无法访问您的数据。您的 ClickHouse 数据 (包括所有用户表和查询结果) 始终保留在您的 VPC 中。ClickHouse 与您的部署交互的唯一方式如下所述，其中任何一种都不会授予其访问客户表数据的权限。

## 日常运维操作 \{#routine-operations\}

ClickHouse Cloud 的控制平面可在不读取客户数据的情况下运行您的 BYOC 部署。会将数据发送到 VPC 外部的组件仅携带运维元数据：

| 组件           | 离开您的 VPC 的内容                                       |
| ------------ | -------------------------------------------------- |
| 状态导出器        | 服务状态 (健康状况、状态) 发送到由 ClickHouse Cloud 拥有的 `SQS` 队列。 |
| 计费抓取器        | CPU 和内存指标发送到由 ClickHouse Cloud 拥有的 S3 存储桶。         |
| AlertManager | 集群健康告警发送到 ClickHouse Cloud。                        |

查询流量、表内容和 schema 绝不会经由这些通道传输。日志和指标始终保留在您的 BYOC VPC 内。

## 故障排查访问 \{#troubleshooting-access\}

当 ClickHouse 工程师需要诊断您部署中的问题时，他们会通过内部处理与审批流程申请按需访问。获批后，访问权限会通过有时效限制的证书授予，并通过 [Tailscale](/cloud/reference/byoc/reference/network_security#tailscale-private-network) 进行路由——绝不会经过公共互联网。

### 工程师可以看到什么 \{#what-engineers-can-see\}

在获得批准的故障排查访问权限后，工程师只能读取 ClickHouse 系统表。这包括：

* `system.query_log` — 针对你的服务执行的查询的查询文本和执行元数据
* `system.tables`、`system.columns` 及类似的系统表 — schema 和元数据
* 用于诊断的其他 `system.*` 表 (例如：parts、变更、副本)

### 工程师无法查看的内容 \{#what-engineers-cant-see\}

工程师无法读取客户的用户表。访问范围仅限系统表。

### 如何实施访问控制 \{#how-access-is-enforced\}

* **需要审批**：每个访问请求都必须经过内部审批系统，并由指定审批人批准。工程师不能自行授予自己访问权限。
* **时效性证书**：系统会为每个获批会话生成临时的时效性证书。访问权限会自动失效。
* **基于证书的身份验证**：对于 BYOC 实例的所有人工访问，均使用证书替代基于密码的访问方式。
* **系统表只读**：证书对应的身份权限范围仅限于读取系统表。
* **不导出数据**：故障排查会话中的日志和查询结果绝不会导回 ClickHouse 基础设施。

## 审计 \{#auditing\}

您可以查看工程师活动，ClickHouse 也会对此进行审计：

* **客户可见**：ClickHouse 工程师在您的实例上运行的每个查询都会出现在您自己的 `system.query_log` 中，其中包括查询文本和证书身份。您可以直接通过您的 ClickHouse 服务对其进行审计。
* **ClickHouse 侧**：ClickHouse 的安全团队会在内部记录并审计所有访问请求、审批以及 Tailscale 连接。

## 未来的控制功能 \{#future-controls\}

由客户控制的审批——即每位工程师的访问请求都需经您批准后才会生效——已在路线图中。目前，审批通过 ClickHouse 的内部升级处理流程进行。

## 相关 \{#related\}

* [BYOC 网络安全](/cloud/reference/byoc/reference/network_security) — 介绍 Tailscale 的工作方式以及网络边界如何划分
* [BYOC 权限](/cloud/reference/byoc/reference/privilege) — BYOC 设置过程中创建的 IAM 角色