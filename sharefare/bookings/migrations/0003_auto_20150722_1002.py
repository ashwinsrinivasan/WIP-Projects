# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('bookings', '0002_auto_20150722_0958'),
    ]

    operations = [
        migrations.AlterField(
            model_name='booking',
            name='Guest_ID',
            field=models.ForeignKey(related_name='Guest_FK', to='bookings.User'),
        ),
        migrations.AlterField(
            model_name='booking',
            name='Host_ID',
            field=models.ForeignKey(related_name='Host_FK', to='bookings.User'),
        ),
    ]
