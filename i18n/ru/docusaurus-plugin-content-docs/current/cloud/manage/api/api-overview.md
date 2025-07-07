---
sidebar_label: 'Обзор'
sidebar_position: 1
title: 'ClickHouse Cloud API'
slug: /cloud/manage/api/api-overview
description: 'Узнайте о ClickHouse Cloud API'
---


# ClickHouse Cloud API

## Обзор {#overview}

ClickHouse Cloud API — это REST API, созданный для разработчиков, чтобы легко управлять 
организациями и услугами в ClickHouse Cloud. С помощью нашего Cloud API вы можете 
создавать и управлять услугами, предоставлять ключи доступа, добавлять или удалять участников в вашей 
организации и многое другое.

[Узнайте, как создать ваш первый ключ доступа и начать использовать ClickHouse Cloud API.](/cloud/manage/openapi.md)

## Swagger (OpenAPI) Endpoint и UI {#swagger-openapi-endpoint-and-ui}

ClickHouse Cloud API основан на открытой [спецификации OpenAPI](https://www.openapis.org/),
что позволяет предсказуемо использовать его на клиентской стороне. Если вам нужно 
программно использовать документацию ClickHouse Cloud API, мы предлагаем JSON-основной Swagger endpoint 
по адресу https://api.clickhouse.cloud/v1. Вы также можете найти документацию API через 
[Swagger UI](https://clickhouse.com/docs/cloud/manage/api/swagger).

## Лимиты запросов {#rate-limits}

Разработчикам разрешается использовать 100 ключей доступа на организацию. Каждый ключ доступа имеет 
лимит в 10 запросов за 10-секундный интервал. Если вы хотите увеличить 
количество ключей доступа или запросов на 10-секундный интервал для вашей организации, 
пожалуйста, свяжитесь с support@clickhouse.com

## Провайдер Terraform {#terraform-provider}

Официальный провайдер ClickHouse для Terraform позволяет вам использовать [Инфраструктуру как Код](https://www.redhat.com/en/topics/automation/what-is-infrastructure-as-code-iac)
для создания предсказуемых, контролируемых версий конфигураций, что значительно снижает вероятность ошибок 
при развертывании.

Вы можете просмотреть документацию провайдера Terraform в [реестре Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs).

Если вы хотите внести вклад в провайдер ClickHouse для Terraform, вы можете просмотреть 
исходный код [в репозитории на GitHub](https://github.com/ClickHouse/terraform-provider-clickhouse).

## Поддержка {#support}

Мы рекомендуем сначала посетить [наш канал в Slack](https://clickhouse.com/slack) для быстрого получения поддержки. Если 
вам нужна дополнительная помощь или больше информации о нашем API и его возможностях, 
пожалуйста, свяжитесь со службой поддержки ClickHouse на https://console.clickhouse.cloud/support
