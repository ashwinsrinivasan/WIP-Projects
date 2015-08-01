# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('bookings', '0005_auto_20150722_1317'),
    ]

    operations = [
        migrations.AlterField(
            model_name='listing',
            name='Listing_ID',
            field=models.AutoField(serialize=False, primary_key=True),
        ),
    ]
