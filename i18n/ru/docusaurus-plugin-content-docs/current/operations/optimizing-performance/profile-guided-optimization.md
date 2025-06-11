---
description: 'Документация по оптимизации, основанной на профиле'
sidebar_label: 'Оптимизация, основанная на профиле (PGO)'
sidebar_position: 54
slug: /operations/optimizing-performance/profile-guided-optimization
title: 'Оптимизация, основанная на профиле'
---

import SelfManaged from '@site/i18n/ru/current/_snippets/_self_managed_only_no_roadmap.md';


# Оптимизация, основанная на профиле

Оптимизация, основанная на профиле (PGO) — это техника оптимизации компилятора, при которой программа оптимизируется на основе профиля выполнения.

Согласно тестам, PGO помогает достигать лучшей производительности для ClickHouse. Мы видим улучшения до 15% в QPS на наборе тестов ClickBench. Более детальные результаты доступны [здесь](https://pastebin.com/xbue3HMU). Выгоды от производительности зависят от вашей типичной нагрузки — вы можете получить лучшие или худшие результаты.

Больше информации о PGO в ClickHouse вы можете прочитать в соответствующем GitHub [issue](https://github.com/ClickHouse/ClickHouse/issues/44567).

## Как собрать ClickHouse с PGO? {#how-to-build-clickhouse-with-pgo}

Существует два основных типа PGO: [Инструментирование](https://clang.llvm.org/docs/UsersManual.html#using-sampling-profilers) и [Анализ выборки](https://clang.llvm.org/docs/UsersManual.html#using-sampling-profilers) (также известный как AutoFDO). В данном руководстве описано Инструментирование PGO с ClickHouse.

1. Соберите ClickHouse в режиме инструментирования. В Clang это можно сделать, передав опцию `-fprofile-generate` в `CXXFLAGS`.
2. Запустите инструментированный ClickHouse на выборочной нагрузке. Здесь вам нужно использовать вашу обычную нагрузку. Одним из подходов может быть использование [ClickBench](https://github.com/ClickHouse/ClickBench) в качестве выборочной нагрузки. ClickHouse в режиме инструментирования может работать медленно, так что будьте готовы к этому и не запускайте инструментированный ClickHouse в производительных средах.
3. Перекомпилируйте ClickHouse еще раз с флагами компилятора `-fprofile-use` и профилями, собранными на предыдущем этапе.

Более подробное руководство о том, как применить PGO, находится в [документации](https://clang.llvm.org/docs/UsersManual.html#profile-guided-optimization) Clang.

Если вы собираетесь собирать выборочную нагрузку непосредственно из производственной среды, мы рекомендуем попробовать использовать Анализ выборки PGO.
