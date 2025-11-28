from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('notifications', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='NotificationJobStatus',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('job_name', models.CharField(choices=[('low_stock_digest', 'Low stock digest'), ('daily_summary', 'Daily summary')], max_length=50, unique=True)),
                ('last_run_at', models.DateTimeField(blank=True, null=True)),
                ('next_run_at', models.DateTimeField(blank=True, null=True)),
                ('last_status', models.CharField(choices=[('idle', 'Idle'), ('running', 'Running'), ('success', 'Success'), ('failed', 'Failed')], default='idle', max_length=20)),
                ('last_duration_ms', models.IntegerField(blank=True, null=True)),
                ('last_message', models.TextField(blank=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('triggered_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='triggered_notification_jobs', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['job_name'],
            },
        ),
    ]

