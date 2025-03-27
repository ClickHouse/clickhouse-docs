---
sidebar_label: 'Splunk'
slug: /integrations/audit-splunk
keywords: ['clickhouse', 'Splunk', 'audit', 'cloud']
description: 'Хранение журналов аудита ClickHouse Cloud в Splunk.'
title: 'Хранение журналов аудита ClickHouse Cloud в Splunk'
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


# Хранение журналов аудита ClickHouse Cloud в Splunk

<ClickHouseSupportedBadge/>

[Splunk](https://www.splunk.com/) — это платформа для аналитики и мониторинга данных.

Этот подключаемый модуль позволяет пользователям хранить [журналы аудита ClickHouse Cloud](/cloud/security/audit-logging) в Splunk. Он использует [ClickHouse Cloud API](/cloud/manage/api/api-overview) для загрузки журналов аудита.

Этот подключаемый модуль содержит только модульный ввод, никаких дополнительных интерфейсов с этим модулем не предоставлено.


# Установка

## Для Splunk Enterprise {#for-splunk-enterprise}

Скачайте ClickHouse Cloud Audit Add-on для Splunk с [Splunkbase](https://splunkbase.splunk.com/app/7709).

<Image img={splunk_001} size="lg" alt="Веб-сайт Splunkbase, показывающий страницу загрузки ClickHouse Cloud Audit Add-on для Splunk" border />

В Splunk Enterprise перейдите в Apps -> Manage. Затем нажмите на Install app from file.

<Image img={splunk_002} size="lg" alt="Интерфейс Splunk Enterprise, показывающий страницу управления приложениями с опцией Install app from file" border />

Выберите загруженный архивированный файл из Splunkbase и нажмите Upload.

<Image img={splunk_003} size="lg" alt="Диалог установки приложения Splunk для загрузки ClickHouse add-on" border />

Если все пройдет успешно, вы должны увидеть установленное приложение ClickHouse Audit logs. Если нет, проверьте журналы Splunkd на наличие ошибок.


# Настройка модульного ввода

Чтобы настроить модульный ввод, вам сначала потребуется информация из вашей установки ClickHouse Cloud:

- Идентификатор организации
- Администраторский [API Key](/cloud/manage/openapi)

## Получение информации из ClickHouse Cloud {#getting-information-from-clickhouse-cloud}

Войдите в [консоль ClickHouse Cloud](https://console.clickhouse.cloud/).

Перейдите в вашу Организацию -> Подробности организации. Там вы можете скопировать идентификатор организации.

<Image img={splunk_004} size="lg" alt="Консоль ClickHouse Cloud, показывающая страницу Подробности организации с идентификатором организации" border />

Затем перейдите в API Keys в левом меню.

<Image img={splunk_005} size="lg" alt="Консоль ClickHouse Cloud, показывающая раздел API Keys в левом навигационном меню" border />

Создайте API Key, дайте ему осмысленное имя и выберите привилегии `Admin`. Нажмите на Generate API Key.

<Image img={splunk_006} size="lg" alt="Консоль ClickHouse Cloud, показывающая интерфейс создания API Key с выбранными привилегиями Admin" border />

Сохраните API Key и секретное значение в надежном месте.

<Image img={splunk_007} size="lg" alt="Консоль ClickHouse Cloud, показывающая созданный API Key и секрет, которые нужно сохранить" border />

## Настройка ввода данных в Splunk {#configure-data-input-in-splunk}

Вернитесь в Splunk, перейдите в Settings -> Data inputs.

<Image img={splunk_008} size="lg" alt="Интерфейс Splunk, показывающий меню настроек с опцией Data inputs" border />

Выберите ввод данных журнала аудита ClickHouse Cloud.

<Image img={splunk_009} size="lg" alt="Страница ввода данных Splunk, показывающая вариант ClickHouse Cloud Audit Logs" border />

Нажмите "New", чтобы настроить новый экземпляр ввода данных.

<Image img={splunk_010} size="lg" alt="Интерфейс Splunk для настройки нового ввода данных журнала аудита ClickHouse Cloud" border />

После того как вы ввели всю информацию, нажмите Next.

<Image img={splunk_011} size="lg" alt="Страница конфигурации Splunk с заполненными параметрами ввода данных ClickHouse" border />

Ввод настроен, теперь вы можете начать просматривать журналы аудита.


# Использование

Модульный ввод хранит данные в Splunk. Чтобы просмотреть данные, вы можете использовать общий интерфейс поиска в Splunk.

<Image img={splunk_012} size="lg" alt="Интерфейс поиска в Splunk, показывающий данные журналов аудита ClickHouse" border />
