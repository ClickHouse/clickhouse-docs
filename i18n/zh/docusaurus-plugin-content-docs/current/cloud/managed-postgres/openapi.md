---
slug: /cloud/managed-postgres/openapi
sidebar_label: 'OpenAPI'
title: 'OpenAPI'
description: '使用我们的 OpenAPI 管理您的 Managed Postgres 服务'
keywords: ['managed postgres', 'openapi', 'api', 'curl', '教程', '命令行']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

# Managed Postgres OpenAPI \{#managed-postgres-openapi\}

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="openapi" />

使用 [ClickHouse OpenAPI](/cloud/manage/cloud-api) 以编程方式
管理您的 Managed Postgres 服务，就像管理 ClickHouse 服务一样。已
熟悉 [OpenAPI]？获取您的 [API 密钥] 后，直接前往 [Managed
Postgres API reference][pg-openapi]。否则，请继续阅读，快速
了解一下。

## API 密钥 \{#api-keys\}

使用 ClickHouse OpenAPI 需要身份验证；有关如何创建 API 密钥，请参见 [API 密钥]。然后按如下方式通过 basic auth 凭据使用它们：

```bash
KEY_ID=mykeyid
KEY_SECRET=mykeysecret

curl -s --user "$KEY_ID:$KEY_SECRET" https://api.clickhouse.cloud/v1/organizations | jq
```

## 组织 ID \{#organization-id\}

接下来，您需要获取组织 ID。

1. 在控制台左下角选择您的组织名称。
2. 选择 **组织详细信息**。
3. 点击 **Organization ID** 右侧的复制图标，直接将其复制到剪贴板。

{/*

  TODO: 在 API 发布后取消注释并插入正确的示例输出。

  现在可以像这样在请求中使用它：

  ```bash
  ORG_ID=myorgid

  curl -s --user "$KEY_ID:$KEY_SECRET" \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres" | jq
  ```

  现在，你已经发出了第一个 Postgres API 请求：[list API] 列出了你的组织中
  的所有 Postgres 服务器。输出应类似于：

  ```json
  {
  "result": [
    {
      "id": "c0d0b15d-5e8b-431d-8943-51b6e233e0b1",
      "name": "Customer's Organization",
      "createdAt": "2026-03-24T14:21:31Z",
      "privateEndpoints": [],
      "enableCoreDumps": true
    }
  ],
  "requestId": "c128d830-5769-4c82-8235-f79aa69d1ebf",
  "status": 200
  }
  ```

  */ }

## 增删改查 \{#crud\}

让我们来看看 Postgres 服务的生命周期。

### 创建 \{#create\}

首先，使用 [create API] 创建一个新的实例。请求的 JSON 正文中需要包含以下属性：

* `name`：新 Postgres 服务的名称
* `provider`：云服务商名称
* `region`：云服务商网络中部署服务的区域
* `size`：VM 规格
* `storageSize`：VM 的存储大小

这些属性的可选值请参阅 [create API] 文档。此外，这里指定使用 Postgres 18，而不是默认的 17：

```bash
create_data='{
  "name": "my postgres",
  "provider": "aws",
  "region": "us-west-2",
  "postgresVersion": "18",
  "size": "r8gd.large",
  "storageSize": 118
}'
```

现在使用这些数据创建一个新实例；请注意，这需要设置 Content-Type 标头：

```bash
curl -s --user "$KEY_ID:$KEY_SECRET" -H 'Content-Type: application/json' \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres" \
    -d "$create_data" | jq
```

成功后，系统会创建一个新实例，并返回其实例信息，
其中包括连接数据：

```json
{
  "result": {
    "id": "pg7myrd1j06p3gx4zrm2ze8qz6",
    "name": "my postgres",
    "provider": "aws",
    "region": "us-west-2",
    "postgresVersion": "18",
    "size": "r8gd.large",
    "storageSize": 118,
    "haType": "none",
    "tags": [],
    "connectionString": "postgres://postgres:vV6cfEr2p_-TzkCDrZOx@my-postgres-6d8d2e3e.pg7myrd1j06p3gx4zrm2ze8qz6.c0.us-west-2.aws.pg.clickhouse-dev.com:5432/postgres?channel_binding=require",
    "username": "postgres",
    "password": "vV6cfEr2p_-TzkCDrZOx",
    "hostname": "my-postgres-6d8d2e3e.pg7myrd1j06p3gx4zrm2ze8qz6.c0.us-west-2.aws.pg.clickhouse-dev.com",
    "isPrimary": true,
    "state": "creating"
  },
  "requestId": "a5957990-dbe5-46fd-b5ce-a7f8f79e50fe",
  "status": 200
}
```

### 查询 \{#read\}

使用响应中的 `id` 再次查询该服务：

```bash
PG_ID=pg7myrd1j06p3gx4zrm2ze8qz6
curl -s --user "$KEY_ID:$KEY_SECRET" \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres/$PG_ID" \
    | jq
```

输出将与创建时返回的 JSON 类似，但请留意 `state`；当其变为 `running` 时，服务器即表示已就绪：

