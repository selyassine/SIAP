import requests
import urllib3
import json
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

base_url = 'https://localhost:8000'

auth_res = requests.post(f'{base_url}/api/v1/auth/login', data={'username': 'actuaire@siap.com', 'password': 'password123'}, verify=False)
token = auth_res.json().get('access_token')
headers = {'Authorization': f'Bearer {token}'}

print('Simulation de =SIAP.PRIME(35, 50, \"R24\", \"B2\", 6, 12, \"A\", \"Regular\", 80)')
payload_prime = {
    'driv_age': 35, 'bonus_malus': 50, 'region': 'R24', 'veh_brand': 'B2',
    'veh_power': 6, 'veh_age': 12, 'area': 'A', 'veh_gas': 'Regular',
    'density': 80, 'exposure': 1.0
}
prime_res = requests.post(f'{base_url}/api/v1/pricing/predict', json=payload_prime, headers=headers, verify=False)
print(f'Statut PRIME: {prime_res.status_code}')
print(f'Resultat: {json.dumps(prime_res.json(), indent=2)}')

print('\n------------------------\n')

print('Simulation de =SIAP.FRAUDE(\"Multi-vehicle Collision\", \"Major Damage\", 2, \"YES\", 15000, 42, 2018)')
payload_fraud = {
    'incident_type': 'Multi-vehicle Collision', 'incident_severity': 'Major Damage',
    'witnesses': 2, 'police_report_available': 'YES', 'total_claim_amount': 15000,
    'injury_claim': 3000, 'property_claim': 1500, 'vehicle_claim': 10500,
    'insured_age': 42, 'insured_sex': 'MALE', 'insured_education_level': 'College',
    'insured_occupation': 'craft-repair', 'insured_hobbies': 'sleeping',
    'insured_relationship': 'husband', 'capital_gains': 0, 'capital_loss': 0,
    'policy_deductible': 500, 'umbrella_limit': 0, 'policy_annual_premium': 1200,
    'months_as_customer': 24, 'number_of_vehicles_involved': 2,
    'bodily_injuries': 1, 'property_damage': 'NO', 'auto_make': 'Toyota',
    'auto_model': 'Corolla', 'auto_year': 2018, 'collision_type': 'Front Collision',
    'incident_date': '2026-06-22', 'incident_city': 'Paris', 'incident_state': 'IDF',
    'incident_hour_of_the_day': 14
}
fraud_res = requests.post(f'{base_url}/api/v1/fraud/detect', json=payload_fraud, headers=headers, verify=False)
print(f'Statut FRAUDE: {fraud_res.status_code}')
print(f'Resultat: {json.dumps(fraud_res.json(), indent=2)}')
