---
slug: /native-protocol/hash
sidebar_position: 5
title: 'CityHash'
description: 'Хеш функции нативного протокола'
---


# CityHash

ClickHouse использует **одну из предыдущих** версий [CityHash от Google](https://github.com/google/cityhash).

:::info
CityHash изменил алгоритм после того, как мы добавили его в ClickHouse.

Документация CityHash особенно отмечает, что пользователю не следует полагаться на конкретные значения хеша и не следует сохранять их или использовать в качестве ключа шардирования.

Но так как мы предоставили эту функцию пользователю, нам пришлось зафиксировать версию CityHash (до 1.0.2). Теперь мы гарантируем, что поведение функций CityHash, доступных в SQL, не изменится.

— Alexey Milovidov
:::

:::note Заметка

Текущая версия CityHash от Google [отличается](https://github.com/ClickHouse/ClickHouse/issues/8354) от варианта ClickHouse `cityHash64`.

Не используйте `farmHash64`, чтобы получить значение CityHash от Google! [FarmHash](https://opensource.googleblog.com/2014/03/introducing-farmhash.html) является преемником CityHash, но они не полностью совместимы.

| Строка                                                     | ClickHouse64         | CityHash64          | FarmHash64           |
|------------------------------------------------------------|----------------------|---------------------|----------------------|
| `Москва`                                                  | 12507901496292878638 | 5992710078453357409 | 5992710078453357409  |
| `Как вы можете написать большую систему без C++? -Пол Глик` | 6237945311650045625  | 749291162957442504  | 11716470977470720228 |

:::

Также смотрите [Введение в CityHash](https://opensource.googleblog.com/2011/04/introducing-cityhash.html) для описания и
обоснования создания. TL;DR **некриптографический** хеш, который быстрее, чем [MurmurHash](http://en.wikipedia.org/wiki/MurmurHash), но более сложный.

## Реализации {#implementations}

### Go {#go}

Вы можете использовать [go-faster/city](https://github.com/go-faster/city) Go пакет, который реализует оба варианта.
