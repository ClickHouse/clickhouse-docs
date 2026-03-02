---
sidebar_label: 'HTTP 인터페이스 사용'
slug: /integrations/azure-data-factory/http-interface
description: 'Azure Data Factory에서 ClickHouse로 데이터를 가져오기 위해 ClickHouse의 HTTP 인터페이스를 사용하는 방법'
keywords: ['azure data factory', 'azure', 'microsoft', 'data', 'http interface']
title: 'ClickHouse HTTP 인터페이스를 사용하여 Azure Data Factory 데이터를 ClickHouse로 가져오기'
doc_type: 'guide'
integration:
   - support_level: 'core'
   - category: 'data_ingestion'
---

import Image from '@theme/IdealImage';

import azureHomePage                            from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-home-page.png';
import azureNewResourceAnalytics                from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-new-resource-analytics.png';
import azureNewDataFactory                      from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-new-data-factory.png';
import azureNewDataFactoryConfirm               from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-new-data-factory-confirm.png';
import azureNewDataFactorySuccess               from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-new-data-factory-success.png';
import azureHomeWithDataFactory                 from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-home-with-data-factory.png';
import azureDataFactoryPage                     from '@site/static/images/integrations/data-ingestion/azure-data-factory/azure-data-factory-page.png';
import adfCreateLinkedServiceButton             from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-create-linked-service-button.png';
import adfNewLinkedServiceSearch                from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-linked-service-search.png';
import adfNewLinedServicePane                   from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-lined-service-pane.png';
import adfNewLinkedServiceBaseUrlEmpty          from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-linked-service-base-url-empty.png';
import adfNewLinkedServiceParams                from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-linked-service-params.png';
import adfNewLinkedServiceExpressionFieldFilled from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-linked-service-expression-field-filled.png';
import adfNewLinkedServiceCheckConnection       from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-linked-service-check-connection.png';
import adfLinkedServicesList                    from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-linked-services-list.png';
import adfNewDatasetItem                        from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-dataset-item.png';
import adfNewDatasetPage                        from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-dataset-page.png';
import adfNewDatasetProperties                  from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-dataset-properties.png';
import adfNewDatasetQuery                       from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-dataset-query.png';
import adfNewDatasetConnectionSuccessful        from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-dataset-connection-successful.png';
import adfNewPipelineItem                       from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-pipeline-item.png';
import adfNewCopyDataItem                       from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-new-copy-data-item.png';
import adfCopyDataSource                        from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-copy-data-source.png';
import adfCopyDataSinkSelectPost                from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-copy-data-sink-select-post.png';
import adfCopyDataDebugSuccess                  from '@site/static/images/integrations/data-ingestion/azure-data-factory/adf-copy-data-debug-success.png';


# Azure Data Factory에서 ClickHouse HTTP 인터페이스 사용하기 \{#using-clickhouse-http-interface-in-azure-data-factory\}

[`azureBlobStorage` Table Function](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)은
Azure Blob Storage에 있는 데이터를 ClickHouse로 수집하는 빠르고 편리한 방법입니다.
그러나 다음과 같은 이유로 항상 적합한 것은 아닙니다:

- 데이터가 Azure Blob Storage에 저장되어 있지 않을 수 있습니다. 예를 들어 Azure SQL Database, Microsoft SQL Server 또는 Cosmos DB에 있을 수 있습니다.
- 스토리지 계정이 퍼블릭 엔드포인트 없이 잠겨 있는 경우처럼, 보안 정책 때문에 Blob Storage에 대한 외부 접근이 전혀 허용되지 않을 수 있습니다.

