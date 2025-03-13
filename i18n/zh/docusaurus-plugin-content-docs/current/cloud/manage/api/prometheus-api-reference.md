---
sidebar_label: Prometheus
title: Prometheus
---

## 获取组织指标

返回组织中所有服务的 Prometheus 指标。

| 方法 | 路径 |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/prometheus` |

### 请求

#### 路径参数

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| organizationId | uuid | 请求的组织 ID。 | 
| filtered_metrics | boolean | 返回 Prometheus 指标的过滤列表。 | 
