---
sidebar_label: 'UsageCost'
title: 'UsageCost'
---

## 获取组织使用成本

返回在查询时间段内（最多 31 天）的组织使用成本记录的总金额和每日、每实体的列表。请求和响应中的所有日期均基于 UTC 时区进行评估。

| 方法   | 路径                                              |
| :----- | :------------------------------------------------ |
| GET    | `/v1/organizations/{organizationId}/usageCost`   |

### 请求

#### 路径参数

| 名称                | 类型        | 描述                                         |
| :----------------- | :---------- | :------------------------------------------ |
| organizationId     | uuid        | 所请求组织的 ID。                          | 
| from_date          | date-time   | 报告的开始日期，例如 2024-12-19。         | 
| to_date            | date-time   | 报告的结束日期（包括该日），例如 2024-12-20。此日期不能超过 from_date 30 天（最大查询周期为 31 天）。 | 


### 响应

#### 响应结构

| 名称                             | 类型        | 描述                                         |
| :------------------------------ | :---------- | :------------------------------------------ |
| grandTotalCHC                  | number      | ClickHouse 学分 (CHCs) 的总使用成本。                      | 
| costs.dataWarehouseId           | uuid        | 此实体所属的数据仓库的 ID（或是它）。                | 
| costs.serviceId                 | uuid        | 此实体所属的服务的 ID（或是它）。对于数据仓库实体，此值为 null。 | 
| costs.date                      | date        | 使用日期。基于 UTC 时区的 ISO-8601 日期。             | 
| costs.entityType                | string      | 实体类型。                                 | 
| costs.entityId                  | uuid        | 实体的唯一 ID。                             | 
| costs.entityName                | string      | 实体的名称。                               | 
| costs.metrics.storageCHC        | number      | 数据仓库实体的存储成本，单位为 ClickHouse 学分 (CHCs)。  | 
| costs.metrics.backupCHC         | number      | 数据仓库实体的备份成本，单位为 ClickHouse 学分 (CHCs)。 | 
| costs.metrics.computeCHC        | number      | 服务和 ClickPipe 实体的计算成本，单位为 ClickHouse 学分 (CHCs)。 | 
| costs.metrics.dataTransferCHC   | number      | ClickPipe 实体的数据传输成本，单位为 ClickHouse 学分 (CHCs)。 | 
| costs.metrics.publicDataTransferCHC | number   | 服务实体的数据传输成本，单位为 ClickHouse 学分 (CHCs)。  | 
| costs.metrics.interRegionTier1DataTransferCHC | number | 服务实体的一级跨区域数据传输成本，单位为 ClickHouse 学分 (CHCs)。 | 
| costs.metrics.interRegionTier2DataTransferCHC | number | 服务实体的二级跨区域数据传输成本，单位为 ClickHouse 学分 (CHCs)。 | 
| costs.metrics.interRegionTier3DataTransferCHC | number | 服务实体的三级跨区域数据传输成本，单位为 ClickHouse 学分 (CHCs)。 | 
| costs.metrics.interRegionTier4DataTransferCHC | number | 服务实体的四级跨区域数据传输成本，单位为 ClickHouse 学分 (CHCs)。 | 
| costs.totalCHC                  | number      | 此实体的总使用成本，单位为 ClickHouse 学分 (CHCs)。       | 
| costs.locked                    | boolean     | 如果为真，则记录为不可变。解锁的记录在被锁定之前可能会发生更改。 |

#### 示例响应

```
{
  "grandTotalCHC": 0,
  "costs": {
    "dataWarehouseId": "uuid",
    "serviceId": "uuid",
    "date": "date",
    "entityType": "string",
    "entityId": "uuid",
    "entityName": "string",
    "metrics": {
      "storageCHC": 0,
      "backupCHC": 0,
      "computeCHC": 0,
      "dataTransferCHC": 0,
      "publicDataTransferCHC": 0,
      "interRegionTier1DataTransferCHC": 0,
      "interRegionTier2DataTransferCHC": 0,
      "interRegionTier3DataTransferCHC": 0,
      "interRegionTier4DataTransferCHC": 0
    },
    "totalCHC": 0,
    "locked": "boolean"
  }
}
```
