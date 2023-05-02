"""
test for a -MySQL- database connection on your hosted website
both the database and this script must be on the same server
requires PyMySQL, Flask-SQLAlchemy, Flask
"""

import pymysql
import json
from geojson import Point, Feature, FeatureCollection, dump
from flask import Flask, render_template, url_for, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql import text
from sqlalchemy import or_, and_

# this variable, db, will be used for all SQLAlchemy commands
db = SQLAlchemy()
# create the app
app = Flask(__name__)

# make sure the database username, database password and
# database name are correct
username = 'zjcarnel_master'
password = 'gUP43e7yJium'
userpass = 'mysql+pymysql://' + username + ':' + password + '@'
# keep this as is for a hosted website
server  = 'zjcarnell.reclaim.hosting'
# CHANGE to YOUR database name, with a slash added as shown
dbname   = '/zjcarnel_gnv_service_requests'
# there is no socket


# CHANGE NOTHING BELOW
# put them all together as a string that shows SQLAlchemy where the database is
app.config['SQLALCHEMY_DATABASE_URI'] = userpass + server + dbname

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True

# initialize the app with Flask-SQLAlchemy
db.init_app(app)

class Service_Request(db.Model):
    __tablename__ = 'mytable'
    id = db.Column(db.Integer, primary_key=True)
    status = db.Column(db.String)
    request_type = db.Column(db.String)
    description = db.Column(db.String)
    request_date = db.Column(db.String)
    request_year = db.Column(db.String)
    request_month = db.Column(db.String)
    last_updated = db.Column(db.String)
    acknowledged = db.Column(db.String)
    closed = db.Column(db.String)
    minutes_to_close = db.Column(db.Integer)
    days_to_close = db.Column(db.Integer)
    assigned_to = db.Column(db.String)
    reporter_display = db.Column(db.String)
    address = db.Column(db.String)
    lat = db.Column(db.String)
    lng = db.Column(db.String)

# Home Page (index.html)
@app.route('/')
def home():
    try:

        return render_template('index.html', the_title="myGNV Service Requests Map")

    except Exception as e:
        # e holds description of the error
        error_text = "<p>The error:<br>" + str(e) + "</p>"
        hed = '<h1>Something is broken.</h1>'
        return hed + error_text

# Processes the HTML form for filtering the map
@app.route('/filter', methods=['POST'])
def filter():
    try:
        filter_year = request.form.getlist('year')
        filter_month = request.form.getlist('month')
        filter_type = request.form.getlist('type')
        filter_keywords = request.form.getlist('keyword')
        filter_and_or = request.form['keyword_and_or_input']

        query = db.select(Service_Request).order_by(Service_Request.request_date)

        if filter_year:
            query = query.where(Service_Request.request_year.in_(filter_year))

        if filter_month:
            query = query.where(Service_Request.request_month.in_(filter_month))

        if filter_type:
            query = query.where(Service_Request.request_type.in_(filter_type))

        if filter_keywords:
            keyword_filters = [
                Service_Request.description.like(f'%{keyword}%') for keyword in filter_keywords
            ]
            if filter_and_or == 'and':
                query = query.where(and_(*keyword_filters))
            else:
                query = query.where(or_(*keyword_filters))

        complaints = db.session.execute(query).scalars()

        filter_route = True

        markers = []

        for c in complaints:

            cleaned_marker_desc = "  ".join(str(c.description).split())

            lng = 0
            lat = 0

            try:
                lng = float(c.lng)
                lat = float(c.lat)
            except:
                continue

            point = Point((lng, lat))
            props = {"id":c.id, "status":c.status, "request_type":c.request_type, "description":cleaned_marker_desc, "request_date":c.request_date, "last_updated":c.last_updated, "acknowledged":c.acknowledged, "closed":c.closed, "minutes_to_close":c.minutes_to_close, "days_to_close":c.days_to_close, "assigned_to":c.assigned_to, "reporter_display":c.reporter_display, "address":c.address}

            markers.append(Feature(geometry=point, properties=props))

        feature_collection = FeatureCollection(markers)

        with open("gnv_service_requests_map/static/data/markers.geojson", 'w') as f:
            dump(feature_collection, f)

        return render_template('filter.html', filter_route=filter_route, selected_words=filter_keywords, selected_years=filter_year, selected_months=filter_month, selected_types=filter_type, the_title="myGNV Service Requests Map")

    except Exception as e:
        # e holds description of the error
        error_text = "<p>The error:<br>" + str(e) + "</p>"
        hed = '<h1>Something is broken.</h1>'
        return hed + error_text

if __name__ == '__main__':
    app.run(debug=True)
