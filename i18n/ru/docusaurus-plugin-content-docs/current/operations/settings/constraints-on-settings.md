---
slug: '/operations/settings/constraints-on-settings'
sidebar_label: 'Ограничения для Настроек'
sidebar_position: 62
description: 'Ограничения по настройкам могут быть определены в разделе `profiles`'
title: 'Ограничения для Настроек'
doc_type: reference
---
# Ограничения на настройки

## Обзор {#overview}

В ClickHouse "ограничения" на настройки относятся к ограничениям и правилам, которые вы можете установить для настроек. Эти ограничения могут быть применены для поддержания стабильности, безопасности и предсказуемого поведения вашей базы данных.

## Определение ограничений {#defining-constraints}

Ограничения на настройки могут быть определены в разделе `profiles` файла конфигурации `user.xml`. Они запрещают пользователям изменять некоторые настройки с помощью инструкции [`SET`](/sql-reference/statements/set).

Ограничения определяются следующим образом:

```xml
<profiles>
  <user_name>
    <constraints>
      <setting_name_1>
        <min>lower_boundary</min>
      </setting_name_1>
      <setting_name_2>
        <max>upper_boundary</max>
      </setting_name_2>
      <setting_name_3>
        <min>lower_boundary</min>
        <max>upper_boundary</max>
      </setting_name_3>
      <setting_name_4>
        <readonly/>
      </setting_name_4>
      <setting_name_5>
        <min>lower_boundary</min>
        <max>upper_boundary</max>
        <changeable_in_readonly/>
      </setting_name_5>
      <setting_name_6>
        <min>lower_boundary</min>
        <max>upper_boundary</max>
        <disallowed>value1</disallowed>
        <disallowed>value2</disallowed>
        <disallowed>value3</disallowed>
        <changeable_in_readonly/>
      </setting_name_6>
    </constraints>
  </user_name>
</profiles>
```

Если пользователь попытается нарушить ограничения, будет выброшено исключение, и настройка останется неизменной.

## Типы ограничений {#types-of-constraints}

В ClickHouse поддерживается несколько типов ограничений:
- `min`
- `max`
- `disallowed`
- `readonly` (с псевдонимом `const`)
- `changeable_in_readonly`

Ограничения `min` и `max` указывают верхние и нижние границы для числовой настройки и могут использоваться в комбинации друг с другом.

Ограничение `disallowed` может использоваться для указания конкретных значений, которые не должны допускаться для конкретной настройки.

Ограничение `readonly` или `const` указывает на то, что пользователь не может изменять соответствующую настройку вообще.

Тип ограничения `changeable_in_readonly` позволяет пользователям изменять настройку в пределах диапазона `min`/`max`, даже если настройка `readonly` установлена в `1`, в противном случае изменения настроек не допускаются в режиме `readonly=1`.

:::note
`changeable_in_readonly` поддерживается только если включен `settings_constraints_replace_previous`:

```xml
<access_control_improvements>
  <settings_constraints_replace_previous>true</settings_constraints_replace_previous>
</access_control_improvements>
```
:::

## Несколько профилей ограничений {#multiple-constraint-profiles}

Если для пользователя активно несколько профилей, то ограничения объединяются. Процесс объединения зависит от `settings_constraints_replace_previous`:
- **true** (рекомендуется): ограничения для одной и той же настройки заменяются в процессе объединения, так что используется последнее ограничение, а все предыдущие игнорируются. Это включает поля, которые не установлены в новых ограничениях.
- **false** (по умолчанию): ограничения для одной и той же настройки объединяются таким образом, что каждый неустановленный тип ограничения берется из предыдущего профиля, а каждый установленный тип ограничения заменяется значением из нового профиля.

## Режим только для чтения {#read-only}

Режим только для чтения включается с помощью настройки `readonly`, которую не следует путать с типом ограничения `readonly`:
- `readonly=0`: Никаких ограничений на чтение.
- `readonly=1`: Разрешены только запросы на чтение, и настройки не могут быть изменены, если `changeable_in_readonly` не установлено.
- `readonly=2`: Разрешены только запросы на чтение, но настройки могут быть изменены, кроме самой настройки `readonly`.

### Пример {#example-read-only}

Пусть в `users.xml` присутствуют следующие строки:

```xml
<profiles>
  <default>
    <max_memory_usage>10000000000</max_memory_usage>
    <force_index_by_date>0</force_index_by_date>
    ...
    <constraints>
      <max_memory_usage>
        <min>5000000000</min>
        <max>20000000000</max>
      </max_memory_usage>
      <force_index_by_date>
        <readonly/>
      </force_index_by_date>
    </constraints>
  </default>
</profiles>
```

Следующие запросы все вызовут исключения:

```sql
SET max_memory_usage=20000000001;
SET max_memory_usage=4999999999;
SET force_index_by_date=1;
```

```text
Code: 452, e.displayText() = DB::Exception: Setting max_memory_usage should not be greater than 20000000000.
Code: 452, e.displayText() = DB::Exception: Setting max_memory_usage should not be less than 5000000000.
Code: 452, e.displayText() = DB::Exception: Setting force_index_by_date should not be changed.
```

:::note
Профиль `default` обрабатывается уникальным образом: все ограничения, определенные для профиля `default`, становятся стандартными ограничениями, так что они ограничивают всех пользователей, пока не будут явно переопределены для этих пользователей.
:::

## Ограничения на настройки MergeTree {#constraints-on-merge-tree-settings}

Возможно установить ограничения для [настроек merge tree](merge-tree-settings.md). Эти ограничения применяются, когда создается таблица с движком MergeTree или изменяются ее настройки хранения.

Имя настройки merge tree должно предшествовать префиксом `merge_tree_` при ссылке в секции `<constraints>`.

### Пример {#example-mergetree}

Вы можете запретить создание новых таблиц с явно указанной `storage_policy`

```xml
<profiles>
  <default>
    <constraints>
      <merge_tree_storage_policy>
        <const/>
      </merge_tree_storage_policy>
    </constraints>
  </default>
</profiles>
```