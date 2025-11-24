---
'title': 'ClickHouse 데이터 삽입'
'description': 'ClickHouse에 데이터를 삽입하는 방법'
'keywords':
- 'INSERT'
- 'Batch Insert'
'sidebar_label': 'ClickHouse 데이터 삽입'
'slug': '/guides/inserting-data'
'show_related_blogs': true
'doc_type': 'guide'
---

import postgres_inserts from '@site/static/images/guides/postgres-inserts.png';
import Image from '@theme/IdealImage';

## ClickHouse에 데이터 삽입 vs. OLTP 데이터베이스 {#inserting-into-clickhouse-vs-oltp-databases}

OLAP(Online Analytical Processing) 데이터베이스인 ClickHouse는 높은 성능과 확장성을 위해 최적화되어 있으며, 이는 초당 수백만 개의 행이 삽입될 수 있음을 의미합니다. 이는 고도로 병렬화된 아키텍처와 효율적인 컬럼형 압축의 조합을 통해 달성되지만, 즉각적인 일관성에는 타협이 있습니다. 보다 구체적으로, ClickHouse는 추가 전용 작업에 최적화되어 있으며 단지 최종 일관성 보장만 제공합니다.

대조적으로, Postgres와 같은 OLTP 데이터베이스는 ACID 완전성을 보장하며 강력한 일관성과 신뢰성 보장을 제공하는 트랜잭션 삽입에 대해 특별히 최적화되었습니다. PostgreSQL은 MVCC(Multi-Version Concurrency Control)를 사용하여 동시 트랜잭션을 처리하며, 이는 데이터의 여러 버전을 유지하는 것을 포함합니다. 이러한 트랜잭션은 한 번에 소수의 행을 포함할 수 있으며, 신뢰성 보장으로 인해 심각한 오버헤드가 발생하여 삽입 성능이 제한됩니다.

강력한 일관성 보장을 유지하면서 높은 삽입 성능을 달성하기 위해, 사용자는 ClickHouse에 데이터를 삽입할 때 아래에 설명된 간단한 규칙을 준수해야 합니다. 이러한 규칙을 따르면 사용자가 ClickHouse를 처음 사용할 때 흔히 겪는 문제를 피할 수 있으며, OLTP 데이터베이스에서 작동하는 삽입 전략을 복제하려고 시도할 수 있습니다.

## 삽입에 대한 모범 사례 {#best-practices-for-inserts}

### 대량 배치로 삽입 {#insert-in-large-batch-sizes}

기본적으로 ClickHouse에 전송된 각 삽입은 ClickHouse가 삽입에서 데이터를 포함한 저장소의 일부를 즉시 생성하게 만듭니다. 따라서 적은 양의 삽입을 보내고 각 삽입에 더 많은 데이터를 포함하는 것과 비교할 때, 더 많은 양의 삽입을 보내는 것이 필요로 하는 쓰기 횟수를 줄입니다. 일반적으로 한 번에 최소 1,000행 이상, 이상적으로는 10,000에서 100,000행 사이의 상당히 큰 배치로 데이터를 삽입하는 것을 권장합니다. 
(자세한 내용은 [여기](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)를 참조하십시오).

대량 배치가 불가능한 경우, 아래에서 설명된 비동기 삽입을 사용하십시오.

### 아이덴포턴트 재시도를 위한 일관된 배치 보장 {#ensure-consistent-batches-for-idempotent-retries}

기본적으로 ClickHouse에 대한 삽입은 동기적이며 아이덴포턴트입니다(즉, 동일한 삽입 작업을 여러 번 수행하는 것이 한 번 수행하는 것과 동일한 효과를 가집니다). MergeTree 엔진 계열의 테이블에 대해 ClickHouse는 기본적으로 삽입을 자동으로 [중복 제거](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time) 합니다.

이 말은 삽입이 다음 경우에 대한 회복력을 유지한다는 것을 의미합니다:

- 1. 데이터를 수신하는 노드에 문제가 있는 경우, 삽입 쿼리는 시간 초과가 발생하거나(더 구체적인 오류를 제공) 확인을 받지 못합니다.
- 2. 데이터가 노드에 기록되었지만 네트워크 중단으로 인해 쿼리의 발신자에게 확인을 반환할 수 없는 경우, 발신자는 시간 초과 또는 네트워크 오류를 받게 됩니다.

