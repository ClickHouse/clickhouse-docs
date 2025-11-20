---
'description': '대체 백업 또는 복원 방법에 대한 세부 사항'
'sidebar_label': '대체 방법'
'slug': '/operations/backup/alternative_methods'
'title': '대체 백업 또는 복원 방법'
'doc_type': 'reference'
---


# 대체 백업 방법

ClickHouse는 데이터를 디스크에 저장하며 디스크를 백업하는 다양한 방법이 있습니다. 
다음은 과거에 사용되어온 몇 가지 대안으로, 사용 사례에 적합할 수 있습니다.

### 다른 곳에 원본 데이터 복제하기 {#duplicating-source-data-somewhere-else}

종종 ClickHouse에 수집된 데이터는 [Apache Kafka](https://kafka.apache.org)와 같은 지속적인 큐를 통해 전달됩니다. 이 경우, ClickHouse에 데이터가 기록되는 동안 동일한 데이터 스트림을 읽고 차가운 저장소에 저장할 추가 구독자를 구성할 수 있습니다. 대부분의 기업은 이미 객체 저장소나 [HDFS](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html)와 같은 분산 파일 시스템과 같은 기본 권장 차가운 저장소를 가지고 있습니다.

### 파일 시스템 스냅샷 {#filesystem-snapshots}

일부 로컬 파일 시스템은 스냅샷 기능을 제공하지만 (예: [ZFS](https://en.wikipedia.org/wiki/ZFS)), 라이브 쿼리를 제공하는 데 최선의 선택이 아닐 수 있습니다. 가능한 해결책은 이러한 종류의 파일 시스템으로 추가 복제본을 생성하고 `SELECT` 쿼리에 사용되는 [Distributed](/engines/table-engines/special/distributed) 테이블에서 제외하는 것입니다. 이러한 복제본의 스냅샷은 데이터를 수정하는 쿼리의 접근에서 벗어나게 됩니다. 보너스로, 이러한 복제본은 서버당 더 많은 디스크가 연결된 특별한 하드웨어 구성을 가질 수 있어 비용 효과적입니다.

데이터 볼륨이 작을 경우, 원격 테이블로의 간단한 `INSERT INTO ... SELECT ...`가 잘 작동할 수 있습니다.

### 파트 조작 {#manipulations-with-parts}

ClickHouse는 `ALTER TABLE ... FREEZE PARTITION ...` 쿼리를 사용하여 테이블 파티션의 로컬 복사본을 생성할 수 있습니다. 이는 `/var/lib/clickhouse/shadow/` 폴더에 대한 하드링크를 사용하여 구현되므로 일반적으로 이전 데이터에 대해 추가 디스크 공간을 소비하지 않습니다. 생성된 파일 복사본은 ClickHouse 서버에 의해 처리되지 않으므로 그냥 두어도 됩니다: 이는 추가 외부 시스템을 필요로 하지 않는 간단한 백업을 제공하지만, 여전히 하드웨어 문제에 취약합니다. 이런 이유로, 다른 위치로 원격 복사한 다음 로컬 복사본을 제거하는 것이 좋습니다. 분산 파일 시스템과 객체 저장소는 여전히 좋은 옵션이지만, 충분한 용량을 갖춘 일반적인 첨부 파일 서버도 잘 작동할 수 있습니다 (이 경우 전송은 네트워크 파일 시스템을 통해 또는 아마도 [rsync](https://en.wikipedia.org/wiki/Rsync)를 통해 발생할 것입니다). 백업에서 데이터는 `ALTER TABLE ... ATTACH PARTITION ...`를 사용하여 복원할 수 있습니다.

파티션 조작과 관련된 쿼리에 대한 자세한 내용은 [`ALTER` 문서](/sql-reference/statements/alter/partition)를 참조하십시오.

이 접근 방식을 자동화하기 위한 타사 도구가 제공됩니다: [clickhouse-backup](https://github.com/AlexAkulov/clickhouse-backup).
