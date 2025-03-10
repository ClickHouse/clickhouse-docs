---
slug: /operations/external-authenticators/http
title: 'HTTP'
---
import SelfManaged from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged/>

HTTP 服务器可用于对 ClickHouse 用户进行身份验证。HTTP 身份验证只能作为外部身份验证器用于在 `users.xml` 中或本地访问控制路径中定义的现有用户。目前，仅支持使用 GET 方法的 [Basic](https://datatracker.ietf.org/doc/html/rfc7617) 身份验证方案。

## HTTP 身份验证服务器定义 {#http-auth-server-definition}

要定义 HTTP 身份验证服务器，必须向 `config.xml` 中添加 `http_authentication_servers` 部分。

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
        </basic_auth_server>
    </http_authentication_servers>
</clickhouse>

```

注意，可以在 `http_authentication_servers` 部分中使用不同的名称定义多个 HTTP 服务器。

**参数**
- `uri` - 用于发起身份验证请求的 URI

与服务器通信时使用的套接字的超时（以毫秒为单位）：
- `connection_timeout_ms` - 默认：1000 毫秒。
- `receive_timeout_ms` - 默认：1000 毫秒。
- `send_timeout_ms` - 默认：1000 毫秒。

重试参数：
- `max_tries` - 发起身份验证请求的最大尝试次数。默认：3
- `retry_initial_backoff_ms` - 重试时的初始退避间隔。默认：50 毫秒
- `retry_max_backoff_ms` - 最大退避间隔。默认：1000 毫秒

### 在 `users.xml` 中启用 HTTP 身份验证 {#enabling-http-auth-in-users-xml}

为了为用户启用 HTTP 身份验证，请在用户定义中指定 `http_authentication` 部分，而不是 `password` 或类似部分。

参数：
- `server` - 在主 `config.xml` 文件中配置的 HTTP 身份验证服务器的名称，如前所述。
- `scheme` - HTTP 身份验证方案。目前仅支持 `Basic`。默认：Basic

示例（放入 `users.xml`）：
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
请注意，HTTP 身份验证不能与任何其他身份验证机制一起使用。存在任何其他部分，如 `password` 和 `http_authentication`，将导致 ClickHouse 关闭。
:::

### 使用 SQL 启用 HTTP 身份验证 {#enabling-http-auth-using-sql}

当 ClickHouse 中启用 [SQL 驱动的访问控制和账户管理](/operations/access-rights#access-control-usage) 时，可以使用 SQL 语句创建通过 HTTP 身份验证识别的用户。

```sql
CREATE USER my_user IDENTIFIED WITH HTTP SERVER 'basic_server' SCHEME 'Basic'
```

...或者，`Basic` 是默认的，无需显式方案定义。

```sql
CREATE USER my_user IDENTIFIED WITH HTTP SERVER 'basic_server'
```

### 传递会话设置 {#passing-session-settings}

如果 HTTP 身份验证服务器的响应体为 JSON 格式并包含 `settings` 子对象，ClickHouse 将尝试将其键值对解析为字符串值，并将它们设置为已认证用户当前会话的会话设置。如果解析失败，服务器的响应体将被忽略。
