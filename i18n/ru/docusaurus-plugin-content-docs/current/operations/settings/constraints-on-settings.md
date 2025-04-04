---
description: 'Ограничения для настроек могут быть определены в разделе `profiles` файла конфигурации `user.xml` и запрещают пользователям изменять некоторые настройки с помощью запроса `SET`.'
sidebar_label: 'Ограничения для Настроек'
sidebar_position: 62
slug: /operations/settings/constraints-on-settings
title: 'Ограничения для Настроек'
---


# Ограничения для Настроек

## Обзор {#overview}

В ClickHouse "ограничения" для настроек относятся к ограничениям и правилам, которые вы можете назначить для настроек. Эти ограничения могут быть применены для поддержания стабильности, безопасности и предсказуемого поведения вашей базы данных.

## Определение ограничений {#defining-constraints}

Ограничения для настроек могут быть определены в разделе `profiles` файла конфигурации `user.xml`. Они запрещают пользователям изменять некоторые настройки с помощью оператора 
[`SET`](/sql-reference/statements/set).

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
    </constraints>
  </user_name>
</profiles>
```

Если пользователь пытается нарушить ограничения, выбрасывается исключение, и настройка остается неизменной.

## Типы ограничений {#types-of-constraints}

В ClickHouse поддерживаются несколько типов ограничений:
- `min`
- `max`
- `readonly` (с псевдонимом `const`)
- `changeable_in_readonly`

Ограничения `min` и `max` указывают верхние и нижние границы для числовой настройки и могут использоваться в комбинации друг с другом.

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

## Множественные профили ограничений {#multiple-constraint-profiles}

Если для пользователя активно несколько профилей, то ограничения объединяются. Процесс объединения зависит от `settings_constraints_replace_previous`:
- **true** (рекомендуется): ограничения для одной и той же настройки заменяются во время объединения, так что используется последнее ограничение, а все предыдущие игнорируются. Это включает поля, которые не установлены в новом ограничении.
- **false** (по умолчанию): ограничения для одной и той же настройки объединяются таким образом, что каждый неустановленный тип ограничения берется из предыдущего профиля, а каждый установленный тип ограничения заменяется значением из нового профиля.

## Режим только для чтения {#read-only}

Режим только для чтения включается с помощью настройки `readonly`, которая не должна путаться с типом ограничения `readonly`:
- `readonly=0`: Нет ограничений только для чтения.
- `readonly=1`: Разрешены только запросы на чтение, и настройки не могут быть изменены, если не установлено `changeable_in_readonly`.
- `readonly=2`: Разрешены только запросы на чтение, но настройки могут быть изменены, кроме самой настройки `readonly`.

### Пример {#example-read-only}

Пусть `users.xml` содержит следующие строки:

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

Следующие запросы вызовут исключения:

```sql
SET max_memory_usage=20000000001;
SET max_memory_usage=4999999999;
SET force_index_by_date=1;
```

```text
Код: 452, e.displayText() = DB::Exception: Настройка max_memory_usage не должна превышать 20000000000.
Код: 452, e.displayText() = DB::Exception: Настройка max_memory_usage не должна быть меньше 5000000000.
Код: 452, e.displayText() = DB::Exception: Настройка force_index_by_date не может быть изменена.
```

:::note
Профиль `default` обрабатывается уникально: все ограничения, определенные для профиля `default`, становятся ограничениями по умолчанию, поэтому они ограничивают всех пользователей, пока не будут явно переопределены для этих пользователей.
:::

## Ограничения для настроек MergeTree {#constraints-on-merge-tree-settings}

Возможно установить ограничения для [настроек merge tree](merge-tree-settings.md). Эти ограничения применяются, когда создается таблица с движком MergeTree или изменяются её настройки хранения.

Имя настройки merge tree должно быть предварено префиксом `merge_tree_`, когда оно упоминается в разделе `<constraints>`.

### Пример {#example-mergetree}

Вы можете запретить создание новых таблиц с явно указанной `storage_policy`.

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
