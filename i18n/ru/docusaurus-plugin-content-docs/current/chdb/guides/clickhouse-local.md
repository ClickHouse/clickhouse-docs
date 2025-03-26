---
title: 'Использование базы данных clickhouse-local'
sidebar_label: 'Использование базы данных clickhouse-local'
slug: /chdb/guides/clickhouse-local
description: 'Узнайте, как использовать базу данных clickhouse-local с chDB'
keywords: ['chdb', 'clickhouse-local']
---

[clickhouse-local](/operations/utilities/clickhouse-local) — это CLI с встроенной версией ClickHouse. Он предоставляет пользователям возможности ClickHouse без необходимости установки сервера. В этом руководстве мы научимся использовать базу данных clickhouse-local из chDB.

## Настройка {#setup}

Сначала создадим виртуальную среду:

```bash
python -m venv .venv
source .venv/bin/activate
```

Теперь установим chDB. Убедитесь, что у вас версия 2.0.2 или выше:

```bash
pip install "chdb>=2.0.2"
```

Теперь мы установим [ipython](https://ipython.org/):

```bash
pip install ipython
```

Мы будем использовать `ipython` для выполнения команд в остальной части руководства, который можно запустить, выполнив:

```bash
ipython
```

## Установка clickhouse-local {#installing-clickhouse-local}

Загрузка и установка clickhouse-local такие же, как [загрузка и установка ClickHouse](/install). Мы можем сделать это, выполнив следующую команду:

```bash
curl https://clickhouse.com/ | sh
```

Чтобы запустить clickhouse-local с сохранением данных в директорию, необходимо передать параметр `--path`:

```bash
./clickhouse -m --path demo.chdb
```

## Прием данных в clickhouse-local {#ingesting-data-into-clickhouse-local}

По умолчанию база данных хранит данные только в памяти, поэтому нам нужно создать именованную базу данных, чтобы убедиться, что любые данные, которые мы принимаем, сохраняются на диск.

```sql
CREATE DATABASE foo;
```

Создадим таблицу и вставим несколько случайных чисел:

```sql
CREATE TABLE foo.randomNumbers
ORDER BY number AS
SELECT rand() AS number
FROM numbers(10_000_000);
```

Напишем запрос, чтобы увидеть, какие данные мы получили:

```sql
SELECT quantilesExact(0, 0.5, 0.75, 0.99)(number) AS quants
FROM foo.randomNumbers

┌─quants────────────────────────────────┐
│ [69,2147776478,3221525118,4252096960] │
└───────────────────────────────────────┘
```

После этого убедитесь, что вы `exit;` из CLI, поскольку только один процесс может удерживать блокировку на этой директории. Если этого не сделать, мы получим следующую ошибку, когда попробуем подключиться к базе данных из chDB:

```text
ChdbError: Code: 76. DB::Exception: Cannot lock file demo.chdb/status. Another server instance in same directory is already running. (CANNOT_OPEN_FILE)
```

## Подключение к базе данных clickhouse-local {#connecting-to-a-clickhouse-local-database}

Вернитесь в оболочку `ipython` и импортируйте модуль `session` из chDB:

```python
from chdb import session as chs
```

Инициализируйте сессию, указывая на `demo.chdb`:

```python
sess = chs.Session("demo.chdb")
```

Теперь мы можем выполнить тот же запрос, который возвращает квантиль чисел:

```python
sess.query("""
SELECT quantilesExact(0, 0.5, 0.75, 0.99)(number) AS quants
FROM foo.randomNumbers
""", "Vertical")

Row 1:
──────
quants: [0,9976599,2147776478,4209286886]
```

Мы также можем вставлять данные в эту базу данных из chDB:

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
