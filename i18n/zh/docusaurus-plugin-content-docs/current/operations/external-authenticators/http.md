---
description: 'HTTP 文档'
slug: /operations/external-authenticators/http
title: 'HTTP'
doc_type: 'reference'
---

import SelfManaged from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

HTTP 服务器可用于对 ClickHouse 用户进行身份验证。HTTP 身份验证只能作为现有用户的外部验证方式，这些用户在 `users.xml` 或本地访问控制路径中定义。目前支持使用 GET 方法的 [Basic](https://datatracker.ietf.org/doc/html/rfc7617) 身份验证方案。

## HTTP 身份验证服务器定义 \\{#http-auth-server-definition\\}

要定义 HTTP 身份验证服务器，必须在 `config.xml` 中添加 `http_authentication_servers` 节。

**示例**

```xml
<clickhouse>
    <!- ... -->
    <http_authentication_servers>
        <basic_auth_server>
          <uri>http://localhost:8000/auth</uri>
          <connection_timeout_ms>1000</connection_timeout_ms>
          <receive_timeout_ms>1000</receive_timeout_ms>
          <send_timeout_ms>1000</send_timeout_ms>
          <max_tries>3</max_tries>
          <retry_initial_backoff_ms>50</retry_initial_backoff_ms>
          <retry_max_backoff_ms>1000</retry_max_backoff_ms>
          <forward_headers>
            <name>Custom-Auth-Header-1</name>
            <name>Custom-Auth-Header-2</name>
          </forward_headers>

        </basic_auth_server>
    </http_authentication_servers>
</clickhouse>

```

请注意，你可以在 `http_authentication_servers` 部分中使用不同的名称定义多个 HTTP 服务器。

**参数**

* `uri` - 用于发送认证请求的 URI

用于与服务器通信的套接字上的超时时间（单位：毫秒）：

* `connection_timeout_ms` - 默认值：1000 ms。
* `receive_timeout_ms` - 默认值：1000 ms。
* `send_timeout_ms` - 默认值：1000 ms。

重试参数：

* `max_tries` - 发起认证请求的最大尝试次数。默认值：3
* `retry_initial_backoff_ms` - 重试时的退避初始间隔。默认值：50 ms
* `retry_max_backoff_ms` - 最大退避间隔。默认值：1000 ms

转发的请求头（headers）：

本部分定义从客户端请求头中转发到外部 HTTP 认证服务的请求头列表。注意，请求头在匹配配置中的名称时不区分大小写，但转发时会保持原样，即不作修改。

### 在 `users.xml` 中启用 HTTP 认证 \\{#enabling-http-auth-in-users-xml\\}

要为用户启用 HTTP 认证，请在用户定义中指定 `http_authentication` 部分，而不是使用 `password` 或类似部分。

参数：

* `server` - 在主 `config.xml` 文件中配置的 HTTP 认证服务器名称，如前文所述。
* `scheme` - HTTP 认证方案。目前仅支持 `Basic`。默认值：Basic

示例（放入 `users.xml` 中）：

```xml
<clickhouse>
    <!- ... -->
    <my_user>
        <!- ... -->
        <http_authentication>
            <server>basic_server</server>
            <scheme>basic</scheme>
        </http_authentication>
    </test_user_2>
</clickhouse>
```

:::note
请注意，HTTP 认证不能与任何其他认证机制同时使用。若在配置中同时存在 `http_authentication` 和 `password` 等其他字段，将会导致 ClickHouse 被强制退出。
:::

### 使用 SQL 启用 HTTP 认证 \\{#enabling-http-auth-using-sql\\}

当在 ClickHouse 中启用 [基于 SQL 的访问控制和账户管理](/operations/access-rights#access-control-usage) 时，也可以使用 SQL 语句创建通过 HTTP 认证标识的用户。

```sql
CREATE USER my_user IDENTIFIED WITH HTTP SERVER 'basic_server' SCHEME 'Basic'
```

...或者，如果未显式指定认证方案，则默认使用 `Basic`

```sql
CREATE USER my_user IDENTIFIED WITH HTTP SERVER 'basic_server'
```

### 传递会话设置 \\{#passing-session-settings\\}

如果来自 HTTP 身份验证服务器的响应体为 JSON 格式，并且包含 `settings` 子对象，ClickHouse 会尝试将其中的键值对解析为字符串值，并将它们设置为已通过验证用户当前会话的会话设置。如果解析失败，则会忽略来自服务器的响应体。
