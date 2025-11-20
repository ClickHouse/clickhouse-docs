---
sidebar_label: 'Подключение HIPAA'
slug: /cloud/security/compliance/hipaa-onboarding
title: 'Подключение HIPAA'
description: 'Узнайте больше о подключении к сервисам, соответствующим требованиям HIPAA'
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

ClickHouse предлагает услуги, соответствующие Правилу безопасности Закона США 1996 года о переносимости и подотчетности медицинской информации (Health Insurance Portability and Accountability Act, HIPAA). Клиенты могут обрабатывать защищённую медицинскую информацию (PHI) в рамках этих услуг после подписания Соглашения с деловым партнёром (Business Associate Agreement, BAA) и развертывания услуг в совместимом (соответствующем требованиям) регионе.

Чтобы узнать больше о программе соответствия ClickHouse и доступности отчетов аудита третьих сторон, ознакомьтесь с нашим [обзором соответствия](/cloud/security/compliance-overview) и [Trust Center](https://trust.clickhouse.com). Кроме того, клиентам следует изучить страницу [возможности по обеспечению безопасности](/cloud/security), чтобы выбрать и реализовать соответствующие меры защиты для своих рабочих нагрузок.

На этой странице описывается процесс включения развертывания служб ClickHouse Cloud, соответствующих требованиям HIPAA.


## Enable and deploy HIPAA compliant services {#enable-hipaa-compliant-services}

<VerticalStepper headerLevel="h3">

### Sign up for Enterprise services {#sign-up-for-enterprise}

1. Select your organization name in the lower left corner of the console.
2. Click **Billing**.
3. Review your **Plan** in the upper left corner.
4. If your **Plan** is **Enterprise**, then go to the next section. If not, click **Change plan**.
5. Select **Switch to Enterprise**.

### Enable HIPAA for your organization {#enable-hipaa}

1. Выберите название вашей организации в нижнем левом углу консоли.
2. Нажмите **Organization details**.
3. Включите **Enable HIPAA**.

<br />

<Image
  img={hipaa1}
  size='md'
  alt='Запрос включения HIPAA'
  background='black'
/>

<br />

4. Следуйте инструкциям на экране, чтобы подать запрос на подписание BAA.

<br />

<Image img={hipaa2} size='md' alt='Подача запроса на BAA' background='black' />

<br />

5. После подписания BAA HIPAA будет включен для организации.

<br />

<Image img={hipaa3} size='md' alt='HIPAA включен' background='black' />

<br />

### Deploy services to HIPAA compliant regions {#deploy-hippa-services}

1. Выберите **New service** в верхнем левом углу домашнего экрана консоли
2. Измените **Region type** на **HIPAA compliant**

<br />

<Image img={hipaa4} size='md' alt='Развертывание в регион HIPAA' background='black' />

<br />

3. Введите имя сервиса и заполните оставшуюся информацию

Для полного списка облачных провайдеров и сервисов, соответствующих HIPAA, ознакомьтесь с нашей страницей [Поддерживаемые облачные регионы](/cloud/reference/supported-regions).

</VerticalStepper>


## Миграция существующих сервисов {#migrate-to-hipaa}

Клиентам настоятельно рекомендуется развертывать сервисы в соответствующих окружениях, где это требуется. Процесс миграции сервисов из стандартного региона в регион, соответствующий HIPAA, включает восстановление из резервной копии и может потребовать некоторого времени простоя.

Если требуется миграция из стандартных регионов в регионы, соответствующие HIPAA, выполните следующие шаги для самостоятельной миграции:

1. Выберите сервис для миграции.
2. Нажмите **Backups** слева.
3. Нажмите на три точки слева от резервной копии, которую необходимо восстановить.
4. Выберите **Region type**, чтобы восстановить резервную копию в регион, соответствующий HIPAA.
5. После завершения восстановления выполните несколько запросов, чтобы проверить, что схемы и количество записей соответствуют ожидаемым.
6. Удалите старый сервис.

:::info Ограничения
Сервисы должны оставаться у того же облачного провайдера и в том же географическом регионе. Этот процесс переносит сервис в соответствующее окружение у того же облачного провайдера и в том же регионе.
:::
