--- 
sidebar_label: UsageCost
title: Usage cost
---

## Get organization usage costs

This is an experimental feature. Please contact support to enable it.

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
| costs |  |  | 

#### Sample response

```
{
  "grandTotalCHC": 0
}
```