```bash
curl -s --user "$KEY_ID:$KEY_SECRET" \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres/$PG_ID" \
    | jq .result.state
```

```json
"running"
```

现在，您可以使用 `connectionString` 属性连接，例如通过
[psql]：

```bash
$ psql "$(
    curl -s --user "$KEY_ID:$KEY_SECRET" \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres/$PG_ID" \
    | jq -r .result.connectionString
)"

psql (18.3)
SSL connection (protocol: TLSv1.3, cipher: TLS_AES_256_GCM_SHA384, compression: off, ALPN: postgresql)
Type "help" for help.

postgres=# 
```

输入 `\q` 退出 [psql]。

### 更新 \{#update\}

[patch API] 支持通过 [RFC 7396] JSON Merge Patch 更新 Managed
Postgres 服务的部分属性。对于复杂部署，标签可能尤其
有用；只需在请求中单独发送标签即可：

```bash
curl -sX PATCH --user "$KEY_ID:$KEY_SECRET" -H 'Content-Type: application/json' \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres/$PG_ID" \
    -d '{"tags": [{"key": "Environment", "value": "production"}]}' \
    | jq .result
```

返回的数据中应包含新的标签：

```json
{
  "id": "$PG_ID",
  "name": "my postgres",
  "provider": "aws",
  "region": "us-west-2",
  "postgresVersion": "18",
  "size": "r8gd.large",
  "storageSize": 118,
  "haType": "none",
  "tags": [
    {
      "key": "Environment",
      "value": "production"
    }
  ],
  "connectionString": "postgres://postgres:vV6cfEr2p_-TzkCDrZOx@my-postgres-6d8d2e3e.$PG_ID.c0.us-west-2.aws.pg.clickhouse-dev.com:5432/postgres?channel_binding=require",
  "username": "postgres",
  "password": "vV6cfEr2p_-TzkCDrZOx",
  "hostname": "my-postgres-6d8d2e3e.$PG_ID.c0.us-west-2.aws.pg.clickhouse-dev.com",
  "isPrimary": true,
  "state": "running"
}
```

{/*

  TODO: 待实现后补充扩展。

  OpenAPI 提供了额外的端点，用于更新 [patch API] 不支持的属性。
  例如，要更新 [Postgres configuration]，请使用 [config API]：

  ```bash
  curl -s --user "$KEY_ID:$KEY_SECRET" -H 'Content-Type: application/json' \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres/$PG_ID/config" \
    -d '{"max_connections": "42"}'
  ```

  输出将显示更新后的配置：

  ```json
  {"max_connections": "42"}
  ```

  其他可用的更新 API 包括：

  * 重置超级用户密码
  * 重命名 Postgres 服务（会更改主机名）
  * 升级到下一个 Postgres 主版本

  */ }

### 删除 \{#delete\}

使用[删除 API]删除 Postgres 服务。

:::warning
删除 Postgres 服务会彻底移除该服务及其全部数据。删除服务前，请务必先确认您已完成备份，或已将某个副本提升为主节点。
:::

```bash
curl -sX DELETE --user "$KEY_ID:$KEY_SECRET" \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres/$PG_ID" \
    | jq
```

成功时，响应会返回状态码 200，例如：

```json
{
  "requestId": "ac9bbffa-e370-410c-8bdd-bd24bf3d7f82",
  "status": 200
}
```

[ClickHouse OpenAPI]: /cloud/manage/cloud-api "Cloud API"

[OpenAPI]: https://www.openapis.org "OpenAPI 计划"

[API keys]: /cloud/manage/openapi "管理 API 密钥"

[pg-openapi]: https://clickhouse.com/docs/cloud/manage/api/swagger#tag/Postgres "ClickHouse Cloud 的 Postgres OpenAPI 规范"

[list API]: https://clickhouse.com/docs/cloud/manage/api/swagger#tag/Postgres/operation/postgresServiceGetList "获取组织的 Postgres 服务列表"

[create API]: https://clickhouse.com/docs/cloud/manage/api/swagger#tag/Postgres/operation/postgresServiceCreate "创建新的 Postgres 服务"

[psql]: https://www.postgresql.org/docs/current/app-psql.html "PostgreSQL 文档：psql — PostgreSQL 交互式终端"

[patch API]: https://clickhouse.com/docs/cloud/manage/api/swagger#tag/Postgres/operation/postgresServicePatch "更新 PostgreSQL 服务"

[RFC 7396]: https://www.rfc-editor.org/rfc/rfc7396 "RFC 7396：JSON Merge Patch"

[Postgres configuration]: https://www.postgresql.org/docs/18/runtime-config.html "PostgreSQL 文档：服务器配置"

[config API]: https://clickhouse.com/docs/cloud/manage/api/swagger#tag/Postgres/operation/postgresServiceSetConfig "更新 Postgres 服务的配置"

[delete API]: https://clickhouse.com/docs/cloud/manage/api/swagger#tag/Postgres/operation/postgresServiceDelete "删除 PostgreSQL 服务"
