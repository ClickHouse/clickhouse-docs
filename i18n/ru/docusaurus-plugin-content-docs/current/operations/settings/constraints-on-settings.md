---
description: 'Ограничения на настройки можно задать в разделе `profiles` конфигурационного файла `user.xml` и тем самым запретить пользователям изменять некоторые параметры с помощью запроса `SET`.'
sidebar_label: 'Ограничения на настройки'
sidebar_position: 62
slug: /operations/settings/constraints-on-settings
title: 'Ограничения на настройки'
doc_type: 'reference'
---



# Ограничения для настроек



## Обзор {#overview}

В ClickHouse «ограничения» (constraints) на настройки — это лимиты и правила, которые
можно назначать параметрам конфигурации. Эти ограничения применяются для обеспечения
стабильности, безопасности и предсказуемого поведения базы данных.


## Определение ограничений {#defining-constraints}

Ограничения на настройки можно определить в секции `profiles` конфигурационного
файла `user.xml`. Они запрещают пользователям изменять определённые настройки с помощью
оператора [`SET`](/sql-reference/statements/set).

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

При попытке нарушить ограничения будет выброшено исключение, и
настройка останется неизменной.


## Типы ограничений {#types-of-constraints}

В ClickHouse поддерживается несколько типов ограничений:

- `min`
- `max`
- `disallowed`
- `readonly` (с псевдонимом `const`)
- `changeable_in_readonly`

Ограничения `min` и `max` задают верхнюю и нижнюю границы для числовой
настройки и могут использоваться совместно.

Ограничение `disallowed` используется для указания конкретных значений, которые не должны
быть разрешены для определённой настройки.

Ограничение `readonly` или `const` указывает, что пользователь не может изменять
соответствующую настройку.

Тип ограничения `changeable_in_readonly` позволяет пользователям изменять настройку
в пределах диапазона `min`/`max`, даже если настройка `readonly` установлена в `1`.
В противном случае изменение настроек в режиме `readonly=1` запрещено.

:::note
`changeable_in_readonly` поддерживается только при включённой настройке `settings_constraints_replace_previous`:

```xml
<access_control_improvements>
  <settings_constraints_replace_previous>true</settings_constraints_replace_previous>
</access_control_improvements>
```

:::


## Несколько профилей ограничений {#multiple-constraint-profiles}

Если для пользователя активно несколько профилей, ограничения объединяются.
Процесс объединения зависит от параметра `settings_constraints_replace_previous`:

- **true** (рекомендуется): ограничения для одной и той же настройки заменяются при
  объединении, так что используется последнее ограничение, а все предыдущие игнорируются.
  Это относится и к полям, которые не заданы в новом ограничении.
- **false** (по умолчанию): ограничения для одной и той же настройки объединяются таким образом, что
  каждый незаданный тип ограничения берется из предыдущего профиля, а каждый
  заданный тип ограничения заменяется значением из нового профиля.


## Режим только для чтения {#read-only}

Режим только для чтения включается с помощью настройки `readonly`, которую не следует путать
с типом ограничения `readonly`:

- `readonly=0`: Ограничения режима только для чтения отсутствуют.
- `readonly=1`: Разрешены только запросы на чтение, настройки изменять нельзя,
  если не установлен параметр `changeable_in_readonly`.
- `readonly=2`: Разрешены только запросы на чтение, но настройки можно изменять,
  за исключением самой настройки `readonly`.

### Пример {#example-read-only}

Пусть файл `users.xml` содержит следующие строки:

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
Code: 452, e.displayText() = DB::Exception: Настройка max_memory_usage не должна превышать 20000000000.
Code: 452, e.displayText() = DB::Exception: Настройка max_memory_usage не должна быть меньше 5000000000.
Code: 452, e.displayText() = DB::Exception: Настройка force_index_by_date не должна изменяться.
```

:::note
Профиль `default` обрабатывается особым образом: все ограничения, определенные для
профиля `default`, становятся ограничениями по умолчанию и применяются ко всем пользователям
до тех пор, пока не будут явно переопределены для конкретных пользователей.
:::


## Ограничения настроек MergeTree {#constraints-on-merge-tree-settings}

Можно задать ограничения для [настроек MergeTree](merge-tree-settings.md).
Эти ограничения применяются при создании таблицы с движком MergeTree
или при изменении настроек её хранилища.

Имя настройки MergeTree должно начинаться с префикса `merge_tree_` при
указании в секции `<constraints>`.

### Пример {#example-mergetree}

Можно запретить создание новых таблиц с явно указанной настройкой `storage_policy`

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
