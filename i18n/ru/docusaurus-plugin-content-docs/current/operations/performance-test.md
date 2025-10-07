---
slug: '/operations/performance-test'
sidebar_label: 'Тестирование оборудования'
sidebar_position: 54
description: 'Используйте ClickHouse для проведения тестирования производительности'
title: 'Как протестировать ваше оборудование с ClickHouse'
doc_type: guide
---
import SelfManaged from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

Вы можете выполнить базовый тест производительности ClickHouse на любом сервере без установки пакетов ClickHouse.

## Автоматический запуск {#automated-run}

Вы можете запустить бенчмарк с помощью одного скрипта.

1. Скачать скрипт.
```bash
wget https://raw.githubusercontent.com/ClickHouse/ClickBench/main/hardware/hardware.sh
```

2. Запустить скрипт.
```bash
chmod a+x ./hardware.sh
./hardware.sh
```

3. Скопировать вывод и отправить его на feedback@clickhouse.com

Все результаты опубликованы здесь: https://clickhouse.com/benchmark/hardware/