---
slug: '/operations/optimizing-performance/profile-guided-optimization'
sidebar_label: 'Оптимизация, основанная на профиле (PGO)'
sidebar_position: 54
description: 'Документация для профилируемой оптимизации'
title: 'Оптимизация, основанная на профиле'
doc_type: guide
---
import SelfManaged from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';


# Оптимизация, основанная на профиле

Оптимизация, основанная на профиле (PGO), — это техника оптимизации компилятора, при которой программа оптимизируется на основе профиля времени выполнения.

Согласно тестам, PGO помогает достичь лучшей производительности для ClickHouse. Мы видим улучшения до 15% в QPS в тестовом наборе ClickBench. Более детальные результаты доступны [здесь](https://pastebin.com/xbue3HMU). Преимущества в производительности зависят от вашего типичного рабочего процесса — вы можете получить как лучшие, так и худшие результаты.

Дополнительную информацию о PGO в ClickHouse вы можете прочитать в соответствующем GitHub [issue](https://github.com/ClickHouse/ClickHouse/issues/44567).

## Как собрать ClickHouse с PGO? {#how-to-build-clickhouse-with-pgo}

Существует два основных вида PGO: [Инструментация](https://clang.llvm.org/docs/UsersManual.html#using-sampling-profilers) и [Выборка](https://clang.llvm.org/docs/UsersManual.html#using-sampling-profilers) (также известная как AutoFDO). В этом руководстве описана оптимизация PGO на основе Инструментации для ClickHouse.

1. Соберите ClickHouse в режиме инструментирования. В Clang это можно сделать, передав опцию `-fprofile-generate` в `CXXFLAGS`.
2. Запустите инструментированный ClickHouse на тестовой нагрузке. Здесь вам нужно использовать свою обычную нагрузку. Один из подходов может заключаться в использовании [ClickBench](https://github.com/ClickHouse/ClickBench) в качестве тестовой нагрузки. ClickHouse в режиме инструментирования может работать медленно, так что будьте готовы к этому и не запускайте инструментированный ClickHouse в средах, критичных к производительности.
3. Скомпилируйте ClickHouse еще раз с флагами компилятора `-fprofile-use` и профилями, собранными на предыдущем шаге.

Более подробное руководство о том, как применить PGO, содержится в [документации](https://clang.llvm.org/docs/UsersManual.html#profile-guided-optimization) Clang.

Если вы собираетесь собирать тестовую нагрузку непосредственно из производственной среды, мы рекомендуем попробовать использовать PGO на основе выборки.