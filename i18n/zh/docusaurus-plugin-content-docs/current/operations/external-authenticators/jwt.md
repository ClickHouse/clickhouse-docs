---
description: 'ClickHouse Cloud 中基于 JWT 的身份验证与临时用户指南'
sidebar_label: 'JWT'
sidebar_position: 55
slug: /operations/external-authenticators/jwt
title: 'JWT 身份验证'
doc_type: 'reference'
---

import CloudOnlyBadge from '@theme/badges/CloudOnlyBadge';

<CloudOnlyBadge />

ClickHouse 可以使用 JSON Web Token (JWT) 对用户进行身份验证。与 [LDAP](/operations/external-authenticators/ldap) 或 [Kerberos](/operations/external-authenticators/kerberos) 等其他外部身份验证器不同，JWT 身份验证不会校验预先存在用户的身份。相反，它会根据嵌入在每个令牌中的声明动态创建**临时用户**。这些用户仅存在于内存中，其访问权限由令牌声明派生，并会在令牌过期后自动移除。

因此，JWT 身份验证与基于密码或证书的方法有本质区别：不存在 `CREATE USER ... IDENTIFIED WITH jwt` 语句，尝试这样做会引发异常。JWT 用户完全由令牌生命周期管理。

## 概述 \{#overview\}

身份验证流程如下：

1. 客户端通过一种受支持的传输机制提供已签名的 JWT (HTTP `Authorization: Bearer` 请求头、TCP 原生协议或 gRPC `jwt` 字段) 。
2. ClickHouse 验证令牌签名。
3. 验证必需的声明 (`exp`、`iat`、`iss`、`sub`、`aud`) 。
4. 在内存中创建一个临时用户，其访问权限来自令牌声明中的 `clickhouse:grants` 和 `clickhouse:roles`，并与权限限制求交集。
5. 当令牌过期时，后台垃圾回收任务会移除该用户。

## 令牌声明 \{#token-claims\}

### 必需的声明 \{#required-claims\}

提交给 ClickHouse 的每个 JWT 都必须包含以下声明：

| Claim | Description                                 |
| ----- | ------------------------------------------- |
| `alg` | 签名算法 (请求头声明) 。支持的值：`HS256`、`RS256`、`ES256`。 |
| `exp` | 过期时间。用于设置临时用户的 `valid_until`。               |
| `iat` | 签发时间。用于防止同一身份重放较早签发的标记。                     |
| `iss` | 签发者。需与提供商预期的签发者匹配。                          |
| `sub` | 主体。会成为生成用户名的一部分。                            |
| `aud` | 受众。需与提供商预期的受众匹配。                            |

使用基于 JWKS 的密钥解析时，还必须提供 `kid` (密钥 ID) 请求头声明。

:::note JWKS 模式仅支持 RSA 密钥
虽然静态密钥提供商接受 `HS256`、`RS256` 或 `ES256` 中的任意一种，但基于 JWKS 的提供商只接受 `kty` 为 `RSA` 的 JWK (即使用 `RS256` 签名的标记) 。使用 HMAC (`HS256`) 或 EC (`ES256`) 密钥签名的标记无法通过 JWKS 端点验证，因此会被拒绝。
:::

### 其他可识别的声明 \{#other-recognized-claims\}

| 声明    | 说明                                    |
| ----- | ------------------------------------- |
| `nbf` | 生效时间下限。此声明不是必需的，但如果存在，则在该时间之前，标记会被拒绝。 |
| `jti` | 保留。可出现在标记中，但当前不会被验证或使用。               |

### 可选声明 \{#optional-claims\}

| 声明                                       | 默认名称                | 说明                                                                                                   |
| ---------------------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------- |
| 授权                                       | `clickhouse:grants` | SQL `GRANT` 片段构成的 JSON 数组，例如 `["SELECT ON db.*", "INSERT ON db.table1"]`。每个元素都会作为 `GRANT` 语句的主体进行解析。 |
| 角色                                       | `clickhouse:roles`  | 要分配的角色名称的 JSON 数组，例如 `["analyst", "reader"]`。                                                        |
| 如果您的身份提供商采用不同的命名约定，可以将默认声明名称重映射为自定义声明名称。 |                     |                                                                                                      |

### 示例令牌的头部和载荷 \{#example-token-header-and-payload\}

```json
{
  "alg": "RS256",
  "kid": "my-key-id"
}
```

