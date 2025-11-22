---
description: '现有并已正确配置的 ClickHouse 用户可以通过 Kerberos 认证协议进行身份验证。'
slug: /operations/external-authenticators/kerberos
title: 'Kerberos'
doc_type: 'reference'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';


# Kerberos

<SelfManaged />

已经存在并正确配置的 ClickHouse 用户可以通过 Kerberos 认证协议进行身份验证。

目前，Kerberos 只能作为现有用户的外部认证器使用，这些用户定义在 `users.xml` 或本地访问控制路径中。这些用户只能通过 HTTP 请求，并且必须能够使用 GSS-SPNEGO 机制进行身份验证。

采用此方式时，必须在系统中完成 Kerberos 的配置，并在 ClickHouse 配置中将其启用。



## 在 ClickHouse 中启用 Kerberos {#enabling-kerberos-in-clickhouse}

要启用 Kerberos,需要在 `config.xml` 中添加 `kerberos` 配置段。该配置段可以包含额外的参数。

#### 参数 {#parameters}

- `principal` - 接受安全上下文时将获取和使用的规范服务主体名称。
  - 此参数为可选项,如果省略,将使用默认主体。

- `realm` - 用于限制身份验证的域,仅允许发起者域与之匹配的请求通过身份验证。
  - 此参数为可选项,如果省略,将不会应用基于域的额外过滤。

- `keytab` - 服务密钥表文件的路径。
  - 此参数为可选项,如果省略,则必须在 `KRB5_KTNAME` 环境变量中设置服务密钥表文件的路径。

示例(添加到 `config.xml` 中):

```xml
<clickhouse>
    <!- ... -->
    <kerberos />
</clickhouse>
```

指定主体:

```xml
<clickhouse>
    <!- ... -->
    <kerberos>
        <principal>HTTP/clickhouse.example.com@EXAMPLE.COM</principal>
    </kerberos>
</clickhouse>
```

按域过滤:

```xml
<clickhouse>
    <!- ... -->
    <kerberos>
        <realm>EXAMPLE.COM</realm>
    </kerberos>
</clickhouse>
```

:::note
只能定义一个 `kerberos` 配置段。如果存在多个 `kerberos` 配置段,ClickHouse 将禁用 Kerberos 身份验证。
:::

:::note
`principal` 和 `realm` 配置段不能同时指定。如果同时存在 `principal` 和 `realm` 配置段,ClickHouse 将禁用 Kerberos 身份验证。
:::


## Kerberos 作为现有用户的外部身份验证器 {#kerberos-as-an-external-authenticator-for-existing-users}

Kerberos 可用作验证本地定义用户(在 `users.xml` 或本地访问控制路径中定义的用户)身份的方法。目前,**仅**通过 HTTP 接口的请求可以进行 _Kerberos 化_(通过 GSS-SPNEGO 机制)。

Kerberos 主体名称格式通常遵循以下模式:

- _primary/instance@REALM_

_/instance_ 部分可以出现零次或多次。**发起者的规范主体名称中的 _primary_ 部分必须与 Kerberos 化的用户名匹配,身份验证才能成功**。

### 在 `users.xml` 中启用 Kerberos {#enabling-kerberos-in-users-xml}

要为用户启用 Kerberos 身份验证,请在用户定义中指定 `kerberos` 部分,而不是 `password` 或类似部分。

参数:

- `realm` - 用于限制身份验证的领域,仅对发起者的领域与之匹配的请求进行身份验证。
  - 此参数是可选的,如果省略,将不会应用按领域进行的额外过滤。

示例(添加到 `users.xml` 中):

```xml
<clickhouse>
    <!- ... -->
    <users>
        <!- ... -->
        <my_user>
            <!- ... -->
            <kerberos>
                <realm>EXAMPLE.COM</realm>
            </kerberos>
        </my_user>
    </users>
</clickhouse>
```

:::note
请注意,Kerberos 身份验证不能与任何其他身份验证机制一起使用。如果在 `kerberos` 旁边存在任何其他部分(如 `password`),将导致 ClickHouse 关闭。
:::

:::info 提醒
请注意,现在一旦用户 `my_user` 使用 `kerberos`,就必须按照前面所述在主 `config.xml` 文件中启用 Kerberos。
:::

### 使用 SQL 启用 Kerberos {#enabling-kerberos-using-sql}

当在 ClickHouse 中启用 [SQL 驱动的访问控制和账户管理](/operations/access-rights#access-control-usage) 时,也可以使用 SQL 语句创建由 Kerberos 标识的用户。

```sql
CREATE USER my_user IDENTIFIED WITH kerberos REALM 'EXAMPLE.COM'
```

...或者,不按领域过滤:

```sql
CREATE USER my_user IDENTIFIED WITH kerberos
```
