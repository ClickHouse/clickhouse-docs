---
description: 'ClickHouse 테스트 및 테스트 스위트 실행을 위한 가이드'
sidebar_label: '테스트'
sidebar_position: 40
slug: /development/tests
title: 'ClickHouse 테스트'
doc_type: 'guide'
---

# ClickHouse 테스트 \{#testing-clickhouse\}

## Functional tests \{#functional-tests\}

기능 테스트는 가장 단순하면서도 사용하기 편리한 테스트입니다.
ClickHouse의 대부분 기능은 기능 테스트로 검증할 수 있으며, 이 방식으로 테스트할 수 있는 ClickHouse 코드 변경 사항에는 반드시 기능 테스트를 사용해야 합니다.

각 기능 테스트는 실행 중인 ClickHouse 서버에 하나 이상의 쿼리를 전송하고, 그 결과를 기준 결과와 비교합니다.

테스트는 `./tests/queries` 디렉터리에 있습니다.

각 테스트는 `.sql` 또는 `.sh` 두 가지 타입 중 하나입니다.

- `.sql` 테스트는 `clickhouse-client`로 파이프되는 단순한 SQL 스크립트입니다.
- `.sh` 테스트는 단독으로 실행되는 스크립트입니다.

일반적으로 SQL 테스트가 `.sh` 테스트보다 더 바람직합니다.
순수 SQL만으로는 검증할 수 없는 기능(예: 일부 입력 데이터를 `clickhouse-client`로 파이프해야 하는 경우나 `clickhouse-local`을 테스트하는 경우 등)을 테스트해야 하는 경우에만 `.sh` 테스트를 사용해야 합니다.

:::note
`DateTime` 및 `DateTime64` 데이터 타입을 테스트할 때 흔히 발생하는 실수는 서버가 특정 시간대(예: "UTC")를 사용한다고 가정하는 것입니다. 실제로는 그렇지 않으며, CI 테스트 실행 시 시간대는 의도적으로 무작위로 설정됩니다. 가장 쉬운 해결 방법은 테스트 값에 대해 시간대를 명시적으로 지정하는 것으로, 예를 들면 `toDateTime64(val, 3, 'Europe/Amsterdam')`과 같이 작성합니다.
:::

### 테스트를 로컬에서 실행하기 \{#running-a-test-locally\}

기본 포트(9000)를 사용하여 로컬에서 ClickHouse 서버를 시작합니다.
예를 들어 `01428_hash_set_nan_key` 테스트를 실행하려면 저장소 폴더로 이동한 후 다음 명령을 실행합니다.

```sh
PATH=<path to clickhouse-client>:$PATH tests/clickhouse-test 01428_hash_set_nan_key
```

테스트 결과(`stderr` 및 `stdout`)는 테스트 파일과 동일한 디렉터리에 있는 `01428_hash_set_nan_key.[stderr|stdout]` 파일에 기록됩니다 (`queries/0_stateless/foo.sql`의 경우 출력은 `queries/0_stateless/foo.stdout`에 기록됩니다).

`clickhouse-test`의 모든 옵션은 `tests/clickhouse-test --help`에서 확인할 수 있습니다.
테스트 이름에 대한 필터(예: `./clickhouse-test substring`)를 제공하여 전체 테스트를 실행하거나 일부 테스트만 실행할 수 있습니다.
또한 테스트를 병렬로 실행하거나 임의의 순서로 실행하는 옵션도 있습니다.


### 빠른 테스트 실행 \{#running-fast-tests\}

일부 테스트 하위 집합(이하 「Fast test」)을 실행하려면 상당한 성능의 머신이 필요할 수 있습니다. 다음 예시는 100 GB 스토리지가 있는 `t3.2xlarge` AWS amd64 Ubuntu 인스턴스에서 동작합니다.

1. 필수 구성 요소를 설치한 후 다시 로그인합니다.

```sh
sudo apt-get update
sudo apt-get install docker.io
sudo usermod -aG docker ubuntu
```

2. 소스 코드를 가져옵니다.

```sh
git clone --single-branch https://github.com/ClickHouse/ClickHouse
cd ClickHouse
```

3. 코드를 빌드하고 「Fast test」라는 이름의 일부 테스트를 실행합니다.

```sh
python3 -m ci.praktika run "Fast test"
```

다음과 같은 결과가 표시되어야 합니다.

```sh
Failed: 0, Passed: 7394, Skipped: 1795
```

실행을 계속 지켜보지 않을 때에는 `ssh` 연결이 끊어진 뒤에도 계속 실행되도록 `nohup` 또는 `disown`을 사용할 수 있습니다.


### 상태 비저장 테스트 실행 \{#running-stateless-tests\}

상태 비저장(stateless) 테스트를 실행하려면 상당히 성능이 좋은 머신이 필요할 수 있습니다. 다음 구성은 200 GB 스토리지를 가진 `m7i.8xlarge` AWS amd64 Ubuntu 인스턴스에서 동작합니다.

1. 필수 구성 요소를 설치한 후 다시 로그인합니다.

