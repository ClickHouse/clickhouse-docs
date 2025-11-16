---
'description': '이 엔진은 Azure Blob Storage 생태계와의 통합을 제공합니다.'
'sidebar_label': 'Azure Blob Storage'
'sidebar_position': 10
'slug': '/engines/table-engines/integrations/azureBlobStorage'
'title': 'AzureBlobStorage 테이블 엔진'
'doc_type': 'reference'
---


# AzureBlobStorage 테이블 엔진

이 엔진은 [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) 생태계와의 통합을 제공합니다.

## 테이블 생성 {#create-table}

```sql
CREATE TABLE azure_blob_storage_table (name String, value UInt32)
    ENGINE = AzureBlobStorage(connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression, partition_strategy, partition_columns_in_data_file, extra_credentials(client_id=, tenant_id=)])
    [PARTITION BY expr]
    [SETTINGS ...]
```

### 엔진 매개변수 {#engine-parameters}

- `endpoint` — 컨테이너 및 접두사를 포함하는 AzureBlobStorage 엔드포인트 URL. 인증 방법에 따라 account_name을 포함할 수 있습니다. (`http://azurite1:{port}/[account_name]{container_name}/{data_prefix}`) 또는 이러한 매개변수를 storage_account_url, account_name, container로 별도로 제공할 수 있습니다. 접두사를 지정하려면 엔드포인트를 사용해야 합니다.
- `endpoint_contains_account_name` - 이 플래그는 엔드포인트가 account_name을 포함하는지 여부를 지정하는 데 사용됩니다. 이는 특정 인증 방법에만 필요합니다. (기본값: true)
- `connection_string|storage_account_url` — connection_string은 계정 이름 및 키를 포함합니다 ([연결 문자열 만들기](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account)) 또는 여기에서 storage account url을 제공하고 account_name 및 account_key를 별도의 매개변수로 제공할 수도 있습니다 (매개변수 account_name 및 account_key 참조).
- `container_name` - 컨테이너 이름
- `blobpath` - 파일 경로. 다음 와일드카드를 읽기 전용 모드에서 지원합니다: `*`, `**`, `?`, `{abc,def}` 및 `{N..M}` 여기서 `N`, `M` — 숫자, `'abc'`, `'def'` — 문자열입니다.
- `account_name` - storage_account_url이 사용되는 경우, 이곳에 계정 이름을 지정할 수 있습니다.
- `account_key` - storage_account_url이 사용되는 경우, 이곳에 계정 키를 지정할 수 있습니다.
- `format` — 파일의 [형식](/interfaces/formats.md).
- `compression` — 지원되는 값: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`. 기본적으로 파일 확장명에 따라 압축을 자동 감지합니다. (설정을 `auto`로 하는 것과 같습니다).
- `partition_strategy` – 옵션: `WILDCARD` 또는 `HIVE`. `WILDCARD`는 파티션 키로 대체되는 `{_partition_id}`를 경로에 요구합니다. `HIVE`는 와일드카드를 허용하지 않으며 경로가 테이블 루트임을 가정하고 Snowflake ID를 파일 이름으로 하고 파일 형식을 확장자로 갖는 Hive 스타일의 파티션 디렉터리를 생성합니다. 기본값은 `WILDCARD`입니다.
- `partition_columns_in_data_file` - `HIVE` 파티션 전략에서만 사용됩니다. ClickHouse에게 데이터 파일에 파티션 컬럼이 작성될 것으로 예상되는지 여부를 알려줍니다. 기본값은 `false`입니다.
- `extra_credentials` - 인증을 위해 `client_id` 및 `tenant_id`를 사용합니다. 추가 자격 증명이 제공되면 `account_name` 및 `account_key`보다 우선 적용됩니다.

**예시**

사용자는 로컬 Azure Storage 개발을 위해 Azurite 에뮬레이터를 사용할 수 있습니다. 추가 세부사항은 [여기](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage)를 참조하십시오. 로컬 Azurite 인스턴스를 사용하는 경우, 사용자는 아래 명령에서 `http://azurite1:10000`를 `http://localhost:10000`로 대체해야 할 수 있으며, 여기서 Azurite가 호스트 `azurite1`에서 사용 가능하다고 가정합니다.

```sql
CREATE TABLE test_table (key UInt64, data String)
    ENGINE = AzureBlobStorage('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;', 'testcontainer', 'test_table', 'CSV');

INSERT INTO test_table VALUES (1, 'a'), (2, 'b'), (3, 'c');

SELECT * FROM test_table;
```

```text
┌─key──┬─data──┐
│  1   │   a   │
│  2   │   b   │
│  3   │   c   │
└──────┴───────┘
```

## 가상 컬럼 {#virtual-columns}

- `_path` — 파일 경로. 유형: `LowCardinality(String)`.
- `_file` — 파일 이름. 유형: `LowCardinality(String)`.
- `_size` — 파일 크기(바이트). 유형: `Nullable(UInt64)`. 크기를 알 수 없는 경우 값은 `NULL`.
- `_time` — 파일의 마지막 수정 시간. 유형: `Nullable(DateTime)`. 시간을 알 수 없는 경우 값은 `NULL`.

## 인증 {#authentication}

