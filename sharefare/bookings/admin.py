from django.contrib import admin
from .models import User
from .models import Booking
from .models import Listing
from .models import Transaction
from .models import Wallet

# Register your models here.
admin.site.register(User)
admin.site.register(Booking)
admin.site.register(Listing)
admin.site.register(Transaction)
admin.site.register(Wallet)