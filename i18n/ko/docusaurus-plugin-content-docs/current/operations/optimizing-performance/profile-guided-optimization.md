---
'description': '프로파일 유도 최적화에 대한 Documentation'
'sidebar_label': '프로파일 유도 최적화 (PGO)'
'sidebar_position': 54
'slug': '/operations/optimizing-performance/profile-guided-optimization'
'title': '프로파일 유도 최적화'
'doc_type': 'guide'
---

import SelfManaged from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';


# 프로파일 가이드 최적화

프로파일 가이드 최적화(Profil-Guided Optimization, PGO)는 프로그램의 런타임 프로파일을 기반으로 프로그램을 최적화하는 컴파일러 최적화 기술입니다.

테스트에 따르면, PGO는 ClickHouse의 성능 향상에 도움을 줍니다. 테스트 결과에 따르면 ClickBench 테스트 스위트에서 QPS에서 최대 15%의 성능 향상을 보입니다. 더 상세한 결과는 [여기](https://pastebin.com/xbue3HMU)에서 확인할 수 있습니다. 성능 이점은 일반적인 작업 부하에 따라 달라지므로, 더 나은 결과를 얻을 수도 있고 더 나쁜 결과를 얻을 수도 있습니다.

ClickHouse에서 PGO에 대한 추가 정보를 원하시면 해당 GitHub [문제](https://github.com/ClickHouse/ClickHouse/issues/44567)를 참조하시기 바랍니다.

## ClickHouse를 PGO로 빌드하는 방법? {#how-to-build-clickhouse-with-pgo}

PGO에는 두 가지 주요 종류가 있습니다: [Instrumentation](https://clang.llvm.org/docs/UsersManual.html#using-sampling-profilers)와 [Sampling](https://clang.llvm.org/docs/UsersManual.html#using-sampling-profilers) (AutoFDO라고도 함). 이 가이드에서는 ClickHouse와 함께 사용할 수 있는 Instrumentation PGO를 설명합니다.

1. Instrumented 모드에서 ClickHouse를 빌드합니다. Clang에서는 `CXXFLAGS`에 `-fprofile-generate` 옵션을 전달하여 수행할 수 있습니다.
2. 샘플 작업 부하에서 계측된 ClickHouse를 실행합니다. 여기서는 일반적인 작업 부하를 사용해야 합니다. 접근 방법 중 하나는 [ClickBench](https://github.com/ClickHouse/ClickBench)를 샘플 작업 부하로 사용하는 것입니다. 계측 모드의 ClickHouse는 느리게 작동할 수 있으므로 이에 대비하고, 성능이 중요한 환경에서 계측된 ClickHouse를 실행하지 마십시오.
3. 이전 단계에서 수집된 프로파일과 함께 `-fprofile-use` 컴파일러 플래그로 다시 ClickHouse를 재컴파일합니다.

PGO를 적용하는 방법에 대한 더 자세한 안내는 Clang [문서](https://clang.llvm.org/docs/UsersManual.html#profile-guided-optimization)에 있습니다.

생산 환경에서 직접 샘플 작업 부하를 수집할 예정이라면, Sampling PGO를 사용해 보실 것을 권장합니다.
