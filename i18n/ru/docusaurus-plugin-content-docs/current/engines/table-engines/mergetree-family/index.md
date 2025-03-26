---
description: 'Документация для семейства движков MergeTree'
sidebar_label: 'Семейство MergeTree'
sidebar_position: 10
slug: /engines/table-engines/mergetree-family/
title: 'Семейство движков MergeTree'
---


# Семейство движков MergeTree

Движки таблиц из семейства MergeTree являются основой возможностей хранения данных ClickHouse. Они предоставляют большинство функций для устойчивости и высокопроизводительного извлечения данных: столбцовое хранение, пользовательское шардирование, разреженный первичный индекс, вторичные индексы пропуска данных и т.д.

Базовый [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) можно считать стандартным движком таблиц для однолюдных экземпляров ClickHouse, так как он универсален и практичен для широкого спектра случаев использования.

Для производственного применения [ReplicatedMergeTree](../../../engines/table-engines/mergetree-family/replication.md) является оптимальным выбором, поскольку он добавляет высокую доступность ко всем функциям обычного движка MergeTree. Дополнительно обеспечивается автоматическая дедупликация данных при их приеме, что позволяет программному обеспечению безопасно повторно пытаться вставить данные в случае сетевых проблем во время вставки.

Все остальные движки семейства MergeTree добавляют дополнительный функционал для некоторых специфических случаев использования. Обычно это реализуется в виде дополнительной манипуляции с данными в фоновом режиме.

Основным недостатком движков MergeTree является их высокая "тяжеловесность". Поэтому типичный подход заключается в том, чтобы иметь не так много из них. Если вам нужно много маленьких таблиц, например для временных данных, рассмотрите [систему логов](../../../engines/table-engines/log-family/index.md).

<!-- Таблица содержания этой страницы автоматически генерируется 
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/autogenerate-table-of-contents.sh
из полей YAML front matter: slug, description, title.

Если вы заметили ошибку, пожалуйста, отредактируйте YML frontmatter самих страниц.
-->
| Страница | Описание |
|-----|-----|
| [VersionedCollapsingMergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree) | Позволяет быстро записывать состояния объектов, которые постоянно изменяются, и удалять старые состояния объектов в фоновом режиме. |
| [Replication данных](/engines/table-engines/mergetree-family/replication) | Обзор репликации данных в ClickHouse |
| [MergeTree](/engines/table-engines/mergetree-family/mergetree) | Движки таблиц семейства `MergeTree` предназначены для высоких скоростей приема данных и огромных объемов данных. |
| [Приближенный поиск соседа с индексами векторного сходства](/engines/table-engines/mergetree-family/annindexes) | Документация для приблизительного поиска ближайшего соседа с индексами векторного сходства |
| [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) | Наследует от MergeTree, но добавляет логику для соединения строк в процессе слияния. |
| [Пользовательский ключ шардирования](/engines/table-engines/mergetree-family/custom-partitioning-key) | Узнайте, как добавить пользовательский ключ шардирования в таблицы MergeTree. |
| [Поиск по полному тексту с использованием полнотекстовых индексов](/engines/table-engines/mergetree-family/invertedindexes) | Быстро находите поисковые термины в тексте. |
| [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree) | SummingMergeTree наследует от движка MergeTree. Его ключевая особенность заключается в способности автоматически суммировать числовые данные во время слияния частей. |
| [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree) | Заменяет все строки с одинаковым первичным ключом (или, точнее, с одинаковым [ключом сортировки](../../../engines/table-engines/mergetree-family/mergetree.md)) на одну строку (внутри одной части данных), которая хранит комбинацию состояний агрегатных функций. |
| [GraphiteMergeTree](/engines/table-engines/mergetree-family/graphitemergetree) | Предназначен для сжатия и агрегации (rollup) данных Graphite. |
| [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) | отличает от MergeTree тем, что удаляет дублирующие записи с одинаковым значением ключа сортировки (`ORDER BY` секция таблицы, а не `PRIMARY KEY`). |
