from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^listing/$', views.listing, name='listing'),
    url(r'^host/(?P<USERID>[1-9]*)/$',views.host, name='host'),
    url(r'^$', views.index, name='index'),
    url(r'^users/$', views.users, name='users'),
    url(r'^success/$', views.success, name='success'),

]