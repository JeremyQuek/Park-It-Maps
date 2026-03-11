from flask import Blueprint, jsonify, request
import requests
from services import database as db

bookmarks_bp = Blueprint('bookmarks', __name__)

@bookmarks_bp.route("/user", methods=["GET"])
def get_user():
    uid = request.args.get("uid")
    resp = None
    if uid == None:
        resp = db.create_user()
    return jsonify(resp), 200

@bookmarks_bp.route("/checkuser", methods = ["GET"])
def check_user():
    inp = request.args.get("uid")
    resp = db.check_user(inp)
    if resp:
        return jsonify(resp), 200
    else:
        return jsonify(resp), 404

@bookmarks_bp.route("/bookmarks", methods=["GET"])
def get_bookmarks():
    uid = request.args.get("uid")
    resp = db.retrieve_bookmarks(uid)
    return jsonify(resp), 200

@bookmarks_bp.route("/bookmarks/add", methods=["POST"])
def add_bookmarks():
    data = request.get_json()
    print(data)
    resp = db.insert_bookmark(data.get("uid"), data.get("name"),data.get("location"), data.get("coordinates"))
    if resp is None:
        # Successful insertion
        return jsonify({"message": "Bookmark created successfully"}), 201
    elif resp is False:
        # Duplicate entry detected
        return jsonify({"message": "Duplicate bookmark"}), 409
    else:
        # Unexpected error (optional)
        return jsonify({"message": "An unexpected error occurred"}), 500

@bookmarks_bp.route("/bookmarks/delete", methods=["POST"])
def remove_bookmarks():
    data = request.get_json()
    db.delete_bookmark(data.get("uid"), data.get("location"))
    return jsonify({"message": "Bookmark removed successfully"}), 200
