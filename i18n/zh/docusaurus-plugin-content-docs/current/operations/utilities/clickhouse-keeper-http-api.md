---
description: 'ClickHouse Keeper HTTP API 和嵌入式仪表板文档'
sidebar_label: 'Keeper HTTP API'
sidebar_position: 70
slug: /operations/utilities/clickhouse-keeper-http-api
title: 'Keeper HTTP API 和仪表板'
doc_type: 'reference'
---

# Keeper HTTP API 和仪表盘 \{#keeper-http-api-and-dashboard\}

ClickHouse Keeper 提供用于监控、健康检查和存储管理的 HTTP API 和内嵌 Web 仪表盘。
该界面允许运维人员通过 Web 浏览器或 HTTP 客户端查看集群状态、执行命令并管理 Keeper 存储。

## 配置 \{#configuration\}

要启用 HTTP API，请在 `keeper_server` 配置中添加 `http_control` 配置段：

```xml
<keeper_server>
    <!-- Other keeper_server configuration -->

    <http_control>
        <port>9182</port>
        <!-- <secure_port>9443</secure_port> -->
    </http_control>
</keeper_server>
```


### 配置选项 \\{#configuration-options\\}

| 设置                                      | 默认值   | 描述                                       |
|-------------------------------------------|----------|--------------------------------------------|
| `http_control.port`                       | -        | 仪表板和 API 使用的 HTTP 端口              |
| `http_control.secure_port`                | -        | HTTPS 端口（需要 SSL 配置）                |
| `http_control.readiness.endpoint`         | `/ready` | 就绪探针的自定义路径                       |
| `http_control.storage.session_timeout_ms` | `30000`  | 存储 API 操作的会话超时时间                |

## API 端点 \\{#endpoints\\}

### 仪表板 \\{#dashboard\\}

- **路径**: `/dashboard`
- **方法**: GET
- **描述**: 提供一个嵌入式 Web 仪表板，用于监控和管理 Keeper

该仪表板提供：

- 集群状态的实时可视化
- 节点监控（角色、延迟、连接数）
- 存储浏览器
- 命令执行界面

### 就绪探针 \{#readiness-probe\}

* **路径**: `/ready`（可配置）
* **方法**: GET
* **描述**: 健康检查接口

成功响应（HTTP 200）：

```json
{
  "status": "ok",
  "details": {
    "role": "leader",
    "hasLeader": true
  }
}
```


### Commands API \{#commands-api\}

* **路径**: `/api/v1/commands/{command}`
* **方法**: GET, POST
* **描述**: 执行 Four-Letter Word 命令或 ClickHouse Keeper Client CLI 命令

查询参数：

* `command` - 要执行的命令
* `cwd` - 基于路径的命令所使用的当前工作目录（默认值：`/`）

示例：

```bash
# Four-Letter Word command
curl http://localhost:9182/api/v1/commands/stat

# ZooKeeper CLI command
curl "http://localhost:9182/api/v1/commands/ls?command=ls%20'/'&cwd=/"
```


### Storage API \\{#storage-api\\}

- **基础路径**：`/api/v1/storage`
- **说明**：用于 Keeper 存储操作的 REST API

Storage API 遵循 REST 规范，其中 HTTP 方法表示操作类型：

| 操作      | 路径                                       | 方法   | 状态码      | 说明                 |
|-----------|--------------------------------------------|--------|-------------|----------------------|
| Get       | `/api/v1/storage/{path}`                   | GET    | 200         | 获取节点数据         |
| List      | `/api/v1/storage/{path}?children=true`     | GET    | 200         | 列出子节点           |
| Exists    | `/api/v1/storage/{path}`                   | HEAD   | 200         | 检查节点是否存在     |
| Create    | `/api/v1/storage/{path}`                   | POST   | 201         | 创建新节点           |
| Update    | `/api/v1/storage/{path}?version={v}`       | PUT    | 200         | 更新节点数据         |
| Delete    | `/api/v1/storage/{path}?version={v}`       | DELETE | 204         | 删除节点             |