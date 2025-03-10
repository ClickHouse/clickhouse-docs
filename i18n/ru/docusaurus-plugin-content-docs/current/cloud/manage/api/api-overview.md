---
sidebar_label: 'Обзор'
sidebar_position: 1
---


# ClickHouse Cloud API

## Обзор {#overview}

ClickHouse Cloud API — это REST API, предназначенное для разработчиков, чтобы легко управлять организациями и сервисами в ClickHouse Cloud. С помощью нашего Cloud API вы можете создавать и управлять сервисами, предоставлять API ключи, добавлять или удалять участников вашей организации и многое другое.

[Узнайте, как создать ваш первый API ключ и начать использовать ClickHouse Cloud API.](/cloud/manage/openapi.md)

## Лимиты на запросы {#rate-limits}

Разработчики ограничены 100 API ключами на организацию. Каждый API ключ имеет лимит в 10 запросов за 10-секундный интервал. Если вы хотите увеличить количество API ключей или запросов за 10-секундный интервал для вашей организации, пожалуйста, свяжитесь с support@clickhouse.com

## Провайдер Terraform {#terraform-provider}

Официальный провайдер ClickHouse для Terraform позволяет использовать [Инфраструктуру как код](https://www.redhat.com/en/topics/automation/what-is-infrastructure-as-code-iac) для создания предсказуемых, контролируемых по версиям конфигураций, которые делают развертывание менее подверженным ошибкам.

Вы можете посмотреть документацию по провайдеру Terraform в [реестре Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs).

Если вы хотите внести вклад в провайдер ClickHouse для Terraform, вы можете просмотреть исходный код [в репозитории GitHub](https://github.com/ClickHouse/terraform-provider-clickhouse).

## Swagger (OpenAPI) эндпоинт и интерфейс {#swagger-openapi-endpoint-and-ui}

ClickHouse Cloud API построен на основе открытой [спецификации OpenAPI](https://www.openapis.org/), чтобы обеспечить предсказуемое потребление на стороне клиента. Если вам нужно программно потреблять документацию ClickHouse Cloud API, мы предлагаем JSON-эндпоинт Swagger по адресу https://api.clickhouse.cloud/v1. Наша документация API Reference автоматически генерируется из того же эндпоинта. Если вы предпочитаете потреблять документацию API через интерфейс Swagger, пожалуйста, нажмите [здесь](https://clickhouse.com/docs/cloud/manage/api/swagger).

## Поддержка {#support}

Мы рекомендуем сначала посетить [наш канал в Slack](https://clickhouse.com/slack) для получения быстрой поддержки. Если вам нужна дополнительная помощь или больше информации о нашем API и его возможностях, пожалуйста, свяжитесь с поддержкой ClickHouse по адресу https://console.clickhouse.cloud/support
