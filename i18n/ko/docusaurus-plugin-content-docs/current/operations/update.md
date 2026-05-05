---
description: '업데이트 문서'
sidebar_title: '자가 관리형 업그레이드'
slug: /operations/update
title: '자가 관리형 업그레이드'
doc_type: 'guide'
---



## ClickHouse 업그레이드 개요 \{#clickhouse-upgrade-overview\}

이 문서에는 다음 내용이 포함됩니다:
- 일반적인 지침
- 권장 업그레이드 계획
- 시스템에서 바이너리를 업그레이드하는 구체적인 절차



## 일반 가이드라인 \{#general-guidelines\}

이 메모는 업그레이드 계획 수립에 도움이 되며, 뒤에서 제시하는 권장 사항의 근거를 이해하는 데에도 도움이 됩니다.

### ClickHouse Keeper 또는 ZooKeeper와는 별도로 ClickHouse 서버를 업그레이드하십시오 \{#upgrade-clickhouse-server-separately-from-clickhouse-keeper-or-zookeeper\}
ClickHouse Keeper 또는 Apache ZooKeeper에 대한 보안 수정이 필요한 경우가 아니라면 ClickHouse 서버를 업그레이드할 때 Keeper를 함께 업그레이드할 필요는 없습니다. 업그레이드 과정 동안에는 Keeper의 안정성이 중요하므로, Keeper 업그레이드를 고려하기 전에 ClickHouse 서버 업그레이드를 먼저 완료해야 합니다.

### 마이너 버전 업그레이드는 자주 적용해야 합니다 \{#minor-version-upgrades-should-be-adopted-often\}
새로운 마이너 버전이 릴리스되는 즉시 항상 해당 버전으로 업그레이드하는 것이 강력히 권장됩니다. 마이너 릴리스에는 호환성을 깨는 변경 사항은 없지만, 중요한 버그 수정(및 보안 수정이 포함될 수 있음)이 포함됩니다.

### 대상 버전이 실행 중인 별도의 ClickHouse 서버에서 실험적 기능을 테스트하십시오 \{#test-experimental-features-on-a-separate-clickhouse-server-running-the-target-version\}

실험적 기능의 호환성은 언제든지, 어떤 방식으로든 깨질 수 있습니다. 실험적 기능을 사용하는 경우, 변경 로그를 확인하고 대상 버전이 설치된 별도의 ClickHouse 서버를 구성한 후 그 서버에서 실험적 기능 사용을 테스트하는 것이 좋습니다.

### 다운그레이드 \{#downgrades\}
업그레이드 후 새 버전이 의존 중인 일부 기능과 호환되지 않는다는 것을 알게 된 경우, 새 기능을 전혀 사용하지 않았다면 비교적 최근 버전(1년 이내 버전)으로 다운그레이드할 수 있습니다. 새 기능을 한 번이라도 사용한 이후에는 다운그레이드가 동작하지 않습니다.

### 클러스터 내 여러 ClickHouse 서버 버전 \{#multiple-clickhouse-server-versions-in-a-cluster\}

ClickHouse는 1년간의 호환성 윈도우(2개의 LTS 버전 포함)를 유지하기 위해 노력합니다. 이는 두 버전 간의 차이가 1년 미만(또는 그 사이에 2개 미만의 LTS 버전 차이)인 경우 어떤 두 버전이든 하나의 클러스터에서 함께 동작할 수 있어야 함을 의미합니다. 그러나 일부 사소한 문제가 발생할 수 있으므로(예: 분산 쿼리 성능 저하, ReplicatedMergeTree의 일부 백그라운드 작업에서 재시도 가능한 오류 등), 클러스터의 모든 멤버를 가능한 한 빨리 동일한 버전으로 업그레이드하는 것이 권장됩니다.

릴리스 날짜 기준으로 1년 이상 차이가 나는 서로 다른 버전을 동일한 클러스터에서 실행하는 것은 절대 권장하지 않습니다. 데이터 손실이 발생할 것으로 예상하지는 않지만, 클러스터가 사용 불가능해질 수 있습니다. 버전 차이가 1년을 초과하는 경우 예상해야 하는 문제는 다음과 같습니다.

- 클러스터가 동작하지 않을 수 있음
- 일부(또는 모든) 쿼리가 임의의 오류와 함께 실패할 수 있음
- 로그에 임의의 오류/경고가 나타날 수 있음
- 다운그레이드가 불가능할 수 있음

