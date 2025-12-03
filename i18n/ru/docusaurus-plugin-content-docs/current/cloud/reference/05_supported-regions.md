---
title: 'Поддерживаемые регионы Cloud'
sidebar_label: 'Поддерживаемые регионы Cloud'
keywords: ['aws', 'gcp', 'google cloud', 'azure', 'cloud', 'regions']
description: 'Поддерживаемые регионы для ClickHouse Cloud'
slug: /cloud/reference/supported-regions
doc_type: 'reference'
---

import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'


# Поддерживаемые регионы Cloud {#supported-cloud-regions}

## Регионы AWS {#aws-regions}

- ap-northeast-1 (Токио)
- ap-northeast-2 (Южная Корея, Сеул)
- ap-south-1 (Мумбаи)
- ap-southeast-1 (Сингапур)
- ap-southeast-2 (Сидней)
- eu-central-1 (Франкфурт)
- eu-west-1 (Ирландия)
- eu-west-2 (Лондон)
- me-central-1 (ОАЭ)
- us-east-1 (Северная Вирджиния)
- us-east-2 (Огайо)
- us-west-2 (Орегон)
- il-central-1 (Израиль, Тель-Авив)

**Закрытые регионы:**

- ca-central-1 (Канада)
- af-south-1 (Южная Африка)
- eu-north-1 (Стокгольм)
- sa-east-1 (Южная Америка)

## Регионы Google Cloud {#google-cloud-regions}

- asia-southeast1 (Сингапур)
- asia-northeast1 (Токио)
- europe-west4 (Нидерланды)
- us-central1 (Айова)
- us-east1 (Южная Каролина)

**Частный регион:**

- us-west1 (Орегон)
- australia-southeast1 (Сидней)
- europe-west3 (Франкфурт)
- europe-west6 (Цюрих)
- northamerica-northeast1 (Монреаль)

## Регионы Azure {#azure-regions}

- West US 3 (Аризона)
- East US 2 (Вирджиния)
- Germany West Central (Франкфурт)

**Закрытый регион:**

- Japan East (Токио, Сайтама)
- UAE North (Дубай)

:::note 
Нужно развернуть в регионе, который сейчас не указан в списке? [Отправьте запрос](https://clickhouse.com/pricing?modal=open). 
:::

## Частные регионы {#private-regions}

<EnterprisePlanFeatureBadge feature="Private regions feature"/>

Мы предлагаем частные регионы для сервисов уровня Enterprise. Пожалуйста, [свяжитесь с нами](https://clickhouse.com/company/contact) по вопросам использования частных регионов.

Ключевые особенности частных регионов:

- Сервисы не будут автоматически масштабироваться; однако поддерживается ручное вертикальное и горизонтальное масштабирование.
- Сервисы не могут быть переведены в режим простоя.
- Страница статуса недоступна для частных регионов.

Для соответствия требованиям HIPAA могут потребоваться дополнительные условия (включая подписание BAA). Обратите внимание, что HIPAA в настоящее время доступна только для сервисов уровня Enterprise.

## Регионы, соответствующие требованиям HIPAA {#hipaa-compliant-regions}

<EnterprisePlanFeatureBadge feature="HIPAA" support="true"/>

Клиенты должны подписать Соглашение о деловом партнёрстве (Business Associate Agreement, BAA) и запросить подключение через отдел продаж или службу поддержки, чтобы развернуть сервисы в регионах, соответствующих требованиям HIPAA. Следующие регионы поддерживают соответствие требованиям HIPAA:

- AWS af-south-1 (South Africa) **Частный регион**
- AWS ca-central-1 (Canada) **Частный регион**
- AWS eu-central-1 (Frankfurt)
- AWS eu-north-1 (Stockholm) **Частный регион**
- AWS eu-west-1 (Ireland)
- AWS eu-west-2 (London)
- AWS sa-east-1 (South America) **Частный регион**
- AWS us-east-1 (N. Virginia)
- AWS us-east-2 (Ohio)
- AWS us-west-2 (Oregon)
- GCP europe-west4 (Netherlands)
- GCP us-central1 (Iowa)
- GCP us-east1 (South Carolina)

## Регионы, соответствующие требованиям PCI {#pci-compliant-regions}

<EnterprisePlanFeatureBadge feature="PCI" support="true"/>

Чтобы развернуть сервисы в регионах, соответствующих требованиям PCI, клиентам необходимо обратиться в отдел продаж или службу поддержки для оформления подключения. Следующие регионы поддерживают соответствие стандарту PCI:

- AWS af-south-1 (Южная Африка) **Приватный регион**
- AWS ca-central-1 (Канада) **Приватный регион**
- AWS eu-central-1 (Франкфурт)
- AWS eu-north-1 (Стокгольм) **Приватный регион**
- AWS eu-west-1 (Ирландия)
- AWS eu-west-2 (Лондон)
- AWS sa-east-1 (Южная Америка) **Приватный регион**
- AWS us-east-1 (Северная Вирджиния)
- AWS us-east-2 (Огайо)
- AWS us-west-2 (Орегон)