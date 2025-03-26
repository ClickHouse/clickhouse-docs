---
description: 'Документация по оптимизации на основе профилей'
sidebar_label: 'Оптимизация на основе профилей (PGO)'
sidebar_position: 54
slug: /operations/optimizing-performance/profile-guided-optimization
title: 'Оптимизация на основе профилей'
---

import SelfManaged from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';


# Оптимизация на основе профилей

Оптимизация на основе профилей (PGO) — это техника оптимизации компилятора, при которой программа оптимизируется на основе профиля выполнения.

Согласно тестам, PGO помогает достигать лучшей производительности для ClickHouse. По результатам тестов мы наблюдаем улучшения до 15% в QPS на наборе тестов ClickBench. Более подробные результаты доступны [здесь](https://pastebin.com/xbue3HMU). Преимущества производительности зависят от вашего типичного рабочего процесса - вы можете получить лучшие или худшие результаты.

Дополнительную информацию о PGO в ClickHouse вы можете прочитать в соответствующем [issue](https://github.com/ClickHouse/ClickHouse/issues/44567) на GitHub.

## Как собрать ClickHouse с PGO? {#how-to-build-clickhouse-with-pgo}

Существует два основных вида PGO: [Инструментирование](https://clang.llvm.org/docs/UsersManual.html#using-sampling-profilers) и [Сэмплирование](https://clang.llvm.org/docs/UsersManual.html#using-sampling-profilers) (также известное как AutoFDO). В этом руководстве описывается Инструментирование PGO с ClickHouse.

1. Соберите ClickHouse в режиме инструментирования. В Clang это можно сделать, передав опцию `-fprofile-generate` в `CXXFLAGS`.
2. Запустите инструментированный ClickHouse на образце рабочей нагрузки. Здесь вам нужно использовать вашу обычную нагрузку. Один из подходов может заключаться в использовании [ClickBench](https://github.com/ClickHouse/ClickBench) в качестве образца нагрузки. ClickHouse в режиме инструментирования может работать медленно, поэтому будьте готовы к этому и не запускайте инструментированный ClickHouse в средах, критичных к производительности.
3. Пересоберите ClickHouse еще раз с флагами компилятора `-fprofile-use` и профилями, собранными на предыдущем этапе.

Более подробное руководство о том, как применить PGO, находится в [документации Clang](https://clang.llvm.org/docs/UsersManual.html#profile-guided-optimization).

Если вы собираетесь собирать образец рабочей нагрузки непосредственно из производственной среды, мы рекомендуем попробовать использовать Sampling PGO.
