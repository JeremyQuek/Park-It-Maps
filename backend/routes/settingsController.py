from flask import Flask, Blueprint, jsonify, request

sort_option_bp = Blueprint("sort_option", __name__)

veh_type = "car"
sort_type = "location"
max_radius = 500
max_results = 10
show_ev =False

@sort_option_bp.route("/sort")
def sort():
    global sort_type, max_radius, max_results, veh_type, show_ev

    new_sort_type = request.args.get("sort_type", default=sort_type)
    if new_sort_type != sort_type:
        print("Setting sort type to: ", new_sort_type)
        sort_type = new_sort_type

    new_radius = request.args.get("sort_radius", default=max_radius)
    if new_radius != max_radius:
        print("Setting radius to: ", new_radius)
        max_radius = new_radius

    new_max_results = request.args.get("sort_max_results", default=max_results)
    if new_max_results != max_results:
        print("Setting max results to: ", new_max_results)
        max_results = new_max_results

    new_veh_type = request.args.get("veh_type", default=veh_type)
    if new_veh_type != veh_type:
        print("Setting vehicle type to: ", new_veh_type)
        veh_type = new_veh_type

    new_show_ev = request.args.get("show_ev", default=show_ev)
    if new_show_ev != show_ev:
        print("Setting ev-option type to: ", show_ev)
        show_ev = new_show_ev

    return jsonify({
        "sort_type": sort_type,
        "max_radius": max_radius,
        "max_results": max_results,
        "veh_type": veh_type,
        "show_ev": show_ev
    })
