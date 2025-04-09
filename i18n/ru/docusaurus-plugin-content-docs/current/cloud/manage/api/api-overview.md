---
sidebar_label: 'Обзор'
sidebar_position: 1
title: 'ClickHouse Cloud API'
slug: /cloud/manage/api/api-overview
description: 'Узнайте о ClickHouse Cloud API'
---


# ClickHouse Cloud API

## Обзор {#overview}

ClickHouse Cloud API — это REST API, предназначенный для разработчиков, позволяющий легко управлять организациями и сервисами в ClickHouse Cloud. С помощью нашего Cloud API вы можете создавать и управлять сервисами, предоставлять ключи доступа, добавлять или удалять участников в своей организации и многое другое.

[Узнайте, как создать свой первый ключ доступа и начать использовать ClickHouse Cloud API.](/cloud/manage/openapi.md)

## Лимиты Запросов {#rate-limits}

Для разработчиков установлен лимит в 100 ключей доступа на организацию. Каждый ключ доступа имеет лимит в 10 запросов в течение 10 секунд. Если вы хотите увеличить количество ключей доступа или запросов на 10 секунд для вашей организации, пожалуйста, свяжитесь со службой поддержки по адресу support@clickhouse.com.

## Провайдер Terraform {#terraform-provider}

Официальный провайдер ClickHouse для Terraform позволяет вам использовать [Инфраструктуру как код](https://www.redhat.com/en/topics/automation/what-is-infrastructure-as-code-iac) для создания предсказуемых конфигураций под версионным контролем, что значительно снижает вероятность ошибок при развертывании.

Вы можете ознакомиться с документацией провайдера Terraform в [реестре Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs).

Если вы хотите внести свой вклад в провайдер ClickHouse для Terraform, вы можете просмотреть исходный код [в репозитории GitHub](https://github.com/ClickHouse/terraform-provider-clickhouse).

## Swagger (OpenAPI) Конечная Точка и UI {#swagger-openapi-endpoint-and-ui}

ClickHouse Cloud API построен на открытой [спецификации OpenAPI](https://www.openapis.org/) для обеспечения предсказуемого потребления на стороне клиента. Если вам нужно программно использовать документацию ClickHouse Cloud API, мы предлагаем JSON-ориентированную конечную точку Swagger по адресу https://api.clickhouse.cloud/v1. Наша документация API Reference автоматически генерируется из той же конечной точки. Если вы предпочитаете получать документы API через интерфейс Swagger UI, пожалуйста, нажмите [здесь](https://clickhouse.com/docs/cloud/manage/api/swagger).

## Поддержка {#support}

Мы рекомендуем в первую очередь посетить [наш Slack канал](https://clickhouse.com/slack) для получения быстрой поддержки. Если вам нужна дополнительная помощь или более подробная информация о нашем API и его возможностях, пожалуйста, свяжитесь со службой поддержки ClickHouse по адресу https://console.clickhouse.cloud/support.
