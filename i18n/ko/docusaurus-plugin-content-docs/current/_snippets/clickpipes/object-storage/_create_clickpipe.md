import Image from '@theme/IdealImage';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import cp_step2 from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/amazon-s3/cp_step2.png';
import cp_step3_object_storage from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step3_object_storage.png';
import cp_step4a from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a.png';
import cp_step4a3 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a3.png';
import cp_step4b from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4b.png';
import cp_step5 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step5.png';
import cp_success from '@site/static/images/integrations/data-ingestion/clickpipes/cp_success.png';
import cp_remove from '@site/static/images/integrations/data-ingestion/clickpipes/cp_remove.png';
import cp_destination from '@site/static/images/integrations/data-ingestion/clickpipes/cp_destination.png';
import cp_overview from '@site/static/images/integrations/data-ingestion/clickpipes/cp_overview.png';

import S3DataSource from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/clickpipes/object-storage/amazon-s3/_1-data-source.md';
import GCSSDataSource from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/clickpipes/object-storage/google-cloud-storage/_1-data-source.md';
import ABSDataSource from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/clickpipes/object-storage/azure-blob-storage/_1-data-source.md';

import S3Connection from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/clickpipes/object-storage/amazon-s3/_2-connection.md';
import GCSConnection from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/clickpipes/object-storage/google-cloud-storage/_2-connection.md';

<VerticalStepper type="numbered" headerLevel="h2">

## 데이터 소스 선택 \{#1-select-the-data-source\}

**1.** ClickHouse Cloud의 기본 내비게이션 메뉴에서 **Data sources**를 선택한 후 **Create ClickPipe**를 클릭합니다.

    <Image img={cp_step0} alt="가져오기 선택" size="lg" border/>

{props.provider === 's3' && <S3DataSource />}
{props.provider === 'gcs' && <GCSSDataSource />}

## ClickPipe 연결 설정 \{#2-setup-your-clickpipe-connection\}

**1.** 새 ClickPipe를 설정하려면 객체 스토리지 서비스에 연결하고 인증하는 방법에 대한 세부 정보를 제공해야 합니다.

{props.provider === 's3' && <S3Connection />}
{props.provider === 'gcs' && <GCSConnection />}

**2.** **Incoming data**를 클릭합니다. ClickPipes는 다음 단계를 위해 버킷에서 메타데이터를 가져옵니다.

## 데이터 형식 선택 \{#3-select-data-format\}

UI에 지정한 버킷의 파일 목록이 표시됩니다.
지원되는 데이터 형식(현재 일부 ClickHouse 형식만 지원)을 선택하고, 연속 수집을 활성화할지 여부를 설정합니다.
자세한 내용은 개요 페이지의 「continuous ingest」 섹션을 참조하십시오.

<Image img={cp_step3_object_storage} alt="데이터 형식과 토픽 설정" size="lg" border/>

## 테이블, 스키마 및 설정 구성 \{#5-configure-table-schema-settings\}

다음 단계에서는 데이터를 새 ClickHouse 테이블로 수집할지, 기존 테이블을 재사용할지 선택할 수 있습니다.
화면의 안내에 따라 테이블 이름, 스키마 및 설정을 수정하십시오.
상단의 샘플 테이블에서 변경 사항을 실시간으로 미리 볼 수 있습니다.

<Image img={cp_step4a} alt="테이블, 스키마 및 설정 구성" size="lg" border/>

제공된 컨트롤을 사용하여 고급 설정을 사용자 정의할 수도 있습니다.

<Image img={cp_step4a3} alt="고급 컨트롤 설정" size="lg" border/>

또는 기존 ClickHouse 테이블에 데이터를 수집하도록 선택할 수도 있습니다.
이 경우 UI에서 소스 필드를 선택한 대상 테이블의 ClickHouse 필드에 매핑할 수 있습니다.

<Image img={cp_step4b} alt="기존 테이블 사용" size="lg" border/>

:::info
또한 `_path`나 `_size`와 같은 [virtual columns](/sql-reference/table-functions/s3#virtual-columns)을 필드에 매핑할 수도 있습니다.
:::

## 권한 구성 \{#6-configure-permissions\}

마지막으로, 내부 ClickPipes 사용자에 대한 권한을 구성할 수 있습니다.

**Permissions:** ClickPipes는 대상 테이블에 데이터를 기록하기 위한 전용 사용자를 생성합니다. 이 내부 사용자에 대해 사용자 정의 역할 또는 사전 정의된 역할 중 하나를 사용하여 역할을 선택할 수 있습니다:
- `Full access`: 클러스터에 대한 전체 액세스 권한을 가집니다. 대상 테이블에서 구체화된 뷰(Materialized View) 또는 Dictionary를 사용하는 경우 필요합니다.
- `Only destination table`: 대상 테이블에만 `INSERT` 권한을 가집니다.

<Image img={cp_step5} alt="권한" size="lg" border/>

## 설정 완료 \{#7-complete-setup\}

"Complete Setup"을 클릭하면 시스템이 ClickPipe를 등록하고, 요약 테이블에 해당 ClickPipe가 표시됩니다.

<Image img={cp_success} alt="성공 알림" size="sm" border/>

<Image img={cp_remove} alt="제거 알림" size="lg" border/>

요약 테이블에서는 ClickHouse의 소스 또는 대상 테이블에서 샘플 데이터를 표시할 수 있습니다.

<Image img={cp_destination} alt="대상 보기" size="lg" border/>

또한 ClickPipe를 제거하고 수집 작업 요약을 표시할 수 있습니다.

<Image img={cp_overview} alt="개요 보기" size="lg" border/>

**축하합니다!** 첫 번째 ClickPipe 설정을 성공적으로 완료했습니다.
이 ClickPipe가 연속 수집을 위해 구성된 경우, 원격 데이터 소스에서 실시간으로 데이터를 지속적으로 수집합니다.
그렇지 않은 경우, 배치 수집을 완료한 후 작업이 종료됩니다.

</VerticalStepper>