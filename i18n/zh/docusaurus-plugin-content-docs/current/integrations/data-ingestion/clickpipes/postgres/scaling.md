---
'title': '通过 OpenAPI 扩展 DB ClickPipes'
'description': '文档用于通过 OpenAPI 扩展 DB ClickPipes'
'slug': '/integrations/clickpipes/postgres/scaling'
'sidebar_label': '扩展'
'doc_type': 'guide'
---

:::caution 大多数用户不需要此API
DB ClickPipes的默认配置旨在开箱即用地处理大多数工作负载。如果您认为您的工作负载需要扩展，请打开一个[支持案例](https://clickhouse.com/support/program)，我们将指导您调整适合用例的最佳设置。
:::

扩展API可能对以下情况有用：
- 大量初始加载（超过4 TB）
- 尽可能快速地迁移适量数据
- 在同一服务下支持超过8个CDC ClickPipes

在尝试扩展之前，请考虑：
- 确保源DB有足够的可用容量
- 在创建ClickPipe时，首先调整[初始负载并行性和分区](/integrations/clickpipes/postgres/parallel_initial_load)
- 检查源上是否存在[长时间运行的事务](/integrations/clickpipes/postgres/sync_control#transactions)，这些事务可能导致CDC延迟

**增加规模将成比例地增加您的ClickPipes计算成本。** 如果您仅为初始加载进行扩展，则在快照完成后缩小规模以避免意外费用是很重要的。有关定价的更多详细信息，请参见[Postgres CDC定价](/cloud/reference/billing/clickpipes)。

## 该过程的前提条件 {#prerequisites}

在开始之前，您需要：

1. 具有目标ClickHouse Cloud服务的管理员权限的[ClickHouse API密钥](/cloud/manage/openapi)。
2. 在某个时间点在服务中配置的DB ClickPipe（Postgres、MySQL或MongoDB）。CDC基础设施与第一个ClickPipe一起创建，扩展端点从那时起可用。

## 扩展DB ClickPipes的步骤 {#cdc-scaling-steps}

在运行任何命令之前设置以下环境变量：

```bash
ORG_ID=<Your ClickHouse organization ID>
SERVICE_ID=<Your ClickHouse service ID>
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
```

获取当前的扩展配置（可选）：

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

设置所需的扩展。支持的配置包括1-24个CPU核心，内存（GB）设置为核心数量的4倍：

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

等待配置传播（通常为3-5分钟）。扩展完成后，GET端点将反映新值：

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
