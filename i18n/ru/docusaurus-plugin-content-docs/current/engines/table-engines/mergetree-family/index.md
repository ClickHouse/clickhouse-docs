---
description: 'Документация для семейства движков MergeTree'
sidebar_label: 'Семейство MergeTree'
sidebar_position: 10
slug: /engines/table-engines/mergetree-family/
title: 'Семейство движков MergeTree'
---


# Семейство движков MergeTree

Движки таблиц из семейства MergeTree составляют основу возможностей хранения данных в ClickHouse. Они обеспечивают большинство функций для устойчивости и высокопроизводительного извлечения данных: столбцовое хранение, пользовательское разделение, разреженный первичный индекс, вторичные индексы пропуска данных и т.д.

Базовый [движок таблиц MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) можно считать движком таблиц по умолчанию для одноузловых экземпляров ClickHouse, потому что он универсален и практичен для множества сценариев использования.

Для использования в продуктивной среде рекомендуется [ReplicatedMergeTree](../../../engines/table-engines/mergetree-family/replication.md), так как он добавляет высокую доступность ко всем функциям обычного движка MergeTree. Дополнительным бонусом является автоматическая дедупликация данных при приеме данных, что позволяет программному обеспечению безопасно повторять попытки, если возникли какие-либо проблемы с сетью во время вставки.

Все остальные движки семейства MergeTree добавляют дополнительную функциональность для некоторых специфических случаев использования. Обычно это реализуется как дополнительная обработка данных в фоне.

Основной недостаток движков MergeTree в том, что они довольно тяжелы. Поэтому типичный шаблон заключается в том, чтобы иметь их не так много. Если вам нужно много маленьких таблиц, например, для временных данных, рассмотрите [семейство движков Log](../../../engines/table-engines/log-family/index.md).

<!-- Таблица содержания для этой страницы автоматически генерируется 
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/autogenerate-table-of-contents.sh
из полей описания в YAML: slug, description, title.

Если вы заметили ошибку, пожалуйста, отредактируйте YML-фронтматер страниц.
-->
| Страница | Описание |
|-----|-----|
| [VersionedCollapsingMergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree) | Позволяет быстрое сохранение состояний объектов, которые постоянно изменяются, и удаление старых состояний объектов в фоновом режиме. |
| [Репликация данных](/engines/table-engines/mergetree-family/replication) | Обзор репликации данных в ClickHouse |
| [MergeTree](/engines/table-engines/mergetree-family/mergetree) | Семейство движков таблиц `MergeTree` предназначено для высоких скоростей приема данных и больших объемов данных. |
| [Точный и аппроксимирующий поиск ближайших соседей](/engines/table-engines/mergetree-family/annindexes) | Документация по точному и аппроксимирующему поиску ближайших соседей |
| [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) | Наследует от MergeTree, но добавляет логику свертывания строк в процессе слияния. |
| [Пользовательский ключ разделения](/engines/table-engines/mergetree-family/custom-partitioning-key) | Узнайте, как добавить пользовательский ключ разделения в таблицы MergeTree. |
| [Полнотекстовый поиск с использованием полнотекстовых индексов](/engines/table-engines/mergetree-family/invertedindexes) | Быстрое нахождение поисковых терминов в тексте. |
| [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree) | SummingMergeTree наследуется от движка MergeTree. Его ключевая особенность - способность автоматически суммировать числовые данные при слиянии частей. |
| [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree) | Заменяет все строки с одинаковым первичным ключом (или, точнее, с одинаковым [ключом сортировки](../../../engines/table-engines/mergetree-family/mergetree.md)) на одну строку (в пределах одной части данных), которая хранит комбинацию состояний агрегатных функций. |
| [GraphiteMergeTree](/engines/table-engines/mergetree-family/graphitemergetree) | Предназначен для утончения и агрегации/усреднения (свёртки) данных Graphite. |
| [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) | отличается от MergeTree тем, что удаляет дублирующиеся записи с одинаковым значением ключа сортировки (`ORDER BY` секция таблицы, не `PRIMARY KEY`). |
