---
title: "通过 OpenAPI 对 MongoDB ClickPipes 进行扩缩容"
description: "如何通过 OpenAPI 对 MongoDB ClickPipes 进行扩缩容"
slug: /integrations/clickpipes/mongodb/scaling
sidebar_label: "扩缩容"
doc_type: "guide"
keywords:
  [
    "clickpipes",
    "mongodb",
    "cdc",
    "数据摄取",
    "实时同步",
    "扩缩容"
  ]
integration:
  - support_level: "core"
  - category: "clickpipes"
---

:::caution 大多数用户都不需要使用此 API
DB ClickPipes 的默认配置开箱即用即可处理大多数工作负载。如果您认为当前工作负载需要扩容，请提交[支持工单](https://clickhouse.com/support/program)，我们将指导您为该使用场景选择最佳设置。
:::

在以下情况下，扩缩容 API 可能会很有用：

* 大规模初始加载 (超过 4 TB)
* 尽可能快地迁移中等规模的数据
* 在同一服务下支持超过 8 个 CDC ClickPipes

在尝试扩容之前，请先考虑：

* 确保源 DB 具备足够的可用容量
* 检查可能导致 CDC 延迟的[同步时间间隔和拉取批次大小设置](/integrations/clickpipes/mongodb/sync_control)

**扩大规模会按比例增加您的 ClickPipes 计算成本。** 如果您扩容只是为了完成初始加载，那么在快照完成后务必及时缩容，以避免产生意外费用。有关定价的更多信息，请参阅 [ClickPipes 定价](/cloud/reference/billing/clickpipes)。

## 此流程的前提条件 \{#prerequisites\}

在开始之前，您需要准备：

1. [ClickHouse API 密钥](/cloud/manage/openapi)，并且在目标 ClickHouse Cloud 服务上具有 Admin 权限。
2. 该服务中此前已预配过一个 DB ClickPipe (Postgres、MySQL 或 MongoDB) 。CDC 基础设施会随第一个 ClickPipe 一起创建，并且从那时起扩缩容端点即可用。

## 如何扩缩容 DB ClickPipes \{#cdc-scaling-steps\}

执行任何命令前，请先设置以下环境变量：

```bash
ORG_ID=<Your ClickHouse organization ID>
SERVICE_ID=<Your ClickHouse service ID>
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
```

查看当前的扩缩容配置 (可选) ：

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

设置所需的扩缩容规格。支持的配置包括 1–24 个 CPU 核心，内存 (GB) 为核心数的 4 倍：

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

等待配置下发并生效 (通常需要 3–5 分钟) 。扩缩容完成后，GET 端点将反映更新后的值：

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