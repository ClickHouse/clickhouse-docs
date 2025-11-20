---
sidebar_label: 'Обзор'
sidebar_position: 1
title: 'API ClickHouse Cloud'
slug: /cloud/manage/api/api-overview
description: 'Ознакомьтесь с API ClickHouse Cloud'
doc_type: 'reference'
keywords: ['ClickHouse Cloud', 'обзор API', 'облачный API', 'REST API', 'программный доступ']
---



# API ClickHouse Cloud



## Overview {#overview}

ClickHouse Cloud API — это REST API, предназначенный для разработчиков и позволяющий легко управлять
организациями и сервисами в ClickHouse Cloud. С помощью Cloud API вы можете
создавать сервисы и управлять ими, создавать API-ключи, добавлять или удалять участников
организации и выполнять другие операции.

[Узнайте, как создать первый API-ключ и начать работу с ClickHouse Cloud API.](/cloud/manage/openapi)


## Конечная точка и UI Swagger (OpenAPI) {#swagger-openapi-endpoint-and-ui}

API ClickHouse Cloud построен на основе открытой [спецификации OpenAPI](https://www.openapis.org/)
для обеспечения предсказуемого использования на стороне клиента. Если вам необходимо программно
работать с документацией API ClickHouse Cloud, мы предоставляем конечную точку Swagger на основе JSON
по адресу https://api.clickhouse.cloud/v1. Документацию API также можно найти через
[Swagger UI](https://clickhouse.com/docs/cloud/manage/api/swagger).

:::note
Если ваша организация была переведена на один из [новых тарифных планов](https://clickhouse.com/pricing?plan=scale&provider=aws&region=us-east-1&hours=8&storageCompressed=false) и вы используете OpenAPI, вам потребуется удалить поле `tier` из `POST`-запроса на создание сервиса.

Поле `tier` было удалено из объекта сервиса, поскольку уровни обслуживания больше не используются.  
Это повлияет на объекты, возвращаемые запросами `POST`, `GET` и `PATCH` для сервисов. Поэтому любой код, использующий эти API, может потребовать корректировки для обработки этих изменений.
:::


## Ограничения частоты запросов {#rate-limits}

Для разработчиков установлено ограничение в 100 API-ключей на организацию. Для каждого API-ключа действует лимит в 10 запросов за 10-секундный интервал. Если вам необходимо увеличить количество API-ключей или лимит запросов за 10-секундный интервал для вашей организации, обратитесь в службу поддержки по адресу support@clickhouse.com


## Провайдер Terraform {#terraform-provider}

Официальный провайдер ClickHouse для Terraform позволяет использовать подход [Infrastructure as Code](https://www.redhat.com/en/topics/automation/what-is-infrastructure-as-code-iac)
для создания предсказуемых конфигураций с контролем версий, что значительно снижает
вероятность ошибок при развертывании.

Документацию провайдера Terraform можно найти в [реестре Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs).

Если вы хотите внести вклад в развитие провайдера ClickHouse для Terraform, исходный код
доступен [в репозитории на GitHub](https://github.com/ClickHouse/terraform-provider-clickhouse).

:::note
Если ваша организация была переведена на один из [новых тарифных планов](https://clickhouse.com/pricing?plan=scale&provider=aws&region=us-east-1&hours=8&storageCompressed=false), необходимо использовать [провайдер ClickHouse для Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs) версии 2.0.0 или выше. Это обновление требуется для корректной обработки изменений в атрибуте `tier` сервиса, поскольку после миграции на новые тарифы поле `tier` больше не поддерживается, и все ссылки на него должны быть удалены.

Теперь вы также можете указывать поле `num_replicas` в качестве свойства ресурса сервиса.
:::


## Новые цены Terraform и OpenAPI: настройки реплик {#terraform-and-openapi-new-pricing---replica-settings-explained}

По умолчанию каждый сервис создается с 3 репликами для тарифов Scale и Enterprise и с 1 репликой для тарифа Basic.
Для тарифов Scale и Enterprise можно изменить это значение, указав поле `numReplicas` в запросе на создание сервиса.
Значение поля `numReplicas` для первого сервиса в хранилище должно быть в диапазоне от 2 до 20. Сервисы, создаваемые в существующем хранилище, могут иметь от 1 реплики.


## Поддержка {#support}

Для получения быстрой поддержки рекомендуем сначала посетить [наш канал в Slack](https://clickhouse.com/slack). Если
вам нужна дополнительная помощь или подробная информация о нашем API и его возможностях,
обратитесь в службу поддержки ClickHouse по адресу https://console.clickhouse.cloud/support
