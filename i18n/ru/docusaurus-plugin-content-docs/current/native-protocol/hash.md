---
slug: '/native-protocol/hash'
sidebar_position: 5
description: 'Хеш протокола Native'
title: CityHash
doc_type: reference
---
# CityHash

ClickHouse использует **одну из предыдущих** версий [CityHash от Google](https://github.com/google/cityhash).

:::info
CityHash изменил алгоритм после того, как мы добавили его в ClickHouse.

Документация CityHash специально отмечает, что пользователь не должен полагаться на конкретные значения хешей и не должен сохранять их где-либо или использовать в качестве ключа шардирования.

Но поскольку мы открыли эту функцию для пользователей, нам пришлось зафиксировать версию CityHash (на 1.0.2). И теперь мы гарантируем, что поведение функций CityHash, доступных в SQL, не изменится.

— Алексей Миловидов
:::

:::note Заметка

Текущая версия CityHash от Google [отличается](https://github.com/ClickHouse/ClickHouse/issues/8354) от варианта `cityHash64` в ClickHouse.

Не используйте `farmHash64` для получения значения CityHash от Google! [FarmHash](https://opensource.googleblog.com/2014/03/introducing-farmhash.html) является преемником CityHash, но они не полностью совместимы.

| Строка                                                     | ClickHouse64         | CityHash64          | FarmHash64           |
|-----------------------------------------------------------|----------------------|---------------------|----------------------|
| `Москва`                                                  | 12507901496292878638 | 5992710078453357409 | 5992710078453357409  |
| `Как можно написать большую систему без C++? -Пол Глик`  | 6237945311650045625  | 749291162957442504  | 11716470977470720228 |

:::

Также смотрите [Представляем CityHash](https://opensource.googleblog.com/2011/04/introducing-cityhash.html) для описания и
обоснования создания. TL;DR **некриптографический** хеш, который быстрее, чем [MurmurHash](http://en.wikipedia.org/wiki/MurmurHash), но более сложный.

## Реализации {#implementations}

### Go {#go}

Вы можете использовать пакет [go-faster/city](https://github.com/go-faster/city), который реализует обе версии.