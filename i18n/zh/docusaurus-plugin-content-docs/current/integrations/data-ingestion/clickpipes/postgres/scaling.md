---
title: '通过 OpenAPI 扩展 DB ClickPipes'
description: '通过 OpenAPI 扩展 DB ClickPipes 的文档'
slug: /integrations/clickpipes/postgres/scaling
sidebar_label: '扩展'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'data ingestion', 'real-time sync']
---

:::caution 大多数用户不需要这个 API
DB ClickPipes 的默认配置旨在开箱即用地处理绝大多数工作负载。如果您认为您的工作负载需要扩展，请提交一个 [support case](https://clickhouse.com/support/program)，我们会根据您的使用场景为您推荐最佳设置。
:::

扩展 API 在以下场景中可能会有帮助：
- 大规模初始加载（超过 4 TB）
- 需要尽可能快速迁移中等规模的数据
- 在同一服务下支持超过 8 个 CDC ClickPipes

在尝试扩容之前，请考虑：
- 确保源数据库有足够的可用容量
- 在创建 ClickPipe 时优先调整[初始加载并行度和分区](/integrations/clickpipes/postgres/parallel_initial_load)
- 检查源端是否存在可能导致 CDC 延迟的[长事务](/integrations/clickpipes/postgres/sync_control#transactions)

**提高扩容级别会按比例增加 ClickPipes 的计算成本。** 如果您仅为初始加载而扩容，请务必在快照完成后及时缩容，以避免产生意外费用。有关定价的更多详情，请参阅 [Postgres CDC 定价](/cloud/reference/billing/clickpipes)。



## 此流程的前提条件 {#prerequisites}

开始之前,您需要准备:

1. 对目标 ClickHouse Cloud 服务具有管理员权限的 [ClickHouse API 密钥](/cloud/manage/openapi)。
2. 在服务中已配置的数据库 ClickPipe(Postgres、MySQL 或 MongoDB)。CDC 基础设施会随第一个 ClickPipe 一起创建,扩展端点从此时起可用。


## 扩展 DB ClickPipes 的步骤 {#cdc-scaling-steps}

在运行任何命令之前,请先设置以下环境变量:

```bash
ORG_ID=<您的 ClickHouse 组织 ID>
SERVICE_ID=<您的 ClickHouse 服务 ID>
KEY_ID=<您的 ClickHouse 密钥 ID>
KEY_SECRET=<您的 ClickHouse 密钥密文>
```

获取当前扩展配置(可选):

```bash
curl --silent --user $KEY_ID:$KEY_SECRET \
https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/clickpipesCdcScaling \
| jq

```


# 示例结果：

{
"result": {
"replicaCpuMillicores": 2000,
"replicaMemoryGb": 8
},
"requestId": "04310d9e-1126-4c03-9b05-2aa884dbecb7",
"status": 200
}

````

设置所需的扩缩容配置。支持的配置包括 1-24 个 CPU 核心，内存（GB）设置为核心数的 4 倍：

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
````

等待配置生效（通常需要 3-5 分钟）。扩缩容完成后，GET 端点将返回新的配置值：

```bash
curl --silent --user $KEY_ID:$KEY_SECRET \
https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/clickpipesCdcScaling \
| jq

```


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

```
