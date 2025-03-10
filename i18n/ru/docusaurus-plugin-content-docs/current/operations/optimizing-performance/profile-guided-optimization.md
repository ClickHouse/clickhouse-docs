---
sidebar_position: 54
sidebar_label: Оптимизация на основе профиля (PGO)
---
import SelfManaged from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';


# Оптимизация на основе профиля

Оптимизация на основе профиля (PGO) — это техника оптимизации компилятора, при которой программа оптимизируется на основе профиля времени выполнения.

Согласно тестам, PGO помогает достичь лучшей производительности для ClickHouse. По результатам тестов мы наблюдаем улучшения до 15% в QPS на тестовом наборе ClickBench. Более подробные результаты доступны [здесь](https://pastebin.com/xbue3HMU). Преимущества производительности зависят от вашей типичной загрузки — вы можете получить как лучшие, так и худшие результаты.

Больше информации о PGO в ClickHouse вы можете прочитать в соответствующем GitHub [треде](https://github.com/ClickHouse/ClickHouse/issues/44567).

## Как собрать ClickHouse с PGO? {#how-to-build-clickhouse-with-pgo}

Существует два основных типа PGO: [Инструментация](https://clang.llvm.org/docs/UsersManual.html#using-sampling-profilers) и [Отбор образцов](https://clang.llvm.org/docs/UsersManual.html#using-sampling-profilers) (также известный как AutoFDO). В этом руководстве описана PGO с инструментализацией для ClickHouse.

1. Соберите ClickHouse в режиме инструментализации. В Clang это можно сделать, передав опцию `-fprofile-generate` в `CXXFLAGS`.
2. Запустите инструментизированный ClickHouse на образце рабочей нагрузки. Здесь вам нужно использовать вашу обычную нагрузку. Одним из подходов может быть использование [ClickBench](https://github.com/ClickHouse/ClickBench) в качестве образца рабочей нагрузки. ClickHouse в режиме инструментализации может работать медленно, поэтому будьте к этому готовы и не запускайте инструментизированный ClickHouse в средах с критически важной производительностью.
3. Скомпилируйте ClickHouse еще раз с флагами компилятора `-fprofile-use` и профилями, собранными на предыдущем шаге.

Более подробное руководство по применению PGO доступно в [документации](https://clang.llvm.org/docs/UsersManual.html#profile-guided-optimization).

Если вы собираетесь собирать образец рабочей нагрузки непосредственно из производственной среды, мы рекомендуем попробовать использовать PGO с отбором образцов.
