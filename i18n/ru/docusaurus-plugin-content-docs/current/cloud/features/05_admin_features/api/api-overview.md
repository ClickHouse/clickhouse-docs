---
sidebar_label: 'Обзор'
sidebar_position: 1
title: 'API ClickHouse Cloud'
slug: /cloud/manage/api/api-overview
description: 'Сведения об API ClickHouse Cloud'
doc_type: 'reference'
keywords: ['ClickHouse Cloud', 'обзор API', 'облачный API', 'REST API', 'программный доступ']
---

# API ClickHouse Cloud \{#clickhouse-cloud-api\}

## Обзор \{#overview\}

ClickHouse Cloud API — это REST API, предназначенный для разработчиков и упрощающий управление 
организациями и сервисами в ClickHouse Cloud. С помощью Cloud API вы можете 
создавать и управлять сервисами, выдавать API-ключи, добавлять или удалять участников вашей 
организации и многое другое.

[Узнайте, как создать свой первый API-ключ и начать использовать ClickHouse Cloud API.](/cloud/manage/openapi)

## Конечная точка и интерфейс Swagger (OpenAPI) \{#swagger-openapi-endpoint-and-ui\}

API ClickHouse Cloud построен на основе открытой [спецификации OpenAPI](https://www.openapis.org/),
что обеспечивает предсказуемое использование на стороне клиента. Если вам нужно
программно обращаться к документации API ClickHouse Cloud, мы предлагаем Swagger-эндпоинт,
возвращающий JSON, по адресу https://api.clickhouse.cloud/v1. Вы также можете ознакомиться с документацией по API через
[интерфейс Swagger UI](https://clickhouse.com/docs/cloud/manage/api/swagger).

:::note 
Если ваша организация была переведена на один из [новых тарифных планов](https://clickhouse.com/pricing?plan=scale&provider=aws&region=us-east-1&hours=8&storageCompressed=false) и вы используете OpenAPI, вам потребуется удалить поле `tier` из `POST`‑запроса на создание сервиса.

Поле `tier` было удалено из объекта сервиса, так как у нас больше нет уровней сервисов.  
Это повлияет на объекты, возвращаемые запросами `POST`, `GET` и `PATCH` для сервисов. Поэтому любой код, который использует этот API, может потребовать доработки для корректной обработки этих изменений.
:::

## Лимиты \{#rate-limits\}

Для разработчиков установлено ограничение — не более 100 API‑ключей на организацию. Каждый API‑ключ имеет лимит в 10 запросов за 10 секунд. Если вы хотите увеличить количество API‑ключей или число запросов в 10‑секундное окно для вашей организации, свяжитесь с support@clickhouse.com.

## Провайдер Terraform \{#terraform-provider\}

Официальный провайдер Terraform для ClickHouse позволяет использовать [инфраструктуру как код (Infrastructure as Code)](https://www.redhat.com/en/topics/automation/what-is-infrastructure-as-code-iac)
для создания предсказуемых конфигураций с контролем версий, что делает развертывания
значительно менее подверженными ошибкам.

Документацию по провайдеру Terraform можно найти в [реестре Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs).

Если вы хотите внести вклад в развитие провайдера Terraform для ClickHouse, вы можете просмотреть 
его исходный код [в репозитории GitHub](https://github.com/ClickHouse/terraform-provider-clickhouse).

:::note 
Если ваша организация была переведена на один из [новых тарифных планов](https://clickhouse.com/pricing?plan=scale&provider=aws&region=us-east-1&hours=8&storageCompressed=false), вам потребуется использовать наш [провайдер ClickHouse Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs) версии 2.0.0 или новее. Это обновление необходимо для обработки изменений атрибута `tier` сервиса, поскольку после миграции тарифов поле `tier` больше не принимается и все ссылки на него должны быть удалены.

Теперь вы также сможете указывать поле `num_replicas` как свойство ресурса сервиса.
:::

## Terraform и OpenAPI: новое ценообразование и настройки реплик \{#terraform-and-openapi-new-pricing---replica-settings-explained\}

Число реплик, с которым создаётся каждый сервис, по умолчанию равно 3 для тарифов Scale и Enterprise и 1 для тарифа Basic.
Для тарифов Scale и Enterprise его можно изменить, передав поле `numReplicas` в запросе на создание сервиса. 
Значение поля `numReplicas` для первого сервиса в хранилище должно быть от 2 до 20. Сервисы, которые создаются в уже существующем хранилище, могут иметь не менее 1 реплики.

## Поддержка \{#support\}

Мы рекомендуем сначала обратиться в [наш канал в Slack](https://clickhouse.com/slack), чтобы получить оперативную поддержку. Если 
вам нужна дополнительная помощь или дополнительная информация о нашем API и его возможностях, 
пожалуйста, свяжитесь со службой поддержки ClickHouse по ссылке https://console.clickhouse.cloud/support.
