---
sidebar_label: 'MongoDB ClickPipe 라이프사이클'
description: '다양한 파이프 상태와 그 의미'
slug: /integrations/clickpipes/mongodb/lifecycle
title: 'MongoDB ClickPipe 라이프사이클'
doc_type: 'guide'
keywords: ['ClickPipes', 'MongoDB', 'CDC', '데이터 수집', '실시간 동기화']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

# MongoDB ClickPipe의 수명 주기 \{#lifecycle\}

이 문서는 MongoDB ClickPipe가 거치는 여러 단계와 가질 수 있는 다양한 상태, 그리고 각 상태의 의미를 설명합니다.

## Provisioning \{#provisioning\}

Create ClickPipe 버튼을 클릭하면 ClickPipe가 `Provisioning` 상태로 생성됩니다. 프로비저닝 과정에서는 서비스에서 ClickPipes를 실행하기 위한 기본 인프라를 준비하고, 파이프에 대한 초기 메타데이터 일부를 등록합니다. 서비스 내에서 ClickPipes용 컴퓨트 리소스는 공유되므로, 인프라가 이미 준비된 상태에서는 두 번째 ClickPipe가 첫 번째 ClickPipe보다 훨씬 더 빠르게 생성됩니다.

## 설정 \{#setup\}

파이프가 프로비저닝되면 `Setup` 상태가 됩니다. 이 상태는 대상 ClickHouse 테이블을 생성하는 단계입니다.

## 스냅샷 \{#snapshot\}

설정이 완료되면 `Snapshot` 상태로 진입합니다(ClickPipe가 CDC 전용 파이프인 경우에는 `Running` 상태로 전환됩니다). `Snapshot`, `Initial Snapshot`, 그리고 더 일반적인 `Initial Load`라는 용어는 상호 교환하여 사용합니다. 이 상태에서는 소스 MongoDB 컬렉션의 스냅샷을 생성하여 ClickHouse로 적재합니다. oplog의 보존 기간(retention) 설정은 초기 로드 시간(initial load time)을 고려하여 설정해야 합니다. 파이프는 동기화 재수행(resync)이 트리거되거나 기존 파이프에 새 테이블이 추가될 때에도 `Snapshot` 상태로 전환됩니다.

## Running \{#running\}

초기 로드가 완료되면 파이프는 `Running` 상태로 들어갑니다(스냅샷 전용 파이프인 경우 `Completed` 상태로 전환됩니다). 이 상태에서 파이프는 `Change-Data Capture`(CDC)를 시작합니다. 이 상태에서는 소스 MongoDB 클러스터에서 ClickHouse로 변경 내용을 스트리밍하기 시작합니다. CDC를 제어하는 방법은 [CDC 제어 문서](./sync_control)를 참조하십시오.

## 일시 중지됨 \{#paused\}

파이프가 `Running` 상태가 되면 일시 중지할 수 있습니다. 이렇게 하면 CDC 프로세스가 중단되고 파이프는 `Paused` 상태로 전환됩니다. 이 상태에서는 소스 MongoDB에서 새로운 데이터를 가져오지 않지만, ClickHouse에 있는 기존 데이터는 그대로 유지됩니다. 이 상태에서 파이프를 재개할 수 있습니다.

## 일시 중지 중 \{#pausing\}

:::note
이 상태는 곧 제공될 예정입니다. 현재 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)를 사용 중이라면, 기능이 제공된 이후에도 현재 통합이 계속 정상 동작하도록 지금부터 이 상태에 대한 지원을 추가하는 것이 좋습니다.
:::
Pause 버튼을 클릭하면 파이프가 `Pausing` 상태가 됩니다. 이 상태는 CDC(Change Data Capture) 프로세스를 중지하는 과정에 있는 일시적인 상태입니다. CDC 프로세스가 완전히 중지되면, 파이프는 `Paused` 상태가 됩니다.

## 수정 중 \{#modifying\}

:::note
이 상태는 곧 추가될 예정입니다. 현재 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)를 사용 중이라면, 릴리스 후에도 통합이 계속 동작하도록 이 상태에 대한 지원을 미리 추가해 두는 것을 고려하십시오.
:::
현재는 이 상태가 파이프에서 테이블을 제거하는 중임을 나타냅니다.

## Resync \{#resync\}

:::note
이 상태는 곧 도입될 예정입니다. 현재 [OpenAPI](https://clickhouse.com/docs/cloud/manage/openapi)를 사용 중인 경우, 출시 시 통합이 계속 정상적으로 동작하도록 지금부터 이 상태에 대한 지원을 추가하는 것을 고려하십시오.
:::
이 상태는 파이프가 resync(재동기화) 단계에 있고, `_resync` 테이블을 원래 테이블과 원자적으로 교체(atomic swap)하고 있음을 나타냅니다. resync에 대한 자세한 내용은 [resync 문서](./resync)를 참조하십시오.

## Completed \{#completed\}

이 상태는 스냅샷 전용 파이프에 적용되며, 스냅샷이 완료되어 더 이상 처리할 작업이 없음을 나타냅니다.

## Failed \{#failed\}

파이프에서 복구할 수 없는 오류가 발생하면 `Failed` 상태로 전환됩니다. 이 상태에서 복구하려면 지원팀에 문의하거나 파이프를 [resync](./resync)하십시오.