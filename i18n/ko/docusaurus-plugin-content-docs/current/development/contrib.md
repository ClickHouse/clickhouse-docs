---
description: 'ClickHouse의 타사 라이브러리 사용 및 타사 라이브러리를 추가하고 유지 관리하는 방법을 설명하는 페이지입니다.'
sidebar_label: '타사 라이브러리'
sidebar_position: 60
slug: /development/contrib
title: '타사 라이브러리'
doc_type: 'reference'
---



# 서드파티 라이브러리 \{#third-party-libraries\}

ClickHouse는 다른 데이터베이스에 연결하거나, 디스크에서 데이터를 로드/저장할 때 데이터를 디코딩/인코딩하거나, 특정 SQL 특수 함수를 구현하는 등 여러 목적을 위해 서드파티 라이브러리를 활용합니다.
대상 시스템에 설치된 라이브러리에 종속되지 않도록, 각 서드파티 라이브러리는 ClickHouse의 소스 트리에 Git 서브모듈로 포함되어 ClickHouse와 함께 컴파일 및 링크됩니다.
서드파티 라이브러리와 해당 라이선스 목록은 다음 쿼리로 조회할 수 있습니다:

```sql
SELECT library_name, license_type, license_path FROM system.licenses ORDER BY library_name COLLATE 'en';
```

나열된 라이브러리는 ClickHouse 저장소의 `contrib/` 디렉터리에 있는 라이브러리입니다.
빌드 옵션에 따라 일부 라이브러리는 컴파일되지 않을 수 있으며, 그 결과 런타임에 해당 기능을 사용할 수 없을 수도 있습니다.

[예제](https://sql.clickhouse.com?query_id=478GCPU7LRTSZJBNY3EJT3)


## 서드파티 라이브러리 추가 및 유지 관리 \{#adding-and-maintaining-third-party-libraries\}

각 서드파티 라이브러리는 ClickHouse 저장소의 `contrib/` 디렉터리 아래에 전용 디렉터리를 두어야 합니다.
라이브러리 디렉터리에 외부 코드 복사본을 무분별하게 쌓아 두는 방식은 피하십시오.
대신 Git 서브모듈을 생성하여 외부 업스트림 저장소에서 서드파티 코드를 가져오십시오.

ClickHouse에서 사용하는 모든 서브모듈은 `.gitmodule` 파일에 나열되어 있습니다.
- 라이브러리를 수정 없이 그대로 사용할 수 있는 경우(기본 사례) 업스트림 저장소를 직접 참조하면 됩니다.
- 라이브러리에 패치가 필요하다면, [GitHub의 ClickHouse 조직](https://github.com/ClickHouse)에 업스트림 저장소를 포크하십시오.

후자의 경우, 커스텀 패치를 업스트림 커밋과 최대한 분리하는 것을 목표로 합니다.
이를 위해 통합하려는 브랜치나 태그에서 `ClickHouse/` 접두사가 붙은 브랜치를 생성하십시오. 예를 들어 브랜치 `2024_2`에는 `ClickHouse/2024_2`, 태그 `release/vX.Y.Z`에는 `ClickHouse/release/vX.Y.Z`와 같이 만듭니다.
업스트림 개발 브랜치 `master` / `main` / `dev`를 그대로 따라가는 것(즉, 포크 저장소에서 `ClickHouse/master` / `ClickHouse/main` / `ClickHouse/dev`와 같이 접두사만 붙인 브랜치를 사용하는 것)은 피하십시오.
이러한 브랜치는 계속 변경되므로 적절한 버전 관리를 어렵게 만듭니다.
「접두사 브랜치」를 사용하면 업스트림 저장소에서 포크로 pull을 수행하더라도 커스텀 `ClickHouse/` 브랜치에는 영향을 주지 않습니다.
`contrib/`의 서브모듈은 포크된 서드파티 저장소의 `ClickHouse/` 브랜치만 추적해야 합니다.

패치는 외부 라이브러리의 `ClickHouse/` 브랜치에만 적용됩니다.

이를 수행하는 방법은 두 가지입니다.
- 포크된 저장소의 `ClickHouse/` 접두사 브랜치에 대해 새로운 수정 사항을 추가하려는 경우입니다(예: sanitizer 수정). 이 경우 수정 사항을 `ClickHouse/` 접두사가 붙은 브랜치(예: `ClickHouse/fix-sanitizer-disaster`)로 푸시하십시오. 그런 다음 새 브랜치에서 커스텀 추적 브랜치(예: `ClickHouse/2024_2 <-- ClickHouse/fix-sanitizer-disaster`)로 PR을 생성하고 해당 PR을 머지하십시오.
- 서브모듈을 업데이트했으며 이전 패치를 다시 적용해야 하는 경우입니다. 이때 예전 PR을 그대로 다시 만드는 것은 과도합니다. 대신 이전 커밋들을 새 버전에 해당하는 새 `ClickHouse/` 브랜치로 단순히 cherry-pick 하십시오. 여러 개의 커밋으로 구성된 PR은 필요하다면 하나의 커밋으로 squash 해도 됩니다. 최선의 경우 커스텀 패치를 업스트림에 기여해 두었다면 새 버전에서는 해당 패치를 생략할 수 있습니다.

서브모듈을 업데이트한 후에는 포크 저장소의 새 해시를 가리키도록 ClickHouse의 서브모듈 참조를 업데이트하십시오.

서드파티 라이브러리에 대한 패치는 공식 저장소를 염두에 두고 작성하고, 가능한 경우 업스트림 저장소에 다시 기여하는 것을 고려하십시오.
이렇게 하면 다른 프로젝트도 해당 패치의 혜택을 볼 수 있고, ClickHouse 팀의 유지 관리 부담도 줄어듭니다.
