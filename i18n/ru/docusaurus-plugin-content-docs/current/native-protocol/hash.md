---
slug: /native-protocol/hash
sidebar_position: 5
title: 'CityHash'
description: 'Хеш native-протокола'
doc_type: 'reference'
keywords: ['CityHash', 'native protocol hash', 'hash function', 'Google CityHash', 'protocol hashing']
---



# CityHash

ClickHouse использует **одну из предыдущих** версий [CityHash от Google](https://github.com/google/cityhash).

:::info
CityHash изменил алгоритм после того, как мы добавили его в ClickHouse.

В документации CityHash отдельно отмечено, что пользователю не следует полагаться на 
конкретные значения хэша, а также не следует где‑либо их сохранять или использовать в качестве ключа шардинга.

Но так как мы предоставили эту функцию пользователям, нам пришлось зафиксировать версию CityHash (на 1.0.2). И теперь мы гарантируем, что поведение функций CityHash, доступных в SQL, не изменится.

— Алексей Миловидов
:::

:::note Note

Текущая версия CityHash от Google [отличается](https://github.com/ClickHouse/ClickHouse/issues/8354) от варианта ClickHouse `cityHash64`.

Не используйте `farmHash64` для получения значения CityHash от Google! [FarmHash](https://opensource.googleblog.com/2014/03/introducing-farmhash.html) является преемником CityHash, но они не полностью совместимы.

| String                                                     | ClickHouse64         | CityHash64          | FarmHash64           |
|------------------------------------------------------------|----------------------|---------------------|----------------------|
| `Moscow`                                                   | 12507901496292878638 | 5992710078453357409 | 5992710078453357409  |
| `How can you write a big system without C++?  -Paul Glick` | 6237945311650045625  | 749291162957442504  | 11716470977470720228 |

:::

См. также [Introducing CityHash](https://opensource.googleblog.com/2011/04/introducing-cityhash.html) для описания и
обоснования его создания. TL;DR: это **некриптографическая** хэш‑функция, которая работает быстрее, чем [MurmurHash](http://en.wikipedia.org/wiki/MurmurHash), но при этом сложнее.



## Реализации {#implementations}

### Go {#go}

Можно использовать пакет Go [go-faster/city](https://github.com/go-faster/city), который реализует оба варианта.
