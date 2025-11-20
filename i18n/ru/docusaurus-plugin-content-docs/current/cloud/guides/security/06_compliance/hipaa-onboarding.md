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

ClickHouse предлагает услуги, соответствующие Правилу безопасности Закона США о переносимости и подотчётности медицинского страхования (Health Insurance Portability and Accountability Act, HIPAA) 1996 года. Клиенты могут обрабатывать защищённую медицинскую информацию (PHI) в рамках этих услуг после подписания соглашения с деловым партнёром (Business Associate Agreement, BAA) и развертывания сервисов в соответствующем регионе.

Для получения дополнительной информации о программе соответствия ClickHouse и доступности отчётов аудита третьих сторон ознакомьтесь с нашим [обзором программы соответствия](/cloud/security/compliance-overview) и [Trust Center](https://trust.clickhouse.com). Кроме того, клиентам следует изучить страницу с [функциями безопасности](/cloud/security), чтобы выбрать и реализовать соответствующие меры безопасности для своих рабочих нагрузок.

На этой странице описывается процесс включения возможности развертывания в ClickHouse Cloud сервисов, соответствующих требованиям HIPAA.


## Включение и развертывание сервисов, соответствующих требованиям HIPAA {#enable-hipaa-compliant-services}

<VerticalStepper headerLevel="h3">

### Подключение к Enterprise-сервисам {#sign-up-for-enterprise}

1. Выберите название вашей организации в левом нижнем углу консоли.
2. Нажмите **Billing**.
3. Проверьте ваш **Plan** в левом верхнем углу.
4. Если ваш **Plan** — **Enterprise**, переходите к следующему разделу. Если нет, нажмите **Change plan**.
5. Выберите **Switch to Enterprise**.

### Включение HIPAA для вашей организации {#enable-hipaa}

1. Выберите название вашей организации в левом нижнем углу консоли.
2. Нажмите **Organization details**.
3. Включите переключатель **Enable HIPAA**.

<br />

<Image
  img={hipaa1}
  size='md'
  alt='Запрос на включение HIPAA'
  background='black'
/>

<br />

4. Следуйте инструкциям на экране, чтобы отправить запрос на заключение BAA.

<br />

<Image img={hipaa2} size='md' alt='Отправка запроса на BAA' background='black' />

<br />

5. После заключения BAA функция HIPAA будет включена для организации.

<br />

<Image img={hipaa3} size='md' alt='HIPAA включен' background='black' />

<br />

### Развертывание сервисов в регионах, соответствующих требованиям HIPAA {#deploy-hippa-services}

1. Выберите **New service** в левом верхнем углу главного экрана консоли
2. Измените **Region type** на **HIPAA compliant**

<br />

<Image img={hipaa4} size='md' alt='Развертывание в регион HIPAA' background='black' />

<br />

3. Введите имя сервиса и заполните остальную информацию

Полный список облачных провайдеров и сервисов, соответствующих требованиям HIPAA, см. на странице [Поддерживаемые облачные регионы](/cloud/reference/supported-regions).

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
