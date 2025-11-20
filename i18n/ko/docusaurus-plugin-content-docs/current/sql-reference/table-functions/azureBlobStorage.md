---
'description': 'Azure Blob Storage에서 파일을 SELECT/INSERT할 수 있는 테이블과 유사한 인터페이스를 제공합니다.
  s3 기능과 유사합니다.'
'keywords':
- 'azure blob storage'
'sidebar_label': 'azureBlobStorage'
'sidebar_position': 10
'slug': '/sql-reference/table-functions/azureBlobStorage'
'title': 'azureBlobStorage'
'doc_type': 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# azureBlobStorage 테이블 함수

Azure Blob Storage에서 파일을 선택/삽입할 수 있는 테이블과 유사한 인터페이스를 제공합니다. 이 테이블 함수는 [s3 함수](../../sql-reference/table-functions/s3.md)와 유사합니다.

## 구문 {#syntax}

```sql
azureBlobStorage(- connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression, structure, partition_strategy, partition_columns_in_data_file, extra_credentials(client_id=, tenant_id=)])
```

## 인수 {#arguments}

| 인수                                        | 설명                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
|---------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `connection_string`\| `storage_account_url` | connection_string에는 계정 이름 및 키가 포함됩니다 ([연결 문자열 만들기](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account)). 또는 여기에서 저장소 계정 URL을 제공하고 계정 이름 및 계정 키를 별도 매개변수로 제공할 수 있습니다(매개변수 account_name 및 account_key 참조) |
| `container_name`                            | 컨테이너 이름                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `blobpath`                                  | 파일 경로. 읽기 전용 모드에서 다음 와일드카드를 지원합니다: `*`, `**`, `?`, `{abc,def}` 및 `{N..M}` (여기서 `N`, `M`은 숫자, `'abc'`, `'def'`는 문자열입니다).                                                                                                                                                                                                                                                                                          |
| `account_name`                              | storage_account_url이 사용되는 경우, 여기에서 계정 이름을 지정할 수 있습니다.                                                                                                                                                                                                                                                                                                                                                                                                              |
| `account_key`                               | storage_account_url이 사용되는 경우, 여기에서 계정 키를 지정할 수 있습니다.                                                                                                                                                                                                                                                                                                                                                                                                               |
| `format`                                    | 파일의 [형식](/sql-reference/formats).                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `compression`                               | 지원되는 값: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`. 기본적으로 파일 확장을 통해 압축을 자동 감지합니다. (설정을 `auto`로 설정한 것과 동일).                                                                                                                                                                                                                                                                                                                         | 
| `structure`                                 | 테이블의 구조. 형식 `'column1_name column1_type, column2_name column2_type, ...'`.                                                                                                                                                                                                                                                                                                                                                                                                            |
| `partition_strategy`                        | 매개변수는 선택 사항입니다. 지원되는 값: `WILDCARD` 또는 `HIVE`. `WILDCARD`는 경로에 `{_partition_id}`가 필요하며, 이는 파티션 키로 대체됩니다. `HIVE`는 와일드카드를 허용하지 않으며, 경로가 테이블 루트라고 가정하고 Snowflake ID를 파일 이름으로 사용하여 Hive 스타일의 파티셔닝 디렉토리를 생성하며 파일 형식을 확장자로 사용합니다. 기본값은 `WILDCARD`입니다.                                                                 |
| `partition_columns_in_data_file`            | 매개변수는 선택 사항입니다. `HIVE` 파티션 전략 시에만 사용됩니다. ClickHouse에 데이터 파일에 파티션 열이 기록될 것으로 예상하는지 여부를 알려줍니다. 기본값은 `false`.                                                                                                                                                                                                                                                                                                          |
| `extra_credentials`                         | 인증을 위해 `client_id` 및 `tenant_id`를 사용합니다. extra_credentials가 제공되면, 이는 `account_name` 및 `account_key`보다 우선합니다. |

## 반환 값 {#returned_value}

지정된 파일에서 데이터를 읽거나 쓰기 위한 지정된 구조를 가진 테이블입니다.

## 예제 {#examples}

[AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage) 테이블 엔진과 유사하게 사용자는 Azurite 에뮬레이터를 사용하여 로컬 Azure Storage 개발을 할 수 있습니다. 추가 세부정보는 [여기](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage)에서 확인할 수 있습니다. 아래에서는 Azurite가 호스트 이름 `azurite1`에서 사용 가능하다고 가정합니다.

다음과 같이 Azure Blob Storage에 데이터를 씁니다:

```sql
INSERT INTO TABLE FUNCTION azureBlobStorage('http://azurite1:10000/devstoreaccount1',
    'testcontainer', 'test_{_partition_id}.csv', 'devstoreaccount1', 'Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==',
    'CSV', 'auto', 'column1 UInt32, column2 UInt32, column3 UInt32') PARTITION BY column3 VALUES (1, 2, 3), (3, 2, 1), (78, 43, 3);
