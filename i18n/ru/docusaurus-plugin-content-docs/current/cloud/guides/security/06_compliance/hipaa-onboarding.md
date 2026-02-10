---
sidebar_label: 'Подключение HIPAA'
slug: /cloud/security/compliance/hipaa-onboarding
title: 'Подключение HIPAA'
description: 'Узнайте больше о подключении к сервисам, соответствующим стандартам HIPAA'
doc_type: 'guide'
keywords: ['hipaa', 'compliance', 'healthcare', 'security', 'data protection']
---

import BetaBadge from '@theme/badges/BetaBadge';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge';

import Image from '@theme/IdealImage';
import hipaa1 from '@site/static/images/cloud/security/compliance/hipaa_1.png';
import hipaa2 from '@site/static/images/cloud/security/compliance/hipaa_2.png';
import hipaa3 from '@site/static/images/cloud/security/compliance/hipaa_3.png';
import hipaa4 from '@site/static/images/cloud/security/compliance/hipaa_4.png';

<EnterprisePlanFeatureBadge feature="HIPAA" />

ClickHouse предлагает услуги, соответствующие Правилу безопасности Закона о переносимости и подотчетности медицинского страхования 1996 года (Health Insurance Portability and Accountability Act, HIPAA). Клиенты могут обрабатывать защищённую медицинскую информацию (PHI) в рамках этих услуг после подписания Соглашения с деловым партнёром (Business Associate Agreement, BAA) и развертывания сервисов в регионе, соответствующем требованиям HIPAA.

Для получения дополнительной информации о программе соответствия требованиям в ClickHouse и доступности отчётов сторонних аудитов ознакомьтесь с нашим [обзором программы соответствия](/cloud/security/compliance-overview) и [Trust Center](https://trust.clickhouse.com). Кроме того, клиентам следует изучить страницу [функций безопасности](/cloud/security), чтобы выбрать и реализовать соответствующие меры безопасности для своих рабочих нагрузок.

На этой странице описывается процесс включения развертывания сервисов в ClickHouse Cloud, соответствующих требованиям HIPAA.


## Включение и развертывание сервисов с соблюдением требований HIPAA \{#enable-hipaa-compliant-services\}

<VerticalStepper headerLevel="h3">

### Подключение Enterprise-плана \{#sign-up-for-enterprise\}

1. Выберите имя вашей организации в левом нижнем углу консоли.
2. Нажмите **Billing**.
3. Проверьте ваш **Plan** в левом верхнем углу.
4. Если ваш **Plan** — **Enterprise**, перейдите к следующему разделу. Если нет, нажмите **Change plan**.
5. Выберите **Switch to Enterprise**.

### Включение HIPAA для вашей организации \{#enable-hipaa\}

1. Выберите имя вашей организации в левом нижнем углу консоли.
2. Нажмите **Organization details**.
3. Включите переключатель **Enable HIPAA**.

<br />

<Image img={hipaa1} size="md" alt="Запрос включения HIPAA" background='black'/>

<br />

4. Следуйте инструкциям на экране, чтобы отправить запрос на заключение BAA.

<br />

<Image img={hipaa2} size="md" alt="Отправка запроса на заключение BAA" background='black'/>

<br />

5. После завершения заключения BAA HIPAA будет включена для организации.

<br />

<Image img={hipaa3} size="md" alt="HIPAA включена" background='black'/>

<br />

### Развертывание сервисов в регионах, соответствующих требованиям HIPAA \{#deploy-hippa-services\}

1. Выберите **New service** в левом верхнем углу домашнего экрана в консоли.
2. Измените **Region type** на **HIPAA compliant**.

<br />

<Image img={hipaa4} size="md" alt="Развертывание в регионе с поддержкой HIPAA" background='black'/>

<br />

3. Введите имя сервиса и укажите оставшуюсь информацию.

Для полного списка облачных провайдеров и сервисов, соответствующих требованиям HIPAA, ознакомьтесь со страницей [Supported cloud regions](/cloud/reference/supported-regions).

</VerticalStepper>



## Перенести существующие сервисы \{#migrate-to-hipaa\}

Клиентам настоятельно рекомендуется развертывать сервисы в средах, соответствующих требованиям, если это необходимо. Процесс миграции сервисов из стандартного региона в регион, соответствующий требованиям HIPAA, включает восстановление из резервной копии и может потребовать некоторого времени простоя.

Если требуется миграция из стандартного региона в регион, соответствующий требованиям HIPAA, выполните следующие шаги для самостоятельной миграции:

1. Выберите сервис для миграции.
2. Слева нажмите **Backups**.
3. Нажмите на три точки слева от резервной копии, которую нужно восстановить.
4. Выберите **Region type**, чтобы восстановить резервную копию в регион, соответствующий требованиям HIPAA.
5. После завершения восстановления выполните несколько запросов, чтобы убедиться, что схемы и количество записей соответствуют ожиданиям.
6. Удалите старый сервис.

:::info Ограничения
Сервисы должны оставаться в пределах того же облачного провайдера и географического региона. Этот процесс переносит сервис в среду, соответствующую требованиям, в рамках того же облачного провайдера и региона.
:::
