---
'slug': '/integrations/s3/performance'
'sidebar_position': 2
'sidebar_label': '성능 최적화'
'title': 'S3 삽입 및 읽기 성능 최적화'
'description': 'S3 읽기 및 삽입 성능 최적화'
'doc_type': 'guide'
'keywords':
- 's3'
- 'performance'
- 'optimization'
- 'object storage'
- 'data loading'
---

import Image from '@theme/IdealImage';
import InsertMechanics from '@site/static/images/integrations/data-ingestion/s3/insert_mechanics.png';
import Pull from '@site/static/images/integrations/data-ingestion/s3/pull.png';
import Merges from '@site/static/images/integrations/data-ingestion/s3/merges.png';
import ResourceUsage from '@site/static/images/integrations/data-ingestion/s3/resource_usage.png';
import InsertThreads from '@site/static/images/integrations/data-ingestion/s3/insert_threads.png';
import S3Cluster from '@site/static/images/integrations/data-ingestion/s3/s3Cluster.png';
import HardwareSize from '@site/static/images/integrations/data-ingestion/s3/hardware_size.png';

이 섹션에서는 [s3 테이블 함수](/sql-reference/table-functions/s3)를 사용하여 S3에서 데이터를 읽고 삽입할 때 성능을 최적화하는 방법에 대해 설명합니다.

:::info
**이 가이드에서 설명하는 수업은 [GCS](/sql-reference/table-functions/gcs) 및 [Azure Blob storage](/sql-reference/table-functions/azureBlobStorage)와 같은 자체 전용 테이블 함수를 가진 다른 오브젝트 스토리지 구현에도 적용될 수 있습니다.**
:::

