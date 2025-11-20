---
sidebar_label: '概览'
sidebar_position: 1
title: 'ClickHouse Cloud API'
slug: /cloud/manage/api/api-overview
description: '了解 ClickHouse Cloud API'
doc_type: 'reference'
keywords: ['ClickHouse Cloud', 'API 概览', '云 API', 'REST API', '以编程方式访问']
---



# ClickHouse Cloud API



## 概述 {#overview}

ClickHouse Cloud API 是一个 REST API,旨在帮助开发者轻松管理 ClickHouse Cloud 上的组织和服务。通过使用 Cloud API,您可以创建和管理服务、配置 API 密钥、添加或删除组织成员等。

[了解如何创建您的第一个 API 密钥并开始使用 ClickHouse Cloud API。](/cloud/manage/openapi)


## Swagger (OpenAPI) 端点和 UI {#swagger-openapi-endpoint-and-ui}

ClickHouse Cloud API 基于开源的 [OpenAPI 规范](https://www.openapis.org/)构建,
以实现可预测的客户端调用。如果您需要以编程方式
访问 ClickHouse Cloud API 文档,我们通过 https://api.clickhouse.cloud/v1 提供基于 JSON 的 Swagger 端点。
您也可以通过 [Swagger UI](https://clickhouse.com/docs/cloud/manage/api/swagger) 查看 API 文档。

:::note
如果您的组织已迁移到[新定价方案](https://clickhouse.com/pricing?plan=scale&provider=aws&region=us-east-1&hours=8&storageCompressed=false)之一,并且您使用 OpenAPI,则需要在服务创建的 `POST` 请求中移除 `tier` 字段。

`tier` 字段已从服务对象中移除,因为我们不再提供服务层级。  
这将影响 `POST`、`GET` 和 `PATCH` 服务请求返回的对象。因此,使用这些 API 的代码可能需要相应调整以适应这些变更。
:::


## 速率限制 {#rate-limits}

每个组织最多可创建 100 个 API 密钥。每个 API 密钥在 10 秒时间窗口内最多可发起 10 次请求。如需提高组织的 API 密钥数量或 10 秒时间窗口内的请求次数限制,请联系 support@clickhouse.com


## Terraform provider {#terraform-provider}

官方 ClickHouse Terraform Provider 允许您使用[基础设施即代码](https://www.redhat.com/en/topics/automation/what-is-infrastructure-as-code-iac)来创建可预测的、版本受控的配置,从而大幅降低部署出错的风险。

您可以在 [Terraform 注册表](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs)中查看 Terraform provider 文档。

如果您想为 ClickHouse Terraform Provider 做出贡献,可以在 [GitHub 仓库](https://github.com/ClickHouse/terraform-provider-clickhouse)中查看源代码。

:::note
如果您的组织已迁移到[新定价方案](https://clickhouse.com/pricing?plan=scale&provider=aws&region=us-east-1&hours=8&storageCompressed=false)之一,您需要使用 [ClickHouse Terraform provider](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs) 2.0.0 或更高版本。此升级是必需的,以处理服务 `tier` 属性的变更,因为在定价迁移后,`tier` 字段不再被接受,应删除对它的引用。

现在您还可以将 `num_replicas` 字段指定为服务资源的属性。
:::


## Terraform 和 OpenAPI 新定价:副本设置说明 {#terraform-and-openapi-new-pricing---replica-settings-explained}

每个服务创建时的默认副本数量:Scale 和 Enterprise 层级为 3 个,Basic 层级为 1 个。
对于 Scale 和 Enterprise 层级,可以在服务创建请求中通过传递 `numReplicas` 字段来调整副本数量。
对于仓库中的首个服务,`numReplicas` 字段的值必须介于 2 到 20 之间。在已有仓库中创建的服务,副本数量最少可设置为 1 个。


## 支持 {#support}

我们建议首先访问 [我们的 Slack 频道](https://clickhouse.com/slack) 以获取快速支持。如果您需要更多帮助或想了解我们 API 及其功能的更多信息,请通过 https://console.clickhouse.cloud/support 联系 ClickHouse 支持团队
