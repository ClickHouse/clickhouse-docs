---
title: 'Postgres ClickPipe 동기화 제어하기'
description: 'Postgres ClickPipe 동기화 제어 방법을 설명하는 문서입니다.'
slug: /integrations/clickpipes/postgres/sync_control
sidebar_label: '동기화 제어'
keywords: ['sync control', 'postgres', 'clickpipes', 'batch size', 'sync interval']
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import edit_sync_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/edit_sync_button.png'
import create_sync_settings from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/create_sync_settings.png'
import edit_sync_settings from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/sync_settings_edit.png'
import cdc_syncs from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/cdc_syncs.png'
import Image from '@theme/IdealImage';

이 문서는 ClickPipe가 **CDC (Running) 모드**로 동작할 때 Postgres ClickPipe의 동기화를 제어하는 방법을 설명합니다.


## 개요 \{#overview\}

Database ClickPipes는 소스 데이터베이스에서 데이터를 가져오는 프로세스와 대상 데이터베이스로 데이터를 푸시하는 프로세스로 이루어진 두 개의 병렬 프로세스로 구성된 아키텍처를 가집니다. 가져오기 프로세스는 데이터를 얼마나 자주 가져올지, 그리고 한 번에 얼마나 많은 데이터를 가져올지를 정의하는 동기화 구성(sync configuration)에 의해 제어됩니다. 여기서 「한 번에」라는 것은 하나의 배치를 의미합니다. ClickPipe가 데이터를 배치(batch) 단위로 가져오고 푸시하기 때문입니다.

Postgres ClickPipe의 동기화를 제어하는 주요 방법은 두 가지입니다. 아래 설정 중 하나가 충족되면 ClickPipe가 데이터를 푸시하기 시작합니다.

### 동기화 간격 \{#interval\}

파이프의 동기화 간격은 ClickPipe가 소스 데이터베이스에서 레코드를 가져오는 시간(초 단위)입니다. ClickHouse로 데이터를 푸시하는 데 걸리는 시간은 이 간격에 포함되지 않습니다.

기본값은 **1분**입니다.
동기화 간격은 0보다 큰 정수 값으로 설정할 수 있지만, 10초 이상으로 유지하는 것을 권장합니다.

### Pull batch size \{#batch-size\}

pull batch size는 ClickPipe가 한 번에 소스 데이터베이스에서 가져오는 레코드 수를 의미합니다. 레코드는 파이프에 포함된 테이블에서 수행된 insert, update, delete 작업을 의미합니다.

기본값은 **100,000** 레코드입니다.
안전한 최대값은 1,000만 레코드입니다.

### 예외: 소스에서 오래 실행되는 트랜잭션 \{#transactions\}

소스 데이터베이스에서 트랜잭션이 실행될 때 ClickPipe는 해당 트랜잭션의 COMMIT을 수신할 때까지 다음 단계로 진행하지 않고 대기합니다. 이 동작은 동기화 간격과 pull 배치 크기 설정을 모두 **무시합니다**.

### 동기화 설정 구성 \{#configuring\}

ClickPipe를 생성하거나 기존 ClickPipe를 편집할 때 동기화 간격(sync interval)과 pull 배치 크기를 설정할 수 있습니다.
새 ClickPipe를 생성할 때는 아래와 같이 생성 마법사의 두 번째 단계에서 해당 설정을 확인하고 구성할 수 있습니다:

<Image img={create_sync_settings} alt="동기화 설정 생성" size="md"/>

기존 ClickPipe를 편집할 때는 파이프의 **Settings** 탭으로 이동한 후 파이프를 일시 중지(pause)하고, **Configure**를 클릭합니다:

<Image img={edit_sync_button} alt="동기화 편집 버튼" size="md"/>

그러면 동기화 설정을 위한 플라이아웃이 열리고, 여기에서 동기화 간격과 pull 배치 크기를 변경할 수 있습니다:

<Image img={edit_sync_settings} alt="동기화 설정 편집" size="md"/>

### 복제 슬롯 증가에 대응하기 위한 동기화 설정 조정 \{#tweaking\}

CDC 파이프의 큰 복제 슬롯을 처리하기 위해 이러한 설정을 어떻게 사용하는지 살펴보겠습니다.
ClickHouse로 데이터를 전송하는 시간은 소스 데이터베이스에서 데이터를 가져오는 시간과 선형적으로 비례하지 않습니다. 이 점을 활용하면 큰 복제 슬롯의 크기를 줄일 수 있습니다.
동기화 간격과 pull 배치 크기를 모두 늘리면, ClickPipe가 소스 데이터베이스에서 매우 많은 양의 데이터를 한 번에 가져온 다음 ClickHouse로 전송하게 됩니다.

### 동기화 제어 동작 모니터링 \{#monitoring\}

각 배치에 소요되는 시간은 ClickPipe의 **Metrics** 탭에 있는 **CDC Syncs** 테이블에서 확인할 수 있습니다. 여기서 표시되는 소요 시간에는 푸시 시간뿐만 아니라, 들어오는 행이 없을 때 ClickPipe가 대기하는 시간도 포함됩니다.

<Image img={cdc_syncs} alt="CDC Syncs table" size="md"/>