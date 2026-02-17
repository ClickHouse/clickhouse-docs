---
title: 'MySQL ClickPipe 동기화 제어'
description: 'MySQL ClickPipe의 동기화를 제어하는 방법을 설명하는 문서'
slug: /integrations/clickpipes/mysql/sync_control
sidebar_label: '동기화 제어'
keywords: ['MySQL ClickPipe', 'ClickPipe 동기화 제어', 'MySQL CDC 복제', 'ClickHouse MySQL 커넥터', 'ClickHouse 데이터베이스 동기화']
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

이 문서는 ClickPipe가 **CDC (Running) 모드**로 실행 중일 때 MySQL ClickPipe 동기화를 제어하는 방법을 설명합니다.


## 개요 \{#overview\}

Database ClickPipes는 소스 데이터베이스에서 데이터를 끌어오는(pull) 프로세스와 대상 데이터베이스로 데이터를 밀어 넣는(push) 프로세스로 이루어진, 두 개의 병렬 프로세스 아키텍처를 사용합니다. 끌어오는 프로세스는 동기화 구성(sync configuration)에 의해 제어되며, 이 구성에서는 데이터를 얼마나 자주 끌어올지와 한 번에 얼마나 많은 데이터를 끌어올지를 정의합니다. 여기서 "한 번에"란 하나의 배치를 의미합니다. 이는 ClickPipe가 데이터를 배치 단위로 pull 및 push하기 때문입니다.

MySQL ClickPipe의 동기화를 제어하는 두 가지 주요 방법이 있습니다. 아래 설정 중 하나가 적용되면 ClickPipe가 데이터를 push하기 시작합니다.

### 동기화 간격 \{#interval\}

파이프의 동기화 간격은 ClickPipe가 소스 데이터베이스에서 레코드를 가져오는 시간(초)을 의미합니다. ClickHouse로 데이터를 푸시하는 데 걸리는 시간은 이 간격에 포함되지 않습니다.

기본값은 **1분**입니다.
동기화 간격은 양의 정수 값이라면 어떤 값으로든 설정할 수 있으나, 10초 이상으로 유지할 것을 권장합니다.

### 풀 배치 크기 \{#batch-size\}

풀 배치 크기는 ClickPipe가 한 번에 소스 데이터베이스에서 가져오는 레코드 수를 의미합니다. 여기서 레코드는 파이프에 포함된 테이블에서 수행된 삽입(insert), 업데이트(update), 삭제(delete) 작업을 의미합니다.

기본값은 **100,000**개의 레코드입니다.
안전한 최대값은 1,000만 개입니다.

### 예외: 소스에서 장시간 실행되는 트랜잭션 \{#transactions\}

소스 데이터베이스에서 트랜잭션이 실행되면 ClickPipe는 해당 트랜잭션의 COMMIT을 수신할 때까지 대기한 후에야 다음 단계로 진행합니다. 이 동작은 동기화 간격(sync interval)과 pull 배치 크기(pull batch size) 설정을 **모두 우선 적용하여(override)** 무시합니다.

### 동기화 설정 구성 \{#configuring\}

ClickPipe를 생성하거나 기존 ClickPipe를 편집할 때 동기화 간격(sync interval)과 pull 배치 크기를 설정할 수 있습니다.
ClickPipe를 생성할 때는 아래와 같이 생성 마법사의 두 번째 단계에서 해당 설정을 구성할 수 있습니다:

<Image img={create_sync_settings} alt="Create sync settings" size="md"/>

기존 ClickPipe를 편집할 때는 파이프의 **Settings** 탭으로 이동한 뒤, 파이프를 일시 중지한 다음 여기에서 **Configure**를 클릭합니다:

<Image img={edit_sync_button} alt="Edit sync button" size="md"/>

그러면 동기화 설정을 위한 플라이아웃이 열리며, 여기에서 동기화 간격과 pull 배치 크기를 변경할 수 있습니다:

<Image img={edit_sync_settings} alt="Edit sync settings" size="md"/>

### 동기화 제어 동작 모니터링 \{#monitoring\}

각 배치에 걸리는 시간은 ClickPipe의 **Metrics** 탭에 있는 **CDC Syncs** 테이블에서 확인할 수 있습니다. 이때 표시되는 시간에는 데이터 푸시에 소요되는 시간뿐만 아니라, 들어오는 행이 없을 경우 ClickPipe가 대기하는 시간도 포함됩니다.

<Image img={cdc_syncs} alt="CDC Syncs 테이블" size="md"/>