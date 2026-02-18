---
description: '사용 가능한 모든 Keeper 노드의 내부 정보를 출력하는 system 테이블입니다.'
keywords: ['system 테이블', 'zookeeper_info']
slug: /operations/system-tables/zookeeper_info
title: 'system.zookeeper_info'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.zookeeper_info \{#systemzookeeper_info\}

<SystemTableCloud />

이 테이블은 ZooKeeper에 대한 통합된 내부 상태 정보를 출력하며, 노드 정보는 설정(config)에서 가져옵니다.

컬럼:

* `zookeeper_cluster_name` ([String](../../sql-reference/data-types/string.md)) — ZooKeeper 클러스터의 이름입니다.
* `host` ([String](../../sql-reference/data-types/string.md)) — ClickHouse가 연결한 ZooKeeper 노드의 호스트 이름/IP 주소입니다.
* `port` ([UInt16](../../sql-reference/data-types/int-uint.md)) — ClickHouse가 연결된 ZooKeeper 노드의 포트입니다.
* `index` ([Nullable(UInt8)](../../sql-reference/data-types/int-uint.md)) — ClickHouse가 연결된 ZooKeeper 노드의 인덱스입니다. 인덱스 값은 ZooKeeper 설정에서 가져온 것입니다. 연결되지 않은 경우 이 컬럼은 NULL입니다.
* `is_connected` ([널 허용(UInt8)](../../sql-reference/data-types/int-uint.md)) — ZooKeeper가 연결된 상태인지 여부를 나타냅니다.
* `is_readonly` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 읽기 전용 여부를 나타냅니다.
* `version` ([String](../../sql-reference/data-types/string.md)) — ZooKeeper의 버전입니다.
* `avg_latency` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 평균 지연 시간.
* `max_latency` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 최대 지연 시간입니다.
* `min_latency` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 최소 지연 시간.
* `packets_received` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 수신된 패킷의 개수입니다.
* `packets_sent` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 전송된 패킷의 개수입니다.
* `outstanding_requests` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 아직 처리되지 않은 요청 수입니다.
* `server_state` ([String](../../sql-reference/data-types/string.md)) — 서버 상태입니다.
* `is_leader` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 이 ZooKeeper 인스턴스가 리더인지 여부입니다.
* `znode_count` ([UInt64](../../sql-reference/data-types/int-uint.md)) — znode 개수입니다.
* `watch_count` ([UInt64](../../sql-reference/data-types/int-uint.md)) — watch 횟수입니다.
* `ephemerals_count` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ephemeral 노드 수입니다.
* `approximate_data_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 데이터 크기의 근사값입니다.
* `followers` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 리더의 followers 수입니다. 이 필드는 리더에서만 노출됩니다.
* `synced_followers` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 리더와 동기화된 follower 수입니다. 이 필드는 리더에서만 노출되는 필드입니다.
* `pending_syncs` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 리더의 대기 중인 동기화 작업 수입니다. 이 필드는 리더에서만 표시됩니다.
* `open_file_descriptor_count` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 열려 있는 파일 디스크립터 수입니다. Unix 플랫폼에서만 제공됩니다.
* `max_file_descriptor_count` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 최대 파일 디스크립터 수입니다. Unix 플랫폼에서만 사용할 수 있습니다.
* `connections` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper 연결 수를 나타냅니다.
* `outstanding` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper의 미처리 요청 수.
* `zxid` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper zxid 값입니다.
* `node_count` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper 노드 수입니다.
* `snapshot_dir_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper 스냅샷 디렉터리의 크기입니다.
* `log_dir_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper 로그 디렉터리의 크기입니다.
* `first_log_idx` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper의 첫 번째 로그 인덱스입니다.
* `first_log_term` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper의 첫 번째 로그 term입니다.
* `last_log_idx` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper의 마지막 로그 인덱스 값입니다.
* `last_log_term` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper의 마지막 로그 term을 나타냅니다.
* `last_committed_idx` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper에서 마지막으로 커밋된 인덱스입니다.
* `leader_committed_log_idx` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper 리더가 커밋한 로그 인덱스입니다.
* `target_committed_log_idx` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper의 대상 커밋 로그 인덱스입니다.
* `last_snapshot_idx` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ZooKeeper의 마지막 스냅샷 인덱스 값입니다.
  g