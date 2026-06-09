import Image from '@theme/IdealImage';
import clickstack_cloud from '@site/static/images/use-cases/observability/clickstack-cloud-first-time.png';
import clickstack_start_ingestion from '@site/static/images/use-cases/observability/clickstack-start-ingestion.png';
import clickstack_start_exploring from '@site/static/images/use-cases/observability/clickstack-start-exploring.png';
import clickstack_search from '@site/static/images/use-cases/observability/clickstack-search.png';

Откройте свой сервис в [консоли ClickHouse Cloud](https://console.clickhouse.cloud), выберите **ClickStack** в левом меню, а затем **Start Ingestion**.

<Image img={clickstack_cloud} size="lg" alt="Запуск ClickStack" border />

Следующий шаг можно пропустить, так как коллектор у вас уже настроен. Нажмите **Launch ClickStack**, чтобы продолжить.

ClickStack откроется в новой вкладке, и вы должны автоматически перейти на страницу **Getting Started**. Если этого не произошло, выберите **Getting Started** в левом меню, затем нажмите **Start Ingestion**, а после этого — **Next**.

<Image img={clickstack_start_ingestion} size="lg" alt="ClickStack Start Ingestion" border />

ClickStack должен автоматически обнаружить ваши таблицы и данные телеметрии, чтобы вы могли продолжить. Выберите **Start Exploring**, чтобы перейти к просмотру данных трассировки.

<Image img={clickstack_start_exploring} size="lg" alt="ClickStack Start Exploring" border />

Переключите source на `Logs` и установите диапазон времени **Last 15 minutes**. Синтетические журналы из `otelgen` должны появиться в течение нескольких секунд.

<Image img={clickstack_search} size="lg" alt="Представление Search view в ClickStack с появляющимися журналами" />

Если ничего не отображается:

* Убедитесь, что значение auth header, передаваемое в `otelgen`, совпадает с тем, которое ожидает ваш коллектор.
* Проверьте журналы коллектора и поищите ошибки экспорта.
* Убедитесь, что конечная точка ClickHouse, настроенная в коллекторе, включает и протокол, и порт (`https://...:8443`).