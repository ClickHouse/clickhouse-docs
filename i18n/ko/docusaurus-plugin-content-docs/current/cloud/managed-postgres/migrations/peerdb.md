---
slug: /cloud/managed-postgres/migrations/peerdb
sidebar_label: 'PeerDB'
title: 'PeerDB를 사용하여 PostgreSQL 데이터 마이그레이션하기'
description: 'PeerDB를 사용하여 PostgreSQL 데이터를 ClickHouse Managed Postgres로 마이그레이션하는 방법을 알아봅니다'
keywords: ['postgres', 'postgresql', 'logical replication', 'migration', 'data transfer', 'managed postgres', 'peerdb']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import sourcePeer from '@site/static/images/managed-postgres/peerdb/source-peer.png';
import targetPeer from '@site/static/images/managed-postgres/peerdb/target-peer.png';
import peers from '@site/static/images/managed-postgres/peerdb/peers.png';
import createMirror from '@site/static/images/managed-postgres/peerdb/create-mirror.png';
import tablePicker from '@site/static/images/managed-postgres/peerdb/table-picker.png';
import initialLoad from '@site/static/images/managed-postgres/peerdb/initial-load.png';
import mirrors from '@site/static/images/managed-postgres/peerdb/mirrors.png';
import settings from '@site/static/images/managed-postgres/peerdb/settings.png';


# PeerDB를 사용해 Managed Postgres로 마이그레이션하기 \{#peerdb-migration\}

이 가이드는 PeerDB를 사용해 PostgreSQL 데이터베이스를 ClickHouse Managed Postgres로 마이그레이션하는 방법을 단계별로 설명합니다.

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="migration-guide-peerdb" />

## 사전 준비 사항 \{#migration-peerdb-prerequisites\}

