---
title: "通过 OpenAPI 扩缩 DB ClickPipes"
description: "如何通过 OpenAPI 扩缩 Postgres ClickPipes"
slug: /integrations/clickpipes/postgres/scaling
sidebar_label: "扩缩容"
doc_type: "guide"
keywords:
  ["clickpipes", "postgresql", "cdc", "数据摄取", "实时同步"]
integration:
  - support_level: "core"
  - category: "clickpipes"
---

:::caution 大多数用户都不需要此 API
DB ClickPipes 的默认配置可开箱即用，满足大多数工作负载的需求。如果你认为自己的工作负载需要扩缩容，请提交[支持请求](https://clickhouse.com/support/program)，我们将指导你为具体场景选择最佳设置。
:::

扩缩容 API 可能适用于以下情况：

* 大规模初始加载 (超过 4 TB)
* 尽快迁移中等规模的数据
* 在同一服务下支持超过 8 个 CDC ClickPipes

在尝试扩容之前，请先考虑以下事项：

* 确保源数据库有足够的可用容量
* 创建 ClickPipe 时，先调整[初始加载并行度和分区](/integrations/clickpipes/postgres/parallel_initial_load)
* 检查源端是否存在可能导致 CDC 延迟的[长时间运行的事务](/integrations/clickpipes/postgres/sync_control#transactions)

**提高规模会按比例增加 ClickPipes 的计算成本。** 如果只是为了初始加载而扩容，请务必在快照完成后缩容，以避免产生意外费用。有关定价的更多信息，请参阅 [Postgres CDC Pricing](/cloud/reference/billing/clickpipes)。

## 此流程的先决条件 \{#prerequisites\}

在开始上手前，您需要具备：

1. 在目标 ClickHouse Cloud 服务上具有 Admin 权限的 [ClickHouse API 密钥](/cloud/manage/openapi)。
2. 该服务中曾预配过一个 DB ClickPipe (Postgres、MySQL 或 MongoDB) 。CDC 基础设施会随第一个 ClickPipe 一同创建，自那时起，扩缩容端点即可使用。

## 如何扩缩容 DB ClickPipes \{#cdc-scaling-steps\}

执行任何命令语之前，请先设置以下环境变量：

```bash
ORG_ID=<Your ClickHouse organization ID>
SERVICE_ID=<Your ClickHouse service ID>
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
```

获取当前扩缩容配置 (可选) ：

```bash
curl --silent --user $KEY_ID:$KEY_SECRET \
https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/clickpipesCdcScaling \
| jq

# example result:
{
  "result": {
    "replicaCpuMillicores": 2000,
    "replicaMemoryGb": 8
  },
  "requestId": "04310d9e-1126-4c03-9b05-2aa884dbecb7",
  "status": 200
}
```

设置所需的扩缩容级别。支持的配置包括 1–24 个 CPU 核心，内存 (GB) 为核心数的 4×：

```bash
cat <<EOF | tee cdc_scaling.json
{
  "replicaCpuMillicores": 24000,
  "replicaMemoryGb": 96
}
EOF

curl --silent --user $KEY_ID:$KEY_SECRET \
-X PATCH -H "Content-Type: application/json" \
https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/clickpipesCdcScaling \
-d @cdc_scaling.json | jq
```

等待配置生效 (通常需要 3-5 分钟) 。扩缩容完成后，GET 端点将显示新的值：

```bash
curl --silent --user $KEY_ID:$KEY_SECRET \
https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/clickpipesCdcScaling \
| jq

# example result:
{
  "result": {
    "replicaCpuMillicores": 24000,
    "replicaMemoryGb": 96
  },
  "requestId": "5a76d642-d29f-45af-a857-8c4d4b947bf0",
  "status": 200
}
```