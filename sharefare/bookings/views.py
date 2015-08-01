from django.shortcuts import render
from django.http import HttpResponse
from django.template import RequestContext,loader
from .models import Booking,Listing,User,Transaction,Wallet
from .forms import AddListingForm

# Create your views here.

def index(request):
    return HttpResponse("Login Screen")

def success(request):
    return HttpResponse("Successfully Listed")

def listing(request):
    latest_listings = Listing.objects.all()
    context = {'latest_listings' : latest_listings,}
    if request.method == 'POST':
    	#Code logic for what happens when a Guest Requests a ride
    	return HttpResponse("Login Screen")
    return render(request, 'bookings/listing.html', context)

def users(request):
    user_list = User.objects.all()[:10]
    context = {'user_list' : user_list,}
    return render(request,'bookings/user.html', context)

def host(request,USERID):
    host_list = User.objects.filter(User_ID=USERID)
    context = {'host_list' : host_list,}
    if request.method == 'POST':
          form = AddListingForm()
          listing = form.save(commit=False)
          listing.Host_ID = User.objects.get(User_ID=USERID)
          #listing.Listing_ID = '5'
          listing.From = request.POST['From']
          listing.To = request.POST['To']
          listing.Cost = request.POST['Cost']
          listing.Start_Time = request.POST['FromTime']
          listing.Distance = request.POST['Seats']
          listing.save()
          #else :
          return render(request,'bookings/success.html',context)
    #else :
    #return HttpResponse("First Fail")
    return render(request,'bookings/host.html',context)




