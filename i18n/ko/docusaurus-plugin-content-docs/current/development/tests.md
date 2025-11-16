---
'description': 'ClickHouse 테스트 및 테스트 스위트 실행에 대한 가이드'
'sidebar_label': '테스트'
'sidebar_position': 40
'slug': '/development/tests'
'title': 'Testing ClickHouse'
'doc_type': 'guide'
---


# Testing ClickHouse

## Functional tests {#functional-tests}

기능 테스트는 가장 간단하고 편리하게 사용할 수 있습니다.
대부분의 ClickHouse 기능은 기능 테스트로 검증할 수 있으며, ClickHouse 코드의 모든 변경 사항은 이러한 방식으로 테스트해야 합니다.

각 기능 테스트는 실행 중인 ClickHouse 서버에 하나 이상의 쿼리를 전송하고 결과를 참조와 비교합니다.

테스트는 `./tests/queries` 디렉토리에 위치합니다.

각 테스트는 두 가지 유형 중 하나일 수 있습니다: `.sql`과 `.sh`.
- `.sql` 테스트는 `clickhouse-client`에 파이프 처리되는 간단한 SQL 스크립트입니다.
- `.sh` 테스트는 스스로 실행되는 스크립트입니다.

일반적으로 SQL 테스트가 `.sh` 테스트보다 선호됩니다.
순수 SQL에서 테스트할 수 없는 기능을 테스트해야 할 때만 `.sh` 테스트를 사용해야 합니다. 예를 들어, 입력 데이터를 `clickhouse-client`로 파이프 처리하거나 `clickhouse-local`을 테스트할 때입니다.

:::note
`DateTime` 및 `DateTime64` 데이터 유형을 테스트할 때의 일반적인 실수는 서버가 특정 시간대를 사용한다고 가정하는 것입니다 (예: "UTC"). 이는 사실이 아니며, CI 테스트 실행 시 시간대는 의도적으로 무작위화됩니다. 테스트 값을 명시적으로 시간대를 지정하는 가장 쉬운 해결 방법은 `toDateTime64(val, 3, 'Europe/Amsterdam')`와 같은 방법입니다.
:::

### Running a test locally {#running-a-test-locally}

ClickHouse 서버를 로컬로 시작하고 기본 포트(9000)를 청취하게 합니다.
예를 들어, `01428_hash_set_nan_key` 테스트를 실행하려면 저장소 폴더로 이동한 후 다음 명령을 실행합니다:

```sh
PATH=<path to clickhouse-client>:$PATH tests/clickhouse-test 01428_hash_set_nan_key
```

테스트 결과(`stderr` 및 `stdout`)는 테스트 자체 옆에 위치한 `01428_hash_set_nan_key.[stderr|stdout]` 파일에 기록됩니다 (예: `queries/0_stateless/foo.sql`의 출력은 `queries/0_stateless/foo.stdout`에 기록됩니다).

모든 `clickhouse-test` 옵션에 대한 내용은 `tests/clickhouse-test --help`를 참조하세요.
모든 테스트를 실행하거나 테스트 이름에 대한 필터를 제공하여 테스트의 일부 집합을 실행할 수 있습니다: `./clickhouse-test substring`.
테스트를 병렬로 실행하거나 무작위 순서로 실행하는 옵션도 있습니다.

### Adding a new test {#adding-a-new-test}

새로운 테스트를 추가하려면 먼저 `queries/0_stateless` 디렉토리에 `.sql` 또는 `.sh` 파일을 생성하세요.
그런 다음 `clickhouse-client < 12345_test.sql > 12345_test.reference` 또는 `./12345_test.sh > ./12345_test.reference`를 사용하여 해당하는 `.reference` 파일을 생성합니다.

테스트는 자동으로 생성된 데이터베이스 `test` 내에서 테이블을 생성, 삭제, 선택하는 등의 작업만 수행해야 합니다.
임시 테이블을 사용하는 것은 괜찮습니다.

CI와 동일한 환경을 로컬에 설정하려면 테스트 구성을 설치하세요 (Zookeeper 모의 구현을 사용하고 몇 가지 설정을 조정합니다).

```sh
cd <repository>/tests/config
sudo ./install.sh
```

