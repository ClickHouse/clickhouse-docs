---
sidebar_label: 'Postgres ClickPipe 라이프사이클'
description: '다양한 파이프 상태와 해당 의미'
slug: /integrations/clickpipes/postgres/lifecycle
title: 'Postgres ClickPipe 라이프사이클'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', '데이터 수집', '실시간 동기화']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

# Postgres ClickPipe의 라이프사이클 \{#lifecycle\}

이 문서는 Postgres ClickPipe의 각 단계와 가질 수 있는 다양한 상태, 그리고 각 상태가 무엇을 의미하는지 설명합니다.

## 프로비저닝 \{#provisioning\}

「Create ClickPipe」 버튼을 클릭하면 ClickPipe가 `Provisioning` 상태로 생성됩니다. 프로비저닝 과정에서는 서비스에서 ClickPipes를 실행하기 위한 기본 인프라를 준비하고, 파이프에 대한 일부 초기 메타데이터를 등록합니다. 서비스 내에서 ClickPipes의 컴퓨팅 자원이 공유되므로, 두 번째 ClickPipe는 이미 인프라가 준비되어 있기 때문에 첫 번째보다 훨씬 빠르게 생성됩니다.

## 설정 \{#setup\}

파이프가 프로비저닝되면 `Setup` 상태로 전환됩니다. 이 단계에서 대상 ClickHouse 테이블을 생성합니다. 또한 여기에서 소스 테이블의 테이블 정의를 조회하여 기록합니다.

## 스냅샷 \{#snapshot\}

설정이 완료되면 `Snapshot` 상태로 들어갑니다 (`CDC` 전용 파이프인 경우에는 `Running` 상태로 전환됩니다). `Snapshot`, `Initial Snapshot`, `Initial Load`(더 흔히 사용됨)은 서로 같은 의미로 사용됩니다. 이 상태에서는 소스 데이터베이스 테이블의 스냅샷을 생성하고 이를 ClickHouse로 로드합니다. 이 과정에서는 논리적 복제를 사용하지 않지만, 이 단계에서 복제 슬롯이 생성되므로, 초기 로드 동안 슬롯 크기가 증가하는 것을 고려하여 `max_slot_wal_keep_size` 및 스토리지 관련 매개변수를 설정해야 합니다. 초기 로드에 대한 자세한 내용은 [병렬 초기 로드 문서](./parallel_initial_load)를 참고하십시오. 또한 파이프는 재동기화가 수행되거나 기존 파이프에 새 테이블이 추가될 때도 `Snapshot` 상태로 들어갑니다.

## Running \{#running\}

초기 로드가 완료되면 파이프는 `Running` 상태로 들어갑니다(스냅샷 전용 파이프인 경우 `Completed` 상태로 전환됩니다). 이 상태에서 파이프는 Change Data Capture(CDC)를 시작합니다. 이 상태에서는 소스 데이터베이스에서 ClickHouse로 논리적 복제(logical replication)를 시작합니다. CDC 제어에 대한 자세한 내용은 [CDC 제어 문서](./sync_control)를 참고하십시오.

## 일시 중지됨 \{#paused\}

파이프가 `Running` 상태가 되면 일시 중지할 수 있습니다. 이때 CDC 프로세스가 중지되고 파이프는 `Paused` 상태로 전환됩니다. 이 상태에서는 소스 데이터베이스에서 새로운 데이터를 가져오지 않지만, ClickHouse에 이미 존재하는 데이터는 그대로 유지됩니다. 이 상태에서 파이프를 다시 시작할 수 있습니다.

## 일시 중지 \{#pausing\}

:::note
이 상태는 곧 지원될 예정입니다. [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)를 사용 중이라면, 릴리스 시 통합이 계속 정상 동작하도록 지금 이 상태에 대한 지원을 추가하는 것을 고려하십시오.
:::
Pause 버튼을 클릭하면 파이프는 `Pausing` 상태로 전환됩니다. 이는 CDC 프로세스를 중지하는 중인 일시적인 상태입니다. CDC 프로세스가 완전히 중지되면, 파이프는 `Paused` 상태로 전환됩니다.

## 수정 중 \{#modifying\}

:::note
이 상태는 곧 제공될 예정입니다. 현재 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)를 사용 중이라면, 릴리스 이후에도 통합이 계속 정상적으로 동작하도록 지금 이 상태에 대한 지원을 추가하는 것을 고려하십시오.
:::
현재는 이 상태가 파이프가 테이블을 제거하는 중임을 나타냅니다.

## Resync \{#resync\}

:::note
이 상태는 곧 추가될 예정입니다. 현재 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)를 사용 중인 경우, 이 상태가 출시되었을 때 연동이 계속 정상 동작하도록 지금 미리 지원을 추가하는 것을 고려하십시오.
:::
이 상태는 파이프가 resync 단계에 있으며, `_resync` 테이블을 원래 테이블과 원자적 교체(atomic swap) 작업을 수행하고 있음을 나타냅니다. resync에 대한 더 자세한 정보는 [resync 문서](./resync)를 참고하십시오.

## Completed \{#completed\}

이 상태는 스냅샷 전용 ClickPipes에 적용되며, 스냅샷이 완료되어 더 이상 수행할 작업이 없음을 나타냅니다.

## Failed \{#failed\}

파이프에서 복구할 수 없는 오류가 발생하면 `Failed` 상태로 전환됩니다. 이 상태에서 복구하려면 지원팀에 문의하거나 파이프를 [resync](./resync)하여 주십시오.