---
sidebar_label: 'PrivateEndpointConfig'
title: 'PrivateEndpointConfig'
slug: /cloud/manage/api/privateEndpointConfig-api-reference
description: 'Cloud API reference documentation for privateEndpointConfig'
---

## Get private endpoint configuration for region within cloud provider for an organization

Information required to set up a private endpoint

| Method | Path |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/privateEndpointConfig` |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the requested organization. | 
| Cloud provider identifier | string | Cloud provider identifier. One of aws, gcp, or azure. | 
| Cloud provider region | string | Region identifier within specific cloud providers. | 


### Response

#### Response Schema

| Name | Type | Description |
| :--- | :--- | :---------- |
| endpointServiceId | string | Unique identifier of the interface endpoint you created in your VPC with the AWS(Service Name) or GCP(Target Service) resource | 


#### Sample response

```
{
  "endpointServiceId": "string"
}
```
