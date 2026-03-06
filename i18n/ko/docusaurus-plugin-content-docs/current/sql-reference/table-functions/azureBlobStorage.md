---
description: '테이블과 유사한 인터페이스를 제공하여 Azure Blob Storage의 파일을 조회하고 삽입할 수 있습니다. s3 함수와 유사합니다.'
keywords: ['azure blob storage']
sidebar_label: 'azureBlobStorage'
sidebar_position: 10
slug: /sql-reference/table-functions/azureBlobStorage
title: 'azureBlobStorage'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# azureBlobStorage 테이블 함수 \{#azureblobstorage-table-function\}

[Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs)에 있는 파일을 조회하거나 삽입할 수 있는 테이블 형태의 인터페이스를 제공합니다. 이 테이블 함수는 [s3 함수](../../sql-reference/table-functions/s3.md)와 유사합니다.

## 구문 \{#syntax\}

<Tabs>
<TabItem value="connection_string" label="연결 문자열" default>

자격 증명이 연결 문자열에 포함되어 있으므로 별도의 `account_name`/`account_key` 인수가 필요하지 않습니다.

```sql
azureBlobStorage(connection_string, container_name, blobpath [, format, compression, structure])
```

</TabItem>
<TabItem value="storage_account_url" label="스토리지 계정 URL">

`account_name`과 `account_key`를 별도의 인수로 전달해야 합니다.

```sql
azureBlobStorage(storage_account_url, container_name, blobpath, account_name, account_key [, format, compression, structure])
```

</TabItem>
<TabItem value="named_collection" label="네임드 컬렉션">

