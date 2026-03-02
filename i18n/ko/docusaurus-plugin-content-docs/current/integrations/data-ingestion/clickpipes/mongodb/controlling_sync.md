---
title: 'MongoDB ClickPipe 동기화 제어'
description: 'MongoDB ClickPipe 동기화를 제어하는 방법을 설명하는 문서'
slug: /integrations/clickpipes/mongodb/sync_control
sidebar_label: '동기화 제어'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', '데이터 수집', '실시간 동기화']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import edit_sync_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/edit_sync_button.png'
import create_sync_settings from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/create_sync_settings.png'
import edit_sync_settings from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/sync_settings_edit.png'
import cdc_syncs from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/cdc_syncs.png'
import Image from '@theme/IdealImage';

이 문서는 ClickPipe가 **CDC (Running) mode** 상태일 때 MongoDB ClickPipe의 동기화 동작을 제어하는 방법을 설명합니다.


## 개요 \{#overview\}

Database ClickPipes는 소스 데이터베이스에서 데이터를 가져오는 프로세스와 타깃 데이터베이스로 데이터를 푸시하는 프로세스, 이렇게 두 개의 병렬 프로세스로 이루어진 아키텍처로 구성됩니다. 가져오기 프로세스는 데이터를 얼마나 자주 가져올지와 한 번에 얼마나 많은 데이터를 가져올지를 정의하는 동기화 구성에 의해 제어됩니다. 여기서 「한 번에」라는 의미는 하나의 배치를 뜻합니다. ClickPipe가 데이터를 배치 단위로 가져오고 푸시하기 때문입니다.

MongoDB ClickPipe의 동기화를 제어하는 주요 방식은 두 가지가 있습니다. 아래의 설정 중 하나가 조건을 충족하면 ClickPipe가 데이터 푸시를 시작합니다.

### 동기화 간격 \{#interval\}

파이프의 동기화 간격은 ClickPipe가 소스 데이터베이스에서 레코드를 가져오는 시간(초 단위)을 의미합니다. ClickHouse로 수집된 데이터를 푸시하는 데 걸리는 시간은 이 간격에 포함되지 않습니다.

기본값은 **1분**입니다.
동기화 간격은 임의의 양의 정수 값으로 설정할 수 있지만, 10초 이상으로 유지하는 것이 좋습니다.

### Pull batch size \{#batch-size\}

Pull batch size는 ClickPipe가 한 번에 소스 데이터베이스에서 가져오는 레코드 수를 의미합니다. 여기서 레코드는 파이프에 포함된 컬렉션에서 수행된 insert, update, delete 작업을 뜻합니다.

기본값은 **100,000** 레코드입니다.
안전한 최대값은 1,000만입니다.

### 동기화 설정 구성 \{#configuring\}

ClickPipe를 새로 생성하거나 기존 ClickPipe를 편집할 때 동기화 간격(sync interval)과 pull batch 크기(pull batch size)를 설정할 수 있습니다.
ClickPipe를 생성할 때는 아래와 같이 생성 마법사의 두 번째 단계에서 설정할 수 있습니다.

<Image img={create_sync_settings} alt="동기화 설정 생성" size="md"/>

기존 ClickPipe를 편집할 때는 해당 파이프의 **Settings** 탭으로 이동한 후 파이프를 일시 중지하고, 여기에서 **Configure**를 클릭합니다.

<Image img={edit_sync_button} alt="동기화 편집 버튼" size="md"/>

그러면 동기화 설정이 표시된 플라이아웃 패널이 열리며, 여기에서 동기화 간격과 pull batch 크기를 변경할 수 있습니다.

<Image img={edit_sync_settings} alt="동기화 설정 편집" size="md"/>

### 동기화 제어 동작 모니터링 \{#monitoring\}

각 배치 처리에 소요되는 시간은 ClickPipe의 **Metrics** 탭에 있는 **CDC Syncs** 테이블에서 확인할 수 있습니다. 여기에서 표시되는 소요 시간에는 데이터 푸시 시간뿐만 아니라, 수신되는 행이 없을 때 ClickPipe가 대기하는 시간도 포함됩니다.

<Image img={cdc_syncs} alt="CDC Syncs table" size="md"/>