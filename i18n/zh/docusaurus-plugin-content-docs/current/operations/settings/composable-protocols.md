---
description: '组合式协议允许以更灵活的方式配置对 ClickHouse 服务器的 TCP 访问。'
sidebar_label: '组合式协议'
sidebar_position: 64
slug: /operations/settings/composable-protocols
title: '组合式协议'
doc_type: 'reference'
---

# 组合式协议 \{#composable-protocols\}

## 概览 \{#overview\}

组合式协议允许更灵活地配置对 ClickHouse 服务器的 TCP 访问。此类配置可以与传统配置并存，也可以替代传统配置。

## 配置可组合协议 \{#composable-protocols-section-is-denoted-as-protocols-in-configuration-xml\}

可组合协议可以通过 XML 配置文件进行配置。协议部分在 XML 配置文件中由 `protocols` 标签标识：

```xml
<protocols>

</protocols>
```

### 配置协议层 \{#basic-modules-define-protocol-layers\}

可以使用基本模块（basic modules）来定义协议层。例如，要定义一个
HTTP 层，可以在 `protocols` 配置节中添加一个新的基本模块（basic module）：

```xml
<protocols>

  <!-- plain_http module -->
  <plain_http>
    <type>http</type>
  </plain_http>

</protocols>
```

模块可以按如下方式配置：

* `plain_http` - 名称，可被其他层引用
* `type` - 表示用于处理数据、将被实例化的协议处理器。
  它具有以下预定义的协议处理器集合：
  * `tcp` - ClickHouse 原生协议处理器
  * `http` - HTTP ClickHouse 协议处理器
  * `tls` - TLS 加密层
  * `proxy1` - PROXYv1 层
  * `mysql` - MySQL 兼容协议处理器
  * `postgres` - PostgreSQL 兼容协议处理器
  * `prometheus` - Prometheus 协议处理器
  * `interserver` - ClickHouse 服务器间通信处理器

:::note
`gRPC` 协议处理器尚未在 `Composable protocols` 中实现。
:::

### 配置端点 \{#endpoint-ie-listening-port-is-denoted-by-port-and-optional-host-tags\}

端点（监听端口）由 `<port>` 标签和可选的 `<host>` 标签表示。
例如，要在先前添加的 HTTP 层上配置一个端点，
可以按如下方式修改配置：

```xml
<protocols>

  <plain_http>

    <type>http</type>
    <!-- endpoint -->
    <host>127.0.0.1</host>
    <port>8123</port>

  </plain_http>

</protocols>
```

如果省略 `<host>` 标签，则会使用根级配置中的 `<listen_host>`。

### 配置层级序列 \{#layers-sequence-is-defined-by-impl-tag-referencing-another-module\}

层级序列是通过使用 `<impl>` 标签并引用另一个模块来定义的。例如，要在我们的 plain&#95;http 模块之上配置一个 TLS 层，可以进一步按如下方式修改配置：

```xml
<protocols>

  <!-- http module -->
  <plain_http>
    <type>http</type>
  </plain_http>

  <!-- https module configured as a tls layer on top of plain_http module -->
  <https>
    <type>tls</type>
    <impl>plain_http</impl>
    <host>127.0.0.1</host>
    <port>8443</port>
  </https>

</protocols>
```

### 将端点关联到层 \{#endpoint-can-be-attached-to-any-layer\}

端点可以关联到任意层。例如，我们可以为 HTTP（端口 8123）和 HTTPS（端口 8443）定义端点：

```xml
<protocols>

  <plain_http>
    <type>http</type>
    <host>127.0.0.1</host>
    <port>8123</port>
  </plain_http>

  <https>
    <type>tls</type>
    <impl>plain_http</impl>
    <host>127.0.0.1</host>
    <port>8443</port>
  </https>

</protocols>
```

### 定义附加端点 \{#additional-endpoints-can-be-defined-by-referencing-any-module-and-omitting-type-tag\}

可以通过引用任意模块并省略 `<type>` 标签来定义附加端点。比如，我们可以为 `plain_http` 模块定义 `another_http` 端点，如下所示：

```xml
<protocols>

  <plain_http>
    <type>http</type>
    <host>127.0.0.1</host>
    <port>8123</port>
  </plain_http>

  <https>
    <type>tls</type>
    <impl>plain_http</impl>
    <host>127.0.0.1</host>
    <port>8443</port>
  </https>

  <another_http>
    <impl>plain_http</impl>
    <host>127.0.0.1</host>
    <port>8223</port>
  </another_http>

</protocols>
```

### 指定额外层参数 \{#some-modules-can-contain-specific-for-its-layer-parameters\}

某些模块可以包含额外的层参数。例如，TLS 层
允许按如下方式指定私钥（`privateKeyFile`）和证书文件（`certificateFile`）：

```xml
<protocols>

  <plain_http>
    <type>http</type>
    <host>127.0.0.1</host>
    <port>8123</port>
  </plain_http>

  <https>
    <type>tls</type>
    <impl>plain_http</impl>
    <host>127.0.0.1</host>
    <port>8443</port>
    <privateKeyFile>another_server.key</privateKeyFile>
    <certificateFile>another_server.crt</certificateFile>
  </https>

</protocols>
```
