---
description: 'Системная таблица, содержащая информацию о слияниях и мутациях частей, которые в настоящее время обрабатываются для таблиц семейства MergeTree.'
slug: /operations/system-tables/merges
title: 'system.merges'
keywords: ['системная таблица', 'слияния']
---
import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

Содержит информацию о слияниях и мутациях частей, которые в настоящее время обрабатываются для таблиц семейства MergeTree.

Колонки:

- `database` (String) — Название базы данных, к которой принадлежит таблица.
- `table` (String) — Название таблицы.
- `elapsed` (Float64) — Время, прошедшее (в секундах) с момента начала слияния.
- `progress` (Float64) — Процент завершенной работы от 0 до 1.
- `num_parts` (UInt64) — Количество частей, которые необходимо слить.
- `result_part_name` (String) — Название части, которая будет сформирована в результате слияния.
- `is_mutation` (UInt8) — 1, если этот процесс является мутацией части.
- `total_size_bytes_compressed` (UInt64) — Общий размер сжатых данных в объединенных частях.
- `total_size_marks` (UInt64) — Общее количество меток в объединенных частях.
- `bytes_read_uncompressed` (UInt64) — Количество прочитанных байтов, несжатых.
- `rows_read` (UInt64) — Количество прочитанных строк.
- `bytes_written_uncompressed` (UInt64) — Количество записанных байтов, несжатых.
- `rows_written` (UInt64) — Количество записанных строк.
- `memory_usage` (UInt64) — Потребление памяти процессом слияния.
- `thread_id` (UInt64) — Идентификатор потока процесса слияния.
- `merge_type` — Тип текущего слияния. Пусто, если это мутация.
- `merge_algorithm` — Алгоритм, используемый в текущем слиянии. Пусто, если это мутация.