```sh
sudo apt-get update
sudo apt-get install docker.io
sudo usermod -aG docker ubuntu
sudo tee /etc/docker/daemon.json <<'EOF'
{
  "ipv6": true,
  "ip6tables": true
}
EOF
sudo systemctl restart docker
```

2. 소스 코드를 다운로드합니다.

```sh
git clone --single-branch https://github.com/ClickHouse/ClickHouse
cd ClickHouse
```

3. 코드를 빌드합니다.

```sh
python3 -m ci.praktika run "Build (amd_debug)"
cp ci/tmp/build/programs/clickhouse ci/tmp
```

4. 병렬로 실행할 수 있는 stateless 테스트를 수행합니다.

```sh
python3 -m ci.praktika run "Stateless tests (amd_debug, parallel)"
```

다음과 같은 결과가 출력됩니다

```sh
Failed: 0, Passed: 8497, Skipped: 103
```


### 새 테스트 추가하기 \{#adding-a-new-test\}

새 테스트를 추가하려면 먼저 `queries/0_stateless` 디렉터리에 `.sql` 또는 `.sh` 파일을 생성합니다.
그다음 `clickhouse-client < 12345_test.sql > 12345_test.reference` 또는 `./12345_test.sh > ./12345_test.reference`를 사용하여 해당 `.reference` 파일을 생성합니다.

테스트는 사전에 자동으로 생성된 데이터베이스 `test` 안의 테이블에 대해 CREATE, DROP, SELECT 등의 작업만 수행해야 합니다.
임시 테이블을 사용하는 것은 괜찮습니다.

CI와 동일한 환경을 로컬에서 구성하려면 테스트용 설정 파일을 설치합니다(이 설정은 Zookeeper 모의 구현을 사용하고 일부 설정을 조정합니다).

```sh
cd <repository>/tests/config
sudo ./install.sh
```

:::note
테스트는 다음과 같아야 합니다.

* 최소화되어야 합니다: 필요한 최소한의 테이블, 컬럼 및 복잡성만 생성합니다.
* 빨라야 합니다: 몇 초를 넘기지 않아야 합니다(가능하면 1초 미만).
* 정확하고 결정적이어야 합니다: 테스트 대상 기능이 동작하지 않을 때이면서, 그리고 그럴 때에만 실패해야 합니다.
* 고립되고 상태를 가지지 않아야 합니다(stateless): 환경이나 타이밍에 의존하지 않아야 합니다.
* 충분히 포괄적이어야 합니다: 0, null, 빈 Set, 예외(부정 테스트를 포함하며, 이를 위해 `-- { serverError xyz }` 및 `-- { clientError xyz }` 문법을 사용)를 포함한 코너 케이스를 모두 다룹니다.
* 테스트 끝에 테이블을 정리해야 합니다(남은 데이터가 있는 경우).
* 다른 테스트가 동일한 내용을 검증하지 않도록 해야 합니다(즉, 먼저 `grep`으로 확인합니다).
  :::


### 테스트 실행 제한 \{#restricting-test-runs\}

테스트에는 CI에서 어떤 컨텍스트에서 실행될지에 대한 제한을 나타내는 *태그*를 0개 이상 지정할 수 있습니다.

`.sql` 테스트의 경우 태그는 첫 번째 줄에 SQL 주석으로 작성합니다:

```sql
-- Tags: no-fasttest, no-replicated-database
-- no-fasttest: <provide_a_reason_for_the_tag_here>
-- no-replicated-database: <provide_a_reason_here>

SELECT 1
```

`.sh` 테스트에서는 태그를 두 번째 줄 주석에 작성합니다:

```bash
#!/usr/bin/env bash
# Tags: no-fasttest, no-replicated-database
# - no-fasttest: <provide_a_reason_for_the_tag_here>
# - no-replicated-database: <provide_a_reason_here>
```

사용 가능한 태그 목록:

