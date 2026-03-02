---
sidebar_label: 'MySQL ClickPipe 수명 주기'
description: '다양한 파이프 상태와 의미'
slug: /integrations/clickpipes/mysql/lifecycle
title: 'MySQL ClickPipe 수명 주기'
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'cdc', '데이터 수집', '실시간 동기화']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

# MySQL ClickPipe의 라이프사이클 \{#lifecycle\}

이 문서는 MySQL ClickPipe의 여러 단계, 가질 수 있는 다양한 상태, 그리고 각 상태의 의미에 대해 설명합니다. 이 내용은 MariaDB에도 적용됩니다.

## Provisioning \{#provisioning\}

「Create ClickPipe」 버튼을 클릭하면 ClickPipe가 `Provisioning` 상태로 생성됩니다. 프로비저닝 과정에서는 해당 서비스에서 ClickPipes를 실행하기 위한 기본 인프라를 준비하고, 파이프에 대한 일부 초기 메타데이터를 등록합니다. 하나의 서비스 내에서 ClickPipes용 컴퓨트 리소스는 공유되므로, 인프라가 이미 준비된 상태에서는 두 번째 ClickPipe는 첫 번째 ClickPipe보다 훨씬 더 빠르게 생성됩니다.

## Setup \{#setup\}

파이프가 프로비저닝된 후 `Setup` 상태가 됩니다. 이 단계에서 대상 ClickHouse 테이블을 생성합니다. 또한 여기에서 소스 테이블의 테이블 정의를 가져와 기록합니다.

## Snapshot \{#snapshot\}

설정이 완료되면 `Snapshot` 상태로 진입합니다(CDC 전용 파이프인 경우에는 `Running` 상태로 전환됩니다). `Snapshot`, `Initial Snapshot`, `Initial Load`(더 일반적으로 사용되는 용어)는 서로 바꿔 쓸 수 있는 용어입니다. 이 상태에서는 소스 MySQL 테이블의 스냅샷을 생성하여 ClickHouse로 적재합니다. 바이너리 로그 보관(retention) 설정은 초기 적재 시간(initial load time)을 고려하여 설정해야 합니다. 초기 적재에 대한 자세한 내용은 [병렬 초기 적재 문서](./parallel_initial_load)를 참조하십시오. 파이프는 재동기화(resync)가 트리거되거나 기존 파이프에 새 테이블이 추가될 때도 `Snapshot` 상태로 진입합니다.

## 실행 중 \{#running\}

초기 로드가 완료되면 파이프는 `Running` 상태로 전환됩니다 (스냅샷 전용 파이프인 경우에는 `Completed` 상태로 전환됩니다). 이 상태에서 파이프는 Change Data Capture(CDC)를 시작합니다. 이 상태에서는 소스 데이터베이스의 바이너리 로그를 읽기 시작하고 데이터를 배치 단위로 ClickHouse에 동기화합니다. CDC 제어에 대한 내용은 [CDC 제어에 대한 문서](./sync_control)를 참조하십시오.

## 일시 중지됨 \{#paused\}

파이프가 `Running` 상태가 되면 일시 중지할 수 있습니다. 이렇게 하면 CDC 프로세스가 중지되고 파이프는 `Paused` 상태로 전환됩니다. 이 상태에서는 소스 데이터베이스에서 새로운 데이터를 가져오지 않지만, ClickHouse에 있는 기존 데이터는 그대로 유지됩니다. 이 상태에서 파이프를 다시 시작할 수 있습니다.

## 일시 중지 중 \{#pausing\}

:::note
이 상태는 곧 제공될 예정입니다. [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)를 사용 중이라면 이 상태에 대한 지원을 지금 추가해 두면, 해당 기능이 릴리스된 이후에도 통합이 계속 동작하도록 할 수 있습니다.
:::
Pause 버튼을 클릭하면 파이프가 `Pausing` 상태로 전환됩니다. 이 상태는 CDC 프로세스를 중지하는 중간 단계인 일시적인 상태입니다. CDC 프로세스가 완전히 중지되면 파이프는 `Paused` 상태가 됩니다.

## 수정 중 \{#modifying\}

:::note
이 상태는 곧 지원될 예정입니다. 현재 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)를 사용 중이라면, 릴리스 시 연동이 계속 정상 동작하도록 지금부터 이 상태에 대한 지원을 추가하는 것을 고려하십시오.
:::
현재 이 상태는 파이프가 테이블을 제거하는 중임을 나타냅니다.

## 재동기화 \{#resync\}

:::note
이 상태는 곧 제공될 예정입니다. [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)를 사용 중인 경우, 지금 이 상태에 대한 지원을 추가해 두면 상태가 출시되었을 때에도 통합이 계속 정상적으로 동작하는 데 도움이 됩니다.
:::
이 상태는 파이프가 재동기화 단계에 있으며, `_resync` 테이블을 원본 테이블과 원자적으로 교체(atomic swap)하는 중임을 나타냅니다. 재동기화에 대한 더 자세한 내용은 [resync 문서](./resync)를 참고하십시오.

## 완료됨 \{#completed\}

이 상태는 스냅샷 전용 파이프에 사용되며, 스냅샷이 완료되어 더 이상 처리할 작업이 없다는 것을 의미합니다.

## Failed \{#failed\}

파이프에서 복구가 불가능한 오류가 발생하면 `Failed` 상태가 됩니다. 이 상태에서 벗어나려면 지원팀에 문의하거나 파이프를 [resync](./resync)하십시오.