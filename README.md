<div align="center">
    
# 🚙  Park It!  🚗



![Python](https://img.shields.io/badge/Python-555555?style=for-the-badge&logo=python&logoColor=white)
![3.12](https://img.shields.io/badge/3.12-FFC11A?style=for-the-badge)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white)
<img width="1112" height="428" alt="Screenshot 2026-03-10 at 11 20 54 PM" src="https://github.com/user-attachments/assets/7f4553f5-0a30-4558-9f07-ad25a29ee59e" />

</div>



An SG based  web application to help drivers find parking more easily! Applications like google maps do not tailor to local singapore parking live data or locations. If you're a new driver, chances are you'll be stressed out while driving. This app helps you to find parking spots easily and display information like lot type, EV charging spots, parking locations and prices.

## App Preview

<div align="center">

<div style="display: flex; justifyContent: center; gap: 20px;">

<img width="300" height="856" alt="Screenshot 2026-03-10 at 10 22 32 PM" src="https://github.com/user-attachments/assets/07e665f4-0f3a-44ac-afdd-e7e6d7f7d3d1" />
<img width="303" height="850" alt="Screenshot 2026-03-10 at 10 23 02 PM" src="https://github.com/user-attachments/assets/c6ac7e71-9087-4312-a6c2-85b6ed3f5dc6" />
</div>
</div>

<div align="center">
<img width="300" height="855" alt="Screenshot 2026-03-10 at 10 24 10 PM" src="https://github.com/user-attachments/assets/7f0cda63-d297-4fa6-89c4-126f2c436230" />

<img width="300" height="849" alt="Screenshot 2026-03-10 at 10 24 48 PM" src="https://github.com/user-attachments/assets/44f8d5f9-090b-40f4-ac51-32e0632eaf69" />
</div>


## Project 

The frontend runs on React. 
The backend data is scraped from the open source LTA and HDB parking data endpoints. <br>
Data is stored inside a Supabase Postgre Instance and updated via a Flask Scheduler job every 1 minute  <br>
Different frontend endpoints request the data from the backend handler, which perform CRUD on Postgre to retrieve and clean the lot information  <br>
Storage in a DB reduces search time and makes app responsive.   <br>


<br/>
<div align="center">
    
    Application Simple Architecture
    
<img width="600" height="700" alt="Park_it" src="https://github.com/user-attachments/assets/afe8aaaf-9757-4c94-9069-c02a1d06deb6" />
</div>

<br/>

**Improvements**<br/>
Ideally, parking data can be done entirely in memory using Redis,  since number of lots is bounded (O(1)) <br>
Hosting a Redis instance alongside the backend WSGI would greatly increase search speed <br>
The use of a DB was initially due to external project requirements  <br>

## Prerequisites

Before running the application, make sure you have the following installed:
- Node.js and npm (for frontend)
- Python 3.12 and pip (for backend)
- Required dependencies (see Installation section)

## Installation

### Run Project
1. From root dir
```bash
docker compose up
```

### Run Frontend
1. Navigate to the frontend directory:
```bash
source start.sh
```

### Run Backend
1. Navigate to the backend directory:
```bash
source start.sh
```



## Development

- Frontend development server includes hot-reloading
- Backend Flask server will automatically restart on code changes if run in debug mode

## Project Status
🚧 Under Development

## License
This project is licensed under the [MIT License](LICENSE).

