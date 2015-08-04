from django.forms import ModelForm
from .models import Booking,Listing,User,Transaction,Wallet

class AddListingForm(ModelForm):
    class Meta:
        model = Listing
        fields = ['Listing_ID', 'From', 'To','Start_Time','Host_ID','Cost','Distance']

#class RideRequestForm(ModelForm):
#    class Meta:
#        model = Listing
#        fields = ['Listing_ID', 'From', 'To','Start_Time','Host_ID','Cost','Distance']

#class TransactionForm(ModelForm):
#    class Meta:
#        model = Transaction
#        fields = ['Listing_ID', 'From', 'To','Start_Time','Host_ID','Cost','Distance']