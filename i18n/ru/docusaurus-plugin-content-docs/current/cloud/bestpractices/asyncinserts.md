---
slug: '/cloud/bestpractices/asynchronous-inserts'
sidebar_label: 'Асинхронные вставки'
title: 'Асинхронные вставки (async_insert)'
description: 'Описание того, как использовать асинхронные вставки в ClickHouse в качестве альтернативной лучшей практики по пакетной загрузке'
---

import Image from '@theme/IdealImage';
import asyncInsert01 from '@site/static/images/cloud/bestpractices/async-01.png';
import asyncInsert02 from '@site/static/images/cloud/bestpractices/async-02.png';
import asyncInsert03 from '@site/static/images/cloud/bestpractices/async-03.png';

Вставка данных в ClickHouse большими пакетами является лучшей практикой. Это экономит вычислительные циклы и ввод-вывод диска, а значит, и деньги. Если ваш случай использования позволяет вам пакетировать вставки вне ClickHouse, то это один из вариантов. Если вы хотите, чтобы ClickHouse создавал пакеты, вы можете использовать асинхронный режим INSERT, описанный здесь.

Используйте асинхронные вставки как альтернативу как пакетной загрузке данных на стороне клиента, так и поддержанию скорости вставки на уровне около одного запроса вставки в секунду, включив настройку [async_insert](/operations/settings/settings.md/#async_insert). Это заставляет ClickHouse обрабатывать пакетирование на стороне сервера.

По умолчанию ClickHouse записывает данные синхронно. Каждый запрос вставки, отправленный в ClickHouse, вызывает немедленное создание части, содержащей данные из вставки. Это поведение по умолчанию, когда настройка async_insert установлена на значение по умолчанию 0:

<Image img={asyncInsert01} size="md" alt="Процесс асинхронной вставки - синхронные вставки по умолчанию" background="white"/>

Установив async_insert в 1, ClickHouse сначала сохраняет входящие вставки в буфер в памяти перед регулярной выгрузкой их на диск.

Существуют два возможных условия, которые могут привести к тому, что ClickHouse выгрузит буфер на диск:
- размер буфера достиг N байт (N настраивается через [async_insert_max_data_size](/operations/settings/settings.md/#async_insert_max_data_size))
- прошло как минимум N мс с момента последней выгрузки буфера (N настраивается через [async_insert_busy_timeout_max_ms](/operations/settings/settings.md/#async_insert_busy_timeout_max_ms))

Каждый раз, когда выполняется любое из вышеперечисленных условий, ClickHouse выгоняет свой буфер в памяти на диск.

:::note
Ваши данные доступны для запросов на чтение, как только данные записаны в часть на хранилище. Имейте это в виду, когда вы хотите изменить `async_insert_busy_timeout_ms` (по умолчанию установлено в 1 секунду) или настройки `async_insert_max_data_size` (по умолчанию установлено в 10 MiB).
:::

С помощью настройки [wait_for_async_insert](/operations/settings/settings.md/#wait_for_async_insert) вы можете настроить, хотите ли вы, чтобы оператор вставки возвращал подтверждение либо немедленно после того, как данные были вставлены в буфер (wait_for_async_insert = 0), либо, по умолчанию, после того, как данные были записаны в часть после выгрузки из буфера (wait_for_async_insert = 1).

Следующие две диаграммы иллюстрируют две настройки для async_insert и wait_for_async_insert:

<Image img={asyncInsert02} size="md" alt="Процесс асинхронной вставки - async_insert=1, wait_for_async_insert=1" background="white"/>

<Image img={asyncInsert03} size="md" alt="Процесс асинхронной вставки - async_insert=1, wait_for_async_insert=0" background="white"/>

### Включение асинхронных вставок {#enabling-asynchronous-inserts}

Асинхронные вставки можно включить для конкретного пользователя или для конкретного запроса:

- Включение асинхронных вставок на уровне пользователя. Этот пример использует пользователя `default`, если вы создаете другого пользователя, замените это имя пользователя:
  ```sql
  ALTER USER default SETTINGS async_insert = 1
  ```
- Вы можете указать настройки асинхронной вставки, используя клаузу SETTINGS в запросах вставки:
  ```sql
  INSERT INTO YourTable SETTINGS async_insert=1, wait_for_async_insert=1 VALUES (...)
  ```
- Вы также можете указать настройки асинхронной вставки как параметры подключения при использовании клиента языка программирования ClickHouse.

  Например, вот как это можно сделать в строке подключения JDBC, когда вы используете драйвер ClickHouse Java JDBC для подключения к ClickHouse Cloud:
  ```bash
  "jdbc:ch://HOST.clickhouse.cloud:8443/?user=default&password=PASSWORD&ssl=true&custom_http_params=async_insert=1,wait_for_async_insert=1"
  ```
Наша настоятельная рекомендация - использовать async_insert=1,wait_for_async_insert=1 при использовании асинхронных вставок. Использование wait_for_async_insert=0 очень рискованно, так как ваш клиент INSERT может не знать о наличии ошибок, а также может привести к потенциальной перегрузке, если ваш клиент продолжит быстро записывать в ситуации, когда сервер ClickHouse должен замедлить записи и создать некоторый обратный нажим для обеспечения надежности сервиса.

:::note Автоматическая дедупликация по умолчанию отключена при использовании асинхронных вставок
Ручная пакетная загрузка (см. [bulk insert](/cloud/bestpractices/bulkinserts.md))) имеет преимущество, так как поддерживает [встроенную автоматическую дедупликацию](/engines/table-engines/mergetree-family/replication.md) данных таблицы, если (ровно) один и тот же оператор вставки отправляется несколько раз в ClickHouse Cloud, например, из-за автоматической попытки повторной отправки в клиентском ПО из-за временных проблем с сетевым соединением.
:::

