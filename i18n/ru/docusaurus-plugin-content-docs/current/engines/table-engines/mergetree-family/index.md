---
slug: /engines/table-engines/mergetree-family/
sidebar_position: 10
sidebar_label: 'Семейство MergeTree'
---


# Семейство движков MergeTree

Движки таблиц из семейства MergeTree являются основой возможностей хранения данных в ClickHouse. Они предоставляют большинство функций для надежности и высокой производительности обработки данных: колоночное хранение, пользовательская партиционирование, разреженный первичный ключ, вторичные индексы для пропуска данных и т.д.

Базовый [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) движок таблиц можно считать стандартным движком для одноузловых экземпляров ClickHouse, поскольку он универсален и практичен для широкого спектра случаев использования.

Для производственного использования [ReplicatedMergeTree](../../../engines/table-engines/mergetree-family/replication.md) является оптимальным выбором, так как он добавляет высокую доступность ко всем возможностям обычного движка MergeTree. В качестве бонуса предлагается автоматическая дедупликация данных при их загрузке, что позволяет программному обеспечению безопасно повторять попытку в случае сетевой проблемы во время вставки.

Все другие движки семейства MergeTree добавляют дополнительный функционал для конкретных случаев использования. Обычно это реализуется в виде дополнительных манипуляций с данными в фоновом режиме.

Основной недостаток движков MergeTree заключается в том, что они довольно тяжелые. Поэтому типичная схема заключается в том, чтобы иметь их не так много. Если вам нужно много небольших таблиц, например, для временных данных, рассмотрите [семейство Log](../../../engines/table-engines/log-family/index.md).

<!-- Таблица содержания этой страницы автоматически генерируется с помощью 
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/autogenerate-table-of-contents.sh
из полей YAML front matter: slug, description, title.

Если вы заметили ошибку, пожалуйста, отредактируйте YML front matter самих страниц.
-->
| Страница | Описание |
|-----|-----|
| [VersionedCollapsingMergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree) | Позволяет быстро записывать состояния объектов, которые постоянно меняются, и удалять старые состояния объектов в фоновом режиме. |
| [Replication данных](/engines/table-engines/mergetree-family/replication) | Обзор репликации данных в ClickHouse |
| [MergeTree](/engines/table-engines/mergetree-family/mergetree) | Движки таблиц семейства `MergeTree` разработаны для высоких скоростей загрузки данных и огромных объемов данных. |
| [Приблизительный поиск ближайших соседей с использованием векторных индексов схожести](/engines/table-engines/mergetree-family/annindexes) | Приблизительный поиск ближайших соседей с использованием векторных индексов схожести |
| [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) | Наследует от MergeTree, но добавляет логику для коллапса строк во время процесса объединения. |
| [Ключ пользовательского партиционирования](/engines/table-engines/mergetree-family/custom-partitioning-key) | Узнайте, как добавить пользовательский ключ партиционирования в таблицы MergeTree. |
| [Полнотекстовый поиск с использованием полнотекстовых индексов](/engines/table-engines/mergetree-family/invertedindexes) | Быстро находите поисковые термины в тексте. |
| [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree) | SummingMergeTree наследует от движка MergeTree. Его ключевая особенность заключается в возможности автоматически суммировать числовые данные во время объединения частей. |
| [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree) | Заменяет все строки с одинаковым первичным ключом (или, точнее, с одинаковым [ключом сортировки](../../../engines/table-engines/mergetree-family/mergetree.md)) на одну строку (в рамках одной части данных), которая хранит комбинацию состояний агрегирующих функций. |
| [GraphiteMergeTree](/engines/table-engines/mergetree-family/graphitemergetree) | Разработан для сжатия и агрегирования/усреднения (rollup) данных Graphite. |
| [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) | Отличается от MergeTree тем, что удаляет дубликаты с одинаковым значением ключа сортировки (`ORDER BY` часть таблицы, не `PRIMARY KEY`). |
