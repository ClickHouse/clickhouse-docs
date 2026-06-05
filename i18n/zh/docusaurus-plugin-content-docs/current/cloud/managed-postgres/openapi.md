---
slug: /cloud/managed-postgres/openapi
sidebar_label: 'OpenAPI'
title: 'Managed Postgres OpenAPI'
description: '使用我们的 OpenAPI 管理您的 Managed Postgres 服务'
keywords: ['managed postgres', 'openapi', 'api', 'curl', '教程', '命令行', 'query insights', '慢查询']
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

<BetaBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} galaxyEvent="docs.managed-postgres.openapi-beta" />

使用 [ClickHouse OpenAPI](/cloud/manage/cloud-api) 以编程方式
管理您的 Managed Postgres 服务，就像管理 ClickHouse 服务一样。该
API 还提供了一个 [Prometheus 端点]，用于抓取服务指标。已
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
      "id": "ee2fef9f-b443-8ad0-8c9b-724390cdb826",
      "name": "oltp",
      "provider": "aws",
      "region": "eu-west-2",
      "postgresVersion": "18",
      "size": "r6gd.medium",
      "storageSize": 59,
      "haType": "none",
      "tags": [],
      "isPrimary": true,
      "state": "running",
      "createdAt": "2026-05-25T16:42:16+00:00"
    }
  ],
  "requestId": "c128d830-5769-4c82-8235-f79aa69d1ebf",
  "status": 200
}
```

## 增删改查 \{#crud\}

让我们来看看 Postgres 服务的生命周期。

### 创建 \{#create\}

首先，使用 [create API] 创建一个新的实例。请求的 JSON 正文中需要包含以下属性：

* `name`：新 Postgres 服务的名称
* `provider`：云服务商名称
* `region`：云服务商网络中部署服务的区域
* `size`：VM 规格

这些属性的可选值请参阅 [create API] 文档。此外，这里指定使用 Postgres 18，而不是默认的 17：

```bash
create_data='{
  "name": "my postgres",
  "provider": "aws",
  "region": "us-west-2",
  "postgresVersion": "18",
  "size": "r8gd.large"
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
    "id": "67b4bc12-8582-45d0-8806-fe9b2e5a54e6",
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
PG_ID=67b4bc12-8582-45d0-8806-fe9b2e5a54e6
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
  "id": "67b4bc12-8582-45d0-8806-fe9b2e5a54e6",
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

OpenAPI 提供了额外的端点，用于更新 [patch API] 不支持的属性。
例如，要更新 [Postgres configuration]，请使用 [config API]：

```bash
curl -s --user "$KEY_ID:$KEY_SECRET" -H 'Content-Type: application/json' \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres/$PG_ID/config" \
    -d '{"pgConfig": {"max_connections": "42"}, "pgBouncerConfig": {}}' | jq
```

输出将显示更新后的配置，以及一条说明
该更改后果的消息：

```json
{
  "result":{
    "pgConfig": {
      "max_connections": "42"
    },
    "pgBouncerConfig": {},
    "message": "The changes in the following parameters require a database restart to take effect: max_connections. You can restart the database by using the restart endpoint."
  },
  "requestId":"fdec06f2-66f7-45b4-9f82-0c051aba20aa",
  "status": 200
}
```

