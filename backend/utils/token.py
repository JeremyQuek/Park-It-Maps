import requests
import os
from dotenv import load_dotenv

load_dotenv()

URA_ACCESS_KEY = os.getenv("URA_ACCESSS_KEY")
URL_KEY_URL = os.getenv("URA_KEY_URL")
def get_token():
    url = URL_KEY_URL
    payload = {}
    headers = {
        'AccessKey': URA_ACCESS_KEY,
        'Cookie': '__nxquid=SZcRzGjcscZURbYH/M7bNrvVllWh+A==0014',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.ura.gov.sg/',
        'Origin': 'https://www.ura.gov.sg'
    }
    session = requests.Session()
    try:
        response = session.get(url, headers=headers, data=payload)

        if response.headers.get('Content-Type', '').startswith('application/json'):
            try:
                data = response.json()
                if data.get('Status') == 'Success':
                    return data.get('Result')
                else:
                    raise Exception(f"Failed to get token: {data}")
            except requests.exceptions.JSONDecodeError:
                print("Failed to parse JSON response")
                return None
        else:
            print(f"Unexpected content type: {response.headers.get('Content-Type')}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        return None
