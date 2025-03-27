---
slug: /native-protocol/hash
sidebar_position: 5
title: 'CityHash'
description: 'Хеширование встроенного протокола'
---


# CityHash

ClickHouse использует **одну из предыдущих** версий [CityHash от Google](https://github.com/google/cityhash).

:::info
CityHash изменил алгоритм после того, как мы добавили его в ClickHouse.

Документация CityHash специально отмечает, что пользователи не должны полагаться на конкретные значения хеша и не должны сохранять их где-либо или использовать в качестве ключа шардирования.

Но поскольку мы предоставили эту функцию пользователям, нам пришлось зафиксировать версию CityHash (до 1.0.2). Теперь мы гарантируем, что поведение функций CityHash, доступных в SQL, не изменится.

— Алексей Миловидов
:::

:::note Примечание

Текущая версия CityHash от Google [отличается](https://github.com/ClickHouse/ClickHouse/issues/8354) от варианта `cityHash64` в ClickHouse.

Не используйте `farmHash64` для получения значения CityHash от Google! [FarmHash](https://opensource.googleblog.com/2014/03/introducing-farmhash.html) является преемником CityHash, но они не полностью совместимы.

| Строка                                                  | ClickHouse64         | CityHash64          | FarmHash64           |
|--------------------------------------------------------|----------------------|---------------------|----------------------|
| `Москва`                                               | 12507901496292878638 | 5992710078453357409 | 5992710078453357409  |
| `Как можно написать большую систему без C++?  -Пол Глик` | 6237945311650045625  | 749291162957442504  | 11716470977470720228 |

:::

Смотрите также [Введение в CityHash](https://opensource.googleblog.com/2011/04/introducing-cityhash.html) для описания и 
обоснования создания. TL;DR **некриптографический** хеш, который быстрее, чем [MurmurHash](http://en.wikipedia.org/wiki/MurmurHash), но более сложный.

## Реализации {#implementations}

### Go {#go}

Вы можете использовать [go-faster/city](https://github.com/go-faster/city) — пакет Go, который реализует оба варианта.
