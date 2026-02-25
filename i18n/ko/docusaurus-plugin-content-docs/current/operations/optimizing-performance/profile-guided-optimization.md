---
description: '프로파일 기반 최적화 문서'
sidebar_label: '프로파일 기반 최적화(PGO)'
sidebar_position: 54
slug: /operations/optimizing-performance/profile-guided-optimization
title: '프로파일 기반 최적화'
doc_type: 'guide'
---

import SelfManaged from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';


# 프로파일 기반 최적화 \{#profile-guided-optimization\}

Profile-Guided Optimization (PGO)는 프로그램의 런타임 프로파일에 기반하여 프로그램을 최적화하는 컴파일러 최적화 기법입니다.

테스트 결과 PGO는 ClickHouse의 성능 향상에 도움이 됩니다. ClickBench 테스트 스위트에서 QPS가 최대 15%까지 향상되는 것을 확인했습니다. 보다 상세한 결과는 [여기](https://pastebin.com/xbue3HMU)에서 확인할 수 있습니다. 성능 이점은 일반적인 워크로드에 따라 달라질 수 있으며, 더 좋거나 더 나쁜 결과가 나올 수 있습니다.

ClickHouse에서의 PGO에 대해 더 자세한 내용은 관련 GitHub [이슈](https://github.com/ClickHouse/ClickHouse/issues/44567)에서 확인할 수 있습니다.



## PGO로 ClickHouse를 빌드하는 방법 \{#how-to-build-clickhouse-with-pgo\}

PGO에는 두 가지 주요 종류가 있습니다. [Instrumentation](https://clang.llvm.org/docs/UsersManual.html#using-sampling-profilers) 방식과 [Sampling](https://clang.llvm.org/docs/UsersManual.html#using-sampling-profilers) 방식(일명 AutoFDO)입니다. 이 가이드에서는 Instrumentation 기반 PGO를 ClickHouse에 적용하는 방법을 설명합니다.

1. Instrumentation 모드로 ClickHouse를 빌드합니다. Clang에서는 `CXXFLAGS`에 `-fprofile-generate` 옵션을 지정하면 됩니다.
2. Instrumentation을 적용한 ClickHouse를 샘플 워크로드로 실행합니다. 여기에서는 평소에 사용하는 워크로드를 사용하면 됩니다. 한 가지 방법으로는 [ClickBench](https://github.com/ClickHouse/ClickBench)를 샘플 워크로드로 사용하는 것이 있습니다. Instrumentation 모드의 ClickHouse는 느리게 동작할 수 있으므로, 이에 대비하고 성능이 중요한 환경에서는 Instrumentation을 적용한 ClickHouse를 실행하지 않는 것이 좋습니다.
3. 이전 단계에서 수집한 프로파일을 사용하여 `-fprofile-use` 컴파일러 플래그와 함께 ClickHouse를 다시 컴파일합니다.

PGO를 적용하는 보다 자세한 방법은 Clang [문서](https://clang.llvm.org/docs/UsersManual.html#profile-guided-optimization)를 참고하십시오.

프로덕션 환경에서 직접 샘플 워크로드를 수집하려는 경우, Sampling PGO 사용을 시도해 볼 것을 권장합니다.
