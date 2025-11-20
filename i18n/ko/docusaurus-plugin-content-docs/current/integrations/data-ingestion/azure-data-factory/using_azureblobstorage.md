---
'sidebar_label': 'azureBlobStorage 테이블 함수 사용'
'slug': '/integrations/azure-data-factory/table-function'
'description': 'ClickHouse의 azureBlobStorage 테이블 함수 사용'
'keywords':
- 'azure data factory'
- 'azure'
- 'microsoft'
- 'data'
- 'azureBlobStorage'
'title': 'ClickHouse의 azureBlobStorage 테이블 함수 사용하여 Azure 데이터를 ClickHouse로 가져오기'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import azureDataStoreSettings                   from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-data-store-settings.png';
import azureDataStoreAccessKeys                 from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-data-store-access-keys.png';


# Using ClickHouse's azureBlobStorage table function {#using-azureBlobStorage-function}

이것은 Azure Blob Storage 또는 Azure Data Lake Storage에서 ClickHouse로 데이터를 복사하는 가장 효율적이고 간단한 방법 중 하나입니다. 이 테이블 함수로 ClickHouse에 Azure 스토리지에 직접 연결하고 데이터를 필요에 따라 읽도록 지시할 수 있습니다.

소스에서 직접 데이터를 선택, 삽입 및 필터링할 수 있는 테이블과 유사한 인터페이스를 제공합니다. 이 함수는 최적화되어 있으며, `CSV`, `JSON`, `Parquet`, `Arrow`, `TSV`, `ORC`, `Avro` 등 많은 널리 사용되는 파일 형식을 지원합니다. 전체 목록은 ["데이터 형식"](/interfaces/formats)를 참조하십시오.

이 섹션에서는 Azure Blob Storage에서 ClickHouse로 데이터를 전송하는 간단한 시작 가이드를 살펴보며, 이 함수를 효과적으로 사용하기 위한 중요한 고려사항도 다룰 것입니다. 더 자세한 사항과 고급 옵션은 공식 문서를 참조하십시오:
[`azureBlobStorage` 테이블 함수 문서 페이지](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)

## Acquiring Azure Blob Storage Access Keys {#acquiring-azure-blob-storage-access-keys}

ClickHouse가 Azure Blob Storage에 접근할 수 있도록 하려면 액세스 키가 포함된 연결 문자열이 필요합니다.

1. Azure 포털에서 **저장소 계정**으로 이동합니다.

2. 왼쪽 메뉴에서 **보안 + 네트워킹** 섹션 아래의 **액세스 키**를 선택합니다.
   <Image img={azureDataStoreSettings} size="lg" alt="Azure Data Store Settings" border/>

3. **key1** 또는 **key2** 중 하나를 선택하고, **연결 문자열** 필드 옆의 **표시** 버튼을 클릭합니다.
   <Image img={azureDataStoreAccessKeys} size="lg" alt="Azure Data Store Access Keys" border/>

4. 연결 문자열을 복사합니다 — 이 문자열은 azureBlobStorage 테이블 함수에서 매개변수로 사용됩니다.

## Querying the data from Azure Blob Storage {#querying-the-data-from-azure-blob-storage}

선호하는 ClickHouse 쿼리 콘솔을 열어보세요 — ClickHouse Cloud 웹 인터페이스, ClickHouse CLI 클라이언트 또는 쿼리를 실행하는 데 사용하는 기타 도구가 될 수 있습니다. 연결 문자열과 ClickHouse 쿼리 콘솔이 준비되면 Azure Blob Storage에서 직접 데이터를 쿼리할 수 있습니다.

다음 예제에서는 `data-container`라는 컨테이너에 저장된 JSON 파일에서 모든 데이터를 쿼리합니다:

```sql
SELECT * FROM azureBlobStorage(
    '<YOUR CONNECTION STRING>',
    'data-container',
    '*.json',
    'JSONEachRow');
```