삽입 성능을 개선하기 위해 스레드와 블록 크기를 조정하기 전에, 사용자들은 S3 삽입의 메커니즘을 이해하는 것이 좋습니다. 인서트 메커니즘에 익숙하거나 간단한 팁을 원하신다면, 아래의 예제 [를 건너뛰십시오](/integrations/s3/performance#example-dataset).

## 삽입 메커니즘 (단일 노드) {#insert-mechanics-single-node}

하드웨어 크기 외에, ClickHouse의 데이터 삽입 메커니즘(단일 노드)의 성능과 자원 사용에는 두 가지 주요 요소가 영향을 미칩니다: **삽입 블록 크기** 및 **삽입 병렬성**.

### 삽입 블록 크기 {#insert-block-size}

<Image img={InsertMechanics} size="lg" border alt="ClickHouse에서 삽입 블록 크기 메커니즘" />

`INSERT INTO SELECT`를 수행할 때, ClickHouse는 일부 데이터 포트를 수신하고, ① 받은 데이터로부터 (최소한) 하나의 메모리 내 삽입 블록을 형성합니다(각 [파티션 키](/engines/table-engines/mergetree-family/custom-partitioning-key)마다). 블록의 데이터는 정렬되며, 테이블 엔진별 최적화가 적용됩니다. 그런 다음 데이터가 압축되어 ② 새로운 데이터 파트 형태로 데이터베이스 스토리지에 기록됩니다.

삽입 블록 크기는 ClickHouse 서버의 [디스크 파일 I/O 사용량](https://en.wikipedia.org/wiki/Category:Disk_file_systems)과 메모리 사용량 모두에 영향을 미칩니다. 더 큰 삽입 블록은 더 많은 메모리를 사용하지만 초기 파트를 더 크고 적게 생성합니다. ClickHouse가 대량의 데이터를 로드하기 위해 생성해야 하는 파트 수가 적을수록 디스크 파일 I/O와 자동 [백그라운드 병합 필요](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges)가 줄어듭니다.

`INSERT INTO SELECT` 쿼리를 사용하여 통합 테이블 엔진 또는 테이블 함수와 결합할 때, 데이터는 ClickHouse 서버에 의해 수집됩니다: 

<Image img={Pull} size="lg" border alt="ClickHouse에서 외부 소스의 데이터 가져오기" />

데이터가 완전히 로드될 때까지 서버는 루프를 실행합니다:

```bash
① Pull and parse the next portion of data and form an in-memory data block (one per partitioning key) from it.

② Write the block into a new part on storage.

Go to ① 
```

①에서 크기는 삽입 블록 크기에 따라 다르며, 두 가지 설정으로 조정할 수 있습니다:

- [`min_insert_block_size_rows`](/operations/settings/settings#min_insert_block_size_rows) (기본값: `1048545` 행)
- [`min_insert_block_size_bytes`](/operations/settings/settings#min_insert_block_size_bytes) (기본값: `256 MiB`)

삽입 블록에 지정된 수의 행이 수집되거나 구성된 양의 데이터에 도달하면(먼저 발생하는 것에 따라) 블록이 새로운 파트에 기록됩니다. 삽입 루프는 ① 단계에서 계속 진행됩니다.

`min_insert_block_size_bytes` 값은 압축되지 않은 메모리 내 블록 크기를 나타냅니다(압축된 디스크 파트 크기가 아님). 또한 생성된 블록과 파트는 ClickHouse가 데이터를 행-[블록](/operations/settings/settings#max_block_size) 단위로 스트리밍하고 [처리하는](https://clickhouse.com/company/events/query-performance-introspection) 데 따라 구성된 행 또는 바이트 수를 정확히 포함하는 경우가 드뭅니다. 따라서 이러한 설정은 최소 임계값을 지정합니다.

#### 병합에 주의하세요 {#be-aware-of-merges}

구성된 삽입 블록 크기가 작을수록 대량 데이터 로드에 대해 더 많은 초기 파트가 생성되고, 데이터 수집과 동시에 더 많은 백그라운드 파트 병합이 실행됩니다. 이로 인해 자원 경합(CPU 및 메모리)이 발생하고, 수집이 완료된 후 [건전한](/operations/settings/merge-tree-settings#parts_to_throw_insert) (3000) 파트 수에 도달하는 데 추가 시간이 필요할 수 있습니다. 

:::important
파트 수가 [권장 한계](https://operations/settings/merge-tree-settings#parts_to_throw_insert)를 초과하면 ClickHouse 쿼리 성능이 부정적인 영향을 미칩니다.
:::

ClickHouse는 지속적으로 [파트를 병합](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)하여 더 큰 파트로 병합합니다. 그들이 [도달할 때까지](https://operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool) 압축 크기가 ~150 GiB입니다. 이 다이어그램은 ClickHouse 서버가 파트를 병합하는 방법을 보여줍니다:

<Image img={Merges} size="lg" border alt="ClickHouse의 백그라운드 병합" />

단일 ClickHouse 서버는 여러 [백그라운드 병합 스레드](/operations/server-configuration-parameters/settings#background_pool_size)를 사용하여 동시에 [파트 병합](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges:~:text=to%20execute%20concurrent-,part%20merges,-.%20Each%20thread%20executes) 작업을 실행합니다. 각 스레드는 루프를 실행합니다:

```bash
① Decide which parts to merge next, and load these parts as blocks into memory.

② Merge the loaded blocks in memory into a larger block.

③ Write the merged block into a new part on disk.

Go to ①
```

[증가]는 주목할 점입니다. [CPU 코어 수와 RAM의 크기를](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#hardware-size) 증가시키면 백그라운드 병합 처리량이 향상됩니다.

더 큰 파트로 병합된 파트는 [비활성](https://operations/system-tables/parts)으로 표시되고, 최종적으로 [구성 가능한](https://operations/settings/merge-tree-settings#old_parts_lifetime) 분이 경과한 후 삭제됩니다. 시간이 지남에 따라 병합된 파트의 트리를 생성합니다(따라서 [`MergeTree`](/engines/table-engines/mergetree-family) 테이블의 이름).

### 삽입 병렬성 {#insert-parallelism}

<Image img={ResourceUsage} size="lg" border alt="삽입 병렬성에 대한 자원 사용" />

ClickHouse 서버는 데이터를 병렬로 처리하고 삽입할 수 있습니다. 삽입 병렬성 수준은 ClickHouse 서버의 수집 처리량과 메모리 사용량에 영향을 미칩니다. 데이터를 병렬로 로드하고 처리하는 데는 더 많은 주 메모리가 필요하지만, 데이터가 더 빨리 처리되므로 수집 처리량이 증가합니다.

s3와 같은 테이블 함수는 glob 패턴을 통해 로드할 파일 이름의 집합을 지정할 수 있습니다. glob 패턴이 여러 기존 파일과 일치하면 ClickHouse는 이러한 파일 간 및 파일 내에서 읽기를 병렬화할 수 있으며, 서버당 병렬 실행되는 삽입 스레드를 활용하여 테이블에 데이터를 병렬로 삽입합니다:

<Image img={InsertThreads} size="lg" border alt="ClickHouse의 병렬 삽입 스레드" />

모든 파일의 모든 데이터가 처리될 때까지, 각 삽입 스레드는 루프를 실행합니다: 

```bash
① Get the next portion of unprocessed file data (portion size is based on the configured block size) and create an in-memory data block from it.

② Write the block into a new part on storage.

Go to ①. 
```

이러한 병렬 삽입 스레드 수는 [`max_insert_threads`](/operations/settings/settings#max_insert_threads) 설정으로 구성할 수 있습니다. 기본값은 오픈 소스 ClickHouse의 경우 `1`, [ClickHouse Cloud](https://clickhouse.com/cloud)의 경우 `4`입니다.

파일 수가 많을 경우, 여러 삽입 스레드에 의한 병렬 처리가 잘 작동합니다. 이는 사용 가능한 CPU 코어와 네트워크 대역폭(병렬 파일 다운로드)을 모두 완전히 활용할 수 있습니다. 적은 수의 대용량 파일을 테이블에 로드하는 시나리오에서는 ClickHouse가 자동으로 높은 수준의 데이터 처리 병렬성을 설정하고, 추가 읽기 스레드를 각 삽입 스레드에 생성하여 대용량 파일 내의 더 다양한 범위를 병렬로 읽어들임으로써 네트워크 대역폭 사용을 최적화합니다.

s3 함수와 테이블의 경우 개별 파일의 병렬 다운로드는 [max_download_threads](https://clickhouse.com/codebrowser/ClickHouse/src/Core/Settings.h.html#DB::SettingsTraits::Data::max_download_threads) 및 [max_download_buffer_size](https://clickhouse.com/codebrowser/ClickHouse/src/Core/Settings.h.html#DB::SettingsTraits::Data::max_download_buffer_size) 값에 의해 결정됩니다. 파일의 크기가 `2 * max_download_buffer_size`보다 클 때만 병렬로 다운로드됩니다. 기본적으로 `max_download_buffer_size` 기본값은 10MiB로 설정되어 있습니다. 특정 경우, 이 버퍼 크기를 50MB(`max_download_buffer_size=52428800`)로 안전하게 증가시킬 수 있으며, 이는 각 파일이 단일 스레드에 의해 다운로드되도록 보장하는 것을 목표로 합니다. 이는 각 스레드가 S3 호출을 수행하는 데 소요되는 시간을 줄이고 S3 대기 시간도 낮추는 데 도움이 됩니다. 또한 병렬 읽기에 너무 작은 파일의 경우, ClickHouse는 자동으로 비동기적으로 이렇게 작은 파일을 미리 읽어 데이터 전송량을 향상시킵니다.

## 성능 측정 {#measuring-performance}

S3 테이블 함수를 사용하여 쿼리 성능을 최적화하는 것은 다음 두 가지 시나리오에 대해 필요합니다. 즉, 데이터를 위치에서 처리할 때 ClickHouse 컴퓨트만을 사용하고 데이터가 원래 형식으로 S3에 남아 있는 고급 쿼리 또는 S3에서 ClickHouse MergeTree 테이블 엔진으로 데이터를 삽입할 때입니다. 명시되지 않는 한, 다음 권장 사항은 두 시나리오 모두에 적용됩니다.

## 하드웨어 크기의 영향 {#impact-of-hardware-size}

<Image img={HardwareSize} size="lg" border alt="ClickHouse 성능에 대한 하드웨어 크기의 영향" />

사용 가능한 CPU 코어 수와 RAM 크기는 다음에 영향을 미칩니다:

- 지원되는 [부품의 초기 크기](#insert-block-size)
- 가능한 [삽입 병렬성의 수준](#insert-parallelism)
- [백그라운드 파트 병합의 처리량](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges)

따라서 전체 수집 처리량에도 영향을 미칩니다.

## 지역 로컬리티 {#region-locality}

버킷이 ClickHouse 인스턴스와 동일한 지역에 위치해 있는지 확인하십시오. 이 간단한 최적화는 성능을 극적으로 개선할 수 있으며, 특히 ClickHouse 인스턴스를 AWS 인프라에서 배포하는 경우 더욱 그렇습니다.

## 포맷 {#formats}

ClickHouse는 `s3` 함수 및 `S3` 엔진을 사용하여 S3 버킷에 저장된 [지원되는 포맷](/interfaces/formats#formats-overview)의 파일을 읽을 수 있습니다. 원시 파일을 읽을 경우, 이러한 포맷 중 몇 가지는 뚜렷한 장점을 가집니다:

* Native, Parquet, CSVWithNames 및 TabSeparatedWithNames와 같은 인코딩된 컬럼 이름을 가진 포맷은 쿼리 시 사용자에게 `s3` 함수에서 컬럼 이름을 명시할 필요가 없으므로 덜 장황합니다. 컬럼 이름이 이 정보를 유추할 수 있게 해줍니다.
* 포맷은 읽기 및 쓰기 처리량 측면에서 성능이 다를 수 있습니다. Native 및 parquet는 이미 컬럼 지향적이며 더 밀집되어 있기 때문에 읽기 성능에 가장 적합한 포맷을 나타냅니다. Native 포맷은 ClickHouse가 메모리에 데이터를 저장하는 방식과 일치하여 데이터가 ClickHouse로 전송될 때 처리 오버헤드를 줄이는 이점도 있습니다.
* 블록 크기는 종종 대용량 파일의 읽기 지연에 영향을 미칩니다. 예를 들어, 상위 N 행을 반환하는 경우 특히 뚜렷하게 나타납니다. CSV 및 TSV와 같은 포맷의 경우, 행 집합을 반환하기 위해 파일을 구문 분석해야 합니다. Native 및 Parquet와 같은 포맷은 빠른 샘플링을 가능하게 합니다.
* 각 압축 포맷은 장단점을 가지고 있으며, 종종 속도에 대한 압축 수준을 균형 있게 조정하여 압축 또는 압축 해제 성능을 편향시킵니다. CSV 또는 TSV와 같은 원시 파일을 압축할 경우 lz4는 압축 수준을 희생하면서 가장 빠른 압축 해제 성능을 제공합니다. Gzip은 일반적으로 약간 느린 읽기 속도에서 더 나은 압축을 제공합니다. Xz는 일반적으로 가장 좋은 압축을 제공하지만 가장 느린 압축 및 압축 해제 성능을 보여줍니다. 내보낼 경우, Gz와 lz4는 유사한 압축 속도를 제공합니다. 이는 연결 속도와 균형을 이루어야 합니다. 빠른 압축 해제 또는 압축의 결과로 발생하는 동작은 S3 버킷에 더 느린 연결로 쉽게 상쇄될 수 있습니다.
* Native 또는 Parquet와 같은 포맷은 일반적으로 압축의 오버헤드를 정당화하지 않습니다. 데이터 크기에서의 절감은 일반적으로 미미하므로, 이러한 포맷은 본질적으로 밀집되어 있습니다. 데이터 압축 및 압축 해제에 소요되는 시간은 종종 네트워크 전송 시간에 대체되지 않습니다 - 특히 S3가 전 세계적으로 사용 가능하며 더 높은 네트워크 대역폭을 제공하는 경우입니다.

## 예제 데이터셋 {#example-dataset}

추가적인 가능성 최적화를 설명하기 위해 우리는 [Stack Overflow 데이터셋의 포스트](/data-modeling/schema-design#stack-overflow-dataset)를 사용하여 이 데이터의 쿼리 및 삽입 성능을 최적화합니다.

이 데이터셋은 2008년 7월부터 2024년 3월까지 매월 1개의 Parquet 파일로 구성되어 총 189개의 파일로 이루어져 있습니다.

우리는 성능을 위해 Parquet를 사용하며, [위의 권장 사항](#formats)에 따라 모든 쿼리를 버킷과 동일한 지역에 있는 ClickHouse 클러스터에서 실행합니다. 이 클러스터는 각각 32GiB의 RAM과 8개의 vCPU를 가진 3개의 노드를 가지고 있습니다.

조정 없이, 우리는 이 데이터셋을 MergeTree 테이블 엔진에 삽입하는 성능과 가장 많은 질문을 하는 사용자를 계산하는 쿼리를 실행하는 성능을 보여줍니다. 이 두 쿼리는 의도적으로 데이터의 완전한 스캔을 요구합니다.

```sql
-- Top usernames
SELECT
    OwnerDisplayName,
    count() AS num_posts
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
WHERE OwnerDisplayName NOT IN ('', 'anon')
GROUP BY OwnerDisplayName
ORDER BY num_posts DESC
LIMIT 5

┌─OwnerDisplayName─┬─num_posts─┐
│ user330315       │     10344 │
│ user4039065      │      5316 │
│ user149341       │      4102 │
│ user529758       │      3700 │
│ user3559349      │      3068 │
└──────────────────┴───────────┘

5 rows in set. Elapsed: 3.013 sec. Processed 59.82 million rows, 24.03 GB (19.86 million rows/s., 7.98 GB/s.)
Peak memory usage: 603.64 MiB.

-- Load into posts table
INSERT INTO posts SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')

0 rows in set. Elapsed: 191.692 sec. Processed 59.82 million rows, 24.03 GB (312.06 thousand rows/s., 125.37 MB/s.)
```

우리의 예제에서는 몇 개의 행만 반환합니다. 대량의 데이터가 클라이언트로 반환되는 경우 `SELECT` 쿼리의 성능을 측정하려면 [null 포맷](/interfaces/formats/Null)을 사용하거나 결과를 [`Null` 엔진](/engines/table-engines/special/null.md)로 직접 전달하여 클라이언트가 데이터를 압도당하고 네트워크가 포화되는 것을 피해야 합니다.

:::info
쿼리에서 읽을 때, 초기 쿼리는 동일한 쿼리가 반복되는 경우보다 느려 보일 수 있습니다. 이는 S3의 자체 캐시 및 [ClickHouse 스키마 추론 캐시](/operations/system-tables/schema_inference_cache) 때문입니다. 이는 파일에 대해 추론된 스키마를 저장하며, 이 정보가 이후 접근 시 추론 단계를 건너뛰게 하여 쿼리 시간을 줄입니다.
:::

## 읽기 작업을 위한 스레드 사용 {#using-threads-for-reads}

S3에서의 읽기 성능은 네트워크 대역폭 또는 로컬 I/O에 의해 제한받지 않는 한 코어 수에 비례하여 선형적으로 증가합니다. 스레드 수를 늘리면 메모리 오버헤드 조합도 발생하므로 사용자들은 이를 고려해야 합니다. 다음을 수정하여 읽기 처리량 성능을 향상시킬 수 있습니다:

* 일반적으로 `max_threads`의 기본값은 충분한 값 즉, 코어 수입니다. 쿼리에 사용되는 메모리 양이 높고 이를 줄여야 하거나 결과에 대한 `LIMIT`가 낮다면 이 값을 낮출 수 있습니다. 메모리가 충분한 사용자들은 S3에서 더 높은 읽기 처리량을 얻기 위해 이 값을 높여보는 실험을 할 수 있습니다. 일반적으로 이것은 코어 수가 적은 머신에만 이점이 있으며, 즉, &lt; 10입니다. 추가적인 병렬화의 이점은 다른 자원들이 병목 현상을 일으킬 때 줄어듭니다. 예를 들어, 네트워크 및 CPU 경합.
* ClickHouse 22.3.1 이전 버전에서는 `s3` 함수 또는 `S3` 테이블 엔진을 사용할 때만 여러 파일에 걸쳐 병렬로 읽기를 했습니다. 이는 사용자가 파일을 S3에서 청크로 나누어 glob 패턴을 사용하여 최적의 읽기 성능을 달성하도록 보장해야 했습니다. 이후 버전에서는 파일 내에서 다운로드를 병렬화합니다.
* 스레드 수가 낮은 경우, 사용자는 S3에서 파일을 동기적으로 읽도록 `remote_filesystem_read_method`를 "read"로 설정하여 이점을 얻을 수 있습니다.
* s3 함수 및 테이블의 경우, 개별 파일의 병렬 다운로드는 [`max_download_threads`](/operations/settings/settings#max_download_threads) 및 [`max_download_buffer_size`](/operations/settings/settings#max_download_buffer_size) 값에 의해 결정됩니다. [`max_download_threads`](/operations/settings/settings#max_download_threads)는 사용되는 스레드 수를 제어하며, 파일 크기가 2 * `max_download_buffer_size`보다 커야만 병렬로 다운로드됩니다. 기본적으로 `max_download_buffer_size` 기본값은 10MiB로 설정되어 있습니다. 특정 경우 이 버퍼 크기를 50MB(`max_download_buffer_size=52428800`)로 안전하게 증가시킬 수 있으며, 이는 더 작은 파일이 단일 스레드에 의해 다운로드되도록 보장하는 것을 목표로 합니다. 이는 각 스레드가 S3 호출을 수행하는 데 소요되는 시간을 줄이고 S3 대기 시간도 낮출 수 있습니다. [이 블로그 포스트](https://clickhouse.com/blog/clickhouse-1-trillion-row-challenge)를 참조하여 예제를 확인하십시오.

성능을 개선하기 위해 변경하기 전에, 적절하게 측정하십시오. S3 API 호출은 지연에 민감하여 클라이언트 타이밍에 영향을 줄 수 있으며 성능 메트릭에 대해 쿼리 로그를 사용하십시오, 즉 `system.query_log`입니다.

앞서 언급한 쿼리를 고려하여, `max_threads`를 `16`(기본 `max_thread`는 노드의 코어 수)로 두 배로 늘리면 읽기 쿼리 성능이 2배 향상되며, 메모리 소모는 증가합니다. `max_threads`를 추가로 늘리면 수익 감소가 발생합니다.

```sql
SELECT
    OwnerDisplayName,
    count() AS num_posts
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
WHERE OwnerDisplayName NOT IN ('', 'anon')
GROUP BY OwnerDisplayName
ORDER BY num_posts DESC
LIMIT 5
SETTINGS max_threads = 16

┌─OwnerDisplayName─┬─num_posts─┐
│ user330315       │     10344 │
│ user4039065      │      5316 │
│ user149341       │      4102 │
│ user529758       │      3700 │
│ user3559349      │      3068 │
└──────────────────┴───────────┘

5 rows in set. Elapsed: 1.505 sec. Processed 59.82 million rows, 24.03 GB (39.76 million rows/s., 15.97 GB/s.)
Peak memory usage: 178.58 MiB.

SETTINGS max_threads = 32

5 rows in set. Elapsed: 0.779 sec. Processed 59.82 million rows, 24.03 GB (76.81 million rows/s., 30.86 GB/s.)
Peak memory usage: 369.20 MiB.

SETTINGS max_threads = 64

5 rows in set. Elapsed: 0.674 sec. Processed 59.82 million rows, 24.03 GB (88.81 million rows/s., 35.68 GB/s.)
Peak memory usage: 639.99 MiB.
```

## 삽입을 위한 스레드 및 블록 크기 조정 {#tuning-threads-and-block-size-for-inserts}

최대 수집 성능을 달성하려면 (1) 삽입 블록 크기와 (2) 사용 가능한 CPU 코어 수와 RAM에 따라 적절한 삽입 병렬성 수준을 선택해야 합니다. 요약하면:

- 우리가 [삽입 블록 크기](#insert-block-size)를 더 크게 구성할수록 ClickHouse가 생성해야 할 파트 수가 줄어들고 필요로 하는 [디스크 파일 I/O](https://en.wikipedia.org/wiki/Category:Disk_file_systems)와 [백그라운드 병합](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part1#more-parts--more-background-part-merges) 수가 줄어듭니다.  
- 우리가 [병렬 삽입 스레드 수](#insert-parallelism)를 더 높게 설정하면 데이터가 더 빨리 처리됩니다.

이 두 가지 성능 요소 간에는 상충하는 트레이드오프가 있으며(백그라운드 파트 병합과의 트레이드오프도 있음) ClickHouse 서버의 사용 가능한 주 메모리는 한정적입니다. 더 큰 블록은 더 많은 주 메모리를 사용하므로 사용 가능한 병렬 삽입 스레드 수를 제한합니다. 반대로, 더 많은 병렬 삽입 스레드는 더 많은 주 메모리를 요구하며, 삽입 스레드 수가 메모리에서 동시에 생성되는 삽입 블록 수를 결정하므로 삽입 블록의 가능한 크기를 제한합니다. 또한, 삽입 스레드와 백그라운드 병합 스레드 간에 자원 경합이 발생할 수 있습니다. 고정된 삽입 스레드 수(1)는 병합해야 할 파트를 더 많이 생성하고(2) 백그라운드 병합 스레드에서 CPU 코어와 메모리 공간을 빼앗습니다.

이러한 매개변수의 동작이 성능과 자원에 미치는 영향에 대한 자세한 설명은 [이 블로그 포스트를 읽는 것을 추천합니다](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part2). 이 블로그 포스트에서 설명한 대로, 조정은 두 매개변수 간의 신중한 균형을 포함할 수 있습니다. 이러한 철저한 테스트는 종종 비현실적이므로 요약하자면, 우리는 다음을 추천합니다:

```bash
• max_insert_threads: choose ~ half of the available CPU cores for insert threads (to leave enough dedicated cores for background merges)

• peak_memory_usage_in_bytes: choose an intended peak memory usage; either all available RAM (if it is an isolated ingest) or half or less (to leave room for other concurrent tasks)

Then:
min_insert_block_size_bytes = peak_memory_usage_in_bytes / (~3 * max_insert_threads)
```

이 공식을 사용하여 `min_insert_block_size_rows`를 0으로 설정(행 기반 임계값 비활성화)하면서 `max_insert_threads`를 선택한 값으로 설정하고 `min_insert_block_size_bytes`를 위 공식을 통해 계산된 결과로 설정합니다.

이 공식을 이전 Stack Overflow 예제에 적용해 봅니다.

- `max_insert_threads=4` (노드당 8코어)
- `peak_memory_usage_in_bytes` - 32 GiB (노드 자원의 100%) 또는 `34359738368` 바이트.
- `min_insert_block_size_bytes` = `34359738368/(3*4) = 2863311530`

```sql
INSERT INTO posts SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 128.566 sec. Processed 59.82 million rows, 24.03 GB (465.28 thousand rows/s., 186.92 MB/s.)
```

이 설정을 조정한 결과 삽입 성능이 33% 이상 향상되었습니다. 단일 노드 성능을 더 향상시킬 수 있는 독자의 도전을 남겨둡니다.

## 자원 및 노드 확장 {#scaling-with-resources-and-nodes}

자원 및 노드는 읽기와 삽입 쿼리 모두에 적용됩니다.

### 수직 확장 {#vertical-scaling}

이전에 수행한 모든 조정과 쿼리는 ClickHouse Cloud 클러스터의 단일 노드만 사용했습니다. 사용자는 또한 ClickHouse의 여러 노드를 사용할 수 있습니다. 우리는 사용자가 수직적으로 확장할 것을 권장하며, 코어 수에 따라 S3 처리량이 선형적으로 향상됩니다. 이전의 삽입 및 읽기 쿼리를 더 큰 ClickHouse Cloud 노드에서 자원을 두 배(64GiB, 16 vCPUs)로 반복하면 두 쿼리 모두 대략적으로 두 배 빠르게 실행됩니다.

```sql
INSERT INTO posts SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=8, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 67.294 sec. Processed 59.82 million rows, 24.03 GB (888.93 thousand rows/s., 357.12 MB/s.)

SELECT
    OwnerDisplayName,
    count() AS num_posts
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
WHERE OwnerDisplayName NOT IN ('', 'anon')
GROUP BY OwnerDisplayName
ORDER BY num_posts DESC
LIMIT 5
SETTINGS max_threads = 92

5 rows in set. Elapsed: 0.421 sec. Processed 59.82 million rows, 24.03 GB (142.08 million rows/s., 57.08 GB/s.)
```

:::note
개별 노드는 네트워크와 S3 GET 요청으로 병목이 발생할 수도 있으며, 이는 수직적으로 성능을 선형적으로 확장하는 것을 방해할 수 있습니다.
:::

### 수평 확장 {#horizontal-scaling}

궁극적으로 하드웨어 가용성과 비용 효율성으로 인해 수평 확장이 필요한 경우가 많습니다. ClickHouse Cloud의 프로덕션 클러스터는 최소 3개의 노드가 있어야 합니다. 따라서 사용자는 삽입을 위해 모든 노드를 활용할 수 있습니다.

S3 읽기를 위해 클러스터를 활용하려면 [클러스터 활용](/integrations/s3#utilizing-clusters)에서 설명한 대로 `s3Cluster` 함수를 사용해야 합니다. 이를 통해 노드 간에 읽기를 분산할 수 있습니다.  

처음 삽입 쿼리를 수신하는 서버는 먼저 glob 패턴을 해결하고, 그런 다음 일치하는 각 파일의 처리를 자기 자신과 다른 서버에 동적으로 분배합니다.

<Image img={S3Cluster} size="lg" border alt="ClickHouse의 s3Cluster 함수" />

우리는 앞서의 읽기 쿼리를 3개 노드로 작업량을 분배하며, 질의를 `s3Cluster`를 사용하도록 조정합니다. 이는 ClickHouse Cloud에서 자동으로 수행되며, 기본 클러스터 `default`를 참조합니다.

[클러스터 활용](/integrations/s3#utilizing-clusters)에서 언급했듯이 이 작업은 파일 수준으로 분산됩니다. 이 기능을 활용하려면 사용자는 충분한 수의 파일이 필요합니다: 즉, 노드 수보다 많아야 합니다.

```sql
SELECT
    OwnerDisplayName,
    count() AS num_posts
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
WHERE OwnerDisplayName NOT IN ('', 'anon')
GROUP BY OwnerDisplayName
ORDER BY num_posts DESC
LIMIT 5
SETTINGS max_threads = 16

┌─OwnerDisplayName─┬─num_posts─┐
│ user330315       │     10344 │
│ user4039065      │      5316 │
│ user149341       │      4102 │
│ user529758       │      3700 │
│ user3559349      │      3068 │
└──────────────────┴───────────┘

5 rows in set. Elapsed: 0.622 sec. Processed 59.82 million rows, 24.03 GB (96.13 million rows/s., 38.62 GB/s.)
Peak memory usage: 176.74 MiB.
```

마찬가지로 초기 노드를 위해 앞서 식별된 향상된 설정을 사용하여 삽입 쿼리를 분산할 수 있습니다:

```sql
INSERT INTO posts SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet') SETTINGS min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 171.202 sec. Processed 59.82 million rows, 24.03 GB (349.41 thousand rows/s., 140.37 MB/s.)
```

독자들은 파일 읽기가 쿼리 성능을 향상시켰지만 삽입 성능은 향상되지 않음을 알게 될 것입니다. 기본적으로 `s3Cluster`를 사용하여 읽기가 분산되지만, 삽입은 시작 노드에 대해 발생합니다. 이는 읽기가 각 노드에서 나타나지만 결과 행이 분배를 위해 инициator로 라우팅됨을 의미합니다. 높은 처리량 시나리오에서는 병목 현상이 발생할 수 있습니다. 이를 해결하기 위해 `s3cluster` 함수에 대한 `parallel_distributed_insert_select` 매개변수를 설정해야 합니다.

이를 `parallel_distributed_insert_select=2`로 설정하면 `SELECT` 및 `INSERT`가 각 노드의 분산 엔진의 기본 테이블에서 각 샤드에서 실행됩니다.

```sql
INSERT INTO posts
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows=0, max_insert_threads=4, min_insert_block_size_bytes=2863311530

0 rows in set. Elapsed: 54.571 sec. Processed 59.82 million rows, 24.03 GB (1.10 million rows/s., 440.38 MB/s.)
Peak memory usage: 11.75 GiB.
```

예상대로, 이로 인해 삽입 성능이 3배 감소합니다.

## 추가 조정 {#further-tuning}

### 중복 제거 비활성화 {#disable-de-duplication}

삽입 작업은 때때로 타임아웃과 같은 오류로 인해 실패할 수 있습니다. 삽입이 실패하면 데이터가 성공적으로 삽입되었는지 여부는 분명하지 않을 수 있습니다. ClickHouse Cloud와 같은 분산 배포에서 기본적으로 ClickHouse는 데이터가 이미 성공적으로 삽입되었는지 확인하려고 합니다. 삽입된 데이터가 중복으로 표시되면 ClickHouse는 이를 목적 테이블에 삽입하지 않습니다. 그러나 사용자는 데이터가 정상적으로 삽입된 것처럼 성공적인 작업 상태를 여전히 받습니다.

이러한 동작은 삽입 오버헤드를 수반하며, 클라이언트나 배치에서 데이터를 로드할 때는 타당하지만, 오브젝트 스토리지에서 `INSERT INTO SELECT`를 수행할 때는 불필요할 수 있습니다. 삽입 시 이 기능을 비활성화하면 아래와 같이 성능을 향상시킬 수 있습니다:

```sql
INSERT INTO posts
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0

0 rows in set. Elapsed: 52.992 sec. Processed 59.82 million rows, 24.03 GB (1.13 million rows/s., 453.50 MB/s.)
Peak memory usage: 26.57 GiB.
```

### 삽입 최적화 {#optimize-on-insert}

ClickHouse에서 `optimize_on_insert` 설정은 삽입 프로세스 중에 데이터 파트를 병합할지 여부를 제어합니다. 이 설정이 활성화되면(`optimize_on_insert = 1`, 기본값), 작은 파트는 삽입되는 과정에서 더 큰 파트로 병합되며, 이는 읽어야 할 파트 수를 줄여 쿼리 성능을 개선합니다. 그러나 이 병합은 삽입 프로세스에 오버헤드를 추가하여 높은 처리량 삽입 속도를 저하시킬 수 있습니다.

이 설정을 비활성화하면(`optimize_on_insert = 0`) 삽입 중 병합을 건너뛰어 데이터 기록이 더 빨라지며, 특히 빈번한 소규모 삽입을 처리할 때 이러한 동작의 이점이 있습니다. 병합 프로세스는 백그라운드로 연기되어 삽입 성능을 더 좋게 하지만, 작은 파트 수가 일시적으로 증가하여, 백그라운드 병합이 완료될 때까지 쿼리가 느려질 수 있습니다. 삽입 성능이 우선이거나 백그라운드 병합 프로세스가 최적화를 효과적으로 처리할 수 있을 때 이 설정이 이상적입니다. 비활성화 설정은 삽입 처리량을 향상시킬 수 있습니다:

```sql
SELECT *
FROM s3Cluster('default', 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/by_month/*.parquet')
SETTINGS parallel_distributed_insert_select = 2, min_insert_block_size_rows = 0, max_insert_threads = 4, min_insert_block_size_bytes = 2863311530, insert_deduplicate = 0, optimize_on_insert = 0

0 rows in set. Elapsed: 49.688 sec. Processed 59.82 million rows, 24.03 GB (1.20 million rows/s., 483.66 MB/s.)
```

## 기타 메모 {#misc-notes}

* 메모리 부족 시나리오에서는 S3에 삽입할 때 `max_insert_delayed_streams_for_parallel_write`를 낮추는 것을 고려하십시오.
