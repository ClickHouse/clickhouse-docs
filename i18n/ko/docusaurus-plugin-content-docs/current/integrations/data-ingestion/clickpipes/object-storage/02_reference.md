---
'sidebar_label': '참고'
'description': '지원되는 형식, 정확히 한 번의 의미론, 뷰 지원, 확장성, 제한 사항, 객체 저장소 ClickPipes와의 인증에 대한
  세부 정보'
'slug': '/integrations/clickpipes/object-storage/reference'
'sidebar_position': 1
'title': '참고'
'doc_type': 'reference'
'integration':
- 'support_level': 'core'
- 'category': 'clickpipes'
'keywords':
- 'clickpipes'
- 'object storage'
- 's3'
- 'data ingestion'
- 'batch loading'
---

import S3svg from '@site/static/images/integrations/logos/amazon_s3_logo.svg';
import Gcssvg from '@site/static/images/integrations/logos/gcs.svg';
import DOsvg from '@site/static/images/integrations/logos/digitalocean.svg';
import ABSsvg from '@site/static/images/integrations/logos/azureblobstorage.svg';
import Image from '@theme/IdealImage';

## 지원되는 데이터 소스 {#supported-data-sources}

| 이름                 | 로고 | 유형          | 상태            | 설명                                                                                                |
|----------------------|------|--------------|-----------------|------------------------------------------------------------------------------------------------------|
| Amazon S3            |<S3svg class="image" alt="Amazon S3 로고" style={{width: '3rem', height: 'auto'}}/>|객체 저장소| 안정적         | ClickPipes를 구성하여 객체 저장소에서 대량의 데이터를 수집합니다.                                   |
| Google Cloud Storage |<Gcssvg class="image" alt="Google Cloud Storage 로고" style={{width: '3rem', height: 'auto'}}/>|객체 저장소| 안정적         | ClickPipes를 구성하여 객체 저장소에서 대량의 데이터를 수집합니다.                                   |
| DigitalOcean Spaces | <DOsvg class="image" alt="디지털 오션 로고" style={{width: '3rem', height: 'auto'}}/> | 객체 저장소 | 안정적 | ClickPipes를 구성하여 객체 저장소에서 대량의 데이터를 수집합니다.                                      |
| Azure Blob Storage | <ABSsvg class="image" alt="Azure Blob Storage 로고" style={{width: '3rem', height: 'auto'}}/> | 객체 저장소 | 안정적 | ClickPipes를 구성하여 객체 저장소에서 대량의 데이터를 수집합니다.                                      |

