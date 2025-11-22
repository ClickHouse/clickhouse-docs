---
description: '组合式协议允许更灵活地配置对 ClickHouse 服务器的 TCP 访问。'
sidebar_label: '组合式协议'
sidebar_position: 64
slug: /operations/settings/composable-protocols
title: '组合式协议'
doc_type: 'reference'
---



# 可组合协议



## 概述 {#overview}

可组合协议允许更灵活地配置 ClickHouse 服务器的 TCP 访问。此配置可以与常规配置共存,也可以替代常规配置。


## 配置可组合协议 {#composable-protocols-section-is-denoted-as-protocols-in-configuration-xml}

可组合协议可以在 XML 配置文件中进行配置。协议部分在 XML 配置文件中使用 `protocols` 标签表示:

```xml
<protocols>

</protocols>
```

### 配置协议层 {#basic-modules-define-protocol-layers}

您可以使用基本模块定义协议层。例如,要定义 HTTP 层,可以向 `protocols` 部分添加一个新的基本模块:

```xml
<protocols>

  <!-- plain_http 模块 -->
  <plain_http>
    <type>http</type>
  </plain_http>

</protocols>
```

模块可以根据以下内容进行配置:

- `plain_http` - 可被其他层引用的名称
- `type` - 表示将被实例化以处理数据的协议处理器。
  它具有以下预定义的协议处理器集合:
  - `tcp` - 原生 ClickHouse 协议处理器
  - `http` - HTTP ClickHouse 协议处理器
  - `tls` - TLS 加密层
  - `proxy1` - PROXYv1 层
  - `mysql` - MySQL 兼容性协议处理器
  - `postgres` - PostgreSQL 兼容性协议处理器
  - `prometheus` - Prometheus 协议处理器
  - `interserver` - ClickHouse 服务器间处理器

:::note
`可组合协议` 未实现 `gRPC` 协议处理器
:::

### 配置端点 {#endpoint-ie-listening-port-is-denoted-by-port-and-optional-host-tags}

端点(监听端口)由 `<port>` 和可选的 `<host>` 标签表示。
例如,要在先前添加的 HTTP 层上配置端点,我们可以按如下方式修改配置:

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

如果省略 `<host>` 标签,则使用根配置中的 `<listen_host>`。

### 配置层序列 {#layers-sequence-is-defined-by-impl-tag-referencing-another-module}

层序列使用 `<impl>` 标签定义,并引用另一个模块。例如,要在我们的 plain_http 模块之上配置 TLS 层,我们可以进一步修改配置如下:

```xml
<protocols>

  <!-- http 模块 -->
  <plain_http>
    <type>http</type>
  </plain_http>

  <!-- https 模块配置为 plain_http 模块之上的 tls 层 -->
  <https>
    <type>tls</type>
    <impl>plain_http</impl>
    <host>127.0.0.1</host>
    <port>8443</port>
  </https>

</protocols>
```

### 将端点附加到层 {#endpoint-can-be-attached-to-any-layer}

端点可以附加到任何层。例如,我们可以为 HTTP(端口 8123)和 HTTPS(端口 8443)定义端点:

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

### 定义额外的端点 {#additional-endpoints-can-be-defined-by-referencing-any-module-and-omitting-type-tag}

可以通过引用任何模块并省略 `<type>` 标签来定义额外的端点。例如,我们可以为 `plain_http` 模块定义 `another_http` 端点,如下所示:

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

### 指定额外的层参数 {#some-modules-can-contain-specific-for-its-layer-parameters}

某些模块可以包含额外的层参数。例如,TLS 层允许按如下方式指定私钥(`privateKeyFile`)和证书文件(`certificateFile`):

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
