---
slug: /use-cases/observability/clickstack/admin
title: 'ClickStack - 管理'
sidebar_label: '管理'
description: '如何使用 ClickStack 执行基础管理任务。'
doc_type: 'guide'
keywords: ['clickstack', 'admin']
---

在 ClickStack 中，大多数管理任务都是直接在底层的 ClickHouse 数据库上执行的。部署 ClickStack 的用户应当熟悉 ClickHouse 的相关概念和基础管理知识。

管理操作通常涉及执行 DDL 语句。可用的选项取决于您使用的是托管版 ClickStack 还是 ClickStack 开源版。

## ClickStack 开源版 \{#clickstack-oss\}

对于 ClickStack 开源版部署，用户使用 [ClickHouse 客户端](/interfaces/cli) 执行运维和管理任务。该客户端通过原生 ClickHouse 协议连接到数据库，支持完整的 DDL 和管理操作，并为查询提供交互式反馈。

## 托管版 ClickStack \{#clickstack-managed\}

在托管版 ClickStack 中，用户也可以使用 ClickHouse 客户端和 [SQL Console](/cloud/get-started/sql-console)。要通过客户端连接，用户需要获取[该服务的访问凭证](/cloud/guides/sql-console/gather-connection-details)。

[SQL Console](/cloud/get-started/sql-console) 是一个基于 Web 的界面，提供了更便捷的使用体验，包括 SQL 自动补全、查询历史记录，以及用于结果可视化的内置图表功能。