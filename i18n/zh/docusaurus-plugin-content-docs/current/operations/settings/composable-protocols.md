---
description: '可组合协议允许更灵活地配置对 ClickHouse 服务器的 TCP 访问。'
sidebar_label: '可组合协议'
sidebar_position: 64
slug: /operations/settings/composable-protocols
title: '可组合协议'
doc_type: 'reference'
---



# 组合式协议



## 概览 {#overview}

可组合协议使得可以更灵活地配置对 ClickHouse 服务器的 TCP 访问。此类配置可以与传统配置共存，或替代传统配置。



## 配置可组合协议

可组合协议可以在 XML 配置文件中进行配置。在 XML 配置文件中，协议部分由 `protocols` 标签标识：

```xml
<protocols>

</protocols>
```

### 配置协议层

可以使用基础模块来定义协议层。例如，要定义一个 HTTP 层，可以在 `protocols` 节中添加一个新的基础模块：

```xml
<protocols>

  <!-- plain_http 模块 -->
  <plain_http>
    <type>http</type>
  </plain_http>

</protocols>
```

模块可以按以下方式进行配置：

* `plain_http` - 名称，可供其他层引用
* `type` - 指定将要实例化用于处理数据的协议处理器。
  它具有以下一组预定义的协议处理器：
  * `tcp` - 原生 ClickHouse 协议处理器
  * `http` - HTTP ClickHouse 协议处理器
  * `tls` - TLS 加密层
  * `proxy1` - PROXYv1 层
  * `mysql` - MySQL 兼容协议处理器
  * `postgres` - PostgreSQL 兼容协议处理器
  * `prometheus` - Prometheus 协议处理器
  * `interserver` - ClickHouse 服务器间通信处理器

:::note
`gRPC` 协议处理器尚未在 `Composable protocols` 中实现
:::

### 配置 endpoints

Endpoints（监听端口）由 `<port>` 和可选的 `<host>` 标记指定。
例如，要在前面添加的 HTTP 层上配置一个 endpoint，我们可以按如下方式修改配置：

```xml
<protocols>

  <plain_http>

    <type>http</type>
    <!-- 端点 -->
    <host>127.0.0.1</host>
    <port>8123</port>

  </plain_http>

</protocols>
```

如果省略了 `<host>` 标签，则会使用根配置中的 `<listen_host>` 设置。

### 配置层序列

层序列是通过使用 `<impl>` 标签并引用另一个模块来定义的。比如，要在 plain&#95;http 模块之上配置一个 TLS 层，我们可以进一步按如下方式修改配置：

```xml
<protocols>

  <!-- HTTP 模块 -->
  <plain_http>
    <type>http</type>
  </plain_http>

  <!-- 将 HTTPS 模块配置为在 plain_http 模块之上添加一层 TLS -->
  <https>
    <type>tls</type>
    <impl>plain_http</impl>
    <host>127.0.0.1</host>
    <port>8443</port>
  </https>

</protocols>
```

### 将端点附加到层

可以将端点附加到任意层。例如，我们可以为 HTTP（端口 8123）和 HTTPS（端口 8443）定义端点：

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

### 定义额外的端点

可以通过引用任意模块并省略 `<type>` 标签来定义其他端点。例如，可以如下为 `plain_http` 模块定义一个 `another_http` 端点：

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
```


</protocols>
```

### 指定附加层参数 {#some-modules-can-contain-specific-for-its-layer-parameters}

某些模块可以包含附加的层参数。 例如，TLS 层可以按如下方式指定私钥（`privateKeyFile`）和证书文件（`certificateFile`）：

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