현재 인증할 수 있는 방법은 3가지입니다:
- `Managed Identity` - `endpoint`, `connection_string` 또는 `storage_account_url`을 제공하여 사용할 수 있습니다.
- `SAS Token` - `endpoint`, `connection_string` 또는 `storage_account_url`을 제공하여 사용할 수 있습니다. URL의 '?' 존재로 식별됩니다. 예시를 보려면 [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage#using-shared-access-signatures-sas-sas-tokens)를 참조하십시오.
- `Workload Identity` - `endpoint` 또는 `storage_account_url`을 제공하여 사용할 수 있습니다. config에서 `use_workload_identity` 매개변수가 설정된 경우, ([workload identity](https://github.com/Azure/azure-sdk-for-cpp/tree/main/sdk/identity/azure-identity#authenticate-azure-hosted-applications)) 인증을 위해 사용됩니다.

### 데이터 캐시 {#data-cache}

`Azure` 테이블 엔진은 로컬 디스크에서 데이터 캐싱을 지원합니다. 이 [섹션](/operations/storing-data.md/#using-local-cache)에서 파일 시스템 캐시 구성 옵션 및 사용법을 참조하십시오. 캐싱은 경로와 저장소 객체의 ETag에 따라 이루어지므로 ClickHouse는 오래된 캐시 버전을 읽지 않습니다.

캐싱을 활성화하려면 설정 `filesystem_cache_name = '<name>'` 및 `enable_filesystem_cache = 1`을 사용합니다.

```sql
SELECT *
FROM azureBlobStorage('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;', 'testcontainer', 'test_table', 'CSV')
SETTINGS filesystem_cache_name = 'cache_for_azure', enable_filesystem_cache = 1;
```

1. ClickHouse 구성 파일에 다음 섹션을 추가합니다:

```xml
<clickhouse>
    <filesystem_caches>
        <cache_for_azure>
            <path>path to cache directory</path>
            <max_size>10Gi</max_size>
        </cache_for_azure>
    </filesystem_caches>
</clickhouse>
```

2. ClickHouse `storage_configuration` 섹션에서 캐시 구성 (따라서 캐시 스토리지)을 재사용합니다. [여기]( /operations/storing-data.md/#using-local-cache)에 설명되어 있습니다.

### PARTITION BY {#partition-by}

`PARTITION BY` — 선택 사항입니다. 대부분의 경우 파티션 키가 필요하지 않으며 필요할 경우 일반적으로 한 달 단위 이상의 더 세분화된 파티션 키는 필요하지 않습니다. 파티션은 쿼리를 빠르게 하지 않습니다 (ORDER BY 표현식과 대조적으로). 너무 세분화된 파티셔닝을 사용하지 마십시오. 클라이언트 식별자나 이름으로 데이터를 파티셔닝하지 마십시오 (대신 클라이언트 식별자나 이름을 ORDER BY 표현식의 첫 번째 컬럼으로 만드십시오).

월별로 파티셔닝하려면 `toYYYYMM(date_column)` 표현식을 사용하십시오. 여기서 `date_column`은 [Date](/sql-reference/data-types/date.md) 유형의 날짜가 있는 컬럼입니다. 여기에서 파티션 이름은 `"YYYYMM"` 형식을 가집니다.

#### 파티션 전략 {#partition-strategy}

`WILDCARD` (기본값): 파일 경로에서 `{_partition_id}` 와일드카드를 실제 파티션 키로 대체합니다. 읽기가 지원되지 않습니다.

`HIVE`는 읽기 및 쓰기를 위한 hive 스타일의 파티셔닝을 구현합니다. 읽기는 재귀 glob 패턴을 사용하여 구현됩니다. 쓰기는 다음 형식을 사용하여 파일을 생성합니다: `<prefix>/<key1=val1/key2=val2...>/<snowflakeid>.<toLower(file_format)>`.

참고: `HIVE` 파티션 전략을 사용할 때 `use_hive_partitioning` 설정은 영향을 미치지 않습니다.

`HIVE` 파티션 전략의 예시:

```sql
arthur :) create table azure_table (year UInt16, country String, counter UInt8) ENGINE=AzureBlobStorage(account_name='devstoreaccount1', account_key='Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==', storage_account_url = 'http://localhost:30000/devstoreaccount1', container='cont', blob_path='hive_partitioned', format='Parquet', compression='auto', partition_strategy='hive') PARTITION BY (year, country);

arthur :) insert into azure_table values (2020, 'Russia', 1), (2021, 'Brazil', 2);

arthur :) select _path, * from azure_table;

   ┌─_path──────────────────────────────────────────────────────────────────────┬─year─┬─country─┬─counter─┐
1. │ cont/hive_partitioned/year=2020/country=Russia/7351305360873664512.parquet │ 2020 │ Russia  │       1 │
2. │ cont/hive_partitioned/year=2021/country=Brazil/7351305360894636032.parquet │ 2021 │ Brazil  │       2 │
   └────────────────────────────────────────────────────────────────────────────┴──────┴─────────┴─────────┘
```

## 관련 항목 {#see-also}

[Azure Blob Storage 테이블 함수](/sql-reference/table-functions/azureBlobStorage)
