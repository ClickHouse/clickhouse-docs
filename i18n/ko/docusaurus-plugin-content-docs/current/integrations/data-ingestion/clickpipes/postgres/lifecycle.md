---
'sidebar_label': 'Postgres ClickPipe의 생애주기'
'description': '다양한 파이프 상태 및 그 의미'
'slug': '/integrations/clickpipes/postgres/lifecycle'
'title': 'Postgres ClickPipe의 생애주기'
'doc_type': 'guide'
'keywords':
- 'clickpipes'
- 'postgresql'
- 'cdc'
- 'data ingestion'
- 'real-time sync'
---


# Lifecycle of a Postgres ClickPipe {#lifecycle}

이 문서는 Postgres ClickPipe의 다양한 단계, 각 단계에서 가질 수 있는 상태, 그리고 그 의미에 대해 설명합니다.

## Provisioning {#provisioning}

Create ClickPipe 버튼을 클릭하면 ClickPipe는 `Provisioning` 상태로 생성됩니다. 프로비저닝 과정에서는 ClickPipes를 위한 기본 인프라를 구성하고 파이프에 대한 초기 메타데이터를 등록합니다. 서비스 내에서 ClickPipes의 컴퓨팅이 공유되기 때문에 두 번째 ClickPipe는 첫 번째보다 훨씬 빠르게 생성됩니다. 인프라가 이미 구성되어 있기 때문입니다.

## Setup {#setup}

파이프가 프로비저닝되면 `Setup` 상태로 전환됩니다. 이 상태에서는 목적지 ClickHouse 테이블을 생성합니다. 또한 여기에서 소스 테이블의 테이블 정의를 얻고 기록합니다.

## Snapshot {#snapshot}

설정이 완료되면 `Snapshot` 상태로 들어갑니다(단, CDC 전용 파이프의 경우 `Running` 상태로 전환됩니다). `Snapshot`, `Initial Snapshot` 및 `Initial Load`(더 일반적임)은 서로 교환 가능한 용어입니다. 이 상태에서는 소스 데이터베이스 테이블의 스냅샷을 찍고 이를 ClickHouse에 로드합니다. 이는 논리적 복제를 사용하지 않지만, 이 단계에서 복제 슬롯이 생성되므로 `max_slot_wal_keep_size` 및 스토리지 매개변수는 초기 로드 중 슬롯 증가를 고려해야 합니다. 초기 로드에 대한 자세한 내용은 [병렬 초기 로드 문서](./parallel_initial_load)를 참조하세요. 파이프는 리싱크가 트리거되거나 기존 파이프에 새로운 테이블이 추가될 때도 `Snapshot` 상태로 들어갑니다.

## Running {#running}

초기 로드가 완료되면 파이프는 `Running` 상태로 들어갑니다(단, 스냅샷 전용 파이프의 경우 `Completed`로 전환됨). 이 상태에서 파이프는 `Change-Data Capture`를 시작합니다. 이 상태에서는 소스 데이터베이스에서 ClickHouse로 논리적 복제를 시작합니다. CDC 제어에 대한 정보는 [CDC 제어 문서](./sync_control)를 참조하세요.

## Paused {#paused}

파이프가 `Running` 상태에 있을 때, 이를 일시 중지할 수 있습니다. 이는 CDC 프로세스를 중단하고 파이프가 `Paused` 상태로 들어가게 합니다. 이 상태에서는 소스 데이터베이스에서 새로운 데이터가 가져오지 않지만, ClickHouse에 있는 기존 데이터는 그대로 유지됩니다. 이 상태에서 파이프를 다시 시작할 수 있습니다.

## Pausing {#pausing}

:::note
이 상태는 곧 제공될 예정입니다. 당사의 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)를 사용하고 있다면, 통합이 출시될 때 정상적으로 작동할 수 있도록 지금 지원을 추가하는 것을 고려하세요.
:::
Pause 버튼을 클릭하면 파이프는 `Pausing` 상태로 들어갑니다. 이는 CDC 프로세스를 중단하는 과정에 있는 일시적인 상태입니다. CDC 프로세스가 완전히 중단되면 파이프는 `Paused` 상태로 들어갑니다.

## Modifying {#modifying}
:::note
이 상태는 곧 제공될 예정입니다. 당사의 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)를 사용하고 있다면, 통합이 출시될 때 정상적으로 작동할 수 있도록 지금 지원을 추가하는 것을 고려하세요.
:::
현재 이 상태는 파이프가 테이블을 제거하는 과정에 있음을 나타냅니다.

## Resync {#resync}
:::note
이 상태는 곧 제공될 예정입니다. 당사의 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)를 사용하고 있다면, 통합이 출시될 때 정상적으로 작동할 수 있도록 지금 지원을 추가하는 것을 고려하세요.
:::
이 상태는 파이프가 _리싱크 테이블과 원래 테이블의 원자적 스왑을 수행하는 리싱크 단계에 있음을 나타냅니다. 리싱크에 대한 자세한 정보는 [리싱크 문서](./resync)를 참조하세요.

## Completed {#completed}

이 상태는 스냅샷 전용 파이프에 적용되며, 스냅샷이 완료되었고 더 이상의 작업이 없음을 나타냅니다.

## Failed {#failed}

파이프에 복구할 수 없는 오류가 발생하면 `Failed` 상태로 들어갑니다. 지원팀에 문의하거나 파이프를 [리싱크](./resync)하여 이 상태에서 복구할 수 있습니다.
