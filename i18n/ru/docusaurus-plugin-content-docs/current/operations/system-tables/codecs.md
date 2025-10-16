---
'description': 'Системная таблица, содержащая информацию о кодеках в очереди.'
'keywords':
- 'system table'
- 'codecs'
- 'compression'
'slug': '/operations/system-tables/codecs'
'title': 'system.codecs'
'doc_type': 'reference'
---
Содержит информацию о кодеках сжатия и шифрования.

Вы можете использовать эту таблицу, чтобы получить информацию о доступных кодеках сжатия и шифрования.

Таблица `system.codecs` содержит следующие столбцы (тип столбца указан в скобках):

- `name` ([String](../../sql-reference/data-types/string.md)) — Название кодека.
- `method_byte` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Байтовое значение, указывающее на кодек в сжатом файле.
- `is_compression` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — True, если этот кодек что-то сжимает. В противном случае это может быть просто преобразование, которое помогает сжатию.
- `is_generic_compression` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Кодек является универсальным алгоритмом сжатия, таким как lz4, zstd.
- `is_encryption` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Кодек шифрует данные.
- `is_timeseries_codec` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Кодек предназначен для данных временных рядов с плавающей запятой.
- `is_experimental` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — Кодек является экспериментальным.
- `description` ([String](../../sql-reference/data-types/string.md)) — Общее описание кодека.

**Пример**

Запрос:

```sql
SELECT * FROM system.codecs WHERE name='LZ4'
```

Результат:

```text
Row 1:
──────
name:                   LZ4
method_byte:            130
is_compression:         1
is_generic_compression: 1
is_encryption:          0
is_timeseries_codec:    0
is_experimental:        0
description:            Extremely fast; good compression; balanced speed and efficiency.
```