클라이언트의 관점에서는 (i)와 (ii)를 구별하기 어려울 수 있습니다. 그러나 두 경우 모두, 확인되지 않은 삽입은 즉시 재시도할 수 있습니다. 재시도된 삽입 쿼리가 동일한 데이터와 동일한 순서를 포함하는 한, ClickHouse는 원래의 (확인되지 않은) 삽입이 성공적으로 처리된 경우 재시도된 삽입을 자동으로 무시합니다.

### MergeTree 테이블 또는 분산 테이블에 삽입 {#insert-to-a-mergetree-table-or-a-distributed-table}

우리는 MergeTree(또는 복제 테이블)에 직접 삽입하는 것을 권장하며, 데이터가 샤딩된 경우 노드 집합에 대한 요청을 균형 있게 조정하고 `internal_replication=true`로 설정합니다. 이렇게 하면 ClickHouse가 사용 가능한 복제본 샤드에 데이터를 복제하고 데이터가 최종적으로 일관되도록 보장할 수 있습니다.

클라이언트 측 로드 밸런싱이 번거롭다면 사용자는 [분산 테이블](/engines/table-engines/special/distributed)을 통해 삽입할 수 있으며, 이는 노드 간에 쓰기를 분배합니다. 다시 한번, `internal_replication=true`를 설정하는 것이 좋습니다. 그러나 이 접근 방식은 분산 테이블이 있는 노드에서 로컬로 쓰기를 수행하고 샤드로 전송해야 하므로 성능이 약간 떨어진다는 점을 유의해야 합니다.

### 소량 배치에 대한 비동기 삽입 사용 {#use-asynchronous-inserts-for-small-batches}

