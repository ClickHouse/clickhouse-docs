---
'sidebar_label': '당신의 첫 번째 객체 저장소 ClickPipe 생성'
'description': '당신의 객체 저장소를 ClickHouse Cloud에 원활하게 연결하세요.'
'slug': '/integrations/clickpipes/object-storage'
'title': '당신의 첫 번째 객체 저장소 ClickPipe 만들기'
'doc_type': 'guide'
'integration':
- 'support_level': 'core'
- 'category': 'clickpipes'
---

import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import cp_step1 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step1.png';
import cp_step2_object_storage from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step2_object_storage.png';
import cp_step3_object_storage from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step3_object_storage.png';
import cp_step4a from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a.png';
import cp_step4a3 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a3.png';
import cp_step4b from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4b.png';
import cp_step5 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step5.png';
import cp_success from '@site/static/images/integrations/data-ingestion/clickpipes/cp_success.png';
import cp_remove from '@site/static/images/integrations/data-ingestion/clickpipes/cp_remove.png';
import cp_destination from '@site/static/images/integrations/data-ingestion/clickpipes/cp_destination.png';
import cp_overview from '@site/static/images/integrations/data-ingestion/clickpipes/cp_overview.png';
import Image from '@theme/IdealImage';

Object Storage ClickPipes는 Amazon S3, Google Cloud Storage, Azure Blob Storage 및 DigitalOcean Spaces에서 ClickHouse Cloud로 데이터를 수집하는 간단하고 탄력적인 방법을 제공합니다. 일회성 및 지속적인 수집이 모두 정확히 한 번의 의미론으로 지원됩니다.


# 첫 번째 객체 저장소 ClickPipe 만들기 {#creating-your-first-clickpipe}

## 전제 조건 {#prerequisite}

- [ClickPipes 소개](../index.md)를 숙지했습니다.

## 데이터 소스 탐색 {#1-load-sql-console}

클라우드 콘솔에서 왼쪽 메뉴의 `Data Sources` 버튼을 선택하고 "ClickPipe 설정"을 클릭하세요.

<Image img={cp_step0} alt="임포트 선택" size="lg" border/>

## 데이터 소스 선택 {#2-select-data-source}

데이터 소스를 선택합니다.

<Image img={cp_step1} alt="데이터 소스 유형 선택" size="lg" border/>

## ClickPipe 구성 {#3-configure-clickpipe}

ClickPipe에 이름, 설명(선택 사항), IAM 역할 또는 자격 증명 및 버킷 URL을 제공하여 양식을 작성하세요. Bash 유사 와일드카드를 사용하여 여러 파일을 지정할 수 있습니다. 
자세한 내용은 [경로에서 와일드카드 사용에 대한 문서 보기](/integrations/clickpipes/object-storage/reference/#limitations)를 참조하세요.

<Image img={cp_step2_object_storage} alt="연결 세부 정보 입력" size="lg" border/>

## 데이터 형식 선택 {#4-select-format}

UI는 지정된 버킷의 파일 목록을 표시합니다. 데이터 형식을 선택하고(현재 ClickHouse 형식의 하위 집합을 지원함) 지속적인 수집을 활성화할지 여부를 선택하세요.
([아래에서 추가 세부정보](/integrations/clickpipes/object-storage/reference/#continuous-ingest)).

<Image img={cp_step3_object_storage} alt="데이터 형식 및 주제 설정" size="lg" border/>

## 테이블, 스키마 및 설정 구성 {#5-configure-table-schema-settings}

다음 단계에서 새로운 ClickHouse 테이블로 데이터를 수집할지 기존 테이블을 재사용할지를 선택할 수 있습니다. 화면의 지침에 따라 테이블 이름, 스키마 및 설정을 수정하세요. 샘플 테이블에서 변경 사항을 실시간으로 미리 볼 수 있습니다.

<Image img={cp_step4a} alt="테이블, 스키마 및 설정 설정" size="lg" border/>

제공된 컨트롤을 사용하여 고급 설정을 사용자화할 수도 있습니다.

<Image img={cp_step4a3} alt="고급 제어 설정" size="lg" border/>

또는 기존 ClickHouse 테이블에 데이터를 수집하기로 결정할 수 있습니다. 이 경우, UI는 소스의 필드를 선택된 대상 테이블의 ClickHouse 필드로 매핑할 수 있도록 합니다.

<Image img={cp_step4b} alt="기존 테이블 사용" size="lg" border/>

:::info
`_path` 또는 `_size`와 같은 [가상 컬럼](../../sql-reference/table-functions/s3#virtual-columns)을 필드로 매핑할 수도 있습니다.
:::

## 권한 구성 {#6-configure-permissions}

마지막으로 내부 ClickPipes 사용자에 대한 권한을 구성할 수 있습니다.

**권한:** ClickPipes는 대상 테이블에 데이터를 쓰기 위한 전담 사용자를 생성합니다. 이 내부 사용자에 대한 역할을 사용자 정의 역할 또는 미리 정의된 역할 중 하나로 선택할 수 있습니다:
- `Full access`: 클러스터에 대한 전체 액세스 권한. 대상 테이블에 물리화된 뷰 또는 딕셔너리를 사용하는 경우 필요합니다.
- `Only destination table`: 대상 테이블에 대해서만 `INSERT` 권한을 가집니다.

<Image img={cp_step5} alt="권한" size="lg" border/>

## 설정 완료 {#7-complete-setup}

"설정 완료"를 클릭하면 시스템이 ClickPipe를 등록하며, 요약 테이블에 등록된 내용을 확인할 수 있습니다.

<Image img={cp_success} alt="성공 알림" size="sm" border/>

<Image img={cp_remove} alt="제거 알림" size="lg" border/>

요약 테이블은 ClickHouse의 소스 또는 대상 테이블에서 샘플 데이터를 표시하기 위한 컨트롤을 제공합니다.

<Image img={cp_destination} alt="대상 보기" size="lg" border/>

또한 ClickPipe를 제거하고 수집 작업의 요약을 표시하는 컨트롤도 제공합니다.

<Image img={cp_overview} alt="개요 보기" size="lg" border/>

**축하합니다!** 첫 번째 ClickPipe를 성공적으로 설정했습니다.
이 ClickPipe가 스트리밍 ClickPipe인 경우, 원격 데이터 소스에서 실시간으로 데이터를 지속적으로 수집할 것입니다.
그렇지 않으면 배치를 수집하고 완료됩니다.