- 소스 PostgreSQL 데이터베이스에 대한 접근 권한
- 데이터를 마이그레이션하려는 ClickHouse Managed Postgres 인스턴스
- PeerDB가 설치된 머신. [PeerDB GitHub 저장소](https://github.com/PeerDB-io/peerdb?tab=readme-ov-file#get-started)의 설치 안내를 따르면 됩니다. 저장소를 복제한 후 `docker-compose up`만 실행하면 됩니다. 이 가이드에서는 **PeerDB UI**를 사용하며, PeerDB가 실행 중이면 `http://localhost:3000`에서 접속할 수 있습니다.

## 마이그레이션 전 고려사항 \{#migration-peerdb-considerations-before\}

마이그레이션을 시작하기 전에 다음 사항을 고려하십시오.

- **데이터베이스 객체**: PeerDB는 소스 스키마를 기반으로 대상 데이터베이스에 테이블을 자동으로 생성합니다. 다만 인덱스, 제약 조건, 트리거와 같은 특정 데이터베이스 객체는 자동으로 마이그레이션되지 않습니다. 마이그레이션 이후 대상 데이터베이스에서 이러한 객체를 수동으로 다시 생성해야 합니다.
- **DDL 변경 사항**: 연속 복제를 활성화하면 PeerDB는 DML 작업(INSERT, UPDATE, DELETE)에 대해 소스와 대상 데이터베이스를 동기화하고, ADD COLUMN 작업을 전파합니다. 그러나 다른 DDL 변경 사항(DROP COLUMN, ALTER COLUMN 등)은 자동으로 전파되지 않습니다. 스키마 변경 사항 지원에 대한 자세한 내용은 [여기](/integrations/clickpipes/postgres/schema-changes)를 참고하십시오.
- **네트워크 연결**: PeerDB가 실행 중인 머신에서 소스와 대상 데이터베이스 모두에 정상적으로 접근할 수 있어야 합니다. 연결을 허용하기 위해 방화벽 규칙 또는 보안 그룹 설정을 구성해야 할 수 있습니다.

## 피어 생성 \{#migration-peerdb-create-peers\}

먼저 소스 데이터베이스와 대상 데이터베이스 모두에 대해 피어를 생성해야 합니다. 피어는 데이터베이스에 대한 연결을 나타내는 개체입니다. PeerDB UI에서 사이드바의 "Peers"를 클릭하여 "Peers" 섹션으로 이동합니다. 새 피어를 생성하려면 `+ New peer` 버튼을 클릭하십시오.

### 소스 피어 생성 \{#migration-peerdb-source-peer\}

호스트, 포트, 데이터베이스 이름, 사용자 이름, 비밀번호와 같은 연결 정보를 입력해 소스 PostgreSQL 데이터베이스에 대한 피어를 생성합니다. 모든 정보를 입력한 후 `Create peer` 버튼을 클릭하여 피어를 저장합니다.

<Image img={sourcePeer} alt="소스 피어 생성" size="md" border />

### 대상 피어 생성 \{#migration-peerdb-target-peer\}

마찬가지로 필요한 연결 정보를 제공하여 ClickHouse Managed Postgres 인스턴스용 피어를 생성합니다. 인스턴스의 [연결 정보](../connection)는 ClickHouse Cloud 콘솔에서 확인할 수 있습니다. 정보를 모두 입력한 후 `Create peer` 버튼을 클릭하여 대상 피어를 저장합니다.

<Image img={targetPeer} alt="대상 피어 생성" size="md" border />

이제 「Peers」 섹션에 소스 피어와 대상 피어가 모두 표시됩니다.

<Image img={peers} alt="피어 목록" size="md" border />

### 소스 스키마 덤프 가져오기 \{#migration-peerdb-source-schema-dump\}

대상 데이터베이스에 소스 데이터베이스 구성을 동일하게 반영하려면 소스 데이터베이스의 스키마 덤프를 확보해야 합니다. `pg_dump`를 사용하여 소스 PostgreSQL 데이터베이스의 스키마만 포함된 스키마 전용 덤프를 생성할 수 있습니다:

```shell
pg_dump -d 'postgresql://<user>:<password>@<host>:<port>/<database>'  -s > source_schema.sql
```

대상 데이터베이스에 이를 적용하기 전에 PeerDB가 대상 테이블로 데이터를 수집할 때 이러한 제약으로 인해 차단되지 않도록 덤프 파일에서 UNIQUE 제약 조건과 인덱스를 제거해야 합니다. 이는 다음과 같이 제거할 수 있습니다:

```shell
# Preview
grep -n "CONSTRAINT.*UNIQUE" <dump_file_path>
grep -n "CREATE UNIQUE INDEX" <dump_file_path>
grep -n -E "(CONSTRAINT.*UNIQUE|CREATE UNIQUE INDEX)" <dump_file_path>

# Remove
sed -i.bak -E '/CREATE UNIQUE INDEX/,/;/d; /(CONSTRAINT.*UNIQUE|ADD CONSTRAINT.*UNIQUE)/d' <dump_file_path>
```


### 스키마 덤프를 대상 데이터베이스에 적용하기 \{#migration-peerdb-apply-schema-dump\}

스키마 덤프 파일을 정리한 후, `psql`로 [연결](../connection)하여 스키마 덤프 파일을 실행하면 대상 ClickHouse Managed Postgres 데이터베이스에 적용할 수 있습니다.

```shell
psql -h <target_host> -p <target_port> -U <target_username> -d <target_database> -f source_schema.sql
```

대상 측에서는 외래 키 제약 조건 때문에 PeerDB 수집이 차단되지 않도록 해야 합니다. 이를 위해 대상 피어에서 위에서 사용한 대상 역할을 수정하여 `session_replication_role`을 `replica`로 설정합니다:

```sql
ALTER ROLE <target_role> SET session_replication_role = replica;
```


## 미러 생성 \{#migration-peerdb-create-mirror\}

다음으로, 소스 피어와 대상 피어 간의 데이터 마이그레이션 프로세스를 정의하기 위해 미러를 생성해야 합니다. PeerDB UI에서 사이드바의 "Mirrors"를 클릭하여 "Mirrors" 섹션으로 이동합니다. 새 미러를 생성하려면 `+ New mirror` 버튼을 클릭합니다.

<Image img={createMirror} alt="Create Mirror" size="md" border />

1. 마이그레이션을 잘 설명할 수 있는 이름을 미러에 지정합니다.
2. 드롭다운 메뉴에서 앞에서 생성한 소스 피어와 대상 피어를 선택합니다.
3. 다음 사항을 확인합니다.

- Soft delete가 OFF 상태입니다.
- `Advanced settings`를 펼칩니다. **Postgres type system이 활성화되어 있고** **PeerDB columns가 비활성화되어 있는지** 확인합니다.

<Image img={settings} alt="Mirror Settings" size="md" border />

4. 마이그레이션하려는 테이블을 선택합니다. 특정 테이블만 선택할 수도 있고, 소스 데이터베이스의 모든 테이블을 선택할 수도 있습니다.

<Image img={tablePicker} alt="Table Picker" size="md" border />

:::info 테이블 선택
이전 단계에서 스키마를 그대로 마이그레이션했으므로, 대상 데이터베이스에서 대상 테이블 이름이 소스 테이블 이름과 동일한지 확인하십시오.
:::

5. 미러 설정 구성을 마쳤다면 `Create mirror` 버튼을 클릭합니다.

"Mirrors" 섹션에서 새로 생성된 미러를 확인할 수 있습니다.

<Image img={mirrors} alt="Mirrors List" size="md" border />

## 초기 로드 대기 \{#migration-peerdb-initial-load\}

미러를 생성하면 PeerDB가 소스 데이터베이스에서 대상 데이터베이스로 초기 데이터 로드를 시작합니다. 미러를 클릭한 뒤 **Initial load** 탭을 선택하여 초기 데이터 마이그레이션 진행 상태를 모니터링할 수 있습니다.

<Image img={initialLoad} alt="초기 로드 진행 상황" size="md" border />

초기 로드가 완료되면 마이그레이션이 완료되었음을 나타내는 상태가 표시됩니다.

## 초기 적재와 복제 모니터링 \{#migration-peerdb-monitoring\}

소스 피어(source peer)를 클릭하면 PeerDB가 실행 중인 명령 목록을 확인할 수 있습니다. 예를 들면 다음과 같습니다.

1. 먼저 각 테이블의 행 수를 추정하기 위해 `COUNT` 쿼리를 실행합니다.
2. 그런 다음 큰 테이블을 더 작은 청크로 나누어 효율적으로 데이터를 전송할 수 있도록 `NTILE`을 사용한 파티셔닝 쿼리를 실행합니다.
3. 이후 `FETCH` 명령을 통해 소스 데이터베이스에서 데이터를 가져오고, PeerDB가 이를 대상 데이터베이스와 동기화합니다.

## 마이그레이션 후 작업 \{#migration-peerdb-considerations\}

마이그레이션이 완료된 후에는 다음 작업을 수행하십시오.

- **데이터베이스 객체 재생성**: 대상 데이터베이스에서는 인덱스, 제약 조건(constraints), 트리거가 자동으로 마이그레이션되지 않으므로 수동으로 다시 생성해야 합니다.
- **애플리케이션 테스트**: 모든 것이 예상대로 동작하는지 확인하기 위해 애플리케이션을 ClickHouse Managed Postgres 인스턴스를 대상으로 테스트합니다.
- **리소스 정리**: 마이그레이션 결과에 만족하고 애플리케이션이 ClickHouse Managed Postgres를 사용하도록 전환했다면, PeerDB에서 mirror와 peer를 삭제하여 리소스를 정리할 수 있습니다.

:::info 복제 슬롯
지속적인 복제를 활성화한 경우 PeerDB는 소스 PostgreSQL 데이터베이스에 **replication slot**을 생성합니다. 불필요한 리소스 사용을 방지하려면 마이그레이션을 완료한 후 소스 데이터베이스에서 replication slot을 수동으로 삭제해야 합니다.
:::

## 참고 자료 \{#migration-peerdb-references\}

- [ClickHouse Managed Postgres 문서](../)
- [CDC 생성을 위한 PeerDB 가이드](https://docs.peerdb.io/mirror/cdc-pg-pg)
- [Postgres ClickPipe FAQ (PeerDB에도 그대로 적용됩니다)](../../../integrations/data-ingestion/clickpipes/postgres/faq.md)

## 다음 단계 \{#migration-pgdump-pg-restore-next-steps\}

축하합니다! `pg_dump`와 `pg_restore`를 사용하여 PostgreSQL 데이터베이스를 ClickHouse Managed Postgres로 성공적으로 마이그레이션했습니다. 이제 Managed Postgres의 기능과 ClickHouse와의 통합을 살펴볼 준비가 되었습니다. 시작하는 데 도움이 되는 약 10분 분량의 빠른 시작 가이드는 아래를 참고하십시오.

- [Managed Postgres 빠른 시작 가이드](../quickstart)