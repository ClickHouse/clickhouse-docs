---
title: 'Использование базы данных clickhouse-local'
sidebar_label: 'Использование базы данных clickhouse-local'
slug: /chdb/guides/clickhouse-local
description: 'Узнайте, как использовать базу данных clickhouse-local с chDB'
keywords: ['chdb', 'clickhouse-local']
doc_type: 'guide'
---

[clickhouse-local](/operations/utilities/clickhouse-local) — это CLI с встроенной версией ClickHouse.
Он предоставляет пользователям возможности ClickHouse без необходимости устанавливать сервер.
В этом руководстве мы рассмотрим, как использовать базу данных clickhouse-local из chDB.



## Настройка {#setup}

Для начала создадим виртуальное окружение:

```bash
python -m venv .venv
source .venv/bin/activate
```

Теперь установим chDB.
Убедитесь, что используется версия 2.0.2 или выше:

```bash
pip install "chdb>=2.0.2"
```

Далее установим [ipython](https://ipython.org/):

```bash
pip install ipython
```

Для выполнения команд в остальной части руководства будем использовать `ipython`, который можно запустить следующей командой:

```bash
ipython
```


## Установка clickhouse-local {#installing-clickhouse-local}

Загрузка и установка clickhouse-local выполняется так же, как [загрузка и установка ClickHouse](/install).
Для этого выполните следующую команду:

```bash
curl https://clickhouse.com/ | sh
```

Чтобы запустить clickhouse-local с сохранением данных в каталог, необходимо указать параметр `--path`:

```bash
./clickhouse -m --path demo.chdb
```


## Загрузка данных в clickhouse-local {#ingesting-data-into-clickhouse-local}

База данных по умолчанию хранит данные только в памяти, поэтому необходимо создать именованную базу данных, чтобы загружаемые данные сохранялись на диске.

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

Напишем запрос, чтобы посмотреть, какие данные у нас есть:

```sql
SELECT quantilesExact(0, 0.5, 0.75, 0.99)(number) AS quants
FROM foo.randomNumbers

┌─quants────────────────────────────────┐
│ [69,2147776478,3221525118,4252096960] │
└───────────────────────────────────────┘
```

После этого обязательно выполните `exit;` из CLI, так как только один процесс может удерживать блокировку этого каталога.
Если этого не сделать, при попытке подключения к базе данных из chDB возникнет следующая ошибка:

```text
ChdbError: Code: 76. DB::Exception: Невозможно заблокировать файл demo.chdb/status. Другой экземпляр сервера в том же каталоге уже запущен. (CANNOT_OPEN_FILE)
```


## Подключение к базе данных clickhouse-local {#connecting-to-a-clickhouse-local-database}

Вернитесь в оболочку `ipython` и импортируйте модуль `session` из chDB:

```python
from chdb import session as chs
```

Инициализируйте сессию, указывающую на `demo.chdb`:

```python
sess = chs.Session("demo.chdb")
```

Затем можно выполнить тот же запрос, который возвращает квантили чисел:

```python
sess.query("""
SELECT quantilesExact(0, 0.5, 0.75, 0.99)(number) AS quants
FROM foo.randomNumbers
""", "Vertical")

Row 1:
──────
quants: [0,9976599,2147776478,4209286886]
```

Также можно вставить данные в эту базу данных из chDB:

```python
sess.query("""
INSERT INTO foo.randomNumbers
SELECT rand() AS number FROM numbers(10_000_000)
""")

Row 1:
──────
quants: [0,9976599,2147776478,4209286886]
```

После этого можно повторно выполнить запрос квантилей из chDB или clickhouse-local.
