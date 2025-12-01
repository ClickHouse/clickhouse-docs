---
slug: /troubleshooting
sidebar_label: '故障排查'
doc_type: 'guide'
keywords: [
  'ClickHouse 故障排查',
  'ClickHouse 错误',
  '数据库故障排查',
  'ClickHouse 连接问题',
  '内存超出限制',
  'ClickHouse 性能问题',
  '数据库错误信息',
  'ClickHouse 配置问题',
  '连接被拒绝错误',
  'ClickHouse 调试',
  '数据库连接问题',
  '故障排查指南'
]
title: '常见问题故障排查'
description: '查找最常见 ClickHouse 问题的解决方案，包括慢查询、内存错误、连接问题和配置问题。'
---



# 常见问题排查 {#troubleshooting-common-issues}

使用 ClickHouse 时遇到问题了？你可以在这里找到常见问题的解决方案。



## 性能和错误 {#performance-and-errors}

查询运行缓慢、出现超时，或者收到诸如 "Memory limit exceeded"（超出内存限制）或 "Connection refused"（连接被拒绝）这类特定错误信息。

<details>
<summary><strong>显示性能和错误相关解决方案</strong></summary>

### 查询性能 {#query-performance}
- [查找占用资源最多的查询](/knowledgebase/find-expensive-queries)
- [完整查询优化指南](/docs/optimize/query-optimization)
- [优化 JOIN 操作](/docs/best-practices/minimize-optimize-joins)
- [运行诊断查询以发现瓶颈](/docs/knowledgebase/useful-queries-for-troubleshooting)
<br/>
### 数据插入性能 {#data-insertion-performance}
- [加速数据插入](/docs/optimize/bulk-inserts)
- [配置异步插入](/docs/optimize/asynchronous-inserts)
<br/>
### 高级分析工具 {#advanced-analysis-tools}
<!-- - [Profile with LLVM XRay](/docs/knowledgebase/profiling-clickhouse-with-llvm-xray) -->
- [检查当前正在运行的进程](/docs/knowledgebase/which-processes-are-currently-running)
- [监控系统性能](/docs/operations/system-tables/processes)
<br/>
### 错误信息 {#error-messages}
- **"Memory limit exceeded"** → [调试内存限制错误](/docs/guides/developer/debugging-memory-issues)
- **"Connection refused"** → [修复连接问题](#connections-and-authentication)
- **"Login failures"** → [配置用户、角色和权限](/docs/operations/access-rights)
- **"SSL certificate errors"** → [修复证书问题](/docs/knowledgebase/certificate_verify_failed_error)
- **"Table/database errors"** → [数据库创建指南](/docs/sql-reference/statements/create/database) | [表 UUID 问题](/docs/engines/database-engines/atomic)
- **"Network timeouts"** → [网络故障排查](/docs/interfaces/http)
- **其他问题** → [在集群中跟踪错误](/docs/operations/system-tables/errors)
</details>



## 内存和资源 {#memory-and-resources}

高内存占用、内存不足导致的崩溃，或需要帮助确定 ClickHouse 部署的资源规格。

<details>
<summary><strong>查看内存相关解决方案</strong></summary>

### 内存调试和监控：{#memory-debugging-and-monitoring}

- [识别内存占用来源](/docs/guides/developer/debugging-memory-issues)
- [检查当前内存使用情况](/docs/operations/system-tables/processes)
- [内存分配性能分析](/docs/operations/allocation-profiling)
- [分析内存使用模式](/docs/operations/system-tables/query_log)
<br/>
### 内存配置：{#memory-configuration}

- [配置内存限制](/docs/operations/settings/memory-overcommit)
- [服务器内存设置](/docs/operations/server-configuration-parameters/settings)
- [会话内存设置](/docs/operations/settings/settings)
<br/>
### 扩展和规格设定：{#scaling-and-sizing}

- [为服务选择合适的规格](/docs/operations/tips)
- [配置自动伸缩](/docs/manage/scaling)

</details>



## 连接与身份验证 {#connections-and-authentication}

无法连接 ClickHouse、身份验证失败、SSL 证书错误或客户端配置问题。

<details>
<summary><strong>查看连接相关解决方案</strong></summary>

### 基本连接问题 {#basic-connection-issues}
- [解决 HTTP 接口问题](/docs/interfaces/http)
- [处理 SSL 证书问题](/docs/knowledgebase/certificate_verify_failed_error)
- [用户身份验证设置](/docs/operations/access-rights)
<br/>
### 客户端接口 {#client-interfaces}
- [原生 ClickHouse 客户端](/docs/interfaces/natives-clients-and-interfaces)
- [MySQL 接口问题](/docs/interfaces/mysql)
- [PostgreSQL 接口问题](/docs/interfaces/postgresql)
- [gRPC 接口配置](/docs/interfaces/grpc)
- [SSH 接口设置](/docs/interfaces/ssh)
<br/>
### 网络与数据 {#network-and-data}
- [网络安全设置](/docs/operations/server-configuration-parameters/settings)
- [数据格式解析问题](/docs/interfaces/formats)

</details>



## 安装与配置 {#setup-and-configuration}

初始安装、服务器配置、数据库创建、数据摄取问题或复制设置。

<details>
<summary><strong>显示安装与配置相关解决方案</strong></summary>

### 初始设置 {#initial-setup}
- [配置服务器参数](/docs/operations/server-configuration-parameters/settings)
- [设置安全与访问控制](/docs/operations/access-rights)
- [合理配置硬件](/docs/operations/tips)
<br/>
### 数据库管理 {#database-management}
- [创建和管理数据库](/docs/sql-reference/statements/create/database)
- [选择合适的表引擎](/docs/engines/table-engines)
<!-- - [Modify schemas safely](/docs/sql-reference/statements/alter/index) -->
<br/>
### 数据操作 {#data-operations}
- [优化批量数据插入](/docs/optimize/bulk-inserts)
- [处理数据格式问题](/docs/interfaces/formats)
- [设置流式数据管道](/docs/optimize/asynchronous-inserts)
- [提升 S3 集成性能](/docs/integrations/s3/performance)
<br/>
### 高级配置 {#advanced-configuration}
- [设置数据复制](/docs/engines/table-engines/mergetree-family/replication)
- [配置分布式表](/docs/engines/table-engines/special/distributed)
<!-- - [ClickHouse Keeper setup](/docs/guides/sre/keeper/index.md) -->
- [设置备份与恢复](/docs/operations/backup)
- [配置监控](/docs/operations/system-tables/overview)

</details>



## 还需要帮助？ {#still-need-help}

如果仍然找不到解决方案：

1. **Ask AI** - 通过 <KapaLink>Ask AI</KapaLink> 获取即时解答。
1. **检查系统表** - [概览](/operations/system-tables/overview)
2. **查看服务器日志** - 在 ClickHouse 日志中查找错误消息。
3. **咨询社区** - [加入我们的社区 Slack](https://clickhouse.com/slack)、[GitHub Discussions](https://github.com/ClickHouse/ClickHouse/discussions)
4. **获取专业支持** - [ClickHouse Cloud 支持](https://clickhouse.com/support)