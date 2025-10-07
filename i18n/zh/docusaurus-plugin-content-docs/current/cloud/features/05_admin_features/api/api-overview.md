---
'sidebar_label': '概述'
'sidebar_position': 1
'title': 'ClickHouse Cloud API'
'slug': '/cloud/manage/api/api-overview'
'description': '了解 ClickHouse Cloud API'
'doc_type': 'reference'
---


# ClickHouse Cloud API

## 概述 {#overview}

ClickHouse Cloud API 是一个 REST API，旨在帮助开发人员轻松管理 ClickHouse Cloud 上的组织和服务。通过我们的 Cloud API，您可以创建和管理服务，配置 API 密钥，增减组织成员等。

[了解如何创建您的第一个 API 密钥并开始使用 ClickHouse Cloud API。](/cloud/manage/openapi)

## Swagger (OpenAPI) 端点和 UI {#swagger-openapi-endpoint-and-ui}

ClickHouse Cloud API 基于开源的 [OpenAPI 规范](https://www.openapis.org/) 构建，以实现可预测的客户端消费。如果您需要以编程方式获取 ClickHouse Cloud API 文档，我们提供基于 JSON 的 Swagger 端点，网址为 https://api.clickhouse.cloud/v1。您还可以通过 [Swagger UI](https://clickhouse.com/docs/cloud/manage/api/swagger) 找到 API 文档。

:::note 
如果您的组织已迁移至 [新定价计划](https://clickhouse.com/pricing?plan=scale&provider=aws&region=us-east-1&hours=8&storageCompressed=false)，并且您使用 OpenAPI，您将需要在服务创建的 `POST` 请求中删除 `tier` 字段。

`tier` 字段已从服务对象中移除，因为我们不再有服务层次。  
这将影响 `POST`、`GET` 和 `PATCH` 服务请求返回的对象。因此，任何使用这些 API 的代码可能需要调整以处理这些更改。
:::

## 限速 {#rate-limits}

每个组织的开发人员限制为 100 个 API 密钥。每个 API 密钥在 10 秒窗口内的请求限制为 10 次。如果您希望增加组织的 API 密钥数量或每 10 秒窗口内的请求数量，请联系 support@clickhouse.com

## Terraform 提供程序 {#terraform-provider}

官方 ClickHouse Terraform Provider 允许您使用 [基础设施即代码](https://www.redhat.com/en/topics/automation/what-is-infrastructure-as-code-iac) 创建可预测的、版本控制的配置，从而使部署过程更加不易出错。

您可以在 [Terraform 注册表](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs) 中查看 Terraform 提供程序文档。

如果您想为 ClickHouse Terraform Provider 贡献代码，可以在 [GitHub 仓库](https://github.com/ClickHouse/terraform-provider-clickhouse) 中查看源代码。

:::note 
如果您的组织已迁移至 [新定价计划](https://clickhouse.com/pricing?plan=scale&provider=aws&region=us-east-1&hours=8&storageCompressed=false)，您将需要使用我们的 [ClickHouse Terraform provider](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs) 版本 2.0.0 或以上。此升级是为了处理 `tier` 属性的更改，因为在定价迁移后，不再接受 `tier` 字段，且应移除对此字段的引用。

您现在还可以将 `num_replicas` 字段指定为服务资源的属性。
:::

## Terraform 和 OpenAPI 新定价：副本设置说明 {#terraform-and-openapi-new-pricing---replica-settings-explained}

每个服务的副本数在 Scale 和 Enterprise 层次默认为 3，而在 Basic 层次默认为 1。
对于 Scale 和 Enterprise 层次，可以通过在服务创建请求中传递 `numReplicas` 字段来进行调整。
`numReplicas` 字段的值必须在仓库中的第一个服务中介于 2 到 20 之间。在现有仓库中创建的服务的副本数可以低至 1。

## 支持 {#support}

我们建议您首先访问 [我们的 Slack 频道](https://clickhouse.com/slack) 以获得快速支持。如果您希望获得更多帮助或有关我们 API 及其功能的更多信息，请访问 ClickHouse 支持 https://console.clickhouse.cloud/support
