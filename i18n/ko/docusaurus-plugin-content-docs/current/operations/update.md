---
'description': 'Update에 대한 문서'
'sidebar_title': 'Self-managed Upgrade'
'slug': '/operations/update'
'title': '자체 관리 업그레이드'
'doc_type': 'guide'
---

## ClickHouse 업그레이드 개요 {#clickhouse-upgrade-overview}

이 문서에는 다음이 포함됩니다:
- 일반 지침
- 권장 계획
- 시스템에서 바이너리를 업그레이드하는 세부 사항

## 일반 지침 {#general-guidelines}

이 메모는 계획에 도움이 되고, 문서 후반부에서 우리가 추천하는 이유를 이해하는 데 도움이 될 것입니다.

### ClickHouse 서버를 ClickHouse Keeper 또는 ZooKeeper와 별도로 업그레이드 {#upgrade-clickhouse-server-separately-from-clickhouse-keeper-or-zookeeper}
ClickHouse Keeper 또는 Apache ZooKeeper에 대한 보안 수정이 필요하지 않는 한, ClickHouse 서버를 업그레이드할 때 Keeper를 업그레이드할 필요는 없습니다. 업그레이드 과정 중에 Keeper의 안정성이 필요하므로, Keeper의 업그레이드를 고려하기 전에 ClickHouse 서버 업그레이드를 완료하십시오.

### 마이너 버전 업그레이드는 자주 적용해야 합니다 {#minor-version-upgrades-should-be-adopted-often}
새로운 마이너 버전이 출시되자마자 항상 업그레이드하는 것이 강력히 권장됩니다. 마이너 릴리스는 파괴적인 변경 사항이 없지만 중요한 버그 수정이 포함되어 있으며(보안 수정이 있을 수도 있음), 타이밍이 중요합니다.

### 타겟 버전을 실행 중인 별도의 ClickHouse 서버에서 실험적 기능 테스트 {#test-experimental-features-on-a-separate-clickhouse-server-running-the-target-version}

실험적 기능의 호환성은 언제든지 어떤 방식으로든 깨질 수 있습니다. 실험적 기능을 사용 중이라면, 변경 로그를 확인하고 타겟 버전이 설치된 별도의 ClickHouse 서버를 설정하여 그곳에서 실험적 기능을 테스트하는 것을 고려해야 합니다.

### 다운그레이드 {#downgrades}
업그레이드한 후 새로운 버전이 의존하는 일부 기능과 호환되지 않음을 깨달으면, 새로운 기능을 사용하기 시작하기 전이라면 최근(1년 미만)의 버전으로 다운그레이드할 수 있습니다. 새로운 기능이 사용되면 다운그레이드가 작동하지 않습니다.

### 클러스터 내 여러 ClickHouse 서버 버전 {#multiple-clickhouse-server-versions-in-a-cluster}

저희는 1년의 호환성 창을 유지하기 위해 노력하고 있습니다(여기에는 2개의 LTS 버전이 포함됨). 이는 서로 간의 차이가 1년 미만(또는 2개의 LTS 버전이 그 사이에 없으면)인 경우 어떤 두 버전이 클러스터에서 함께 작동할 수 있음을 의미합니다. 그러나 클러스터의 모든 구성원을 가능한 한 빠르게 동일한 버전으로 업그레이드하는 것이 좋습니다. 왜냐하면 분산 쿼리의 지연, ReplicatedMergeTree의 일부 백그라운드 작업에서 재시도 가능한 오류 등과 같은 몇 가지 사소한 문제가 발생할 수 있기 때문입니다.

저희는 릴리스 날짜가 1년 이상 차이가 나는 동일한 클러스터에서 서로 다른 버전을 실행하는 것을 절대 권장하지 않습니다. 데이터 손실이 발생할 것이라고 예상하지는 않지만, 클러스터가 사용할 수 없게 될 수 있습니다. 1년 이상의 버전 차이가 있을 경우 예상해야 할 문제에는 다음이 포함됩니다:

