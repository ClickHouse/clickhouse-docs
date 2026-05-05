---
description: 'ClickHouse C++ 클라이언트 라이브러리 및 u-server 프레임워크와의 통합에 대한 문서'
sidebar_label: 'C++'
sidebar_position: 24
slug: /interfaces/cpp
title: 'C++ 클라이언트 라이브러리'
doc_type: 'reference'
---

# C++ 클라이언트 라이브러리 \{#c-client-library\}

`clickhouse-cpp`는 ClickHouse를 위한 공식 C++ 클라이언트 라이브러리로, ClickHouse의 네이티브 바이너리 프로토콜을 사용하여 빠르고 타입 안전한(type-safe) 인터페이스를 제공합니다.

빌드 지침, 사용 예시, 추가 문서는 프로젝트의 GitHub 리포지토리에서 확인할 수 있습니다: [https://github.com/ClickHouse/clickhouse-cpp](https://github.com/ClickHouse/clickhouse-cpp). 

:::note
이 라이브러리는 활발하게 개발 중입니다. 이미 핵심 ClickHouse 기능을 지원하지만, 일부 기능과 데이터 타입(data type)은 아직 완전히 구현되지 않았거나 지원되지 않을 수 있습니다.

피드백은 매우 중요하며, 새로운 기능과 개선 사항의 우선순위를 정하는 데 큰 도움이 됩니다. 제한 사항, 누락된 기능, 예기치 않은 동작을 발견하는 경우, 다음 이슈 트래커를 통해 관찰 내용이나 기능 요청을 공유해 주십시오: 
[https://github.com/ClickHouse/clickhouse-cpp/issues](https://github.com/ClickHouse/clickhouse-cpp/issues)
:::

## 프로젝트에 라이브러리 포함하기 \{#including-library-into-project\}

라이브러리를 프로젝트에 포함하는 가장 간단한 방법은 CMake의 `FetchContent`
모듈을 사용하는 것입니다. 이 방법을 사용하면 라이브러리의 정확한 버전을 고정하고
일반적인 CMake 워크플로에 통합된 형태로 함께 빌드할 수 있습니다.

```cmake
include(FetchContent)

set(WITH_OPENSSL YES CACHE BOOL "Enable OpenSSL in clickhouse-cpp" FORCE)
FetchContent_Declare(
    clickhouse-cpp
    GIT_REPOSITORY https://github.com/ClickHouse/clickhouse-cpp.git
    GIT_TAG v2.6.0   # can also be `master` or other banch
)
FetchContent_MakeAvailable(clickhouse-cpp)
```

`WITH_OPENSSL` 옵션은 라이브러리에서 TLS 지원을 활성화하며,
ClickHouse Cloud 또는 기타 SSL이 활성화된 ClickHouse 배포에 연결할 때 필요합니다.
TLS를 사용하지 않는 연결에서는 생략할 수 있지만, 일반적으로 활성화하는 것을 권장합니다.

SSL 지원을 포함하여 빌드하려면 OpenSSL 개발 패키지가 설치되어 있어야 합니다.
Debian, Ubuntu 또는 그 파생 배포판에서는 `libssl-dev`를, Fedora, Red Hat에서는 `openssl-devel`을,
macOS에서는 Homebrew를 사용하여 `openssl`을 설치하십시오.

의존성이 준비되면, 내보낸 라이브러리 타깃에 대상 바이너리를 링크하십시오:

```cmake
target_link_libraries(your-target PRIVATE clickhouse-cpp-lib)
```


## 예제 \{#examples\}

### 클라이언트 객체 설정 \{#example-setup-client\}

ClickHouse에 연결을 설정하려면 `Client` 인스턴스를 생성합니다. 다음 예시는 비밀번호가 필요 없고 SSL이
사용되지 않는 로컬 ClickHouse 인스턴스에 연결하는 방법을 보여줍니다.

```cpp
#include <clickhouse/client.h>

clickhouse::Client client{clickhouse::ClientOptions().SetHost("localhost")};
```

보다 고급화된 설정에서는 추가적인 구성이 필요합니다. 다음 예제는 여러 추가 매개변수를 사용하여
ClickHouse Cloud 인스턴스에 연결하는 방법을 보여줍니다.

```cpp
#include <clickhouse/client.h>

clickhouse::Client client{
    clickhouse::ClientOptions{}
      .SetHost("your.instance.clickhouse.cloud")
      .SetUser("default")
      .SetPassword("your-password")
      .SetSSLOptions({})   // Enable SSL
      .SetPort(9440)       // for connections over SSL ClickHouse Cloud uses port 9440
    };
```


### 데이터 없이 테이블 생성 및 쿼리 실행 \{#example-create-table\}

테이블 생성과 같이 어떤 데이터도 반환하지 않는 쿼리를 실행하려면 `Execute` 메서드를 사용합니다.
이와 동일한 방식은 `ALTER TABLE`, `DROP` 등의 다른 SQL 문에도 적용됩니다.

```cpp
client.Execute(R"(
    CREATE TABLE IF NOT EXISTS greetings (
        id UInt64,
        message String,
        language String) 
    ENGINE = MergeTree ORDER BY id)");
```


### 데이터 삽입 \{#example-insert-data\}

테이블에 데이터를 삽입하려면 `Block`을 생성하고 테이블 스키마에 맞는 컬럼 객체들로 채웁니다. 데이터는 컬럼별로 추가한 다음, 배치 쓰기에 최적화된 `Insert` 메서드를 사용해 한 번에 삽입합니다.

```cpp
auto id = std::make_shared<clickhouse::ColumnUInt64>();
auto message = std::make_shared<clickhouse::ColumnString>();
auto language = std::make_shared<clickhouse::ColumnString>();

id->Append(1);
message->Append("Hello, World!");
language->Append("English");

id->Append(2);
message->Append("¡Hola, Mundo!");
language->Append("Spanish");

id->Append(3);
message->Append("Hallo wereld!");
language->Append("Dutch");

clickhouse::Block block{};
block.AppendColumn("id", id);
block.AppendColumn("message", message);
block.AppendColumn("language", language);

client.Insert("greetings", block);
```


### 데이터 선택 \{#example-select\}

데이터를 반환하는 쿼리를 실행하려면 `Select` 메서드를 사용하고, 결과를 처리할 콜백을 제공해야 합니다.
쿼리 결과는 ClickHouse의 네이티브 컬럼 지향 데이터 표현 방식을 반영하는 `Block` 객체로 전달됩니다.

```cpp
client.Select(
    "SELECT id, message, language FROM greetings",
    [](const clickhouse::Block & block){
        for (size_t i = 0; i < block.GetRowCount(); ++i) {
            auto id = block[0]->AsStrict<clickhouse::ColumnUInt64>()->At(i);
            auto message = block[1]->AsStrict<clickhouse::ColumnString>()->At(i);
            auto language = block[2]->AsStrict<clickhouse::ColumnString>()->At(i);
            std::cout << id << "\t" << message << "\t" << language << "\n";
        }
    });
```


## 지원되는 데이터 타입 \{#supported-data-types\}

- `UInt8`, `UInt16`, `UInt32`, `UInt64`, `Int8`, `Int16`, `Int32`, `Int64`
- `UInt128`, `Int128`
- `Decimal32`, `Decimal64`, `Decimal128`
- `Float32`, `Float64`
- `Date`
- `DateTime`, `DateTime64`
- `DateTime([timezone])`, `DateTime64(N, [timezone])`
- `UUID`
- `Enum8`, `Enum16`
- `String`
- `FixedString(N)`
- `LowCardinality(String)` 및 `LowCardinality(FixedString(N))`
- `Nullable(T)`
- `Array(T)`
- `Tuple`
- `Map`
- `IPv4`, `IPv6`
- `Point`, `Ring`, `Polygon`, `MultiPolygon`