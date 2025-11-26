---
title: '通过 OpenAPI 扩展数据库 ClickPipes'
description: '通过 OpenAPI 扩展数据库 ClickPipes 的文档'
slug: /integrations/clickpipes/postgres/scaling
sidebar_label: '扩展'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', '数据摄取', '实时同步']
---

:::caution 大多数用户不需要使用此 API
数据库 ClickPipes 的默认配置在大多数场景下开箱即用即可处理绝大部分工作负载。如果你认为你的工作负载需要扩展，请提交一个[支持工单](https://clickhouse.com/support/program)，我们会为你的使用场景提供最优配置指导。
:::

扩展 API 适用于以下场景：

- 大规模初始加载（超过 4 TB）
- 尽可能快速地迁移中等规模的数据
- 在同一服务下支持超过 8 个 CDC ClickPipes

在尝试扩容之前，请先考虑：

- 确保源数据库具有足够的可用容量
- 在创建 ClickPipe 时，优先调整[初始加载并行度和分区](/integrations/clickpipes/postgres/parallel_initial_load)
- 检查源端是否存在可能导致 CDC 延迟的[长时间运行事务](/integrations/clickpipes/postgres/sync_control#transactions)

**提升扩展级别会按比例增加 ClickPipes 的计算成本。** 如果你仅为初始加载而扩容，务必在快照完成后及时缩容，以避免产生意外费用。有关定价的更多信息，请参阅 [Postgres CDC 定价](/cloud/reference/billing/clickpipes)。

## 此流程的先决条件 {#prerequisites}

在开始之前，您需要：

1. 在目标 ClickHouse Cloud 服务上具有管理员权限的 [ClickHouse API key](/cloud/manage/openapi)。
2. 在该服务中已经预配好的一个 DB ClickPipe（Postgres、MySQL 或 MongoDB）。CDC 基础设施会在创建第一个 ClickPipe 时一并创建，从那一刻起扩缩容相关端点即可使用。

## 扩展数据库 ClickPipes 的步骤

在执行任何命令之前，先设置以下环境变量：

```bash
ORG_ID=<您的 ClickHouse 组织 ID>
SERVICE_ID=<您的 ClickHouse 服务 ID>
KEY_ID=<您的 ClickHouse 密钥 ID>
KEY_SECRET=<您的 ClickHouse 密钥密钥>
```

获取当前扩缩容配置（可选）：

```bash
curl --silent --user $KEY_ID:$KEY_SECRET \
https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/clickpipesCdcScaling \
| jq

# 示例结果：
{
  "result": {
    "replicaCpuMillicores": 2000,
    "replicaMemoryGb": 8
  },
  "requestId": "04310d9e-1126-4c03-9b05-2aa884dbecb7",
  "status": 200
}
```

设置所需的伸缩规模。支持的配置包括 1–24 个 CPU 核心，内存（GB）设置为 CPU 核心数的 4 倍：

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

等待配置生效（通常需要 3-5 分钟）。扩容完成后，GET 端点将显示更新后的数值：

```bash
curl --silent --user $KEY_ID:$KEY_SECRET \
https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/clickpipesCdcScaling \
| jq

# 示例结果：
{
  "result": {
    "replicaCpuMillicores": 24000,
    "replicaMemoryGb": 96
  },
  "requestId": "5a76d642-d29f-45af-a857-8c4d4b947bf0",
  "status": 200
}
```
