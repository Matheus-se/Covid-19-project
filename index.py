import sys
import json
import requests
import pandas as pd

# get request
url = 'https://api.covid19api.com/summary'
response = requests.get(url)

# convert to dict
data_dict = json.loads(response.content)

# data cleaning
frame = pd.DataFrame(data_dict['Global'], index=[0])
frame.drop([columns for columns in frame.columns if columns not in ['TotalConfirmed', 'TotalDeaths', 'TotalRecovered']], inplace=True, axis=1)

#convert to json
data = frame.iloc[0, :]
json_data = data.to_json()

print(json_data)
sys.stdout.flush()