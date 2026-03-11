import requests
import urllib3
urllib3.disable_warnings()

import os
from dotenv import load_dotenv

load_dotenv()
HDB_URL=os.getenv("HDB_LOTS_URL")
LTA_URL=os.getenv("LTA_LOTS_URL")
ACCESS_KEY=os.getenv("LTA_ACCESS_KEY")

def retrieve_HDB_lots():
        try:
            response = requests.get("https://api.data.gov.sg/v1/transport/carpark-availability")
            response.raise_for_status()
            return [
                {
                    "carpark_id":data["carpark_number"],
                    "lot_type": "C",
                    "lots_available": data["carpark_info"][0]["lots_available"],
                    "total_lots" : data["carpark_info"][0]["total_lots"],
                }
            for data in response.json()["items"][0]['carpark_data']]

        except requests.exceptions.RequestException as e:
            return "error"

def retrieve_LTA_lots():
            headers = {
                'AccountKey': "pTDfKV74SOWJSo3vyY+BiA==",
                'Accept': 'application/json'
            }
            try:
                response = requests.get(
                    "https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2",
                    headers=headers
                )
                return [{
                    "carpark_id":data["CarParkID"],
                    "lot_type": "C",
                    "lots_available": data["AvailableLots"],
                    "total_lots" : ""
                } for data in response.json()["value"] if data['Agency']!="HDB"]

            except requests.exceptions.RequestException as e:
                return "error"


if __name__=="__main__":
    print(len(retrieve_HDB_lots()))
    print(len(retrieve_LTA_lots()))