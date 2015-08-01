# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Booking',
            fields=[
                ('Booking_ID', models.PositiveIntegerField(serialize=False, primary_key=True)),
                ('Host_ID', models.PositiveIntegerField()),
                ('Guest_ID', models.PositiveIntegerField()),
                ('Time', models.DateTimeField()),
                ('From', models.CharField(max_length=30)),
                ('To', models.CharField(max_length=30)),
                ('Via', models.CharField(max_length=30)),
                ('Distance', models.DecimalField(max_digits=6, decimal_places=2)),
                ('Cost', models.DecimalField(max_digits=6, decimal_places=2)),
            ],
        ),
        migrations.CreateModel(
            name='Listing',
            fields=[
                ('Listing_ID', models.PositiveIntegerField(serialize=False, primary_key=True)),
                ('From', models.CharField(max_length=30)),
                ('To', models.CharField(max_length=30)),
                ('Via', models.CharField(max_length=30)),
                ('Host_ID', models.PositiveIntegerField()),
                ('Start_Time', models.DateTimeField()),
                ('Car', models.CharField(max_length=15)),
                ('Distance', models.DecimalField(max_digits=5, decimal_places=2)),
                ('Cost', models.DecimalField(max_digits=6, decimal_places=2)),
            ],
        ),
        migrations.CreateModel(
            name='Transaction',
            fields=[
                ('Transaction_ID', models.PositiveIntegerField(serialize=False, primary_key=True)),
                ('Host_ID', models.PositiveIntegerField()),
                ('Guest_ID', models.PositiveIntegerField()),
                ('Booking_ID', models.PositiveIntegerField()),
                ('Distance', models.DecimalField(max_digits=6, decimal_places=2)),
                ('Cost', models.DecimalField(max_digits=6, decimal_places=2)),
                ('Feedback_Host', models.CharField(max_length=30)),
                ('Feedback_Guest', models.CharField(max_length=30)),
            ],
        ),
        migrations.CreateModel(
            name='User',
            fields=[
                ('User_ID', models.PositiveIntegerField(serialize=False, primary_key=True)),
                ('first_name', models.CharField(max_length=30)),
                ('last_name', models.CharField(max_length=30)),
                ('email', models.EmailField(max_length=30)),
                ('Company', models.CharField(max_length=20)),
                ('Password', models.CharField(max_length=15)),
                ('Age', models.PositiveIntegerField()),
                ('Car', models.CharField(max_length=15)),
                ('Car_Model', models.CharField(max_length=15)),
                ('Freq_From_1', models.CharField(max_length=30)),
                ('Freq_From_2', models.CharField(max_length=30)),
                ('Freq_To_1', models.CharField(max_length=30)),
                ('Freq_TO_2', models.CharField(max_length=30)),
                ('Rating', models.PositiveIntegerField()),
            ],
        ),
        migrations.CreateModel(
            name='Wallet',
            fields=[
                ('User_ID', models.PositiveIntegerField(serialize=False, primary_key=True)),
                ('Transaction_ID', models.PositiveIntegerField()),
                ('Current_Balance', models.DecimalField(max_digits=6, decimal_places=2)),
                ('Spent', models.DecimalField(max_digits=6, decimal_places=2)),
                ('Received', models.DecimalField(max_digits=6, decimal_places=2)),
            ],
        ),
    ]
