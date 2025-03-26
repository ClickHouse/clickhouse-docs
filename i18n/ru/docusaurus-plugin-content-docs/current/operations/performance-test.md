---
description: 'Руководство по тестированию и оценке производительности оборудования с помощью ClickHouse'
sidebar_label: 'Тестирование оборудования'
sidebar_position: 54
slug: /operations/performance-test
title: 'Как протестировать ваше оборудование с помощью ClickHouse'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

Вы можете провести базовое тестирование производительности ClickHouse на любом сервере без установки пакетов ClickHouse.


## Автоматический запуск {#automated-run}

Вы можете запустить бенчмарк с помощью одного скрипта.

1. Скачайте скрипт.
```bash
wget https://raw.githubusercontent.com/ClickHouse/ClickBench/main/hardware/hardware.sh
```

2. Запустите скрипт.
```bash
chmod a+x ./hardware.sh
./hardware.sh
```

3. Скопируйте вывод и отправьте его на feedback@clickhouse.com

Все результаты опубликованы здесь: https://clickhouse.com/benchmark/hardware/
