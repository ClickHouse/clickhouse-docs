---
sidebar_label: '私有端点配置'
title: '私有端点配置'
---

## 获取云服务提供商中某个组织的区域的私有端点配置

设置私有端点所需的信息

| 方法 | 路径 |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/privateEndpointConfig` |

### 请求

#### 路径参数

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| organizationId | uuid | 请求的组织的 ID。 | 
| 云服务提供商标识符 | string | 云服务提供商的标识符。可以是 aws、gcp 或 azure。 | 
| 云服务提供商区域 | string | 特定云服务提供商内的区域标识符。 | 


### 响应

#### 响应结构

| 名称 | 类型 | 描述 |
| :--- | :--- | :---------- |
| endpointServiceId | string | 您在 VPC 中与 AWS（服务名称）或 GCP（目标服务）资源创建的接口端点的唯一标识符。 | 


#### 示例响应

```
{
  "endpointServiceId": "string"
}
```
