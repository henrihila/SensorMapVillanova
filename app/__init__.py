#!flask/bin/python
from flask import Flask
from flask_pymongo import PyMongo
from flask_admin import Admin

app = Flask(__name__)
app.secret_key = 'mysecret'
# admin = Admin(app, name='GeoSyncRTC', base_template='my_master.html', template_mode='bootstrap3')




app.config['MONGO_DBNAME'] = 'NSF'
mongo = PyMongo(app)

from app import views

# MongoDB settings