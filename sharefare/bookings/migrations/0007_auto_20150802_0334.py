# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('bookings', '0006_auto_20150802_0333'),
    ]

    operations = [
        migrations.AlterField(
            model_name='booking',
            name='Booking_ID',
            field=models.AutoField(serialize=False, primary_key=True),
        ),
        migrations.AlterField(
            model_name='transaction',
            name='Transaction_ID',
            field=models.AutoField(serialize=False, primary_key=True),
        ),
        migrations.AlterField(
            model_name='user',
            name='User_ID',
            field=models.AutoField(serialize=False, primary_key=True),
        ),
    ]