| Tag name                          | What it does                                                      | Usage example                                       |
| --------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------- |
| `disabled`                        | 테스트가 실행되지 않습니다                                                    |                                                     |
| `long`                            | 테스트 실행 시간이 1분에서 10분으로 늘어납니다                                       |                                                     |
| `deadlock`                        | 테스트를 오랜 시간 루프로 실행합니다                                              |                                                     |
| `race`                            | `deadlock`과 동일합니다. `deadlock` 사용을 권장합니다                           |                                                     |
| `shard`                           | 서버가 `127.0.0.*`에서 수신하도록 설정되어야 합니다                                 |                                                     |
| `distributed`                     | `shard`와 동일합니다. `shard` 사용을 권장합니다                                 |                                                     |
| `global`                          | `shard`와 동일합니다. `shard` 사용을 권장합니다                                 |                                                     |
| `zookeeper`                       | 테스트 실행에 Zookeeper 또는 ClickHouse Keeper가 필요합니다                     | 테스트에서 `ReplicatedMergeTree`를 사용합니다                  |
| `replica`                         | `zookeeper`와 동일합니다. `zookeeper` 사용을 권장합니다                         |                                                     |
| `no-fasttest`                     | [Fast test](continuous-integration.md#fast-test)에서 테스트를 실행하지 않습니다 | 테스트에서 Fast test에서 비활성화된 `MySQL` table engine을 사용합니다 |
| `fasttest-only`                   | [Fast test](continuous-integration.md#fast-test)에서만 테스트를 실행합니다    |                                                     |
| `no-[asan, tsan, msan, ubsan]`    | [sanitizers](#sanitizers)로 빌드된 환경에서 테스트를 비활성화합니다                  | 테스트가 sanitizers와 호환되지 않는 QEMU에서 실행됩니다               |
| `no-replicated-database`          |                                                                   |                                                     |
| `no-ordinary-database`            |                                                                   |                                                     |
| `no-parallel`                     | 이 테스트와 다른 테스트를 병렬로 실행하는 것을 비활성화합니다                                | 테스트가 `system` 테이블에서 읽기를 수행하며, 불변 조건이 깨질 수 있습니다      |
| `no-parallel-replicas`            |                                                                   |                                                     |
| `no-debug`                        | Debug 빌드에서 테스트를 비활성화합니다                                           |                                                     |
| `no-release`                      | Release 빌드에서 테스트를 비활성화합니다                                         |                                                     |
| `no-stress`                       |                                                                   |                                                     |
| `no-polymorphic-parts`            |                                                                   |                                                     |
| `no-random-settings`              |                                                                   |                                                     |
| `no-random-merge-tree-settings`   |                                                                   |                                                     |
| `no-backward-compatibility-check` |                                                                   |                                                     |
| `no-cpu-x86_64`                   |                                                                   |                                                     |
| `no-cpu-aarch64`                  |                                                                   |                                                     |
| `no-cpu-ppc64le`                  |                                                                   |                                                     |
| `no-s3-storage`                   |                                                                   |                                                     |

위 태그들 외에도, 특정 ClickHouse 기능의 사용 여부를 정의하기 위해 `system.build_options`의 `USE_*` 플래그를 사용할 수 있습니다.
예를 들어, 테스트에서 `MySQL` 테이블을 사용하는 경우 `use-mysql` 태그를 추가해야 합니다.


### 랜덤 설정에 대한 제한 지정 \{#specifying-limits-for-random-settings\}

테스트에서는 테스트 실행 중에 무작위로 변경될 수 있는 설정에 대해 허용되는 최소값과 최대값을 지정할 수 있습니다.

`.sh` 테스트의 경우, 제한값은 태그 옆 줄의 주석으로 작성하거나, 태그가 지정되지 않은 경우 두 번째 줄의 주석으로 작성합니다:

```bash
#!/usr/bin/env bash
# Tags: no-fasttest
# Random settings limits: max_block_size=(1000, 10000); index_granularity=(100, None)
```

`.sql` 테스트에서는 태그를 태그 옆 줄 또는 첫 번째 줄에 SQL 주석으로 작성합니다:

```sql
-- Tags: no-fasttest
-- Random settings limits: max_block_size=(1000, 10000); index_granularity=(100, None)
SELECT 1
```

하나의 제한만 지정하면 되는 경우, 다른 하나에는 `None`을 사용할 수 있습니다.


### 테스트 이름 선택하기 \{#choosing-the-test-name\}

테스트 이름은 `00422_hash_function_constexpr.sql`과 같이, 다섯 자리 숫자 접두사 뒤에 설명적인 이름이 오는 형식입니다.
접두사를 정할 때는 해당 디렉터리에 이미 존재하는 가장 큰 접두사를 찾은 후, 그에 1을 더해 사용합니다.

```sh
ls tests/queries/0_stateless/[0-9]*.reference | tail -n 1
```

그 사이에 동일한 숫자 접두사가 붙은 다른 테스트가 추가되더라도 문제가 되지 않으며, 나중에 이를 변경할 필요도 없습니다.


### 반드시 발생해야 하는 오류 확인하기 \{#checking-for-an-error-that-must-occur\}

잘못된 쿼리에 대해 서버 오류가 발생하는지를 테스트해야 할 때가 있습니다. 이를 위해 SQL 테스트에서는 다음과 같은 형식의 특수 애너테이션을 지원합니다:

```sql
SELECT x; -- { serverError 49 }
```

이 테스트는 서버가 존재하지 않는 컬럼 `x`에 대해 오류 코드 49를 반환하는지 확인합니다.
오류가 발생하지 않거나, 발생한 오류가 다르면 테스트는 실패합니다.
클라이언트 측에서 오류가 발생하는지를 확인하려면 `clientError` 애노테이션을 대신 사용하십시오.

오류 메시지의 특정 문구는 확인하지 마십시오. 향후 변경될 수 있으며, 그 경우 테스트가 불필요하게 실패할 수 있습니다.
오류 코드만 확인하십시오.
기존 오류 코드가 요구 사항을 충족하기에 충분히 구체적이지 않다면, 새 오류 코드를 추가하는 것을 고려하십시오.


### 분산 쿼리 테스트하기 \{#testing-a-distributed-query\}

기능 테스트에서 분산 쿼리를 사용하려면 서버가 자기 자신에게 쿼리를 보내도록 `127.0.0.{1..2}` 주소와 함께 `remote` 테이블 함수를 활용하거나, 서버 설정 파일에 정의된 `test_shard_localhost`와 같은 미리 정의된 테스트 클러스터를 사용할 수 있습니다.
테스트 이름에 `shard` 또는 `distributed`라는 단어를 포함해야 하며, 이렇게 하면 CI에서 분산 쿼리를 지원하도록 구성된 올바른 설정으로 테스트가 실행됩니다.

### 임시 파일 사용하기 \{#working-with-temporary-files\}

때때로 셸 테스트에서 작업을 위해 바로 사용할 파일을 생성해야 할 수 있습니다.
일부 CI 체크는 테스트를 병렬로 실행하므로, 스크립트에서 고유한 이름 없이 임시 파일을 생성하거나 삭제하면 Flaky와 같은 일부 CI 체크가 실패할 수 있습니다.
이를 피하려면 실행 중인 테스트에 고유한 이름을 임시 파일에 부여하기 위해 환경 변수 `$CLICKHOUSE_TEST_UNIQUE_NAME`을 사용해야 합니다.
이렇게 하면 설정 단계에서 생성하거나 정리 단계에서 삭제하는 파일이 병렬로 실행 중인 다른 테스트가 아닌, 해당 테스트에서만 사용하는 파일임을 보장할 수 있습니다.

## 알려진 버그 \{#known-bugs\}

기능 테스트로 쉽게 재현 가능한 버그가 있는 경우, 해당 버그에 대한 기능 테스트를 `tests/queries/bugs` 디렉터리에 둡니다.
이 테스트들은 버그가 수정되면 `tests/queries/0_stateless` 디렉터리로 이동됩니다.

## 통합 테스트 \{#integration-tests\}

통합 테스트를 사용하면 클러스터 구성의 ClickHouse 및 MySQL, Postgres, MongoDB 같은 다른 서버와 상호 작용하는 ClickHouse 동작을 테스트할 수 있습니다.
이 테스트들은 네트워크 분할, 패킷 손실 등의 상황을 에뮬레이션하는 데 유용합니다.
이 테스트들은 Docker 환경에서 실행되며, 다양한 소프트웨어가 포함된 여러 컨테이너를 생성합니다.

이 테스트들을 실행하는 방법은 `tests/integration/README.md`를 참조하십시오.

ClickHouse의 서드파티(제3자) 드라이버와의 통합은 테스트되지 않는다는 점에 유의하십시오.
또한 현재 JDBC 및 ODBC 드라이버에 대한 통합 테스트는 제공하지 않습니다.

## 단위 테스트 \{#unit-tests\}

단위 테스트는 ClickHouse 전체가 아니라, 개별적으로 분리된 라이브러리나 클래스 하나만 따로 테스트하려는 경우에 유용합니다.
`ENABLE_TESTS` CMake 옵션으로 테스트 빌드를 활성화하거나 비활성화할 수 있습니다.
단위 테스트(및 기타 테스트 프로그램)는 코드 곳곳의 `tests` 하위 디렉터리에 위치합니다.
단위 테스트를 실행하려면 `ninja test`를 입력합니다.
일부 테스트는 `gtest`를 사용하지만, 일부는 테스트 실패 시 0이 아닌 종료 코드를 반환하는 단순한 프로그램입니다.

코드가 이미 기능 테스트(functional test)로 커버되고 있다면 단위 테스트가 반드시 필요하지는 않습니다(기능 테스트가 보통 훨씬 더 사용하기 쉽습니다).

개별 gtest 테스트는 실행 파일을 직접 호출하여 실행할 수 있습니다. 예를 들면 다음과 같습니다.

```bash
$ ./src/unit_tests_dbms --gtest_filter=LocalAddress*
```


## Performance tests \{#performance-tests\}

성능 테스트를 사용하면 인위적으로 생성된 쿼리에서 ClickHouse의 일부 개별 구성 요소 성능을 측정하고 비교할 수 있습니다.
성능 테스트는 `tests/performance/`에 위치합니다.
각 테스트는 테스트 케이스에 대한 설명이 포함된 `.xml` 파일로 표현됩니다.
테스트는 `docker/test/performance-comparison` 도구로 실행합니다. 실행 방법은 readme 파일을 참고하십시오.

각 테스트는 하나 또는 여러 개의 쿼리(매개변수 조합이 포함될 수 있음)를 반복 실행합니다.

특정 시나리오에서 ClickHouse의 성능을 개선하려 하고, 그러한 개선 사항을 단순한 쿼리에서 관찰할 수 있는 경우에는 성능 테스트를 작성할 것을 강력히 권장합니다.
또한 상대적으로 독립적이고 지나치게 복잡하지 않은 SQL 함수를 추가하거나 수정할 때도 성능 테스트를 작성하는 것이 좋습니다.
테스트를 수행하는 동안 `perf top` 또는 기타 `perf` 도구를 사용하는 것은 언제나 유용합니다.

## 테스트 도구와 스크립트 \{#test-tools-and-scripts\}

`tests` 디렉터리의 일부 프로그램은 미리 만들어진 테스트가 아니라 테스트 도구입니다.
예를 들어, `Lexer`의 경우 표준 입력(stdin)을 토크나이징하고 색상이 입혀진 결과를 표준 출력(stdout)에 출력하기만 하는 도구 `src/Parsers/tests/lexer`가 있습니다.
이러한 도구는 코드 예제로 활용하고, 탐색 및 수동 테스트를 위해 사용할 수 있습니다.

## 기타 테스트 \{#miscellaneous-tests\}

`tests/external_models` 디렉터리에는 머신 러닝 모델에 대한 테스트가 있습니다.
이 테스트는 더 이상 업데이트되지 않으며 통합 테스트로 이전해야 합니다.

쿼럼 INSERT에 대한 별도의 테스트가 있습니다.
이 테스트는 별도의 서버에서 ClickHouse 클러스터를 실행하고, 다양한 장애 상황을 에뮬레이트합니다. 예를 들어 네트워크 분할, 패킷 드롭(ClickHouse 노드 간, ClickHouse와 ZooKeeper 간, ClickHouse 서버와 클라이언트 간 등), `kill -9`, `kill -STOP`, `kill -CONT` 등을 [Jepsen](https://aphyr.com/tags/Jepsen)과 유사한 방식으로 수행합니다. 그런 다음 테스트는 성공한 INSERT가 모두 기록되었고, 거부된 INSERT는 기록되지 않았는지 확인합니다.

쿼럼 테스트는 ClickHouse가 오픈 소스로 공개되기 전에 별도의 팀이 작성했습니다.
이 팀은 더 이상 ClickHouse에서 일하지 않습니다.
테스트는 우연히 Java로 작성되었습니다.
이러한 이유로, 쿼럼 테스트는 다시 작성하여 통합 테스트로 옮겨야 합니다.

## 수동 테스트 \{#manual-testing\}

새로운 기능을 개발할 때는 수동으로도 테스트하는 것이 합리적입니다.
다음 단계로 수행할 수 있습니다:

ClickHouse를 빌드합니다. 터미널에서 ClickHouse를 실행합니다. 디렉터리를 `programs/clickhouse-server`로 변경한 다음 `./clickhouse-server`로 실행하십시오. 기본적으로 현재 디렉터리의 설정 파일(`config.xml`, `users.xml` 및 `config.d`, `users.d` 디렉터리 내의 파일들)을 사용합니다. ClickHouse 서버에 연결하려면 `programs/clickhouse-client/clickhouse-client`를 실행하십시오.

모든 ClickHouse 도구(서버, 클라이언트 등)는 `clickhouse`라는 하나의 바이너리에 대한 심볼릭 링크(symlink)입니다.
이 바이너리는 `programs/clickhouse`에서 찾을 수 있습니다.
모든 도구는 `clickhouse-tool` 대신 `clickhouse tool` 형식으로도 실행할 수 있습니다.

또 다른 방법으로 ClickHouse 패키지를 설치할 수도 있습니다. ClickHouse 저장소에서 제공되는 안정(stable) 릴리스를 사용하거나, ClickHouse 소스 루트에서 `./release`를 실행하여 직접 패키지를 빌드할 수 있습니다.
그런 다음 `sudo clickhouse start`로 서버를 시작하십시오(또는 서버를 중지하려면 `sudo clickhouse stop`을 실행하십시오).
로그는 `/etc/clickhouse-server/clickhouse-server.log`에서 확인하십시오.

ClickHouse가 이미 시스템에 설치되어 있는 경우, 새 `clickhouse` 바이너리를 빌드한 후 기존 바이너리를 교체할 수 있습니다:

```bash
$ sudo clickhouse stop
$ sudo cp ./clickhouse /usr/bin/
$ sudo clickhouse start
```

또한 시스템에서 실행 중인 `clickhouse-server`를 중지한 뒤, 동일한 설정을 사용하되 로그를 터미널로 출력하도록 하여 직접 실행할 수도 있습니다.

```bash
$ sudo clickhouse stop
$ sudo -u clickhouse /usr/bin/clickhouse server --config-file /etc/clickhouse-server/config.xml
```

gdb 예시:

```bash
$ sudo -u clickhouse gdb --args /usr/bin/clickhouse server --config-file /etc/clickhouse-server/config.xml
```

시스템 `clickhouse-server`가 이미 실행 중이고 중지하고 싶지 않다면, `config.xml`에서 포트 번호를 변경하거나 `config.d` 디렉터리의 파일에서 이를 재정의하고, 적절한 데이터 경로를 지정한 뒤 실행하면 됩니다.

`clickhouse` 바이너리는 의존성이 거의 없으며, 다양한 Linux 배포판에서 동작합니다.
서버에서 변경 사항을 빠르게 간단히 테스트하려면, 새로 빌드한 `clickhouse` 바이너리를 `scp`로 서버에 전송한 다음 위 예제와 같이 실행하면 됩니다.


## 빌드 테스트 \{#build-tests\}

빌드 테스트를 통해 다양한 대안 구성 및 일부 타 시스템에서 빌드가 깨지지 않는지 확인할 수 있습니다.
이러한 테스트 역시 자동화되어 있습니다.

예를 들면 다음과 같습니다.

- Darwin x86_64 (macOS)용 크로스 컴파일
- FreeBSD x86_64용 크로스 컴파일
- Linux AArch64용 크로스 컴파일
- 시스템 패키지에서 제공하는 라이브러리를 사용하여 Ubuntu에서 빌드(권장하지 않음)
- 라이브러리를 shared linking으로 빌드(권장하지 않음)

예를 들어, 시스템 패키지를 사용한 빌드는 해당 시스템에 어떤 버전의 패키지가 설치되어 있는지 보장할 수 없기 때문에 바람직한 방식이 아닙니다.
그러나 Debian 메인터너에게는 이것이 실제로 필요합니다.
이러한 이유로 최소한 이 빌드 방식은 지원해야 합니다.
또 다른 예로, shared linking은 문제가 자주 발생하는 원인이지만, 일부 열성 사용자에게는 필요합니다.

모든 빌드 방식에서 모든 테스트를 실행할 수는 없지만, 다양한 빌드 방식이 깨지지 않았는지는 최소한 확인하려고 합니다.
이 목적을 위해 빌드 테스트를 사용합니다.

또한 컴파일에 너무 오래 걸리거나 너무 많은 RAM을 요구하는 번역 단위가 없는지도 테스트합니다.

너무 큰 스택 프레임이 없는지도 테스트합니다.

## 프로토콜 호환성 테스트 \{#testing-for-protocol-compatibility\}

ClickHouse 네트워크 프로토콜을 확장할 때는, 기존 `clickhouse-client`가 새로운 `clickhouse-server`와 동작하는지, 그리고 새로운 `clickhouse-client`가 기존 `clickhouse-server`와 동작하는지를 수동으로 테스트합니다(각각의 패키지에서 제공되는 바이너리를 직접 실행해 확인).

또한 일부 시나리오는 통합 테스트를 통해 자동으로 검증합니다:

- 기존 버전의 ClickHouse가 기록한 데이터를 새 버전에서 문제 없이 읽을 수 있는지;
- 서로 다른 ClickHouse 버전이 혼재된 클러스터에서 분산 쿼리가 제대로 동작하는지.

## 컴파일러의 도움 \{#help-from-the-compiler\}

ClickHouse의 주요 코드는 `src` 디렉터리에 있으며, `-Wall -Wextra -Werror`와 일부 추가 경고 옵션을 사용하여 빌드합니다.
이러한 옵션은 서드파티 라이브러리에는 활성화되어 있지 않습니다.

Clang에는 더욱 유용한 경고들이 있으며, `-Weverything` 옵션으로 확인한 후 기본 빌드에 포함할 항목을 선택할 수 있습니다.

ClickHouse는 개발 및 프로덕션 환경 모두에서 항상 clang으로 빌드합니다.
로컬 머신에서 디버그 모드로 빌드하여(노트북 배터리를 절약하기 위해) 사용할 수 있지만, 더 나은 제어 흐름 및 프로시저 간 분석 덕분에 컴파일러는 `-O3`에서 더 많은 경고를 생성할 수 있다는 점에 유의해야 합니다.
clang으로 디버그 모드로 빌드할 때는 런타임에서 더 많은 오류를 포착할 수 있도록 `libc++`의 디버그 버전을 사용합니다.

## Sanitizers \{#sanitizers\}

:::note
로컬 환경에서 실행할 때 프로세스(ClickHouse 서버 또는 클라이언트)가 시작 시 크래시가 발생하는 경우, 주소 공간 레이아웃 난수화(address space layout randomization)를 비활성화해야 할 수 있습니다: `sudo sysctl kernel.randomize_va_space=0`
:::

### Address sanitizer \{#address-sanitizer\}

기능 테스트, 통합 테스트, 스트레스 테스트, 단위 테스트를 ASan을 사용하여 커밋 단위로 실행합니다.

### Thread sanitizer \{#thread-sanitizer\}

각 커밋마다 TSan 하에서 기능 테스트, 통합 테스트, 스트레스 테스트 및 단위 테스트를 실행합니다.

### Memory sanitizer \{#memory-sanitizer\}

각 커밋마다 MSan 환경에서 기능, 통합, 스트레스, 단위 테스트를 실행합니다.

### Undefined behaviour sanitizer \{#undefined-behaviour-sanitizer\}

UBSan 환경에서 기능 테스트, 통합 테스트, 스트레스 테스트, 단위 테스트를 커밋마다 실행합니다.
일부 서드파티 라이브러리의 코드는 UB sanitizer 대상에서 제외됩니다.

### Valgrind (memcheck) \{#valgrind-memcheck\}

예전에는 Valgrind 하에서 기능 테스트를 밤새 실행했지만, 지금은 더 이상 실행하지 않습니다.
여러 시간이 걸리기 때문입니다.
현재 `re2` 라이브러리에 알려진 false positive가 하나 있으며, 자세한 내용은 [이 글](https://research.swtch.com/sparse)을 참고하십시오.

## 퍼징 \{#fuzzing\}

ClickHouse 퍼징은 [libFuzzer](https://llvm.org/docs/LibFuzzer.html)와 무작위 SQL 쿼리를 모두 사용하여 구현됩니다.
모든 퍼즈 테스트는 Sanitizer(Address 및 Undefined)를 사용하여 수행해야 합니다.

LibFuzzer는 라이브러리 코드에 대한 개별 퍼즈 테스트에 사용됩니다.
퍼저는 테스트 코드의 일부로 구현되며 이름 끝에 "_fuzzer" 접미사가 붙습니다.
퍼저 예제는 `src/Parsers/fuzzers/lexer_fuzzer.cpp`에서 확인할 수 있습니다.
LibFuzzer 전용 설정, 사전(dictionary) 및 코퍼스는 `tests/fuzz`에 저장됩니다.
사용자 입력을 처리하는 모든 기능에 대해 퍼즈 테스트를 작성하는 것을 권장합니다.

퍼저는 기본적으로 빌드되지 않습니다.
퍼저를 빌드하려면 `-DENABLE_FUZZING=1` 및 `-DENABLE_TESTS=1` 옵션을 모두 설정해야 합니다.
퍼저를 빌드할 때 Jemalloc을 비활성화할 것을 권장합니다.
ClickHouse 퍼징을 Google OSS-Fuzz에 통합하는 데 사용되는 설정은 `docker/fuzz`에서 확인할 수 있습니다.

또한 간단한 퍼즈 테스트를 사용하여 무작위 SQL 쿼리를 생성하고, 서버가 이를 실행하는 동안 비정상 종료되지 않는지 확인합니다.
이 테스트는 `00746_sql_fuzzy.pl`에서 확인할 수 있습니다.
이 테스트는 지속적으로(하룻밤 이상 장시간) 실행해야 합니다.

또한 매우 많은 코너 케이스를 찾을 수 있는 정교한 AST 기반 쿼리 퍼저도 사용합니다.
이 퍼저는 쿼리 AST에 대해 무작위 순열과 치환을 수행합니다.
이전 테스트에서 사용된 AST 노드를 기억해 두었다가, 이후 테스트를 임의의 순서로 처리하면서 이후 테스트 퍼징에 재사용합니다.
이 퍼저에 대해 더 자세히 알고 싶다면 [이 블로그 글](https://clickhouse.com/blog/fuzzing-click-house)을 참고하십시오.

## Stress test \{#stress-test\}

스트레스 테스트는 퍼징의 또 다른 유형입니다.
단일 서버에서 모든 기능 테스트를 무작위 순서로 병렬 실행합니다.
테스트 결과 자체는 검사하지 않습니다.

다음 사항을 확인합니다.

- 서버가 크래시나지 않고, 디버그 트랩이나 sanitizer 트랩이 발생하지 않습니다.
- 데드락이 발생하지 않습니다.
- 데이터베이스 구조의 일관성이 유지됩니다.
- 테스트 이후 서버를 정상적으로 종료하고, 예외 없이 다시 시작할 수 있습니다.

Debug, ASan, TSan, MSan, UBSan의 다섯 가지 변형이 있습니다.

## Thread fuzzer \{#thread-fuzzer\}

Thread Fuzzer(Thread Sanitizer와 혼동하지 마십시오)는 스레드 실행 순서를 무작위로 변경하는 또 다른 종류의 퍼징(fuzzing) 기법입니다.
이를 통해 더 많은 특수한 사례까지 찾아낼 수 있습니다.

## 보안 감사 \{#security-audit\}

당사 보안 팀에서 ClickHouse의 보안 관련 기능을 간단히 검토했습니다.

## 정적 분석 도구 \{#static-analyzers\}

`clang-tidy`를 커밋마다 실행합니다.
`clang-static-analyzer` 검사도 활성화되어 있습니다.
`clang-tidy`는 일부 스타일 검사에도 사용합니다.

`clang-tidy`, `Coverity`, `cppcheck`, `PVS-Studio`, `tscancode`, `CodeQL`을 평가했습니다.
사용 방법에 대한 지침은 `tests/instructions/` 디렉터리에서 확인할 수 있습니다.

IDE로 `CLion`을 사용하는 경우, 일부 `clang-tidy` 검사를 기본 제공 기능으로 활용할 수 있습니다.

셸 스크립트의 정적 분석을 위해 `shellcheck`도 사용합니다.

## 하드닝 \{#hardening\}

디버그 빌드에서는 사용자 수준 메모리 할당에 대해 ASLR을 수행하는 커스텀 할당자(custom allocator)를 사용합니다.

또한 할당 이후 읽기 전용으로 유지되어야 하는 메모리 영역을 수동으로 보호합니다.

디버그 빌드에서는 더 이상 사용되지 않거나, 보안에 취약하거나, 스레드 안전하지 않은 「유해한」 함수가 호출되지 않도록 보장하는 libc 커스터마이징도 적용합니다.

디버그 어설션(assertion)을 적극적으로 사용합니다.

디버그 빌드에서 버그를 의미하는 「논리적 오류(logical error)」 코드를 가진 예외가 발생하면 프로그램이 즉시 종료됩니다.
이를 통해 릴리스 빌드에서는 예외를 사용할 수 있으면서도, 디버그 빌드에서는 이를 어설션처럼 동작하게 할 수 있습니다.

jemalloc의 디버그 버전이 디버그 빌드에 사용됩니다.
libc++의 디버그 버전이 디버그 빌드에 사용됩니다.

## 런타임 무결성 검사 \{#runtime-integrity-checks\}

디스크에 저장되는 데이터에는 체크섬이 계산됩니다.
MergeTree 테이블의 데이터에는 세 가지 방식으로 동시에\* 체크섬이 계산됩니다(압축된 데이터 블록, 압축 해제된 데이터 블록, 블록 전체에 대한 총 체크섬).
클라이언트와 서버 간 또는 서버 간 네트워크를 통해 전송되는 데이터에도 체크섬이 적용됩니다.
복제는 레플리카 간 데이터가 비트 단위로 동일하도록 보장합니다.

이는 불량 하드웨어로부터 보호하기 위해 필요합니다(스토리지 미디어의 비트 부식(bit rot), 서버 RAM의 비트 플립, 네트워크 컨트롤러 RAM의 비트 플립, 네트워크 스위치 RAM의 비트 플립, 클라이언트 RAM의 비트 플립, 전송선상에서의 비트 플립).
비트 플립은 흔하며, ECC RAM을 사용하고 TCP 체크섬이 있어도 발생할 수 있습니다(수천 대의 서버가 각각 매일 페타바이트 단위의 데이터를 처리하는 환경을 운영하는 경우).
[영상 보기(러시아어)](https://www.youtube.com/watch?v=ooBAQIe0KlQ).

ClickHouse는 운영 엔지니어가 불량 하드웨어를 찾는 데 도움이 되는 진단 기능을 제공합니다.

\* 이 과정은 느리지도 않습니다.

## 코드 스타일 \{#code-style\}

코드 스타일 규칙은 [여기](style.md)에 설명되어 있습니다.

일반적인 스타일 위반 사항 일부를 검사하려면 `utils/check-style` 스크립트를 사용할 수 있습니다.

코드에 올바른 스타일을 강제하려면 `clang-format`을 사용할 수 있습니다.
`.clang-format` 파일은 소스 루트 디렉터리에 위치합니다.
실제 코드 스타일과 대부분 일치합니다.
하지만 기존 파일에 `clang-format`을 적용하면 포매팅이 오히려 더 안 좋아질 수 있으므로 권장되지 않습니다.
clang 소스 저장소에서 찾을 수 있는 `clang-format-diff` 도구를 사용할 수 있습니다.

또한 코드의 포매팅을 재정렬하기 위해 `uncrustify` 도구를 사용할 수도 있습니다.
설정은 소스 루트 디렉터리에 있는 `uncrustify.cfg`에 있습니다.
`clang-format`보다 검증이 덜 된 도구입니다.

`CLion`에는 자체 코드 포매터가 있으며, 코드 스타일에 맞도록 설정을 조정해야 합니다.

코드의 오탈자를 찾기 위해 `codespell`도 사용합니다.
이 작업 역시 자동화되어 있습니다.

## 테스트 커버리지 \{#test-coverage\}

기능 테스트, 그중에서도 clickhouse-server에 대해서만 테스트 커버리지를 추적합니다.
이 작업은 매일 수행합니다.

## 테스트를 위한 테스트 \{#tests-for-tests\}

플레이키(flaky) 테스트를 자동으로 점검하는 절차가 있습니다.
이 절차에서는 새로 추가된 기능 테스트를 100회, 통합 테스트를 10회씩 실행합니다.
테스트가 한 번이라도 실패하면 플레이키(flaky) 테스트로 간주됩니다.

## 테스트 자동화 \{#test-automation\}

[GitHub Actions](https://github.com/features/actions)를 사용해 테스트를 실행합니다.

빌드 작업과 테스트는 커밋 단위로 Sandbox 환경에서 실행합니다.
생성된 패키지와 테스트 결과는 GitHub에 업로드되며, 직접 링크를 통해 다운로드할 수 있습니다.
아티팩트는 몇 개월 동안 보존됩니다.
GitHub에서 Pull Request를 보내면 「can be tested」로 태그되며, CI 시스템이 ClickHouse 패키지(릴리스, 디버그, address sanitizer 포함 등)를 빌드합니다.