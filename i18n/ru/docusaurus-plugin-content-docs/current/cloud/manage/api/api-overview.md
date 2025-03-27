---
sidebar_label: 'Обзор'
sidebar_position: 1
title: 'ClickHouse Cloud API'
slug: /cloud/manage/api/api-overview
description: 'Узнайте о ClickHouse Cloud API'
---


# ClickHouse Cloud API

## Обзор {#overview}

ClickHouse Cloud API — это REST API, предназначенный для разработчиков, чтобы легко управлять организациями и услугами на ClickHouse Cloud. С помощью нашего Cloud API вы можете создавать и управлять службами, предоставлять ключи API, добавлять или удалять участников вашей организации и многое другое.

[Узнайте, как создать ваш первый ключ API и начать использовать ClickHouse Cloud API.](/cloud/manage/openapi.md)

## Ограничения по запросам {#rate-limits}

Разработчики ограничены 100 ключами API на организацию. Каждый ключ API имеет лимит в 10 запросов за 10 секунд. Если вы хотите увеличить количество ключей API или запросов за 10 секунд для вашей организации, пожалуйста, свяжитесь с support@clickhouse.com

## Провайдер Terraform {#terraform-provider}

Официальный провайдер ClickHouse Terraform позволяет вам использовать [Инфраструктуру как код](https://www.redhat.com/en/topics/automation/what-is-infrastructure-as-code-iac) для создания предсказуемых, контролируемых по версиям конфигураций, что делает развертывания менее подвержёнными ошибкам.

Вы можете ознакомиться с документацией провайдера Terraform в [реестре Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs).

Если вы хотите внести вклад в провайдер ClickHouse Terraform, вы можете просмотреть исходный код [в репозитории GitHub](https://github.com/ClickHouse/terraform-provider-clickhouse).

## Swagger (OpenAPI) Конечная точка и интерфейс {#swagger-openapi-endpoint-and-ui}

ClickHouse Cloud API основан на общедоступной [спецификации OpenAPI](https://www.openapis.org/), чтобы обеспечить предсказуемое клиентское использование. Если вам нужно программно использовать документы ClickHouse Cloud API, мы предлагаем конечную точку Swagger на основе JSON по адресу https://api.clickhouse.cloud/v1. Наша документация по API автоматически генерируется из этой же конечной точки. Если вы предпочитаете использовать документацию API через интерфейс Swagger, пожалуйста, нажмите [здесь](https://clickhouse.com/docs/cloud/manage/api/swagger).

## Поддержка {#support}

Рекомендуем сначала посетить [наш канал Slack](https://clickhouse.com/slack) для быстрой поддержки. Если вам нужна дополнительная помощь или больше информации о нашем API и его возможностях, пожалуйста, свяжитесь со службой поддержки ClickHouse по адресу https://console.clickhouse.cloud/support