```

그리고 다음과 같이 읽을 수 있습니다:

```sql
SELECT * FROM azureBlobStorage('http://azurite1:10000/devstoreaccount1',
    'testcontainer', 'test_1.csv', 'devstoreaccount1', 'Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==',
    'CSV', 'auto', 'column1 UInt32, column2 UInt32, column3 UInt32');
```

```response
┌───column1─┬────column2─┬───column3─┐
│     3     │       2    │      1    │
└───────────┴────────────┴───────────┘
```

또는 connection_string을 사용하여:

```sql
SELECT count(*) FROM azureBlobStorage('DefaultEndpointsProtocol=https;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;EndPointSuffix=core.windows.net',
    'testcontainer', 'test_3.csv', 'CSV', 'auto' , 'column1 UInt32, column2 UInt32, column3 UInt32');
```

```text
┌─count()─┐
│      2  │
└─────────┘
```

## 가상 열 {#virtual-columns}

- `_path` — 파일에 대한 경로. 유형: `LowCardinality(String)`.
- `_file` — 파일의 이름. 유형: `LowCardinality(String)`.
- `_size` — 파일의 크기(바이트 단위). 유형: `Nullable(UInt64)`. 파일 크기를 알 수 없는 경우 값은 `NULL`.
- `_time` — 파일의 마지막 수정 시간. 유형: `Nullable(DateTime)`. 시간을 알 수 없는 경우 값은 `NULL`.

## 파티션 쓰기 {#partitioned-write}

### 파티션 전략 {#partition-strategy}

INSERT 쿼리에 대해서만 지원됩니다.

`WILDCARD` (기본값): 파일 경로의 `{_partition_id}` 와일드카드를 실제 파티션 키로 대체합니다.

`HIVE`는 읽기 및 쓰기를 위한 Hive 스타일 파티셔닝을 구현합니다. 파일을 다음 형식으로 생성합니다: `<prefix>/<key1=val1/key2=val2...>/<snowflakeid>.<toLower(file_format)>`.

**`HIVE` 파티션 전략의 예**

```sql
INSERT INTO TABLE FUNCTION azureBlobStorage(azure_conf2, storage_account_url = 'http://localhost:30000/devstoreaccount1', container='cont', blob_path='azure_table_root', format='CSVWithNames', compression='auto', structure='year UInt16, country String, id Int32', partition_strategy='hive') PARTITION BY (year, country) VALUES (2020, 'Russia', 1), (2021, 'Brazil', 2);
```

```result
select _path, * from azureBlobStorage(azure_conf2, storage_account_url = 'http://localhost:30000/devstoreaccount1', container='cont', blob_path='azure_table_root/**.csvwithnames')

   ┌─_path───────────────────────────────────────────────────────────────────────────┬─id─┬─year─┬─country─┐
1. │ cont/azure_table_root/year=2021/country=Brazil/7351307847391293440.csvwithnames │  2 │ 2021 │ Brazil  │
2. │ cont/azure_table_root/year=2020/country=Russia/7351307847378710528.csvwithnames │  1 │ 2020 │ Russia  │
   └─────────────────────────────────────────────────────────────────────────────────┴────┴──────┴─────────┘
