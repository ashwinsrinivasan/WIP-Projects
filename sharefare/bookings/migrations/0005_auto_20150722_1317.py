# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('bookings', '0004_auto_20150722_1247'),
    ]

    operations = [
        migrations.AlterField(
            model_name='wallet',
            name='User_ID',
            field=models.ForeignKey(related_name='Wallet_ID_FK', primary_key=True, serialize=False, to='bookings.User'),
        ),
    ]