```json
{
  "iss": "https://idp.example.com",
  "sub": "jane.doe",
  "aud": "my-clickhouse-cluster",
  "exp": 1719504000,
  "iat": 1719500400,
  "clickhouse:grants": ["SELECT ON analytics.*", "INSERT ON analytics.events"],
  "clickhouse:roles": ["analyst"]
}
```

## 临时用户的行为 \{#ephemeral-user-behavior\}

JWT 用户与普通 ClickHouse 用户在几个重要方面存在差异。

### 身份与命名 \{#identity-and-naming\}

每个 JWT 用户都会获得一个基于 `iss`、`sub` 和 `aud` 声明计算出的确定性 UUID。该 UUID 在多次登录之间是**稳定**的。用户即使用不同的令牌多次登录 (只要签发方、主体和受众相同) ，也始终会得到相同的 UUID。

不过，用户名是**可变**的。它的构造方式如下：

```text
JWT::<issuer>::<audience>::<subject>::<claims_hash>
```

`<claims_hash>` 部分会在 `clickhouse:roles` 或 `clickhouse:grants` 声明发生变化时改变。这意味着，即使是同一身份，角色或授权组合不同的令牌也会生成不同的用户名。

### 访问权限 \{#access-rights\}

有效访问权限按如下方式计算：

```text
effective_rights = permission_limit ∩ (token_grants ∪ token_roles)
```

其中，`permission_limit` 是作为上限配置的参考角色或用户所拥有的一组访问权限。令牌请求的任何超出该上限的权限都会被静默丢弃。

### 令牌时效 \{#token-freshness\}

ClickHouse 会跟踪每个稳定身份最近一次成功通过身份验证的令牌的 `iat` (签发时间) 声明。如果提供的令牌其 `iat` 等于或早于已存储的值，服务器会复用现有的临时用户，而不会重新评估这些声明。这样可以防止较旧的令牌导致用户权限被降级。

### 生命周期与垃圾回收 \{#lifetime-and-garbage-collection\}

临时用户会在令牌首次通过身份验证时创建，并在 `valid_until` (由 `exp` 推导而来) 到期后，由后台垃圾回收任务删除。GC 时间间隔由 `gc_interval` 参数控制 (默认值：5 分钟) 。

在两次 GC 运行之间，已过期的用户在 `system.users` 中可能仍然可见，但已无法再通过身份验证。

### 持久化访问分配 \{#persistent-access-assignments\}

由于 UUID 是稳定的，因此你可以使用 SQL 语句将 settings profile、配额、行策略和列脱敏策略分配给 JWT 用户。这些分配会持久保存在访问控制存储中 (磁盘或 ZooKeeper) ，并且在令牌过期和重新进行身份验证后仍然有效。

通过用户当前的用户名来引用该用户：

```sql
ALTER SETTINGS PROFILE my_profile ADD TO 'JWT::ClickHouse::my-service-id::jane.doe::<claims-hash>';
```

:::note
某个身份的用户名和 UUID 可在该用户处于活动状态时，从 `system.users` 的 `name` 和 `id` 列中查到。
:::

请注意，`ALTER USER` 不能直接用于 JWT 用户，因为它们是只读的。要分配 settings profile、配额或策略，请使用上文所示的 `ALTER SETTINGS PROFILE`、`ALTER QUOTA` 或 `ALTER ROW POLICY` 语句。

## 与常规用户的差异 \{#differences-from-regular-users\}

| 功能                                    | JWT 用户                    | 常规用户               |
| ------------------------------------- | ------------------------- | ------------------ |
| 创建                                    | 根据令牌声明自动创建                | `CREATE USER` 语句   |
| 存储                                    | 仅存于内存中 (临时)               | 磁盘、ZooKeeper 或配置文件 |
| `CREATE USER ... IDENTIFIED WITH jwt` | 不支持 (会引发异常)               | 支持所有其他认证类型         |
| `ALTER USER` / `DROP USER`            | 不支持                       | 支持                 |
| 备份与恢复                                 | 不包含                       | 包含                 |
| 用户名                                   | 自动生成，会变化                  | 由管理员指定，固定不变        |
| UUID                                  | 由 `iss`+`sub`+`aud` 确定性生成 | 创建时随机生成            |
| 生命周期                                  | 受令牌 `exp` 限制              | 直到被显式删除            |
| 访问权限                                  | 从令牌声明派生，并受权限上限限制          | 通过 `GRANT` 显式授予    |
| 主机限制                                  | 按提供商网络配置                  | 按用户的 `HOST` 子句     |
| 设置 profile                            | 可按 UUID 分配 (持久)           | 可直接配置              |
| 配额和行策略                                | 可按 UUID 分配 (持久)           | 可直接配置              |
| 默认角色                                  | 不可配置                      | 可配置                |