```

## use_hive_partitioning 설정 {#hive-style-partitioning}

이는 ClickHouse가 읽기 시간에 Hive 스타일 파티션 파일을 분석하도록 하는 힌트입니다. 쓰기에는 영향을 미치지 않습니다. 대칭적인 읽기 및 쓰기를 위해서는 `partition_strategy` 인수를 사용하세요.

`use_hive_partitioning`이 1로 설정되면 ClickHouse는 경로에서 Hive 스타일 파티셔닝을 감지하고 (`/name=value/`), 쿼리에서 가상 열로 파티션 열을 사용할 수 있도록 허용합니다. 이 가상 열은 파티션된 경로와 동일한 이름을 가지며, `_`로 시작합니다.

**예제**

Hive 스타일 파티셔닝으로 생성된 가상 열 사용

```sql
SELECT * FROM azureBlobStorage(config, storage_account_url='...', container='...', blob_path='http://data/path/date=*/country=*/code=*/*.parquet') WHERE _date > '2020-01-01' AND _country = 'Netherlands' AND _code = 42;
```

## 공유 액세스 서명(SAS) 사용 {#using-shared-access-signatures-sas-sas-tokens}

공유 액세스 서명(SAS)은 Azure Storage 컨테이너 또는 파일에 대한 제한된 액세스를 부여하는 URI입니다. 이를 사용하면 스토리지 계정 키를 공유하지 않고도 스토리지 계정 리소스에 대한 시간 제한 액세스를 제공할 수 있습니다. 추가 세부정보는 [여기](https://learn.microsoft.com/en-us/rest/api/storageservices/delegate-access-with-shared-access-signature)에서 확인하십시오.

`azureBlobStorage` 함수는 공유 액세스 서명(SAS)을 지원합니다.

[Blob SAS 토큰](https://learn.microsoft.com/en-us/azure/ai-services/translator/document-translation/how-to-guides/create-sas-tokens?tabs=Containers)은 요청을 인증하는 데 필요한 모든 정보를 포함하며, 대상 Blob, 권한 및 유효 기간을 포함합니다. Blob URL을 구성하려면 SAS 토큰을 Blob 서비스 엔드포인트에 추가합니다. 예를 들어, 엔드포인트가 `https://clickhousedocstest.blob.core.windows.net/`인 경우 요청은 다음과 같이 됩니다:

```sql
SELECT count()
FROM azureBlobStorage('BlobEndpoint=https://clickhousedocstest.blob.core.windows.net/;SharedAccessSignature=sp=r&st=2025-01-29T14:58:11Z&se=2025-01-29T22:58:11Z&spr=https&sv=2022-11-02&sr=c&sig=Ac2U0xl4tm%2Fp7m55IilWl1yHwk%2FJG0Uk6rMVuOiD0eE%3D', 'exampledatasets', 'example.csv')

┌─count()─┐
│      10 │
└─────────┘

1 row in set. Elapsed: 0.425 sec.
```

또는 사용자는 생성된 [Blob SAS URL](https://learn.microsoft.com/en-us/azure/ai-services/translator/document-translation/how-to-guides/create-sas-tokens?tabs=Containers)을 사용할 수 있습니다:

```sql
SELECT count()
FROM azureBlobStorage('https://clickhousedocstest.blob.core.windows.net/?sp=r&st=2025-01-29T14:58:11Z&se=2025-01-29T22:58:11Z&spr=https&sv=2022-11-02&sr=c&sig=Ac2U0xl4tm%2Fp7m55IilWl1yHwk%2FJG0Uk6rMVuOiD0eE%3D', 'exampledatasets', 'example.csv')

┌─count()─┐
│      10 │
└─────────┘

1 row in set. Elapsed: 0.153 sec.
```

## 관련 {#related}
- [AzureBlobStorage 테이블 엔진](engines/table-engines/integrations/azureBlobStorage.md)
