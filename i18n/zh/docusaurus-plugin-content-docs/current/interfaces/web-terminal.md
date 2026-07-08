---
description: 'Web 终端文档：一种通过 WebSocket 在浏览器中提供 `clickhouse-client` 会话的界面'
sidebar_label: 'Web 终端'
sidebar_position: 22
slug: /interfaces/web-terminal
title: 'Web 终端'
doc_type: 'reference'
---

Web 终端是一个 Experimental 的浏览器内界面，通过 WebSocket 提供交互式的 `clickhouse-client` 会话。它可通过任意 ClickHouse HTTP 端口上的 `/webterminal` 路径访问。

:::note
Web 终端是一项 Experimental 功能，默认处于禁用状态；请参见下方的[启用该功能](#enabling-the-feature)。
:::

## 启用该功能 \{#enabling-the-feature\}

`/webterminal` 端点由 `allow_experimental_webterminal` 服务器设置进行控制。当该设置为 `false` (默认值) 时，对 `/webterminal` 的请求会返回 HTTP 状态码 `403 Forbidden`。

要启用此功能，请将以下内容添加到服务器配置中：

```xml
<clickhouse>
    <allow_experimental_webterminal>true</allow_experimental_webterminal>
</clickhouse>
```

启用后，前往任意 ClickHouse HTTP 端口上的 `/webterminal` (例如 `http://localhost:8123/webterminal`) 即可打开终端。

## 身份验证 \{#authentication\}

Web 终端会依据与 HTTP 协议相同的 `Session` 和访问控制检查对用户进行身份验证，但凭据是在已建立的 WebSocket 连接内直接交换的，而不是通过 HTTP 升级请求进行传递。WebSocket 握手完成后，浏览器会将第一条消息作为 JSON 发送：

```json
{"type": "auth", "user": "<user>", "password": "<password>"}
```

这样可避免将凭据放入 URL 查询参数或附加到升级请求的 `Authorization` 请求头中，因为这些信息可能会出现在浏览器历史记录、服务器访问日志和反向代理日志里。`/webterminal` 会刻意**不**读取升级请求中的 URL 参数、HTTP Basic，以及 `X-ClickHouse-User`/`X-ClickHouse-Key` 请求头。

凭据无效时，服务器会以代码 `1008` 关闭 WebSocket；浏览器 UI 会重新提示输入凭据。

## 会话界面如下 \{#session\}

完成身份验证后，服务器会启动一个连接到伪终端的 `clickhouse-client`，并通过 WebSocket 传输其输入和输出。该会话支持完整的 `clickhouse-client` 使用体验，包括：

* 语法高亮。
* 自动补全。
* 多行查询。
* 命令历史 (在会话期间存储于服务器端) 。

该终端使用 [xterm.js](https://xtermjs.org/) 进行渲染。所有资源均由 ClickHouse 可执行文件本身提供——不会加载任何第三方 CDN。

## 与 `/play` 集成 \{#play-integration\}

[`/play`](/interfaces/http) Web SQL UI 将 Web 终端嵌入为一个可停靠的面板。可通过侧边栏中的终端图标切换显示，也可在查询编辑器为空时按 `~` 键打开或关闭。`/play` 页面会在加载时检测 `/webterminal` 是否可用；当该端点不可用时，会隐藏终端控件 (例如未启用 Experimental 设置时) 。

## 安全注意事项 \{#security\}

Web 终端会向任何能够通过 ClickHouse HTTP 端点完成身份验证的用户开放一个类似交互式 shell 的会话，因此，适用于 HTTP 协议的注意事项同样适用于此处：

* 在不受信任的环境中，始终通过 HTTPS 提供 `/webterminal`，以保护凭据和会话流量。
* 在网络层限制访问 (防火墙、反向代理或 `listen_host` 配置) ，方式应与限制 HTTP 协议访问相同。
* 该端点会根据 `Host` 校验 `Origin` 请求头，以降低跨源 WebSocket 劫持风险；如果您在外部终止 TLS，请相应配置反向代理。
* 在位于 TLS 终止反向代理之后的场景中，尽管浏览器使用的是 `https`，到 ClickHouse 的上游连接仍是明文 `http`，因此严格的同源检查会拒绝合法连接。对于这类部署，请将 `webterminal_allowed_origins` 设置为允许发起 WebSocket 会话的完整 origin 逗号分隔列表；当此设置非空时，它会替代默认的同源检查。示例：`<webterminal_allowed_origins>https://example.com,https://app.example.com:8443</webterminal_allowed_origins>`。

该处理程序还会根据 RFC 6455 强制执行 WebSocket 协议一致性：未掩码的客户端帧、保留操作码、过大的或分片的控制帧，以及保留的 RSV 位，都会以协议错误关闭码被拒绝。

## 平台可用性 \{#platform\}

该处理程序可在 ClickHouse 支持的所有平台上编译。嵌入式 `clickhouse-client` 运行器使用的伪终端层构建在可移植的 POSIX 基元 (`posix_openpt`/`grantpt`/`unlockpt`) 之上，并针对 Linux 提供了一条使用线程安全 `ptsname_r` 的特定实现路径。当端点不可用时 (例如未启用 `allow_experimental_webterminal`) ，ClickHouse 起始页和 `/play` 中指向 `/webterminal` 的链接会自动隐藏。