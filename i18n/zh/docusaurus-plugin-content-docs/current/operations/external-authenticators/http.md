---
description: 'HTTP 文档'
slug: /operations/external-authenticators/http
title: 'HTTP'
doc_type: 'reference'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

可以使用 HTTP 服务器对 ClickHouse 用户进行身份验证。HTTP 身份验证只能作为现有用户的外部验证机制使用，这些用户是在 `users.xml` 或本地访问控制路径中定义的。目前支持使用 GET 方法的 [Basic](https://datatracker.ietf.org/doc/html/rfc7617) 身份验证方案。


## HTTP 认证服务器定义 {#http-auth-server-definition}

要定义 HTTP 认证服务器,必须在 `config.xml` 中添加 `http_authentication_servers` 配置段。

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

注意,可以在 `http_authentication_servers` 配置段中使用不同的名称定义多个 HTTP 服务器。

**参数**

- `uri` - 用于发起认证请求的 URI

与服务器通信所用套接字的超时时间(以毫秒为单位):

- `connection_timeout_ms` - 默认值:1000 毫秒。
- `receive_timeout_ms` - 默认值:1000 毫秒。
- `send_timeout_ms` - 默认值:1000 毫秒。

重试参数:

- `max_tries` - 认证请求的最大尝试次数。默认值:3
- `retry_initial_backoff_ms` - 重试时的初始退避间隔。默认值:50 毫秒
- `retry_max_backoff_ms` - 最大退避间隔。默认值:1000 毫秒

转发请求头:

此配置段定义哪些请求头将从客户端请求头转发到外部 HTTP 认证器。注意,请求头将以不区分大小写的方式与配置中的请求头进行匹配,但转发时保持原样不做修改。

### 在 `users.xml` 中启用 HTTP 认证 {#enabling-http-auth-in-users-xml}

要为用户启用 HTTP 认证,请在用户定义中指定 `http_authentication` 配置段,而不是 `password` 或类似的配置段。

参数:

- `server` - 如前所述在主 `config.xml` 文件中配置的 HTTP 认证服务器名称。
- `scheme` - HTTP 认证方案。目前仅支持 `Basic`。默认值:Basic

示例(添加到 `users.xml` 中):

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
注意,HTTP 认证不能与任何其他认证机制同时使用。如果在 `http_authentication` 旁边存在任何其他配置段(如 `password`),将导致 ClickHouse 关闭。
:::

### 使用 SQL 启用 HTTP 认证 {#enabling-http-auth-using-sql}

当在 ClickHouse 中启用 [SQL 驱动的访问控制和账户管理](/operations/access-rights#access-control-usage) 时,也可以使用 SQL 语句创建通过 HTTP 认证识别的用户。

```sql
CREATE USER my_user IDENTIFIED WITH HTTP SERVER 'basic_server' SCHEME 'Basic'
```

...或者,在没有显式指定方案的情况下,默认使用 `Basic`

```sql
CREATE USER my_user IDENTIFIED WITH HTTP SERVER 'basic_server'
```

### 传递会话设置 {#passing-session-settings}

如果来自 HTTP 认证服务器的响应正文为 JSON 格式并包含 `settings` 子对象,ClickHouse 将尝试将其键值对解析为字符串值,并将它们设置为已认证用户当前会话的会话设置。如果解析失败,将忽略来自服务器的响应正文。