지원되는 키의 전체 목록은 아래의 [Named Collections](#named-collections)를 참조하십시오.

```sql
azureBlobStorage(named_collection[, option=value [,..]])
```

</TabItem>
</Tabs>

## Arguments \{#arguments\}

| Argument                         | Description                                                                                                                                                                                                                                                                                                                                               |
|----------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `connection_string`              | 자격 증명(계정 이름 + 계정 키 또는 SAS 토큰)이 포함된 연결 문자열입니다. 이 방식을 사용할 때는 `account_name` 및 `account_key`를 별도로 전달하면 **안 됩니다**. 자세한 내용은 [연결 문자열 구성](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account)을 참조하십시오. |
| `storage_account_url`            | 스토리지 계정 엔드포인트 URL입니다(예: `https://myaccount.blob.core.windows.net/`). 이 방식을 사용할 때는 `account_name` 및 `account_key`도 반드시 함께 전달해야 합니다.                                                                                                                                                                                         |
| `container_name`                 | 컨테이너 이름입니다.                                                                                                                                                                                                                                                                                                                                     |
| `blobpath`                       | 파일 경로입니다. 읽기 전용 모드에서 다음 와일드카드를 지원합니다: `*`, `**`, `?`, `{abc,def}`, `{N..M}` (`N`, `M` — 숫자, `'abc'`, `'def'` — 문자열).                                                                                                                                                                                                  |
| `account_name`                   | 스토리지 계정 이름입니다. SAS 없이 `storage_account_url`을 사용할 때는 **필수**이며, `connection_string`을 사용할 때는 전달하면 **안 됩니다**.                                                                                                                                                                                                              |
| `account_key`                    | 스토리지 계정 키입니다. SAS 없이 `storage_account_url`을 사용할 때는 **필수**이며, `connection_string`을 사용할 때는 전달하면 **안 됩니다**.                                                                                                                                                                                                               |
| `format`                         | 파일의 [format](/sql-reference/formats)입니다.                                                                                                                                                                                                                                                                                                          |
| `compression`                    | 지원되는 값: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`. 기본값으로는 파일 확장자를 기준으로 압축 방식을 자동 감지합니다(`auto`로 설정한 것과 동일).                                                                                                                                                                                      |
| `structure`                      | 테이블의 구조입니다. 형식: `'column1_name column1_type, column2_name column2_type, ...'`.                                                                                                                                                                                                                                                               |
| `partition_strategy`             | 선택 사항입니다. 지원되는 값: `WILDCARD` 또는 `HIVE`. `WILDCARD`는 경로에 `{_partition_id}`가 포함되어 있어야 하며, 이는 파티션 키로 대체됩니다. `HIVE`는 와일드카드를 허용하지 않으며 경로를 테이블 루트로 간주하고, 파일 이름으로 Snowflake ID를 사용하고 파일 형식을 확장자로 하는 Hive 스타일의 파티션 디렉터리를 생성합니다. 기본값은 `WILDCARD`입니다. |
| `partition_columns_in_data_file` | 선택 사항입니다. `HIVE` 파티션 전략에서만 사용됩니다. ClickHouse가 파티션 컬럼이 데이터 파일에 함께 기록되어 있을 것으로 예상해야 하는지 여부를 지정합니다. 기본값은 `false`입니다.                                                                                                                                                                     |
| `extra_credentials`              | 인증을 위해 `client_id` 및 `tenant_id`를 사용합니다. `extra_credentials`가 제공된 경우, `account_name` 및 `account_key`보다 우선적으로 사용됩니다.                                                                                                                                                                                                         |

## 명명된 컬렉션 \{#named-collections\}

인수는 [명명된 컬렉션](/operations/named-collections)을 사용해 전달할 수도 있습니다. 이 경우 다음 키를 사용할 수 있습니다:

| Key                   | Required | Description                                                                            |
| --------------------- | -------- | -------------------------------------------------------------------------------------- |
| `container`           | Yes      | 컨테이너 이름입니다. 위치 인수 `container_name`에 해당합니다.                                             |
| `blob_path`           | Yes      | 파일 경로(선택적 와일드카드 포함)입니다. 위치 인수 `blobpath`에 해당합니다.                                       |
| `connection_string`   | No*      | 자격 증명이 포함된 연결 문자열입니다. `connection_string` 또는 `storage_account_url` 중 하나는 반드시 제공해야 합니다. |
| `storage_account_url` | No*      | 스토리지 계정 엔드포인트 URL입니다. `connection_string` 또는 `storage_account_url` 중 하나는 반드시 제공해야 합니다. |
| `account_name`        | No       | `storage_account_url`을 사용할 때 필요합니다.                                                    |
| `account_key`         | No       | `storage_account_url`을 사용할 때 필요합니다.                                                    |
| `format`              | No       | 파일 형식입니다.                                                                              |
| `compression`         | No       | 압축 유형입니다.                                                                              |
| `structure`           | No       | 테이블 구조입니다.                                                                             |
| `client_id`           | No       | 인증에 사용하는 클라이언트 ID입니다.                                                                  |
| `tenant_id`           | No       | 인증에 사용하는 테넌트 ID입니다.                                                                    |

:::note
명명된 컬렉션의 키 이름은 FUNCTION의 위치 인수 이름과 다릅니다: `container`( `container_name`이 아님), `blob_path`( `blobpath`가 아님).
:::

**예제:**

```sql
CREATE NAMED COLLECTION azure_my_data AS
    storage_account_url = 'https://myaccount.blob.core.windows.net/',
    container = 'mycontainer',
    blob_path = 'data/*.parquet',
    account_name = 'myaccount',
    account_key = 'mykey...==',
    format = 'Parquet';

SELECT *
FROM azureBlobStorage(azure_my_data)
LIMIT 5;
```

또한 쿼리 실행 시 이름이 지정된 컬렉션의 값을 재정의할 수 있습니다.

```sql
SELECT *
FROM azureBlobStorage(azure_my_data, blob_path = 'other_data/*.csv', format = 'CSVWithNames')
LIMIT 5;
```


## 반환 값 \{#returned_value\}

지정된 파일에서 데이터를 읽거나 쓰기 위해 지정된 구조를 가진 테이블입니다.

## 예시 \{#examples\}

### `storage_account_url` 형식을 사용하여 읽기 \{#reading-with-storage-account-url\}

```sql
SELECT *
FROM azureBlobStorage(
    'https://myaccount.blob.core.windows.net/',
    'mycontainer',
    'data/*.parquet',
    'myaccount',
    'mykey...==',
    'Parquet'
)
LIMIT 5;
```


### `connection_string` 형식으로 읽기 \{#reading-with-connection-string\}

```sql
SELECT *
FROM azureBlobStorage(
    'DefaultEndpointsProtocol=https;AccountName=myaccount;AccountKey=mykey...==;EndPointSuffix=core.windows.net',
    'mycontainer',
    'data/*.csv',
    'CSVWithNames'
)
LIMIT 5;
```


### 파티션을 사용한 쓰기 \{#writing-with-partitions\}

```sql
INSERT INTO TABLE FUNCTION azureBlobStorage(
    'DefaultEndpointsProtocol=https;AccountName=myaccount;AccountKey=mykey...==;EndPointSuffix=core.windows.net',
    'mycontainer',
    'test_{_partition_id}.csv',
    'CSV',
    'auto',
    'column1 UInt32, column2 UInt32, column3 UInt32'
) PARTITION BY column3
VALUES (1, 2, 3), (3, 2, 1), (78, 43, 3);
```

그다음 특정 파티션을 다시 읽습니다:

```sql
SELECT *
FROM azureBlobStorage(
    'DefaultEndpointsProtocol=https;AccountName=myaccount;AccountKey=mykey...==;EndPointSuffix=core.windows.net',
    'mycontainer',
    'test_1.csv',
    'CSV',
    'auto',
    'column1 UInt32, column2 UInt32, column3 UInt32'
);
```

```response
┌─column1─┬─column2─┬─column3─┐
│       3 │       2 │       1 │
└─────────┴─────────┴─────────┘
```


## 가상 컬럼 \{#virtual-columns\}

- `_path` — 파일 경로입니다. 타입: `LowCardinality(String)`.
- `_file` — 파일 이름입니다. 타입: `LowCardinality(String)`.
- `_size` — 파일 크기(바이트 단위)입니다. 타입: `Nullable(UInt64)`. 파일 크기를 알 수 없는 경우 값은 `NULL`입니다.
- `_time` — 파일의 마지막 수정 시각입니다. 타입: `Nullable(DateTime)`. 시각을 알 수 없는 경우 값은 `NULL`입니다.

## 파티션 쓰기 \{#partitioned-write\}

### 파티션 전략 \{#partition-strategy\}

INSERT 쿼리에 대해서만 지원합니다.

`WILDCARD`(기본값): 파일 경로에 있는 `{_partition_id}` 와일드카드를 실제 파티션 키로 대체합니다.

`HIVE`는 읽기 및 쓰기에 대해 Hive 스타일 파티셔닝을 구현합니다. 다음 형식으로 파일을 생성합니다: `<prefix>/<key1=val1/key2=val2...>/<snowflakeid>.<toLower(file_format)>`.

**`HIVE` 파티션 전략 예**

```sql
INSERT INTO TABLE FUNCTION azureBlobStorage(
    azure_conf2,
    storage_account_url = 'https://myaccount.blob.core.windows.net/',
    container = 'cont',
    blob_path = 'azure_table_root',
    format = 'CSVWithNames',
    compression = 'auto',
    structure = 'year UInt16, country String, id Int32',
    partition_strategy = 'hive'
) PARTITION BY (year, country)
VALUES (2020, 'Russia', 1), (2021, 'Brazil', 2);
```

```result
SELECT _path, * FROM azureBlobStorage(
    azure_conf2,
    storage_account_url = 'https://myaccount.blob.core.windows.net/',
    container = 'cont',
    blob_path = 'azure_table_root/**.csvwithnames'
)

   ┌─_path───────────────────────────────────────────────────────────────────────────┬─id─┬─year─┬─country─┐
1. │ cont/azure_table_root/year=2021/country=Brazil/7351307847391293440.csvwithnames │  2 │ 2021 │ Brazil  │
2. │ cont/azure_table_root/year=2020/country=Russia/7351307847378710528.csvwithnames │  1 │ 2020 │ Russia  │
   └─────────────────────────────────────────────────────────────────────────────────┴────┴──────┴─────────┘
```


## use_hive_partitioning 설정 \{#hive-style-partitioning\}

이 설정은 ClickHouse가 읽기 시점에 Hive 스타일로 파티셔닝된 파일을 파싱하도록 하는 힌트입니다. 쓰기에는 아무런 영향을 주지 않습니다. 읽기와 쓰기를 대칭적으로 유지하려면 `partition_strategy` 인자를 사용하십시오.

`use_hive_partitioning` 설정을 1로 설정하면, ClickHouse는 경로(`/name=value/`)에서 Hive 스타일 파티셔닝을 감지하고 쿼리에서 파티션 컬럼을 가상 컬럼으로 사용할 수 있습니다. 이 가상 컬럼은 파티션 경로에 있는 컬럼과 동일한 이름을 가지되, 앞에 `_`가 붙습니다.

**예시**

Hive 스타일 파티셔닝으로 생성된 가상 컬럼 사용

```sql
SELECT * FROM azureBlobStorage(config, storage_account_url='...', container='...', blob_path='http://data/path/date=*/country=*/code=*/*.parquet') WHERE _date > '2020-01-01' AND _country = 'Netherlands' AND _code = 42;
```


## Shared Access Signatures (SAS) 사용하기 \{#using-shared-access-signatures-sas-sas-tokens\}

Shared Access Signature (SAS)는 Azure Storage 컨테이너 또는 파일에 제한된 액세스 권한을 부여하는 URI입니다. 이를 사용하면 스토리지 계정 키를 공유하지 않고도 스토리지 계정 리소스에 시간 제한된 액세스 권한을 제공할 수 있습니다. 자세한 내용은 [여기](https://learn.microsoft.com/en-us/rest/api/storageservices/delegate-access-with-shared-access-signature)를 참고하십시오.

`azureBlobStorage` 함수는 Shared Access Signatures (SAS)를 지원합니다.

[Blob SAS 토큰](https://learn.microsoft.com/en-us/azure/ai-services/translator/document-translation/how-to-guides/create-sas-tokens?tabs=Containers)은 대상 blob, 권한, 유효 기간을 포함하여 요청을 인증하는 데 필요한 모든 정보를 담고 있습니다. blob URL을 구성하려면 blob 서비스 엔드포인트에 SAS 토큰을 이어 붙이면 됩니다. 예를 들어 엔드포인트가 `https://clickhousedocstest.blob.core.windows.net/`인 경우 요청은 다음과 같습니다.

```sql
SELECT count()
FROM azureBlobStorage('BlobEndpoint=https://clickhousedocstest.blob.core.windows.net/;SharedAccessSignature=sp=r&st=2025-01-29T14:58:11Z&se=2025-01-29T22:58:11Z&spr=https&sv=2022-11-02&sr=c&sig=Ac2U0xl4tm%2Fp7m55IilWl1yHwk%2FJG0Uk6rMVuOiD0eE%3D', 'exampledatasets', 'example.csv')

┌─count()─┐
│      10 │
└─────────┘

1 row in set. Elapsed: 0.425 sec.
```

또는 생성된 [Blob SAS URL](https://learn.microsoft.com/en-us/azure/ai-services/translator/document-translation/how-to-guides/create-sas-tokens?tabs=Containers)을 사용할 수 있습니다:

```sql
SELECT count()
FROM azureBlobStorage('https://clickhousedocstest.blob.core.windows.net/?sp=r&st=2025-01-29T14:58:11Z&se=2025-01-29T22:58:11Z&spr=https&sv=2022-11-02&sr=c&sig=Ac2U0xl4tm%2Fp7m55IilWl1yHwk%2FJG0Uk6rMVuOiD0eE%3D', 'exampledatasets', 'example.csv')

┌─count()─┐
│      10 │
└─────────┘

1 row in set. Elapsed: 0.153 sec.
```


## 관련 항목 \{#related\}

- [AzureBlobStorage 테이블 엔진](engines/table-engines/integrations/azureBlobStorage.md)