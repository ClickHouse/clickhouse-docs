:::important best practices
При настройке ClickHouse Server путём добавления или редактирования конфигурационных файлов следует:

- Добавлять файлы в каталог `/etc/clickhouse-server/config.d/`
- Добавлять файлы в каталог `/etc/clickhouse-server/users.d/`
- Оставлять файл `/etc/clickhouse-server/config.xml` без изменений
- Оставлять файл `/etc/clickhouse-server/users.xml` без изменений 
:::