---
'sidebar_label': '概述'
'sidebar_position': 1
'title': 'ClickHouse Cloud API'
'slug': '/cloud/manage/api/api-overview'
'description': '了解 ClickHouse Cloud API'
---


# ClickHouse Cloud API

## 概述 {#overview}

ClickHouse Cloud API 是一个 REST API，旨在帮助开发人员轻松管理 ClickHouse Cloud 上的组织和服务。使用我们的 Cloud API，您可以创建和管理服务，配置 API 密钥，添加或删除组织中的成员，等等。

[了解如何创建您的第一个 API 密钥并开始使用 ClickHouse Cloud API.](/cloud/manage/openapi.md)

## Swagger (OpenAPI) 端点和用户界面 {#swagger-openapi-endpoint-and-ui}

ClickHouse Cloud API 基于开源 [OpenAPI 规范](https://www.openapis.org/) 构建，以便于可预测的客户端消费。如果您需要以编程方式消费 ClickHouse Cloud API 文档，我们提供了一个基于 JSON 的 Swagger 端点，网址为 https://api.clickhouse.cloud/v1。您还可以通过 [Swagger UI](https://clickhouse.com/docs/cloud/manage/api/swagger) 查找 API 文档。

## 速率限制 {#rate-limits}

每个组织的开发人员最多只能有 100 个 API 密钥。每个 API 密钥在 10 秒窗口内限制为 10 次请求。如果您希望增加您组织的 API 密钥数量或每 10 秒窗口内的请求次数，请联系 support@clickhouse.com。

## Terraform 提供者 {#terraform-provider}

官方的 ClickHouse Terraform 提供者让您能够使用 [基础设施即代码](https://www.redhat.com/en/topics/automation/what-is-infrastructure-as-code-iac) 创建可预测、版本控制的配置，从而使部署出错的可能性大大降低。

您可以在 [Terraform 注册表](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs) 中查看 Terraform 提供者的文档。

如果您希望为 ClickHouse Terraform 提供者做出贡献，可以在 [GitHub 仓库](https://github.com/ClickHouse/terraform-provider-clickhouse) 中查看源代码。

## 支持 {#support}

我们推荐您首先访问 [我们的 Slack 频道](https://clickhouse.com/slack) 来获得快速支持。如果您需要额外的帮助或有关我们 API 及其功能的更多信息，请通过 https://console.clickhouse.cloud/support 联系 ClickHouse 支持。
