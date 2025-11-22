---
description: 'Документация по оптимизации на основе профилирования'
sidebar_label: 'Оптимизация на основе профилирования (PGO)'
sidebar_position: 54
slug: /operations/optimizing-performance/profile-guided-optimization
title: 'Оптимизация на основе профилирования'
doc_type: 'guide'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';


# Оптимизация, управляемая профилированием

Оптимизация, управляемая профилированием (Profile-Guided Optimization, PGO), — это метод оптимизации компилятора, при котором программа оптимизируется на основе профиля выполнения во время работы.

Согласно тестам, PGO помогает достичь более высокой производительности ClickHouse. По результатам тестов мы наблюдаем до 15% прироста QPS в тестовом наборе ClickBench. Более подробные результаты доступны [здесь](https://pastebin.com/xbue3HMU). Прирост производительности зависит от вашей типичной нагрузки — вы можете получить как лучшие, так и худшие результаты.

Более подробную информацию о PGO в ClickHouse можно найти в соответствующем [issue на GitHub](https://github.com/ClickHouse/ClickHouse/issues/44567).



## Как собрать ClickHouse с PGO? {#how-to-build-clickhouse-with-pgo}

Существует два основных типа PGO: [Instrumentation](https://clang.llvm.org/docs/UsersManual.html#using-sampling-profilers) и [Sampling](https://clang.llvm.org/docs/UsersManual.html#using-sampling-profilers) (также известный как AutoFDO). В данном руководстве описывается использование Instrumentation PGO с ClickHouse.

1. Соберите ClickHouse в режиме инструментирования. В Clang это можно сделать, передав опцию `-fprofile-generate` в `CXXFLAGS`.
2. Запустите инструментированный ClickHouse на тестовой нагрузке. Используйте вашу типичную рабочую нагрузку. В качестве тестовой нагрузки можно использовать [ClickBench](https://github.com/ClickHouse/ClickBench). ClickHouse в режиме инструментирования может работать медленно, поэтому будьте к этому готовы и не запускайте инструментированный ClickHouse в критичных к производительности окружениях.
3. Перекомпилируйте ClickHouse ещё раз с флагами компилятора `-fprofile-use` и профилями, собранными на предыдущем шаге.

Более подробное руководство по применению PGO приведено в [документации](https://clang.llvm.org/docs/UsersManual.html#profile-guided-optimization) Clang.

Если вы планируете собирать тестовую нагрузку непосредственно из производственного окружения, рекомендуем использовать Sampling PGO.
