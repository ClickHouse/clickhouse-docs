---
description: 'Системная таблица, содержащая список символов Unicode и их свойств.'
keywords: ['системная таблица', 'Unicode']
slug: /operations/system-tables/unicode
title: 'system.unicode'
doc_type: 'reference'
---

# system.unicode \\{#systemunicode\\}

Таблица `system.unicode` — это виртуальная таблица, которая предоставляет информацию о символах Unicode и их свойствах ([https://unicode-org.github.io/icu/userguide/strings/properties.html](https://unicode-org.github.io/icu/userguide/strings/properties.html)). Эта таблица генерируется на лету.

Столбцы

:::note
Имена свойств кодовых точек Unicode в документации ICU преобразованы в snake case.
:::

* `code_point` ([String](../../sql-reference/data-types/string.md)) — Представление кодовой точки в UTF-8.
* `code_point_value` ([Int32](../../sql-reference/data-types/int-uint.md)) — Числовое значение кодовой точки.
* `notation` ([String](../../sql-reference/data-types/string.md)) — Обозначение кодовой точки в Unicode.
* Binary Properties ([UInt8](../../sql-reference/data-types/int-uint.md)) — Бинарные свойства кодовой точки.
  * `alphabetic`, `ascii_hex_digit`, `case_ignorable`...
* Enumerated Properties ([Int32](../../sql-reference/data-types/int-uint.md)) — Перечислимые свойства кодовой точки.
  * `bidi_class`, `bidi_paired_bracket_type`, `block`...
* String Properties ([String](../../sql-reference/data-types/string.md)) — Строковые свойства (ASCII String, Unicode String или кодовая точка) кодовой точки.
  * `case_folding`, `decomposition_mapping`, `name`...

:::note
Отображение (mapping) несколько специфично, см. документацию ICU. Например, simple&#95;uppercase&#95;mapping и uppercase&#95;mapping — не совсем одно и то же. Языкозависимые преобразования не реализованы (например, в турецком верхний регистр для i — это &quot;İ&quot; (U+0130)).
:::

* `numeric_value` ([Float64](../../sql-reference/data-types/float.md)) — Числовое значение кодовой точки.
* `script_extensions` ([Array(LowCardinality(String))](../../sql-reference/data-types/array.md)) — Расширения письма (script extensions) для кодовой точки.
* `identifier_type` ([Array(LowCardinality(String))](../../sql-reference/data-types/array.md)) — Тип идентификатора кодовой точки.
* `general_category_mask` ([Int32](../../sql-reference/data-types/int-uint.md)) — Маска общей категории кодовой точки.

**Пример**

```sql
SELECT * FROM system.unicode WHERE code_point = 'a' LIMIT 1;
```

```text
Row 1:
──────
code_point:                      a
code_point_value:                97
notation:                        U+0061
alphabetic:                      1
ascii_hex_digit:                 1
bidi_control:                    0
bidi_mirrored:                   0
dash:                            0
default_ignorable_code_point:    0
deprecated:                      0
diacritic:                       0
extender:                        0
full_composition_exclusion:      0
grapheme_base:                   1
grapheme_extend:                 0
grapheme_link:                   0
hex_digit:                       1
hyphen:                          0
id_continue:                     1
id_start:                        1
ideographic:                     0
ids_binary_operator:             0
ids_trinary_operator:            0
join_control:                    0
logical_order_exception:         0
lowercase:                       1
math:                            0
noncharacter_code_point:         0
quotation_mark:                  0
radical:                         0
soft_dotted:                     0
terminal_punctuation:            0
unified_ideograph:               0
uppercase:                       0
white_space:                     0
xid_continue:                    1
xid_start:                       1
case_sensitive:                  1
sentence_terminal:               0
variation_selector:              0
nfd_inert:                       1
nfkd_inert:                      1
nfc_inert:                       0
nfkc_inert:                      0
segment_starter:                 1
pattern_syntax:                  0
pattern_white_space:             0
alnum:                           1
blank:                           0
graph:                           1
print:                           1
xdigit:                          1
cased:                           1
case_ignorable:                  0
changes_when_lowercased:         0
changes_when_uppercased:         1
changes_when_titlecased:         1
changes_when_casefolded:         0
changes_when_casemapped:         1
changes_when_nfkc_casefolded:    0
emoji:                           0
emoji_presentation:              0
emoji_modifier:                  0
emoji_modifier_base:             0
emoji_component:                 0
regional_indicator:              0
prepended_concatenation_mark:    0
extended_pictographic:           0
basic_emoji:                     0
emoji_keycap_sequence:           0
rgi_emoji_modifier_sequence:     0
rgi_emoji_flag_sequence:         0
rgi_emoji_tag_sequence:          0
rgi_emoji_zwj_sequence:          0
rgi_emoji:                       0
ids_unary_operator:              0
id_compat_math_start:            0
id_compat_math_continue:         0
bidi_class:                      0
block:                           1
canonical_combining_class:       0
decomposition_type:              0
east_asian_width:                4
general_category:                2
joining_group:                   0
joining_type:                    0
line_break:                      2
numeric_type:                    0
script:                          25
hangul_syllable_type:            0
nfd_quick_check:                 1
nfkd_quick_check:                1
nfc_quick_check:                 1
nfkc_quick_check:                1
lead_canonical_combining_class:  0
trail_canonical_combining_class: 0
grapheme_cluster_break:          0
sentence_break:                  4
word_break:                      1
bidi_paired_bracket_type:        0
indic_positional_category:       0
indic_syllabic_category:         0
vertical_orientation:            0
identifier_status:               1
general_category_mask:           4
numeric_value:                   0
age:                             1.1
bidi_mirroring_glyph:            a
case_folding:                    a
lowercase_mapping:               a
name:                            LATIN SMALL LETTER A
simple_case_folding:             a
simple_lowercase_mapping:        a
simple_titlecase_mapping:        A
simple_uppercase_mapping:        A
titlecase_mapping:               A
uppercase_mapping:               A
bidi_paired_bracket:             a
script_extensions:               ['Latin']
identifier_type:                 ['Recommended']

```

```sql
SELECT code_point, code_point_value, notation FROM system.unicode WHERE code_point = '😂';
```

```text
   ┌─code_point─┬─code_point_value─┬─notation─┐
1. │ 😂          │           128514 │ U+1F602  │
   └────────────┴──────────────────┴──────────┘
```
