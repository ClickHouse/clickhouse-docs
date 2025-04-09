---
sidebar_label: 'Splunk'
slug: /integrations/audit-splunk
keywords: ['clickhouse', 'Splunk', 'audit', 'cloud']
description: 'Сохранение журналов аудита ClickHouse Cloud в Splunk.'
title: 'Сохранение журналов аудита ClickHouse Cloud в Splunk'
---

import Image from '@theme/IdealImage';
import splunk_001 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_001.png';
import splunk_002 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_002.png';
import splunk_003 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_003.png';
import splunk_004 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_004.png';
import splunk_005 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_005.png';
import splunk_006 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_006.png';
import splunk_007 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_007.png';
import splunk_008 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_008.png';
import splunk_009 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_009.png';
import splunk_010 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_010.png';
import splunk_011 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_011.png';
import splunk_012 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_012.png';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Сохранение журналов аудита ClickHouse Cloud в Splunk

<ClickHouseSupportedBadge/>

[Splunk](https://www.splunk.com/) — это платформа для аналитики и мониторинга данных.

Этот аддон позволяет пользователям сохранять [журналы аудита ClickHouse Cloud](/cloud/security/audit-logging) в Splunk. Он использует [ClickHouse Cloud API](/cloud/manage/api/api-overview) для загрузки журналов аудита.

Этот аддон содержит только модульный ввод, дополнительный интерфейс не предоставляется.


# Установка

## Для Splunk Enterprise {#for-splunk-enterprise}

Скачайте аддон ClickHouse Cloud Audit для Splunk с [Splunkbase](https://splunkbase.splunk.com/app/7709).

<Image img={splunk_001} size="lg" alt="Сайт Splunkbase, показывающий страницу загрузки аддона ClickHouse Cloud Audit для Splunk" border />

В Splunk Enterprise перейдите в Apps -> Manage. Затем нажмите на Install app from file.

<Image img={splunk_002} size="lg" alt="Интерфейс Splunk Enterprise, показывающий страницу управления приложениями с опцией Install app from file" border />

Выберите загруженный архивированный файл из Splunkbase и нажмите Upload.

<Image img={splunk_003} size="lg" alt="Диалог установки Splunk для загрузки аддона ClickHouse" border />

Если все прошло хорошо, вы должны увидеть установленное приложение ClickHouse Audit logs. Если нет, проверьте журналы Splunkd на наличие ошибок.


# Конфигурация модульного ввода

Чтобы настроить модульный ввод, вам сначала потребуется информация из вашего развертывания ClickHouse Cloud:

- Идентификатор организации
- Админский [API Key](/cloud/manage/openapi)

## Получение информации из ClickHouse Cloud {#getting-information-from-clickhouse-cloud}

Войдите в [консоль ClickHouse Cloud](https://console.clickhouse.cloud/).

Перейдите в вашу Организацию -> Подробности организации. Там вы можете скопировать Идентификатор организации.

<Image img={splunk_004} size="lg" alt="Консоль ClickHouse Cloud, показывающая страницу Подробности организации с Идентификатором организации" border />

Затем перейдите в API Keys в левом меню.

<Image img={splunk_005} size="lg" alt="Консоль ClickHouse Cloud, показывающая раздел API Keys в левом навигационном меню" border />

Создайте API Key, дайте ему понятное имя и выберите привилегии `Admin`. Нажмите на Generate API Key.

<Image img={splunk_006} size="lg" alt="Консоль ClickHouse Cloud, показывающая интерфейс создания API Key с выбранными привилегиями Admin" border />

Сохраните API Key и секретное значение в безопасном месте.

<Image img={splunk_007} size="lg" alt="Консоль ClickHouse Cloud, показывающая сгенерированный API Key и секрет для сохранения" border />

## Настройка ввода данных в Splunk {#configure-data-input-in-splunk}

Вернувшись в Splunk, перейдите в Settings -> Data inputs.

<Image img={splunk_008} size="lg" alt="Интерфейс Splunk, показывающий меню Настройки с опцией Ввод данных" border />

Выберите ввод данных ClickHouse Cloud Audit Logs.

<Image img={splunk_009} size="lg" alt="Страница ввода данных Splunk, показывающая опцию ClickHouse Cloud Audit Logs" border />

Нажмите "New", чтобы настроить новый экземпляр ввода данных.

<Image img={splunk_010} size="lg" alt="Интерфейс Splunk для настройки нового ввода данных ClickHouse Cloud Audit Logs" border />

После того как вы ввели всю информацию, нажмите Next.

<Image img={splunk_011} size="lg" alt="Страница конфигурации Splunk с завершенными настройками ввода данных ClickHouse" border />

Ввод настроен, вы можете начать просматривать журналы аудита.


# Использование

Модульный ввод хранит данные в Splunk. Чтобы просмотреть данные, вы можете использовать общий режим поиска в Splunk.

<Image img={splunk_012} size="lg" alt="Интерфейс поиска Splunk, показывающий данные журналов аудита ClickHouse" border />