{/*

  TODO: 当 API 发布后，取消注释并插入正确的示例输出。

  其他更新 API 包括：

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

## 监控 \{#monitoring\}

两个与 Prometheus 兼容的端点会公开 Managed Postgres 服务的 CPU、内存、I/O、连接和事务指标：一个返回组织中所有服务的指标，另一个返回单个服务的指标。有关设置，请参阅 [Prometheus 端点] 页面；有关完整指标列表，请参阅 [指标参考]。

## Query insights \{#query-insights\}

Cloud
控制台中 [查询洞察] 选项卡背后的每条语句遥测数据也可通过编程方式获取。两个端点提供了某个服务上最慢的
查询模式：一个按影响程度列出所有模式，另一个返回单个模式及其最近的执行记录。

### 列出慢查询模式 \{#list-slow-query-patterns\}

[慢查询模式 API] 返回指定时间窗口内观测到的最慢查询模式的聚合指标。必须提供该时间窗口——请将 `from_date` 和 `to_date` 作为 RFC 3339 时间戳传入：

```bash
FROM=2026-05-25T00:00:00Z
TO=2026-05-26T00:00:00Z

curl -s --user "$KEY_ID:$KEY_SECRET" \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres/$PG_ID/slowQueryPatterns?from_date=$FROM&to_date=$TO" \
    | jq
```

结果默认先显示开销最高的模式，并按 `total_duration`
降序排序。可使用 `sort_by` 按其他计数指标排序 (例如
`p99_duration`、`call_count` 或 `total_wal_bytes`) ，并通过
`sort_order` 切换排序方向。可使用 `db_name`、`db_user`、
`db_operation` 和 `app` 这些过滤器缩小结果范围，并通过 `limit` 和
`offset` 分页查看。

每条结果都对应一个归一化后的模式，其中字面量已被去除，且
耗时以微秒为单位显示：

```json
{
  "result": [
    {
      "queryId": "-4748036479882663975",
      "queryText": "SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC LIMIT $2",
      "dbName": "sales",
      "dbUser": "orders_service",
      "dbOperation": "SELECT",
      "app": "orders-api",
      "callCount": 84213,
      "errorCount": 0,
      "totalDurationUs": 1012384556,
      "avgDurationUs": 12021,
      "maxDurationUs": 482915,
      "p50DurationUs": 9874,
      "p95DurationUs": 28431,
      "p99DurationUs": 41200,
      "totalRows": 842130,
      "totalSharedBlksRead": 19284,
      "totalSharedBlksHit": 48217734,
      "totalCpuTimeUs": 938472113,
      "totalWalBytes": 0
    }
  ],
  "requestId": "c128d830-5769-4c82-8235-f79aa69d1ebf",
  "status": 200
}
```

`queryId` 是规范化后语句的有符号 64 位哈希值，因此它通常
为负数。将其完整原样传回——包括前面的 `-`——即可拉取单个模式。

### 获取慢查询模式 \{#get-slow-query-pattern\}

将列表响应中的 `queryId` 传递给 [slow pattern API]，即可获取该模式的聚合指标以及最近的各次单次执行记录。用于标识该模式的 `db_name`、`db_user` 和 `db_operation` 是必填项：

```bash
QUERY_ID=-4748036479882663975

curl -s --user "$KEY_ID:$KEY_SECRET" \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres/$PG_ID/slowQueryPatterns/$QUERY_ID?db_name=sales&db_user=orders_service&db_operation=SELECT" \
    | jq
```

响应在 `aggregate` 下包含与列表端点相同的聚合信息，并额外提供一个 `recentExecutions` 数组。每次执行都包含完整的单次执行计数器——共享块和临时块 I/O、CPU 用户态与系统态时间、并行工作线程、JIT 以及 WAL——也就是控制台中 [详情弹出面板] 细分展示的那些计数器：

```json
{
  "result": {
    "aggregate": {
      "queryId": "-4748036479882663975",
      "queryText": "SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC LIMIT $2",
      "dbName": "sales",
      "dbUser": "orders_service",
      "dbOperation": "SELECT",
      "callCount": 84213,
      "avgDurationUs": 12021,
      "p99DurationUs": 41200
    },
    "recentExecutions": [
      {
        "timestamp": "2026-05-25T16:42:09Z",
        "durationUs": 41200,
        "rows": 10,
        "sharedBlksHit": 412,
        "sharedBlksRead": 3,
        "tempBlksWritten": 0,
        "cpuUserTimeUs": 38211,
        "cpuSysTimeUs": 1044,
        "parallelWorkersPlanned": 0,
        "parallelWorkersLaunched": 0,
        "walBytes": 0,
        "serverRole": "primary"
      }
    ]
  },
  "requestId": "a5957990-dbe5-46fd-b5ce-a7f8f79e50fe",
  "status": 200
}
```

该示例为简洁起见对两个对象都做了裁剪；API 返回 [per-execution counters] 中记录的完整计数器集。

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

[Prometheus endpoint]: /cloud/managed-postgres/monitoring/prometheus "Managed Postgres Prometheus 端点"

[metrics reference]: /cloud/managed-postgres/monitoring/metrics "Managed Postgres 指标参考"

[Query Insights]: /cloud/managed-postgres/monitoring/query-insights "Postgres 查询洞察"

[detail flyout]: /cloud/managed-postgres/monitoring/query-insights#detail "查询洞察详情弹出面板"

[per-execution counters]: /cloud/managed-postgres/monitoring/query-insights#counters "查询洞察中的单次执行计数器"

[slow patterns API]: https://clickhouse.com/docs/cloud/manage/api/swagger#tag/Postgres/operation/slowQueryPatternsGetList "列出 Postgres 慢查询模式列表"

[slow pattern API]: https://clickhouse.com/docs/cloud/manage/api/swagger#tag/Postgres/operation/slowQueryPatternGet "获取包含最近执行记录的 Postgres 慢查询模式"