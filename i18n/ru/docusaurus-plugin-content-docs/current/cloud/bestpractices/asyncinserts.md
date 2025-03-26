---
slug: /cloud/bestpractices/asynchronous-inserts
sidebar_label: 'Асинхронные вставки'
title: 'Асинхронные вставки (async_insert)'
description: 'Описание того, как использовать асинхронные вставки в ClickHouse в качестве альтернативного лучшего практического подхода к пакетной загрузке'
---

import Image from '@theme/IdealImage';
import asyncInsert01 from '@site/static/images/cloud/bestpractices/async-01.png';
import asyncInsert02 from '@site/static/images/cloud/bestpractices/async-02.png';
import asyncInsert03 from '@site/static/images/cloud/bestpractices/async-03.png';

Вставка данных в ClickHouse большими пакетами является лучшей практикой. Это экономит вычислительные циклы и ввод-вывод диска, и, следовательно, помогает сэкономить деньги. Если ваш случай использования позволяет пакетировать вставки вне ClickHouse, то это один из вариантов. Если вы хотите, чтобы ClickHouse создавал пакеты, то вы можете использовать асинхронный режим INSERT, описанный здесь.

Используйте асинхронные вставки в качестве альтернативы как пакетированию данных на стороне клиента, так и поддержанию скорости вставки около одного запроса на вставку в секунду, включив настройку [async_insert](/operations/settings/settings.md/#async_insert). Это заставляет ClickHouse обрабатывать пакетирование на стороне сервера.

По умолчанию ClickHouse записывает данные синхронно. Каждый вставленный запрос, отправленный в ClickHouse, вызывает немедленное создание части, содержащей данные из вставки. Это поведение по умолчанию, когда настройка async_insert установлена по умолчанию на 0:

<Image img={asyncInsert01} size="md" alt="Процесс асинхронной вставки - стандартные синхронные вставки" background="white"/>

Установив async_insert на 1, ClickHouse сначала сохраняет входящие вставки в буфер в памяти, прежде чем регулярно сбрасывать их на диск.

Существует два возможных условия, которые могут вызвать сброс буфера ClickHouse на диск:
- размер буфера достиг N байт (N настраиваемый через [async_insert_max_data_size](/operations/settings/settings.md/#async_insert_max_data_size))
- прошло как минимум N мс с последнего сброса буфера (N настраиваемый через [async_insert_busy_timeout_max_ms](/operations/settings/settings.md/#async_insert_busy_timeout_max_ms))

В любое время, когда выполняется любое из условий выше, ClickHouse сбрасывает свой буфер в памяти на диск.

:::note
Ваши данные доступны для запросов на чтение, как только данные записаны в часть хранилища. Учтите это, когда вы хотите изменить настройки `async_insert_busy_timeout_ms` (по умолчанию установлено на 1 секунду) или `async_insert_max_data_size` (по умолчанию установлено на 10 MiB).
:::

С помощью настройки [wait_for_async_insert](/operations/settings/settings.md/#wait_for_async_insert) вы можете настроить, хотите ли вы, чтобы команда вставки возвращалась с подтверждением либо сразу после вставки данных в буфер (wait_for_async_insert = 0), либо по умолчанию, после записи данных в часть после сброса из буфера (wait_for_async_insert = 1).

Следующие две диаграммы иллюстрируют два параметра для async_insert и wait_for_async_insert:

<Image img={asyncInsert02} size="md" alt="Процесс асинхронной вставки - async_insert=1, wait_for_async_insert=1" background="white"/>

<Image img={asyncInsert03} size="md" alt="Процесс асинхронной вставки - async_insert=1, wait_for_async_insert=0" background="white"/>

### Включение асинхронных вставок {#enabling-asynchronous-inserts}

Асинхронные вставки можно включить для конкретного пользователя или для конкретного запроса:

- Включение асинхронных вставок на уровне пользователя. Этот пример использует пользователя `default`, если вы создаете другого пользователя, замените это имя пользователя:
  ```sql
  ALTER USER default SETTINGS async_insert = 1
  ```
- Вы можете указать настройки асинхронной вставки, используя предложение SETTINGS в запросах на вставку:
  ```sql
  INSERT INTO YourTable SETTINGS async_insert=1, wait_for_async_insert=1 VALUES (...)
  ```
- Вы также можете указать настройки асинхронной вставки в качестве параметров подключения при использовании клиента языка программирования ClickHouse.

  Например, так вы можете сделать это в строке подключения JDBC, когда вы используете драйвер ClickHouse Java JDBC для подключения к ClickHouse Cloud:
  ```bash
  "jdbc:ch://HOST.clickhouse.cloud:8443/?user=default&password=PASSWORD&ssl=true&custom_http_params=async_insert=1,wait_for_async_insert=1"
  ```
Наша сильная рекомендация - использовать async_insert=1, wait_for_async_insert=1, если вы используете асинхронные вставки. Использование wait_for_async_insert=0 очень рискованно, потому что ваш клиент INSERT может не знать, если произошли ошибки, а также может вызвать потенциальную перегрузку, если ваш клиент продолжает писать быстро в ситуации, когда сервер ClickHouse должен замедлить записи и создать некоторое обратное давление, чтобы обеспечить надежность сервиса.

:::note Автоматическая дедупликация по умолчанию отключена при использовании асинхронных вставок
Ручное пакетирование (см. [bulk insert](/cloud/bestpractices/bulkinserts.md))) имеет преимущество, поскольку поддерживает [встроенную автоматическую дедупликацию](/engines/table-engines/mergetree-family/replication.md) данных таблицы, если (в точности) один и тот же запрос на вставку отправляется несколько раз в ClickHouse Cloud, например, из-за автоматической повторной попытки в клиентском программном обеспечении из-за временных проблем с сетевым подключением.
:::

