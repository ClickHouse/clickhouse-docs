---
sidebar_label: 'UsageCost'
title: 'UsageCost'
slug: /cloud/manage/api/usageCost-api-reference
description: 'Cloud API reference documentation for usageCost'
---

## Get organization usage costs

Returns a grand total and a list of daily, per-entity organization usage cost records for the organization in the queried time period (maximum 31 days). All days in both the request and the response are evaluated based on the UTC timezone.

| Method | Path |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/usageCost` |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the requested organization. | 
| from_date | date-time | Start date for the report, e.g. 2024-12-19. | 
| to_date | date-time | End date (inclusive) for the report, e.g. 2024-12-20. This date cannot be more than 30 days after from_date (for a maximum queried period of 31 days). | 


### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| grandTotalCHC | number | Grand total cost of usage in ClickHouse Credits (CHCs). | 
| costs.dataWarehouseId | uuid | ID of the dataWarehouse this entity belongs to (or is). | 
| costs.serviceId | uuid | ID of the service this entity belongs to (or is). Set to null for dataWarehouse entities. | 
| costs.date | date | Date of the usage. ISO-8601 date, based on the UTC timezone. | 
| costs.entityType | string | Type of the entity. | 
| costs.entityId | uuid | Unique ID of the entity. | 
| costs.entityName | string | Name of the entity. | 
| costs.metrics.storageCHC | number | Cost of storage in ClickHouse Credits (CHCs). Applies to dataWarehouse entities. | 
| costs.metrics.backupCHC | number | Cost of backup in ClickHouse Credits (CHCs). Applies to dataWarehouse entities. | 
| costs.metrics.computeCHC | number | Cost of compute in ClickHouse Credits (CHCs). Applies to service and clickpipe entities. | 
| costs.metrics.dataTransferCHC | number | Cost of data transfer in ClickHouse Credits (CHCs). Applies to clickpipe entities. | 
| costs.metrics.publicDataTransferCHC | number | Cost of data transfer in ClickHouse Credits (CHCs). Applies to service entities. | 
| costs.metrics.interRegionTier1DataTransferCHC | number | Cost of tier1 inter-region data transfer in ClickHouse Credits (CHCs). Applies to service entities. | 
| costs.metrics.interRegionTier2DataTransferCHC | number | Cost of tier2 inter-region data transfer in ClickHouse Credits (CHCs). Applies to service entities. | 
| costs.metrics.interRegionTier3DataTransferCHC | number | Cost of tier3 inter-region data transfer in ClickHouse Credits (CHCs). Applies to service entities. | 
| costs.metrics.interRegionTier4DataTransferCHC | number | Cost of tier4 inter-region data transfer in ClickHouse Credits (CHCs). Applies to service entities. | 
| costs.totalCHC | number | Total cost of usage in ClickHouse Credits (CHCs) for this entity. | 
| costs.locked | boolean | When true, the record is immutable. Unlocked records are subject to change until locked. | 


#### Sample response

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
