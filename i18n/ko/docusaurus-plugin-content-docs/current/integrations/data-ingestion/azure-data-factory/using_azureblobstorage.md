---
sidebar_label: 'ClickHouse azureBlobStorage 테이블 함수 사용'
slug: /integrations/azure-data-factory/table-function
description: 'ClickHouse azureBlobStorage 테이블 함수 사용'
keywords: ['azure data factory', 'azure', 'microsoft', 'data', 'azureBlobStorage']
title: 'Azure 데이터를 ClickHouse로 가져오는 ClickHouse azureBlobStorage 테이블 함수 사용'
doc_type: 'guide'
integration:
   - support_level: 'core'
   - category: 'data_ingestion'
---

import Image from '@theme/IdealImage';
import azureDataStoreSettings                   from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-data-store-settings.png';
import azureDataStoreAccessKeys                 from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-data-store-access-keys.png';


# ClickHouse의 azureBlobStorage 테이블 함수 사용 \{#using-azureBlobStorage-function\}

이 방법은 Azure Blob Storage 또는 Azure Data Lake Storage에서 ClickHouse로 데이터를 복사하는 가장 효율적이고 직관적인 방법 중 하나입니다. 이 테이블 함수를 사용하면 ClickHouse가 Azure 스토리지에 직접 연결하여 필요할 때 데이터를 읽도록 설정할 수 있습니다.

이 함수는 테이블과 유사한 인터페이스를 제공하여 소스에서 직접 데이터를 선택하고, 삽입하고, 필터링할 수 있습니다. 이 함수는 고도로 최적화되어 있으며 `CSV`, `JSON`, `Parquet`, `Arrow`, `TSV`, `ORC`, `Avro` 등을 포함한 널리 사용되는 많은 파일 형식을 지원합니다. 전체 목록은 ["Data formats"](/interfaces/formats)을(를) 참조하십시오.

이 섹션에서는 Azure Blob Storage에서 ClickHouse로 데이터를 전송하기 위한 간단한 시작 가이드를 살펴보고, 이 함수를 효과적으로 사용하기 위한 중요한 고려 사항을 설명합니다. 자세한 내용과 고급 옵션은 공식 문서를 참조하십시오:
[`azureBlobStorage` Table Function documentation page](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)

## Azure Blob Storage 액세스 키 가져오기 \{#acquiring-azure-blob-storage-access-keys\}

ClickHouse에서 Azure Blob Storage에 액세스하려면 액세스 키가 포함된 연결 문자열이 필요합니다.

1. Azure 포털에서 **Storage Account**로 이동합니다.

2. 왼쪽 메뉴에서 **Security + networking** 섹션의 **Access keys**를 선택합니다.
   <Image img={azureDataStoreSettings} size="lg" alt="Azure Data Store Settings" border/>

3. **key1** 또는 **key2** 중 하나를 선택한 후 **Connection string** 필드 옆의 **Show** 버튼을 클릭합니다.
   <Image img={azureDataStoreAccessKeys} size="lg" alt="Azure Data Store Access Keys" border/>

4. 연결 문자열을 복사합니다. 이 문자열은 azureBlobStorage table function의 매개변수로 사용합니다.

## Azure Blob Storage에서 데이터 쿼리하기 \{#querying-the-data-from-azure-blob-storage\}

선호하는 ClickHouse 쿼리 콘솔을 엽니다. ClickHouse Cloud 웹 인터페이스, ClickHouse CLI 클라이언트 또는 평소에 쿼리를 실행할 때 사용하는 다른 도구를 사용할 수 있습니다. 연결 문자열과 ClickHouse 쿼리 콘솔 준비가 완료되면 Azure Blob Storage에서 직접 데이터를 쿼리할 수 있습니다.

다음 예시에서는 `data-container`라는 이름의 컨테이너에 있는 JSON 파일에 저장된 모든 데이터를 쿼리합니다:

```sql
SELECT * FROM azureBlobStorage(
    '<YOUR CONNECTION STRING>',
    'data-container',
    '*.json',
    'JSONEachRow');
```

해당 데이터를 로컬 ClickHouse 테이블(예: my&#95;table)에 복사하려면
`INSERT INTO ... SELECT` 구문을 사용할 수 있습니다:

```sql
INSERT INTO my_table
SELECT * FROM azureBlobStorage(
    '<YOUR CONNECTION STRING>',
    'data-container',
    '*.json',
    'JSONEachRow');
```

이 기능을 사용하면 중간 ETL 단계를 수행할 필요 없이 외부 데이터를 ClickHouse로 효율적으로 가져올 수 있습니다.


## Environmental Sensors 데이터셋을 사용하는 간단한 예제 \{#simple-example-using-the-environmental-sensors-dataset\}

예를 들어 Environmental Sensors 데이터셋에서 하나의 파일을 다운로드해 보겠습니다.

1. [Environmental Sensors Dataset](https://clickhouse.com/docs/getting-started/example-datasets/environmental-sensors)에서
   [샘플 파일](https://clickhouse-public-datasets.s3.eu-central-1.amazonaws.com/sensors/monthly/2019-06_bmp180.csv.zst)을 다운로드합니다.

2. Azure Portal에서 아직 스토리지 계정이 없다면 새 스토리지 계정을 만듭니다.

:::warning
스토리지 계정에서 **Allow storage account key access**가 활성화되어 있는지 반드시 확인하십시오.
그렇지 않으면 계정 키를 사용하여 데이터에 액세스할 수 없습니다.
:::

3. 스토리지 계정에 새 컨테이너를 생성합니다. 이 예제에서는 이름을 sensors로 지정합니다.
   기존 컨테이너를 사용하는 경우 이 단계는 건너뛸 수 있습니다.

4. 앞에서 다운로드한 `2019-06_bmp180.csv.zst` 파일을 컨테이너에 업로드합니다.

5. 앞에서 설명한 단계를 따라 Azure Blob Storage 연결 문자열을 가져옵니다.

이제 모든 설정이 완료되었으므로 Azure Blob Storage에서 데이터를 직접 쿼리할 수 있습니다.

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

7. 테이블에 데이터를 적재하려면, 원본 데이터셋에서 사용된
   스키마를 단순화한 버전을 생성합니다:
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
Azure Blob Storage와 같은 외부 소스를 쿼리할 때의 설정 옵션 및 스키마 추론에
대한 자세한 내용은 [입력 데이터로부터 자동 스키마 추론(Automatic schema
inference from input data)](https://clickhouse.com/docs/interfaces/schema-inference)을 참고하십시오.
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

이제 Azure Blob Storage에 저장된 `2019-06_bmp180.csv.zst` 파일의 데이터가
sensors 테이블에 채워졌습니다.


## 추가 리소스 \{#additional-resources\}

이 문서는 azureBlobStorage 테이블 함수(table function)를 사용하는 방법에 대한 기초적인 소개입니다.  
더 고급 옵션과 구성에 대한 자세한 내용은 공식 문서를 참조하십시오:

- [azureBlobStorage Table Function](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)
- [입력 및 출력 데이터 포맷](https://clickhouse.com/docs/sql-reference/formats)
- [입력 데이터로부터의 자동 스키마 추론(schema inference)](https://clickhouse.com/docs/interfaces/schema-inference)