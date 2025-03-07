---
slug: /cloud/bestpractices/asynchronous-inserts
sidebar_label: Асинхронные вставки
title: Асинхронные вставки (async_insert)
keywords: ['ClickHouse', 'асинхронные вставки', 'база данных', 'лучшие практики', 'производительность']
description: 'Узнайте, как использовать асинхронные вставки в ClickHouse для повышения производительности и снижения затрат.'
---

import asyncInsert01 from '@site/static/images/cloud/bestpractices/async-01.png';
import asyncInsert02 from '@site/static/images/cloud/bestpractices/async-02.png';
import asyncInsert03 from '@site/static/images/cloud/bestpractices/async-03.png';

Вставка данных в ClickHouse большими партиями является лучшей практикой. Это экономит вычислительные циклы и диск I/O, и, следовательно, экономит деньги. Если ваш случай использования позволяет вам пакетировать вставки вне ClickHouse, это один из вариантов. Если вы хотите, чтобы ClickHouse формировал пакеты, вы можете использовать режим асинхронной ВСТАВКИ, описанный здесь.

Используйте асинхронные вставки в качестве альтернативы как пакетированию данных на стороне клиента, так и поддержанию скорости вставки на уровне одного запроса вставки в секунду, включив настройку [async_insert](/operations/settings/settings.md/#async_insert). Это заставляет ClickHouse обрабатывать пакетирование на стороне сервера.

По умолчанию ClickHouse записывает данные синхронно.
Каждая вставка, отправленная в ClickHouse, немедленно вызывает создание части, содержащей данные вставки.
Это стандартное поведение, когда настройка async_insert установлена в свое значение по умолчанию — 0:

<img src={asyncInsert01}
  class="image"
  alt="Процесс асинхронной вставки - стандартные синхронные вставки"
  style={{width: '100%', background: 'none'}} />

Установив async_insert в 1, ClickHouse сначала сохраняет поступающие вставки в буфер в памяти, а затем регулярно сбрасывает их на диск.

Существуют два возможных условия, которые могут вызвать сброс буфера ClickHouse на диск:
- размер буфера достиг N байт (N можно настроить с помощью [async_insert_max_data_size](/operations/settings/settings.md/#async_insert_max_data_size))
- прошло не менее N мс с момента последнего сброса буфера (N можно настроить с помощью [async_insert_busy_timeout_max_ms](/operations/settings/settings.md/#async_insert_busy_timeout_max_ms))

В любое время, когда выполняется одно из условий выше, ClickHouse сбрасывает свой буфер в памяти на диск.

:::note
Ваши данные становятся доступными для запросов на чтение после того, как данные записаны в часть на хранилище. Помните об этом, когда вы хотите изменить `async_insert_busy_timeout_ms` (по умолчанию установлено в 1 секунду) или настройки `async_insert_max_data_size` (по умолчанию установлено в 10 MiB).
:::

С настройкой [wait_for_async_insert](/operations/settings/settings.md/#wait_for_async_insert) вы можете настроить, хотите ли вы, чтобы оператор вставки возвращал подтверждение либо сразу после вставки данных в буфер (wait_for_async_insert = 0), либо по умолчанию, после записи данных в часть после сброса из буфера (wait_for_async_insert = 1).

Следующие две диаграммы иллюстрируют две настройки для async_insert и wait_for_async_insert:

<img src={asyncInsert02}
  class="image"
  alt="Процесс асинхронной вставки - async_insert=1, wait_for_async_insert=1"
  style={{width: '100%', background: 'none'}} />

<img src={asyncInsert03}
  class="image"
  alt="Процесс асинхронной вставки - async_insert=1, wait_for_async_insert=0"
  style={{width: '100%', background: 'none'}} />

### Включение асинхронных вставок {#enabling-asynchronous-inserts}

Асинхронные вставки можно включить для конкретного пользователя или для конкретного запроса:

- Включение асинхронных вставок на уровне пользователя. Этот пример использует пользователя `default`, если вы создаете другого пользователя, замените имя пользователя:
  ```sql
  ALTER USER default SETTINGS async_insert = 1
  ```
- Вы можете указать настройки асинхронной вставки, используя клаузу SETTINGS запросов вставки:
  ```sql
  INSERT INTO YourTable SETTINGS async_insert=1, wait_for_async_insert=1 VALUES (...)
  ```
- Вы также можете указать настройки асинхронной вставки как параметры соединения при использовании клиента ClickHouse на языке программирования.

  В качестве примера, вот как вы можете сделать это в строке подключения JDBC, когда используете драйвер ClickHouse Java JDBC для подключения к ClickHouse Cloud :
  ```bash
  "jdbc:ch://HOST.clickhouse.cloud:8443/?user=default&password=PASSWORD&ssl=true&custom_http_params=async_insert=1,wait_for_async_insert=1"
  ```
Наша настоятельная рекомендация — использовать async_insert=1, wait_for_async_insert=1 при использовании асинхронных вставок. Использование wait_for_async_insert=0 очень рискованно, потому что ваш клиент INSERT может не быть в курсе ошибок, а также может привести к потенциальной перегрузке, если ваш клиент продолжит быстро записывать в ситуации, когда сервер ClickHouse должен замедлить записи и создать обратное давление, чтобы обеспечить надежность сервиса.

:::note Автоматическая дедупликация по умолчанию отключена при использовании асинхронных вставок
Ручное пакетирование (см. [bulk insert](/cloud/bestpractices/bulkinserts.md))) имеет преимущество в том, что оно поддерживает [встроенную автоматическую дедупликацию](/engines/table-engines/mergetree-family/replication.md) данных таблицы, если (именно) один и тот же оператор вставки отправляется несколько раз в ClickHouse Cloud, например, из-за автоматической попытки повторной отправки в клиентском программном обеспечении из-за временных проблем с сетевым подключением.
:::