- 클러스터가 작동하지 않을 수 있음
- 일부(또는 모든) 쿼리가 임의의 오류로 실패할 수 있음
- 로그에 임의의 오류/경고가 나타날 수 있음
- 다운그레이드가 불가능할 수 있음

### 점진적 업그레이드 {#incremental-upgrades}

현재 버전과 타겟 버전 간의 차이가 1년 이상인 경우, 다음 중 하나를 권장합니다:
- 다운타임을 수반하는 업그레이드(모든 서버를 중지하고, 모든 서버를 업그레이드한 후, 모든 서버를 실행).
- 또는 중간 버전을 통해 업그레이드(현재 버전보다 1년 미만 최근의 버전).

## 권장 계획 {#recommended-plan}

다음은 제로 다운타임 ClickHouse 업그레이드를 위한 추천 단계입니다:

1. 구성 변경 사항이 기본 `/etc/clickhouse-server/config.xml` 파일에 있지 않고 `/etc/clickhouse-server/config.d/`에 있는지 확인하십시오. `/etc/clickhouse-server/config.xml`은 업그레이드 중에 덮어씌워질 수 있습니다.
2. [변경 로그](/whats-new/changelog/index.md)를 읽고 파괴적인 변경 사항에 대해 살펴보십시오(타겟 릴리스에서 현재 사용 중인 릴리스까지).
3. 업그레이드 전에 적용할 수 있는 파괴적인 변경 사항을 식별하고, 업그레이드 후에 적용해야 할 변경 사항 목록을 만듭니다.
4. 업그레이드하는 동안 나머지 복제본을 유지할 각 샤드에 대해 하나 이상의 복제본을 식별합니다.
5. 업그레이드할 복제본에서, 하나씩:
- ClickHouse 서버를 종료하십시오  
- 서버를 타겟 버전으로 업그레이드하십시오  
- ClickHouse 서버를 시작하십시오  
- 시스템이 안정적이라는 것을 나타내는 Keeper 메시지를 기다리십시오  
- 다음 복제본으로 계속 진행합니다
6. Keeper 로그와 ClickHouse 로그에서 오류를 확인하십시오
7. 4단계에서 식별한 복제본을 새 버전으로 업그레이드하십시오
8. 1단계부터 3단계에서 작성된 변경 사항 목록을 참조하고, 업그레이드 후에 적용해야 할 변경 사항을 적용하십시오.

:::note
복제된 환경에서 여러 버전의 ClickHouse가 실행 중일 때 이 오류 메시지가 발생하는 것은 예상되는 일입니다. 모든 복제본이 동일한 버전으로 업그레이드되면 더 이상 이러한 메시지가 나타나지 않습니다.
```text
MergeFromLogEntryTask: Code: 40. DB::Exception: Checksums of parts don't match:
hash of uncompressed files doesn't match. (CHECKSUM_DOESNT_MATCH)  Data after merge is not
byte-identical to data on another replicas.
```
:::

## ClickHouse 서버 바이너리 업그레이드 프로세스 {#clickhouse-server-binary-upgrade-process}

ClickHouse가 `deb` 패키지에서 설치된 경우, 서버에서 다음 명령을 실행하십시오:

```bash
$ sudo apt-get update
$ sudo apt-get install clickhouse-client clickhouse-server
$ sudo service clickhouse-server restart
```

추천하는 `deb` 패키지 외의 방법으로 ClickHouse를 설치한 경우, 적절한 업데이트 방법을 사용하십시오.

:::note
모든 복제본의 샤드가 오프라인 상태가 아닌 순간에 여러 서버를 동시에 업데이트할 수 있습니다.
:::

특정 버전으로 이전 ClickHouse 버전을 업그레이드하는 방법:

예를 들어:

`xx.yy.a.b`는 현재 안정적인 버전입니다. 최신 안정적인 버전은 [여기](https://github.com/ClickHouse/ClickHouse/releases)에서 확인할 수 있습니다.

```bash
$ sudo apt-get update
$ sudo apt-get install clickhouse-server=xx.yy.a.b clickhouse-client=xx.yy.a.b clickhouse-common-static=xx.yy.a.b
$ sudo service clickhouse-server restart
```
