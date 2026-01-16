---
description: 'Документация по оптимизации на основе профилирования'
sidebar_label: 'Оптимизация на основе профилирования (PGO)'
sidebar_position: 54
slug: /operations/optimizing-performance/profile-guided-optimization
title: 'Оптимизация на основе профилирования'
doc_type: 'guide'
---

import SelfManaged from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

# Оптимизация, управляемая профилированием \\{#profile-guided-optimization\\}

Profile-Guided Optimization (PGO) — это техника оптимизации компилятора, при которой программа оптимизируется на основе профиля выполнения во время работы.

Согласно тестам, PGO помогает достичь более высокой производительности в ClickHouse. Мы наблюдаем улучшение до 15% по показателю QPS в тестовом наборе ClickBench. Более подробные результаты доступны [здесь](https://pastebin.com/xbue3HMU). Прирост производительности зависит от вашей типичной нагрузки — вы можете получить как лучшие, так и худшие результаты.

Подробнее о PGO в ClickHouse можно прочитать в соответствующем [issue](https://github.com/ClickHouse/ClickHouse/issues/44567) на GitHub.

## Как собрать ClickHouse с PGO? \\{#how-to-build-clickhouse-with-pgo\\}

Существует два основных вида PGO: [Instrumentation](https://clang.llvm.org/docs/UsersManual.html#using-sampling-profilers) и [Sampling](https://clang.llvm.org/docs/UsersManual.html#using-sampling-profilers) (также известный как AutoFDO). В этом руководстве описывается использование Instrumentation PGO с ClickHouse.

1. Соберите ClickHouse в инструментированном режиме. В Clang это можно сделать, передав опцию `-fprofile-generate` в `CXXFLAGS`.
2. Запустите инструментированный ClickHouse на образцовой нагрузке. Здесь следует воспроизвести вашу обычную рабочую нагрузку. Один из подходов — использовать [ClickBench](https://github.com/ClickHouse/ClickBench) в качестве примерной нагрузки. ClickHouse в режиме инструментирования может работать медленно, поэтому будьте к этому готовы и не запускайте инструментированный ClickHouse в производственных средах, критичных к производительности.
3. Пересоберите ClickHouse ещё раз с флагами компилятора `-fprofile-use` и профилями, которые были собраны на предыдущем шаге.

Более подробное руководство по применению PGO приведено в [документации](https://clang.llvm.org/docs/UsersManual.html#profile-guided-optimization) Clang.

Если вы собираетесь собирать образцовую нагрузку непосредственно в продукционной среде, мы рекомендуем попробовать использовать Sampling PGO.