### 점진적 업그레이드 \{#incremental-upgrades\}

현재 버전과 대상 버전의 차이가 1년을 초과하는 경우, 다음 중 하나를 수행하는 것이 권장됩니다.
- 다운타임을 수반하는 업그레이드(모든 서버를 중지하고, 모든 서버를 업그레이드한 다음, 모든 서버를 다시 실행).
- 또는 중간 버전을 거쳐 업그레이드(현재 버전보다 1년 미만 더 최신인 버전으로 먼저 업그레이드).



## 권장 계획 \{#recommended-plan\}

무중단 ClickHouse 업그레이드를 위한 권장 단계는 다음과 같습니다:

1. 설정 변경 사항이 기본 파일인 `/etc/clickhouse-server/config.xml`에 들어 있지 않고, 업그레이드 중 `/etc/clickhouse-server/config.xml`이 덮어써질 수 있으므로 대신 `/etc/clickhouse-server/config.d/` 내에 저장되어 있는지 확인합니다.
2. [변경 로그](/whats-new/changelog/index.md)를 읽고(대상 릴리스에서 현재 사용 중인 릴리스까지 거슬러 올라가며) 비호환(breaking) 변경 사항을 확인합니다.
3. 비호환 변경 사항 중 업그레이드 전에 적용할 수 있는 부분은 미리 반영하고, 업그레이드 이후에 적용해야 하는 변경 사항은 목록으로 정리합니다.
4. 각 세그먼트(shard)에 대해, 업그레이드 동안 유지할 하나 이상의 레플리카를 정하고, 나머지 레플리카를 업그레이드 대상으로 지정합니다.
5. 업그레이드할 레플리카에서, 한 번에 하나씩 다음을 수행합니다:

* ClickHouse 서버를 종료합니다.
* 서버를 대상 버전으로 업그레이드합니다.
* ClickHouse 서버를 시작합니다.
* Keeper 메시지를 확인하여 시스템이 안정적인 상태인지 확인합니다.
* 다음 레플리카로 계속 진행합니다.

6. Keeper 로그와 ClickHouse 로그에서 오류가 있는지 확인합니다.
7. 4단계에서 식별한 레플리카를 새 버전으로 업그레이드합니다.
8. 1단계부터 3단계까지에서 정리한 변경 사항 목록을 참고하여, 업그레이드 이후에 적용해야 하는 변경 사항을 반영합니다.

:::note
이 오류 메시지는 복제된 환경에서 여러 버전의 ClickHouse가 동시에 실행 중일 때 발생하는 정상적인 현상입니다. 모든 레플리카가 동일한 버전으로 업그레이드되면 이 메시지는 더 이상 표시되지 않습니다.

```text
MergeFromLogEntryTask: Code: 40. DB::Exception: Checksums of parts don't match:
hash of uncompressed files doesn't match. (CHECKSUM_DOESNT_MATCH)  Data after merge is not
byte-identical to data on another replicas.
```

:::


## ClickHouse 서버 바이너리 업그레이드 절차 \{#clickhouse-server-binary-upgrade-process\}

ClickHouse가 `deb` 패키지로 설치된 경우, 서버에서 다음 명령을 실행하십시오:

```bash
$ sudo apt-get update
$ sudo apt-get install clickhouse-client clickhouse-server
$ sudo service clickhouse-server restart
```

권장하는 `deb` 패키지가 아닌 다른 방법으로 ClickHouse를 설치한 경우, 해당 방법에 맞는 적절한 업데이트 방법을 사용하십시오.

:::note
하나의 세그먼트에 속한 모든 레플리카가 동시에 오프라인 상태인 순간만 없다면, 여러 서버를 동시에 업데이트할 수 있습니다.
:::

이전 버전의 ClickHouse를 특정 버전으로 업그레이드하는 방법은 다음과 같습니다.

예를 들어,

`xx.yy.a.b`는 현재 안정(stable) 버전입니다. 최신 안정 버전은 [여기](https://github.com/ClickHouse/ClickHouse/releases)에서 확인할 수 있습니다.

```bash
$ sudo apt-get update
$ sudo apt-get install clickhouse-server=xx.yy.a.b clickhouse-client=xx.yy.a.b clickhouse-common-static=xx.yy.a.b
$ sudo service clickhouse-server restart
```
