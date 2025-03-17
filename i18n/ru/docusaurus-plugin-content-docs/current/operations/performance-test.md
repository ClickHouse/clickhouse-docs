---
slug: /operations/performance-test
sidebar_position: 54
sidebar_label: Тестирование оборудования
title: "Как протестировать ваше оборудование с помощью ClickHouse"
---

import SelfManaged from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

Вы можете провести базовый тест производительности ClickHouse на любом сервере без установки пакетов ClickHouse.


## Автоматизированный запуск {#automated-run}

Вы можете запустить тест с помощью одного скрипта.

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
