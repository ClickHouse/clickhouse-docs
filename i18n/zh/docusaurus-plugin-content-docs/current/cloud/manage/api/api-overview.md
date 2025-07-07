---
'sidebar_label': '概述'
'sidebar_position': 1
'title': 'ClickHouse Cloud API'
'slug': '/cloud/manage/api/api-overview'
'description': '了解 ClickHouse Cloud API'
---


# ClickHouse Cloud API

## 概述 {#overview}

ClickHouse Cloud API 是一个 REST API，旨在帮助开发者轻松管理 ClickHouse Cloud 上的组织和服务。使用我们的 Cloud API，您可以创建和管理服务、配置 API 密钥、添加或移除您组织中的成员等等。

[了解如何创建您的第一个 API 密钥并开始使用 ClickHouse Cloud API.](/cloud/manage/openapi.md)

## Swagger (OpenAPI) 端点和 UI {#swagger-openapi-endpoint-and-ui}

ClickHouse Cloud API 基于开源的 [OpenAPI 规范](https://www.openapis.org/) 构建，以便于可预测的客户端消费。如果您需要以编程方式访问 ClickHouse Cloud API 文档，我们提供一个基于 JSON 的 Swagger 端点，网址为 https://api.clickhouse.cloud/v1。您还可以通过 [Swagger UI](https://clickhouse.com/docs/cloud/manage/api/swagger) 查找 API 文档。

## 速率限制 {#rate-limits}

每个组织的开发者最多可以拥有 100 个 API 密钥。每个 API 密钥在 10 秒内最多可以发起 10 次请求。如果您希望增加组织的 API 密钥数量或每 10 秒内的请求次数，请联系 support@clickhouse.com。

## Terraform 提供者 {#terraform-provider}

官方的 ClickHouse Terraform 提供者允许您使用 [基础设施即代码](https://www.redhat.com/en/topics/automation/what-is-infrastructure-as-code-iac) 来创建可预测的、版本控制的配置，从而使部署的错误率大大降低。

您可以在 [Terraform 注册表](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs) 中查看 Terraform 提供者文档。

如果您想为 ClickHouse Terraform 提供者做贡献，可以在 [GitHub 存储库](https://github.com/ClickHouse/terraform-provider-clickhouse) 中查看源代码。

## 支持 {#support}

我们建议您首先访问 [我们的 Slack 频道](https://clickhouse.com/slack) 获取快速支持。如果您需要额外的帮助或有关我们 API 及其功能的更多信息，请联系 ClickHouse 支持，网址为 https://console.clickhouse.cloud/support
