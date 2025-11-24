---
'title': 'Postgres ClickPipe의 동기화 제어하기'
'description': 'Postgres ClickPipe의 동기화를 제어하는 문서'
'slug': '/integrations/clickpipes/postgres/sync_control'
'sidebar_label': '동기화 제어하기'
'keywords':
- 'sync control'
- 'postgres'
- 'clickpipes'
- 'batch size'
- 'sync interval'
'doc_type': 'guide'
---

import edit_sync_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/edit_sync_button.png'
import create_sync_settings from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/create_sync_settings.png'
import edit_sync_settings from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/sync_settings_edit.png'
import cdc_syncs from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/cdc_syncs.png'
import Image from '@theme/IdealImage';

This document describes how to control the sync of a Postgres ClickPipe when the ClickPipe is in **CDC (Running) mode**.

## Overview {#overview}

Database ClickPipes have an architecture that consists of two parallel processes - pulling from the source database and pushing to the target database. The pulling process is controlled by a sync configuration that defines how often the data should be pulled and how much data should be pulled at a time. By "at a time", we mean one batch - since the ClickPipe pulls and pushes data in batches.

There are two main ways to control the sync of a Postgres ClickPipe. The ClickPipe will start pushing when one of the below settings kicks in.

### Sync interval {#interval}

The sync interval of the pipe is the amount of time (in seconds) for which the ClickPipe will pull records from the source database. The time to push what we have to ClickHouse is not included in this interval.

The default is **1 minute**.  
Sync interval can be set to any positive integer value, but it is recommended to keep it above 10 seconds.

### Pull batch size {#batch-size}

The pull batch size is the number of records that the ClickPipe will pull from the source database in one batch. Records mean inserts, updates and deletes done on the tables that are part of the pipe.

The default is **100,000** records.  
A safe maximum is 10 million.

### An exception: Long-running transactions on source {#transactions}

When a transaction is run on the source database, the ClickPipe waits until it receives the COMMIT of the transaction before it moves forward. This with **overrides** both the sync interval and the pull batch size.

### Configuring sync settings {#configuring}

You can set the sync interval and pull batch size when you create a ClickPipe or edit an existing one.  
When creating a ClickPipe it will be seen in the second step of the creation wizard, as shown below:

<Image img={create_sync_settings} alt="Create sync settings" size="md"/>

When editing an existing ClickPipe, you can head over to the **Settings** tab of the pipe, pause the pipe and then click on **Configure** here:

<Image img={edit_sync_button} alt="Edit sync button" size="md"/>

This will open a flyout with the sync settings, where you can change the sync interval and pull batch size:

<Image img={edit_sync_settings} alt="Edit sync settings" size="md"/>

### Tweaking the sync settings to help with replication slot growth {#tweaking}

Let's talk about how to use these settings to handle a large replication slot of a CDC pipe.  
The pushing time to ClickHouse does not scale linearly with the pulling time from the source database. This can be leveraged to reduce the size of a large replication slot.  
By increasing both the sync interval and pull batch size, the ClickPipe will pull a whole lot of data from the source database in one go, and then push it to ClickHouse.

### Monitoring sync control behaviour {#monitoring}

You can see how long each batch takes in the **CDC Syncs** table in the **Metrics** tab of the ClickPipe. Note that the duration here includes push time and also if there are no rows incoming, the ClickPipe waits and the wait time is also included in the duration.

<Image img={cdc_syncs} alt="CDC Syncs table" size="md"/>  

---

이 문서에서는 ClickPipe가 **CDC (실행 중) 모드**에 있을 때 Postgres ClickPipe의 동기화를 제어하는 방법을 설명합니다.

## 개요 {#overview}

데이터베이스 ClickPipe는 소스 데이터베이스에서 데이터를 가져오고 대상 데이터베이스로 데이터를 전송하는 두 개의 병렬 프로세스로 구성된 아키텍처를 가지고 있습니다. 데이터 가져오기 프로세스는 데이터를 얼마나 자주 가져오고 한 번에 얼마만큼 가져올지를 정의하는 동기화 구성에 의해 제어됩니다. "한 번에"라는 것은 한 배치를 의미합니다. ClickPipe는 데이터를 배치 단위로 가져오고 전송합니다.

Postgres ClickPipe 동기를 제어하는 두 가지 주요 방법이 있습니다. ClickPipe는 아래 설정 중 하나가 활성화되면 전송을 시작합니다.

### 동기화 간격 {#interval}

파이프의 동기화 간격은 ClickPipe가 소스 데이터베이스에서 레코드를 가져오는 시간(초)입니다. ClickHouse로의 전송 시간을 이 간격에 포함되지 않습니다.

기본값은 **1분**입니다.  
동기화 간격은 양의 정수 값으로 설정할 수 있지만 10초 이상 유지하는 것이 권장됩니다.

### 가져오기 배치 크기 {#batch-size}

가져오기 배치 크기는 ClickPipe가 한 배치에서 소스 데이터베이스에서 가져올 레코드의 수입니다. 레코드는 파이프의 일부인 테이블에서 수행된 삽입, 업데이트 및 삭제를 의미합니다.

기본값은 **100,000** 레코드입니다.  
안전한 최대치는 1000만입니다.

### 예외: 소스에서의 장기 거래 {#transactions}

소스 데이터베이스에서 거래가 실행되면 ClickPipe는 거래의 COMMIT을 수신할 때까지 기다립니다. 이는 **동기화 간격**과 **가져오기 배치 크기**를 모두 무시합니다.

### 동기화 설정 구성 {#configuring}

ClickPipe를 생성하거나 기존 ClickPipe를 편집할 때 동기화 간격과 가져오기 배치 크기를 설정할 수 있습니다.  
ClickPipe를 생성할 때 이는 아래와 같이 생성 마법사의 두 번째 단계에서 볼 수 있습니다:

<Image img={create_sync_settings} alt="Create sync settings" size="md"/>

기존 ClickPipe를 편집할 때는 파이프의 **설정** 탭으로 이동하여 파이프를 일시 중지한 다음 **구성**을 클릭할 수 있습니다:

<Image img={edit_sync_button} alt="Edit sync button" size="md"/>

이렇게 하면 동기화 설정이 있는 플라이아웃이 열리며, 여기에서 동기화 간격과 가져오기 배치 크기를 변경할 수 있습니다:

<Image img={edit_sync_settings} alt="Edit sync settings" size="md"/>

### 복제 슬롯 증가를 돕기 위한 동기화 설정 조정 {#tweaking}

CDC 파이프의 큰 복제 슬롯을 처리하는 방법에 대해 이야기해 보겠습니다.  
ClickHouse로의 전송 시간은 소스 데이터베이스에서의 가져오기 시간과 선형적으로 비례하지 않습니다. 이는 큰 복제 슬롯의 크기를 줄이기 위해 활용될 수 있습니다.  
동기화 간격과 가져오기 배치 크기를 모두 늘리면 ClickPipe는 소스 데이터베이스에서 한 번에 많은 양의 데이터를 가져오고, 이를 ClickHouse로 전송합니다.

### 동기화 제어 동작 모니터링 {#monitoring}

ClickPipe의 **지표** 탭에 있는 **CDC Syncs** 테이블에서 각 배치가 소요되는 시간을 볼 수 있습니다. 여기서의 기간은 전송 시간을 포함하며, 수신할 레코드가 없을 경우 ClickPipe는 기다리고 그 대기 시간도 기간에 포함됩니다.

<Image img={cdc_syncs} alt="CDC Syncs table" size="md"/>
