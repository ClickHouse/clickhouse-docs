---
sidebar_label: Prometheus
title: Prometheus
---

## Get organization metrics {#get-organization-metrics}

Returns prometheus metrics for all services in an organization.

| Method | Path |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/prometheus` |

### Request {#request}

#### Path Params {#path-params}

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the requested organization. | 
| filtered_metrics | boolean | Return a filtered list of Prometheus metrics. | 