로컬 ClickHouse 테이블(예: my_table)로 해당 데이터를 복사하려면 `INSERT INTO ... SELECT` 문을 사용할 수 있습니다:

```sql
INSERT INTO my_table
SELECT * FROM azureBlobStorage(
    '<YOUR CONNECTION STRING>',
    'data-container',
    '*.json',
    'JSONEachRow');
```

이것은 중간 ETL 단계를 필요 없이 외부 데이터를 ClickHouse로 효율적으로 가져올 수 있게 합니다.

## A simple example using the Environmental sensors dataset {#simple-example-using-the-environmental-sensors-dataset}

예를 들어 Environmental Sensors 데이터 세트에서 단일 파일을 다운로드합니다.

1. [샘플 파일](https://clickhouse-public-datasets.s3.eu-central-1.amazonaws.com/sensors/monthly/2019-06_bmp180.csv.zst)을 [Environmental Sensors 데이터 세트](https://clickhouse.com/docs/getting-started/example-datasets/environmental-sensors)에서 다운로드합니다.

2. Azure Portal에서 저장소 계정이 없으시면 새 저장소 계정을 만듭니다.

:::warning
저장소 계정 키 액세스가 활성화되어 있는지 확인하시기 바랍니다. 그렇지 않으면 데이터에 접근하기 위한 계정 키를 사용할 수 없습니다.
:::

3. 저장소 계정에 새 컨테이너를 만듭니다. 이 예에서는 컨테이너 이름을 sensors로 설정합니다. 기존 컨테이너를 사용하는 경우 이 단계를 건너뛰어도 됩니다.

4. 앞서 다운로드한 `2019-06_bmp180.csv.zst` 파일을 컨테이너에 업로드합니다.

5. 이전에 설명한 단계를 따라 Azure Blob Storage 연결 문자열을 얻습니다.

모든 설정이 완료되면 Azure Blob Storage에서 직접 데이터를 쿼리할 수 있습니다:

```sql
SELECT *
FROM azureBlobStorage(
    '<YOUR CONNECTION STRING>', 
    'sensors',
    '2019-06_bmp180.csv.zst', 
    'CSVWithNames')
LIMIT 10
SETTINGS format_csv_delimiter = ';'
```

7. 테이블에 데이터를 로드하려면 원래 데이터 세트에서 사용된 스키마의 단순화된 버전을 만드세요:
```sql
CREATE TABLE sensors
(
    sensor_id UInt16,
    lat Float32,
    lon Float32,
    timestamp DateTime,
    temperature Float32
)
ENGINE = MergeTree
ORDER BY (timestamp, sensor_id);
```

:::info
Azure Blob Storage와 같은 외부 소스 쿼리 시 구성 옵션 및 스키마 추론에 대한 자세한 내용은 [입력 데이터로부터의 자동 스키마 추론](https://clickhouse.com/docs/interfaces/schema-inference)을 참조하십시오.
:::

8. 이제 Azure Blob Storage에서 sensors 테이블로 데이터를 삽입합니다:
```sql
INSERT INTO sensors
SELECT sensor_id, lat, lon, timestamp, temperature
FROM azureBlobStorage(
    '<YOUR CONNECTION STRING>', 
    'sensors',
    '2019-06_bmp180.csv.zst', 
    'CSVWithNames')
SETTINGS format_csv_delimiter = ';'
```

이제 sensors 테이블은 Azure Blob Storage에 저장된 `2019-06_bmp180.csv.zst` 파일의 데이터로 채워졌습니다.

## Additional resources {#additional-resources}

이것은 azureBlobStorage 함수를 사용하는 기본적인 소개입니다. 더 고급 옵션과 구성 세부정보에 대해서는 공식 문서를 참조하십시오:

- [azureBlobStorage 테이블 함수](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)
- [입력 및 출력 데이터 형식](https://clickhouse.com/docs/sql-reference/formats)
- [입력 데이터로부터의 자동 스키마 추론](https://clickhouse.com/docs/interfaces/schema-inference)
