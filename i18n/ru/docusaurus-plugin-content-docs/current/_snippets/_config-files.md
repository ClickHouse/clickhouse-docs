:::important best practices
При настройке ClickHouse Server путем добавления или редактирования конфигурационных файлов, вы должны:
- Добавлять файлы в директорию `/etc/clickhouse-server/config.d/`
- Добавлять файлы в директорию `/etc/clickhouse-server/users.d/`
- Оставить файл `/etc/clickhouse-server/config.xml` без изменений
- Оставить файл `/etc/clickhouse-server/users.xml` без изменений 
:::
