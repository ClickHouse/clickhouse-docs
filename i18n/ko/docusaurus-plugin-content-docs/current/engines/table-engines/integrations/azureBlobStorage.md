---
description: '이 엔진은 Azure Blob Storage 생태계와 통합을 제공합니다.'
sidebar_label: 'Azure Blob Storage'
sidebar_position: 10
slug: /engines/table-engines/integrations/azureBlobStorage
title: 'AzureBlobStorage 테이블 엔진'
doc_type: 'reference'
---



# AzureBlobStorage 테이블 엔진 \{#azureblobstorage-table-engine\}

이 엔진은 [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) 에코시스템과 통합을 제공합니다.



## 테이블 생성 \{#create-table\}

```sql
CREATE TABLE azure_blob_storage_table (name String, value UInt32)
    ENGINE = AzureBlobStorage(connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression, partition_strategy, partition_columns_in_data_file, extra_credentials(client_id=, tenant_id=)])
    [PARTITION BY expr]
    [SETTINGS ...]
```

### Engine parameters \{#engine-parameters\}

* `endpoint` — 컨테이너와 prefix가 포함된 AzureBlobStorage endpoint URL입니다. 사용 중인 인증 방식에서 필요하다면 account&#95;name을 포함할 수 있습니다. (`http://azurite1:{port}/[account_name]{container_name}/{data_prefix}`) 또는 이러한 파라미터를 storage&#95;account&#95;url, account&#95;name 및 container를 사용하여 개별적으로 제공할 수도 있습니다. prefix를 지정하려면 endpoint를 사용해야 합니다.
* `endpoint_contains_account_name` - endpoint에 account&#95;name이 포함되어 있는지를 지정하는 플래그입니다. 이는 특정 인증 방식에만 필요합니다. (기본값: true)
* `connection_string|storage_account_url` — connection&#95;string에는 account name과 key가 포함됩니다([Create connection string](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json\&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account)). 또는 여기에서 storage account url을 제공하고, account name 및 account key를 별도 파라미터로 제공할 수도 있습니다(파라미터 account&#95;name 및 account&#95;key 참조).
* `container_name` - 컨테이너 이름입니다.
* `blobpath` - 파일 경로입니다. 읽기 전용 모드에서 다음 와일드카드를 지원합니다: `*`, `**`, `?`, `{abc,def}`, `{N..M}`. 여기서 `N`, `M`은 숫자이고, `'abc'`, `'def'`는 문자열입니다.
* `account_name` - storage&#95;account&#95;url을 사용하는 경우, account name은 여기에서 지정할 수 있습니다.
* `account_key` - storage&#95;account&#95;url을 사용하는 경우, account key는 여기에서 지정할 수 있습니다.
* `format` — 파일의 [format](/interfaces/formats.md)입니다.
* `compression` — 지원되는 값: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`. 기본적으로 파일 확장자를 통해 압축을 자동 감지합니다. (`auto`로 설정하는 것과 동일합니다.)
* `partition_strategy` – 옵션: `WILDCARD` 또는 `HIVE`. `WILDCARD`는 경로에 `{_partition_id}`가 필요하며, 이는 파티션 키로 대체됩니다. `HIVE`는 와일드카드를 허용하지 않으며, 경로를 테이블 루트로 가정하고 파일 이름은 Snowflake ID, 확장자는 파일 포맷인 Hive 스타일의 파티션 디렉터리를 생성합니다. 기본값은 `WILDCARD`입니다.
* `partition_columns_in_data_file` - `HIVE` 파티션 전략에서만 사용됩니다. 데이터 파일에 파티션 컬럼이 기록되어 있을 것으로 ClickHouse가 예상해야 하는지 여부를 지정합니다. 기본값은 `false`입니다.
* `extra_credentials` - 인증을 위해 `client_id`와 `tenant_id`를 사용합니다. extra&#95;credentials가 제공된 경우, `account_name` 및 `account_key`보다 우선합니다.

**Example**

로컬 Azure Storage 개발을 위해 Azurite 에뮬레이터를 사용할 수 있습니다. 자세한 내용은 [여기](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage)를 참고하십시오. 로컬 Azurite 인스턴스를 사용하는 경우, Azurite가 호스트 `azurite1`에서 사용 가능하다고 가정하는 아래 명령에서 `http://azurite1:10000` 대신 `http://localhost:10000`으로 대체해야 할 수도 있습니다.

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


## 가상 컬럼 \{#virtual-columns\}

- `_path` — 파일 경로. 형식: `LowCardinality(String)`.
- `_file` — 파일 이름. 형식: `LowCardinality(String)`.
- `_size` — 파일 크기(바이트 단위). 형식: `Nullable(UInt64)`. 크기를 알 수 없으면 값은 `NULL`입니다.
- `_time` — 파일 마지막 수정 시간. 형식: `Nullable(DateTime)`. 시간을 알 수 없으면 값은 `NULL`입니다.



## 인증 \{#authentication\}

현재 인증 방식은 다음 3가지입니다:

