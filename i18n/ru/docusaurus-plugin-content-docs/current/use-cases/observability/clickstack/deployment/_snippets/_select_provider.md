import Image from '@theme/IdealImage';
import provider_selection from '@site/static/images/clickstack/getting-started/provider_selection.png';
import advanced_resources from '@site/static/images/clickstack/getting-started/advanced_resources.png';
import service_provisioned from '@site/static/images/clickstack/getting-started/service_provisioned.png';

Выберите облачного провайдера, регион, в котором вы хотите развернуть сервис, и объём данных в месяц с помощью раскрывающегося списка «Memory and Scaling».

Укажите приблизительную оценку объёма данных (журналы или трассировки) в несжатом виде.

<Image img={provider_selection} size="md" alt="Выбор ресурсов" border />

Эта оценка будет использована для определения объёма вычислительных ресурсов, поддерживающих ваш управляемый сервис ClickStack. По умолчанию новые организации попадают на уровень [Scale tier](/cloud/manage/cloud-tiers). [Vertical autoscaling](/manage/scaling#vertical-auto-scaling) включено по умолчанию на уровне Scale tier. Позже вы можете изменить уровень вашей организации на странице [Plans](/cloud/manage/cloud-tiers#plans).

Опытные пользователи, хорошо понимающие свои требования, могут вместо этого указать точные ресурсы, которые нужно выделить, а также любые корпоративные возможности, выбрав «Custom Configuration» в раскрывающемся списке «Memory and Scaling».

<Image img={advanced_resources} size="md" alt="Расширенный выбор ресурсов" border />

После указания требований вашему управляемому сервису ClickStack потребуется несколько минут на развёртывание. Завершение развёртывания будет отображено на следующей странице «ClickStack». Вы можете изучить остальную часть [консоли ClickHouse Cloud](/cloud/overview), пока идёт развёртывание.

<Image img={service_provisioned} size="md" alt="Сервис развёрнут" border />

После завершения развёртывания выберите «Start Ingestion».
