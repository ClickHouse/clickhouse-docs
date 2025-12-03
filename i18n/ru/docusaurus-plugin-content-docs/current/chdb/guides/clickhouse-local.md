---
title: 'Использование базы данных clickhouse-local'
sidebar_label: 'Использование базы данных clickhouse-local'
slug: /chdb/guides/clickhouse-local
description: 'Узнайте, как использовать базу данных clickhouse-local в chDB'
keywords: ['chdb', 'clickhouse-local']
doc_type: 'guide'
---

[clickhouse-local](/operations/utilities/clickhouse-local) — это CLI со встроенной версией ClickHouse.
Он предоставляет пользователям мощь ClickHouse без необходимости устанавливать сервер.
В этом руководстве мы рассмотрим, как использовать базу данных clickhouse-local в chDB.

## Настройка {#setup}

Сначала создадим виртуальное окружение:

```bash
python -m venv .venv
source .venv/bin/activate
```

Теперь установим chDB.
Убедитесь, что у вас установлена версия не ниже 2.0.2:

```bash
pip install "chdb>=2.0.2"
```

А теперь установим [ipython](https://ipython.org/):

```bash
pip install ipython
```

Мы будем использовать `ipython` для выполнения команд далее в руководстве, который можно запустить следующей командой:

```bash
ipython
```

## Установка clickhouse-local {#installing-clickhouse-local}

Загрузка и установка clickhouse-local выполняется так же, как [загрузка и установка ClickHouse](/install).
Сделать это можно, выполнив следующую команду:

```bash
curl https://clickhouse.com/ | sh
```

Чтобы запустить clickhouse-local с сохранением данных в директорию, необходимо указать параметр `--path`:

```bash
./clickhouse -m --path demo.chdb
```

## Приём данных в clickhouse-local {#ingesting-data-into-clickhouse-local}

База данных по умолчанию хранит данные только в памяти, поэтому нам нужно создать именованную базу данных, чтобы гарантировать сохранение всех принимаемых данных на диск.

```sql
CREATE DATABASE foo;
```

Давайте создадим таблицу и заполним её несколькими случайными числами:

```sql
CREATE TABLE foo.randomNumbers
ORDER BY number AS
SELECT rand() AS number
FROM numbers(10_000_000);
```

Давайте напишем запрос, чтобы посмотреть, какие данные мы получили:

```sql
SELECT quantilesExact(0, 0.5, 0.75, 0.99)(number) AS quants
FROM foo.randomNumbers

┌─quants────────────────────────────────┐
│ [69,2147776478,3221525118,4252096960] │
└───────────────────────────────────────┘
```

После этого обязательно выполните команду `exit;` в CLI, так как только один процесс может удерживать блокировку на этом каталоге.
Если этого не сделать, при попытке подключиться к базе данных через chDB мы получим следующую ошибку:

```text
ChdbError: Код: 76. DB::Exception: Не удается заблокировать файл demo.chdb/status. Другой экземпляр сервера в этом каталоге уже запущен. (CANNOT_OPEN_FILE)
```

## Подключение к базе данных clickhouse-local {#connecting-to-a-clickhouse-local-database}

Вернитесь в оболочку `ipython` и импортируйте модуль `session` из chDB:

```python
from chdb import session as chs
```

Инициализируйте сессию, работающую с `demo..chdb`:

```python
sess = chs.Session("demo.chdb")
```

Затем мы можем выполнить тот же запрос, который возвращает квантили значений:

```python
sess.query("""
SELECT quantilesExact(0, 0.5, 0.75, 0.99)(number) AS quants
FROM foo.randomNumbers
""", "Vertical")

Строка 1:
──────
quants: [0,9976599,2147776478,4209286886]
```

Мы также можем записывать данные в эту базу данных из chDB:

```python
sess.query("""
INSERT INTO foo.randomNumbers
SELECT rand() AS number FROM numbers(10_000_000)
""")

Row 1:
──────
quants: [0,9976599,2147776478,4209286886]
```

Затем мы можем повторно выполнить запрос квантилей из chDB или clickhouse-local.