* `Managed Identity` - `endpoint`, `connection_string` 또는 `storage_account_url`을 제공하여 사용할 수 있습니다.
* `SAS Token` - `endpoint`, `connection_string` 또는 `storage_account_url`을 제공하여 사용할 수 있습니다. URL에 &#39;?&#39;가 포함되어 있는지로 식별할 수 있습니다. 예시는 [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage#using-shared-access-signatures-sas-sas-tokens)를 참고하십시오.
* `Workload Identity` - `endpoint` 또는 `storage_account_url`을 제공하여 사용할 수 있습니다. config에서 `use_workload_identity` 파라미터를 설정하면 인증에 [workload identity](https://github.com/Azure/azure-sdk-for-cpp/tree/main/sdk/identity/azure-identity#authenticate-azure-hosted-applications)가 사용됩니다.

### 데이터 캐시 \{#data-cache\}

`Azure` 테이블 엔진은 로컬 디스크에 대한 데이터 캐싱을 지원합니다.
파일 시스템 캐시 구성 옵션과 사용 방법은 이 [섹션](/operations/storing-data.md/#using-local-cache)을 참고하십시오.
캐싱은 스토리지 객체의 경로와 ETag에 따라 수행되므로, ClickHouse는 오래된 캐시 버전을 읽지 않습니다.

캐싱을 활성화하려면 `filesystem_cache_name = '<name>'` 및 `enable_filesystem_cache = 1` 설정을 사용하십시오.

```sql
SELECT *
FROM azureBlobStorage('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;', 'testcontainer', 'test_table', 'CSV')
SETTINGS filesystem_cache_name = 'cache_for_azure', enable_filesystem_cache = 1;
```

1. ClickHouse 설정 파일에 다음 섹션을 추가합니다:

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

2. ClickHouse `storage_configuration` 섹션에서 [여기서 설명한](/operations/storing-data.md/#using-local-cache) 캐시 구성을 재사용합니다(따라서 동일한 캐시 스토리지를 사용합니다).

### PARTITION BY \{#partition-by\}

`PARTITION BY` — 선택 사항입니다. 대부분의 경우 파티션 키는 필요하지 않으며, 필요하더라도 일반적으로 월 단위보다 더 세분화된 파티션 키는 필요하지 않습니다. 파티션은 쿼리를 빠르게 하지 않습니다(ORDER BY 표현식과는 대조적입니다). 지나치게 세분화된 파티셔닝은 절대 사용하지 말아야 합니다. 데이터는 클라이언트 식별자나 이름으로 파티션하지 말고, 대신 클라이언트 식별자나 이름을 ORDER BY 표현식의 첫 번째 컬럼으로 두십시오.

월별 파티셔닝을 위해서는 `toYYYYMM(date_column)` 표현식을 사용합니다. 여기서 `date_column`은 [Date](/sql-reference/data-types/date.md) 타입의 날짜를 가진 컬럼입니다. 이 경우 파티션 이름은 `"YYYYMM"` 형식을 가집니다.

#### 파티션 전략 \{#partition-strategy\}

`WILDCARD`(기본값): 파일 경로의 `{_partition_id}` 와일드카드를 실제 파티션 키로 대체합니다. 읽기는 지원되지 않습니다.

`HIVE`는 읽기 및 쓰기를 위한 Hive 스타일 파티셔닝을 구현합니다. 읽기는 재귀적인 glob 패턴을 사용해 구현됩니다. 쓰기는 다음 형식으로 파일을 생성합니다: `<prefix>/<key1=val1/key2=val2...>/<snowflakeid>.<toLower(file_format)>`.

참고: `HIVE` 파티션 전략을 사용할 때는 `use_hive_partitioning` 설정은 효과가 없습니다.

`HIVE` 파티션 전략 예시는 다음과 같습니다:

```sql
arthur :) create table azure_table (year UInt16, country String, counter UInt8) ENGINE=AzureBlobStorage(account_name='devstoreaccount1', account_key='Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==', storage_account_url = 'http://localhost:30000/devstoreaccount1', container='cont', blob_path='hive_partitioned', format='Parquet', compression='auto', partition_strategy='hive') PARTITION BY (year, country);

arthur :) insert into azure_table values (2020, 'Russia', 1), (2021, 'Brazil', 2);

arthur :) select _path, * from azure_table;
```


┌─&#95;path──────────────────────────────────────────────────────────────────────┬─year─┬─country─┬─counter─┐

1. │ cont/hive&#95;partitioned/year=2020/country=Russia/7351305360873664512.parquet │ 2020 │ 러시아  │       1 │
2. │ cont/hive&#95;partitioned/year=2021/country=Brazil/7351305360894636032.parquet │ 2021 │ 브라질  │       2 │
   └────────────────────────────────────────────────────────────────────────────┴──────┴─────────┴─────────┘

```
```


## 함께 보기 \{#see-also\}

[Azure Blob Storage 테이블 함수](/sql-reference/table-functions/azureBlobStorage)
