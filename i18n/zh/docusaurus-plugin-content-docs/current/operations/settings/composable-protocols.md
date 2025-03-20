---
slug: /operations/settings/composable-protocols
sidebar_position: 64
sidebar_label: '可组合协议'
title: '可组合协议'
description: '可组合协议允许对 ClickHouse 服务器的 TCP 访问进行更灵活的配置。'
---


# 可组合协议

可组合协议允许对 ClickHouse 服务器的 TCP 访问进行更灵活的配置。此配置可以与传统配置共存或替代传统配置。

## 可组合协议部分在配置 xml 中表示为 `protocols` {#composable-protocols-section-is-denoted-as-protocols-in-configuration-xml}
**示例：**
``` xml
<protocols>

</protocols>
```

## 基本模块定义协议层 {#basic-modules-define-protocol-layers}
**示例：**
``` xml
<protocols>

  <!-- plain_http 模块 -->
  <plain_http>
    <type>http</type>
  </plain_http>

</protocols>
```
其中：
- `plain_http` - 可被另一层引用的名称
- `type` - 表示将实例化以处理数据的协议处理程序，协议处理程序集是预定义的：
  * `tcp` - 原生 clickhouse 协议处理程序
  * `http` - http clickhouse 协议处理程序
  * `tls` - TLS 加密层
  * `proxy1` - PROXYv1 层
  * `mysql` - MySQL 兼容协议处理程序
  * `postgres` - PostgreSQL 兼容协议处理程序
  * `prometheus` - Prometheus 协议处理程序
  * `interserver` - clickhouse 服务器间处理程序

:::note
`gRPC` 协议处理程序尚未为 `可组合协议` 实现
:::
 
## 端点（即监听端口）由 `<port>` 和（可选）`<host>` 标签表示 {#endpoint-ie-listening-port-is-denoted-by-port-and-optional-host-tags}
**示例：**
``` xml
<protocols>

  <plain_http>

    <type>http</type>
    <!-- 端点 -->
    <host>127.0.0.1</host>
    <port>8123</port>

  </plain_http>

</protocols>
```
如果省略 `<host>`，则使用根配置中的 `<listen_host>`。

## 层的顺序由 `<impl>` 标签定义，引用另一个模块 {#layers-sequence-is-defined-by-impl-tag-referencing-another-module}
**示例：** HTTPS 协议的定义
``` xml
<protocols>

  <!-- http 模块 -->
  <plain_http>
    <type>http</type>
  </plain_http>

  <!-- https 模块配置为位于 plain_http 模块之上的 tls 层 -->
  <https>
    <type>tls</type>
    <impl>plain_http</impl>
    <host>127.0.0.1</host>
    <port>8443</port>
  </https>

</protocols>
```

## 端点可以附加到任何层 {#endpoint-can-be-attached-to-any-layer}
**示例：** HTTP（端口 8123）和 HTTPS（端口 8443）端点的定义
``` xml
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

## 额外的端点可以通过引用任何模块并省略 `<type>` 标签来定义 {#additional-endpoints-can-be-defined-by-referencing-any-module-and-omitting-type-tag}
**示例：** 为 `plain_http` 模块定义的 `another_http` 端点
``` xml
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

## 某些模块可以包含特定于其层的参数 {#some-modules-can-contain-specific-for-its-layer-parameters}
**示例：** 对于 TLS 层，可以指定私钥 (`privateKeyFile`) 和证书文件 (`certificateFile`)
``` xml
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
