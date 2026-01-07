---
sidebar_label: '概览'
sidebar_position: 1
title: 'ClickHouse Cloud API'
slug: /cloud/manage/api/api-overview
description: '了解 ClickHouse Cloud API'
doc_type: 'reference'
keywords: ['ClickHouse Cloud', 'API 概览', '云 API', 'REST API', '编程式访问']
---

# ClickHouse Cloud API {#clickhouse-cloud-api}

## 概览 {#overview}

ClickHouse Cloud API 是为开发者设计的 REST API，便于在 ClickHouse Cloud 上轻松管理组织和服务。通过我们的 Cloud API，您可以创建和管理服务、创建和管理 API 密钥、在组织中添加或移除成员等。

[了解如何创建您的第一个 API 密钥并开始使用 ClickHouse Cloud API。](/cloud/manage/openapi)

## Swagger（OpenAPI）端点和 UI {#swagger-openapi-endpoint-and-ui}

ClickHouse Cloud API 基于开源的 [OpenAPI 规范](https://www.openapis.org/) 构建，以实现可预测的客户端调用行为。  
如果您需要以编程方式使用 ClickHouse Cloud API 文档，我们在 https://api.clickhouse.cloud/v1 提供了基于 JSON 的 Swagger 端点。您也可以通过 [Swagger UI](https://clickhouse.com/docs/cloud/manage/api/swagger) 查看 API 文档。

:::note 
如果您的组织已迁移到某个[新定价方案](https://clickhouse.com/pricing?plan=scale&provider=aws&region=us-east-1&hours=8&storageCompressed=false)，并且您使用 OpenAPI，那么在创建服务的 `POST` 请求中必须移除 `tier` 字段。

由于我们不再提供服务层级，`tier` 字段已从服务对象中移除。  
这将影响 `POST`、`GET` 和 `PATCH` 服务请求返回的对象。因此，任何调用这些 API 的代码都可能需要进行相应调整以适配这些变更。
:::

## 速率限制 {#rate-limits}

每个组织最多可以创建 100 个 API 密钥。每个 API 密钥在任意 10 秒时间窗口内最多可发送 10 个请求。如需为您的组织提升 API 密钥数量上限或每个 10 秒时间窗口内的请求上限，请联系 support@clickhouse.com。

## Terraform provider {#terraform-provider}

官方 ClickHouse Terraform Provider 允许你使用[基础设施即代码（Infrastructure as Code）](https://www.redhat.com/en/topics/automation/what-is-infrastructure-as-code-iac)
来创建可预测、可版本控制的配置，从而大幅降低部署过程中的出错风险。

你可以在 [Terraform registry](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs) 中查看 Terraform Provider 的文档。

如果你希望为 ClickHouse Terraform Provider 做出贡献，可以在 [GitHub 仓库中查看源代码](https://github.com/ClickHouse/terraform-provider-clickhouse)。

:::note 
如果你的组织已迁移到某个[新计费方案](https://clickhouse.com/pricing?plan=scale&provider=aws&region=us-east-1&hours=8&storageCompressed=false)，则需要使用我们的 [ClickHouse Terraform provider](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs) 2.0.0 或更高版本。此升级是为了处理服务中 `tier` 属性的变更，因为在计费迁移后，服务将不再接受 `tier` 字段，并且应移除对该字段的所有引用。

现在你还可以将 `num_replicas` 字段作为 service 资源的一个属性进行指定。
:::

## Terraform 和 OpenAPI 新定价：副本设置详解 {#terraform-and-openapi-new-pricing---replica-settings-explained}

在 Scale 和 Enterprise 层级中，每个服务在创建时的副本数默认是 3，而在 Basic 层级中默认是 1。
对于 Scale 和 Enterprise 层级，可以在服务创建请求中通过指定 `numReplicas` 字段来进行调整。
对于某个仓库中的第一个服务，`numReplicas` 字段的取值必须在 2 到 20 之间。而在现有仓库中创建的服务，其副本数量可以低至 1。

## 支持 {#support}

我们建议您优先通过[我们的 Slack 频道](https://clickhouse.com/slack)获取快速支持。  
如果您需要更多帮助，或想进一步了解我们的 API 及其功能，  
请联系 ClickHouse 支持团队：https://console.clickhouse.cloud/support