:::note
테스트는 다음과 같아야 합니다.
- 최소한의 필요 테이블, 컬럼 및 복잡성을 생성해야 합니다.
- 빠르며: 몇 초 이상 걸리지 않아야 합니다 (더 나은 경우: 수 초 이내로).
- 정확하고 결정론적이어야 하며: 테스트되는 기능이 작동하지 않을 경우에만 실패해야 합니다.
- 독립적/상태 비저장이어야 하며: 환경과 타이밍에 의존하지 않아야 합니다.
- 철저해야 하며: 0, null, 빈 집합, 예외와 같은 모서리 사례를 커버해야 합니다 (부정 테스트, `-- { serverError xyz }` 및 `-- { clientError xyz }` 문법을 사용).
- 테스트가 끝나면 테이블을 정리해야 합니다 (잔여물이 발생한 경우).
- 다른 테스트가 동일한 내용을 테스트하지 않도록 해야 합니다 (즉, 먼저 grep합니다).
:::

### Restricting test runs {#restricting-test-runs}

테스트는 CI에서 실행되는 제한 사항을 지정하는 0개 이상의 _태그_를 가질 수 있습니다.

`.sql` 테스트의 경우 태그는 SQL 주석으로 첫 번째 줄에 위치합니다:

```sql
-- Tags: no-fasttest, no-replicated-database
-- no-fasttest: <provide_a_reason_for_the_tag_here>
-- no-replicated-database: <provide_a_reason_here>

SELECT 1
```

`.sh` 테스트의 경우 태그는 두 번째 줄에 주석으로 작성됩니다:

```bash
#!/usr/bin/env bash

# Tags: no-fasttest, no-replicated-database

# - no-fasttest: <provide_a_reason_for_the_tag_here>

# - no-replicated-database: <provide_a_reason_here>
```

사용 가능한 태그 목록:

