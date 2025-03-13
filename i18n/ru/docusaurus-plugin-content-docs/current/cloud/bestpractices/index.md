---
slug: /cloud/bestpractices
keywords: ['Cloud', 'Best Practices', 'Bulk Inserts', 'Asynchronous Inserts', 'Avoid Mutations', 'Avoid Nullable Columns', 'Avoid Optimize Final', 'Low Cardinality Partitioning Key']
title: 'Обзор'
hide_title: true
---


# Лучшие практики в ClickHouse

В этом разделе представлены шесть лучших практик, которых вы должны придерживаться, чтобы извлечь максимальную пользу из ClickHouse Cloud.

| Страница                                                     | Описание                                                                |
|----------------------------------------------------------|----------------------------------------------------------------------------|
| [Используйте массовую вставку](/cloud/bestpractices/bulk-inserts)                                  | Узнайте, почему вам следует загружать данные массово в ClickHouse         |
| [Асинхронные вставки](/cloud/bestpractices/asynchronous-inserts)                              | Узнайте, как асинхронно вставлять данные, если массовая вставка не вариант. |
| [Избегайте мутаций](/cloud/bestpractices/avoid-mutations)                                   | Узнайте, почему вам следует избегать мутаций, которые вызывают перезаписи.               |
| [Избегайте Nullable колонок](/cloud/bestpractices/avoid-nullable-columns)                            | Узнайте, почему вам лучше избегать Nullable колонок                        |
| [Избегайте OPTIMIZE TABLE ... FINAL](/cloud/bestpractices/avoid-optimize-final)                              | Узнайте, почему вам следует избегать `OPTIMIZE TABLE ... FINAL`                      |
| [Выберите ключ партиции с низкой кардинальностью](/cloud/bestpractices/low-cardinality-partitioning-key)         | Узнайте, как выбрать ключ партиции с низкой кардинальностью.                    |
| [Ограничения использования](/cloud/bestpractices/usage-limits)| Изучите ограничения ClickHouse.                                          |
