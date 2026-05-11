---
description: 'ClickHouse에 내장된 geobase 딕셔너리'
sidebar_label: '내장 딕셔너리'
sidebar_position: 6
slug: /sql-reference/statements/create/dictionary/embedded
title: '내장(geobase) 딕셔너리'
doc_type: 'reference'
---

import SelfManaged from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

ClickHouse에는 지오베이스(geobase) 작업을 위한 내장 기능이 포함되어 있습니다.

이를 통해 다음과 같은 작업을 할 수 있습니다.

* 특정 지역의 ID로 원하는 언어의 지역 이름을 가져옵니다.
* 특정 지역의 ID로 도시, 구역, 연방 지구, 국가, 대륙의 ID를 가져옵니다.
* 한 지역이 다른 지역에 속하는지 확인합니다.
* 상위 지역의 체인을 가져옵니다.

모든 함수는 지역 소속에 대한 서로 다른 관점을 동시에 사용할 수 있는 기능인 「translocality」를 지원합니다. 자세한 내용은 「웹 분석 딕셔너리 작업을 위한 함수」 섹션을 참조하십시오.

내부 딕셔너리는 기본 패키지에서 비활성화되어 있습니다.
이를 활성화하려면 서버 설정 파일에서 `path_to_regions_hierarchy_file` 및 `path_to_regions_names_files` 파라미터의 주석을 해제하십시오.

지오베이스는 텍스트 파일에서 로드됩니다.

`regions_hierarchy*.txt` 파일을 `path_to_regions_hierarchy_file` 디렉터리에 두십시오. 이 설정 파라미터에는 `regions_hierarchy.txt` 파일(기본 지역 계층 구조)의 경로가 포함되어야 하며, 다른 파일(`regions_hierarchy_ua.txt`)도 동일한 디렉터리에 위치해야 합니다.

`regions_names_*.txt` 파일은 `path_to_regions_names_files` 디렉터리에 두십시오.

이 파일들을 직접 생성할 수도 있습니다. 파일 형식은 다음과 같습니다.

`regions_hierarchy*.txt`: TabSeparated (헤더 없음), 컬럼:

* 지역 ID (`UInt32`)
* 상위 지역 ID (`UInt32`)
* 지역 유형 (`UInt8`): 1 - 대륙, 3 - 국가, 4 - 연방 지구, 5 - 지역, 6 - 도시; 다른 유형은 값이 없습니다.
* 인구 (`UInt32`) — 선택적 컬럼

`regions_names_*.txt`: TabSeparated (헤더 없음), 컬럼:

* 지역 ID (`UInt32`)
* 지역 이름 (`String`) — 탭 또는 줄 바꿈 문자를 포함할 수 없습니다. 이스케이프된 경우에도 포함할 수 없습니다.

RAM에 저장하기 위해 평면 배열을 사용합니다. 이 때문에 ID는 100만을 넘지 않아야 합니다.

딕셔너리는 서버를 재시작하지 않고도 업데이트할 수 있습니다. 단, 사용 가능한 딕셔너리의 집합 자체는 업데이트되지 않습니다.
업데이트를 위해 파일의 수정 시간을 확인합니다. 파일이 변경된 경우 딕셔너리가 업데이트됩니다.
변경 사항을 확인하는 주기는 `builtin_dictionaries_reload_interval` 파라미터로 설정합니다.
(최초 사용 시 로딩을 제외한) 딕셔너리 업데이트는 쿼리를 블록하지 않습니다. 업데이트 중에는 쿼리가 이전 버전 딕셔너리를 사용합니다. 업데이트 도중 오류가 발생하면, 오류는 서버 로그에 기록되며 쿼리는 계속해서 이전 버전 딕셔너리를 사용합니다.

지오베이스를 포함하는 딕셔너리를 주기적으로 업데이트할 것을 권장합니다. 업데이트 시에는 새 파일을 생성하여 별도의 위치에 기록하십시오. 모든 준비가 완료되면 서버에서 사용 중인 파일 이름으로 변경하십시오.

OS 식별자 및 검색 엔진을 다루기 위한 함수도 있지만, 사용하지 않는 것이 좋습니다.
