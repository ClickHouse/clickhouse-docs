---
description: "대안적인 백업 또는 복원 방법에 대한 세부 정보"
sidebar_label: "대체 방법"
slug: /operations/backup/alternative_methods
title: "대안적인 백업 또는 복원 방법"
doc_type: "reference"
---

# 대체 백업 방법 \{#alternative-backup-methods\}

ClickHouse는 디스크에 데이터를 저장하며, 디스크를 백업하는 방법에는 여러 가지가 있습니다. 
다음은 과거에 사용되었으며, 특정 사용 사례에 적합할 수 있는 몇 가지 대안입니다.

### 다른 위치에 소스 데이터 복제하기 \{#duplicating-source-data-somewhere-else\}

종종 ClickHouse로 수집되는 데이터는 [Apache Kafka](https://kafka.apache.org)와 같은
일종의 지속성 큐를 통해 전달됩니다. 이 경우 ClickHouse에 데이터가 기록되는 동안
동일한 데이터 스트림을 함께 읽어 다른 위치의 콜드 스토리지에 저장하는 추가 구독자
그룹을 구성할 수 있습니다. 대부분의 회사에는 이미 객체 스토어나
[HDFS](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html)와 같은 분산 파일 시스템을 이용한 기본 권장 콜드 스토리지가 마련되어 있습니다.

### 파일시스템 스냅샷 \{#filesystem-snapshots\}

일부 로컬 파일시스템은 스냅샷 기능을 제공합니다(예: [ZFS](https://en.wikipedia.org/wiki/ZFS)). 
그러나 이러한 파일시스템은 실시간 쿼리를 처리하는 데 최선의 선택이 아닐 수 있습니다. 한 가지 가능한 해결 방법은
이러한 종류의 파일시스템을 사용하는 레플리카를 추가로 생성하고, 이를 `SELECT` 쿼리에 사용되는 
[Distributed](/engines/table-engines/special/distributed) 테이블에서 제외하는 것입니다. 
이러한 레플리카에서 생성된 스냅샷은 데이터를 변경하는 쿼리에서는 접근할 수 없습니다.
추가로, 이러한 레플리카는 서버당 더 많은 디스크가 연결된 특수 하드웨어 구성을 사용할 수 있어
비용 효율적일 수 있습니다.

데이터 양이 작은 경우에는, 원격 테이블로의 간단한 `INSERT INTO ... SELECT ...` 작업만으로도
충분할 수 있습니다.

### 파트 조작 \{#manipulations-with-parts\}

ClickHouse는 `ALTER TABLE ... FREEZE PARTITION ...` 쿼리를 사용하여
테이블 파티션의 로컬 복사본을 생성할 수 있습니다. 이는 `/var/lib/clickhouse/shadow/`
폴더에 대한 하드링크를 사용하여 구현되므로, 일반적으로 이전 데이터가 추가로 디스크 공간을 차지하지 않습니다.
생성된 파일 복사본은 ClickHouse 서버에서 처리하지 않으므로 그대로 두어도 됩니다.
이렇게 하면 추가적인 외부 시스템이 필요하지 않은 간단한 백업을 얻을 수 있지만,
여전히 하드웨어 문제에는 취약합니다. 이러한 이유로, 해당 파일을 원격지의 다른 위치로 복사한 뒤
로컬 복사본을 제거하는 것이 더 좋습니다.
이 작업에는 분산 파일 시스템과 오브젝트 스토리지를 사용하는 것이 여전히 좋은 선택이며,
충분히 큰 용량을 가진 일반적인 직접 연결형 파일 서버도 사용할 수 있습니다
(이 경우 전송은 네트워크 파일 시스템을 통해 이루어지거나, [rsync](https://en.wikipedia.org/wiki/Rsync)를 사용할 수 있습니다).
백업된 데이터는 `ALTER TABLE ... ATTACH PARTITION ...`을 사용하여 복원할 수 있습니다.

파티션 조작과 관련된 쿼리에 대한 자세한 내용은 
[`ALTER` 문서](/sql-reference/statements/alter/partition)를 참조하십시오.

이 접근 방식을 자동화하기 위한 서드 파티 도구가 제공됩니다: [clickhouse-backup](https://github.com/AlexAkulov/clickhouse-backup).