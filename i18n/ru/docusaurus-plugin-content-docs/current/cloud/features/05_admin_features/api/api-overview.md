---
sidebar_label: 'Обзор'
sidebar_position: 1
title: 'API ClickHouse Cloud'
slug: /cloud/manage/api/api-overview
description: 'Подробнее об API ClickHouse Cloud'
doc_type: 'reference'
keywords: ['ClickHouse Cloud', 'обзор API', 'облачный API', 'REST API', 'программный доступ']
---



# API ClickHouse Cloud



## Обзор {#overview}

ClickHouse Cloud API — это REST API, предназначенный для упрощения управления
организациями и сервисами в ClickHouse Cloud. С помощью Cloud API вы можете
создавать сервисы и управлять ими, генерировать API-ключи, добавлять или удалять участников
организации и выполнять другие операции.

[Узнайте, как создать первый API-ключ и начать работу с ClickHouse Cloud API.](/cloud/manage/openapi)


## Конечная точка и интерфейс Swagger (OpenAPI) {#swagger-openapi-endpoint-and-ui}

API ClickHouse Cloud построен на основе открытой [спецификации OpenAPI](https://www.openapis.org/)
для обеспечения предсказуемого использования на стороне клиента. Если вам необходимо программно
работать с документацией API ClickHouse Cloud, мы предоставляем конечную точку Swagger на основе JSON
по адресу https://api.clickhouse.cloud/v1. Документацию API также можно найти через
[интерфейс Swagger UI](https://clickhouse.com/docs/cloud/manage/api/swagger).

:::note
Если ваша организация была переведена на один из [новых тарифных планов](https://clickhouse.com/pricing?plan=scale&provider=aws&region=us-east-1&hours=8&storageCompressed=false) и вы используете OpenAPI, вам необходимо удалить поле `tier` из `POST`-запроса на создание сервиса.

Поле `tier` было удалено из объекта сервиса, так как уровни сервиса больше не используются.  
Это повлияет на объекты, возвращаемые запросами `POST`, `GET` и `PATCH` к сервису. Поэтому любой код, использующий эти API, может потребовать корректировки для обработки этих изменений.
:::


## Ограничения частоты запросов {#rate-limits}

Для разработчиков установлено ограничение в 100 API-ключей на организацию. Для каждого API-ключа действует лимит в 10 запросов в течение 10-секундного интервала. Если вам необходимо увеличить количество API-ключей или лимит запросов в течение 10-секундного интервала для вашей организации, обратитесь в службу поддержки по адресу support@clickhouse.com


## Провайдер Terraform {#terraform-provider}

Официальный провайдер Terraform для ClickHouse позволяет использовать подход [Infrastructure as Code](https://www.redhat.com/en/topics/automation/what-is-infrastructure-as-code-iac)
для создания предсказуемых конфигураций с контролем версий, что значительно снижает
вероятность ошибок при развертывании.

Документацию по провайдеру Terraform можно найти в [реестре Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs).

Если вы хотите внести вклад в развитие провайдера Terraform для ClickHouse, исходный код
доступен [в репозитории GitHub](https://github.com/ClickHouse/terraform-provider-clickhouse).

:::note
Если ваша организация была переведена на один из [новых тарифных планов](https://clickhouse.com/pricing?plan=scale&provider=aws&region=us-east-1&hours=8&storageCompressed=false), необходимо использовать [провайдер Terraform для ClickHouse](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs) версии 2.0.0 или выше. Это обновление требуется для корректной обработки изменений в атрибуте `tier` сервиса, поскольку после миграции на новые тарифы поле `tier` больше не поддерживается, и все ссылки на него должны быть удалены.

Теперь также можно указывать поле `num_replicas` в качестве свойства ресурса сервиса.
:::


## Новые цены Terraform и OpenAPI: объяснение настроек реплик {#terraform-and-openapi-new-pricing---replica-settings-explained}

Количество реплик, с которым создаётся каждый сервис, по умолчанию составляет 3 для тарифов Scale и Enterprise и 1 для тарифа Basic.
Для тарифов Scale и Enterprise это значение можно изменить, указав поле `numReplicas` в запросе на создание сервиса.
Значение поля `numReplicas` для первого сервиса в хранилище должно быть в диапазоне от 2 до 20. Сервисы, создаваемые в существующем хранилище, могут иметь от 1 реплики.


## Поддержка {#support}

Рекомендуем сначала посетить [наш канал в Slack](https://clickhouse.com/slack) для получения быстрой поддержки. Если
вам нужна дополнительная помощь или более подробная информация о нашем API и его возможностях,
обратитесь в службу поддержки ClickHouse по адресу https://console.clickhouse.cloud/support
