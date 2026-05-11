---
sidebar_label: '시작하기'
description: '첫 번째 Azure Blob Storage (ABS) ClickPipe를 만드는 단계별 가이드입니다.'
slug: /integrations/clickpipes/object-storage/azure-blob-storage/get-started
sidebar_position: 1
title: '첫 번째 Azure Blob Storage ClickPipe 만들기'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import navigateToDatasources from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/azure-blob-storage/01-navigate-to-datasources.png'
import createClickpipe from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/azure-blob-storage/02-create-clickpipe.png'
import selectBlobStorage from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/azure-blob-storage/03-select-blob-storage.png'
import configurationDetails from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/azure-blob-storage/04-configuration-details.png'
import chooseDataFormat from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/azure-blob-storage/05-choose-data-format.png'
import parseInformation from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/azure-blob-storage/06-parse-information.png'
import permissions from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/azure-blob-storage/07-permissions.png'

**사전 준비 사항**

이 가이드를 따라 하려면 다음이 필요합니다:

* Azure Blob Storage 계정
* [Azure 연결 문자열](/integrations/azure-data-factory/table-function#acquiring-azure-blob-storage-access-keys)
* 컨테이너 이름
* 실행 중인 ClickHouse Cloud 서비스

<VerticalStepper headerLevel="h2">
  ## 데이터 소스로 이동 \{#navigate-to-data-sources\}

  서비스 홈 페이지에서 왼쪽 메뉴의 **Data sources**를 클릭합니다.
  **ClickPipes** 드롭다운을 확장한 후 **Create ClickPipe**를 클릭합니다.

  <Image img={navigateToDatasources} alt="데이터 소스로 이동" size="md" />

  <Image img={createClickpipe} alt="ClickPipe 생성" size="md" />

  ## 데이터 소스 선택 \{#select-data-source\}

  데이터 유형으로 **Azure Blob Storage**를 선택합니다.

  <Image img={selectBlobStorage} alt="Azure Blob Storage 선택" size="md" />

  ## ClickPipe 연결 설정 \{#setup-connection\}

  1. ClickPipe에 알아보기 쉬운 이름을 지정합니다.
  2. 인증 방식 드롭다운에서 **Connection String**을 선택합니다.
  3. **Connection string** 입력란에 Azure 연결 문자열을 붙여넣습니다.
  4. 컨테이너 이름을 입력합니다.
  5. 여러 파일을 수집하려는 경우 와일드카드를 사용하여 Azure Blob Storage 파일 경로를 입력합니다.

  필요에 따라 지속적 수집을 활성화할 수 있습니다. 자세한 내용은 [“Continuous Ingestion”](/integrations/clickpipes/object-storage/abs/overview#continuous-ingestion) 및 「Continuous Ingestion」(/integrations/clickpipes/object-storage/abs/overview#continuous-ingestion)을 참조하십시오.

  마지막으로 **Incoming data**를 클릭합니다.

  <Image img={configurationDetails} alt="구성 세부 정보" size="md" />

  ## 데이터 포맷 선택 \{#select-data-format\}

  1. 파일 유형을 선택합니다.
  2. 파일 압축을 선택합니다 (`detect automatically`, `none`, `gzip`, `brotli`, `xz` 또는 `zstd`).
  3. 쉼표로 구분된 포맷에 사용되는 구분 기호와 같이 포맷별 추가 구성을 완료합니다.
  4. **Parse information**을 클릭합니다.

  <Image img={chooseDataFormat} alt="데이터 포맷 선택" size="md" />

  ## 테이블, 스키마 및 설정 구성 \{#configure-table-schema\}

  이제 수신 데이터를 저장할 새 테이블을 생성하거나 기존 테이블을 선택해야 합니다.

  1. 새 테이블에 데이터를 업로드할지, 기존 테이블을 사용할지 선택합니다.
  2. 사용할 데이터베이스를 선택하고, 새 테이블인 경우 테이블에 부여할 이름을 지정합니다.
  3. 정렬 키를 하나 이상 선택합니다.
  4. 소스 파일에서 대상 테이블로 컬럼 이름, 컬럼 타입, 기본값, NULL 허용 여부에 대한 매핑을 정의합니다.
  5. 마지막으로 사용하려는 엔진 타입, 파티션 표현식, 기본 키 등 고급 설정을 지정합니다.

  <Image img={parseInformation} alt="정보 파싱" size="md" />

  테이블, 스키마 및 설정 구성을 마쳤으면 **Details and settings**를 클릭합니다.

  ## 권한 구성 \{#configure-permissions\}

  ClickPipes는 데이터 기록을 위한 전용 데이터베이스 사용자를 설정합니다.
  이 사용자에 대한 역할을 선택할 수 있습니다.
  대상 테이블에서 materialized view 또는 딕셔너리 액세스가 필요한 경우 「Full access」를 선택하십시오.

  <Image img={permissions} alt="권한 구성" size="md" />

  ## 설정 완료 \{#complete-setup\}

  설정을 완료하려면 **Create ClickPipe**를 클릭합니다.

  이제 ClickPipe가 provisioning 상태로 표시됩니다.
  잠시 후 상태가 **provisioning**에서 **completed**로 변경됩니다.
</VerticalStepper>
