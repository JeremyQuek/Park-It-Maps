from dotenv import load_dotenv
import os
from groq import Groq
import json
from ast import literal_eval
from math import radians, sin, cos, sqrt, atan2

load_dotenv()
KEY=os.getenv("GROQ_KEY")
client = Groq(api_key=KEY)

def sort_by_dist(target, carpark_data, k=10):
    res=set()
    for id in carpark_data.keys():
        dist=calculate_distance(target, (float(carpark_data[id]['lat']), float(carpark_data[id]["long"])))
        res.add((dist, id))
        if len(res)>k:
            res.remove(max(res, key=lambda x: x[0]))


    result = []
    for dist, id in res:
        carpark_entry = carpark_data[id].copy()
        carpark_entry['dist'] = dist
        result.append(carpark_entry)


    result.sort(key=lambda x: x['dist'])
    return result

def calculate_distance(origin, destination):
    EARTH_RADIUS = 6371000

    lat1, lon1 = origin
    lat2, lon2 = destination

    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))

    distance = EARTH_RADIUS * c
    return distance

def sort_by_lots(carpark_data):
    with_lots,without_lots=[],[]
    for carpark in carpark_data:
        if not carpark['lot_type']:
            without_lots.append(carpark)
        else:
            with_lots.append(carpark)
    with_lots.sort(key=lambda x: int(x["lots_available"]), reverse= True)
    print(with_lots)
    with_lots.extend(without_lots)
    carpark_data.clear()
    carpark_data.extend(with_lots)
    return

def sort_by_price(carpark_data):
    with_price=[]
    without_price=[]
    for carpark in carpark_data:
        if carpark["price"]=="" or carpark["price"]=="-" :
            without_price.append(carpark)
        else:
            with_price.append(carpark)
    sorted_with_price = natural_language_processing(with_price)
    sorted_with_price.extend(without_price)
    carpark_data.clear()
    carpark_data.extend(sorted_with_price)
    return carpark_data

def natural_language_processing(carpark_with_prices_data):
    data=[]
    for carpark in carpark_with_prices_data:
        data.append({"id":carpark["carpark_id"], "price":carpark["price"]})

    sorted_llm_data = groq_inference(data)

    sorted_order = {item["id"]: index for index, item in enumerate(sorted_llm_data)}

    sorted_carparks = sorted(
        carpark_with_prices_data,
        key=lambda x: sorted_order.get(x["carpark_id"], float('inf'))
    )

    return sorted_carparks

def groq_inference(carpark_data):
    messages = [
            {
                "role": "system",
                "content": """You are a precise data processing service. Follow these requirements EXACTLY:

                1. TASK: Sort the input array by 'price' in ascending order
                2. FORMAT REQUIREMENTS:
                - Maintain all original data fields
                - Preserve exact string formats (esp. double quotes)
                - Return ONLY the sorted array as valid JSON
                - NO explanatory text or markdown
                3. PRICE HANDLING:
                - Convert all prices to hourly rate before sorting
                - Example: "$1.20 per ½ hr" = $2.40/hr
                - Handle variations like: /hr, per hour, per ½ hour, /half-hour
                4. VALIDATION:
                - Ensure output is parseable JSON array
                - Verify all original fields are preserved
                - Confirm prices are correctly ordered

                OUTPUT FORMAT: [{"field": "value", ...}, ...]"""
            },
            {
                "role": "user",
                "content": str(carpark_data)
            }
        ]

    chat_completion = client.chat.completions.create(
        messages=messages,
        model="llama-3.2-90b-vision-preview",
        temperature=0
    )

    data = chat_completion.choices[0].message.content
    # start_idx = data.find('[')
    # end_idx = data.rfind(']')
    # if start_idx != -1 and end_idx != -1:
    #     data = data[start_idx:end_idx + 1]
    print(data)
    parsed_data = literal_eval(data)
    return parsed_data
