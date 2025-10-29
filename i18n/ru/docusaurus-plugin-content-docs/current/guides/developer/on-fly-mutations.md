---
'slug': '/guides/developer/on-the-fly-mutations'
'sidebar_label': 'Мутация на лету'
'title': 'На лету мутации'
'keywords':
- 'On-the-fly mutation'
'description': 'Представляет описание мутаций на лету'
'doc_type': 'guide'
---
## Мутации на лету {#on-the-fly-mutations}

Когда мутации на лету включены, обновленные строки помечаются как обновленные немедленно, и последующие запросы `SELECT` будут автоматически возвращать измененные значения. Когда мутации на лету не включены, вам может потребоваться подождать, пока ваши мутации будут применены через фоновый процесс, чтобы увидеть измененные значения.

Мутации на лету могут быть включены для таблиц семейства `MergeTree`, активировав параметр уровня запроса `apply_mutations_on_fly`.

```sql
SET apply_mutations_on_fly = 1;
```

## Пример {#example}

Давайте создадим таблицу и выполним несколько мутаций:
```sql
CREATE TABLE test_on_fly_mutations (id UInt64, v String)
ENGINE = MergeTree ORDER BY id;

-- Disable background materialization of mutations to showcase
-- default behavior when on-the-fly mutations are not enabled
SYSTEM STOP MERGES test_on_fly_mutations;
SET mutations_sync = 0;

-- Insert some rows in our new table
INSERT INTO test_on_fly_mutations VALUES (1, 'a'), (2, 'b'), (3, 'c');

-- Update the values of the rows
ALTER TABLE test_on_fly_mutations UPDATE v = 'd' WHERE id = 1;
ALTER TABLE test_on_fly_mutations DELETE WHERE v = 'd';
ALTER TABLE test_on_fly_mutations UPDATE v = 'e' WHERE id = 2;
ALTER TABLE test_on_fly_mutations DELETE WHERE v = 'e';
```

Проверим результат обновлений с помощью запроса `SELECT`:

```sql
-- Explicitly disable on-the-fly-mutations
SET apply_mutations_on_fly = 0;

SELECT id, v FROM test_on_fly_mutations ORDER BY id;
```

Обратите внимание, что значения строк еще не обновлены, когда мы запрашиваем новую таблицу:

```response
┌─id─┬─v─┐
│  1 │ a │
│  2 │ b │
│  3 │ c │
└────┴───┘
```

Теперь давайте посмотрим, что происходит, когда мы включаем мутации на лету:

```sql
-- Enable on-the-fly mutations
SET apply_mutations_on_fly = 1;

SELECT id, v FROM test_on_fly_mutations ORDER BY id;
```

Запрос `SELECT` теперь сразу возвращает правильный результат, без необходимости ждать применения мутаций:

```response
┌─id─┬─v─┐
│  3 │ c │
└────┴───┘
```

## Влияние на производительность {#performance-impact}

Когда мутации на лету включены, мутации не материализуются немедленно, а будут применяться только во время запросов `SELECT`. Однако, обратите внимание, что мутации все еще материализуются асинхронно в фоновом режиме, что является тяжелым процессом.

Если количество поданных мутаций постоянно превышает количество мутаций, которые обрабатываются в фоновом режиме за некоторый интервал времени, очередь нематериализованных мутаций, которые должны быть применены, будет продолжать расти. Это приведет к ухудшению производительности запросов `SELECT`.

Мы рекомендуем включить параметр `apply_mutations_on_fly` вместе с другими параметрами уровня `MergeTree`, такими как `number_of_mutations_to_throw` и `number_of_mutations_to_delay`, чтобы ограничить бесконечный рост нематериализованных мутаций.

## Поддержка подзапросов и недетерминированных функций {#support-for-subqueries-and-non-deterministic-functions}

Мутации на лету имеют ограниченную поддержку с подзапросами и недетерминированными функциями. Поддерживаются только скалярные подзапросы с разумным размером результата (контролируемые параметром `mutations_max_literal_size_to_replace`). Поддерживаются только постоянные недетерминированные функции (например, функция `now()`).

Эти поведения контролируются следующими настройками:

- `mutations_execute_nondeterministic_on_initiator` - если true, недетерминированные функции выполняются на инициаторе реплики и заменяются как литералы в запросах `UPDATE` и `DELETE`. Значение по умолчанию: `false`.
- `mutations_execute_subqueries_on_initiator` - если true, скалярные подзапросы выполняются на инициаторе реплики и заменяются как литералы в запросах `UPDATE` и `DELETE`. Значение по умолчанию: `false`.
- `mutations_max_literal_size_to_replace` - максимальный размер сериализованных литералов в байтах для замены в запросах `UPDATE` и `DELETE`. Значение по умолчанию: `16384` (16 KiB).