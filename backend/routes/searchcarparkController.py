import requests
from flask import Blueprint, jsonify, request, make_response


from services.sort_methods import sort_by_dist, sort_by_lots, sort_by_price
from utils.performance import measure_time
from services import database as db
from routes import settingsController as settings

import os
from dotenv import load_dotenv

load_dotenv()
BACKEND_URL=os.getenv("BACKEND_URL")

searchcarpark_bp = Blueprint('findcarpark', __name__)

@searchcarpark_bp.route("/carpark", methods=["GET"])
def get_carparks():
    carpark_data = db.retrieve_carparks()
    if carpark_data:
        return jsonify(carpark_data), 200
    else:
        return make_response(jsonify({"error": "No carpark data found or an error occurred"}), 404)


@searchcarpark_bp.route('/find')
@measure_time
def carparkfinder():
    carpark_data=db.retrieve_carparks()

    lat = request.args.get('lat', type=float)
    lon = request.args.get('lon', type=float)
    destination = (lat, lon)

    res = sort_by_dist(destination, carpark_data)

    if settings.show_ev == "false":
        for carpark in res:
            carpark["EV"] = 0

    if settings.sort_type == "price":
            sort_by_price(res)
    elif settings.sort_type == "lots":
            sort_by_lots(res)

    if settings.veh_type == "motorcycle":
         for carpark in res:
            carpark["lot_type"]="M"
            carpark["price"]= "$0.65/hr" if carpark["agency"] == "HDB" else carpark["price"]

    return jsonify({
            "status": "success",
            "data": res
    })
