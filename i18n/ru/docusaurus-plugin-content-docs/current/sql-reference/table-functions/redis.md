---
slug: /sql-reference/table-functions/redis
sidebar_position: 170
sidebar_label: redis
title: 'redis'
description: 'Этот.table-функция позволяет интегрировать ClickHouse с Redis.'
---


# redis Table Function

Эта.table-функция позволяет интегрировать ClickHouse с [Redis](https://redis.io/).

**Синтаксис**

```sql
redis(host:port, key, structure[, db_index[, password[, pool_size]]])
```

**Аргументы**

- `host:port` — Адрес сервера Redis, вы можете игнорировать порт, и будет использоваться порт по умолчанию 6379.

- `key` — любое название колонки в списке колонок.

- `structure` — Схема для таблицы ClickHouse, возвращаемой этой функцией.

- `db_index` — Индекс базы данных Redis в диапазоне от 0 до 15, по умолчанию 0.

- `password` — Пароль пользователя, по умолчанию пустая строка.

- `pool_size` — Максимальный размер пула соединений Redis, по умолчанию 16.

- `primary` должен быть указан, он поддерживает только одну колонку в первичном ключе. Первичный ключ будет сериализован в двоичном виде как ключ Redis.

- Колонки, отличные от первичного ключа, будут сериализованы в двоичном виде как значение Redis в соответствующем порядке.

- Запросы с ключом, равным или в фильтрации, будут оптимизированы для много ключевой выборки из Redis. Если запросы без фильтрации ключа, будет происходить полное сканирование таблицы, что является тяжелой операцией.

[Именованные коллекции](/operations/named-collections.md) не поддерживаются для функции.table `redis` в данный момент.

**Возвращаемое значение**

Объект таблицы с ключом как ключ Redis, другие колонки упакованы вместе как значение Redis.

## Пример использования {#usage-example}

Чтение из Redis:

```sql
SELECT * FROM redis(
    'redis1:6379',
    'key',
    'key String, v1 String, v2 UInt32'
)
```

Вставка в Redis:

```sql
INSERT INTO TABLE FUNCTION redis(
    'redis1:6379',
    'key',
    'key String, v1 String, v2 UInt32') values ('1', '1', 1);
```

**Смотрите также**

- [Драйвер `Redis`](/engines/table-engines/integrations/redis.md)
- [Использование redis в качестве источника словаря](/sql-reference/dictionaries/index.md#redis)
