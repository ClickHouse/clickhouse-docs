---
description: 'Руководство по тестированию и бенчмаркингу производительности оборудования с ClickHouse'
sidebar_label: 'Тестирование оборудования'
sidebar_position: 54
slug: /operations/performance-test
title: 'Как протестировать оборудование с помощью ClickHouse'
doc_type: 'guide'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

Вы можете запустить базовый тест производительности ClickHouse на любом сервере, не устанавливая пакеты ClickHouse.


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

3. Скопируйте результат и отправьте его на адрес feedback@clickhouse.com

Все результаты опубликованы здесь: https://clickhouse.com/benchmark/hardware/
