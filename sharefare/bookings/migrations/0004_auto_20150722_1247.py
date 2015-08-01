# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('bookings', '0003_auto_20150722_1002'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='listing',
            name='Car',
        ),
        migrations.AddField(
            model_name='wallet',
            name='Booking_ID',
            field=models.ForeignKey(related_name='Wallet_Booking_FK', default=0, to='bookings.Booking'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='booking',
            name='Guest_ID',
            field=models.ForeignKey(related_name='Booking_Guest_FK', to='bookings.User'),
        ),
        migrations.AlterField(
            model_name='booking',
            name='Host_ID',
            field=models.ForeignKey(related_name='Booking_Host_FK', to='bookings.User'),
        ),
        migrations.AlterField(
            model_name='listing',
            name='Host_ID',
            field=models.ForeignKey(related_name='Listing_Host_FK', to='bookings.User'),
        ),
        migrations.AlterField(
            model_name='transaction',
            name='Booking_ID',
            field=models.ForeignKey(related_name='Trans_Booking_FK', to='bookings.Booking'),
        ),
        migrations.AlterField(
            model_name='transaction',
            name='Guest_ID',
            field=models.ForeignKey(related_name='Trans_Guest_FK', to='bookings.User'),
        ),
        migrations.AlterField(
            model_name='transaction',
            name='Host_ID',
            field=models.ForeignKey(related_name='Trans_Host_FK', to='bookings.User'),
        ),
        migrations.AlterField(
            model_name='wallet',
            name='Transaction_ID',
            field=models.ForeignKey(related_name='Wallet_Trans_FK', to='bookings.Transaction'),
        ),
    ]