이러한 경우에는 Azure Data Factory와
[ClickHouse HTTP 인터페이스](https://clickhouse.com/docs/interfaces/http)를 함께 사용하여
Azure 서비스에서 ClickHouse로 데이터를 전송할 수 있습니다.

이 방법은 데이터 흐름을 반대로 동작하게 합니다. ClickHouse가 Azure에서 데이터를 가져오는 대신,
Azure Data Factory가 ClickHouse로 데이터를 푸시합니다. 이 방식은
일반적으로 ClickHouse 인스턴스가 퍼블릭 인터넷을 통해 접근 가능해야 합니다.

:::info
Azure Data Factory의 Self-hosted Integration Runtime을 사용하면
ClickHouse 인스턴스를 인터넷에 노출하지 않을 수도 있습니다. 이 구성은
프라이빗 네트워크를 통해 데이터를 전송할 수 있게 합니다. 그러나 이 내용은
이 문서의 범위를 벗어납니다. 자세한 내용은 공식 가이드를 참고하십시오:
[Create and configure a self-hosted integration
runtime](https://learn.microsoft.com/en-us/azure/data-factory/create-self-hosted-integration-runtime?tabs=data-factory)
:::

## ClickHouse를 REST 서비스로 활용하기 \{#turning-clickhouse-to-a-rest-service\}

Azure Data Factory는 HTTP를 통해 JSON 형식으로 외부 시스템에 데이터를 전송하는 기능을 지원합니다.
이 기능을 사용하면 [ClickHouse HTTP 인터페이스](https://clickhouse.com/docs/interfaces/http)를 통해
ClickHouse에 데이터를 직접 삽입할 수 있습니다.
자세한 내용은 [ClickHouse HTTP 인터페이스 문서](https://clickhouse.com/docs/interfaces/http)를 참고하십시오.

이 예제에서는 대상 테이블을 지정하고, 입력 데이터 형식을 JSON으로 정의한 다음,
타임스탬프 파싱을 보다 유연하게 할 수 있도록 하는 옵션을 포함하기만 하면 됩니다.

```sql
INSERT INTO my_table
SETTINGS 
    date_time_input_format='best_effort',
    input_format_json_read_objects_as_strings=1
FORMAT JSONEachRow
```

이 쿼리를 HTTP 요청의 일부로 보내려면 URL로 인코딩된 문자열로 만들어 ClickHouse 엔드포인트의 `query` 매개변수로 전달하면 됩니다:

```text
https://your-clickhouse-url.com?query=INSERT%20INTO%20my_table%20SETTINGS%20date_time_input_format%3D%27best_effort%27%2C%20input_format_json_read_objects_as_strings%3D1%20FORMAT%20JSONEachRow%0A
```

:::info
Azure Data Factory는 내장된 `encodeUriComponent` 함수를 사용하여 이 인코딩을 자동으로 처리하므로, 직접 수행할 필요가 없습니다.
:::

이제 JSON 형식의 데이터를 이 URL로 전송할 수 있습니다. 데이터는 대상 테이블의 구조와 일치해야 합니다. 세 개의 컬럼 `col_1`, `col_2`, `col_3`을 가진 테이블을 가정한 curl을 사용한 간단한 예시는 다음과 같습니다.

```text
curl \
    -XPOST "https://your-clickhouse-url.com?query=<our_URL_encded_query>" \
    --data '{"col_1":9119,"col_2":50.994,"col_3":"2019-06-01 00:00:00"}'
```

또한 객체의 JSON 배열이나 JSON Lines(줄바꿈으로 구분된 JSON 객체)를 보낼 수도 있습니다. Azure Data Factory는 JSON 배열 형식을 사용하며, 이는 ClickHouse의 `JSONEachRow` 입력과 완벽하게 호환됩니다.

앞서 본 것처럼, 이 단계에서는 ClickHouse 측에서 별도로 할 일이 없습니다. HTTP 인터페이스가 이미 REST 유사 엔드포인트로 동작하는 데 필요한 모든 것을 제공합니다. 추가 구성은 필요하지 않습니다.

이제 ClickHouse가 REST 엔드포인트처럼 동작하도록 설정되었으므로, 이를 사용하도록 Azure Data Factory를 구성할 차례입니다.

다음 단계에서는 Azure Data Factory 인스턴스를 생성하고, ClickHouse 인스턴스에 대한 Linked Service를 설정하고, [REST sink](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest)를 위한 Dataset을 정의한 다음, Azure에서 ClickHouse로 데이터를 전송하는 Copy Data 액티비티를 생성합니다.


## Azure Data Factory 인스턴스 생성 \{#create-an-azure-data-factory-instance\}

이 가이드는 Microsoft Azure 계정에 액세스할 수 있으며,
이미 구독과 리소스 그룹을 구성해 두었다고 가정합니다. 이미 구성된 Azure Data Factory가 있다면,
이 단계는 건너뛰고 기존 서비스를 사용해 다음 단계로 진행하면 됩니다.

1. [Microsoft Azure Portal](https://portal.azure.com/)에 로그인한 후
   **Create a resource**를 클릭합니다.
   <Image img={azureHomePage} size="lg" alt="Azure Portal 홈 페이지" border/>

2. 왼쪽의 Categories 창에서 **Analytics**를 선택한 다음, 인기 있는 서비스 목록에서
   **Data Factory**를 클릭합니다.
   <Image img={azureNewResourceAnalytics} size="lg" alt="Azure Portal 새 리소스" border/>

3. 구독과 리소스 그룹을 선택하고 새 Data Factory 인스턴스의 이름을 입력한 뒤,
   지역을 선택하고 버전은 V2로 둡니다.
   <Image img={azureNewDataFactory} size="lg" alt="Azure Portal 새 Data Factory" border/>

3. **Review + Create**를 클릭한 다음 **Create**를 클릭하여 배포를 시작합니다.
   <Image img={azureNewDataFactoryConfirm} size="lg" alt="Azure Portal 새 Data Factory 확인" border/>

   <Image img={azureNewDataFactorySuccess} size="lg" alt="Azure Portal 새 Data Factory 생성 성공" border/>

배포가 성공적으로 완료되면 새 Azure Data Factory 인스턴스를 사용하기 시작할 수 있습니다.

## 새 REST 기반 Linked Service 생성 \{#-creating-new-rest-based-linked-service\}

1. Microsoft Azure Portal에 로그인한 후 Data Factory 인스턴스를 엽니다.
   <Image img={azureHomeWithDataFactory} size="lg" alt="Data Factory가 표시된 Azure Portal 홈 페이지" border/>

2. Data Factory 개요 페이지에서 **Launch Studio**를 클릭합니다.
   <Image img={azureDataFactoryPage} size="lg" alt="Azure Portal Data Factory 페이지" border/>

3. 왼쪽 메뉴에서 **Manage**를 선택한 다음 **Linked services**로 이동하여
   새 Linked Service를 만들기 위해 **+ New**를 클릭합니다.
   <Image img={adfCreateLinkedServiceButton} size="lg" alt="Azure Data Factory 새 Linked Service 버튼" border/>

4. **New linked service** 검색 창에서 **REST**를 입력하고 **REST**를 선택한 다음
   **Continue**를 클릭하여
   [REST connector](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest)
   인스턴스를 생성합니다.
   <Image img={adfNewLinkedServiceSearch} size="lg" alt="Azure Data Factory 새 Linked Service 검색" border/>

5. Linked Service 구성 창에서 새 서비스의 이름을 입력한 후
   **Base URL** 필드를 클릭하고, 이어서 **Add dynamic content**를 클릭합니다
   (이 링크는 필드를 선택했을 때만 표시됩니다).
   <Image img={adfNewLinedServicePane} size="lg" alt="새 Linked Service 창" border/>

6. Dynamic content 창에서 매개변수화된 URL을 생성할 수 있습니다.
   이를 통해 나중에 서로 다른 테이블용 데이터 세트를 생성할 때 쿼리를 정의할 수 있으며,
   Linked Service를 재사용할 수 있게 됩니다.
   <Image img={adfNewLinkedServiceBaseUrlEmpty} size="lg" alt="새 Linked Service Base URL 비어 있음" border/>

7. 필터 입력란 옆의 **"+"**를 클릭해 새 매개변수를 추가하고 이름을
   `pQuery`로 지정한 뒤, type을 String으로 설정하고 기본값을 `SELECT 1`로 설정합니다.
   **Save**를 클릭합니다.
   <Image img={adfNewLinkedServiceParams} size="lg" alt="새 Linked Service 매개변수" border/>

8. Expression 필드에 아래 내용을 입력하고 **OK**를 클릭합니다.
   `your-clickhouse-url.com`은 실제 ClickHouse 인스턴스 주소로 교체합니다.
   ```text
   @{concat('https://your-clickhouse-url.com:8443/?query=', encodeUriComponent(linkedService().pQuery))}
   ```
   <Image img={adfNewLinkedServiceExpressionFieldFilled} size="lg" alt="새 Linked Service Expression 필드 입력 완료" border/>

9. 기본 양식으로 돌아와 인증 유형을 기본 인증(Basic authentication)으로 선택하고,
   ClickHouse HTTP 인터페이스에 연결하는 데 사용하는 사용자 이름과
   암호를 입력한 다음 **Test connection**을 클릭합니다.
   구성이 올바르면 성공 메시지가 표시됩니다.
   <Image img={adfNewLinkedServiceCheckConnection} size="lg" alt="새 Linked Service 연결 테스트" border/>

10. 구성을 마무리하려면 **Create**를 클릭합니다.
    <Image img={adfLinkedServicesList} size="lg" alt="Linked Services 목록" border/>

이제 목록에서 새로 등록된 REST 기반 Linked Service를 확인할 수 있습니다.

## ClickHouse HTTP 인터페이스용 새 데이터셋 생성 \{#creating-a-new-dataset-for-the-clickhouse-http-interface\}

이제 ClickHouse HTTP 인터페이스에 대해 연결된 서비스 구성이 완료되었으므로,
Azure Data Factory에서 ClickHouse로 데이터를 전송하는 데 사용할 데이터셋을
생성할 수 있습니다.

이 예제에서는 [Environmental Sensors
Data](https://clickhouse.com/docs/getting-started/example-datasets/environmental-sensors)의
일부를 삽입합니다.

1. 사용하는 ClickHouse 쿼리 콘솔(ClickHouse Cloud 웹 UI, CLI 클라이언트,
   또는 쿼리를 실행하는 데 사용하는 다른 인터페이스)을 열고 대상 테이블을 생성합니다:
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

2. Azure Data Factory Studio에서 왼쪽 패널의 Author를 선택합니다. Dataset 항목 위에
   마우스를 올리고 점 세 개 아이콘을 클릭한 다음 New dataset을 선택합니다.
   <Image img={adfNewDatasetItem} size="lg" alt="새 데이터셋 항목" border/>

3. 검색 창에 **REST**를 입력하고 **REST**를 선택한 뒤 **Continue**를 클릭합니다.
   데이터셋 이름을 입력하고 이전 단계에서 생성한 **linked service**를 선택합니다.
   **OK**를 클릭하여 데이터셋을 생성합니다.
   <Image img={adfNewDatasetPage} size="lg" alt="새 데이터셋 페이지" border/>

4. 이제 왼쪽 Factory Resources 패널의 Datasets 섹션 아래에 새로 생성된 데이터셋이
   표시됩니다. 데이터셋을 선택하여 속성을 엽니다. 연결된 서비스에 정의된
   `pQuery` 파라미터가 표시됩니다. **Value** 텍스트 필드를 클릭한 다음
   **Add dynamic content**를 클릭합니다.
   <Image img={adfNewDatasetProperties} size="lg" alt="새 데이터셋 속성" border/>

5. 열리는 패널에 다음 쿼리를 붙여넣습니다:
   ```sql
   INSERT INTO sensors
   SETTINGS 
       date_time_input_format=''best_effort'', 
       input_format_json_read_objects_as_strings=1 
   FORMAT JSONEachRow
   ```

   :::danger
   쿼리 안의 모든 작은따옴표 `'`는 두 개의 작은따옴표 `''`로 바꿔야 합니다.
   이는 Azure Data Factory의 표현식 파서의 요구 사항입니다. 작은따옴표를 이스케이프하지 않으면
   즉시 오류가 나타나지 않을 수도 있지만, 나중에 데이터셋을 사용하거나 저장하려 할 때
   실패합니다. 예를 들어 `'best_effort'`는 `''best_effort''`로 작성해야 합니다.
   :::

   <Image img={adfNewDatasetQuery} size="xl" alt="새 데이터셋 쿼리" border/>

6. **OK**를 클릭하여 표현식을 저장합니다. **Test connection**을 클릭합니다. 구성이 올바르게 되어 있으면
   **Connection successful** 메시지가 표시됩니다. 페이지 상단의 **Publish
   all**을 클릭하여 변경 사항을 저장합니다.
   <Image img={adfNewDatasetConnectionSuccessful} size="xl" alt="새 데이터셋 연결 성공" border/>

### 예제 데이터세트 설정하기 \{#setting-up-an-example-dataset\}

이 예제에서는 전체 Environmental Sensors Dataset을 사용하지 않고,
[Sensors Dataset Sample](https://datasets-documentation.s3.eu-west-3.amazonaws.com/environmental/sensors.csv)에
있는 작은 하위 집합만 사용합니다.

:::info
이 가이드의 초점을 유지하기 위해 Azure Data Factory에서 소스 데이터 세트를
생성하는 구체적인 단계는 다루지 않습니다. 샘플 데이터를 Azure Blob Storage,
Microsoft SQL Server 또는 Azure Data Factory에서 지원하는 다른 파일 형식 등
원하는 스토리지 서비스에 업로드해도 됩니다.
:::

데이터 세트를 Azure Blob Storage(또는 선호하는 다른 스토리지 서비스)에
업로드한 다음, Azure Data Factory Studio에서 Factory Resources 패널로 이동합니다.
업로드한 데이터를 가리키는 새 데이터 세트를 생성합니다. 변경 사항을 저장하려면
「Publish all」을 클릭합니다.

## ClickHouse로 데이터를 전송하기 위한 Copy Activity 생성 \{#creating-the-copy-activity-to-transfer-data-to-clickhouse\}

이제 입력 및 출력 데이터 세트를 모두 구성했으므로, 예제 데이터 세트에서 ClickHouse의 `sensors` 테이블로 데이터를 전송하기 위한 **Copy Data** 작업을 설정할 수 있습니다.

1. **Azure Data Factory Studio**를 열고 **Author 탭**으로 이동합니다. **Factory Resources** 창에서 **Pipeline** 위로 마우스를 올린 후, 점 세 개 아이콘을 클릭하고 **New pipeline**을 선택합니다.
   <Image img={adfNewPipelineItem} size="lg" alt="ADF 새 파이프라인 항목" border/>

2. **Activities** 창에서 **Move and transform** 섹션을 확장한 뒤 **Copy data** 작업을 캔버스로 끌어다 놓습니다.
   <Image img={adfNewCopyDataItem} size="lg" alt="새 Copy Data 항목" border/>

3. **Source** 탭을 선택하고, 앞에서 생성한 소스 데이터 세트를 선택합니다.
   <Image img={adfCopyDataSource} size="lg" alt="Copy Data 소스" border/>

4. **Sink** 탭으로 이동하여 `sensors` 테이블에 대해 생성한 ClickHouse 데이터 세트를 선택합니다. **Request method**를 POST로 설정합니다. **HTTP compression type**이 **None**으로 설정되어 있는지 확인합니다.
   :::warning
   Azure Data Factory의 Copy Data 작업에서는 HTTP 압축이 올바르게 동작하지 않습니다. 이 기능을 활성화하면 Azure가 0바이트짜리 페이로드만 전송합니다. 서비스의 버그로 보입니다. 반드시 압축을 비활성화한 상태로 두십시오.
   :::
   :::info
   기본 배치 크기인 10,000을 유지하거나 더 늘리는 것을 권장합니다. 자세한 내용은
   [Selecting an Insert Strategy / Batch inserts if synchronous](https://clickhouse.com/docs/best-practices/selecting-an-insert-strategy#batch-inserts-if-synchronous)
   를 참고하십시오.
   :::
   <Image img={adfCopyDataSinkSelectPost} size="lg" alt="Copy Data Sink POST 선택" border/>

5. 캔버스 상단에서 **Debug**를 클릭하여 파이프라인을 실행합니다. 잠시 후 작업이 큐에 등록되고 실행됩니다. 구성이 모두 올바르면 작업은 **Success** 상태로 완료됩니다.
   <Image img={adfCopyDataDebugSuccess} size="lg" alt="Copy Data Debug 성공" border/>

6. 완료되면 **Publish all**을 클릭하여 파이프라인과 데이터 세트의 변경 사항을 저장합니다.

## 추가 자료 \{#additional-resources-1\}

- [HTTP 인터페이스](https://clickhouse.com/docs/interfaces/http)
- [Azure Data Factory를 사용하여 REST 엔드포인트에서/로 데이터 복사 및 변환](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest?tabs=data-factory)
- [Insert 전략 선택](https://clickhouse.com/docs/best-practices/selecting-an-insert-strategy)
- [자체 호스팅 통합 런타임 생성 및 구성](https://learn.microsoft.com/en-us/azure/data-factory/create-self-hosted-integration-runtime?tabs=data-factory)