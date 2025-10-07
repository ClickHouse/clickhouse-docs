---
'sidebar_label': 'Обзор'
'sidebar_position': 1
'title': 'ClickHouse Cloud API'
'slug': '/cloud/manage/api/api-overview'
'description': 'Узнайте о ClickHouse Cloud API'
'doc_type': 'reference'
---
# ClickHouse Cloud API

## Обзор {#overview}

ClickHouse Cloud API — это REST API, который предназначен для разработчиков, чтобы они могли легко управлять организациями и сервисами в ClickHouse Cloud. С помощью нашего Cloud API вы можете создавать и управлять сервисами, предоставлять ключи доступа, добавлять или удалять участников в вашей организации и многое другое.

[Узнайте, как создать свой первый ключ API и начать использовать ClickHouse Cloud API.](/cloud/manage/openapi)

## Эндпойнт и интерфейс Swagger (OpenAPI) {#swagger-openapi-endpoint-and-ui}

ClickHouse Cloud API основан на [спецификации OpenAPI](https://www.openapis.org/), что позволяет предсказуемо потреблять его с клиентской стороны. Если вам нужно программно
использовать документацию ClickHouse Cloud API, мы предоставляем JSON-эндпойнт Swagger по адресу https://api.clickhouse.cloud/v1. Вы также можете найти документацию API через
[интерфейс Swagger](https://clickhouse.com/docs/cloud/manage/api/swagger).

:::note 
Если ваша организация была переведена на один из [новых тарифных планов](https://clickhouse.com/pricing?plan=scale&provider=aws&region=us-east-1&hours=8&storageCompressed=false), и вы используете OpenAPI, вам потребуется удалить поле `tier` из запроса `POST` на создание сервиса.

Поле `tier` было удалено из объекта сервиса, так как у нас больше нет уровней сервиса.  
Это повлияет на объекты, возвращаемые запросами `POST`, `GET` и `PATCH` на сервис. Поэтому любой код, который использует эти API, возможно, потребуется настроить для обработки этих изменений.
:::

## Ограничения по частоте {#rate-limits}

Разработчики ограничены 100 ключами API на организацию. Каждый ключ API имеет 
лимит в 10 запросов за 10-секундный интервал. Если вы хотите увеличить количество 
ключей API или запросов за 10-секундный интервал для вашей организации, 
пожалуйста, свяжитесь с support@clickhouse.com

## Провайдер Terraform {#terraform-provider}

Официальный провайдер ClickHouse для Terraform позволяет вам использовать [Инфраструктуру как код](https://www.redhat.com/en/topics/automation/what-is-infrastructure-as-code-iac)
для создания предсказуемых конфигураций под версионным контролем, что делает развертывание менее подверженным ошибкам.

Вы можете просмотреть документацию провайдера Terraform в [реестре Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs).

Если вы хотите внести свой вклад в провайдер ClickHouse для Terraform, вы можете просмотреть 
исходный код [в репозитории GitHub](https://github.com/ClickHouse/terraform-provider-clickhouse).

:::note 
Если ваша организация была переведена на один из [новых тарифных планов](https://clickhouse.com/pricing?plan=scale&provider=aws&region=us-east-1&hours=8&storageCompressed=false), вам потребуется использовать наш [провайдер ClickHouse для Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs) версии 2.0.0 или выше. Это обновление необходимо для обработки изменений в атрибуте `tier` сервиса, так как после миграции по тарифам поле `tier` больше не принимается, и ссылки на него должны быть удалены.

Теперь вы также сможете указать поле `num_replicas` как свойство ресурса сервиса.
:::

## Terraform и OpenAPI Новая цена: Объяснение настроек реплик {#terraform-and-openapi-new-pricing---replica-settings-explained}

Количество реплик, с которыми будет создан каждый сервис, по умолчанию составляет 3 для уровней Scale и Enterprise, в то время как для базового уровня оно составляет 1.
Для уровней Scale и Enterprise возможно его регулирование путём передачи поля `numReplicas` в запросе на создание сервиса. 
Значение поля `numReplicas` должно находиться в диапазоне от 2 до 20 для первого сервиса в хранилище. Сервисы, которые создаются в существующем хранилище, могут иметь количество реплик, равное 1.

## Поддержка {#support}

Мы рекомендуем сначала посетить [наш канал в Slack](https://clickhouse.com/slack) для быстрого получения поддержки. Если 
вам нужна дополнительная помощь или больше информации о нашем API и его возможностях, 
пожалуйста, свяжитесь с поддержкой ClickHouse по адресу https://console.clickhouse.cloud/support