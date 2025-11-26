---
sidebar_label: 'Splunk'
slug: /integrations/audit-splunk
keywords: ['clickhouse', 'Splunk', 'audit', 'cloud']
description: 'Хранение журналов аудита ClickHouse Cloud в Splunk.'
title: 'Хранение журналов аудита ClickHouse Cloud в Splunk'
doc_type: 'guide'
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
import PartnerBadge from '@theme/badges/PartnerBadge';


# Сохранение журналов аудита ClickHouse Cloud в Splunk

<PartnerBadge/>

[Splunk](https://www.splunk.com/) — это платформа для аналитики данных и мониторинга.

Это дополнение позволяет пользователям сохранять [журналы аудита ClickHouse Cloud](/cloud/security/audit-logging) в Splunk. Оно использует [ClickHouse Cloud API](/cloud/manage/api/api-overview) для выгрузки журналов аудита.

Это дополнение содержит только модульный ввод (modular input); никаких дополнительных пользовательских интерфейсов оно не предоставляет.



# Установка



## Для Splunk Enterprise {#for-splunk-enterprise}

Загрузите ClickHouse Cloud Audit Add-on for Splunk с [Splunkbase](https://splunkbase.splunk.com/app/7709).

<Image img={splunk_001} size="lg" alt="Сайт Splunkbase со страницей загрузки ClickHouse Cloud Audit Add-on for Splunk" border />

В Splunk Enterprise перейдите в раздел Apps -> Manage. Затем нажмите Install app from file.

<Image img={splunk_002} size="lg" alt="Интерфейс Splunk Enterprise со страницей управления приложениями и опцией Install app from file" border />

Выберите архив, загруженный с Splunkbase, и нажмите Upload.

<Image img={splunk_003} size="lg" alt="Диалог установки приложения Splunk для загрузки дополнения ClickHouse" border />

Если всё прошло успешно, вы должны увидеть установленное приложение ClickHouse Audit logs. В противном случае проверьте логи Splunkd на наличие ошибок.



# Модульная конфигурация входных данных

Чтобы настроить модульный ввод, вам сначала понадобится информация из вашего развертывания ClickHouse Cloud:

- Идентификатор организации
- Административный [API Key](/cloud/manage/openapi)



## Получение информации из ClickHouse Cloud {#getting-information-from-clickhouse-cloud}

Войдите в [консоль ClickHouse Cloud](https://console.clickhouse.cloud/).

Перейдите в Organization → Organization details. Здесь вы можете скопировать идентификатор организации (Organization ID).

<Image img={splunk_004} size="lg" alt="Консоль ClickHouse Cloud с открытой страницей Organization details и отображаемым Organization ID" border />

Затем в меню слева перейдите в раздел API Keys.

<Image img={splunk_005} size="lg" alt="Консоль ClickHouse Cloud с отображаемым разделом API Keys в левом навигационном меню" border />

Создайте новый API Key, задайте ему понятное имя и выберите привилегии `Admin`. Нажмите Generate API Key.

<Image img={splunk_006} size="lg" alt="Консоль ClickHouse Cloud с интерфейсом создания API Key и выбранными привилегиями Admin" border />

Сохраните API Key и секрет в надежном месте.

<Image img={splunk_007} size="lg" alt="Консоль ClickHouse Cloud с отображаемыми сгенерированными API Key и секретом, которые необходимо сохранить" border />



## Настройка источника данных в Splunk {#configure-data-input-in-splunk}

Вернувшись в Splunk, перейдите в Settings -> Data inputs.

<Image img={splunk_008} size="lg" alt="Интерфейс Splunk с меню Settings и опцией Data inputs" border />

Выберите источник данных ClickHouse Cloud Audit Logs.

<Image img={splunk_009} size="lg" alt="Страница Splunk Data inputs с опцией ClickHouse Cloud Audit Logs" border />

Нажмите «New», чтобы настроить новый источник данных.

<Image img={splunk_010} size="lg" alt="Интерфейс Splunk для настройки нового источника данных ClickHouse Cloud Audit Logs" border />

После того как вы введёте все данные, нажмите «Next».

<Image img={splunk_011} size="lg" alt="Страница конфигурации Splunk с заполненными настройками источника данных ClickHouse" border />

Источник данных настроен, можно приступать к просмотру журналов аудита.



# Использование

Модульный ввод данных сохраняет данные в Splunk. Для их просмотра используйте стандартный интерфейс поиска Splunk.

<Image img={splunk_012} size="lg" alt="Интерфейс поиска Splunk, отображающий данные журналов аудита ClickHouse" border />
