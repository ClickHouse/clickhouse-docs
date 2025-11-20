---
'sidebar_label': 'MySQL ClickPipe의 생애 주기'
'description': '다양한 파이프 상태와 그 의미'
'slug': '/integrations/clickpipes/mysql/lifecycle'
'title': 'MySQL ClickPipe의 생애 주기'
'doc_type': 'guide'
'keywords':
- 'clickpipes'
- 'mysql'
- 'cdc'
- 'data ingestion'
- 'real-time sync'
---


# MySQL ClickPipe의 수명 주기 {#lifecycle}

이 문서는 MySQL ClickPipe의 다양한 단계, 해당 상태와 그 의미에 대해 설명합니다. 이는 MariaDB에도 적용됩니다.

## 프로비저닝 {#provisioning}

Create ClickPipe 버튼을 클릭하면 ClickPipe는 `Provisioning` 상태로 생성됩니다. 프로비저닝 과정에서는 ClickPipes를 운영하기 위한 기본 인프라를 구축하고 파이프에 대한 초기 메타데이터를 등록합니다. 서비스 내 ClickPipes의 컴퓨팅 리소스가 공유되므로 두 번째 ClickPipe는 첫 번째 ClickPipe보다 훨씬 더 빠르게 생성됩니다. 왜냐하면 인프라가 이미 마련되어 있기 때문입니다.

## 설정 {#setup}

파이프가 프로비저닝되면 `Setup` 상태로 들어갑니다. 이 상태에서는 대상 ClickHouse 테이블을 생성합니다. 또한, 소스 테이블의 테이블 정의를 여기에서 가져와 기록합니다.

## 스냅샷 {#snapshot}

설정이 완료되면 `Snapshot` 상태로 들어갑니다 (CDC 전용 파이프인 경우 `Running`으로 전환됩니다). `Snapshot`, `Initial Snapshot` 및 `Initial Load`(더 흔하게 사용됨)는 서로 교환 가능한 용어입니다. 이 상태에서는 소스 MySQL 테이블의 스냅샷을 찍고 이를 ClickHouse에 로드합니다. 이진 로그의 보존 설정은 초기 로드 시간도 고려해야 합니다. 초기 로드에 대한 자세한 내용은 [병렬 초기 로드 문서](./parallel_initial_load)를 참조하세요. 재동기화가 트리거되거나 기존 파이프에 새 테이블이 추가되면 파이프는 또한 `Snapshot` 상태로 들어갑니다.

## 실행 중 {#running}

초기 로드가 완료되면 파이프는 `Running` 상태로 들어갑니다 (스냅샷 전용 파이프인 경우 `Completed`로 전환됩니다). 이 상태에서는 파이프가 `Change-Data Capture`를 시작합니다. 이 상태에서는 소스 데이터베이스에서 이진 로그를 읽기 시작하고 데이터를 ClickHouse로 배치하여 동기화합니다. CDC 제어에 대한 정보는 [CDC 제어 문서](./sync_control)를 참조하세요.

## 일시 중지 {#paused}

파이프가 `Running` 상태에 있을 때 일시 중지할 수 있습니다. 이렇게 하면 CDC 프로세스가 중지되고 파이프는 `Paused` 상태로 들어갑니다. 이 상태에서는 소스 데이터베이스에서 새로운 데이터가 가져오지 않지만 ClickHouse에 있는 기존 데이터는 그대로 유지됩니다. 이 상태에서 파이프를 재개할 수 있습니다.

## 일시 중지 중 {#pausing}

:::note
이 상태는 곧 제공될 예정입니다. 당사의 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)를 사용 중이라면, 출시 시 통합이 계속 작동하도록 지금 지원을 추가하는 것을 고려해 보세요.
:::
Pause 버튼을 클릭하면 파이프는 `Pausing` 상태로 들어갑니다. 이는 CDC 프로세스를 중지하는 과정에 있는 일시적 상태입니다. CDC 프로세스가 완전히 중지되면 파이프는 `Paused` 상태로 들어갑니다.

## 수정 중 {#modifying}
:::note
이 상태는 곧 제공될 예정입니다. 당사의 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)를 사용 중이라면, 출시 시 통합이 계속 작동하도록 지금 지원을 추가하는 것을 고려해 보세요.
:::
현재 이 상태는 파이프가 테이블을 제거하는 과정에 있음을 나타냅니다.

## 재동기화 {#resync}
:::note
이 상태는 곧 제공될 예정입니다. 당사의 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)를 사용 중이라면, 출시 시 통합이 계속 작동하도록 지금 지원을 추가하는 것을 고려해 보세요.
:::
이 상태는 파이프가 원본 테이블과 _resync 테이블 간의 원자적 교환을 수행하는 재동기화 단계에 있음을 나타냅니다. 재동기화에 대한 자세한 내용은 [재동기화 문서](./resync)를 참조하세요.

## 완료 {#completed}

이 상태는 스냅샷 전용 파이프에 적용되며, 스냅샷이 완료되었고 더 이상 작업이 없음을 나타냅니다.

## 실패 {#failed}

파이프에 복구할 수 없는 오류가 발생하면 `Failed` 상태로 들어갑니다. 이 상태에서 복구하기 위해 지원에 연락하거나 파이프를 [재동기화](./resync)할 수 있습니다.