|태그 이름 | 동작 | 사용 예시 |
|---|---|---|
| `disabled`|  테스트가 실행되지 않음 ||
| `long` | 테스트 실행 시간이 1분에서 10분으로 연장됨 ||
| `deadlock` | 테스트가 긴 시간 동안 루프에서 실행됨 ||
| `race` | `deadlock`과 동일. `deadlock`을 선호합니다. ||
| `shard` | 서버가 `127.0.0.*`을 청취해야 함 ||
| `distributed` | `shard`와 동일. `shard`를 선호합니다. ||
| `global` | `shard`와 동일. `shard`를 선호합니다. ||
| `zookeeper` | 테스트 실행에 Zookeeper 또는 ClickHouse Keeper가 필요함 | 테스트에서 `ReplicatedMergeTree`를 사용 |
| `replica` | `zookeeper`와 동일. `zookeeper`를 선호합니다. ||
| `no-fasttest`|  [빠른 테스트](continuous-integration.md#fast-test)에서 실행되지 않음 | 테스트에서 Fast 테스트에서 비활성화된 `MySQL` 테이블 엔진을 사용 |
| `fasttest-only`|  [빠른 테스트](continuous-integration.md#fast-test)에서만 실행됨 ||
| `no-[asan, tsan, msan, ubsan]` | [Sanitizers](#sanitizers)에서 테스트 비활성화 | 테스트가 QEMU에서 실행되며, sanitizers와 작동하지 않음 |
| `no-replicated-database` |||
| `no-ordinary-database` |||
| `no-parallel` | 이 테스트와 병렬로 다른 테스트 실행 비활성화 | 테스트가 `system` 테이블에서 읽고 불변성이 깨질 수 있음 |
| `no-parallel-replicas` |||
| `no-debug` |||
| `no-stress` |||
| `no-polymorphic-parts` |||
| `no-random-settings` |||
| `no-random-merge-tree-settings` |||
| `no-backward-compatibility-check` |||
| `no-cpu-x86_64` |||
| `no-cpu-aarch64` |||
| `no-cpu-ppc64le` |||
| `no-s3-storage` |||

위 설정 외에도 `system.build_options`의 `USE_*` 플래그를 사용하여 특정 ClickHouse 기능의 사용을 정의할 수 있습니다.
예를 들어, 테스트가 MySQL 테이블을 사용하는 경우 `use-mysql` 태그를 추가해야 합니다.

### Specifying limits for random settings {#specifying-limits-for-random-settings}

테스트는 테스트 실행 중 무작위화할 수 있는 설정에 대한 최소 및 최대 허용 값을 지정할 수 있습니다.

`.sh` 테스트의 경우 제한은 태그 옆의 줄에 주석으로 작성되거나 태그가 지정되지 않은 경우 두 번째 줄에 작성됩니다:

```bash
#!/usr/bin/env bash

# Tags: no-fasttest

# Random settings limits: max_block_size=(1000, 10000); index_granularity=(100, None)
```

`.sql` 테스트의 경우 태그는 태그 옆의 줄이나 첫 번째 줄에 SQL 주석으로 위치합니다:

```sql
-- Tags: no-fasttest
-- Random settings limits: max_block_size=(1000, 10000); index_granularity=(100, None)
SELECT 1
```

한 개의 한정 조건만 지정하려면 다른 하나에 대해 `None`을 사용할 수 있습니다.

### Choosing the test name {#choosing-the-test-name}

테스트 이름은 다섯 자리 접두사로 시작하여 그 뒤에 설명 이름이 옵니다. 예: `00422_hash_function_constexpr.sql`.
접두사를 선택하려면 디렉토리에 이미 존재하는 가장 큰 접두사를 찾아 1씩 증가시키면 됩니다.

```sh
ls tests/queries/0_stateless/[0-9]*.reference | tail -n 1
```

그 동안에 동일한 숫자 접두사가 있는 다른 테스트가 추가될 수 있지만, 이는 괜찮으며 문제를 일으키지 않으므로 나중에 변경할 필요는 없습니다.

### Checking for an error that must occur {#checking-for-an-error-that-must-occur}

때때로 잘못된 쿼리로 인해 서버 오류가 발생하는지 테스트해야 할 필요가 있습니다. 우리는 SQL 테스트에서 이를 위한 특별한 주석을 지원합니다. 다음과 같은 형식입니다:

```sql
SELECT x; -- { serverError 49 }
```

이 테스트는 서버가 'x'라는 알려지지 않은 컬럼에 대한 오류 코드 49를 반환하는지 확인합니다.
오류가 없거나 다른 오류가 발생하면 테스트는 실패합니다.
클라이언트에서 오류가 발생하는지 확인하려면 대신 `clientError` 주석을 사용하세요.

특정 오류 메시지의 문구를 확인하지 마십시오. 향후 변경될 수 있으며, 테스트가 불필요하게 실패할 수 있습니다.
오류 코드만 확인하세요.
기존 오류 코드가 필요에 대해 정확하지 않은 경우 새 오류 코드를 추가하는 것을 고려하세요.

### Testing a distributed query {#testing-a-distributed-query}

기능 테스트에서 분산 쿼리를 사용하려면 `remote` 테이블 함수를 활용하여 서버가 스스로에게 `127.0.0.{1..2}` 주소로 쿼리하게 하거나, `test_shard_localhost`와 같은 서버 구성 파일에 미리 정의된 테스트 클러스터를 사용할 수 있습니다.
테스트 이름에 `shard` 또는 `distributed`라는 단어를 추가하여 CI에서 올바른 구성으로 실행되도록 하십시오. 따라서 서버가 분산 쿼리를 지원하도록 구성되었습니다.

### Working with temporary files {#working-with-temporary-files}

때때로 쉘 테스트에서 즉석에서 작업할 파일을 만들어야 할 수 있습니다.
일부 CI 검사가 병렬로 테스트를 실행하므로, 스크립트에서 고유한 이름 없이 임시 파일을 생성하거나 제거하면 Flaky와 같은 일부 CI 검사가 실패할 수 있습니다.
이 문제를 해결하기 위해 테스트를 실행 중인 고유한 이름을 가진 임시 파일을 만들기 위해 `$CLICKHOUSE_TEST_UNIQUE_NAME` 환경 변수를 사용하는 것이 좋습니다.
이렇게 하면 설정 중에 생성하거나 정리 중 제거하는 파일이 해당 테스트에서만 사용되는 파일인지, 병렬로 실행 중인 다른 테스트가 아닌지를 확실히 할 수 있습니다.

## Known bugs {#known-bugs}

기능 테스트로 쉽게 재현할 수 있는 버그에 대해서는 준비된 기능 테스트를 `tests/queries/bugs` 디렉토리에 배치합니다.
버그가 수정되면 이러한 테스트는 `tests/queries/0_stateless`로 이동됩니다.

## Integration tests {#integration-tests}

통합 테스트는 클러스터 구성에서 ClickHouse를 테스트하고 MySQL, Postgres, MongoDB와 같은 다른 서버와 ClickHouse 상호작용을 확인하는 데 유용합니다.
이 테스트는 네트워크 분할, 패킷 손실 등을 에뮬레이트하는 데 유용합니다.
이러한 테스트는 Docker에서 실행되며 다양한 소프트웨어로 여러 컨테이너를 생성합니다.

이 테스트를 실행하는 방법은 `tests/integration/README.md`를 참조하세요.

ClickHouse와 서드파티 드라이버의 통합 테스트는 수행되지 않습니다.
현재 JDBC 및 ODBC 드라이버와의 통합 테스트도 없습니다.

## Unit tests {#unit-tests}

단위 테스트는 ClickHouse 전체가 아닌 단일 라이브러리나 클래스를 테스트하고자 할 때 유용합니다.
테스트의 빌드를 활성화하거나 비활성화하려면 `ENABLE_TESTS` CMake 옵션을 사용하세요.
단위 테스트 (및 기타 테스트 프로그램)는 코드 전반에 있는 `tests` 하위 디렉토리에 위치합니다.
단위 테스트를 실행하려면 `ninja test`를 입력하세요.
일부 테스트는 `gtest`를 사용하지만, 일부는 테스트 실패 시 비제로 종료 코드를 반환하는 일반 프로그램입니다.

기능 테스트가 이미 코드에서 덮여 있으면 단위 테스트를 반드시 할 필요는 없습니다 (기능 테스트는 일반적으로 사용하기 더 간단합니다).

개별 gtest 체크는 실행 가능 파일을 직접 호출하여 실행할 수 있습니다. 예를 들어:

```bash
$ ./src/unit_tests_dbms --gtest_filter=LocalAddress*
```

## Performance tests {#performance-tests}

성능 테스트는 ClickHouse의 특정 고립된 부분의 성능을 측정하고 비교할 수 있도록 합니다.
성능 테스트는 `tests/performance/`에 위치합니다.
각 테스트는 테스트 사례에 대한 설명이 포함된 `.xml` 파일로 표현됩니다.
테스트는 `docker/test/performance-comparison` 도구로 실행됩니다. 실행 방법은 읽어보시기 바랍니다.

각 테스트는 여러 쿼리(매개변수 조합 가능)를 루프에서 실행합니다.

특정 시나리오에서 ClickHouse의 성능을 향상시키고 싶고 개선 사항이 간단한 쿼리에서 관찰될 수 있다면 성능 테스트를 작성하는 것이 강력히 권장됩니다.
그리고 SQL 함수를 추가하거나 수정할 때는 상대적으로 고립되어 있으며 너무 모호하지 않은 경우에도 성능 테스트를 작성하는 것이 좋습니다.
테스트 중에는 항상 `perf top` 또는 다른 `perf` 도구를 사용하는 것이 좋습니다.

## Test tools and scripts {#test-tools-and-scripts}

`tests` 디렉토리에 있는 일부 프로그램은 준비된 테스트가 아니라 테스트 도구입니다.
예를 들어, `Lexer`의 경우 `src/Parsers/tests/lexer`라는 도구가 있어 단순히 stdin의 토큰화를 수행하고 색깔이 입혀진 결과를 stdout에 기록합니다.
이러한 종류의 도구를 코드 예제로 사용하거나 탐색 및 수동 테스트를 위해 활용할 수 있습니다.

## Miscellaneous tests {#miscellaneous-tests}

기계 학습 모델에 대한 테스트가 `tests/external_models`에 있습니다.
이 테스트는 업데이트되지 않으며 통합 테스트로 이전해야 합니다.

쿼럼 삽입을 위한 별도의 테스트가 있습니다.
이 테스트는 별도의 서버에서 ClickHouse 클러스터를 실행하고 다양한 실패 사례를 에뮬레이트합니다: 네트워크 분할, 패킷 손실 (ClickHouse 노드 간, ClickHouse와 ZooKeeper 간, ClickHouse 서버와 클라이언트 간 등), `kill -9`, `kill -STOP`, `kill -CONT`, [Jepsen](https://aphyr.com/tags/Jepsen)과 같은 방식으로. 그런 다음 테스트는 모든 확인된 삽입이 작성되었고 모든 거부된 삽입이 작성되지 않았음을 확인합니다.

쿼럼 테스트는 ClickHouse가 오픈 소스화되기 전 별도의 팀에 의해 작성되었습니다.
이 팀은 더 이상 ClickHouse와 일을 하지 않습니다.
테스트는 실수로 Java로 작성되었습니다.
이러한 이유로, 쿼럼 테스트는 다시 작성되어 통합 테스트로 이동해야 합니다.

## Manual Testing {#manual-testing}

새로운 기능을 개발할 때는 수동으로 테스트하는 것도 합리적입니다.
다음 단계로 수행할 수 있습니다:

ClickHouse를 빌드하십시오. 터미널에서 ClickHouse를 실행하십시오: 디렉토리를 `programs/clickhouse-server`로 변경하고 `./clickhouse-server`로 실행합니다. 기본적으로 현재 디렉토리의 구성(`config.xml`, `users.xml` 및 `config.d` 및 `users.d` 디렉토리 내의 파일)을 사용합니다. ClickHouse 서버에 연결하려면 `programs/clickhouse-client/clickhouse-client`를 실행하십시오.

모든 clickhouse 도구 (서버, 클라이언트 등)는 단일 이진 파일인 `clickhouse`에 대한 심볼릭 링크입니다.
이 이진 파일은 `programs/clickhouse`에 있습니다.
모든 도구는 `clickhouse tool`로 호출할 수도 있습니다.

대신 ClickHouse 패키지를 설치할 수 있습니다: ClickHouse 저장소에서 안정적인 릴리스 또는 ClickHouse 소스 루트에서 `./release`를 사용하여 직접 패키지를 빌드할 수 있습니다.
그런 다음 `sudo clickhouse start`로 서버를 시작하며 (서버를 중지하려면 stop을 사용합니다).
로그는 `/etc/clickhouse-server/clickhouse-server.log`에서 확인하십시오.

ClickHouse가 이미 시스템에 설치되어 있는 경우, 새로운 `clickhouse` 이진 파일을 빌드하고 기존 이진 파일을 교체할 수 있습니다:

```bash
$ sudo clickhouse stop
$ sudo cp ./clickhouse /usr/bin/
$ sudo clickhouse start
```

또한 시스템 ClickHouse 서버를 중지하고 동일한 구성으로 터미널에 로깅을 하여 직접 실행할 수 있습니다:

```bash
$ sudo clickhouse stop
$ sudo -u clickhouse /usr/bin/clickhouse server --config-file /etc/clickhouse-server/config.xml
```

gdb와 함께 사용하는 예시:

```bash
$ sudo -u clickhouse gdb --args /usr/bin/clickhouse server --config-file /etc/clickhouse-server/config.xml
```

시스템 ClickHouse 서버가 이미 실행 중이며 중지하지 않으려는 경우, `config.xml`의 포트 번호를 변경하거나 (또는 `config.d` 디렉토리 내 파일에서 재정의), 적절한 데이터 경로를 제공하고 실행할 수 있습니다.

`clickhouse` 이진 파일은 거의 종속성이 없으며 다양한 Linux 배포판에서 작동합니다.
서버에서 변경 사항을 빠르고 간편하게 테스트하려면, 새로 빌드한 `clickhouse` 이진 파일을 서버로 복사하고 위의 예시와 같이 실행할 수 있습니다.

## Build tests {#build-tests}

빌드 테스트는 다양한 대체 구성 및 일부 외부 시스템에서 빌드가 깨지지 않았는지 확인합니다.
이러한 테스트는 자동화된 것입니다.

예시:
- Darwin x86_64 (macOS)용 교차 컴파일
- FreeBSD x86_64용 교차 컴파일
- Linux AArch64용 교차 컴파일
- 시스템 패키지의 라이브러리로 Ubuntu에서 빌드 (권장하지 않음)
- 라이브러리의 공유 링크로 빌드 (권장하지 않음)

예를 들어, 시스템 패키지와 함께 빌드는 좋지 않은 관행입니다. 왜냐하면 시스템에 어떤 특정 버전의 패키지가 있을지 확신할 수 없기 때문입니다.
그러나 Debian 유지 관리자가 이 작업을 수행해야 합니다.
이러한 이유로 우리는 적어도 이 빌드 변형을 지원해야 합니다.
또 다른 예: 공유 링크는 일반적인 문제의 원인입니다. 하지만 일부 애호가에게는 필요합니다.

모든 빌드 변형에서 모든 테스트를 실행할 수는 없지만, 최소한 다양한 빌드 변형이 깨지지 않았음을 확인하고자 합니다.
이를 위해 우리는 빌드 테스트를 사용합니다.

우리는 또한 컴파일하기에는 너무 긴 번역 단위가 없고 RAM을 너무 많이 요구하는 것이 없음을 검사합니다.

또한 слишком 큰 스택 프레임이 없음을 검사합니다.

## Testing for protocol compatibility {#testing-for-protocol-compatibility}

ClickHouse 네트워크 프로토콜을 확장할 때는 수동으로 이전 clickhouse-client가 새로운 clickhouse-server와 작동하는지, 새로운 clickhouse-client가 이전 clickhouse-server와 작동하는지를 테스트합니다 (상응하는 패키지에서 이진 파일을 실행하여).

일부 케이스는 통합 테스트를 통해 자동으로 테스트합니다:
- 이전 버전의 ClickHouse로 작성된 데이터가 새 버전에서 성공적으로 읽힐 수 있는지;
- 서로 다른 ClickHouse 버전으로 클러스터 내에서 분산 쿼리가 작동하는지.

## Help from the Compiler {#help-from-the-compiler}

주요 ClickHouse 코드는 `-Wall -Wextra -Werror` 옵션으로 빌드되며, 일부 추가 경고도 활성화되어 있습니다.
이러한 옵션은 서드파티 라이브러리에는 활성화되지 않습니다.

Clang는 더 유용한 경고를 많이 제공하므로, `-Weverything`으로 검색하여 기본 빌드에 포함할 것을 선택할 수 있습니다.

우리는 ClickHouse를 빌드할 때 항상 clang을 사용합니다. 개발과 프로덕션 모두에서 사용합니다.
자신의 컴퓨터에서 디버그 모드로 빌드할 수 있지만 (노트북의 배터리를 절약하기 위해), 컴파일러는 `-O3`와 함께 더 좋은 흐름 제어 및 절차 간 분석을 통해 더 많은 경고를 발생시킬 수 있습니다.
디버그 모드에서 clang으로 빌드할 때는 런타임에 더 많은 오류를 잡을 수 있도록 debug 버전의 `libc++`가 사용됩니다.

## Sanitizers {#sanitizers}

:::note
프로세스(ClickHouse 서버 또는 클라이언트)가 로컬에서 실행 시 시작할 때 충돌하는 경우 주소 공간 레이아웃 난수화를 비활성화해야 할 수 있습니다: `sudo sysctl kernel.randomize_va_space=0`
:::

### Address sanitizer {#address-sanitizer}

우리는 기능, 통합, 스트레스 및 단위 테스트를 ASan에서 커밋 당 실행합니다.

### Thread sanitizer {#thread-sanitizer}

우리는 기능, 통합, 스트레스 및 단위 테스트를 TSan에서 커밋 당 실행합니다.

### Memory sanitizer {#memory-sanitizer}

우리는 기능, 통합, 스트레스 및 단위 테스트를 MSan에서 커밋 당 실행합니다.

### Undefined behaviour sanitizer {#undefined-behaviour-sanitizer}

우리는 기능, 통합, 스트레스 및 단위 테스트를 UBSan에서 커밋 당 실행합니다.
일부 서드파티 라이브러리의 코드는 UB에 대해 샌티타이즈되지 않습니다.

### Valgrind (memcheck) {#valgrind-memcheck}

우리는 예전에는 Valgrind에서 기능 테스트를 밤새 실행했지만 더 이상 그렇게 하지 않습니다.
여러 시간이 걸립니다.
현재 `re2` 라이브러리에서 알려진 잘못된 양성 사례가 하나 있습니다. [이 기사](https://research.swtch.com/sparse)를 참조하세요.

## Fuzzing {#fuzzing}

ClickHouse 퍼징은 [libFuzzer](https://llvm.org/docs/LibFuzzer.html)와 무작위 SQL 쿼리를 사용하여 구현됩니다.
모든 퍼즈 테스트는 샌티타이저(주소 및 정의되지 않은)와 함께 수행되어야 합니다.

라이브러리 코드의 고립된 퍼징 테스트에 libFuzzer가 사용됩니다.
퍼저는 테스트 코드의 일부로 구현되며 "_fuzzer" 이름 접미사를 가집니다.
퍼저 예시는 `src/Parsers/fuzzers/lexer_fuzzer.cpp`에서 찾을 수 있습니다.
libFuzzer 특정 구성, 사전 및 말뭉치는 `tests/fuzz`에 저장됩니다.
사용자 입력을 처리하는 모든 기능에 대해 퍼즈 테스트를 작성하는 것을 권장합니다.

퍼저는 기본적으로 빌드되지 않습니다.
퍼저를 빌드하려면 `-DENABLE_FUZZING=1` 및 `-DENABLE_TESTS=1` 옵션을 설정해야 합니다.
퍼저를 빌드하는 동안 Jemalloc를 비활성화하는 것이 좋습니다.
ClickHouse 퍼징을 Google OSS-Fuzz에 통합하는 데 사용된 구성은 `docker/fuzz`에서 찾을 수 있습니다.

우리는 또한 무작위 SQL 쿼리를 생성하고 서버가 이를 실행할 때 죽지 않는지 확인하기 위해 간단한 퍼즈 테스트를 사용합니다.
이 테스트는 `00746_sql_fuzzy.pl`에서 확인할 수 있습니다.
이 테스트는 지속적으로 (하루 종일 및 그 이상) 실행되어야 합니다.

우리는 또한 대규모 AST 기반 쿼리 퍼저를 사용하여 많은 모서리 사례를 찾을 수 있습니다.
쿼리 AST의 무작위 치환 및 대체를 수행합니다.
이전 테스트의 AST 노드를 기억하여 무작위 순서로 처리되는 후속 테스트의 퍼징에 사용합니다.
이 퍼저에 대해 더 알고 싶다면 [이 블로그 기사](https://clickhouse.com/blog/fuzzing-click-house)를 읽어보세요.

## Stress test {#stress-test}

스트레스 테스트는 또 다른 퍼징의 경우입니다.
모든 기능 테스트를 단일 서버에서 무작위 순서로 병렬로 실행합니다.
테스트 결과는 확인하지 않습니다.

다음 사항이 확인됩니다:
- 서버가 충돌하지 않으며, 디버그 또는 샌티타이저가 트리거되지 않습니다.
- 교착 상태가 없습니다.
- 데이터베이스 구조가 일관성 있습니다.
- 서버가 테스트 후 성공적으로 중지되고 예외 없이 다시 시작할 수 있습니다.

다섯 가지 변형(디버그, ASan, TSan, MSan, UBSan)이 있습니다.

## Thread fuzzer {#thread-fuzzer}

Thread Fuzzer는 (Thread Sanitizer와 혼동하지 마십시오) 실행 순서의 무작위화를 허용하는 또 다른 형태의 퍼징입니다.
더 많은 특수 케이스를 찾는 데 도움이 됩니다.

## Security audit {#security-audit}

우리의 보안 팀은 보안 관점에서 ClickHouse 기능에 대한 기본 개요를 수행했습니다.

## Static analyzers {#static-analyzers}

우리는 커밋 당 `clang-tidy`를 실행합니다.
`clang-static-analyzer` 검사도 활성화되어 있습니다.
모양 검사에서도 `clang-tidy`를 사용합니다.

우리는 `clang-tidy`, `Coverity`, `cppcheck`, `PVS-Studio`, `tscancode`, `CodeQL`을 평가했습니다.
사용에 대한 지침은 `tests/instructions/` 디렉토리에서 찾을 수 있습니다.

IDE로 `CLion`을 사용하는 경우, 기본적으로 몇 가지 `clang-tidy` 검사를 활용할 수 있습니다.

우리는 또한 쉘 스크립트의 정적 분석을 위해 `shellcheck`를 사용합니다.

## Hardening {#hardening}

디버그 빌드에서는 사용자 수준 할당의 ASLR을 수행하는 사용자 정의 할당기를 사용하고 있습니다.

또한 할당 후 읽기 전용으로 지정된 메모리 영역을 수동으로 보호합니다.

디버그 빌드에서는 "해로운" (구식, 안전하지 않음, 스레드 안전하지 않음) 함수 호출을 보장하는 libc 맞춤형을 포함합니다.

디버그 어설션이 광범위하게 사용됩니다.

디버그 빌드에서는 "논리적 오류" 코드가 포함된 예외(버그를 의미함)가 발생하면 프로그램이 조기에 종료됩니다.
이를 통해 릴리스 빌드에서 예외를 사용할 수 있지만 디버그 빌드에서는 어설션으로 만드는 것이 가능합니다.

디버그 빌드에 대하여 디버그 버전의 jemalloc과 libc++가 사용됩니다.

## Runtime integrity checks {#runtime-integrity-checks}

디스크에 저장된 데이터는 체크섬이 있습니다.
MergeTree 테이블의 데이터는 동시에 세 가지 방법으로 체크섬이 계산됩니다* (압축된 데이터 블록, 비압축된 데이터 블록, 블록 간 총 체크섬).
클라이언트와 서버 또는 서버 간에 네트워크로 전송되는 데이터도 체크섬이 계산됩니다.
복제는 복제본 간에 비트 단위로 동일한 데이터를 보장합니다.

이는 결함 있는 하드웨어로부터 보호하는 데 필요합니다 (저장 매체의 비트 로트, 서버 RAM의 비트 플립, 네트워크 컨트롤러의 RAM의 비트 플립, 네트워크 스위치의 RAM의 비트 플립, 클라이언트의 RAM의 비트 플립, 전선의 비트 플립).
비트 플립은 일반적이며 발생할 가능성이 높으므로 ECC RAM과 TCP 체크섬이 있는 경우에도 발생할 수 있습니다 (하루에 페타바이트의 데이터를 처리하는 수천 대의 서버를 운영하면 발생할 수 있습니다).
[영상을 보세요 (러시아어)](https://www.youtube.com/watch?v=ooBAQIe0KlQ).

ClickHouse는 운영 엔지니어가 결함 있는 하드웨어를 찾을 수 있도록 하는 진단 기능을 제공합니다.

\* 그리고 느리지 않습니다.

## Code style {#code-style}

코드 스타일 규칙은 [여기](style.md)에 설명되어 있습니다.

일부 일반적인 스타일 위반을 확인하려면 `utils/check-style` 스크립트를 사용할 수 있습니다.

코드의 올바른 스타일을 강제하려면 `clang-format`을 사용할 수 있습니다.
파일 `.clang-format`은 소스 루트에 위치합니다.
이는 대체로 우리의 실제 코드 스타일과 일치합니다.
그러나 기존 파일에 `clang-format`을 적용하는 것은 권장하지 않습니다. 왜냐하면 그렇게 하면 포맷팅이 더 악화되기 때문입니다.
`clang-format-diff` 도구를 사용하는 것이 좋습니다. 이 도구는 clang 소스 저장소에서 찾을 수 있습니다.

또한 코드를 재포맷하기 위해 `uncrustify` 도구를 시도할 수 있습니다.
구성은 소스 루트의 `uncrustify.cfg`에 있습니다.
이 도구는 `clang-format`보다 덜 테스트되었습니다.

`CLion`에는 우리의 코드 스타일에 맞도록 조정해야 할 필요가 있는 코드 포맷터가 있습니다.

우리는 또한 `codespell`을 사용하여 코드에서 오타를 찾습니다.
이것도 자동화됩니다.

## Test coverage {#test-coverage}

우리는 또한 테스트 커버리지를 추적하지만, 기능 테스트에 대해서만, 그리고 ClickHouse 서버에 대해서만 수행합니다.
이는 매일 수행됩니다.

## Tests for tests {#tests-for-tests}

우리는 플래키 테스트에 대한 자동 검사를 수행합니다.
모든 새로운 테스트를 100회(기능 테스트의 경우), 또는 10회(통합 테스트의 경우) 실행합니다.
단 한 번이라도 테스트가 실패하면 플래키로 간주됩니다.

## Test automation {#test-automation}

우리는 [GitHub Actions](https://github.com/features/actions)를 통해 테스트를 실행합니다.

빌드 작업 및 테스트는 커밋 당 샌드박스에서 실행됩니다.
결과 패키지 및 테스트 결과는 GitHub에 게시되며, 직접 링크를 통해 다운로드할 수 있습니다.
아티팩트는 몇 달 동안 저장됩니다.
GitHub에서 풀 리퀘스트를 보낼 때 "테스트 가능"으로 태그가 지정되며, 우리의 CI 시스템은 ClickHouse 패키지(릴리스, 디버그, 주소 샌티타이저 등)를 여러분을 위해 빌드합니다.
