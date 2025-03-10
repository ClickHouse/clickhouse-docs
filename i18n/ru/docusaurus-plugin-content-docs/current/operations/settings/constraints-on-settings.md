---
slug: /operations/settings/constraints-on-settings
sidebar_position: 62
sidebar_label: Ограничения на настройки
title: "Ограничения на настройки"
description: "Ограничения на настройки могут быть определены в разделе `profiles` файла конфигурации `user.xml` и запрещают пользователям изменять некоторые настройки с помощью запроса `SET`."
---


# Ограничения на настройки

Ограничения на настройки могут быть определены в разделе `profiles` файла конфигурации `user.xml` и запрещают пользователям изменять некоторые настройки с помощью запроса `SET`. Ограничения определены следующим образом:

``` xml
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

Если пользователь попытается нарушить ограничения, будет выброшено исключение, и настройка не будет изменена. Поддерживаются несколько типов ограничений: `min`, `max`, `readonly` (синоним `const`) и `changeable_in_readonly`. Ограничения `min` и `max` указывают верхние и нижние границы для числовых настроек и могут использоваться в комбинации. Ограничение `readonly` или `const` указывает на то, что пользователь не может изменять соответствующую настройку вообще. Тип ограничения `changeable_in_readonly` позволяет пользователю изменять настройку в пределах диапазона `min`/`max`, даже если настройка `readonly` установлена в 1, в противном случае изменения в настройках не разрешены в режиме `readonly=1`. Обратите внимание, что `changeable_in_readonly` поддерживается только если включено `settings_constraints_replace_previous`:
``` xml
<access_control_improvements>
  <settings_constraints_replace_previous>true</settings_constraints_replace_previous>
</access_control_improvements>
```

Если у пользователя активны несколько профилей, то ограничения объединяются. Процесс объединения зависит от `settings_constraints_replace_previous`:
- **true** (рекомендуется): ограничения для одной и той же настройки заменяются в процессе объединения, так чтобы последнее ограничение использовалось, а все предыдущие игнорировались, включая поля, которые не указаны в новом ограничении.
- **false** (по умолчанию): ограничения для одной и той же настройки объединяются таким образом, что каждый не установленный тип ограничения берется из предыдущего профиля, а каждый установленный тип ограничения заменяется значением из нового профиля.

Режим исключительно для чтения включается с помощью настройки `readonly` (чтобы не путать с типом ограничения `readonly`):
- `readonly=0`: Нет ограничений на чтение.
- `readonly=1`: Разрешены только запросы на чтение, и настройки не могут быть изменены, если не установлено `changeable_in_readonly`.
- `readonly=2`: Разрешены только запросы на чтение, но настройки могут быть изменены, кроме самой настройки `readonly`.


**Пример:** Пусть `users.xml` содержит строки:

``` xml
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

Следующие запросы все выбрасывают исключения:

``` sql
SET max_memory_usage=20000000001;
SET max_memory_usage=4999999999;
SET force_index_by_date=1;
```

``` text
Код: 452, e.displayText() = DB::Exception: Настройка max_memory_usage не должна превышать 20000000000.
Код: 452, e.displayText() = DB::Exception: Настройка max_memory_usage не должна быть меньше 5000000000.
Код: 452, e.displayText() = DB::Exception: Настройка force_index_by_date не должна изменяться.
```

**Примечание:** профиль `default` имеет специальную обработку: все ограничения, определенные для профиля `default`, становятся ограничениями по умолчанию, поэтому они ограничивают всех пользователей, пока не будут явно переопределены для этих пользователей.

## Ограничения на настройки Merge Tree {#constraints-on-merge-tree-settings}
Возможно установить ограничения для [настроек merge tree](merge-tree-settings.md). Эти ограничения применяются при создании таблицы с движком merge tree или при изменении ее настроек хранения. Имя настройки merge tree должно начинаться с префикса `merge_tree_` при ссылке в разделе `<constraints>`.

**Пример:** Запретить создание новых таблиц с явно указанной `storage_policy`

``` xml
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
