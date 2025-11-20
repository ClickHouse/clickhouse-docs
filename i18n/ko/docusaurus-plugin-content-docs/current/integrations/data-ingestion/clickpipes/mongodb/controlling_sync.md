---
'title': 'MongoDB ClickPipe의 동기화 제어'
'description': 'MongoDB ClickPipe의 동기화를 제어하는 문서'
'slug': '/integrations/clickpipes/mongodb/sync_control'
'sidebar_label': '동기화 제어'
'doc_type': 'guide'
'keywords':
- 'clickpipes'
- 'mongodb'
- 'cdc'
- 'data ingestion'
- 'real-time sync'
---

import edit_sync_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/edit_sync_button.png'
import create_sync_settings from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/create_sync_settings.png'
import edit_sync_settings from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/sync_settings_edit.png'
import cdc_syncs from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/cdc_syncs.png'
import Image from '@theme/IdealImage';

이 문서는 ClickPipe가 **CDC (실행 중) 모드**에 있을 때 MongoDB ClickPipe의 동기화를 제어하는 방법을 설명합니다.

## 개요 {#overview}

데이터베이스 ClickPipe는 출처 데이터베이스에서 데이터를 풀어오는 과정과 대상 데이터베이스에 데이터를 푸쉬하는 두 개의 병렬 프로세스로 구성된 아키텍처를 가지고 있습니다. 풀링 프로세스는 데이터를 얼마나 자주 가져오고 한 번에 얼마나 많은 데이터를 가져올지를 정의하는 동기화 구성에 의해 제어됩니다. "한 번에"라는 것은 하나의 배치를 의미하며, ClickPipe는 배치 단위로 데이터를 풀고 푸쉬합니다.

MongoDB ClickPipe의 동기화를 제어하는 두 가지 주요 방법이 있습니다. ClickPipe는 아래 설정 중 하나가 활성화될 때 푸쉬를 시작합니다.

### 동기화 간격 {#interval}

파이프의 동기화 간격은 ClickPipe가 출처 데이터베이스에서 레코드를 풀어오는 시간(초 단위)입니다. ClickHouse에 푸쉬하는 데 걸리는 시간은 이 간격에 포함되지 않습니다.

기본값은 **1분**입니다.
동기화 간격은 양의 정수 값으로 설정할 수 있지만, 10초 이상으로 유지하는 것이 좋습니다.

### 풀 배치 크기 {#batch-size}

풀 배치 크기는 ClickPipe가 한 배치에서 출처 데이터베이스에서 풀어오는 레코드 수입니다. 레코드는 파이프의 일부인 컬렉션에서 수행된 삽입, 업데이트 및 삭제를 의미합니다.

기본값은 **100,000** 레코드입니다.
안전한 최대치는 1,000만입니다.

### 동기화 설정 구성 {#configuring}

ClickPipe를 생성할 때 또는 기존 ClickPipe를 편집할 때 동기화 간격과 풀 배치 크기를 설정할 수 있습니다.
ClickPipe를 생성할 때 아래와 같이 생성 마법사의 두 번째 단계에서 확인할 수 있습니다.

<Image img={create_sync_settings} alt="동기화 설정 생성" size="md"/>

기존 ClickPipe를 편집할 때는 파이프의 **설정** 탭으로 이동하여 파이프를 중지한 후 여기서 **구성**을 클릭합니다:

<Image img={edit_sync_button} alt="동기화 버튼 편집" size="md"/>

이렇게 하면 동기화 설정이 있는 사이드 팝업이 열리며 여기서 동기화 간격과 풀 배치 크기를 변경할 수 있습니다:

<Image img={edit_sync_settings} alt="동기화 설정 편집" size="md"/>

### 동기화 제어 동작 모니터링 {#monitoring}

ClickPipe의 **지표** 탭에 있는 **CDC Syncs** 테이블에서 각 배치가 소요되는 시간을 확인할 수 있습니다. 여기서 지속 시간은 푸쉬 시간을 포함하며, Incoming 행이 없을 경우 ClickPipe는 대기하고 대기 시간도 지속 시간에 포함됩니다.

<Image img={cdc_syncs} alt="CDC Syncs 테이블" size="md"/>