클라이언트 측 배치가 실행 가능한 경우가 아닌 시나리오가 있습니다. 예를 들어, 100개 이상의 단일 목적 에이전트가 로그, 메트릭, 트레이스를 보내는 관측 가능성(use case)입니다. 이 경우 데이터를 실시간으로 전송하는 것이 문제와 이상을 가능한 한 빠르게 감지하는 데 중요합니다. 또한, 관찰된 시스템에서 이벤트 스파이크의 위험이 있어, 관측 가능성 데이터를 클라이언트 측에서 버퍼링 시 큰 메모리 스파이크 및 관련 문제를 유발할 수 있습니다. 대량 배치를 삽입할 수 없는 경우, 사용자는 [비동기 삽입](/best-practices/selecting-an-insert-strategy#asynchronous-inserts)을 사용하여 ClickHouse에 배치를 위임할 수 있습니다.

비동기 삽입을 사용하면 데이터가 먼저 버퍼에 삽입되고, 이후 데이터베이스 저장소에 작성되는 과정은 3단계로 진행됩니다. 아래 다이어그램에서 설명된 바와 같습니다:

<Image img={postgres_inserts} size="md" alt="Postgres inserts"/>

비동기 삽입이 활성화되면 ClickHouse는 다음을 수행합니다:

(1) 비동기적으로 삽입 쿼리를 수신합니다.
(2) 쿼리의 데이터를 먼저 메모리 버퍼에 기록합니다.
(3) 다음 버퍼 플러시가 발생할 때 데이터가 정렬되어 데이터베이스 저장소의 일부로 기록됩니다.

버퍼가 플러시되기 전에 동일한 클라이언트 또는 다른 클라이언트의 다른 비동기 삽입 쿼리의 데이터가 버퍼에 수집될 수 있습니다. 버퍼 플러시로 생성된 파트는 여러 비동기 삽입 쿼리의 데이터를 포함할 수 있습니다. 일반적으로 이러한 메커니즘은 데이터를 클라이언트 측에서 서버 측(ClickHouse 인스턴스)으로 배치하는 방식을 전환합니다.

:::note
버퍼가 데이터베이스 저장소에 플러시되기 전에 데이터가 쿼리로 검색되지 않으며, 버퍼 플러시는 구성 가능합니다.

비동기 삽입 구성에 대한 전반적인 세부정보는 [여기](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)에서 확인할 수 있으며, 심층적인 정보를 보려면 [여기](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)에서 확인하십시오.
:::

### 공식 ClickHouse 클라이언트 사용 {#use-official-clickhouse-clients}

ClickHouse는 가장 인기 있는 프로그래밍 언어에서 클라이언트를 제공합니다. 이러한 클라이언트는 삽입이 올바르게 수행되고, 비동기 삽입을 직접(e.g. [Go 클라이언트](/integrations/go#async-insert)) 또는 쿼리, 사용자 또는 연결 수준 설정에서 활성화하여 간접적으로 지원됩니다.

사용 가능한 ClickHouse 클라이언트 및 드라이버의 전체 목록은 [클라이언트 및 드라이버](/interfaces/cli)를 참조하십시오.

### 기본 형식 선호 {#prefer-the-native-format}

ClickHouse는 삽입(및 쿼리) 시간에 많은 [입력 형식](/interfaces/formats)을 지원합니다. 이는 OLTP 데이터베이스와의 중요한 차이점이며, 외부 소스로부터 데이터를 로드하는 것을 훨씬 쉽게 만듭니다. 특히 [테이블 함수](/sql-reference/table-functions) 및 디스크의 파일에서 데이터를 로드하는 기능과 결합될 때 그렇습니다. 이러한 형식은 즉석 데이터 로딩 및 데이터 엔지니어링 작업에 적합합니다.

최적의 삽입 성능을 달성하려는 애플리케이션의 경우, 사용자는 [네이티브](/interfaces/formats/Native) 형식을 사용하여 삽입해야 합니다. 이는 대부분의 클라이언트(예: Go와 Python)에서 지원되며, 이 형식은 이미 컬럼형이기 때문에 서버가 작업해야 하는 양이 최소화됩니다. 그렇게 함으로써 데이터베이스의 컬럼형 형식으로 변환하는 책임이 클라이언트 측에 부여됩니다. 이는 효율적으로 삽입을 확장하는 데 중요합니다.

또한, 사용자가 행 형식을 선호하는 경우 [RowBinary format](/interfaces/formats/RowBinary) (Java 클라이언트에서 사용됨)를 사용할 수 있습니다 - 이는 일반적으로 네이티브 형식보다 작성하기 쉽습니다. 이는 [JSON](/interfaces/formats/JSON)과 같은 대체 행 형식보다 압축, 네트워크 오버헤드 및 서버 처리 측면에서 더 효율적입니다. [JSONEachRow](/interfaces/formats/JSONEachRow) 형식은 적은 쓰기 처리량을 가진 사용자가 빠르게 통합하려고 할 때 고려할 수 있습니다. 사용자는 이 형식이 ClickHouse에서 파싱 시 CPU 오버헤드를 발생시킬 것이라는 점을 인지해야 합니다.

### HTTP 인터페이스 사용 {#use-the-http-interface}

전통적인 많은 데이터베이스와 달리 ClickHouse는 HTTP 인터페이스를 지원합니다. 사용자는 위의 형식을 사용하여 데이터를 삽입하고 쿼리할 수 있습니다. 이는 로드 밸런서로 트래픽을 쉽게 전환할 수 있기 때문에 ClickHouse의 네이티브 프로토콜보다 선호되는 경우가 많습니다. 네이티브 프로토콜에 비해 삽입 성능에서 약간의 차이가 있을 것으로 예상되며, 이 경우 오버헤드가 약간 덜 발생합니다. 기존 클라이언트는 이러한 프로토콜을 사용하며(경우에 따라 둘 다 사용함 e.g. Go 클라이언트), 네이티브 프로토콜은 쿼리 진행 상황을 쉽게 추적할 수 있게 합니다.

더 자세한 내용은 [HTTP 인터페이스](/interfaces/http)를 참조하십시오.

## 기본 예제 {#basic-example}

ClickHouse에서 친숙한 `INSERT INTO TABLE` 명령을 사용할 수 있습니다. 시작 가이드 ["ClickHouse에서 테이블 만들기"](./creating-tables)에서 만든 테이블에 데이터를 삽입해 보겠습니다.

```sql
INSERT INTO helloworld.my_first_table (user_id, message, timestamp, metric) VALUES
    (101, 'Hello, ClickHouse!',                                 now(),       -1.0    ),
    (102, 'Insert a lot of rows per batch',                     yesterday(), 1.41421 ),
    (102, 'Sort your data based on your commonly-used queries', today(),     2.718   ),
    (101, 'Granules are the smallest chunks of data read',      now() + 5,   3.14159 )
```

작업이 잘 되었는지 확인하기 위해, 다음 `SELECT` 쿼리를 실행할 것입니다:

```sql
SELECT * FROM helloworld.my_first_table
```

다음과 같은 결과가 나옵니다:

```response
user_id message                                             timestamp           metric
101         Hello, ClickHouse!                                  2024-11-13 20:01:22     -1
101         Granules are the smallest chunks of data read           2024-11-13 20:01:27 3.14159
102         Insert a lot of rows per batch                          2024-11-12 00:00:00 1.41421
102         Sort your data based on your commonly-used queries  2024-11-13 00:00:00     2.718
```

## Postgres에서 데이터 로드 {#loading-data-from-postgres}

Postgres에서 데이터를 로드하기 위해 사용자는 다음을 사용할 수 있습니다:

- `ClickPipes`, PostgreSQL 데이터베이스 복제를 위해 특별히 설계된 ETL 도구. 다음과 같이 제공됩니다:
  - ClickHouse Cloud - ClickPipes의 [관리형 데이터 수집 서비스](/integrations/clickpipes/postgres)를 통해 사용 가능합니다.
  - 자체 관리 - [PeerDB 오픈 소스 프로젝트](https://github.com/PeerDB-io/peerdb)를 통해 사용 가능합니다.
- [PostgreSQL 테이블 엔진](/integrations/postgresql#using-the-postgresql-table-engine)을 사용하여 이전 예시에서 보여준 것처럼 데이터를 직접 읽을 수 있습니다. 일반적으로 알려진 수위(예: 타임스탬프)를 기반으로 한 배치 복제가 충분하거나 일회성 마이그레이션인 경우 적절합니다. 이 접근 방식은 수천만 개의 행까지 확장할 수 있습니다. 더 큰 데이터 세트를 마이그레이션하려는 사용자는 각 청크의 데이터를 처리하는 여러 요청을 고려해야 합니다. 각 청크에 대해 최종 테이블로 파티션이 이동되기 전에 스테이징 테이블을 사용할 수 있습니다. 이것은 실패한 요청을 재시도할 수 있게 합니다. 이 대량 로딩 전략에 대한 더 자세한 내용은 여기에서 확인하십시오.
- 데이터는 CSV 형식으로 PostgreSQL에서 내보낼 수 있습니다. 그런 다음 로컬 파일 또는 테이블 함수를 사용하여 객체 저장소를 통해 ClickHouse에 삽입할 수 있습니다.

:::note 대량 데이터 세트 삽입에 도움이 필요하십니까?
대량 데이터 세트를 삽입하는 데 도움이 필요하거나 ClickHouse Cloud에 데이터를 가져올 때 오류가 발생하는 경우 support@clickhouse.com으로 연락 주시면 도움을 드릴 수 있습니다.
:::

## 커맨드 라인에서 데이터 삽입 {#inserting-data-from-command-line}

**사전 요구 사항**
- ClickHouse를 [설치](/install)했습니다.
- `clickhouse-server`가 실행 중입니다.
- `wget`, `zcat` 및 `curl`에 대한 액세스 권한이 있습니다.

이 예에서는 커맨드 라인에서 clickhouse-client의 배치 모드를 사용하여 CSV 파일을 ClickHouse에 삽입하는 방법을 알아봅니다. 커맨드 라인에서 batch mode를 사용하여 clickhouse-client를 통해 데이터를 삽입하는 것에 대한 더 많은 정보와 예시는 ["배치 모드"](/interfaces/cli#batch-mode)를 참조하십시오.

이 예를 위해 [Hacker News 데이터 세트](/getting-started/example-datasets/hacker-news)를 사용할 것이며, 이 데이터 세트는 2,800만 개의 Hacker News 데이터를 포함하고 있습니다.

<VerticalStepper headerLevel="h3">
    
### CSV 다운로드 {#download-csv}

다음 명령을 실행하여 공개 S3 버킷에서 데이터 세트의 CSV 버전을 다운로드합니다:

```bash
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.csv.gz
```

4.6GB 크기와 2,800만 개의 행을 가진 이 압축 파일은 다운로드하는 데 5-10분이 소요됩니다.

### 테이블 생성 {#create-table}

`clickhouse-server`가 실행되고 있는 경우, 다음 스키마로 커맨드 라인에서 `clickhouse-client`의 배치 모드를 사용하여 빈 테이블을 생성할 수 있습니다:

```bash
clickhouse-client <<'_EOF'
CREATE TABLE hackernews(
    `id` UInt32,
    `deleted` UInt8,
    `type` Enum('story' = 1, 'comment' = 2, 'poll' = 3, 'pollopt' = 4, 'job' = 5),
    `by` LowCardinality(String),
    `time` DateTime,
    `text` String,
    `dead` UInt8,
    `parent` UInt32,
    `poll` UInt32,
    `kids` Array(UInt32),
    `url` String,
    `score` Int32,
    `title` String,
    `parts` Array(UInt32),
    `descendants` Int32
)
ENGINE = MergeTree
ORDER BY id
_EOF
```

오류가 없다면, 테이블이 성공적으로 생성된 것입니다. 위의 명령에서는 heredoc 구분자(`_EOF`) 주위에 단일 따옴표를 사용하여 어떤 형태의 보간도 방지합니다. 단일 따옴표 없이 경우, 컬럼 이름 주위의 백틱을 이스케이프 하는 것이 필요합니다. 

### 커맨드 라인에서 데이터 삽입 {#insert-data-via-cmd}

이제 위에서 다운로드한 파일에서 데이터를 삽입하기 위해 아래 명령을 실행합니다:

```bash
zcat < hacknernews.csv.gz | ./clickhouse client --query "INSERT INTO hackernews FORMAT CSV"
```

우리의 데이터가 압축되어 있으므로, `gzip`, `zcat`와 같은 도구를 사용하여 파일을 먼저 압축 해제한 후, 적절한 `INSERT` 문 및 `FORMAT`과 함께 압축 해제된 데이터를 `clickhouse-client`로 파이프합니다.

:::note
clickhouse-client를 대화형 모드로 사용할 때, `COMPRESSION` 절을 사용하여 ClickHouse가 삽입 시 압축 해제를 처리하도록 허용할 수 있습니다. ClickHouse는 파일 확장자에서 자동으로 압축 유형을 감지할 수 있지만, 명시적으로 지정할 수도 있습니다.

그러면 삽입 쿼리는 다음과 같이 보일 것입니다: 

```bash
clickhouse-client --query "INSERT INTO hackernews FROM INFILE 'hacknernews.csv.gz' COMPRESSION 'gzip' FORMAT CSV;"
```
:::

데이터 삽입이 완료되면 `hackernews` 테이블의 행 수를 확인하기 위해 다음 명령을 실행할 수 있습니다:

```bash
clickhouse-client --query "SELECT formatReadableQuantity(count(*)) FROM hackernews"
28.74 million
```

### curl을 사용한 커맨드 라인에서 데이터 삽입 {#insert-using-curl}

이전 단계에서는 `wget`을 사용하여 csv 파일을 로컬 컴퓨터에 먼저 다운로드했습니다. 원격 URL에서 직접 데이터를 삽입하는 것도 하나의 명령으로 가능합니다.

다음 명령을 실행하여 `hackernews` 테이블에서 데이터를 잘라내서 로컬 컴퓨터로 다운로드하는 중간 단계 없이 다시 삽입할 수 있게 합니다:

```bash
clickhouse-client --query "TRUNCATE hackernews"
```

이제 다음을 실행합니다:

```bash
curl https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.csv.gz | zcat | clickhouse-client --query "INSERT INTO hackernews FORMAT CSV"
```

이제 이전에 삽입된 데이터가 다시 삽입되었는지 확인하기 위해 이전과 같은 명령을 실행할 수 있습니다:

```bash
clickhouse-client --query "SELECT formatReadableQuantity(count(*)) FROM hackernews"
28.74 million
```

</VerticalStepper>
