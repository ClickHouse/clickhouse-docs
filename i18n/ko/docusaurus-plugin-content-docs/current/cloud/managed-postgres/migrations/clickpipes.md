---
slug: /cloud/managed-postgres/migrations/clickpipes
sidebar_label: 'ClickPipes'
title: 'ClickPipes의 데이터 소스를 사용해 PostgreSQL 데이터 마이그레이션하기'
description: 'ClickPipes를 사용하여 PostgreSQL 데이터베이스를 ClickHouse Managed Postgres로 마이그레이션하는 방법을 알아봅니다.'
keywords: ['postgres', 'postgresql', '논리적 복제', '마이그레이션', 'ClickPipes', 'Managed Postgres', '데이터 소스', '가져오기']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import advancedSettings from '@site/static/images/managed-postgres/pgpg/advancedsettings.png';
import initialLoad from '@site/static/images/managed-postgres/pgpg/initialload.png';
import migrationForm from '@site/static/images/managed-postgres/pgpg/migrationform.png';
import migrationList from '@site/static/images/managed-postgres/pgpg/migrationlist.png';
import nextExport from '@site/static/images/managed-postgres/pgpg/nextexport.png';
import nextImport from '@site/static/images/managed-postgres/pgpg/nextimport.png';
import overview from '@site/static/images/managed-postgres/pgpg/overview.png';
import psqlExport from '@site/static/images/managed-postgres/pgpg/psqlexport.png';
import psqlImport from '@site/static/images/managed-postgres/pgpg/psqlimport.png';
import serviceCard from '@site/static/images/managed-postgres/pgpg/servicecard.png';
import startImport from '@site/static/images/managed-postgres/pgpg/startimport.png';
import tablePicker from '@site/static/images/managed-postgres/pgpg/tablepicker.png';

# ClickPipes를 사용해 Managed Postgres로 마이그레이션하기 \{#migrate-managed-postgres\}

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="migration-guide-clickhouse-cloud" />

이제 ClickHouse Cloud에서는 ClickPipes를 통해 외부 PostgreSQL 데이터베이스를 Managed Postgres 서비스로 마이그레이션할 수 있습니다. 이 기본 제공 통합을 사용하면 소스 데이터베이스에 연결하고, 스키마(schema)를 내보내 Managed Postgres로 가져온 뒤, 지속적인 복제를 설정하는 작업을 더욱 간편하게 수행할 수 있습니다.

## 사전 요구사항 \{#prerequisites\}

* 복제 권한이 있는 사용자로 원본 PostgreSQL 데이터베이스에 액세스할 수 있어야 합니다. 원본에 해당하는 설정 가이드를 따르십시오.
  * [Amazon RDS Postgres](/integrations/clickpipes/postgres/source/rds)
  * [Amazon Aurora Postgres](/integrations/clickpipes/postgres/source/aurora)
  * [Supabase Postgres](/integrations/clickpipes/postgres/source/supabase)
  * [Google Cloud SQL Postgres](/integrations/clickpipes/postgres/source/google-cloudsql)
  * [Azure Flexible Server for Postgres](/integrations/clickpipes/postgres/source/azure-flexible-server-postgres)
  * [Neon Postgres](/integrations/clickpipes/postgres/source/neon-postgres)
  * [Crunchy Bridge Postgres](/integrations/clickpipes/postgres/source/crunchy-postgres)
  * [TimescaleDB](/integrations/clickpipes/postgres/source/timescale)
  * 기타 provider 또는 자체 호스팅 인스턴스의 경우 [일반 Postgres 원본](/integrations/clickpipes/postgres/source/generic)
* 마이그레이션 대상인 ClickHouse Managed Postgres 서비스가 있어야 합니다. 아직 없다면 [빠른 시작](../quickstart)을 참조하십시오.
* 로컬 머신에 `pg_dump`와 `psql`이 설치되어 있어야 합니다. 두 도구 모두 표준 PostgreSQL 클라이언트 도구에 포함되어 있습니다.

## 마이그레이션 전에 고려할 사항 \{#considerations\}

* **DDL 전파**: 연속 복제(CDC)는 DML 작업과 `ADD COLUMN`을 캡처합니다. `DROP COLUMN` 및 `ALTER COLUMN`과 같은 다른 DDL 변경 사항은 전파되지 않으므로 대상 시스템에 수동으로 적용해야 합니다.

