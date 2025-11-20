---
slug: /troubleshooting
sidebar_label: '故障排除'
doc_type: 'guide'
keywords: [
  'clickhouse 故障排除',
  'clickhouse 错误',
  '数据库故障排除',
  'clickhouse 连接问题',
  '超出内存限制',
  'clickhouse 性能问题',
  '数据库错误消息',
  'clickhouse 配置问题',
  '连接被拒绝错误',
  'clickhouse 调试',
  '数据库连接问题',
  '故障排除指南'
]
title: '常见问题排查'
description: '了解并解决最常见的 ClickHouse 问题，包括慢查询、内存错误、连接问题和配置问题。'
---



# 常见问题排查 {#troubleshooting-common-issues}

使用 ClickHouse 遇到问题?请在此查找常见问题的解决方案。


## 性能与错误 {#performance-and-errors}

查询运行缓慢、超时,或收到特定错误消息,如 "Memory limit exceeded" 或 "Connection refused"。

<details>
<summary><strong>显示性能与错误解决方案</strong></summary>

### 查询性能 {#query-performance}

- [查找占用最多资源的查询](/knowledgebase/find-expensive-queries)
- [完整查询优化指南](/docs/optimize/query-optimization)
- [优化 JOIN 操作](/docs/best-practices/minimize-optimize-joins)
- [运行诊断查询以定位瓶颈](/docs/knowledgebase/useful-queries-for-troubleshooting)
  <br />

### 数据插入性能 {#data-insertion-performance}

- [提升数据插入速度](/docs/optimize/bulk-inserts)
- [配置异步插入](/docs/optimize/asynchronous-inserts)
  <br />

### 高级分析工具 {#advanced-analysis-tools}

<!-- - [Profile with LLVM XRay](/docs/knowledgebase/profiling-clickhouse-with-llvm-xray) -->

- [检查当前运行的进程](/docs/knowledgebase/which-processes-are-currently-running)
- [监控系统性能](/docs/operations/system-tables/processes)
  <br />

### 错误消息 {#error-messages}

- **"Memory limit exceeded"** → [调试内存限制错误](/docs/guides/developer/debugging-memory-issues)
- **"Connection refused"** → [修复连接问题](#connections-and-authentication)
- **"Login failures"** → [配置用户、角色和权限](/docs/operations/access-rights)
- **"SSL certificate errors"** → [修复证书问题](/docs/knowledgebase/certificate_verify_failed_error)
- **"Table/database errors"** → [数据库创建指南](/docs/sql-reference/statements/create/database) | [表 UUID 问题](/docs/engines/database-engines/atomic)
- **"Network timeouts"** → [网络故障排查](/docs/interfaces/http)
- **其他问题** → [跟踪集群错误](/docs/operations/system-tables/errors)
  </details>


## 内存和资源 {#memory-and-resources}

内存使用率过高、内存溢出崩溃,或需要帮助确定 ClickHouse 部署规模。

<details>
<summary><strong>显示内存解决方案</strong></summary>

### 内存调试和监控: {#memory-debugging-and-monitoring}

- [识别内存使用情况](/docs/guides/developer/debugging-memory-issues)
- [检查当前内存使用情况](/docs/operations/system-tables/processes)
- [内存分配性能分析](/docs/operations/allocation-profiling)
- [分析内存使用模式](/docs/operations/system-tables/query_log)
  <br />

### 内存配置: {#memory-configuration}

- [配置内存限制](/docs/operations/settings/memory-overcommit)
- [服务器内存设置](/docs/operations/server-configuration-parameters/settings)
- [会话内存设置](/docs/operations/settings/settings)
  <br />

### 扩展和容量规划: {#scaling-and-sizing}

- [合理调整服务规模](/docs/operations/tips)
- [配置自动扩展](/docs/manage/scaling)

</details>


## 连接与身份验证 {#connections-and-authentication}

无法连接到 ClickHouse、身份验证失败、SSL 证书错误或客户端配置问题。

<details>
<summary><strong>显示连接解决方案</strong></summary>

### 基本连接问题 {#basic-connection-issues}

- [解决 HTTP 接口问题](/docs/interfaces/http)
- [处理 SSL 证书问题](/docs/knowledgebase/certificate_verify_failed_error)
- [用户身份验证配置](/docs/operations/access-rights)
  <br />

### 客户端接口 {#client-interfaces}

- [原生 ClickHouse 客户端](/docs/interfaces/natives-clients-and-interfaces)
- [MySQL 接口问题](/docs/interfaces/mysql)
- [PostgreSQL 接口问题](/docs/interfaces/postgresql)
- [gRPC 接口配置](/docs/interfaces/grpc)
- [SSH 接口配置](/docs/interfaces/ssh)
  <br />

### 网络与数据 {#network-and-data}

- [网络安全配置](/docs/operations/server-configuration-parameters/settings)
- [数据格式解析问题](/docs/interfaces/formats)

</details>


## 设置与配置 {#setup-and-configuration}

初始安装、服务器配置、数据库创建、数据导入问题或复制设置。

<details>
<summary><strong>显示设置与配置解决方案</strong></summary>

### 初始设置 {#initial-setup}

- [配置服务器设置](/docs/operations/server-configuration-parameters/settings)
- [设置安全性和访问控制](/docs/operations/access-rights)
- [正确配置硬件](/docs/operations/tips)
  <br />

### 数据库管理 {#database-management}

- [创建和管理数据库](/docs/sql-reference/statements/create/database)
- [选择合适的表引擎](/docs/engines/table-engines)
  <!-- - [Modify schemas safely](/docs/sql-reference/statements/alter/index) -->
  <br />

### 数据操作 {#data-operations}

- [优化批量数据插入](/docs/optimize/bulk-inserts)
- [处理数据格式问题](/docs/interfaces/formats)
- [设置流式数据管道](/docs/optimize/asynchronous-inserts)
- [提升 S3 集成性能](/docs/integrations/s3/performance)
  <br />

### 高级配置 {#advanced-configuration}

- [设置数据复制](/docs/engines/table-engines/mergetree-family/replication)
- [配置分布式表](/docs/engines/table-engines/special/distributed)
<!-- - [ClickHouse Keeper setup](/docs/guides/sre/keeper/index.md) -->
- [设置备份和恢复](/docs/operations/backup)
- [配置监控](/docs/operations/system-tables/overview)

</details>


## 仍需帮助？ {#still-need-help}

如果您无法找到解决方案：

1. **咨询 AI** - <KapaLink>咨询 AI</KapaLink> 获取即时答案。
1. **检查系统表** - [概览](/operations/system-tables/overview)
1. **查看服务器日志** - 在 ClickHouse 日志中查找错误信息
1. **咨询社区** - [加入我们的社区 Slack](https://clickhouse.com/slack)、[GitHub 讨论区](https://github.com/ClickHouse/ClickHouse/discussions)
1. **获取专业支持** - [ClickHouse Cloud 支持](https://clickhouse.com/support)
