---
sidebar_label: Overview
sidebar_position: 1
---

# ClickHouse Cloud API

## Overview

The ClickHouse Cloud API is a REST API designed for developers to easily manage organizations and services on ClickHouse Cloud. Using our Cloud API, you can create and manage services, provision API keys, add or remove members in your organization, and more.

[Learn how to create your first API key and start using the ClickHouse Cloud API.](/docs/en/cloud/manage/openapi.md)

## Rate Limits

Developers are limited to 100 API keys per organization. Each API key has a limit of 10 requests over a 10-second window. If you'd like to increase the number of API keys or requests per 10-second window for your organization, please contact support@clickhouse.com

## Terraform Provider

The official ClickHouse Terraform Provider lets you use [Infrastructure as Code](https://www.redhat.com/en/topics/automation/what-is-infrastructure-as-code-iac) to create predictable, version-controlled configurations to make deployments much less error-prone.

You can view the Terraform provider docs in the [Terraform registry](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs).

If you'd like to contribute to the ClickHouse Terraform Provider, you can view the source [in the GitHub repo](https://github.com/ClickHouse/terraform-provider-clickhouse).

## Swagger (OpenAPI) Endpoint and UI

The ClickHouse Cloud API is built on the open-source [OpenAPI specification](https://www.openapis.org/) to allow for predictable client-side consumption. If you need to programmatically consume the ClickHouse Cloud API docs, we offer a JSON-based Swagger endpoint via https://api.clickhouse.cloud/v1. Our API Reference docs are automatically generated from that same endpoint. If you prefer to consume the API docs via the Swagger UI, please click [here](https://clickhouse.com/docs/en/cloud/manage/api/swagger).

## Support

We recommend visiting [our Slack channel](https://clickhouse.com/slack) first to get quick support. If you'd like additional help or more info about our API and its capabilities, please contact ClickHouse Support at https://clickhouse.cloud/support
