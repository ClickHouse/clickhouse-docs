---
sidebar_label: PrivateEndpointConfig
title: PrivateEndpointConfig
---

## Get private endpoint configuration for region within cloud provider for an organization {#get-private-endpoint-configuration-for-region-within-cloud-provider-for-an-organization}

Information required to set up a private endpoint

| Method | Path |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/privateEndpointConfig` |

### Request {#request}

#### Path Params {#path-params}

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the requested organization. | 
| Cloud provider identifier | string | Cloud provider identifier. One of aws, gcp, or azure. | 
| Cloud provider region | string | Region identifier within specific cloud providers. | 


### Response {#response}

#### Response Schema {#response-schema}

| Name | Type | Description |
| :--- | :--- | :---------- |
| endpointServiceId | string | Unique identifier of the interface endpoint you created in your VPC with the AWS(Service Name) or GCP(Target Service) resource | 

#### Sample response {#sample-response}

```
{
  "endpointServiceId": "string"
}
```
