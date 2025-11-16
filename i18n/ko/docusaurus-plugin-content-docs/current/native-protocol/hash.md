---
'slug': '/native-protocol/hash'
'sidebar_position': 5
'title': 'CityHash'
'description': '네이티브 프로토콜 해시'
'doc_type': 'reference'
'keywords':
- 'CityHash'
- 'native protocol hash'
- 'hash function'
- 'Google CityHash'
- 'protocol hashing'
---


# CityHash

ClickHouse는 **이전** 버전의 [Google의 CityHash](https://github.com/google/cityhash)를 사용합니다.

:::info
CityHash는 ClickHouse에 추가한 이후 알고리즘이 변경되었습니다.

CityHash 문서에서는 사용자가 특정 해시 값에 의존하지 말고, 이를 어디에 저장하거나 샤딩 키로 사용하지 말 것을 명시적으로 언급하고 있습니다.

하지만 이 기능을 사용자에게 노출했기 때문에 CityHash의 버전을 고정해야 했습니다(1.0.2로). 이제 SQL에서 사용 가능한 CityHash 함수의 동작이 변경되지 않을 것이라고 보장합니다.

— Alexey Milovidov
:::

:::note 노트

Google의 현재 버전 CityHash는 [ClickHouse의 `cityHash64` 변형과](https://github.com/ClickHouse/ClickHouse/issues/8354) 다릅니다.

Google의 CityHash 값을 얻기 위해 `farmHash64`를 사용하지 마세요! [FarmHash](https://opensource.googleblog.com/2014/03/introducing-farmhash.html)는 CityHash의 후속 버전이지만 완전히 호환되지는 않습니다.

| 문자열                                                     | ClickHouse64         | CityHash64          | FarmHash64           |
|------------------------------------------------------------|----------------------|---------------------|----------------------|
| `Moscow`                                                   | 12507901496292878638 | 5992710078453357409 | 5992710078453357409  |
| `How can you write a big system without C++?  -Paul Glick` | 6237945311650045625  | 749291162957442504  | 11716470977470720228 |

:::

또한 [Introducing CityHash](https://opensource.googleblog.com/2011/04/introducing-cityhash.html)를 참조하여 설명과 생성 이유를 확인하십시오. TL;DR **비암호화** 해시로, [MurmurHash](http://en.wikipedia.org/wiki/MurmurHash)보다 빠르지만 더 복잡합니다.

## 구현 {#implementations}

### Go {#go}

두 가지 변형을 모두 구현하는 [go-faster/city](https://github.com/go-faster/city) Go 패키지를 사용할 수 있습니다.
