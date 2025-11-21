---
title: 'Управление синхронизацией ClickPipe для MongoDB'
description: 'Документация по управлению синхронизацией ClickPipe для MongoDB'
slug: /integrations/clickpipes/mongodb/sync_control
sidebar_label: 'Управление синхронизацией'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', 'data ingestion', 'real-time sync']
---

import edit_sync_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/edit_sync_button.png'
import create_sync_settings from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/create_sync_settings.png'
import edit_sync_settings from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/sync_settings_edit.png'
import cdc_syncs from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/cdc_syncs.png'
import Image from '@theme/IdealImage';

В этом документе описывается, как управлять синхронизацией MongoDB ClickPipe, когда ClickPipe находится в режиме **CDC (Running)**.


## Обзор {#overview}

Архитектура Database ClickPipes состоит из двух параллельных процессов — извлечения данных из исходной базы данных и отправки в целевую базу данных. Процесс извлечения управляется конфигурацией синхронизации, которая определяет, как часто следует извлекать данные и какой объём данных следует извлекать за один раз. Под «за один раз» мы подразумеваем один пакет, поскольку ClickPipe извлекает и отправляет данные пакетами.

Существует два основных способа управления синхронизацией MongoDB ClickPipe. ClickPipe начнёт отправку данных, когда сработает одна из приведённых ниже настроек.

### Интервал синхронизации {#interval}

Интервал синхронизации конвейера — это промежуток времени (в секундах), в течение которого ClickPipe будет извлекать записи из исходной базы данных. Время отправки данных в ClickHouse не включается в этот интервал.

По умолчанию — **1 минута**.
Интервал синхронизации может быть установлен на любое положительное целое значение, но рекомендуется устанавливать его не менее 10 секунд.

### Размер пакета извлечения {#batch-size}

Размер пакета извлечения — это количество записей, которые ClickPipe извлечёт из исходной базы данных за один пакет. Под записями понимаются операции вставки, обновления и удаления, выполненные в коллекциях, которые являются частью конвейера.

По умолчанию — **100 000** записей.
Безопасный максимум — 10 миллионов.

### Настройка параметров синхронизации {#configuring}

Вы можете установить интервал синхронизации и размер пакета извлечения при создании ClickPipe или редактировании существующего.
При создании ClickPipe эти параметры отображаются на втором шаге мастера создания, как показано ниже:

<Image img={create_sync_settings} alt='Create sync settings' size='md' />

При редактировании существующего ClickPipe перейдите на вкладку **Settings** конвейера, приостановите конвейер, а затем нажмите **Configure**:

<Image img={edit_sync_button} alt='Edit sync button' size='md' />

Откроется всплывающая панель с параметрами синхронизации, где вы можете изменить интервал синхронизации и размер пакета извлечения:

<Image img={edit_sync_settings} alt='Edit sync settings' size='md' />

### Мониторинг поведения управления синхронизацией {#monitoring}

Вы можете увидеть, сколько времени занимает каждый пакет, в таблице **CDC Syncs** на вкладке **Metrics** ClickPipe. Обратите внимание, что длительность здесь включает время отправки, а также, если нет входящих строк, ClickPipe ожидает, и время ожидания также включается в длительность.

<Image img={cdc_syncs} alt='CDC Syncs table' size='md' />
