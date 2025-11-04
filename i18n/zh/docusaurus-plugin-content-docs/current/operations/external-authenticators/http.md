---
'description': 'Http的文档'
'slug': '/operations/external-authenticators/http'
'title': 'HTTP'
'doc_type': 'reference'
---

import SelfManaged from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

HTTP 服务器可用于认证 ClickHouse 用户。HTTP 认证只能作为现有用户的外部认证器，这些用户在 `users.xml` 或本地访问控制路径中定义。当前支持使用 GET 方法的 [Basic](https://datatracker.ietf.org/doc/html/rfc7617) 认证方案。

## HTTP 认证服务器定义 {#http-auth-server-definition}

要定义 HTTP 认证服务器，必须向 `config.xml` 添加 `http_authentication_servers` 部分。

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

请注意，您可以在 `http_authentication_servers` 部分内使用不同的名称定义多个 HTTP 服务器。

**参数**
- `uri` - 用于发起认证请求的 URI

与服务器通信所用套接字的超时（以毫秒为单位）：
- `connection_timeout_ms` - 默认：1000 毫秒。
- `receive_timeout_ms` - 默认：1000 毫秒。
- `send_timeout_ms` - 默认：1000 毫秒。

重试参数：
- `max_tries` - 发起认证请求的最大尝试次数。默认：3
- `retry_initial_backoff_ms` - 重试时的初始回退间隔。默认：50 毫秒
- `retry_max_backoff_ms` - 最大回退间隔。默认：1000 毫秒

转发头：

该部分定义哪些头部将从客户端请求头转发到外部 HTTP 认证器。请注意，头部将在不区分大小写的情况下与配置的头部进行匹配，但将原样转发，即不加修改。

### 在 `users.xml` 中启用 HTTP 认证 {#enabling-http-auth-in-users-xml}

为了为用户启用 HTTP 认证，请在用户定义中指定 `http_authentication` 部分，而不是 `password` 或类似的部分。

参数：
- `server` - 在主 `config.xml` 文件中配置的 HTTP 认证服务器的名称，如上所述。
- `scheme` - HTTP 认证方案。目前仅支持 `Basic`。默认：Basic

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
请注意，HTTP 认证不能与任何其他认证机制一起使用。如果存在 `password` 等其他部分与 `http_authentication` 同时出现，会导致 ClickHouse 关闭。
:::

### 使用 SQL 启用 HTTP 认证 {#enabling-http-auth-using-sql}

当在 ClickHouse 中启用 [SQL 驱动的访问控制和帐户管理](/operations/access-rights#access-control-usage) 时，也可以使用 SQL 语句创建通过 HTTP 认证识别的用户。

```sql
CREATE USER my_user IDENTIFIED WITH HTTP SERVER 'basic_server' SCHEME 'Basic'
```

...或者，`Basic` 是默认值，如果没有明确的方案定义

```sql
CREATE USER my_user IDENTIFIED WITH HTTP SERVER 'basic_server'
```

### 传递会话设置 {#passing-session-settings}

如果 HTTP 认证服务器的响应体具有 JSON 格式并包含 `settings` 子对象，ClickHouse 将尝试将其键值对解析为字符串值，并将其设置为经过认证用户当前会话的会话设置。如果解析失败，将忽略来自服务器的响应体。
