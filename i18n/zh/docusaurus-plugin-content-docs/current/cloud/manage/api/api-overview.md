---
'sidebar_label': '概述'
'sidebar_position': 1
'title': 'ClickHouse Cloud API'
'slug': '/cloud/manage/api/api-overview'
'description': '了解 ClickHouse Cloud API'
---




# ClickHouse Cloud API

## 概述 {#overview}

ClickHouse Cloud API 是一个 REST API，旨在帮助开发人员轻松管理 
ClickHouse Cloud 上的组织和服务。通过我们的 Cloud API，您可以 
创建和管理服务，分配 API 密钥，添加或移除组织中的成员，等等。

[了解如何创建您的第一个 API 密钥并开始使用 ClickHouse Cloud API。](/cloud/manage/openapi.md)

## Swagger (OpenAPI) 端点和用户界面 {#swagger-openapi-endpoint-and-ui}

ClickHouse Cloud API 构建在开源的 [OpenAPI 规范](https://www.openapis.org/) 上， 
以实现可预测的客户端消费。如果您需要以编程方式消费 ClickHouse Cloud API 文档，我们提供一个基于 JSON 的 Swagger 端点， 
通过 https://api.clickhouse.cloud/v1。您还可以通过 
[Swagger UI](https://clickhouse.com/docs/cloud/manage/api/swagger) 找到 API 文档。

## 速率限制 {#rate-limits}

每个组织的开发人员最多可拥有 100 个 API 密钥。每个 API 密钥在 10 秒窗口内的请求限制为 10 次。如果您希望增加 
组织的 API 密钥或每 10 秒窗口的请求数量，请联系 support@clickhouse.com。

## Terraform 提供程序 {#terraform-provider}

官方的 ClickHouse Terraform 提供程序允许您使用 [基础设施即代码](https://www.redhat.com/en/topics/automation/what-is-infrastructure-as-code-iac) 
来创建可预测的、版本控制的配置，从而使部署更不容易出错。

您可以在 [Terraform 注册表](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs) 中查看 Terraform 提供程序文档。

如果您想为 ClickHouse Terraform 提供程序做出贡献，可以在 [GitHub 仓库](https://github.com/ClickHouse/terraform-provider-clickhouse) 中查看源代码。

## 支持 {#support}

我们建议您首先访问 [我们的 Slack 频道](https://clickhouse.com/slack) 以获得快速支持。如果 
您需要更多帮助或关于我们 API 及其功能的更多信息， 
请通过 https://console.clickhouse.cloud/support 联系 ClickHouse 支持。
