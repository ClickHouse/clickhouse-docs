
## Терминология {#terminology}
### Реплика {#replica}
Копия данных. ClickHouse всегда имеет хотя бы одну копию ваших данных, и минимальное количество **реплик** составляет одну. Это важный момент, вы можете не привыкнуть считать оригинальную копию ваших данных как реплику, но именно такой термин используется в коде и документации ClickHouse. Добавление второй реплики ваших данных обеспечивает отказоустойчивость.

### Шард {#shard}
Подмножество данных. ClickHouse всегда имеет хотя бы один шард для ваших данных, поэтому если вы не разделяете данные на несколько серверов, ваши данные будут храниться в одном шарде. Шардирование данных на несколько серверов можно использовать для распределения нагрузки, если вы превышаете мощность одного сервера. Целевой сервер определяется по **шифрующему ключу**, который задаётся при создании распределенной таблицы. Шифрующий ключ может быть случайным или являться результатом [хеш-функции](/sql-reference/functions/hash-functions). Примеры развертывания, связанные с шардированием, будут использовать `rand()` в качестве шифрующего ключа и предоставят дополнительную информацию о том, когда и как выбрать другой шифрующий ключ.

### Распределённая координация {#distributed-coordination}
ClickHouse Keeper предоставляет систему координации для репликации данных и выполнения распределённых DDL запросов. ClickHouse Keeper совместим с Apache ZooKeeper.
