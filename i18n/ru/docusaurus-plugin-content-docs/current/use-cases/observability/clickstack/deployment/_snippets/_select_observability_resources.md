import Image from '@theme/IdealImage';
import provider_selection from '@site/static/images/clickstack/getting-started/provider_selection.png';
import advanced_resources from '@site/static/images/clickstack/getting-started/advanced_resources.png';
import service_provisioned from '@site/static/images/clickstack/getting-started/service_provisioned.png';

Выберите облачного провайдера, регион, в котором вы хотите выполнить развертывание, и объём данных в месяц с помощью раскрывающегося списка &#39;Memory and Scaling&#39;.

Это должна быть приблизительная оценка объёма ваших данных — логов или трейсов — в несжатом виде.

<Image img={provider_selection} size="md" alt="Селектор ресурсов" border />

Эта оценка будет использована для подбора вычислительных ресурсов, поддерживающих ваш Managed ClickStack сервис. По умолчанию новые организации назначаются на [Scale tier](/cloud/manage/cloud-tiers). [Vertical autoscaling](/manage/scaling#vertical-auto-scaling) будет включено по умолчанию на уровне Scale. Вы можете изменить уровень своей организации позже на странице &#39;Plans&#39;.

Продвинутые пользователи, хорошо понимающие свои требования, могут вместо этого указать точные выделяемые ресурсы, а также любые корпоративные функции, выбрав &#39;Custom Configuration&#39; в раскрывающемся списке &#39;Memory and Scaling&#39;.

<Image img={advanced_resources} size="md" alt="Расширенный селектор ресурсов" border />

После того как вы определите требования, на подготовку вашего Managed ClickStack сервиса потребуется несколько минут. Завершение подготовки будет отображаться на следующей странице &#39;ClickStack&#39;. Пока идёт подготовка, вы можете изучить остальные разделы [консоли ClickHouse Cloud](/cloud/overview).

<Image img={service_provisioned} size="md" alt="Сервис подготовлен" border />

После завершения подготовки выберите &#39;Start Ingestion&#39;.
