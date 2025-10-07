---
'title': 'Поддерживаемые облачные регионы'
'sidebar_label': 'Поддерживаемые облачные регионы'
'keywords':
- 'aws'
- 'gcp'
- 'google cloud'
- 'azure'
- 'cloud'
- 'regions'
'description': 'Поддерживаемые регионы для ClickHouse Cloud'
'slug': '/cloud/reference/supported-regions'
'doc_type': 'reference'
---

import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'


# Поддерживаемые облачные регионы

## Регионы AWS {#aws-regions}

- ap-northeast-1 (Токио)
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

**Приватный регион:**
- ca-central-1 (Канада)
- af-south-1 (Южная Африка)
- eu-north-1 (Стокгольм)
- sa-east-1 (Южная Америка)
- ap-northeast-2 (Южная Корея, Сеул)

## Регионы Google Cloud {#google-cloud-regions}

- asia-southeast1 (Сингапур)
- europe-west4 (Нидерланды)
- us-central1 (Айова)
- us-east1 (Южная Каролина)

**Приватный регион:**

- us-west1 (Орегон)
- australia-southeast1 (Сидней)
- asia-northeast1 (Токио)
- europe-west3 (Франкфурт)
- europe-west6 (Цюрих)
- northamerica-northeast1 (Монреаль)

## Регионы Azure {#azure-regions}

- Запад США 3 (Аризона)
- Восток США 2 (Вирджиния)
- Германия Западный Централ (Франкфурт)

**Приватный регион:**

- Япония восток

:::note 
Нужно развернуть в регионе, который в настоящее время не указан? [Отправьте запрос](https://clickhouse.com/pricing?modal=open). 
:::

## Приватные регионы {#private-regions}

<EnterprisePlanFeatureBadge feature="Приватные регионы"/>

Мы предлагаем Приватные регионы для наших услуг уровня Enterprise. Пожалуйста, [свяжитесь с нами](https://clickhouse.com/company/contact) для запросов на приватные регионы.

Ключевые аспекты для приватных регионов:
- Услуги не будут автоматически масштабироваться.
- Услуги не могут быть остановлены или бездействовать.
- Ручное масштабирование (как вертикальное, так и горизонтальное) может быть включено с помощью тикета в службу поддержки.
- Если услуга требует настройки с CMEK, клиент должен предоставить ключ KMS AWS во время запуска услуги.
- Для запуска новых и дополнительных услуг запросы необходимо будет оформить через тикет в службу поддержки.

Дополнительные требования могут применяться для соблюдения HIPAA (включая подписание BAA). Обратите внимание, что HIPAA в настоящее время доступна только для услуг уровня Enterprise.

## Регионы, соответствующие HIPAA {#hipaa-compliant-regions}

<EnterprisePlanFeatureBadge feature="HIPAA" support="true"/>

Клиенты должны подписать Соглашение о деловом партнерстве (BAA) и запросить onboarding через отдел продаж или поддержку, чтобы настроить услуги в регионах, соответствующих HIPAA. Следующие регионы поддерживают соответствие HIPAA:
- AWS eu-central-1 (Франкфурт)
- AWS eu-west-2 (Лондон)
- AWS us-east-1 (Северная Вирджиния)
- AWS us-east-2 (Огайо)
- AWS us-west-2 (Орегон)
- GCP europe-west4 (Нидерланды)
- GCP us-central1 (Айова)
- GCP us-east1 (Южная Каролина)

## Регионы, соответствующие PCI {#pci-compliant-regions}

<EnterprisePlanFeatureBadge feature="PCI" support="true"/>

Клиенты должны запросить onboarding через отдел продаж или поддержку, чтобы настроить услуги в регионах, соответствующих PCI. Следующие регионы поддерживают соответствие PCI:
- AWS eu-central-1 (Франкфурт)
- AWS eu-west-2 (Лондон)
- AWS us-east-1 (Северная Вирджиния)
- AWS us-east-2 (Огайо)
- AWS us-west-2 (Орегон)