## `SQL SECURITY DEFINER` 视图 \{#sql-security-definer-views\}

当临时 JWT 用户使用 `SQL SECURITY DEFINER` 创建视图时，服务器会自动为该用户创建一个持久化的影子副本，作为该视图的定义者。此影子用户具有以下特点：

* 名称为 `<original_jwt_username>:definer`
* 具有 `NO_AUTHENTICATION` (无法用于登录)
* 保留视图创建时原始 JWT 用户所拥有的相同访问权限

这样可确保在临时用户的令牌过期且原始用户被垃圾回收后，视图仍可继续正常工作。

## 客户端用法 \{#client-usage\}

### 直接传递令牌 \{#passing-token-directly\}

使用 `clickhouse-client` 的 `--jwt` 标志，通过预先获取的令牌进行身份验证：

```bash
clickhouse-client --host your-instance.clickhouse.cloud --secure --jwt '<your_jwt_token>'
```

:::note
`--jwt` 标志与 `--user` 互斥。指定 `--jwt` 时，用户名将从令牌中获取。
:::

### HTTP 接口 \{#http-interface\}

将该令牌作为 Bearer 令牌通过 `Authorization` 请求头发送：

```bash
curl -H 'Authorization: Bearer <your_jwt_token>' \
    'https://your-instance.clickhouse.cloud:8443/?query=SELECT+currentUser()'
```

:::warning
始终通过 HTTPS 传输 JWT。通过明文 HTTP 发送 Bearer 令牌会暴露给传输路径上的任何人，这无异于泄露凭证。
:::

### OAuth2 设备代码登录 \{#oauth2-device-code-login\}

`clickhouse-client` 支持通过 `--login` 标志发起交互式 OAuth2 设备代码流程。对于 ClickHouse Cloud 端点，客户端会自动执行令牌交换，以获取 ClickHouse 专用 JWT。令牌会在会话期间自动刷新且对用户无感知。获取新令牌后，客户端会自动重新连接。

```bash
clickhouse-client --host your-instance.clickhouse.cloud --login
```

## ClickHouse Cloud 内置 JWT 身份验证器 \{#clickhouse-cloud-built-in\}

每个 ClickHouse Cloud 服务都自带一个预定义的 JWT 身份验证器，SQL 控制台和 `clickhouse-client` 的 `--login` 流程都会使用它。此身份验证器配置如下：

| 参数           | 值                               |
| ------------ | ------------------------------- |
| `iss` (签发方)  | `ClickHouse`                    |
| `aud` (受众)   | 服务 UUID (可在 Cloud 控制台 URL 中看到)  |
| `sub` (主体)   | 你的 ClickHouse Cloud 账户邮箱地址      |

该内置身份验证器的权限上限设置为 `default_role` 角色和 `default` 用户。这意味着，任何 JWT 用户的有效权限都会与这两个实体所拥有的授权取交集，因此令牌的权限绝不会提升到超出 `default_role` 和 `default` 所允许范围之外。

你无需进行任何配置即可使用此身份验证器。创建服务时会自动为其预配。

## 服务器间通信 \{#interserver-communication\}

当查询被转发到另一个分片或副本时，JWT 令牌会包含在服务器间通信协议中。远程节点会独立对该令牌重新进行身份验证，并创建自己的临时用户。

## 故障排查 \{#troubleshooting\}

* **未授予访问权限：** 引用的角色或用户可能缺少所需的授权。请确保 `clickhouse:roles` 中引用的角色存在，并且包含相应的授权。
* **令牌被拒绝：** 请验证令牌中的 `iss`、`aud` 和签名算法是否符合 JWT 提供商的预期。如果使用 JWKS，请确保令牌的 `kid` 与提供商密钥集中的某个密钥匹配。
* **用户在查询之间消失：** 临时用户会在令牌过期后被移除。对于长时间运行的会话，请使用支持令牌刷新 (例如 `--login` 模式) 的客户端。
* **`CREATE USER ... IDENTIFIED WITH jwt` 失败：** 这是预期行为。JWT 用户不能通过 DDL 创建，而是完全由令牌生命周期管理。