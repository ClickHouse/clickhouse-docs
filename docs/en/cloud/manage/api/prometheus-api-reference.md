---
sidebar_label: Prometheus
title: Prometheus
---

## Get organization details

Returns details of a single organization. In order to get the details, the auth key must belong to the organization.

| Method | Path |
| :----- | :--- |
| GET | /v1/organizations/{organizationId}/prometheus |

### Request

#### Path Params

| Name | Type | Description |
| :--- | :--- | :---------- |
| organizationId | uuid | ID of the requested organization. | 

