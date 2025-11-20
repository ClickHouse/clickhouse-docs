---
'sidebar_label': 'MongoDB ClickPipe의 생애 주기'
'description': '다양한 파이프 상태와 그 의미'
'slug': '/integrations/clickpipes/mongodb/lifecycle'
'title': 'MongoDB ClickPipe의 생애 주기'
'doc_type': 'guide'
'keywords':
- 'clickpipes'
- 'mongodb'
- 'cdc'
- 'data ingestion'
- 'real-time sync'
---


# MongoDB ClickPipe의 생애 주기 {#lifecycle}

이 문서는 MongoDB ClickPipe의 다양한 단계와 각 상태가 의미하는 바에 대해 설명합니다.

## 프로비저닝 {#provisioning}

Create ClickPipe 버튼을 클릭하면 ClickPipe가 `Provisioning` 상태로 생성됩니다. 프로비저닝 과정에서는 ClickPipes를 실행하기 위한 기본 인프라를 구축하고 파이프에 대한 초기 메타데이터를 등록합니다. 서비스 내에서 ClickPipes의 compute는 공유되므로 두 번째 ClickPipe는 첫 번째 ClickPipe보다 훨씬 빠르게 생성됩니다. 이는 인프라가 이미 구축되어 있기 때문입니다.

## 설정 {#setup}

파이프가 프로비저닝되면 `Setup` 상태로 진입합니다. 이 상태에서는 목적지 ClickHouse 테이블을 생성합니다.

## 스냅샷 {#snapshot}

설정이 완료되면 `Snapshot` 상태로 진입합니다(단, CDC 전용 파이프의 경우 `Running`으로 전환됨). `Snapshot`, `Initial Snapshot` 및 `Initial Load`(더 일반적)는 상호 교환 가능한 용어입니다. 이 상태에서는 원본 MongoDB 컬렉션의 스냅샷을 찍고 이를 ClickHouse에 로드합니다. oplog에 대한 보존 설정은 초기 로드 시간을 고려해야 합니다. 파이프는 다시 동기화가 트리거되거나 기존 파이프에 새 테이블이 추가되면 `Snapshot` 상태로 진입합니다.

## 실행 중 {#running}

초기 로드가 완료되면 파이프는 `Running` 상태로 진입합니다(단, 스냅샷 전용 파이프의 경우 `Completed`로 전환됨). 여기서 파이프는 `Change-Data Capture`를 시작합니다. 이 상태에서는 원본 MongoDB 클러스터에서 ClickHouse로 변경 사항을 스트리밍하기 시작합니다. CDC 제어에 대한 정보는 [CDC 제어 문서](./sync_control)를 참조하세요.

## 일시 정지 {#paused}

파이프가 `Running` 상태일 때 일시 정지할 수 있습니다. 이것은 CDC 프로세스를 중단하며 파이프는 `Paused` 상태로 진입합니다. 이 상태에서는 원본 MongoDB에서 새로운 데이터가 수집되지 않지만, ClickHouse의 기존 데이터는 그대로 유지됩니다. 이 상태에서 파이프를 재개할 수 있습니다.

## 일시 정지 중 {#pausing}

:::note
이 상태는 곧 제공될 예정입니다. [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)를 사용하는 경우, 릴리스 시 통합이 계속 작동하도록 지원을 추가하는 것을 고려하세요.
:::
Pause 버튼을 클릭하면 파이프는 `Pausing` 상태로 진입합니다. 이것은 CDC 프로세스를 중단하는 과정에 있는 일시적인 상태입니다. CDC 프로세스가 완전히 중단되면 파이프는 `Paused` 상태로 진입합니다.

## 수정 중 {#modifying}
:::note
이 상태는 곧 제공될 예정입니다. [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)를 사용하는 경우, 릴리스 시 통합이 계속 작동하도록 지원을 추가하는 것을 고려하세요.
:::
현재 이 상태는 파이프가 테이블을 제거하는 과정에 있다는 것을 나타냅니다.

## 다시 동기화 {#resync}
:::note
이 상태는 곧 제공될 예정입니다. [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)를 사용하는 경우, 릴리스 시 통합이 계속 작동하도록 지원을 추가하는 것을 고려하세요.
:::
이 상태는 파이프가 _resync 테이블과 원본 테이블을 원자적으로 교환하는 재동기화 단계에 있다는 것을 나타냅니다. 재동기화에 대한 자세한 내용은 [재동기화 문서](./resync)를 참조하세요.

## 완료 {#completed}

이 상태는 스냅샷 전용 파이프에 적용되며, 스냅샷이 완료되었고 더 이상 작업이 없음을 나타냅니다.

## 실패 {#failed}

파이프에 복구할 수 없는 오류가 발생하면 `Failed` 상태로 전환됩니다. 이 상태에서 복구하려면 지원팀에 문의하거나 [재동기화](./resync)를 수행하세요.
