from django.db import models

# Create your models here.

class User(models.Model):

    User_ID = models.AutoField()
    User_ID.primary_key=True
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    email = models.EmailField(max_length=30)
    Company = models.CharField(max_length=20)
    Password = models.CharField(max_length=15)
    Age = models.PositiveIntegerField()
    Sex = (('M','Male'),('F','Female'))
    Car = models.CharField(max_length=15)
    Car_Model = models.CharField(max_length=15)
    Freq_From_1 = models.CharField(max_length=30)
    Freq_From_2 = models.CharField(max_length=30)
    Freq_To_1 = models.CharField(max_length=30)
    Freq_TO_2 = models.CharField(max_length=30)
    #Current_Balance = models.ForeignKey('Wallet.Current_Balance')
    Rating = models.PositiveIntegerField()

    def __unicode__(self):
       return unicode(self.User_ID)

class Booking(models.Model):
    Booking_ID = models.AutoField()
    Booking_ID.primary_key=True
    Host_ID = models.ForeignKey(User,to_field='User_ID',related_name='Booking_Host_FK')
    #Host_ID = models.ForeignKey('User',related_name='Host_FK')
    #Guest_ID = models.ForeignKey(User,related_name='Guest_FK')
    Guest_ID = models.ForeignKey(User,to_field='User_ID',related_name='Booking_Guest_FK')
    Time = models.DateTimeField()
    From = models.CharField(max_length=30)
    To = models.CharField(max_length=30)
    Via = models.CharField(max_length=30)
    Distance = models.DecimalField(max_digits=6,decimal_places=2)
    Cost = models.DecimalField(max_digits=6,decimal_places=2)
    Status = (('Booked','Booked'),('Denied','Denied'),('Requested','Requested'))

    def __unicode__(self):
       return unicode(self.Booking_ID)

class Listing(models.Model):
    Listing_ID = models.AutoField()
    Listing_ID.primary_key=True
    From = models.CharField(max_length=30)
    To = models.CharField(max_length=30)
    Via = models.CharField(max_length=30)
    Host_ID = models.ForeignKey(User,to_field='User_ID',related_name='Listing_Host_FK')
    #Host_ID = models.PositiveIntegerField()
    Start_Time = models.DateTimeField()
    #Car = models.ForeignKey(User,to_field='Car',related_name='Listing_Car_FK')
    #Car = models.CharField(max_length=15)
    #Car_Model = models.ForeignKey(User,to_field='Car_Model',related_name='Listing_CarModel_FK')
    Distance = models.DecimalField(max_digits=5,decimal_places=2)
    Cost = models.DecimalField(max_digits=6,decimal_places=2)
    
    def __unicode__(self):
       return unicode(self.Listing_ID)

class Transaction(models.Model):
    Transaction_ID = models.AutoField()
    Transaction_ID.primary_key=True
    Host_ID = models.ForeignKey(User,to_field='User_ID',related_name='Trans_Host_FK')
    #Host_ID = models.PositiveIntegerField()
    #Guest_ID = models.PositiveIntegerField()
    Guest_ID = models.ForeignKey(User,to_field='User_ID',related_name='Trans_Guest_FK')
    #Booking_ID = models.PositiveIntegerField()
    #Booking_ID = models.ForeignKey(Booking,to_field='Booking_ID',related_name='Trans_Booking_FK')
    Distance = models.DecimalField(max_digits=6,decimal_places=2)
    Cost = models.DecimalField(max_digits=6,decimal_places=2)
    Feedback_Host = models.CharField(max_length=30)
    Feedback_Guest = models.CharField(max_length=30)
    
    def __unicode__(self):
       return unicode(self.Transaction_ID)

class Wallet(models.Model):
    User_ID = models.ForeignKey(User,to_field='User_ID',related_name='Wallet_ID_FK')
    #User_ID = models.PositiveIntegerField()
    User_ID.primary_key = True
    #Transaction_ID = models.PositiveIntegerField()
    Transaction_ID = models.ForeignKey(Transaction,to_field='Transaction_ID',related_name='Wallet_Trans_FK')
    Booking_ID = models.ForeignKey(Booking,to_field='Booking_ID',related_name='Wallet_Booking_FK')
    Current_Balance = models.DecimalField(max_digits=6,decimal_places=2)
    Spent = models.DecimalField(max_digits=6,decimal_places=2)
    Received = models.DecimalField(max_digits=6,decimal_places=2)
    
    def __unicode__(self):
       return unicode(self.User_ID)











