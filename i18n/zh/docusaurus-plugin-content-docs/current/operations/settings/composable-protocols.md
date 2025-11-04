---
'description': '可组合协议允许更灵活地配置对ClickHouse服务器的TCP访问。'
'sidebar_label': '可组合协议'
'sidebar_position': 64
'slug': '/operations/settings/composable-protocols'
'title': '可组合协议'
'doc_type': 'reference'
---


# 可组合协议

## 概述 {#overview}

可组合协议允许对ClickHouse服务器的TCP访问进行更灵活的配置。该配置可以与传统配置共存或替代它。

## 配置可组合协议 {#composable-protocols-section-is-denoted-as-protocols-in-configuration-xml}

可组合协议可以在XML配置文件中进行配置。协议部分由`protocols`标签在XML配置文件中表示：

```xml
<protocols>

</protocols>
```

### 配置协议层 {#basic-modules-define-protocol-layers}

您可以使用基本模块定义协议层。例如，要定义HTTP层，您可以向`protocols`部分添加一个新的基本模块：

```xml
<protocols>

  <!-- plain_http module -->
  <plain_http>
    <type>http</type>
  </plain_http>

</protocols>
```
模块可以根据以下内容进行配置：

- `plain_http` - 可以被其他层引用的名称
- `type` - 表示将实例化以处理数据的协议处理程序。
  它具有以下预定义的协议处理程序集：
  * `tcp` - 原生ClickHouse协议处理程序
  * `http` - HTTP ClickHouse协议处理程序
  * `tls` - TLS加密层
  * `proxy1` - PROXYv1层
  * `mysql` - MySQL兼容协议处理程序
  * `postgres` - PostgreSQL兼容协议处理程序
  * `prometheus` - Prometheus协议处理程序
  * `interserver` - ClickHouse跨服务器处理程序

:::note
`gRPC`协议处理程序未为`可组合协议`实现
:::

### 配置端点 {#endpoint-ie-listening-port-is-denoted-by-port-and-optional-host-tags}

端点（监听端口）由`<port>`和可选的`<host>`标签表示。
例如，要配置前面添加的HTTP层上的端点，我们可以如下修改我们的配置：

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

如果省略`<host>`标签，则使用根配置中的`<listen_host>`。

### 配置层序列 {#layers-sequence-is-defined-by-impl-tag-referencing-another-module}

层序列通过`<impl>`标签定义，并引用另一个模块。例如，要在我们的plain_http模块之上配置一个TLS层，我们可以进一步修改我们的配置如下：

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

### 将端点附加到层 {#endpoint-can-be-attached-to-any-layer}

端点可以附加到任何层。例如，我们可以为HTTP（端口8123）和HTTPS（端口8443）定义端点：

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

可以通过引用任何模块并省略`<type>`标签定义额外的端点。例如，我们可以为`plain_http`模块定义`another_http`端点，如下所示：

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

### 指定额外的层参数 {#some-modules-can-contain-specific-for-its-layer-parameters}

某些模块可以包含特定于其层的附加参数。例如，TLS层允许指定私钥(`privateKeyFile`)和证书文件(`certificateFile`)，如下所示：

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