:::note
마이그레이션 중 문제가 발생하면 일반적인 오류와 해결 방법은 [Managed Postgres 마이그레이션 FAQ](/cloud/managed-postgres/migrations/faq)에서 확인하십시오.
:::

## 1단계: 원본 데이터베이스에 연결 \{#step-1-connect\}

[ClickHouse Cloud 콘솔](https://clickhouse.cloud)을 열고 Managed Postgres 서비스를 선택합니다.

<Image img={serviceCard} alt="ClickHouse Cloud 서비스 목록의 Managed Postgres 서비스 카드" size="lg" border />

왼쪽 사이드바에서 **데이터 소스**를 클릭합니다.

<Image img={overview} alt="Managed Postgres 서비스 사이드바의 데이터 소스 항목" size="lg" border />

**가져오기 시작**을 클릭합니다.

<Image img={startImport} alt="가져오기 시작 버튼이 있는 데이터 소스 페이지" size="lg" border />

원본 PostgreSQL 데이터베이스의 연결 정보를 입력합니다. 호스트, 포트, 사용자 이름, 비밀번호, 데이터베이스 이름을 입력하면 됩니다. 원본에서 필요하다면 **TLS**를 활성화합니다.

원본 데이터베이스에 대한 프라이빗 연결이 필요하다면 **SSH 터널링**을 선택하고 필요한 SSH 정보를 입력할 수 있습니다. 이렇게 하면 공개적으로 접근할 수 없는 데이터베이스에도 마이그레이션이 안전하게 연결할 수 있습니다.

수집 방식을 선택합니다:

* **초기 적재 + CDC** — 기존 데이터를 복사한 다음, 이후 변경 사항이 대상에 계속 동기화되도록 합니다.
* **초기 적재만** — 1회성 복사이며, 이후 복제는 수행하지 않습니다.
* **CDC만** — 초기 복사를 건너뛰고 이 시점부터 발생하는 새 변경 사항만 복제합니다.

<Image img={migrationForm} alt="1단계: 수집 방식 옵션이 있는 원본 데이터베이스 연결 양식" size="lg" border />

**다음**을 클릭합니다.

## 2단계: 데이터베이스 스키마 내보내기 \{#step-2-export-schema\}

마법사에 소스 연결 정보가 미리 입력된 `pg_dump` 명령이 표시됩니다. 터미널에서 실행하십시오:

<Image img={nextExport} alt="2단계: 스키마 내보내기용 pg_dump 명령" size="lg" border />

```shell
pg_dump \
  -h <source_host> \
  -U <source_user> \
  -d <source_database> \
  --schema-only \
  -f pg.sql
```

이 명령을 실행하면 현재 디렉터리에 `pg.sql` 파일이 생성됩니다.

<Image img={psqlExport} alt="`pg_dump` 실행 후 터미널 출력" size="lg" border />

**Next**를 클릭하세요.

## 3단계: 스키마를 Managed Postgres 서비스로 가져오기 \{#step-3-import-schema\}

드롭다운에서 대상 데이터베이스를 선택하거나, **Create a new database**를 클릭하여 새 데이터베이스를 생성하십시오.

마법사에 스키마 덤프를 Managed Postgres 서비스에 적용하는 `psql` 명령이 표시됩니다. 터미널에서 이 명령을 실행하십시오:

<Image img={nextImport} alt="3단계: 스키마 가져오기를 위한 psql 명령" size="lg" border />

```shell
psql \
  -h <target_host> \
  -p 5432 \
  -U <target_user> \
  -d <target_database> \
  -f pg.sql
```

<Image img={psqlImport} alt="psql로 스키마를 가져온 후의 터미널 출력" size="lg" border />

**다음**을 클릭하세요.

## 4단계: 수집 설정 구성 \{#step-4-ingestion-settings\}

논리적 복제에 사용할 publication을 지정합니다. 비워 두면 publication이 자동으로 생성됩니다.

처리량을 조정하려면 **고급 복제 설정**을 펼치십시오:

| 설정            | 기본값     | 설명                        |
| ------------- | ------- | ------------------------- |
| 동기화 간격(초)     | 10      | replication slot을 폴링하는 주기 |
| 초기 적재용 병렬 스레드 | 4       | 대량 복사 단계에 사용할 스레드 수       |
| 가져오기 배치 크기    | 100,000 | 복제 배치마다 가져오는 행 수          |
| 파티션당 스냅샷 행 수  | 100000  | 대규모 테이블 스냅샷의 파티션 크기       |
| 병렬 스냅샷 테이블 수  | 1       | 동시에 스냅샷하는 테이블 수           |

<Image img={advancedSettings} alt="4단계: publication 및 고급 복제 옵션이 포함된 수집 설정 양식" size="lg" border />

**다음**을 클릭하십시오.

## 5단계: 테이블 선택 \{#step-5-select-tables\}

복제할 테이블을 선택합니다. 테이블은 스키마별로 묶여 있습니다. 개별 테이블을 선택하거나 스키마를 펼쳐 해당 스키마의 모든 테이블을 선택합니다.

<Image img={tablePicker} alt="5단계: Create migration 버튼이 있는 스키마별 테이블 선택기" size="lg" border />

**Create migration**을 클릭합니다.

## 마이그레이션 모니터링 \{#monitor\}

마이그레이션을 생성하면 **데이터 소스**에 **실행 중** 상태로 표시됩니다.

<Image img={migrationList} alt="실행 중인 마이그레이션이 표시된 데이터 소스 목록" size="lg" border />

마이그레이션을 클릭하여 상세 보기를 여십시오. **테이블** 탭에는 처리된 행 수, 파티션, 파티션당 평균 시간을 포함해 각 테이블의 초기 적재 진행 상황이 표시됩니다. **메트릭** 탭에는 CDC가 시작되면 복제 지연과 처리량이 표시됩니다.

<Image img={initialLoad} alt="테이블별 초기 적재 통계가 표시된 마이그레이션 상세 보기" size="lg" border />

## 마이그레이션 후 작업 \{#post-migration\}

초기 적재가 완료되고, CDC를 사용하는 경우 복제 지연이 거의 0이 되면:

**행 수를 검증하세요.** 트래픽을 전환하기 전에 소스와 대상의 주요 테이블 몇 개를 골라 행 수를 대조하십시오:

```sql
SELECT COUNT(*) FROM public.orders;
```

**소스에 대한 쓰기를 중지합니다.** 애플리케이션의 쓰기 작업을 일시 중지하십시오. 컷오버 중 읽기 전용 모드를 적용하려면:

```sql
ALTER DATABASE <source_db> SET default_transaction_read_only = on;
```

**복제가 최신 상태까지 반영되었는지 확인하십시오.** 소스와 대상의 최신 행을 비교하십시오:

```sql
-- Run on both source and target
SELECT MAX(id), MAX(updated_at) FROM public.orders;
```

**시퀀스를 재설정합니다.** 각 테이블의 현재 최댓값에 맞게 시퀀스를 조정합니다:

```sql
DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN
        SELECT
            n.nspname AS schema_name,
            c.relname AS table_name,
            a.attname AS column_name,
            pg_get_serial_sequence(format('%I.%I', n.nspname, c.relname), a.attname) AS seq_name
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        JOIN pg_attribute a ON a.attrelid = c.oid
        WHERE c.relkind = 'r'
            AND a.attnum > 0
            AND NOT a.attisdropped
            AND n.nspname NOT IN ('pg_catalog', 'information_schema')
    LOOP
        IF r.seq_name IS NOT NULL THEN
            EXECUTE format(
                'SELECT setval(%L, COALESCE((SELECT MAX(%I) FROM %I.%I), 0) + 1, false)',
                r.seq_name, r.column_name, r.schema_name, r.table_name
            );
        END IF;
    END LOOP;
END $$;
```

**애플리케이션 트래픽을 전환합니다.** 읽기 및 쓰기 작업이 Managed Postgres 서비스로 향하도록 전환하고, 오류, 제약 조건 위반, 복제 상태를 모니터링하십시오.

**정리합니다.**  전환을 완료하고 새 서비스가 정상 상태임을 확인했다면 **데이터 소스**에서 마이그레이션을 삭제하십시오. CDC를 사용했다면 리소스를 확보할 수 있도록 원본에서 replication slot을 삭제하십시오:

```sql
SELECT pg_drop_replication_slot('<slot_name>');
```

## 다음 단계 \{#next-steps\}

* [Managed Postgres 빠른 시작](../quickstart)
* [Managed Postgres 연결 정보](../connection)
* [ClickPipes Postgres FAQ](../../../integrations/data-ingestion/clickpipes/postgres/faq.md)