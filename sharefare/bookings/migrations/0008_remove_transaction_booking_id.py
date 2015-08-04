# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('bookings', '0007_auto_20150802_0334'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='transaction',
            name='Booking_ID',
        ),
    ]