ClickPipes에 대한 더 많은 커넥터가 추가될 예정입니다. [문의하기](https://clickhouse.com/company/contact?loc=clickpipes)를 통해 더 알아보실 수 있습니다.

## 지원되는 데이터 형식 {#supported-data-formats}

지원되는 형식은 다음과 같습니다:
- [JSON](/interfaces/formats/JSON)
- [CSV](/interfaces/formats/CSV)
- [Parquet](/interfaces/formats/Parquet)
- [Avro](/interfaces/formats/Avro)

## Exactly-once 시맨틱 {#exactly-once-semantics}

대량의 데이터 세트를 수집할 때 여러 가지 유형의 실패가 발생할 수 있으며, 이로 인해 부분 삽입이나 중복 데이터가 발생할 수 있습니다. 객체 저장소 ClickPipes는 삽입 실패에 강하고 exactly-once 시맨틱을 제공합니다. 이는 임시 "스테이징" 테이블을 사용하여 달성됩니다. 데이터는 먼저 스테이징 테이블에 삽입됩니다. 이 삽입 중 문제가 발생하면 스테이징 테이블을 잘라내고 깨끗한 상태에서 삽입을 재시도할 수 있습니다. 삽입이 완료되고 성공적일 때만 스테이징 테이블의 파티션이 대상 테이블로 이동됩니다. 이 전략에 대한 더 많은 정보를 보려면 [이 블로그 게시물](https://clickhouse.com/blog/supercharge-your-clickhouse-data-loads-part3)을 확인하세요.

### 뷰 지원 {#view-support}
대상 테이블에 대한 물리화된 뷰도 지원됩니다. ClickPipes는 대상 테이블 뿐만 아니라 모든 의존 물리화된 뷰에 대해 스테이징 테이블을 생성할 것입니다.

비물리화된 뷰에 대한 스테이징 테이블은 생성하지 않습니다. 이는 대상 테이블에 하나 이상의 하류 물리화된 뷰가 있는 경우, 해당 물리화된 뷰는 대상 테이블의 뷰를 통해 데이터를 선택하지 않도록 해야 함을 의미합니다. 그렇지 않으면 물리화된 뷰에서 데이터가 누락되는 것을 발견할 수 있습니다.

## 스케일링 {#scaling}

객체 저장소 ClickPipes는 [구성된 수직 자동 스케일링 설정](/manage/scaling#configuring-vertical-auto-scaling)에 의해 결정된 최소 ClickHouse 서비스 크기를 기반으로 확장됩니다. ClickPipe의 크기는 파이프가 생성될 때 결정됩니다. ClickHouse 서비스 설정의 후속 변경은 ClickPipe 크기에 영향을 미치지 않습니다.

대량의 삽입 작업에서 처리량을 늘리려면 ClickPipe를 생성하기 전에 ClickHouse 서비스를 확장하는 것이 좋습니다.

## 제한 사항 {#limitations}
- 대상 테이블, 그 물리화된 뷰(캐스케이딩 물리화된 뷰 포함), 또는 물리화된 뷰의 대상 테이블에 대한 변경은 임시 오류를 초래할 수 있으며, 이는 재시도됩니다. 최상의 결과를 위해서는 파이프를 중지하고, 필요한 수정을 한 다음, 변경 사항이 수집되고 오류를 방지하기 위해 파이프를 다시 시작하는 것을 권장합니다.
- 지원되는 뷰의 유형에 대한 제한이 있습니다. 더 많은 정보를 얻으려면 [exactly-once 시맨틱](#exactly-once-semantics) 및 [뷰 지원](#view-support) 섹션을 읽어보세요.
- S3 ClickPipes의 역할 인증은 GCP 또는 Azure에 배포된 ClickHouse Cloud 인스턴스에서는 사용할 수 없습니다. AWS ClickHouse Cloud 인스턴스에서만 지원합니다.
- ClickPipes는 크기가 10GB 이하인 객체만 삽입을 시도합니다. 파일 크기가 10GB를 초과하면 클릭파이프 전용 오류 테이블에 오류가 추가됩니다.
- 100,000개 이상의 파일이 있는 컨테이너에서 계속 삽입을 하는 Azure Blob Storage 파이프는 새로운 파일을 탐지하는 데 약 10-15초의 지연이 발생합니다. 파일 수가 증가하면 지연이 증가합니다.
- 객체 저장소 ClickPipes는 [S3 테이블 함수](/sql-reference/table-functions/s3) 또는 Azure의 [AzureBlobStorage 테이블 함수](/sql-reference/table-functions/azureBlobStorage)와 목록 구문을 **공유하지 않습니다**.
  - `?` - 임의의 단일 문자를 대체
  - `*` - 비어 있는 문자열을 포함하여 임의의 문자 수를 대체
  - `**` - 비어 있는 문자열을 포함하여 임의의 문자 수를 대체

:::note
이것은 유효한 경로입니다 (S3):

https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/**.ndjson.gz

이는 유효하지 않은 경로입니다. `{N..M}`는 ClickPipes에서 지원되지 않습니다.

https://datasets-documentation.s3.eu-west-3.amazonaws.com/http/{documents-01,documents-02}.ndjson.gz
:::

## 지속적 수집 {#continuous-ingest}
ClickPipes는 S3, GCS, Azure Blob Storage 및 DigitalOcean Spaces에서 지속적 수집을 지원합니다. 활성화되면 ClickPipes는 지정된 경로에서 데이터를 지속적으로 수집하며, 30초마다 새로운 파일을 폴링합니다. 그러나 새로운 파일은 마지막으로 수집된 파일보다 lexically 커야 합니다. 이는 수집 순서를 정의하는 방식으로 이름이 지정되어야 함을 의미합니다. 예를 들어, `file1`, `file2`, `file3` 등으로 이름이 지정된 파일이 순차적으로 수집됩니다. `file0`이라는 이름의 새로운 파일이 추가되면 ClickPipes는 마지막으로 수집된 파일보다 lexically 크지 않기 때문에 이를 수집하지 않습니다.

## 수집된 파일 추적하기 {#tracking-ingested-files}

어떤 파일이 수집되었는지 추적하려면 필드 매핑에 `_file` [가상 컬럼](/sql-reference/table-functions/s3#virtual-columns)을 포함하세요. `_file` 가상 컬럼에는 소스 객체의 파일 이름이 포함되어 있어, 어떤 파일이 처리되었는지 쿼리하고 식별하는 것이 쉽습니다.

## 인증 {#authentication}

### S3 {#s3}
공개 액세스가 가능한 S3 버킷과 보호된 S3 버킷 모두 지원됩니다.

공개 버킷은 정책에서 `s3:GetObject`와 `s3:ListBucket` 두 가지 작업을 허용해야 합니다.

보호된 버킷은 [IAM 자격 증명](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) 또는 [IAM 역할](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)을 사용하여 액세스할 수 있습니다.
IAM 역할을 사용하려면 [이 가이드](/cloud/data-sources/secure-s3)에 명시된 대로 IAM 역할을 생성해야 합니다. 생성 후 새 IAM 역할의 Arn을 복사하여 "IAM ARN role"로 ClickPipe 구성에 붙여 넣습니다.

### GCS {#gcs}
S3와 마찬가지로 구성 없이 공개 버킷에 액세스할 수 있으며, 보호된 버킷의 경우 AWS IAM 자격 증명 대신 [HMAC 키](https://cloud.google.com/storage/docs/authentication/managing-hmackeys)를 사용할 수 있습니다. 이러한 키를 설정하는 방법에 대한 [구글 클라우드 가이드](https://cloud.google.com/storage/docs/authentication/hmackeys)를 읽어보십시오.

GCS의 서비스 계정은 직접 지원되지 않습니다. 비공식 버킷에서는 HMAC (IAM) 자격 증명을 사용하여 인증해야 하며, HMAC 자격 증명에 연결된 서비스 계정 권한은 `storage.objects.list` 및 `storage.objects.get`이어야 합니다.

### DigitalOcean Spaces {#dospaces}
현재 DigitalOcean Spaces에서는 보호된 버킷만 지원합니다. 버킷 및 그 파일에 액세스하려면 "액세스 키"와 "비밀 키"가 필요합니다. 액세스 키를 생성하는 방법에 대해서는 [이 가이드](https://docs.digitalocean.com/products/spaces/how-to/manage-access/)를 읽어보세요.

### Azure Blob Storage {#azureblobstorage}
현재 Azure Blob Storage에서는 보호된 버킷만 지원됩니다. 인증은 연결 문자열을 통해 이루어지며, 액세스 키와 공유 키를 지원합니다. 더 많은 정보는 [이 가이드](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string)를 읽으세요.
