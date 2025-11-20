---
'sidebar_label': 'HTTP 인터페이스 사용하기'
'slug': '/integrations/azure-data-factory/http-interface'
'description': 'ClickHouse의 HTTP 인터페이스를 사용하여 Azure Data Factory에서 ClickHouse로 데이터를
  가져오기'
'keywords':
- 'azure data factory'
- 'azure'
- 'microsoft'
- 'data'
- 'http interface'
'title': 'ClickHouse HTTP 인터페이스를 사용하여 Azure 데이터를 ClickHouse로 가져오기'
'doc_type': 'guide'
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


# Using ClickHouse HTTP interface in Azure data factory {#using-clickhouse-http-interface-in-azure-data-factory}

[`azureBlobStorage` 테이블 함수](https://clickhouse.com/docs/sql-reference/table-functions/azureBlobStorage)는 Azure Blob Storage에서 ClickHouse로 데이터를 수집하는 빠르고 편리한 방법입니다. 그러나 다음과 같은 이유로 이 방법이 항상 적합하지 않을 수 있습니다:

- 데이터가 Azure Blob Storage에 저장되지 않을 수 있습니다. 예를 들어, Azure SQL Database, Microsoft SQL Server 또는 Cosmos DB에 있을 수 있습니다.
- 보안 정책에 따라 Blob Storage에 대한 외부 액세스가 아예 차단될 수 있습니다. 예를 들어, 저장소 계정이 퍼블릭 엔드포인트 없이 잠겨 있는 경우가 있습니다.

이러한 경우에는 Azure Data Factory를 사용하여 [ClickHouse HTTP 인터페이스](https://clickhouse.com/docs/interfaces/http)를 통해 Azure 서비스에서 ClickHouse로 데이터를 전송할 수 있습니다.

이 방법은 흐름을 반전시킵니다: ClickHouse가 Azure에서 데이터를 끌어오기보다는 Azure Data Factory가 ClickHouse로 데이터를 푸시합니다. 이 방식은 일반적으로 ClickHouse 인스턴스가 퍼블릭 인터넷에서 접근할 수 있어야 합니다.

:::info
Azure Data Factory의 자체 호스팅 통합 런타임을 사용하여 ClickHouse 인스턴스를 인터넷에 노출하지 않고도 사용할 수 있습니다. 이 설정은 사설 네트워크를 통해 데이터를 전송할 수 있게 해줍니다. 그러나 이 기사의 범위를 넘어섭니다. 공식 가이드에서 더 많은 정보를 찾을 수 있습니다:
[자체 호스팅 통합 런타임 생성 및 구성](https://learn.microsoft.com/en-us/azure/data-factory/create-self-hosted-integration-runtime?tabs=data-factory)
:::

## Turning ClickHouse into a REST service {#turning-clickhouse-to-a-rest-service}

Azure Data Factory는 HTTP를 통해 JSON 형식으로 외부 시스템에 데이터를 전송하는 것을 지원합니다. 이 기능을 사용하여 [ClickHouse HTTP 인터페이스](https://clickhouse.com/docs/interfaces/http)를 통해 ClickHouse에 직접 데이터를 삽입할 수 있습니다. 자세한 내용은 [ClickHouse HTTP 인터페이스 문서](https://clickhouse.com/docs/interfaces/http)에서 확인할 수 있습니다.

이 예제에서는 목적 테이블을 지정하고, 입력 데이터 형식을 JSON으로 정의하고, 더 유연한 타임스탬프 파싱을 허용하는 옵션을 포함하기만 하면 됩니다.

```sql
INSERT INTO my_table
SETTINGS 
    date_time_input_format='best_effort',
    input_format_json_read_objects_as_strings=1
FORMAT JSONEachRow
```

이 쿼리를 HTTP 요청의 일부로 전송하려면, ClickHouse 엔드포인트의 쿼리 매개변수에 URL-인코딩된 문자열로 전달하면 됩니다:
```text
https://your-clickhouse-url.com?query=INSERT%20INTO%20my_table%20SETTINGS%20date_time_input_format%3D%27best_effort%27%2C%20input_format_json_read_objects_as_strings%3D1%20FORMAT%20JSONEachRow%0A
```

:::info
Azure Data Factory는 내장된 `encodeUriComponent` 기능을 사용하여 이 인코딩을 자동으로 처리할 수 있으므로 수동으로 수행할 필요가 없습니다.
:::

이제 JSON 형식의 데이터를 이 URL로 전송할 수 있습니다. 데이터는 대상 테이블의 구조와 일치해야 합니다. 세 개의 컬럼 `col_1`, `col_2` 및 `col_3`가 있는 간단한 예를 curl을 사용하여 보여드리겠습니다.
```text
curl \
    -XPOST "https://your-clickhouse-url.com?query=<our_URL_encded_query>" \
    --data '{"col_1":9119,"col_2":50.994,"col_3":"2019-06-01 00:00:00"}'
```

또한 객체의 JSON 배열 또는 JSON Lines(새 줄로 구분된 JSON 객체)를 전송할 수도 있습니다. Azure Data Factory는 ClickHouse의 `JSONEachRow` 입력과 완벽하게 작동하는 JSON 배열 형식을 사용합니다.

이 단계에서는 ClickHouse 측에서 특별하게 할 필요가 없다는 것을 알 수 있습니다. HTTP 인터페이스는 REST와 유사한 엔드포인트 역할을 하는 데 필요한 모든 것을 이미 제공합니다 — 추가 구성은 필요하지 않습니다.

ClickHouse를 REST 엔드포인트처럼 작동하도록 설정했으므로 이제 Azure Data Factory가 이를 사용하도록 구성해야 합니다.

다음 단계에서는 Azure Data Factory 인스턴스를 생성하고, ClickHouse 인스턴스에 대한 Linked Service를 설정하고, [REST 싱크](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest)용 Dataset을 정의하며, Azure에서 ClickHouse로 데이터를 전송하는 Copy Data 작업을 생성할 것입니다.

## Creating an Azure data factory instance {#create-an-azure-data-factory-instance}

이 가이드는 Microsoft Azure 계정에 접근할 수 있고, 이미 구독 및 리소스 그룹을 설정했음을 가정합니다. 이미 Azure Data Factory가 설정되어 있다면 이 단계를 안전하게 건너뛰고 기존 서비스를 사용하여 다음 단계로 이동할 수 있습니다.

1. [Microsoft Azure Portal](https://portal.azure.com/)에 로그인하고 **리소스 생성**을 클릭합니다.
   <Image img={azureHomePage} size="lg" alt="Azure Portal Home Page" border/>

2. 왼쪽의 카테고리 창에서 **Analytics**를 선택한 다음, 인기 서비스 목록에서 **Data Factory**를 클릭합니다.
   <Image img={azureNewResourceAnalytics} size="lg" alt="Azure Portal New Resource" border/>

3. 구독 및 리소스 그룹을 선택하고 새로운 Data Factory 인스턴스의 이름을 입력한 후, 지역을 선택하고 버전은 V2로 남겨 둡니다.
   <Image img={azureNewDataFactory} size="lg" alt="Azure Portal New Data Factory" border/>

4. **검토 + 만들기**를 클릭한 다음 **만들기**를 클릭하여 배포를 시작합니다.
   <Image img={azureNewDataFactoryConfirm} size="lg" alt="Azure Portal New Data Factory Confirm" border/>

   <Image img={azureNewDataFactorySuccess} size="lg" alt="Azure Portal New Data Factory Success" border/>

배포가 성공적으로 완료되면 새로운 Azure Data Factory 인스턴스를 사용할 수 있습니다.

## Creating a new REST-Based linked service {#-creating-new-rest-based-linked-service}

1. Microsoft Azure Portal에 로그인하고 Data Factory 인스턴스를 엽니다.
   <Image img={azureHomeWithDataFactory} size="lg" alt="Azure Portal Home Page with Data Factory" border/>

2. Data Factory 개요 페이지에서 **Studio 시작**을 클릭합니다.
   <Image img={azureDataFactoryPage} size="lg" alt="Azure Portal Data Factory Page" border/>

3. 왼쪽 메뉴에서 **관리**를 선택하고, **링크드 서비스**로 이동한 후 **+ 새로 만들기**를 클릭하여 새 링크드 서비스를 생성합니다.
   <Image img={adfCreateLinkedServiceButton} size="lg" alt="Azure Data Factory New Linked Service Button" border/>

4. **새 링크드 서비스 검색창**에 **REST**를 입력하고 **REST**를 선택한 후, **계속**을 클릭하여 [REST 커넥터](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest) 인스턴스를 생성합니다.
   <Image img={adfNewLinkedServiceSearch} size="lg" alt="Azure Data Factory New Linked Service Search" border/>

5. 링크드 서비스 구성 창에 새 서비스의 이름을 입력하고 **기본 URL** 필드를 클릭한 다음 **동적 내용 추가**를 클릭합니다(이 링크는 필드가 선택되었을 때만 표시됩니다).
   <Image img={adfNewLinedServicePane} size="lg" alt="New Lined Service Pane" border/>

6. 동적 내용 창에서 매개변수화된 URL을 생성하여 나중에 서로 다른 테이블에 대한 데이터 세트를 생성할 때 쿼리를 정의할 수 있도록 합니다 — 이렇게 하면 링크드 서비스가 재사용 가능해집니다.
   <Image img={adfNewLinkedServiceBaseUrlEmpty} size="lg" alt="New Linked ServiceBase Url Empty" border/>

7. 필터 입력 옆의 **"+"**를 클릭하고 새 매개변수를 추가한 뒤, 이름을 `pQuery`로 지정하고, 유형을 문자열로 설정한 다음, 기본값을 `SELECT 1`로 설정합니다. **저장**을 클릭합니다.
   <Image img={adfNewLinkedServiceParams} size="lg" alt="New Linked Service Parameters" border/>

8. 표현식 필드에 다음 내용을 입력하고 **확인**을 클릭합니다. `your-clickhouse-url.com`을 실제 ClickHouse 인스턴스의 주소로 바꿉니다.
```text
@{concat('https://your-clickhouse-url.com:8443/?query=', encodeUriComponent(linkedService().pQuery))}
```
   <Image img={adfNewLinkedServiceExpressionFieldFilled} size="lg" alt="New Linked Service Expression Field Filled" border/>

9. 메인 양식으로 돌아가 기본 인증을 선택하고 ClickHouse HTTP 인터페이스에 연결하는 데 사용된 사용자 이름과 암호를 입력한 다음 **연결 테스트**를 클릭합니다. 모든 것이 올바르게 구성되었다면 성공 메시지를 볼 수 있습니다.
   <Image img={adfNewLinkedServiceCheckConnection} size="lg" alt="New Linked Service Check Connection" border/>

10. **생성**을 클릭하여 설정을 완료합니다.
    <Image img={adfLinkedServicesList} size="lg" alt="Linked Services List" border/>

이제 새로 등록한 REST 기반 링크드 서비스가 목록에 표시되어야 합니다.

## Creating a new dataset for the ClickHouse HTTP Interface {#creating-a-new-dataset-for-the-clickhouse-http-interface}

이제 ClickHouse HTTP 인터페이스에 대한 링크드 서비스가 구성되었으므로, Azure Data Factory가 ClickHouse로 데이터를 전송하는 데 사용할 데이터 세트를 생성할 수 있습니다.

이 예제에서는 [환경 센서 데이터](https://clickhouse.com/docs/getting-started/example-datasets/environmental-sensors)의 소량의 데이터를 삽입할 것입니다.

1. 선택한 ClickHouse 쿼리 콘솔을 엽니다. ClickHouse Cloud 웹 UI, CLI 클라이언트 또는 쿼리를 실행하는 데 사용하는 다른 인터페이스일 수 있습니다. 그리고 대상 테이블을 생성합니다:
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

2. Azure Data Factory Studio에서 왼쪽 창의 Author를 선택합니다. Dataset 항목 위에 마우스를 올리고 세 점 아이콘을 클릭한 다음 새로운 데이터 세트를 선택합니다.
   <Image img={adfNewDatasetItem} size="lg" alt="New Dataset Item" border/>

3. 검색창에 **REST**를 입력하고 **REST**를 선택한 다음 **계속**을 클릭합니다. 데이터 세트의 이름을 입력하고 이전 단계에서 생성한 **링크드 서비스**를 선택합니다. **확인**을 클릭하여 데이터 세트를 생성합니다.
   <Image img={adfNewDatasetPage} size="lg" alt="New Dataset Page" border/>

4. 이제 왼쪽의 Factory Resources 창의 데이터 세트 섹션에 새로 생성한 데이터 세트가 나열되는 것을 볼 수 있습니다. 데이터 세트를 선택하여 속성을 엽니다. 링크드 서비스에서 정의된 `pQuery` 매개변수를 볼 수 있습니다. **값** 텍스트 필드를 클릭합니다. 그런 다음 **동적 내용 추가**를 클릭합니다.
   <Image img={adfNewDatasetProperties} size="lg" alt="New Dataset Properties" border/>

5. 열리는 창에 다음 쿼리를 붙여넣습니다:
```sql
INSERT INTO sensors
SETTINGS 
    date_time_input_format=''best_effort'', 
    input_format_json_read_objects_as_strings=1 
FORMAT JSONEachRow
```

   :::danger
   쿼리의 모든 단일 인용부호 `'`는 두 개의 단일 인용부호 `''`로 바꿔야 합니다. 이는 Azure Data Factory의 표현식 파서를 위해 필요합니다. 이들을 이스케이프하지 않으면 즉시 오류가 발생하지 않을 수 있지만, 나중에 데이터 세트를 사용하거나 저장하려고 할 때 실패할 수 있습니다. 예를 들어, `'best_effort'`는 `''best_effort''`로 작성해야 합니다.
   :::

   <Image img={adfNewDatasetQuery} size="xl" alt="New Dataset Query" border/>

6. 표현식을 저장하려면 OK를 클릭합니다. 연결 테스트를 클릭합니다. 모든 것이 올바르게 구성되었다면 연결 성공 메시지를 볼 수 있습니다. 페이지 상단의 **모두 게시**를 클릭하여 변경 사항을 저장합니다.
   <Image img={adfNewDatasetConnectionSuccessful} size="xl" alt="New Dataset Connection Successful" border/>

### Setting up an example dataset {#setting-up-an-example-dataset}

이번 예제에서는 전체 환경 센서 데이터 세트를 사용하지 않고, [센서 데이터 세트 샘플](https://datasets-documentation.s3.eu-west-3.amazonaws.com/environmental/sensors.csv)에서 사용할 수 있는 작은 하위 집합만 사용할 것입니다.

:::info
이 가이드의 초점을 유지하기 위해 Azure Data Factory에서 소스 데이터 세트를 생성하는 정확한 단계에는 들어가지 않겠습니다. 샘플 데이터를 원하는 저장 서비스 — 예를 들어, Azure Blob Storage, Microsoft SQL Server 또는 Azure Data Factory에서 지원하는 다른 파일 형식 — 에 업로드할 수 있습니다.
:::

데이터 세트를 Azure Blob Storage(또는 선호하는 다른 저장 서비스)에 업로드합니다. 그런 다음 Azure Data Factory Studio에서 Factory Resources 창으로 이동합니다. 업로드한 데이터를 가리키는 새로운 데이터 세트를 생성합니다. 변경 사항을 저장하려면 모두 게시를 클릭합니다.

## Creating a Copy Activity to transfer data to ClickHouse {#creating-the-copy-activity-to-transfer-data-to-clickhouse}

이제 입력 및 출력 데이터 세트를 모두 구성했으므로, **Copy Data** 작업을 설정하여 우리의 예제 데이터 세트를 ClickHouse의 `sensors` 테이블로 전송할 수 있습니다.

1. **Azure Data Factory Studio**를 열고 **Author 탭**으로 이동합니다. **Factory Resources** 창에서 **Pipeline** 위에 마우스를 올리고 세 점 아이콘을 클릭한 다음 **New pipeline**을 선택합니다.
   <Image img={adfNewPipelineItem} size="lg" alt="ADF New Pipeline Item" border/>

2. **Activities** 창에서 **Move and transform** 섹션을 확장하고 **Copy data** 작업을 캔버스로 드래그합니다.
   <Image img={adfNewCopyDataItem} size="lg" alt="New Copy DataItem" border/>

3. **Source** 탭을 선택하고 이전에 만든 소스 데이터 세트를 선택합니다.
   <Image img={adfCopyDataSource} size="lg" alt="Copy Data Source" border/>

4. **Sink** 탭으로 이동하여 센서 테이블에 대해 생성된 ClickHouse 데이터 세트를 선택합니다. **요청 방식**을 POST로 설정합니다. **HTTP 압축 유형**을 **없음**으로 설정합니다.
   :::warning
   HTTP 압축은 Azure Data Factory의 Copy Data 작업에서 올바르게 작동하지 않습니다. 활성화되면 Azure는 0바이트로 구성된 페이로드를 전송합니다 — 아마도 서비스의 버그입니다. 압축을 비활성화해 두는 것이 좋습니다.
   :::
   :::info
   기본 배치 크기인 10,000을 유지하거나 더 증가시키는 것을 권장합니다. 자세한 내용은 [삽입 전략 선택 / 동기식인 경우 배치 삽입](https://clickhouse.com/docs/best-practices/selecting-an-insert-strategy#batch-inserts-if-synchronous)에서 확인하세요.
   :::
   <Image img={adfCopyDataSinkSelectPost} size="lg" alt="Copy Data Sink Select Post" border/>

5. 캔버스 상단의 **디버그**를 클릭하여 파이프라인을 실행합니다. 잠시 기다리면 작업이 큐에 대기 및 실행됩니다. 모든 것이 올바르게 구성되었다면 작업은 **성공** 상태로 완료되어야 합니다.
   <Image img={adfCopyDataDebugSuccess} size="lg" alt="Copy Data Debug Success" border/>

6. 완료되면 **모두 게시**를 클릭하여 파이프라인과 데이터 세트 변경 사항을 저장합니다.

## Additional resources {#additional-resources-1}
- [HTTP Interface](https://clickhouse.com/docs/interfaces/http)
- [Azure Data Factory를 사용하여 REST 엔드포인트에서 데이터를 복사하고 변환하기](https://learn.microsoft.com/en-us/azure/data-factory/connector-rest?tabs=data-factory)
- [삽입 전략 선택](https://clickhouse.com/docs/best-practices/selecting-an-insert-strategy)
- [자체 호스팅 통합 런타임 생성 및 구성](https://learn.microsoft.com/en-us/azure/data-factory/create-self-hosted-integration-runtime?tabs=data-factory)
