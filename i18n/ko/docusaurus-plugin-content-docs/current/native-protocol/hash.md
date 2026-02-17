---
slug: /native-protocol/hash
sidebar_position: 5
title: 'CityHash'
description: '네이티브 프로토콜 해시'
doc_type: 'reference'
keywords: ['CityHash', '네이티브 프로토콜 해시', '해시 함수', 'Google CityHash', '프로토콜 해싱']
---

# CityHash \{#cityhash\}

ClickHouse는 [Google의 CityHash](https://github.com/google/cityhash) **이전 버전 중 하나**를 사용합니다.

:::info
CityHash는 ClickHouse에 추가한 이후 알고리즘이 변경되었습니다.

CityHash 문서에서는 특정 해시 값에 의존하거나,
이를 어디엔가 저장하거나 세그먼트 키로 사용하지 말라고 명시적으로 안내합니다.

그러나 이 함수를 사용자에게 노출했기 때문에 CityHash의 버전을 1.0.2로 고정해야 했습니다. 이제 SQL에서 사용할 수 있는 CityHash 함수의 동작은 변경되지 않음을 보장합니다.

— Alexey Milovidov
:::

:::note Note

현재 Google의 CityHash 버전은 ClickHouse `cityHash64` 변형과 [다릅니다](https://github.com/ClickHouse/ClickHouse/issues/8354).

Google의 CityHash 값을 얻기 위해 `farmHash64`를 사용하지 마십시오! [FarmHash](https://opensource.googleblog.com/2014/03/introducing-farmhash.html)는 CityHash의 후속 버전이지만, 완전히 호환되지는 않습니다.

| String                                                     | ClickHouse64         | CityHash64          | FarmHash64           |
|------------------------------------------------------------|----------------------|---------------------|----------------------|
| `Moscow`                                                   | 12507901496292878638 | 5992710078453357409 | 5992710078453357409  |
| `How can you write a big system without C++?  -Paul Glick` | 6237945311650045625  | 749291162957442504  | 11716470977470720228 |

:::

또한 CityHash의 설명과 설계 배경은 [Introducing CityHash](https://opensource.googleblog.com/2011/04/introducing-cityhash.html)를 참고하십시오. 요약하면, **비암호화(non-cryptographic)** 해시이며 [MurmurHash](http://en.wikipedia.org/wiki/MurmurHash)보다 빠르지만 더 복잡합니다.

## 구현체 \{#implementations\}

### Go \{#go\}

두 가지 버전 모두를 구현한 [go-faster/city](https://github.com/go-faster/city) Go 패키지를 사용할 수 있습니다.