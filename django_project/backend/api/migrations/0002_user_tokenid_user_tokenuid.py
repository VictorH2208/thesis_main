# Generated by Django 4.1 on 2023-01-29 20:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="tokenId",
            field=models.CharField(blank=True, max_length=64),
        ),
        migrations.AddField(
            model_name="user",
            name="tokenUID",
            field=models.CharField(blank=True, max_length=64),
        ),
    ]
