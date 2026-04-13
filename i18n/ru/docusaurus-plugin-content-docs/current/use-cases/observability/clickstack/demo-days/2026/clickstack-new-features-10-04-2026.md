---
slug: /use-cases/observability/clickstack/demo-days/2026/04/10-04-2026
title: "Демо-дни — 10/04/2026"
sidebar_label: "10/04/2026"
pagination_prev: null
pagination_next: null
description: "Демо-дни ClickStack от 10/04/2026"
doc_type: "guide"
keywords: ["ClickStack", "Демо-дни"]
---

## Закрепляемые фильтры источников данных \{#pinnable-datasource-filters\}

*Демо от [@brandon-pereira](https://github.com/brandon-pereira)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/j-b1ztSl8IQ" title="Видеоплеер YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

Теперь команды могут закреплять фильтры источников данных и делиться ими со всей командой. Если нажать на значок закрепления у любого фильтра, можно выбрать: закрепить его только для себя или сделать доступным для всех. Общие фильтры отображаются в отдельном разделе в верхней части списка фильтров, поэтому любому участнику команды легко найти и применить их, даже не зная точного имени фильтра.

Это была одна из самых востребованных функций в сообществе. Теперь командам больше не нужно передавать настройки фильтров в сторонних каналах. Общие фильтры становятся видимыми для всех пользователей сразу после закрепления, и делиться можно не только ключами фильтров, но и их конкретными значениями, так что вместе с фильтром передаётся полный контекст.

**Связанные PR:** [#2047](https://github.com/hyperdxio/hyperdx/pull/2047) [HDX-2300] introduce Shared Filters for team-wide filter visibility and discoverability

## Вывод сервиса из спящего режима в ClickStack Cloud \{#waking-service-from-clickstack-cloud\}

*Демо от [@brandon-pereira](https://github.com/brandon-pereira)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/Od7X0NOCqY0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

Пользователи ClickStack Cloud теперь могут выводить спящий сервис из спящего режима прямо в приложении. Раньше, если ваш сервис переходил в спящий режим, вы видели запрос &quot;retry&quot;, но приложение не выводило сервис из спящего режима автоматически. Нужно было перейти в ClickStack Cloud, вручную вывести его из спящего режима, затем вернуться и самостоятельно нажать retry.

Теперь приложение само выполняет весь процесс. Когда сервис находится в спящем режиме, отображается запрос &quot;wake service&quot;, и приложение выполняет всё необходимое без необходимости покидать текущий экран. Это небольшое, но полезное улучшение убирает раздражающее многошаговое прерывание из рабочего процесса, особенно если вы открываете ClickStack после периода бездействия и хотите сразу перейти к данным.

## Единообразное включение AI-функций \{#consistent-enabling-of-ai-features\}

*Демо от [@brandon-pereira](https://github.com/brandon-pereira)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/zS5OekPCzC0" title="Видеоплеер YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

AI-функции в ClickStack теперь включаются и отключаются исключительно через плоскость управления ClickHouse Cloud, которая стала единым источником истины. Раньше было два несвязанных флажка: один в плоскости управления ClickStack, а другой — в самом приложении. Включение одного из них не гарантировало, что второй находится в том же состоянии, из-за чего было непонятно, действительно ли AI активирован.

Теперь флажок внутри ClickStack просто ведёт в ClickHouse Cloud и в остальном неактивен. Если переключить тумблер в ClickHouse Cloud, функция автоматически станет доступна в ClickStack. Это делает включение AI единообразным и предсказуемым и избавляет от необходимости гадать, какой именно параметр на самом деле управляет этим поведением.

## Оповещения для сырого SQL \{#raw-sql-alerting\}

*Демо от [@pulpdrew](https://github.com/pulpdrew)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/bYYcYHkyy2E" title="Проигрыватель видео YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

Теперь для линейных графиков на основе сырого SQL доступны оповещения, что расширяет существующие возможности визуализации на сыром SQL и добавляет поддержку уведомлений по пороговым значениям. Если у вас есть линейный график, построенный на основе пользовательского SQL-запроса, вы можете добавить к нему оповещение и настроить его так же, как и для любого другого графика. Сейчас это доступно для линейных и столбчатых диаграмм, поскольку для корректной работы сравнения с порогом требуются параметры интервала и диапазона дат.

Это открывает действительно мощные сценарии использования. В демо показан запрос, который подсчитывает ошибки в текущем интервале и сравнивает результат с 30 предыдущими интервалами, отмечая случаи, когда значение более чем на два стандартных отклонения превышает историческую норму. Такой статистический поиск аномалий теперь сводится к тому, чтобы написать правильный SQL и задать порог. Настройка оповещения находится в редакторе графика в сворачиваемом разделе, благодаря чему интерфейс остается чистым, пока эта функция действительно не понадобится.

**Связанные PR:** [#2073](https://github.com/hyperdxio/hyperdx/pull/2073) feat: Реализовать оповещения для тайлов дашборда на основе сырого SQL, [#2085](https://github.com/hyperdxio/hyperdx/pull/2085) refactor: Создать компонент TileAlertEditor

## Улучшения HyperDX TUI \{#hyperdx-tui-improvements\}

*Демо от [@wrn14897](https://github.com/wrn14897)*

<iframe width="768" height="432" src="https://www.youtube.com/embed/cIigBpcrYlw" title="Видеоплеер YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

Начать работать с терминальным интерфейсом HyperDX становится всё проще. Теперь его можно установить глобально с помощью `npm install -g @hyperdx/cli`, а затем запустить командой `hdx`. Используйте флаг `--tui`, чтобы сразу открыть интерактивный терминальный интерфейс. Бинарный файл также доступен через `npm` как `hdx`, поэтому после установки пакета отдельный шаг установки не требуется.

На этой неделе вместе с улучшениями установки появились две заметные функции. Сообщения об ошибках теперь отображаются в терминале с корректной подсветкой и структурированным представлением, повторяя шаблоны форматирования веб-интерфейса, так что вы получаете одинаковый уровень детализации независимо от того, работаете ли вы в браузере или в TUI. Также появился новый предпросмотр SQL, чтобы вы могли видеть выполняемый запрос. Кроме того, новая страница оповещений доступна через `Shift+A` из просмотрщика событий и даёт обзор всех настроенных оповещений и истории их недавних срабатываний, не выходя из терминала.

**Связанные PR:** [#2095](https://github.com/hyperdxio/hyperdx/pull/2095) [HDX-3966] Улучшить отображение сообщений об ошибках в TUI и добавить предпросмотр SQL, [#2093](https://github.com/hyperdxio/hyperdx/pull/2093) [HDX-3969] Добавить страницу оповещений (Shift+A) с обзором и недавней историей, [#2043](https://github.com/hyperdxio/hyperdx/pull/2043) [HDX-3919] Добавить пакет @hyperdx/cli, [#2101](https://github.com/hyperdxio/hyperdx/pull/2101) [HDX-3976] CLI: перейти с apiUrl на appUrl с интерактивным процессом входа