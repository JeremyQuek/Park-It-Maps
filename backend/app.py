import os
import requests
from dotenv.main import load_dotenv

from flask import Flask, jsonify
from flask_cors import CORS
from flask_apscheduler import APScheduler

from services.scheduler import cache_lots_and_update_db
from routes.bookmarksController import bookmarks_bp
from routes.searchcarparkController import searchcarpark_bp
from routes.settingsController import sort_option_bp


load_dotenv()
BACKEND_URL = os.getenv("BACKEND_URL")
INTERVAL = os.getenv("INTERVAL")
DATABASE_UPDATE_INTERVAL = os.getenv("DATABASE_UPDATE_INTERVAL")
app = Flask(__name__)
CORS(app)

app.register_blueprint(bookmarks_bp)
app.register_blueprint(searchcarpark_bp)
app.register_blueprint(sort_option_bp)

@app.route("/ping", methods=["GET"])
def ping_endpoint():
    return jsonify({"message": "pong"}), 200

scheduler = APScheduler()
@scheduler.task("interval", id = "my_job", seconds=int(DATABASE_UPDATE_INTERVAL))
def cache_job():
    cache_lots_and_update_db()

@scheduler.task("interval", id="my_ping_job", seconds=int(INTERVAL))
def ping_job():
    requests.get(BACKEND_URL + '/ping')

scheduler.init_app(app)
scheduler.start()

if __name__ == '__main__':
    app.run()
