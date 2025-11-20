---
'description': '페이지는 ClickHouse 서드파티 사용과 서드파티 라이브러리를 추가하고 유지 관리하는 방법을 설명합니다.'
'sidebar_label': '서드파티 라이브러리'
'sidebar_position': 60
'slug': '/development/contrib'
'title': '서드파티 라이브러리'
'doc_type': 'reference'
---


# 서드파티 라이브러리

ClickHouse는 다른 데이터베이스에 연결하거나, 디스크에서 데이터를 로드/저장할 때 데이터를 디코딩/인코딩하거나, 특정 특수 SQL 함수를 구현하는 등 다양한 목적으로 서드파티 라이브러리를 활용합니다. 
대상 시스템의 사용 가능한 라이브러리에 의존하지 않기 위해, 각 서드파티 라이브러리는 ClickHouse의 소스 트리에 Git 서브모듈로 가져와지며 ClickHouse와 함께 컴파일 및 연결됩니다. 
서드파티 라이브러리와 그 라이선스 목록은 다음 쿼리를 통해 얻을 수 있습니다:

```sql
SELECT library_name, license_type, license_path FROM system.licenses ORDER BY library_name COLLATE 'en';
```

나열된 라이브러리는 ClickHouse 리포지토리의 `contrib/` 디렉터리에 위치한 것들입니다. 
빌드 옵션에 따라 일부 라이브러리는 컴파일되지 않을 수 있으며, 그 결과 런타임에서 해당 기능을 사용할 수 없습니다.

[예시](https://sql.clickhouse.com?query_id=478GCPU7LRTSZJBNY3EJT3)

## 서드파티 라이브러리 추가 및 유지관리 {#adding-and-maintaining-third-party-libraries}

각 서드파티 라이브러리는 ClickHouse 리포지토리의 `contrib/` 디렉터리 아래에 전용 디렉터리에 있어야 합니다. 
라이브러리 디렉터리에 외부 코드를 복사해서 dumping하는 것은 피하십시오. 
대신 외부 업스트림 리포지토리에서 서드파티 코드를 가져오는 Git 서브모듈을 생성하십시오.

ClickHouse에서 사용되는 모든 서브모듈은 `.gitmodule` 파일에 나열됩니다.
- 라이브러리를 기본적으로 그대로 사용할 수 있는 경우, 업스트림 리포지토리를 직접 참조할 수 있습니다.
- 라이브러리에 패치가 필요할 경우, [ClickHouse 조직의 GitHub](https://github.com/ClickHouse)에서 업스트림 리포지토리의 포크를 생성하십시오.

후자의 경우, 사용자 정의 패치를 업스트림 커밋으로부터 최대한 격리하는 것을 목표로 합니다. 
이를 위해, 통합하려는 브랜치 또는 태그에서 `ClickHouse/` 접두사가 붙은 브랜치를 생성합니다. 예를 들어 `ClickHouse/2024_2` (브랜치 `2024_2`의 경우) 또는 `ClickHouse/release/vX.Y.Z` (태그 `release/vX.Y.Z`의 경우). 
업스트림 개발 브랜치인 `master`/ `main` / `dev`를 피하십시오 (즉, 포크 리포지토리에서 브랜치 `ClickHouse/master` / `ClickHouse/main` / `ClickHouse/dev`에 접두사를 붙이지 마십시오). 
이러한 브랜치는 이동하는 목표로, 적절한 버전 관리를 어렵게 만듭니다. 
"접두사 브랜치"는 포크 내에서 업스트림 리포지토리로부터의 변경사항이 사용자 정의 `ClickHouse/` 브랜치에 영향을 미치지 않게 합니다. 
`contrib/`의 서브모듈은 포크된 서드파티 리포지토리의 `ClickHouse/` 브랜치만 추적해야 합니다.

패치는 외부 라이브러리의 `ClickHouse/` 브랜치에 대해서만 적용됩니다.

이를 수행하는 방법은 두 가지가 있습니다:
- 포크 리포지토리의 `ClickHouse/` 접두사가 붙은 브랜치에 대해 새로운 수정을 작성하려는 경우, 예를 들어 sanitizer 수정을 하고자 할 경우입니다. 이 경우, 수정을 `ClickHouse/` 접두사가 붙은 브랜치로 푸시합니다, 예를 들어 `ClickHouse/fix-sanitizer-disaster`. 이후 사용자 정의 추적 브랜치에 대해 새로운 브랜스에서 PR을 만듭니다, 예를 들면 `ClickHouse/2024_2 <-- ClickHouse/fix-sanitizer-disaster` 및 PR을 병합합니다.
- 서브모듈을 업데이트하고 이전 패치를 다시 적용해야 하는 경우입니다. 이 경우, 이전 PR을 다시 생성하는 것은 과도합니다. 대신, 단순히 이전 커밋을 새로운 `ClickHouse/` 브랜치(새로운 버전과 해당되는)로 체리픽합니다. 여러 커밋을 가진 PR은 커밋을 압축해도 괜찮습니다. 최상의 경우, 사용자 정의 패치를 업스트림에 기여했으며 새로운 버전에서 패치를 생략할 수 있습니다.

서브모듈이 업데이트된 후, ClickHouse의 서브모듈을 업데이트하여 포크의 새로운 해시를 가리키도록 합니다.

서드파티 라이브러리의 패치를 공식 리포지토리를 염두에 두고 작성하며, 패치를 업스트림 리포지토리에 기여하는 것을 고려하십시오. 
이렇게 하면 다른 사람들도 패치의 혜택을 누릴 수 있으며 ClickHouse 팀에게 유지 관리 부담이 되지 않습니다.
